import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {updateCommentDate} from "../../../../components/AddComment/data/updateCommentDate";
import {removeComment} from "../../../../components/AddComment/data/removeComment";
import login from "../../../../../Login";

export const createAdditionalChart = (
  chartType: string,
  chartData: any,
  root: any,
  setMoistAddCommentModal: any,
  updateCommentsArray: any,
  moistAddCommentItemShowed: any,
  moistComments: any,
  userId: any,
  updateChart: any,
  isMoistCommentsShowed: any,
// sum
  budgetLines?: any,
  historicMode?: boolean,
  setSumColor?: any,
// soilTemp
  linesCount?: number,
  metric?: string,
  setSoilTempColor?: any,
) => {
  if (root.current) {
    root.current.dispose();
    root.current = null;
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
    root.current = am5.Root.new(divId);

    const myTheme = am5.Theme.new(root.current);

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
    root.current.setThemes([
      am5themes_Animated.new(root.current),
      myTheme
    ]);

    // Create chart
    let chart = root.current.container.children.push(am5xy.XYChart.new(root.current, {
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      paddingLeft: 0
    }));

// Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root.current, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 20
      },
      renderer: am5xy.AxisRendererX.new(root.current, {
        opposite: true,
        minorGridEnabled: true
      })
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root.current, {
      renderer: am5xy.AxisRendererY.new(root.current, {})
    }));

