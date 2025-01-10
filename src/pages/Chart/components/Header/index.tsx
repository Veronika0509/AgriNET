import React, { useState } from 'react'
import {IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, IonPopover} from "@ionic/react";
import { useMediaQuery } from '@react-hook/media-query'
import {back} from "../../functions/back";
import s from "../../style.module.css";
import {arrowBackOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";
import {addOutline} from "ionicons/icons";
import {trash} from "ionicons/icons";
import {timeOutline} from "ionicons/icons";
import {settings} from "ionicons/icons";

const Header = (props: any) => {
  const history = useHistory();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const onBackClick = () => {
    if (props.type === 'chartPage') {
      back(props.setPage, history)
    } else if (props.type === 'alarmPage') {
      props.setAlarm(false)
    } else {
      props.setValveArchive(false)
    }
  }

  return (
    <IonHeader>
      <IonToolbar className={`${props.chartType === 'valve' && s.header_valveToolbar}`}>
        <IonIcon
          onClick={onBackClick}
          className={`${s.header_backIcon} ${'ion-margin-start'}`}
          slot='start'
          size='large'
          icon={arrowBackOutline}
        ></IonIcon>
        <IonTitle>
          {props.type === 'chartPage' && (
            <>{props.chartType !== 'valve' ? <>{props.siteName} / {props.sensorId}</> : <>{props.sensorId} Valve
              Scheduler</>}</>
          )}
          {props.type === 'alarmPage' && (
            <>Alarm Configuration</>
          )}
          {props.type === 'valveArchiveModal' && (
            <>{props.sensorId} Valve Scheduler Archive</>
          )}
        </IonTitle>
        {props.chartType === 'valve' && (
          <>
            {isMobile ? (
              <IonButtons slot='end'>
                <IonButton
                  onClick={(e) => {
                    e.persist();
                    setPopoverEvent(e);
                    setShowPopover(true);
                  }}
                >
                  <IonIcon icon={settings} className={s.header_valveButtonIcon}></IonIcon>
                </IonButton>
                <IonPopover
                  isOpen={showPopover}
                  event={popoverEvent}
                  onDidDismiss={() => setShowPopover(false)}
                >
                  <IonButton expand="block" fill="clear">
                    <IonIcon icon={addOutline} slot="start"></IonIcon>
                    Create
                  </IonButton>
                  <IonButton expand="block" fill="clear">
                    <IonIcon icon={trash} slot="start"></IonIcon>
                    Clear
                  </IonButton>
                  <IonButton expand="block" fill="clear" onClick={() => {
                    props.setValveArchive(true);
                    setShowPopover(false);
                  }}>
                    <IonIcon icon={timeOutline} slot="start"></IonIcon>
                    Open archive
                  </IonButton>
                  <IonButton expand="block" fill="clear">
                    <IonIcon icon={settings} slot="start"></IonIcon>
                    Settings
                  </IonButton>
                </IonPopover>
              </IonButtons>
            ) : (
              <IonButtons slot='end' className={s.header_valveButtons}>
                <IonButton>
                  <IonIcon icon={addOutline} className={s.header_valveButtonIcon}></IonIcon>
                  Create
                </IonButton>
                <IonButton>
                  <IonIcon icon={trash} className={s.header_valveButtonIcon}></IonIcon>
                  Clear
                </IonButton>
                <IonButton onClick={() => props.setValveArchive(true)}>
                  <IonIcon icon={timeOutline} className={s.header_valveButtonIcon}></IonIcon>
                  Open archive
                </IonButton>
                <IonButton>
                  <IonIcon icon={settings} className={s.header_valveButtonIcon}></IonIcon>
                  Settings
                </IonButton>
              </IonButtons>
            )}
          </>
        )}
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
