import {presentTelOrEmail} from "./presentTelOrEmail";

export const presentValidationError = (
  presentErrorAlert: (options: unknown) => void,
  sensorId: string,
  name: number,
  setEmailOrTel: (value: string) => void,
  presentAlert: (options: unknown) => void,
  typeOfAction: string,
  value: string,
  toEnable: string | undefined,
  setIsSetpointEnabled: (enabled: boolean) => void,
  setIsEnabledToastOpen?: (open: boolean) => void,
  setIsDisabledToastOpen?: (open: boolean) => void,
  setIsEnableActionSheet?: (open: boolean) => void
) => {
  presentErrorAlert({
    header: 'Validation Error',
    message: typeOfAction === 'email' ? 'Email must contain @' : 'Phone number must contain digits only',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Retry',
        role: 'confirm',
        handler: () => presentTelOrEmail(
          sensorId,
          name,
          setEmailOrTel,
          presentErrorAlert,
          presentAlert,
          typeOfAction,
          value,
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