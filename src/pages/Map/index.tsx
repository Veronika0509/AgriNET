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
import {initializeMoistCustomOverlay} from "./components/types/moist/MoistCustomOverlay";
import {setSiteListRequest} from "./data/siteListRequest";
import {createMap} from "./functions/createMap";
import {createSites} from "./functions/createSites";
import {createMarkerOverlay} from "./functions/types/moisture/createChartForOverlay";
import { useHistory } from 'react-router-dom';
import LayerList from "./components/LayerList";
import {initializeWxetCustomOverlay} from "./components/types/wxet/WxetCustomOverlay";

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
  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const [sensorId, setSensorId] = useState('')
  // const [sensorName, setSensorName] = useState('')
  // const [sensorChartType, setSensorType] = useState('')
  // const [isSelectDisabled, setIsSelectDisabled] = useState(false)
  // const [isChartDataIsLoading, setIsChartDataIsLoading] = useState(false)
  const [isChartDrawn, setIsChartDrawn] = useState(false)
  // Moist type
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<any>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState([])
  const [moistOverlays, setMoistOverlays] = useState([])
  const moistFuelChartsAmount: any = []

  // Wxet type
  const [wxetDataContainer, setWxetDataContainer] = useState<any>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState([])
  const [wxetOverlayIsReady, setWxetOverlayIsReady] = useState<any>([])
  const wxetChartsAmount: any = []

  // All Types
  let allCoordinatesOfMarkers: any = [];
  let overlaysToFit: any[] = [];
  const [overlays, setOverlays] = useState<any[]>([])
  const [overlaysAreReady, setOverlaysAreReady] = useState<any>([])
  const [isAllCoordinatesOfMarkersAreReady, setIsAllCoordinatesOfMarkersAreReady] = useState([])

  // Map
  const [map, setMap] = React.useState<any>();
  const [markers, setMarkers] = useState([]);
  const [secondMap, setSecondMap] = useState()
  const mapRef = useRef(null);
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
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        allCoordinatesOfMarkers,
        setIsAllCoordinatesOfMarkersAreReady,
        setSecondMap,
        wxetChartsAmount,
        setInvalidWxetDataContainer,
        setWxetDataContainer,
      )
    }
  }, [map, props.siteList]);
  // Moist Marker Chart
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {
      const addOverlay = (() => {
        moistChartDataContainer.map((chartData: any) => {
          const MoistCustomOverlayExport: any = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
          const overlay = new MoistCustomOverlayExport(
            chartData[1],
            invalidChartDataImage,
            true,
            chartData[0],
            isAllCoordinatesOfMarkersAreReady,
            overlappingPairs,
            // sensorId,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            isChartDrawn,
            props.setLinesCount,
            props.siteList,
            overlaysToFit,
            setMoistOverlays,
            setOverlays
          )
          setOverlays((prevOverlays) => [...prevOverlays, overlay]);
          overlay.setMap(map)
        })
      })
      addOverlay();
    }
  }, [moistChartDataContainer]);
  useEffect(() => {
    if (invalidMoistChartDataContainer.length !== 0) {
      invalidMoistChartDataContainer.map((chartData: any) => {
        const CustomOverlayExport: any = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay: any = new CustomOverlayExport(
          chartData[1],
          invalidChartDataImage,
          false,
          chartData[0],
          isAllCoordinatesOfMarkersAreReady,
          overlappingPairs,
          // sensorId,
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isChartDrawn,
          props.setLinesCount,
          props.siteList,
          overlaysToFit,
          setMoistOverlays,
          setOverlays
        )
        setOverlays((prevOverlays) => [...prevOverlays, overlay]);
        map && overlay.setMap(map)
      })
    }
  }, [invalidMoistChartDataContainer]);
  useEffect(() => {
    if (moistOverlays.length !== 0) {
      const roots: any[] = [];
      moistChartDataContainer.map((chartData: any) => {
        createMarkerOverlay(chartData[0], roots, moistOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [moistOverlays]);

  // Wxet Marker
  useEffect(() => {
    if (wxetDataContainer.length !== 0) {
      const addOverlay = (() => {
        wxetDataContainer.map((data: any) => {
          const WxetCustomOverlayExport: any = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          const overlay = new WxetCustomOverlayExport(
            isAllCoordinatesOfMarkersAreReady,
            overlappingPairs,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setLinesCount,
            history,
            props.siteList,
            data[1],
            true,
            data[0],
            overlaysToFit
          )
          setOverlays((prevOverlays) => [...prevOverlays, overlay]);
          overlay.setMap(map)
        })
      })
      addOverlay();
    }
  }, [wxetDataContainer]);
  useEffect(() => {
    if (invalidWxetDataContainer.length !== 0) {
      const addOverlay = (() => {
        invalidWxetDataContainer.map((data: any) => {
          const WxetCustomOverlayExport: any = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          const overlay = new WxetCustomOverlayExport(
            isAllCoordinatesOfMarkersAreReady,
            overlappingPairs,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setLinesCount,
            history,
            props.siteList,
            data[1],
            false,
            data[0],
            overlaysToFit
          )
          setOverlays((prevOverlays) => [...prevOverlays, overlay]);
          overlay.setMap(map)
        })
      })
      addOverlay();
    }
  }, [invalidWxetDataContainer])
  useEffect(() => {
    if (overlays.length !== 0) {
      const bounds = new google.maps.LatLngBounds();
      overlays.map((overlayToBound: any) => {
        overlayToBound.isAllCoordinatesOfMarkersAreReady.map((coordinateToBound: any) => {
          bounds.extend({ lat: coordinateToBound.lat, lng: coordinateToBound.lng })
        })
      })
      map.fitBounds(bounds);
    }
  }, [overlays]);

  return (
    <IonPage>
      <Header setPage={props.setPage}/>
      <IonContent className={s.ionContent}>
        <div className={s.map} ref={mapRef}>
          {secondMap && (
            <LayerList siteList={props.siteList} secondMap={secondMap} overlays={overlays} />
          )}
        </div>
        {/*<ModalWindow isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} sensorName={sensorName}*/}
        {/*             sensorId={sensorId} sensorChartType={sensorChartType} isChartDataIsLoading={isChartDataIsLoading}*/}
        {/*             isSelectDisabled={isSelectDisabled} onSensorClick={onSensorClick} setChartData={props.setChartData}*/}
        {/*             setPage={props.setPage} setSiteId={props.setSiteId} setSiteName={props.setSiteName}/>*/}
      </IonContent>
    </IonPage>
  )
}

export default MapPage;