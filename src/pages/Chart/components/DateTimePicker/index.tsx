import React, {useEffect, useState} from 'react'
import s from "../../style.module.css";
import {IonButton, IonDatetime, IonDatetimeButton, IonIcon, IonLabel, IonModal, IonText, useIonToast} from "@ionic/react";
import {enterSharp, refreshOutline} from "ionicons/icons";
import DatetimeCalendar from "./components/DatetimeCalendar";
import {getCurrentDatetime} from "./functions/getCurrentTime";
import {getStartDate} from "./functions/getStartDate";
import {updateChartWithNewDatetime} from "./functions/updateChartWithNewDatetime";
import {isFourteenDays} from "./functions/isFourteenDays";
const DateTimePicker = (props: any) => {
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
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
    if (isFourteenDays(startDate, endDate)) {
      setStartDate(getStartDate(endDate))
    }
  }, [startDate, endDate]);

  return (
    <div>
      <div className={s.datetimePickerWrapper}>
        <DatetimeCalendar title={'From'} date={startDate} setDate={setStartDate} />
        <DatetimeCalendar title={'To'} date={endDate} setDate={setEndDate}/>
        <IonButton onClick={() => updateChartWithNewDatetime(startDate, endDate, presentToast, props.sensorId, props.root, props.isMobile, props.fullDatesArray, props.setCurrentChartData, props.setDisableNextButton, props.setDisablePrevButton)}>
          <IonIcon icon={refreshOutline}></IonIcon>
          update
        </IonButton>
      </div>
    </div>
  )
}

export default DateTimePicker