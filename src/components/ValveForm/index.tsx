import React, { useState, useEffect, useRef } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
} from "@ionic/react"
import { addOutline, removeOutline } from "ionicons/icons"
import { getDatetime } from "../../pages/Chart/components/DateTimePicker/functions/getDatetime"

interface ValveFormProps {
  initialValues?: {
    valveName?: string;
    probeId?: string;
    priority?: number;
    isPulseIrrigation?: boolean;
    pulseCount?: number;
    pulseOffMinutes?: number;
    duration?: string;
    startTime?: Date;
    stopTime?: Date;
    timezone?: string;
  };
  onSave: (values: {
    valveName: string;
    probeId: string;
    priority: number;
    isPulseIrrigation: boolean;
    pulseCount: number;
    pulseOffMinutes: number;
    duration: string;
    startTime: Date;
    stopTime: Date;
    timezone: string;
  }) => void;
  onCancel?: () => void;
  showPulseIrrigation?: boolean;
}

const ValveForm: React.FC<ValveFormProps> = ({
  initialValues = {},
  onSave,
  onCancel,
  showPulseIrrigation = true,
}) => {
  const [valveName, setValveName] = useState(initialValues.valveName || '');
  const [probeId, setProbeId] = useState(initialValues.probeId || '');
  const [priority, setPriority] = useState(initialValues.priority || 0);
  const [isPulseIrrigation, setIsPulseIrrigation] = useState(initialValues.isPulseIrrigation || false);
  const [pulseCount, setPulseCount] = useState(initialValues.pulseCount || 2);
  const [pulseOffMinutes, setPulseOffMinutes] = useState(initialValues.pulseOffMinutes || 60);
  const [duration, setDuration] = useState(initialValues.duration || '06:00');
  const [startTime, setStartTime] = useState<Date>(initialValues.startTime || new Date(new Date().getTime() + 2 * 60 * 1000));
  const [stopTime, setStopTime] = useState<Date>(() => {
    if (initialValues.stopTime) return initialValues.stopTime;
    const [hours, minutes] = (initialValues.duration || '06:00').split(':').map(Number);
    return new Date(new Date().getTime() + (hours * 60 + minutes + 2) * 60 * 1000);
  });
  const [timezone, setTimezone] = useState(initialValues.timezone || 'America/Los_Angeles');
  
  const stopDatetimeRef = useRef<HTMLIonDatetimeElement>(null);

  useEffect(() => {
    const [hours, minutes] = duration.split(':').map(Number);
    const newStopTime = new Date(new Date(startTime).getTime() + (hours * 60 + minutes) * 60 * 1000);
    setStopTime(newStopTime);
  }, [startTime, duration]);

  const handlePulseCount = (change: number) => {
    const newValue = pulseCount + change;
    if (newValue >= 2) {
      setPulseCount(newValue);
    }
  };

  const handleSave = () => {
    onSave({
      valveName,
      probeId,
      priority,
      isPulseIrrigation,
      pulseCount,
      pulseOffMinutes,
      duration,
      startTime,
      stopTime,
      timezone,
    });
  };

  return (
    <div className="ion-padding">
      <IonItem className="ion-margin-bottom">
        <IonInput
          label="Valve Name"
          value={valveName}
          onIonChange={(e) => setValveName(e.detail.value || '')}
          placeholder="Enter valve name"
        />
      </IonItem>

      <IonItem className="ion-margin-bottom">
        <IonInput
          label="Probe ID"
          value={probeId}
          onIonChange={(e) => setProbeId(e.detail.value || '')}
          placeholder="Enter probe ID"
        />
      </IonItem>

      <IonItem className="ion-margin-bottom">
        <IonInput
          type="number"
          label="Priority"
          value={priority}
          onIonChange={(e) => setPriority(Number(e.detail.value) || 0)}
          placeholder="Enter priority"
        />
      </IonItem>

      {showPulseIrrigation && (
        <>
          <IonItem className="ion-margin-bottom">
            <IonLabel>Pulse Irrigation</IonLabel>
            <IonCheckbox
              checked={isPulseIrrigation}
              onIonChange={(e) => setIsPulseIrrigation(e.detail.checked)}
            />
          </IonItem>

          {isPulseIrrigation && (
            <>
              <IonItem className="ion-margin-bottom">
                <IonLabel>Pulse Count: {pulseCount}</IonLabel>
                <IonButton fill="clear" onClick={() => handlePulseCount(-1)}>
                  <IonIcon icon={removeOutline} />
                </IonButton>
                <IonButton fill="clear" onClick={() => handlePulseCount(1)}>
                  <IonIcon icon={addOutline} />
                </IonButton>
              </IonItem>

              <IonItem className="ion-margin-bottom">
                <IonInput
                  type="number"
                  label="Pulse Off (minutes)"
                  value={pulseOffMinutes}
                  onIonChange={(e) => setPulseOffMinutes(Number(e.detail.value) || 0)}
                  placeholder="Enter minutes"
                />
              </IonItem>
            </>
          )}
        </>
      )}

      <IonItem className="ion-margin-bottom">
        <IonLabel>Start Time</IonLabel>
        <IonDatetimeButton datetime="start-time" />
      </IonItem>

      <IonItem className="ion-margin-bottom">
        <IonInput
          type="time"
          label="Duration"
          value={duration}
          onIonChange={(e) => setDuration(e.detail.value || '00:00')}
        />
      </IonItem>

      <IonItem className="ion-margin-bottom">
        <IonLabel>Stop Time</IonLabel>
        <IonDatetimeButton datetime="stop-time" />
      </IonItem>

      <IonModal keepContentsMounted={true}>
        <IonDatetime
          id="start-time"
          value={startTime.toISOString()}
          onIonChange={(e) => setStartTime(new Date(e.detail.value as string))}
        />
      </IonModal>

      <IonModal keepContentsMounted={true}>
        <IonDatetime
          id="stop-time"
          ref={stopDatetimeRef}
          value={stopTime.toISOString()}
          onIonChange={(e) => {
            const newStopTime = new Date(e.detail.value as string);
            if (newStopTime > startTime) {
              setStopTime(newStopTime);
              // Calculate new duration
              const diffMs = newStopTime.getTime() - startTime.getTime();
              const diffMins = Math.round(diffMs / 60000);
              const hours = Math.floor(diffMins / 60);
              const minutes = diffMins % 60;
              setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            }
          }}
        />
      </IonModal>

      <div className="ion-padding">
        <IonButton expand="block" onClick={handleSave} className="ion-margin-bottom">
          Save
        </IonButton>
        {onCancel && (
          <IonButton expand="block" fill="outline" onClick={onCancel}>
            Cancel
          </IonButton>
        )}
      </div>
    </div>
  );
};

export default ValveForm;
