/**
 * Universal (custom) marker.
 *
 * A unit gets this marker when its layer (TSGmarkers.locall) has a row in the
 * backend UniMarker parameter table. The backend resolves server/db/table/field
 * from that row — the app only ever sends a sensorId and draws whatever
 * parameters come back. Nothing marker-specific is hardcoded here.
 *
 * The contract below is OUR PROPOSAL to the backend (Todd) — the endpoint does
 * not exist yet (2026-11-26: /api/map/universal → 404). Until it does, use the
 * dev mock (see UNIVERSAL_MOCK_SENSOR_IDS).
 */
export const UNIVERSAL_MARKER_TYPE = "universal" as const;

export const UNIVERSAL_MARKER_ENDPOINT = "https://app.agrinet.us/api/map/universal";

/** One row of the UniMarker parameter table, as the app needs it for the map marker. */
export interface UniversalMarkerParams {
  /** Layer name shown on the map (same value as TSGmarkers.locall). */
  layerName: string;
  /** Unit of measure of D1, e.g. "F", "pH", "EC", "PSI", "ppm". */
  unit: string;
  /** Data age thresholds in hours: <= green → green border, <= yellow → yellow, >= skull → skull, otherwise red. */
  freshnessHours: {
    green: number;
    yellow: number;
    skull: number;
  };
  /** Hex colors, with or without "#". */
  upperBgColor: string;
  lowerBgColor: string;
  lineColor: string;
  /** Y value of the 1px black line that divides the upper and lower background. null → single (upper) background. */
  dividerValue: number | null;
  /** Marker sparkline period in hours. */
  periodHours: number;
  /** Marker size in px. */
  width: number;
  height: number;
  /** Show the latest value above the sparkline, like the Temp RH marker. */
  showLatestValue: boolean;
}

export interface UniversalDataPoint {
  DateTime: string;
  value: number | null;
}

/** Proposed response of GET /api/map/universal?sensorId=&userId= */
export interface UniversalMarkerResponse {
  params: UniversalMarkerParams;
  /** D1 values for the last params.periodHours, oldest first. */
  data: UniversalDataPoint[];
  /** Battery voltage, null if the unit doesn't report it. */
  battery: number | null;
  alarmEnabled?: boolean;
  /** Optional: if the backend computes freshness itself, it wins over the client-side calculation. */
  freshness?: UniversalFreshness;
}

export type UniversalFreshness = "green" | "yellow" | "red" | "skull";

export const UNIVERSAL_FRESHNESS_COLORS: Record<Exclude<UniversalFreshness, "skull">, string> = {
  green: "#8BF972",
  yellow: "yellow",
  red: "red",
};

/** Used when the backend omits a size, so the marker matches Temp RH. */
export const UNIVERSAL_DEFAULT_SIZE = { width: 58, height: 50 };

/**
 * DEV ONLY. While the backend endpoint is missing, sensorIds listed in
 * VITE_UNIVERSAL_MOCK_SENSOR_IDS (comma separated, in .env.local) are drawn as
 * universal markers with generated data, whatever their real markerType is.
 * Always empty in production builds.
 */
export const UNIVERSAL_MOCK_SENSOR_IDS: string[] = import.meta.env.DEV
  ? String(import.meta.env.VITE_UNIVERSAL_MOCK_SENSOR_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  : [];

export const isUniversalSensor = (sensorItem: { markerType?: unknown; sensorId?: unknown }): boolean =>
  sensorItem.markerType === UNIVERSAL_MARKER_TYPE ||
  UNIVERSAL_MOCK_SENSOR_IDS.includes(String(sensorItem.sensorId));
