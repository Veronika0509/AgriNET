import axios from "axios";

export const deleteValveRecord = async (id: number, userId: any) => {
  return await axios.get(`https://app.agrinet.us/api/valve/scheduler/${id}/remove?v=43`, {
    params: {
      userId
    }
  })
}