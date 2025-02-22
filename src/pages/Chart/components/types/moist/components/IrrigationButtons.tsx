import React from 'react'
import s from "../style.module.css";
import {IonButton, IonText} from "@ionic/react";
import {onIrrigationButtonClick} from "../../../../functions/types/moist/onIrrigationButtonClick";

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
                         onClick={() => onIrrigationButtonClick(
                           0,
                           props.currentChartData,
                           props.irrigationDates,
                           props.setStartDate,
                           props.setEndDate,
                           props.setDateDifferenceInDays,
                           props.setCurrentDates,
                           props.fullDatesArray,
                           props.setDisableNextButton,
                           props.setDisablePrevButton,
                           props.setShowForecast,
                           props.updateChart
                         )}>Prev Irigation Event</IonButton>
              <IonButton disabled={props.disableNextButton}
                         onClick={() => onIrrigationButtonClick(
                           1,
                           props.currentChartData,
                           props.irrigationDates,
                           props.setStartDate,
                           props.setEndDate,
                           props.setDateDifferenceInDays,
                           props.setCurrentDates,
                           props.fullDatesArray,
                           props.setDisableNextButton,
                           props.setDisablePrevButton,
                           props.setShowForecast,
                           props.updateChart
                         )}>Next Irigation Event</IonButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IrrigationButtons