import axios from "axios";

export const getComments = async (chartType: string, sensorId: string, days: number) => {
  return await axios.get('https://app.agrinet.us/api/chart/comments?v=43', {
    params: {
      chartId: `${chartType}-${sensorId}`,
      days
    }
  })
}