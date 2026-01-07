import * as am5 from "@amcharts/amcharts5"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import * as am5xy from "@amcharts/amcharts5/xy"
import { removeComment } from "../../../components/AddComment/data/removeComment"
import { updateCommentDate } from "../../../components/AddComment/data/updateCommentDate"
import { TimeSeriesDataItem } from "../../../../../types/api"

type ChartDataItem = TimeSeriesDataItem;

interface AdditionalChartData {
  linesCount: number;
  legend: object;
}

interface MoistComment {
  id: string;
  date: string;
  comment: string;
  [key: string]: unknown;
}

interface SetCommentModalParams {
  isOpen: boolean
  date?: number
  value?: number
  sensorId?: string | number
  type?: string
}

interface SeriesItem {
  name: string
  prefix: string
  [key: string]: unknown
}

type SetterFunction<T> = (value: T) => void;
type UpdateCommentsFunction = (type: string, sensorId: string, updateComments: () => void, data: ChartDataItem[]) => Promise<void>;

// amCharts cursor event type
interface CursorSelectEvent {
  target: am5xy.XYCursor;
  type: string;
  [key: string]: unknown;
}

// Helper to safely get private properties from amCharts objects
function getPrivateValue(obj: any, key: string): number | undefined {
  if (obj && typeof obj.getPrivate === 'function') {
    return obj.getPrivate(key);
  }
  return undefined;
}

interface CreateMainChartProps {
  data: ChartDataItem[];
  root: { current: am5.Root | null };
  comparingMode?: boolean;
  historicMode?: boolean;
  showForecast?: boolean;
  additionalChartData: AdditionalChartData;
  setMoistMainTabularDataColors?: SetterFunction<string[]>;
  fullDatesArray?: Date[] | boolean;
  isNewDates?: boolean;
  moistMainAddCommentItemShowed?: boolean;
  setMoistAddCommentModal?: (params: SetCommentModalParams) => void;
  moistMainComments?: MoistComment[];
  isMoistCommentsShowed?: boolean;
  userId?: string;
  sensorId?: string;
  updateCommentsArray?: UpdateCommentsFunction;
  updateComments?: () => void;
  smallScreen?: boolean;
  middleScreen?: boolean;
  largeScreen?: boolean;
}

let startDateForZooming: number | null = null;
let endDateForZooming: number | null = null;

