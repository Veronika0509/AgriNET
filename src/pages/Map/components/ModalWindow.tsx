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

interface ModalWindowProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  sensorName: string;
  sensorId: string;
  sensorChartType: string;
  isChartDataIsLoading: boolean;
  isSelectDisabled: boolean;
  onSensorClick: (
    sensorId: string,
    sensorName: string,
    sensorIdParam: string | number,
    setChartData: (data: unknown) => void,
    setPage: (page: number) => void,
    setSiteId: (id: string | number) => void,
    setSiteName: (name: string) => void
  ) => void;
  setChartData: (data: unknown) => void;
  setPage: (page: number) => void;
  setSiteId: (id: string | number) => void;
  setSiteName: (name: string) => void;
}

const ModalWindow = (props: ModalWindowProps) => {
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
            <IonButton expand="block" className={s.modal_button} disabled={props.isSelectDisabled}
                       onClick={() => props.onSensorClick(props.sensorId, props.sensorName, props.sensorId, props.setChartData, props.setPage, props.setSiteId, props.setSiteName)}>Select</IonButton>
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}

export default ModalWindow