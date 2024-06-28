import axios from "axios";

let id = 0
let moistChartData: any = []
let boundsArray: any = []
let invalidChartData: any = []

export const moistMarkerChartDataRequest = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  userId: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  moistChartsAmount: any
) => {
  console.log('function is called')
  const response = await axios.get('https://app.agrinet.us/api/map/moist-fuel?v=43', {
    params: {
      sensorId: propsSensorId,
      cacheFirst: true,
      'do-not-catch-error': '',
      user: userId,
    },
  })
  id += 1
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
