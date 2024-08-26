import axios from "axios";

export const enableSetpoint = (
  sensorId: string,
  label: string,
  value: boolean,
  resolve: any,
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/${label}-enabled/${value}`).then((response: any) => {
    resolve(response.data[`${label}Enabled`])
  })
}