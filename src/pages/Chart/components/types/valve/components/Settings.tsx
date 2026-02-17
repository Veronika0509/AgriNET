import {IonButton, IonContent, IonInput, IonItem, IonModal, useIonAlert, useIonToast} from "@ionic/react";
import s from '../style.module.css'
import Header from "../../.././Header";
import React, {useEffect, useState} from "react";
import {getValveSettingsData} from "../../../../data/types/valve/getValveSettingsData";
import {postValveSettings} from "../../../../data/types/valve/postValveSettings";
import {getFieldLabels} from "../../../Alarm/data/getFieldLabels";
import {getAlarmData} from "../../../Alarm/data/getAlarmData";
import {onSensorSelect} from "../../../Alarm/functions/setpoints/onSensorSelect";
import {onSetpointSubmit} from "../../../Alarm/functions/setpoints/onSetpointSubmit";
import {onEnableCLick} from "../../../Alarm/functions/setpoints/onEnableClick";

// Типы
import type { ValveSettings } from '../../../../../../types';

// Интерфейсы для типизации
interface SiteMarker {
  sensorId: string;
  [key: string]: unknown;
}

interface SiteLayer {
  markers: SiteMarker[];
  [key: string]: unknown;
}

interface Site {
  layers: SiteLayer[];
  [key: string]: unknown;
}

interface SettingsProps {
  sensorId: string;
  userId: number;
  siteList: Site[];
  valveSettings?: ValveSettings;
  setValveSettings?: React.Dispatch<React.SetStateAction<ValveSettings | undefined>>;
  setAlarm?: (value: boolean) => void;
  setLowSelectedSensor?: (sensor: string) => void;
  setLowSetpoint?: (setpoint: number) => void;
  isSetpointEnabled?: boolean;
  setIsSetpointEnabled?: (enabled: boolean) => void;
  setIsEnabledToastOpen?: (open: boolean) => void;
  setIsDisabledToastOpen?: (open: boolean) => void;
  setIsEnableActionSheet?: (open: boolean) => void;
  setChartPageType?: (type: string) => void;
  setAlarmOddBack?: (value: boolean) => void;
  alarmOddBack?: boolean;
  settingsOddBack?: boolean;
  setSettingsOddBack?: (value: boolean) => void;
  setOddBack?: (value: boolean) => void;
  setSiteId?: (id: string | number) => void;
  setSiteName?: (name: string) => void;
  setAutowater?: (value: boolean) => void;
  setAdditionalChartData?: (data: unknown) => void;
  setChartData?: (data: unknown) => void;
}

