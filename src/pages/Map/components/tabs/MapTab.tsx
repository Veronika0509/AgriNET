import React, { useEffect, useState } from "react"
import { IonItem, IonCheckbox } from "@ionic/react"
import LocationButton from "../LocationButton"
import type { Site } from "@/types"
import type { OverlayItem } from "../../types/OverlayItem"
import s from "../../style.module.css"
import layerListIcon from "../../../../assets/images/icons/layerListIcon.png"

// LayerList interfaces
interface LayerListLayer {
  name: string
  markers: LayerListMarker[]
  [key: string]: unknown
}

interface LayerListMarker {
  chartData: {
    sensorId: string
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
  onLayerStateChange?: (state: { isMobileScreen: boolean; isLayerListVisible: boolean; hasLayersToShow: boolean; toggleLayerList: () => void }) => void
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
                                                onLayerStateChange,
                                              }) => {
  // State to control layer list visibility on mobile devices
  const [isLayerListVisible, setIsLayerListVisible] = useState(true)
  const [hasLayersToShow, setHasLayersToShow] = useState(false)

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

  // Check if there are layers to show
  useEffect(() => {
    const hasSites = siteList && Array.isArray(siteList) && siteList.length > 0
    if (!hasSites) {
      setHasLayersToShow(false)
      return
    }

    const secondMapName = typeof secondMap === "string" ? secondMap : secondMap?.getDiv()?.id || ""
    let layerCount = 0

    if (siteList && Array.isArray(siteList)) {
      siteList.forEach((site: SiteWithLayers) => {
        if (site && site.name === secondMapName && site.layers && Array.isArray(site.layers)) {
          layerCount += site.layers.length
        }
      })
    }

    setHasLayersToShow(layerCount > 0)
  }, [siteList, secondMap])

  // Hide layer list after 4 seconds on mobile devices (screen width < 500px)
  // Timer starts AFTER layer list is shown
  useEffect(() => {
    const screenWidth = window.innerWidth
    const isMobile = screenWidth < 500

    if (isMobile && hasLayersToShow) {
      const hideTimer = setTimeout(() => {
        setIsLayerListVisible(false)
      }, 4000)

      return () => clearTimeout(hideTimer)
    } else if (!isMobile && hasLayersToShow) {
      // On desktop, always keep layer list visible
      setIsLayerListVisible(true)
    }
  }, [hasLayersToShow])

  // Handle window resize - ensure layer list stays visible on desktop
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth
      if (screenWidth >= 500 && hasLayersToShow) {
        // On desktop, always show layer list
        setIsLayerListVisible(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [hasLayersToShow])

  // Determine if location button should be shown
  const shouldShowLocationButton = (() => {
    const userAgent = navigator.userAgent
    const screenWidth = window.screen?.width || window.innerWidth
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent)
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024
    return isMobileUserAgent && !isDesktop
  })()

  // Determine if we're on mobile (screen width < 500px)
  const isMobileScreen = window.innerWidth < 500

  // Toggle layer list visibility
  const toggleLayerList = () => {
    setIsLayerListVisible((prev) => !prev)
  }

  // Notify parent about state changes
  useEffect(() => {
    if (onLayerStateChange) {
      onLayerStateChange({
        isMobileScreen,
        isLayerListVisible,
        hasLayersToShow,
        toggleLayerList,
      })
    }
  }, [isMobileScreen, isLayerListVisible, hasLayersToShow, onLayerStateChange])

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

    if (!hasSites) {
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
            <IonItem key={layer} className={s.layers_item}>
              <IonCheckbox
                checked={checkedLayers[layer] || false}
                justify="space-between"
                className={'my-checkbox'}
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
      {isLayerListVisible && renderLayerList()}

      {/* Layer List Icon - Shows on mobile when list is hidden */}
      {isMobileScreen && !isLayerListVisible && hasLayersToShow && (
        <div className={s.layerListIconContainer} onClick={toggleLayerList}>
          <img src={layerListIcon} alt="Layer List" className={s.layerListIconImage} />
        </div>
      )}
    </div>
  )
}
