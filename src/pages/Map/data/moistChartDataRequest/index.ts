import axios from "axios";

let id = 0
let moistChartData: any = []
let boundsArray: any = []
let invalidChartData: any = []

export const moistChartDataRequest = async (propsSensorId: string,
                                            bounds: any,
                                            name: string,
                                            userId: any,
                                            setInvalidChartDataContainer: any,
                                            setMoistChartDataContainer: any,
                                            moistFuelChartsAmount: any
) => {
  const response = await axios.get('https://app.agrinet.us/api/map/moist-fuel', {
    params: {
      sensorId: propsSensorId,
      cacheFirst: true,
      'do-not-catch-error': '',
      user: userId,
      v: 43
    },
  })
  id += 1
  const moistChartDataItem = {
    id: id,
    name: name,
    battery: response.data.battery,
    sensorId: propsSensorId,
    data: response.data.data,
    topBudgetLine: response.data.budgetLines[1].value,
    bottomBudgetLine: response.data.budgetLines[4].value,
    layerName: 'Moist'
  }
  moistChartData.push(moistChartDataItem)
  boundsArray.push(bounds)
  console.log(moistFuelChartsAmount, moistChartData)
  if (moistFuelChartsAmount.length === moistChartData.length) {
    let updatedMoistChartData: any = []
    boundsArray.map((bounds: any, index: number) => {
      if (moistChartData[index].data.length !== 0 && moistChartData[index].data.length !== 1) {
        updatedMoistChartData.push([moistChartData[index], bounds])
      } else {
        invalidChartData.push([moistChartData[index], bounds])
      }
      new Promise((resolve: any) => {
        setInvalidChartDataContainer(invalidChartData)
        setMoistChartDataContainer(updatedMoistChartData)

        resolve()
      }).then(() => {
        moistChartData = []
      })
    })
  }
}
