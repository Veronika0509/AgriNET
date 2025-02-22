import s from '../../../style.module.css'
export const  isMobileHandler = (additionalChartData: any, chartAdditionalClass: any) => {
  if (additionalChartData.linesCount > 3 && additionalChartData.linesCount <= 6) {
    chartAdditionalClass = s.chartLinesSix
  } else if (additionalChartData.linesCount > 6 && additionalChartData.linesCount <= 9) {
    chartAdditionalClass = s.chartLinesNine
  } else if (additionalChartData.linesCount > 9) {
    chartAdditionalClass = s.chartLinesMoreThanNine
  }
}