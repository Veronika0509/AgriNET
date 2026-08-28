import type { AxiosResponse } from "axios";

/**
 * SCAFFOLD. Mirror of getMoistMarkerChartData for the universal marker type.
 *
 * TODO(universal): implement once the endpoint and query params are confirmed
 * with Todd. Expected to resolve to the same shape as the other map marker
 * endpoints: { data: TimeSeriesDataItem[], battery: number | null, freshness: string }.
 */
export const getUniversalMarkerData = async (
  _sensorId: string,
  _userId: string | number,
): Promise<AxiosResponse> => {
  throw new Error("getUniversalMarkerData: not implemented yet");
};
