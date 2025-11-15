import React, { useEffect } from "react"
import { IonItem, IonCheckbox } from "@ionic/react"
import LocationButton from "../LocationButton"
import type { Site } from "@/types"
import type { OverlayItem } from "../../types/OverlayItem"
import s from "../../style.module.css"

// LayerList interfaces
interface LayerListLayer {
  name: string
  markers: LayerListMarker[]
  [key: string]: unknown
}

interface LayerListMarker {
  chartData: {
    sensorId: string | number
    [key: string]: unknown
  }
  [key: string]: unknown
}

// Extend Site interface to include layers
interface SiteWithLayers extends Site {
  layers?: LayerListLayer[]
}

interface MapTabProps {
  mapRef: React.RefObject<HTMLDivElement>
  centerMapOnUserLocation: () => void
  isLocationEnabled: boolean
  locationError: string | null
  siteList: Site[]
  activeOverlays: OverlayItem[]
  allOverlays: OverlayItem[]
  secondMap: google.maps.Map | string | null
  checkedLayers: { [key: string]: boolean }
  setCheckedLayers: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
  setActiveOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
}

export const MapTab: React.FC<MapTabProps> = ({
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
  // Trigger Google Maps resize when component mounts/becomes visible
  useEffect(() => {
    // Small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (secondMap && typeof secondMap !== 'string') {
        google.maps.event.trigger(secondMap, 'resize')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [secondMap])

  // Determine if location button should be shown
  const shouldShowLocationButton = (() => {
    const userAgent = navigator.userAgent
    const screenWidth = window.screen?.width || window.innerWidth
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent)
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024
    return isMobileUserAgent && !isDesktop
  })()

  // Handle layer toggle
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
            if (overlay.show && typeof overlay.show === "function") {
              overlay.show()
            }
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
            if (overlay.hide && typeof overlay.hide === "function") {
              overlay.hide()
            }
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

  // Extract layer names from site data
  const renderLayerList = () => {
    const hasSites = siteList && Array.isArray(siteList) && siteList.length > 0
    const hasCustomOverlays = activeOverlays && activeOverlays.length > 0

    if (!hasSites || !hasCustomOverlays) {
      return null
    }

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
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        className={s.map}
        ref={mapRef}
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* LocationButton - Mobile devices only */}
      {shouldShowLocationButton && (
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
