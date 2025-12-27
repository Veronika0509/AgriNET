import {getTabularData} from "../data/getTabularData";
import { SensorType } from '../../../types';

// Интерфейс для табличных данных
interface TabularDataItem {
  label: string;
  sensorCount?: number;
  data: unknown[];
  freshness: string;
}

interface TabularDataResponse {
  data: {
    items: TabularDataItem[];
  } | TabularDataItem[];
}

export const onTabularDataClick = (
  type: SensorType | undefined,
  data: TabularDataItem[] | TabularDataItem | null,
  setData: (value: TabularDataItem[] | TabularDataItem | { data: TabularDataItem[] } | null) => void,
  setLoading: (value: boolean) => void,
  sensorId: string,
  chartCode: string,
) => {
  if (!data) {
    setLoading(true)
    new Promise(async (resolve: (value: TabularDataResponse) => void) => {
      const tabularData = await getTabularData(sensorId, chartCode)
      resolve(tabularData as TabularDataResponse)
    }).then((tabularData: TabularDataResponse) => {
      if (type === 'fuel') {
        setData(tabularData.data as TabularDataItem[])
      } else {
        const items = Array.isArray(tabularData.data) ? tabularData.data : tabularData.data.items;
        if (items.length !== 1) {
          setLoading(false)
          setData({
            data: items
          })
        } else {
          // setLoading(false)
          const dataToSet: TabularDataItem = {
            label: items[0].label,
            sensorCount: items[0].sensorCount ? items[0].sensorCount : 1,
            data: items[0].data,
            freshness: items[0].freshness
          }
          setData(dataToSet)
        }
      }
    })
  } else {
    setData(null)
  }
}