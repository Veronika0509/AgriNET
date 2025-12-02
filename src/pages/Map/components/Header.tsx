import React, {useEffect} from 'react'
import s from "../style.module.css";
import {IonHeader, IonIcon, IonTitle, IonToolbar, IonButtons} from "@ionic/react";
import {arrowBackOutline, menuOutline} from "ionicons/icons";
import { useHistory } from 'react-router-dom';

interface HeaderProps {
  isMarkerClicked: boolean;
  setIsMarkerClicked: (clicked: boolean) => void;
  reloadMapPage: () => void;
  setPage: (page: number) => void;
  navigationHistory: string[];
  setNavigationHistory: (history: string[]) => void;
  isMobileScreen?: boolean;
  isLayerListVisible?: boolean;
  hasLayersToShow?: boolean;
  toggleLayerList?: () => void;
  [key: string]: unknown;
}

const Header = (props: HeaderProps) => {
  const history = useHistory();
  const back = () => {
    if (props.isMarkerClicked) {
      props.setIsMarkerClicked(false)
      // Don't call reloadMapPage() - let the cleanup effect in Map component handle everything
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
      // Reset marker clicked state when navigating back to map
      if (previousPage === 'map') {
        props.setIsMarkerClicked(false);
      }
      props.setActiveTab(previousPage);
    } else {
      // Reset marker clicked state when navigating to map
      props.setIsMarkerClicked(false);
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
            {props.isMobileScreen && !props.isLayerListVisible && props.hasLayersToShow && props.toggleLayerList && (
              <IonButtons slot='end'>
                <IonIcon
                  onClick={props.toggleLayerList}
                  className={s.headerMenuIconButton}
                  size='large'
                  icon={menuOutline}
                ></IonIcon>
              </IonButtons>
            )}
          </>
        )}
        {props.activeTab === 'info' && (
          <IonTitle>About</IonTitle>
        )}
        {(props.activeTab === 'budgetEditor' || props.activeTab === 'budget') && (
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
        {props.activeTab === 'add' && (
          <>
            <IonIcon
              onClick={onBudgetEditorBack}
              className={`${s.header_backIcon} ${'ion-margin-start'}`}
              slot='start'
              size='large'
              icon={arrowBackOutline}
            ></IonIcon>
            <IonTitle>Add Unit</IonTitle>
          </>
        )}
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
