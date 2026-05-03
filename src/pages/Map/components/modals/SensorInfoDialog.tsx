import React, { useEffect, useRef, useState } from 'react';
import { IonAlert } from '@ionic/react';

export interface SensorInfo {
  name: string;
  sensorId: string;
  battery?: string;
}

interface SensorInfoDialogProps {
  info: SensorInfo | undefined;
  onClose: () => void;
}

const SensorInfoDialog: React.FC<SensorInfoDialogProps> = ({ info, onClose }) => {
  const [displayInfo, setDisplayInfo] = useState<SensorInfo | undefined>(info);
  const lastInfoRef = useRef<SensorInfo | undefined>(info);

  useEffect(() => {
    if (info) {
      lastInfoRef.current = info;
      setDisplayInfo(info);
    }
  }, [info]);

  const isOpen = !!info;
  const shown = displayInfo ?? lastInfoRef.current;
  const subHeader = shown?.name ?? '';
  const message = shown
    ? [shown.battery ? `Battery: ${shown.battery}` : undefined, `Sensor ID: ${shown.sensorId}`]
        .filter(Boolean)
        .join('\n')
    : '';

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Sensor Information"
      subHeader={subHeader}
      message={message}
      cssClass="sensor-info-alert"
      buttons={[{ text: 'OK', role: 'cancel' }]}
    />
  );
};

export default SensorInfoDialog;
