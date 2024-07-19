import axios from "axios";

export const getFieldLabels = async (sensorId: any) => {
  return await axios.get('https://app.agrinet.us/api/alarm/field-labels?v=43', {
    params: {
      sensorId: sensorId
    }
  })
}