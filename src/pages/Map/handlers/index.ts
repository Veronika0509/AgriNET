/**
 * Map Handlers - Centralized exports for all handler functions
 */

// Site handlers
export { handleCreateNewSite, showCreateNewSiteAlert } from "./siteHandlers"
export type { CreateSiteOptions, ShowCreateSiteAlertOptions } from "./siteHandlers"

// Layer handlers
export {
  handleCreateNewLayer,
  showCreateNewLayerAlert,
  handleFinishNewLayer,
  handleToggleLayer,
} from "./layerHandlers"
export type {
  CreateLayerOptions,
  HandleFinishNewLayerOptions,
  ShowCreateLayerAlertOptions,
  ToggleLayerOptions,
} from "./layerHandlers"

// Modal handlers
export {
  createSensorModalHandlers,
  createTimezoneModalHandlers,
  showPurchaseRequestAlert,
} from "./modalHandlers"
export type { SensorModalHandlers, TimezoneModalHandlers, PurchaseAlertOptions } from "./modalHandlers"

// Unit handlers
export { createUnit, clearFormFields, reloadAndLogChanges, validateAndCreateUnit } from "../../../features/AddUnit/handlers/unitHandlers"
export type { UnitData, CreateUnitOptions } from "../../../features/AddUnit/handlers/unitHandlers"

// QR Scanner handlers
export { handleJSONQRData, handleKeyValueQRData } from "./qrScannerHandlers"
export type { QRData, QRScanHandlers } from "./qrScannerHandlers"