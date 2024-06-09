import axios from "axios";

let id = 0
let wxetData: any = []
let boundsArray: any = []
let invalidChartData: any = []

export const wxetDataRequest = async (propsSensorId: string,
                                            bounds: any,
                                            name: string,
                                            userId: any,
                                            setInvalidWxetChartDataContainer: any,
                                            setWxetChartDataContainer: any,
                                            wxetChartsAmount: any
) => {
  const response = await axios.get('https://app.agrinet.us/api/map/wx', {
    params: {
      sensorId: propsSensorId,
      cacheFirst: true,
      'do-not-catch-error': '',
      user: userId,
      v: 43
    },
  })
  id += 1
  const wxetDataItem = {
    id: id,
    name: name,
    sensorId: propsSensorId,
    data: response.data,
    layerName: 'WXET'
  }
  wxetData.push(wxetDataItem)
  boundsArray.push(bounds)
  if (wxetChartsAmount.length === wxetData.length) {
    let updatedWxetData: any = []
    boundsArray.map((bounds: any, index: number) => {
      if (wxetData[index].data.temp !== undefined && wxetData[index].data.temp !== null) {
        updatedWxetData.push([wxetData[index], bounds])
      } else {
        invalidChartData.push([wxetData[index], bounds])
      }
      new Promise((resolve: any) => {
        setInvalidWxetChartDataContainer(invalidChartData)
        setWxetChartDataContainer(updatedWxetData)

        resolve()
      }).then(() => {
        wxetData = []
      })
    })
  }
}
