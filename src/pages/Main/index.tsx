import React from 'react'
import s from './style.module.css'
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonImg, IonCardContent, IonCardTitle, IonCardSubtitle
} from "@ionic/react";
import Logo from '../../assets/images/logo.png'

interface Main {
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Main: React.FC<Main> = (props) => {
  const onCardClick = () => {
    props.setPage(2)
  }
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>List</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList className={s.cardContainer}>
          <IonCard className={s.card} onClick={onCardClick}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
          <IonCard className={s.card}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
          <IonCard className={s.card}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
          <IonCard className={s.card}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
          <IonCard className={s.card}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
          <IonCard className={s.card}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
          <IonCard className={s.card}>
            <IonCardContent>
              <IonImg className={s.img} src={Logo} alt='Icon' />
              <IonCardTitle className='ion-text-center'>Sensor 1</IonCardTitle>
              <IonCardSubtitle className='ion-text-center'>The Sensor is very good</IonCardSubtitle>
            </IonCardContent>
          </IonCard>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Main