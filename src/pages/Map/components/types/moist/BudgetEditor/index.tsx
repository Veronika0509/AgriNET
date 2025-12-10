import React, {useEffect, useRef, useState} from 'react';
import s from '../../../../style.module.css'
import {createBudgetChart} from "../../../../functions/types/moist/createBudgetChart";
import {IonButton, IonIcon, IonSelect, IonSelectOption, useIonAlert} from "@ionic/react";
import BudgetEditorLine from "./components/BudgetEditorLine";
import {getMoistMarkerChartData} from "../../../../data/types/moist/getMoistMarkerChartData";
import {initializeMoistCustomOverlay} from "../MoistCustomOverlay";
import invalidChartDataImage from "../../../../../../assets/images/invalidChartData.png";
import {createMoistChartForOverlay} from "../../../../functions/types/moist/createMoistChartForOverlay";
import {getNewData} from "./functions/getNewData";
import {getFreshSiteList} from "./functions/getFreshSiteList";
import {updateSite} from "./functions/updateSite";
import {onIncreaseDaysCountClick} from "./functions/onIncreaseDaysCountClick";
import axios from 'axios';

interface BudgetEditorProps {
  previousPage?: string;
  siteList: unknown[];
  userId: string | number;
  isGoogleApiLoaded: boolean;
  initialSensorId?: string | number | null;
  [key: string]: unknown;
}

