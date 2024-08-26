import axios from "axios";

export const onSetpointChange = (
  sensorId: string,
  setpoint: string,
  value: any,
  resolve: any
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/${setpoint}/${value}`).then((response) => {
    if (setpoint === 'low-setpoint') {
      resolve(response.data.lowSetpoint)
    } else {
      resolve(response.data.highSetpoint)
    }
  })
}