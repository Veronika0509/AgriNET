import axios from "axios";
import {createSumChart} from "../../functions/createSumChart";

export const sumChartDataRequest = (sensorId: any, sumRoot: any) => {
  new Promise((resolve) => {
    const response: any = axios.get('https://app.agrinet.us/api/chart/m-sum', {
      params: {
        sensorId: sensorId,
        days: 14,
        includeHistoricalData: false
      },
    })
    resolve(response)
  }).then((response: any) => {
    createSumChart(response.data.data, response.data.budgetLines, sumRoot)
  })
}