import { getUniversalMarkerData } from "../../../data/types/universal/getUniversalMarkerData";
import {
  UNIVERSAL_DEFAULT_SIZE,
  type UniversalDataPoint,
  type UniversalFreshness,
  type UniversalMarkerParams,
  type UniversalMarkerResponse,
} from "../../../config/universalMarker";

interface SensorItem {
  id: string | number;
  sensorId: string;
  lat: number;
  lng: number;
  name: string;
  [key: string]: unknown;
}

export interface UniversalChartDataItem {
  /** DOM id of the sparkline container (amCharts root). */
  id: string;
  mainId: string | number;
  sensorId: string;
  name: string;
  layerName: string;
  params: UniversalMarkerParams;
  data: UniversalDataPoint[];
  battery: number | null;
  alarmEnabled: boolean;
  freshness: UniversalFreshness;
  /** Latest value with unit, e.g. "523ppm"; null when there is no data. */
  chartValue: string | null;
}

export type UniversalChartDataTuple = [UniversalChartDataItem, google.maps.LatLngBounds];

/**
 * Shared by all universal markers of one site click. The containers are set once,
 * after every marker has settled (failed fetches count too, so one broken sensor
 * doesn't keep the rest off the map).
 */
export interface UniversalMarkerBatch {
  total: number;
  settled: number;
  valid: UniversalChartDataTuple[];
  invalid: UniversalChartDataTuple[];
}

const getLastPoint = (data: UniversalDataPoint[]): UniversalDataPoint | undefined => {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].value !== null && data[i].value !== undefined) return data[i];
  }
  return undefined;
};

const getFreshness = (response: UniversalMarkerResponse, lastPoint: UniversalDataPoint | undefined): UniversalFreshness => {
  if (response.freshness) return response.freshness;
  if (!lastPoint) return "skull";
  const ageHours = (Date.now() - new Date(lastPoint.DateTime).getTime()) / 3_600_000;
  const { green, yellow, skull } = response.params.freshnessHours;
  if (ageHours >= skull) return "skull";
  if (ageHours <= green) return "green";
  if (ageHours <= yellow) return "yellow";
  return "red";
};

const settle = (
  batch: UniversalMarkerBatch,
  setUniversalChartDataContainer: (data: UniversalChartDataTuple[]) => void,
  setInvalidUniversalChartDataContainer: (data: UniversalChartDataTuple[]) => void,
) => {
  batch.settled++;
  if (batch.settled === batch.total) {
    setInvalidUniversalChartDataContainer([...batch.invalid]);
    setUniversalChartDataContainer([...batch.valid]);
  }
};

export const createUniversalMarker = async (
  sensorItem: SensorItem,
  page: number,
  userId: string | number,
  layer: string,
  batch: UniversalMarkerBatch,
  setUniversalChartDataContainer: (data: UniversalChartDataTuple[]) => void,
  setInvalidUniversalChartDataContainer: (data: UniversalChartDataTuple[]) => void,
): Promise<void> => {
  if (page !== 1) return;

  let response: UniversalMarkerResponse;
  try {
    response = await getUniversalMarkerData(sensorItem.sensorId, userId);
  } catch (error) {
    console.error("Failed to fetch universal marker data for sensorId:", sensorItem.sensorId, error);
    settle(batch, setUniversalChartDataContainer, setInvalidUniversalChartDataContainer);
    return;
  }

  const data = response.data ?? [];
  const lastPoint = getLastPoint(data);
  const params: UniversalMarkerParams = {
    ...response.params,
    width: response.params.width || UNIVERSAL_DEFAULT_SIZE.width,
    height: response.params.height || UNIVERSAL_DEFAULT_SIZE.height,
  };
  const item: UniversalChartDataItem = {
    id: `universal_${sensorItem.id}`,
    mainId: sensorItem.id,
    sensorId: sensorItem.sensorId,
    name: sensorItem.name,
    layerName: layer || params.layerName,
    params,
    data,
    battery: response.battery ?? null,
    alarmEnabled: Boolean(response.alarmEnabled),
    freshness: getFreshness(response, lastPoint),
    chartValue: lastPoint ? `${Math.round((lastPoint.value as number) * 10) / 10}${params.unit}` : null,
  };
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
    new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
  );

  const target = item.freshness === "skull" ? batch.invalid : batch.valid;
  if (!target.some(([existing]) => existing.mainId === item.mainId)) {
    target.push([item, bounds]);
  }
  settle(batch, setUniversalChartDataContainer, setInvalidUniversalChartDataContainer);
};
