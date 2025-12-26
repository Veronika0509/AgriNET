import axios from "axios";

export const getValveData = async (sensorId: string, userId: string | number) => {
  return await axios.get('https://app.agrinet.us/api/valve/scheduler?v=43', {
    params: {
      sensorId: sensorId,
      userId: userId
    },
  });
};