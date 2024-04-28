import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createChart = (props: any, root: any, isMobile: any, fullDatesArray: any): void => {
  const chartDataWrapper = props

  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("chartdiv");

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
      layout: isMobile ? root.current.verticalLayout : root.current.horizontalLayout,
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

    yAxis.set('visible', false)

// Add series
    function createChartData(chartDate: any, chartCount: number) {
      return {
        date: chartDate,
        value: chartCount,
        percentValue: Number(chartCount.toFixed(1))
      };
    }

    function createChartDataArray(count: number) {
      let data: any = [];
      chartDataWrapper.map((chartDataItem: any) => {
        const chartDate = new Date(chartDataItem.DateTime).getTime()
        const chartData = createChartData(chartDate, chartDataItem['MS ' + count]);
        data.push(chartData);
      });
      return data;
    }

    let count = 4
    let series: any
    for (var i = 0; i < 3; i++) {
      let name = count + ' inch'
      series = chart.series.push(am5xy.LineSeries.new(root.current, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root.current, {
          pointerOrientation: "horizontal",
          labelText: name + ' - ' + "{percentValue} %"
        })
      }));

      count += 4

      let data = createChartDataArray(i + 1)

      series.data.setAll(data)

      series.appear();
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



// Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));
    cursor.lineY.set("visible", false);

// Add legend
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

    legend.data.setAll(chart.series.values);

    chart.appear(1000, 100);
  }
};