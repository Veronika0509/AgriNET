export const adjustOverlayPosition = (
  projection: google.maps.MapCanvasProjection,
  currentOverlay: any,
  isAllCoordinatesOfMarkersAreReady: Array<{
  lat: number;
  lng: number;
  id: string;
  mainId: number;
}>,
  currentBounds: google.maps.LatLngBounds
) => {
  const SPREAD_DISTANCE = 100;
  if (!projection || !currentOverlay || !isAllCoordinatesOfMarkersAreReady) return null;

  const currentCenter = currentBounds.getCenter();
  const currentPixel: any = projection.fromLatLngToDivPixel(currentCenter);

  // Find all overlays that overlap with the current one
  const overlappingMarkers = isAllCoordinatesOfMarkersAreReady.filter(marker => {
    if (marker.id === currentOverlay.chartData?.id) return false;
    const markerLatLng = new google.maps.LatLng(marker.lat, marker.lng);
    const markerPixel: any = projection.fromLatLngToDivPixel(markerLatLng);

    const dx = currentPixel.x - markerPixel.x;
    const dy = currentPixel.y - markerPixel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < SPREAD_DISTANCE;
  });

  if (overlappingMarkers.length > 0) {
    const angle = (Math.PI * 2) / (overlappingMarkers.length + 1);
    const index = overlappingMarkers.findIndex(
      marker => marker.mainId === currentOverlay.chartData?.mainId
    );

    // If this overlay is part of the overlapping group, adjust its position
    if (index !== -1) {
      const adjustedX = Math.cos(angle * index) * SPREAD_DISTANCE;
      const adjustedY = Math.sin(angle * index) * SPREAD_DISTANCE;
      return new google.maps.Point(adjustedX, adjustedY);
    }
  }

  // If no overlap or not part of overlapping group, return zero offset
  return new google.maps.Point(0, 0);
};