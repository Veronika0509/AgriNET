import axios from 'axios';

export const setTelOrEmail = (
  sensorId: string,
  id: number,
  value: any,
  resolve: any
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/email-or-phone-number/${id - 1}/${value}?do-not-catch-error`).then((response: any) => {
    resolve(response.data.emailsAndPhoneNumbers[id-1])
  })
}