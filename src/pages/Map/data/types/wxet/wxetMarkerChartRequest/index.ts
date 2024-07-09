import axios from "axios";

export const wxetMarkerChartRequest = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  userId: any,
  setInvalidWxetChartDataContainer: any,
  setWxetChartDataContainer: any,
  wxetChartsAmount: any,
  id: number,
  wxetData: any,
  boundsArray: any,
  invalidChartData: any
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
  const wxetDataItem = {
    mainId,
    id,
    sensorId: propsSensorId,
    name: name,
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
