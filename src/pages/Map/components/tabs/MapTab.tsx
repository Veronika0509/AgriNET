import React from "react"
import { IonCheckbox, IonItem } from "@ionic/react"
import type { Site } from "../../../../types"
import type { SiteWithLayers, LayerListLayer } from "../../types"
import type { OverlayItem } from "../../types/OverlayItem"
import LocationButton from "../LocationButton"
import s from "../../style.module.css"

export interface MapTabProps {
  mapRef: React.RefObject<HTMLDivElement>
  // Location button props
  centerMapOnUserLocation: () => void
  isLocationEnabled: boolean
  locationError: string | null
  // Layer list props
  siteList: Site[]
  activeOverlays: OverlayItem[]
  allOverlays: OverlayItem[]
  secondMap: google.maps.Map | string | null
  checkedLayers: { [key: string]: boolean }
  setCheckedLayers: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
  setActiveOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
}

/**
 * Map Tab - Displays the main map with location button and layer list
 */
const MapTab: React.FC<MapTabProps> = ({
  mapRef,
  centerMapOnUserLocation,
  isLocationEnabled,
  locationError,
  siteList,
  activeOverlays,
  allOverlays,
  secondMap,
  checkedLayers,
  setCheckedLayers,
  setActiveOverlays,
}) => {
  /**
   * Checks if device is mobile
   */
  const isMobileDevice = () => {
    const userAgent = navigator.userAgent
    const screenWidth = window.screen?.width || window.innerWidth
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent)
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024
    return isMobileUserAgent && !isDesktop
  }

  /**
   * Handles layer visibility toggle
   */
  const handleToggleLayer = (checkbox: CustomEvent, layerName: string) => {
    const isChecked = checkbox.detail.checked

    setCheckedLayers((prev) => ({
      ...prev,
      [layerName]: isChecked,
    }))

    if (allOverlays && Array.isArray(allOverlays)) {
      allOverlays.forEach((overlay: OverlayItem) => {
        const chartDataLayerName = overlay?.chartData?.layerName
        const isMatchByChartDataLayerName = chartDataLayerName === layerName

        if (overlay && isMatchByChartDataLayerName) {
          if (isChecked) {
            // Show overlay
            if (overlay.show && typeof overlay.show === "function") {
              overlay.show()
            }
            // Add to active overlays if not already there
            if (activeOverlays && !activeOverlays.includes(overlay)) {
              setActiveOverlays((prevActiveOverlays: OverlayItem[]) => {
                const exists = prevActiveOverlays.some(
                  (existingOverlay: OverlayItem) =>
                    existingOverlay &&
                    existingOverlay.chartData &&
                    overlay.chartData &&
                    existingOverlay.chartData.sensorId === overlay.chartData.sensorId,
                )
                return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay]
              })
            }
          } else {
            // Hide overlay
            if (overlay.hide && typeof overlay.hide === "function") {
              overlay.hide()
            }
            // Remove from active overlays
            setActiveOverlays((prevActiveOverlays: OverlayItem[]) =>
              prevActiveOverlays.filter(
                (active: OverlayItem) =>
                  active &&
                  active.chartData &&
                  overlay.chartData &&
                  active.chartData.sensorId !== overlay.chartData.sensorId,
              ),
            )
          }
        }
      })
    }
  }

  /**
   * Renders the layer list checkboxes
   */
  const renderLayerList = () => {
    // Check conditions for LayerList
    const hasSites = siteList && Array.isArray(siteList) && siteList.length > 0
    const hasCustomOverlays = activeOverlays && activeOverlays.length > 0

    if (!hasSites || !hasCustomOverlays) {
      return null
    }

    // Extract layer names from site data
    const layers: string[] = []
    const secondMapName = typeof secondMap === "string" ? secondMap : secondMap?.getDiv()?.id || ""

    if (siteList && Array.isArray(siteList)) {
      siteList.forEach((site: SiteWithLayers) => {
        if (site && site.name === secondMapName && site.layers && Array.isArray(site.layers)) {
          site.layers.forEach((layer: LayerListLayer) => {
            if (layer && layer.name && !layers.includes(layer.name)) {
              layers.push(layer.name)
            }
          })
        }
      })
    }

    if (!layers || layers.length === 0) {
      return null
    }

    return (
      <div className={s.layersListWrapper}>
        <div className={s.layers_checkbox}>
          {layers.map((layer: string) => (
            <IonItem key={layer}>
              <IonCheckbox
                checked={checkedLayers[layer] || false}
                justify="space-between"
                onIonChange={(checkbox) => handleToggleLayer(checkbox, layer)}
              >
                {layer === "SoilTemp" ? "Temp/RH" : layer}
              </IonCheckbox>
            </IonItem>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={s.map}
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* LocationButton - Mobile devices only */}
      {isMobileDevice() && (
        <LocationButton
          onLocationClick={centerMapOnUserLocation}
          isLocationEnabled={isLocationEnabled}
          locationError={locationError}
        />
      )}

      {/* LayerList Component */}
      {renderLayerList()}
    </div>
  )
}

export default MapTab