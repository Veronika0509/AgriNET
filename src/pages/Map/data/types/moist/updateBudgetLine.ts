import axios from "axios";

export const updateBudgetLine = async (sensorId: any, line: any, data: any, userId: any) => {
  return await axios.post(`https://app.agrinet.us/api/budget-editor/update/${sensorId}/line/${line}?v=43`, data, {
    headers: {
      "User": userId.toString(),
    }
  })
}