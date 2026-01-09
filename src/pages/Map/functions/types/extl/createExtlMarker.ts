import {createExtlDataContainer} from "./createExtlDataContainer";

// Интерфейсы для типизации
interface ExtlSensorItem {
  id: string | number;
  sensorId: string;
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
  setExtlChartDataContainer: (data: Array<[{ sensorId: string; layerName?: string; [key: string]: unknown; }, ExtlBounds]>) => void,
  extlId: ExtlIdCounter,
  extlData: ExtlSensorItem[],
  extlBoundsArray: ExtlBounds[],
  countExtl: number,
  layer: string
) => {
  console.log('[EXTL DEBUG createExtlMarker] Called with sensorItem:', sensorItem);
  console.log('[EXTL DEBUG createExtlMarker] page:', page, 'countExtl:', countExtl);
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
    console.log('[EXTL DEBUG createExtlMarker] bounds:', bounds);
    if (page === 1) {
      console.log('[EXTL DEBUG createExtlMarker] Calling createExtlDataContainer');
      createExtlDataContainer({
        bounds,
        setExtlChartDataContainer,
        extlChartsAmount,
        extlData,
        boundsArray: extlBoundsArray,
        countExtl,
        item: sensorItem,
        layer
      });
    } else {
      console.log('[EXTL DEBUG createExtlMarker] Skipping - page is not 1');
    }
  } else {
    console.log('[EXTL DEBUG createExtlMarker] Skipping - already exists');
  }
}