import axios from "axios";

export const createWxetDataContainers = async (props: any) => {
  const wxetDataItem = {
    mainId: props.mainId,
    id: props.wxetId.value,
    sensorId: props.sensorId,
    name: props.name,
    data: props.response.data,
    layerName: 'WXET'
  }
  props.wxetData.push(wxetDataItem)
  props.boundsArray.push(props.bounds)
  if (props.wxetChartsAmount.length === props.wxetData.length) {
    let updatedWxetData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      if (props.wxetData[index].data.temp !== undefined && props.wxetData[index].data.temp !== null) {
        const exists = updatedWxetData.some(
          (updatedWxetChartDataItem: any) => updatedWxetChartDataItem[0].sensorId === props.wxetData[index].sensorId
        );
        if (!exists) {
          updatedWxetData.push([props.wxetData[index], bounds]);
        }
      } else {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === props.wxetData[index].sensorId
        );
        if (!exists) {
          props.invalidChartData.push([props.wxetData[index], bounds]);
        }
      }
      new Promise((resolve: any) => {
        if (props.invalidChartData.length + updatedWxetData.length === props.countWxet) {
          props.setInvalidWxetChartDataContainer(props.invalidChartData)
          props.setWxetChartDataContainer(updatedWxetData)

          resolve()
        }
      }).then(() => {
        props.wxetData = []
      })
    })
  }
}
