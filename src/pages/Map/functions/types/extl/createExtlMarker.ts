import {createExtlDataContainer} from "./createExtlDataContainer";

// Интерфейсы для типизации
interface ExtlSensorItem {
  id: string | number;
  sensorId: string | number;
  mainId: string | number;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

interface ExtlIdCounter {
  value: number;
}

interface ExtlBounds {
  [key: string]: unknown;
}

export const createExtlMarker = async (
  extlChartsAmount: ExtlSensorItem[],
  sensorItem: ExtlSensorItem,
  page: number,
  setExtlChartDataContainer: (data: Array<[{ sensorId: string | number; layerName?: string; [key: string]: unknown; }, ExtlBounds]>) => void,
  extlId: ExtlIdCounter,
  extlData: ExtlSensorItem[],
  extlBoundsArray: ExtlBounds[],
  countExtl: number,
  layer: string
) => {
  const exists = extlChartsAmount.some((secondItemTemp: ExtlSensorItem) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    extlId.value++;
    extlChartsAmount.push(sensorItem);
    const bounds: ExtlBounds = {
      north: sensorItem.lat + 0.0001,
      south: sensorItem.lat,
      east: sensorItem.lng + 0.0001,
      west: sensorItem.lng
    };
    if (page === 1) {
      createExtlDataContainer({
        mainId: extlId.value,
        bounds,
        setExtlChartDataContainer,
        extlChartsAmount,
        extlData,
        boundsArray: extlBoundsArray,
        countExtl,
        item: sensorItem,
        layer
      });
    }
  }
}