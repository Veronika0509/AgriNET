import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import Header from './components/Header';
import s from './style.module.css';

interface VirtualValveProps {
  setPage: (page: number) => void;
  siteList?: any[];
  selectedSite?: any;
  selectedMoistureSensor?: any;
  setSelectedMoistureSensor?: (sensor: any) => void;
}

const VirtualValve: React.FC<VirtualValveProps> = ({ 
  setPage, 
  siteList, 
  selectedSite, 
  selectedMoistureSensor, 
  setSelectedMoistureSensor 
}) => {
  const [valveName, setValveName] = useState<string>('');
  const [probeId, setProbeId] = useState<string>('');
  const [priority, setPriority] = useState<number>(0);
  const [setpointSensor, setSetpointSensor] = useState<string>('0');
  const [moistureSetpoint, setMoistureSetpoint] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hoursAve, setHoursAve] = useState<number>(0);
  const [startDelay, setStartDelay] = useState<number>(0);
  const [waterDrainTime, setWaterDrainTime] = useState<number>(0);
  const [concurrent, setConcurrent] = useState<string>('');
  const [isFormDirty, setIsFormDirty] = useState<boolean>(true);
  const initialFormState = useRef<Record<string, any>>({});
  const isInitialMount = useRef(true);

  // Track form changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentState = {
      valveName,
      probeId,
      priority,
      setpointSensor,
      moistureSetpoint,
      duration,
      hoursAve,
      startDelay,
      waterDrainTime,
      concurrent
    };

    // Check if form is dirty
    const dirty = Object.entries(currentState).some(([key, value]) => {
      return initialFormState.current[key] !== value;
    });
    
    setIsFormDirty(dirty);
  }, [valveName, probeId, priority, setpointSensor, moistureSetpoint, 
      duration, hoursAve, startDelay, waterDrainTime, concurrent]);

  // Initialize form state
  useEffect(() => {
    const currentState = {
      valveName: '',
      probeId: '',
      priority: 0,
      setpointSensor: '0',
      moistureSetpoint: 0,
      duration: 0,
      hoursAve: 0,
      startDelay: 0,
      waterDrainTime: 0,
      concurrent: ''
    };

    initialFormState.current = { ...currentState };
    setIsFormDirty(true);
  }, []);

  // Update form when selected moisture sensor changes
  useEffect(() => {
    if (selectedMoistureSensor) {
      setValveName(selectedMoistureSensor.name || '');
      setProbeId(selectedMoistureSensor.sensorId || selectedMoistureSensor.id || '');
    }
  }, [selectedMoistureSensor]);

  const handleSave = () => {
    // Save virtual valve
  };

  const handleSetAutowaterAlarm = () => {
    // Set autowater alarm
  };

  return (
    <IonPage>
      <Header setPage={setPage} />
      <IonContent className={s.settingsWrapper}>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Valve Name" 
            value={valveName}
            onIonInput={(event: CustomEvent) => setValveName(event.detail.value)}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Probe ID" 
            value={probeId}
            onIonInput={(event: CustomEvent) => setProbeId(event.detail.value)}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Priority" 
            value={priority}
            onIonInput={(event: CustomEvent) => setPriority(Number(event.detail.value))}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Set Point Sensor" 
            value={setpointSensor}
            onIonInput={(event: CustomEvent) => setSetpointSensor(event.detail.value)}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Moisture Setpoint (%)" 
            value={moistureSetpoint.toString()}
            onIonInput={(event: CustomEvent) => setMoistureSetpoint(Number(event.detail.value))}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Duration (Min)" 
            value={duration}
            onIonInput={(event: CustomEvent) => setDuration(Number(event.detail.value))}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Hours Ave" 
            value={hoursAve}
            onIonInput={(event: CustomEvent) => setHoursAve(Number(event.detail.value))}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Start Delay (Min)" 
            value={startDelay}
            onIonInput={(event: CustomEvent) => setStartDelay(Number(event.detail.value))}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput 
            className={s.settingsInput} 
            label="Water Drain Time (Min)" 
            value={waterDrainTime}
            onIonInput={(event: CustomEvent) => setWaterDrainTime(Number(event.detail.value))}
          />
        </IonItem>
        <IonItem className={`${s.settingsInputWrapper} ${s.settingsInputConcurrentWrapper}`}>
          <IonInput 
            className={s.settingsInput} 
            label="Concurrent" 
            value={concurrent}
            onIonInput={(event: CustomEvent) => setConcurrent(event.detail.value)}
          />
        </IonItem>
        <IonButton className={s.settingsButton} onClick={handleSave}>
          SAVE
        </IonButton>
        {probeId && (
          <IonButton 
            className={s.settingsButton} 
            fill='outline' 
            onClick={handleSetAutowaterAlarm}
            disabled={isFormDirty}
          >
            SET AUTOWATER ALARM
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default VirtualValve;
