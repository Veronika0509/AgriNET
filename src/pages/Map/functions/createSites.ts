import { onSiteClick } from "./onSiteClick";
import type { Site } from "../../../types";

// Extended marker type with custom infoWindow property
interface MarkerWithInfoWindow extends google.maps.marker.AdvancedMarkerElement {
  infoWindow?: google.maps.InfoWindow;
}

interface Marker {
  sensorId: string;
  visible: boolean;
  setMap: (map: google.maps.Map | null) => void;
  infoWindow: google.maps.InfoWindow;
  lat: number;
  lng: number;
  id: string | number;
  [key: string]: unknown;
}


interface CoordinateWithId {
  lat: number;
  lng: number;
  id: string | number;
  mainId: string | number;
}

interface CreateSitesProps {
  setAreArraysUpdated?: React.Dispatch<React.SetStateAction<boolean>> | ((updated: boolean) => void);
  markers: google.maps.Marker[] | Marker[];
  siteList: Site[];
  map: google.maps.Map;
  setMarkers: React.Dispatch<React.SetStateAction<any[]>> | ((markers: any[]) => void);
  userId: number;
  setPage?: React.Dispatch<React.SetStateAction<number>> | ((page: number) => void);
  setSiteId?: React.Dispatch<React.SetStateAction<any>> | ((id: string | number) => void);
  setSiteName?: React.Dispatch<React.SetStateAction<string>> | ((name: string) => void);
  setChartData?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown) => void);
  setAdditionalChartData?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown) => void);
  setChartPageType?: React.Dispatch<React.SetStateAction<any>> | ((type: string) => void);
  history?: { push: (path: string) => void };
  initialZoom?: number;
  setInitialZoom?: (zoom: number | undefined) => void;
  setIsMarkerClicked?: React.Dispatch<React.SetStateAction<boolean | string>> | ((clicked: boolean | string) => void);
  page?: number;
  allCoordinatesOfMarkers?: CoordinateWithId[] | any[];
  setCoordinatesForFitting?: React.Dispatch<React.SetStateAction<any[]>> | ((coords: CoordinateWithId[]) => void);
  setAllCoordinatesOfMarkers?: React.Dispatch<React.SetStateAction<any[]>> | ((coords: CoordinateWithId[]) => void);
  setSecondMap?: React.Dispatch<React.SetStateAction<any>> | ((map: string) => void);
  moistChartsAmount?: number;
  setInvalidMoistChartDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  setMoistChartDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  wxetChartsAmount?: number;
  setInvalidWxetDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  setWxetDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  tempChartsAmount?: number;
  setInvalidTempChartDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  setTempChartDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  valveChartsAmount?: number;
  setInvalidValveChartDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  setValveChartDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  amountOfSensors?: number;
  setAmountOfSensors?: (amount: number) => void;
  extlChartsAmount?: number;
  setExtlDataContainer?: React.Dispatch<React.SetStateAction<any[]>> | ((data: unknown[]) => void);
  mapRefFunc?: React.RefObject<HTMLDivElement>;
}

