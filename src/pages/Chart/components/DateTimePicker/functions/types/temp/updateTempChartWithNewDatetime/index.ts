import {checkDateValidity} from "../../../checkDateValidity";
import {tempMainChartDataRequest} from "../../../../../../../Map/data/types/temp/tempMainChartDataRequest";
import {createTempChart} from "../../../../../../functions/types/temp/createTempChart";

export const updateTempChartWithNewDatetime = async (
  startDate: any,
  endDate: any,
  presentToast: any,
  sensorId: any,
  root: any,
  isMobile: any,
  setCurrentChartData: any,
  additionalChartData: any,
  userId: any,
  present: any
) => {
  if (checkDateValidity(startDate, endDate)) {
    presentToast()
  } else {
    const endDateDays = endDate.slice(0, 10)
    const startDatetime = new Date(startDate).getTime()
    const endDatetime = new Date(endDate).getTime()
    const days = Math.round((endDatetime - startDatetime) / 86400000)
    const newChartData: any = await tempMainChartDataRequest(present, sensorId, userId, days, endDateDays)
    createTempChart(newChartData.data.data, root, isMobile, additionalChartData)
    setCurrentChartData(newChartData.data.data)
  }
}