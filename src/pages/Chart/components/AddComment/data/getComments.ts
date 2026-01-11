import axios from "axios";
import { debugLog } from "../../../../../utils/debugConfig";

export const getComments = async (chartType: string, sensorId: string, days: number) => {
  try {
    const response = await axios.get('https://app.agrinet.us/api/chart/comments?v=43', {
      params: {
        chartId: `${chartType}-${sensorId}`,
        days
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
}