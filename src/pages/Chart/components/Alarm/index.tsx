import s from '../../style.module.css'
import {
  IonContent,
  IonText
} from "@ionic/react";
import React from "react";
import {AlarmItemTelOrEmail} from "./components/AlarmItemTelOrEmail";
import {AlarmItemSetpoints} from "./components/AlarmItemSetpoints";

interface AlarmData {
  lowField: string;
  highField: string;
}

interface AlarmProps {
  sensorId: string;
  alarmData: AlarmData;
  emailOrTel1: string;
  setEmailOrTel1: (value: string) => void;
  emailOrTel2: string;
  setEmailOrTel2: (value: string) => void;
  emailOrTel3: string;
  setEmailOrTel3: (value: string) => void;
  lowSetpoint: number;
  setLowSetpoint: (value: number) => void;
  highSetpoint: number;
  setHighSetpoint: (value: number) => void;
  lowSelectedSensor: string;
  setLowSelectedSensor: (value: string) => void;
  highSelectedSensor: string;
  setHighSelectedSensor: (value: string) => void;
  isLowSetpointEnabled: boolean;
  setIsLowSetpointEnabled: (enabled: boolean) => void;
  isHighSetpointEnabled: boolean;
  setIsHighSetpointEnabled: (enabled: boolean) => void;
  isEnableActionSheet: boolean;
  setIsEnableActionSheet: (value: boolean) => void;
  isEnabledToastOpen: boolean;
  setIsEnabledToastOpen: (value: boolean) => void;
  isDisabledToastOpen: boolean;
  setIsDisabledToastOpen: (value: boolean) => void;
  fieldsLabelsData: Record<string, string>;
  [key: string]: unknown;
}

export const Alarm = (props: AlarmProps) => {
  return (
    <IonContent>
      <div className={s.alarm_container}>
        <IonText className={s.alarm_textTitle}>Email/SMS</IonText>
        <AlarmItemTelOrEmail
          name="1"
          sensorId={props.sensorId}
          emailOrTel={props.emailOrTel1}
          setEmailOrTel={props.setEmailOrTel1}
          setIsLowSetpointEnabled={props.setIsLowSetpointEnabled}
          setIsHighSetpointEnabled={props.setIsHighSetpointEnabled}
        ></AlarmItemTelOrEmail>
        <AlarmItemTelOrEmail
          name="2"
          sensorId={props.sensorId}
          emailOrTel={props.emailOrTel2}
          setEmailOrTel={props.setEmailOrTel2}
          setIsLowSetpointEnabled={props.setIsLowSetpointEnabled}
          setIsHighSetpointEnabled={props.setIsHighSetpointEnabled}
        ></AlarmItemTelOrEmail>
        <AlarmItemTelOrEmail
          name="3"
          sensorId={props.sensorId}
          emailOrTel={props.emailOrTel3}
          setEmailOrTel={props.setEmailOrTel3}
          setIsLowSetpointEnabled={props.setIsLowSetpointEnabled}
          setIsHighSetpointEnabled={props.setIsHighSetpointEnabled}
        ></AlarmItemTelOrEmail>
        <IonText className={s.alarm_textTitle}>Setpoints</IonText>
        {props.fieldsLabelsData && (
          <>
            <AlarmItemSetpoints
              name='Low'
              fieldsLabelsData={props.fieldsLabelsData}
              field={props.alarmData.lowField}
              sensorId={props.sensorId}
              setpoint={props.lowSetpoint}
              setSetpoint={props.setLowSetpoint}
              selectedSensor={props.lowSelectedSensor}
              setSelectedSensor={props.setLowSelectedSensor}
              isSetpointEnabled={props.isLowSetpointEnabled}
              setIsSetpointEnabled={props.setIsLowSetpointEnabled}
              setEmailOrTel={props.setEmailOrTel1}
              isEnableActionSheet={props.isEnableActionSheet}
              setIsEnableActionSheet={props.setIsEnableActionSheet}
              isEnabledToastOpen={props.isEnabledToastOpen}
              setIsEnabledToastOpen={props.setIsEnabledToastOpen}
              isDisabledToastOpen={props.isDisabledToastOpen}
              setIsDisabledToastOpen={props.setIsDisabledToastOpen}
            ></AlarmItemSetpoints>
            <AlarmItemSetpoints
              name='High'
              fieldsLabelsData={props.fieldsLabelsData}
              field={props.alarmData.highField}
              sensorId={props.sensorId}
              setpoint={props.highSetpoint}
              setSetpoint={props.setHighSetpoint}
              selectedSensor={props.highSelectedSensor}
              setSelectedSensor={props.setHighSelectedSensor}
              isSetpointEnabled={props.isHighSetpointEnabled}
              setIsSetpointEnabled={props.setIsHighSetpointEnabled}
              setEmailOrTel={props.setEmailOrTel1}
              isEnableActionSheet={props.isEnableActionSheet}
              setIsEnableActionSheet={props.setIsEnableActionSheet}
              isEnabledToastOpen={props.isEnabledToastOpen}
              setIsEnabledToastOpen={props.setIsEnabledToastOpen}
              isDisabledToastOpen={props.isDisabledToastOpen}
              setIsDisabledToastOpen={props.setIsDisabledToastOpen}
            ></AlarmItemSetpoints>
          </>
        )}
      </div>
    </IonContent>
  )
}