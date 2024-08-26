import s from '../../../../../style.module.css'
import {onTelOrEmailSubmit} from "../onTelOrEmailSubmit";

export const presentTelOrEmail = (
  sensorId: string,
  name: any,
  setEmailOrTel: any,
  presentErrorAlert: any,
  presentAlert: any,
  typeOfAction: string,
  inputValue?: string,
  toEnable?: string,
  setIsSetpointEnabled?: any,
  setIsEnabledToastOpen?: any,
  setIsDisabledToastOpen?: any,
  setIsEnableActionSheet?: any
) => {
  presentAlert({
    header: typeOfAction === 'email' ? 'Enter email' : 'Enter Phone Number',
    inputs: [
      {
        placeholder: typeOfAction === 'email' ? undefined : 'Only digits please',
        type: typeOfAction === 'email' ? 'email' : 'tel',
        cssClass: s.alarmActionInput,
        value: inputValue ? inputValue : undefined
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'OK',
        role: 'confirm',
        handler: (event: any) => onTelOrEmailSubmit(
          sensorId,
          name,
          setEmailOrTel,
          presentAlert,
          presentErrorAlert,
          typeOfAction,
          event,
          toEnable,
          setIsSetpointEnabled,
          setIsEnabledToastOpen,
          setIsDisabledToastOpen,
          setIsEnableActionSheet
        )
      },
    ]
  })
}