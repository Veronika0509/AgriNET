import {onSiteClick} from "./onSiteClick";
import {logoFacebook} from "ionicons/icons";
import {getSiteList} from "../data/getSiteList";

export const createSites = (props: any) => {
  let markers: any = []
  props.setAreArraysUpdated(false)
  if (props.markers.length === 0) {
    const newMarkers = props.siteList.map((sensorsGroupData: any) => {
      let groupMarker: any = new google.maps.marker.AdvancedMarkerElement({
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
    props.siteList.forEach((marker: any) => {
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