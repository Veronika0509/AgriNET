import axios from "axios";

export const updateBudgetLine = async (sensorId: string | number, line: string | number, data: unknown, userId: string | number) => {
  return await axios.post(`https://app.agrinet.us/api/budget-editor/update/${sensorId}/line/${line}?v=43`, data, {
    headers: {
      "User": userId.toString(),
    }
  })
}