import {getTabularData} from "../../data/getTabularData";

export const onTabularDataClick = (
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
      if (tabularData.data.items.length !== 1) {
        setLoading(false)
        setData({
          data: tabularData.data.items
        })
      } else {
        // setLoading(false)
        setData({
          label: tabularData.data.items[0].label,
          sensorCount: tabularData.data.items[0].sensorCount ? tabularData.data.items[0].sensorCount : 1,
          data: tabularData.data.items[0].data,
          freshness: tabularData.data.items[0].freshness
        })
      }
    })
  } else {
    setData(null)
  }
}