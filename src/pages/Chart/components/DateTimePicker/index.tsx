import React, {useEffect} from 'react'
import s from "../types/moist/style.module.css";
import {IonButton, IonIcon, useIonToast} from "@ionic/react";
import {refreshOutline} from "ionicons/icons";
import DatetimeCalendar from "./components/DatetimeCalendar";
import {getStartDate} from "./functions/getStartDate";
import {updateChartWithNewDatetime} from "./functions/types/moist/updateChartWithNewDatetime";
import {isFourteenDays} from "./functions/isFourteenDays";
import {updateWxetChartWithNewDatetime} from "./functions/types/wxet/updateWxetChartWithNewDatetime";
import {updateTempChartWithNewDatetime} from "./functions/types/temp/updateTempChartWithNewDatetime";
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

  const renderButton = () => {
    switch (props.type) {
      case 'moist':
        return (
          <IonButton onClick={() => updateChartWithNewDatetime(
            props.startDate,
            props.endDate,
            presentToast,
            props.setCurrentDates
          )}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonButton>
        );
      case 'wxet':
        return (
          <IonButton onClick={() => updateWxetChartWithNewDatetime(
            props.startDate,
            props.endDate,
            presentToast,
            props.setCurrentDates
          )}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonButton>
        );
      case 'temp':
        return (
          <IonButton onClick={() => updateTempChartWithNewDatetime(
            props.startDate,
            props.endDate,
            presentToast,
            props.setCurrentDates
          )}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonButton>
        )
      default:
        return null;
    }
  }

  return (
    <div>
      <div className={s.datetimePickerWrapper}>
        <div className={s.datetimePickerWrapperContainer}>
          <DatetimeCalendar title={'From'} date={props.startDate} setDate={props.setStartDate} />
          <DatetimeCalendar title={'To'} date={props.endDate} setDate={props.setEndDate}/>
        </div>
        {renderButton()}
      </div>
    </div>
  )
}

export default DateTimePicker