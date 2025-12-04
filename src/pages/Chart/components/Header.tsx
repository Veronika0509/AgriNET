import {IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {back} from "../functions/back";
import s from "../style.module.css";
import {arrowBackOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";
import {addOutline} from "ionicons/icons";
import {timeOutline} from "ionicons/icons";
import {settings} from "ionicons/icons";
import {useAppContext} from "../../../context/AppContext";

interface HeaderProps {
  type: 'chartPage' | 'alarmPage' | 'valveArchiveModal' | 'valveSettingsModal' | 'valveCreateModal' | 'addValveModal'
  chartType?: 'moist' | 'temp' | 'wxet' | 'fuel' | 'valve'
  siteName?: string
  sensorId?: string | number
  moistSensorId?: string | number
  setPage?: (page: number) => void
  setAlarm?: (alarm: boolean) => void
  alarmOddBack?: boolean
  setAlarmOddBack?: (oddBack: boolean) => void
  setChartPageType?: (type: string) => void
  setValveArchive?: (archive: boolean) => void
  setValveSettings?: (settings: boolean) => void
  settingsOddBack?: boolean
  setSettingsOddBack?: (oddBack: boolean) => void
  setSiteId?: (id: string | number) => void
  setAutowater?: (autowater: boolean) => void
  setValveCreate?: (create: boolean) => void
  setIsAddValveOpen?: (open: boolean) => void
}

const Header = (props: HeaderProps) => {
  const history = useHistory();
  const { returnToMapTab, setOpenBudgetEditor, setReturnToMapTab, setBudgetEditorReturnPage, setForceMapTab } = useAppContext();

  const onBackClick = () => {
    if (props.type === 'chartPage') {
      if (props.setPage) {
        setOpenBudgetEditor(false);
        setReturnToMapTab(null);
        setBudgetEditorReturnPage(null);
        setForceMapTab(true);
        back(props.setPage, history, returnToMapTab)
      }
    } else if (props.type === 'alarmPage') {
      props.setAlarm(false)
      if (props.alarmOddBack) {
        props.setAlarmOddBack?.(false)
        props.setChartPageType?.('valve')
      }
    } else if (props.type === 'valveArchiveModal') {
      props.setValveArchive?.(false)
    } else if (props.type === 'valveSettingsModal') {
      props.setValveSettings?.(false)
      if (props.settingsOddBack) {
        props.setSettingsOddBack?.(false)
        props.setChartPageType?.('moist')
        if (props.moistSensorId !== undefined) {
          props.setSiteId?.(props.moistSensorId)
        }
        props.setAutowater?.(true)
      }
    } else if (props.type === 'valveCreateModal') {
      props.setValveCreate?.(false)
    } else if (props.type === 'addValveModal') {
      props.setPage?.(3)
    }
  }

  return (
    <IonHeader data-chart-section="mainHeader">
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
                <>{props.chartType !== 'valve' ? props.chartType === 'fuel' ? (
                      <p>Graphs for<br />{props.siteName} ({props.sensorId})</p>
                    ) :
                    <p className={s.header_titleText}><span>{props.siteName} / </span><span>{props.sensorId}</span></p>
                  : <>{props.sensorId} Valve
                    Scheduler</>}
                </>
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
              {props.type === 'addValveModal' && (
                <>Add Virtual Valve</>
              )}
            </IonTitle>
          </div>
          {props.chartType === 'valve' && (
            <IonButtons className={s.header_valveButtons}>
              <IonButton className={s.header_valveButton} onClick={() => props.setValveCreate?.(true)}>
                <IonIcon icon={addOutline} className={s.header_valveButtonIcon}/>
                Create
              </IonButton>
              <IonButton className={s.header_valveButton} onClick={() => props.setValveArchive?.(true)}>
                <IonIcon icon={timeOutline} className={s.header_valveButtonIcon}/>
                Open archive
              </IonButton>
              <IonButton className={s.header_valveButton} onClick={() => props.setValveSettings?.(true)}>
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
