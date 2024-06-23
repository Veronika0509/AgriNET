import axios from "axios";

export const wxetMainChartDataRequest = async (sensorId: any, daysProp?: any, endDateProp?: any) => {
  if (daysProp && endDateProp) {
    return await axios.get('https://app.agrinet.us/api/chart/weather-station?v=43', {
      params: {
        sensorId: sensorId,
        days: daysProp,
        endDate: endDateProp
      },
    });
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/weather-station?v=43', {
      params: {
        sensorId: sensorId,
        days: 14,
      },
    });
  }
}