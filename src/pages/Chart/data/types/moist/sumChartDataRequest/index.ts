import axios from "axios";

export const moistSumChartDataRequest = async (sensorId: any, daysProps?: any, endDate?: any) => {
  if (daysProps && endDate) {
    return await axios.get('https://app.agrinet.us/api/chart/m-sum?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProps,
        endDate: endDate,
        includeHistoricalData: false
      }
    })
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/m-sum?v=43', {
      params: {
        sensorId: sensorId,
        days: 14,
        includeHistoricalData: false
      }
    })
  }
}