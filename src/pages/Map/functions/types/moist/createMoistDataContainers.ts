import {getOptions} from "../../../data/getOptions";
import {logoFacebook} from "ionicons/icons";

export const createMoistDataContainers = async (props: any) => {
  const moistChartDataItem = {
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
  if (props.response.data.alarmEnabled) {
    console.log('Moist Alarm Enabled!')
  }
  props.moistChartData.push(moistChartDataItem)
  props.boundsArray.push(props.bounds)
  if (props.moistChartsAmount.length === props.moistChartData.length) {
    let updatedMoistChartData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      if (props.moistChartData[index].data.length > 1 && props.response.data.freshness !== 'outdated') {
        const exists = updatedMoistChartData.some(
          (updatedMoistChartDataItem: any) => updatedMoistChartDataItem[0].sensorId === props.moistChartData[index].sensorId
        );
        if (!exists) {
          console.log([props.moistChartData[index], bounds])
          updatedMoistChartData.push([props.moistChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === props.moistChartData[index].sensorId
        );
        if (!exists) {
          console.log([props.moistChartData[index], bounds])
          props.invalidChartData.push([props.moistChartData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
        console.log(props.invalidChartData.length, updatedMoistChartData.length, props.countMoistFuel)
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
