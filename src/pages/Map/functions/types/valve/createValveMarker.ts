import {createValveDataContainers} from "./createValveDataContainers";
import axios from "axios";

// Интерфейсы для типизации
interface SensorItem {
  id: string | number;
  sensorId: string | number;
  mainId: string | number;
  lat: number;
  lng: number;
  name: string;
  [key: string]: unknown;
}

interface ValveChartDataItem {
  id: string;
  mainId: string | number;
  sensorId: string | number;
  name: string;
  layerName: string;
  events: unknown[];
  nowMinutes: number | undefined;
  bgColor: string;
  enabled: boolean;
  [key: string]: unknown;
}

interface ValveBounds {
  [key: string]: unknown;
}

interface IdCounter {
  value: number;
}

export const createValveMarker = async (
  valveChartsAmount: SensorItem[],
  sensorItem: SensorItem,
  page: number,
  userId: string | number,
  setInvalidValveChartDataContainer: (data: Array<[ValveChartDataItem, ValveBounds]>) => void,
  setValveChartDataContainer: (data: Array<[ValveChartDataItem, ValveBounds]>) => void,
  valveId: IdCounter,
  valveChartData: ValveChartDataItem[],
  valveBoundsArray: ValveBounds[],
  valveInvalidChartData: Array<[ValveChartDataItem, ValveBounds]>,
  countValve: number,
  layer: string
): Promise<void> => {
  const exists = valveChartsAmount.some((secondItemValve: SensorItem) => secondItemValve.id === sensorItem.id);
  if (!exists) {
    const response = await axios.get('https://app.agrinet.us/api/map/valve?v=43', {
      params: {
        sensorId: sensorItem.sensorId,
        userId: userId,
        'do-not-catch-error': ''
      },
    })
    valveId.value++;
    valveChartsAmount.push(sensorItem);
    const bounds: ValveBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    ) as unknown as ValveBounds
    if (page === 1) {
      createValveDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds,
        name: sensorItem.name,
        valveChartsAmount,
        setInvalidValveChartDataContainer,
        setValveChartDataContainer,
        id: valveId,
        valveChartData,
        boundsArray: valveBoundsArray,
        invalidChartData: valveInvalidChartData,
        data: response.data,
        countValve,
        layer
      })
    }
  }
}