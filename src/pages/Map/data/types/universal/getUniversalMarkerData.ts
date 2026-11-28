import axios from "axios";
import {
  UNIVERSAL_MARKER_ENDPOINT,
  UNIVERSAL_MOCK_SENSOR_IDS,
  type UniversalMarkerResponse,
} from "../../../config/universalMarker";
import { mockUniversalMarkerData } from "./mockUniversalMarkerData";

export const getUniversalMarkerData = async (
  sensorId: string,
  userId: string | number,
): Promise<UniversalMarkerResponse> => {
  if (UNIVERSAL_MOCK_SENSOR_IDS.includes(String(sensorId))) {
    return mockUniversalMarkerData(String(sensorId));
  }
  const response = await axios.get<UniversalMarkerResponse>(UNIVERSAL_MARKER_ENDPOINT, {
    params: {
      sensorId,
      userId,
      'do-not-catch-error': '',
      nocache: Date.now(),
    },
  });
  return response.data;
};
