import s from '../../../style.module.css'

// Интерфейс для дополнительных данных графика
interface AdditionalChartData {
  linesCount: number;
}

export const isMobileHandler = (additionalChartData: AdditionalChartData, chartAdditionalClass: string): string => {
  if (additionalChartData.linesCount > 3 && additionalChartData.linesCount <= 6) {
    return s.chartLinesSix
  } else if (additionalChartData.linesCount > 6 && additionalChartData.linesCount <= 9) {
    return s.chartLinesNine
  } else if (additionalChartData.linesCount > 9) {
    return s.chartLinesMoreThanNine
  }
  return chartAdditionalClass
}