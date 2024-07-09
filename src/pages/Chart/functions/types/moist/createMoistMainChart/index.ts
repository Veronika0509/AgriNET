import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import login from "../../../../../Login";

let startDateForZooming: any;
let endDateForZooming: any;

export const createMoistMainChart = (
  props: any,
  root: any,
  isMobile: any,
  fullDatesArray: any,
  additionalChartData: any,
  comparingMode: boolean,
  isNewDates: boolean,
  historicMode: boolean,
  showForecast: boolean
): void => {
  const chartDataWrapper = props;

  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("moistChartDiv");

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
      maxTooltipDistance: comparingMode ? undefined : 0
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

    function createChartData(chartDate: any, chartCount: number) {
      return {
        date: chartDate,
        value: chartCount,
        percentValue: Number(chartCount.toFixed(1))
      };
    }

    function createChartDataArray(count: number, prefix: string) {
      let data: any = [];
      chartDataWrapper.map((chartDataItem: any) => {
        const chartDate = new Date(chartDataItem['DateTime']).getTime();
        if (chartDate && chartDataItem[prefix + 'MS ' + count]) {
          const chartData = createChartData(chartDate, chartDataItem[prefix + 'MS ' + count]);
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
            labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + name + " - {percentValue} %",
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
        mappedSeries.events.once("datavalidated", function(event: any) {
          event.target.get("xAxis").zoomToDates(startDateForZooming, endDateForZooming, 0);
        });
      })
    }

// Cursor

    let cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
      behavior: comparingMode ? "selectX" : "zoomX",
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

// Comparing Mode
    if (!comparingMode) {
      xAxis.onPrivate("selectionMin", function(value: any) {
        startDateForZooming = new Date(value)
      });
      xAxis.onPrivate("selectionMax", function(value: any) {
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

        chart.series.each(function(series: any) {
          let dataItemStart = series.dataItems.find(function(dataItem: any) {
            if (x1 < x2) {
              return dataItem.get("valueX") >= x1;
            } else {
              return dataItem.get("valueX") >= x2;
            }
          });

          let dataItemEnd = series.dataItems.find(function(dataItem: any) {
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
    let legend = chart.children.push(am5.Legend.new(root.current, {
      width: 200,
      paddingLeft: isMobile ? -15 : 15,
      height: am5.percent(100)
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
