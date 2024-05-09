import axios from "axios";

export const irrigationDatesRequest = async (setIsIrrigationDataIsLoading: any, setIsIrrigationButtons: any, userId: number, siteId: string, setIrrigationDates: any, setFullDatesArray: any): Promise<void> => {
  let datesArray: any = []
  let fullDatesArrayNs: any = []

  try {
    new Promise((resolve: any) => {
      setIsIrrigationDataIsLoading(true)
      const idForIrrigationDataRequest = axios.get(`https://app.agrinet.us/api/autowater/${siteId}`)
      resolve(idForIrrigationDataRequest)
    }).then((idForIrrigationDataRequest: any) => {
      if (idForIrrigationDataRequest.data === '') {
        setIsIrrigationButtons(false)
        setIsIrrigationDataIsLoading(false)
      } else {
        setIsIrrigationDataIsLoading(false)
        const idForIrrigationData = idForIrrigationDataRequest.data.valve.sensorId
        new Promise((resolve: any) => {
          const response: any = axios.get('https://app.agrinet.us/api/valve/scheduler', {
            params: {
              sensorId: idForIrrigationData,
              user: userId,
              version: '42.2.1'
            },
          });

          resolve(response)
        }).then((response: any) => {
          let index: number = 0

          response.data.map((valve: any) => {
            if (valve.valve1 === 'OFF') {
              index += 1
            }
          })

          response.data.map((valve: any) => {
            if (valve.valve1 === 'OFF') {
              datesArray.push(valve.localTime.substring(0, 10))
              fullDatesArrayNs.push(valve.localTime)
              if (datesArray.length === index) {
                setIrrigationDates(datesArray)
              }
              if (fullDatesArrayNs.length === index) {
                setFullDatesArray(fullDatesArrayNs)
              }
            }
          })
        })
      }
    })
  } catch (error) {
    console.log(error);
  }
}