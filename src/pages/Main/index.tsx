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
  IonItem
} from '@ionic/react';
import axios from 'axios';
import {GoogleMap} from '@capacitor/google-maps';
import {useRef} from 'react';
import locationIcon from '../../assets/images/locationIcon.png'

interface MainProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
  siteList: any;
  setSiteList: any;
  setSiteId: React.Dispatch<React.SetStateAction<string>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
}

const Main: React.FC<MainProps> = (props) => {

  const onCardClick = (id: string, name: string) => {
    props.setPage(2)
    props.setSiteId(id)
    props.setSiteName(name)
  };

  const mapRef = useRef<HTMLElement>();

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


  useEffect(() => {
    const createMap = async () => {
      if (!mapRef.current || !props.siteList || props.siteList.length === 0) return;

      if (!mapRef.current) {
        console.error("Элемент контейнера карты не найден");
        return;
      }

      try {
        let newMap = await GoogleMap.create({
          id: 'My Map',
          element: mapRef.current,
          apiKey: 'AIzaSyAm9UR2FE8YwAqxKtaAyoBPWSl66w7Qdhc',
          config: {
            center: {
              lat: 46.093354,
              lng: -118.274636
            },
            zoom: 8
          }
        });

        for (const sensors of props.siteList) {
          try {
            await newMap.addMarker({
              coordinate: {
                lat: sensors.lat,
                lng: sensors.lng
              }
            });
          } catch (error) {
            console.error('Ошибка при добавлении маркера:', error);
          }
        }
        await newMap.setOnMarkerClickListener(async (event) => {
          for (const sensors of props.siteList) {
            if (event.latitude === sensors.lat && event.longitude === sensors.lng) {
              sensors.layers.map((sensor: any) => {
                sensor.markers.map( async (sensorItem: any) => {
                  await newMap.addMarker({
                    coordinate: {
                      lat: sensorItem.lat,
                      lng: sensorItem.lng,
                    },
                    tintColor: {
                      r: 135,
                      g: 211,
                      b: 124,
                      a: 1
                    },
                    zIndex: 1,
                  })
                })
              })
            }
          }
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
      <IonContent>
        {/*<IonList className={s.cardContainer}>*/}
        {/*  <IonItem className={s.lightItem}>*/}
        {/*    <IonText color='light' className={s.text}>Name</IonText>*/}
        {/*    <IonText color='light' className={s.text}>Type</IonText>*/}
        {/*    <IonText color='light' className={s.text}>Id</IonText>*/}
        {/*  </IonItem>*/}
        {/*  {props.siteList.map((cardsArray: { layers: any[] }, index1: number) => (*/}
        {/*    cardsArray.layers.map((cards, index2) => (*/}
        {/*      cards.markers.map((card: any, index3: number) => (*/}
        {/*        <IonItem key={`${index1}-${index2}-${index3}`} onClick={() => onCardClick(card.sensorId, card.name)} className={s.item}>*/}
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
      </IonContent>
    </IonPage>
  );
};

export default Main;