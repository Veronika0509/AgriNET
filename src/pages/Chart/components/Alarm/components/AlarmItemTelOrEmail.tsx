import s from '../../../style.module.css'
import {IonActionSheet, IonButton, IonItem, IonText, useIonAlert} from "@ionic/react";
import React, {useEffect, useRef, useState} from "react";
import {removeTelOrEmail} from "../data/telOrEmail/removeTelOrEmail";
import {getAlarmData} from "../data/getAlarmData";
import {enableSetpoint} from "../data/setpoints/enableSetpoint";
import {presentTelOrEmail} from "../functions/telOrEmail/presentTelOrEmail";
import {onRemoveTelOrEmailSubmit} from "../functions/telOrEmail/onRemoveTelOrEmailSubmit";
import {updateButtons} from "../functions/telOrEmail/updateButtons";
import {onEmailOrTelChange} from "../functions/telOrEmail/onEmailOrTelChange";

interface AlarmItemTelOrEmailProps {
  name: string;
  sensorId: string;
  emailOrTel: string;
  setEmailOrTel: (value: string) => void;
  setIsLowSetpointEnabled: (value: boolean) => void;
  setIsHighSetpointEnabled: (value: boolean) => void;
}

export const AlarmItemTelOrEmail = (props: AlarmItemTelOrEmailProps) => {
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();
  const [presentRemoveAlert] = useIonAlert();
  const setTextRef = useRef(props.emailOrTel);

  // Helper to convert string | number to string
  const toString = (value: string | number): string => {
    return typeof value === 'string' ? value : String(value);
  };

  const [actionSheetButtons, setActionSheetButtons] = useState([
    {
      text: 'Email',
      handler: () => presentTelOrEmail(toString(props.sensorId), props.name, props.setEmailOrTel, presentErrorAlert, presentAlert, 'email')
    },
    {
      text: 'SMS',
      handler: () => presentTelOrEmail(toString(props.sensorId), props.name, props.setEmailOrTel, presentErrorAlert, presentAlert, 'sms')
    }
  ])

  useEffect(() => {
    setTextRef.current = props.emailOrTel;
  }, [props.emailOrTel]);

  useEffect(() => {
    onEmailOrTelChange(
      props.emailOrTel,
      setActionSheetButtons,
      setTextRef,
      presentAlert,
      toString(props.sensorId),
      props.name,
      props.setEmailOrTel,
      props.setIsLowSetpointEnabled,
      props.setIsHighSetpointEnabled,
      presentRemoveAlert,
      actionSheetButtons
    )
  }, [props.emailOrTel]);

  return (
    <IonItem className={s.alarm_itemContainer}>
      <div className={s.alarm_item}>
        <IonText>{props.name}</IonText>
        <div className={s.alarm_setContainer}>
          <IonText className={`${s.alarm_itemContent} ${props.emailOrTel !== 'Unset' && s.active}`}>{props.emailOrTel}</IonText>
          <IonButton fill={props.emailOrTel === 'Unset' ? 'solid' : 'clear'}
                     id={'set-' + props.name}>{props.emailOrTel === 'Unset' ? 'Set' : 'Change'}</IonButton>
          <IonActionSheet
            trigger={'set-' + props.name}
            header="Action Type"
            buttons={actionSheetButtons}
          ></IonActionSheet>
        </div>
      </div>
    </IonItem>
  )
}