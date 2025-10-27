import axios from 'axios';

export const setTelOrEmail = (
  sensorId: string,
  id: number,
  value: string,
  resolve: (value: string) => void
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/email-or-phone-number/${id - 1}/${value}?do-not-catch-error`).then((response: { data: { emailsAndPhoneNumbers: string[] } }) => {
    resolve(response.data.emailsAndPhoneNumbers[id-1])
  })
}