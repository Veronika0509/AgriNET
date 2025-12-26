import {IonActionSheet, IonButton, IonItem, IonText, IonToast, useIonAlert, useIonToast} from "@ionic/react";
import s from '../../../style.module.css'
import React, {useEffect, useState} from "react";
import {enableSetpoint} from "../data/setpoints/enableSetpoint";
import {onSensorChange} from "../data/setpoints/onSensorChange";
import {onSetpointChange} from "../data/setpoints/onSetpointChange";
import {onSensorSelect} from "../functions/setpoints/onSensorSelect";
import {onSetpointSubmit} from "../functions/setpoints/onSetpointSubmit";
import {presentSetpointChangeAlert} from "../functions/setpoints/presentSetpointChangeAlert";
import {onEnableCLick} from "../functions/setpoints/onEnableClick";
import {presentTelOrEmail} from "../functions/telOrEmail/presentTelOrEmail";

interface AlarmItemSetpointsProps {
  name: string;
  sensorId: string;
  field: string;
  selectedSensor: string;
  setpoint: string | number;
  isSetpointEnabled: boolean;
  fieldsLabelsData: Record<string, string>;
  setSelectedSensor: (value: string) => void;
  setSetpoint: (value: string | number) => void;
  setIsSetpointEnabled: (value: boolean) => void;
  setIsEnabledToastOpen: (value: boolean) => void;
  setIsDisabledToastOpen: (value: boolean) => void;
  setIsEnableActionSheet: (value: boolean) => void;
  isEnableActionSheet: boolean;
  isEnabledToastOpen: boolean;
  isDisabledToastOpen: boolean;
  setEmailOrTel: (value: string) => void;
}

export const AlarmItemSetpoints = (props: AlarmItemSetpointsProps) => {
  const [presentAlert] = useIonAlert();
  const [presentSelectToast] = useIonToast();
  const [presentSetpointToast] = useIonToast();
  const [presentErrorAlert] = useIonAlert();

  // Helper to convert string | number to string
  const toString = (value: string | number): string => {
    return typeof value === 'string' ? value : String(value);
  };

  const initialSensorActionSheetButtonsArray: string[] = Object.values(props.fieldsLabelsData)
  const sensorActionSheetButtons: Array<{text: string; handler?: () => void; role?: string; data?: {action: string}}> = []

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
    <IonItem className={s.alarm_itemContainer}>
      <div className={s.alarm_item}>
        <IonText>{props.name}</IonText>
        <div className={s.alarm_setContainer}>
          <IonButton fill='clear' color='light' id={'sensor-' + props.name}>{props.selectedSensor}</IonButton>
          <IonActionSheet
            trigger={'sensor-' + props.name}
            header="Select Sensor"
            buttons={sensorActionSheetButtons}
          ></IonActionSheet>
          <IonButton fill='clear' color='light' onClick={() => presentSetpointChangeAlert(presentAlert, props.name, toString(props.sensorId), props.setSetpoint, presentSetpointToast)}>{props.setpoint}</IonButton>
          <IonButton fill={props.isSetpointEnabled ? 'clear' : 'solid'} onClick={
            () => onEnableCLick(props.sensorId, props.name, props.isSetpointEnabled, props.setIsSetpointEnabled, props.setIsEnabledToastOpen, props.setIsDisabledToastOpen, props.setIsEnableActionSheet)
          }>
            {props.isSetpointEnabled ? 'Disable' : 'Enable'}
          </IonButton>
          <IonActionSheet
            isOpen={props.isEnableActionSheet}
            header="Action Type"
            buttons={[
              {
                text: 'Email',
                handler: () => presentTelOrEmail(
                  toString(props.sensorId),
                  1,
                  props.setEmailOrTel,
                  presentErrorAlert,
                  presentAlert,
                  'email',
                  undefined,
                  props.name,
                  props.setIsSetpointEnabled,
                  props.setIsEnabledToastOpen,
                  props.setIsDisabledToastOpen,
                  props.setIsEnableActionSheet
                )
              },              {
                text: 'SMS',
                handler: () => presentTelOrEmail(
                  toString(props.sensorId),
                  1,
                  props.setEmailOrTel,
                  presentErrorAlert,
                  presentAlert,
                  'sms',
                  undefined,
                  props.name,
                  props.setIsSetpointEnabled,
                  props.setIsEnabledToastOpen,
                  props.setIsDisabledToastOpen,
                  props.setIsEnableActionSheet
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
            onDidDismiss={() => props.setIsEnableActionSheet(false)}
          ></IonActionSheet>
          <IonToast
            isOpen={props.isEnabledToastOpen}
            onDidDismiss={() => props.setIsEnabledToastOpen(false)}
            onWillPresent={() => {
              if (props.isDisabledToastOpen) {
                props.setIsDisabledToastOpen(false)
              }
            }}
            message={props.name + ' Setpoint Enabled'}
            duration={3000}
            position='bottom'
          />
          <IonToast
            isOpen={props.isDisabledToastOpen}
            onWillPresent={() => {
              if (props.isEnabledToastOpen) {
                props.setIsEnabledToastOpen(false)
              }
            }}
            onDidDismiss={() => props.setIsDisabledToastOpen(false)}
            message={props.name + ' Setpoint Disabled'}
            duration={3000}
            position='bottom'
          />
        </div>
      </div>
    </IonItem>
  )
}