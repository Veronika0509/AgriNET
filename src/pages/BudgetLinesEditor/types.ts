export interface BudgetLine {
  value: number;
  label: string;
}

export interface ChartDataItem {
  DateTime: string;
  SumAve: number;
  [key: string]: unknown;
}

export interface ChartDataState {
  data?: ChartDataItem[];
  budgetLines?: BudgetLine[];
}

export interface MoistSensor {
  id: string | number;
  layerName: string;
  name: string;
  sensorId: string;
  mainId: string | number;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

export interface MoistOverlay {
  layerName: string;
  chartData: MoistSensor;
  setMap: (map: google.maps.Map | null) => void;
  update: (sensorId: string) => void;
  dispose?: () => void;
  [key: string]: unknown;
}