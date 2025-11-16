import React, { useState } from "react";
import { IonContent, IonPage, useIonToast } from "@ionic/react";
import Header from "../Chart/components/Header";
import ValveForm from "../../components/ValveForm";
import type { UserId } from "../../types";

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
      <IonContent>
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
      </IonContent>
    </IonPage>
  )
}

export default AddValvePage;
