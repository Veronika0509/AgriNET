import {IonActionSheet, IonButton, IonItem, IonText, useIonAlert} from "@ionic/react";
import s from '../../../../style.module.css'
import React, {useEffect, useState} from "react";
import {enableSetpoint} from "../../functions/enableSetpoint";

export const AlarmItemSetpoints = (props: any) => {
  const [selectedSensor, setSelectedSensor] = useState(props.fieldLabelsData[props.field])
  const [setpoint, setSetpoint] = useState('Unset')
  const [presentAlert] = useIonAlert();
  let initialSensorActionSheetButtonsArray: any = Object.values(props.fieldLabelsData)
  let sensorActionSheetButtons: any = []

  useEffect(() => {
    if (props.setpoint !== null) {
      setSetpoint(props.setpoint)
    }
  }, []);

  initialSensorActionSheetButtonsArray.map((buttonString: string) => {
    sensorActionSheetButtons.push({
      text: buttonString,
      handler: () => setSelectedSensor(buttonString)
    })
  })
  sensorActionSheetButtons.push({
    text: 'Cancel',
    role: 'cancel',
    data: {
      action: 'cancel',
    },
  },)

  const onSetpointSubmit = (event: any) => {
    setSetpoint(event[0])
  }
  const presentSetpointChangeAlert = () => {
    presentAlert({
      header: 'Change ' + props.name + ' Setpoint',
      inputs: [
        {
          cssClass: s.alarmActionInput
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Change',
          role: 'confirm',
          handler: (event) => onSetpointSubmit(event)
        },
      ]
    })
  }

  const onEnableCLick = () => {
    enableSetpoint(props.name, selectedSensor, setpoint)
  }

  return (
    <IonItem className={s.alarmItemContainer}>
      <div className={s.alarmItem}>
        <IonText>{props.name}</IonText>
        <div className={s.alarmSetContainer}>
          <IonButton fill='clear' color='light' id={'sensor-' + props.name}>{selectedSensor}</IonButton>
          <IonActionSheet
            trigger={'sensor-' + props.name}
            header="Select Sensor"
            buttons={sensorActionSheetButtons}
          ></IonActionSheet>
          <IonButton fill='clear' color='light' onClick={presentSetpointChangeAlert}>{setpoint}</IonButton>
          <IonButton fill='solid' onClick={onEnableCLick}>Enable</IonButton>
        </div>
      </div>
    </IonItem>
  )
}