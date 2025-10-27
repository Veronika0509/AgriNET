import {getMoistMainChartData} from "../data/types/moist/getMoistMainChartData";
import {initializeMoistCustomOverlay} from "../components/types/moist/MoistCustomOverlay";
import {initializeTempCustomOverlay} from "../components/types/temp/TempCustomOverlay";
import {initializeWxetCustomOverlay} from "../components/types/wxet/WxetCustomOverlay";
import {initializeFuelCustomOverlay} from "../components/types/wxet/FuelCustomOverlay";
import {initializeValveCustomOverlay} from "../components/types/valve/ValveCustomOverlay";
import {initializeExtlCustomOverlay} from "../components/types/extl/ExtlCustomOverlay";

const OFFSET = 0.0002;

interface SensorItem {
  lat: number;
  lng: number;
  name: string;
  sensorId: string | number;
  markerType: string;
  graphic?: string;
  width?: number;
  height?: number;
}

interface CreateSensorsMarkersProps {
  sensorItem: SensorItem;
  map: google.maps.Map;
  isGoogleApiLoaded: boolean;
  setChartData: (data: unknown) => void;
  setPage: (page: number) => void;
  setSiteId: (id: string | number) => void;
  setSiteName: (name: string) => void;
  history: any;
  setAdditionalChartData?: (data: any) => void;
  setChartPageType: (type: string) => void;
  userId: string | number;
  present?: any;
  siteList?: any;
  setMoistOverlays?: any;
  setTempOverlays?: any;
  setWxetOverlays?: any;
  setFuelOverlays?: any;
  setValveOverlays?: any;
  setExtlOverlays?: any;
  existingMarkers: Map<string, number>;
}

