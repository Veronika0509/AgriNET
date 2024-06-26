import axios from "axios";
import {checkDateValidity} from "../../../checkDateValidity";
import {createWxetChart} from "../../../../../../functions/types/wxet/createWxetChart";
import {wxetMainChartDataRequest} from "../../../../../../../Map/data/types/wxet/wxetMainChartDataRequest";

export const updateWxetChartWithNewDatetime = async (
  startDate: any,
  endDate: any,
  presentToast: any,
  sensorId: any,
  root: any,
  isMobile: any,
  setCurrentChartData: any,
  additionalChartData: any
) => {
  if (checkDateValidity(startDate, endDate)) {
    presentToast()
  } else {
    const endDateDays = endDate.slice(0, 10)
    const startDatetime = new Date(startDate).getTime()
    const endDatetime = new Date(endDate).getTime()
    const days = Math.round((endDatetime - startDatetime) / 86400000)
    const newChartData = await wxetMainChartDataRequest(sensorId, days, endDateDays)
    createWxetChart(newChartData.data.data, root, isMobile, additionalChartData)
    setCurrentChartData(newChartData.data.data)
  }
}