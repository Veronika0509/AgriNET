import React, {useEffect} from 'react'
import s from "../types/moist/style.module.css";
import DateTimePicker from "../DateTimePicker";
import {IonButton} from "@ionic/react";
import {moistDataBatteryRequest} from "../../data/types/moist/moistDataBatteryRequest";
import {createMoistBatteryChart} from "../../functions/types/moist/createMoistBatteryChart";

const TopSection = (props: any) => {
  const onBatteryButtonClick = () => {
    props.setBatteryChartShowed(!props.batteryChartShowed)
  }

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

  return (
    <div className={s.topSection}>
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
        <IonButton
          className='ion-margin-start'
          onClick={onBatteryButtonClick}
        >battery</IonButton>
      )}
    </div>
  )
}

export default TopSection