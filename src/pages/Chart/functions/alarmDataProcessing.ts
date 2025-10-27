import {getAlarmData} from "../components/Alarm/data/getAlarmData";
import {getFieldLabels} from "../components/Alarm/data/getFieldLabels";
import { SiteId } from '../../../types';

// Типы для setter функций
type SetterFunction<T> = (value: T) => void;

export const alarmDataProcessing = async (
  siteId: SiteId,
  setAlarmData: SetterFunction<unknown>,
  setAlarmEmailOrTel1: SetterFunction<string>,
  setAlarmEmailOrTel2: SetterFunction<string>,
  setAlarmEmailOrTel3: SetterFunction<string>,
  setAlarmLowSetpoint: SetterFunction<number>,
  setAlarmHighSetpoint: SetterFunction<number>,
  setAlarmFieldLabelsData: SetterFunction<unknown>,
  setAlarmLowSelectedSensor: SetterFunction<string>,
  setAlarmHighSelectedSensor: SetterFunction<string>,
  setIsAlarmLowSetpointEnabled: SetterFunction<boolean>,
  setIsAlarmHighSetpointEnabled: SetterFunction<boolean>
) => {
  const alarmDataResponse = await getAlarmData(siteId)
  setAlarmData(alarmDataResponse.data)

  // Email and Phone Number
  if (alarmDataResponse.data.emailsAndPhoneNumbers[0] !== null) {
    setAlarmEmailOrTel1(alarmDataResponse.data.emailsAndPhoneNumbers[0])
  }
  if (alarmDataResponse.data.emailsAndPhoneNumbers[1] !== null) {
    setAlarmEmailOrTel2(alarmDataResponse.data.emailsAndPhoneNumbers[1])
  }
  if (alarmDataResponse.data.emailsAndPhoneNumbers[2] !== null) {
    setAlarmEmailOrTel3(alarmDataResponse.data.emailsAndPhoneNumbers[2])
  }

  // Setpoints
  if (alarmDataResponse.data.lowSetpoint !== null) {
    setAlarmLowSetpoint(alarmDataResponse.data.lowSetpoint)
  }
  if (alarmDataResponse.data.highSetpoint !== null) {
    setAlarmHighSetpoint(alarmDataResponse.data.highSetpoint)
  }

  // Fields
  const fieldsLabelsResponse = await getFieldLabels(siteId)
  setAlarmFieldLabelsData(fieldsLabelsResponse.data)

  if (alarmDataResponse.data.lowField !== null) {
    setAlarmLowSelectedSensor(alarmDataResponse.data.lowFieldLabel)
  }
  if (alarmDataResponse.data.highField !== null) {
    setAlarmHighSelectedSensor(alarmDataResponse.data.highFieldLabel)
  }

  // Enable Setpoint
  if (alarmDataResponse.data.lowEnabled !== null) {
    setIsAlarmLowSetpointEnabled(alarmDataResponse.data.lowEnabled)
  }
  if (alarmDataResponse.data.highEnabled !== null) {
    setIsAlarmHighSetpointEnabled(alarmDataResponse.data.highEnabled)
  }
}