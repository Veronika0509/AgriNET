import {formatDate} from "../../Chart/functions/formatDate";
import {getSumChartData} from "../../Chart/data/types/moist/getSumChartData";

export const getNewData = async (
  currentAmountOfDays: number,
  currentSensorId: string | undefined,
  setChartData: (data: unknown) => void,
  setDataExists: (exists: boolean) => void,
  sensorId?: string
) => {
  let sumData: any;
  const date = new Date()
  date.setDate(date.getDate() + 1);
  const endDate = formatDate(new Date())
  if (sensorId) {
    sumData = await getSumChartData(sensorId, false, currentAmountOfDays, endDate)
  } else if (currentSensorId) {
    sumData = await getSumChartData(currentSensorId, false, currentAmountOfDays, endDate)
  } else {
    return; // Early return if no sensorId available
  }
  setChartData(sumData.data)
  setDataExists(sumData.data.data.length > 0)
}