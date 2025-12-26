import axios from "axios";
import {formatDate} from "../../../../Chart/functions/formatDate";

export const getFuelMainChartData = async (sensorId: string, daysProp?: number, endDateProp?: string) => {
  if (daysProp && endDateProp) {
    const endDatetime = new Date(daysProp).setHours(0, 0, 0, 0)
    const days = (endDatetime - new Date(endDateProp).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000)
    if (endDatetime === new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
      return await axios.get('https://app.agrinet.us/api/chart/single?v=43', {
        params: {
          sensorId: sensorId,
          days: days,
        },
      });
    } else {
      return await axios.get('https://app.agrinet.us/api/chart/single?v=43', {
        params: {
          sensorId: sensorId,
          days: days,
          endDate: formatDate(new Date(endDatetime + (1000 * 60 * 60 * 24)))
        },
      });
    }
  } else {
    return await axios.get('https://app.agrinet.us/api/chart/single?v=43', {
      params: {
        sensorId: sensorId,
        days: 14,
      },
    });
  }
}