import React from "react";
import {IonDatetime, IonDatetimeButton, IonModal, IonText} from "@ionic/react";
import s from '../../../style.module.css'

interface ExportDateTimeProps {
  type: string;
  // Makes the datetime id unique when several Export modals are on one page (moist has 3)
  idPrefix?: string;
  value: string | null;
  setValue: (value: string | null) => void;
}

export const ExportDateTime: React.FC<ExportDateTimeProps> = ({type, idPrefix, value, setValue}) => {
  const datetimeId = idPrefix ? `${idPrefix}-${type}-datetime` : `${type}-datetime`
  return (
    <div className={s.export_container}>
      <IonText color='light'>{type === 'to' ? 'To' : 'From'} Time (UTC)</IonText>
      <IonDatetimeButton datetime={datetimeId}></IonDatetimeButton>
      <IonModal keepContentsMounted={true} className={s.datetimePicker_modal}>
        <IonDatetime id={datetimeId} value={value} onIonChange={(e) => setValue(e.detail.value as string)}  show-default-buttons="true"></IonDatetime>
      </IonModal>
    </div>
  )
}