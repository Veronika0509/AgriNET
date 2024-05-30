import {onSiteClick} from "../onSiteClick";

export const createSites = (page: any,
                            map: any,
                            siteList: any,
                            markers: any,
                            setMarkers: any,
                            moistFuelChartsAmount: any,
                            userId: any,
                            setInvalidChartDataContainer: any,
                            setMoistChartDataContainer: any,
                            allMoistFuelCoordinatesOfMarkers: any,
                            setIsAllMoistFuelCoordinatesOfMarkersAreReady: any,
                            setSecondMap: any
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
            moistFuelChartsAmount,
            userId,
            setInvalidChartDataContainer,
            setMoistChartDataContainer,
            allMoistFuelCoordinatesOfMarkers,
            setIsAllMoistFuelCoordinatesOfMarkersAreReady,
            siteList,
            map,
            groupMarker,
            sensorsGroupData,
            setSecondMap
          )
        }, 2000)
      }

      groupMarker.addListener('click', async () => {
        onSiteClick(
          page,
          moistFuelChartsAmount,
          userId,
          setInvalidChartDataContainer,
          setMoistChartDataContainer,
          allMoistFuelCoordinatesOfMarkers,
          setIsAllMoistFuelCoordinatesOfMarkersAreReady,
          siteList,
          map,
          groupMarker,
          sensorsGroupData,
          setSecondMap
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