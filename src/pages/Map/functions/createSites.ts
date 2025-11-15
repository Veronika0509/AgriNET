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
    const newMarkers = props.siteList.map((sensorsGroupData: SensorsGroupData) => {
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
      if (markers.length === props.siteList.length) {
        props.setMarkers(markers);
      }
    });

    if (props.map) {
      const bounds = new google.maps.LatLngBounds();
      props.siteList.forEach((marker: any) => {
        bounds.extend({
          lat: marker.lat,
          lng: marker.lng,
        });
      });
      const calculateZoomLevel = (bounds: google.maps.LatLngBounds, mapDim: { height: number; width: number }) => {
        const WORLD_DIM = { height: 256, width: 256 }
        const ZOOM_MAX = 21

        function latRad(lat: number) {
          const sin = Math.sin((lat * Math.PI) / 180)
          const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
          return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
        }

        function zoom(mapPx: number, worldPx: number, fraction: number) {
          return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
        }

        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()

        const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI

        const lngDiff = ne.lng() - sw.lng()
        const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

        const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
        const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

        return Math.min(latZoom, lngZoom, ZOOM_MAX)
      }
      const mapDiv = props.map.getDiv()
      const mapDim = {
        height: mapDiv.offsetHeight - 100,
        width: mapDiv.offsetWidth - 100,
      }
      const calculatedZoom = calculateZoomLevel(bounds, mapDim)
      google.maps.event.addListenerOnce(props.map, 'idle', () => {
        props.map.setZoom(calculatedZoom)
        props.map.fitBounds(bounds);
        // props.map.fitBounds(bounds, { padding: 50 });
      });
    }
  }
};
