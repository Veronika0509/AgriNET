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
  userId: string | number,
  // Dates currently selected in the chart page TopSection
  startDate?: string,
  endDate?: string
}

export const Export: React.FC<ExportProps> = ({chartCode, sensorId, userId, startDate, endDate}) => {
  const toDateValue: string = formatDateToISO(new Date())
  const fromDateValue = new Date(toDateValue)
  const [fromDate, setFromDate] = useState(formatDateToISO(new Date(fromDateValue.setDate(new Date(toDateValue).getDate() - 30))))
  const [toDate, setToDate] = useState(toDateValue)
  const [reportDuration, setRepostDuration] = useState(30)
  const [format, setFormat] = useState('Comma-separated')
  const [validationResult, setValidationResult] = useState<string | undefined>(undefined)
  // true once the user changes a date inside the modal; otherwise the TopSection dates are used
  const [isDateEditedInModal, setIsDateEditedInModal] = useState(false)
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
      setValidationResult(undefined)
    }
  }, [fromDate, toDate]);

  // Each time the modal opens, start from the dates chosen in the TopSection
  const onModalWillPresent = () => {
    setIsDateEditedInModal(false)
    if (startDate && !isNaN(new Date(startDate).getTime())) {
      setFromDate(formatDateToISO(new Date(startDate)))
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      setToDate(formatDateToISO(new Date(endDate)))
    }
  }

  const getTopSectionDate = (date: string | undefined, fallback: string) =>
    date && !isNaN(new Date(date).getTime()) ? formatDateToISO(new Date(date)) : fallback

  const onDownloadClick = async () => {
    // Unless the user picked other dates in the modal, export exactly the TopSection range
    const exportFromDate = isDateEditedInModal ? fromDate : getTopSectionDate(startDate, fromDate)
    const exportToDate = isDateEditedInModal ? toDate : getTopSectionDate(endDate, toDate)
    const fromDateForFile = exportFromDate.replace('T', '%20').substring(0, 18)
    const toDateForFile = exportToDate.replace('T', '%20').substring(0, 18)
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
      <IonModal trigger={chartCode} ref={modalRefs[chartCode]} onWillPresent={onModalWillPresent}>
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
                <ExportDateTime type={'from'} idPrefix={chartCode} value={fromDate} setValue={(v) => { if (v !== null) { setFromDate(v); setIsDateEditedInModal(true) } }}/>
                <ExportDateTime type={'to'} idPrefix={chartCode} value={toDate} setValue={(v) => { if (v !== null) { setToDate(v); setIsDateEditedInModal(true) } }}/>
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