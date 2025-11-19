interface TempChartDataItem {
  id: string;
  mainId: string | number;
  sensorId: string | number;
  name: string;
  layerName: string;
  bgColor: string;
  lines: string[];
  line1Color: string;
  line2Color: string;
  chartValue: string;
  batteryPercentage: number;
  metric: string;
  temp: number;
  data: unknown[];
  freshness: string;
  alarmEnabled: boolean;
  [key: string]: unknown;
}

interface TempBounds {
  [key: string]: unknown;
}

interface TempDataContainerProps {
  response: {
    data: {
      lines: string[];
      data: unknown[];
      linesLabels: string[];
      temp: number;
      metric: string;
      bgColor: string;
      line1Color: string;
      line2Color: string;
      batteryPercentage: number;
      freshness: string;
      alarmEnabled: boolean;
      [key: string]: unknown;
    };
  };
  id: { value: string | number };
  mainId: string | number;
  sensorId: string | number;
  name: string;
  tempChartData: TempChartDataItem[];
  boundsArray: TempBounds[];
  bounds: TempBounds;
  tempChartsAmount: unknown[];
  countTemp: number;
  invalidChartData: Array<[TempChartDataItem, TempBounds]>;
  setInvalidTempChartDataContainer: (data: Array<[TempChartDataItem, TempBounds]>) => void;
  setTempChartDataContainer: (data: Array<[TempChartDataItem, TempBounds]>) => void;
  layer: string;
}

export const createTempDataContainers = async (props: TempDataContainerProps) => {
  let value: number = props.response.data.lines.length > 0 ? props.response.data.data[props.response.data.data.length - 1][props.response.data.lines[0]] : props.response.data.temp
  const label: string = props.response.data.lines.length > 0 ? props.response.data.linesLabels[0] : `${props.response.data!.metric == "AMERICA" ? "F" : "C"}°`
  value = Math.round(value*10) / 10
  const valueAndValue: string = value.toString() + label
  const tempChartDataItem: TempChartDataItem = {
    id: 'temp_' + props.id.value,
    mainId: props.mainId,
    sensorId: props.sensorId,
    name: props.name,
    layerName: props.layer,
    bgColor: props.response.data.bgColor,
    lines: props.response.data.lines,
    line1Color: props.response.data.line1Color,
    line2Color: props.response.data.line2Color,
    chartValue: valueAndValue,
    batteryPercentage: props.response.data.batteryPercentage,
    metric: props.response.data.metric,
    temp: props.response.data.temp,
    data: props.response.data.data,
    freshness: props.response.data.freshness,
    alarmEnabled: props.response.data.alarmEnabled
  }
  props.tempChartData.push(tempChartDataItem)
  props.boundsArray.push(props.bounds)
  if (props.tempChartsAmount.length === props.tempChartData.length) {
    const updatedTempChartData: Array<[TempChartDataItem, TempBounds]> = []
    props.boundsArray.map((bounds: TempBounds, index: number) => {
      if (props.tempChartData[index]?.data?.length > 1 && props.response.data.freshness !== 'outdated') {
        const exists = updatedTempChartData.some(
          (updatedTempChartDataItem: [TempChartDataItem, TempBounds]) => updatedTempChartDataItem[0].mainId === props.tempChartData[index].mainId
        );
        if (!exists) {
          updatedTempChartData.push([props.tempChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: [TempChartDataItem, TempBounds]) => invalidChartDataItem[0].mainId === props.tempChartData[index].mainId
        );
        if (!exists) {
          props.invalidChartData.push([props.tempChartData[index], bounds]);
        }
      }
      new Promise<void>((resolve: () => void) => {
        // console.log(props.invalidChartData.length, updatedTempChartData.length)
        if (props.invalidChartData.length + updatedTempChartData.length === props.countTemp) {
          props.setInvalidTempChartDataContainer(props.invalidChartData)
          props.setTempChartDataContainer(updatedTempChartData)

          resolve()
        }
      }).then(() => {
        props.tempChartData = []
      })
    })
  }
}