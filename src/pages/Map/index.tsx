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
import {onSensorClick} from "./functions/onSensorClick";
import {setSiteListRequest} from "./data/siteListRequest";
import {createMap} from "./functions/createMap";
import {createSites} from "./functions/createSites";
import {createMarkerOverlay} from "./functions/createChartForOverlay";
import { useHistory } from 'react-router-dom';
import LayerList from "./components/LayerList";

interface MainProps {
  page: any
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
  siteList: any;
  setSiteList: any;
  setSiteId: React.Dispatch<React.SetStateAction<string>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
  setChartData: React.Dispatch<React.SetStateAction<any>>;
  chartData: any;
  isGoogleApiLoaded: any;
  setLinesCount: React.Dispatch<React.SetStateAction<any>>;
}

const MapPage: React.FC<MainProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sensorId, setSensorId] = useState('')
  const [sensorName, setSensorName] = useState('')
  const [sensorChartType, setSensorType] = useState('')
  const [isSelectDisabled, setIsSelectDisabled] = useState(false)
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<any>([])
  const [invalidChartDataContainer, setInvalidChartDataContainer] = useState([])
  const [overlayIsReady, setOverlayIsReady] = useState<any>([])
  const [isAllMoistFuelCoordinatesOfMarkersAreReady, setIsAllMoistFuelCoordinatesOfMarkersAreReady] = useState([])
  const [isChartDataIsLoading, setIsChartDataIsLoading] = useState(false)
  const [isChartDrawn, setIsChartDrawn] = useState(false)
  const [map, setMap] = React.useState<any>();
  const [markers, setMarkers] = useState([]);
  const [secondMap, setSecondMap] = useState()
  const [moistOverlays, setMoistOverlays] = useState<any[]>([]);
  const mapRef = useRef(null);
  const moistFuelChartsAmount: any = []
  let allMoistFuelCoordinatesOfMarkers: any = [];
  let overlappingPairs: any[] = []
  const history = useHistory();

  useEffect(() => {
    if (props.page === 1) {
      setSiteListRequest(props.userId, props.setSiteList)
      createMap(map, setMap, mapRef)
    }
  }, [props.page])
  useEffect(() => {
    if (map && props.siteList.length > 0) {
      createSites(
        props.page,
        map,
        props.siteList,
        markers,
        setMarkers,
        moistFuelChartsAmount,
        props.userId,
        setInvalidChartDataContainer,
        setMoistChartDataContainer,
        allMoistFuelCoordinatesOfMarkers,
        setIsAllMoistFuelCoordinatesOfMarkersAreReady,
        setSecondMap
      )
    }
  }, [map, props.siteList]);
  // Marker Chart
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {
      const addOverlay = (() => {
        moistChartDataContainer.map((chartData: any) => {
          const CustomOverlayExport: any = initializeCustomOverlay(props.isGoogleApiLoaded)
          const overlay = new CustomOverlayExport(chartData[1],
            invalidChartDataImage,
            true,
            chartData[0],
            setOverlayIsReady,
            onSensorClick,
            isAllMoistFuelCoordinatesOfMarkersAreReady,
            overlappingPairs,
            sensorId,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            overlayIsReady,
            isChartDrawn,
            props.setLinesCount,
            props.siteList
          )
          setMoistOverlays((prevOverlays) => [...prevOverlays, overlay]);
          overlay.setMap(map)
        })
      })
      addOverlay();
    }
  }, [moistChartDataContainer]);
  useEffect(() => {
    if (invalidChartDataContainer.length !== 0) {
      invalidChartDataContainer.map((chartData: any) => {
        const CustomOverlayExport: any = initializeCustomOverlay(props.isGoogleApiLoaded)
        const overlay: any = new CustomOverlayExport(
          chartData[1],
          invalidChartDataImage,
          false,
          chartData[0],
          setOverlayIsReady,
          onSensorClick,
          isAllMoistFuelCoordinatesOfMarkersAreReady,
          overlappingPairs,
          sensorId,
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          overlayIsReady,
          isChartDrawn,
          props.setLinesCount
        )
        setMoistOverlays((prevOverlays) => [...prevOverlays, overlay]);
        map && overlay.setMap(map)
      })
    }
  }, [invalidChartDataContainer]);
  useEffect(() => {
    if (overlayIsReady) {
      const roots: any[] = [];
      moistChartDataContainer.map((chartData: any) => {
        createMarkerOverlay(chartData[0], roots, overlayIsReady)
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
        <div className={s.map} ref={mapRef}>
          {secondMap && (
            <LayerList siteList={props.siteList} secondMap={secondMap} moistOverlays={moistOverlays} />
          )}
        </div>
        <ModalWindow isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} sensorName={sensorName}
                     sensorId={sensorId} sensorChartType={sensorChartType} isChartDataIsLoading={isChartDataIsLoading}
                     isSelectDisabled={isSelectDisabled} onSensorClick={onSensorClick} setChartData={props.setChartData}
                     setPage={props.setPage} setSiteId={props.setSiteId} setSiteName={props.setSiteName}/>
      </IonContent>
    </IonPage>
  )
}

export default MapPage;