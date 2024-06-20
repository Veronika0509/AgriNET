import axios from "axios";

export const moistDataBatteryRequest = async (sensorId: any, daysProps?: any, endDate?: any) => {
  if (daysProps && endDate) {
    return await axios.get('https://app.agrinet.us/api/chart/moisture-battery?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProps,
        endDate: endDate
      }
    })
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/moisture-battery?v=43', {
      params: {
        sensorId: sensorId,
        days: 14
      }
    })
  }
}