import axios from "axios";

export const getValveArchiveData = async (sensorId: string | number, page: number) => {
  return await axios.get('https://app.agrinet.us/api/valve/scheduler/archive?v=43', {
    params: {
      from: page,
      sensorId
    }
  })
}