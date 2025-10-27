import axios from "axios";

export const getExport = async (sensorId: string | number, chartCode: string, fromDate: string, toDate: string, userId: string | number) => {
  return await axios.get('https://app.agrinet.us/api/chart/export', {
    params: {
      sensorId: sensorId,
      chartCode,
      fromDate,
      toDate,
      userId,
      format: 'csv'
    }
  })
}