import * as am5 from "@amcharts/amcharts5";
import * as am5radar from "@amcharts/amcharts5/radar";

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
  roots: any,
  valveOverlays: any
) => {
  await checkOverlay(chartData.id, valveOverlays);

  // Create root element
  const root = am5.Root.new(chartData.id);
  
  // Set themes
  root.setThemes([am5.Theme.new(root)]);

  // Create chart
  const chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      startAngle: 180,
      endAngle: 540
    })
  );

  // Create axis
  const axisRenderer = am5radar.AxisRendererCircular.new(root, {
    minGridDistance: 20
  });

  axisRenderer.grid.template.set("visible", false);

  const xAxis = chart.xAxes.push(
    am5radar.AxisRendererCircular.new(root, {
      min: 0,
      max: 12,
      strictMinMax: true
    })
  );

  // Remove labels
  xAxis.get("renderer").labels.template.set("visible", false);

  // Add clock face ticks
  for (let hour = 0; hour < 12; hour++) {
    const isMainTick = hour % 3 === 0;
    chart.plotContainer.children.push(am5.Line.new(root, {
      rotation: hour * 30,
      stroke: am5.color(0x000000),
      strokeWidth: isMainTick ? 3 : 1,
      height: isMainTick ? 15 : 10,
      x1: isMainTick ? 75 : 80,
      x2: 100,
      centerX: am5.p50,
      centerY: am5.p50
    }));
  }

  // Add hands
  let hourHand = chart.plotContainer.children.push(am5.Line.new(root, {
    stroke: am5.color(0x000000),
    strokeWidth: 3,
    height: 60,
    centerX: am5.p50,
    centerY: am5.p50
  }));

  let minuteHand = chart.plotContainer.children.push(am5.Line.new(root, {
    stroke: am5.color(0x000000),
    strokeWidth: 2,
    height: 80,
    centerX: am5.p50,
    centerY: am5.p50
  }));

  let secondHand = chart.plotContainer.children.push(am5.Line.new(root, {
    stroke: am5.color(0xFF0000),
    strokeWidth: 1,
    height: 90,
    centerX: am5.p50,
    centerY: am5.p50
  }));

  // Update hands
  const updateHands = () => {
    const date = new Date();
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    hourHand.set("rotation", hours * 30 + minutes / 2);
    minuteHand.set("rotation", minutes * 6);
    secondHand.set("rotation", seconds * 6);
  };

  // Initial update
  updateHands();

  // Update every second
  const interval = setInterval(updateHands, 1000);

  // Cleanup on dispose
  root.addEventListener("disposed", () => {
    clearInterval(interval);
  });

  roots[chartData.id] = root;

  valveOverlays.forEach((overlay: any) => {
    if (overlay.layerName === 'Valve' && overlay.chartData.mainId === chartData.mainId) {
      overlay.isValveMarkerChartDrawn = true;
      overlay.update();
    }
  });
};
