/**
 * Universal (custom) marker — SCAFFOLD ONLY.
 *
 * Concept from Todd / customer (not finalized yet):
 *  - custom layer name (e.g. "Gas Sensor")
 *  - custom Y-axis charting range (e.g. 0..1000)
 *  - custom sparkline time window (e.g. 3 days / 3 minutes)
 *  - custom data source: database + table + column(s)
 *
 * "We started but did not complete it. Some data is there." — backend groundwork
 * is partial. Nothing here is wired into rendering until the data contract is
 * confirmed. Extend this file (and the `types/universal/*` stubs) then.
 */
export const UNIVERSAL_MARKER_TYPE = "universal" as const;

export interface UniversalMarkerConfig {
  markerType: typeof UNIVERSAL_MARKER_TYPE;
  // TODO(universal): fill in once the backend contract is known
  // database?: string;
  // table?: string;
  // columns?: string[];
  // chartRange?: { min: number; max: number } | null;
  // sparklineWindow?: { value: number; unit: "minutes" | "hours" | "days" };
}
