import {presentTelOrEmail} from "./presentTelOrEmail";

export const presentValidationError = (
  presentErrorAlert: any,
  sensorId: any,
  name: any,
  setEmailOrTel: any,
  presentAlert: any,
  typeOfAction: string,
  value: any,
  toEnable: string | undefined,
  setIsSetpointEnabled: any,
  setIsEnabledToastOpen?: any,
  setIsDisabledToastOpen?: any,
  setIsEnableActionSheet?: any
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