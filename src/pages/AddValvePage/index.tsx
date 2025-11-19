import React, { useState } from "react";
import { IonContent, IonPage, useIonToast } from "@ionic/react";
import Header from "../Chart/components/Header";
import ValveForm from "../../components/ValveForm";
import type { UserId } from "../../types";
import styles from "./style.module.css";

interface MoistureSensor {
  id: string | number;
  name: string;
  layerName?: string;
}

interface ValveFormValues {
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
}

interface AddValvePageProps {
  setPage: (page: number) => void;
  siteList: unknown[];
  selectedSite: string;
  selectedMoistureSensor?: MoistureSensor | null;
  userId: UserId;
}

const AddValvePage: React.FC<AddValvePageProps> = ({
  setPage,
  selectedMoistureSensor,
  userId
}) => {
  const [presentToast] = useIonToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (values: ValveFormValues) => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      // Map form values to API request format
      const requestBody = {
        probeId: values.probeId || "",
        pumpId: "",
        enabled: 0,
        validate: 0,
        priority: values.priority || 0,
        msetPoint: 0,
        setPointSensor: 0,
        hrsAve: 0,
        startDelay: 0,
        concurrent: "",
        duration: 0,
        waterDrainTime: 0,
        valvename: values.valveName || ""
      };

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      await presentToast({
        message: 'Virtual valve created successfully',
        duration: 2000,
        color: 'success'
      });

      setPage(0);
    } catch (error) {
      console.error('Error saving virtual valve:', error);
      await presentToast({
        message: 'Failed to create virtual valve. Please try again.',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPage(0);
  };

  return (
    <IonPage>
      <Header type="addValveModal" setPage={setPage} />
      <IonContent className={styles.addValveContent}>
        <div style={{padding: '20px !important'}}>
          <ValveForm
            onSave={handleSave}
            onCancel={handleCancel}
            initialValues={{
              valveName: selectedMoistureSensor?.name || '',
              probeId: selectedMoistureSensor?.id?.toString() || '',
              priority: 0,
              isPulseIrrigation: false,
              pulseCount: 2,
              pulseOffMinutes: 60,
              duration: '06:00',
              startTime: new Date(new Date().getTime() + 2 * 60 * 1000),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }}
          />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AddValvePage;

//fetch("https://app.agrinet.us/api/add-unit", {
//     "body": "{\"name\":\"innov\",\"lat\":46.096405,\"lng\":-118.276291,\"userId\":103,\"site\":\"asda\",\"layer\":\"Moist\",\"siteGroup\":\"Innov8\",\"installDate\":\"2025-11-19\",\"timezone\":\"America/Los_Angeles\",\"warnIfSensorIdExist\":false,\"askOverrideInstallDate\":false,\"requestHardware\":false,\"sensorId\":\"ANM02377\",\"sensorCount\":6,\"customFields\":{},\"budgetLines\":{},\"rawMetric\":0,\"displayMetric\":0,\"pictureBase64\":null}",
//     "cache": "default",
//     "credentials": "omit",
//     "headers": {
//         "Accept": "*/*",
//         "Accept-Language": "en-GB,en;q=0.9",
//         "Content-Type": "application/json",
//         "Priority": "u=3, i",
//         "User": "103",
//         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15"
//     },
//     "method": "POST",
//     "mode": "cors",
//     "redirect": "follow",
//     "referrer": "https://localhost:5173/",
//     "referrerPolicy": "strict-origin-when-cross-origin"
// })