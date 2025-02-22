import React, {useEffect, useState} from 'react'
import s from "../../style.module.css";
import {IonButton, IonIcon, IonInput, IonSegment, IonSegmentButton, useIonToast} from "@ionic/react";
import {refreshOutline} from "ionicons/icons";
import DatetimeCalendar from "./components/DatetimeCalendar";
import {getDatetime} from "./functions/getDatetime";
import {updateChartsWithNewDatetime} from "./functions/updateChartsWithNewDatetime";

const DateTimePicker = (props: any) => {
  const [selectedTab, setSelectedTab] = React.useState('days');
  const [wasYearsMode, setWasYearsMode] = useState(false)
  const [present] = useIonToast();

  const presentToast = () => {
    present({
      message: 'The date you entered could not be recognized. Please ensure it is entered correctly.',
      duration: 5000,
      position: 'bottom',
      color: "danger"
    });
  };
  const onDaysClick = () => {
    if (wasYearsMode) {
      const newDaysDifference: string = (365 * Number(props.dateDifferenceInDays)).toString()
      props.setDateDifferenceInDays(newDaysDifference)
      setWasYearsMode(false)
    }
  }
  const onDaysNumberChange = (e: any) => {
    if (e.detail.value !== 0 && !isNaN(parseFloat(e.detail.value)) && e.detail.value >= 0) {
      props.setDateDifferenceInDays(e.detail.value!)
    } else {
      props.setDateDifferenceInDays('0')
    }
  }
  useEffect(() => {
    if (selectedTab === 'years') {
      const fromDate = new Date(props.startDate).getTime()
      const toDate = new Date(props.endDate).getTime()
      const differenceInYears: any = Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24 * 365))
      if (differenceInYears < 1) {
        props.setDateDifferenceInDays('1')
      } else {
        props.setDateDifferenceInDays(differenceInYears)
      }
      setWasYearsMode(true)
    }
  }, [selectedTab]);
  useEffect(() => {
    const toDate = new Date(props.endDate)
    const fromDate: any = new Date(toDate).setDate(toDate.getDate() - Number(props.dateDifferenceInDays));
    props.setStartDate(getDatetime(new Date(fromDate)))
  }, [props.dateDifferenceInDays]);

  return (
    <div>
      <div className={s.datetimePicker_wrapper}>
        <div className={s.datetimePicker_wrapperContainer}>
          <div className={s.datetimePicker_tabs}>
            <IonInput
              type="number"
              value={props.dateDifferenceInDays}
              onIonInput={(e) => onDaysNumberChange(e)}
              className={s.datetimePicker_tabsInput}
            />
            <IonSegment className={s.datetimePicker_segment} value={selectedTab}
                        onIonChange={(e: any) => setSelectedTab(e.detail.value!)}>
              <IonSegmentButton className={s.datetimePicker_segmentButton} value="days" onClick={onDaysClick}>Days</IonSegmentButton>
              <IonSegmentButton className={s.datetimePicker_segmentButton} value="years">Years</IonSegmentButton>
            </IonSegment>
          </div>
          {selectedTab !== 'years' && (
            <div className={s.datetimePicker_calendars}>
              <DatetimeCalendar title={'From'} startDate={props.startDate} setStartDate={props.setStartDate} endDate={props.endDate} setEndDate={props.setEndDate} setDateDifferenceInDays={props.setDateDifferenceInDays} />
              <DatetimeCalendar title={'To'} startDate={props.startDate} setStartDate={props.setStartDate} endDate={props.endDate} setEndDate={props.setEndDate} dateDifferenceInDays={props.dateDifferenceInDays} setDateDifferenceInDays={props.setDateDifferenceInDays} />
            </div>
          )}
        </div>
        <IonButton className={s.datetimePicker_updateButton} onClick={() => updateChartsWithNewDatetime(
          props.startDate,
          props.endDate,
          selectedTab,
          presentToast,
          props.setCurrentDates,
          props.fullDatesArray,
          props.setDisableNextButton,
          props.setDisablePrevButton,
          props.setShowForecast,
          props.updateChart
        )}>
          <IonIcon icon={refreshOutline}></IonIcon>
        </IonButton>
      </div>
    </div>
  )
}

export default DateTimePicker
