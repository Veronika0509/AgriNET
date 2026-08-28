import { getUniversalMarkerData } from "../../../data/types/universal/getUniversalMarkerData";

interface SensorItem {
  id: string | number;
  sensorId: string;
  lat: number;
  lng: number;
  name?: string;
  [key: string]: unknown;
}

/**
 * SCAFFOLD. Mirror of createMoistMarker for the universal marker type.
 *
 * For now this only proves the seam: onSiteClick can route 'universal' markers
 * here without affecting other marker types. Nothing is drawn yet.
 *
 * TODO(universal): once the data source is defined, build the real pipeline:
 *   getUniversalMarkerData -> createUniversalDataContainer -> overlay -> chart,
 *   and wire amountOfSensors / pushAllCoordinates like the other types.
 */
export const createUniversalMarker = async (
  sensorItem: SensorItem,
  _page: number,
  userId: string | number,
): Promise<void> => {
  try {
    await getUniversalMarkerData(sensorItem.sensorId, userId);
  } catch (error) {
    console.warn(
      "[universal] marker not rendered — data source not ready:",
      sensorItem.sensorId,
      error,
    );
    return;
  }
  // TODO(universal): createUniversalDataContainer(...) -> overlay -> chart
};
