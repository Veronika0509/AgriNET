import React, { useEffect, useState } from "react"
import { IonItem, IonCheckbox } from "@ionic/react"
import LocationButton from "../LocationButton"
import type { Site, UserId } from "@/types"
import type { OverlayItem } from "../../types/OverlayItem"
import s from "../../style.module.css"
import layerListIcon from "../../../../assets/images/icons/layerListIcon.png"
import { saveLayerPreferences } from "../../../../utils/chartPreferences"

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

export interface MapTabProps {
  mapRef: React.RefObject<HTMLDivElement>
  centerMapOnUserLocation: () => void
  isLocationEnabled: boolean
  locationError: string | null
  siteList: Site[]
  activeOverlays: OverlayItem[]
  allOverlays: OverlayItem[]
  secondMap: google.maps.Map | string | null
  isMarkerClicked: boolean | string
  checkedLayers: { [key: string]: boolean }
  setCheckedLayers: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
  setActiveOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  amountOfSensors: number
  userId: UserId
  map: google.maps.Map | null
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
                                                isMarkerClicked,
                                                checkedLayers,
                                                setCheckedLayers,
                                                setActiveOverlays,
                                                amountOfSensors,
                                                userId,
                                                map,
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
    if (isMarkerClicked === false) {
      setHasLayersToShow(false)
      return
    }

    // Only show layer list when on tier 2 map (site is selected) AND all overlays are fully loaded
    const isTier2Map = typeof secondMap === "string" && secondMap !== ""
    const allOverlaysLoaded = allOverlays && allOverlays.length > 0 && amountOfSensors > 0 && allOverlays.length >= amountOfSensors

    if (!isTier2Map || !allOverlaysLoaded) {
      setHasLayersToShow(false)
      return
    }

    const hasSites = siteList && Array.isArray(siteList) && siteList.length > 0
    if (!hasSites) {
      setHasLayersToShow(false)
      return
    }

    const secondMapName = secondMap
    let layerCount = 0

    if (siteList && Array.isArray(siteList)) {
      siteList.forEach((site: SiteWithLayers) => {
        if (site && site.name === secondMapName && site.layers && Array.isArray(site.layers)) {
          layerCount += site.layers.length
        }
      })
    }

    setHasLayersToShow(layerCount > 0)
  }, [siteList, secondMap, allOverlays, isMarkerClicked, amountOfSensors])

  // Hide layer list after 4 seconds on mobile devices (screen width < 500px)
  // Timer starts AFTER layer list is shown and restarts when user changes layer selection
  useEffect((): void | (() => void) => {
    const screenWidth = window.innerWidth
    const isMobile = screenWidth < 500

    if (isMobile && hasLayersToShow) {
      const hideTimer = setTimeout(() => {
        setIsLayerListVisible(false)
      }, 4000)

      return (): void => {
        clearTimeout(hideTimer)
      }
    } else if (!isMobile && hasLayersToShow) {
      // On desktop, always keep layer list visible
      setIsLayerListVisible(true)
    }
  }, [hasLayersToShow, checkedLayers])

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
    console.log('[MapTab] Layer toggled:', { layerName, isChecked, userId });

    setCheckedLayers((prev) => {
      const newState = {
        ...prev,
        [layerName]: isChecked,
      }

      // Get site name from isMarkerClicked (it contains the site name when a site is selected)
      const siteName = typeof isMarkerClicked === "string" ? isMarkerClicked : ""
      console.log('[MapTab] Saving preferences:', { siteName, userId, newState });
      if (siteName && userId) {
        saveLayerPreferences(userId, siteName, newState)
      } else {
        console.warn('[MapTab] Cannot save preferences - missing siteName or userId:', { siteName, userId });
      }

      return newState
    })

    if (allOverlays && Array.isArray(allOverlays)) {
      allOverlays.forEach((overlay: OverlayItem) => {
        const chartDataLayerName = overlay?.chartData?.layerName
        const isMatchByChartDataLayerName = chartDataLayerName === layerName

        if (overlay && isMatchByChartDataLayerName) {
          if (isChecked) {
            // Show the overlay - ONLY use setMap, don't use show()
            console.log('[MapTab] Showing overlay:', layerName, overlay?.chartData?.sensorId, 'map:', map);

            // Add to activeOverlays first
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

            // Just call show() since overlay is already on the map
            requestAnimationFrame(() => {
              if (overlay.show && typeof overlay.show === "function") {
                console.log('[MapTab] Calling show() to make overlay visible');
                overlay.show()
              }
            })
          } else {
            // Hide the overlay - use hide() but DON'T use setMap(null)
            // This keeps the overlay attached to the map but makes it invisible
            console.log('[MapTab] Hiding overlay:', layerName, overlay?.chartData?.sensorId);

            // Remove from activeOverlays first
            setActiveOverlays((prevActiveOverlays: OverlayItem[]) =>
              prevActiveOverlays.filter(
                (active: OverlayItem) =>
                  active &&
                  active.chartData &&
                  overlay.chartData &&
                  active.chartData.sensorId !== overlay.chartData.sensorId,
              ),
            )

            // Only call hide() to make invisible, don't remove from map
            if (overlay.hide && typeof overlay.hide === "function") {
              console.log('[MapTab] Calling hide() to make overlay invisible');
              overlay.hide()
            }
          }
        }
      })
    }
  }

  // Map unit type names to display names
  const getLayerDisplayName = (layerName: string): string => {
    const displayNameMap: { [key: string]: string } = {
      "SoilTemp": "Temp/RH",
      "EXTL": "Links",
      "Moist": "SoilM",
      "WXET": "Weather"
    }
    return displayNameMap[layerName] || layerName
  }

  // Extract layer names from site data
  const renderLayerList = () => {
    // Don't render if we're on sites view
    if (isMarkerClicked === false) {
      return null
    }

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
      <div className={s.layersListWrapper} data-from="MapTab">
        <div className={s.layers_checkbox}>
          {layers.map((layer: string) => (
            <IonItem key={layer} className={s.layers_item}>
              <IonCheckbox
                checked={checkedLayers[layer] || false}
                justify="space-between"
                className={'my-checkbox'}
                onIonChange={(checkbox) => handleToggleLayer(checkbox, layer)}
              >
                {getLayerDisplayName(layer)}
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
