import {onSiteClick} from "./onSiteClick";
import {logoFacebook} from "ionicons/icons";
import {getSiteList} from "../data/getSiteList";

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
}

export const createSites = (props: CreateSitesProps): void => {
  const markers: google.maps.marker.AdvancedMarkerElement[] = []
  props.setAreArraysUpdated(false)
  if (props.markers.length === 0) {
    const newMarkers = props.siteList.map((sensorsGroupData: SensorsGroupData) => {
      const groupMarker = new google.maps.marker.AdvancedMarkerElement({
        map: props.map,
        position: { lat: sensorsGroupData.lat, lng: sensorsGroupData.lng },
        title: sensorsGroupData.name,
      });

      const info: string = `<p class="infoWindowText">${sensorsGroupData.name}</p>`
      const infoWindow = new google.maps.InfoWindow({
        content: info,
      });
      groupMarker.infoWindow = infoWindow
      infoWindow.open(props.map, groupMarker);
      markers.push(groupMarker)
      if (props.siteList.length === 1) {
        setTimeout(() => {
          props.setIsMarkerClicked(props.siteList[0].name)
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
            setExtlDataContainer: props.setExtlDataContainer
          })
        }, 2000)
      }

      groupMarker.addListener('click', async () => {
        props.setIsMarkerClicked(groupMarker.title)
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
        })
      })
      if (markers.length === props.siteList.length) {
        props.setMarkers(markers);
      }
    });
    const bounds = new google.maps.LatLngBounds();
    props.siteList.forEach((marker: SensorsGroupData) => {
      bounds.extend({
        lat: marker.lat,
        lng: marker.lng
      });
    });
    if (props.map) {
      if (props.map.zoom !== undefined && props.map.zoom !== props.initialZoom) {
        props.map.setZoom(props.initialZoom)
      }
      props.map.fitBounds(bounds)
      if (!props.initialZoom) {
        props.setInitialZoom(props.map.zoom)
      }
    }
  }
}