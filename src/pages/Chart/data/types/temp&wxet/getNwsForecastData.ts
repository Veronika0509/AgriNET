import axios from "axios";

export const getNwsForecastData = async (sensorId: string, userId: string | number, days: number) => {
  return await axios.get('https://app.agrinet.us/api/chart/forecast', {
    headers: {
      'user': userId
    },
    params: {
      sensorId: sensorId,
      days: days,
      providers: 'NWS'
    }
  })
}