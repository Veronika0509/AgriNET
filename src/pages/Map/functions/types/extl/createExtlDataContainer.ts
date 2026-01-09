interface ExtlItem {
  sensorId: string;
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
  layer: string;
}

export const createExtlDataContainer = (props: CreateExtlDataContainerProps) => {
  console.log('[EXTL DEBUG createExtlDataContainer] Called with item:', props.item);
  const { id, ...rest } = props.item;
  const itemData: ExtlItem = {
    ...rest,
    mainId: props.item.id,
    layerName: props.layer
  }
  console.log('[EXTL DEBUG createExtlDataContainer] itemData:', itemData);
  props.extlData.push(itemData)
  props.boundsArray.push(props.bounds)
  console.log('[EXTL DEBUG createExtlDataContainer] extlData.length:', props.extlData.length, 'extlChartsAmount.length:', props.extlChartsAmount.length);
  if (props.extlChartsAmount.length === props.extlData.length) {
    console.log('[EXTL DEBUG createExtlDataContainer] Creating updatedExtlData');
    const updatedExtlData: Array<[ExtlItem, ExtlBounds]> = []
    props.boundsArray.map((bounds: ExtlBounds, index: number) => {
      const exists = updatedExtlData.some(
        (updatedExtlChartDataItem: [ExtlItem, ExtlBounds]) => updatedExtlChartDataItem[0].mainId === props.extlData[index].mainId
      );
      if (!exists) {
        updatedExtlData.push([props.extlData[index], bounds]);
      }
      new Promise<void>((resolve: () => void) => {
        if (updatedExtlData.length === props.countExtl) {
          console.log('[EXTL DEBUG createExtlDataContainer] Calling setExtlChartDataContainer with:', updatedExtlData);
          props.setExtlChartDataContainer(updatedExtlData)
          resolve()
        }
      }).then(() => {
        props.extlData = []
      })
    })
  }
}