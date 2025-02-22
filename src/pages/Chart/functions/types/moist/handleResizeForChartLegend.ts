export const handleResizeForChartLegend = (props: any) => {
  if (props.additionalChartData.linesCount > 3 && props.additionalChartData.linesCount <= 6) {
    const newIsSmallScreen = window.innerWidth <= 500
    if (newIsSmallScreen !== props.smallScreen) {
      props.setSmallScreen(newIsSmallScreen)
    }
  } else if (props.additionalChartData.linesCount > 6 && props.additionalChartData.linesCount <= 9) {
    const newIsMiddleScreen = window.innerWidth <= 800
    if (newIsMiddleScreen !== props.middleScreen) {
      props.setMiddleScreen(newIsMiddleScreen)
    }
  } else if (props.additionalChartData.linesCount > 9) {
    const newIsLargeScreen = window.innerWidth <= 1000
    if (newIsLargeScreen !== props.largeScreen) {
      props.setLargeScreen(newIsLargeScreen)
    }
  }
}