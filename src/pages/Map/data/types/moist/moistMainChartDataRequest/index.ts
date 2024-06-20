import axios from "axios";

export const moistMainChartDataRequest = async (sensorId: any, daysProp?: any, endDateProp?: any) => {
  if (daysProp && endDateProp) {
    return await axios.get('https://app.agrinet.us/api/chart/m?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProp,
        endDate: endDateProp
      },
    });
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/m?v=43', {
      params: {
        sensorId: sensorId,
        days: 14,
      },
    });
  }
};