import { TimeSeriesDataItem } from "../../../types/api";

type ChartDataItem = TimeSeriesDataItem;

export const getDaysFromChartData = (data: ChartDataItem[]): number => {
  // Return default value if data is empty or undefined
  if (!data || data.length === 0) {
    return 14; // Default days value
  }

  const timeLabel = data[0].DateTime ? 'DateTime' : 'time'
  const endDate = new Date(data[0][timeLabel] as string).getTime()
  const startDate = new Date(data[data.length - 1][timeLabel] as string).getTime()
  return Math.ceil((startDate - endDate) / (1000 * 60 * 60 * 24))
}