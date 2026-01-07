import {getDatetime} from "../../../components/DateTimePicker/functions/getDatetime";
import {updateMoistChartWithNewDates} from "./updateMoistChartWithNewDates";
import {getCurrentDatetime} from "../../../components/DateTimePicker/functions/getCurrentDatetime";
import { TimeSeriesDataItem } from "../../../../../types/api";

// Интерфейсы для данных графика
type ChartDataItem = TimeSeriesDataItem;

export const onIrrigationButtonClick = async (
  buttonProps: number,
  currentChartData: ChartDataItem[],
  irrigationDates: string[],
  setStartDate: (value: string) => void,
  setEndDate: (value: string) => void,
  setDateDifferenceInDays: (value: number) => void,
  setCurrentDates: (value: [number, string]) => void,
  setShowForecast: (value: boolean) => void,
  updateChartsWithDates: (params: {days?: number; newEndDateFormatted?: string; endDatetime?: number}) => void,
): Promise<void> => {
  let currentDate: string
  if (buttonProps === 1) {
    if (!currentChartData[currentChartData.length - 1]['MS 1']) {
      const lastIndex = currentChartData.findIndex((dataItem: ChartDataItem) => dataItem['MS 1'] === undefined)
      currentDate = currentChartData[lastIndex - 1].DateTime.substring(0, 10)
    } else {
      currentDate = currentChartData[currentChartData.length - 1].DateTime.substring(0, 10)
    }
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
  let endDatetime = getDatetime(new Date(endDateTimeDefault.setDate(endDateTimeDefault.getDate() - 1)))
  if (new Date(endDatetime).getTime() > new Date().getTime()) {
    setEndDate(getCurrentDatetime())
    endDatetime = getCurrentDatetime()
  } else {
    setEndDate(endDatetime)
  }

  const startDatetimeDefault = new Date(endDatetime)
  const startDatetime = getDatetime(new Date(startDatetimeDefault.setDate(startDatetimeDefault.getDate() - 14)))
  setStartDate(startDatetime)

  setDateDifferenceInDays(14)
  updateMoistChartWithNewDates(startDatetime, endDatetime, setCurrentDates, setShowForecast, updateChartsWithDates)
}