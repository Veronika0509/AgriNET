import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createMoistChartForOverlay = (chartData: any, roots: any, moistOverlays: any) => {
  let root = am5.Root.new(chartData.id.toString());
  roots.push(root);
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
  }));

// Generate random date
  function createChartData(chartDate: any, chartDataValue: any) {
    return {
      date: chartDate,
      value: chartDataValue
    };
  }

  function createChartDataArray() {
    let data: any = [];
    chartData.data.map((chartDataItem: any) => {
      const chartDate = new Date(chartDataItem.DateTime).getTime()
      const chartData = createChartData(chartDate, chartDataItem.SumAve);
      data.push(chartData);
    });
    return data;
  }

// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
    maxDeviation: 0.2,
    baseInterval: {
      timeUnit: "minute",
      count: 30
    },
    renderer: am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true
    }),
    tooltip: am5.Tooltip.new(root, {})
  }));
  let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {
      pan: "zoom"
    })
  }));
  yAxis.set('visible', false)
  xAxis.set('visible', false)

// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  let series = chart.series.push(am5xy.LineSeries.new(root, {
    name: "Series",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    valueXField: "date",
    stroke: am5.color(0x000000),
    tooltip: am5.Tooltip.new(root, {
      labelText: "{valueY}"
    }),
  }));

  const plotContainerBackground = chart.plotContainer.get("background");
  if (plotContainerBackground !== undefined) {
    plotContainerBackground.setAll({
      fill: am5.color(0x08f908),
      fillOpacity: 1
    });
  }
  chart.topAxesContainer.children.push(am5.Rectangle.new(root, {
    stroke: am5.color(0xCCCC00),
    strokeOpacity: 1,
    fill: am5.color(0x02c5fd),
    fillOpacity: 1,
    width: am5.percent(100),
    height: chartData.topBudgetLine,
  }));
  chart.bottomAxesContainer.children.push(am5.Rectangle.new(root, {
    stroke: am5.color(0xCCCC00),
    strokeOpacity: 1,
    fill: am5.color(0xf6363b),
    fillOpacity: 1,
    width: am5.percent(100),
    height: chartData.bottomBudgetLine,
  }));

  chart.zoomOutButton.set("forceHidden", true);

// Set data
  let data = createChartDataArray();
  series.data.setAll(data);

// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000);
  chart.appear(1000, 100);

  moistOverlays.map((overlay: any) => {
    if (overlay.layerName === 'Moist') {
      if (overlay.chartData.mainId === chartData.mainId) {
        overlay.isMoistMarkerChartDrawn = true
        overlay.update();
      }
    }
  })
}