import React, { useMemo, useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/react';
import {arrowBackOutline} from 'ionicons/icons';
import { useAppContext } from '../../context/AppContext';
import axios from 'axios';
import { MoistTable } from '../Chart/components/TabularData/components/types/moist/MoistTable';
import { TempTable } from '../Chart/components/TabularData/components/types/temp/TempTable';
import { WxetTable } from '../Chart/components/TabularData/components/types/wxet/WxetTable';

import {getSensorItems} from "../Map/data/getSensorItems";

interface DataListPageProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any[];
}

interface TabularDataItem {
  sensorId: string;
  label: string;
  data: Record<string, any>[];
  metric: string;
  freshness: string;
  sensorCount: number | null;
  moistureLegend: {
    id: number;
    name: string;
    s1?: string;
    s2?: string;
    s3?: string;
    s4?: string;
    s5?: string;
    s6?: string;
  } | null;
}

const implementedMapTypes = new Set(['moist', 'soiltemp', 'wxet', 'fuel']);

const freshnessColors: Record<string, string> = {
  'undefined': '#8BF972FF',
  '30m': '#8BF972FF',
  '6h': '#8BF972FF',
  '3h': '#FFFF00FF',
  '13h': '#FFFF00FF',
  '3d': '#808080FF',
  'outdated': '#000000FF'
};

const STORAGE_KEY = 'dataList_selectedTypes';

