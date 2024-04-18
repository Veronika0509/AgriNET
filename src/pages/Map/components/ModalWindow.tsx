import React from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList, IonModal,
  IonText,
  IonToolbar
} from "@ionic/react";
import s from "../style.module.css";

const ModalWindow = (props: any) => {
  return (
    <IonModal isOpen={props.isModalOpen}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => props.setIsModalOpen(false)}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList lines="full">
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h2>Name:</h2>
              <p>{props.sensorName}</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h2>Sensor Id:</h2>
              <p>{props.sensorId}</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel className="ion-text-wrap">
              <h2>Type:</h2>
              <p>{props.sensorChartType}</p>
            </IonLabel>
          </IonItem>
        </IonList>
        {props.isChartDataIsLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {props.isSelectDisabled && <IonText color='danger'>Sorry, but the chart is still in development.</IonText>}
            <IonButton expand="block" className={s.modalButton} disabled={props.isSelectDisabled}
                       onClick={() => props.onSensorClick(props.sensorId, props.sensorName, props.sensorId, props.setChartData, props.setPage, props.setSiteId, props.setSiteName)}>Select</IonButton>
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}

export default ModalWindow