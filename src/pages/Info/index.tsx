import {IonContent, IonHeader, IonIcon, IonImg, IonPage, IonRow, IonText, IonTitle, IonToolbar} from '@ionic/react';
import s from './style.module.css'
import Logo from '../../assets/images/logo.png'
import {star} from "ionicons/icons";
import React from "react";

const Info: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.content}>
        <IonRow class="ion-justify-content-center" className={s.content}>
          <div>
            <a href="https://www.agrinet.us/" target='_blank' className={s.link}>
              <IonImg className={s.img} src={Logo} alt='Logo'/>
            </a>
            <a className={`${s.linkText} ${s.text} ${'ion-margin-top'}`} href="https://www.agrinet.us/">tuctronics.com</a>
            <h1 className={`${s.text} ${s.title} ${'ion-margin-top'}`}>Todd Tucker</h1>
            <IonText className={`${s.text} ${'ion-margin-top'}`}>Tuctronics, CTO</IonText>
            <IonText className={s.text}>Project Manager, System Deployment</IonText>
            <a href="tel:5093010640" className={`${s.text} ${'ion-margin-top'}`}>(509) 301-0640</a>
            <a href="mailto:todd@tuctronics.com" className={`${s.text} ${'ion-margin-top'}`}>todd@tuctronics.com</a>
            <IonText className={`${s.text} ${'ion-margin-top'}`}>Version: 42.2.1 prod</IonText>
            <div className={s.stars}>
              <IonIcon icon={star} color={'light'} className={`${s.star} ${'ion-margin-top'}`} size="large"/>
              <IonIcon icon={star} color={'light'} className={`${s.star} ${'ion-margin-top'}`} size="large"/>
              <IonIcon icon={star} color={'light'} className={`${s.star} ${'ion-margin-top'}`} size="large"/>
              <IonIcon icon={star} color={'light'} className={`${s.star} ${'ion-margin-top'}`} size="large"/>
              <IonIcon icon={star} color={'light'} className={`${s.star} ${'ion-margin-top'}`} size="large"/>
            </div>
          </div>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Info;
