import React from 'react';
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
  if (!info) return undefined;

  const message = [
    info.battery ? `Battery: ${info.battery}` : undefined,
    `Sensor ID: ${info.sensorId}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <IonAlert
      isOpen={true}
      onDidDismiss={onClose}
      header="Sensor Information"
      subHeader={info.name}
      message={message}
      cssClass="sensor-info-alert"
      buttons={[{ text: 'OK', role: 'cancel' }]}
    />
  );
};

export default SensorInfoDialog;
