export const createValveDataContainers = async (props: any) => {
  const valveChartDataItem = {
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
    let updatedValveChartData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      if (props.valveChartData[index].nowMinutes !== undefined) {
        const exists = updatedValveChartData.some(
          (updatedValveChartDataItem: any) => updatedValveChartDataItem[0].sensorId === props.valveChartData[index].sensorId
        );
        if (!exists) {
          updatedValveChartData.push([props.valveChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === props.valveChartData[index].sensorId
        );
        if (!exists) {
          props.invalidChartData.push([props.valveChartData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
        console.log(props.invalidChartData, updatedValveChartData)
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