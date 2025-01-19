import s from "../style.module.css";
import Header from "../../../Header";
import {IonContent, IonDatetime, IonDatetimeButton, IonItem, IonLabel, IonModal, IonSpinner} from "@ionic/react";
import React, {useCallback, useEffect, useRef, useState} from "react";

export const Create = (props: any) => {
  return (
    <IonModal isOpen={props.valveCreate} className={s.createModal}>
      <Header type='valveCreateModal' sensorId={props.sensorId} setValveCreate={props.setValveCreate}/>
      <IonContent>
        <div className={s.createModalContent}>
          <IonItem className={s.createModalItem}>{props.config?.names[0] ? props.config?.names[0] : 'Valve'}</IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Duration</IonLabel>
            <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true}>
              <IonDatetime id="datetime" className={s.createModalItemDatetime} presentation='time'></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={s.createModalItem}></IonItem>
          <IonItem className={s.createModalItem}></IonItem>
          <IonItem className={s.createModalItem}></IonItem>
          <IonItem className={s.createModalItem}></IonItem>
        </div>
      </IonContent>
    </IonModal>
  )
}