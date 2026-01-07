import React, {useEffect, useState} from 'react'
import s from "../../style.module.css";
import {IonButton, IonIcon, IonInput, IonSegment, IonSegmentButton, useIonToast} from "@ionic/react";
import {refreshOutline} from "ionicons/icons";
import DatetimeCalendar from "./components/DatetimeCalendar";
import {getDatetime} from "./functions/getDatetime";
import {updateChartsWithNewDatetime} from "./functions/updateChartsWithNewDatetime";
import { loadChartPreferences, saveChartPreferences } from "../../../../utils/chartPreferences";

const DateTimePicker = (props: any) => {
  const [wasYearsMode, setWasYearsMode] = useState(false)
  const [present] = useIonToast();

  // Load preferences from cookies on mount
  const [selectedTab, setSelectedTab] = React.useState<'days' | 'years'>(() => {
    const preferences = loadChartPreferences();
    return preferences.selectedTab;
  });

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
      setNewDates(newDaysDifference)
      setWasYearsMode(false)
    }
  }
  const onDaysNumberChange = (e: CustomEvent) => {
    const value = (e.detail as { value?: string | number | null }).value;
    if (value !== null && value !== undefined && !isNaN(Number(value)) && Number(value) >= 0) {
      setNewDates(String(value))
    } else {
      setNewDates('0')
    }
  }
  const setNewDates = (days: any) => {
    props.setDateDifferenceInDays(days)
    const toDate = new Date(props.endDate)
    const fromDate: any = new Date(toDate).setDate(toDate.getDate() - Number(days));
    props.setStartDate(getDatetime(new Date(fromDate)))
  }
  // Load initial preferences on mount
  useEffect(() => {
    const preferences = loadChartPreferences();
    // Only set if parent hasn't already initialized with a different value
    if (props.dateDifferenceInDays === '14') {
      props.setDateDifferenceInDays(preferences.dateDifferenceInDays);
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    saveChartPreferences({
      dateDifferenceInDays: props.dateDifferenceInDays,
      selectedTab,
    });
  }, [props.dateDifferenceInDays, selectedTab]);

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

  return (
    <div>
      <div className={s.datetimePicker_wrapper}>
        <div className={s.datetimePicker_wrapperContainer}>
          <div className={s.datetimePicker_tabs}>
            <IonInput
              aria-label='days'
              value={props.dateDifferenceInDays}
              onIonInput={(e) => onDaysNumberChange(e)}
              className={s.datetimePicker_tabsInput}
            />
            <IonSegment className={s.datetimePicker_segment} value={selectedTab}
                        onIonChange={(e: CustomEvent) => {
                          const value = (e.detail as { value?: 'days' | 'years' }).value;
                          if (value) setSelectedTab(value);
                        }}>
              <IonSegmentButton className={s.datetimePicker_segmentButton} value="days" onClick={onDaysClick}>Days</IonSegmentButton>
              <IonSegmentButton className={s.datetimePicker_segmentButton} value="years">Years</IonSegmentButton>
            </IonSegment>
          </div>
          {selectedTab !== 'years' && (
            <div className={s.datetimePicker_calendars}>
              <DatetimeCalendar title={'From'} startDate={props.startDate} setStartDate={props.setStartDate} endDate={props.endDate} setEndDate={props.setEndDate} dateDifferenceInDays={props.dateDifferenceInDays} setDateDifferenceInDays={props.setDateDifferenceInDays} />
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
          props.setShowForecast,
          props.updateChart,
          props.dateDifferenceInDays,
          props.type
        )}>
          <IonIcon icon={refreshOutline}></IonIcon>
        </IonButton>
      </div>
    </div>
  )
}

export default DateTimePicker
