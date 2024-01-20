import React, {useEffect, useState} from 'react';
import s from './style.module.css';
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonList,
  IonText,
  IonItem, IonModal, IonButton, IonButtons, IonLabel
} from '@ionic/react';
import axios from 'axios';
import {GoogleMap} from '@capacitor/google-maps';
import {useRef} from 'react';
import locationIcon from '../../assets/images/locationIcon.png'
import login from "../Login";

interface MainProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
  siteList: any;
  setSiteList: any;
  setSiteId: React.Dispatch<React.SetStateAction<string>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
}

const Main: React.FC<MainProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sensorName, setSensorName] = useState('')
  const [sensorId, setSensorId] = useState('')
  const [sensorChartType, setSensorType] = useState('')

  const onSensorClick = (id: string, name: string) => {
    props.setPage(2)
    props.setSiteId(id)
    props.setSiteName(name)
  };

  const mapRef = useRef<HTMLElement>();

  // request to server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://app.agrinet.us/api/map/sites', {
          params: {
            userId: props.userId,
          },
        })
        props.setSiteList(response.data)
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  let newMap: any = null

  // map creating
  useEffect(() => {
    const createMap = async () => {
      if (!mapRef.current || !props.siteList || props.siteList.length === 0) return;

      try {
        newMap = await GoogleMap.create({
          id: 'My Map',
          element: mapRef.current,
          apiKey: 'AIzaSyAm9UR2FE8YwAqxKtaAyoBPWSl66w7Qdhc',
          forceCreate: true,
          config: {
            center: {
              lat: 46.093354,
              lng: -118.274636
            },
            zoom: 18
          }
        });

        for (const sensors of props.siteList) {
          try {
            await newMap.addMarker({
              coordinate: {
                lat: sensors.lat,
                lng: sensors.lng
              },
              title: sensors.name
            });
          } catch (error) {
            console.error('Ошибка при добавлении маркера:', error);
          }
        }

        const getSensorItems = () => {
          const sensorItems: any = []
          props.siteList.map((sensors: any) => {
            sensors.layers.map((sensor: any) => {
              sensor.markers.map(async (sensorItem: any) => {
                sensorItems.push(sensorItem)
              })
            })
          })
          return sensorItems
        }

        await newMap.setOnMarkerClickListener(async (event: any) => {
          const OFFSET = 0.0001;
          const usedCoordinates = new Map();
          const currentMarker = event
          props.siteList.map( async (sensors: any) => {
            if (currentMarker.title === sensors.name) {
              await newMap.removeMarker(event.markerId)
              const sensorItems = getSensorItems()
              sensorItems.forEach( (sensorItem: any) => {
                let lat = sensorItem.lat;
                let lng = sensorItem.lng;
                const key = `${lat}-${lng}`;
                if (usedCoordinates.has(key)) {
                  let count = usedCoordinates.get(key);
                  lat += OFFSET * count;
                  lng += OFFSET * count;
                  usedCoordinates.set(key, count + 1);
                } else {
                  usedCoordinates.set(key, 1);
                }
                newMap.addMarker({
                  coordinate: {lat, lng},
                  title: sensorItem.sensorId,
                  zIndex: 1,
                });
              });
            } else {
              const sensorItems = getSensorItems()
              sensorItems.map((sensorItem: any) => {
                if (currentMarker.title === sensorItem.sensorId) {
                  // onMarkerClick(sensorItem.sensorId, sensorItem.name)
                  setIsModalOpen(true)
                  setSensorName(sensorItem.name)
                  setSensorId(sensorItem.sensorId)
                  setSensorType(sensorItem.chartType)
                }
              })
            }
          })
        });
      } catch (error) {
        console.error('Ошибка при создании карты:', error);
      }
    };

    createMap();
  }, [mapRef, props.siteList]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.ionContent}>
        {/*<IonList className={s.cardContainer}>*/}
        {/*  <IonItem className={s.lightItem}>*/}
        {/*    <IonText color='light' className={s.text}>Name</IonText>*/}
        {/*    <IonText color='light' className={s.text}>Type</IonText>*/}
        {/*    <IonText color='light' className={s.text}>Id</IonText>*/}
        {/*  </IonItem>*/}
        {/*  {props.siteList.map((cardsArray: { layers: any[] }, index1: number) => (*/}
        {/*    cardsArray.layers.map((cards, index2) => (*/}
        {/*      cards.markers.map((card: any, index3: number) => (*/}
        {/*        <IonItem key={`${index1}-${index2}-${index3}`} onClick={() => onMarkerClick(card.sensorId, card.name)} className={s.item}>*/}
        {/*          <IonText className={s.text}>{card.name}</IonText>*/}
        {/*          <IonText className={s.text}>{card.chartType}</IonText>*/}
        {/*          <IonText className={s.text}>{card.sensorId}</IonText>*/}
        {/*        </IonItem>*/}
        {/*      ))*/}
        {/*    ))*/}
        {/*  ))}*/}
        {/*</IonList>*/}
        <div className="component-wrapper">
          <capacitor-google-map ref={mapRef} style={{
            display: 'inline-block',
            width: '100%',
            height: '90vh'
          }}></capacitor-google-map>
        </div>
        <IonModal isOpen={isModalOpen}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setIsModalOpen(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList lines="full">
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h2>Name:</h2>
                  <p>{sensorName}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h2>Sensor Id:</h2>
                  <p>{sensorId}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h2>Type:</h2>
                  <p>{sensorChartType}</p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={() => onSensorClick(sensorId, sensorName)}>Select</IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Main;