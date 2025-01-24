import {IonButton, IonContent, IonInput, IonItem, IonModal, useIonAlert, useIonToast} from "@ionic/react";
import s from '../style.module.css'
import Header from "../../../Header";
import React, {useEffect, useState} from "react";
import {getValveSettingsData} from "../../../../data/types/valve/getValveSettingsData";
import {postValveSettings} from "../../../../data/types/valve/postValveSettings";
import {getFieldLabels} from "../../../Alarm/data/getFieldLabels";
import {getAlarmData} from "../../../Alarm/data/getAlarmData";
import {onSensorSelect} from "../../../Alarm/functions/setpoints/onSensorSelect";
import {onSetpointSubmit} from "../../../Alarm/functions/setpoints/onSetpointSubmit";
import {onEnableCLick} from "../../../Alarm/functions/setpoints/onEnableClick";

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

  const [presentAlert] = useIonAlert();
  const [presentSensorSelectToast] = useIonToast()
  const [presentSetpointSubmitToast] = useIonToast()

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
    // console.log(probeId !== settingsData.probeId)
    const hasAnyChange: boolean =
      valveName !== settingsData.valvename ||
      probeId !== settingsData.probeId ||
      enabled?.toString() !== settingsData.enabled?.toString() ||
      priority?.toString() !== settingsData.priority?.toString() ||
      setpointSensor?.toString() !== settingsData.setPointSensor?.toString() ||
      moistureSetpoint?.toString() !== settingsData.msetPoint?.toString() ||
      duration?.toString() !== settingsData.duration?.toString() ||
      hoursAve?.toString() !== settingsData.hrsAve?.toString() ||
      startDelay?.toString() !== settingsData.startDelay?.toString() ||
      waterDrainTime?.toString() !== settingsData.waterDrainTime?.toString() ||
      concurrent !== settingsData.concurrent;

    setHasChanges(hasAnyChange)
  }, [valveName, probeId, enabled, priority, setpointSensor, moistureSetpoint, duration, hoursAve, startDelay, waterDrainTime, concurrent]);

  const validateAndPrepareInputs = () => {
    // Set default values for empty fields
    const validatedEnabled = !enabled ? 2 : enabled;
    const validatedPriority = !priority ? 0 : priority;
    const validatedSetpointSensor = !setpointSensor ? 0 : setpointSensor;
    const validatedMoistureSetpoint = !moistureSetpoint ? 0 : moistureSetpoint;
    const validatedDuration = !duration ? 0 : duration;
    const validatedHoursAve = !hoursAve ? 0 : hoursAve;
    const validatedStartDelay = !startDelay ? 0 : startDelay;
    const validatedWaterDrainTime = !waterDrainTime ? 0 : waterDrainTime;

    // Validate numeric values
    const numericFields = [
      validatedEnabled,
      validatedPriority,
      validatedSetpointSensor,
      validatedMoistureSetpoint,
      validatedDuration,
      validatedHoursAve,
      validatedStartDelay,
      validatedWaterDrainTime
    ];

    for (const field of numericFields) {
      if (isNaN(Number(field))) {
        return null;
      }
    }

    return {
      enabled: Number(validatedEnabled),
      priority: Number(validatedPriority),
      setpointSensor: Number(validatedSetpointSensor),
      moistureSetpoint: Number(validatedMoistureSetpoint),
      duration: Number(validatedDuration),
      hoursAve: Number(validatedHoursAve),
      startDelay: Number(validatedStartDelay),
      waterDrainTime: Number(validatedWaterDrainTime)
    };
  };

  const save = async () => {
    const validatedInputs = validateAndPrepareInputs();
    if (validatedInputs) {
      const updatedSettings = {
        id: settingsData.id,
        sensorId: settingsData.sensorId,
        probeId: probeId,
        pumpId: settingsData.pumpId,
        enabled: validatedInputs.enabled,
        valvename: valveName,
        priority: validatedInputs.priority,
        msetPoint: validatedInputs.moistureSetpoint,
        setPointSensor: validatedInputs.setpointSensor,
        validate: settingsData.validate,
        hrsAve: validatedInputs.hoursAve,
        duration: validatedInputs.duration,
        waterDrainTime: validatedInputs.waterDrainTime,
        startDelay: validatedInputs.startDelay,
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
      await postValveSettings(updatedSettings, props.userId)
      setHasChanges(false)
    } else {
      presentAlert({
        header: 'Please standby',
        message: 'Standby: Data is being re routed',
        buttons: ['Close'],
      })
    }
  }

  const setAutowaterAlarm = async () => {
    let markerDescriptor
    props.siteList.forEach((site: any) => site.layers.forEach((layer: any) => layer.markers.forEach((d: any) => {
      if (d.sensorId == settingsData.probeId) {
        markerDescriptor = d
      }
    })))
    if (!markerDescriptor) {
      presentAlert({
        header: 'Set AutoWATER Alarm Error',
        message: `You have no ${settingsData.probeId} Moisture marker`,
        buttons: ['Close'],
      })
    } else {
      const alarmData = await getAlarmData(settingsData.probeId)
      if (alarmData.data.lowSetpoint) {
        presentAlert({
          header: 'LowSetpoint Overriding Confirmation',
          message: `You already has LowSetpoint ${alarmData.data.lowFieldLabel} ${alarmData.data.lowSetpoint}. Do you want to override it?`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Confirm',
              role: 'confirm',
              handler: () => {
                setLowSetpoint()
              }
            }
          ]
        })
      } else {
        setLowSetpoint()
      }
    }
  }

  const setLowSetpoint = async () => {
    props.setAlarm(true)
    const fieldsLabelsData = await getFieldLabels(settingsData.probeId)
    const depthSetpointSensor = `Depth ${settingsData.setPointSensor}`
    onSensorSelect(fieldsLabelsData.data, 'Low', settingsData.probeId, props.setLowSelectedSensor,  presentSensorSelectToast, depthSetpointSensor)
    onSetpointSubmit('Low', settingsData.probeId, props.setLowSetpoint, presentSetpointSubmitToast, settingsData.msetPoint)
    onEnableCLick(settingsData.probeId, 'Low', props.isSetpointEnabled, props.setIsSetpointEnabled, props.setIsEnabledToastOpen, props.setIsDisabledToastOpen, props.setIsEnableActionSheet)

    props.setChartPageType('moist')
    props.setAlarmOddBack(true)
  }

  return (
    <IonModal isOpen={props.valveSettings} className={s.settingsModal}>
      <Header type='valveSettingsModal' sensorId={props.sensorId} setValveSettings={props.setValveSettings} settingsOddBack={props.settingsOddBack} setSettingsOddBack={props.setSettingsOddBack} setOddBack={props.setOddBack} setChartPageType={props.setChartPageType} setSiteId={props.setSiteId} moistSensorId={settingsData.probeId} setAutowater={props.setAutowater} />
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
          <IonItem className={`${isNaN(Number(enabled)) && s.settingsWrongInput} ${s.settingsInputWrapper}`}>
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
          <IonButton className={s.settingsButton} onClick={save} disabled={!hasChanges}>Save</IonButton>
          {settingsData.probeId &&
              <IonButton className={s.settingsButton} disabled={hasChanges} fill='outline' onClick={setAutowaterAlarm}>Set
                  AutoWATER Alarm</IonButton>}
        </IonContent>
      )}
    </IonModal>
  )
}
