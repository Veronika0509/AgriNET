interface ChartDataItem {
  DateTime?: string;
  time?: string;
  [key: string]: unknown;
}

export const getDaysFromChartData = (data: ChartDataItem[]): number => {
  const timeLabel = data[0].DateTime ? 'DateTime' : 'time'
  const endDate = new Date(data[0][timeLabel] as string).getTime()
  const startDate = new Date(data[data.length - 1][timeLabel] as string).getTime()
  return Math.ceil((startDate - endDate) / (1000 * 60 * 60 * 24))
}