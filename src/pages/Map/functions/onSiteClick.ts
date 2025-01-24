import {getSensorItems} from "../data/getSensorItems";
import {pushAllCoordinates} from "./pushAllCoordinates";
import {createMoistMarker} from "./types/moist/createMoistMarker";
import {createWxetMarker} from "./types/wxet/createWxetMarker";
import {createTempMarker} from "./types/temp/createTempMarker";
import {createValveMarker} from "./types/valve/createValveMarker";

export const onSiteClick = async (props: any) => {
  props.setSecondMap(props.sensorsGroupData.name)
  const sensorItems = getSensorItems(undefined, props.siteList, props.groupMarker.title)
  // moist props
  let moistId: any = { value: 0 }
  let moistChartData: any = []
  let moistBoundsArray: any = []
  let moistInvalidChartData: any = []
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
  // valve props
  let valveId: any = { value: 0 };
  let valveChartData: any = []
  let valveBoundsArray: any = []
  let valveInvalidChartData: any = []
  const countValve = sensorItems.filter((sensorItem: any) => sensorItem.markerType === 'valve').length;
  console.log(sensorItems)
  sensorItems.map((sensorItem: any) => {
    if (sensorItem.markerType === 'moist-fuel') {
      props.setAmountOfSensors(props.amountOfSensors += 1)
      createMoistMarker(
        props.moistChartsAmount,
        sensorItem,
        props.page,
        props.userId,
        props.setInvalidMoistChartDataContainer,
        props.setMoistChartDataContainer,
        moistId,
        moistInvalidChartData,
        moistChartData,
        moistBoundsArray,
        countMoistFuel
      )
    } else if (sensorItem.markerType === 'wxet') {
      props.setAmountOfSensors(props.amountOfSensors += 1)
      createWxetMarker(
        props.wxetChartsAmount,
        sensorItem,
        props.page,
        props.userId,
        props.setInvalidWxetDataContainer,
        props.setWxetDataContainer,
        wxetId,
        wxetData,
        wxetBoundsArray,
        wxetInvalidChartData,
        countWxet
      )
    } else if (sensorItem.markerType === 'temp-rh-v2') {
      props.setAmountOfSensors(props.amountOfSensors += 1)
      createTempMarker(
        props.tempChartsAmount,
        sensorItem,
        props.page,
        props.userId,
        props.setInvalidTempChartDataContainer,
        props.setTempChartDataContainer,
        tempId,
        tempChartData,
        tempBoundsArray,
        tempInvalidChartData,
        countTemp
      )
    } else if (sensorItem.markerType === 'valve') {
      props.setAmountOfSensors(props.amountOfSensors += 1)
      createValveMarker(
        props.valveChartsAmount,
        sensorItem,
        props.page,
        props.userId,
        props.setInvalidValveChartDataContainer,
        props.setValveChartDataContainer,
        valveId,
        valveChartData,
        valveBoundsArray,
        valveInvalidChartData,
        countValve
      )
    } else {
      // createSensorsMarkers(sensorItem, map, setSensorName, setSensorId, setSensorType, setIsModalOpen, setIsChartDataIsLoading, setIsSelectDisabled, setChartData, existingMarkers)
    }
    pushAllCoordinates(
      sensorItem,
      props.allCoordinatesOfMarkers,
      props.siteList,
      props.setIsAllCoordinatesOfMarkersAreReady,
      props.groupMarker.title
    )
  })
  props.groupMarker.setMap(null)
}