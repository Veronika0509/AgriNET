import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {getOptions} from "../../../data/getOptions";
import {checkOverlay} from "../../checkOverlay";

export const createValveChartForOverlay = async (
  chartData: any,
  roots: am5.Root[],
  valveOverlays: any[]
): Promise<void> => {
  try {
    await checkOverlay(chartData.id, valveOverlays)

    // Check if element exists and is valid
    const container: any = document.getElementById(chartData.id);
    if (!container) {
      return;
    }


    if (!container.style.width) container.style.width = "42px";
    if (!container.style.height) container.style.height = "48px";

  // Check if this element already has a root using amCharts registry
  const existingRoots = am5.registry.rootElements;
  for (let i = 0; i < existingRoots.length; i++) {
    const existingRoot = existingRoots[i];
    if (existingRoot && existingRoot.dom && existingRoot.dom.id === chartData.id) {
      // Check if the root's DOM is still attached to the document
      if (document.body.contains(existingRoot.dom)) {

        // Update overlay state even if chart already exists
        valveOverlays.forEach((overlay: any) => {
          if (overlay.chartData.mainId === chartData.mainId) {
            overlay.isValveMarkerChartDrawn = true;
            overlay.update();
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
    root = am5.Root.new(chartData.id);
  } catch (error) {
    console.error(`Error creating root for ${chartData.id}:`, error);
    return;
  }

  roots.push(root);

  // Set themes
  root.setThemes([am5themes_Animated.new(root)]);
  // Create chart
  const chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      radius: am5.percent(95),
      innerRadius: 0,
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
  const axisRenderer = am5radar.AxisRendererCircular.new(root, {
    strokeOpacity: 1,
    strokeWidth: 0.1,
    minGridDistance: 10,
  });

  axisRenderer.labels.template.setAll({
    visible: false
  });

  // Customize grid lines
  axisRenderer.grid.template.setAll({
    visible: false,
  });

  axisRenderer.ticks.template.setAll({
    visible: true,
    inside: true,
    strokeOpacity: 1,
    length: 3,
    stroke: am5.color(0x888888),
    layer: 3
  })

  // Create axis
  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      max: 12,
      strictMinMax: true,
      renderer: axisRenderer,
    })
  );

  // Function to create a clock hand
  const createClockHand = (color: number, type: string) => {
    const hand = am5radar.ClockHand.new(root, {
      pinRadius: 0.1,
      radius: am5.percent(100),
      bottomWidth: 1,
      topWidth: 1,
      layer: type === 'main' ? 3 : 0
    });
    hand.hand.setAll({
      fill: am5.color(color),
    });
    return hand;
  };

  // Function to animate a clock hand
  const animateClockHand = (dataItem: any, minutes: number) => {
    dataItem.animate({
      key: "value",
      to: minutes / 60 > 12 ? (minutes / 60) - 12 : minutes / 60,
      duration: 500,
      easing: am5.ease.linear
    });
  };

  // Create and animate the main minute hand
  const minuteHand = createClockHand(0xcccccc, 'main');
  const minuteDataItem = xAxis.makeDataItem({});
  minuteDataItem.set("bullet", am5xy.AxisBullet.new(root, {
    sprite: minuteHand,
    location: 0.5,
  }));
  xAxis.createAxisRange(minuteDataItem);
  minuteDataItem.get("grid")?.set("visible", false);
  minuteDataItem.get("tick")?.set("visible", false);
  animateClockHand(minuteDataItem, chartData.nowMinutes);

  // Create and animate event hands
  if (chartData.events.length !== 0) {
    const options = await getOptions();
    chartData.events.forEach((event: any, _index: number) => {
      const colorValue = options.data[`valve-marker.colors.${event.status}`] || 0x962e40
      const color = typeof colorValue === 'string' ? parseInt(colorValue.replace('#', ''), 16) : colorValue
      const eventMinuteHand = createClockHand(color, 'event');
      const eventMinuteDataItem = xAxis.makeDataItem({});
      eventMinuteDataItem.set("bullet", am5xy.AxisBullet.new(root, {
        sprite: eventMinuteHand,
        location: 0.5,
      }));
      xAxis.createAxisRange(eventMinuteDataItem);
      eventMinuteDataItem.get("grid")?.set("visible", false);
      eventMinuteDataItem.get("tick")?.set("visible", false);
      if (event.duration !== 0) {
        const startValue = event.startMinutes / 60 > 12 ? (event.startMinutes / 60) - 12 : event.startMinutes / 60
        const endValue = startValue + event.duration / 60

        if (endValue > 12) {
          const rangeDataItem1 = xAxis.makeDataItem({
            value: startValue,
            endValue: 12,
          })
          const range1 = xAxis.createAxisRange(rangeDataItem1)
          rangeDataItem1.get("axisFill")?.setAll({
            fill: am5.color(color),
            fillOpacity: 1,
            layer: 2,
          })
          range1.get("tick")?.setAll({
            visible: false,
            opacity: 0,
          })

          const rangeDataItem2 = xAxis.makeDataItem({
            value: 0,
            endValue: endValue - 12,
          })
          const range2 = xAxis.createAxisRange(rangeDataItem2)
          rangeDataItem2.get("axisFill")?.setAll({
            fill: am5.color(color),
            fillOpacity: 1,
            layer: 2,
          })
          range2.get("tick")?.setAll({
            visible: false,
            opacity: 0,
          })
        } else {
          const rangeDataItem = xAxis.makeDataItem({
            value: startValue,
            endValue: endValue,
          })
          const range = xAxis.createAxisRange(rangeDataItem)
          rangeDataItem.get("axisFill")?.setAll({
            fill: am5.color(color),
            fillOpacity: 1,
            layer: 2,
          })
          range.get("tick")?.setAll({
            visible: false,
            opacity: 0,
          })
        }
      }
      animateClockHand(eventMinuteDataItem, event.startMinutes);
    });
  }

  // Make chart appear
  chart.appear(1000, 100);

  // Update overlays
  valveOverlays.forEach((overlay: any) => {
    if (overlay.chartData.mainId === chartData.mainId) {

      overlay.isValveMarkerChartDrawn = true;
      overlay.update();
    }
  });

  } catch (error) {
    console.error(`Error creating valve chart for ${chartData.id}:`, error)
    // Don't update overlay state on error so it can potentially retry
  }
};

