import React from "react"
import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  useIonAlert,
} from "@ionic/react"
import { add, cameraOutline, informationCircle } from "ionicons/icons"
import s from "../../../pages/Map/style.module.css"
import SensorModal from "../../../pages/Map/components/modals/SensorModal"

// Type imports
import type { Site, UserId, SiteId } from "../../../types"
import type { AddUnitTabProps, HTMLIonInputElement } from "../types"

// Import unit creation handlers
import { validateAndCreateUnit } from "../handlers/unitHandlers"
import type { CreateUnitOptions } from "../handlers/unitHandlers"

export { type AddUnitTabProps }

const AddUnitTab: React.FC<AddUnitTabProps> = (props) => {
  // State for tracking the type of sensor count error
  const [moistLevelErrorMessage, setMoistLevelErrorMessage] = React.useState<string>("")

  // Check if screen is narrow (less than 340px)
  const [isNarrowScreen, setIsNarrowScreen] = React.useState(window.innerWidth < 340)

  // Listen for window resize events
  React.useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < 340)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // For backward compatibility, keep the old interface structure
  const {
    addUnitMapRef,
    addUnitMap,
    crosshairMarker,
    userId,
    siteList,
    setSiteList,
    selectedSiteForAddUnit,
    setSelectedSiteForAddUnit,
    setSelectedMoistureSensor,
    setPage,
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
    layers,
    layerMapping,
    isLoadingLayers,
    setShowQRScanner,
    isQRScanned,
    scannedSensorId,
    qrTimezone,
    qrCustomFields,
    qrBudgetLines,
    qrRawMetric,
    qrDisplayMetric,
    newLayerConfigData,
    setNewLayerConfigData,
    tempLayerName,
    setTempLayerName,
    markers,
    setMarkers,
    setLayers,
    setLayerMapping,
    availableSensors,
    setAvailableSensors,
    isSensorModalOpen,
    setIsSensorModalOpen,
    setActiveTab,
    setNavigationHistory,
    showCreateNewSiteAlert,
    showCreateNewLayerAlert,
    showPurchaseRequestAlert,
    setIsQRScanned,
    setScannedSensorId,
    setQrTimezone,
    setQrCustomFields,
    setQrBudgetLines,
    setQrRawMetric,
    setQrDisplayMetric,
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
    handleFinishNewLayer,
  } = props


  const [presentAlert] = useIonAlert()

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "white",
      }}
    >
      {/* Map container taking half the screen */}
      <div
        style={{
          height: "40vh",
          width: "100%",
          position: "relative",
          flexShrink: 0,
          backgroundColor: "white !important",
        }}
      >
        <div
          ref={addUnitMapRef}
          style={{
            height: "100%",
            width: "100%",
            display: "block",
            position: "relative",
            backgroundColor: "white",
          }}
        />
        {/* Crosshair overlay - always centered */}
        <svg
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80px",
            height: "80px",
            pointerEvents: "none",
            zIndex: 1000,
          }}
          viewBox="-40 -40 80 80"
        >
          <path
            d="M 0,0 m -25,0 a 25,25 0 1,1 50,0 a 25,25 0 1,1 -50,0 M 0,-35 L 0,-10 M 0,10 L 0,35 M -35,0 L -10,0 M 10,0 L 35,0 M 0,0 m -8,0 a 8,8 0 1,1 16,0 a 8,8 0 1,1 -16,0 M 0,0 m -2,0 a 2,2 0 1,1 4,0 a 2,2 0 1,1 -4,0"
            fill="white"
            fillOpacity="1"
            stroke="black"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* Form section taking the other half */}
      <div
        style={{
          height: "60vh",
          position: "relative",
        }}
      >
        {/* White overlay container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            zIndex: 1000,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          {/* Form Fields */}
          <div
            style={{
              maxWidth: "400px",
              margin: "0 auto",
              width: "100%",
              paddingBottom: "100px",
            }}
          >
            <div
              style={{
                maxWidth: "400px",
                margin: "0 auto",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* QR Scanner button - now available on all platforms */}
              <IonButton
                fill="outline"
                size="default"
                style={{
                  width: "100%",
                  height: "36px",
                  fontSize: isNarrowScreen ? "13px" : undefined,
                }}
                onClick={() => {
                  // Open QR Scanner modal
                  setShowQRScanner(true)
                }}
              >
                <IonIcon icon={cameraOutline} slot="start" />
                TAKE A PICTURE
              </IonButton>
              <IonButton
                fill="outline"
                size="default"
                style={{
                  width: "100%",
                  fontSize: isNarrowScreen ? "13px" : undefined,
                }}
                onClick={() => {
                  // Check if there are any sites at all
                  if (!siteList || siteList.length === 0) {
                    presentAlert({
                      header: 'No Sites Available',
                      message: 'Please create a site first before adding a valve.',
                      buttons: ['OK'],
                    })
                    return
                  }

                  // Helper function to get moisture sensors for a site
                  const getMoistSensorsForSite = (site: any): any[] => {
                    const moistSensors: any[] = []
                    if (site.layers) {
                      site.layers.forEach((layer: any) => {
                        if (layer.name === "Moist" && layer.markers && Array.isArray(layer.markers)) {
                          layer.markers.forEach((marker: any) => {
                            moistSensors.push({
                              layerName: layer.name,
                              sensorId: marker.sensorId,
                              name: marker.name,
                              siteName: site.name,
                              ...marker,
                            })
                          })
                        }
                      })
                    }
                    return moistSensors
                  }

                  // Helper function to show moisture sensor selector
                  const showMoistureSensorSelector = (sensors: any[], siteName: string) => {

                    if (sensors.length === 0) {
                      presentAlert({
                        header: 'No Applicable Sensors',
                        message: 'You have to have at least one Moisture Sensor',
                        buttons: ['OK'],
                      })
                      return
                    }

                    // Show moisture sensor selector with radio buttons
                    // Use setTimeout to ensure previous alert is fully dismissed
                    setTimeout(() => {
                      presentAlert({
                        header: 'Select Moisture sensor for new Valve',
                        inputs: sensors.map((sensor, index) => ({
                          type: 'radio' as const,
                          label: sensor.name || sensor.sensorId,
                          value: index.toString(),
                          checked: index === 0,
                        })),
                        buttons: [
                          {
                            text: 'Cancel Valve Creation',
                            role: 'cancel',
                          },
                          {
                            text: 'OK',
                            handler: (selectedIndex: string) => {
                              const sensorIndex = parseInt(selectedIndex, 10)
                              const selectedSensor = sensors[sensorIndex]
                              // Sensor selected, save it and navigate to Virtual Valve page
                              setSelectedSiteForAddUnit(siteName)
                              setSelectedMoistureSensor?.(selectedSensor)
                              setPage(3) // Navigate to Virtual Valve page
                            },
                          },
                        ],
                      })
                    }, 300)
                  }

                  // Show ALL sites in the selector (not just sites with Moist sensors)

                  presentAlert({
                    header: 'Select Site',
                    inputs: siteList.map((site: any, index: number) => ({
                      type: 'radio' as const,
                      label: site.name,
                      value: index.toString(),
                      checked: index === 0,
                    })),
                    buttons: [
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                        }
                      },
                      {
                        text: 'OK',
                        handler: (selectedIndex: string) => {
                          const siteIndex = parseInt(selectedIndex, 10)
                          const selectedSiteData = siteList[siteIndex]

                          // Get moist sensors for the selected site
                          const moistSensors = getMoistSensorsForSite(selectedSiteData)

                          // If no moist sensors, show error and prevent dialog from closing
                          if (moistSensors.length === 0) {
                            setTimeout(() => {
                              presentAlert({
                                header: 'No Applicable Sensors',
                                message: 'You have to have at least one Moisture Sensor',
                                buttons: ['OK'],
                              })
                            }, 300)
                            return true // Allow dialog to close before showing error
                          }

                          // Show moisture sensor selector for selected site
                          showMoistureSensorSelector(moistSensors, selectedSiteData.name)
                          return true
                        },
                      },
                    ],
                  })
                }}
              >
                ADD VALVE
              </IonButton>
            </div>

            <div className={s.addUnitForm} style={{ marginTop: "0px" }}>
              {/* Site Selection */}
              <IonItem className={s.addUnitFormItem}>
                <IonLabel position="fixed" color="light" style={{ minWidth: "80px", alignSelf: "center" }}>
                  Site
                </IonLabel>
                <IonSelect
                  value={selectedSite}
                  style={{
                    flex: 1,
                    marginRight: "12px",
                    "--color": "#000000",
                    "--placeholder-color": "#000000",
                    "--placeholder-opacity": "1",
                    "--padding-start": "8px",
                    "--background": "#ffffff",
                    "--border": "1px solid #ccc",
                    "--border-radius": "4px",
                  }}
                  onIonChange={(e) => {
                    const newSite = e.detail.value

                    // Find the selected site in the list
                    const selectedSiteObj = siteList?.find((site) => site.name === newSite)

                    setSelectedSite(newSite)
                    setSelectedSiteForAddUnit(newSite)

                    if (selectedSiteObj) {
                      // Update coordinates in the input fields
                      if (selectedSiteObj.lat !== undefined) {
                        setUnitLatitude(selectedSiteObj.lat.toString())
                      }
                      if (selectedSiteObj.lng !== undefined) {
                        setUnitLongitude(selectedSiteObj.lng.toString())
                      }

                      // Center map on selected site
                      if (addUnitMap && selectedSiteObj.lat && selectedSiteObj.lng) {
                        const newCenter = { lat: selectedSiteObj.lat, lng: selectedSiteObj.lng }
                        addUnitMap.setCenter(newCenter)
                        addUnitMap.setZoom(16) // Good zoom for site view

                        // Update crosshair marker position
                        if (crosshairMarker) {
                          crosshairMarker.setPosition(newCenter)
                        }
                      }
                    } else {
                      setUnitLatitude("")
                      setUnitLongitude("")
                    }
                  }}
                >
                  {siteList?.map((site) => (
                    <IonSelectOption key={site.name} value={site.name}>
                      {site.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={(e) => {
                    showCreateNewSiteAlert()
                  }}
                  style={{
                    "--background": "transparent",
                    "--border-color": "var(--ion-color-primary)",
                    "--color": "var(--ion-color-primary)",
                    "--border-radius": "4px",
                    "--padding-start": "8px",
                    "--padding-end": "8px",
                    height: "32px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginLeft: "8px",
                  }}
                >
                  New Site
                </IonButton>
              </IonItem>

              {/* Site Group Selection - Show when there are site groups available */}
              {siteGroups.length > 0 && (
                <IonItem
                  className={s.addUnitFormItem}
                  style={{
                    "--background": "transparent",
                    "--background-hover": "transparent",
                    "--background-activated": "transparent",
                    "--background-focused": "transparent",
                    "--border-radius": "8px",
                    "--padding-start": "0 !important",
                    "--padding-end": "0 !important",
                    "--padding-top": "0",
                    "--padding-bottom": "0",
                    "--inner-padding-start": "0 !important",
                    "--transition": "all 0.3s ease",
                    "--border": "1px solid #666666",
                    "--highlight-color-invalid": "transparent",
                    "--highlight-color-valid": "transparent",
                    "--highlight-color-focused": "transparent",
                    "--color": "inherit",
                    "--ripple-color": "transparent",
                    "--inner-padding-top": "0",
                    "--inner-padding-bottom": "0",
                    "--inner-border-width": "0",
                    "--inner-padding-end": "0 !important",
                    display: "flex",
                    "flex-direction": "column",
                    "align-items": "stretch",
                    margin: "0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "0",
                      margin: "0",
                    }}
                  >
                    <IonLabel
                      style={{
                        color: "#666666",
                        opacity: "0.8",
                        margin: "0",
                        padding: "0",
                      }}
                    >
                      Site Group
                    </IonLabel>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: "0",
                      }}
                    >
                      <style
                        dangerouslySetInnerHTML={{
                          __html: `
                        #site-group-select::part(placeholder) {
                          color: #666666 !important;
                          opacity: 1 !important;
                        }
                        #site-group-select::part(text) {
                          color: #000000 !important;
                          opacity: 1 !important;
                        }
                        #site-group-select::part(icon) {
                          color: #666666 !important;
                          opacity: 0.8 !important;
                        }
                      `,
                        }}
                      />
                      <IonSelect
                        id="site-group-select"
                        placeholder="Site Group"
                        style={{
                          width: "auto",
                          "--placeholder-color": "#666666",
                          "--color": "#666666",
                          "--background": "transparent",
                          "--background-hover": "transparent",
                          "--background-focused": "transparent",
                          "--border": "none",
                          "--border-radius": "4px",
                          "--placeholder-opacity": "0.8",
                          "--padding-start": "0",
                          "--padding-end": "3px",
                          "--highlight-color-focused": "transparent",
                          "--highlight-color-valid": "transparent",
                          "--opacity": "1",
                          opacity: 1,
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          textAlign: "right",
                          maxWidth: "100%",
                        }}
                        interface="popover"
                        value={selectedSiteGroup}
                        onIonChange={(e) => {
                          setSelectedSiteGroup(e.detail.value)
                        }}
                      >
                        {siteGroups.length > 0 ? (
                          siteGroups.map((group) => (
                            <IonSelectOption key={group.id} value={group.name}>
                              {group.name}
                            </IonSelectOption>
                          ))
                        ) : (
                          <IonSelectOption value="default">Default Group</IonSelectOption>
                        )}
                      </IonSelect>
                    </div>
                  </div>
                </IonItem>
              )}

              {/* Unit Name Field */}
              <IonItem className={`${s.addUnitFormItem} ${formErrors.unitName ? s.addUnitFormItemError : ""}`}>
                <IonLabel
                  position="fixed"
                  color={formErrors.unitName ? "danger" : "light"}
                  style={{
                    minWidth: "80px",
                    alignSelf: "center",
                    color: formErrors.unitName ? "var(--ion-color-danger) !important" : "var(--ion-color-light)",
                    "--color": formErrors.unitName
                      ? "var(--ion-color-danger) !important"
                      : "var(--ion-color-light)",
                  }}
                  className={formErrors.unitName ? "error-label" : ""}
                >
                  Unit Name
                </IonLabel>
                <IonInput
                  type="text"
                  value={unitName}
                  placeholder="Enter unit name"
                  style={{
                    "--placeholder-color": formErrors.unitName ? "var(--ion-color-danger)" : "#999999",
                    "--color": formErrors.unitName ? "var(--ion-color-danger)" : "#ffffff",
                  }}
                  onIonInput={(e) => {
                    setUnitName(e.detail.value!)
                    if (e.detail.value!.trim()) {
                      setFormErrors((prev) => ({ ...prev, unitName: false }))
                    }
                  }}
                />
              </IonItem>

              {/* Coordinates Fields */}
              <div className={s.coordinatesContainer}>
                {/* Latitude Field */}
                <IonItem className={`${s.addUnitFormItemGreen} ${formErrors.latitude ? s.coordinatesError : ""}`}>
                  <IonLabel position="fixed" color="light" style={{ minWidth: "80px" }}>
                    Latitude
                  </IonLabel>
                  <IonInput
                    type="number"
                    value={unitLatitude}
                    placeholder="Latitude"
                    style={{
                      "--placeholder-color": formErrors.latitude ? "var(--ion-color-danger)" : "#999999",
                      "--color": formErrors.latitude ? "var(--ion-color-danger)" : "#000000",
                      "--background": "#ffffff",
                      "--border": "1px solid #ccc",
                      "--padding-start": "8px",
                      "--border-radius": "4px",
                      "--opacity": "1",
                    }}
                    onIonInput={(e) => {
                      const newLat = e.detail.value!
                      setUnitLatitude(newLat)
                      // Clear latitude error as soon as we start typing
                      if (newLat) {
                        setFormErrors((prev) => ({ ...prev, latitude: false }))
                      }

                      // Update map center when latitude changes
                      if (addUnitMap && newLat && unitLongitude) {
                        const lat = Number.parseFloat(newLat)
                        const lng = Number.parseFloat(unitLongitude)
                        if (!isNaN(lat) && !isNaN(lng)) {
                          addUnitMap.setCenter({ lat, lng })
                        }
                      }
                    }}
                  />
                </IonItem>

                {/* Longitude Field */}
                <IonItem
                  className={`${s.addUnitFormItemGreen} ${formErrors.longitude ? s.coordinatesError : ""}`}
                >
                  <IonLabel position="fixed" color="light" style={{ minWidth: "80px" }}>
                    Longitude
                  </IonLabel>
                  <IonInput
                    type="number"
                    value={unitLongitude}
                    placeholder="Longitude"
                    style={{
                      "--placeholder-color": formErrors.longitude ? "var(--ion-color-danger)" : "#999999",
                      "--color": formErrors.longitude ? "var(--ion-color-danger)" : "#000000",
                      "--background": "#ffffff",
                      "--border": "1px solid #ccc",
                      "--padding-start": "8px",
                      "--border-radius": "4px",
                      "--opacity": "1",
                    }}
                    onIonInput={(e) => {
                      const newLng = e.detail.value!
                      setUnitLongitude(newLng)
                      // Clear longitude error as soon as we start typing
                      if (newLng) {
                        setFormErrors((prev) => ({ ...prev, longitude: false }))
                      }

                      // Update map center when longitude changes
                      if (addUnitMap && newLng && unitLatitude) {
                        const lat = Number.parseFloat(unitLatitude)
                        const lng = Number.parseFloat(newLng)
                        if (!isNaN(lat) && !isNaN(lng)) {
                          addUnitMap.setCenter({ lat, lng })
                        }
                      }
                    }}
                  />
                </IonItem>
              </div>

              {/* Sensor ID Field */}
              <IonItem className={`${s.addUnitFormItem} ${formErrors.sensor ? s.addUnitFormItemError : ""}`}>
                <IonLabel position="fixed" color="light" style={{ minWidth: "80px", alignSelf: "center" }}>
                  SensorId
                </IonLabel>
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "8px" }}>
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                      #sensor-prefix-select::part(icon) {
                        color: ${formErrors.sensor ? "var(--ion-color-danger)" : "#666666"} !important;
                        opacity: 1 !important;
                      }
                      #sensor-prefix-select::part(placeholder) {
                        color: ${formErrors.sensor ? "var(--ion-color-danger)" : "#999999"} !important;
                        opacity: 1 !important;
                      }
                      #sensor-prefix-select::part(text) {
                        color: ${formErrors.sensor ? "var(--ion-color-danger)" : "#666666"} !important;
                        opacity: 1 !important;
                      }
                    `,
                    }}
                  />
                  <IonSelect
                    id="sensor-prefix-select"
                    value={sensorPrefix}
                    placeholder="prefix"
                    style={{
                      minWidth: "100px",
                      maxWidth: "120px",
                      "--placeholder-color": formErrors.sensor ? "var(--ion-color-danger)" : "#999999",
                      "--color": formErrors.sensor ? "var(--ion-color-danger)" : "#666666",
                      "--background": "transparent",
                      "--border-color": "transparent",
                      "--highlight-color-focused": "transparent",
                      "--highlight-color-valid": "transparent",
                      opacity: 1,
                      "--placeholder-opacity": formErrors.sensor ? "1" : "1",
                    }}
                    interface="popover"
                    className={formErrors.sensor ? "select-error" : ""}
                    onIonChange={(e) => {
                      setSensorPrefix(e.detail.value)
                      // Clear error if sensorId is filled (prefix is optional)
                      if (sensorId.trim()) {
                        setFormErrors((prev) => ({ ...prev, sensor: false }))
                      }
                    }}
                  >
                    <IonSelectOption value="">Select prefix</IonSelectOption>
                    <IonSelectOption value="VSM">VSM</IonSelectOption>
                    <IonSelectOption value="ANM">ANM</IonSelectOption>
                    <IonSelectOption value="TSG">TSG</IonSelectOption>
                  </IonSelect>
                  <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "8px" }}>
                    <IonInput
                      type="text"
                      style={{
                        flex: 1,
                        "--placeholder-color": formErrors.sensor
                          ? "var(--ion-color-danger)"
                          : sensorId
                            ? "#ffffff"
                            : "#999999",
                        "--color": formErrors.sensor ? "var(--ion-color-danger)" : "#ffffff",
                        "--border-color": "transparent",
                        "--highlight-color-focused": "transparent",
                        "--background": "transparent",
                        "--padding-start": "0",
                        "--padding-end": "0",
                        opacity: 1,
                      }}
                      placeholder="sensor ID"
                      value={sensorId}
                      onIonInput={(e) => {
                        setSensorId(e.detail.value!)
                        // Clear error if filled (prefix is optional)
                        if (e.detail.value!.trim()) {
                          setFormErrors((prev) => ({ ...prev, sensor: false }))
                        }
                      }}
                    />
                  </div>
                </div>
              </IonItem>

              {/* Layer Field */}
              <IonItem className={`${s.addUnitFormItem} ${formErrors.layer ? s.addUnitFormItemError : ""}`}>
                <IonLabel position="fixed" color="light" style={{ minWidth: "80px", alignSelf: "center" }}>
                  Layer
                </IonLabel>
                <IonSelect
                  value={selectedLayer}
                  style={{
                    flex: 1,
                    marginRight: "12px",
                    "--color": "#000000",
                    "--placeholder-color": "#000000",
                    "--placeholder-opacity": "1",
                    "--padding-start": "8px",
                    "--background": "#ffffff",
                    "--border": "1px solid #ccc",
                    "--border-radius": "4px",
                  }}
                  onIonChange={(e) => {
                    const selectedLayerValue = e.detail.value

                    // Log mapping for the selected layer
                    if (selectedLayerValue && layerMapping[selectedLayerValue]) {
                    }

                    setSelectedLayer(selectedLayerValue)
                    if (selectedLayerValue && formErrors.layer) {
                      setFormErrors((prev) => ({ ...prev, layer: false }))
                    }

                    // Clear newLayerConfigData if switching to an existing layer
                    // Check if the selected layer was just created (has newLayerConfigData)
                    // and if we're switching away from it
                    if (newLayerConfigData && selectedLayer !== selectedLayerValue) {
                      // Find if the newly selected layer already existed (not the one we just created)
                      const existingLayer = layers.find(
                        (layer) => (layer.value || layer.id) === selectedLayerValue,
                      )

                      // If we're switching to a different layer, clear the new layer config
                      if (existingLayer) {
                        setNewLayerConfigData(undefined)
                      }
                    }
                  }}
                >
                  {isLoadingLayers ? (
                    <IonSelectOption value="" disabled>
                      Loading layers...
                    </IonSelectOption>
                  ) : (
                    <>
                      {layers
                        .filter((layer) => {
                          // Show layers that have a mapping (system layers + newly created layers)
                          // Check both the layer value/id and the layer name in the mapping
                          const layerKey = layer.value || layer.id
                          const layerName = layer.name
                          return (
                            layerMapping[layerKey] !== undefined ||
                            layerMapping[layerName] !== undefined
                          )
                        })
                        .map((layer) => (
                          <IonSelectOption key={layer.id} value={layer.value || layer.id}>
                            {layer.name || `Layer ${layer.id}`}
                          </IonSelectOption>
                        ))}
                    </>
                  )}
                </IonSelect>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    showCreateNewLayerAlert()
                  }}
                  style={{
                    "--background": "transparent",
                    "--border-color": "var(--ion-color-primary)",
                    "--color": "var(--ion-color-primary)",
                    "--border-radius": "4px",
                    "--padding-start": "8px",
                    "--padding-end": "8px",
                    height: "32px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    alignSelf: "center",
                  }}
                >
                  New Layer
                </IonButton>
              </IonItem>

              {/* Layer preview section */}
              {selectedLayer && layerMapping[selectedLayer] && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-start",
                    paddingTop: "8px",
                    paddingBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                    <img
                      src={`https://app.agrinet.us/marker-icons/${layerMapping[selectedLayer]}.png`}
                      alt={`${selectedLayer} layer icon`}
                      style={{ height: "70px", width: "auto", marginBottom: "8px" }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = "https://app.agrinet.us/marker-icons/default.png"
                      }}
                    />
                    {(selectedLayer.toLowerCase() === "moist" ||
                      layerMapping[selectedLayer] === "moist-fuel" ||
                      layerMapping[selectedLayer.toLowerCase()] === "moist-fuel") && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <IonInput
                          type="text"
                          placeholder="Sensor count"
                          inputmode="numeric"
                          value={moistLevel}
                          onIonInput={(e) => {
                            const inputValue = (e.target as any).value

                            // If input is empty, don't show error
                            if (!inputValue || inputValue === "") {
                              setMoistLevel(undefined)
                              setMoistLevelError(false)
                              setMoistLevelErrorMessage("")
                              return
                            }

                            // Only allow digits - remove any non-digit characters
                            const digitsOnly = String(inputValue).replace(/\D/g, '')

                            // If user tried to enter non-digits, show error immediately
                            if (digitsOnly === "") {
                              setMoistLevelError(true)
                              setMoistLevelErrorMessage("Only digits are allowed")
                              setMoistLevel(undefined)
                              return
                            }

                            const v = Number(digitsOnly)
                            if (Number.isNaN(v)) {
                              setMoistLevelError(false)
                              setMoistLevelErrorMessage("")
                              return
                            }
                            setMoistLevel(v)
                            if (v < 1 || v > 12) {
                              setMoistLevelError(true)
                              setMoistLevelErrorMessage("Input sensor count from 1 to 12")
                            } else {
                              setMoistLevelError(false)
                              setMoistLevelErrorMessage("")
                            }
                          }}
                          style={
                            {
                              width: "150px",
                              textAlign: "left",
                              "--padding-start": "0px",
                              "--padding-end": "0px",
                              "--background": moistLevelError ? "#ffe6e6" : "transparent",
                              "--color": moistLevelError ? "var(--ion-color-danger)" : "inherit",
                              "--border-color": moistLevelError ? "var(--ion-color-danger)" : "transparent",
                              "--border-width": moistLevelError ? "1px" : "0px",
                              "--border-style": moistLevelError ? "solid" : "none",
                              "--border-radius": "4px",
                            } as React.CSSProperties
                          }
                        />
                        {moistLevelError && (
                          <div
                            style={{
                              color: "var(--ion-color-danger)",
                              fontSize: "12px",
                              marginTop: "2px",
                            }}
                          >
                            {moistLevelErrorMessage || "Please enter a valid sensor count"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Request Hardware Field */}
              <IonItem className={s.addUnitFormItem}>
                <IonLabel position="fixed" color="light" style={{ minWidth: "80px", alignSelf: "center" }}>
                  Request Hardware
                </IonLabel>
                <div style={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
                  <IonCheckbox
                    style={{ marginRight: "8px" }}
                    checked={requestHardware}
                    onIonChange={(e) => setRequestHardware(e.detail.checked)}
                  />
                  <IonIcon
                    icon={informationCircle}
                    color="primary"
                    style={{
                      fontSize: "20px",
                      cursor: "pointer",
                      zIndex: 10000,
                      position: "relative",
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      showPurchaseRequestAlert()
                    }}
                  />
                </div>
              </IonItem>

              {/* ADD UNIT Button */}
              <IonButton
                expand="block"
                fill="solid"
                disabled={localStorage.getItem("userRole") === "User"}
                title={
                  localStorage.getItem("userRole") === "User"
                    ? "This action is not available for your user role"
                    : ""
                }
                onClick={async () => {
                  const userRole = localStorage.getItem("userRole")

                  // Check if user role is allowed to create units
                  // Only Admin, Dealer, and Superuser can create units
                  const allowedRoles = ["Admin", "Dealer", "Superuser"]
                  if (!userRole || !allowedRoles.includes(userRole)) {
                    presentAlert({
                      header: "Permission Denied",
                      message:
                        "Only Admin, Dealer, and Superuser roles can create new units.\nYour current role: " + (userRole || "Unknown"),
                      buttons: ["OK"],
                    })
                    return
                  }

                  // Check if user is in Demo mode
                  if (userRole === "Demo") {
                    presentAlert({
                      header: "Demo Mode",
                      message:
                        "This action is not available in demo mode.\nPlease create a free account to use this feature.",
                      buttons: ["OK"],
                    })
                    return
                  }

                  // If Site not selected, open new site creation modal
                  if (!selectedSite) {
                    showCreateNewSiteAlert()
                    return
                  }

                  // Validate form data (sensorPrefix can be empty!)
                  const hasErrors = {
                    site: !selectedSite,
                    siteGroup: false, // Site group is optional
                    unitName: !unitName.trim(),
                    latitude: !unitLatitude,
                    longitude: !unitLongitude,
                    sensor: !sensorId.trim(), // Only check that sensorId is not empty
                    layer: !selectedLayer,
                  }

                  setFormErrors(hasErrors)

                  // Check if moist layer is selected and sensor count is empty
                  let hasMoistError = false
                  if (selectedLayer.toLowerCase() === "moist" && (moistLevel === undefined || moistLevel === null || moistLevel === 0)) {
                    setMoistLevelError(true)
                    setMoistLevelErrorMessage("Sensor count is required for Moist layer")
                    hasMoistError = true
                  } else if (moistLevelError) {
                    // Check if there's a moist level validation error (like out of range)
                    hasMoistError = true
                  }

                  // Check if there are any errors (form errors or moist level error)
                  if (Object.values(hasErrors).some((error) => error) || hasMoistError) {
                    return
                  }

                  // Check if both latitude and longitude are 0
                  const lat = Number.parseFloat(unitLatitude)
                  const lng = Number.parseFloat(unitLongitude)
                  if (lat === 0 && lng === 0) {
                    presentAlert({
                      header: "Invalid Location",
                      message:
                        "Invalid location (0, 0). Please position the map to select a valid sensor location.",
                      buttons: ["OK"],
                    })
                    return
                  }

                  const fullSensorId = `${sensorPrefix}${sensorId}`

                  // Prepare options for unit creation handler
                  const createUnitOptions: CreateUnitOptions = {
                    // Form state
                    unitName,
                    unitLatitude,
                    unitLongitude,
                    selectedSite,
                    selectedSiteGroup,
                    selectedLayer,
                    fullSensorId,
                    moistLevel,
                    requestHardware,

                    // QR state
                    isQRScanned,
                    scannedSensorId,
                    qrTimezone,
                    qrCustomFields,
                    qrBudgetLines,
                    qrRawMetric,
                    qrDisplayMetric,
                    newLayerConfigData,

                    // Props
                    userId,
                    siteList,
                    setSiteList,

                    // State setters for form clearing
                    setUnitName,
                    setSensorId,
                    setSensorPrefix,
                    setSelectedLayer,
                    setSelectedSiteGroup,
                    setMoistLevel,
                    setRequestHardware,
                    setFormErrors,
                    setIsQRScanned,
                    setScannedSensorId,
                    setQrTimezone,
                    setQrCustomFields,
                    setQrBudgetLines,
                    setQrRawMetric,
                    setQrDisplayMetric,
                    setNewLayerConfigData,
                    setSiteGroupError,
                    setTempLayerName,

                    // Map markers state
                    markers,
                    setMarkers,
                    setShowQRScanner,
                    setActiveTab,
                    setNavigationHistory,

                    // Alert function
                    presentAlert,

                    // Validation function
                    validateSensorId,
                  }

                  // Use the consolidated handler
                  validateAndCreateUnit(createUnitOptions)
                }}
              >
                <IonIcon icon={add} slot="start" />
                ADD UNIT
              </IonButton>
            </div>
          </div>
        </div>
      </div>

      {/* New Layer Modal */}
      <IonModal isOpen={isNewLayerModalOpen} onDidDismiss={() => setIsNewLayerModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Create New Layer</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setIsNewLayerModalOpen(false)}>
              Cancel
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Layer Name</IonLabel>
            <IonInput
              placeholder="Enter Layer Name"
              value={newLayerName}
              onIonInput={(e) => setNewLayerName(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Marker Type</IonLabel>
            <IonSelect value={newLayerMarkerType} onIonChange={(e) => setNewLayerMarkerType(e.detail.value)}>
              <IonSelectOption value="fuel">Fuel marker</IonSelectOption>
              <IonSelectOption value="srs-green-fuel">SRS Green Fuel</IonSelectOption>
              <IonSelectOption value="srs-ref-fuel">SRS Reference Fuel</IonSelectOption>
              <IonSelectOption value="moist-fuel">Moisture Fuel</IonSelectOption>
              <IonSelectOption value="temp_rh">Temperature/Relative Humidity</IonSelectOption>
              <IonSelectOption value="temp-rh-v2">Temperature/RH Version 2</IonSelectOption>
              <IonSelectOption value="wxet">Weather Station ET</IonSelectOption>
              <IonSelectOption value="planthealth">Plant Health</IonSelectOption>
              <IonSelectOption value="soiltemp">Soil Temperature</IonSelectOption>
              <IonSelectOption value="psi">PSI (Pressure)</IonSelectOption>
              <IonSelectOption value="vfd">VFD (Variable Frequency Drive)</IonSelectOption>
              <IonSelectOption value="bflow">Budget/Flow</IonSelectOption>
              <IonSelectOption value="valve">Valve</IonSelectOption>
              <IonSelectOption value="graphic">Graphic</IonSelectOption>
              <IonSelectOption value="disease">Disease</IonSelectOption>
              <IonSelectOption value="pump">Pump</IonSelectOption>
              <IonSelectOption value="chemical">Chemical</IonSelectOption>
              <IonSelectOption value="infra-red">Infra-Red</IonSelectOption>
              <IonSelectOption value="neutron">Neutron</IonSelectOption>
              <IonSelectOption value="virtual-weather-station">Virtual Weather Station</IonSelectOption>
            </IonSelect>
          </IonItem>

          <div style={{ marginTop: "20px", marginBottom: "10px", fontWeight: "bold", color: "#666" }}>
            Data Source Configuration
          </div>

          <IonItem>
            <IonLabel position="stacked">Table</IonLabel>
            <IonInput
              placeholder="Table"
              value={newLayerTable}
              onIonInput={(e) => setNewLayerTable(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Column</IonLabel>
            <IonInput
              placeholder="Column"
              value={newLayerColumn}
              onIonInput={(e) => setNewLayerColumn(e.detail.value!)}
            />
          </IonItem>

          <IonButton expand="block" onClick={handleFinishNewLayer} style={{ marginTop: "20px" }}>
            Finish
          </IonButton>
        </IonContent>
      </IonModal>

      <SensorModal
        isOpen={isSensorModalOpen}
        onClose={() => setIsSensorModalOpen(false)}
        onConfirm={(sensor) => {
          setIsSensorModalOpen(false)
          setSelectedMoistureSensor?.(sensor)
          setPage(3)
        }}
        selectedSensor={null}
        sensors={availableSensors}
      />
    </div>
  )
}

export default AddUnitTab