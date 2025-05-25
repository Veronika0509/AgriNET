import React, {useEffect} from 'react'
import s from "../style.module.css";
import {IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import { useHistory } from 'react-router-dom';

const Header = (props: any) => {
  const history = useHistory();
  const back = () => {
    if (props.isMarkerClicked) {
      props.setIsMarkerClicked(false)
      props.reloadMapPage()
    } else {
      history.push('/AgriNET/');
      props.setPage(0);
      window.location.reload()
    }
  };
  const onBudgetEditorBack = () => {
    if (props.navigationHistory.length > 1) {
      const newHistory = [...props.navigationHistory];
      newHistory.pop()
      const previousPage = newHistory[newHistory.length - 1];
      props.setNavigationHistory(newHistory);
      props.setActiveTab(previousPage);
    } else {
      props.setActiveTab('map');
    }
  }

  return (
    <IonHeader className={s.header}>
      <IonToolbar>
        {props.activeTab === 'map' && (
          <>
            <IonIcon
              onClick={back}
              className={`${s.header_backIcon} ${'ion-margin-start'}`}
              slot='start'
              size='large'
              icon={arrowBackOutline}
            ></IonIcon>
            <IonTitle>{props.isMarkerClicked ? `Fields of ${props.isMarkerClicked}` : 'Site Map'}</IonTitle>
          </>
        )}
        {props.activeTab === 'info' && (
          <IonTitle>About</IonTitle>
        )}
        {props.activeTab === 'budgetEditor' && (
          <>
            <IonIcon
              onClick={onBudgetEditorBack}
              className={`${s.header_backIcon} ${'ion-margin-start'}`}
              slot='start'
              size='large'
              icon={arrowBackOutline}
            ></IonIcon>
            <IonTitle>Budget Lines Editor</IonTitle>
          </>
        )}
        {props.activeTab === 'comments' && (
          <>
            <IonIcon
              onClick={onBudgetEditorBack}
              className={`${s.header_backIcon} ${'ion-margin-start'}`}
              slot='start'
              size='large'
              icon={arrowBackOutline}
            ></IonIcon>
            <IonTitle>Comments</IonTitle>
          </>
        )}
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
