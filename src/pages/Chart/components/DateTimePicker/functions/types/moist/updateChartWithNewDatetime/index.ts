import {checkDateValidity} from "../../../checkDateValidity";
import axios from "axios";
import {updateMoistChart} from "../../../../../../functions/types/moist/updateMoistChart";

export const updateChartWithNewDatetime = (startDate: any, endDate: any, presentToast: any, sensorId: string, root: any, isMobile: any, fullDatesRequest: any, setCurrentChartData: any, setDisableNextButton: any, setDisablePrevButton: any, additionalChartData: any) => {
  if (checkDateValidity(startDate, endDate)) {
    presentToast()
  } else {
    const endDateDays = endDate.slice(0, 10)
    const startDatetime = new Date(startDate).getTime()
    const endDatetime = new Date(endDate).getTime()
    const days = Math.round((endDatetime - startDatetime) / 86400000)
    if (endDatetime < new Date(fullDatesRequest[0]).getTime()) {
      setDisableNextButton(false)
    }
    if (endDatetime >= new Date(fullDatesRequest[0]).getTime()) {
      setDisableNextButton(true)
    }
    if (startDatetime < new Date(fullDatesRequest[fullDatesRequest.length - 1]).getTime()) {
      setDisablePrevButton(true)
    }
    if (startDatetime >= new Date(fullDatesRequest[fullDatesRequest.length - 1]).getTime()) {
      setDisablePrevButton(false)
    }
    new Promise((resolve: any) => {
      const response = axios.get('https://app.agrinet.us/api/chart/m', {
        params: {
          sensorId: sensorId,
          days: days,
          endDate: endDateDays,
          includeHistoricalData: false,
          v: 43
        },
      })
      resolve(response)
    }).then((response: any) => {
      updateMoistChart(response.data.data, root, isMobile, fullDatesRequest, additionalChartData)
      setCurrentChartData(response.data.data)
    })
  }
}