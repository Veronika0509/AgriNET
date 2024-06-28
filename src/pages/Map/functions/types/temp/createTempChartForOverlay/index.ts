import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

export const createTempChartForOverlay = (chartData: any, roots: any, tempOverlays: any) => {
  let root = am5.Root.new(chartData.id);
  roots.push(root);
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    background: am5.Rectangle.new(root, {
      fill: am5.color(0x96fd66),
      fillOpacity: 1,
    }),
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
  }));

  const lines = chartData.lines.length !== 0 ? chartData.lines : ["MS DU", "MS 1"]
  function createChartData(chartDate: any, chartDataValue: any) {
    return {
      date: chartDate,
      value: chartDataValue
    };
  }

  function createChartDataArray(lineName: string) {
    let data: any = [];
    chartData.data.map((chartDataItem: any) => {
      const chartDate = new Date(chartDataItem.DateTime).getTime()
      const chartData = createChartData(chartDate, chartDataItem[lineName]);
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
      count: 20
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

  let myColors = ["#0303fe", "#fe0303", "black", "black", "black", "black", "black"]
  if (chartData.line2Color) {
    myColors.unshift("#" + chartData.line2Color)
  }
  if (chartData.line1Color) {
    myColors.unshift("#" + chartData.line1Color)
  }
  let series: any
  lines.map((line: any, index: number) => {
    series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      stroke: am5.color(myColors[index]),
      tension: 0.5,
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      }),
    }));
    // Set data
    let data = createChartDataArray(line);
    series.data.setAll(data);
  })

  const chartBackground = chart.plotContainer.get("background");
  if (chartBackground !== undefined) {
    chartBackground.setAll({
      stroke: am5.color(0x000000),
      strokeOpacity: 1,
      fill: am5.color(chartData.bgColor),
      fillOpacity: 1,
    });
  }
  let labelContainer = am5.Container.new(root, {
    layout: root.horizontalLayout,
    width: am5.percent(100),
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    background: am5.Rectangle.new(root, {
      fill: am5.color(chartData.bgColor),
      stroke: am5.color(0x000000),
      strokeWidth: 1,
    })
  });
  let label = am5.Label.new(root, {
    text: chartData.chartValue,
    fontSize: 14,
    fontWeight: "400",
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  });

  labelContainer.children.push(label);
  chart.topAxesContainer.children.push(labelContainer);


  chart.zoomOutButton.set("forceHidden", true);

// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000);
  chart.appear(1000, 100);

  tempOverlays.map((overlay: any) => {
    if (overlay.layerName === 'SoilTemp') {
      if (overlay.chartData.mainId === chartData.mainId) {
        overlay.isTempMarkerChartDrawn = true
        overlay.update();
      }
    }
  })
}