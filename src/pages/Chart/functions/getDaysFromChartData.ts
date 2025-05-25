export const getDaysFromChartData = (data: any) => {
  const timeLabel = data[0].DateTime ? 'DateTime' : 'time'
  const endDate = new Date(data[0][`${timeLabel}`]).getTime()
  const startDate = new Date(data[data.length - 1][`${timeLabel}`]).getTime()
  return(Math.ceil((startDate - endDate) / (1000 * 60 * 60 * 24)))
}