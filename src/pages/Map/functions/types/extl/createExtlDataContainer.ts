interface ExtlItem {
  sensorId: string | number;
  layerName?: string;
  [key: string]: unknown;
}

interface ExtlBounds {
  [key: string]: unknown;
}

interface CreateExtlDataContainerProps {
  item: ExtlItem;
  extlData: ExtlItem[];
  boundsArray: ExtlBounds[];
  bounds: ExtlBounds;
  extlChartsAmount: unknown[];
  countExtl: number;
  setExtlChartDataContainer: (data: Array<[ExtlItem, ExtlBounds]>) => void;
}

export const createExtlDataContainer = (props: CreateExtlDataContainerProps) => {
  const itemData: ExtlItem = {
    ...props.item,
    layerName: 'EXTL'
  }
  props.extlData.push(itemData)
  props.boundsArray.push(props.bounds)
  if (props.extlChartsAmount.length === props.extlData.length) {
    const updatedExtlData: Array<[ExtlItem, ExtlBounds]> = []
    props.boundsArray.map((bounds: ExtlBounds, index: number) => {
      const exists = updatedExtlData.some(
        (updatedExtlChartDataItem: [ExtlItem, ExtlBounds]) => updatedExtlChartDataItem[0].sensorId === props.extlData[index].sensorId
      );
      if (!exists) {
        updatedExtlData.push([props.extlData[index], bounds]);
      }
      new Promise<void>((resolve: () => void) => {
        if (updatedExtlData.length === props.countExtl) {
          props.setExtlChartDataContainer(updatedExtlData)
          resolve()
        }
      }).then(() => {
        props.extlData = []
      })
    })
  }
}