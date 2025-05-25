export const createWxetDataContainers = async (props: any) => {
  const wxetDataItem = {
    mainId: props.mainId,
    id: props.markerType === 'wxet' ? props.wxetId.value : `fuel-${props.wxetId.value}`,
    sensorId: props.sensorId,
    name: props.name,
    data: props.response.data,
    layerName: 'WXET',
    freshness: props.response.data.freshness,
    markerType: props.markerType,
  }
  props.wxetData.push(wxetDataItem)
  props.boundsArray.push(props.bounds)
  if (props.wxetChartsAmount.length === props.wxetData.length) {
    let updatedWxetData: any = []
    props.boundsArray.map((bounds: any, index: number) => {
      const pushValidMarker = () => {
        const exists = updatedWxetData.some(
          (updatedWxetChartDataItem: any) => updatedWxetChartDataItem[0].sensorId === props.wxetData[index].sensorId
        );
        if (!exists) {
          updatedWxetData.push([props.wxetData[index], bounds]);
        }
      }
      const pushInvalidMarker = () => {
        const exists = props.invalidChartData.some(
          (invalidChartDataItem: any) => invalidChartDataItem[0].sensorId === props.wxetData[index].sensorId
        );
        if (!exists) {
          props.invalidChartData.push([props.wxetData[index], bounds]);
        }
      }
      if (props.markerType === 'wxet') {
        if (props.wxetData[index].data.temp !== undefined && props.wxetData[index].data.temp !== null && props.response.data.freshness !== 'outdated') {
          pushValidMarker()
        } else {
          pushInvalidMarker()
        }
      } else if (props.markerType === 'fuel') {
        if (props.response.data.data.length > 0) {
          pushValidMarker()
        } else {
          pushInvalidMarker()
        }
      }

      new Promise((resolve: any) => {
        console.log(props.invalidChartData.length, updatedWxetData.length, props.countWxet)
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
