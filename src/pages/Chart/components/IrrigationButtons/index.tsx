import React from 'react'
import s from "../../style.module.css";
import {IonButton, IonText} from "@ionic/react";
import {onIrrigationButtonClick} from "../../functions/onIrrigationButtonClick";
import {updateChart} from "../../functions/updateChart";

const IrrigationButtons = (props: any) => {
  return (
    <div>
      {props.isIrrigationDataIsLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {props.isIrrigationButtons && (
            <div className={s.buttons}>
              <IonButton disabled={props.disablePrevButton}
                         onClick={() => onIrrigationButtonClick(0, props.currentChartData, props.irrigationDates, props.setDisableNextButton, props.setDisablePrevButton, props.disableNextButton, props.disablePrevButton, props.siteId, props.userId, props.setCurrentChartData, updateChart, props.root, props.isMobile, props.fullDatesArray, props.setStartDate, props.setEndDate)}>Prev Irigation Event</IonButton>
              <IonButton disabled={props.disableNextButton}
                         onClick={() => onIrrigationButtonClick(1, props.currentChartData, props.irrigationDates, props.setDisableNextButton, props.setDisablePrevButton, props.disableNextButton, props.disablePrevButton, props.siteId, props.userId, props.setCurrentChartData, updateChart, props.root, props.isMobile, props.fullDatesArray, props.setStartDate, props.setEndDate)}>Next Irigation Event</IonButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IrrigationButtons