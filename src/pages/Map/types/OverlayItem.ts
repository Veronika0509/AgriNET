export interface OverlayItem {
  chartData: {
    sensorId: string | number;
    [key: string]: unknown;
  };
  setMap: (map: google.maps.Map | null) => void;
  layerName?: string;
  show?: () => void;
  hide?: () => void;
  draw?: () => void;
  // Additional Google Maps overlay properties
  getPosition?: () => google.maps.LatLng;
  getBounds?: () => google.maps.LatLngBounds;
  setPosition?: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  getDiv?: () => HTMLElement;
  [key: string]: unknown;
}
