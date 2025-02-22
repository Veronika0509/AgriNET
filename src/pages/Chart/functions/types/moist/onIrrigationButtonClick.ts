import {getDatetime} from "../../../components/DateTimePicker/functions/getDatetime";
import {updateChartWithNewDates} from "./updateChartWithNewDates";

export const onIrrigationButtonClick = async (
  buttonProps: number,
  currentChartData: any,
  irrigationDates: any,
  setStartDate: any,
  setEndDate: any,
  setDateDifferenceInDays: any,
  setCurrentDates: any,
  fullDatesArray: any,
  setDisableNextButton: any,
  setDisablePrevButton: any,
  setShowForecast: any,
  updateChart: any
) => {
  let currentDate: any

  if (buttonProps === 1) {
    currentDate = currentChartData[currentChartData.length - 1].DateTime.substring(0, 10)
  } else {
    currentDate = currentChartData[0].DateTime.substring(0, 10)
  }

  function findNearestDate(currentDate: string, dateList: string[]) {
    const currentDateObj = new Date(currentDate);
    const dateObjects = dateList.map(date => new Date(date));
    const validDates = dateObjects.filter(buttonProps === 1 ? date => date > currentDateObj : dateObj => dateObj <= currentDateObj);
    if (buttonProps === 1) {
      const closestDate = new Date(Math.min(...validDates.map(date => date.getTime())));
      closestDate.setDate(closestDate.getDate() + 7);
      return getDatetime(closestDate).split('T')[0];
    } else {
      const nearestDateObj = new Date(Math.max.apply(null, validDates.map(date => date.getTime())));
      nearestDateObj.setDate(nearestDateObj.getDate() + 7);
      return getDatetime(nearestDateObj).split('T')[0];
    }
  }

  const endDateTimeDefault = new Date(findNearestDate(currentDate, irrigationDates))
  const endDatetime = getDatetime(new Date(endDateTimeDefault.setDate(endDateTimeDefault.getDate() - 1)))
  setEndDate(endDatetime)

  const startDatetimeDefault = new Date(endDatetime)
  const startDatetime = getDatetime(new Date(startDatetimeDefault.setDate(startDatetimeDefault.getDate() - 14)))
  setStartDate(startDatetime)

  setDateDifferenceInDays('14')
  updateChartWithNewDates(startDatetime, endDatetime, setCurrentDates, fullDatesArray, setDisableNextButton, setDisablePrevButton, setShowForecast, updateChart)
}