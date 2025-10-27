import axios from "axios";

export const onSensorChange = (
  sensorId: string,
  field: string,
  value: string,
  resolve: (value: string) => void
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/${field}/${value}?do-not-catch-error`).then((response: { data: { lowFieldLabel?: string; highFieldLabel?: string } }) => {
    if (field === 'low-field') {
      resolve(response.data.lowFieldLabel || '')
    } else {
      resolve(response.data.highFieldLabel || '')
    }
  })
}