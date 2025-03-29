import {formatDate} from "../../../../../../Chart/functions/formatDate";
import {getSumChartData} from "../../../../../../Chart/data/types/moist/getSumChartData";

export const getNewData = async (
  currentAmountOfDays: any,
  currentSensorId: any,
  setChartData: any,
  setDataExists: any,
  sensorId?: any
) => {
  let sumData: any;
  const date = new Date()
  date.setDate(date.getDate() + 1);
  const endDate = formatDate(new Date())
  if (sensorId) {
    sumData = await getSumChartData(sensorId, false, currentAmountOfDays, endDate)
  } else {
    sumData = await getSumChartData(currentSensorId, false, currentAmountOfDays, endDate)
  }
  setChartData(sumData.data)
  setDataExists(sumData.data.data.length > 0)
}