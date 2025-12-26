// ============================================
// API Response Types
// Auto-generated based on actual API responses
// ============================================

// ===== Layers API =====
export interface LayersApiResponse {
  layers: string[];
  markerTypes: string[];
  mapping: Record<string, string>;
}

// ===== Sites API =====
export interface Marker {
  id: number;
  name: string;
  sensorId: string;
  lat: number;
  lng: number;
  sensorCount: string | null;
  height: number;
  width: number;
  graphic: string | null;
  markerType: string;
  chartType: string;
  battery: number | null;
  autoUpdatePeriodSec: number;
}

export interface SiteLayer {
  name: string;
  markers: Marker[];
}

export interface SiteData {
  name: string;
  lat: number;
  lng: number;
  layers: SiteLayer[];
}

export type SitesApiResponse = SiteData[];

// ===== Options API =====
export interface OptionsApiResponse {
  'about.rain-meditation.resource': string;
  'about.rain-pray.resource': string;
  'freshness.13h.color': string;
  'freshness.3d.color': string;
  'freshness.6h.color': string;
  'freshness.outdated.color': string;
  'ps.pixel.color.off': string;
  'ps.pixel.color.on': string;
  'valve-marker.colors.finished': string;
  'valve-marker.colors.running': string;
  'valve-marker.colors.scheduled': string;
  'marker-type-config.temp_rh.markerChartIntervalHours': string;
  'marker-type-config.BFlow.markerChartIntervalHours': string;
  'marker-type-config.temp-rh-v2.markerChartIntervalHours': string;
  'marker-type-config.virtual-weather-station.markerChartIntervalHours': string;
  [key: string]: string; // Allow additional dynamic options
}

// ===== Chart Data API (M-Sum) =====
// Generic time series data item for all charts
export interface TimeSeriesDataItem {
  DateTime: string;
  [key: string]: unknown;
}

export interface ChartDataPoint {
  DateTime: string;
  ST1: number;
  PS1: number;
  PS2: number;
  PS25S: number;
  SumAve: number;
  SumAveDisplay: number;
}

export interface BudgetLine {
  value: number;
  label: string | null;
}

export interface ChartDataApiResponse {
  data: ChartDataPoint[];
  budgetLines: BudgetLine[];
  sumL1: string;
  sumL2: string;
  sumL3: string;
  sumL4: string;
  sumL5: string;
  freshness: string;
  battery: number;
  alarmEnabled: boolean;
  metric: string;
  zeros: boolean;
  debug: any;
}

// ===== Comments API =====
export interface Comment {
  id: number;
  chartKind: string;
  sensorId: string;
  field: string;
  date: string;
  type: number | null;
  text: string;
}

export type CommentsApiResponse = Comment[];