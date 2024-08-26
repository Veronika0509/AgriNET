import s from "../../../../../style.module.css";
import {onSetpointSubmit} from "../onSetpointSubmit";

export const presentSetpointChangeAlert = (
  presentAlert: any,
  name: any,
  sensorId : string,
  setSetpoint: any,
  presentToast: any,
) => {
  presentAlert({
    header: 'Change ' + name + ' Setpoint',
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
        handler: (event: any) => onSetpointSubmit(
          name,
          sensorId,
          setSetpoint,
          presentToast,
          event
        )
      },
    ]
  })
}