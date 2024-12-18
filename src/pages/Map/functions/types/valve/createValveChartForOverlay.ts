import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const checkOverlay = async (id: string, valveOverlays: any[]): Promise<void> => {
  const element = document.getElementById(id);
  if (!element) {
    const overlay = valveOverlays.find(valveOverlay => valveOverlay.chartData.id === id);
    if (overlay) {
      console.log('gonna update overlay', id)
      await overlay.update();
    }
  }
}

export const createValveChartForOverlay = async (
  chartData: any,
  roots: any,
  valveOverlays: any
) => {
  await checkOverlay(chartData.id, valveOverlays);

  const root: any = am5.Root.new(chartData.id);

  // Clock

  roots[chartData.id] = root;

  valveOverlays.forEach((overlay: any) => {
    if (overlay.layerName === 'Valve' && overlay.chartData.mainId === chartData.mainId) {
      overlay.isValveMarkerChartDrawn = true;
      overlay.update();
    }
  });
}