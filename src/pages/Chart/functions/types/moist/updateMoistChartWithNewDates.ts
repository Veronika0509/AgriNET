import {formatDate} from "../../formatDate";
import {compareDates} from "./compareDates";

export const updateMoistChartWithNewDates = (
  newStartDate: any,
  newEndDate: any,
  setCurrentDates: any,
  fullDatesArray: any,
  setDisableNextButton: any,
  setDisablePrevButton: any,
  setShowForecast: any,
  updateChart: any
) => {
  const startDatetime = new Date(new Date(newStartDate).setHours(0, 0, 0, 0)).getTime()
  const endDatetime = new Date(new Date(newEndDate).setHours(0, 0, 0, 0)).getTime()
  const endDateFormatted = formatDate(new Date(endDatetime))
  const days = Math.floor(Math.abs(endDatetime - startDatetime) / (1000 * 60 * 60 * 24))
  setCurrentDates([days, endDateFormatted])
  if (endDatetime < new Date(new Date(fullDatesArray[fullDatesArray.length - 1]).setHours(0, 0, 0, 0)).getTime()) {
    setDisableNextButton(false)
  }
  if (endDatetime >= new Date(new Date(fullDatesArray[fullDatesArray.length - 1]).setHours(0, 0, 0, 0)).getTime()) {
    setDisableNextButton(true)
  }
  if (startDatetime < new Date(new Date(fullDatesArray[0]).setHours(0, 0, 0, 0)).getTime()) {
    setDisablePrevButton(true)
  }
  if (startDatetime >= new Date(new Date(fullDatesArray[0]).setHours(0, 0, 0, 0)).getTime()) {
    setDisablePrevButton(false)
  }
  if (endDatetime) {
    setShowForecast(compareDates(endDatetime))
  }
  const newEndDateFormatted = formatDate(new Date(new Date(endDateFormatted).getTime() + 1000 * 60 * 60 * 24))
  updateChart('main', 'dates', days, newEndDateFormatted, endDatetime)
  updateChart('sum', 'dates', days, newEndDateFormatted, endDatetime)
  updateChart('soilTemp', 'dates', days, newEndDateFormatted, endDatetime)
  updateChart('battery', 'dates', days, newEndDateFormatted, endDatetime)
}