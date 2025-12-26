import {getMoistMarkerChartData} from "../../Map/data/types/moist/getMoistMarkerChartData";
import type {Dispatch, SetStateAction} from 'react';

interface MoistOverlay {
  setMap: (map: google.maps.Map | null) => void;
  update: (sensorId: string) => void;
  dispose?: () => void;
}

export const updateChart = async (
  sensorId: string,
  userId: number,
  moistOverlays: MoistOverlay[],
  setMoistOverlays: Dispatch<SetStateAction<MoistOverlay[]>>,
  moistOverlaysRef: React.MutableRefObject<MoistOverlay[]>
) => {
  const overlayChartData = await getMoistMarkerChartData(sensorId, userId);
  const updatedOverlays = moistOverlays.map((overlay: any) => {
    if (overlay.chartData?.sensorId === sensorId) {
      overlay.chartData.data = overlayChartData.data.data;
      overlay.chartData.budgetLines = overlayChartData.data.budgetLines;
      overlay.toUpdate = true
    } else {
      overlay.toUpdate = false
    }
    return overlay;
  });

  moistOverlaysRef.current = moistOverlaysRef.current.map((overlay: any) => {
    if (overlay.chartData?.sensorId === sensorId) {
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