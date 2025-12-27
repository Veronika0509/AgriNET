interface DataItem {
  DateTime: string;
  [key: string]: unknown;
}

interface TableData {
  data: DataItem[];
  sensorCount?: number;
  label?: string;
  isFiltered?: boolean;
  freshness?: string;
}

// Type guard to check if data is TableData
function isTableData(data: TableData | { data: TableData[] }): data is TableData {
  return 'data' in data && Array.isArray(data.data) && (data.data.length === 0 || 'DateTime' in data.data[0]);
}

export const onDataSet = (
  type: string,
  data: TableData | { data: TableData[] },
  isWxetMobile: boolean,
  setData: (data: unknown, flag?: boolean) => void,
  setIsWxetModalOpen: (open: boolean) => void,
  setIsFuelModalOpen: (open: boolean) => void,
  setFirstRowColor: (color: string | undefined) => void,
  freshnessColors: Record<string, string>,
  setIsLoading: (loading: boolean) => void
): void => {
  if (type === 'wxet') {
    if (isTableData(data) && !data.isFiltered && isWxetMobile) {
      const dataArray = data.data
      dataArray.sort((a: any, b: any) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
      const lastDate = new Date(dataArray[dataArray.length - 1].DateTime);
      const twoWeeksBefore = new Date(lastDate.getTime());
      twoWeeksBefore.setDate(lastDate.getDate() - 14);
      const filteredArray = dataArray.filter(
        (item: any) => new Date(item.DateTime).getTime() >= twoWeeksBefore.getTime()
      );
      setData({
        data: [...filteredArray].reverse(),
        sensorCount: data.sensorCount,
        label: data.label,
        isFiltered: true,
        freshness: data.freshness
      })
    }
    setIsWxetModalOpen(true)
  } else if (type === 'fuel') {
    setIsFuelModalOpen(true)
  } else {
    if (isTableData(data) && data.label) {
      setFirstRowColor(freshnessColors[data.freshness || ''] || undefined);
    } else {
      const dataWithColors: any[] = []
      if ('data' in data && Array.isArray(data.data)) {
        data.data.map((table: any) => {
          dataWithColors.push({
            data: table.data,
            freshnessColor: freshnessColors[table.freshness],
            label: table.label,
            isReady: true
          })
        })
        setData(dataWithColors, true)
      }
    }
  }
  setIsLoading(false)
}