export const calculateDynamicChartHeight = (chartId?: any): number => {
  let viewportHeight = window.innerHeight

  const getElementHeight = (selector: string): number => {
    const element = document.querySelector(selector)
    return element ? element.getBoundingClientRect().height : 0
  }

  const topSectionHeight = getElementHeight('[data-chart-section="top"]')
  const headerHeight = getElementHeight('[data-chart-section="mainHeader"]')
  const mainChartHeaderHeight = getElementHeight('[data-chart-section="main-header"]') || 0
  const sumChartHeaderHeight = getElementHeight('[data-chart-section="sumHeader"]') || 0

  let margins = 20
  if (chartId === 'wxetChartDiv' || chartId === 'tempChartDiv') {
    margins = 40
  }
  if (chartId === 'fuelChartDiv') {
    margins = 30
  }
  let totalUsedHeight =
    topSectionHeight +
    mainChartHeaderHeight +
    headerHeight +
    margins
  if (chartId === 'sumChart') {
    totalUsedHeight = sumChartHeaderHeight + headerHeight + 10
  }
  const availableHeight = viewportHeight - totalUsedHeight
  let minHeight = 300
  if (chartId === 'wxetChartDiv' || chartId === 'tempChartDiv') {
    minHeight = 365
  }
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