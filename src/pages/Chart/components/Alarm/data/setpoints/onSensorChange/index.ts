import axios from "axios";

export const onSensorChange = (
  sensorId: string,
  field: string,
  value: string,
  resolve: any
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/${field}/${value}?do-not-catch-error`).then((response: any) => {
    if (field === 'low-field') {
      resolve(response.data.lowFieldLabel)
    } else {
      resolve(response.data.highFieldLabel)
    }
  })
}