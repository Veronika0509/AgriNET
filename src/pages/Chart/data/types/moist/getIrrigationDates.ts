import axios from "axios";
import {getValveData} from "../../../../Map/data/types/valve/getValveData";

export const getIrrigationDates = async (
  setIsIrrigationDataIsLoading: (loading: boolean) => void,
  setIsIrrigationButtons: (show: boolean) => void,
  userId: number,
  sensorId: string,
  setIrrigationDates: (dates: string[]) => void,
  setFullDatesArray: (dates: string[]) => void,
  startDate: string | Date,
  setDisablePrevButton: (disabled: boolean) => void
): Promise<void> => {
  const datesArray: string[] = []
  const fullDatesArrayNs: string[] = []

  try {
    const idForIrrigationDataRequest = await axios.get(`https://app.agrinet.us/api/autowater/${sensorId}`)
    setIsIrrigationDataIsLoading(true)
    
    if (idForIrrigationDataRequest.data === '') {
      setIsIrrigationButtons(false)
      setIsIrrigationDataIsLoading(false)
      setFullDatesArray([])
    } else {
      setIsIrrigationDataIsLoading(false)
      const idForIrrigationData = (idForIrrigationDataRequest.data as { valve: { sensorId: string } }).valve.sensorId
      const response = await getValveData(idForIrrigationData, userId)
      if (response.data.length !== 0) {
        let index: number = 0

        response.data.map((valve: { valve1: string; localTime: string }) => {
          if (valve.valve1 === 'OFF') {
            index += 1
          }
        })

        response.data.map((valve: { valve1: string; localTime: string }) => {
          if (valve.valve1 === 'OFF') {
            datesArray.push(valve.localTime.substring(0, 10))
            fullDatesArrayNs.push(valve.localTime)
            if (datesArray.length === index) {
              setIrrigationDates(datesArray)
              const hasEarlierDate = datesArray.some((dateStr: string) => {
                const date = new Date(new Date(dateStr).setHours(0, 0, 0, 0));
                return date < new Date(new Date(startDate).setHours(0, 0, 0, 0));
              });
              if (hasEarlierDate) {
                setDisablePrevButton(false)
              } else {
                setDisablePrevButton(true)
              }
            }
            if (fullDatesArrayNs.length === index) {
              const sortedDates = fullDatesArrayNs.sort((a: string, b: string) => {
                return new Date(a).getTime() - new Date(b).getTime();
              });
              setFullDatesArray(sortedDates)
            }
          }
        })
      } else {
        setIsIrrigationButtons(false)
        setFullDatesArray([])
      }
    }
  } catch (error) {
    // Error handling
  }
}