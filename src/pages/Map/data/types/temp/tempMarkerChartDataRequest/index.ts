import axios from "axios";
import login from "../../../../../Login";

export const tempMarkerChartDataRequest = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  userId: any,
  tempChartsAmount: any,
  setInvalidTempChartDataContainer: any,
  setTempChartDataContainer: any,
  id: number,
  tempChartData: any,
  boundsArray: any,
  invalidChartData: any
) => {
  const response = await axios.get('https://app.agrinet.us/api/map/temp-data-v2?v=43', {
    params: {
      sensorId: propsSensorId,
      userId: userId,
      'do-not-catch-error': ''
    },
  })
  const idLabel = 'temp_' + id
  let value: number = response.data.lines.length > 0 ? response.data[response.data.length - 1][response.data.lines[0]] : response.data.temp
  let label: string = response.data.lines.length > 0 ? response.data.linesLabels[0] : `${response.data!!.metric == "AMERICA" ? "F" : "C"}°`
  value = Math.round(value*10)/10
  const valueAndValue: string = value.toString() + label

  const tempChartDataItem = {
    id: idLabel,
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
      if (tempChartData[index].data !== undefined) {
        if (tempChartData[index].data.length !== 0 && tempChartData[index].data.length !== 1) {
          updatedTempChartData.push([tempChartData[index], bounds])
        } else {
          invalidChartData.push([tempChartData[index], bounds])
        }
      } else {
        invalidChartData.push([tempChartData[index], bounds])
      }
      new Promise((resolve: any) => {
        setInvalidTempChartDataContainer(invalidChartData)
        setTempChartDataContainer(updatedTempChartData)

        resolve()
      }).then(() => {
        tempChartData = []
      })
    })
  }
}
