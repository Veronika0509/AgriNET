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
      if (props.alarmOddBack) {
        props.setAlarmOddBack(false)
        props.setChartPageType('valve')
      }
    } else if (props.type === 'valveArchiveModal') {
      props.setValveArchive(false)
    } else if (props.type === 'valveSettingsModal') {
      props.setValveSettings(false)
      if (props.settingsOddBack) {
        props.setSettingsOddBack(false)
        props.setChartPageType('moist')
        props.setSiteId(props.moistSensorId)
        props.setAutowater(true)
      }
    } else if (props.type === 'valveCreateModal') {
      props.setValveCreate(false)
    }
  }

  return (
    <IonHeader>
      <IonToolbar className={s.header_mainToolbar}>
        <div className={s.header_contentWrapper}>
          <div className={s.header_titleSection}>
            <IonButtons slot="start">
              <IonIcon
                onClick={onBackClick}
                className={s.header_backIcon}
                size='large'
                icon={arrowBackOutline}
              />
            </IonButtons>
            <IonTitle className={s.header_title}>
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
              {props.type === 'valveSettingsModal' && (
                <>{props.sensorId} Settings</>
              )}
              {props.type === 'valveCreateModal' && (
                <>Create Scheduler</>
              )}
            </IonTitle>
          </div>
          {props.chartType === 'valve' && (
            <IonButtons className={s.header_valveButtons}>
              <IonButton className={s.header_valveButton} onClick={() => props.setValveCreate(true)}>
                <IonIcon icon={addOutline} className={s.header_valveButtonIcon}/>
                Create
              </IonButton>
              <IonButton className={s.header_valveButton} onClick={() => props.setValveArchive(true)}>
                <IonIcon icon={timeOutline} className={s.header_valveButtonIcon}/>
                Open archive
              </IonButton>
              <IonButton className={s.header_valveButton} onClick={() => props.setValveSettings(true)}>
                <IonIcon icon={settings} className={s.header_valveButtonIcon}/>
                Settings
              </IonButton>
            </IonButtons>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
