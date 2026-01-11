import * as React from "react";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {updateCommentDate} from "../../../components/AddComment/data/updateCommentDate";
import {removeComment} from "../../../components/AddComment/data/removeComment";
import { TimeSeriesDataItem } from "../../../../../types/api";

// Интерфейсы для данных графика
type ChartDataItem = TimeSeriesDataItem;

interface BudgetLine {
  value: number;
  label: string;
}

interface MoistComment {
  key?: string;
  text: string;
  color_id?: number;
  id: string;
  date?: string;
  userId?: string | number;
  [key: string]: unknown;
}

type RootRef = React.RefObject<am5.Root | null>;

interface SeriesItem {
  name: string;
  prefix: string;
}

interface ChartDataPoint {
  date: number;
  value: number;
}

type SetterFunction<T> = (value: T) => void;
type UpdateCommentsArrayFunction = (type: string, data?: MoistComment) => void;
type UpdateChartFunction = () => void;

// Helper function to safely get budget line
function getBudgetLine(budgetLines: unknown[] | undefined, index: number): BudgetLine | null {
  if (!budgetLines || !Array.isArray(budgetLines) || index >= budgetLines.length) {
    return null;
  }
  const line = budgetLines[index];
  if (line && typeof line === 'object' && 'value' in line && 'label' in line) {
    return line as BudgetLine;
  }
  return null;
}

export const createAdditionalChart = (
  chartType: string,
  chartData: ChartDataItem[],
  root: RootRef,
  setMoistAddCommentModal: (params: {isOpen: boolean; date?: number; type?: string} | ((prev: any) => any)) => void,
  updateCommentsArray: UpdateCommentsArrayFunction,
  _sensorId: string,
  _updateComments: () => void,
  moistAddCommentItemShowed: boolean,
  moistComments: MoistComment[],
  userId: string | number,
  _updateChart: UpdateChartFunction,
  isMoistCommentsShowed: boolean,
// sum
  budgetLines?: BudgetLine[],
  historicMode?: boolean,
  showForecast?: boolean,
  setSumColor?: SetterFunction<string[]>,
// soilTemp
  linesCount?: number,
  metric?: string,
  setSoilTempColor?: SetterFunction<string[]>,
) => {
  if (root.current) {
    root.current.dispose();
    (root as any).current = null;
  }
  if (!root.current) {
    let divId: string
    let chartCode: string
    if (chartType === 'sum') {
      divId = 'sumChart'
      chartCode = 'MSum'
    } else if (chartType === 'soilTemp') {
      divId = 'soilTempChart'
      chartCode = 'MST'
    } else {
      divId = 'batteryChart'
      chartCode = 'MBattery'
    }
    (root as any).current = am5.Root.new(divId);

    // After creating the root, it will never be null
    const rootInstance = root.current!;

    const myTheme = am5.Theme.new(rootInstance);

    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1
    });

    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0.05
    });

    myTheme.rule("Grid", ["x", "minor"]).setAll({
      strokeOpacity: 0.05
    });

// Set themes
    rootInstance.setThemes([
      am5themes_Animated.new(rootInstance),
      myTheme
    ]);

    // Create chart
    const chart = rootInstance.container.children.push(am5xy.XYChart.new(rootInstance, {
      wheelY: "zoomX",
      maxTooltipDistance: undefined,
      paddingLeft: 0
    }));

// Create axes
    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(rootInstance, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 20
      },
      renderer: am5xy.AxisRendererX.new(rootInstance, {
        opposite: true,
        minorGridEnabled: true
      })
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(rootInstance, {
      renderer: am5xy.AxisRendererY.new(rootInstance, {})
    }));

