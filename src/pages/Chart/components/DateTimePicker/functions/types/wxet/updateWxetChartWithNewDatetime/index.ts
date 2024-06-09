import {getWxetChartData} from "../../../../../../../Map/data/types/wxet/getWxetChartData";
import axios from "axios";
import {checkDateValidity} from "../../../checkDateValidity";
import {updateWxetChart} from "../../../../../../functions/types/wxet/updateWxetChart";

export const updateWxetChartWithNewDatetime = (
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
    new Promise((resolve: any) => {
      const response = axios.get('https://app.agrinet.us/api/chart/weather-station?v=43', {
        params: {
          sensorId: sensorId,
          days: days,
          endDate: endDateDays,
          includeHistoricalData: false
        },
      })
      resolve(response)
    }).then((response: any) => {
      updateWxetChart(response.data.data, root, isMobile, additionalChartData)
      setCurrentChartData(response.data.data)
    })
  }
}