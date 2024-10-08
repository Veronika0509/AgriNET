import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createAdditionalChart = (
  chartType: string,
  chartData: any,
  root: any,
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
    if (chartType === 'sum') {
      divId = 'sumChart'
    } else if (chartType === 'soilTemp') {
      divId = 'soilTempChart'
    } else {
      divId = 'batteryChart'
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

      let series: any = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
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

    chart.appear(1000, 100);
  }
}