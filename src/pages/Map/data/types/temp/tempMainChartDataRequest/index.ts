import axios from "axios";

export const tempMainChartDataRequest = async (sensorId: any, daysProp?: any, endDateProp?: any) => {
  if (daysProp && endDateProp) {
    return await axios.get('https://app.agrinet.us/api/chart/temp?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProp,
        endDate: endDateProp
      },
    });
  } else {
    return await axios.get(`https://app.agrinet.us/api/map/temp-data-v2?v=43`, {
      params: {
        sensorId: sensorId,
        days: 14
      }
    });
  }
};