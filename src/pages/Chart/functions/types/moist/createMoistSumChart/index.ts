import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createMoistSumChart = (chartData: any, budgetLines: any, root: any) => {
  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("moistSumChartDiv");

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
        count: 30
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
    function createChartData(chartDate: any, chartCount: number) {
      return {
        date: chartDate,
        value: chartCount
      };
    }

    function createChartDataArray() {
      let data: any = [];
      chartData.map((chartDataItem: any) => {
        const chartDate = new Date(chartDataItem.DateTime).getTime()
        const chartData = createChartData(chartDate, chartDataItem['SumAve']);
        data.push(chartData);
      });
      return data;
    }

    let series: any
    for (var i = 0; i < 1; i++) {
      series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tension: 0.1,
        tooltip: am5.Tooltip.new(root.current, {
          pointerOrientation: "horizontal",
          labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + "Sum Average = {value}%"
        })
      }));

      let data = createChartDataArray()

      series.data.setAll(data)

      series.appear();
    }

// Inside
    // Lines
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