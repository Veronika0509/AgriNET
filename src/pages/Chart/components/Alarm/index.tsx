import s from '../../style.module.css'
import {
  IonContent,
  IonText
} from "@ionic/react";
import React, {useEffect, useState} from "react";
import {AlarmItemTelOrEmail} from "./components/AlarmItemTelOrEmail";
import {AlarmItemSetpoints} from "./components/AlarmItemSetpoints";
import {getFieldLabels} from "./data/getFieldLabels";

export const Alarm = (props: any) => {
  const [fieldLabelsData, setFieldLabelsData] = useState()
  useEffect(() => {
    const getFieldLabelsData = async () => {
      const data = await getFieldLabels(props.sensorId)
      setFieldLabelsData(data.data)
    }

    getFieldLabelsData()
  }, []);

  return (
    <IonContent>
      <div className={s.alarmContainer}>
        <IonText className={s.alarmTextTitle}>Email/SMS</IonText>
        <AlarmItemTelOrEmail name={1} data={props.alarmData.emailsAndPhoneNumbers[0]}></AlarmItemTelOrEmail>
        <AlarmItemTelOrEmail name={2} data={props.alarmData.emailsAndPhoneNumbers[1]}></AlarmItemTelOrEmail>
        <AlarmItemTelOrEmail name={3} data={props.alarmData.emailsAndPhoneNumbers[2]}></AlarmItemTelOrEmail>
        <IonText className={s.alarmTextTitle}>Setpoints</IonText>
        {fieldLabelsData && (
          <>
            <AlarmItemSetpoints
              name='Low'
              fieldLabelsData={fieldLabelsData}
              field={props.alarmData.lowField}
              setpoint={props.alarmData.lowSetpoint}
            ></AlarmItemSetpoints>
            <AlarmItemSetpoints
              name='High'
              fieldLabelsData={fieldLabelsData}
              field={props.alarmData.highField}
              setpoint={props.alarmData.highSetpoint}
            ></AlarmItemSetpoints>
          </>
        )}
      </div>
    </IonContent>
  )
}