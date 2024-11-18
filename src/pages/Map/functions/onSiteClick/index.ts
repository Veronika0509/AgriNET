import {getSensorItems} from "../../data/getSensorItems";
import {pushAllCoordinates} from "../pushAllCoordinates";
import {createMoistMarker} from "../types/moist/createMoistMarker";
import {createWxetMarker} from "../types/wxet/createWxetMarker";
import {createTempMarker} from "../types/temp/createTempMarker";

export const onSiteClick = async (
  page: any,
  userId: any,
  allCoordinatesOfMarkers: any,
  setIsAllCoordinatesOfMarkersAreReady: any,
  siteList: any,
  groupMarker: any,
  sensorsGroupData: any,
  setSecondMap: any,
  moistChartsAmount: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  wxetChartsAmount: any,
  setInvalidWxetDataContainer: any,
  setWxetDataContainer: any,
  tempChartsAmount: any,
  setInvalidTempChartDataContainer: any,
  setTempChartDataContainer: any
) => {
  setSecondMap(sensorsGroupData.name)
  const sensorItemsByCoords: any = {};
  await Promise.all(siteList.map(async () => {
    const sensorItems = getSensorItems(undefined, siteList)
    // moist props
    let moistId: any = { value: 0 }
    let moistInvalidChartData: any = []
    let moistBoundsArray: any = []
    let moistChartData: any = []
    // temp props
    let tempId: any = { value: 0 };
    let tempChartData: any = []
    let tempBoundsArray: any = []
    let tempInvalidChartData: any = []
    // wxet props
    let wxetId: any = { value: 0 };
    let wxetData: any = []
    let wxetBoundsArray: any = []
    let wxetInvalidChartData: any = []
    sensorItems.map((sensorItem: any) => {
      // Собираем координаты сенсоров
      const { lat, lng } = sensorItem;
      const coordKey = `${lat}-${lng}`;

      // Проверяем, есть ли уже сенсоры с такими координатами
      if (!sensorItemsByCoords[coordKey]) {
        sensorItemsByCoords[coordKey] = [];
      }
      sensorItemsByCoords[coordKey].push(sensorItem);
      if (sensorItem.markerType === 'moist-fuel') {
        console.log('moist', sensorItem)
        createMoistMarker(
          moistChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidMoistChartDataContainer,
          setMoistChartDataContainer,
          moistId,
          moistInvalidChartData,
          moistChartData,
          moistBoundsArray
        )
      } else if (sensorItem.markerType === 'wxet') {
        console.log('wxet', sensorItem)
        createWxetMarker(
          wxetChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidWxetDataContainer,
          setWxetDataContainer,
          wxetId,
          wxetData,
          wxetBoundsArray,
          wxetInvalidChartData
        )
      } else if (sensorItem.markerType === 'temp-rh-v2') {
        console.log('temp', sensorItem)
        createTempMarker(
          tempChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidTempChartDataContainer,
          setTempChartDataContainer,
          tempId,
          tempChartData,
          tempBoundsArray,
          tempInvalidChartData
        )
      } else {
        // createSensorsMarkers(sensorItem, map, setSensorName, setSensorId, setSensorType, setIsModalOpen, setIsChartDataIsLoading, setIsSelectDisabled, setChartData, existingMarkers)
      }
      pushAllCoordinates(
        sensorItem,
        allCoordinatesOfMarkers,
        siteList,
        setIsAllCoordinatesOfMarkersAreReady
      )
    })
  }))
  groupMarker.setMap(null)
}