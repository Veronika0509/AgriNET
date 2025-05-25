import {getTabularData} from "../data/getTabularData";

export const onTabularDataClick = (
  type: any,
  data: any,
  setData: any,
  setLoading: any,
  sensorId: string,
  chartCode: string,
) => {
  if (!data) {
    setLoading(true)
    new Promise(async (resolve: any) => {
      const tabularData = await getTabularData(sensorId, chartCode)
      resolve(tabularData)
    }).then((tabularData: any) => {
      if (type === 'fuel') {
        setData(tabularData.data)
      } else {
        if (tabularData.data.items.length !== 1) {
          setLoading(false)
          setData({
            data: tabularData.data.items
          })
        } else {
          // setLoading(false)
          let dataToSet: any = {
            label: tabularData.data.items[0].label,
            sensorCount: tabularData.data.items[0].sensorCount ? tabularData.data.items[0].sensorCount : 1,
            data: tabularData.data.items[0].data,
            freshness: tabularData.data.items[0].freshness
          }
          setData(dataToSet)
        }
      }
    })
  } else {
    setData(null)
  }
}