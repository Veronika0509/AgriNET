import {getSensorItems} from "../../data/getSensorItems";
import {moistChartDataRequest} from "../../data/types/moisture/moistChartDataRequest";
import {createMoistMarker} from "../types/moisture/createMoistMarker";
import {pushAllCoordinates} from "../pushAllCoordinates";
import {createWxetMarker} from "../types/wxet/createWxetMarker";

export const onSiteClick = async (page: any,
                                  moistFuelChartsAmount: any,
                                  userId: any,
                                  setInvalidMoistChartDataContainer: any,
                                  setMoistChartDataContainer: any,
                                  allCoordinatesOfMarkers: any,
                                  setIsAllCoordinatesOfMarkersAreReady: any,
                                  siteList: any,
                                  map: any,
                                  groupMarker: any,
                                  sensorsGroupData: any,
                                  setSecondMap: any,
                                  wxetChartsAmount: any,
                                  setInvalidWxetDataContainer: any,
                                  setWxetDataContainer: any,
) => {
  setSecondMap(sensorsGroupData.name)
  await Promise.all(siteList.map(async () => {
    const sensorItems = getSensorItems(undefined, siteList)
    sensorItems.map((sensorItem: any) =>  {
      if (sensorItem.markerType === 'moist-fuel') {
        createMoistMarker(
          moistFuelChartsAmount,
          sensorItem,
          page,
          userId,
          setInvalidMoistChartDataContainer,
          setMoistChartDataContainer
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