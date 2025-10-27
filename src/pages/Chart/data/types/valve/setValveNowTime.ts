import axios from "axios";

export const setValveNowTime = async (id: string | number, timezone: string, userId: string | number) => {
  return await axios.get(`https://app.agrinet.us/api/valve/scheduler/${id}/set-now?v=43`, {
    params: {
      timezone,
      userId
    }
  })
}