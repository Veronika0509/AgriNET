import React from 'react'
import {IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
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
      </IonToolbar>
    </IonHeader>
  )
}

export default Header