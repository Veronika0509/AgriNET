import s from "../style.module.css";
import {IonButton} from "@ionic/react";
import {onIrrigationButtonClick} from "../../../../functions/types/moist/onIrrigationButtonClick";
import { TimeSeriesDataItem } from "../../../../../../types/api";

interface IrrigationButtonsProps {
  isIrrigationDataIsLoading: boolean;
  isIrrigationButtons: boolean;
  disablePrevButton: boolean;
  disableNextButton: boolean;
  currentChartData: TimeSeriesDataItem[];
  irrigationDates: string[];
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setDateDifferenceInDays: (days: number) => void;
  setCurrentDates: (dates: [number, string]) => void;
  setShowForecast: (show: boolean) => void;
  updateChartsWithDates: (params: {days?: number; newEndDateFormatted?: string; endDatetime?: number}) => void;
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