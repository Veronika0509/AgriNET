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
  let moistChartData: any = []
  await Promise.all(siteList.map(async () => {
    const sensorItems = getSensorItems(undefined, siteList)
    let moistBoundsArray: any = []
    sensorItems.map((sensorItem: any) => {
      if (sensorItem.markerType === 'moist-fuel') {
        createMoistMarker(
          moistChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidMoistChartDataContainer,
          setMoistChartDataContainer,
          moistChartData,
          moistBoundsArray
        )
      } else if (sensorItem.markerType === 'wxet') {
        createWxetMarker(
          wxetChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidWxetDataContainer,
          setWxetDataContainer
        )
      } else if (sensorItem.markerType === 'temp-rh-v2') {
        createTempMarker(
          tempChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidTempChartDataContainer,
          setTempChartDataContainer
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