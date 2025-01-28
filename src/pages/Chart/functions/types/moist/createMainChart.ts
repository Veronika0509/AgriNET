import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {removeComment} from "../../../components/AddComment/data/removeComment";
import {updateCommentDate} from "../../../components/AddComment/data/updateCommentDate";
import login from "../../../../Login";

let startDateForZooming: any;
let endDateForZooming: any;

export const createMainChart = (
  props: any,
  userId: any,
  root: any,
  isMobile: any,
  fullDatesArray: any,
  additionalChartData: any,
  comparingMode: boolean,
  isNewDates: boolean,
  historicMode: boolean,
  showForecast: boolean,
  setMoistAddCommentModal: any,
  moistMainAddCommentItemShowed: any,
  moistMainComments: any,
  updateCommentsArray: any,
  updateChart: any,
  isMoistCommentsShowed: any,
  setMainTabularDataColors?: any
): void => {
  const chartDataWrapper = props;
  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("mainChart");

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

    root.current.setThemes([
      am5themes_Animated.new(root.current),
      myTheme
    ]);

    let chart = root.current.container.children.push(am5xy.XYChart.new(root.current, {
      wheelY: comparingMode ? undefined : "zoomX",
      layout: isMobile ? root.current.verticalLayout : root.current.horizontalLayout,
      maxTooltipDistance: undefined,
    }));

    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root.current, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 20
      },
      renderer: am5xy.AxisRendererX.new(root.current, {
        opposite: true,
        minorGridEnabled: true
      }),
      tooltip: am5.Tooltip.new(root.current, {
        forceHidden: true
      }),
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root.current, {
      renderer: am5xy.AxisRendererY.new(root.current, {})
    }));

    yAxis.set('visible', false);

    function createChartData(chartDate: any, chartCount: number, valueToShow: any) {
      return {
        date: chartDate,
        value: chartCount,
        valueToShow
      };
    }

    function createChartDataArray(count: number, prefix: string) {
      let data: any = [];
      chartDataWrapper.map((chartDataItem: any) => {
        const chartDate = new Date(chartDataItem['DateTime']).getTime();
        if (chartDate && chartDataItem[prefix + 'MS ' + count]) {
          const chartData = createChartData(chartDate, chartDataItem[prefix + 'MS ' + count], chartDataItem[prefix + 'MABS' + `${count - 1}`]);
          data.push(chartData);
        }
      });
      return data;
    }


    let listOfSeries = [
      {name: 'ordinarySeries', prefix: ''}
    ]
    if (historicMode) {
      listOfSeries.push({name: 'historicSeries', prefix: 'H_'})
    }
    if (showForecast) {
      listOfSeries.push({name: 'futureSeries', prefix: 'P_'})
    }

    let series: any;
    let seriesArray: any[] = [];
    let ordinarySeriesArray: any = []
    let seriesColors: any = []
    listOfSeries.map((seriesItem: any, index: number) => {
      let count = 4;
      for (var i = 0; i < additionalChartData.linesCount; i++) {
        let name = count + ' inch';
        series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tension: 0.5,
          tooltip: seriesItem.name === 'ordinarySeries' ? am5.Tooltip.new(root.current, {
            pointerOrientation: "horizontal",
            labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + name + " = {valueToShow}%",
          }) : undefined,
          snapTooltip: true,
        }));

        if (series.get("tooltip")) {
          series.get("tooltip").label.setAll({
            fontSize: "15px",
          });
        }

        if (seriesItem.name == 'ordinarySeries') {
          ordinarySeriesArray.push(series)
        }

        if (seriesItem.name === 'historicSeries') {
          series.strokes.template.setAll({
            blur: 2
          });
        } else if (seriesItem.name === 'futureSeries') {
          series.strokes.template.setAll({
            blur: 5
          });
        }

        if (index === 0) {
          seriesColors.push(series.get('stroke'))
        } else {
          series.set('stroke', seriesColors[i])
        }

        count += 4;

        let data = createChartDataArray(i + 1, seriesItem.prefix)

        series.data.setAll(data);

        series.appear();
        seriesArray.push(series);
      }
    })

    if (setMainTabularDataColors) {
      let colors: any[] = []
      seriesColors.map((seriesColor: any) => {
        colors.push([seriesColor.r, seriesColor.g, seriesColor.b])
      })
      setMainTabularDataColors(colors)
    }

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

    fullDatesArray.map((date: any) => {
      let seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date(date).getTime()
      });
      series.createAxisRange(seriesRangeDataItem);
      seriesRangeDataItem.get("grid").setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0x000000),
        strokeDasharray: [2, 2],
      });
    });

    if (startDateForZooming && endDateForZooming && !isNewDates) {
      seriesArray.map((mappedSeries: any) => {
        mappedSeries.events.once("datavalidated", function (event: any) {
          event.target.get("xAxis").zoomToDates(startDateForZooming, endDateForZooming, 0);
        });
      })
    }