const DataListPage: React.FC<DataListPageProps> = ({ setPage, siteList }) => {
  const { userId } = useAppContext();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [tabularData, setTabularData] = useState<TabularDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth < 750);
  const [isWxetMobile] = useState(window.innerWidth < 425);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const sensorTypes = useMemo(() => {
    const typesMap = new Map<string, string>();
    console.log(siteList)
    siteList.forEach((site: any) => {
      if (site.layers && Array.isArray(site.layers)) {
        site.layers.forEach((layer: any) => {
          if (layer.name) {
            const lowerName = layer.name.toLowerCase();
            const existingName = typesMap.get(lowerName);
            if (!existingName || layer.name[0] === layer.name[0].toUpperCase()) {
              typesMap.set(lowerName, layer.name);
            }
          }
        });
      }
    });
    return Array.from(typesMap.values())
      .filter(name => implementedMapTypes.has(name.toLowerCase()))
      .sort();
  }, [siteList]);

  const getDisplayName = (type: string) => {
    const displayNames: Record<string, string> = {
      'Moist': 'Soil Moisture',
      'moist': 'Soil Moisture',
      'SoilTemp': 'Temp RH',
      'soiltemp': 'Temp RH',
      'WXET': 'Weather Station',
      'wxet': 'Weather Station',
    };
    return displayNames[type] || type;
  };

  const fetchAllTypes = async (types: string[]) => {
    if (types.length === 0) {
      console.log('No sensor types available');
      return;
    }

    const layers = types.join(',');
    console.log('Fetching tabular data for all types:', layers);
    setLoading(true);

    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/tabular-data-by-layers', {
        params: { layers, userId },
      });
      console.log('Tabular data response:', response.data);
      setTabularData(response.data.items || []);
      setSelectedTypes(types);
      setError(null);
    } catch (err) {
      console.error('Error fetching tabular data:', err);
      setError('Failed to load data');
      setTabularData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sensorTypes.length > 0 && userId && !initialLoadDone) {
      const savedTypes = localStorage.getItem(STORAGE_KEY);
      if (savedTypes) {
        try {
          const parsed = JSON.parse(savedTypes);
          const validTypes = parsed.filter((t: string) =>
            sensorTypes.some(st => st.toLowerCase() === t.toLowerCase())
          );
          if (validTypes.length > 0) {
            fetchAllTypes(validTypes);
            setInitialLoadDone(true);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved types:', e);
        }
      }
      fetchAllTypes(sensorTypes);
      setInitialLoadDone(true);
    }
  }, [sensorTypes, userId, initialLoadDone]);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTypes));
    }
  }, [selectedTypes]);

  const handleBack = () => {
    setPage(0);
  };

  const fetchTabularData = async () => {
    if (selectedTypes.length === 0) {
      console.log('No sensor types selected');
      return;
    }

    const layers = selectedTypes.join(',');
    console.log('Fetching tabular data for layers:', layers);
    setLoading(true);

    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/tabular-data-by-layers', {
        params: { layers, userId },
      });
      console.log('Tabular data response:', response.data);
      setTabularData(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tabular data:', err);
      setError('Failed to load data');
      setTabularData([]);
    } finally {
      setLoading(false);
    }
  };

  const markerTypeMap: Record<string, string> = {
    'moist-fuel': 'Moist',
    'temp-rh-v2': 'SoilTemp',
    'temp-rh': 'SoilTemp',
    'wxet': 'WXET',
    'virtual-weather-station': 'WXVS',
    'valve': 'Valve',
    'vfd': 'VFD',
    'psi': 'PSI',
    'planthealth': 'PlantHealth',
    'infra-red': 'IR',
    'chemical': 'CHEM',
    'neutron': 'Nprobe',
    'srs-green-fuel': 'SRS',
    'srs-ref-fuel': 'SRS',
    'graphic': 'EXTL',
  };

  const getSensorType = (sensorId: string): string => {
    const allSensors = getSensorItems(undefined, siteList);
    const currentSensor = allSensors.find((sensor: any) => sensor.sensorId === sensorId);

    if (currentSensor?.markerType) {
      return markerTypeMap[currentSensor.markerType] || 'unknown';
    }
    return 'unknown';
  };

  const typeOrder = ['Moist', 'SoilTemp', 'WXET'];
  const typeDisplayNames: Record<string, string> = {
    'Moist': 'Soil Moisture',
    'SoilTemp': 'Temp RH',
    'WXET': 'Weather Station',
  };

  const groupedData = useMemo(() => {
    const groups: Record<string, TabularDataItem[]> = {};

    tabularData.forEach(item => {
      const sensorType = getSensorType(item.sensorId);
      if (!groups[sensorType]) {
        groups[sensorType] = [];
      }
      groups[sensorType].push(item);
    });

    return typeOrder
      .filter(type => groups[type] && groups[type].length > 0)
      .map(type => ({
        type,
        displayName: typeDisplayNames[type] || type,
        items: groups[type]
      }));
  }, [tabularData, siteList]);

  const renderDataTable = (item: TabularDataItem) => {
    if (!item.data || item.data.length === 0) return null;

    const sensorType = getSensorType(item.sensorId);
    const firstRowColor = freshnessColors[item.freshness] || '#8BF972FF';

    const tabularDataFormatted = {
      label: item.label,
      sensorCount: item.sensorCount || 0,
      data: item.data.map((row, index) => ({
        ...row,
        freshness: index === 0 ? item.freshness : undefined
      })),
      freshness: item.freshness
    };

    return (
      <div key={item.sensorId} style={{ marginBottom: "16px" }}>
        {sensorType === 'Moist' ? (
          <MoistTable
            type="moistMain"
            data={tabularDataFormatted}
            firstRowColor={firstRowColor}
            isWxetMobile={isWxetMobile}
            scrollable
          />
        ) : sensorType === 'SoilTemp' ? (
          <TempTable
            tabularData={tabularDataFormatted}
            isMobile={isMobile}
            freshnessColors={freshnessColors}
            scrollable
          />
        ) : sensorType === 'WXET' ? (
          <WxetTable
            tabularData={tabularDataFormatted}
            isMobile={isMobile}
            freshnessColors={freshnessColors}
            scrollable
          />
        ) : (
          <div style={{ padding: "12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd", borderRadius: "8px" }}>
            <strong>{item.label}</strong> ({item.sensorId}) - {sensorType} table not implemented
          </div>
        )}
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Data List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ "--background": "white" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <IonSelect
            multiple={true}
            value={selectedTypes}
            placeholder="Select sensor types"
            onIonChange={(e) => setSelectedTypes(e.detail.value)}
            interface="popover"
            label="Sensor Types"
            labelPlacement="start"
            style={{ flex: 1 }}
          >
            {sensorTypes.map((type) => (
              <IonSelectOption key={type} value={type}>
                {getDisplayName(type)}
              </IonSelectOption>
            ))}
          </IonSelect>
          <IonButton size="default" onClick={fetchTabularData}>
            Update
          </IonButton>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px" }}>
              <IonSpinner name="crescent" />
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", color: "#dc3545", padding: "32px" }}>
              {error}
            </div>
          ) : tabularData.length === 0 ? (
            <div style={{ textAlign: "center", color: "#666", padding: "32px" }}>
              No data available
            </div>
          ) : (
            groupedData.map(group => (
              <div key={group.type} style={{ marginBottom: "24px" }}>
                <h2 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  margin: "16px 0 12px 0",
                  textAlign: "center"
                }}>
                  {group.displayName}
                </h2>
                {group.items.map(renderDataTable)}
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DataListPage;