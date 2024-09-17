import axios from "axios";

export const getWxetMarkerChartData = async (
  mainId: any,
  propsSensorId: string,
  bounds: any,
  name: string,
  setInvalidWxetChartDataContainer: any,
  setWxetChartDataContainer: any,
  wxetChartsAmount: any,
  wxetId: any,
  wxetData: any,
  boundsArray: any,
  invalidChartData: any,
  response: any
) => {
  const wxetDataItem = {
    mainId,
    id: wxetId.value,
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
