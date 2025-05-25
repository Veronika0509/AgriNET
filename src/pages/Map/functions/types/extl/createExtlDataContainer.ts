export const createExtlDataContainer = (props: any) => {
  const itemData = {
    ...props.item,
    layerName: 'EXTL'
  }
  props.extlData.push(itemData)
  props.boundsArray.push(props.bounds)
  if (props.extlChartsAmount.length === props.extlData.length) {
    let updatedExtlData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      const exists = updatedExtlData.some(
        (updatedExtlChartDataItem: any) => updatedExtlChartDataItem[0].sensorId === props.extlData[index].sensorId
      );
      if (!exists) {
        updatedExtlData.push([props.extlData[index], bounds]);
      }
      new Promise((resolve: any) => {
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