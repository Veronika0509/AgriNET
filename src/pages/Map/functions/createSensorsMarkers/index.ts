import {getMoistMainChartData} from "../../data/types/moist/getMoistMainChartData";

const OFFSET = 0.0002;

export const createSensorsMarkers = (sensorItem: any, map: any, setSensorName: any, setSensorId: any, setSensorType: any, setIsModalOpen: any, setIsChartDataIsLoading: any, setIsSelectDisabled: any, setChartData: any, existingMarkers: any) => {
  let lat = sensorItem.lat;
  let lng = sensorItem.lng;
  const key = `${lat}-${lng}`;
  if (existingMarkers.has(key)) {
    let count = existingMarkers.get(key);
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
  sensorMarker.addListener('click', () => {
    setSensorName(sensorItem.name);
    setSensorId(sensorItem.sensorId);
    setSensorType(sensorItem.markerType);
    setIsModalOpen(true);
    new Promise((resolve: any) => {
      const response: any = getMoistMainChartData(sensorItem.sensorId, false)
      setIsChartDataIsLoading(true)
      resolve(response)
    }).then((response: any) => {
      setIsChartDataIsLoading(false)
      if (response.data.data.length === 0 || response.data.data.length === 1) {
        setIsSelectDisabled(true);
      } else {
        setIsSelectDisabled(false);
        setChartData(response.data.data);
      }
    })
  });
}