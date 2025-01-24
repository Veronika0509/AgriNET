import axios from "axios";

export const postValveSettings = async (updatedSettings: any, userId: any) => {
  return await axios.post('https://app.agrinet.us/api/valve/settings?virtual=false', updatedSettings, {
    headers: {
      "User": userId.toString()
    }
  })
}