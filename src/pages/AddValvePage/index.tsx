import React from "react";
import { IonContent, IonPage, useIonToast } from "@ionic/react";
import { useHistory } from "react-router-dom";
import Header from "../Chart/components/Header";
import ValveForm from "../../components/ValveForm";

interface MoistureSensor {
  id: string | number;
  name: string;
  layerName?: string;
}

interface AddValvePageProps {
  setPage: (page: number) => void;
  siteList: any[];
  selectedSite: string;
  selectedMoistureSensor?: MoistureSensor | null;
}

const AddValvePage: React.FC<AddValvePageProps> = ({ 
  setPage, 
  selectedMoistureSensor 
}) => {
  const [presentToast] = useIonToast();
  const history = useHistory();

  const handleSave = (values: any) => {
    presentToast({
      message: 'Valve saved successfully',
      duration: 2000,
      color: 'success'
    });
    setPage(0);
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
