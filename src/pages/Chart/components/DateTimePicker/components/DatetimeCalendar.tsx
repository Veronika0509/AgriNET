import React, {useEffect} from 'react'
import s from "../../../style.module.css";
import {IonDatetime, IonDatetimeButton, IonLabel, IonModal} from "@ionic/react";
import {getDatetime} from "../functions/getDatetime";

const DatetimeCalendar = (props: any) => {
  const handleDateChange = (event: CustomEvent) => {
    if (props.title === 'From') {
      props.setStartDate(event.detail.value);
      const fromDate: any = new Date(event.detail.value)
      const toDate: any = new Date(props.endDate)
      const difference = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24))
      props.setDateDifferenceInDays(difference)
    } else {
      props.setEndDate(event.detail.value)
      const toDate = new Date(event.detail.value)
      const fromDate = new Date(toDate.getTime() - (props.dateDifferenceInDays * 1000 * 60 * 60 * 24))
      props.setStartDate(getDatetime(fromDate))
    }
  };

  return (
    <div className={s.datetimePicker_container}>
      <IonLabel className={s.datetimePicker_title}>{props.title}</IonLabel>
      <div className={s.datetimePicker_item}>
        <IonDatetimeButton datetime={props.title}></IonDatetimeButton>
        <IonModal keepContentsMounted={true}>
          <IonDatetime key={props.title} id={props.title} presentation='date' value={props.title === 'From' ? props.startDate : props.endDate} onIonChange={handleDateChange} show-default-buttons="true"></IonDatetime>
        </IonModal>
      </div>
    </div>
  )
}

export default DatetimeCalendar