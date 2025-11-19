import {createMoistDataContainers} from "./createMoistDataContainers";
import axios from "axios";
import {getMoistMarkerChartData} from "../../../data/types/moist/getMoistMarkerChartData";
import {logoFacebook} from "ionicons/icons";

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
    const response = await getMoistMarkerChartData(sensorItem.sensorId, userId)
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
        moistChartData: moistChartData as unknown[],
        boundsArray: boundsArray as unknown[],
        invalidChartData: moistInvalidChartData as unknown[],
        response,
        countMoistFuel,
        layer
      });
    }
  }
}