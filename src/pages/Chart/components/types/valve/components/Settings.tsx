import {IonButton, IonContent, IonInput, IonItem, IonModal} from "@ionic/react";
import s from '../style.module.css'
import Header from "../../../Header";
import React, {useEffect, useState} from "react";
import {getValveSettingsData} from "../../../../data/types/valve/getValveSettingsData";
import {settings} from "ionicons/icons";
import login from "../../../../../Login";
import {postValveSettings} from "../../../../data/types/valve/postValveSettings";

export const Settings = (props: any) => {
  const [settingsData, setSettingsData] = useState<any>([])
  const [valveName, setValveName] = useState<any>()
  const [probeId, setProbeId] = useState<any>()
  const [enabled, setEnabled] = useState<any>()
  const [priority, setPriority] = useState<any>()
  const [setpointSensor, setSetpointSensor] = useState<any>()
  const [moistureSetpoint, setMoistureSetpoint] = useState<any>()
  const [duration, setDuration] = useState<any>()
  const [hoursAve, setHoursAve] = useState<any>()
  const [startDelay, setStartDelay] = useState<any>()
  const [waterDrainTime, setWaterDrainTime] = useState<any>()
  const [concurrent, setConcurrent] = useState<any>()
  const [hasChanges, setHasChanges] = useState<boolean>(false)

  useEffect(() => {
    if (props.valveSettings) {
      const getNewData = async () => {
        const newData = await getValveSettingsData(props.sensorId)
        setSettingsData(newData.data)

        setValveName(newData.data.valvename)
        setProbeId(newData.data.probeId)
        setEnabled(newData.data.enabled)
        setPriority(newData.data.priority)
        setSetpointSensor(newData.data.setPointSensor)
        setMoistureSetpoint(newData.data.msetPoint)
        setDuration(newData.data.duration)
        setHoursAve(newData.data.hrsAve)
        setStartDelay(newData.data.startDelay)
        setWaterDrainTime(newData.data.waterDrainTime)
        setConcurrent(newData.data.concurrent)
      }

      getNewData()
    }
  }, [props.valveSettings]);

  useEffect(() => {
    const hasAnyChange: boolean =
      valveName !== settingsData.valvename ||
      probeId !== settingsData.probeId ||
      enabled && enabled.toString() !== settingsData.enabled && settingsData.enabled.toString() ||
      priority && priority.toString() !== settingsData.priority && settingsData.priority.toString() ||
      setpointSensor && setpointSensor.toString() !== settingsData.setPointSensor && settingsData.setPointSensor.toString() ||
      moistureSetpoint && moistureSetpoint.toString() !== settingsData.msetPoint && settingsData.msetPoint.toString() ||
      duration && duration.toString() !== settingsData.duration && settingsData.duration.toString() ||
      hoursAve && hoursAve.toString() !== settingsData.hrsAve && settingsData.hrsAve.toString() ||
      startDelay && startDelay.toString() !== settingsData.startDelay && settingsData.startDelay.toString() ||
      waterDrainTime && waterDrainTime.toString() !== settingsData.waterDrainTime && settingsData.waterDrainTime.toString() ||
      concurrent !== settingsData.concurrent;

    setHasChanges(hasAnyChange)
  }, [valveName, probeId, enabled, priority, setpointSensor, moistureSetpoint, duration, hoursAve, startDelay, waterDrainTime, concurrent]);

  const validateInputs = () => {
    // Проверка на пустые значения
    if (!valveName || !probeId || !enabled || !priority ||
        !setpointSensor || !moistureSetpoint || !duration ||
        !hoursAve || !startDelay || !waterDrainTime ||
        !concurrent) {
      return false;
    }

    // Проверка числовых значений
    const numericFields = [
      enabled,
      priority,
      setpointSensor,
      moistureSetpoint,
      duration,
      hoursAve,
      startDelay,
      waterDrainTime
    ];

    for (const field of numericFields) {
      if (isNaN(Number(field))) {
        return false;
      }
    }

    return true;
  };

  const save = async () => {
    if (validateInputs()) {
      const updatedSettings = {
        id: settingsData.id,
        sensorId: settingsData.sensorId,
        probeId: probeId,
        pumpId: settingsData.pumpId,
        enabled: enabled,
        valvename: valveName,
        priority: priority,
        msetPoint: moistureSetpoint,
        setPointSensor: setpointSensor,
        validate: settingsData.validate,
        hrsAve: hoursAve,
        duration: duration,
        waterDrainTime: waterDrainTime,
        startDelay: startDelay,
        concurrent: concurrent,
        time: settingsData.time,
        chemName: settingsData.chemName,
        chemicalStatus: settingsData.chemicalStatus,
        waterStatus: settingsData.waterStatus,
        targFlow: settingsData.targFlow,
        targFlowUnit: settingsData.targFlowUnit,
        flowRate: settingsData.flowRate,
        flowRateUnit: settingsData.flowRateUnit,
        total: settingsData.total,
        totalUnit: settingsData.totalUnit,
        minPump: settingsData.minPump
      }
      await postValveSettings(updatedSettings)
    } else {
      console.log('wrong')
    }
  }

  return (
    <IonModal isOpen={props.valveSettings} className={s.settingsModal}>
      <Header type='valveSettingsModal' sensorId={props.sensorId} setValveSettings={props.setValveSettings}/>
      {settingsData && (
        <IonContent className={s.settingsWrapper}>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Valve Name" value={valveName}
                      onIonInput={(event: any) => setValveName(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Probe ID" value={probeId}
                      onIonInput={(event: any) => setProbeId(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Enabled" value={enabled}
                      onIonInput={(event: any) => setEnabled(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Priority" value={priority}
                      onIonInput={(event: any) => setPriority(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Set Point Sensor" value={setpointSensor}
                      onIonInput={(event: any) => setSetpointSensor(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Moisture Setpoint (%)" value={moistureSetpoint}
                      onIonInput={(event: any) => setMoistureSetpoint(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Duration (Min)" value={duration}
                      onIonInput={(event: any) => setDuration(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Hours Ave" value={hoursAve}
                      onIonInput={(event: any) => setHoursAve(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Start Delay (Min)" value={startDelay}
                      onIonInput={(event: any) => setStartDelay(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Water Drain Time (Min)" value={waterDrainTime}
                      onIonInput={(event: any) => setWaterDrainTime(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={`${s.settingsInputWrapper} ${s.settingsInputConcurrentWrapper}`}>
            <IonInput className={s.settingsInput} label="Concurrent" value={concurrent}
                      onIonInput={(event: any) => setConcurrent(event.detail.value)}></IonInput>
          </IonItem>
          <IonButton className={s.settingsButton} disabled={!hasChanges} onClick={save}>Save</IonButton>
          <IonButton className={s.settingsButton} fill='outline'>Set AutoWATER Alarm</IonButton>
        </IonContent>
      )}
    </IonModal>
  )
}