// Add series
    let series: am5xy.SmoothedXLineSeries | undefined
    if (chartType === 'sum') {
      function createSumChartData(chartDate: number, chartCount: number): ChartDataPoint {
        return {
          date: chartDate,
          value: chartCount
        };
      }

      function createSumChartDataArray(prefix: string) {
        const data: ChartDataPoint[] = [];
        chartData.map((chartDataItem: ChartDataItem) => {
          if (chartDataItem[prefix + 'SumAve'] !== undefined && chartDataItem[prefix + 'SumAve'] !== null) {
            const chartDate = new Date(chartDataItem.DateTime).getTime()
            const value = chartDataItem[prefix + 'SumAve'];
            if (typeof value === 'number') {
              const chartData = createSumChartData(chartDate, value);
              data.push(chartData);
            }
          }
        });
        return data;
      }

      const listOfSeries: SeriesItem[] = [
        {name: 'ordinarySeries', prefix: ''}
      ]
      if (historicMode) {
        listOfSeries.push({ name: "historicSeries", prefix: "H_" })
      }
      if (historicMode && showForecast) {
        listOfSeries.push({ name: "futureSeries", prefix: "P_" })
      }

      listOfSeries.map((seriesItem: SeriesItem, index: number) => {
        series = chart.series.push(am5xy.SmoothedXLineSeries.new(rootInstance, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          tension: 0.5,
          tooltip: seriesItem.name === 'ordinarySeries' ? am5.Tooltip.new(rootInstance, {
            pointerOrientation: "horizontal",
            labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + "Sum Average = {value}%"
          }) : undefined,
          snapTooltip: true,
          stroke: am5.color(6779356)
        }));
        series.strokes.template.setAll({
          strokeWidth: 2,
        });

        if (seriesItem.name === 'historicSeries') {
          series.strokes.template.setAll({
            blur: 2
          });
        } else if (seriesItem.name === 'futureSeries') {
          series.strokes.template.setAll({
            blur: 5
          });
        }

        if (index === 0 && setSumColor) {
          const strokeColor = series.get('stroke') as am5.Color;
          setSumColor([strokeColor.r.toString(), strokeColor.g.toString(), strokeColor.b.toString()])
        }

        const data = createSumChartDataArray(seriesItem.prefix)
        series.data.setAll(data)

        series.appear();
      })
    } else if (chartType === 'soilTemp') {
      function createSoilTempChartData(chartDate: number, chartCount: number): ChartDataPoint {
        return {
          date: chartDate,
          value: chartCount
        };
      }

      function createSoilTempChartDataArray(item: number) {
        const data: ChartDataPoint[] = [];
        chartData.map((chartDataItem: ChartDataItem) => {
          const chartDate = new Date(chartDataItem.DateTime).getTime()
          const value = chartDataItem[`MABS${item}`];
          const chartData = createSoilTempChartData(chartDate, typeof value === 'number' ? value : 0);
          data.push(chartData);
        });
        return data;
      }

      let count: number = 4
      const seriesColors: string[] = []
      if (linesCount) {
        for (let i = 0; i < linesCount; i++) {
          const name = count + ' inch';
          const metricSign: '°F' | '°C' = metric === 'AMERICA' ? '°F' : '°C'
          series = chart.series.push(am5xy.SmoothedXLineSeries.new(rootInstance, {
            name: name,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            valueXField: "date",
            legendValueText: "{valueY}",
            tension: 0.5,
            tooltip: am5.Tooltip.new(rootInstance, {
              pointerOrientation: "horizontal",
              labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + name + " - {value} " + metricSign
            }),
            snapTooltip: true,
          }));
          series.strokes.template.setAll({
            strokeWidth: 2,
          });

          count += 4;

          const data = createSoilTempChartDataArray(i)
          series.data.setAll(data);

          const strokeColor = series.get('stroke') as am5.Color;
          seriesColors.push(`rgb(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b})`)

          series.appear();
        }
      }
      if (setSoilTempColor) {
        setSoilTempColor(seriesColors)
      }
    } else {
      function createChartData(chartDate: number, chartCount: number) {
        return {
          date: chartDate,
          value: chartCount,
          percentValue: Number(chartCount.toFixed(1))
        };
      }

      function createChartDataArray() {
        const data: Array<{date: number; value: number; percentValue: number}> = [];
        chartData.map((chartDataItem: ChartDataItem) => {
          // Battery chart uses 'time' property instead of 'DateTime'
          const timeStr = chartDataItem.time || chartDataItem.DateTime;
          const chartDate = new Date(timeStr as any).getTime();
          const value = chartDataItem.value !== undefined ? chartDataItem.value : chartDataItem.Battery;
          const chartData = createChartData(chartDate, typeof value === 'number' ? value : 0);
          data.push(chartData);
        });
        return data;
      }

      series = chart.series.push(am5xy.SmoothedXLineSeries.new(rootInstance, {
        name: 'Battery',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tension: 0.5,
        tooltip: am5.Tooltip.new(rootInstance, {
          pointerOrientation: "horizontal",
          labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + 'Battery = ' + '{value}' + ' VDC'
        }),
        stroke: am5.color(0x000000),
        snapTooltip: true
      }));
      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      const data = createChartDataArray()

      series.data.setAll(data)

      series.appear();
    }

    if (chartType === 'sum' && series) {
// Inside
      // Lines
      if (historicMode) {
        const seriesRangeDataItem = xAxis.makeDataItem({
          value: new Date().getTime()
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid")?.setAll({
          visible: true,
          stroke: am5.color(0xd445d2),
          strokeWidth: 5,
          strokeOpacity: 1,
          strokeDasharray: [2, 2],
        });
        seriesRangeDataItem.get('label')?.setAll({
          text: "NOW",
          inside: true,
          visible: true,
          centerX: 0,
          dy: 45,
          fontSize: 13,
        })
      }
      const budgetLine2 = getBudgetLine(budgetLines, 2);
      if (budgetLine2 && typeof budgetLine2.value === 'number') {
        const seriesRangeDataItem = yAxis.makeDataItem({
          value: budgetLine2.value
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid")?.setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(0xCC0000),
          strokeDasharray: [4, 4]
        });
        seriesRangeDataItem.get("label")?.setAll({
          text: budgetLine2.label || '',
          fill: am5.color(0x000000),
          background: am5.RoundedRectangle.new(rootInstance, {
            fill: am5.color(0xffffff)
          }),
          inside: true,
          fontSize: 12,
          centerX: 0,
          centerY: am5.percent(0),
          y: -10,
          visible: true
        });
      }
      const budgetLine3 = getBudgetLine(budgetLines, 3);
      if (budgetLine3 && typeof budgetLine3.value === 'number') {
        const seriesRangeDataItem = yAxis.makeDataItem({
          value: budgetLine3.value
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid")?.setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(0xCCCC00),
          strokeDasharray: [4, 4]
        });
        seriesRangeDataItem.get("label")?.setAll({
          text: budgetLine3.label || '',
          fill: am5.color(0x000000),
          background: am5.RoundedRectangle.new(rootInstance, {
            fill: am5.color(0xffffff)
          }),
          inside: true,
          fontSize: 12,
          centerX: 0,
          centerY: am5.percent(0),
          y: -10,
          visible: true
        });
      }

  // Regions
  const budgetLine1 = getBudgetLine(budgetLines, 1);
  const topBudgetRegion = yAxis.makeDataItem({
    value: budgetLine1 && typeof budgetLine1.value === 'number' ? budgetLine1.value : 0,
    endValue: 100
  });
  series.createAxisRange(topBudgetRegion);
  topBudgetRegion.get("grid")?.setAll({
    strokeOpacity: 1,
    visible: true,
    stroke: am5.color(0xCCCC00),
    strokeDasharray: [4, 4]
  });
  topBudgetRegion.get("axisFill")?.setAll({
    fill: am5.color(0x02c5fd),
    fillOpacity: 0.2,
    visible: true
  });
      topBudgetRegion.get("label")?.setAll({
        text: budgetLine1 ? budgetLine1.label || '' : '',
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(rootInstance, {
          fill: am5.color(0xffffff)
        }),
        location: 0,
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: am5.percent(0),
        visible: true
      });

      const budgetLine4 = getBudgetLine(budgetLines, 4);
      const middleBudgetRegion = yAxis.makeDataItem({
        value: budgetLine1 && typeof budgetLine1.value === 'number' ? budgetLine1.value : 0,
        endValue: budgetLine4 && typeof budgetLine4.value === 'number' ? budgetLine4.value : 0
      });
      series.createAxisRange(middleBudgetRegion);
      middleBudgetRegion.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCC0000),
        strokeDasharray: [4, 4]
      });
      middleBudgetRegion.get("axisFill")?.setAll({
        fill: am5.color(0x08f908),
        fillOpacity: 0.2,
        visible: true
      });

      const bottomBudgetRegion = yAxis.makeDataItem({
        value: budgetLine4 && typeof budgetLine4.value === 'number' ? budgetLine4.value : 0,
        endValue: 0
      });
      series.createAxisRange(bottomBudgetRegion);
      bottomBudgetRegion.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4]
      });
      bottomBudgetRegion.get("axisFill")?.setAll({
        fill: am5.color(0xf6363b),
        fillOpacity: 0.2,
        visible: true
      });
      bottomBudgetRegion.get("label")?.setAll({
        text: budgetLine4 ? budgetLine4.label || '' : '',
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(rootInstance, {
          fill: am5.color(0xffffff)
        }),
        location: 0,
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });
    }

    // Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(rootInstance, {
      behavior: "zoomX",
      xAxis: xAxis,
    }));

    cursor.selection.setAll({
      fill: am5.color(0xff0000),
      fillOpacity: 0.2
    });

    cursor.lineX.setAll({
      stroke: am5.color(0xff0000),
      strokeWidth: 1,
      strokeDasharray: []
    });

    cursor.lineY.set("visible", false);

    // Add Comments
    if (moistAddCommentItemShowed) {
      chart.events.on("click", (ev: any) => {
        const xAxis = chart.xAxes.getIndex(0) as am5xy.DateAxis<am5xy.AxisRendererX>;

        const xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width());

        const clickDate = xAxis.positionToDate(xPosition);
        setMoistAddCommentModal({isOpen: true, date: clickDate.getTime(), type: chartType})
      });
    }
    if (moistComments && isMoistCommentsShowed) {
      const colors: Record<string, string> = {
        'Advisory': 'F08080',
        'Plant Health': '90EE90',
        'Weather': 'ADD8E6',
        'Irrigation': 'F0F8FF',
        'Growth Stage': 'A9A9A9',
        'Chemical App': '8FBC8F',
        'Pest': 'DB7093',
        'Foliage': '9370DB',
        'Soil Type': '778899',
        'Other': '20B2AA',
        'Percolation': 'F0F8FF',
        'Root Uptake': '9F7D4C',
        'Hands-on': 'C05339',
        'Pressure Bomb': 'F0A6B4',
        'AutoWATER': '04F3FC',
        'Installation': 'FFFFFF',
      }

      const labelsArray: am5.Label[] = []

      // Function to position labels to avoid overlap
      function positionLabels() {
        const labels = labelsArray

        // Cache all positions and sizes ONCE to avoid expensive repeated calls
        const labelData = labels.map(label => ({
          label,
          parent: label.parent as am5.Container,
          x: label.parent?.x() || 0,
          width: label.width() || 0,
          height: label.height() || 0,
          dy: 4
        })).filter(data => data.parent)

        // Sort by X
        labelData.sort((a, b) => a.x - b.x)

        // Reset all Y positions (dy)
        labelData.forEach(data => {
          data.parent.set("dy", 4)
          data.dy = 4
        })

        // Position each label
        for (let i = 0; i < labelData.length; i++) {
          const current = labelData[i]
          let yOffset = 4
          let overlap = true

          while (overlap) {
            overlap = false

            for (let j = 0; j < i; j++) {
              const other = labelData[j]

              // Check overlap using cached values
              const x1 = current.x
              const x2 = other.x
              const y1 = current.dy - 4
              const y2 = other.dy - 4
              const w1 = current.width
              const w2 = other.width
              const h1 = current.height
              const h2 = other.height

              if (!(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1)) {
                overlap = true
                yOffset = Math.max(yOffset, other.dy + other.height + 5)
              }
            }

            if (overlap) {
              current.parent.set("dy", yOffset)
              current.dy = yOffset
            }
          }
        }
      }

      moistComments.forEach((moistMainComment: MoistComment) => {
        const commentColor: string = moistMainComment.color_id ? `#${colors[Object.keys(colors)[(moistMainComment.color_id as number) - 1]]}` : `#FBFFA6`;
        const rangeDataItem = xAxis.makeDataItem({})
        xAxis.createAxisRange(rangeDataItem)
        let isContainerDragging: boolean = false
        const container = am5.Container.new(rootInstance, {
          centerX: am5.p50,
          draggable: true,
          layout: rootInstance.horizontalLayout,
          dy: 4,
        })

        container.adapters.add("x", ((x: number | null | undefined) => Math.max(0, Math.min(chart.plotContainer.width(), x || 0))) as any)

        // Lock Y position - only allow X dragging
        container.adapters.add("y", (() => {
          return 0
        }) as any)

        container.events.on("pointerdown", () => {
          container.set('draggable', isContainerDragging)
        })
        container.events.on("dragged", () => {
          updateLabel()
          cursor.set('behavior', 'none')
          // Update positions in real-time during drag
          positionLabels()
        })
        container.events.on("dragstop", function () {
          // Final reposition after drag ends
          positionLabels()
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
          cursor.set('behavior', 'zoomX')
          const position = xAxis.toAxisPosition(container.x() / chart.plotContainer.width())
          const newDate = rootInstance.dateFormatter.format(new Date(xAxis.positionToValue(position)), "yyyy-MM-dd HH:mm")
          new Promise<void>((resolve: () => void) => {
            updateCommentDate(moistMainComment.id, newDate, userId.toString(), resolve)
          }).then(async () => {
            await updateCommentsArray(chartCode)
            rotationAnimation?.stop()
            icon?.set("src", "https://img.icons8.com/?size=100&id=98070&format=png&color=000000")
            icon?.set("rotation", 0)
          })
        })
        xAxis.topGridContainer.children.push(container)
        rangeDataItem.set(
          "bullet",
          am5xy.AxisBullet.new(rootInstance, {
            sprite: container,
          })
        )
        rangeDataItem.get("grid")?.setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(commentColor),
          strokeWidth: 6,
          location: 0,
        })
        container.set("background", am5.RoundedRectangle.new(rootInstance, {fill: am5.color(commentColor)}))
        const label = container.children.push(
          am5.Label.new(rootInstance, {
            text: `${moistMainComment.key}\n${moistMainComment.color_id ? `${Object.keys(colors)[(moistMainComment.color_id as number) - 1]}\n` : ''}${moistMainComment.text}`,
            fill: am5.color(0x000000),
            maxWidth: 150,
            // minHeight: moistMainComment.color_id ? 60 : 45,
            oversizedBehavior: "wrap",
            fontSize: 12,
            paddingTop: 4,
            paddingLeft: 5,
            paddingRight: 5,
            paddingBottom: 4,
          })
        );

        labelsArray.push(label)

        const buttonsContainer = container.children.push(am5.Container.new(rootInstance, {
          layout: rootInstance.horizontalLayout,
          marginLeft: 8,
        }));
        const dragButton = buttonsContainer.children.push(am5.Button.new(rootInstance, {
          width: 20,
          height: 20,
          cursorOverStyle: "ew-resize",
          background: am5.Rectangle.new(rootInstance, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
          }),
          dx: -20
        }));
        dragButton.children.push(am5.Picture.new(rootInstance, {
          src: "https://img.icons8.com/?size=100&id=98070&format=png&color=000000",
          width: 12,
          height: 12,
          centerX: am5.p50,
          centerY: am5.p50,
          marginLeft: 3
        }));
        dragButton.events.on('pointerdown', () => {
          isContainerDragging = true
        })
        const closeButton = buttonsContainer.children.push(am5.Button.new(rootInstance, {
          width: 20,
          height: 20,
          cursorOverStyle: "pointer",
          background: am5.Rectangle.new(rootInstance, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
          }),
        }));
        closeButton.children.push(am5.Picture.new(rootInstance, {
          src: "https://img.icons8.com/?size=100&id=8112&format=png&color=000000",
          width: 12,
          height: 12,
          centerX: am5.p50,
          centerY: am5.p50
        }));
        closeButton.events.on('click', () => {
          if (window.confirm('Are you sure want to delete this message?')) {
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
              removeComment(moistMainComment.id, userId.toString(), resolve)
            }).then(async () => {
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

          label.set("text", `${rootInstance.dateFormatter.format(new Date(value), "yyyy-MM-dd HH:mm")}\n${moistMainComment.color_id ? `${Object.keys(colors)[(moistMainComment.color_id as number) - 1]}\n` : ''}${moistMainComment.text}`)

          rangeDataItem.set("value", value)
        }

        series?.events.on("datavalidated", () => {
          const commentDate = new Date(moistMainComment.key as string).getTime()
          rangeDataItem.set("value", commentDate)
          updateLabel(commentDate)
        })
      });

      // Position all labels after they are all loaded
      if (labelsArray.length > 0 && series) {
        series.events.once("datavalidated", () => {
          setTimeout(() => {
            positionLabels()
          }, 300)
        })
      }
    }

    chart.appear(1000, 100);
  }
}