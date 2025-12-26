import axios from "axios";

export const getValveSettingsData = async (sensorId: string) => {
  return await axios.get('https://app.agrinet.us/api/valve/settings?v=43', {
    params: {
      sensorId
    }
  })
}