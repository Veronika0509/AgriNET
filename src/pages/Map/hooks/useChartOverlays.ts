import { useState, useEffect, useRef } from "react"
import React from "react"
import { useHistory } from "react-router-dom"
import type { SensorData, Site } from "../../../types"
import type { OverlayItem } from "../types/OverlayItem"
import { initializeMoistCustomOverlay } from "../components/types/moist/MoistCustomOverlay"
import { initializeWxetCustomOverlay } from "../components/types/wxet/WxetCustomOverlay"
import { initializeTempCustomOverlay } from "../components/types/temp/TempCustomOverlay"
import { initializeValveCustomOverlay } from "../components/types/valve/ValveCustomOverlay"
import { initializeFuelCustomOverlay } from "../components/types/wxet/FuelCustomOverlay"
import { initializeExtlCustomOverlay } from "../components/types/extl/ExtlCustomOverlay"
import { createMoistChartForOverlay } from "../functions/types/moist/createMoistChartForOverlay"
import { createTempChartForOverlay } from "../functions/types/temp/createTempChartForOverlay"
import { createValveChartForOverlay } from "../functions/types/valve/createValveChartForOverlay"
import { createFuelChartForOverlay } from "../functions/types/wxet/createFuelChartForOverlay"
import { addOverlayToOverlaysArray } from "../functions/types/moist/addOverlayToOverlaysArray"
import invalidChartDataImage from "../../../assets/images/invalidChartData.png"

interface ChartDataItem {
  sensorId: string | number
  markerType?: string
  [key: string]: unknown
}

interface ExtlSensorData {
  sensorId: string | number
  name?: string
  lat: number
  lng: number
  graphic?: unknown
  width?: number
  height?: number
  [key: string]: unknown
}

interface ExtlBounds {
  lat: number
  lng: number
  [key: string]: unknown
}

type ExtlDataContainerItem = [ExtlSensorData, ExtlBounds]

interface ChartRoot {
  dispose: () => void
  [key: string]: unknown
}

interface UseChartOverlaysProps {
  isGoogleApiLoaded: boolean
  map: google.maps.Map | null
  setChartData: React.Dispatch<React.SetStateAction<SensorData[]>>
  setPage: React.Dispatch<React.SetStateAction<number>>
  setSiteId: React.Dispatch<React.SetStateAction<any>>
  setSiteName: React.Dispatch<React.SetStateAction<string>>
  setAdditionalChartData: React.Dispatch<React.SetStateAction<SensorData[]>>
  setChartPageType: React.Dispatch<React.SetStateAction<any>>
  siteList: Site[]
  userId: number
  present: any
  setActiveOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
}

/**
 * Custom hook for managing all chart overlays (Moist, Temp, Valve, Fuel/Wxet, Extl)
 * Consolidates ~500 lines of duplicated overlay creation logic
 */
