import {formatDate} from "../../formatDate";
import {compareDates} from "./compareDates";

export const updateMoistChartWithNewDates = (
  newStartDate: any,
  newEndDate: any,
  setCurrentDates: any,
  setShowForecast: any,
  updateChartsWithDates: any
) => {
  const startDatetime = new Date(new Date(newStartDate).setHours(0, 0, 0, 0)).getTime()
  const endDatetime = new Date(new Date(newEndDate).setHours(0, 0, 0, 0)).getTime()
  const endDateFormatted = formatDate(new Date(endDatetime))
  const days = Math.floor(Math.abs(endDatetime - startDatetime) / (1000 * 60 * 60 * 24))
  setCurrentDates([days, endDateFormatted])
  if (endDatetime) {
    setShowForecast(compareDates(endDatetime))
  }
  const dateParts: any = endDateFormatted.split('-');
  const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  date.setDate(date.getDate() + 1);
  const newEndDateFormatted = formatDate(date);
  updateChartsWithDates({
    days,
    newEndDateFormatted,
    endDatetime
  })
}