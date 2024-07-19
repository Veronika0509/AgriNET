import axios from "axios";

export const getAlarmData = async (sensorId: any) => {
  return await axios.get('https://app.agrinet.us/api/alarm?v=43', {
    params: {
      sensorId: sensorId
    }
  })
}