import axios from "axios";

export const getTabularData = async (
  sensorId: string,
  chartCode: string
) => {
  return await axios.get('https://app.agrinet.us/api/chart/tabular-data?v=43', {
    params: {
      sensorId,
      chartCode,
      shortDataSet: false
    }
  })
}