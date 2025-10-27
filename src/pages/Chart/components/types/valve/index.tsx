import {IonButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner, useIonAlert, useIonToast} from "@ionic/react";
import s from './style.module.css'
import {trash} from "ionicons/icons";
import React, {useEffect, useState} from "react";
import {Archive} from "./components/Archive";
import {refreshOutline} from "ionicons/icons";
import '../../../../../App.css'
import {getValveData} from "../../../../Map/data/types/valve/getValveData";
import {Settings} from "./components/Settings";
import {setValveNowTime} from "../../../data/types/valve/setValveNowTime";
import {getValveConfig} from "../../../data/types/valve/getValveConfig";
import {deleteValveRecord} from "../../../data/types/valve/deleteValveRecord";
import {Create} from "./components/Create";

interface ValveChartPageProps {
  sensorId: string | number;
  userId: string | number;
  chartData: unknown[];
  [key: string]: unknown;
}

interface ValveConfig {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

interface ValveDataItem {
  id: string | number;
  localTime: string;
  duration: string;
  [key: string]: unknown;
}

export const ValveChartPage = (props: ValveChartPageProps) => {
  const [currentData, setCurrentData] = useState<ValveDataItem[]>([])
  const [config, setConfig] = useState<ValveConfig | undefined>()
  const [presentSetNowAlert] = useIonAlert();
  const [presentDeleteAlert] = useIonAlert();
  const [presentDone] = useIonToast();

  const updateData = async () => {
    const newData = await getValveData(props.sensorId, props.userId)
    setCurrentData(newData.data)
  }
  useEffect(() => {
    if (currentData.length === 0) {
      setCurrentData(props.chartData as ValveDataItem[])
      const getConfig = async () => {
        const newConfig = await getValveConfig(props.sensorId)
        setConfig(newConfig.data)
      }
      getConfig()
      
    }
  }, []);


  const onNowClick = (id: number) => {
    const timezone: string = 'America/Los_Angeles'
    presentSetNowAlert({
      header: 'Confirmation',
      message: `Are you sure want to set time to now by ${timezone} in this record?`,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
      }, {
        text: 'Confirm',
        role: 'confirm',
        handler: async () => {
          const response = await setValveNowTime(id, timezone, props.userId)
          if (response.status === 200) {
            updateData()
            presentDone({
              message: 'Done',
              duration: 3000,
              position: 'bottom',
            });
          }
        },
      }]
    })
  }

  const onDeleteClick = (id: number) => {
    presentDeleteAlert({
      header: 'Delete confirmation',
      message: `Are you sure want to delete this record?`,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
      }, {
        text: 'Confirm',
        role: 'confirm',
        handler: async () => {
          const deleteResponse = await deleteValveRecord(id, props.userId)
          if (deleteResponse.status === 200) {
            updateData()
            presentDone({
              message: 'Done',
              duration: 3000,
              position: 'bottom',
            });
          }
        },
      }]
    })
  }

  const getValidationText = (validate: number) => {
    let validateText;
    switch (validate) {
      case 0:
        validateText = "Scheduled";
        break;
      case 6:
        validateText = "Success";
        break;
      case 7:
        validateText = "Failure";
        break;
      default:
        validateText = "In progress";
        break;
    }
    return validateText
  }


  return (
    <IonContent className={s.valveChartPage}>
      <div className={s.tableContainer}>
        <table className={s.table}>
          <thead>
          <tr className={s.tableHeadRow}>
            <th className={s.tableHeadTitle}>Time</th>
            <th
              className={s.tableHeadTitle}>{config && config.names[0] && props.sensorId ? config.names[0] : 'Valve'}</th>
            <th className={s.tableHeadTitle}>Validate</th>
            <th className={s.tableHeadTitle}></th>
          </tr>
          </thead>
        </table>
        <div className={s.tableBodyContainer}>
          <table className={s.table}>
            <tbody>
            {currentData && currentData.map((tableItem: ValveDataItem, index: number) => (
              <tr key={index} className={s.tableItem}>
                <td className={s.tableRowItem}>{tableItem.localTime && tableItem.localTime.slice(0, -5)}</td>
                <td className={`${s.tableRowItem} ${tableItem.valve1 === 'OFF' ? s.off : s.on}`}>
                  {tableItem.valve1}
                </td>
                <td className={s.tableRowItem}>
                  {tableItem.validate} {getValidationText(tableItem.validate)}
                </td>
                <td className={s.tableRowItem}>
                  <IonButtons className={s.buttonContainer}>
                    <IonButton color='primary' className={s.nowButton}
                               onClick={() => onNowClick(tableItem.id)}>Now</IonButton>
                    <IonButton onClick={() => onDeleteClick(tableItem.id)}>
                      <IonIcon icon={trash} slot='icon-only' color='primary'></IonIcon>
                    </IonButton>
                  </IonButtons>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={4}>
                <div className={s.tableArchiveButton}>
                  <IonButtons>
                    <IonButton onClick={() => props.setValveArchive(true)} color='primary'>Archive</IonButton>
                  </IonButtons>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <IonButton shape='round' className={s.refreshButton} onClick={updateData}>
        <IonIcon slot="icon-only" icon={refreshOutline} className={s.refreshIcon}></IonIcon>
      </IonButton>
      <Archive sensorId={props.sensorId} valveArchive={props.valveArchive} setValveArchive={props.setValveArchive}/>
      <Settings sensorId={props.sensorId} valveSettings={props.valveSettings} setValveSettings={props.setValveSettings}
                siteList={props.siteList} setLowSelectedSensor={props.setLowSelectedSensor}
                setLowSetpoint={props.setLowSetpoint} setIsEnableActionSheet={props.setIsEnableActionSheet}
                setIsEnabledToastOpen={props.setIsEnabledToastOpen}
                setIsDisabledToastOpen={props.setIsDisabledToastOpen}
                isSetpointEnabled={props.isSetpointEnabled} setIsSetpointEnabled={props.setIsSetpointEnabled}
                setAdditionalChartData={props.setAdditionalChartData} setChartData={props.setChartData}
                setSiteId={props.setSiteId} setSiteName={props.setSiteName} setChartPageType={props.setChartPageType}
                setAlarm={props.setAlarm} alarmOddBack={props.alarmOddBack} setAlarmOddBack={props.setAlarmOddBack}
                settingsOddBack={props.settingsOddBack} setSettingsOddBack={props.setSettingsOddBack} userId={props.userId}
                setAutowater={props.setAutowater} />
      <Create sensorId={props.sensorId} valveCreate={props.valveCreate} setValveCreate={props.setValveCreate}
              config={config} userId={props.userId} />
      
    </IonContent>
  )
}