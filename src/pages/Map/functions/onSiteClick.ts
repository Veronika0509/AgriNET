import {getSensorItems} from "../data/getSensorItems";
import {pushAllCoordinates} from "./pushAllCoordinates";
import {createMoistMarker} from "./types/moist/createMoistMarker";
import {createWxetMarker} from "./types/wxet/createWxetMarker";
import {createTempMarker} from "./types/temp/createTempMarker";

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
  setTempChartDataContainer: any,
  amountOfSensors: number,
  setAmountOfSensors: any
) => {
  setSecondMap(sensorsGroupData.name)
  const sensorItems = getSensorItems(undefined, siteList, groupMarker.title)
  // moist props
  let moistId: any = { value: 0 }
  let moistInvalidChartData: any = []
  let moistBoundsArray: any = []
  let moistChartData: any = []
  const countMoistFuel = sensorItems.filter((sensorItem: any) => sensorItem.markerType === 'moist-fuel').length;
  // temp props
  let tempId: any = { value: 0 };
  let tempChartData: any = []
  let tempBoundsArray: any = []
  let tempInvalidChartData: any = []
  const countTemp = sensorItems.filter((sensorItem: any) => sensorItem.markerType === 'temp-rh-v2').length;
  // wxet props
  let wxetId: any = { value: 0 };
  let wxetData: any = []
  let wxetBoundsArray: any = []
  let wxetInvalidChartData: any = []
  const countWxet = sensorItems.filter((sensorItem: any) => sensorItem.markerType === 'wxet').length;
  sensorItems.map((sensorItem: any) => {
    if (sensorItem.markerType === 'moist-fuel') {
      setAmountOfSensors(amountOfSensors += 1)
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
        moistBoundsArray,
        countMoistFuel
      )
    } else if (sensorItem.markerType === 'wxet') {
      setAmountOfSensors(amountOfSensors += 1)
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
        wxetInvalidChartData,
        countWxet
      )
    } else if (sensorItem.markerType === 'temp-rh-v2') {
      setAmountOfSensors(amountOfSensors += 1)
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
        tempInvalidChartData,
        countTemp
      )
    } else {
      // createSensorsMarkers(sensorItem, map, setSensorName, setSensorId, setSensorType, setIsModalOpen, setIsChartDataIsLoading, setIsSelectDisabled, setChartData, existingMarkers)
    }
    pushAllCoordinates(
      sensorItem,
      allCoordinatesOfMarkers,
      siteList,
      setIsAllCoordinatesOfMarkersAreReady,
      groupMarker.title
    )
  })
  groupMarker.setMap(null)
}