export const Settings: React.FC<SettingsProps> = (props) => {
  const [settingsData, setSettingsData] = useState<ValveSettings | null>(null)
  const [valveName, setValveName] = useState<string>('')
  const [probeId, setProbeId] = useState<string>('')
  const [enabled, setEnabled] = useState<boolean>(false)
  const [priority, setPriority] = useState<number>(1)
  const [setpointSensor, setSetpointSensor] = useState<string>('')
  const [moistureSetpoint, setMoistureSetpoint] = useState<number>(0)
  const [duration, setDuration] = useState<string>('06:00')
  const [hoursAve, setHoursAve] = useState<number>(1)
  const [startDelay, setStartDelay] = useState<number>(0)
  const [waterDrainTime, setWaterDrainTime] = useState<number>(0)
  const [concurrent, setConcurrent] = useState<boolean>(false)
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
    if (!settingsData) return;
    
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
  }, [valveName, probeId, enabled, priority, setpointSensor, moistureSetpoint, duration, hoursAve, startDelay, waterDrainTime, concurrent, settingsData]);

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
    if (!settingsData) {
      presentAlert({
        header: 'Error',
        message: 'Settings data not loaded',
        buttons: ['Close'],
      })
      return;
    }
    
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
      console.log('[Overlay] Alert: "Standby: Data is being re routed" — Valve Settings save, settingsData is null')
      presentAlert({
        header: 'Please standby',
        message: 'Standby: Data is being re routed',
        buttons: ['Close'],
      })
    }
  }

  const setAutowaterAlarm = async () => {
    if (!settingsData) {
      presentAlert({
        header: 'Error',
        message: 'Settings data not loaded',
        buttons: ['Close'],
      })
      return;
    }
    
    let markerDescriptor
    props.siteList.forEach((site: Site) => site.layers.forEach((layer: SiteLayer) => layer.markers.forEach((marker: SiteMarker) => {
      if (marker.sensorId == settingsData.probeId) {
        markerDescriptor = marker
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
    if (!settingsData) return;

    props.setAlarm?.(true)
    const fieldsLabelsData = await getFieldLabels(settingsData.probeId)
    const depthSetpointSensor = `Depth ${settingsData.setPointSensor}`
    if (props.setLowSelectedSensor) {
      onSensorSelect(fieldsLabelsData.data, 'Low', settingsData.probeId, props.setLowSelectedSensor,  presentSensorSelectToast, depthSetpointSensor)
    }
    if (props.setLowSetpoint) {
      onSetpointSubmit('Low', settingsData.probeId, props.setLowSetpoint, presentSetpointSubmitToast, settingsData.msetPoint)
    }
    if (props.setIsSetpointEnabled) {
      onEnableCLick(settingsData.probeId, 'Low', props.isSetpointEnabled ?? false, props.setIsSetpointEnabled, props.setIsEnabledToastOpen, props.setIsDisabledToastOpen, props.setIsEnableActionSheet)
    }

    props.setChartPageType?.('moist')
    props.setAlarmOddBack?.(true)
  }

  return (
    <IonModal isOpen={!!props.valveSettings} className={s.settingsModal}>
      {/* @ts-ignore */}
      <Header type='valveSettingsModal' sensorId={props.sensorId} setValveSettings={props.setValveSettings as any} settingsOddBack={props.settingsOddBack as any} setSettingsOddBack={props.setSettingsOddBack} setOddBack={props.setOddBack} setChartPageType={props.setChartPageType} setSiteId={props.setSiteId as any} moistSensorId={settingsData?.probeId || ''} setAutowater={props.setAutowater} />
      {settingsData && (
        <IonContent className={s.settingsWrapper}>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Valve Name" value={valveName}
                      onIonInput={(event: CustomEvent) => setValveName(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Probe ID" value={probeId}
                      onIonInput={(event: CustomEvent) => setProbeId(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={`${isNaN(Number(enabled)) && s.settingsWrongInput} ${s.settingsInputWrapper}`}>
            <IonInput className={s.settingsInput} label="Enabled" value={enabled.toString()}
                      onIonInput={(event: CustomEvent) => setEnabled(Boolean(event.detail.value))}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Priority" value={priority}
                      onIonInput={(event: CustomEvent) => setPriority(Number(event.detail.value))}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Set Point Sensor" value={setpointSensor}
                      onIonInput={(event: CustomEvent) => setSetpointSensor(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Moisture Setpoint (%)" value={moistureSetpoint.toString()}
                      onIonInput={(event: CustomEvent) => setMoistureSetpoint(Number(event.detail.value))}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Duration (Min)" value={duration}
                      onIonInput={(event: CustomEvent) => setDuration(event.detail.value)}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Hours Ave" value={hoursAve}
                      onIonInput={(event: CustomEvent) => setHoursAve(Number(event.detail.value))}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Start Delay (Min)" value={startDelay}
                      onIonInput={(event: CustomEvent) => setStartDelay(Number(event.detail.value))}></IonInput>
          </IonItem>
          <IonItem className={s.settingsInputWrapper}>
            <IonInput className={s.settingsInput} label="Water Drain Time (Min)" value={waterDrainTime}
                      onIonInput={(event: CustomEvent) => setWaterDrainTime(Number(event.detail.value))}></IonInput>
          </IonItem>
          <IonItem className={`${s.settingsInputWrapper} ${s.settingsInputConcurrentWrapper}`}>
            <IonInput className={s.settingsInput} label="Concurrent" value={concurrent.toString()}
                      onIonInput={(event: CustomEvent) => setConcurrent(Boolean(event.detail.value))}></IonInput>
          </IonItem>
          <IonButton className={s.settingsButton} onClick={save} disabled={!hasChanges}>Save</IonButton>
          {settingsData.probeId && (
            <IonButton 
              className={s.settingsButton} 
              disabled={hasChanges || !settingsData.probeId} 
              fill='outline' 
              onClick={setAutowaterAlarm}
            >
              Set AutoWATER Alarm
            </IonButton>
          )}
        </IonContent>
      )}
    </IonModal>
  )
}
