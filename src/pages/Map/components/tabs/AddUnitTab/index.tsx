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
  useIonAlert,
} from "@ionic/react"
import { add, cameraOutline, informationCircle } from "ionicons/icons"
import { getSiteList } from "../../../data/getSiteList"
import s from "../../../style.module.css"

// Type imports
import type { Site, UserId, SiteId } from "../../../../../types"

interface AddUnitTabProps {
  // Refs
  addUnitMapRef: React.RefObject<HTMLDivElement>

  // Map state
  addUnitMap: google.maps.Map | null
  crosshairMarker: google.maps.Marker | null

  // Props from parent
  userId: UserId
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  selectedSiteForAddUnit: string
  setSelectedSiteForAddUnit: (site: string) => void
  setSelectedMoistureSensor?: (sensor: any) => void
  setPage: (page: number) => void

  // Form state from useAddUnitForm hook
  unitName: string
  setUnitName: (value: string) => void
  unitLatitude: string
  setUnitLatitude: (value: string) => void
  unitLongitude: string
  setUnitLongitude: (value: string) => void
  selectedSite: string
  setSelectedSite: (value: string) => void
  selectedSiteGroup: string
  setSelectedSiteGroup: (value: string) => void
  siteGroups: Array<{ id: string; name: string }>
  setSiteGroups: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string }>>>
  siteGroupError: { invalidGroup: string; correctGroups: string[] } | null
  setSiteGroupError: React.Dispatch<
    React.SetStateAction<{ invalidGroup: string; correctGroups: string[] } | null>
  >
  sensorPrefix: string
  setSensorPrefix: (value: string) => void
  sensorId: string
  setSensorId: (value: string) => void
  selectedLayer: string
  setSelectedLayer: (value: string) => void
  requestHardware: boolean
  setRequestHardware: (value: boolean) => void
  moistLevel: number | undefined
  setMoistLevel: (value: number | undefined) => void
  moistLevelError: boolean
  setMoistLevelError: (value: boolean) => void
  formErrors: {
    site: boolean
    siteGroup: boolean
    unitName: boolean
    latitude: boolean
    longitude: boolean
    sensor: boolean
    layer: boolean
  }
  setFormErrors: React.Dispatch<
    React.SetStateAction<{
      site: boolean
      siteGroup: boolean
      unitName: boolean
      latitude: boolean
      longitude: boolean
      sensor: boolean
      layer: boolean
    }>
  >
  validateSensorId: (sensorId: string) => { isValid: boolean; message: string }
  getAllSensorIds: () => string[]

  // Layer state
  layers: Array<{ id: string; name: string; value: string }>
  setLayers: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; value: string }>>>
  layerMapping: { [key: string]: string }
  setLayerMapping: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isLoadingLayers: boolean

  // QR Scanner state
  showQRScanner: boolean
  setShowQRScanner: (value: boolean) => void
  isQRScanned: boolean
  setIsQRScanned: (value: boolean) => void
  scannedSensorId: string
  setScannedSensorId: (value: string) => void
  qrTimezone: string
  setQrTimezone: (value: string) => void
  qrCustomFields: { [key: string]: any }
  setQrCustomFields: (value: { [key: string]: any }) => void
  qrBudgetLines: { [key: string]: any }
  setQrBudgetLines: (value: { [key: string]: any }) => void
  qrRawMetric: number
  setQrRawMetric: (value: number) => void
  qrDisplayMetric: number
  setQrDisplayMetric: (value: number) => void

  // New layer config state
  newLayerConfigData:
    | {
        table: string
        column: string
        markerType: string
      }
    | undefined
  setNewLayerConfigData: React.Dispatch<
    React.SetStateAction<
      | {
          table: string
          column: string
          markerType: string
        }
      | undefined
    >
  >

  // Markers state
  markers: google.maps.Marker[]
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>

  // Available sensors state
  availableSensors: any[]
  setAvailableSensors: (value: any[]) => void

  // Sensor modal state
  setIsSensorModalOpen: (value: boolean) => void

  // Navigation state
  setActiveTab: (tab: string) => void
  setNavigationHistory: React.Dispatch<React.SetStateAction<string[]>>

  // Handler functions
  showCreateNewSiteAlert: () => void
  showCreateNewLayerAlert: () => void
  showPurchaseRequestAlert: () => void
}

