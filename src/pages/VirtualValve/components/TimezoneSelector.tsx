import React from 'react';
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
  // Фильтруем только Moist сенсоры и отображаем имя сайта
  const inputs = sensors
    .filter(sensor => sensor.layerName === 'Moist')
    .map(sensor => ({
      type: 'radio' as const,
      label: sensor.siteName ? `${sensor.name}` : sensor.name,
      value: sensor.sensorId.toString(),
      checked: selectedSensor?.sensorId === sensor.sensorId
    }));

  const buttons = [
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
  ];

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
