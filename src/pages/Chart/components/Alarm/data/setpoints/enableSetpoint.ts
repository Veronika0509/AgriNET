import axios from "axios";

export const enableSetpoint = (
  sensorId: string,
  label: string,
  value: boolean,
  resolve: (value: boolean) => void,
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/${label}-enabled/${value}`).then((response: { data: Record<string, boolean> }) => {
    resolve(response.data[`${label}Enabled`])
  })
}