export const calculateDynamicChartHeight = (chartId?: any): number => {
  const viewportHeight = window.innerHeight

  const getElementHeight = (selector: string): number => {
    const element = document.querySelector(selector)
    return element ? element.getBoundingClientRect().height : 0
  }

  const topSectionHeight = getElementHeight('[data-chart-section="top"]')
  const headerHeight = getElementHeight('[data-chart-section="mainHeader"]')
  const mainChartHeaderHeight = getElementHeight('[data-chart-section="main-header"]') || 0

  let margins = 20
  if (chartId === 'wxetChartDiv' || chartId === 'tempChartDiv') {
    margins = 40
  }
  if (chartId === 'fuelChartDiv') {
    margins = 30
  }
  const totalUsedHeight =
    topSectionHeight +
    mainChartHeaderHeight +
    headerHeight +
    margins

  const availableHeight = viewportHeight - totalUsedHeight
  let minHeight = 300
  if (chartId === 'wxetChartDiv' || chartId === 'tempChartDiv') {
    minHeight = 365
  }
  console.log(availableHeight, minHeight)
  return Math.max(availableHeight, minHeight)
}

export const setDynamicChartHeight = (chartId: string): void => {
  const setHeight = () => {
    const chartElement = document.getElementById(chartId)
    if (chartElement) {
      const height = calculateDynamicChartHeight(chartId)
      chartElement.style.height = `${height}px`
    }
  }

  setTimeout(setHeight, 100)
}