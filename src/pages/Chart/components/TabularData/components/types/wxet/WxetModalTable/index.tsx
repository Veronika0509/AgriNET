import {IonButton, IonButtons, IonContent, IonHeader, IonModal, IonText, IonToolbar} from "@ionic/react";
import s from "../../../../../types/moist/style.module.css";
import React from "react";

interface wxetModalTableProps {
  setData: any,
  setIsWxetModalOpen: any
  modal: any,
  isWxetModalOpen: boolean,
  data: any,
  isWxetMobile: any
}

export const WxetModalTable: React.FC<wxetModalTableProps> = ({setData, setIsWxetModalOpen, modal, isWxetModalOpen, data, isWxetMobile}) => {
  const onWxetModalCancelClick = () => {
    setData(null)
    setIsWxetModalOpen(false)
  }

  return (
    <IonModal ref={modal} isOpen={isWxetModalOpen}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onWxetModalCancelClick}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <table className={s.mainTempWxetTabularDataTable}>
          <thead className={s.mainTabularDataTableThead}>
          <tr className={s.mainWxetTabularDataTableTh}>
            {Array.from({length: data.sensorCount}, (_, index) => (
              <React.Fragment key={`sensor-group-${index}`}>
                <th className={s.mainTabularDataTableTh}>Time</th>
                <th className={s.mainTabularDataTableTh}>Solar Radiation</th>
                <th className={s.mainTabularDataTableTh}>RH</th>
                <th className={s.mainTabularDataTableTh}>Air Temp</th>
                <th className={s.mainTabularDataTableTh}>Rain</th>
                <th className={s.mainTabularDataTableTh}>Wind Speed</th>
                <th className={s.mainTabularDataTableTh}>Wind Gust</th>
                <th className={s.mainTabularDataTableTh}>Leaf Wetness</th>
                <th className={s.mainTabularDataTableTh}>GDD</th>
                <th className={s.mainTabularDataTableTh}>AGDD</th>
              </React.Fragment>
            ))}
          </tr>
          </thead>
          <tbody className={s.mainTabularDataTableTbody}>
          {data.data.map((row: any, index: number) => (
            <tr key={index} className={`${s.mainTabularDataTableTr} ${'ion-margin-top'}`}>
              <td data-label={'Time'}
                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText} ${s.mainTempWxetTabularDataTableTdBlack}`}>{row.DateTime}</td>
              {Array.from({length: data.sensorCount}, (_, sensorIndex) =>
                <React.Fragment key={`sensor-fragment-${sensorIndex}`}>
                  <td data-label={'Solar Radiation'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.solar_display === 0 ? '0' : row.solar_display}</td>
                  <td data-label={'RH'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.RH === 0 ? '0' : row.RH}</td>
                  <td data-label={'Air Temp'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.Temp === 0 ? '0' : row.Temp}</td>
                  <td data-label={'Rain'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.rain_display === 0 ? '0' : row.rain_display}</td>
                  <td data-label={'Wind Speed'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.wind_display === 0 ? '0' : row.wind_display}</td>
                  <td data-label={'Wind Gust'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.gust_display === 0 ? '0' : row.gust_display}</td>
                  <td data-label={'Leaf Wetness'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.LW === 0 ? '0' : row.LW}</td>
                  <td data-label={'GDD'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.gdd === 0 ? '0' : row.gdd}</td>
                  <td data-label={'AGDD'}
                      className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.agdd === 0 ? '0' : row.agdd}</td>
                </React.Fragment>
              )}
            </tr>
          ))}
          </tbody>
        </table>
        {isWxetMobile && (
          <IonText>You can see only two weeks data on mobile platform. To see full dataset use browser.</IonText>
        )}
      </IonContent>
    </IonModal>
  )
}