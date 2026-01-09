import * as am5 from "@amcharts/amcharts5"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import * as am5xy from "@amcharts/amcharts5/xy"
import { updateCommentDate } from "../../../components/AddComment/data/updateCommentDate"
import { removeComment } from "../../../components/AddComment/data/removeComment"
import { UserId, SensorId } from '../../../../../types';

// Интерфейсы для данных графика
interface TempChartData {
  DateTime: string;
  Temperature?: number;
  DewPoint?: number;
  RelativeHumidity?: number;
  leafWetness?: number;
  analog1?: number;
  analog2?: number;
  psi?: number;
  waterTemp?: number;
  [key: string]: string | number | undefined;
}

interface AdditionalChartData {
  linesCount: number;
  metric: string;
  [key: string]: unknown;
}

interface ForecastData {
  time: string;
  forecastTemp: number;
}

interface NwsForecastData {
  data: ForecastData[];
  now: string;
}

interface TempComment {
  key: string;
  text: string;
  color_id?: number;
  id: string;
}


interface ChartDataPoint {
  date: number;
  value: number;
}

interface SeriesVisibility {
  name: string;
  visible: boolean;
}

interface RootRef {
  current: any;
}

export const createTempChart = (
  chartData: TempChartData[],
  root: RootRef,
  isMobile: boolean,
  additionalChartData: AdditionalChartData,
  nwsForecastData: NwsForecastData | null,
  setTempAddCommentModal: (value: boolean) => void,
  tempAddCommentItemShowed: boolean,
  tempComments: TempComment[],
  updateCommentsArray: (type: string, data: TempComment) => void,
  userId: UserId,
  _sensorId: SensorId,
  isTempCommentsShowed: boolean,
) => {
  if (root.current) {
    root.current.dispose()
    root.current = null
  }

  if (!root.current) {
    root.current = am5.Root.new("tempChartDiv")

    const myTheme = am5.Theme.new(root.current)

    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1,
    })

    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0.05,
    })

    myTheme.rule("Grid", ["x", "minor"]).setAll({
      strokeOpacity: 0.05,
    })

    // Set themes
    root.current.setThemes([am5themes_Animated.new(root.current), myTheme])

    // Create chart
    const chart = root.current.container.children.push(
      am5xy.XYChart.new(root.current, {
        wheelY: "zoomX",
        maxTooltipDistance: undefined,
        layout: isMobile ? root.current.verticalLayout : root.current.horizontalLayout,
        paddingLeft: 0,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
      }),
    )

    // Create axes
    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root.current, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "minute",
          count: 20,
        },
        renderer: am5xy.AxisRendererX.new(root.current, {
          opposite: true,
          minorGridEnabled: true,
        }),
      }),
    )

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root.current, {
        renderer: am5xy.AxisRendererY.new(root.current, {}),
      }),
    )

    // Add series
    function createChartData(chartDate: number, chartValue: number): ChartDataPoint {
      return {
        date: chartDate,
        value: chartValue,
      }
    }

    function createChartDataArray(lineLabel: string) {
      const data: ChartDataPoint[] = []
      if (lineLabel === "forecastTemp" && nwsForecastData?.data) {
        nwsForecastData.data.map((chartDataItem: ForecastData) => {
          const chartDate = new Date(chartDataItem.time).getTime()
          const chartData = createChartData(chartDate, chartDataItem.forecastTemp)
          data.push(chartData)
        })
      } else {
        chartData.map((chartDataItem: TempChartData) => {
          const chartDate = new Date(chartDataItem.DateTime).getTime()
          const value = chartDataItem[lineLabel as keyof TempChartData]
          if (typeof value === 'number') {
            const chartData = createChartData(chartDate, value)
            data.push(chartData)
          }
        })
      }
      return data
    }

    const metricSign = additionalChartData.metric === "AMERICA" ? "°F" : "°C"

    const dataLabels = [
      { label: "MS 1", name: "Temperature", tooltip: "Temp", metric: metricSign, color: '#FF8F8F'},
      { label: "MS DU", name: "Dew Point", tooltip: "Dew Point", metric: metricSign, color: '#28B2F7'},
      { label: "MS 3", name: "Relative Humidity", tooltip: "RH", metric: "%", color: '#9e14f5'},
    ]

    if (nwsForecastData) {
      dataLabels.push({ label: "forecastTemp", name: "Forecast Temp", tooltip: "Forecast Temp", metric: metricSign, color: '#FF8F8F'})
    }

    let series: any
    dataLabels.map((dataLabel) => {
      const tooltip: am5.Tooltip = am5.Tooltip.new(root.current, {
        pointerOrientation: "horizontal",
        labelText:
          "{valueX.formatDate('yyyy-MM-dd hh:mm')}" +
          "\n" +
          "[bold]" +
          dataLabel.tooltip +
          " - " +
          "{value}" +
          dataLabel.metric,
        getFillFromSprite: false,
      })
      if (tooltip) {
        tooltip.get("background").setAll({
          fill: am5.color(dataLabel.color),
        })
      }
      series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root.current, {
          name: dataLabel.name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tension: 0.5,
          tooltip: tooltip,
          snapTooltip: true,
        }),
      )
      series.set("stroke", am5.color(dataLabel.color))
      series.strokes.template.setAll({
        strokeWidth: 2,
      })

      const data = createChartDataArray(dataLabel.label)
      series.data.setAll(data)
      const visibilityRaw = sessionStorage.getItem("tempChartLinesVisibility")
      let visibilityMap: { name: string; visible: boolean }[] = []

      if (visibilityRaw) {
        try {
          visibilityMap = JSON.parse(visibilityRaw)
          const savedSetting = visibilityMap.find((v) => v.name === dataLabel.name)

          if (savedSetting !== undefined) {
            series.set("visible", savedSetting.visible)
            if (savedSetting.visible) {
              series.appear()
            }
          } else {
            series.appear()
          }
        } catch (e) {
          console.warn("Error parsing sessionStorage visibility data", e)
          series.appear()
        }
      } else {
        series.appear()
      }
    })

    // Nws Forecast
    if (nwsForecastData) {
      const seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime(),
      })
      series.createAxisRange(seriesRangeDataItem)
      seriesRangeDataItem.get("grid").setAll({
        visible: true,
        stroke: am5.color(0xd445d2),
        strokeWidth: 5,
        strokeOpacity: 1,
        strokeDasharray: [2, 2],
      })
      seriesRangeDataItem.get("label").setAll({
        text: "NOW",
        inside: true,
        visible: true,
        centerX: 0,
        dy: 45,
        fontSize: 13,
      })

      const seriesRangeDataItemDate = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime(),
        endValue: new Date(nwsForecastData.now).getTime() + 86400000 * 6,
      })
      series.createAxisRange(seriesRangeDataItemDate)
      seriesRangeDataItemDate.get("axisFill").setAll({
        fill: am5.color(0xf7c815),
        fillOpacity: 0.1,
        visible: true,
      })

      seriesRangeDataItem.get("grid").toFront()
      seriesRangeDataItem.get("label").toFront()
    }

    // Add cursor
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root.current, {
        behavior: "zoomX",
        xAxis: xAxis,
      }),
    )

    cursor.selection.setAll({
      fill: am5.color(0xff0000),
      fillOpacity: 0.2,
    })

    cursor.lineX.setAll({
      stroke: am5.color(0xff0000),
      strokeWidth: 1,
      strokeDasharray: [],
    })

    cursor.lineY.set("visible", false)

    // Add Comments
    if (tempAddCommentItemShowed) {
      chart.events.on("click", (ev: any) => {
        const xAxis = chart.xAxes.getIndex(0)

        const xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width())

        const clickDate = xAxis.positionToDate(xPosition)

        setTempAddCommentModal(clickDate)
      })
    }
    if (tempComments && isTempCommentsShowed) {
      const colors: Record<string, string> = {
        Advisory: "F08080",
        "Plant Health": "90EE90",
        Weather: "ADD8E6",
        Irrigation: "F0F8FF",
        "Growth Stage": "A9A9A9",
        "Chemical App": "8FBC8F",
        Pest: "DB7093",
        Foliage: "9370DB",
        "Soil Type": "778899",
        Other: "20B2AA",
        Percolation: "F0F8FF",
        "Root Uptake": "9F7D4C",
        "Hands-on": "C05339",
        "Pressure Bomb": "F0A6B4",
        AutoWATER: "04F3FC",
        Installation: "FFFFFF",
      }

      const labelsArray: any[] = []

      tempComments.forEach((moistMainComment: TempComment) => {
        const commentColor: string = moistMainComment.color_id
          ? `#${colors[Object.keys(colors)[moistMainComment.color_id - 1]]}`
          : `#FBFFA6`
        const rangeDataItem = xAxis.makeDataItem({})
        xAxis.createAxisRange(rangeDataItem)
        let isContainerDragging = false
        const container = am5.Container.new(root.current, {
          centerX: am5.p50,
          draggable: true,
          layout: root.current.verticalLayout,
          dy: 4,
        })
        container.adapters.add("y", (() => 0) as any)
        container.adapters.add("x", ((x: number) => Math.max(0, Math.min(chart.plotContainer.width(), x))) as any)
        container.events.on("pointerdown", () => {
          container.set("draggable", isContainerDragging)
        })
        container.events.on("dragged", () => {
          updateLabel()
          cursor.set("behavior", "none")
        })
        container.events.on("dragstop", () => {
          const icon = dragButton.children.getIndex(0) as am5.Picture
          icon?.set("src", "https://img.icons8.com/ios/50/000000/loading.png")

          // Store the original position of the icon
          const originalX = icon?.get("x") || 0
          const originalY = icon?.get("y") || 0

          // Create a rotation animation that ONLY affects rotation
          const rotationAnimation = icon?.animate({
            key: "rotation",
            from: 0,
            to: 360,
            duration: 1000,
            loops: Number.POSITIVE_INFINITY,
            easing: am5.ease.linear,
          })

          // Add a listener to ensure position doesn't change during animation
          icon?.on("rotation", (_rotation) => {
            // Force the position to stay fixed during rotation
            icon.set("x", originalX)
            icon.set("y", originalY)
            icon.set("dx", 20)
            icon.set("dy", 7)
          })

          isContainerDragging = false
          cursor.set("behavior", "zoomX")
          const position = xAxis.toAxisPosition(container.x() / chart.plotContainer.width())
          const newDate = root.current.dateFormatter.format(
            new Date(xAxis.positionToValue(position)),
            "yyyy-MM-dd HH:mm",
          )
          new Promise((resolve: any, _reject: any) => {
            updateCommentDate(moistMainComment.id, newDate, userId, resolve)
          }).then(async () => {
            await updateCommentsArray("T", undefined as any)
            rotationAnimation?.stop()
            icon?.set("src", "https://img.icons8.com/?size=100&id=98070&format=png&color=000000")
            icon?.set("rotation", 0)
          })
        })
        xAxis.topGridContainer.children.push(container)
        rangeDataItem.set(
          "bullet",
          am5xy.AxisBullet.new(root.current, {
            sprite: container,
          }),
        )
        rangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(commentColor),
          strokeWidth: 6,
          location: 0,
        })
        container.set("background", am5.RoundedRectangle.new(root.current, { fill: am5.color(commentColor) }))

        const label = container.children.push(
          am5.Label.new(root.current, {
            text: `${moistMainComment.key}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ""}${moistMainComment.text}`,
            fill: am5.color(0x000000),
            maxWidth: 150,
            // minHeight: moistMainComment.color_id ? 60 : 45,
            oversizedBehavior: "wrap",
            fontSize: 12,
            paddingTop: 4,
            paddingLeft: 5,
            paddingRight: 5,
            centerX: am5.p50,
          }),
        )

        labelsArray.push(label)
        const buttonsContainer = label.children.push(
          am5.Container.new(root.current, {
            layout: root.current.horizontalLayout,
            x: am5.p100,
            y: 0,
            centerX: am5.p100,
            paddingTop: 3,
            paddingRight: 3,
          }),
        )
        const dragButton = buttonsContainer.children.push(
          am5.Button.new(root.current, {
            width: 20,
            height: 20,
            cursorOverStyle: "ew-resize",
            background: am5.Rectangle.new(root.current, {
              fill: am5.color(0xffffff),
              fillOpacity: 0,
            }),
          }),
        )
        dragButton.children.push(
          am5.Picture.new(root.current, {
            src: "https://img.icons8.com/?size=100&id=98070&format=png&color=000000",
            width: 12,
            height: 12,
            centerX: am5.p50,
            centerY: am5.p50,
            marginLeft: 3,
          }),
        )
        dragButton.events.on("pointerdown", () => {
          isContainerDragging = true
        })
        const closeButton = buttonsContainer.children.push(
          am5.Button.new(root.current, {
            width: 20,
            height: 20,
            cursorOverStyle: "pointer",
            background: am5.Rectangle.new(root.current, {
              fill: am5.color(0xffffff),
              fillOpacity: 0,
            }),
          }),
        )
        closeButton.children.push(
          am5.Picture.new(root.current, {
            src: "https://img.icons8.com/?size=100&id=8112&format=png&color=000000",
            width: 12,
            height: 12,
            centerX: am5.p50,
            centerY: am5.p50,
          }),
        )
        closeButton.events.on("click", () => {
          if (window.confirm("Are you sure want to delete this message?")) {
            const icon = closeButton.children.getIndex(0) as am5.Picture
            icon?.set("src", " https://img.icons8.com/ios/50/000000/loading.png")
            const originalX = icon?.get("x") || 0
            const originalY = icon?.get("y") || 0
            const rotationAnimation = icon?.animate({
              key: "rotation",
              from: 0,
              to: 360,
              duration: 1000,
              loops: Number.POSITIVE_INFINITY,
              easing: am5.ease.linear,
            })
            icon?.on("rotation", (_rotation) => {
              icon.set("x", originalX)
              icon.set("y", originalY)
              icon.set("dx", 17)
              icon.set("dy", 7)
            })
            new Promise((resolve: any, _reject: any) => {
              removeComment(moistMainComment.id, userId, resolve)
            }).then(async () => {
              await updateCommentsArray("T", undefined as any)
              rotationAnimation?.stop()
              icon?.set("src", "https://img.icons8.com/?size=100&id=8112&format=png&color=000000")
              icon?.set("rotation", 0)
              label.dispose()
              rangeDataItem.dispose()
            })
          }
        })

        function updateLabel(value?: number) {
          const x = container.x()
          const position = xAxis.toAxisPosition(x / chart.plotContainer.width())

          if (value == null) {
            value = xAxis.positionToValue(position)
          }

          label.set(
            "text",
            `${root.current.dateFormatter.format(new Date(value), "yyyy-MM-dd HH:mm")}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ""}${moistMainComment.text}`,
          )

          rangeDataItem.set("value", value)
        }
        function positionLabels() {
          const labels = labelsArray

          labels.sort((a: any, b: any) => {
            const aParent = a.parent
            const bParent = b.parent
            if (!aParent || !bParent) return 0
            return aParent.x() - bParent.x()
          })

          labels.forEach((label: any) => {
            label.set("y", 0)
          })

          for (let i = 0; i < labels.length; i++) {
            const currentLabel = labels[i]
            let yOffset = 0
            let overlap = true

            while (overlap) {
              overlap = false

              for (let j = 0; j < i; j++) {
                const otherLabel = labels[j]

                if (doLabelsOverlap(currentLabel, otherLabel)) {
                  overlap = true
                  yOffset = Math.max(yOffset, otherLabel.y() + otherLabel.height() + 5)
                }
              }

              if (overlap) {
                currentLabel.set("y", yOffset)
              }
            }
          }
        }

        function doLabelsOverlap(label1: any, label2: any) {
          const parent1 = label1.parent
          const parent2 = label2.parent
          if (!parent1 || !parent2) return false

          const x1 = parent1.x()
          const x2 = parent2.x()
          const y1 = label1.y()
          const y2 = label2.y()
          const w1 = label1.width()
          const w2 = label2.width()
          const h1 = label1.height()
          const h2 = label2.height()

          return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1)
        }

        root.current.events.on("frameended", positionLabels)

        series.events.on("datavalidated", () => {
          const commentDate = new Date(moistMainComment.key).getTime()
          rangeDataItem.set("value", commentDate)
          updateLabel(commentDate)
        })
      })
    }

    // Add legend
    const legendHeight = dataLabels.length * 29
    const legend = chart.children.push(
      am5.Legend.new(root.current, {
        width: 230,
        paddingLeft: 15,
        height: legendHeight,
      }),
    )

    legend.itemContainers.template.events.on("pointerdown", (ev: any) => {
      const clickedSeries = ev.target.dataItem?.dataContext
      if (!clickedSeries) return

      const storedVisibilityRaw = sessionStorage.getItem("tempChartLinesVisibility")
      let visibilityMap = []

      if (storedVisibilityRaw) {
        try {
          visibilityMap = JSON.parse(storedVisibilityRaw)
        } catch (e) {
          console.warn("Error parsing sessionStorage visibility data", e)
          visibilityMap = chart.series.values.map((s: any) => ({
            name: s.get("name"),
            visible: s.get("visible"),
          }))
        }
      } else {
        visibilityMap = chart.series.values.map((s: any) => ({
          name: s.get("name"),
          visible: s.get("visible"),
        }))
      }

      const clickedName = clickedSeries.get("name")
      const seriesIndex = visibilityMap.findIndex((item: SeriesVisibility) => item.name === clickedName)

      if (seriesIndex !== -1) {
        visibilityMap[seriesIndex].visible = !visibilityMap[seriesIndex].visible
      } else {
        visibilityMap.push({
          name: clickedName,
          visible: !clickedSeries.get("visible"),
        })
      }

      sessionStorage.setItem("tempChartLinesVisibility", JSON.stringify(visibilityMap))
    })

    legend.itemContainers.template.set("width", am5.p100)
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right",
    })

    legend.data.setAll(chart.series.values)

    chart.appear(1000, 100)
  }
}
