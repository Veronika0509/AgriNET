// Функция для тестирования кастомных оверлеев с тестовыми данными
import {initializeMoistCustomOverlay} from "../components/types/moist/MoistCustomOverlay";
import {initializeTempCustomOverlay} from "../components/types/temp/TempCustomOverlay";

export const testCustomOverlays = (
  map: google.maps.Map | null,
  isGoogleApiLoaded: boolean,
  setChartData: (data: unknown) => void,
  setPage: (page: number) => void,
  setSiteId: (id: string | number) => void,
  setSiteName: (name: string) => void,
  history: any,
  setChartPageType: (type: string) => void
) => {
  if (!map || !isGoogleApiLoaded) {
    console.log('Map or Google API not loaded');
    return;
  }

  console.log('Testing custom overlays...');

  // Тестовые данные для влажностного сенсора
  const testMoistData = {
    data: [
      { date: Date.now() - 86400000, value: 25.5 }, // вчера
      { date: Date.now(), value: 30.2 } // сегодня
    ],
    sensorId: 'test-moist-001',
    name: 'Test Moist Sensor'
  };

  // Тестовые данные для температурного сенсора  
  const testTempData = {
    data: [
      { date: Date.now() - 86400000, value: 22.1 },
      { date: Date.now(), value: 24.8 }
    ],
    sensorId: 'test-temp-001',
    name: 'Test Temp Sensor'
  };

  try {
    // Создаем тестовый влажностный оверлей
    const MoistCustomOverlayExport = initializeMoistCustomOverlay(isGoogleApiLoaded);
    if (MoistCustomOverlayExport) {
      const moistBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.7128, -74.0060), // Нью-Йорк
        new google.maps.LatLng(40.7138, -74.0050)
      );

      const moistOverlay = new MoistCustomOverlayExport(
        false, // isBudgetEditorMap
        moistBounds,
        '', // invalidChartDataImage
        true, // isValidChartData
        testMoistData,
        setChartData,
        setPage,
        setSiteId,
        setSiteName,
        history,
        false, // isMoistMarkerChartDrawn
        () => {}, // setAdditionalChartData
        [], // siteList
        () => {}, // setMoistOverlays
        setChartPageType,
        { current: [] }, // moistOverlaysRef
        testMoistData.sensorId,
        () => {}, // setCurrentSensorId
        false // toUpdate
      );

      moistOverlay.setMap(map);
      console.log('Moist overlay created and added to map');
    }

    // Создаем тестовый температурный оверлей
    const TempCustomOverlayExport = initializeTempCustomOverlay(isGoogleApiLoaded);
    if (TempCustomOverlayExport) {
      const tempBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.7148, -74.0040), // Рядом с влажностным
        new google.maps.LatLng(40.7158, -74.0030)
      );

      const tempOverlay = new TempCustomOverlayExport(
        tempBounds,
        true, // isValidChartData
        testTempData,
        setChartData,
        setPage,
        setSiteId,
        setSiteName,
        history,
        false, // isTempMarkerChartDrawn
        () => {}, // setAdditionalChartData
        () => {}, // setTempOverlays
        setChartPageType,
        'test-user-001', // userId
        () => {} // present
      );

      tempOverlay.setMap(map);
      console.log('Temp overlay created and added to map');
    }

  } catch (error) {
    console.error('Error creating test overlays:', error);
  }
};