const AddUnitTab: React.FC<AddUnitTabProps> = ({
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
  markers,
  setMarkers,
  setAvailableSensors,
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
}) => {
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
                }}
                onClick={() => {
                  // Open QR Scanner modal
                  setShowQRScanner(true)
                }}
              >
                <IonIcon icon={cameraOutline} slot="start" />
                SCAN QR CODE
              </IonButton>
              <IonButton
                fill="outline"
                size="default"
                style={{
                  width: "100%",
                }}
                onClick={() => {
                  // Сохраняем выбранный сайт в глобальном состоянии
                  setSelectedSiteForAddUnit(selectedSite)

                  // Выводим информацию в консоль

                  // Собираем все Moist сенсоры из ВСЕХ сайтов
                  const allSensors: any[] = []

                  // Проходим по всем сайтам в списке
                  siteList.forEach((site: any) => {
                    if (site.layers) {
                      // Ищем слои с именем Moist в каждом сайте
                      site.layers.forEach((layer: any) => {
                        if (layer.name === "Moist" && layer.markers && Array.isArray(layer.markers)) {
                          // Добавляем все маркеры из слоя Moist
                          layer.markers.forEach((marker: any) => {
                            allSensors.push({
                              layerName: layer.name,
                              sensorId: marker.sensorId,
                              name: marker.name,
                              siteName: site.name, // Добавляем имя сайта для отображения
                              ...marker,
                            })
                          })
                        }
                      })
                    }
                  })

                  // Устанавливаем доступные сенсоры и открываем модальное окно
                  setAvailableSensors(allSensors)
                  setIsSensorModalOpen(true)
                }}
              >
                ADD VALVE
              </IonButton>
            </div>

            <div className={s.addUnitForm}>
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

                    // Находим выбранный сайт в списке
                    const selectedSiteObj = siteList?.find((site) => site.name === newSite)

                    setSelectedSite(newSite)
                    setSelectedSiteForAddUnit(newSite)

                    if (selectedSiteObj) {
                      // Обновляем координаты в полях ввода
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
                    "font-size": "12px",
                    "font-weight": "500",
                    "text-transform": "uppercase",
                    "letter-spacing": "0.5px",
                    "margin-left": "8px",
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
                      // Сбрасываем ошибку latitude как только начинаем вводить
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
                      // Сбрасываем ошибку longitude как только начинаем вводить
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
                      // Сбрасываем ошибку если sensorId заполнен (prefix необязателен)
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
                        // Сбрасываем ошибку если заполнен (prefix необязателен)
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

                    // Выводим mapping для выбранного слоя
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
                  ) : layers.length > 0 ? (
                    layers.map((layer) => (
                      <IonSelectOption key={layer.id} value={layer.value || layer.id}>
                        {layer.name || `Layer ${layer.id}`}
                      </IonSelectOption>
                    ))
                  ) : (
                    <>
                      <IonSelectOption value="Moist">Moist</IonSelectOption>
                      <IonSelectOption value="Temp">Temp</IonSelectOption>
                      <IonSelectOption value="Wxet">Wxet</IonSelectOption>
                      <IonSelectOption value="Valve">Valve</IonSelectOption>
                      <IonSelectOption value="Extl">Extl</IonSelectOption>
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
                    "font-size": "12px",
                    "font-weight": "500",
                    "text-transform": "uppercase",
                    "letter-spacing": "0.5px",
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
                    {selectedLayer.toLowerCase() === "moist" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <IonInput
                          type="number"
                          min="1"
                          max="12"
                          step="1"
                          placeholder="Sensor count"
                          inputmode="numeric"
                          value={moistLevel}
                          onIonInput={(e) => {
                            const inputValue = (e.target as HTMLIonInputElement).value
                            // Если инпут пустой, не показываем ошибку
                            if (!inputValue || inputValue === "") {
                              setMoistLevel(undefined)
                              setMoistLevelError(false)
                              return
                            }
                            const v = Number(inputValue)
                            if (Number.isNaN(v)) {
                              setMoistLevelError(false)
                              return
                            }
                            setMoistLevel(v)
                            if (v < 1 || v > 12) {
                              setMoistLevelError(true)
                            } else {
                              setMoistLevelError(false)
                            }
                          }}
                          style={
                            {
                              width: "150px",
                              textAlign: "left",
                              "--padding-start": "0px",
                              "--padding-end": "0px",
                            } as React.CSSProperties
                          }
                        />
                        {moistLevelError && (
                          <div
                            style={{
                              color: "var(--ion-color-danger)",
                              fontSize: "14px",
                              marginTop: "4px",
                            }}
                          >
                            Input sensor count from 1 to 12
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

                  // Validate form data (sensorPrefix может быть пустым!)
                  const hasErrors = {
                    site: !selectedSite,
                    siteGroup: false, // Site group is optional
                    unitName: !unitName.trim(),
                    latitude: !unitLatitude,
                    longitude: !unitLongitude,
                    sensor: !sensorId.trim(), // Только проверяем что sensorId не пустой
                    layer: !selectedLayer,
                  }

                  setFormErrors(hasErrors)

                  // Check if there are any errors
                  if (Object.values(hasErrors).some((error) => error)) {
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

                  // Функция для создания юнита
                  const createUnit = async (overrideFlags?: {
                    warnIfSensorIdExist?: boolean
                    askOverrideInstallDate?: boolean
                  }) => {
                    // Get current date in YYYY-MM-DD format
                    const currentDate = new Date().toISOString().split("T")[0]

                    // Determine timezone: QR code first, then browser timezone
                    const timezone = qrTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone

                    // Check if sensor ID was modified after QR scan
                    const sensorIdModified = isQRScanned && scannedSensorId && scannedSensorId !== fullSensorId

                    const unitData = {
                      // Required Fields
                      name: unitName,
                      lat: Number.parseFloat(unitLatitude),
                      lng: Number.parseFloat(unitLongitude),
                      userId: userId,
                      site: selectedSite,
                      layer: selectedLayer,
                      siteGroup: selectedSiteGroup || undefined,
                      installDate: currentDate,
                      timezone: timezone,
                      warnIfSensorIdExist:
                        overrideFlags?.warnIfSensorIdExist !== undefined
                          ? overrideFlags.warnIfSensorIdExist
                          : !isQRScanned || sensorIdModified,
                      askOverrideInstallDate:
                        overrideFlags?.askOverrideInstallDate !== undefined
                          ? overrideFlags.askOverrideInstallDate
                          : true,
                      requestHardware: requestHardware,

                      // Optional Fields
                      sensorId: fullSensorId || undefined,
                      sensorCount: selectedLayer.toLowerCase() === "moist" ? moistLevel : undefined,
                      newLayerConfig: newLayerConfigData || undefined,
                      datasource: undefined,
                      customFields: qrCustomFields,
                      budgetLines: qrBudgetLines,
                      rawMetric: qrRawMetric,
                      displayMetric: qrDisplayMetric,
                      pictureBase64: null,
                    }


                    try {
                      // Make POST request to add unit
                      // Note: Authentication is handled via the 'User' header, not Authorization
                      const response = await fetch("https://app.agrinet.us/api/add-unit", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          User: userId.toString(),
                        },
                        body: JSON.stringify(unitData),
                      })

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: response.statusText }))
                        throw new Error(errorData.message || `Failed to add unit: ${response.statusText}`)
                      }

                      const result = await response.json()

                      // Check if the operation was successful
                      if (result.success === false) {
                        // Step 1: Check which flag indicates the reason for failure

                        // Step 2a: Sensor ID already exists?
                        if (result.sensorIdExistWarn === true) {
                          const layers = result.sensorIdExistOnLayer || []
                          const layerText =
                            layers.length > 0
                              ? `the ${layers.join(", ")} layer${layers.length > 1 ? "s" : ""}`
                              : "another layer"

                          // Add delay to ensure previous alert (if any) is dismissed
                          setTimeout(() => {
                            presentAlert({
                              header: "⚠️ Warning",
                              message: `This sensor ID already exist in ${layerText}`,
                              buttons: [
                                {
                                  text: "Cancel",
                                  role: "cancel",
                                },
                                {
                                  text: "Continue",
                                  handler: () => {
                                    // Retry with warnIfSensorIdExist: false, preserving other override flags
                                    createUnit({
                                      warnIfSensorIdExist: false,
                                      askOverrideInstallDate: overrideFlags?.askOverrideInstallDate,
                                    })
                                  },
                                },
                              ],
                            })
                          }, 100)
                          return
                        }

                        // Step 2b: Install date conflict?
                        else if (result.askOverrideInstallDate === true) {
                          const existingDate = result.installDate || "unknown date"

                          // Use a small delay to ensure any previous alerts (like sensor ID validation) are dismissed
                          setTimeout(async () => {
                            try {
                              await presentAlert({
                                header: "Warning",
                                message: `This sensor already exist and has install data: ${existingDate}, override this by current date?`,
                                buttons: [
                                  {
                                    text: "Cancel",
                                    role: "cancel",
                                    handler: () => {
                                    },
                                  },
                                  {
                                    text: "Override install date",
                                    handler: () => {
                                      // Retry with askOverrideInstallDate: false, preserving warnIfSensorIdExist flag
                                      createUnit({
                                        warnIfSensorIdExist: overrideFlags?.warnIfSensorIdExist,
                                        askOverrideInstallDate: false,
                                      })
                                    },
                                  },
                                ],
                              })
                            } catch (error) {
                              console.error("Error presenting alert:", error)
                            }
                          }, 100)
                          return
                        }

                        // Step 2c: Site group access issue?
                        else if (result.userNotInSiteGroup === true) {
                          const invalidGroup = result.siteGroup || selectedSiteGroup
                          const correctGroups = result.userSiteGroups || []

                          console.log("Production mode: Setting siteGroupError state:", {
                            invalidGroup,
                            correctGroups,
                          })

                          // Add a small delay to ensure any previous alerts (like sensor ID validation) are dismissed
                          setTimeout(() => {
                            setSiteGroupError({
                              invalidGroup: invalidGroup,
                              correctGroups: correctGroups,
                            })
                          }, 300)

                          return
                        }

                        // Step 2d: General error
                        else {
                          const errorMessage = result.error || "Failed to add unit. Please try again."
                          presentAlert({
                            header: "❌ Error",
                            message: errorMessage,
                            buttons: ["Close"],
                          })
                          return
                        }
                      }

                      // Success! The unit was added successfully

                      // Store the old site list for comparison
                      const oldSiteList = JSON.parse(JSON.stringify(siteList))

                      // Helper function to clear form fields
                      const clearFormFields = () => {
                        // Clear text inputs
                        setUnitName("")
                        setSensorId("")
                        setSensorPrefix("")

                        // DON'T clear coordinate inputs - they show the map center position
                        // setUnitLatitude('');
                        // setUnitLongitude('');

                        // Clear selectors
                        setSelectedLayer("")
                        setSelectedSiteGroup("")

                        // Clear other form fields
                        setMoistLevel(undefined)
                        setRequestHardware(false)

                        // Clear form errors
                        setFormErrors({
                          site: false,
                          siteGroup: false,
                          unitName: false,
                          latitude: false,
                          longitude: false,
                          sensor: false,
                          layer: false,
                        })

                        // Reset QR-related states
                        setIsQRScanned(false)
                        setScannedSensorId("")
                        setQrTimezone("")
                        setQrCustomFields({})
                        setQrBudgetLines({})
                        setQrRawMetric(0)
                        setQrDisplayMetric(0)
                        setNewLayerConfigData(undefined)
                      }

                      // Helper function to reload and log site list changes
                      const reloadAndLogChanges = async () => {
                        // Fetch fresh site list data WITHOUT forcing component remount
                        const sites = await getSiteList(userId)

                        // Check if API call was successful
                        if ("success" in sites && sites.success === false) {
                          console.error("Failed to reload site list:", sites.error)
                          return
                        }

                        // Clear existing markers so createSites will recreate all markers with new data
                        // IMPORTANT: Remove old markers from the map BEFORE clearing the state
                        markers.forEach((marker: any) => {
                          if (marker && marker.setMap) {
                            marker.setMap(null)
                          }
                          if (marker && marker.infoWindow) {
                            marker.infoWindow.close()
                          }
                        })
                        setMarkers([])

                        // Update site list with fresh data
                        setSiteList(sites.data)


                        // Compare old and new site lists

                        // Check for new sites
                        const newSites = siteList.filter(
                          (newSite: any) => !oldSiteList.some((oldSite: any) => oldSite.id === newSite.id),
                        )
                        if (newSites.length > 0) {
                        }

                        // Check for removed sites
                        const removedSites = oldSiteList.filter(
                          (oldSite: any) => !siteList.some((newSite: any) => newSite.id === oldSite.id),
                        )
                        if (removedSites.length > 0) {
                        }

                        // Check for modified sites (compare layers and markers)
                        siteList.forEach((newSite: any) => {
                          const oldSite = oldSiteList.find((old: any) => old.id === newSite.id)
                          if (oldSite) {
                            // Compare layers
                            const oldLayers = oldSite.layers || []
                            const newLayers = newSite.layers || []

                            // Check each layer for new markers
                            newLayers.forEach((newLayer: any) => {
                              const oldLayer = oldLayers.find((old: any) => old.name === newLayer.name)

                              if (!oldLayer) {
                              } else {
                                const oldMarkers = oldLayer.markers || []
                                const newMarkers = newLayer.markers || []

                                if (oldMarkers.length !== newMarkers.length) {
                                  // Find new markers
                                  const addedMarkers = newMarkers.filter(
                                    (newMarker: any) =>
                                      !oldMarkers.some(
                                        (oldMarker: any) =>
                                          oldMarker.chartData?.sensorId === newMarker.chartData?.sensorId,
                                      ),
                                  )

                                  if (addedMarkers.length > 0) {
                                    console.log(`    ➕ NEW MARKERS ADDED (${addedMarkers.length}):`)
                                    addedMarkers.forEach((marker: any) => {
                                      console.log(`      - Sensor ID: ${marker.chartData?.sensorId}`)
                                      console.log(`        Name: ${marker.chartData?.name || "N/A"}`)
                                      console.log(`        Type: ${marker.chartData?.markerType || "N/A"}`)
                                      console.log(
                                        `        Coordinates: (${marker.chartData?.lat}, ${marker.chartData?.lng})`,
                                      )
                                    })
                                  }

                                  // Find removed markers
                                  const removedMarkers = oldMarkers.filter(
                                    (oldMarker: any) =>
                                      !newMarkers.some(
                                        (newMarker: any) =>
                                          newMarker.chartData?.sensorId === oldMarker.chartData?.sensorId,
                                      ),
                                  )

                                  if (removedMarkers.length > 0) {
                                  }
                                }
                              }
                            })

                            // Check for removed layers
                            oldLayers.forEach((oldLayer: any) => {
                              const layerStillExists = newLayers.some(
                                (newLayer: any) => newLayer.name === oldLayer.name,
                              )
                              if (!layerStillExists) {
                              }
                            })
                          }
                        })


                        // Search through all sites and layers to find the new unit
                        siteList.forEach((site: any) => {
                          if (site.layers) {
                            site.layers.forEach((layer: any) => {
                              if (layer.markers) {
                                const foundMarker = layer.markers.find(
                                  (marker: any) => marker.chartData && marker.chartData.sensorId === fullSensorId,
                                )
                                if (foundMarker) {
                                }
                              }
                            })
                          }
                        })
                      }

                      // Show success alert with options - use setTimeout to ensure it displays
                      setTimeout(() => {
                        presentAlert({
                          header: "✓ Added",
                          message: "Unit successfully added.\nDo you want create another one?",
                          backdropDismiss: false,
                          buttons: [
                            {
                              text: "To map",
                              handler: async () => {
                                // Ensure QR scanner is closed before navigating
                                setShowQRScanner(false)

                                // Clear form fields first
                                clearFormFields()

                                // Reload data FIRST to get the updated site list
                                await reloadAndLogChanges()

                                // Then navigate to map tab after data is loaded
                                // This ensures the map renders with the new data
                                setTimeout(() => {
                                  setActiveTab("map")
                                  // Remove 'add' from history since we're going to map
                                  setNavigationHistory((prev) => prev.slice(0, -1))
                                }, 100)
                              },
                            },
                            {
                              text: "Add next",
                              handler: () => {
                                // Clear form fields immediately
                                clearFormFields()

                                // Don't reload the map page at all to avoid component remount
                                // The new unit will appear when user navigates to map tab naturally
                                console.log(
                                  "Form cleared, ready for next unit. Map will update when you navigate to it.",
                                )
                              },
                            },
                          ],
                        })
                      }, 100)
                    } catch (error) {
                      console.error("Error adding unit:", error)

                      // Show error message
                      presentAlert({
                        header: "Error",
                        message: error instanceof Error ? error.message : "Failed to add unit. Please try again.",
                        buttons: ["OK"],
                      })
                    }
                  }

                  // Валидация формата SensorId
                  const validation = validateSensorId(fullSensorId)

                  if (!validation.isValid) {
                    // Показываем предупреждение с возможностью продолжить
                    presentAlert({
                      header: "Sensor ID Validation Warning",
                      message: validation.message,
                      cssClass: "sensor-id-validation-alert",
                      buttons: [
                        {
                          text: "ACCEPT ANYWAY",
                          cssClass: "alert-button-confirm",
                          handler: () => {
                            // Формат невалиден, но пользователь хочет продолжить
                            // Создаем юнит, сервер проверит дубликаты
                            createUnit()
                          },
                        },
                        {
                          text: "CANCEL SAVING",
                          role: "cancel",
                          cssClass: "alert-button-cancel",
                        },
                      ],
                    })
                  } else {
                    // Формат валиден - создаем юнит, сервер проверит дубликаты
                    createUnit()
                  }
                }}
              >
                <IonIcon icon={add} slot="start" />
                ADD UNIT
              </IonButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddUnitTab