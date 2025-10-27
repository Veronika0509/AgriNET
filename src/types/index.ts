// ============================================================================
// ОСНОВНЫЕ ТИПЫ ДАННЫХ ДЛЯ AGRINET
// ============================================================================

// Брендированные типы для строгой идентификации
export type SensorId = string & { readonly __brand: 'SensorId' };
export type SiteId = string & { readonly __brand: 'SiteId' };
export type UserId = number & { readonly __brand: 'UserId' };

// Union типы с константами
export type SensorType = 'moist' | 'temp' | 'valve' | 'wxet' | 'fuel';
export type ChartPageType = 'moist' | 'temp' | 'valve' | 'wxet' | 'fuel';
export type FreshnessType = '30m' | '60m' | '2h' | '6h' | '12h' | '24h' | 'old';
export type MetricType = 'AMERICA' | 'METRIC';
export type ValveStatus = 'ON' | 'OFF';

// Утилитарные типы
export type NonEmptyArray<T> = [T, ...T[]];
export type Timestamp = string; // ISO 8601 format

// ============================================================================
// SENSOR DATA INTERFACES
// ============================================================================

export interface DataPoint {
  DateTime: string;
  [key: string]: string | number | boolean | null; // Строгие типы вместо any
}

export interface MoistDataPoint extends DataPoint {
  MABS0?: number;
  MABS1?: number;
  MABS2?: number;
  MABS3?: number;
  MABS4?: number;
  MABS5?: number;
}

export interface TempDataPoint extends DataPoint {
  TEMP?: number;
  AMBIENT?: number;
}

export interface BudgetLine {
  value: number;
  color: string;
  label: string;
}

export interface SensorData<T extends DataPoint = DataPoint> {
  id: SensorId;
  mainId: string;
  sensorId: SensorId;
  name: string;
  battery?: number;
  data: NonEmptyArray<T>;
  budgetLines?: BudgetLine[];
  layerName: string;
  freshness: FreshnessType;
  isValidChartData?: boolean;
}

export interface MoistSensorData extends SensorData<MoistDataPoint> {
  layerName: 'Moist';
}

export interface TempSensorData extends SensorData<TempDataPoint> {
  layerName: 'Temp';
  temp?: number;
  metric?: MetricType;
  lines?: string[];
  linesLabels?: string[];
}

export interface ValveSensorData extends SensorData {
  layerName: 'Valve';
  status?: ValveStatus;
  duration?: number;
  priority?: number;
}

export interface WxetSensorData extends SensorData {
  layerName: 'Wxet';
}

export interface FuelSensorData extends SensorData {
  layerName: 'Fuel';
}

// ============================================================================
// SITE AND USER INTERFACES
// ============================================================================

export interface Site {
  id: SiteId;
  name: string;
  lat: number;
  lng: number;
  sensors?: SensorData[];
}

export interface User {
  id: UserId;
  name?: string;
  email?: string;
}

// ============================================================================
// CHART INTERFACES
// ============================================================================

export interface ChartColor {
  r: number;
  g: number;
  b: number;
}

export interface ChartDataResponse {
  data: DataPoint[];
  battery?: number;
  budgetLines?: BudgetLine[];
  freshness: FreshnessType;
  alarmEnabled?: boolean;
  lines?: string[];
  linesLabels?: string[];
  temp?: number;
  metric?: MetricType;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface BaseChartProps {
  sensorId: SensorId;
  userId: UserId;
  chartData: SensorData;
  isMobile?: boolean;
  setIsMobile?: (isMobile: boolean) => void;
}

export interface MapProps {
  page: number;
  isGoogleApiLoaded: boolean;
  chartData: SensorData[];
  setChartData: (data: SensorData[]) => void;
  setPage: (page: number) => void;
  userId: number;
  siteList: Site[];
  setSiteList: (sites: Site[]) => void;
  setSiteId: (siteId: string) => void;
  setSiteName: (siteName: string) => void;
  setAdditionalChartData: (data: SensorData[]) => void;
  setChartPageType: (type: ChartPageType) => void;
  reloadMapPage?: () => Promise<void>;
}

export interface ChartProps {
  page: number;
  chartData: SensorData[];
  additionalChartData: SensorData[];
  chartPageType: ChartPageType;
  setPage: (page: number) => void;
  userId: number;
  siteId: string;
  siteList: Site[];
  isMobile?: boolean;
  setIsMobile?: (isMobile: boolean) => void;
}

// ============================================================================
// VALVE SPECIFIC INTERFACES
// ============================================================================

export interface ValveSettings {
  id: string;
  valvename: string; // именно valvename, а не valveName в API
  probeId: string;
  enabled: boolean;
  priority: number;
  setPointSensor: string; // именно setPointSensor в API
  msetPoint: number; // именно msetPoint в API
  duration: string;
  hrsAve: number; // именно hrsAve в API
  startDelay: number;
  waterDrainTime: number;
  concurrent: boolean;
  validate?: boolean;
  time?: string;
  chemName?: string;
  chemicalStatus?: boolean;
  waterStatus?: boolean;
  sensorId?: string;
  pumpId?: string;
  targFlow?: number;
  targFlowUnit?: string;
  flowRate?: number;
  flowRateUnit?: string;
  total?: number;
  totalUnit?: string;
  minPump?: number;
}

export interface ValveArchiveItem {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  reason?: string;
}

export interface ValveData {
  id: string;
  name: string;
  status: 'ON' | 'OFF';
  startTime?: string;
  endTime?: string;
  duration?: number;
  priority?: number;
}

// ============================================================================
// COMMENT INTERFACES
// ============================================================================

export interface Comment {
  id: string;
  date: string;
  text: string;
  userId: number;
  sensorId: string;
  [key: string]: string | number | boolean | null; // Строгие типы
}

export interface CommentsResponse {
  data: Comment[];
  success: boolean;
}

// ============================================================================
// TABULAR DATA INTERFACES
// ============================================================================

export interface TabularDataRow {
  DateTime: string;
  [key: string]: string | number | boolean | null; // Строгие типы для данных
}

export interface TabularData {
  data: TabularDataRow[];
  label: string;
  sensorCount: number;
  freshness?: FreshnessType;
  freshnessColor?: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  id: string;
}

// ============================================================================
// GOOGLE MAPS INTERFACES
// ============================================================================

export interface CustomOverlayProps {
  bounds: google.maps.LatLngBounds;
  chartData: SensorData;
  setChartData: (data: SensorData[]) => void;
  setPage: (page: number) => void;
  setSiteId: (siteId: SiteId) => void;
  setSiteName: (siteName: string) => void;
  setChartPageType: (type: ChartPageType) => void;
  history: {
    push: (path: string) => void;
    replace: (path: string) => void;
    goBack: () => void;
    location: { pathname: string; search: string; hash: string };
  }; // Строгая типизация history
  userId: UserId;
  siteList: Site[];
  setAdditionalChartData?: (data: SensorData[]) => void;
}

// Типы для кастомных оверлеев
export interface CustomOverlayClass {
  new (
    map: google.maps.Map,
    bounds: google.maps.LatLngBounds,
    chartData: SensorData,
    props: CustomOverlayProps
  ): google.maps.OverlayView;
}

export interface ChartContainer {
  chartData: SensorData;
  bounds: google.maps.LatLngBounds;
}

export type ChartDataContainer = [SensorData, google.maps.LatLngBounds];

// Типы для различных состояний карты
export interface MapState {
  activeTab: string;
  navigationHistory: string[];
  isMarkerClicked: boolean;
}

// Типы для amounts (счетчики графиков)
export interface ChartAmounts {
  moistChartsAmount: SensorData[];
  tempChartsAmount: SensorData[];
  valveChartsAmount: SensorData[];
  wxetChartsAmount: SensorData[];
  extlChartsAmount: SensorData[];
}

// Координаты для fit bounds
export interface Coordinates {
  lat: number;
  lng: number;
}

// ============================================================================
// STATE MANAGEMENT INTERFACES
// ============================================================================

export interface AppState {
  page: number;
  userId: UserId;
  siteList: Site[];
  siteId: SiteId;
  siteName: string;
  chartData: SensorData[];
  additionalChartData: SensorData[];
  chartPageType: ChartPageType;
  isGoogleApiLoaded: boolean;
  mapPageKey: number;
}

export type AppAction = 
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_USER_ID'; payload: UserId }
  | { type: 'SET_SITE_LIST'; payload: Site[] }
  | { type: 'SET_SITE_ID'; payload: SiteId }
  | { type: 'SET_SITE_NAME'; payload: string }
  | { type: 'SET_CHART_DATA'; payload: SensorData[] }
  | { type: 'SET_ADDITIONAL_CHART_DATA'; payload: SensorData[] }
  | { type: 'SET_CHART_PAGE_TYPE'; payload: ChartPageType }
  | { type: 'SET_GOOGLE_API_LOADED'; payload: boolean }
  | { type: 'SET_MAP_PAGE_KEY'; payload: number };

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type RefObject<T> = React.RefObject<T>;
export type MouseEvent = React.MouseEvent<HTMLElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