export const createSites = async (props: CreateSitesProps) => {
  const markers: MarkerWithInfoWindow[] = [];
  props.setAreArraysUpdated?.(false);
  const template = document.createElement("div");
  template.className = "my-advanced-marker";
  template.innerHTML = `<img src="https://app.agrinet.us/Tier1Markr_20.svg" alt="m">`;
  if (props.markers.length === 0) {
    props.siteList.forEach((sensorsGroupData: Site) => {
      const el = template.cloneNode(true) as HTMLElement;
      const groupMarker = new google.maps.marker.AdvancedMarkerElement({
        map: props.map,
        position: { lat: sensorsGroupData.lat, lng: sensorsGroupData.lng },
        title: sensorsGroupData.name,
        content: el
      }) as MarkerWithInfoWindow;

      const info: string = `<p class="infoWindowText">${sensorsGroupData.name}</p>`;
      const infoWindow = new google.maps.InfoWindow({
        content: info,
        disableAutoPan: true, // Prevent auto-panning when opening info window
      });
      groupMarker.infoWindow = infoWindow;
      infoWindow.open(props.map, groupMarker);
      markers.push(groupMarker);
      // Auto-click disabled - user must manually click on site to see sensors
      if (props.siteList.length === 1) {
        setTimeout(() => {
          props.setIsMarkerClicked(props.siteList[0].name);
          onSiteClick({
            page: props.page,
            userId: props.userId,
            allCoordinatesOfMarkers: props.allCoordinatesOfMarkers,
            setCoordinatesForFitting: props.setCoordinatesForFitting,
            setAllCoordinatesOfMarkers: props.setAllCoordinatesOfMarkers,
            siteList: props.siteList as any,
            groupMarker,
            sensorsGroupData,
            setSecondMap: props.setSecondMap,
            moistChartsAmount: props.moistChartsAmount,
            setInvalidMoistChartDataContainer: props.setInvalidMoistChartDataContainer,
            setMoistChartDataContainer: props.setMoistChartDataContainer,
            wxetChartsAmount: props.wxetChartsAmount,
            setInvalidWxetDataContainer: props.setInvalidWxetDataContainer,
            setWxetDataContainer: props.setWxetDataContainer,
            tempChartsAmount: props.tempChartsAmount,
            setInvalidTempChartDataContainer: props.setInvalidTempChartDataContainer,
            setTempChartDataContainer: props.setTempChartDataContainer,
            valveChartsAmount: props.valveChartsAmount,
            setInvalidValveChartDataContainer: props.setInvalidValveChartDataContainer,
            setValveChartDataContainer: props.setValveChartDataContainer,
            amountOfSensors: props.amountOfSensors,
            setAmountOfSensors: props.setAmountOfSensors,
            markers: (props.markers.length > 0 ? props.markers : markers) as any,
            extlChartsAmount: props.extlChartsAmount,
            setExtlDataContainer: props.setExtlDataContainer,
          });
        }, 2000);
      }

      groupMarker.addListener('click', async () => {
        props.setIsMarkerClicked(groupMarker.title);
        onSiteClick({
          page: props.page,
          userId: props.userId,
          allCoordinatesOfMarkers: props.allCoordinatesOfMarkers,
          setCoordinatesForFitting: props.setCoordinatesForFitting,
          setAllCoordinatesOfMarkers: props.setAllCoordinatesOfMarkers,
          siteList: props.siteList as any,
          groupMarker,
          sensorsGroupData,
          setSecondMap: props.setSecondMap,
          moistChartsAmount: props.moistChartsAmount,
          setInvalidMoistChartDataContainer: props.setInvalidMoistChartDataContainer,
          setMoistChartDataContainer: props.setMoistChartDataContainer,
          wxetChartsAmount: props.wxetChartsAmount,
          setInvalidWxetDataContainer: props.setInvalidWxetDataContainer,
          setWxetDataContainer: props.setWxetDataContainer,
          tempChartsAmount: props.tempChartsAmount,
          setInvalidTempChartDataContainer: props.setInvalidTempChartDataContainer,
          setTempChartDataContainer: props.setTempChartDataContainer,
          valveChartsAmount: props.valveChartsAmount,
          setInvalidValveChartDataContainer: props.setInvalidValveChartDataContainer,
          setValveChartDataContainer: props.setValveChartDataContainer,
          amountOfSensors: props.amountOfSensors,
          setAmountOfSensors: props.setAmountOfSensors,
          markers: (props.markers.length > 0 ? props.markers : markers) as any,
          extlChartsAmount: props.extlChartsAmount,
          setExtlDataContainer: props.setExtlDataContainer,
        });
      });
    });

    // After all markers are created, update the state
    props.setMarkers(markers);

    // Center and zoom map to show all markers
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      // Extend bounds with all marker positions
      props.siteList.forEach((site: Site) => {
        bounds.extend({ lat: site.lat, lng: site.lng });
      });

      // Listen for when tiles finish loading, then trigger final resize
      google.maps.event.addListenerOnce(props.map, 'tilesloaded', () => {
        google.maps.event.trigger(props.map, 'resize');
      });

      // Fit bounds immediately to avoid showing default position
      // Use minimal delay for initial load, longer delays when returning from other tabs
      const isInitialLoad = !props.initialZoom;
      const initialDelay = isInitialLoad ? 50 : 500;
      setTimeout(() => {

        // Trigger resize first to ensure map is ready
        google.maps.event.trigger(props.map, 'resize');

        // Fit bounds
        setTimeout(() => {
          props.map.fitBounds(bounds);

          // Trigger another resize after bounds are set
          setTimeout(() => {
            google.maps.event.trigger(props.map, 'resize');

            // If there's only one marker, set a reasonable zoom level
            if (markers.length === 1) {
              setTimeout(() => {
                props.map.setZoom(15);
              }, 100);
            }
          }, isInitialLoad ? 100 : 300);
        }, isInitialLoad ? 100 : 300);
      }, initialDelay);
    }
  }
};
