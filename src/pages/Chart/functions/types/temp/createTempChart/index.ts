import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createTempChart = (
  chartData: any,
  root: any,
  isMobile: boolean,
  additionalChartData: any,
  nwsForecastData: any,
  setTabularDataColors?: any
) => {
  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("tempChartDiv");

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
      paddingLeft: 0,
      paddingTop: 20,
      paddingRight: 0,
      paddingBottom: 0
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
    function createChartData(chartDate: any, chartValue: number) {
      return {
        date: chartDate,
        value: chartValue,
      };
    }

    function createChartDataArray(lineLabel: string) {
      let data: any = [];
      const dataArray = lineLabel === 'forecastTemp' ? nwsForecastData.data : chartData
      dataArray.map((chartDataItem: any) => {
        const chartDate = lineLabel === 'forecastTemp' ? new Date(chartDataItem.time).getTime() : new Date(chartDataItem.DateTime).getTime()
        const chartData = createChartData(chartDate, chartDataItem[lineLabel]);
        data.push(chartData);
      });
      return data;
    }

    const metricSign = additionalChartData.metric === 'AMERICA' ? '°F' : '°C'

    let dataLabels = [
      {label: 'MS 1', name: 'Temperature', tooltip: 'Temp', metric: metricSign},
      {label: 'MS DU', name: 'Dew Point', tooltip: 'Dew Point', metric: metricSign},
      {label: 'MS 3', name: 'Relative Humidity', tooltip: 'RH', metric: '%'},
      {label: 'leafWetness', name: 'Leaf Wetness', tooltip: 'Leaf Wetness', metric: '%'},
      {label: 'analog1', name: 'Analog 1', tooltip: 'Analog 1', metric: ''},
      {label: 'analog2', name: 'Analog 2', tooltip: 'Analog 2', metric: ''},
      {label: 'psi', name: 'PSI', tooltip: 'PSI', metric: ''},
      {label: 'waterTemp', name: 'Water Temperature', tooltip: 'Water Temp', metric: "°F"}
    ]

    if (nwsForecastData) {
      dataLabels.push({label: 'forecastTemp', name: 'Forecast Temp', tooltip: 'Forecast Temp', metric: metricSign})
    }

    let series: any
    let seriesColors: any = []
    dataLabels.map((dataLabel) => {
      series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
        name: dataLabel.name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tension: 0.5,
        tooltip: am5.Tooltip.new(root.current, {
          pointerOrientation: "horizontal",
          labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + dataLabel.tooltip + ' - ' + "{value}" + dataLabel.metric
        }),
        snapTooltip: true,
      }));

      let data = createChartDataArray(dataLabel.label)
      series.data.setAll(data)

      seriesColors.push(series.get('stroke'))

      series.appear();
    })

    if (setTabularDataColors) {
      setTabularDataColors(seriesColors)
    }

// Nws Forecast
    if (nwsForecastData) {
      let seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime()
      });
      series.createAxisRange(seriesRangeDataItem);
      seriesRangeDataItem.get("grid").setAll({
        visible: true,
        stroke: am5.color(0xd445d2),
        strokeWidth: 5,
        strokeOpacity: 1,
        strokeDasharray: [2, 2]
      });
      seriesRangeDataItem.get('label').setAll({
        text: "NOW",
        inside: true,
        visible: true,
        centerX: 0,
        dy: 45,
        fontSize: 13
      })

      let seriesRangeDataItemDate = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime(),
        endValue: new Date(nwsForecastData.now).getTime() + 86400000 * 6
      });
      series.createAxisRange(seriesRangeDataItemDate);
      seriesRangeDataItemDate.get("axisFill").setAll({
        fill: am5.color(0xF7C815),
        fillOpacity: 0.1,
        visible: true
      });

      seriesRangeDataItem.get("grid").toFront();
      seriesRangeDataItem.get("label").toFront();
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

// Add legend
    let legend = chart.children.push(am5.Legend.new(root.current, {
      width: 230,
      paddingLeft: 15,
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
}