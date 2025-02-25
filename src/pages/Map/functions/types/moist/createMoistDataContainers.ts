export const createMoistDataContainers = async (props: any) => {
  const moistChartDataItem = {
    mainId: props.mainId,
    id: props.moistId.value,
    sensorId: props.sensorId,
    name: props.name,
    battery: props.response.data.battery,
    data: props.response.data.data,
    budgetLines: props.response.data.budgetLines,
    layerName: 'Moist'
  }
  props.moistChartData.push(moistChartDataItem)
  props.boundsArray.push(props.bounds)
  if (props.moistChartsAmount.length === props.moistChartData.length) {
    let updatedMoistChartData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      if (props.moistChartData[index].data.length !== 0 && props.moistChartData[index].data.length !== 1) {
        const exists = updatedMoistChartData.some(
          (updatedMoistChartDataItem: any) => updatedMoistChartDataItem[0].sensorId === props.moistChartData[index].sensorId
        );
        if (!exists) {
          updatedMoistChartData.push([props.moistChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === props.moistChartData[index].sensorId
        );
        if (!exists) {
          props.invalidChartData.push([props.moistChartData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
        console.log(props.invalidChartData, updatedMoistChartData)
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
