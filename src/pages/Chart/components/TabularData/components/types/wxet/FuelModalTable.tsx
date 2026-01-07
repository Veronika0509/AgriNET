import {IonButton, IonButtons, IonContent, IonHeader, IonModal, IonToolbar} from "@ionic/react";
import s from "../../../../types/moist/style.module.css";

export const FuelModalTable = (props: any) => {
  const onFuelModalCancelClick = () => {
    props.setData(null)
    props.setIsFuelModalOpen(false)
  }

  return (
    <IonModal ref={props.modal} isOpen={props.isFuelModalOpen}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onFuelModalCancelClick}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.fuelTable_content}>
        {props.data.items && props.data.items.length > 1 ? (
          <div>
            {props.data.items.map((item: any) => (
              <div>
                {item.gddPlantDate && (
                  <p className={s.fuelTable_text}>Base: {item.gddBaseTemp}˚F,
                    Cutoff: {item.gddCutoffTemp}˚F, PlantDate: {item.gddPlantDate}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {props.data.items[0].gddPlantDate && (
              <p className={s.fuelTable_text}>Base: {props.data.items[0].gddBaseTemp}˚F,
                Cutoff: {props.data.items[0].gddCutoffTemp}˚F, PlantDate: {props.data.items[0].gddPlantDate}</p>
            )}
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}