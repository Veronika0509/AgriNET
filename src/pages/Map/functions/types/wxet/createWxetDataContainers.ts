interface WxetDataItem {
  mainId: string | number;
  id: string | number;
  sensorId: string | number;
  name: string;
  data: {
    temp?: number | null;
    freshness?: string;
    data?: unknown[];
    [key: string]: unknown;
  };
  layerName: string;
  freshness?: string | undefined;
  markerType: string;
  [key: string]: unknown;
}

interface WxetBounds {
  [key: string]: unknown;
}

interface WxetDataContainerProps {
  mainId: string | number;
  markerType: string;
  wxetId: { value: string | number };
  sensorId: string | number;
  name: string;
  response: {
    data: {
      temp?: number | null;
      freshness?: string;
      data?: unknown[];
      [key: string]: unknown;
    };
  };
  wxetData: WxetDataItem[];
  boundsArray: WxetBounds[];
  bounds: WxetBounds;
  wxetChartsAmount: unknown[];
  countWxet: number;
  invalidChartData: Array<[WxetDataItem, WxetBounds]>;
  setWxetChartDataContainer: (data: Array<[WxetDataItem, WxetBounds]>) => void;
  setInvalidWxetChartDataContainer: (data: Array<[WxetDataItem, WxetBounds]>) => void;
}

export const createWxetDataContainers = async (props: WxetDataContainerProps): Promise<void> => {
  const wxetDataItem: WxetDataItem = {
    mainId: props.mainId,
    id: props.markerType === 'wxet' ? props.wxetId.value : `fuel-${props.wxetId.value}`,
    sensorId: props.sensorId,
    name: props.name,
    data: props.response.data,
    layerName: 'WXET',
    freshness: props.response.data.freshness,
    markerType: props.markerType,
  }
  props.wxetData.push(wxetDataItem)
  props.boundsArray.push(props.bounds)
  if (props.wxetChartsAmount.length === props.wxetData.length) {
    const updatedWxetData: Array<[WxetDataItem, WxetBounds]> = []
    props.boundsArray.map((bounds: WxetBounds, index: number) => {
      const pushValidMarker = () => {
        const exists = updatedWxetData.some(
          (updatedWxetChartDataItem: [WxetDataItem, WxetBounds]) => updatedWxetChartDataItem[0]?.sensorId === props.wxetData[index]?.sensorId
        );
        if (!exists) {
          updatedWxetData.push([props.wxetData[index], bounds]);
        }
      }
      const pushInvalidMarker = () => {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: [WxetDataItem, WxetBounds]) => invalidChartDataItem[0].sensorId === props.wxetData[index].sensorId
        );
        if (!exists) {
          props.invalidChartData.push([props.wxetData[index], bounds]);
        }
      }
      if (props.markerType === 'wxet') {
        if (props.wxetData[index].data.temp !== undefined && props.wxetData[index].data.temp !== null && props.response.data.freshness !== 'outdated') {
          pushValidMarker()
        } else {
          pushInvalidMarker()
        }
      } else if (props.markerType === 'fuel') {
        if (props.response.data.data && props.response.data.data.length > 0) {
          pushValidMarker()
        } else {
          pushInvalidMarker()
        }
      }

      new Promise<void>((resolve: () => void) => {

        if (props.invalidChartData.length + updatedWxetData.length === props.countWxet) {
          props.setInvalidWxetChartDataContainer(props.invalidChartData)
          props.setWxetChartDataContainer(updatedWxetData)

          resolve()
        }
      }).then(() => {
        props.wxetData = []
      })
    })
  }
}
