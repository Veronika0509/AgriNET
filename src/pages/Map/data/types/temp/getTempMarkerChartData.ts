import Login from "../../../../Login";
import {logIn} from "ionicons/icons";

export const getTempMarkerChartData = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  tempChartsAmount: any,
  setInvalidTempChartDataContainer: any,
  setTempChartDataContainer: any,
  id: any,
  tempChartData: any,
  boundsArray: any,
  invalidChartData: any,
  response: any,
  countTemp: number
) => {
  let value: number = response.data.lines.length > 0 ? response.data.data[response.data.data.length - 1][response.data.lines[0]] : response.data.temp
  let label: string = response.data.lines.length > 0 ? response.data.linesLabels[0] : `${response.data!!.metric == "AMERICA" ? "F" : "C"}°`
  value = Math.round(value*10) / 10
  const valueAndValue: string = value.toString() + label
  const tempChartDataItem = {
    id: 'temp_' + id.value,
    mainId,
    sensorId: propsSensorId,
    name: name,
    layerName: 'SoilTemp',
    bgColor: response.data.bgColor,
    lines: response.data.lines,
    line1Color: response.data.line1Color,
    line2Color: response.data.line2Color,
    chartValue: valueAndValue,
    batteryPercentage: response.data.batteryPercentage,
    metric: response.data.metric,
    temp: response.data.temp,
    data: response.data.data
  }
  tempChartData.push(tempChartDataItem)
  boundsArray.push(bounds)
  if (tempChartsAmount.length === tempChartData.length) {
    let updatedTempChartData: any = []
    boundsArray.map((bounds: any, index: number) => {
      if (tempChartData[index].data !== undefined && tempChartData[index].data.length !== 0 && tempChartData[index].data.length !== 1) {
        const exists = updatedTempChartData.some(
          (updatedTempChartDataItem: any) => updatedTempChartDataItem[0].sensorId === tempChartData[index].sensorId
        );
        if (!exists) {
          updatedTempChartData.push([tempChartData[index], bounds]);
        }
      } else {
        const exists = invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === tempChartData[index].sensorId
        );
        if (!exists) {
          invalidChartData.push([tempChartData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
        if (invalidChartData.length + updatedTempChartData.length === countTemp) {
          setInvalidTempChartDataContainer(invalidChartData)
          setTempChartDataContainer(updatedTempChartData)

          resolve()
        }
      }).then(() => {
        tempChartData = []
      })
    })
  }
}