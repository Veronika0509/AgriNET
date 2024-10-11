import {onSiteClick} from "../onSiteClick";

export const createSites = (
  page: any,
  map: any,
  siteList: any,
  markers: any,
  setMarkers: any,
  userId: any,
  allCoordinatesOfMarkers: any,
  setIsAllCoordinatesOfMarkersAreReady: any,
  setSecondMap: any,
  moistChartsAmount: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  wxetChartsAmount: any,
  setInvalidWxetDataContainer: any,
  setWxetDataContainer: any,
  tempChartsAmount: any,
  setInvalidTempChartDataContainer: any,
  setTempChartDataContainer: any,
  setOverlappingSensorItems: any
) => {
  if (markers.length === 0) {
    const newMarkers = siteList.map((sensorsGroupData: any) => {
      let groupMarker: any = new google.maps.Marker({
        position: {lat: sensorsGroupData.lat, lng: sensorsGroupData.lng},
        map: map,
        title: sensorsGroupData.name,
      });
      const info: string = `<p class="infoWindowText">${sensorsGroupData.name}</p>`
      const infoWindow = new google.maps.InfoWindow({
        content: info,
      });
      infoWindow.open(map, groupMarker);
      if (siteList.length === 1) {
        setTimeout(() => {
          onSiteClick(
            page,
            userId,
            allCoordinatesOfMarkers,
            setIsAllCoordinatesOfMarkersAreReady,
            siteList,
            groupMarker,
            sensorsGroupData,
            setSecondMap,
            moistChartsAmount,
            setInvalidMoistChartDataContainer,
            setMoistChartDataContainer,
            wxetChartsAmount,
            setInvalidWxetDataContainer,
            setWxetDataContainer,
            tempChartsAmount,
            setInvalidTempChartDataContainer,
            setTempChartDataContainer,
            setOverlappingSensorItems
          )
        }, 2000)
      }

      groupMarker.addListener('click', async () => {
        onSiteClick(
          page,
          userId,
          allCoordinatesOfMarkers,
          setIsAllCoordinatesOfMarkersAreReady,
          siteList,
          groupMarker,
          sensorsGroupData,
          setSecondMap,
          moistChartsAmount,
          setInvalidMoistChartDataContainer,
          setMoistChartDataContainer,
          wxetChartsAmount,
          setInvalidWxetDataContainer,
          setWxetDataContainer,
          tempChartsAmount,
          setInvalidTempChartDataContainer,
          setTempChartDataContainer,
          setOverlappingSensorItems
        )
      })
    });
    setMarkers(newMarkers);

    const bounds = new google.maps.LatLngBounds();
    siteList.forEach((marker: any) => {
      bounds.extend({
        lat: marker.lat,
        lng: marker.lng
      });
    });
    map.fitBounds(bounds);
  }
}