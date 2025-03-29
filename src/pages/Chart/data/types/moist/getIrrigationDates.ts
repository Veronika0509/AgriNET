import axios from "axios";
import {loadGoogleApi} from "../../../../../functions/loadGoogleApiFunc";
import {getValveData} from "../../../../Map/data/types/valve/getValveData";

export const getIrrigationDates = async (
  setIsIrrigationDataIsLoading: any,
  setIsIrrigationButtons: any,
  userId: number,
  sensorId: string,
  setIrrigationDates: any,
  setFullDatesArray: any,
  startDate: any,
  setDisablePrevButton: any
): Promise<void> => {
  let datesArray: any = []
  let fullDatesArrayNs: any = []

  try {
    new Promise((resolve: any) => {
      setIsIrrigationDataIsLoading(true)
      const idForIrrigationDataRequest = axios.get(`https://app.agrinet.us/api/autowater/${sensorId}`)
      resolve(idForIrrigationDataRequest)
    }).then( async (idForIrrigationDataRequest: any) => {
      if (idForIrrigationDataRequest.data === '') {
        setIsIrrigationButtons(false)
        setIsIrrigationDataIsLoading(false)
      } else {
        setIsIrrigationDataIsLoading(false)
        const idForIrrigationData = idForIrrigationDataRequest.data.valve.sensorId
        const response = await getValveData(idForIrrigationData, userId)
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
              const hasEarlierDate = datesArray.some((dateStr: any) => {
                const date = new Date(new Date(dateStr).setHours(0, 0, 0, 0));
                return date < new Date(new Date(startDate).setHours(0, 0, 0, 0));
              });
              if (hasEarlierDate) {
                setDisablePrevButton(false)
              }
            }
            if (fullDatesArrayNs.length === index) {
              setFullDatesArray(fullDatesArrayNs)
            }
          }
        })
      }
    })
  } catch (error) {
    console.log(error);
  }
}