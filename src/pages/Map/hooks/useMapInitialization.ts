import { useState, useEffect, useRef } from 'react';
import { getSiteList } from '../data/getSiteList';
import { createMap } from '../functions/createMap';
import { createSites } from '../functions/createSites';
import type { Site } from '../../../types';

interface LayerListLayer {
  name: string;
  markers: Array<{
    chartData: {
      sensorId: string | number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface SiteWithLayers extends Site {
  layers?: LayerListLayer[];
}

type Marker = {
  position: google.maps.LatLngLiteral;
  id: string | number;
  type: string;
  [key: string]: unknown;
};

interface UseMapInitializationProps {
  page: number;
  activeTab: string;
  userId: number;
  setSiteList: (sites: Site[]) => void;
  markers: Marker[];
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>;
  allCoordinatesOfMarkers: Array<{ lat: number; lng: number }>;
  setCoordinatesForFitting: (coords: Array<{ lat: number; lng: number }>) => void;
  setSecondMap: (map: google.maps.Map | null) => void;
  moistChartsAmount: unknown[];
  setInvalidMoistChartDataContainer: (data: unknown[]) => void;
  setMoistChartDataContainer: (data: unknown[]) => void;
  moistId: { id: number };
  tempChartsAmount: unknown[];
  setInvalidTempChartDataContainer: (data: unknown[]) => void;
  setTempChartDataContainer: (data: unknown[]) => void;
  tempId: { id: number };
  wxetChartsAmount: unknown[];
  setInvalidWxetChartDataContainer: (data: unknown[]) => void;
  setWxetChartDataContainer: (data: unknown[]) => void;
  wxetId: { id: number };
  valveChartsAmount: unknown[];
  setInvalidValveChartDataContainer: (data: unknown[]) => void;
  setValveChartDataContainer: (data: unknown[]) => void;
  valveId: { id: number };
  extlChartsAmount: unknown[];
  setInvalidExtlChartDataContainer: (data: unknown[]) => void;
  setExtlChartDataContainer: (data: unknown[]) => void;
  extlId: { id: number };
  presentToast: (message: string, color: string) => void;
}

export const useMapInitialization = (props: UseMapInitializationProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [siteList, setSiteListLocal] = useState<Site[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize map and fetch sites
  useEffect(() => {
    const initializeMap = async () => {
      if (props.page === 1 && props.activeTab === 'map' && !mapInitialized) {
        const sites = await getSiteList(props.userId);

        // Check if API call failed
        if ('success' in sites && sites.success === false) {
          console.error('Failed to load sites:', sites.error);
          props.presentToast(sites.error, 'danger');
          // Set empty array to prevent crashes
          props.setSiteList([]);
          setSiteListLocal([]);
          return; // Exit early
        }

        // API call successful
        props.setSiteList(sites.data);
        setSiteListLocal(sites.data);

        // Wait for mapRef to be available before creating map
        if (mapRef.current) {
          createMap(map, setMap, mapRef);
          setMapInitialized(true);
        } else {
          // If mapRef is not available yet, retry after a short delay
          setTimeout(() => {
            if (mapRef.current && !map) {
              createMap(map, setMap, mapRef);
              setMapInitialized(true);
            }
          }, 100);
        }
      }
    };

    initializeMap();
  }, [props.page, props.activeTab, mapInitialized]);

  // Create sites when map is ready
  useEffect(() => {
    if (map && siteList.length > 0 && props.page === 1) {
      const sitesAsSensorsGroupData = siteList.map((site: SiteWithLayers) => ({
        lat: site.lat,
        lng: site.lng,
        name: site.name,
        layers: site.layers || []
      }));

      createSites({
        page: props.page,
        map,
        siteList: sitesAsSensorsGroupData,
        markers: props.markers,
        setMarkers: props.setMarkers,
        userId: props.userId,
        allCoordinatesOfMarkers: props.allCoordinatesOfMarkers,
        setCoordinatesForFitting: props.setCoordinatesForFitting,
        setSecondMap: props.setSecondMap,
        moistChartsAmount: props.moistChartsAmount,
        setInvalidMoistChartDataContainer: props.setInvalidMoistChartDataContainer,
        setMoistChartDataContainer: props.setMoistChartDataContainer,
        moistId: props.moistId,
        tempChartsAmount: props.tempChartsAmount,
        setInvalidTempChartDataContainer: props.setInvalidTempChartDataContainer,
        setTempChartDataContainer: props.setTempChartDataContainer,
        tempId: props.tempId,
        wxetChartsAmount: props.wxetChartsAmount,
        setInvalidWxetChartDataContainer: props.setInvalidWxetChartDataContainer,
        setWxetChartDataContainer: props.setWxetChartDataContainer,
        wxetId: props.wxetId,
        valveChartsAmount: props.valveChartsAmount,
        setInvalidValveChartDataContainer: props.setInvalidValveChartDataContainer,
        setValveChartDataContainer: props.setValveChartDataContainer,
        valveId: props.valveId,
        extlChartsAmount: props.extlChartsAmount,
        setInvalidExtlChartDataContainer: props.setInvalidExtlChartDataContainer,
        setExtlChartDataContainer: props.setExtlChartDataContainer,
        extlId: props.extlId,
        mapRefFunc
      });
    }
  }, [map, siteList]);

  return { map, setMap, mapRef, mapInitialized };
};
