import s from "../../../../style.module.css";
import {onSetpointSubmit} from "./onSetpointSubmit";

export const presentSetpointChangeAlert = (
  presentAlert: (options: unknown) => void,
  name: string,
  sensorId : string,
  setSetpoint: (value: number) => void,
  presentToast: (options: unknown) => void,
) => {
  presentAlert({
    header: 'Change ' + name + ' Setpoint',
    inputs: [
      {
        cssClass: s.alarm_ActionInput
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
        handler: (event: number[]) => onSetpointSubmit(
          name,
          sensorId,
          setSetpoint,
          presentToast,
          event[0]
        )
      },
    ]
  })
}