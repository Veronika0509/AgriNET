import {getMoistMarkerChartData} from "../../Map/data/types/moist/getMoistMarkerChartData";

export const updateChart = async (sensorId: any, userId: any, moistOverlays: any, setMoistOverlays: any, moistOverlaysRef: any) => {
  const overlayChartData = await getMoistMarkerChartData(sensorId, userId);
  const updatedOverlays = moistOverlays.map((overlay: any) => {
    if (overlay.chartData.sensorId === sensorId) {
      overlay.chartData.data = overlayChartData.data.data;
      overlay.chartData.budgetLines = overlayChartData.data.budgetLines;
      overlay.toUpdate = true
    } else {
      overlay.toUpdate = false
    }
    return overlay;
  });

  moistOverlaysRef.current = moistOverlaysRef.current.map((overlay: any) => {
    if (overlay.chartData.sensorId === sensorId) {
      overlay.chartData.data = overlayChartData.data.data;
      overlay.chartData.budgetLines = overlayChartData.data.budgetLines;
      overlay.toUpdate = true
    } else {
      overlay.toUpdate = false
    }
    return overlay;
  });

  setMoistOverlays([...updatedOverlays]);
}