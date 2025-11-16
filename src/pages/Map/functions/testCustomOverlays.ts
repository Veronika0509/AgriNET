// Function for testing custom overlays with test data
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

  // Test data for moisture sensor
  const testMoistData = {
    data: [
      { date: Date.now() - 86400000, value: 25.5 }, // yesterday
      { date: Date.now(), value: 30.2 } // today
    ],
    sensorId: 'test-moist-001',
    name: 'Test Moist Sensor'
  };

  // Test data for temperature sensor
  const testTempData = {
    data: [
      { date: Date.now() - 86400000, value: 22.1 },
      { date: Date.now(), value: 24.8 }
    ],
    sensorId: 'test-temp-001',
    name: 'Test Temp Sensor'
  };

  try {
    // Create test moisture overlay
    const MoistCustomOverlayExport = initializeMoistCustomOverlay(isGoogleApiLoaded);
    if (MoistCustomOverlayExport) {
      const moistBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.7128, -74.0060), // New York
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

    // Create test temperature overlay
    const TempCustomOverlayExport = initializeTempCustomOverlay(isGoogleApiLoaded);
    if (TempCustomOverlayExport) {
      const tempBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.7148, -74.0040), // Near moisture sensor
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