export const createSensorsMarkers = (props: CreateSensorsMarkersProps): void => {

  const { sensorItem, map, isGoogleApiLoaded, existingMarkers } = props;
  
  let lat = sensorItem.lat;
  let lng = sensorItem.lng;
  const key = `${lat}-${lng}`;
  if (existingMarkers.has(key)) {
    const count = existingMarkers.get(key) || 0;
    lat += OFFSET * count;
    lng += OFFSET * count;
    existingMarkers.set(key, count + 1);
  } else {
    existingMarkers.set(key, 1);
  }
  const sensorMarker = new google.maps.Marker({
    position: {lat, lng},
    map
  });
  const info = `<div><p class="infoWindowText"><span>Name:</span> ${sensorItem.name}</p><p class="infoWindowText">Click to see more...</p></div>`
  const infoWindow = new google.maps.InfoWindow({
    content: info
  });
  infoWindow.open(map, sensorMarker);
  sensorMarker.addListener('click', async () => {
    try {
      // Создаем кастомный оверлей в зависимости от типа сенсора
      let overlay: any = null;
      
      if (sensorItem.markerType === 'moist' || sensorItem.markerType === 'moist-fuel') {
        const response = await getMoistMainChartData(sensorItem.sensorId, false);
        if (response.data.data && response.data.data.length > 0) {
          const MoistCustomOverlayExport = initializeMoistCustomOverlay(isGoogleApiLoaded);
          if (MoistCustomOverlayExport) {
            // Создаем LatLngBounds для позиции оверлея
            const bounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(lat - 0.001, lng - 0.001),
              new google.maps.LatLng(lat + 0.001, lng + 0.001)
            );
            
            overlay = new MoistCustomOverlayExport(
              false, // isBudgetEditorMap
              bounds, // bounds
              '', // invalidChartDataImage
              true, // isValidChartData
              response.data.data, // chartData
              props.setChartData,
              props.setPage,
              props.setSiteId,
              props.setSiteName,
              props.history,
              false, // isMoistMarkerChartDrawn
              props.setAdditionalChartData || (() => {}),
              props.siteList || [],
              props.setMoistOverlays || (() => {}),
              props.setChartPageType,
              { current: [] }, // moistOverlaysRef
              sensorItem.sensorId, // currentSensorId
              () => {}, // setCurrentSensorId
              false // toUpdate
            );
            overlay.setMap(map);
          }
        }
      } else if (sensorItem.markerType === 'temp') {
        const TempCustomOverlayExport = initializeTempCustomOverlay(isGoogleApiLoaded);
        if (TempCustomOverlayExport) {
          // Создаем LatLngBounds для позиции оверлея
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(lat - 0.001, lng - 0.001),
            new google.maps.LatLng(lat + 0.001, lng + 0.001)
          );
          
          // Преобразуем SensorItem в TempChartData
          const tempChartData = {
            id: sensorItem.sensorId,
            layerName: 'Temp',
            name: sensorItem.name,
            sensorId: sensorItem.sensorId,
            freshness: '60m',
            batteryPercentage: 100,
            alarmEnabled: false
          };
          
          overlay = new TempCustomOverlayExport(
            bounds,
            true, // isValidChartData
            tempChartData,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.history,
            false, // isTempMarkerChartDrawn
            props.setAdditionalChartData || (() => {}),
            props.setTempOverlays || (() => {}),
            props.setChartPageType,
            props.userId,
            props.present || (() => {})
          );
          overlay.setMap(map);
        }
      } else if (sensorItem.markerType === 'wxet') {
        const WxetCustomOverlayExport = initializeWxetCustomOverlay(isGoogleApiLoaded);
        if (WxetCustomOverlayExport) {
          // Создаем LatLngBounds для позиции оверлея
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(lat - 0.001, lng - 0.001),
            new google.maps.LatLng(lat + 0.001, lng + 0.001)
          );
          
          // Преобразуем SensorItem в WxetChartData
          const wxetChartData = {
            sensorId: sensorItem.sensorId,
            mainId: sensorItem.sensorId,
            name: sensorItem.name,
            freshness: '60m',
            data: {
              metric: 'default',
              batteryPercentage: 100,
              alarmEnabled: false
            }
          };
          
          overlay = new WxetCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData || (() => {}),
            props.history,
            bounds,
            true, // isValidData
            wxetChartData,
            props.setChartPageType
          );
          overlay.setMap(map);
        }
      } else if (sensorItem.markerType === 'fuel') {
        const FuelCustomOverlayExport = initializeFuelCustomOverlay(isGoogleApiLoaded);
        if (FuelCustomOverlayExport) {
          // Создаем LatLngBounds для позиции оверлея
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(lat - 0.001, lng - 0.001),
            new google.maps.LatLng(lat + 0.001, lng + 0.001)
          );
          
          // Преобразуем SensorItem в FuelChartData
          const fuelChartData = {
            id: sensorItem.sensorId,
            mainId: sensorItem.sensorId,
            layerName: 'Fuel',
            name: sensorItem.name,
            sensorId: sensorItem.sensorId,
            batteryPercentage: 100,
            freshness: '60m'
          };
          
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.history,
            bounds,
            true, // isValidData
            fuelChartData,
            props.setChartPageType,
            false, // isFuelMarkerChartDrawn
            props.setFuelOverlays || (() => {})
          );
          overlay.setMap(map);
        }
      } else if (sensorItem.markerType === 'valve') {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(isGoogleApiLoaded);
        if (ValveCustomOverlayExport) {
          // Создаем LatLngBounds для позиции оверлея
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(lat - 0.001, lng - 0.001),
            new google.maps.LatLng(lat + 0.001, lng + 0.001)
          );
          
          // Преобразуем SensorItem в ValveChartData
          const valveChartData = {
            id: sensorItem.sensorId,
            sensorId: sensorItem.sensorId,
            name: sensorItem.name,
            bgColor: 'blue',
            enabled: true
          };
          
          overlay = new ValveCustomOverlayExport(
            bounds,
            true, // isValidChartData
            valveChartData,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setChartPageType,
            props.history,
            false, // isValveMarkerChartDrawn
            props.setValveOverlays || (() => {}),
            props.userId
          );
          overlay.setMap(map);
        }
      } else if (sensorItem.markerType === 'extl') {
        const ExtlCustomOverlayExport = initializeExtlCustomOverlay(isGoogleApiLoaded);
        if (ExtlCustomOverlayExport) {
          // Создаем LatLngBounds для позиции оверлея
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(lat - 0.001, lng - 0.001),
            new google.maps.LatLng(lat + 0.001, lng + 0.001)
          );

          const extlChartData = {
            id: sensorItem.sensorId,
            layerName: 'Extl',
            name: sensorItem.name,
            graphic: sensorItem.graphic,
            chartType: 'default',
            width: sensorItem.width,
            height: sensorItem.height,
            sensorId: sensorItem.sensorId
          };
          
          overlay = new ExtlCustomOverlayExport(
            bounds,
            extlChartData
          );
          overlay.setMap(map);
        }
      }
    } catch (error) {
      console.error('Error creating custom overlay:', error);
    }
  });
}