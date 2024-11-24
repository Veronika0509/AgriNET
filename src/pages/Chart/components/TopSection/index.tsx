import React, {useEffect, useState} from 'react'
import s from "../../style.module.css";
import DateTimePicker from "../DateTimePicker";
import {IonButton, IonIcon, IonInput, IonItem, IonLabel, IonText, IonToggle} from "@ionic/react";
import {getBatteryChartData} from "../../data/types/moist/getBatteryChartData";
import { alarmOutline } from 'ionicons/icons';
import {getSoilTempChartData} from "../../data/types/moist/getSoilTempChartData";
import {createAdditionalChart} from "../../functions/types/moist/createAdditionalChart";
import {getComments} from "../AddComment/data/getComments";

const TopSection = (props: any) => {
  const [disabledComparingMode, setDisabledComparingMode] = useState(false)
  const [disabledHistoricMode, setDisabledHistoricMode] = useState(false)

  // Battery Chart
  useEffect( () => {
    const batteryHandler = async () => {
      if (props.batteryChartShowed) {
        props.updateChart('battery', 'comments')
      }
    }

    batteryHandler()
  }, [props.batteryChartShowed, props.currentDates]);



  // Soil Temperature Chart
  useEffect( () => {
    if (props.soilTempChartShowed) {
      props.updateChart('soilTemp', 'comments')
    }
  }, [props.soilTempChartShowed]);

  // Moist Toggle
  const onMoistToggle = (event: any, mode: string) => {
    if (mode === 'comparingMode') {
      if (event.detail.checked) {
        setDisabledHistoricMode(true)
        props.setComparingMode(true)
      } else {
        setDisabledHistoricMode(false)
        props.setComparingMode(false)
      }
    } else if (mode === 'historicMode') {
      if (event.detail.checked) {
        setDisabledComparingMode(true)
        props.setHistoricMode(true)
      } else {
        setDisabledComparingMode(false)
        props.setHistoricMode(false)
      }
    }
  }

  return (
    <div className={s.topSection_mainContainer}>
      <div className={s.topSection_wrapper}>
        <DateTimePicker
          sensorId={props.sensorId}
          root={props.root}
          isMobile={props.isMobile}
          fullDatesArray={props.fullDatesArray}
          setCurrentChartData={props.setCurrentChartData}
          setDisableNextButton={props.setDisableNextButton}
          setDisablePrevButton={props.setDisablePrevButton}
          endDate={props.endDate}
          startDate={props.startDate}
          setEndDate={props.setEndDate}
          setStartDate={props.setStartDate}
          additionalChartData={props.additionalChartData}
          type={props.type}
          batteryRoot={props.batteryRoot}
          sumRoot={props.sumRoot}
          setCurrentDates={props.setCurrentDates}
          userId={props.userId}
        />
        <IonButton fill="outline" onClick={() => props.setAlarm(true)}>
          <IonIcon slot="start" icon={alarmOutline}></IonIcon>
          Add Alarm
        </IonButton>
      </div>
      <div className={s.topSection_configurations}>
        {props.type === 'moist' && (
          <div className={s.moistTopSectionContainer}>
            <IonItem className={s.topSection_moistTopSectionItem}>
              <IonLabel>
                <IonText color={'light'}>More Charts</IonText>
                <div className={s.topSection_chartsButtonsContainer}>
                  <IonButton
                    fill={props.batteryChartShowed ? 'outline' : 'solid'}
                    size="default"
                    onClick={() => props.setBatteryChartShowed(!props.batteryChartShowed)}
                  >battery</IonButton>
                  <IonButton
                    fill={props.soilTempChartShowed ? 'outline' : 'solid'}
                    size="default"
                    onClick={() => props.setSoilTempChartShowed(!props.soilTempChartShowed)}
                  >soil temp</IonButton>
                </div>
              </IonLabel>
            </IonItem>
            <IonItem className={s.topSection_moistTopSectionItem}>
              <IonLabel>
                <IonText color={'light'}>Modes</IonText>
                <div className={s.toggles}>
                  <IonToggle className={s.moistToggle} disabled={disabledComparingMode} onIonChange={(event: any) => onMoistToggle(event, 'comparingMode')}>Comparing mode</IonToggle>
                  <IonToggle className={s.moistToggle} disabled={disabledHistoricMode} onIonChange={(event: any) => onMoistToggle(event, 'historicMode')}>Historical Data Perennials Only</IonToggle>
                  <IonToggle className={s.topSection_tempWxetToggle} checked={props.isCommentsShowed} onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}>Comments</IonToggle>
                </div>
              </IonLabel>
            </IonItem>
          </div>
        )}
        {(props.type === 'temp' || props.type === 'wxet') && (
          <div className={s.topSection_nwsForecast}>
            <IonToggle className={s.topSection_tempWxetToggle} onIonChange={(event: any) => props.setNwsForecast(event.detail.checked)}>NWS Forecast</IonToggle>
            <IonToggle className={`${s.topSection_tempWxetToggle} ${s.topSection_tempWxetToggleLeft}`} checked={props.isCommentsShowed} onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}>Comments</IonToggle>
            <IonInput className={s.topSection_tempWxetInput} min={1} max={6} label="Days" type="number" value={props.nwsForecastDays} onIonChange={(event) => props.setNwsForecastDays(event.detail.value)}></IonInput>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopSection