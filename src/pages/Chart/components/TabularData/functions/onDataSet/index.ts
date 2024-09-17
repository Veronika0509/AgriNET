export const onDataSet = (
  type: string,
  data: any,
  isWxetMobile: boolean,
  setData: any,
  setIsWxetModalOpen: any,
  setFirstRowColor: any,
  freshnessColors: any[],
  setIsLoading: any
) => {
  if (type === 'wxet') {
    if (!data.isFiltered && isWxetMobile) {
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
  } else {
    if (data.label) {
      setFirstRowColor(freshnessColors[data.freshness] || undefined);
    } else {
      let dataWithColors: any[] = []
      if (data.data) {
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