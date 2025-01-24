import axios from "axios";

export const getAutowaterData = async (sensorId: any) => {
  return await axios.get(`https://app.agrinet.us/api/autowater/${sensorId}`)
}