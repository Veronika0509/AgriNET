import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {checkOverlay} from "../../checkOverlay";
import type { UniversalChartDataItem } from "./createUniversalMarker";
import type { UniversalCustomOverlayInstance } from "../../../components/types/universal/UniversalCustomOverlay";

const toColor = (hex: string) => am5.color(hex.startsWith("#") ? hex : `#${hex}`);

const markDrawn = (chartData: UniversalChartDataItem, overlays: UniversalCustomOverlayInstance[]) => {
  overlays.forEach((overlay) => {
    if (overlay.chartData.mainId === chartData.mainId) {
      overlay.isUniversalMarkerChartDrawn = true
      overlay.update();
    }
  })
}

/**
 * Marker sparkline: D1 line over two background colors split at params.dividerValue
 * by a 1px black line. The Y axis scales to the data only — the backgrounds are
 * axis ranges, which never stretch the axis.
 */
export const createUniversalChartForOverlay = async (
  chartData: UniversalChartDataItem,
  roots: Array<{ dispose: () => void }>,
  overlays: UniversalCustomOverlayInstance[]
): Promise<void> => {
  try {
    await checkOverlay(chartData.id, overlays as unknown as Parameters<typeof checkOverlay>[1])
    if (!document.getElementById(chartData.id)) return

    // Chart already drawn into a live element (overlays state changed for another marker).
    const existingRoot = am5.registry.rootElements.find((root) => root.dom?.id === chartData.id)
    if (existingRoot) {
      if (document.body.contains(existingRoot.dom)) {
        markDrawn(chartData, overlays)
        return
      }
      existingRoot.dispose()
    }

    const { params } = chartData
    const root = am5.Root.new(chartData.id)
    roots.push(root)
    root.setThemes([am5themes_Animated.new(root)])

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingTop: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 0,
    }))
    chart.zoomOutButton.set("forceHidden", true)

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "minute", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {}),
    }))
    xAxis.get("renderer").labels.template.set("forceHidden", true)
    xAxis.get("renderer").grid.template.set("forceHidden", true)

    const yRenderer = am5xy.AxisRendererY.new(root, {})
    yRenderer.labels.template.set("forceHidden", true)
    yRenderer.grid.template.set("forceHidden", true)
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      // Padding so the line stroke never sits exactly on the plot edge.
      extraMin: 0.05,
      extraMax: 0.05,
      renderer: yRenderer,
    }))

    const plotBackground = chart.plotContainer.get("background")
    plotBackground?.setAll({
      stroke: am5.color(0x000000),
      strokeOpacity: 1,
      fill: toColor(params.dividerValue === null ? params.upperBgColor : params.lowerBgColor),
      fillOpacity: 1,
    })

    if (params.dividerValue !== null) {
      const upperRange = yAxis.createAxisRange(yAxis.makeDataItem({
        value: params.dividerValue,
        endValue: Number.MAX_SAFE_INTEGER,
      }))
      upperRange.get("axisFill")?.setAll({
        fill: toColor(params.upperBgColor),
        fillOpacity: 1,
        visible: true,
      })

      const dividerRange = yAxis.createAxisRange(yAxis.makeDataItem({ value: params.dividerValue }))
      dividerRange.get("grid")?.setAll({
        forceHidden: false,
        stroke: am5.color(0x000000),
        strokeOpacity: 1,
        strokeWidth: 1,
      })
    }

    const series = chart.series.push(am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: "value",
      valueXField: "date",
      stroke: toColor(params.lineColor),
    }))
    series.data.setAll(
      chartData.data
        .filter((point) => point.value !== null && point.value !== undefined)
        .map((point) => ({ date: new Date(point.DateTime).getTime(), value: point.value }))
    )

    if (params.showLatestValue && chartData.chartValue) {
      const labelContainer = am5.Container.new(root, {
        layout: root.horizontalLayout,
        width: am5.percent(100),
        background: am5.Rectangle.new(root, {
          fill: toColor(params.upperBgColor),
          stroke: am5.color(0x000000),
          strokeWidth: 1,
        })
      })
      labelContainer.children.push(am5.Label.new(root, {
        text: chartData.chartValue,
        fontSize: 14,
        fontWeight: "400",
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
      }))
      chart.topAxesContainer.children.push(labelContainer)
    }

    series.appear(1000)
    chart.appear(1000, 100)
    markDrawn(chartData, overlays)
  } catch (error) {
    console.error(`Error creating universal chart for ${chartData.id}:`, error)
  }
}
