import React, { useMemo } from 'react';
import {
  IonAlert
} from '@ionic/react';

interface Sensor {
  layerName: string;
  sensorId: string;
  name: string;
  [key: string]: any;
}

interface SensorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sensor: Sensor) => void;
  selectedSensor: Sensor | null;
  sensors: Sensor[];
}

const SensorSelector: React.FC<SensorSelectorProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSensor,
  sensors
}) => {
  const inputs = useMemo(() => sensors
    .filter(sensor => sensor.layerName === 'Moist')
    .map(sensor => ({
      type: 'radio' as const,
      label: sensor.siteName ? `${sensor.name}` : sensor.name,
      value: sensor.sensorId.toString(),
      checked: selectedSensor?.sensorId === sensor.sensorId
    })), [sensors, selectedSensor]);

  const buttons = useMemo(() => [
    {
      text: 'CANCEL',
      role: 'cancel',
      handler: () => {
        onClose();
      }
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: (value: string) => {
        const selectedSensorData = sensors.find(sensor => sensor.sensorId.toString() === value);
        if (selectedSensorData) {
          onConfirm(selectedSensorData);
        }
      }
    }
  ], [sensors, onClose, onConfirm]);

  if (!isOpen) return undefined;

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Select Moisture sensor for new Valve"
      inputs={inputs}
      buttons={buttons}
    />
  );
};

export default SensorSelector;