// Add series
    let series: any
    if (chartType === 'sum') {
      function createSumChartData(chartDate: any, chartCount: number) {
        return {
          date: chartDate,
          value: chartCount
        };
      }

      function createSumChartDataArray(prefix: string) {
        let data: any = [];
        chartData.map((chartDataItem: any) => {
          const chartDate = new Date(chartDataItem.DateTime).getTime()
          const chartData = createSumChartData(chartDate, chartDataItem[prefix + 'SumAve']);
          data.push(chartData);
        });
        return data;
      }

      let listOfSeries: any = [
        {name: 'ordinarySeries', prefix: ''}
      ]
      if (historicMode) {
        listOfSeries.push({name: 'historicSeries', prefix: 'H_'})
        listOfSeries.push({name: 'futureSeries', prefix: 'P_'})
      }

      listOfSeries.map((seriesItem: any, index: number) => {
        series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          tension: 0.5,
          tooltip: seriesItem.name === 'ordinarySeries' ? am5.Tooltip.new(root.current, {
            pointerOrientation: "horizontal",
            labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + "Sum Average = {value}%"
          }) : undefined,
          snapTooltip: true,
          stroke: am5.color(6779356)
        }));

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
          setSumColor([series.get('stroke').r, series.get('stroke').g, series.get('stroke').b])
        }

        let data = createSumChartDataArray(seriesItem.prefix)
        series.data.setAll(data)

        series.appear();
      })
    } else if (chartType === 'soilTemp') {
      function createSoilTempChartData(chartDate: any, chartCount: number) {
        return {
          date: chartDate,
          value: chartCount
        };
      }

      function createSoilTempChartDataArray(item: number) {
        let data: any = [];
        chartData.map((chartDataItem: any) => {
          const chartDate = new Date(chartDataItem.DateTime).getTime()
          const chartData = createSoilTempChartData(chartDate, chartDataItem[`MABS${item}`]);
          data.push(chartData);
        });
        return data;
      }

      let count: number = 4
      let seriesColors: any = []
      if (linesCount) {
        for (var i = 0; i < linesCount; i++) {
          let name = count + ' inch';
          const metricSign: '°F' | '°C' = metric === 'AMERICA' ? '°F' : '°C'
          series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
            name: name,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            valueXField: "date",
            legendValueText: "{valueY}",
            tension: 0.5,
            tooltip: am5.Tooltip.new(root.current, {
              pointerOrientation: "horizontal",
              labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + name + " - {value} " + metricSign
            }),
            snapTooltip: true,
          }));

          count += 4;

          let data = createSoilTempChartDataArray(i)
          series.data.setAll(data);

          seriesColors.push(series.get('stroke'))

          series.appear();
        }
      }
      setSoilTempColor(seriesColors)
    } else {
      function createChartData(chartDate: any, chartCount: number) {
        return {
          date: chartDate,
          value: chartCount,
          percentValue: Number(chartCount.toFixed(1))
        };
      }

      function createChartDataArray() {
        let data: any = [];
        chartData.map((chartDataItem: any) => {
          const chartDate = new Date(chartDataItem.time).getTime()
          const chartData = createChartData(chartDate, chartDataItem.value);
          data.push(chartData);
        });
        return data;
      }

      series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
        name: 'Battery',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tension: 0.5,
        tooltip: am5.Tooltip.new(root.current, {
          pointerOrientation: "horizontal",
          labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + 'Battery = ' + '{value}' + ' VDC'
        }),
        stroke: am5.color(0x000000),
        snapTooltip: true
      }));

      let data = createChartDataArray()

      series.data.setAll(data)

      series.appear();
    }

    if (chartType === 'sum') {
// Inside
      // Lines
      if (historicMode) {
        let seriesRangeDataItem = xAxis.makeDataItem({
          value: new Date().getTime()
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid").setAll({
          visible: true,
          stroke: am5.color(0xd445d2),
          strokeWidth: 5,
          strokeOpacity: 1,
          strokeDasharray: [2, 2],
        });
        seriesRangeDataItem.get('label').setAll({
          text: "NOW",
          inside: true,
          visible: true,
          centerX: 0,
          dy: 45,
          fontSize: 13,
        })
      }
      if (budgetLines[2].value) {
        let seriesRangeDataItem = yAxis.makeDataItem({
          value: budgetLines[2].value
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(0x000000),
          strokeDasharray: [15, 15],
        });
        seriesRangeDataItem.get("label").setAll({
          text: budgetLines[2].label,
          fill: am5.color(0x000000),
          background: am5.RoundedRectangle.new(root.current, {
            fill: am5.color(0xffffff)
          }),
          inside: true,
          fontSize: 12,
          centerX: 0,
          centerY: "0%",
          y: -10,
          visible: true
        });
      }
      if (budgetLines[3].value) {
        let seriesRangeDataItem = yAxis.makeDataItem({
          value: budgetLines[3].value
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(0x000000),
          strokeDasharray: [15, 15],
        });
        seriesRangeDataItem.get("label").setAll({
          text: budgetLines[3].label,
          fill: am5.color(0x000000),
          background: am5.RoundedRectangle.new(root.current, {
            fill: am5.color(0xffffff)
          }),
          inside: true,
          fontSize: 12,
          centerX: 0,
          centerY: 0,
          visible: true
        });
      }

      let middleBottomLine = yAxis.makeDataItem({
        value: budgetLines[4].value
      });
      series.createAxisRange(middleBottomLine);
      middleBottomLine.get("grid").setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4],
      });
      middleBottomLine.get("label").setAll({
        text: budgetLines[4].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(root.current, {
          fill: am5.color(0xffffff)
        }),
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });

      let topMiddleLine = yAxis.makeDataItem({
        value: budgetLines[1].value
      });
      series.createAxisRange(topMiddleLine);
      topMiddleLine.get("grid").setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4],
      });
      topMiddleLine.get("label").setAll({
        text: budgetLines[1].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(root.current, {
          fill: am5.color(0xffffff)
        }),
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });

      // Regions
      let topBudgetRegion = yAxis.makeDataItem({
        value: budgetLines[1].value,
        endValue: 100
      });
      series.createAxisRange(topBudgetRegion);
      topBudgetRegion.get("grid").setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4]
      });
      topBudgetRegion.get("axisFill").setAll({
        fill: am5.color(0x02c5fd),
        fillOpacity: 0.2,
        visible: true
      });
      topBudgetRegion.get("label").setAll({
        text: budgetLines[1].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(root.current, {
          fill: am5.color(0xffffff)
        }),
        location: 0,
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });

      let middleBudgetRegion = yAxis.makeDataItem({
        value: budgetLines[1].value,
        endValue: budgetLines[4].value
      });
      series.createAxisRange(middleBudgetRegion);
      middleBudgetRegion.get("grid").setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCC0000),
        strokeDasharray: [4, 4]
      });
      middleBudgetRegion.get("axisFill").setAll({
        fill: am5.color(0x08f908),
        fillOpacity: 0.2,
        visible: true
      });

      let bottomBudgetRegion = yAxis.makeDataItem({
        value: budgetLines[4].value,
        endValue: 0
      });
      series.createAxisRange(bottomBudgetRegion);
      bottomBudgetRegion.get("grid").setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4]
      });
      bottomBudgetRegion.get("axisFill").setAll({
        fill: am5.color(0xf6363b),
        fillOpacity: 0.2,
        visible: true
      });
      bottomBudgetRegion.get("label").setAll({
        text: budgetLines[4].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(root.current, {
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
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
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
        let xAxis = chart.xAxes.getIndex(0);

        let xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width());

        let clickDate = xAxis.positionToDate(xPosition);
        setMoistAddCommentModal({date: clickDate, type: chartType})
      });
    }
    if (moistComments && isMoistCommentsShowed) {
      const colors: any = {
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

      let labelsArray: any[] = []
      moistComments.forEach((moistMainComment: any) => {
        const commentColor: string = moistMainComment.color_id ? `#${colors[Object.keys(colors)[moistMainComment.color_id - 1]]}` : `#FBFFA6`;
        const rangeDataItem = xAxis.makeDataItem({})
        xAxis.createAxisRange(rangeDataItem)
        let isContainerDragging: boolean = false
        const container = am5.Container.new(root.current, {
          centerX: am5.p50,
          draggable: true,
          layout: root.verticalLayout,
          dy: 4,
        })
        container.adapters.add("y", function () {
          return 0
        })
        container.adapters.add("x", function (x: any) {
          return Math.max(0, Math.min(chart.plotContainer.width(), x))
        })
        container.events.on("pointerdown", function () {
          container.set('draggable', isContainerDragging)
        })
        container.events.on("dragged", function () {
          updateLabel()
          cursor.set('behavior', 'none')
        })
        container.events.on("dragstop", function () {
          isContainerDragging = false
          cursor.set('behavior', 'zoomX')
          const position = xAxis.toAxisPosition(container.x() / chart.plotContainer.width())
          const newDate = root.current.dateFormatter.format(new Date(xAxis.positionToValue(position)), "yyyy-MM-dd HH:mm")
          new Promise((resolve: any) => {
            updateCommentDate(moistMainComment.id, newDate, userId, resolve)
          }).then(() => {
            updateCommentsArray(chartCode)
          })
        })
        xAxis.topGridContainer.children.push(container)
        rangeDataItem.set(
          "bullet",
          am5xy.AxisBullet.new(root.current, {
            sprite: container,
          })
        )
        rangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(commentColor),
          strokeWidth: 6,
          location: 0,
        })
        container.set("background", am5.RoundedRectangle.new(root.current, {fill: am5.color(commentColor)}))
        const label = container.children.push(
          am5.Label.new(root.current, {
            text: `${moistMainComment.key}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ''}${moistMainComment.text}`,
            fill: am5.color(0x000000),
            maxWidth: 150,
            // minHeight: moistMainComment.color_id ? 60 : 45,
            oversizedBehavior: "wrap",
            fontSize: 12,
            paddingTop: 4,
            paddingLeft: 5,
            paddingRight: 5,
            centerX: am5.p50
          })
        );

        labelsArray.push(label);
        let buttonsContainer = label.children.push(am5.Container.new(root.current, {
          layout: root.current.horizontalLayout,
          x: am5.p100,
          y: 0,
          centerX: am5.p100,
          paddingTop: 3,
          paddingRight: 3,
        }));
        let dragButton = buttonsContainer.children.push(am5.Button.new(root.current, {
          width: 20,
          height: 20,
          cursorOverStyle: "ew-resize",
          background: am5.Rectangle.new(root.current, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
          }),
          dx: -20
        }));
        dragButton.children.push(am5.Picture.new(root.current, {
          src: "https://img.icons8.com/?size=100&id=98070&format=png&color=000000",
          width: 12,
          height: 12,
          centerX: am5.p50,
          centerY: am5.p50
        }));
        dragButton.events.on('pointerdown', () => {
          isContainerDragging = true
        })
        let closeButton = buttonsContainer.children.push(am5.Button.new(root.current, {
          width: 20,
          height: 20,
          cursorOverStyle: "pointer",
          background: am5.Rectangle.new(root.current, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
          }),
        }));
        closeButton.children.push(am5.Picture.new(root.current, {
          src: "https://img.icons8.com/?size=100&id=8112&format=png&color=000000",
          width: 12,
          height: 12,
          centerX: am5.p50,
          centerY: am5.p50
        }));
        closeButton.events.on('click', () => {
          if (window.confirm('Are you sure want to delete this message?')) {
            new Promise((resolve: any) => {
              removeComment(moistMainComment.id, userId, resolve)
            }).then(() => {
              updateCommentsArray(chartCode)
              updateChart(chartType, 'comments')
              label.dispose()
              rangeDataItem.dispose()
            })
          }
        })

        function updateLabel(value?: any) {
          const x = container.x()
          const position = xAxis.toAxisPosition(x / chart.plotContainer.width())

          if (value == null) {
            value = xAxis.positionToValue(position)
          }

          label.set("text", `${root.current.dateFormatter.format(new Date(value), "yyyy-MM-dd HH:mm")}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ''}${moistMainComment.text}`)

          rangeDataItem.set("value", value)
        }
        function positionLabels() {
          let labels = labelsArray;

          labels.sort((a: any, b: any) => {
            const aParent = a.parent;
            const bParent = b.parent;
            if (!aParent || !bParent) return 0;
            return aParent.x() - bParent.x();
          });

          labels.forEach((label: any) => {
            label.set("y", 0);
          });

          for (let i = 0; i < labels.length; i++) {
            let currentLabel = labels[i];
            let yOffset = 0;
            let overlap = true;

            while (overlap) {
              overlap = false;

              for (let j = 0; j < i; j++) {
                let otherLabel = labels[j];

                if (doLabelsOverlap(currentLabel, otherLabel)) {
                  overlap = true;
                  yOffset = Math.max(
                    yOffset,
                    otherLabel.y() + otherLabel.height() + 5
                  );
                }
              }

              if (overlap) {
                currentLabel.set("y", yOffset);
              }
            }
          }
        }

        function doLabelsOverlap(label1: any, label2: any) {
          const parent1 = label1.parent;
          const parent2 = label2.parent;
          if (!parent1 || !parent2) return false;

          const x1 = parent1.x();
          const x2 = parent2.x();
          const y1 = label1.y();
          const y2 = label2.y();
          const w1 = label1.width();
          const w2 = label2.width();
          const h1 = label1.height();
          const h2 = label2.height();

          return !(x1 + w1 < x2 || x2 + w2 < x1 ||
            y1 + h1 < y2 || y2 + h2 < y1);
        }

        root.current.events.on("frameended", positionLabels)
        series.events.on("datavalidated", () => {
          const commentDate = new Date(moistMainComment.key).getTime()
          rangeDataItem.set("value", commentDate)
          updateLabel(commentDate)
        })
      });
    }

    chart.appear(1000, 100);
  }
}