import axios from "axios";

export const getTempMainChartData = async (present: (options: { message: string; duration?: number; position?: string; color?: string }) => void, sensorId: string, userId: string | number, daysProp?: number, endDateProp?: string) => {
  const showErrorMessage = () => {
    present({
      message: 'Standby: Data is being re routed',
      duration: 5000,
      position: 'bottom',
      color: "danger"
    });
  };
  if (daysProp && endDateProp) {
    try {
      return await axios.get(`https://app.agrinet.us/api/chart/temp?sensorId=${sensorId}&days=${daysProp}&endDate=${endDateProp}`, {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en-GB;q=0.9,en;q=0.8,de;q=0.7,es;q=0.6,ru;q=0.5',
          'user': userId
        }
      });
    } catch (error) {
      showErrorMessage()
    }
  } else {
    return await axios.get(`https://app.agrinet.us/api/chart/temp?sensorId=${sensorId}&days=14`, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en-GB;q=0.9,en;q=0.8,de;q=0.7,es;q=0.6,ru;q=0.5',
        'user': userId
      }
    })
  }
};