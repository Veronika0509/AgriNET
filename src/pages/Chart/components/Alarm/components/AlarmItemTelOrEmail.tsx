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

export const AlarmItemTelOrEmail = (props: any) => {
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();
  const [presentRemoveAlert] = useIonAlert();
  const setTextRef = useRef(props.emailOrTel);
  const [actionSheetButtons, setActionSheetButtons] = useState([
    {
      text: 'Email',
      handler: () => presentTelOrEmail(props.sensorId, props.name, props.setEmailOrTel, presentErrorAlert, presentAlert, 'email')
    },
    {
      text: 'SMS',
      handler: () => presentTelOrEmail(props.sensorId, props.name, props.setEmailOrTel, presentErrorAlert, presentAlert, 'sms')
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
      props.sensorId,
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