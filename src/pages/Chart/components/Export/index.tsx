import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import {download} from "ionicons/icons";
import React, {useEffect, useRef, useState} from "react";
import {ExportDateTime} from "./components/ExportDateTime";
import s from '../../style.module.css'
import {validateDates} from "./functions/validateDates";
import {formatDateToISO} from "./functions/formatDate";

interface ExportProps {
  chartCode: string,
  sensorId: string,
  userId: string | number
}

export const Export: React.FC<ExportProps> = ({chartCode, sensorId, userId}) => {
  const toDateValue: string = formatDateToISO(new Date())
  const fromDateValue = new Date(toDateValue)
  const [fromDate, setFromDate] = useState(formatDateToISO(new Date(fromDateValue.setDate(new Date(toDateValue).getDate() - 30))))
  const [toDate, setToDate] = useState(toDateValue)
  const [reportDuration, setRepostDuration] = useState(30)
  const [format, setFormat] = useState('Comma-separated')
  const [validationResult, setValidationResult] = useState<string | null>(null)
  const mModal = useRef<HTMLIonModalElement>(null);
  const mstModal = useRef<HTMLIonModalElement>(null);
  const mSumModal = useRef<HTMLIonModalElement>(null);
  const tempRhModal = useRef<HTMLIonModalElement>(null);
  const weather_leafModal = useRef<HTMLIonModalElement>(null);

  const modalRefs: Record<string, React.RefObject<HTMLIonModalElement>> = {
    m: mModal,
    mst: mstModal,
    mSum: mSumModal,
    tempRh: tempRhModal,
    weather_leaf: weather_leafModal,
  };

  useEffect(() => {
    if (validateDates(fromDate, toDate)) {
      setRepostDuration(0)
      setValidationResult(validateDates(fromDate, toDate))
    } else {
      const fromDateTime: Date = new Date(fromDate)
      const toDateTime: Date = new Date(toDate)
      fromDateTime.setHours(0, 0, 0, 0);
      toDateTime.setHours(0, 0, 0, 0);
      const differenceInDays = Math.ceil((toDateTime.getTime() - fromDateTime.getTime()) / (1000 * 60 * 60 * 24));
      setRepostDuration(differenceInDays)
      setValidationResult(null)
    }
  }, [fromDate, toDate]);

  const onDownloadClick = async () => {
    const fromDateForFile = fromDate.replace('T', '%20').substring(0, 18)
    const toDateForFile = toDate.replace('T', '%20').substring(0, 18)
    const url = `https://app.agrinet.us/api/chart/export?sensorId=${sensorId}`
      + `&chartCode=${chartCode}`
      + `&fromDate=${fromDateForFile}`
      + `&toDate=${toDateForFile}`
      + `&userId=${userId}`
      + `&format=${format === 'Comma-separated' ? 'csv' : 'tab'}`;
    window.open(url, '_blank', 'location=no,width=500,height=400');
  }

  return (
    <div>
      <IonButton fill='solid' id={chartCode}>
        <IonIcon icon={download} slot="start"/>
        Export
      </IonButton>
      <IonModal trigger={chartCode} ref={modalRefs[chartCode]}>
        <IonContent className={s.export_modalContent}>
          <div className={s.mixed_modalWrapper}>
            <div className={s.export_modalHeader}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Export Chart Data</IonTitle>
                </IonToolbar>
              </IonHeader>
            </div>
            <div className={s.export_modalBody}>
              <IonItem className={s.export_item}>
                <ExportDateTime type={'from'} value={fromDate} setValue={setFromDate}/>
                <ExportDateTime type={'to'} value={toDate} setValue={setToDate}/>
              </IonItem>
              <div className={s.export_container}>
                <IonText color='light'>Format</IonText>
                <IonSelect aria-label="Format" value={format} onIonChange={(e) => setFormat(e.detail.value)}
                           className={s.export_select}>
                  <IonSelectOption value="Comma-separated">Comma-separated</IonSelectOption>
                  <IonSelectOption value="Tab-separated">Tab-separated</IonSelectOption>
                </IonSelect>
              </div>
              <div className={`${s.export_container} ${s.export_reportDuration}`}>
                <IonText>Report Duration: {reportDuration} days</IonText>
              </div>
              <div className={s.export_container}>
                {validationResult && <IonText color='danger'>Validation Error: {validationResult}</IonText>}
              </div>
            </div>
            <div className={s.mixed_modalFooter}>
              <IonFooter className={s.mixed_footer}>
                <IonToolbar className={s.mixed_bottomButtons}>
                  <IonButtons slot='end'>
                    <IonButton onClick={() => modalRefs[chartCode].current?.dismiss()}>Cancel</IonButton>
                    <IonButton onClick={onDownloadClick} disabled={!!validationResult}>Download</IonButton>
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