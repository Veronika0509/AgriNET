import type { UniversalMarkerResponse } from "../../../config/universalMarker";

/**
 * DEV ONLY. Fake /api/map/universal response so the marker can be built before
 * the backend exists. A gas-sensor-like signal crossing the divider value.
 */
export const mockUniversalMarkerData = (sensorId: string): UniversalMarkerResponse => {
  const periodHours = 72;
  const stepMinutes = 20;
  const now = Date.now();
  const points = (periodHours * 60) / stepMinutes;
  // Different phase per sensor so several mocked markers don't look identical.
  const phase = [...sensorId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  const data = Array.from({ length: points }, (_, i) => {
    const t = now - (points - 1 - i) * stepMinutes * 60_000;
    const value = 500 + 300 * Math.sin((i + phase) / 18) + 60 * Math.sin((i + phase) / 3);
    return { DateTime: new Date(t).toISOString(), value: Math.round(value) };
  });

  return {
    params: {
      layerName: "Gas Sensor",
      unit: "ppm",
      freshnessHours: { green: 1, yellow: 6, skull: 24 },
      upperBgColor: "ffb3b3",
      lowerBgColor: "b3ffb3",
      lineColor: "0303fe",
      dividerValue: 600,
      periodHours,
      width: 58,
      height: 50,
      showLatestValue: true,
    },
    data,
    battery: 3.6,
    alarmEnabled: false,
  };
};
