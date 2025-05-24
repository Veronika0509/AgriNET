import React, {useEffect, useState} from 'react'
import s from "../style.module.css";
import DateTimePicker from "./DateTimePicker";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToggle
} from "@ionic/react";
import {getBatteryChartData} from "../data/types/moist/getBatteryChartData";
import { alarmOutline } from 'ionicons/icons';
import {getSoilTempChartData} from "../data/types/moist/getSoilTempChartData";
import {createAdditionalChart} from "../functions/types/moist/createAdditionalChart";
import {getComments} from "./AddComment/data/getComments";

const TopSection = (props: any) => {
  const [disabledComparingMode, setDisabledComparingMode] = useState(false)
  const [disabledHistoricMode, setDisabledHistoricMode] = useState(false)

  useEffect(() => {
    if (props.type === 'fuel') {
      props.locations.map((location: any) => {
        if (location.sensorId === props.sensorId) {
          props.setCurrentLocation(location)
        }
      })
    }
  }, [props.locations]);

  // Battery Chart
  useEffect( () => {
    const batteryHandler = async () => {
      if (props.batteryChartShowed) {
        props.updateChart('battery')
      }
    }

    batteryHandler()
  }, [props.batteryChartShowed]);

  // Soil Temperature Chart
  useEffect( () => {
    if (props.soilTempChartShowed) {
      props.updateChart('soilTemp')
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
        <IonItem className={s.topSection_timeItem}>
          <div>
            <DateTimePicker
              sensorId={props.sensorId}
              root={props.root}
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
              dateDifferenceInDays={props.dateDifferenceInDays}
              setDateDifferenceInDays={props.setDateDifferenceInDays}
              updateChart={props.setNewDaysData}
              setShowForecast={props.setShowForecast}
            />
          </div>
        </IonItem>
        <IonButton fill="outline" className={s.topSection_addAlarm} onClick={() => props.setAlarm(true)}>
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
            {props.type === 'temp' && <IonToggle className={`${s.topSection_tempWxetToggle} ${s.topSection_tempWxetToggleLeft}`} checked={props.isCommentsShowed} onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}>Comments</IonToggle>}
            <IonInput className={s.topSection_tempWxetInput} min={1} max={6} label="Days" type="number" value={props.nwsForecastDays} onIonChange={(event) => props.setNwsForecastDays(event.detail.value)}></IonInput>
          </div>
        )}
        {props.type === 'fuel' && (
          <>
            <IonItem className={s.topSection_fuelToggleWrapper}>
              <IonToggle className={s.topSection_fuelToggle} checked={props.isCommentsShowed} onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}>Comments</IonToggle>
            </IonItem>
            <IonItem className={s.topSection_fuelLocation}>
              <IonSelect ref={props.locationSelectRef} onIonChange={(e) => props.onLocationChange(e.detail.value)} className={s.topSection_fuelLocationSelect} label="Location" value={props.currentLocation && props.currentLocation.name}>
                <IonSelectOption value="All">All</IonSelectOption>
                {props.locations && props.locations.map((location: any) => (
                  <IonSelectOption key={location.name} value={location.name}>{location.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </>
        )}
      </div>
    </div>
  )
}

export default TopSection