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
      enabled.toString() !== settingsData.enabled.toString() ||
      priority.toString() !== settingsData.priority.toString() ||
      setpointSensor.toString() !== settingsData.setPointSensor.toString() ||
      moistureSetpoint.toString() !== settingsData.msetPoint.toString() ||
      duration.toString() !== settingsData.duration.toString() ||
      hoursAve.toString() !== settingsData.hrsAve.toString() ||
      startDelay.toString() !== settingsData.startDelay.toString() ||
      waterDrainTime.toString() !== settingsData.waterDrainTime.toString() ||
      concurrent !== settingsData.concurrent;

    setHasChanges(hasAnyChange)
  }, [valveName, probeId, enabled, priority, setpointSensor, moistureSetpoint, duration, hoursAve, startDelay, waterDrainTime, concurrent]);

  const validateInputs = () => {
    // Проверка на пустые значения
    if (!valveName || !probeId || enabled === undefined || priority === undefined || 
        setpointSensor === undefined || moistureSetpoint === undefined || duration === undefined || 
        hoursAve === undefined || startDelay === undefined || waterDrainTime === undefined || 
        concurrent === undefined) {
      alert('Все поля должны быть заполнены');
      return false;
    }

    // Проверка числовых значений
    const numericFields = [
      { value: enabled, name: 'Enabled' },
      { value: priority, name: 'Priority' },
      { value: setpointSensor, name: 'Set Point Sensor' },
      { value: moistureSetpoint, name: 'Moisture Setpoint' },
      { value: duration, name: 'Duration' },
      { value: hoursAve, name: 'Hours Ave' },
      { value: startDelay, name: 'Start Delay' },
      { value: waterDrainTime, name: 'Water Drain Time' }
    ];

    for (const field of numericFields) {
      if (isNaN(Number(field.value))) {
        alert(`${field.name} должно быть числом`);
        return false;
      }
    }

    return true;
  };

  const save = async () => {
    if (!validateInputs()) {
      return;
    }

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
    // const response = await postValveSettings(updatedSettings)
    // console.log(settingsData)
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
                      onIonInput={(event: any) => setEnabled(event.detail.value)} type='number'></IonInput>
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
