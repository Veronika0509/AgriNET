import type { Layer, LayerMapping, NewLayerConfigData } from "../types"
import { isLayerNameValid } from "../utils/validation"
import { getLayers } from "../data/getLayers"

export interface CreateLayerOptions {
  layerName: string
  markerType?: string
  table?: string
  column?: string
  layers: Layer[]
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
  setLayerMapping: React.Dispatch<React.SetStateAction<LayerMapping>>
  setSelectedLayer: (layer: string) => void
  presentAlert: (options: any) => Promise<void>
}

export interface HandleFinishNewLayerOptions {
  newLayerName: string
  newLayerMarkerType: string
  newLayerTable: string
  newLayerColumn: string
  layers: Layer[]
  presentEmptyNameAlert: (options: any) => void
  handleCreateNewLayer: (
    layerName: string,
    markerType?: string,
    table?: string,
    column?: string,
  ) => Promise<{ id: string; name: string; value: string } | null>
  setNewLayerConfigData: (data: NewLayerConfigData | undefined) => void
  setIsNewLayerModalOpen: (open: boolean) => void
}

export interface ShowCreateLayerAlertOptions {
  setNewLayerName: (name: string) => void
  setNewLayerMarkerType: (type: string) => void
  setNewLayerTable: (table: string) => void
  setNewLayerColumn: (column: string) => void
  setIsNewLayerModalOpen: (open: boolean) => void
}

export interface ToggleLayerOptions {
  layerId: string
  isChecked: boolean
  secondMap: google.maps.Map | null
  siteList: any[]
}

/**
 * Creates a new layer and saves it to the backend
 */
export const handleCreateNewLayer = async (
  options: CreateLayerOptions,
): Promise<{ id: string; name: string; value: string } | null> => {
  const {
    layerName,
    markerType,
    table,
    column,
    layers,
    setLayers,
    setLayerMapping,
    setSelectedLayer,
    presentAlert,
  } = options

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
      console.error("Error showing alert:", error)
    }
    return null
  }

  try {
    const trimmedName = layerName.trim()

    // Create new layer object
    const newLayer = {
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
    console.error("Error creating layer:", error)
    throw error
  }
}

/**
 * Shows the create new layer modal
 */
export const showCreateNewLayerAlert = (options: ShowCreateLayerAlertOptions) => {
  const { setNewLayerName, setNewLayerMarkerType, setNewLayerTable, setNewLayerColumn, setIsNewLayerModalOpen } =
    options

  // Reset form fields
  setNewLayerName("")
  setNewLayerMarkerType("fuel")
  setNewLayerTable("")
  setNewLayerColumn("")

  // Open modal
  setIsNewLayerModalOpen(true)
}

/**
 * Handles layer creation from the modal
 */
export const handleFinishNewLayer = async (options: HandleFinishNewLayerOptions) => {
  const {
    newLayerName,
    newLayerMarkerType,
    newLayerTable,
    newLayerColumn,
    layers,
    presentEmptyNameAlert,
    handleCreateNewLayer,
    setNewLayerConfigData,
    setIsNewLayerModalOpen,
  } = options

  const layerName = newLayerName.trim()
  const markerType = newLayerMarkerType.trim()
  const table = newLayerTable.trim()
  const column = newLayerColumn.trim()

  // Validate Layer Name
  if (!layerName) {
    presentEmptyNameAlert({
      header: "Validation Error",
      message: "Layer name should not be empty",
      buttons: ["OK"],
    })
    return
  }

  // Validate Marker Type
  if (!markerType) {
    presentEmptyNameAlert({
      header: "Validation Error",
      message: "Marker Type should be selected",
      buttons: ["OK"],
    })
    return
  }

  // Validate Table
  if (!table) {
    presentEmptyNameAlert({
      header: "Validation Error",
      message: "Table should not be empty",
      buttons: ["OK"],
    })
    return
  }

  // Validate Column
  if (!column) {
    presentEmptyNameAlert({
      header: "Validation Error",
      message: "Column should not be empty",
      buttons: ["OK"],
    })
    return
  }

  // Check if layer with this name already exists
  const layerExists = layers.some((layer) => layer.name.toLowerCase() === layerName.toLowerCase())

  if (layerExists) {
    presentEmptyNameAlert({
      header: "Error",
      message: "A layer with this name already exists",
      buttons: ["OK"],
    })
    return
  }

  // Create the layer
  try {
    const result = await handleCreateNewLayer(layerName, markerType, table, column)

    if (result !== null) {
      // Save new layer config data
      setNewLayerConfigData({
        table: table,
        column: column,
        markerType: markerType,
      })

      // Close modal on success
      setIsNewLayerModalOpen(false)
    }
  } catch (error) {
    presentEmptyNameAlert({
      header: "Error",
      message: "Failed to create layer",
      buttons: ["OK"],
    })
  }
}

/**
 * Toggles layer visibility on the map
 */
export const handleToggleLayer = (_options: ToggleLayerOptions) => {
  // This function would handle showing/hiding markers for a specific layer
  // The implementation depends on how markers are stored and managed
  // For now, we'll just log the toggle action

  // TODO: Implement actual layer visibility toggle logic
  // This would typically involve:
  // 1. Finding all markers associated with this layer
  // 2. Calling setMap(map) or setMap(null) on each marker
  // 3. Updating the visibility state
}