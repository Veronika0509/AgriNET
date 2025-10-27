import {formatDate} from "../../formatDate";
import {compareDates} from "./compareDates";

interface UpdateChartsParams {
  days: number;
  newEndDateFormatted: string;
  endDatetime: number;
}

type SetterFunction<T> = (value: T) => void;

export const updateMoistChartWithNewDates = (
  newStartDate: string | Date,
  newEndDate: string | Date,
  setCurrentDates: SetterFunction<[number, string]>,
  setShowForecast: SetterFunction<boolean>,
  updateChartsWithDates: (params: UpdateChartsParams) => void
): void => {
  const startDatetime = new Date(new Date(newStartDate).setHours(0, 0, 0, 0)).getTime()
  const endDatetime = new Date(new Date(newEndDate).setHours(0, 0, 0, 0)).getTime()
  const endDateFormatted = formatDate(new Date(endDatetime))
  const days = Math.floor(Math.abs(endDatetime - startDatetime) / (1000 * 60 * 60 * 24))
  setCurrentDates([days, endDateFormatted])
  if (endDatetime) {
    setShowForecast(compareDates(endDatetime))
  }
  const dateParts: string[] = endDateFormatted.split('-');
  const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  date.setDate(date.getDate() + 1);
  const newEndDateFormatted = formatDate(date);
  updateChartsWithDates({
    days,
    newEndDateFormatted,
    endDatetime
  })
}