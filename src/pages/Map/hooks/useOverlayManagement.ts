import { useState } from 'react';
import type { OverlayItem } from '../types/OverlayItem';


export const useOverlayManagement = () => {
  // Moist overlays
  const [moistOverlays, setMoistOverlays] = useState<OverlayItem[]>([]);
  const [activeOverlays, setActiveOverlays] = useState<OverlayItem[]>([]);
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState<unknown[]>([]);
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<unknown[]>([]);
  const moistId = { id: 0 };

  // Temp overlays
  const [tempOverlays, setTempOverlays] = useState<OverlayItem[]>([]);
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState<unknown[]>([]);
  const [tempChartDataContainer, setTempChartDataContainer] = useState<unknown[]>([]);
  const tempId = { id: 0 };

  // Wxet overlays
  const [wxetOverlays, setWxetOverlays] = useState<OverlayItem[]>([]);
  const [invalidWxetChartDataContainer, setInvalidWxetChartDataContainer] = useState<unknown[]>([]);
  const [wxetChartDataContainer, setWxetChartDataContainer] = useState<unknown[]>([]);
  const wxetId = { id: 0 };

  // Valve overlays
  const [valveOverlays, setValveOverlays] = useState<OverlayItem[]>([]);
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState<unknown[]>([]);
  const [valveChartDataContainer, setValveChartDataContainer] = useState<unknown[]>([]);
  const valveId = { id: 0 };

  // Extl overlays
  const [extlOverlays, setExtlOverlays] = useState<OverlayItem[]>([]);
  const [invalidExtlChartDataContainer, setInvalidExtlChartDataContainer] = useState<unknown[]>([]);
  const [extlChartDataContainer, setExtlChartDataContainer] = useState<unknown[]>([]);
  const extlId = { id: 0 };

  // Charts amounts (for marker creation)
  const [moistChartsAmount, setMoistChartsAmount] = useState<unknown[]>([]);
  const [tempChartsAmount, setTempChartsAmount] = useState<unknown[]>([]);
  const [wxetChartsAmount, setWxetChartsAmount] = useState<unknown[]>([]);
  const [valveChartsAmount, setValveChartsAmount] = useState<unknown[]>([]);
  const [extlChartsAmount, setExtlChartsAmount] = useState<unknown[]>([]);

  const clearAllOverlays = () => {
    moistOverlays.forEach(overlay => overlay.setMap(null));
    tempOverlays.forEach(overlay => overlay.setMap(null));
    wxetOverlays.forEach(overlay => overlay.setMap(null));
    valveOverlays.forEach(overlay => overlay.setMap(null));
    extlOverlays.forEach(overlay => overlay.setMap(null));
    
    setMoistOverlays([]);
    setTempOverlays([]);
    setWxetOverlays([]);
    setValveOverlays([]);
    setExtlOverlays([]);
    setActiveOverlays([]);
  };

  return {
    // Moist
    moistOverlays,
    setMoistOverlays,
    invalidMoistChartDataContainer,
    setInvalidMoistChartDataContainer,
    moistChartDataContainer,
    setMoistChartDataContainer,
    moistId,
    moistChartsAmount,
    setMoistChartsAmount,
    
    // Temp
    tempOverlays,
    setTempOverlays,
    invalidTempChartDataContainer,
    setInvalidTempChartDataContainer,
    tempChartDataContainer,
    setTempChartDataContainer,
    tempId,
    tempChartsAmount,
    setTempChartsAmount,
    
    // Wxet
    wxetOverlays,
    setWxetOverlays,
    invalidWxetChartDataContainer,
    setInvalidWxetChartDataContainer,
    wxetChartDataContainer,
    setWxetChartDataContainer,
    wxetId,
    wxetChartsAmount,
    setWxetChartsAmount,
    
    // Valve
    valveOverlays,
    setValveOverlays,
    invalidValveChartDataContainer,
    setInvalidValveChartDataContainer,
    valveChartDataContainer,
    setValveChartDataContainer,
    valveId,
    valveChartsAmount,
    setValveChartsAmount,
    
    // Extl
    extlOverlays,
    setExtlOverlays,
    invalidExtlChartDataContainer,
    setInvalidExtlChartDataContainer,
    extlChartDataContainer,
    setExtlChartDataContainer,
    extlId,
    extlChartsAmount,
    setExtlChartsAmount,
    
    // Active overlays
    activeOverlays,
    setActiveOverlays,
    
    // Utility
    clearAllOverlays
  };
};
