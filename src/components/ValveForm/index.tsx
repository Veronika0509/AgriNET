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
} from "@ionic/react"
import { addOutline, removeOutline } from "ionicons/icons"
import './ValveForm.css'

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
  const [timezone] = useState(initialValues.timezone || 'America/Los_Angeles');
  
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
    <div className="valve-form-container">
        <IonItem className="valve-form-item" lines="none">
        <IonInput
          className="valve-form-input"
          label="Valve Name"
          labelPlacement="stacked"
          value={valveName}
          onIonChange={(e) => setValveName(e.detail.value || '')}
          placeholder="Enter valve name"
        />
      </IonItem>

      <IonItem className="valve-form-item" lines="none">
        <IonInput
          className="valve-form-input"
          label="Probe ID"
          labelPlacement="stacked"
          value={probeId}
          onIonChange={(e) => setProbeId(e.detail.value || '')}
          placeholder="Enter probe ID"
          readonly
        />
      </IonItem>

      <IonItem className="valve-form-item" lines="none">
        <IonInput
          className="valve-form-input"
          type="number"
          label="Priority"
          labelPlacement="stacked"
          value={priority}
          onIonChange={(e) => setPriority(Number(e.detail.value) || 0)}
          placeholder="Enter priority (0-9)"
          min={0}
          max={9}
        />
      </IonItem>

      {showPulseIrrigation && (
        <>
          <IonItem className="valve-form-item valve-form-checkbox-item" lines="none">
            <IonLabel className="valve-form-label">Pulse Irrigation</IonLabel>
            <IonCheckbox
              slot="end"
              checked={isPulseIrrigation}
              onIonChange={(e) => setIsPulseIrrigation(e.detail.checked)}
            />
          </IonItem>

          {isPulseIrrigation && (
            <>
              <IonItem className="valve-form-item" lines="none">
                <IonLabel className="valve-form-label">Pulse Count: {pulseCount}</IonLabel>
                <div slot="end" className="pulse-count-controls">
                  <IonButton
                    className="pulse-count-button"
                    fill="clear"
                    onClick={() => handlePulseCount(-1)}
                    disabled={pulseCount <= 2}
                  >
                    <IonIcon slot="icon-only" icon={removeOutline} />
                  </IonButton>
                  <IonButton
                    className="pulse-count-button"
                    fill="clear"
                    onClick={() => handlePulseCount(1)}
                  >
                    <IonIcon slot="icon-only" icon={addOutline} />
                  </IonButton>
                </div>
              </IonItem>

              <IonItem className="valve-form-item" lines="none">
                <IonInput
                  className="valve-form-input"
                  type="number"
                  label="Pulse Off (minutes)"
                  labelPlacement="stacked"
                  value={pulseOffMinutes}
                  onIonChange={(e) => setPulseOffMinutes(Number(e.detail.value) || 0)}
                  placeholder="Enter minutes"
                  min={1}
                />
              </IonItem>
            </>
          )}
        </>
      )}

      <IonItem className="valve-form-item datetime-item" lines="none">
        <IonLabel className="valve-form-label" position="stacked">Start Time</IonLabel>
        <IonDatetimeButton className="datetime-button" datetime="start-time" />
      </IonItem>

      <IonItem className="valve-form-item" lines="none">
        <IonInput
          className="valve-form-input"
          type="time"
          label="Duration"
          labelPlacement="stacked"
          value={duration}
          onIonChange={(e) => setDuration(e.detail.value || '00:00')}
        />
      </IonItem>

      <IonItem className="valve-form-item datetime-item" lines="none">
        <IonLabel className="valve-form-label" position="stacked">Stop Time</IonLabel>
        <IonDatetimeButton className="datetime-button" datetime="stop-time" />
      </IonItem>

      <IonModal keepContentsMounted={true}>
        <IonDatetime
          id="start-time"
          value={startTime.toISOString()}
          onIonChange={(e) => setStartTime(new Date(e.detail.value as string))}
          showDefaultButtons={true}
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
          showDefaultButtons={true}
        />
      </IonModal>

      <div className="valve-form-actions">
        <IonButton
          className="valve-form-button"
          onClick={handleSave}
        >
          Save Virtual Valve
        </IonButton>
        {onCancel && (
          <IonButton
            className="valve-form-button"
            fill="outline"
            onClick={onCancel}
          >
            Cancel
          </IonButton>
        )}
      </div>
    </div>
  );
};

export default ValveForm;
