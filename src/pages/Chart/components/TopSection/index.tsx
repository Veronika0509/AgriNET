import React, {useEffect, useState} from 'react'
import s from "../types/moist/style.module.css";
import DateTimePicker from "../DateTimePicker";
import {InputChangeEventDetail, IonButton, IonInput, IonItem, IonToggle} from "@ionic/react";
import {moistDataBatteryRequest} from "../../data/types/moist/moistDataBatteryRequest";
import {createMoistBatteryChart} from "../../functions/types/moist/createMoistBatteryChart";
import {getEventTarget} from "@amcharts/amcharts5/.internal/core/util/Utils";

const TopSection = (props: any) => {
  const [disabledComparingMode, setDisabledComparingMode] = useState(false)
  const [disabledHistoricMode, setDisabledHistoricMode] = useState(false)

  useEffect( () => {
    const batteryHandler = async () => {
      if (props.batteryChartShowed) {
        if (props.type === 'moist') {
          if (props.currentDates !== 0) {
            const newBatteryData = await moistDataBatteryRequest(props.sensorId, props.currentDates[0], props.currentDates[1])
            createMoistBatteryChart(newBatteryData.data, props.batteryRoot)
          } else {
            const newBatteryData = await moistDataBatteryRequest(props.sensorId)
            createMoistBatteryChart(newBatteryData.data, props.batteryRoot)
          }
        }
      }
    }

    batteryHandler()
  }, [props.batteryChartShowed, props.currentDates]);

  // Moist
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
    <div className={`${s.topSection} ${(props.type === 'temp' || props.type === 'wxet') && s.tempWxetTopSection}`}>
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
      {props.type === 'moist' && (
        <div className={s.moistTopSectionContainer}>
          <IonButton
            className={s.batteryButton}
            onClick={() => props.setBatteryChartShowed(!props.batteryChartShowed)}
          >battery</IonButton>
          <div className={s.toggles}>
            <IonToggle className={s.moistToggle} disabled={disabledComparingMode} onIonChange={(event: any) => onMoistToggle(event, 'comparingMode')}>Comparing mode</IonToggle>
            <IonToggle className={s.moistToggle} disabled={disabledHistoricMode} onIonChange={(event: any) => onMoistToggle(event, 'historicMode')}>Historical Data Perennials Only</IonToggle>
          </div>
        </div>
      )}
      {(props.type === 'temp' || props.type === 'wxet') && (
        <div className={s.nwsForecast}>
          <IonToggle className={s.tempWxetToggle} onIonChange={(event: any) => props.setNwsForecast(event.detail.checked)}>NWS Forecast</IonToggle>
          <IonInput className={s.tempWxetInput} min={1} max={6} label="Days" type="number" value={props.nwsForecastDays} onIonChange={(event) => props.setNwsForecastDays(event.detail.value)}></IonInput>
        </div>
      )}
    </div>
  )
}

export default TopSection