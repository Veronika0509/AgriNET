

interface MoistChartDataItem {
  mainId: string | number;
  id: string | number;
  sensorId: string | number;
  name: string;
  battery: number;
  data: unknown[];
  budgetLines: unknown[];
  layerName: string;
  freshness: string;
  [key: string]: unknown;
}

interface MoistBounds {
  [key: string]: unknown;
}

interface MoistDataContainerProps {
  mainId: string | number;
  moistId: { value: string | number };
  sensorId: string | number;
  name: string;
  response: {
    data: {
      battery: number;
      data: unknown[];
      budgetLines: unknown[];
      freshness: string;
      alarmEnabled?: boolean;
      [key: string]: unknown;
    };
  };
  moistChartData: MoistChartDataItem[];
  boundsArray: MoistBounds[];
  bounds: MoistBounds;
  moistChartsAmount: unknown[];
  countMoistFuel: number;
  invalidChartData: Array<[MoistChartDataItem, MoistBounds]>;
  setInvalidMoistChartDataContainer: (data: Array<[MoistChartDataItem, MoistBounds]>) => void;
  setMoistChartDataContainer: (data: Array<[MoistChartDataItem, MoistBounds]>) => void;
}

export const createMoistDataContainers = async (props: MoistDataContainerProps) => {
  const moistChartDataItem: MoistChartDataItem = {
    mainId: props.mainId,
    id: props.moistId.value,
    sensorId: props.sensorId,
    name: props.name,
    battery: props.response.data.battery,
    data: props.response.data.data,
    budgetLines: props.response.data.budgetLines,
    layerName: 'Moist',
    freshness: props.response.data.freshness
  }
  props.moistChartData.push(moistChartDataItem)
  props.boundsArray.push(props.bounds)
  if (props.moistChartsAmount.length === props.moistChartData.length) {
    const updatedMoistChartData: Array<[MoistChartDataItem, MoistBounds]> = []
    props.boundsArray.map((bounds: MoistBounds, index: number) => {
      if (props.moistChartData[index]?.data?.length > 1 && props.response.data.freshness !== 'outdated') {
        const exists = updatedMoistChartData.some(
          (updatedMoistChartDataItem: [MoistChartDataItem, MoistBounds]) => updatedMoistChartDataItem[0].id === props.moistChartData[index].id
        );
        if (!exists) {
          updatedMoistChartData.push([props.moistChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: [MoistChartDataItem, MoistBounds]) => invalidChartDataItem[0].id === props.moistChartData[index].id
        );
        if (!exists) {
          props.invalidChartData.push([props.moistChartData[index], bounds]);
        }
      }
      new Promise<void>((resolve: () => void) => {
        if (props.invalidChartData.length + updatedMoistChartData.length === props.countMoistFuel) {
          props.setInvalidMoistChartDataContainer(props.invalidChartData)
          props.setMoistChartDataContainer(updatedMoistChartData)

          resolve()
        }
      }).then(() => {
        props.moistChartData = []
      })
    })
  }
}
