import {onSetpointChange} from "../../data/setpoints/onSetpointChange";

export const onSetpointSubmit = (
  name: string,
  sensorId: string,
  setSetpoint: (value: number) => void,
  presentToast: (options: unknown) => void,
  event: number
) => {
  const setpointName = name === 'Low' ? 'low-setpoint' : 'high-setpoint'
  new Promise<number>((resolve) => {
    onSetpointChange(sensorId, setpointName, event, resolve)
  }).then((response: number) => {
    setSetpoint(response)
    presentToast({
      message: `${name} Setpoint Updated`,
      duration: 3000,
      position: "bottom",
    });
  })
}