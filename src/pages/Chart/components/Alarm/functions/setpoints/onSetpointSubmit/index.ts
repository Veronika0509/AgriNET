import {onSetpointChange} from "../../../data/setpoints/onSetpointChange";

export const onSetpointSubmit = (
  name: any,
  sensorId: string,
  setSetpoint: any,
  presentToast: any,
  event: any
) => {
  const setpointName = name === 'Low' ? 'low-setpoint' : 'high-setpoint'
  new Promise((resolve: any) => {
    onSetpointChange(sensorId, setpointName, event[0], resolve)
  }).then((response: any) => {
    setSetpoint(response)
    presentToast({
      message: `${name} Setpoint Updated`,
      duration: 3000,
      position: "bottom",
    });
  })
}