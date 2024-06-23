import React, {useEffect, useState} from 'react';
import s from './style.module.css';
import {
  IonPage,
  IonContent, useIonToast
} from '@ionic/react';
import {useRef} from 'react';
import invalidChartDataImage from '../../assets/images/invalidChartData.png';
import Header from "./components/Header";
import ModalWindow from "./components/ModalWindow";
import {initializeMoistCustomOverlay} from "./components/types/moist/MoistCustomOverlay";
import {setSiteListRequest} from "./data/siteListRequest";
import {createMap} from "./functions/createMap";
import {createSites} from "./functions/createSites";
import {createMoistChartForOverlay} from "./functions/types/moist/createMoistChartForOverlay";
import { useHistory } from 'react-router-dom';
import LayerList from "./components/LayerList";
import {initializeWxetCustomOverlay} from "./components/types/wxet/WxetCustomOverlay";
import {initializeTempCustomOverlay} from "./components/types/temp/TempCustomOverlay";
import {createTempChartForOverlay} from "./functions/types/temp/createTempChartForOverlay";

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
  setAdditionalChartData: React.Dispatch<React.SetStateAction<any>>;
  setChartPageType: React.Dispatch<React.SetStateAction<string>>
}

const MapPage: React.FC<MainProps> = (props) => {
  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const [sensorId, setSensorId] = useState('')
  // const [sensorName, setSensorName] = useState('')
  // const [sensorChartType, setSensorType] = useState('')
  // const [isSelectDisabled, setIsSelectDisabled] = useState(false)
  // const [isChartDataIsLoading, setIsChartDataIsLoading] = useState(false)
  const present = useIonToast()

  // Moist type
  let isMoistMarkerChartDrawn: boolean = false
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<any>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState([])
  const [moistOverlays, setMoistOverlays] = useState([])
  const moistChartsAmount: any = []

  // Temp type
  let isTempMarkerChartDrawn: boolean = false
  const [tempChartDataContainer, setTempChartDataContainer] = useState<any>([])
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState([])
  const [tempOverlays, setTempOverlays] = useState([])
  const tempChartsAmount: any = []

  // Wxet type
  const [wxetDataContainer, setWxetDataContainer] = useState<any>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState([])
  const wxetChartsAmount: any = []

  // All Types
  let allCoordinatesOfMarkers: any = [];
  let overlaysToFit: any[] = [];
  const [overlays, setOverlays] = useState<any[]>([])
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
        props.userId,
        allCoordinatesOfMarkers,
        setIsAllCoordinatesOfMarkersAreReady,
        setSecondMap,
        moistChartsAmount,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        wxetChartsAmount,
        setInvalidWxetDataContainer,
        setWxetDataContainer,
        tempChartsAmount,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer
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
            isMoistMarkerChartDrawn,
            props.setAdditionalChartData,
            props.siteList,
            setMoistOverlays,
            props.setChartPageType
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
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType
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
        createMoistChartForOverlay(chartData[0], roots, moistOverlays)
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
            props.setAdditionalChartData,
            history,
            props.userId,
            data[1],
            true,
            data[0],
            props.setChartPageType
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
            props.setAdditionalChartData,
            history,
            props.userId,
            data[1],
            false,
            data[0],
            props.setChartPageType
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

  // Temp Marker
  useEffect(() => {
    if (tempChartDataContainer.length !== 0) {
      const addOverlay = (() => {
        tempChartDataContainer.map((chartData: any) => {
          const TempCustomOverlayExport: any = initializeTempCustomOverlay(props.isGoogleApiLoaded)
          const overlay = new TempCustomOverlayExport(
            chartData[1],
            true,
            chartData[0],
            isAllCoordinatesOfMarkersAreReady,
            overlappingPairs,
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            isTempMarkerChartDrawn,
            props.setAdditionalChartData,
            props.siteList,
            setTempOverlays,
            props.setChartPageType,
            props.userId,
            present
          )
          setOverlays((prevOverlays) => [...prevOverlays, overlay]);
          overlay.setMap(map)
        })
      })
      addOverlay();
    }
  }, [tempChartDataContainer]);
  useEffect(() => {
    if (invalidTempChartDataContainer.length !== 0) {
      invalidTempChartDataContainer.map((chartData: any) => {
        const CustomOverlayExport: any = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        const overlay: any = new CustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          isAllCoordinatesOfMarkersAreReady,
          overlappingPairs,
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present
        )
        setOverlays((prevOverlays) => [...prevOverlays, overlay]);
        map && overlay.setMap(map)
      })
    }
  }, [invalidTempChartDataContainer]);
  useEffect(() => {
    if (tempOverlays.length !== 0) {
      const roots: any[] = [];
      tempChartDataContainer.map((chartData: any) => {
        createTempChartForOverlay(chartData[0], roots, tempOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [tempOverlays]);

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