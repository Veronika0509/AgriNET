import axios from "axios";

export const getValvetData = async (sensorId: any, userId: any) => {
  return await axios.get('https://app.agrinet.us/api/valve/scheduler?v=43', {
    params: {
      sensorId: sensorId,
      userId: userId
    },
  });
};