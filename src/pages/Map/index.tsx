import React, {useEffect, useState} from 'react';
import s from './style.module.css';
import {
  IonPage,
  IonContent
} from '@ionic/react';
import {useRef} from 'react';
import invalidChartDataImage from '../../assets/images/invalidChartData.png';
import Header from "./components/Header";
import ModalWindow from "./components/ModalWindow";
import {initializeCustomOverlay} from "./components/CustomOverlay";
import {onSensorClick} from "./functions/onSensorClickFunc";
import {setSiteListRequest} from "./data/siteListRequest";
import {createMap} from "./functions/createMapFunc";
import {setGroupMarkers} from "./functions/setGroupMarkersFunc";
import {createMarkerOverlay} from "./functions/createMarkerOverlayFunc";

interface MainProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
  siteList: any;
  setSiteList: any;
  setSiteId: React.Dispatch<React.SetStateAction<string>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
  setChartData: React.Dispatch<React.SetStateAction<any>>;
  chartData: any;
  isGoogleApiLoaded: any;
}

const Main: React.FC<MainProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sensorId, setSensorId] = useState('')
  const [sensorName, setSensorName] = useState('')
  const [sensorChartType, setSensorType] = useState('')
  const [isSelectDisabled, setIsSelectDisabled] = useState(false)
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<any>([])
  const [invalidChartDataContainer, setInvalidChartDataContainer] = useState([])
  const [overlayIsReady, setOverlayIsReady] = useState(false)
  const [isAllMoistFuelCoordinatesOfMarkersAreReady, setIsAllMoistFuelCoordinatesOfMarkersAreReady] = useState([])
  const [isChartDataIsLoading, setIsChartDataIsLoading] = useState(false)
  const [map, setMap] = React.useState<any>();
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const moistFuelChartsAmount: any = []
  let allMoistFuelCoordinatesOfMarkers: any = [];
  let overlappingPairs: any[] = []
  const existingMarkers = new Map();

  setSiteListRequest(props.userId, props.setSiteList)

  createMap(map, setMap, mapRef)
  setGroupMarkers(map, props.siteList, markers, setMarkers, setSensorName, setSensorId, setSensorType, setIsModalOpen, setIsChartDataIsLoading, setIsSelectDisabled, props.setChartData, moistFuelChartsAmount, props.userId, setInvalidChartDataContainer, setMoistChartDataContainer, allMoistFuelCoordinatesOfMarkers, setIsAllMoistFuelCoordinatesOfMarkersAreReady, existingMarkers)

  // Marker Chart
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {
      const addOverlay = (() => {
        moistChartDataContainer.map((chartData: any) => {
          const CustomOverlayExport: any = initializeCustomOverlay(props.isGoogleApiLoaded)
          const overlay = new CustomOverlayExport(chartData[1], invalidChartDataImage, true, chartData[0], setOverlayIsReady, onSensorClick, isAllMoistFuelCoordinatesOfMarkersAreReady, overlappingPairs, sensorId, props.setChartData, props.setPage, props.setSiteId, props.setSiteName);
          overlay.setMap(map);
        })
      })
      addOverlay();
    }
  }, [moistChartDataContainer]);
  useEffect(() => {
    if (invalidChartDataContainer.length !== 0) {
      invalidChartDataContainer.map((chartData: any) => {
        const CustomOverlayExport: any = initializeCustomOverlay(props.isGoogleApiLoaded)
        const overlay: any = new CustomOverlayExport(chartData[1], invalidChartDataImage, false, chartData[0], setOverlayIsReady, onSensorClick, isAllMoistFuelCoordinatesOfMarkersAreReady, overlappingPairs, sensorId, props.setChartData, props.setPage, props.setSiteId, props.setSiteName);
        map && overlay.setMap(map)
      })
    }
  }, [invalidChartDataContainer]);
  useEffect(() => {
    if (overlayIsReady) {
      const roots: any[] = [];
      moistChartDataContainer.map((chartData: any) => {
        createMarkerOverlay(chartData[0], roots)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [overlayIsReady]);

  return (
    <IonPage>
      <Header setPage={props.setPage}/>
      <IonContent className={s.ionContent}>
        <div className={s.map} ref={mapRef}></div>
        <ModalWindow isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} sensorName={sensorName}
                     sensorId={sensorId} sensorChartType={sensorChartType} isChartDataIsLoading={isChartDataIsLoading}
                     isSelectDisabled={isSelectDisabled} onSensorClick={onSensorClick} setChartData={props.setChartData}
                     setPage={props.setPage} setSiteId={props.setSiteId} setSiteName={props.setSiteName}/>
      </IonContent>
    </IonPage>
  )
}

export default Main;