// Cursor
    let cursorBehavior: any
    if (comparingMode) {
      cursorBehavior = 'selectX'
    } else if (moistMainAddCommentItemShowed) {
      cursorBehavior = 'zoomX'
    } else {
      cursorBehavior = 'zoomX'
    }

    let cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
      behavior: cursorBehavior,
      xAxis: xAxis
    }));

    cursor.selection.setAll({
      fill: comparingMode ? am5.color(0xfb6909) : am5.color(0xff0000),
      fillOpacity: 0.2,
    });

    cursor.lineX.setAll({
      stroke: am5.color(0xff0000),
      strokeWidth: 1,
      strokeDasharray: []
    });

    cursor.lineY.set("visible", false);

// Add Comments
    if (moistMainAddCommentItemShowed) {
      chart.events.on("click", (ev: any) => {
        let xAxis = chart.xAxes.getIndex(0);

        let xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width());

        let clickDate = xAxis.positionToDate(xPosition);

        setMoistAddCommentModal({date: clickDate, type: 'main'})
      });
    }
    if (moistMainComments && isMoistCommentsShowed) {
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

      moistMainComments.forEach((moistMainComment: any) => {
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
            updateCommentsArray('M')
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
              updateCommentsArray('M')
              updateChart('comments')
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

// Comparing Mode
    if (!comparingMode) {
      xAxis.onPrivate("selectionMin", function (value: any) {
        startDateForZooming = new Date(value)
      });
      xAxis.onPrivate("selectionMax", function (value: any) {
        endDateForZooming = new Date(value)
      });
    }
    if (comparingMode) {
      cursor.setAll({
        alwaysShow: true
      })
      chart.zoomOutButton.set("forceHidden", true);
    }
    let tooltips: any = []
    let selectionLabel: any
    cursor.events.on('selectended', function (event: any) {
      if (comparingMode) {
        let selection = event.target;
        const startSelectionPosition = event.target.getPrivate("downPositionX")
        const endSelectionPosition = event.target.getPrivate("positionX")

        const startPositionDate: any = xAxis.positionToDate(startSelectionPosition).getTime()
        const endPositionDate: any = xAxis.positionToDate(endSelectionPosition).getTime()

        // Selection time
        let selectionTime: any;
        if (startPositionDate < endPositionDate) {
          selectionTime = endPositionDate - startPositionDate
        } else {
          selectionTime = startPositionDate - endPositionDate
        }
        if (selectionTime < 86400000) {
          selectionTime = selectionTime / 3600000
          selectionTime = Math.floor(selectionTime) + ' hours'
        } else {
          const selectionTimeValue: any = selectionTime
          let selectionDays: any = selectionTimeValue / 86400000
          selectionDays = selectionDays.toFixed(2)
          let selectionHours = Math.floor(selectionTimeValue / 3600000)
          selectionTime = selectionDays + ' days (' + selectionHours + ' hours)'
        }

        const selectionX = (startSelectionPosition + endSelectionPosition) / 2;
        const selectionDate = xAxis.positionToDate(selectionX);
        const selectionPixelX = xAxis.valueToPosition(selectionDate.getTime()) * chart.plotContainer.width();
        const selectionPixelY = 20;
        selectionLabel = chart.plotContainer.children.push(am5.Label.new(root.current, {
          height: 25,
          dy: -25,
          text: selectionTime,
          fontSize: 14,
          textAlign: "center",
          fill: am5.color(0xfb6909),
          x: selectionPixelX,
          y: selectionPixelY,
          centerX: am5.percent(50),
          centerY: am5.percent(100),
          background: am5.Rectangle.new(root.current, {
            fill: am5.color(0xffffff),
            fillOpacity: 1
          })
        }));

        // Selection Data
        let xAxisValue = chart.xAxes.getIndex(0);

        let x1 = xAxisValue.positionToDate(xAxisValue.toAxisPosition(selection.getPrivate("downPositionX"))).getTime();
        let x2 = xAxisValue.positionToDate(xAxisValue.toAxisPosition(selection.getPrivate("positionX"))).getTime();

        chart.series.each(function (series: any) {
          let dataItemStart = series.dataItems.find(function (dataItem: any) {
            if (x1 < x2) {
              return dataItem.get("valueX") >= x1;
            } else {
              return dataItem.get("valueX") >= x2;
            }
          });

          let dataItemEnd = series.dataItems.find(function (dataItem: any) {
            if (x1 < x2) {
              return dataItem.get("valueX") >= x2;
            } else {
              return dataItem.get("valueX") >= x1;
            }
          });

          if (dataItemStart && dataItemEnd) {
            const fixedDataItemStart = parseFloat(dataItemStart.get('valueY').toFixed(1))
            const fixedDataItemEnd = parseFloat(dataItemEnd.get('valueY').toFixed(1))
            const difference = (fixedDataItemEnd - fixedDataItemStart).toFixed(1)

            const labelText = fixedDataItemStart + '%' + ' - ' + fixedDataItemEnd + '%' + '\n' + difference + '%' + ' / ' + selectionTime

            let tooltip: any = am5.Tooltip.new(root.current, {
              labelText: labelText,
              tooltipPosition: "fixed",
              pointerOrientation: "left",
              tooltipTarget: series,
              pointTo: dataItemEnd._settings.point,
              x: series.get("tooltip")._settings.x,
              y: series.get("tooltip")._settings.y,
              bounds: series.get("tooltip")._settings.bounds,
              layer: 30
            });
            tooltip.get("background").setAll({
              fill: series.get("tooltip").get("background").get("fill"),
              stroke: series.get("tooltip").get("background").get("stroke"),
              fillOpacity: series.get("tooltip").get("background").get("fillOpacity"),
              strokeOpacity: series.get("tooltip").get("background").get("strokeOpacity"),
            });
            tooltip.label.setAll({
              fill: series.get("tooltip").label.get("fill"),
              fontSize: series.get("tooltip").label.get("fontSize"),
              fontFamily: series.get("tooltip").label.get("fontFamily"),
            });
            tooltip.show()
            chart.plotContainer.children.push(tooltip);

            tooltips.push(tooltip)
          }
        });
      }
    })

    const destroyTooltipsAndLabels = () => {
      if (comparingMode) {
        tooltips.map((tooltip: any) => {
          tooltip.set('forceHidden', true)
          selectionLabel.set('forceHidden', true)
        })
      }
    }
    cursor.events.on('selectcancelled', () => {
      destroyTooltipsAndLabels()
    })
    cursor.events.on('selectstarted', () => {
      destroyTooltipsAndLabels()
    })

// Legend
    let legendHeight: number
    if (additionalChartData.linesCount <= 3) {
      legendHeight = 80
    } else if (additionalChartData.linesCount > 3 && additionalChartData.linesCount <= 6) {
      legendHeight = 160
    } else if (additionalChartData.linesCount > 6 && additionalChartData.linesCount <= 9) {
      legendHeight = 260
    } else {
      legendHeight = 350
    }
    let legend = chart.children.push(am5.Legend.new(root.current, {
      width: 200,
      paddingLeft: isMobile ? -15 : 15,
      height: legendHeight
    }));

    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right"
    });
    legend.data.setAll(ordinarySeriesArray);

    chart.appear(1000, 100);
  }
};
