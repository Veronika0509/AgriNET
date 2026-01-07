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
  sensorId: string
  markerType?: string
  [key: string]: unknown
}

interface ChartBounds {
  lat: number
  lng: number
  [key: string]: unknown
}

// Tuple type for chart data containers
type ChartDataTuple = [ChartDataItem, ChartBounds]

interface ExtlSensorData {
  sensorId: string
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
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<ChartDataTuple[]>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState<ChartDataTuple[]>([])
  const [moistOverlays, setMoistOverlays] = useState<OverlayItem[]>([])
  const moistOverlaysRef = useRef<any[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | number>(0)

  // Temp type state
  const [tempChartDataContainer, setTempChartDataContainer] = useState<ChartDataTuple[]>([])
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState<ChartDataTuple[]>([])
  const [tempOverlays, setTempOverlays] = useState<OverlayItem[]>([])

  // Valve type state
  const [valveChartDataContainer, setValveChartDataContainer] = useState<ChartDataTuple[]>([])
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState<ChartDataTuple[]>([])
  const [valveOverlays, setValveOverlays] = useState<OverlayItem[]>([])

  // Wxet/Fuel type state
  const [wxetDataContainer, setWxetDataContainer] = useState<ChartDataTuple[]>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState<ChartDataTuple[]>([])
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
      moistChartDataContainer.map((chartData: ChartDataTuple) => {
        const MoistCustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new MoistCustomOverlayExport(
          false,
          chartData[1] as any,
          invalidChartDataImage,
          true,
          chartData[0] as any,
          props.setChartData as any,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history as any,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData as any,
          props.siteList as any,
          setMoistOverlays as any,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as unknown as OverlayItem, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [moistChartDataContainer])

  // Moist Marker Chart - Invalid data
  useEffect(() => {
    if (invalidMoistChartDataContainer.length !== 0) {
      invalidMoistChartDataContainer.map((chartData: ChartDataTuple) => {
        const CustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new CustomOverlayExport(
          false,
          chartData[1] as any,
          invalidChartDataImage,
          false,
          chartData[0] as any,
          props.setChartData as any,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history as any,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData as any,
          props.siteList as any,
          setMoistOverlays as any,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as unknown as OverlayItem, props.setActiveOverlays, props.map)
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
        createMoistChartForOverlay("m", moistOverlay.chartData as any, roots as any, moistOverlays as any)
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
      wxetDataContainer.map((data: ChartDataTuple) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === "wxet") {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            (data: unknown) => props.setChartData(data as SensorData[]),
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData as any,
            history as any,
            data[1] as any,
            true,
            data[0] as any,
            props.setChartPageType,
          ) as any
        } else if (data[0].markerType === "fuel") {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData as any,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history as any,
            data[1] as any,
            true,
            data[0] as any,
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays as any,
          ) as any
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
      invalidWxetDataContainer.map((data: ChartDataTuple) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === "wxet") {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            props.setChartData as any,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData as any,
            history as any,
            data[1] as any,
            false,
            data[0] as any,
            props.setChartPageType,
          ) as any
        } else if (data[0].markerType === "fuel") {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData as any,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history as any,
            data[1] as any,
            false,
            data[0] as any,
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays as any,
          ) as any
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
        createFuelChartForOverlay(fuelOverlay.chartData as any, roots as any, fuelOverlays as any)
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
      tempChartDataContainer.map((chartData: ChartDataTuple) => {
        const TempCustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!TempCustomOverlayExport) return
        const overlay = new TempCustomOverlayExport(
          chartData[1] as any,
          true,
          chartData[0] as any,
          props.setChartData as any,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData as any,
          setTempOverlays as any,
          props.setChartPageType,
          props.userId,
          props.present,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as unknown as OverlayItem, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [tempChartDataContainer])

  // Temp Marker - Invalid data
  useEffect(() => {
    if (invalidTempChartDataContainer.length !== 0) {
      invalidTempChartDataContainer.map((chartData: ChartDataTuple) => {
        const CustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!CustomOverlayExport) return
        const overlay = new CustomOverlayExport(
          chartData[1] as any,
          false,
          chartData[0] as any,
          props.setChartData as any,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData as any,
          setTempOverlays as any,
          props.setChartPageType,
          props.userId,
          props.present,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as unknown as OverlayItem, props.setActiveOverlays, props.map)
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
        createTempChartForOverlay(tempOverlay.chartData as any, roots as any, tempOverlays as any)
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
      valveChartDataContainer.map((chartData: ChartDataTuple) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1] as any,
          true,
          chartData[0] as any,
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays as any,
          props.userId,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as unknown as OverlayItem, props.setActiveOverlays, props.map)
          })
        }
      })
    }
  }, [valveChartDataContainer])

  // Valve Marker - Invalid data
  useEffect(() => {
    if (invalidValveChartDataContainer.length !== 0) {
      invalidValveChartDataContainer.map((chartData: ChartDataTuple) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1] as any,
          false,
          chartData[0] as any,
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays as any,
          props.userId,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as unknown as OverlayItem, props.setActiveOverlays, props.map)
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
        createValveChartForOverlay(valveOverlay.chartData as any, roots as any, valveOverlays as any)
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

        const overlay = new ExtlCustomOverlayExport(data[1] as any, extlChartData as any)
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay as any, props.setActiveOverlays, props.map)
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
    // Constants - return empty arrays to be populated by marker creation functions
    moistChartsAmount: [] as any[],
    tempChartsAmount: [] as any[],
    valveChartsAmount: [] as any[],
    wxetChartsAmount: [] as any[],
    extlChartsAmount: [] as any[],
  }
}
