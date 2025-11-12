/**
 * Layer management utilities
 * Handles layer creation, validation, and API operations
 */

import { getLayers } from "../data/getLayers"

export interface LayerValidationResult {
  isValid: boolean
  error?: string
}

export interface Layer {
  id: string
  name: string
  value: string
  markerType?: string
  table?: string
  column?: string
}

export interface CreateLayerParams {
  layerName: string
  markerType?: string
  table?: string
  column?: string
  layers: Layer[]
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
  setLayerMapping: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  setSelectedLayer: (layer: string) => void
  presentAlert: (options: any) => Promise<any>
}

/**
 * Validates if a layer name is valid and unique
 */
export const isLayerNameValid = (layerName: string, layers: Layer[]): LayerValidationResult => {
  if (!layerName || !layerName.trim()) {
    return { isValid: false, error: "Layer name cannot be empty" }
  }

  const trimmedName = layerName.trim()
  const layerExists = layers.some((layer) => layer.name.toLowerCase() === trimmedName.toLowerCase())

  if (layerExists) {
    return { isValid: false, error: "A layer with this name already exists" }
  }

  return { isValid: true }
}

/**
 * Creates a new layer
 */
export const handleCreateNewLayer = async (params: CreateLayerParams): Promise<Layer | null> => {
  const { layerName, markerType, table, column, layers, setLayers, setLayerMapping, setSelectedLayer, presentAlert } =
    params

  if (!layerName || !layerName.trim()) {
    return null
  }

  const validation = isLayerNameValid(layerName, layers)

  if (!validation.isValid) {
    try {
      await presentAlert({
        header: "Error",
        message: validation.error || "Invalid layer name",
        buttons: ["OK"],
      })
    } catch (error) {
      // Error showing alert
    }
    return null
  }

  try {
    const trimmedName = layerName.trim()

    // Create new layer object
    const newLayer: Layer = {
      id: trimmedName.toLowerCase(),
      name: trimmedName,
      value: trimmedName.toLowerCase(),
      markerType: markerType || "fuel",
      table: table || "",
      column: column || "",
    }

    // Save layer data to backend
    try {
      const response = await fetch("https://app.agrinet.us/api/map/layers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          markerType: markerType || "fuel",
          table: table || "",
          column: column || "",
        }),
      })

      if (!response.ok) {
        console.error("Failed to save layer to backend:", response.statusText)
        throw new Error("Failed to save layer to backend")
      }

      // Reload layers from backend to get the updated list
      const layersData = await getLayers()
      setLayers(layersData.layers)
      setLayerMapping(layersData.mapping)
    } catch (apiError) {
      console.error("Error saving layer to backend:", apiError)
      // If backend save fails, add layer locally only
      setLayers((prev) => {
        const exists = prev.some((layer) => layer.id === newLayer.id)
        if (exists) {
          return prev
        }
        return [...prev, newLayer]
      })
    }

    // If markerType is provided, update the layerMapping
    if (markerType) {
      setLayerMapping((prev) => ({
        ...prev,
        [newLayer.value]: markerType.toLowerCase(),
      }))
    }

    // Select the new layer after state update
    setSelectedLayer(newLayer.value)

    return newLayer
  } catch (error) {
    throw error
  }
}