interface OverlayItem {
  chartData: {
    sensorId: string;
    [key: string]: unknown;
  };
  setMap: (map: google.maps.Map) => void;
  [key: string]: unknown;
}

export const addOverlayToOverlaysArray = (
  overlay: OverlayItem, 
  setActiveOverlays: (updater: (prev: OverlayItem[]) => OverlayItem[]) => void, 
  map: google.maps.Map
) => {
  // Use React.startTransition for safe state updates
  if (typeof (globalThis as any).React !== 'undefined' && (globalThis as any).React.startTransition) {
    (globalThis as any).React.startTransition(() => {
      setActiveOverlays((prevActiveOverlays: OverlayItem[]) => {
        const exists = prevActiveOverlays.some(
          (existingOverlay: OverlayItem) => existingOverlay.chartData.mainId === overlay.chartData.mainId
        );
        return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
      });
    });
  } else {
    // Fallback to setTimeout if React.startTransition is not available
    setTimeout(() => {
      setActiveOverlays((prevActiveOverlays: OverlayItem[]) => {
        const exists = prevActiveOverlays.some(
          (existingOverlay: OverlayItem) => existingOverlay.chartData.mainId === overlay.chartData.mainId
        );
        return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
      });
    }, 0);
  }
  
  // Set map in the next animation frame to avoid conflicts
  requestAnimationFrame(() => {
    overlay.setMap(map);
  });
}