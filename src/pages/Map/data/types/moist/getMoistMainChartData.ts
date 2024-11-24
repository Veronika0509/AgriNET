import axios from "axios";

export const getMoistMainChartData = async (sensorId: any, isHistoricData: boolean, daysProp?: any, endDateProp?: any) => {
  if (daysProp && endDateProp) {
    return await axios.get('https://app.agrinet.us/api/chart/m?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProp,
        endDate: endDateProp,
        includeHistoricalData: isHistoricData
      },
    });
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/m?v=43', {
      params: {
        sensorId: sensorId,
        days: 14,
        includeHistoricalData: isHistoricData
      },
    });
  }
};