import {IonButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner} from "@ionic/react";
import s from './style.module.css'
import {trash} from "ionicons/icons";
import React, {useEffect, useState} from "react";
import {Archive} from "./components/Archive";
import {refreshOutline} from "ionicons/icons";
import '../../../../../App.css'
import {getValvetData} from "../../../../Map/data/types/valve/getValvetData";

export const ValveChartPage = (props: any) => {
  const [currentData, setCurrentData] = useState([])
  const updateData = async () => {
    const newData = await getValvetData(props.sensorId, props.userId)
    setCurrentData(newData.data)
  }
  useEffect(() => {
    setCurrentData(props.chartData)
  }, []);
  return (
    <IonContent className={s.valveChartPage}>
      <div className={s.tableContainer}>
        <table className={s.table}>
          <thead>
          <tr className={s.tableHeadRow}>
            <th className={s.tableHeadTitle}>Time</th>
            <th className={s.tableHeadTitle}>Lemon Tree</th>
            <th className={s.tableHeadTitle}>Validate</th>
            <th className={s.tableHeadTitle}></th>
          </tr>
          </thead>
        </table>
        <div className={s.tableBodyContainer}>
          <table className={s.table}>
            <tbody>
            {currentData.map((tableItem: any, index: number) => (
              <tr key={index} className={s.tableItem}>
                <td className={s.tableRowItem}>{tableItem.localTime.slice(0, -5)}</td>
                <td className={`${s.tableRowItem} ${tableItem.valve1 === 'OFF' ? s.off : s.on}`}>
                  {tableItem.valve1}
                </td>
                <td className={s.tableRowItem}>
                  {tableItem.validate} Success
                </td>
                <td className={s.tableRowItem}>
                  <IonButtons className={s.buttonContainer}>
                    <IonButton color='primary' className={s.nowButton}>Now</IonButton>
                    <IonButton>
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
      <Archive sensorId={props.sensorId} valveArchive={props.valveArchive} setValveArchive={props.setValveArchive} />
    </IonContent>
  )
}

