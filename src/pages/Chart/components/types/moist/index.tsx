import s from './style.module.css'
import React, {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {handleResize} from "../../../functions/handleResize";
import {getIrrigationDates} from "../../../data/types/moist/getIrrigationDates";
import {getSumChartData} from "../../../data/types/moist/getSumChartData";
import {IonContent} from "@ionic/react";
import TopSection from "../../TopSection";
import IrrigationButtons from "./IrrigationButtons";
import {createMainChart} from "../../../functions/types/moist/createMainChart";
import {getMoistMainChartData} from "../../../../Map/data/types/moist/getMoistMainChartData";
import {createAdditionalChart} from "../../../functions/types/moist/createAdditionalChart";
import {TabularData} from "../../TabularData";
import {Export} from "../../Export";

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
  // Soil Temperature Chart
  const soilTempRoot = useRef<any>(null);
  const [soilTempChartShowed, setSoilTempChartShowed] = useState(false)
  // Sum Chart
  const sumRoot = useRef<any>(null);
  // Historic Mode
  const [historicMode, setHistoricMode] = useState(false)
  const [showForecast, setShowForecast] = useState(true)
  // Tabular Data Colors
  const [moistMainTabularDataColors, setMoistMainTabularDataColors] = useState<any>([])
  const [moistSumTabularDataColors, setMoistSumTabularDataColors] = useState<any>([])
  const [moistSoilTempTabularDataColors, setMoistSoilTempTabularDataColors] = useState<any>([])

  useEffect(() => {
    createMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast, setMoistMainTabularDataColors)
  }, [props.isMobile]);
  useEffect(() => {
    if (fullDatesArray) {
      createMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    }
  }, [fullDatesArray])
  useEffect(() => {
    setCurrentChartData(props.chartData)
    getIrrigationDates(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.sensorId, setIrrigationDates, setFullDatesArray)
    handleResize(props.setIsMobile)
  }, []);
  useEffect(() => {
    createMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)

    if (currentChartData) {
      createMainChart(currentChartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    } else {
      createMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    }
  }, [comparingMode]);
  useEffect(() => {
    const getHistoricData = async () => {
      const historicData = await getMoistMainChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
      createMainChart(historicData.data.data, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, false, historicMode, showForecast)
    }
    getHistoricData()

    const moistHistoricData = async () => {
      const historicData = await getSumChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
      createAdditionalChart('sum', historicData.data.data, sumRoot, historicData.data.budgetLines, historicMode)
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
      }

      const newMoistChartData = await getMoistMainChartData(props.sensorId, historicMode, days, endDateDays)
      createMainChart(newMoistChartData.data.data, root, props.isMobile, fullDatesArray, props.additionalChartData, comparingMode, true, historicMode, compareDates(endDatetime))
      setCurrentChartData(newMoistChartData.data.data)

      const newSumChartData = await getSumChartData(props.sensorId, historicMode, days, endDateDays)
      createAdditionalChart('sum', newSumChartData.data.data, sumRoot, newSumChartData.data.budgetLines, historicMode, setMoistSumTabularDataColors)
    }
    updateCharts(currentDates[0], currentDates[1], currentDates[2], currentDates[3])
  }, [currentDates, props.isMobile]);

  let chartAdditionalClass: any

  if (props.isMobile) {
    if (props.additionalChartData.linesCount > 3 && props.additionalChartData.linesCount <= 6) {
      chartAdditionalClass = s.chartLinesSix
    } else if (props.additionalChartData.linesCount > 6 && props.additionalChartData.linesCount <= 9) {
      chartAdditionalClass = s.chartLinesNine
    } else if (props.additionalChartData.linesCount > 9) {
      chartAdditionalClass = s.chartLinesMoreThanNine
    }
  }

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
          setSoilTempChartShowed={setSoilTempChartShowed}
          soilTempChartShowed={soilTempChartShowed}
          soilTempRoot={soilTempRoot}
          setMoistSoilTempTabularDataColors={setMoistSoilTempTabularDataColors}
        />
        <div>
          <div className='ion-margin-top' style={{display: soilTempChartShowed ? 'block' : 'none'}}>
            <h2 className='ion-text-center'>Soil Temperature</h2>
            <TabularData type='moistSoilTemp' sensorId={props.sensorId} colors={moistSoilTempTabularDataColors}/>
            <div className={s.additionalChart} id='soilTempChart'></div>
          </div>
          <div className='ion-margin-top' style={{display: batteryChartShowed ? 'block' : 'none'}}>
            <h2 className='ion-text-center'>Battery Volts</h2>
            <div className={s.additionalChart} id='batteryChart'></div>
          </div>
          <div className='ion-margin-top'>
            <h2 className='ion-text-center'>Soil Moisture</h2>
            <div className={s.additionalButtons}>
              <TabularData type='moistMain' sensorId={props.sensorId} colors={moistMainTabularDataColors}/>
              <Export type='moist' sensorId={props.sensorId} userId={props.userId} />
            </div>
            <div className={`${s.chart} ${chartAdditionalClass}`} id='mainChart'></div>
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
          <TabularData type='moistSum' sensorId={props.sensorId} colors={moistSumTabularDataColors}/>
          <div id='sumChart' className={s.sumChart}></div>
        </div>
      </div>
    </IonContent>
  )
}