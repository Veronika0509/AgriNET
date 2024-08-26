import {enableSetpoint} from "../../../data/setpoints/enableSetpoint";
import {getAlarmData} from "../../../../../data/getAlarmData";
import login from "../../../../../../Login";

export const onEnableCLick = async (
  sensorId: string,
  name: any,
  isSetpointEnabled: boolean,
  setIsSetpointEnabled: any,
  setIsEnabledToastOpen: any,
  setIsDisabledToastOpen: any,
  setIsEnableActionSheet: any
) => {
  const setSetpointEnabled = () => {
    new Promise((resolve: any) => {
      enableSetpoint(sensorId, name.toLowerCase(), !isSetpointEnabled, resolve)
    }).then((response: any) => {
      setIsSetpointEnabled(response)
      if (!isSetpointEnabled) {
        setIsEnabledToastOpen(true)
      } else {
        setIsDisabledToastOpen(true)
      }
    })
  }

  const alarmData = await getAlarmData(sensorId)
  if (!isSetpointEnabled) {
    const isNoEmailsOrTels = alarmData.data.emailsAndPhoneNumbers.every((emailOrPhoneNumber: any) => emailOrPhoneNumber === null)

    if (isNoEmailsOrTels) {
      setIsEnableActionSheet(true)
    } else {
      setSetpointEnabled()
    }
  } else {
    setSetpointEnabled()
  }
}