export const useChartOverlays = (props: UseChartOverlaysProps) => {
  const history = useHistory()

  // Moist Marker Chart state
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [moistOverlays, setMoistOverlays] = useState<OverlayItem[]>([])
  const moistOverlaysRef = useRef<any[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | number>(0)

  // Temp type state
  const [tempChartDataContainer, setTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [tempOverlays, setTempOverlays] = useState<OverlayItem[]>([])

  // Valve type state
  const [valveChartDataContainer, setValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [valveOverlays, setValveOverlays] = useState<OverlayItem[]>([])

  // Wxet/Fuel type state
  const [wxetDataContainer, setWxetDataContainer] = useState<ChartDataItem[]>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState<ChartDataItem[]>([])
  const [fuelOverlays, setFuelOverlays] = useState<OverlayItem[]>([])

  // Extl type state
  const [extlDataContainer, setExtlDataContainer] = useState<ExtlDataContainerItem[]>([])

  // Constants
  const isMoistMarkerChartDrawn: boolean = false
  const isTempMarkerChartDrawn: boolean = false
  const isValveMarkerChartDrawn: boolean = false
  const isFuelMarkerChartDrawn: boolean = false

  // Moist Marker Chart - Valid data
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {
      moistChartDataContainer.map((chartData: ChartDataItem) => {
        const MoistCustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new MoistCustomOverlayExport(
          false,
          chartData[1],
          invalidChartDataImage,
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [moistChartDataContainer])

  // Moist Marker Chart - Invalid data
  useEffect(() => {
    if (invalidMoistChartDataContainer.length !== 0) {
      invalidMoistChartDataContainer.map((chartData: ChartDataItem) => {
        const CustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new CustomOverlayExport(
          false,
          chartData[1],
          invalidChartDataImage,
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [invalidMoistChartDataContainer])

  // Moist Marker Chart - Render charts
  useEffect(() => {
    if (moistOverlays.length !== 0) {
      let roots: ChartRoot[] = []
      moistOverlays.map((moistOverlay: OverlayItem) => {
        createMoistChartForOverlay("m", moistOverlay.chartData, roots, moistOverlays)
      })
      return () => {
        roots.forEach((root) => root.dispose())
        roots = []
      }
    }
    return undefined
  }, [moistOverlays])

  // Wxet/Fuel Marker - Valid data
  useEffect(() => {
    if (wxetDataContainer.length !== 0) {
      wxetDataContainer.map((data: ChartDataItem) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === "wxet") {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            (data: unknown) => props.setChartData(data as SensorData[]),
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
          )
        } else if (data[0].markerType === "fuel") {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays,
          )
        }
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [wxetDataContainer])

  // Wxet/Fuel Marker - Invalid data
  useEffect(() => {
    if (invalidWxetDataContainer.length !== 0) {
      invalidWxetDataContainer.map((data: ChartDataItem) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === "wxet") {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData,
            history,
            data[1],
            false,
            data[0],
            props.setChartPageType,
          )
        } else if (data[0].markerType === "fuel") {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays,
          )
        }

        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [invalidWxetDataContainer])

  // Fuel Marker - Render charts
  useEffect(() => {
    if (fuelOverlays.length !== 0) {
      const roots: ChartRoot[] = []
      fuelOverlays.map((fuelOverlay: OverlayItem) => {
        createFuelChartForOverlay(fuelOverlay.chartData, roots, fuelOverlays)
      })

      return () => {
        roots.forEach((root) => root.dispose())
      }
    }
    return undefined
  }, [fuelOverlays])

  // Temp Marker - Valid data
  useEffect(() => {
    if (tempChartDataContainer.length !== 0) {
      tempChartDataContainer.map((chartData: ChartDataItem) => {
        const TempCustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!TempCustomOverlayExport) return
        const overlay = new TempCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          props.present,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [tempChartDataContainer])

  // Temp Marker - Invalid data
  useEffect(() => {
    if (invalidTempChartDataContainer.length !== 0) {
      invalidTempChartDataContainer.map((chartData: ChartDataItem) => {
        const CustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!CustomOverlayExport) return
        const overlay = new CustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          props.present,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
    return undefined
  }, [invalidTempChartDataContainer])

  // Temp Marker - Render charts
  useEffect(() => {
    if (tempOverlays.length !== 0) {
      const roots: ChartRoot[] = []
      tempOverlays.map((tempOverlay: OverlayItem) => {
        createTempChartForOverlay(tempOverlay.chartData, roots, tempOverlays)
      })

      return () => {
        roots.forEach((root) => root.dispose())
      }
    }
    return undefined
  }, [tempOverlays])

  // Valve Marker - Valid data
  useEffect(() => {
    if (valveChartDataContainer.length !== 0) {
      valveChartDataContainer.map((chartData: ChartDataItem) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [valveChartDataContainer])

  // Valve Marker - Invalid data
  useEffect(() => {
    if (invalidValveChartDataContainer.length !== 0) {
      invalidValveChartDataContainer.map((chartData: ChartDataItem) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
    return undefined
  }, [invalidValveChartDataContainer])

  // Valve Marker - Render charts
  useEffect(() => {
    if (valveOverlays.length !== 0) {
      const roots: ChartRoot[] = []
      valveOverlays.map((valveOverlay: OverlayItem) => {
        createValveChartForOverlay(valveOverlay.chartData, roots, valveOverlays)
      })

      return () => {
        roots.forEach((root) => root.dispose())
      }
    }
    return undefined
  }, [valveOverlays])

  // EXTL Marker
  useEffect(() => {
    if (extlDataContainer.length !== 0) {
      extlDataContainer.map((data: ExtlDataContainerItem) => {
        const ExtlCustomOverlayExport = initializeExtlCustomOverlay(props.isGoogleApiLoaded)
        if (!ExtlCustomOverlayExport) return

        const extlItem: ExtlSensorData = data[0]

        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(extlItem.lat - 0.001, extlItem.lng - 0.001),
          new google.maps.LatLng(extlItem.lat + 0.001, extlItem.lng + 0.001),
        )

        const extlChartData = {
          id: extlItem.sensorId,
          layerName: "EXTL",
          name: extlItem.name || `Sensor ${extlItem.sensorId}`,
          graphic: extlItem.graphic,
          chartType: "default",
          width: extlItem.width,
          height: extlItem.height,
          sensorId: extlItem.sensorId,
          mainId: extlItem.mainId,
        }

        const overlay = new ExtlCustomOverlayExport(bounds, extlChartData)
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [extlDataContainer])

  return {
    // State
    moistChartDataContainer,
    setMoistChartDataContainer,
    invalidMoistChartDataContainer,
    setInvalidMoistChartDataContainer,
    moistOverlays,
    setMoistOverlays,
    moistOverlaysRef,
    tempChartDataContainer,
    setTempChartDataContainer,
    invalidTempChartDataContainer,
    setInvalidTempChartDataContainer,
    tempOverlays,
    setTempOverlays,
    valveChartDataContainer,
    setValveChartDataContainer,
    invalidValveChartDataContainer,
    setInvalidValveChartDataContainer,
    valveOverlays,
    setValveOverlays,
    wxetDataContainer,
    setWxetDataContainer,
    invalidWxetDataContainer,
    setInvalidWxetDataContainer,
    fuelOverlays,
    setFuelOverlays,
    extlDataContainer,
    setExtlDataContainer,
    // Constants
    moistChartsAmount: [] as ChartDataItem[],
    tempChartsAmount: [] as ChartDataItem[],
    valveChartsAmount: [] as ChartDataItem[],
    wxetChartsAmount: [] as ChartDataItem[],
    extlChartsAmount: [] as ChartDataItem[],
  }
}
