import s from './style.module.css'
import {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {handleResize} from "../../../functions/handleResize";
import {irrigationDatesRequest} from "../../../data/types/moist/irriationDatesRequest";
import {moistSumChartDataRequest} from "../../../data/types/moist/moistSumChartDataRequest";
import {IonContent} from "@ionic/react";
import TopSection from "../../TopSection";
import IrrigationButtons from "./IrrigationButtons";
import {createMoistMainChart} from "../../../functions/types/moist/createMoistMainChart";
import {createMoistSumChart} from "../../../functions/types/moist/createMoistSumChart";
import {moistMainChartDataRequest} from "../../../../Map/data/types/moist/moistMainChartDataRequest";
import {moistDataBatteryRequest} from "../../../data/types/moist/moistDataBatteryRequest";
import {createMoistBatteryChart} from "../../../functions/types/moist/createMoistBatteryChart";
import {Alarm} from "../../Alarm";

export const MoistChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>([])
  const [disableNextButton, setDisableNextButton] = useState(true)
  const [disablePrevButton, setDisablePrevButton] = useState(false)
  const [irrigationDates, setIrrigationDates] = useState([])
  const [fullDatesArray, setFullDatesArray] = useState([])
  const [isIrrigationButtons, setIsIrrigationButtons] = useState(true)
  const [isIrrigationDataIsLoading, setIsIrrigationDataIsLoading] = useState(false)
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [currentDates, setCurrentDates] = useState([])
  const [comparingMode, setComparingMode] = useState(false)
  // Battery Chart
  const batteryRoot = useRef<any>(null);
  const [batteryChartShowed, setBatteryChartShowed] = useState(false)
  // Sum Chart
  const sumRoot = useRef<any>(null);
  // Historic Mode
  const [historicMode, setHistoricMode] = useState(false)
  const [showForecast, setShowForecast] = useState(true)

  useEffect(() => {
    createMoistMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
  }, [props.isMobile]);
  useEffect(() => {
    if (fullDatesArray) {
      createMoistMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    }
  }, [fullDatesArray])
  useEffect(() => {
    setCurrentChartData(props.chartData)
    irrigationDatesRequest(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.sensorId, setIrrigationDates, setFullDatesArray)
    handleResize(props.setIsMobile)
  }, []);
  useEffect(() => {
    createMoistMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)

    if (currentChartData) {
      createMoistMainChart(currentChartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    } else {
      createMoistMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    }
  }, [comparingMode]);
  useEffect(() => {
    const getHistoricData = async () => {
      const historicData = await moistMainChartDataRequest(props.sensorId, historicMode, currentDates[0], currentDates[1])
      createMoistMainChart(historicData.data.data, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    }
    getHistoricData()

    const moistHistoricData = async () => {
      const historicData = await moistSumChartDataRequest(props.sensorId, historicMode, currentDates[0], currentDates[1])
      createMoistSumChart(historicData.data.data, historicData.data.budgetLines, sumRoot, historicMode)
    }

    moistHistoricData()
  }, [historicMode]);

  useEffect(() => {
    const updateCharts = async (days?: any, endDateDays?: any, startDatetime?: any, endDatetime?: any) => {
      function compareDates(targetDateInMillis: any) {
        const targetDate = new Date(targetDateInMillis);
        const currentDate = new Date();

        const targetDay = targetDate.getUTCDate();
        const targetMonth = targetDate.getUTCMonth();
        const targetYear = targetDate.getUTCFullYear();

        const currentDay = currentDate.getUTCDate();
        const currentMonth = currentDate.getUTCMonth();
        const currentYear = currentDate.getUTCFullYear();

        return targetDay === currentDay && targetMonth === currentMonth && targetYear === currentYear;
      }
      if (startDatetime && endDatetime) {
        if (endDatetime < new Date(fullDatesArray[0]).getTime()) {
          setDisableNextButton(false)
        }
        if (endDatetime >= new Date(fullDatesArray[0]).getTime()) {
          setDisableNextButton(true)
        }
        if (startDatetime < new Date(fullDatesArray[fullDatesArray.length - 1]).getTime()) {
          setDisablePrevButton(true)
        }
        if (startDatetime >= new Date(fullDatesArray[fullDatesArray.length - 1]).getTime()) {
          setDisablePrevButton(false)
        }
      }

      if (endDatetime) {
        setShowForecast(compareDates(endDatetime))
        console.log(compareDates(endDatetime))
      }

      const newMoistChartData = await moistMainChartDataRequest(props.sensorId, historicMode, days, endDateDays)
      createMoistMainChart(newMoistChartData.data.data, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, true, historicMode, compareDates(endDatetime))
      setCurrentChartData(newMoistChartData.data.data)

      const newBatteryData = await moistDataBatteryRequest(props.sensorId, days, endDateDays)
      createMoistBatteryChart(newBatteryData.data, batteryRoot)

      const newSumChartData = await moistSumChartDataRequest(props.sensorId, historicMode, days, endDateDays)
      createMoistSumChart(newSumChartData.data.data, newSumChartData.data.budgetLines, sumRoot, historicMode)
    }
    updateCharts(currentDates[0], currentDates[1], currentDates[2], currentDates[3])
  }, [currentDates, props.isMobile]);

  return (
    <IonContent className={s.container}>
      <div className={s.wrapper}>
        <TopSection
          sensorId={props.sensorId}
          root={root}
          isMobile={props.isMobile}
          fullDatesArray={fullDatesArray}
          setCurrentChartData={setCurrentChartData}
          setDisableNextButton={setDisableNextButton}
          setDisablePrevButton={setDisablePrevButton}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          additionalChartData={props.additionalChartData}
          type={'moist'}
          setBatteryChartShowed={setBatteryChartShowed}
          batteryChartShowed={batteryChartShowed}
          batteryRoot={batteryRoot}
          sumRoot={sumRoot}
          setCurrentDates={setCurrentDates}
          currentDates={currentDates}
          comparingMode={comparingMode}
          setComparingMode={setComparingMode}
          historicMode={historicMode}
          setHistoricMode={setHistoricMode}
          setAlarm={props.setAlarm}
        />
        <div>
          <div className='ion-margin-top' style={{display: batteryChartShowed ? 'block' : 'none'}}>
            <h2 className='ion-text-center'>Battery Volts</h2>
            <div className={s.batteryChart} id='batteryChart'></div>
          </div>
          <div className='ion-margin-top'>
            <h2 className='ion-text-center'>Soil Moisture</h2>
            <div className={s.chart} id='moistChartDiv'></div>
          </div>
          <IrrigationButtons
            isIrrigationDataIsLoading={isIrrigationDataIsLoading}
            isIrrigationButtons={isIrrigationButtons}
            currentChartData={currentChartData}
            irrigationDates={irrigationDates}
            setDisableNextButton={setDisableNextButton}
            setDisablePrevButton={setDisablePrevButton}
            disableNextButton={disableNextButton}
            disablePrevButton={disablePrevButton}
            sensorId={props.sensorId}
            setCurrentChartData={setCurrentChartData}
            root={root}
            isMobile={props.isMobile}
            fullDatesArray={fullDatesArray}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            additionalChartData={props.additionalChartData}
            batteryRoot={batteryRoot}
            sumRoot={sumRoot}
            setCurrentDates={setCurrentDates}
          />
        </div>
        <div>
          <h2 className='ion-text-center ion-margin-top'>Sum of Soil Moisture</h2>
          <div id='moistSumChartDiv' className={s.sumChart}></div>
        </div>
      </div>
    </IonContent>
  )
}