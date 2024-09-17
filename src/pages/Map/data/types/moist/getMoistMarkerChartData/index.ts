import axios from "axios";

export const getMoistMarkerChartData = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  moistChartsAmount: any,
  moistId: any,
  moistChartData: any,
  boundsArray: any,
  invalidChartData: any,
  response: any
) => {
  const moistChartDataItem = {
    mainId,
    id: moistId.value,
    sensorId: propsSensorId,
    name,
    battery: response.data.battery,
    data: response.data.data,
    budgetLines: response.data.budgetLines,
    layerName: 'Moist'
  }
  moistChartData.push(moistChartDataItem)
  boundsArray.push(bounds)
  if (moistChartsAmount.length === moistChartData.length) {
    let updatedMoistChartData: any = []
    boundsArray.map((bounds: any, index: number) => {
      if (moistChartData[index].data.length !== 0 && moistChartData[index].data.length !== 1) {
        updatedMoistChartData.push([moistChartData[index], bounds])
      } else {
        invalidChartData.push([moistChartData[index], bounds])
      }
      new Promise((resolve: any) => {
        setInvalidMoistChartDataContainer(invalidChartData)
        setMoistChartDataContainer(updatedMoistChartData)

        resolve()
      }).then(() => {
        moistChartData = []
      })
    })
  }
}
