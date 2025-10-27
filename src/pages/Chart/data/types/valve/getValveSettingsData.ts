import axios from "axios";

export const getValveSettingsData = async (sensorId: string | number) => {
  return await axios.get('https://app.agrinet.us/api/valve/settings?v=43', {
    params: {
      sensorId
    }
  })
}