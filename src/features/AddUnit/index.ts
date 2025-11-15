/**
 * AddUnit Feature Module
 *
 * This module provides all functionality for adding new units to the AgriNET system.
 * It includes the main component, hooks, handlers, utilities, and types.
 */

// Export main container (recommended - includes all state management)
export { default as AddUnitContainer } from './AddUnitContainer'

// Export individual components (for advanced usage)
export { default as AddUnitTab } from './components/AddUnitTab'
export type { AddUnitTabProps } from './components/AddUnitTab'

// Export hooks
export { useAddUnitForm } from './hooks/useAddUnitForm'
export { useAddUnitMap } from './hooks/useAddUnitMap'
export { useSiteGroups } from './hooks/useSiteGroups'

// Export handlers
export {
  createUnit,
  clearFormFields,
  reloadAndLogChanges,
  validateAndCreateUnit,
  type UnitData,
  type CreateUnitOptions,
} from './handlers/unitHandlers'

export {
  handleJSONQRData,
  handleKeyValueQRData,
  type QRData,
  type QRScanHandlers,
} from './handlers/qrScannerHandlers'

// Export utilities
export {
  isSiteNameValid,
  handleCreateNewSite,
  type SiteValidationResult,
  type CreateSiteParams,
} from './utils/siteManagement'

// Export types
export type {
  SiteGroup,
  Layer,
  FormErrors,
  NewLayerConfigData,
  HTMLIonInputElement,
} from './types'