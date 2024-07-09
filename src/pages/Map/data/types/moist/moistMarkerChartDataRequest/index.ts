import axios from "axios";

export const moistMarkerChartDataRequest = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  userId: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  moistChartsAmount: any,
  id: number,
  moistChartData: any,
  boundsArray: any,
  invalidChartData: any
) => {
  const response = await axios.get('https://app.agrinet.us/api/map/moist-fuel?v=43', {
    params: {
      sensorId: propsSensorId,
      cacheFirst: true,
      'do-not-catch-error': '',
      user: userId,
    },
  })
  const moistChartDataItem = {
    mainId,
    id,
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
