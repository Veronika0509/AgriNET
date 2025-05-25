"use client"

import {useEffect, useState} from "react"
import s from "../style.module.css"
import DateTimePicker from "./DateTimePicker"
import {IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonToggle} from "@ionic/react"
import {alarmOutline} from "ionicons/icons"

const TopSection = (props: any) => {
  const [disabledComparingMode, setDisabledComparingMode] = useState(false)
  const [disabledHistoricMode, setDisabledHistoricMode] = useState(false)

  useEffect(() => {
    if (props.type === "fuel") {
      props.locations.map((location: any) => {
        if (location.sensorId === props.sensorId) {
          props.setCurrentLocation(location)
        }
      })
    }
  }, [props.locations])

  // Battery Chart
  useEffect(() => {
    const batteryHandler = async () => {
      if (props.batteryChartShowed) {
        props.updateChart("battery")
      }
    }

    batteryHandler()
  }, [props.batteryChartShowed])

  // Soil Temperature Chart
  useEffect(() => {
    if (props.soilTempChartShowed) {
      props.updateChart("soilTemp")
    }
  }, [props.soilTempChartShowed])

  // Moist Toggle
  const onMoistToggle = (event: any, mode: string) => {
    if (mode === "comparingMode") {
      if (event.detail.checked) {
        setDisabledHistoricMode(true)
        props.setComparingMode(true)
      } else {
        setDisabledHistoricMode(false)
        props.setComparingMode(false)
      }
    } else if (mode === "historicMode") {
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
      {/* Primary Controls Row */}
      <div
        className={`${s.topSection_primaryRow} ${props.type === 'fuel' && s.topSection_fuelPrimaryRow} ${props.type === 'moist' && s.topSection_moistPrimaryRow} ${(props.type === "temp" || props.type === "wxet") && s.topSection_wxetPrimaryRow}`}>
        <div className={s.topSection_dateTimeWrapper}>
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
        {props.type === "moist" && (
          <div className={s.topSection_moistAddAlarm}>
            <div className={s.topSection_chartsSection}>
              <span className={s.topSection_sectionLabel}>Charts:</span>
              <div className={s.topSection_chartsButtons}>
                <IonButton
                  fill={props.batteryChartShowed ? "outline" : "solid"}
                  size="small"
                  className={s.topSection_chartButton}
                  onClick={() => props.setBatteryChartShowed(!props.batteryChartShowed)}
                >
                  Battery
                </IonButton>
                <IonButton
                  fill={props.soilTempChartShowed ? "outline" : "solid"}
                  size="small"
                  className={s.topSection_chartButton}
                  onClick={() => props.setSoilTempChartShowed(!props.soilTempChartShowed)}
                >
                  Soil Temp
                </IonButton>
              </div>
            </div>
            <IonButton fill="outline" className={s.topSection_addAlarm} onClick={() => props.setAlarm(true)}>
              <IonIcon slot="start" icon={alarmOutline}></IonIcon>
              Add Alarm
            </IonButton>
          </div>
        )}

        {props.type === "fuel" && (
          <div className={s.topSection_fuelSection}>
            <div className={s.topSection_fuelControls}>
              <IonToggle
                className={s.topSection_compactToggle}
                checked={props.isCommentsShowed}
                onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}
              >
                Comments
              </IonToggle>
              <IonSelect
                ref={props.locationSelectRef}
                onIonChange={(e) => props.onLocationChange(e.detail.value)}
                className={s.topSection_locationSelect}
                label="Location"
                value={props.currentLocation && props.currentLocation.name}
              >
                <IonSelectOption value="All">All</IonSelectOption>
                {props.locations &&
                  props.locations.map((location: any) => (
                    <IonSelectOption key={location.name} value={location.name}>
                      {location.name}
                    </IonSelectOption>
                  ))}
              </IonSelect>
            </div>
          </div>
        )}

        {(props.type === "temp" || props.type === "wxet") && (
          <div className={`${s.topSection_wxetAddAlarm} ${s.topSection_tempAddAlarm}`}>
            <div
              className={`${s.topSection_forecastSection} ${props.type === 'wxet' && s.topSection_wxetForecastSection} ${props.type === 'temp' && s.topSection_tempForecastSection}`}>
              <span className={s.topSection_sectionLabel}>Forecast:</span>
              <div className={s.topSection_forecastControls}>
                <IonToggle
                  className={s.topSection_compactToggle}
                  onIonChange={(event: any) => props.setNwsForecast(event.detail.checked)}
                >
                  NWS Forecast
                </IonToggle>
                <IonInput
                  className={s.topSection_daysInput}
                  min={1}
                  max={6}
                  label="Days"
                  type="number"
                  value={props.nwsForecastDays}
                  onIonChange={(event) => props.setNwsForecastDays(event.detail.value)}
                />
                {props.type === "temp" && (
                  <IonToggle
                    className={s.topSection_compactToggle}
                    checked={props.isCommentsShowed}
                    onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}
                  >
                    Comments
                  </IonToggle>
                )}
                <IonButton fill="outline" className={s.topSection_addAlarm} onClick={() => props.setAlarm(true)}>
                  <IonIcon slot="start" icon={alarmOutline}></IonIcon>
                  Add Alarm
                </IonButton>
              </div>
            </div>
          </div>
        )}
      </div>
      {props.type === "moist" && (
        <div className={s.topSection_secondaryRow}>
          <div className={s.topSection_modesSection}>
            <span className={s.topSection_sectionLabel}>Modes:</span>
            <div className={s.topSection_togglesGroup}>
              <IonToggle
                className={`${s.topSection_compactToggle} ${s.topSection_moistCompactToggle}`}
                disabled={disabledComparingMode}
                onIonChange={(event: any) => onMoistToggle(event, "comparingMode")}
              >
                Comparing
              </IonToggle>
              <IonToggle
                className={`${s.topSection_compactToggle} ${s.topSection_moistCompactToggle}`}
                disabled={disabledHistoricMode}
                onIonChange={(event: any) => onMoistToggle(event, "historicMode")}
              >
                Historical
              </IonToggle>
              <IonToggle
                className={`${s.topSection_compactToggle} ${s.topSection_moistCompactToggle}`}
                checked={props.isCommentsShowed}
                onIonChange={(event: any) => props.setIsCommentsShowed(event.detail.checked)}
              >
                Comments
              </IonToggle>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopSection
