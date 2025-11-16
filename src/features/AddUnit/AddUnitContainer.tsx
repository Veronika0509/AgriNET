import React, { useState, useEffect, useRef, useCallback } from "react"
import { useIonAlert, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from "@ionic/react"
import { getSiteList } from "../../pages/Map/data/getSiteList"
import type { Site, UserId } from "../../types"

// Import our modularized components
import AddUnitTab from "./components/AddUnitTab"
import { useAddUnitForm } from "./hooks/useAddUnitForm"
import { useAddUnitMap } from "./hooks/useAddUnitMap"
import { useSiteGroups } from "./hooks/useSiteGroups"
import QRCodeScanner from "../../components/QRCodeScanner"
import { handleJSONQRData, handleKeyValueQRData } from "./handlers/qrScannerHandlers"
import type { QRScanHandlers } from "./handlers/qrScannerHandlers"

interface AddUnitContainerProps {
  userId: UserId
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  selectedSiteForAddUnit: string
  setSelectedSiteForAddUnit: (site: string) => void
  setSelectedMoistureSensor?: (sensor: any) => void
  setPage: (page: number) => void
  isGoogleApiLoaded: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
  setNavigationHistory: React.Dispatch<React.SetStateAction<string[]>>
  markers: google.maps.Marker[]
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>
  layers: Array<{ id: string; name: string; value: string }>
  setLayers: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; value: string }>>>
  layerMapping: { [key: string]: string }
  setLayerMapping: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isLoadingLayers: boolean
}

/**
 * AddUnitContainer - Complete self-contained Add Unit feature
 *
 * This component manages ALL Add Unit logic that was previously in Map/index.tsx:
 * - Form state management
 * - Map initialization and controls
 * - Site group fetching
 * - QR scanner integration
 * - Unit creation handlers
 * - Site/layer creation
 */
