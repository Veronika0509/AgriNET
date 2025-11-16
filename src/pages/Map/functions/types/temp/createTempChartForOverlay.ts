import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {checkOverlay} from "../../checkOverlay";

// Интерфейсы для типизации
interface ChartDataItem {
  DateTime: string;
  [key: string]: unknown;
}

interface TempChartData {
  id: string;
  lines: string[];
  data: ChartDataItem[];
  bgColor: string;
  chartValue: string;
  line1Color?: string;
  line2Color?: string;
  mainId: string | number;
}

interface TempOverlay {
  prefix: string;
  layerName: string;
  chartData: {
    id: string | number;
    mainId: string | number;
  };
  isTempMarkerChartDrawn: boolean;
  update: () => Promise<void>;
}

interface ChartDataPoint {
  date: number;
  value: unknown;
}
export const createTempChartForOverlay = async (
  chartData: TempChartData,
  roots: am5.Root[],
  tempOverlays: TempOverlay[]
): Promise<void> => {
  await checkOverlay(chartData.id, tempOverlays)

  // Check if element exists and is valid
  const chartElement = document.getElementById(chartData.id);
  if (!chartElement) {
    console.warn(`Chart element with id ${chartData.id} not found`);
    return;
  }

  // Check if this element already has a root using amCharts registry
  const existingRoots = am5.registry.rootElements;
  for (let i = 0; i < existingRoots.length; i++) {
    const existingRoot = existingRoots[i];
    if (existingRoot && existingRoot.dom && existingRoot.dom.id === chartData.id) {
      console.log(`Root already exists for ${chartData.id}, skipping creation`);
      return;
    }
  }

  let root: am5.Root;
  try {
    root = am5.Root.new(chartData.id);
  } catch (error) {
    console.error(`Error creating root for ${chartData.id}:`, error);
    return;
  }

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

  function createChartData(chartDate: number, chartDataValue: unknown): ChartDataPoint {
    return {
      date: chartDate,
      value: chartDataValue
    };
  }

  function createChartDataArray(lineName: string) {
    const data: ChartDataPoint[] = [];
    chartData.data.map((chartDataItem: ChartDataItem) => {
      const chartDate = new Date(chartDataItem.DateTime).getTime()
      const chartData = createChartData(chartDate, chartDataItem[lineName]);
      data.push(chartData);
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

  const myColors = ["#0303fe", "#fe0303", "black", "black", "black", "black", "black"]
  if (chartData.line2Color) {
    myColors.unshift("#" + chartData.line2Color)
  }
  if (chartData.line1Color) {
    myColors.unshift("#" + chartData.line1Color)
  }
  let series: am5xy.SmoothedXLineSeries | undefined
  lines.map((line: string, index: number) => {
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
    const data = createChartDataArray(line);
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
  const labelContainer = am5.Container.new(root, {
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
  const label = am5.Label.new(root, {
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
  if (series) {
    series.appear(1000);
  }
  chart.appear(1000, 100);

  tempOverlays.map((overlay: TempOverlay) => {
    if (overlay.chartData.mainId === chartData.mainId) {

      overlay.isTempMarkerChartDrawn = true
      overlay.update();
    }
  })
}