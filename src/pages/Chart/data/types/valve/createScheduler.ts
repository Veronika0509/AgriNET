import axios from "axios";

export const createScheduler = async (data: any, userId: any) => {
  console.log(data)
  return await axios.post('https://app.agrinet.us/api/valve/scheduler?v=43', data, {
    headers: {
      "User": userId.toString()
    }
  })
}