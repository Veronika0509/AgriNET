import axios from "axios";

export const getSumChartData = async (sensorId: string | number, historicMode: boolean, daysProps?: number, endDate?: string) => {
  if (daysProps && endDate) {
    return await axios.get('https://app.agrinet.us/api/chart/m-sum?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProps,
        endDate: endDate,
        includeHistoricalData: historicMode,
        nocache: Date.now()
      }
    })
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/m-sum?v=43', {
      params: {
        sensorId: sensorId,
        days: 14,
        includeHistoricalData: historicMode,
        nocache: Date.now()
      }
    })
  }
}