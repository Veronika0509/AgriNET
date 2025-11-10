interface ValveChartDataItem {
  id: string;
  mainId: string | number;
  sensorId: string | number;
  name: string;
  layerName: string;
  events: unknown[];
  nowMinutes: number | undefined;
  bgColor: string;
  enabled: boolean;
  [key: string]: unknown;
}

interface ValveBounds {
  [key: string]: unknown;
}

interface ValveDataContainerProps {
  id: { value: string | number };
  mainId: string | number;
  sensorId: string | number;
  name: string;
  data: {
    events: unknown[];
    nowMinutes: number | undefined;
    bgColor: string;
    enabled: boolean;
    [key: string]: unknown;
  };
  valveChartData: ValveChartDataItem[];
  boundsArray: ValveBounds[];
  bounds: ValveBounds;
  valveChartsAmount: unknown[];
  countValve: number;
  invalidChartData: Array<[ValveChartDataItem, ValveBounds]>;
  setInvalidValveChartDataContainer: (data: Array<[ValveChartDataItem, ValveBounds]>) => void;
  setValveChartDataContainer: (data: Array<[ValveChartDataItem, ValveBounds]>) => void;
}

export const createValveDataContainers = async (props: ValveDataContainerProps) => {
  const valveChartDataItem: ValveChartDataItem = {
    id: 'valve_' + props.id.value,
    mainId: props.mainId,
    sensorId: props.sensorId,
    name: props.name,
    layerName: 'Valve',
    events: props.data.events,
    nowMinutes: props.data.nowMinutes,
    bgColor: props.data.bgColor,
    enabled: props.data.enabled,
  }
  props.valveChartData.push(valveChartDataItem)
  props.boundsArray.push(props.bounds)
  if (props.valveChartsAmount.length === props.valveChartData.length) {
    const updatedValveChartData: Array<[ValveChartDataItem, ValveBounds]> = []
    props.boundsArray.map((bounds: ValveBounds, index: number) => {
      if (props.valveChartData[index].nowMinutes !== undefined) {
        const exists = updatedValveChartData.some(
          (updatedValveChartDataItem: [ValveChartDataItem, ValveBounds]) => updatedValveChartDataItem[0].mainId === props.valveChartData[index].mainId
        );
        if (!exists) {
          updatedValveChartData.push([props.valveChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: [ValveChartDataItem, ValveBounds]) => invalidChartDataItem[0].mainId === props.valveChartData[index].mainId
        );
        if (!exists) {
          props.invalidChartData.push([props.valveChartData[index], bounds]);
        }
      }
      new Promise<void>((resolve: () => void) => {
        if (props.invalidChartData.length + updatedValveChartData.length === props.countValve) {
          props.setInvalidValveChartDataContainer(props.invalidChartData)
          props.setValveChartDataContainer(updatedValveChartData)

          resolve()
        }
      }).then(() => {
        props.valveChartData = []
      })
    })
  }
}