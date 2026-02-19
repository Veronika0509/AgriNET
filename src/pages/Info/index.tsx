import {IonContent, IonHeader, IonIcon, IonImg, IonPage, IonRow, IonText, IonTitle, IonToolbar, IonButtons, IonButton} from '@ionic/react';
import s from './style.module.css'
import Logo from '../../assets/images/logo.png'
import {star, arrowBackOutline} from "ionicons/icons";
import React from "react";
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

interface InfoProps {
  showHeader?: boolean;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

const Info = (props: InfoProps) => {
  const history = useHistory();
  const { popFromNavigationHistory, setPage } = useAppContext();

  const handleBack = () => {
    const previousPage = popFromNavigationHistory();

    if (previousPage) {
      // Navigate to the previous page from our custom history
      // First navigate with router
      history.push(previousPage.path);

      // Then set page state if different from current (page 0)
      if (previousPage.page !== 0) {
        if (props.setPage) {
          props.setPage(previousPage.page);
        } else {
          setPage(previousPage.page);
        }
      }
    } else {
      // Fallback: navigate to menu if our custom stack is empty
      history.push('/menu');
    }
  };

  return (
    <IonPage>
      {props.showHeader && (
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon slot="icon-only" icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>About</IonTitle>
          </IonToolbar>
        </IonHeader>
      )}
      <IonContent className={s.content}>
        <IonRow class="ion-justify-content-center" className={s.content}>
          <div>
            <a href="https://www.agrinet.us/" target='_blank' className={s.link} rel="noreferrer">
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
