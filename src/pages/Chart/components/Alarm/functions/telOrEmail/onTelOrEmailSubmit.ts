import {setTelOrEmail} from "../../data/telOrEmail/setTelOrEmail";
import {presentValidationError} from "./presentValidationError";
import {onEnableCLick} from "../setpoints/onEnableClick";

export const onTelOrEmailSubmit = (
  sensorId: string,
  name: string | number,
  setEmailOrTel: (value: string) => void,
  presentAlert: (options: unknown) => void,
  presentErrorAlert: (options: unknown) => void,
  typeOfAction: string,
  event: string[],
  toEnable?: string | undefined,
  setIsSetpointEnabled?: (enabled: boolean) => void,
  setIsEnabledToastOpen?: (open: boolean) => void,
  setIsDisabledToastOpen?: (open: boolean) => void,
  setIsEnableActionSheet?: (open: boolean) => void
) => {
  const setEmailOrTelFunc = (validate: boolean) => {
    const nameNum = typeof name === 'number' ? name : Number(name);
    if (validate) {
      new Promise<string>((resolve) => {
        setTelOrEmail(sensorId, nameNum, event[0], resolve)
      }).then((response: string) => {
        setEmailOrTel(response)
        if (toEnable && setIsSetpointEnabled) {
          onEnableCLick(sensorId, toEnable, false, setIsSetpointEnabled, setIsEnabledToastOpen, setIsDisabledToastOpen, setIsEnableActionSheet)
        }
      })
    } else {
      presentValidationError(presentErrorAlert, sensorId, nameNum, setEmailOrTel, presentAlert, typeOfAction, event[0], toEnable, setIsSetpointEnabled, setIsEnabledToastOpen, setIsDisabledToastOpen, setIsEnableActionSheet)
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