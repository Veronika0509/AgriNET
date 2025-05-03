import React, {useEffect, useRef, useState} from 'react';
import s from '../../../../style.module.css'
import {getSumChartData} from "../../../../../Chart/data/types/moist/getSumChartData";
import {getSensorItems} from "../../../../data/getSensorItems";
import {createBudgetChart} from "../../../../functions/types/moist/createBudgetChart";
import {IonButton, IonIcon, IonSelect, IonSelectOption, useIonAlert} from "@ionic/react";
import {briefcase, copyOutline, logoFacebook, arrowBack} from "ionicons/icons";
import { handleBackNavigation } from '../../../../functions/handleBackNavigation';
import BudgetEditorLine from "./components/BudgetEditorLine";
import {getSiteList} from "../../../../data/getSiteList";
import {getMoistMarkerChartData} from "../../../../data/types/moist/getMoistMarkerChartData";
import {initializeMoistCustomOverlay} from "../MoistCustomOverlay";
import invalidChartDataImage from "../../../../../../assets/images/invalidChartData.png";
import {createMoistChartForOverlay} from "../../../../functions/types/moist/createMoistChartForOverlay";
import {onTelOrEmailSubmit} from "../../../../../Chart/components/Alarm/functions/telOrEmail/onTelOrEmailSubmit";
import {formatDate} from "../../../../../Chart/functions/formatDate";
import chart from "../../../../../Chart";
import {getNewData} from "./functions/getNewData";
import {getFreshSiteList} from "./functions/getFreshSiteList";
import {deleteMoistOverlays} from "./functions/deleteMoistOverlays";
import {updateSite} from "./functions/updateSite";
import {setDays} from "./functions/setDays";
import {onIncreaseDaysCountClick} from "./functions/onIncreaseDaysCountClick";

const BudgetEditor = ({ previousPage, ...props }: { previousPage?: string } & any) => {
  const [sites, setSites] = useState<any>([])
  const [currentSite, setCurrentSite] = useState()
  const [moistSensors, setMoistSensors] = useState<any>([])
  const [currentSensorId, setCurrentSensorId] = useState()
  const [chartData, setChartData] = useState<any>([])
  const chartRoot: any = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const [map, setMap] = useState<any>()
  const [moistOverlays, setMoistOverlays] = useState<any>([])
  let isMoistMarkerChartDrawn: boolean = false
  const moistOverlaysRef = useRef<any[]>([])
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
      moistSensors.map((moistSensor: any) => {
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
      currentSensors.forEach(async (marker: any) => {
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
        const MoistCustomOverlayExport: any = initializeMoistCustomOverlay(props.isGoogleApiLoaded);
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
      let roots: any[] = [];
      moistOverlaysRef.current.forEach((moistOverlay: any) => {
        if (moistOverlay.isValidChartData && moistOverlay.toUpdate) {
          createMoistChartForOverlay('b', moistOverlay.chartData, roots, moistOverlaysRef.current)
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
                       onIonChange={(e: any) => updateSite({
                         value: e.detail.value,
                         moistOverlaysRef,
                         setMoistOverlays,
                         setCurrentSite,
                         sites,
                         setCurrentSensorId,
                         setMoistSensors
                       })}>
              {sites.map((site: any) => (
                <IonSelectOption key={site.name} value={site.name}>{site.name}</IonSelectOption>
              ))}
            </IonSelect>
          ) : null}
          <IonSelect label="Sensor ID" value={currentSensorId} className={s.budget_menuSensorID}
                     onIonChange={(e: any) => setCurrentSensorId(e.detail.value)}>
            {moistSensors.map((sensor: any) => (
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
