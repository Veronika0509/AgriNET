import React, {useEffect, useState, useRef, useMemo} from "react";
import {getCommentsTypes} from "./data/getCommentsTypes";
import {getCommentsData} from "./data/getCommentsData";
import {
  IonContent, IonDatetime, IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonInput, IonItem, IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner, IonTitle, IonToolbar, IonTextarea, IonButtons, IonButton, IonFooter, useIonAlert
} from "@ionic/react";
import s from '../../style.module.css'
import {closeOutline, pencilOutline, refreshOutline, trashOutline} from "ionicons/icons";
import {deleteComment} from "./data/deleteComment";
import {saveComment} from "./data/saveComment";

export const Comments = (props: any) => {
  const [types, setTypes] = useState<any>()
  const [rawData, setRawData] = useState<any[]>([])
  const [currentType, setCurrentType] = useState(0)
  const [currentSort, setCurrentSort] = useState('dateDesc')
  const [currentSensorId, setCurrentSensorId] = useState('')
  const [isMoreLoading, setIsMoreLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLTableRowElement | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Modal
  const [modalId, setModalId] = useState()
  const [modalChart, setModalChart] = useState()
  const [modalField, setModalField] = useState()
  const [modalType, setModalType] = useState()
  const [modalSensorId, setModalSensorId] = useState()
  const [modalDate, setModalDate] = useState<any>()
  const [modalText, setModalText] = useState<any>('')
  const [formValues, setFormValues] = useState({
    chart: '',
    type: 0,
    sensorId: '',
    date: '',
    text: ''
  })
  const [initialValues, setInitialValues] = useState({
    chart: '',
    type: 0,
    sensorId: '',
    date: '',
    text: ''
  })

  const [presentAlert] = useIonAlert();
  const sortOptions = [
    {name: "dateDesc", label: "By Date, newest first"},
    {name: "dateAsc", label: "By Date, oldest first"},
    {name: "type", label: "By Type"},
    {name: "field", label: "By Field"},
    {name: "chartKind", label: "By Chart"},
  ]
  const chartKinds: any = [
    {code: "M", name: "Soil Moisture"},
    {code: "MSum", name: "Sum of Soil Moisture"},
    {code: "SMT", name: "Soil Temperature"},
    {code: "T", name: "Temperature RH"},
    {code: "BandDiff", name: "Band Difference"},
    {code: "BFlow", name: "BFlow"},
    {code: "disease", name: "Disease"},
    {code: "InfraRed", name: "Infra Red"},
    {code: "S", name: "Other"},
    {code: "SRS", name: "SRS"},
    {code: "WL", name: "Weather Station"}
  ];

  // Memoized filtered data for current year
  const data = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return rawData.filter((comment: any) => {
      if (!comment.date) return false;
      const commentYear = parseInt(comment.date.split('-')[0]);
      return commentYear === currentYear;
    });
  }, [rawData]);

  const loadMoreData = async () => {
    if (isMoreLoading || !hasMore) return;

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setIsMoreLoading(true);
    try {
      const newData = await getCommentsData({
        sort: currentSort,
        startIndex: rawData.length,
        type: currentType,
        userId: props.userId,
        sensorId: currentSensorId,
      });

      if (newData.data.length === 0) {
        setHasMore(false);
        setIsMoreLoading(false);
      } else {
        setRawData(prev => [...prev, ...newData.data]);
        // Delay hiding the spinner to prevent rapid toggling
        loadingTimeoutRef.current = setTimeout(() => {
          setIsMoreLoading(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
      setIsMoreLoading(false);
    }
  };
  const updateData = async (type?: string, value?: any) => {
    setIsLoading(true);

    const params = {
      type: currentType,
      sort: currentSort,
      sensorId: currentSensorId,
      startIndex: 0,
      userId: props.userId,
    };

    if (type === 'types') params.type = value;
    if (type === 'sensorId') params.sensorId = value;
    if (type === 'sort') params.sort = value;
    if (type === 'initial') {
      Object.assign(params, { sort: 'dateDesc', type: 0, sensorId: '' });
    }

    try {
      const newData = await getCommentsData(params);
      setRawData(newData.data);
      setHasMore(newData.data.length > 0);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      // Use requestAnimationFrame for smoother rendering
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isMoreLoading) {
          loadMoreData();
        }
      },
      { threshold: 0.5 }
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [data.length, currentSort, currentType, currentSensorId, hasMore, isMoreLoading]);
  useEffect(() => {
    const currentElement = lastElementRef.current;
    if (currentElement && observer.current) {
      observer.current.observe(currentElement);
    }
    return () => {
      if (currentElement && observer.current) {
        observer.current.unobserve(currentElement);
      }
    };
  }, [data]);
  useEffect(() => {
    const setInitialData = async () => {
      const currentTypes = await getCommentsTypes();
      setTypes(currentTypes.data);
      await updateData('initial')
    };
    setInitialData();

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const onTypeChange = async (value: any) => {
    if (value !== currentType) {
      setCurrentType(value);
      await updateData('types', value)
    }
  }
  const onSensorIdChange = async (value: any) => {
    if (value !== currentSensorId) {
      setCurrentSensorId(value);
      await updateData('sensorId', value)
    }
  }
  const onSortChangeChange = async (value: any) => {
    setCurrentSort(value);
    await updateData('sort', value)
  }
  const onEditCLick = (currentItem: any) => {
    const values = {
      chart: currentItem.chartKind,
      type: currentItem.type,
      sensorId: currentItem.sensorId,
      date: new Date(currentItem.date).toISOString(),
      text: currentItem.text
    }

    setIsEditModalOpen(true)
    setModalField(currentItem.field)
    setModalId(currentItem.id)
    setModalChart(values.chart)
    setModalType(values.type)
    setModalSensorId(values.sensorId)
    setModalDate(values.date)
    setModalText(values.text)
    setFormValues(values)
    setInitialValues(values)
  }
  const hasChanges = () => {
    return formValues.chart !== initialValues.chart ||
      formValues.type !== initialValues.type ||
      formValues.sensorId !== initialValues.sensorId ||
      formValues.date.replace('.000Z', '') !== initialValues.date.replace('.000Z', '') ||
      formValues.text !== initialValues.text
  }
  const updateFormValue = (field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }))
  }
  const onCommentDelete = () => {
    presentAlert({
      header: 'Delete confirmation',
      message: 'Are you sure want to delete this comment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => {
            const deleteCommentFunction = async () => {
              setIsEditModalOpen(false)
              const result: any = await deleteComment(modalId)
              if (result.status === 200) {
                await updateData()
              }
            }
            deleteCommentFunction()
          }
        },
      ]
    })
  }
  const onCommentSave = async () => {
    if (!modalText.trim()) {
      presentAlert({
        header: 'Validation Error',
        message: 'Text should not be empty',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
          }
        ]
      })
    } else {
      setIsEditModalOpen(false)

      const inputDate = new Date(modalDate.replace('.000Z', '') + '.000Z').toLocaleString()
      const [datePart, timePart] = inputDate.split(", ");
      const [day, month, year] = datePart.split(".");
      const [hours, minutes] = timePart.split(":");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

      const body: any = {
        id: modalId,
        chartKind: modalChart,
        sensorId: modalSensorId,
        field: modalField,
        date: formattedDate,
        type: modalType,
        text: modalText,
        opts: {
          cssClass: "edit-comment",
          showBackdrop: true,
          enableBackdropDismiss: true
        }
      }
      const saveResult = await saveComment(body)
      if (saveResult.status === 200) {
        await updateData()
      }
    }
  }
  const onCancelClick = () => {
    if (!hasChanges()) {
      setIsEditModalOpen(false)
    } else {
      presentAlert({
        header: 'Dismiss changes',
        message: 'Are you sure want to dismiss all changes?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Dismiss',
            role: 'confirm',
            handler: () => setIsEditModalOpen(false)
          }
        ]
      })
    }
  }
  return (
    <div>
      <div className={s.comments_settings}>
        <div className={s.comments_settingsTypes}
             style={{background: currentType !== 0 && types.find((item: any) => item.id === currentType).color}}>
          <IonSelect label="Type" value={currentType} onIonChange={(e: CustomEvent) => onTypeChange((e.detail as { value: number }).value)}
                     className={s.comments_types}>
            <IonSelectOption value={0}>Any</IonSelectOption>
            {types && types.map((type: any) => (
              <IonSelectOption key={type.id} value={type.id}>{type.name}</IonSelectOption>
            ))}
          </IonSelect>
          <button className={s.comments_settingsTypesButton} onClick={() => onTypeChange(0)}>
            <IonIcon slot='icon-only' icon={closeOutline} size={'small'}></IonIcon>
          </button>
        </div>
        <IonInput label="Sensor ID:" placeholder='Any' value={currentSensorId}
                  onIonBlur={(e: CustomEvent) => onSensorIdChange((e.target as HTMLIonInputElement).value)}></IonInput>
        <IonSelect label="Sort:" value={currentSort} onIonChange={(e: CustomEvent) => onSortChangeChange((e.detail as { value: string }).value)}
                   className={s.comments_types}>
          {sortOptions && sortOptions.map((sort: any) => (
            <IonSelectOption key={sort.name} value={sort.name}>{sort.label}</IonSelectOption>
          ))}
        </IonSelect>
      </div>
      <div className={s.comments_tableWrapper}>
        <table className={s.comments_table}>
          <thead>
          <tr>
            <th>Chart</th>
            <th>Sensor ID</th>
            <th>Field</th>
            <th>Date</th>
            <th>Type</th>
            <th>Text</th>
          </tr>
          </thead>
          <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>
                <IonSpinner name="crescent"/>
              </td>
            </tr>
          )}
          {!isLoading && data && data.length > 0 && data.map((item: any, index: number) => (
            <tr key={index} ref={index === data.length - 1 ? lastElementRef : null} className={s.comments_tableRow} onClick={() => onEditCLick(item)}>
              <td>{chartKinds.find((chartKindObj: any) => chartKindObj.code === item.chartKind)?.name}</td>
              <td>{item.sensorId}</td>
              <td>{item.field}</td>
              <td>{item.date}</td>
              <td style={{
                backgroundColor: types?.find((t: any) => t.id === item.type)?.color,
                whiteSpace: 'normal',
                wordBreak: 'break-word'
              }}>
                {types?.find((t: any) => t.id === item.type)?.name}
              </td>
              <td className={s.comments_tableComment}>
                <div className={s.comments_tableCommentValue}>
                  <span>{item.text}</span>
                  <IonIcon icon={pencilOutline} className={s.comments_tableEdit}></IonIcon>
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && (!data || data.length === 0) && (
            <tr>
              <td colSpan={6} style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                No comments found for the current year ({new Date().getFullYear()}).
              </td>
            </tr>
          )}
          {isMoreLoading && (
            <tr>
              <td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>
                <IonSpinner name="crescent" />
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
      <IonModal isOpen={isEditModalOpen} onWillDismiss={() => setIsEditModalOpen(false)}>
        <IonContent className={s.comments_modalContent}>
          <div className={s.comments_modalWrapper}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Edit Comment</IonTitle>
              </IonToolbar>
            </IonHeader>
            <div className={s.comments_modalBody}>
              <IonItem className={s.comments_modalItem}>
                <IonSelect label="Chart" value={modalChart} onIonChange={(e: CustomEvent) => {
                  const value = (e.detail as { value: string }).value;
                  setModalChart(value)
                  updateFormValue('chart', value)
                }}>
                  {chartKinds && chartKinds.map((chartKind: any) => (
                    <IonSelectOption key={chartKind.code} value={chartKind.code}>{chartKind.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem className={s.comments_modalItem}>
                <IonSelect label="Type" value={modalType} onIonChange={(e: any) => {
                  setModalType(e.detail.value)
                  updateFormValue('type', e.detail.value)
                }}>
                  {types && types.map((type: any) => (
                    <IonSelectOption key={type.id} value={type.id}>{type.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem className={`${s.comments_modalItem} ${s.comments_modalItemWrapper}`}>
                <IonInput
                  onIonChange={(e: any) => {
                    setModalSensorId(e.detail.value)
                    updateFormValue('sensorId', e.detail.value)
                  }}
                  className={s.comments_modalInput}
                  label="Sensor ID"
                  value={modalSensorId}
                ></IonInput>
              </IonItem>
              <IonItem className={s.comments_modalItem}>
                <IonLabel>Date</IonLabel>
                <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
                <IonModal keepContentsMounted={true} className={s.comments_modalDateModal}>
                  <IonDatetime
                    id="datetime"
                    value={modalDate}
                    onIonChange={(e: any) => {
                      setModalDate(e.detail.value)
                      updateFormValue('date', e.detail.value)
                    }}
                  ></IonDatetime>
                </IonModal>
              </IonItem>
              <IonItem className={s.comments_modalItem}>
                <IonTextarea
                  className={s.comments_modalItemTextarea}
                  label="Text"
                  value={modalText}
                  autoGrow={true}
                  onIonChange={(e: any) => {
                    setModalText(e.detail.value)
                    updateFormValue('text', e.detail.value)
                  }}
                ></IonTextarea>
              </IonItem>
            </div>
            <div className={s.comments_modalFooterWrapper}>
              <IonFooter className={s.comments_modalFooter}>
                <IonToolbar className={s.comments_modalFooterButtons}>
                  <IonButtons slot='start'>
                    <IonButton onClick={onCommentDelete}>
                      <IonIcon slot="start" icon={trashOutline}></IonIcon>
                      Delete
                    </IonButton>
                  </IonButtons>
                  <IonButtons slot='end'>
                    {hasChanges() && <IonButton color='primary' onClick={onCommentSave}>Save</IonButton>}
                    <IonButton onClick={onCancelClick}>Cancel</IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonFooter>
            </div>
          </div>
        </IonContent>
      </IonModal>
      <IonButton shape='round' className={s.comments_refreshButton} onClick={async () => await updateData()}>
        <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
      </IonButton>
    </div>
  )
}