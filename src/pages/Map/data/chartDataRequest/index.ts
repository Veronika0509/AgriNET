import axios from "axios";

export const chartDataRequest = async (SensorIdProp: string) => {
  try {
    return axios.get('https://app.agrinet.us/api/chart/m', {
      params: {
        sensorId: SensorIdProp,
        days: 14,
      },
    });
  } catch (error) {
    console.log('Something went wrong ', error);
  }
};