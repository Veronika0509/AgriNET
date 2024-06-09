import React from 'react'
import s from "../style.module.css";
import {IonButton, IonText} from "@ionic/react";
import {onIrrigationButtonClick} from "../../../../functions/types/moist/onIrrigationButtonClick";
import {updateMoistChart} from "../../../../functions/types/moist/updateMoistChart";

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
                           props.setDisableNextButton,
                           props.setDisablePrevButton,
                           props.disableNextButton,
                           props.disablePrevButton,
                           props.siteId,
                           props.userId,
                           props.setCurrentChartData,
                           updateMoistChart,
                           props.root,
                           props.isMobile,
                           props.fullDatesArray,
                           props.setStartDate,
                           props.setEndDate,
                           props.additionalChartData
                         )}>Prev Irigation Event</IonButton>
              <IonButton disabled={props.disableNextButton}
                         onClick={() => onIrrigationButtonClick(
                           1,
                           props.currentChartData,
                           props.irrigationDates,
                           props.setDisableNextButton,
                           props.setDisablePrevButton,
                           props.disableNextButton,
                           props.disablePrevButton,
                           props.siteId,
                           props.userId,
                           props.setCurrentChartData,
                           updateMoistChart,
                           props.root,
                           props.isMobile,
                           props.fullDatesArray,
                           props.setStartDate,
                           props.setEndDate,
                           props.additionalChartData
                         )}>Next Irigation Event</IonButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IrrigationButtons