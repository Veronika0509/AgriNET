import React from "react";
import {IonDatetime, IonDatetimeButton, IonItem, IonModal, IonText} from "@ionic/react";
import s from '../../../style.module.css'

interface ExportDateTimeProps {
  type: string,
  value: any,
  setValue: any
}

export const ExportDateTime: React.FC<ExportDateTimeProps> = ({type, value, setValue}) => {
  return (
    <div className={s.export_container}>
      <IonText color='light'>{type === 'to' ? 'To' : 'From'} Time (UTC)</IonText>
      <IonDatetimeButton datetime={`${type}-datetime`}></IonDatetimeButton>
      <IonModal keepContentsMounted={true} className={s.datetimePicker_modal}>
        <IonDatetime id={`${type}-datetime`} value={value} onIonChange={(e: any) => setValue(e.detail.value)}  show-default-buttons="true"></IonDatetime>
      </IonModal>
    </div>
  )
}