const BudgetEditor = ({ previousPage, initialSensorId, ...props }: BudgetEditorProps) => {
  const [sites, setSites] = useState<unknown[]>([])
  const [currentSite, setCurrentSite] = useState<string | undefined>()
  const [moistSensors, setMoistSensors] = useState<unknown[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | number | undefined>(initialSensorId || undefined)
  const [chartData, setChartData] = useState<{ data?: unknown[]; budgetLines?: unknown[] }>({})
  const chartRoot = useRef<unknown>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | undefined>()
  const [moistOverlays, setMoistOverlays] = useState<unknown[]>([])
  const isMoistMarkerChartDrawn: boolean = false
  const moistOverlaysRef = useRef<unknown[]>([])
  const [dataExists, setDataExists] = useState<boolean>(false)
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();
  const [currentAmountOfDays, setCurrentAmountOfDays] = useState(0)
  const [userSiteGroups, setUserSiteGroups] = useState<unknown[]>([])

  // Fetch user site groups on mount
  useEffect(() => {
    const fetchUserSiteGroups = async () => {
      try {
        const response = await axios.get('https://app.agrinet.us/api/add-unit/user-site-groups', {
          params: {
            v: 43,
            userId: props.userId
          }
        });
        setUserSiteGroups(response.data);
        console.log('User site groups:', response.data);
        console.log(props.siteList)
      } catch (error) {
        console.error('Error fetching user site groups:', error);
      }
    };

    if (props.userId) {
      fetchUserSiteGroups();
    }
  }, [props.userId]);

  useEffect(() => {
    // Only run if we have sites loaded AND Google Maps API is loaded
    if (props.siteList && props.siteList.length > 0 && props.isGoogleApiLoaded && mapRef.current) {
      getFreshSiteList({
        siteList: props.siteList,
        setSites,
        setCurrentSite,
        setMoistSensors,
        setCurrentSensorId,
        setMap,
        mapRef,
        currentAmountOfDays,
        currentSensorId,
        setChartData,
        setDataExists
      })
      setCurrentAmountOfDays(14)
    }
    return () => {
      moistOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      moistOverlaysRef.current = [];
      setMoistOverlays([]);
    };
  }, [props.siteList, props.isGoogleApiLoaded]);
  // Trigger map resize when map is created
  useEffect(() => {
    if (map) {
      // Give the map a moment to render
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
      }, 100);
    }
  }, [map]);

  useEffect(() => {
    const overlaysExistInDOM = document.querySelector('[id^="overlay-b-"]');
    if (!overlaysExistInDOM && map && moistSensors.length > 0) {
      setMoistOverlays([]);
    }
  }, [map, moistSensors]);
  // create chart
  useEffect(() => {
    if (chartData.length !== 0 && dataExists) {
      createBudgetChart({
        chartData: chartData.data,
        budgetLines: chartData.budgetLines,
        chartRoot
      })
    }
  }, [chartData]);
  useEffect(() => {
    if (currentSensorId) {
      getNewData(currentAmountOfDays, currentSensorId, setChartData, setDataExists)
      moistSensors.map((moistSensor: { sensorId: string | number; lat: number; lng: number; [key: string]: unknown }) => {
        if (moistSensor.sensorId === currentSensorId) {
          map.setCenter({lat: moistSensor.lat, lng: moistSensor.lng})
          map.setZoom(15)
        }
      })
      moistOverlaysRef.current.forEach((overlay) => {
        overlay.update(currentSensorId);
      });
    }
  }, [currentSensorId]);
  // create overlays
  useEffect(() => {
    if (moistOverlaysRef.current.length === 0 && map) {
      const currentSensors = [...moistSensors];
      currentSensors.forEach(async (marker: { sensorId: string | number; lat: number; lng: number; [key: string]: unknown }) => {
        const overlayChartData = await getMoistMarkerChartData(marker.sensorId, props.userId);
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(marker.lat, marker.lng),
          new google.maps.LatLng(marker.lat + 0.0001, marker.lng + 0.0001)
        );
        marker = {
          ...marker,
          budgetLines: overlayChartData.data.budgetLines,
          data: overlayChartData.data.data,
          freshness: overlayChartData.data.freshness
        };
        const MoistCustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded);
        const overlay = new MoistCustomOverlayExport(
          true,
          bounds,
          invalidChartDataImage,
          overlayChartData.data.data.length > 1,
          marker,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          isMoistMarkerChartDrawn,
          undefined,
          undefined,
          setMoistOverlays,
          undefined,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          true
        );
        await overlay.setMap(map);
      });
    }
  }, [moistSensors, map]);
  // create chart for overlays - use polling to detect when overlays are ready
  useEffect(() => {
    if (moistSensors.length === 0 || !map) return;

    let isCancelled = false;
    let pollInterval: NodeJS.Timeout;
    const createdCharts = new Set<string>();

    const checkAndCreateCharts = () => {
      if (isCancelled) return;

      const validOverlays = moistOverlaysRef.current.filter(
        (overlay: any) => overlay.isValidChartData && overlay.toUpdate
      );

      validOverlays.forEach((moistOverlay: any) => {
        const chartId = `b-${moistOverlay.chartData.id}`;

        if (createdCharts.has(chartId)) {
          return;
        }

        const chartElement = document.getElementById(chartId);

        if (chartElement) {
          try {
            createMoistChartForOverlay('b', moistOverlay.chartData, [], moistOverlaysRef.current);
            createdCharts.add(chartId);
          } catch (error) {
            console.error(`Error creating chart for ${chartId}:`, error);
          }
        }
      });

      // Stop polling when all charts are created
      if (createdCharts.size === validOverlays.length && validOverlays.length > 0) {
        clearInterval(pollInterval);

        // Update overlays multiple times to ensure charts become visible
        const updateOverlays = () => {
          moistOverlaysRef.current.forEach((overlay) => {
            overlay.update(currentSensorId);
          });
        };

        // Update immediately
        updateOverlays();

        // Update again after delays to catch any late renders
        setTimeout(updateOverlays, 100);
        setTimeout(updateOverlays, 300);
        setTimeout(updateOverlays, 500);
      }
    };

    // Start polling
    pollInterval = setInterval(checkAndCreateCharts, 300);
    // Also try immediately
    setTimeout(checkAndCreateCharts, 100);

    // Stop polling after 10 seconds
    const timeout = setTimeout(() => {
      if (!isCancelled) {
        clearInterval(pollInterval);
      }
    }, 10000);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [moistSensors, map, moistOverlays, currentSensorId]);

  useEffect(() => {
    if (currentAmountOfDays > 0) {
      getNewData(currentAmountOfDays, currentSensorId, setChartData, setDataExists)
    }
  }, [currentAmountOfDays]);
  useEffect(() => {
    if (!dataExists && chartRoot.current) {
      chartRoot.current.dispose()
    }
  }, [dataExists]);

  return (
    <div className={s.budget_container}>
      <div className={s.budget_firstHalf}>
        <div className={s.budget_firstHalfWrapper}>
          {dataExists === undefined ? null : dataExists ? (
            <div className={s.budget_chart} id={'budgetChart'}></div>
          ) : (
            <div className={s.budget_noData}>
              <div className={s.budget_noDataWrapper}>
                <p>Has no data for last days</p>
                <IonButton fill='solid' onClick={() => {
                  onIncreaseDaysCountClick({
                    presentAlert,
                    currentAmountOfDays,
                    setCurrentAmountOfDays,
                    presentErrorAlert
                  })
                }}>Increase days count</IonButton>
              </div>
            </div>
          )}
          <div className={s.budget_settings}>
            {chartData.budgetLines && (
              <>
                <BudgetEditorLine moistOverlaysRef={moistOverlaysRef} setMoistOverlays={setMoistOverlays} moistOverlays={moistOverlays} index={1} chartData={chartData} currentSensorId={currentSensorId}
                                  userId={props.userId} currentAmountOfDays={currentAmountOfDays} setChartData={setChartData} setDataExists={setDataExists} />
                <BudgetEditorLine moistOverlaysRef={moistOverlaysRef} setMoistOverlays={setMoistOverlays} moistOverlays={moistOverlays} index={2} chartData={chartData} currentSensorId={currentSensorId}
                                  userId={props.userId} currentAmountOfDays={currentAmountOfDays} setChartData={setChartData} setDataExists={setDataExists} />
                <BudgetEditorLine moistOverlaysRef={moistOverlaysRef} setMoistOverlays={setMoistOverlays} moistOverlays={moistOverlays} index={3} chartData={chartData} currentSensorId={currentSensorId}
                                  userId={props.userId} currentAmountOfDays={currentAmountOfDays} setChartData={setChartData} setDataExists={setDataExists} />
                <BudgetEditorLine moistOverlaysRef={moistOverlaysRef} setMoistOverlays={setMoistOverlays} moistOverlays={moistOverlays} index={4} chartData={chartData} currentSensorId={currentSensorId}
                                  userId={props.userId} currentAmountOfDays={currentAmountOfDays} setChartData={setChartData} setDataExists={setDataExists} />
                <BudgetEditorLine moistOverlaysRef={moistOverlaysRef} setMoistOverlays={setMoistOverlays} moistOverlays={moistOverlays} index={5} chartData={chartData} currentSensorId={currentSensorId}
                                  userId={props.userId} currentAmountOfDays={currentAmountOfDays} setChartData={setChartData} setDataExists={setDataExists} />
                <BudgetEditorLine moistOverlaysRef={moistOverlaysRef} setMoistOverlays={setMoistOverlays} moistOverlays={moistOverlays} index={6} chartData={chartData} currentSensorId={currentSensorId}
                                  userId={props.userId} currentAmountOfDays={currentAmountOfDays} setChartData={setChartData} setDataExists={setDataExists} />
              </>
            )}
          </div>
        </div>
        <div className={s.budget_menu}>
          {sites.length > 1 ? (
            <IonSelect label="Site" value={currentSite} className={s.budget_menuSite}
                       onIonChange={(e: CustomEvent) => updateSite({
                         value: e.detail.value,
                         moistOverlaysRef,
                         setMoistOverlays,
                         setCurrentSite,
                         sites,
                         setCurrentSensorId,
                         setMoistSensors
                       })}>
              {sites.map((site: { name: string; [key: string]: unknown }) => (
                <IonSelectOption key={site.name} value={site.name}>{site.name}</IonSelectOption>
              ))}
            </IonSelect>
          ) : null}
          <IonSelect label="Sensor ID" value={currentSensorId} className={s.budget_menuSensorID}
                     onIonChange={(e: CustomEvent) => setCurrentSensorId(e.detail.value)}>
            {moistSensors.map((sensor: { sensorId: string | number; name: string; [key: string]: unknown }) => (
              <IonSelectOption key={sensor.sensorId}
                               value={sensor.sensorId}>{`${sensor.sensorId} - ${sensor.name}`}</IonSelectOption>
            ))}
          </IonSelect>
        </div>
      </div>
      <div className={s.budget_secondHalf}>
        <div ref={mapRef} className={s.budget_map}></div>
      </div>
    </div>
  );
}

export default BudgetEditor;
