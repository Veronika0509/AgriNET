import { useState, useEffect } from "react"
import { getLayers } from "../data/getLayers"

/**
 * Custom hook for managing layer data and state
 * Handles loading layers from backend and managing layer mapping
 */
export const useLayerManagement = () => {
  const [layers, setLayers] = useState<Array<{ id: string; name: string; value: string }>>([])
  const [layerMapping, setLayerMapping] = useState<{ [key: string]: string }>({})
  const [isLoadingLayers, setIsLoadingLayers] = useState<boolean>(false)

  // New layer creation state
  const [newLayerName, setNewLayerName] = useState<string>("")
  const [newLayerMarkerType, setNewLayerMarkerType] = useState<string>("fuel")
  const [newLayerTable, setNewLayerTable] = useState<string>("")
  const [newLayerColumn, setNewLayerColumn] = useState<string>("")
  const [newLayerConfigData, setNewLayerConfigData] = useState<
    { table: string; column: string; markerType: string } | undefined
  >(undefined)

  // Load layers when component mounts
  useEffect(() => {
    const loadLayers = async () => {
      setIsLoadingLayers(true)
      try {
        const layersData = await getLayers()
        setLayers(layersData.layers)
        setLayerMapping(layersData.mapping)
      } catch (error) {
        console.error("Error loading layers:", error)
      } finally {
        setIsLoadingLayers(false)
      }
    }

    loadLayers()
  }, [])

  return {
    layers,
    setLayers,
    layerMapping,
    setLayerMapping,
    isLoadingLayers,
    newLayerName,
    setNewLayerName,
    newLayerMarkerType,
    setNewLayerMarkerType,
    newLayerTable,
    setNewLayerTable,
    newLayerColumn,
    setNewLayerColumn,
    newLayerConfigData,
    setNewLayerConfigData,
  }
}