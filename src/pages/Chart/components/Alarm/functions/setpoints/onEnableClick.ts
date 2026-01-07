import {enableSetpoint} from "../../data/setpoints/enableSetpoint";
import {getAlarmData} from "../../data/getAlarmData";

export const onEnableCLick = async (
  sensorId: string,
  name: string,
  isSetpointEnabled: boolean,
  setIsSetpointEnabled?: (enabled: boolean) => void,
  setIsEnabledToastOpen?: (open: boolean) => void,
  setIsDisabledToastOpen?: (open: boolean) => void,
  setIsEnableActionSheet?: (open: boolean) => void
) => {
  const setSetpointEnabled = () => {
    new Promise<boolean>((resolve) => {
      enableSetpoint(sensorId, name.toLowerCase(), !isSetpointEnabled, resolve)
    }).then((response: boolean) => {
      setIsSetpointEnabled?.(response)
      if (!isSetpointEnabled) {
        setIsEnabledToastOpen?.(true)
      } else {
        setIsDisabledToastOpen?.(true)
      }
    })
  }

  const alarmData = await getAlarmData(sensorId)
  if (!isSetpointEnabled) {
    const isNoEmailsOrTels = alarmData.data.emailsAndPhoneNumbers.every((emailOrPhoneNumber: string | null) => emailOrPhoneNumber === null)

    if (isNoEmailsOrTels) {
      setIsEnableActionSheet?.(true)
    } else {
      setSetpointEnabled()
    }
  } else {
    setSetpointEnabled()
  }
}