export const addOverlayToOverlaysArray = (overlay: any, setActiveOverlays: any, map: any)=> {
  setActiveOverlays((prevActiveOverlays: any) => {
    const exists = prevActiveOverlays.some(
      (existingOverlay: any) => existingOverlay.chartData.sensorId === overlay.chartData.sensorId
    );
    return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
  });
  overlay.setMap(map);
}