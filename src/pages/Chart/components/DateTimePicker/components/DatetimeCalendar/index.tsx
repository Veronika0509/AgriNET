import React from 'react'
import s from "../../../types/moist/style.module.css";
import {IonDatetime, IonDatetimeButton, IonLabel, IonModal} from "@ionic/react";

const DatetimeCalendar = (props: any) => {
  const handleDateChange = (event: CustomEvent) => {
    props.setDate(event.detail.value);
  };
  return (
    <div className={s.datetimePickerContainer}>
      <IonLabel className={s.datetimePickerTitle}>{props.title}</IonLabel>
      <div className={s.datetimePicker}>
        <IonDatetimeButton datetime={props.title} ></IonDatetimeButton>
        <IonModal keepContentsMounted={true}>
          <IonDatetime id={props.title} presentation='date' value={props.date} onIonChange={handleDateChange} show-default-buttons="true"></IonDatetime>
        </IonModal>
      </div>
    </div>
  )
}

export default DatetimeCalendar