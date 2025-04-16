import React, {useEffect, useState, useRef} from "react";
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
import {closeOutline, pencilOutline, trashOutline} from "ionicons/icons";
import {getDatetime} from "../../../Chart/components/DateTimePicker/functions/getDatetime";
import login from "../../../Login";
import {onRemoveTelOrEmailSubmit} from "../../../Chart/components/Alarm/functions/telOrEmail/onRemoveTelOrEmailSubmit";
import {deleteComment} from "./data/deleteComment";
import {resolveConfig} from "vite";

export const Comments = (props: any) => {
  const [types, setTypes] = useState<any>()
  const [data, setData] = useState<any[]>([])
  const [currentType, setCurrentType] = useState(0)
  const [currentSort, setCurrentSort] = useState('dateDesc')
  const [currentSensorId, setCurrentSensorId] = useState('')
  const [isMoreLoading, setIsMoreLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLTableRowElement | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Modal
  const [modalCurrentItem, setModalCurrentItem] = useState<any>()
  const [modalId, setModalId] = useState()
  const [modalChart, setModalChart] = useState()
  const [modalType, setModalType] = useState()
  const [modalSensorId, setModalSensorId] = useState()
  const [modalDate, setModalDate] = useState<any>()
  const [modalText, setModalText] = useState<any>('')
  const [areChanges, setAreChanges] = useState(false)

  const [presentAlert] = useIonAlert();

  const loadMoreData = async () => {
    if (isMoreLoading || !hasMore) return;
    
    setIsMoreLoading(true);
    try {
      const newData = await getCommentsData({
        sort: currentSort,
        startIndex: data.length,
        type: currentType,
        userId: props.userId,
        sensorId: currentSensorId,
      });
      
      if (newData.data.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => [...prev, ...newData.data]);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsMoreLoading(false);
    }
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
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
  }, [data.length, currentSort, currentType, currentSensorId]);

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
      setIsLoading(true);
      try {
        const currentTypes = await getCommentsTypes();
        setTypes(currentTypes.data);

        const initialData = await getCommentsData({
          sort: 'dateDesc',
          startIndex: 0,
          type: 0,
          userId: props.userId,
          sensorId: '',
        });
        setData(initialData.data);
        setHasMore(initialData.data.length > 0);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    setInitialData();
  }, []);

  const onTypeChange = async (value: any) => {
    if (value !== currentType) {
      setCurrentType(value);
      setIsLoading(true);
      try {
        const newData = await getCommentsData({
          type: value,
          sort: currentSort,
          sensorId: currentSensorId,
          startIndex: 0,
          userId: props.userId
        });
        setData(newData.data);
        setHasMore(true);
      } catch (error) {
        console.error('Error changing type:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }
  const onSensorIdChange = async (value: any) => {
    if (value !== currentSensorId) {
      setCurrentSensorId(value);
      setIsLoading(true);
      try {
        const newData = await getCommentsData({
          type: currentType,
          sort: currentSort,
          sensorId: value,
          startIndex: 0,
          userId: props.userId
        });
        setData(newData.data);
        setHasMore(true);
      } catch (error) {
        console.error('Error changing sensor ID:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }
  const onSortChangeChange = async (value: any) => {
    setCurrentSort(value);
    setIsLoading(true);
    try {
      const newData = await getCommentsData({
        type: currentType,
        sort: value,
        sensorId: currentSensorId,
        startIndex: 0,
        userId: props.userId
      });
      setData(newData.data);
      setHasMore(true);
    } catch (error) {
      console.error('Error changing sort:', error);
    } finally {
      setIsLoading(false);
    }
  }

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

  const onEditCLick = (currentItem: any) => {
    setIsEditModalOpen(true)
    setModalCurrentItem(currentItem)
    setModalId(currentItem.id)
    setModalChart(currentItem.chartKind)
    setModalType(currentItem.type)
    setModalSensorId(currentItem.sensorId)
    setModalDate(new Date(currentItem.date).toISOString())
    setModalText(currentItem.text)
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
              setIsLoading(true)
              setIsEditModalOpen(false)
              const result: any = await deleteComment(modalId)
              if (result.status === 200) {
                const newData = await getCommentsData({
                  sort: currentSort,
                  startIndex: 0,
                  type: currentType,
                  userId: props.userId,
                  sensorId: currentSensorId,
                });
                setData(newData.data);
                setIsLoading(false)
              }
            }
            deleteCommentFunction()
          }
        },
      ]
    })
  }

  const onCommentSave = () => {
    if (!modalText.trim()) {

    } else {
      console.log('ok')
    }
  }

  return (
    <div>
      <div className={s.comments_settings}>
        <div className={s.comments_settingsTypes}
             style={{background: currentType !== 0 && types.find((item: any) => item.id === currentType).color}}>
          <IonSelect label="Type" value={currentType} onIonChange={(e: any) => onTypeChange(e.detail.value)}
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
                  onIonBlur={(e: any) => onSensorIdChange(e.target.value)}></IonInput>
        <IonSelect label="Sort:" value={currentSort} onIonChange={(e: any) => onSortChangeChange(e.detail.value)}
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
                <IonSelect label="Chart" value={modalChart} onIonChange={(e: any) => {
                  if (e.detail.value !== modalCurrentItem.chartKind) {
                    setAreChanges(true)
                  } else {
                    setAreChanges(false)
                  }
                  setModalChart(e.detail.value)
                }}>
                  {chartKinds && chartKinds.map((chartKind: any) => (
                    <IonSelectOption key={chartKind.code} value={chartKind.code}>{chartKind.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem className={s.comments_modalItem}>
                <IonSelect label="Type" value={modalType} onIonChange={(e: any) => {
                  setModalType(e.detail.value)
                  if (e.detail.value !== modalCurrentItem.type) {
                    setAreChanges(true)
                  } else {
                    setAreChanges(false)
                  }
                }}>
                  {types && types.map((type: any) => (
                    <IonSelectOption key={type.id} value={type.id}>{type.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem className={`${s.comments_modalItem} ${s.comments_modalItemWrapper}`}>
                <IonInput onIonChange={(e: any) => setModalSensorId(e.detail.value)} className={s.comments_modalInput} label="Sensor ID" value={modalSensorId}></IonInput>
              </IonItem>
              <IonItem className={s.comments_modalItem}>
                <IonLabel>Date</IonLabel>
                <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
                <IonModal keepContentsMounted={true} className={s.comments_modalDateModal}>
                  <IonDatetime id="datetime" value={modalDate} onIonChange={(e: any) => setModalDate(getDatetime(new Date(e.detail.value)))}></IonDatetime>
                </IonModal>
              </IonItem>
              <IonItem className={s.comments_modalItem}>
                <IonTextarea className={s.comments_modalItemTextarea} label="Text" value={modalText} autoGrow={true} onIonChange={(e: any) => setModalText(e.detail.value)}></IonTextarea>
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
                    <IonButton style={{display: areChanges ? 'block' : 'none' }} color='primary' onClick={onCommentSave}>Save</IonButton>
                    <IonButton onClick={() => setIsEditModalOpen(false)}>Cancel</IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonFooter>
            </div>
          </div>
        </IonContent>
      </IonModal>
    </div>
  )
}
