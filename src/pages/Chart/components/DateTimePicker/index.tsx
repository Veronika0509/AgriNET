import React, {useEffect, useState} from 'react'
import s from "../types/moist/style.module.css";
import {IonButton, IonDatetime, IonDatetimeButton, IonIcon, IonLabel, IonModal, IonText, useIonToast} from "@ionic/react";
import {enterSharp, refreshOutline} from "ionicons/icons";
import DatetimeCalendar from "./components/DatetimeCalendar";
import {getCurrentDatetime} from "./functions/getCurrentTime";
import {getStartDate} from "./functions/getStartDate";
import {updateChartWithNewDatetime} from "./functions/types/moist/updateChartWithNewDatetime";
import {isFourteenDays} from "./functions/isFourteenDays";
import {updateWxetChartWithNewDatetime} from "./functions/types/wxet/updateWxetChartWithNewDatetime";
const DateTimePicker = (props: any) => {
  const [present] = useIonToast();

  const presentToast = () => {
    present({
      message: 'The date you entered could not be recognized. Please ensure it is entered correctly.',
      duration: 5000,
      position: 'bottom',
      color: "danger"
    });
  };

  useEffect(() => {
    if (isFourteenDays(props.startDate, props.endDate)) {
      props.setStartDate(getStartDate(props.endDate))
    }
  }, [props.startDate, props.endDate]);

  return (
    <div>
      <div className={s.datetimePickerWrapper}>
        <div className={s.datetimePickerWrapperContainer}>
          <DatetimeCalendar title={'From'} date={props.startDate} setDate={props.setStartDate} />
          <DatetimeCalendar title={'To'} date={props.endDate} setDate={props.setEndDate}/>
        </div>

        {props.type === 'moist' ? (
          <IonButton onClick={() => updateChartWithNewDatetime(
            props.startDate,
            props.endDate,
            presentToast,
            props.setCurrentDates
          )}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonButton>
        ) : props.type === 'wxet' && (
          <IonButton onClick={() => updateWxetChartWithNewDatetime(
            props.startDate,
            props.endDate,
            presentToast,
            props.sensorId,
            props.root,
            props.isMobile,
            props.setCurrentChartData,
            props.additionalChartData
          )}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonButton>
        )}
      </div>
    </div>
  )
}

export default DateTimePicker