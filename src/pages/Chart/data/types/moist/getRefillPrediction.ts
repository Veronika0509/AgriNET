import axios from "axios";

export interface RefillPredictionResponse {
  sensor_id: string;
  current_moisture: number;
  days_to_refill: number;
  target: number;
}

export const getRefillPrediction = async (sensorId: string, userId: string | number): Promise<RefillPredictionResponse> => {
  const response = await axios.get<RefillPredictionResponse>(
    `https://app.agrinet.us/api/predict-moisture/${sensorId}`,
    {
      params: {
        user: String(userId),
      },
    }
  );
  return response.data;
}
