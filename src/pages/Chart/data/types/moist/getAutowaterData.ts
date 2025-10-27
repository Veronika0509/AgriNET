import axios from "axios";

export const getAutowaterData = async (sensorId: string | number) => {
  return await axios.get(`https://app.agrinet.us/api/autowater/${sensorId}`)
}