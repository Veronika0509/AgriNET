import s from '../../../../style.module.css'
import {onTelOrEmailSubmit} from "./onTelOrEmailSubmit";

export const presentTelOrEmail = (
  sensorId: string,
  name: number,
  setEmailOrTel: (value: string) => void,
  presentErrorAlert: (options: unknown) => void,
  presentAlert: (options: unknown) => void,
  typeOfAction: string,
  inputValue?: string,
  toEnable?: string,
  setIsSetpointEnabled?: (enabled: boolean) => void,
  setIsEnabledToastOpen?: (open: boolean) => void,
  setIsDisabledToastOpen?: (open: boolean) => void,
  setIsEnableActionSheet?: (open: boolean) => void
) => {
  presentAlert({
    header: typeOfAction === 'email' ? 'Enter email' : 'Enter Phone Number',
    inputs: [
      {
        placeholder: typeOfAction === 'email' ? undefined : 'Only digits please',
        type: typeOfAction === 'email' ? 'email' : 'tel',
        cssClass: s.alarm_actionInput,
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
        handler: (event: string[]) => onTelOrEmailSubmit(
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