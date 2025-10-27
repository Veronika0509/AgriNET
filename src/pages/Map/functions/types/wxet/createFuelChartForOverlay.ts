import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {checkOverlay} from "../../checkOverlay";

interface FuelChartDataItem {
  time: string;
  value: string | number;
  [key: string]: unknown;
}

interface FuelChartData {
  id: string | number;
  mainId: string | number;
  data: {
    data: FuelChartDataItem[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface FuelOverlay {
  layerName: string;
  chartData: {
    mainId: string | number;
    [key: string]: unknown;
  };
  isFuelMarkerChartDrawn?: boolean;
  update: () => void;
  [key: string]: unknown;
}

interface ChartDataPoint {
  date: number;
  value: number;
}

export const createFuelChartForOverlay = async (chartData: FuelChartData, roots: am5.Root[], fuelOverlays: FuelOverlay[]) => {
  await checkOverlay(chartData.id, fuelOverlays)
  const root = am5.Root.new(chartData.id)
  roots.push(root);
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    background: am5.Rectangle.new(root, {
      fill: am5.color(0xffffff),
      fillOpacity: 0.8,
    }),
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
  }));

  function createChartDataArray(): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    chartData.data.data.map((chartDataItem: FuelChartDataItem) => {
      const chartDate = new Date(chartDataItem.time).getTime()
      const chartDataPoint: ChartDataPoint = {
        date: chartDate,
        value: Number(chartDataItem.value)
      };
      data.push(chartDataPoint);
    });
    return data;
  }

// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
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
  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {
      pan: "zoom"
    })
  }));
  yAxis.set('visible', false)
  xAxis.set('visible', false)

// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/

  const series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
    name: "Series",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    valueXField: "date",
    stroke: am5.color(0x28B2F7),
    tension: 0.5,
    tooltip: am5.Tooltip.new(root, {
      labelText: "{valueY}"
    }),
  }));
  series.strokes.template.setAll({
    strokeWidth: 2,
  });
  // Set data
  const data = createChartDataArray();
  series.data.setAll(data);

  chart.zoomOutButton.set("forceHidden", true);

// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000);
  chart.appear(1000, 100);

  fuelOverlays.map((overlay: FuelOverlay) => {
    if (overlay.chartData.mainId === chartData.mainId) {

      overlay.isFuelMarkerChartDrawn = true
      overlay.update();
    }
  })
}