import {getSensorItems} from "../data/getSensorItems";
import {pushAllCoordinates} from "./pushAllCoordinates";
import {createMoistMarker} from "./types/moist/createMoistMarker";
import {createWxetMarker} from "./types/wxet/createWxetMarker";
import {createTempMarker} from "./types/temp/createTempMarker";
import {createValveMarker} from "./types/valve/createValveMarker";

export const onSiteClick = async (props: any) => {
  props.markers.map((marker: any) => {
    marker.visible = false
    marker.setMap(null)
    marker.infoWindow.close()
  })

  props.setSecondMap(props.sensorsGroupData.name)
  // const sensorItems = getSensorItems(undefined, props.siteList, props.groupMarker.title)
  // moist props
  let moistId: any = { value: 0 }
  let moistChartData: any = []
  let moistBoundsArray: any = []
  let moistInvalidChartData: any = []
  let countMoistFuel: any = []
  // temp props
  let tempId: any = { value: 0 };
  let tempChartData: any = []
  let tempBoundsArray: any = []
  let tempInvalidChartData: any = []
  let countTemp: any = []
  // wxet props
  let wxetId: any = { value: 0 };
  let wxetData: any = []
  let wxetBoundsArray: any = []
  let wxetInvalidChartData: any = []
  let countWxet: any = []
  // valve props
  let valveId: any = { value: 0 };
  let valveChartData: any = []
  let valveBoundsArray: any = []
  let valveInvalidChartData: any = []
  let countValve: any = []
  props.siteList.map((site: any) => {
    if (site.name === props.groupMarker.title) {
      site.layers.map((layer: any) => {
        if (layer.name === 'Moist' || layer.name === 'moist') {
          layer.markers.map((marker: any) => {
            if (!countMoistFuel.some((item: any) => item.sensorId === marker.sensorId)) {
              countMoistFuel.push(marker)
            }
          })
        } else if (layer.name === 'SoilTemp') {
          layer.markers.map((marker: any) => {
            if (!countTemp.some((item: any) => item.sensorId === marker.sensorId)) {
              countTemp.push(marker)
            }
          })
        } else if (layer.name === 'WXET') {
          layer.markers.map((marker: any) => {
            if (!countWxet.some((item: any) => item.sensorId === marker.sensorId)) {
              countWxet.push(marker)
            }
          })
        } else if (layer.name === 'Valve') {
          layer.markers.map((marker: any) => {
            if (!countValve.some((item: any) => item.sensorId === marker.sensorId)) {
              countValve.push(marker)
            }
          })
        }
      })
    }
  })
  countMoistFuel.length !== 0 && countMoistFuel.map((marker: any) => {
    props.setAmountOfSensors(props.amountOfSensors += 1)
    createMoistMarker(
      props.moistChartsAmount,
      marker,
      props.page,
      props.userId,
      props.setInvalidMoistChartDataContainer,
      props.setMoistChartDataContainer,
      moistId,
      moistInvalidChartData,
      moistChartData,
      moistBoundsArray,
      countMoistFuel.length
    )
    pushAllCoordinates(
      marker,
      props.allCoordinatesOfMarkers,
      props.siteList,
      props.setCoordinatesForFitting,
      props.groupMarker.title,
      'Moist'
    )
  })
  countWxet.length !== 0 && countWxet.map((marker: any) => {
    props.setAmountOfSensors(props.amountOfSensors += 1)
    createWxetMarker(
      props.wxetChartsAmount,
      marker,
      props.page,
      props.userId,
      props.setInvalidWxetDataContainer,
      props.setWxetDataContainer,
      wxetId,
      wxetData,
      wxetBoundsArray,
      wxetInvalidChartData,
      countWxet.length
    )
    pushAllCoordinates(
      marker,
      props.allCoordinatesOfMarkers,
      props.siteList,
      props.setCoordinatesForFitting,
      props.groupMarker.title,
      'WXET'
    )
  })
  countTemp.length !== 0 && countTemp.map((marker: any) => {
    props.setAmountOfSensors(props.amountOfSensors += 1)
    createTempMarker(
      props.tempChartsAmount,
      marker,
      props.page,
      props.userId,
      props.setInvalidTempChartDataContainer,
      props.setTempChartDataContainer,
      tempId,
      tempChartData,
      tempBoundsArray,
      tempInvalidChartData,
      countTemp.length
    )
    pushAllCoordinates(
      marker,
      props.allCoordinatesOfMarkers,
      props.siteList,
      props.setCoordinatesForFitting,
      props.groupMarker.title,
      'SoilTemp'
    )
  })
  countValve.length !== 0 && countValve.map((marker: any) => {
    props.setAmountOfSensors(props.amountOfSensors += 1)
    createValveMarker(
      props.valveChartsAmount,
      marker,
      props.page,
      props.userId,
      props.setInvalidValveChartDataContainer,
      props.setValveChartDataContainer,
      valveId,
      valveChartData,
      valveBoundsArray,
      valveInvalidChartData,
      countValve.length
    )
    pushAllCoordinates(
      marker,
      props.allCoordinatesOfMarkers,
      props.siteList,
      props.setCoordinatesForFitting,
      props.groupMarker.title,
      'Valve'
    )
  })
}