import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonPage, useIonAlert } from '@ionic/react';
import Header from './components/Header';
import s from './style.module.css';
import type { UserId } from '../../types';

interface VirtualValveProps {
  setPage: (page: number) => void;
  siteList?: unknown[];
  selectedSite?: unknown;
  selectedMoistureSensor?: {
    id?: string | number;
    name?: string;
    sensorId?: string;
  };
  setSelectedMoistureSensor?: (sensor: unknown) => void;
  userId: UserId;
}

const VirtualValve: React.FC<VirtualValveProps> = ({
  setPage,
  selectedMoistureSensor,
  userId
}) => {
  const [presentAlert] = useIonAlert();
  const [valveName, setValveName] = useState<string>('');
  const [probeId, setProbeId] = useState<string>('');
  const [priority, setPriority] = useState<string>('0');
  const [setpointSensor, setSetpointSensor] = useState<string>('0');
  const [moistureSetpoint, setMoistureSetpoint] = useState<string>('0');
  const [duration, setDuration] = useState<string>('0');
  const [hoursAve, setHoursAve] = useState<string>('0');
  const [startDelay, setStartDelay] = useState<string>('0');
  const [waterDrainTime, setWaterDrainTime] = useState<string>('0');
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
      priority: '0',
      setpointSensor: '0',
      moistureSetpoint: '0',
      duration: '0',
      hoursAve: '0',
      startDelay: '0',
      waterDrainTime: '0',
      concurrent: ''
    };

    initialFormState.current = { ...currentState };
    setIsFormDirty(true);
  }, []);

  // Update form when selected moisture sensor changes
  useEffect(() => {
    if (selectedMoistureSensor) {
      setValveName(selectedMoistureSensor.name || '');
      const id = selectedMoistureSensor.sensorId || selectedMoistureSensor.id;
      setProbeId(id ? String(id) : '');
    }
  }, [selectedMoistureSensor]);

  const handleSave = async () => {
    try {
      // VALIDATION: Check if all required fields are filled
      const validationErrors: string[] = [];

      // Valve Name - must not be empty
      if (!valveName.trim()) {
        validationErrors.push('Valve Name');
      }

      // Priority - check if value is empty string or null/undefined
      // Note: 0 is a valid value, so we check if the string representation is empty
      const priorityStr = String(priority);
      if (priorityStr.trim() === '' || priority === null || priority === undefined) {
        validationErrors.push('Priority');
      }

      // Set Point Sensor - check if value is empty
      if (!setpointSensor || String(setpointSensor).trim() === '') {
        validationErrors.push('Set Point Sensor');
      }

      // Moisture Setpoint - check if value is empty string or null/undefined
      const moistureStr = String(moistureSetpoint);
      if (moistureStr.trim() === '' || moistureSetpoint === null || moistureSetpoint === undefined) {
        validationErrors.push('Moisture Setpoint (%)');
      }

      // Duration - check if value is empty string or null/undefined
      const durationStr = String(duration);
      if (durationStr.trim() === '' || duration === null || duration === undefined) {
        validationErrors.push('Duration (Min)');
      }

      if (validationErrors.length > 0) {
        await presentAlert({
          header: 'Required Fields Missing',
          message: `Please fill in the following required fields:\n${validationErrors.join(', ')}`,
          buttons: ['OK'],
        });
        return;
      }

      // Get all user data from localStorage
      const userDataStr = localStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      // Get user role and premium status
      const userRole = userData?.role || localStorage.getItem('userRole');
      const isPremium = userData.premium

      // PERMISSION CHECK: Role + Premium validation
      // Allowed roles: Admin, Dealer, Superuser, User (NOT Demo)
      // Must also have Premium = true
      const allowedRoles = ['Admin', 'Dealer', 'Superuser', 'User'];
      console.log("=== PERMISSION CHECK ===");
      console.log("User Role:", userRole);
      console.log("Is Premium:", isPremium);
      console.log("Allowed Roles:", allowedRoles);

      // Check if user is Demo
      if (userRole === 'Demo') {
        await presentAlert({
          header: 'Access Denied',
          message: 'You do not have permission to perform this action. Demo accounts have read-only access and cannot create or modify valve settings.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                setPage(1); // Go back to Add Unit page
              }
            }
          ]
        });
        return;
      }

      // Check if user role is allowed
      if (!userRole || !allowedRoles.includes(userRole)) {
        await presentAlert({
          header: 'Access Denied',
          message: 'You do not have permission to perform this action. Demo accounts have read-only access and cannot create or modify valve settings.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                setPage(1); // Go back to Add Unit page
              }
            }
          ]
        });
        return;
      }

      // Check if user has Premium
      if (!isPremium) {
        await presentAlert({
          header: 'Access Denied',
          message: 'You do not have permission to perform this action. Demo accounts have read-only access and cannot create or modify valve settings.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                setPage(1); // Go back to Add Unit page
              }
            }
          ]
        });
        return;
      }

      console.log("✅ Permission check passed!");

      // Console log ALL user fields from the server
      console.log("\n=== COMPLETE USER DATA FROM SERVER ===");
      if (userData) {
        console.log("All user fields:");
        Object.keys(userData).forEach(key => {
          console.log(`  ${key}:`, userData[key]);
        });
        console.log("\nComplete userData object:", userData);
      } else {
        console.log("No userData found in localStorage");
      }

      console.log("\n=== USER ID (from prop) ===");
      console.log("User ID:", userId);

      // Log selected moisture sensor information
      console.log("\n=== SELECTED MOISTURE SENSOR ===");
      console.log("Selected Sensor:", selectedMoistureSensor);

      // Log all form values
      console.log("\n=== FORM VALUES ===");
      console.log("Valve Name:", valveName);
      console.log("Probe ID:", probeId);
      console.log("Priority:", priority);
      console.log("Setpoint Sensor:", setpointSensor);
      console.log("Moisture Setpoint:", moistureSetpoint);
      console.log("Duration:", duration);
      console.log("Hours Ave:", hoursAve);
      console.log("Start Delay:", startDelay);
      console.log("Water Drain Time:", waterDrainTime);
      console.log("Concurrent:", concurrent);

      // Map form values to API request format (convert strings to numbers)
      const requestBody = {
        probeId: probeId || "",
        pumpId: "",
        enabled: 0,
        validate: 0,
        priority: Number(priority) || 0,
        msetPoint: Number(moistureSetpoint) || 0,
        setPointSensor: Number(setpointSensor) || 0,
        hrsAve: Number(hoursAve) || 0,
        startDelay: Number(startDelay) || 0,
        concurrent: concurrent || "",
        duration: Number(duration) || 0,
        waterDrainTime: Number(waterDrainTime) || 0,
        valvename: valveName || ""
      };

      console.log("\n=== API REQUEST BODY (sending to server) ===");
      console.log(JSON.stringify(requestBody, null, 2));

      const response = await fetch("https://app.agrinet.us/api/valve/settings?virtual=true", {
        method: "POST",
        headers: {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json",
          "user": userId.toString()
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "omit"
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Failed to create virtual valve`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If response body can't be parsed, use default message
        }

        console.error('API Error:', errorMessage);

        await presentAlert({
          header: 'Error Creating Virtual Valve',
          message: errorMessage,
          buttons: ['OK'],
        });

        // Stay on the page so user can fix the issue
        return;
      }

      const responseData = await response.json();
      console.log("\n=== API RESPONSE ===");
      console.log(responseData);

      // Get the sensor ID from the response or use probe ID as fallback
      const sensorId = responseData?.id || responseData?.sensorId || probeId;

      await presentAlert({
        header: 'Success',
        message: `Virtual Valve Created with ID ${sensorId}. Now you can use AutoWATER System on ${probeId} sensor page.`,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              console.log("\n✅ Virtual valve created successfully.");
              // Return to Add Unit page
              setPage(1);
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error in handleSave:', error);
      // Stay on the page so user can fix the issue
    }
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
            required
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Probe ID"
            value={probeId}
            onIonInput={(event: CustomEvent) => setProbeId(event.detail.value)}
            readonly
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Priority"
            type="number"
            value={priority}
            onIonInput={(event: CustomEvent) => setPriority(event.detail.value || '')}
            required
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Set Point Sensor"
            type="number"
            value={setpointSensor}
            onIonInput={(event: CustomEvent) => setSetpointSensor(event.detail.value || '')}
            required
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Moisture Setpoint (%)"
            type="number"
            value={moistureSetpoint}
            onIonInput={(event: CustomEvent) => setMoistureSetpoint(event.detail.value || '')}
            required
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Duration (Min)"
            type="number"
            value={duration}
            onIonInput={(event: CustomEvent) => setDuration(event.detail.value || '')}
            required
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Hours Ave"
            value={hoursAve}
            onIonInput={(event: CustomEvent) => setHoursAve(event.detail.value || '')}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Start Delay (Min)"
            value={startDelay}
            onIonInput={(event: CustomEvent) => setStartDelay(event.detail.value || '')}
          />
        </IonItem>
        <IonItem className={s.settingsInputWrapper}>
          <IonInput
            className={s.settingsInput}
            label="Water Drain Time (Min)"
            value={waterDrainTime}
            onIonInput={(event: CustomEvent) => setWaterDrainTime(event.detail.value || '')}
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
