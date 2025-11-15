import { useState, useCallback } from "react"
import { useIonAlert } from "@ionic/react"
import { getLayers } from "../data/getLayers"
import type { Layer, LayerMapping } from "../types"

interface UseLayerCreationProps {
  layers: Layer[]
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
  setLayerMapping: React.Dispatch<React.SetStateAction<LayerMapping>>
}

interface ValidationResult {
  isValid: boolean
  error?: string
}

export const useLayerCreation = ({ layers, setLayers, setLayerMapping }: UseLayerCreationProps) => {
  const [presentAlert] = useIonAlert()
  const [presentEmptyNameAlert] = useIonAlert()

  // New layer creation state
  const [isNewLayerModalOpen, setIsNewLayerModalOpen] = useState<boolean>(false)
  const [newLayerName, setNewLayerName] = useState<string>("")
  const [newLayerMarkerType, setNewLayerMarkerType] = useState<string>("fuel")
  const [newLayerTable, setNewLayerTable] = useState<string>("")
  const [newLayerColumn, setNewLayerColumn] = useState<string>("")

  // Function to check if layer name is valid
  const isLayerNameValid = useCallback(
    (layerName: string): ValidationResult => {
      if (!layerName || !layerName.trim()) {
        return { isValid: false, error: "Layer name cannot be empty" }
      }

      const trimmedName = layerName.trim()
      const layerExists = layers.some((layer) => layer.name.toLowerCase() === trimmedName.toLowerCase())

      if (layerExists) {
        return { isValid: false, error: "A layer with this name already exists" }
      }

      return { isValid: true }
    },
    [layers],
  )

  // Function to create a new layer
  const handleCreateNewLayer = useCallback(
    async (
      layerName: string,
      markerType?: string,
      table?: string,
      column?: string,
    ): Promise<{ id: string; name: string; value: string } | null> => {
      if (!layerName || !layerName.trim()) {
        return null
      }

      const validation = isLayerNameValid(layerName)

      if (!validation.isValid) {
        try {
          await presentAlert({
            header: "Error",
            message: validation.error || "Invalid layer name",
            buttons: ["OK"],
          })
        } catch (error) {}
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

        return newLayer
      } catch (error) {
        throw error
      }
    },
    [isLayerNameValid, presentAlert, setLayers, setLayerMapping],
  )

  // Create New Layer Alert function
  const showCreateNewLayerAlert = useCallback(() => {
    // Reset form fields
    setNewLayerName("")
    setNewLayerMarkerType("fuel")
    setNewLayerTable("")
    setNewLayerColumn("")
    // Open modal
    setIsNewLayerModalOpen(true)
  }, [])

  // Handle new layer creation from modal
  const handleFinishNewLayer = useCallback(async () => {
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

    // For non-empty and unique names, proceed with layer creation
    try {
      const result = await handleCreateNewLayer(layerName, markerType, table, column)

      if (result !== null) {
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
  }, [
    newLayerName,
    newLayerMarkerType,
    newLayerTable,
    newLayerColumn,
    layers,
    presentEmptyNameAlert,
    handleCreateNewLayer,
  ])

  return {
    // State
    isNewLayerModalOpen,
    setIsNewLayerModalOpen,
    newLayerName,
    setNewLayerName,
    newLayerMarkerType,
    setNewLayerMarkerType,
    newLayerTable,
    setNewLayerTable,
    newLayerColumn,
    setNewLayerColumn,
    // Functions
    isLayerNameValid,
    handleCreateNewLayer,
    showCreateNewLayerAlert,
    handleFinishNewLayer,
  }
}