const AddUnitContainer: React.FC<AddUnitContainerProps> = (props) => {
  const {
    userId,
    siteList,
    setSiteList,
    selectedSiteForAddUnit,
    setSelectedSiteForAddUnit,
    setSelectedMoistureSensor,
    setPage,
    isGoogleApiLoaded,
    activeTab,
    setActiveTab,
    setNavigationHistory,
    markers,
    setMarkers,
    layers,
    setLayers,
    layerMapping,
    setLayerMapping,
    isLoadingLayers,
  } = props

  const [presentAlert] = useIonAlert()
  const [presentEmptyNameAlert] = useIonAlert()

  // Map refs and state
  const addUnitMapRef = useRef<HTMLDivElement>(null)
  const [addUnitMap, setAddUnitMap] = useState<google.maps.Map | null>(null)
  const [crosshairMarker, setCrosshairMarker] = useState<google.maps.Marker | null>(null)

  // Form state - use our custom hook
  const formState = useAddUnitForm({
    selectedSiteForAddUnit,
    siteList,
    activeTab,
  })

  const {
    unitName,
    setUnitName,
    unitLatitude,
    setUnitLatitude,
    unitLongitude,
    setUnitLongitude,
    selectedSite,
    setSelectedSite,
    selectedSiteGroup,
    setSelectedSiteGroup,
    siteGroups,
    setSiteGroups,
    siteGroupError,
    setSiteGroupError,
    sensorPrefix,
    setSensorPrefix,
    sensorId,
    setSensorId,
    selectedLayer,
    setSelectedLayer,
    requestHardware,
    setRequestHardware,
    moistLevel,
    setMoistLevel,
    moistLevelError,
    setMoistLevelError,
    formErrors,
    setFormErrors,
    validateSensorId,
    getAllSensorIds,
  } = formState

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isQRScanned, setIsQRScanned] = useState(false)
  const [scannedSensorId, setScannedSensorId] = useState("")
  const [qrTimezone, setQrTimezone] = useState("")
  const [qrCustomFields, setQrCustomFields] = useState<{ [key: string]: any }>({})
  const [qrBudgetLines, setQrBudgetLines] = useState<{ [key: string]: any }>({})
  const [qrRawMetric, setQrRawMetric] = useState(0)
  const [qrDisplayMetric, setQrDisplayMetric] = useState(0)

  // New layer config state
  const [newLayerConfigData, setNewLayerConfigData] = useState<
    | {
        table: string
        column: string
        markerType: string
      }
    | undefined
  >(undefined)

  // Track the name of the newly created layer to remove it after unit creation
  const [tempLayerName, setTempLayerName] = useState<string | undefined>(undefined)

  // New layer modal state
  const [isNewLayerModalOpen, setIsNewLayerModalOpen] = useState<boolean>(false)
  const [newLayerName, setNewLayerName] = useState<string>("")
  const [newLayerMarkerType, setNewLayerMarkerType] = useState<string>("fuel")
  const [newLayerTable, setNewLayerTable] = useState<string>("")
  const [newLayerColumn, setNewLayerColumn] = useState<string>("")

  // Sensor modal state
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false)
  const [availableSensors, setAvailableSensors] = useState<any[]>([])

  // Initialize coordinates when component mounts or props change
  useEffect(() => {
    if (selectedSiteForAddUnit && siteList && siteList.length > 0) {
      const site = siteList.find((s) => s.id === selectedSiteForAddUnit)
      if (site) {
        setUnitLatitude(site.lat.toString())
        setUnitLongitude(site.lng.toString())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSiteForAddUnit, siteList])

  // Update coordinates when selected site changes
  useEffect(() => {
    if (selectedSite && siteList && siteList.length > 0) {
      const site = siteList.find((s) => s.name === selectedSite)
      if (site) {
        setUnitLatitude(site.lat.toString())
        setUnitLongitude(site.lng.toString())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSite, siteList])

  // Initialize form with site when sites are loaded or when selected site changes
  useEffect(() => {
    if (siteList && siteList.length > 0) {
      const site = siteList.find((s) => s.name === selectedSite || s.name === selectedSiteForAddUnit)
      if (site) {
        setSelectedSite(site.name)
        if (site.lat && site.lng) {
          setUnitLatitude(site.lat.toString())
          setUnitLongitude(site.lng.toString())
        }
      } else if (!selectedSite && siteList.length > 0) {
        const firstSite = siteList[0]
        setSelectedSite(firstSite.name)
        setSelectedSiteForAddUnit(firstSite.name)
        if (firstSite.lat && firstSite.lng) {
          setUnitLatitude(firstSite.lat.toString())
          setUnitLongitude(firstSite.lng.toString())
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteList, selectedSiteForAddUnit])

  // Initialize Add Unit map when tab is active and API is loaded
  useEffect(() => {
    if (
      activeTab === "add" &&
      isGoogleApiLoaded &&
      window.google &&
      window.google.maps &&
      addUnitMapRef.current &&
      !addUnitMap // Only create map if it doesn't exist
    ) {
      console.log("Initializing Add Unit map...")
      try {
        // Determine center coordinates based on sites availability
        let centerCoords = { lat: 41.9106638, lng: -87.6828648 } // Chicago default
        let zoomLevel = 5

        if (siteList && siteList.length > 0) {
          const firstSite = siteList[0]
          if (firstSite.lat && firstSite.lng) {
            centerCoords = { lat: firstSite.lat, lng: firstSite.lng }
            zoomLevel = 16
          }
        }

        // Check if there's a selected site
        if (siteList && siteList.length > 0) {
          const site = siteList.find((s) => s.name === selectedSite || s.name === selectedSiteForAddUnit)
          if (site && site.lat && site.lng) {
            centerCoords = { lat: site.lat, lng: site.lng }
            setUnitLatitude(site.lat.toString())
            setUnitLongitude(site.lng.toString())
          }
        }

        console.log("Creating map with center:", centerCoords, "zoom:", zoomLevel)

        // Create the map
        const map = new window.google.maps.Map(addUnitMapRef.current, {
          center: centerCoords,
          zoom: zoomLevel,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE,
        })

        console.log("Map created successfully:", map)

        // Add listener for map movement to update coordinates
        map.addListener("center_changed", () => {
          const center = map.getCenter()
          if (center) {
            setUnitLatitude(center.lat().toString())
            setUnitLongitude(center.lng().toString())
          }
        })

        // Store map reference for coordinate grabbing
        setAddUnitMap(map)

        // Small delay to ensure map is properly rendered before centering
        setTimeout(() => {
          map.setCenter(centerCoords)
          console.log("Map centered")
        }, 100)
      } catch (error) {
        console.error("Error initializing Add Unit map:", error)
      }
    } else if (activeTab !== "add" && addUnitMap) {
      console.log("Cleaning up Add Unit map...")
      // Clean up map when leaving the tab
      setAddUnitMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isGoogleApiLoaded])

  // Handle map resize when returning to Add Unit tab
  useEffect(() => {
    if (activeTab === "add" && addUnitMap && addUnitMapRef.current) {
      setTimeout(() => {
        window.google.maps.event.trigger(addUnitMap, "resize")
        // Re-center the map
        let centerCoords = { lat: 41.9106638, lng: -87.6828648 } // Chicago default
        if (siteList && siteList.length > 0) {
          const firstSite = siteList[0]
          if (firstSite.lat && firstSite.lng) {
            centerCoords = { lat: firstSite.lat, lng: firstSite.lng }
          }
        }
        addUnitMap.setCenter(centerCoords)
      }, 100)
    }
  }, [activeTab, addUnitMap, siteList])

  // Fetch user site groups when navigating to Add Unit page
  useSiteGroups({
    activeTab,
    setSiteGroups,
    setSelectedSiteGroup,
  })

  // Clear temporary layer when navigating away from Add Unit tab
  useEffect(() => {
    if (activeTab !== "add") {
      // Clear temp layer name and config when leaving the Add Unit tab
      if (tempLayerName) {
        setTempLayerName(undefined)
      }
      if (newLayerConfigData) {
        setNewLayerConfigData(undefined)
      }
    }
  }, [activeTab, tempLayerName, newLayerConfigData])

  // Handler for creating new site
  const showCreateNewSiteAlert = useCallback(() => {
    presentAlert({
      header: "Create New Site",
      message: "Enter the name for the new site:",
      inputs: [
        {
          name: "siteName",
          type: "text",
          placeholder: "Site name",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Create",
          handler: async (data) => {
            const siteName = data.siteName?.trim()
            if (!siteName) {
              presentEmptyNameAlert({
                header: "Error",
                message: "Site name cannot be empty",
                buttons: ["OK"],
              })
              return false
            }

            // Create new site
            try {
              const newSiteList = await getSiteList(userId)
              if (newSiteList && "data" in newSiteList) {
                setSiteList(newSiteList.data)
              }
              setSelectedSite(siteName)
              setSelectedSiteForAddUnit(siteName)
            } catch (error) {
              console.error("Error creating site:", error)
            }
          },
        },
      ],
    })
  }, [presentAlert, presentEmptyNameAlert, userId, setSiteList, setSelectedSite, setSelectedSiteForAddUnit])

  // Handler for opening new layer modal
  const showCreateNewLayerAlert = useCallback(() => {
    // Reset form fields
    setNewLayerName("")
    setNewLayerMarkerType("fuel")
    setNewLayerTable("")
    setNewLayerColumn("")
    // Open modal
    setIsNewLayerModalOpen(true)
  }, [])

  // Function to create a new layer config (to be sent with unit creation)
  const handleCreateNewLayer = async (
    layerName: string,
    markerType?: string,
    table?: string,
    column?: string,
  ): Promise<{ id: string; name: string; value: string } | null> => {
    if (!layerName || !layerName.trim()) {
      return null
    }

    const trimmedName = layerName.trim()

    // Create new layer object
    const newLayer = {
      id: trimmedName.toLowerCase(),
      name: trimmedName,
      value: trimmedName.toLowerCase(),
    }

    // Store layer configuration to be sent when ADD UNIT button is clicked
    setNewLayerConfigData({
      table: table || "",
      column: column || "",
      markerType: markerType || "fuel",
    })

    // Store the layer name to track it as the new layer being created
    setTempLayerName(trimmedName)

    // Add the new layer to the layers list
    setLayers((prevLayers) => {
      // Check if layer already exists
      const layerExists = prevLayers.some(
        (layer) => layer.value === newLayer.value || layer.name === newLayer.name
      )

      if (!layerExists) {
        return [...prevLayers, newLayer]
      }
      return prevLayers
    })

    // Add the marker type mapping so the layer appears in the selector
    // Use both the trimmedName (original case) and lowercase value to ensure compatibility
    setLayerMapping((prevMapping) => ({
      ...prevMapping,
      [trimmedName]: markerType || "fuel",
      [trimmedName.toLowerCase()]: markerType || "fuel",
    }))

    return newLayer
  }

  // Handle new layer creation from modal
  const handleFinishNewLayer = async () => {
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

    // Proceed with layer creation
    const result = await handleCreateNewLayer(layerName, markerType, table, column)

    if (result !== null) {
      // Set the newly created layer as selected
      setSelectedLayer(result.name)

      // Clear modal form fields
      setNewLayerName("")
      setNewLayerMarkerType("fuel")
      setNewLayerTable("")
      setNewLayerColumn("")

      // Close modal on success
      setIsNewLayerModalOpen(false)
    }
  }

  // Handler for purchase request info
  const showPurchaseRequestAlert = useCallback(() => {
    presentAlert({
      header: "Request Hardware",
      message:
        "Check this box if you need to request new hardware for this unit. Our team will review your request and contact you.",
      buttons: ["OK"],
    })
  }, [presentAlert])

  // QR Scanner success handler
  const handleQRScanSuccess = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText)
    setIsQRScanned(true)
    setShowQRScanner(false)

    // Try to parse as JSON first
    try {
      const data = JSON.parse(decodedText)

      const qrHandlers: QRScanHandlers = {
        setSensorPrefix,
        setSensorId,
        setUnitName,
        setUnitLatitude,
        setUnitLongitude,
        setSelectedSite,
        setSelectedSiteForAddUnit,
        setSelectedSiteGroup,
        setSelectedLayer,
        setMoistLevel,
        setScannedSensorId,
        setQrTimezone,
        setQrCustomFields,
        setQrBudgetLines,
        setQrRawMetric,
        setQrDisplayMetric,
        setSiteGroups,
        handleCreateNewSite: async (siteName: string) => {
          try {
            const newSiteList = await getSiteList(userId)
            if (newSiteList && "data" in newSiteList) {
              setSiteList(newSiteList.data)
            }
            setSelectedSite(siteName)
            setSelectedSiteForAddUnit(siteName)
            return newSiteList && "data" in newSiteList ? newSiteList.data.find(s => s.name === siteName) || null : null
          } catch (error) {
            console.error("Error creating site:", error)
            return null
          }
        },
      }

      handleJSONQRData(data, siteList, qrHandlers)
    } catch (e) {
      // If not JSON, try key-value pairs
      const qrHandlers: QRScanHandlers = {
        setSensorPrefix,
        setSensorId,
        setUnitName,
        setUnitLatitude,
        setUnitLongitude,
        setSelectedSite,
        setSelectedSiteForAddUnit,
        setSelectedSiteGroup,
        setSelectedLayer,
        setMoistLevel,
        setScannedSensorId,
        setQrTimezone,
        setQrCustomFields,
        setQrBudgetLines,
        setQrRawMetric,
        setQrDisplayMetric,
        setSiteGroups,
        handleCreateNewSite: async (siteName: string) => {
          try {
            const newSiteList = await getSiteList(userId)
            if (newSiteList && "data" in newSiteList) {
              setSiteList(newSiteList.data)
            }
            setSelectedSite(siteName)
            setSelectedSiteForAddUnit(siteName)
            return newSiteList && "data" in newSiteList ? newSiteList.data.find(s => s.name === siteName) || null : null
          } catch (error) {
            console.error("Error creating site:", error)
            return null
          }
        },
      }

      handleKeyValueQRData(decodedText, siteList, qrHandlers)
    }
  }

  return (
    <>
      <AddUnitTab
        // Map refs and state
        addUnitMapRef={addUnitMapRef}
        addUnitMap={addUnitMap}
        crosshairMarker={crosshairMarker}

      // User and site data
      userId={userId}
      siteList={siteList}
      setSiteList={setSiteList}
      selectedSiteForAddUnit={selectedSiteForAddUnit}
      setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
      setSelectedMoistureSensor={setSelectedMoistureSensor}
      setPage={setPage}

      // Form state
      unitName={unitName}
      setUnitName={setUnitName}
      unitLatitude={unitLatitude}
      setUnitLatitude={setUnitLatitude}
      unitLongitude={unitLongitude}
      setUnitLongitude={setUnitLongitude}
      selectedSite={selectedSite}
      setSelectedSite={setSelectedSite}
      selectedSiteGroup={selectedSiteGroup}
      setSelectedSiteGroup={setSelectedSiteGroup}
      siteGroups={siteGroups}
      setSiteGroups={setSiteGroups}
      siteGroupError={siteGroupError}
      setSiteGroupError={setSiteGroupError}
      sensorPrefix={sensorPrefix}
      setSensorPrefix={setSensorPrefix}
      sensorId={sensorId}
      setSensorId={setSensorId}
      selectedLayer={selectedLayer}
      setSelectedLayer={setSelectedLayer}
      requestHardware={requestHardware}
      setRequestHardware={setRequestHardware}
      moistLevel={moistLevel}
      setMoistLevel={setMoistLevel}
      moistLevelError={moistLevelError}
      setMoistLevelError={setMoistLevelError}
      formErrors={formErrors}
      setFormErrors={setFormErrors}
      validateSensorId={validateSensorId}
      getAllSensorIds={getAllSensorIds}

      // Layer state
      layers={layers}
      setLayers={setLayers}
      layerMapping={layerMapping}
      setLayerMapping={setLayerMapping}
      isLoadingLayers={isLoadingLayers}

      // QR Scanner state
      showQRScanner={showQRScanner}
      setShowQRScanner={setShowQRScanner}
      isQRScanned={isQRScanned}
      setIsQRScanned={setIsQRScanned}
      scannedSensorId={scannedSensorId}
      setScannedSensorId={setScannedSensorId}
      qrTimezone={qrTimezone}
      setQrTimezone={setQrTimezone}
      qrCustomFields={qrCustomFields}
      setQrCustomFields={setQrCustomFields}
      qrBudgetLines={qrBudgetLines}
      setQrBudgetLines={setQrBudgetLines}
      qrRawMetric={qrRawMetric}
      setQrRawMetric={setQrRawMetric}
      qrDisplayMetric={qrDisplayMetric}
      setQrDisplayMetric={setQrDisplayMetric}

      // New layer config
      newLayerConfigData={newLayerConfigData}
      setNewLayerConfigData={setNewLayerConfigData}
      tempLayerName={tempLayerName}
      setTempLayerName={setTempLayerName}

      // New layer modal state
      isNewLayerModalOpen={isNewLayerModalOpen}
      setIsNewLayerModalOpen={setIsNewLayerModalOpen}
      newLayerName={newLayerName}
      setNewLayerName={setNewLayerName}
      newLayerMarkerType={newLayerMarkerType}
      setNewLayerMarkerType={setNewLayerMarkerType}
      newLayerTable={newLayerTable}
      setNewLayerTable={setNewLayerTable}
      newLayerColumn={newLayerColumn}
      setNewLayerColumn={setNewLayerColumn}
      handleFinishNewLayer={handleFinishNewLayer}

      // Markers
      markers={markers}
      setMarkers={setMarkers}

      // Sensor modal
      availableSensors={availableSensors}
      setAvailableSensors={setAvailableSensors}
      isSensorModalOpen={isSensorModalOpen}
      setIsSensorModalOpen={setIsSensorModalOpen}

      // Navigation
      setActiveTab={setActiveTab}
      setNavigationHistory={setNavigationHistory}

      // Handlers
      showCreateNewSiteAlert={showCreateNewSiteAlert}
      showCreateNewLayerAlert={showCreateNewLayerAlert}
      showPurchaseRequestAlert={showPurchaseRequestAlert}
      />

      {/* QR Code Scanner Modal */}
      <IonModal isOpen={showQRScanner} onDidDismiss={() => setShowQRScanner(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Scan QR Code</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowQRScanner(false)}>
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <QRCodeScanner
            onScanSuccess={handleQRScanSuccess}
            onScanCancel={() => setShowQRScanner(false)}
            autoStart={true}
          />
        </IonContent>
      </IonModal>
    </>
  )
}

export default AddUnitContainer