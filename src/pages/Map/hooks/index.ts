// Custom hooks for Map component
// These hooks extract logic from the massive Map/index.tsx component

// Map initialization and management
export { useMapInitialization } from './useMapInitialization';
export { useOverlayManagement } from './useOverlayManagement';

// User interactions
export { useUserLocation } from './useUserLocation';
export { useLocationTracking } from './useLocationTracking';
export type { UseLocationTrackingReturn } from './useLocationTracking';

// Add Unit form management
export { useAddUnitForm } from './useAddUnitForm';

// Layer management
export { useLayers } from './useLayers';
export type { UseLayersReturn } from './useLayers';
