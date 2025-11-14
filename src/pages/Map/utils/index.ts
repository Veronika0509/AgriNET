// Export all utility functions from a central location
export { isSiteNameValid, isLayerNameValid } from "./siteManagement"
export {
  updateUserLocationMarker,
  tryHighAccuracyLocation,
  tryLowAccuracyLocation,
  centerMapOnUserLocation,
  isMobileDevice,
} from "./gpsLocation"
export type { LocationState } from "./gpsLocation"