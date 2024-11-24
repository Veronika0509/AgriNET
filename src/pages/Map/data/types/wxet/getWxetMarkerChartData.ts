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
  response: any,
  countWxet: number
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
        const exists = updatedWxetData.some(
          (updatedWxetChartDataItem: any) => updatedWxetChartDataItem[0].sensorId === wxetData[index].sensorId
        );
        if (!exists) {
          updatedWxetData.push([wxetData[index], bounds]);
        }
      } else {
        const exists = invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === wxetData[index].sensorId
        );
        if (!exists) {
          invalidChartData.push([wxetData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
        if (invalidChartData.length + updatedWxetData.length === countWxet) {
          setInvalidWxetChartDataContainer(invalidChartData)
          setWxetChartDataContainer(updatedWxetData)

          resolve()
        }
      }).then(() => {
        wxetData = []
      })
    })
  }
}
