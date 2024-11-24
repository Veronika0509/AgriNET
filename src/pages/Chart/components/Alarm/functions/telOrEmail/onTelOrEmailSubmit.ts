import {setTelOrEmail} from "../../data/telOrEmail/setTelOrEmail";
import {presentValidationError} from "./presentValidationError";
import {onEnableCLick} from "../setpoints/onEnableClick";

export const onTelOrEmailSubmit = (
  sensorId: string,
  name: any,
  setEmailOrTel: any,
  presentAlert: any,
  presentErrorAlert: any,
  typeOfAction: string,
  event: any,
  toEnable?: string | undefined,
  setIsSetpointEnabled?: any,
  setIsEnabledToastOpen?: any,
  setIsDisabledToastOpen?: any,
  setIsEnableActionSheet?: any
) => {
  const setEmailOrTelFunc = (validate: any) => {
    if (validate) {
      new Promise((resolve: any) => {
        setTelOrEmail(sensorId, name, event[0], resolve)
      }).then((response: any) => {
        setEmailOrTel(response)
        if (toEnable) {
          onEnableCLick(sensorId, toEnable, false, setIsSetpointEnabled, setIsEnabledToastOpen, setIsDisabledToastOpen, setIsEnableActionSheet)
        }
      })
    } else {
      presentValidationError(presentErrorAlert, sensorId, name, setEmailOrTel, presentAlert, typeOfAction, event[0], toEnable, setIsSetpointEnabled, setIsEnabledToastOpen, setIsDisabledToastOpen, setIsEnableActionSheet)
    }
  }

  if (typeOfAction === 'sms') {
    const validate = new RegExp("^\\d+$").test(event[0])
    setEmailOrTelFunc(validate)
  } else {
    const validate = event[0].indexOf("@") > 0
    setEmailOrTelFunc(validate)
  }
}