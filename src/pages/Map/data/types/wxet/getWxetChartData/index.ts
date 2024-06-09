import axios from "axios";

export const getWxetChartData = (SensorIdProp: any, userId: any) => {
  try {
    return axios.get(`https://app.agrinet.us/api/chart/weather-station?v=43`, {
      params: {
        sensorId: SensorIdProp,
        days: 14
      },
    });
  } catch (error) {
    console.log('Something went wrong ', error);
  }
}