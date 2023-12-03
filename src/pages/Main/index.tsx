import React, { useEffect, useState } from 'react';
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
  IonCardSubtitle, IonText,
} from '@ionic/react';
import Logo from '../../assets/images/logo.png';
import axios from 'axios';
import login from "../Login";
interface MainProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
}

const Main: React.FC<MainProps> = (props) => {
  const [siteList, setSiteList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://app.agrinet.us/api/map/sites', {
          params: {
            userId: props.userId,
          },
        });
        console.log(response.data)
        setSiteList(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [props.userId]);

  const onCardClick = () => {
    props.setPage(2);
  };

  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>List</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList className={s.cardContainer}>
          {siteList.map((cardsArray: { layers: any[] }) => (
            cardsArray.layers.map((cards) => (
              cards.markers.map((card: any) => (
                <IonCard className={s.card} onClick={onCardClick}>
                  <IonCardContent>
                    <IonImg className={s.img} src={Logo} alt="Icon" />
                    <IonCardTitle className="ion-text-center">{card.name}</IonCardTitle>
                    <IonText className={`${s.text} ${'ion-text-center'}`}>{card.chartType}</IonText>
                    <IonText className={`${s.text} ${'ion-text-center'}`}>{card.sensorId}</IonText>
                  </IonCardContent>
                </IonCard>
              ))
            ))
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Main;
