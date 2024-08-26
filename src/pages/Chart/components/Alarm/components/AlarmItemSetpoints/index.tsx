import {IonActionSheet, IonButton, IonItem, IonText, IonToast, useIonAlert, useIonToast} from "@ionic/react";
import s from '../../../../style.module.css'
import React, {useEffect, useState} from "react";
import {enableSetpoint} from "../../data/setpoints/enableSetpoint";
import {onSensorChange} from "../../data/setpoints/onSensorChange";
import {onSetpointChange} from "../../data/setpoints/onSetpointChange";
import {onSensorSelect} from "../../functions/setpoints/onSensorSelect";
import {onSetpointSubmit} from "../../functions/setpoints/onSetpointSubmit";
import {presentSetpointChangeAlert} from "../../functions/setpoints/presentSetpointChangeAlert";
import {onEnableCLick} from "../../functions/setpoints/onEnableClick";
import {presentTelOrEmail} from "../../functions/telOrEmail/presentTelOrEmail";

export const AlarmItemSetpoints = (props: any) => {
  const [presentAlert] = useIonAlert();
  const [presentSelectToast] = useIonToast();
  const [presentSetpointToast] = useIonToast();
  const [presentErrorAlert] = useIonAlert();
  const [isEnableActionSheet, setIsEnableActionSheet] = useState(false)
  const [isEnabledToastOpen, setIsEnabledToastOpen] = useState(false)
  const [isDisabledToastOpen, setIsDisabledToastOpen] = useState(false)
  let initialSensorActionSheetButtonsArray: any = Object.values(props.fieldsLabelsData)
  let sensorActionSheetButtons: any = []

  initialSensorActionSheetButtonsArray.map((buttonString: string) => {
    sensorActionSheetButtons.push({
      text: buttonString,
      handler: () => onSensorSelect(
        props.fieldsLabelsData,
        props.name,
        props.sensorId,
        props.setSelectedSensor,
        presentSelectToast,
        buttonString
      )
    })
  })
  sensorActionSheetButtons.push({
    text: 'Cancel',
    role: 'cancel',
    data: {
      action: 'cancel',
    },
  },)

  return (
    <IonItem className={s.alarmItemContainer}>
      <div className={s.alarmItem}>
        <IonText>{props.name}</IonText>
        <div className={s.alarmSetContainer}>
          <IonButton fill='clear' color='light' id={'sensor-' + props.name}>{props.selectedSensor}</IonButton>
          <IonActionSheet
            trigger={'sensor-' + props.name}
            header="Select Sensor"
            buttons={sensorActionSheetButtons}
          ></IonActionSheet>
          <IonButton fill='clear' color='light' onClick={() => presentSetpointChangeAlert(presentAlert, props.name, props.sensorId, props.setSetpoint, presentSetpointToast)}>{props.setpoint}</IonButton>
          <IonButton fill={props.isSetpointEnabled ? 'clear' : 'solid'} onClick={
            () => onEnableCLick(props.sensorId, props.name, props.isSetpointEnabled, props.setIsSetpointEnabled, setIsEnabledToastOpen, setIsDisabledToastOpen, setIsEnableActionSheet)
          }>
            {props.isSetpointEnabled ? 'Disable' : 'Enable'}
          </IonButton>
          <IonActionSheet
            isOpen={isEnableActionSheet}
            header="Action Type"
            buttons={[
              {
                text: 'Email',
                handler: () => presentTelOrEmail(
                  props.sensorId,
                  1,
                  props.setEmailOrTel,
                  presentErrorAlert,
                  presentAlert,
                  'email',
                  undefined,
                  props.name,
                  props.setIsSetpointEnabled,
                  setIsEnabledToastOpen,
                  setIsDisabledToastOpen,
                  setIsEnableActionSheet
                )
              },              {
                text: 'SMS',
                handler: () => presentTelOrEmail(
                  props.sensorId,
                  1,
                  props.setEmailOrTel,
                  presentErrorAlert,
                  presentAlert,
                  'sms',
                  undefined,
                  props.name,
                  props.setIsSetpointEnabled,
                  setIsEnabledToastOpen,
                  setIsDisabledToastOpen,
                  setIsEnableActionSheet
                )
              },
              {
                text: 'Cancel',
                role: 'cancel',
                data: {
                  action: 'cancel',
                },
              },
            ]}
            onDidDismiss={() => setIsEnableActionSheet(false)}
          ></IonActionSheet>
          <IonToast
            isOpen={isEnabledToastOpen}
            onDidDismiss={() => setIsEnabledToastOpen(false)}
            onWillPresent={() => {
              if (isDisabledToastOpen) {
                setIsDisabledToastOpen(false)
              }
            }}
            message={props.name + ' Setpoint Enabled'}
            duration={3000}
            position='bottom'
          />
          <IonToast
            isOpen={isDisabledToastOpen}
            onWillPresent={() => {
              if (isEnabledToastOpen) {
                setIsEnabledToastOpen(false)
              }
            }}
            onDidDismiss={() => setIsDisabledToastOpen(false)}
            message={props.name + ' Setpoint Disabled'}
            duration={3000}
            position='bottom'
          />
        </div>
      </div>
    </IonItem>
  )
}