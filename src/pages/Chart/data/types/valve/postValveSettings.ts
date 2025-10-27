import axios from "axios";

export const postValveSettings = async (updatedSettings: unknown, userId: string | number) => {
  return await axios.post('https://app.agrinet.us/api/valve/settings?virtual=false', updatedSettings, {
    headers: {
      "User": userId.toString()
    }
  })
}