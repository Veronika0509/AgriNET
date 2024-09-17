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
import {download, logoFacebook} from "ionicons/icons";
import React, {useEffect, useRef, useState} from "react";
import {ExportDateTime} from "./components/ExportDateTime";
import s from './style.module.css'
import {validateDates} from "./functions/validateDates";
import {formatDateToISO} from "./functions/formatDate";
import {getExport} from "./data/getExport";

interface ExportProps {
  type: string,
  sensorId: string,
  userId: any
}

export const Export: React.FC<ExportProps> = ({type, sensorId, userId}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const toDateValue: any = formatDateToISO(new Date())
  let fromDateValue = new Date(toDateValue)
  const [fromDate, setFromDate] = useState(formatDateToISO(new Date(fromDateValue.setDate(new Date(toDateValue).getDate() - 30))))
  const [toDate, setToDate] = useState(toDateValue)
  const [reportDuration, setRepostDuration] = useState(30)
  const [format, setFormat] = useState('Comma-separated')
  const [validationResult, setValidationResult] = useState<any>('')

  useEffect(() => {
    if (validateDates(fromDate, toDate)) {
      setRepostDuration(0)
      setValidationResult(validateDates(fromDate, toDate))
    } else {
      const fromDateTime: any = new Date(fromDate)
      const toDateTime: any = new Date(toDate)
      fromDateTime.setHours(0, 0, 0, 0);
      toDateTime.setHours(0, 0, 0, 0);
      const differenceInDays = Math.ceil((toDateTime - fromDateTime) / (1000 * 60 * 60 * 24));
      setRepostDuration(differenceInDays)
      setValidationResult(null)
    }
  }, [fromDate, toDate]);

  const onDownloadClick = async () => {
    let chartCode: string
    if (type === 'moist') {
      chartCode = 'm'
    } else if (type === 'temp') {
      chartCode = 'tempRh'
    } else {
      chartCode = 'weather_leaf'
    }
    const fromDateForFile = fromDate.replace('T', '%20').substring(0, 18)
    const toDateForFile = toDate.replace('T', '%20').substring(0, 18)
    let url = `https://app.agrinet.us/api/chart/export?sensorId=${sensorId}`
      +`&chartCode=${chartCode}`
      +`&fromDate=${fromDateForFile}`
      +`&toDate=${toDateForFile}`
      +`&userId=${userId}`
      +`&format=${format === 'Comma-separated' ? 'csv' : 'tab'}`;
    window.open(url, '_blank', 'location=no,width=500,height=400');
  }

  return (
    <div>
      <IonButton fill='solid' id='exportTrigger'>
        <IonIcon icon={download} slot="start"/>
        Export
      </IonButton>
      <IonModal trigger='exportTrigger' ref={modal}>
        <IonContent className={s.modalContent}>
          <div className={s.modalWrapper}>
            <div className={s.modalHeader}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Export Chart Data</IonTitle>
                </IonToolbar>
              </IonHeader>
            </div>
            <div className={s.modalBody}>
              <IonItem className={s.item}>
                <ExportDateTime type={'from'} value={fromDate} setValue={setFromDate}/>
                <ExportDateTime type={'to'} value={toDate} setValue={setToDate}/>
              </IonItem>
              <div className={s.container}>
                <IonText color='light'>Format</IonText>
                <IonSelect aria-label="Format" value={format} onIonChange={(e) => setFormat(e.detail.value)}
                           className={s.select}>
                  <IonSelectOption value="Comma-separated">Comma-separated</IonSelectOption>
                  <IonSelectOption value="Tab-separated">Tab-separated</IonSelectOption>
                </IonSelect>
              </div>
              <div className={`${s.container} ${s.reportDuration}`}>
                <IonText>Report Duration: {reportDuration} days</IonText>
              </div>
              <div className={s.container}>
                {validationResult && <IonText color='danger'>Validation Error: {validationResult}</IonText>}
              </div>
            </div>
            <div className={s.modalFooter}>
              <IonFooter className={s.footer}>
                <IonToolbar className={s.bottomButtons}>
                  <IonButtons slot='end'>
                    <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                    <IonButton onClick={onDownloadClick} disabled={validationResult}>Download</IonButton>
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