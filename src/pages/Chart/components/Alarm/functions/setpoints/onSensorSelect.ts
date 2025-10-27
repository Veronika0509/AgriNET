import {onSensorChange} from "../../data/setpoints/onSensorChange";

export const onSensorSelect = (
  fieldsLabelsData: Record<string, string>,
  name: string,
  sensorId: string,
  setSelectedSensor: (sensor: string) => void,
  presentToast: (options: unknown) => void,
  buttonString: string
) => {
  const arrayLabel: string | undefined = Object.keys(fieldsLabelsData).find(key => fieldsLabelsData[key] === buttonString)
  const fieldName = name === 'Low' ? 'low-field' : 'high-field'

  new Promise<string>((resolve) => {
    onSensorChange(sensorId, fieldName, arrayLabel, resolve)
  }).then((response: string) => {
    setSelectedSensor(response)
    presentToast({
      message: `${name} Setpoint Metric Updated`,
      duration: 3000,
      position: "bottom",
    });
  })
}