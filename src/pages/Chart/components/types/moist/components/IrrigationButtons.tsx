import React from 'react'
import s from "../style.module.css";
import {IonButton, IonText} from "@ionic/react";
import {onIrrigationButtonClick} from "../../../../functions/types/moist/onIrrigationButtonClick";

interface IrrigationButtonsProps {
  isIrrigationDataIsLoading: boolean;
  isIrrigationButtons: boolean;
  disablePrevButton: boolean;
  disableNextButton: boolean;
  currentChartData: unknown;
  irrigationDates: unknown;
  setStartDate: (date: unknown) => void;
  setEndDate: (date: unknown) => void;
  setDateDifferenceInDays: (days: number) => void;
  setCurrentDates: (dates: unknown) => void;
  setShowForecast: (show: boolean) => void;
  updateChartsWithDates: (params: unknown) => void;
}

const IrrigationButtons = (props: IrrigationButtonsProps) => {
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
                           props.setShowForecast,
                           props.updateChartsWithDates
                         )}>Prev Irrigation Event</IonButton>
              <IonButton disabled={props.disableNextButton}
                         onClick={() => onIrrigationButtonClick(
                           1,
                           props.currentChartData,
                           props.irrigationDates,
                           props.setStartDate,
                           props.setEndDate,
                           props.setDateDifferenceInDays,
                           props.setCurrentDates,
                           props.setShowForecast,
                           props.updateChartsWithDates
                         )}>Next Irrigation Event</IonButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IrrigationButtons