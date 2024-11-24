import axios from "axios";

export const getExport = async (sensorId: any, chartCode: any, fromDate: string, toDate: string, userId: any) => {
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