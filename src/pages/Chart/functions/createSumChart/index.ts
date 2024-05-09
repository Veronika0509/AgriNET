import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createSumChart = (chartData: any, budgetLines: any, root: any) => {
  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("sumchart");

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
      }),
      tooltip: am5.Tooltip.new(root.current, {}),
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
      series = chart.series.push(am5xy.LineSeries.new(root.current, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root.current, {
          pointerOrientation: "horizontal",
          labelText: "Sum Average = {value}%"
        })
      }));

      let data = createChartDataArray()

      series.data.setAll(data)

      series.appear();
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