import React, {useEffect, useRef, useState} from 'react';
import {IonButton, IonSelect, IonSelectOption, useIonAlert} from "@ionic/react";
import {getFreshSiteList} from "./functions/getFreshSiteList";
import {createBudgetChart} from "./functions/createBudgetChart";
import {getNewData} from "./functions/getNewData";
import {getMoistMarkerChartData} from "../Map/data/types/moist/getMoistMarkerChartData";
import {initializeMoistCustomOverlay} from "../Map/components/types/moist/MoistCustomOverlay";
import invalidChartDataImage from "../../assets/images/invalidChartData.png";
import {createMoistChartForOverlay} from "../Map/functions/types/moist/createMoistChartForOverlay";
import {onIncreaseDaysCountClick} from "./functions/onIncreaseDaysCountClick";
import s from '../Map/style.module.css'
import BudgetEditorLine from "./components/BudgetEditorLine";
import {updateSite} from "./functions/updateSite";
import * as am5 from "@amcharts/amcharts5";

import type { Site } from '../../types';

interface BudgetLine {
  value: number;
  label: string;
}

interface ChartDataItem {
  DateTime: string;
  SumAve: number;
  [key: string]: unknown;
}

interface ChartDataState {
  data?: ChartDataItem[];
  budgetLines?: BudgetLine[];
}

interface MoistSensor {
  sensorId: string;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

interface MoistOverlay {
  setMap: (map: google.maps.Map | null) => void;
  update: (sensorId: string) => void;
  dispose?: () => void;
}

interface BudgetEditorProps {
  previousPage?: string;
  siteList: Site[];
  userId: number;
  isGoogleApiLoaded: boolean;
  [key: string]: unknown;
}

const BudgetEditor = ({ previousPage, ...props }: BudgetEditorProps) => {
  const [sites, setSites] = useState<Site[]>([])
  const [currentSite, setCurrentSite] = useState<string | undefined>()
  const [moistSensors, setMoistSensors] = useState<MoistSensor[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | undefined>()
  const [chartData, setChartData] = useState<ChartDataState>({})
  const chartRoot = useRef<am5.Root | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | undefined>()
  const [moistOverlays, setMoistOverlays] = useState<MoistOverlay[]>([])
  const isMoistMarkerChartDrawn: boolean = false
  const moistOverlaysRef = useRef<MoistOverlay[]>([])
  const [dataExists, setDataExists] = useState<boolean>(false)
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();
  const [currentAmountOfDays, setCurrentAmountOfDays] = useState(0)
  useEffect(() => {
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
    return () => {
      moistOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      moistOverlaysRef.current = [];
      setMoistOverlays([]);
    };
  }, []);
  useEffect(() => {
    const overlaysExistInDOM = document.querySelector('[id^="overlay-b-"]');
    if (!overlaysExistInDOM && map && moistSensors.length > 0) {
      setMoistOverlays([]);
    }
  }, [map, moistSensors]);
  // create chart
  useEffect(() => {
    if (chartData.data && chartData.data.length !== 0 && chartData.budgetLines && dataExists) {
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
      moistSensors.map((moistSensor) => {
        if (moistSensor.sensorId === currentSensorId) {
          map?.setCenter({lat: moistSensor.lat, lng: moistSensor.lng})
          map?.setZoom(15)
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
      const currentSensors = [...moistSensors]
      currentSensors.forEach(async (marker) => {
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
  // create chart for overlays
  useEffect(() => {
    if (moistOverlays.length !== 0) {
      const roots: am5.Root[] = [];
      moistOverlaysRef.current.forEach((moistOverlay) => {
        const overlayWithChart = moistOverlay as any; // MoistCustomOverlay has additional properties not in MoistOverlay interface
        if (overlayWithChart.isValidChartData && overlayWithChart.toUpdate) {
          createMoistChartForOverlay('b', overlayWithChart.chartData, roots, moistOverlaysRef.current)
        }
      });
      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [moistOverlays]);

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
              {sites.map((site) => (
                <IonSelectOption key={site.name} value={site.name}>{site.name}</IonSelectOption>
              ))}
            </IonSelect>
          ) : null}
          <IonSelect label="Sensor ID" value={currentSensorId} className={s.budget_menuSensorID}
                     onIonChange={(e: CustomEvent) => setCurrentSensorId(e.detail.value)}>
            {moistSensors.map((sensor) => (
              <IonSelectOption key={sensor.sensorId}
                               value={sensor.sensorId}>{`${sensor.sensorId} - ${(sensor as any).name}`}</IonSelectOption>
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