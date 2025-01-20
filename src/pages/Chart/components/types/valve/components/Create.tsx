import s from "../style.module.css";
import Header from "../../../Header";
import {
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonDatetimeButton, IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect, IonSelectOption,
  IonSpinner
} from "@ionic/react";
import React, {useCallback, useEffect, useRef, useState} from "react";

export const Create = (props: any) => {
  const [isPulseIrrigation, setIsPulseIrrigation] = useState(false)
  const startTime = new Date(new Date().getTime() + 2 * 60 * 1000)
  const stopTime = new Date(startTime.getTime() + 6 * 60 * 60 * 1000)

  return (
    <IonModal isOpen={props.valveCreate} className={s.createModal}>
      <Header type='valveCreateModal' sensorId={props.sensorId} setValveCreate={props.setValveCreate}/>
      <IonContent>
        <div className={s.createModalContent}>
          <IonItem className={s.createModalItem}>{props.config?.names[0] ? props.config?.names[0] : 'Valve'}</IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Duration</IonLabel>
            <IonDatetimeButton datetime="durationDatetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
              <IonDatetime id="durationDatetime" presentation='time' show-default-buttons="true" value={'06:00'}></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Start Time</IonLabel>
            <IonDatetimeButton datetime="startDatetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
              <IonDatetime id="startDatetime" presentation='date-time' show-default-buttons="true" value={startTime.toISOString()}></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Stop Time</IonLabel>
            <IonDatetimeButton datetime="stopDatetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
              <IonDatetime id="stopDatetime" presentation='date-time' show-default-buttons="true" value={stopTime.toISOString()}></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={`${s.createModalItem} ${s.createTimezoneItem}`}>
            <IonLabel className={s.createModalItemLabel}>Current timezone</IonLabel>
            <IonSelect placeholder="Timezone">
              {Intl.supportedValuesOf('timeZone').map((timezone: any) => (
                <IonSelectOption value={timezone}>{timezone}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem className={s.createModalItem}>
            <IonCheckbox value={isPulseIrrigation} onIonChange={() => setIsPulseIrrigation(!isPulseIrrigation)} className={s.createModalItemCheckbox}>Pulse Irrigation</IonCheckbox>
          </IonItem>
          {isPulseIrrigation && (
            <>
            <IonItem className={`${s.createModalItem} ${s.createPulseCountItem}`}>
              <IonInput label="Pulse Count" type='number'></IonInput>
            </IonItem>
            </>
          )}
        </div>
      </IonContent>
    </IonModal>
  )
}
