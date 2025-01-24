import React, {useEffect, useState} from 'react';
import s from './style.module.css';
import {
  IonPage,
  IonContent, useIonToast
} from '@ionic/react';
import {useRef} from 'react';
import invalidChartDataImage from '../../assets/images/invalidChartData.png';
import Header from "./components/Header";
import {initializeMoistCustomOverlay} from "./components/types/moist/MoistCustomOverlay";
import {getSiteList} from "./data/getSiteList";
import {createMap} from "./functions/createMap";
import {createSites} from "./functions/createSites";
import {createMoistChartForOverlay} from "./functions/types/moist/createMoistChartForOverlay";
import {useHistory} from 'react-router-dom';
import LayerList from "./components/LayerList";
import {initializeWxetCustomOverlay} from "./components/types/wxet/WxetCustomOverlay";
import {initializeTempCustomOverlay} from "./components/types/temp/TempCustomOverlay";
import {createTempChartForOverlay} from "./functions/types/temp/createTempChartForOverlay";
import {CollisionResolver} from "./components/CollisionResolver";
import {initializeValveCustomOverlay} from "./components/types/valve/ValveCustomOverlay";
import {createValveChartForOverlay} from "./functions/types/valve/createValveChartForOverlay";

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

  // Valve type
  let isValveMarkerChartDrawn: boolean = false
  const [valveChartDataContainer, setValveChartDataContainer] = useState<any>([])
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState([])
  const [valveOverlays, setValveOverlays] = useState([])
  const valveChartsAmount: any = []

  // Wxet type
  const [wxetDataContainer, setWxetDataContainer] = useState<any>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState([])
  const wxetChartsAmount: any = []

  // All Types
  let allCoordinatesOfMarkers: any = [];
  const [activeOverlays, setActiveOverlays] = useState<any[]>([])
  const [allOverlays, setAllOverlays] = useState<any[]>([])
  const [isAllCoordinatesOfMarkersAreReady, setIsAllCoordinatesOfMarkersAreReady] = useState([])

  // Map
  const [map, setMap] = React.useState<any>();
  const [markers, setMarkers] = useState([]);
  const [secondMap, setSecondMap] = useState()
  const [amountOfSensors, setAmountOfSensors] = useState<number>(0)
  const [areBoundsFitted, setAreBoundsFitted] = useState(false)
  const mapRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    if (props.page === 1) {
      getSiteList(props.userId, props.setSiteList)
      createMap(map, setMap, mapRef)
    }
  }, [props.page])
  useEffect(() => {
    if (activeOverlays.length !== 0) {
      CollisionResolver.resolve(activeOverlays);
    }
    if (map && props.siteList.length > 0) {
      createSites({
        page: props.page,
        map,
        siteList: props.siteList,
        markers,
        setMarkers,
        userId: props.userId,
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
        setTempChartDataContainer,
        valveChartsAmount,
        setInvalidValveChartDataContainer,
        setValveChartDataContainer,
        amountOfSensors,
        setAmountOfSensors
      })
    }
  }, [map, props.siteList]);

  const addOverlayToOverlaysArray = (overlay: any)=> {
    setActiveOverlays((prevActiveOverlays) => {
      const exists = prevActiveOverlays.some(
        (existingOverlay) => existingOverlay.chartData.sensorId === overlay.chartData.sensorId
      );
      return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
    });
    overlay.setMap(map)
  }
  // Moist Marker Chart
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {
      moistChartDataContainer.map((chartData: any) => {
        const MoistCustomOverlayExport: any = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new MoistCustomOverlayExport(
          chartData[1],
          invalidChartDataImage,
          true,
          chartData[0],
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
        addOverlayToOverlaysArray(overlay)
      })
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
        addOverlayToOverlaysArray(overlay)
      })
    }
  }, [invalidMoistChartDataContainer]);
  useEffect(() => {
    if (moistOverlays.length !== 0) {
      let roots: any[] = [];
      moistOverlays.map((moistOverlay: any) => {
        createMoistChartForOverlay(moistOverlay.chartData, roots, moistOverlays)
      })
      return () => {
        roots.forEach(root => root.dispose());
        roots = []
      };
    }
  }, [moistOverlays]);

  // Wxet Marker
  useEffect(() => {
    if (wxetDataContainer.length !== 0) {
      wxetDataContainer.map((data: any) => {
        const WxetCustomOverlayExport: any = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new WxetCustomOverlayExport(
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setAdditionalChartData,
          history,
          data[1],
          true,
          data[0],
          props.setChartPageType
        )
        addOverlayToOverlaysArray(overlay)
      })
    }
  }, [wxetDataContainer]);
  useEffect(() => {
    if (invalidWxetDataContainer.length !== 0) {
      invalidWxetDataContainer.map((data: any) => {
        const WxetCustomOverlayExport: any = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new WxetCustomOverlayExport(
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setAdditionalChartData,
          history,
          data[1],
          false,
          data[0],
          props.setChartPageType
        )
        addOverlayToOverlaysArray(overlay)
      })
    }
  }, [invalidWxetDataContainer])

  // Temp Marker
  useEffect(() => {
    if (tempChartDataContainer.length !== 0) {
      tempChartDataContainer.map((chartData: any) => {
        const TempCustomOverlayExport: any = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new TempCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present
        )
        addOverlayToOverlaysArray(overlay)
      })
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
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present
        )
        addOverlayToOverlaysArray(overlay)
      })
    }
  }, [invalidTempChartDataContainer]);
  useEffect(() => {
    if (tempOverlays.length !== 0) {
      const roots: any[] = [];
      tempOverlays.map((tempOverlay: any) => {
        createTempChartForOverlay(tempOverlay.chartData, roots, tempOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [tempOverlays]);

  // Valve Marker
  useEffect(() => {
    if (valveChartDataContainer.length !== 0) {
      valveChartDataContainer.map((chartData: any) => {
        const ValveCustomOverlayExport: any = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId
        )
        addOverlayToOverlaysArray(overlay)
      })
    }
  }, [valveChartDataContainer]);
  useEffect(() => {
    if (invalidValveChartDataContainer.length !== 0) {
      invalidValveChartDataContainer.map((chartData: any) => {
        const ValveCustomOverlayExport: any = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId
        )
        addOverlayToOverlaysArray(overlay)
      })
    }
  }, [invalidValveChartDataContainer]);
  useEffect(() => {
    if (valveOverlays.length !== 0) {
      const roots: any[] = [];
      valveOverlays.map((valveOverlay: any) => {
        createValveChartForOverlay(valveOverlay.chartData, roots, valveOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [valveOverlays]);

  useEffect(() => {
    if (activeOverlays.length !== 0 && activeOverlays.length === amountOfSensors && !areBoundsFitted) {
      CollisionResolver.resolve(activeOverlays);
      setAllOverlays(activeOverlays)

      const bounds = new google.maps.LatLngBounds();
      isAllCoordinatesOfMarkersAreReady.forEach((coordinate: any) => {
        bounds.extend({lat: coordinate.lat, lng: coordinate.lng});
      });
      map.fitBounds(bounds);
      setAreBoundsFitted(true);
    }
  }, [activeOverlays]);
  useEffect(() => {
    if (activeOverlays.length !== 0 && areBoundsFitted) {
      CollisionResolver.resolve(activeOverlays);
      const handleResize = (reason: any) => {
        console.log(reason)
        new Promise((resolve: any) => {
          activeOverlays.map((overlay: any) => {
            console.log('change to 0')
            overlay.offset = {x: 0, y: 0}
          })
          resolve()
        }).then(() => {
          CollisionResolver.resolve(activeOverlays);
        })
      };
      window.addEventListener('resize', () => handleResize('resize'));
      map.addListener('zoom_changed', () => handleResize('zoom'));
      return () => {
        window.removeEventListener('resize', handleResize);
        google.maps.event.clearListeners(map, 'zoom_changed');
      };
    }
  }, [activeOverlays, areBoundsFitted]);

  return (
    <IonPage>
      <Header setPage={props.setPage}/>
      <IonContent className={s.ionContent}>
        <div className={s.map} ref={mapRef}>
          {secondMap && (
            <LayerList siteList={props.siteList} secondMap={secondMap} allOverlays={allOverlays} activeOverlays={activeOverlays} setActiveOverlays={setActiveOverlays}/>
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
