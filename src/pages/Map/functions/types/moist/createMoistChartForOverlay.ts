import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {checkOverlay} from "../../checkOverlay";

interface ChartDataItem {
  DateTime: string;
  SumAve: number;
  [key: string]: unknown;
}

interface BudgetLine {
  value: number;
  [key: string]: unknown;
}

interface MoistChartData {
  id: string | number;
  mainId: string | number;
  data: ChartDataItem[];
  budgetLines: BudgetLine[];
  [key: string]: unknown;
}

interface MoistOverlay {
  layerName: string;
  chartData: {
    mainId: string | number;
    id: string | number;
    [key: string]: unknown;
  };
  isMoistMarkerChartDrawn?: boolean;
  update: () => void;
  [key: string]: unknown;
}

interface ChartDataPoint {
  date: number;
  value: number;
}

export const createMoistChartForOverlay = async (type: string, chartData: MoistChartData, roots: am5.Root[], moistOverlays: MoistOverlay[]) => {
  const chartId = `${type}-${chartData.id}`

  try {
    await checkOverlay(chartId, moistOverlays);

    // Check if element exists and is valid
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Chart element with id ${chartId} not found after waiting. Cannot create chart.`);
      return;
    }


  // Check if this element already has a root using amCharts registry
  // This prevents the "multiple Roots on the same DOM node" error
  const existingRoots = am5.registry.rootElements;
  for (let i = 0; i < existingRoots.length; i++) {
    const existingRoot = existingRoots[i];
    if (existingRoot && existingRoot.dom && existingRoot.dom.id === chartId) {
      // Check if the root's DOM is still attached to the document
      if (document.body.contains(existingRoot.dom)) {

        // Update overlay state even if chart already exists
        moistOverlays.map((overlay: MoistOverlay) => {
          if (type === 'm') {
            if (overlay.chartData.mainId === chartData.mainId) {
              overlay.isMoistMarkerChartDrawn = true
              overlay.update();
            }
          } else {
            if (overlay.chartData.id === chartData.id) {
              overlay.isMoistMarkerChartDrawn = true
              overlay.update();
            }
          }
        });

        return;
      } else {
        // Root exists but DOM is detached, dispose it and create a new one
        existingRoot.dispose();
        break;
      }
    }
  }

  let root: am5.Root;
  try {
    root = am5.Root.new(chartId);
  } catch (error) {
    console.error(`Error creating root for ${chartId}:`, error);
    return;
  }

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

// Generate data
  function createChartData(chartDate: number, chartDataValue: number): ChartDataPoint {
    return {
      date: chartDate,
      value: chartDataValue
    };
  }

  function createChartDataArray(): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    chartData.data.map((chartDataItem: ChartDataItem) => {
      const chartDate = new Date(chartDataItem.DateTime).getTime()
      const chartDataPoint = createChartData(chartDate, chartDataItem.SumAve);
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
    renderer: am5xy.AxisRendererX.new(root, {}),
    tooltip: am5.Tooltip.new(root, {})
  }));

  const maximum = chartData.budgetLines[0].value > 0 ? chartData.budgetLines[0].value : undefined
  const minimum = chartData.budgetLines[5].value > 0 ? chartData.budgetLines[5].value : undefined
  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    min: minimum,
    max: maximum,
    strictMinMax: true,
    renderer: am5xy.AxisRendererY.new(root, {
      pan: "zoom",
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
    tension: 0.5,
    stroke: am5.color(0x000000),
  }));

  const plotContainerBackground = chart.plotContainer.get("background");
  if (plotContainerBackground !== undefined) {
    plotContainerBackground.setAll({
      fill: am5.color(0x08f908),
      fillOpacity: 1
    });
  }

// Regions
  const topBudgetRegion = yAxis.makeDataItem({
    value: chartData.budgetLines[1].value,
    endValue: 100
  });
  series.createAxisRange(topBudgetRegion);
  topBudgetRegion.get("axisFill").setAll({
    fill: am5.color(0x02c5fd),
    fillOpacity: 1,
    visible: true
  });

  const bottomBudgetRegion = yAxis.makeDataItem({
    value: chartData.budgetLines[4].value,
    endValue: -100
  });
  series.createAxisRange(bottomBudgetRegion);
  bottomBudgetRegion.get("axisFill").setAll({
    fill: am5.color(0xf6363b),
    fillOpacity: 1,
    visible: true
  });

  chart.zoomOutButton.set("forceHidden", true);

// Set data
  const data = createChartDataArray();
  series.data.setAll(data);

// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000);
  chart.appear(1000, 100);


  moistOverlays.map((overlay: MoistOverlay) => {
    if (type === 'm') {
      if (overlay.chartData.mainId === chartData.mainId) {
        overlay.isMoistMarkerChartDrawn = true
        overlay.update();
      }
    } else {
      if (overlay.chartData.id === chartData.id) {
        overlay.isMoistMarkerChartDrawn = true
        overlay.update();
      }
    }
  })

  } catch (error) {
    console.error(`Error creating moist chart for ${chartId}:`, error)
    // Don't update overlay state on error so it can potentially retry
  }
}