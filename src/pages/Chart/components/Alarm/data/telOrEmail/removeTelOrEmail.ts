import axios from "axios";

export const removeTelOrEmail = (
  sensorId: string,
  id: number,
  resolve: () => void
) => {
  axios.post(`https://app.agrinet.us/api/alarm/${sensorId}/remove-email-or-phone-number/${id-1}?do-not-catch-error`).then(() => {
    resolve()
  })
}