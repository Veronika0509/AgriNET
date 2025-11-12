
import {pushAllCoordinates} from "./pushAllCoordinates";
import {createMoistMarker} from "./types/moist/createMoistMarker";
import {createWxetMarker} from "./types/wxet/createWxetMarker";
import {createTempMarker} from "./types/temp/createTempMarker";
import {createValveMarker} from "./types/valve/createValveMarker";
import {createExtlMarker} from "./types/extl/createExtlMarker";

interface Marker {
  sensorId: string | number;
  visible: boolean;
  setMap: (map: google.maps.Map | null) => void;
  infoWindow: google.maps.InfoWindow;
  lat: number;
  lng: number;
  id: string | number;
  [key: string]: unknown;
}

interface Layer {
  name: string;
  markers: Marker[];
}

interface Site {
  name: string;
  layers: Layer[];
}

interface GroupMarker {
  title: string;
}

interface SensorsGroupData {
  name: string;
}

interface IdCounter {
  value: number;
}

interface OnSiteClickProps {
  markers: Marker[];
  setSecondMap: (name: string) => void;
  sensorsGroupData: SensorsGroupData;
  siteList: Site[];
  groupMarker: GroupMarker;
  setAmountOfSensors: (amount: number) => void;
  amountOfSensors: number;
  page: string | number;
  userId: string | number;
  moistChartsAmount: number;
  wxetChartsAmount: number;
  extlChartsAmount: number;
  tempChartsAmount: number;
  valveChartsAmount: number;
  setInvalidMoistChartDataContainer: (data: unknown[]) => void;
  setMoistChartDataContainer: (data: unknown[]) => void;
  setInvalidWxetDataContainer: (data: unknown[]) => void;
  setWxetDataContainer: (data: unknown[]) => void;
  setExtlDataContainer: (data: unknown[]) => void;
  setInvalidTempChartDataContainer: (data: unknown[]) => void;
  setTempChartDataContainer: (data: unknown[]) => void;
  setInvalidValveChartDataContainer: (data: unknown[]) => void;
  setValveChartDataContainer: (data: unknown[]) => void;
  allCoordinatesOfMarkers: { lat: number; lng: number; id: string | number; mainId: string | number }[];
  setCoordinatesForFitting: (coords: { lat: number; lng: number; id: string | number; mainId: string | number }[]) => void;
  setAllCoordinatesOfMarkers: (coords: { lat: number; lng: number; id: string | number; mainId: string | number }[]) => void;
}

export const onSiteClick = async (props: OnSiteClickProps): Promise<void> => {

  props.markers.map((marker: Marker) => {
    marker.visible = false
    marker.setMap(null)
    marker.infoWindow.close()
  })
  props.setSecondMap(props.sensorsGroupData.name)
  // const sensorItems = getSensorItems(undefined, props.siteList, props.groupMarker.title)
  // moist props
  const moistId: IdCounter = { value: 0 }
  const moistChartData: unknown[] = []
  const moistBoundsArray: unknown[] = []
  const moistInvalidChartData: unknown[] = []
  const countMoistFuel: Marker[] = []
  // temp props
  const tempId: IdCounter = { value: 0 };
  const tempChartData: unknown[] = []
  const tempBoundsArray: unknown[] = []
  const tempInvalidChartData: unknown[] = []
  const countTemp: Marker[] = []
  // wxet props
  const wxetId: IdCounter = { value: 0 };
  const wxetData: unknown[] = []
  const wxetBoundsArray: unknown[] = []
  const wxetInvalidChartData: unknown[] = []
  const countWxet: Marker[] = []
  // extl props
  const extlId: IdCounter = { value: 0 };
  const extlData: unknown[] = []
  const extlBoundsArray: unknown[] = []
  const extlInvalidChartData: unknown[] = []
  const countExtl: Marker[] = []
  // valve props
  const valveId: IdCounter = { value: 0 };
  const valveChartData: unknown[] = []
  const valveBoundsArray: unknown[] = []
  const valveInvalidChartData: unknown[] = []
  const countValve: Marker[] = []

  props.siteList.map((site: Site) => {

    if (site.name === props.groupMarker.title) {

      site.layers.map((layer: Layer) => {
        if (layer.name === 'Moist' || layer.name === 'moist') {
          layer.markers.map((marker: Marker) => {
            if (!countMoistFuel.some((item: Marker) => item.id === marker.id)) {
              countMoistFuel.push(marker)
            }
          })
        } else if (layer.name === 'SoilTemp') {
          layer.markers.map((marker: Marker) => {
            if (!countTemp.some((item: Marker) => item.id === marker.id)) {
              countTemp.push(marker)
            }
          })
        } else if (layer.name === 'WXET') {
          layer.markers.map((marker: Marker) => {
            if (!countWxet.some((item: Marker) => item.id === marker.id)) {
              countWxet.push(marker)
            }
          })
        } else if (layer.name === 'Valve') {
          layer.markers.map((marker: Marker) => {
            if (!countValve.some((item: Marker) => item.id === marker.id)) {
              countValve.push(marker)
            }
          })
        } else if (layer.name === 'EXTL') {
          layer.markers.map((marker: Marker) => {
            if (!countExtl.some((item: Marker) => item.id === marker.id)) {
              countExtl.push(marker)
            }
          })
        }
      })
    }
  })

  countMoistFuel.length !== 0 && countMoistFuel.map((marker: Marker) => {
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
      props.setAllCoordinatesOfMarkers,
      props.groupMarker.title,
      'Moist'
    )
  })
  countWxet.length !== 0 && countWxet.map((marker: Marker) => {
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
      props.setAllCoordinatesOfMarkers,
      props.groupMarker.title,
      'WXET'
    )
  })
  countExtl.length !== 0 && countExtl.map((marker: Marker) => {
    props.setAmountOfSensors(props.amountOfSensors += 1)
    createExtlMarker(
      props.extlChartsAmount,
      marker,
      props.page,
      props.setExtlDataContainer,
      extlId,
      extlData,
      extlBoundsArray,
      countExtl.length
    )
    pushAllCoordinates(
      marker,
      props.allCoordinatesOfMarkers,
      props.siteList,
      props.setCoordinatesForFitting,
      props.setAllCoordinatesOfMarkers,
      props.groupMarker.title,
      'EXTL'
    )
  })
  countTemp.length !== 0 && countTemp.map((marker: Marker) => {
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
      props.setAllCoordinatesOfMarkers,
      props.groupMarker.title,
      'SoilTemp'
    )
  })
  countValve.length !== 0 && countValve.map((marker: Marker) => {
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
      props.setAllCoordinatesOfMarkers,
      props.groupMarker.title,
      'Valve'
    )
  })
}