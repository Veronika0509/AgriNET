import { useState, useEffect } from "react"
import { getLayers } from "../data/getLayers"
import type { Layer, LayerMapping } from "../types"

export interface UseLayersReturn {
  layers: Layer[]
  layerMapping: LayerMapping
  isLoadingLayers: boolean
  selectedLayer: string
  setSelectedLayer: (layer: string) => void
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
  setLayerMapping: React.Dispatch<React.SetStateAction<LayerMapping>>
}

/**
 * Custom hook for managing layer data and state
 */
export const useLayers = (): UseLayersReturn => {
  const [layers, setLayers] = useState<Layer[]>([])
  const [layerMapping, setLayerMapping] = useState<LayerMapping>({})
  const [isLoadingLayers, setIsLoadingLayers] = useState<boolean>(false)
  const [selectedLayer, setSelectedLayer] = useState<string>("")

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
    layerMapping,
    isLoadingLayers,
    selectedLayer,
    setSelectedLayer,
    setLayers,
    setLayerMapping,
  }
}