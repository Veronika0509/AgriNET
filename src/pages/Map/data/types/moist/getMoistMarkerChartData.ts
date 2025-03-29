import axios from "axios";

export const getMoistMarkerChartData = async (sensorId: any, userId: any) => {
  return await axios.get('https://app.agrinet.us/api/map/moist-fuel?v=43', {
    params: {
      sensorId: sensorId,
      cacheFirst: true,
      'do-not-catch-error': '',
      user: userId,
    },
  })
}