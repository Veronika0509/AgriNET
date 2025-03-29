import Login from "../../../../Login";
import {logIn} from "ionicons/icons";

export const createTempDataContainers = async (props: any) => {
  let value: number = props.response.data.lines.length > 0 ? props.response.data.data[props.response.data.data.length - 1][props.response.data.lines[0]] : props.response.data.temp
  let label: string = props.response.data.lines.length > 0 ? props.response.data.linesLabels[0] : `${props.response.data!!.metric == "AMERICA" ? "F" : "C"}°`
  value = Math.round(value*10) / 10
  const valueAndValue: string = value.toString() + label
  const tempChartDataItem = {
    id: 'temp_' + props.id.value,
    mainId: props.mainId,
    sensorId: props.sensorId,
    name: props.name,
    layerName: 'SoilTemp',
    bgColor: props.response.data.bgColor,
    lines: props.response.data.lines,
    line1Color: props.response.data.line1Color,
    line2Color: props.response.data.line2Color,
    chartValue: valueAndValue,
    batteryPercentage: props.response.data.batteryPercentage,
    metric: props.response.data.metric,
    temp: props.response.data.temp,
    data: props.response.data.data
  }
  props.tempChartData.push(tempChartDataItem)
  props.boundsArray.push(props.bounds)
  if (props.tempChartsAmount.length === props.tempChartData.length) {
    let updatedTempChartData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      if (props.tempChartData[index].data !== undefined && props.tempChartData[index].data.length !== 0 && props.tempChartData[index].data.length !== 1) {
        const exists = updatedTempChartData.some(
          (updatedTempChartDataItem: any) => updatedTempChartDataItem[0].sensorId === props.tempChartData[index].sensorId
        );
        if (!exists) {
          updatedTempChartData.push([props.tempChartData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === props.tempChartData[index].sensorId
        );
        if (!exists) {
          props.invalidChartData.push([props.tempChartData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
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