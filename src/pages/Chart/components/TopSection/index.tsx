import React, {useEffect, useState} from 'react'
import s from "../../style.module.css";
import DateTimePicker from "../DateTimePicker";
import {IonButton, IonIcon, IonInput, IonItem, IonLabel, IonText, IonToggle} from "@ionic/react";
import {getBatteryChartData} from "../../data/types/moist/getBatteryChartData";
import {createBatteryChart} from "../../functions/types/moist/createBatteryChart";
import { alarmOutline } from 'ionicons/icons';
import {getSoilTempChartData} from "../../data/types/moist/getSoilTempChartData";
import {createSoilTempChart} from "../../functions/types/moist/createSoilTempChart";
import {createAdditionalChart} from "../../functions/types/moist/createAdditionalChart";

const TopSection = (props: any) => {
  const [disabledComparingMode, setDisabledComparingMode] = useState(false)
  const [disabledHistoricMode, setDisabledHistoricMode] = useState(false)

  // Battery Chart
  useEffect( () => {
    const batteryHandler = async () => {
      if (props.batteryChartShowed) {
        if (props.currentDates !== 0) {
          const newBatteryChartData = await getBatteryChartData(props.sensorId, props.currentDates[0], props.currentDates[1])
          createAdditionalChart('battery', newBatteryChartData.data, props.batteryRoot)
        } else {
          const newBatteryChartData = await getBatteryChartData(props.sensorId)
          createAdditionalChart('battery', newBatteryChartData.data, props.batteryRoot)
        }
      }
    }

    batteryHandler()
  }, [props.batteryChartShowed, props.currentDates]);

  // Soil Temperature Chart
  useEffect( () => {
    const soilTempHandler = async () => {
      if (props.soilTempChartShowed) {
        if (props.currentDates !== 0) {
          const newSoilTempChartData = await getSoilTempChartData(props.sensorId, props.currentDates[0], props.currentDates[1])
          createAdditionalChart(
            'soilTemp',
            newSoilTempChartData.data.data,
            props.soilTempRoot,
            undefined,
            undefined,
            props.additionalChartData.linesCount,
            newSoilTempChartData.data.metric
          )
        } else {
          const newSoilTempChartData = await getSoilTempChartData(props.sensorId)
          createAdditionalChart(
            'soilTemp',
            newSoilTempChartData.data.data,
            props.soilTempRoot,
            undefined,
            undefined,
            props.additionalChartData.linesCount,
            newSoilTempChartData.data.metric
          )
        }
      }
    }

    soilTempHandler()
  }, [props.soilTempChartShowed, props.currentDates]);

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
    <div className={s.topSection}>
      <div className={s.topSectionWrapper}>
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
      <div className={s.configurations}>
        {props.type === 'moist' && (
          <div className={s.moistTopSectionContainer}>
            <IonItem className={s.moistTopSectionItem}>
              <IonLabel>
                <IonText color={'light'}>More Charts</IonText>
                <div className={s.chartsButtonsContainer}>
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
            <IonItem className={s.moistTopSectionItem}>
              <IonLabel>
                <IonText color={'light'}>Modes</IonText>
                <div className={s.toggles}>
                  <IonToggle className={s.moistToggle} disabled={disabledComparingMode} onIonChange={(event: any) => onMoistToggle(event, 'comparingMode')}>Comparing mode</IonToggle>
                  <IonToggle className={s.moistToggle} disabled={disabledHistoricMode} onIonChange={(event: any) => onMoistToggle(event, 'historicMode')}>Historical Data Perennials Only</IonToggle>
                </div>
              </IonLabel>
            </IonItem>
          </div>
        )}
        {(props.type === 'temp' || props.type === 'wxet') && (
          <div className={s.nwsForecast}>
            <IonToggle className={s.tempWxetToggle} onIonChange={(event: any) => props.setNwsForecast(event.detail.checked)}>NWS Forecast</IonToggle>
            <IonInput className={s.tempWxetInput} min={1} max={6} label="Days" type="number" value={props.nwsForecastDays} onIonChange={(event) => props.setNwsForecastDays(event.detail.value)}></IonInput>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopSection