import React, {useEffect, useState} from 'react';
import s from './style.module.css';
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonList,
  IonCard,
  IonImg,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle, IonText, IonItem, IonLabel, IonNavLink,
} from '@ionic/react';
import Logo from '../../assets/images/logo.png';
import axios from 'axios';
import login from "../Login";
import Chart from "../Chart";

interface MainProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
  siteList: any;
  setSiteList: any;
  setSiteId: React.Dispatch<React.SetStateAction<string>>;
}

const Main: React.FC<MainProps> = (props) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://app.agrinet.us/api/map/sites', {
          params: {
            userId: props.userId,
          },
        });
        props.setSiteList(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  });

  const onCardClick = (id: string) => {
    props.setPage(2)
    props.setSiteId(id)
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className={s.cardContainer}>
          <IonItem className={s.lightItem}>
            <IonText color='light' className={s.text}>Name</IonText>
            <IonText color='light' className={s.text}>Type</IonText>
            <IonText color='light' className={s.text}>Id</IonText>
          </IonItem>
          {props.siteList.map((cardsArray: { layers: any[] }) => (
            cardsArray.layers.map((cards) => (
              cards.markers.map((card: any) => (
                <IonItem onClick={() => onCardClick(card.sensorId)} className={s.item}>
                  <IonText className={s.text}>{card.name}</IonText>
                  <IonText className={s.text}>{card.chartType}</IonText>
                  <IonText className={s.text}>{card.sensorId}</IonText>
                </IonItem>
              ))
            ))
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Main;
