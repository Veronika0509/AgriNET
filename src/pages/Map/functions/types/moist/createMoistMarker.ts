import {createMoistDataContainers} from "./createMoistDataContainers";
;
import {getMoistMarkerChartData} from "../../../data/types/moist/getMoistMarkerChartData";
;

interface SensorItem {
  id: string | number;
  sensorId: string;
  mainId: string | number;
  lat: number;
  lng: number;
  name: string;
}

interface MoistId {
  value: number;
}

interface MoistBounds {
  [key: string]: unknown;
}

export const createMoistMarker = async (
  moistChartsAmount: SensorItem[],
  sensorItem: SensorItem,
  page: number,
  userId: string | number,
  setInvalidMoistChartDataContainer: (container: unknown) => void,
  setMoistChartDataContainer: (container: unknown) => void,
  moistId: MoistId,
  moistInvalidChartData: unknown[],
  moistChartData: unknown[],
  boundsArray: MoistBounds[],
  countMoistFuel: number,
  layer: string
) => {
  const exists = moistChartsAmount.some((secondItemMoist: SensorItem) => secondItemMoist.id === sensorItem.id);
  if (!exists) {
    let response
    try {
      response = await getMoistMarkerChartData(sensorItem.sensorId, userId)
    } catch (error) {
      // Without this catch, a single failing fetch (e.g. a brand-new sensor with no chart
      // data yet) becomes an unhandled promise rejection - since createMoistMarker is called
      // without await/.catch() in onSiteClick.ts, that silently drops just this one marker
      // while every other sensor on the same site still renders fine.
      console.error("Failed to fetch moist chart data for sensorId:", sensorItem.sensorId, error)
      return
    }
    moistId.value++;
    moistChartsAmount.push(sensorItem);
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      createMoistDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds: bounds as unknown as MoistBounds,
        name: sensorItem.name,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        moistChartsAmount,
        moistId,
        moistChartData: moistChartData as any,
        boundsArray: boundsArray as any,
        invalidChartData: moistInvalidChartData as any,
        response,
        countMoistFuel,
        layer
      });
    }
  }
}