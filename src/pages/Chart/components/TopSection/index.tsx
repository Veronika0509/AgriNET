import React from 'react'
import s from "../../style.module.css";
import DateTimePicker from "../DateTimePicker";

const TopSection = (props: any) => {
  return (
    <div className={s.topSection}>
      <DateTimePicker sensorId={props.sensorId} root={props.root} isMobile={props.isMobile}
                      fullDatesArray={props.fullDatesArray} setCurrentChartData={props.setCurrentChartData}
                      setDisableNextButton={props.setDisableNextButton}
                      setDisablePrevButton={props.setDisablePrevButton} endDate={props.endDate}
                      startDate={props.startDate}
                      setEndDate={props.setEndDate} setStartDate={props.setStartDate} linesCount={props.linesCount}/>
    </div>
  )
}

export default TopSection