export const createMainChart = (props: CreateMainChartProps): void => {
  const chartDataWrapper = props.data
  const colors =
    "#FF6600 #FCD202 #B0DE09 #0D8ECF #2A0CD0 #CD0D74 #CC0000 #00CC00 #0000CC #DDDDDD #999999 #333333".split(" ")
  if (props.root.current) {
    props.root.current.dispose()
    props.root.current = null
  }

  if (!props.root.current) {
    props.root.current = am5.Root.new("mainChart")

    const myTheme = am5.Theme.new(props.root.current)

    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1,
    })

    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0.05,
    })

    myTheme.rule("Grid", ["x", "minor"]).setAll({
      strokeOpacity: 0.05,
    })

    props.root.current.setThemes([am5themes_Animated.new(props.root.current), myTheme])

    const chart = props.root.current.container.children.push(
      am5xy.XYChart.new(props.root.current, {
        wheelY: props.comparingMode ? "none" : "zoomX",
        layout: props.root.current.verticalLayout,
        maxTooltipDistance: undefined,
      }),
    )

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(props.root.current, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "minute",
          count: 20,
        },
        renderer: am5xy.AxisRendererX.new(props.root.current, {
          opposite: true,
          minorGridEnabled: true,
        }),
        tooltip: am5.Tooltip.new(props.root.current, {
          forceHidden: true,
        }),
      }),
    )

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(props.root.current, {
        renderer: am5xy.AxisRendererY.new(props.root.current, {}),
      }),
    )

    function createChartData(chartDate: number, chartCount: number, valueToShow: number) {
      return {
        date: chartDate,
        value: chartCount,
        valueToShow,
      }
    }

    function createChartDataArray(count: number, prefix: string) {
      const data: Array<{ date: number; value: number; valueToShow: number }> = []
      chartDataWrapper.map((chartDataItem: ChartDataItem) => {
        const chartDate = new Date(chartDataItem["DateTime"]).getTime()
        if (chartDate && chartDataItem[prefix + "MS " + count]) {
          const chartData = createChartData(
            chartDate,
            Number(chartDataItem[prefix + "MS " + count]),
            Number(chartDataItem[prefix + "MABS" + `${count - 1}`] || 0),
          )
          data.push(chartData)
        }
      })
      return data
    }

    const listOfSeries = [{ name: "ordinarySeries", prefix: "" }]
    if (props.historicMode) {
      listOfSeries.push({ name: "historicSeries", prefix: "H_" })
    }

    if (props.historicMode && props.showForecast) {
      listOfSeries.push({ name: "futureSeries", prefix: "P_" })
    }

    let series: am5xy.SmoothedXLineSeries
    const seriesArray: am5xy.SmoothedXLineSeries[] = []
    const ordinarySeriesArray: am5xy.SmoothedXLineSeries[] = []
    const seriesColors: string[] = []
    listOfSeries.map((seriesItem: SeriesItem, index: number) => {
      let count = 1
      for (let i = 0; i < props.additionalChartData.linesCount; i++) {
        const name = (props.additionalChartData.legend as Record<string, string>)[`s${count}`]
        let tooltip: am5.Tooltip | undefined
        if (seriesItem.name === "ordinarySeries") {
          tooltip = am5.Tooltip.new(props.root.current, {
            pointerOrientation: "horizontal",
            getFillFromSprite: false,
            labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + "\n" + "[bold]" + name + " = {valueToShow}%",
          })
        }
        if (tooltip) {
          tooltip.get("background").setAll({
            fill: am5.color(colors[i]),
          })
        }
        series = chart.series.push(
          am5xy.SmoothedXLineSeries.new(props.root.current, {
            name: name,
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
        series.set("stroke", am5.color(colors[i]))
        series.strokes.template.setAll({
          strokeWidth: 2,
        })

        if (series.get("tooltip")) {
          series.get("tooltip").label.setAll({
            fontSize: "15px",
          })
        }

        if (seriesItem.name == "ordinarySeries") {
          ordinarySeriesArray.push(series)
        }

        if (seriesItem.name === "historicSeries") {
          series.strokes.template.setAll({
            blur: 2,
          })
        } else if (seriesItem.name === "futureSeries") {
          series.strokes.template.setAll({
            blur: 5,
          })
        }

        if (index === 0) {
          seriesColors.push(colors[i])
        } else {
          series.set("stroke", am5.color(seriesColors[i]))
        }

        count += 1

        const data = createChartDataArray(i + 1, seriesItem.prefix)

        series.data.setAll(data)

        series.appear()
        seriesArray.push(series)
      }
    })

    if (props.setMoistMainTabularDataColors) {
      const colors: string[] = []
      seriesColors.map((seriesColor: string) => {
        colors.push(seriesColor)
      })
      props.setMoistMainTabularDataColors(colors)
    }

    if (props.historicMode) {
      const seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date().getTime(),
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
    }

    if (props.fullDatesArray !== undefined && props.fullDatesArray !== true) {
      Array.isArray(props.fullDatesArray) && props.fullDatesArray.map((date: Date) => {
        const seriesRangeDataItem = xAxis.makeDataItem({
          value: new Date(date).getTime(),
        })
        series.createAxisRange(seriesRangeDataItem)
        seriesRangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(0x000000),
          strokeDasharray: [2, 2],
        })
      })
    }

    if (startDateForZooming && endDateForZooming && !props.isNewDates) {
      seriesArray.map((mappedSeries: am5xy.SmoothedXLineSeries) => {
        mappedSeries.events.once("datavalidated", (event: any) => {
          event.target.get("xAxis").zoomToDates(new Date(startDateForZooming!), new Date(endDateForZooming!), 0)
        })
      })
    }

    // Cursor
    let cursorBehavior: "zoomX" | "selectX"
    if (props.comparingMode) {
      cursorBehavior = "selectX"
    } else if (props.moistMainAddCommentItemShowed) {
      cursorBehavior = "zoomX"
    } else {
      cursorBehavior = "zoomX"
    }

    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(props.root.current, {
        behavior: cursorBehavior,
        xAxis: xAxis,
      }),
    )

    cursor.selection.setAll({
      fill: props.comparingMode ? am5.color(0xfb6909) : am5.color(0xff0000),
      fillOpacity: 0.2,
    })

    cursor.lineX.setAll({
      stroke: am5.color(0xff0000),
      strokeWidth: 1,
      strokeDasharray: [],
    })

    cursor.lineY.set("visible", false)

    // Add Comments
    if (props.moistMainAddCommentItemShowed) {
      chart.events.on("click", (ev: any) => {
        const xAxis = chart.xAxes.getIndex(0) as am5xy.DateAxis<am5xy.AxisRendererX>

        const xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width())

        const clickDate = xAxis.positionToDate(xPosition)

        props.setMoistAddCommentModal({ isOpen: true, date: clickDate.getTime(), type: "main" })
      })
    }
    if (props.moistMainComments && props.isMoistCommentsShowed) {
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

      const labelsArray: am5.Label[] = []

      props.moistMainComments?.forEach((moistMainComment: MoistComment) => {
        const commentColor: string = moistMainComment.color_id
          ? `#${colors[Object.keys(colors)[(moistMainComment.color_id as number) - 1]]}`
          : `#FBFFA6`
        const rangeDataItem = xAxis.makeDataItem({})
        xAxis.createAxisRange(rangeDataItem)
        let isContainerDragging = false
        const container = am5.Container.new(props.root.current, {
          centerX: am5.p50,
          draggable: true,
          layout: props.root.current!.verticalLayout,
          dy: 4,
        })
        container.adapters.add("y", () => 0)
        container.adapters.add("x", (x: number | null | undefined) => Math.max(0, Math.min(chart.plotContainer.width(), x || 0)))
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
          const newDate = props.root.current.dateFormatter.format(
            new Date(xAxis.positionToValue(position)),
            "yyyy-MM-dd HH:mm",
          )
          new Promise<void>((resolve: () => void) => {
            updateCommentDate(moistMainComment.id, newDate, props.userId || '', resolve)
          }).then(async () => {
            await props.updateCommentsArray("M", props.sensorId, props.updateComments, props.data)
            rotationAnimation?.stop()
            icon?.set("src", "https://img.icons8.com/?size=100&id=98070&format=png&color=000000")
            icon?.set("rotation", 0)
          })
        })
        xAxis.topGridContainer.children.push(container)
        rangeDataItem.set(
          "bullet",
          am5xy.AxisBullet.new(props.root.current, {
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
        container.set("background", am5.RoundedRectangle.new(props.root.current, { fill: am5.color(commentColor) }))

        const label = container.children.push(
          am5.Label.new(props.root.current, {
            text: `${moistMainComment.key}\n${moistMainComment.color_id ? `${Object.keys(colors)[(moistMainComment.color_id as number) - 1]}\n` : ""}${moistMainComment.text}`,
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
          am5.Container.new(props.root.current, {
            layout: props.root.current.horizontalLayout,
            x: am5.p100,
            y: 0,
            centerX: am5.p100,
            paddingTop: 3,
            paddingRight: 3,
          }),
        )
        const dragButton = buttonsContainer.children.push(
          am5.Button.new(props.root.current, {
            width: 20,
            height: 20,
            cursorOverStyle: "ew-resize",
            background: am5.Rectangle.new(props.root.current, {
              fill: am5.color(0xffffff),
              fillOpacity: 0,
            }),
          }),
        )
        dragButton.children.push(
          am5.Picture.new(props.root.current, {
            src: "https://img.icons8.com/?size=100&id=98070&format=png&color=000000",
            width: 12,
            height: 12,
            centerX: am5.p50,
            centerY: am5.p50,
            marginLeft: 3
          }),
        )
        dragButton.events.on("pointerdown", () => {
          isContainerDragging = true
        })
        const closeButton = buttonsContainer.children.push(
          am5.Button.new(props.root.current, {
            width: 20,
            height: 20,
            cursorOverStyle: "pointer",
            background: am5.Rectangle.new(props.root.current, {
              fill: am5.color(0xffffff),
              fillOpacity: 0,
            }),
          }),
        )
        closeButton.children.push(
          am5.Picture.new(props.root.current, {
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
            new Promise<void>((resolve: () => void) => {
              removeComment(moistMainComment.id, props.userId || '', resolve)
            }).then(async () => {
              await props.updateCommentsArray("M", props.sensorId, props.updateComments, props.data)
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
            `${props.root.current!.dateFormatter.format(new Date(value), "yyyy-MM-dd HH:mm")}\n${moistMainComment.color_id ? `${Object.keys(colors)[(moistMainComment.color_id as number) - 1]}\n` : ""}${moistMainComment.text}`,
          )

          rangeDataItem.set("value", value)
        }

        function positionLabels() {
          const labels = labelsArray

          labels.sort((a: am5.Label, b: am5.Label) => {
            const aParent = a.parent
            const bParent = b.parent
            if (!aParent || !bParent) return 0
            return aParent.x() - bParent.x()
          })

          labels.forEach((label: am5.Label) => {
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

        function doLabelsOverlap(label1: am5.Label, label2: am5.Label) {
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

        props.root.current.events.on("frameended", positionLabels)

        series.events.on("datavalidated", () => {
          const commentDate = new Date(moistMainComment.key as string).getTime()
          rangeDataItem.set("value", commentDate)
          updateLabel(commentDate)
        })
      })
    }

    // Comparing Mode
    if (!props.comparingMode) {
      xAxis.onPrivate("selectionMin", (value: number) => {
        startDateForZooming = value
      })
      xAxis.onPrivate("selectionMax", (value: number | undefined) => {
        endDateForZooming = value || 0
      })
    }
    if (props.comparingMode) {
      cursor.setAll({
        alwaysShow: true,
      })
      chart.zoomOutButton.set("forceHidden", true)
    }
    const tooltips: am5.Tooltip[] = []
    let selectionLabel: am5.Label | undefined
    cursor.events.on("selectended", (event: CursorSelectEvent) => {
      if (props.comparingMode) {
        const selection = event.target
        const startSelectionPosition = getPrivateValue(event.target, "downPositionX") ?? 0
        const endSelectionPosition = getPrivateValue(event.target, "positionX") ?? 0

        const startPositionDate: number = xAxis.positionToDate(startSelectionPosition).getTime()
        const endPositionDate: number = xAxis.positionToDate(endSelectionPosition).getTime()

        // Selection time
        let selectionTimeMs: number
        if (startPositionDate < endPositionDate) {
          selectionTimeMs = endPositionDate - startPositionDate
        } else {
          selectionTimeMs = startPositionDate - endPositionDate
        }
        let selectionTime: string
        if (selectionTimeMs < 86400000) {
          const hours = selectionTimeMs / 3600000
          selectionTime = Math.floor(hours) + " hours"
        } else {
          const selectionDays = selectionTimeMs / 86400000
          const selectionHours = Math.floor(selectionTimeMs / 3600000)
          selectionTime = selectionDays.toFixed(2) + " days (" + selectionHours + " hours)"
        }

        let newEndSelectionPosition
        if (startSelectionPosition > endSelectionPosition) {
          if (endSelectionPosition < 0) {
            newEndSelectionPosition = 0
          } else {
            newEndSelectionPosition = endSelectionPosition
          }
        } else {
          if (endSelectionPosition > 1) {
            newEndSelectionPosition = 1
          } else {
            newEndSelectionPosition = endSelectionPosition
          }
        }
        const selectionX = (startSelectionPosition + newEndSelectionPosition) / 2
        const selectionDate = xAxis.positionToDate(selectionX)
        const selectionPixelX = xAxis.valueToPosition(selectionDate.getTime()) * chart.plotContainer.width()
        const selectionPixelY = 20
        const labelWidth = selectionTime.length * 6
        const plotWidth = chart.plotContainer.width()

        // Adjust x position to keep label within bounds
        const adjustedX = Math.min(Math.max(labelWidth / 2, selectionPixelX), plotWidth - labelWidth / 2)
        selectionLabel = chart.plotContainer.children.push(
          am5.Label.new(props.root.current, {
            height: 25,
            dy: -25,
            text: selectionTime,
            fontSize: 14,
            textAlign: "center",
            fill: am5.color(0xfb6909),
            x: adjustedX,
            y: selectionPixelY,
            centerX: am5.percent(50),
            centerY: am5.percent(100),
            background: am5.Rectangle.new(props.root.current, {
              fill: am5.color(0xffffff),
              fillOpacity: 1,
            }),
          }),
        )

        // Selection Data
        const xAxisValue = chart.xAxes.getIndex(0)

        if (xAxisValue && xAxisValue instanceof am5xy.DateAxis) {
          const downPosX = getPrivateValue(selection, "downPositionX") ?? 0
          const posX = getPrivateValue(selection, "positionX") ?? 0

          const x1 = xAxisValue.positionToDate(xAxisValue.toAxisPosition(downPosX)).getTime()
          const x2 = xAxisValue.positionToDate(xAxisValue.toAxisPosition(posX)).getTime()
          chart.series.each((series: am5xy.SmoothedXLineSeries) => {
            const dataItemStart = series.dataItems.find((dataItem: am5.DataItem<am5xy.IXYSeriesDataItem>) => {
              if (x1 < x2) {
                return dataItem.get("valueX") >= x1
              } else {
                return dataItem.get("valueX") >= x2
              }
            })
            const dataItemEnd = series.dataItems.find((dataItem: am5.DataItem<am5xy.IXYSeriesDataItem>) => {
              if (x1 < x2) {
                return dataItem.get("valueX") >= x2
              } else {
                return dataItem.get("valueX") >= x1
              }
            })
            if (dataItemStart && dataItemEnd) {
              const startIndex = series.dataItems.indexOf(dataItemStart)
              const endIndex = series.dataItems.indexOf(dataItemEnd)

              const relevantDataItems = series.dataItems.slice(startIndex, endIndex)

              const values: number[] = relevantDataItems.map((dataItem: am5.DataItem<am5xy.IXYSeriesDataItem>) => {
                const value = dataItem.get("valueY");
                return typeof value === 'number' ? value : 0;
              });

              if (values && values.length) {
                const maxInSelection = Math.max(...values).toFixed(2)
                const minInSelection = Math.min(...values).toFixed(2)
                const changeInSelection = ((Math.max(...values)) - (Math.min(...values))).toFixed(2)
                const avgInSelection = ((values.reduce((sum, value) => sum + value, 0)) / values.length).toFixed(2)

                if (!document.querySelector('.selection-info')) {
                  const selectionInfoDiv = document.createElement('div')
                  selectionInfoDiv.classList.add('selection-info')
                  selectionInfoDiv.style.position = 'absolute'
                  selectionInfoDiv.style.top = '60px'
                  selectionInfoDiv.style.right = '10px'
                  selectionInfoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                  selectionInfoDiv.style.padding = '10px'
                  selectionInfoDiv.style.borderRadius = '5px'
                  selectionInfoDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)'
                  selectionInfoDiv.style.zIndex = '1000'
                  selectionInfoDiv.style.fontSize = '14px'
                  selectionInfoDiv.innerHTML = `
                    <div><strong>Selection:</strong></div>
                    <div>Max: ${maxInSelection}%</div>
                    <div>Min: ${minInSelection}%</div>
                    <div>Change: ${changeInSelection}%</div>
                    <div>Avg: ${avgInSelection}%</div>
                  `
                  document.body.appendChild(selectionInfoDiv)
                } else {
                  const selectionInfoDiv = document.querySelector('.selection-info')
                  if (selectionInfoDiv) {
                    selectionInfoDiv.innerHTML = `
                      <div><strong>Selection:</strong></div>
                      <div>Max: ${maxInSelection}%</div>
                      <div>Min: ${minInSelection}%</div>
                      <div>Change: ${changeInSelection}%</div>
                      <div>Avg: ${avgInSelection}%</div>
                    `
                  }
                }
              }
            }
          })
        }
      } else {
        if (selectionLabel) {
          selectionLabel.dispose()
        }
      }
    })

    function destroyTooltipsAndLabels() {
      if (selectionLabel) {
        selectionLabel.dispose()
      }
      const selectionInfo = document.querySelector('.selection-info')
      if (selectionInfo) {
        selectionInfo.remove()
      }
      tooltips.forEach((tooltip) => {
        tooltip.dispose()
      })
    }

    cursor.events.on("selectcancelled", () => {
      destroyTooltipsAndLabels()
    })
    cursor.events.on("selectstarted", () => {
      destroyTooltipsAndLabels()
    })

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(props.root.current, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: props.root.current.horizontalLayout,
        marginTop: 15,
      }),
    )
    if (props.additionalChartData.linesCount > 3 && props.additionalChartData.linesCount <= 6) {
      if (props.smallScreen) {
        legend.set("layout", props.root.current.verticalLayout)
        legend.set("x", am5.percent(5))
      }
    } else if (props.additionalChartData.linesCount > 6 && props.additionalChartData.linesCount <= 9) {
      if (props.middleScreen) {
        legend.set("layout", props.root.current.verticalLayout)
        legend.set("x", am5.percent(5))
      }
    } else if (props.additionalChartData.linesCount > 9) {
      if (props.largeScreen) {
        legend.set("layout", props.root.current.verticalLayout)
        legend.set("x", am5.percent(5))
      }
    }

    legend.itemContainers.template.setAll({
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 5,
      paddingRight: 5,
    })

    legend.labels.template.setAll({
      fontSize: 13,
      fontWeight: "400",
    })

    // Remove value labels
    legend.valueLabels.template.set("forceHidden", true)

    legend.data.setAll(ordinarySeriesArray)

    chart.appear(1000, 100)
  }
}
