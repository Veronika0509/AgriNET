import { onSiteClick } from "./onSiteClick";
import {logoFacebook, logoHackernews} from "ionicons/icons";
import { getSiteList } from "../data/getSiteList";

interface SensorsGroupData {
  lat: number;
  lng: number;
  name: string;
  layers: unknown[];
}

interface CreateSitesProps {
  setAreArraysUpdated: (updated: boolean) => void;
  markers: unknown[];
  siteList: SensorsGroupData[];
  map: google.maps.Map;
  setMarkers: (markers: unknown[]) => void;
  userId: string | number;
  setPage: (page: number) => void;
  setSiteId: (id: string | number) => void;
  setSiteName: (name: string) => void;
  setChartData: (data: unknown) => void;
  setAdditionalChartData: (data: unknown) => void;
  setChartPageType: (type: string) => void;
  history: { push: (path: string) => void };
  initialZoom?: number;
  setInitialZoom?: (zoom: number | undefined) => void;
  setIsMarkerClicked?: (clicked: boolean | string) => void;
  page?: number;
  allCoordinatesOfMarkers?: unknown[];
  setCoordinatesForFitting?: (coords: unknown[]) => void;
  setAllCoordinatesOfMarkers?: (coords: unknown[]) => void;
  setSecondMap?: (map: unknown) => void;
  moistChartsAmount?: number;
  setInvalidMoistChartDataContainer?: (data: unknown) => void;
  setMoistChartDataContainer?: (data: unknown) => void;
  wxetChartsAmount?: number;
  setInvalidWxetDataContainer?: (data: unknown) => void;
  setWxetDataContainer?: (data: unknown) => void;
  tempChartsAmount?: number;
  setInvalidTempChartDataContainer?: (data: unknown) => void;
  setTempChartDataContainer?: (data: unknown) => void;
  valveChartsAmount?: number;
  setInvalidValveChartDataContainer?: (data: unknown) => void;
  setValveChartDataContainer?: (data: unknown) => void;
  amountOfSensors?: number;
  setAmountOfSensors?: (amount: number) => void;
  extlChartsAmount?: number;
  setExtlDataContainer?: (data: unknown) => void;
}

export const createSites = async (props: CreateSitesProps) => {
  const markers: google.maps.marker.AdvancedMarkerElement[] = [];
  props.setAreArraysUpdated(false);
  if (props.markers.length === 0) {
    // Create all markers first
    props.siteList.forEach((sensorsGroupData: SensorsGroupData) => {
      const groupMarker = new google.maps.marker.AdvancedMarkerElement({
        map: props.map,
        position: { lat: sensorsGroupData.lat, lng: sensorsGroupData.lng },
        title: sensorsGroupData.name,
      });

      const info: string = `<p class="infoWindowText">${sensorsGroupData.name}</p>`;
      const infoWindow = new google.maps.InfoWindow({
        content: info,
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
            siteList: props.siteList,
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
            markers,
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
          siteList: props.siteList,
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
          markers,
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
      props.siteList.forEach((site: SensorsGroupData) => {
        bounds.extend({ lat: site.lat, lng: site.lng });
      });

      // Fit the map to show all markers with padding
      props.map.fitBounds(bounds);

      // If there's only one marker, set a reasonable zoom level after a short delay
      // to ensure fitBounds completes first
      if (markers.length === 1) {
        setTimeout(() => {
          props.map.setZoom(15);
        }, 100);
      }
    }
  }
};
