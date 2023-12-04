import React from 'react'
import s from './style.module.css'
import {
  IonContent,
  IonHeader,
  IonIcon, IonItem,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any;
  setSiteList: any;
  siteId: string
}

const Chart: React.FC<ChartProps> = (props) => {
  const back = () => {
    // props.setPage(1)
    console.log(props.siteList)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonIcon onClick={back} className={`${s.backIcon} ${'ion-margin-start'}`} slot='start' size='large'
                   icon={arrowBackOutline}></IonIcon>
          <IonTitle>Chart</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={s.wrapper}>
          <IonText className={s.daysText}>14 days</IonText>
          {props.siteList.map((cardsArray: { layers: any[] }) => (
            cardsArray.layers.map((cards) => (
              cards.markers.map((card: any) => (
                card.sensorId === props.siteId && card.chartType === 'moist' && (
                  <div className={s.chart}>

                  </div>
                )
              ))
            ))
          ))}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Chart