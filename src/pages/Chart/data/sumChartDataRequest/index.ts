import axios from "axios";
import {createMoistSumChart} from "../../functions/types/moist/createMoistSumChart";

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
    createMoistSumChart(response.data.data, response.data.budgetLines, sumRoot)
  })
}