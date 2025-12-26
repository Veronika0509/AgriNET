import axios from "axios";

export const getValveConfig = async (sensorId: string) => {
  return await axios.get(`https://app.agrinet.us/api/valve/config/${sensorId}?v=43`);
};