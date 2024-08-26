import {onSensorChange} from "../../../data/setpoints/onSensorChange";

export const onSensorSelect = (
  fieldsLabelsData: any,
  name: any,
  sensorId: string,
  setSelectedSensor: any,
  presentToast: any,
  buttonString: string
) => {
  const arrayLabel: any = Object.keys(fieldsLabelsData).find(key => fieldsLabelsData[key] === buttonString)
  const fieldName = name === 'Low' ? 'low-field' : 'high-field'

  new Promise((resolve: any) => {
    onSensorChange(sensorId, fieldName, arrayLabel, resolve)
  }).then((response: any) => {
    setSelectedSensor(response)
    presentToast({
      message: `${name} Setpoint Metric Updated`,
      duration: 3000,
      position: "bottom",
    });
  })
}