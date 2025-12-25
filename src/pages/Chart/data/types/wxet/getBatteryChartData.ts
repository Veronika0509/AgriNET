import axios from "axios";

export const getBatteryChartData = async (sensorId: string | number, daysProps?: number, endDate?: string) => {
  if (daysProps && endDate) {
    return await axios.get('https://app.agrinet.us/api/chart/weather-station-battery?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProps,
        endDate: endDate
      }
    })
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/weather-station-battery?v=43', {
      params: {
        sensorId: sensorId,
        days: 14
      }
    })
  }
}