import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const checkOverlay = async (id: string, valveOverlays: any[]): Promise<void> => {
  const element = document.getElementById(id);
  if (!element) {
    const overlay = valveOverlays.find(valveOverlay => valveOverlay.chartData.id === id);
    if (overlay) {
      console.log('gonna update overlay', id);
      await overlay.update();
    }
  }
};

export const createValveChartForOverlay = async (
  chartData: any,
  roots: am5.Root[],
  valveOverlays: any[]
): Promise<void> => {
  await checkOverlay(chartData.id, valveOverlays);

  const container: any = document.getElementById(chartData.id);
  if (!container.style.width) container.style.width = "42px";
  if (!container.style.height) container.style.height = "48px";
  let root = am5.Root.new(chartData.id);
  roots.push(root);

  // Set themes
  root.setThemes([am5themes_Animated.new(root)]);

  // Create chart
  let chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      radius: am5.percent(95),
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 2,
      paddingRight: 0,
      background: am5.Circle.new(root, {
        fill: am5.color(0x666666),
        fillOpacity: 1,
        dx: 22,
        dy: 24,
        scale: 1.9
      })
    })
  );

  // Create axis renderer
  let axisRenderer = am5radar.AxisRendererCircular.new(root, {
    innerRadius: am5.percent(90),
    strokeOpacity: 1,
    strokeWidth: 0.1,
    minGridDistance: 10
  });

  axisRenderer.labels.template.setAll({
    visible: false
  });

  // Customize grid lines
  axisRenderer.grid.template.setAll({
    visible: true,
    strokeOpacity: 1,
    stroke: am5.color(0xcccccc)
  });

  // Create axis
  let xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      max: 12,
      strictMinMax: true,
      renderer: axisRenderer,
    })
  );

  // Minute hand
  let minuteHand = am5radar.ClockHand.new(root, {
    pinRadius: 0.1,
    radius: am5.percent(100),
    bottomWidth: 1,
    topWidth: 1
  });
  minuteHand.hand.setAll({
    fill: am5.color(0xcccccc)
  });

  let minuteDataItem = xAxis.makeDataItem({});
  minuteDataItem.set("bullet", am5xy.AxisBullet.new(root, {
    sprite: minuteHand
  }));
  xAxis.createAxisRange(minuteDataItem);
  const minutes = chartData.nowMinutes / 60 > 12 ? (chartData.nowMinutes / 60) - 12 : chartData.nowMinutes / 60
  console.log(minutes)
  minuteDataItem.animate({
    key: "value",
    to: minutes,
    duration: 500,
    easing: am5.ease.linear
  });

  // Make chart appear
  chart.appear(1000, 100);

  // Update overlays
  valveOverlays.forEach((overlay: any) => {
    if (overlay.layerName === 'Valve' && overlay.chartData.mainId === chartData.mainId) {
      overlay.isValveMarkerChartDrawn = true;
      overlay.update();
    }
  });
};

