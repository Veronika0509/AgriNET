import axios from "axios";

export const setValveNowTime = async (id: any, timezone: any, userId: any) => {
  return await axios.get(`https://app.agrinet.us/api/valve/scheduler/${id}/set-now?v=43`, {
    params: {
      timezone,
      userId
    }
  })
}