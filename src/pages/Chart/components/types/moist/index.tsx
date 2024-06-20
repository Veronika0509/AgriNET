import s from './style.module.css'
import {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {handleResize} from "../../../functions/handleResize";
import {irrigationDatesRequest} from "../../../data/types/moist/irriationDatesRequest";
import {moistSumChartDataRequest} from "../../../data/types/moist/sumChartDataRequest";
import {IonContent} from "@ionic/react";
import TopSection from "../../TopSection";
import IrrigationButtons from "./IrrigationButtons";
import {createMoistMainChart} from "../../../functions/types/moist/createMoistMainChart";
import {createMoistSumChart} from "../../../functions/types/moist/createMoistSumChart";
import {moistMainChartDataRequest} from "../../../../Map/data/types/moist/moistMainChartDataRequest";
import {moistDataBatteryRequest} from "../../../data/types/moist/moistDataBatteryRequest";
import {createMoistBatteryChart} from "../../../functions/types/moist/createMoistBatteryChart";

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
  // Battery Chart
  const batteryRoot = useRef<any>(null);
  const [batteryChartShowed, setBatteryChartShowed] = useState(false)
  // Sum Chart
  const sumRoot = useRef<any>(null);

  useEffect(() => {
    createMoistMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData)
  }, [props.isMobile]);
  useEffect(() => {
    if (fullDatesArray) {
      createMoistMainChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData)
    }
  }, [fullDatesArray])
  useEffect(() => {
    setCurrentChartData(props.chartData)
    irrigationDatesRequest(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.sensorId, setIrrigationDates, setFullDatesArray)
    handleResize(props.setIsMobile)
  }, []);

  useEffect(() => {
    const updateCharts = async (days?: any, endDateDays?: any, startDatetime?: any, endDatetime?: any) => {
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

      const newMoistChartData = await moistMainChartDataRequest(props.sensorId, days, endDateDays)
      createMoistMainChart(newMoistChartData.data.data, root, props.isMobile, fullDatesArray, props.additionalChartData)
      setCurrentChartData(newMoistChartData.data.data)

      const newBatteryData = await moistDataBatteryRequest(props.sensorId, days, endDateDays)
      createMoistBatteryChart(newBatteryData.data, batteryRoot)

      const newSumChartData = await moistSumChartDataRequest(props.sensorId, days, endDateDays)
      createMoistSumChart(newSumChartData.data.data, newSumChartData.data.budgetLines, sumRoot)
    }
    updateCharts(currentDates[0], currentDates[1], currentDates[2], currentDates[3])
  }, [currentDates]);

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
        <div className={s.sumChart}>
          <h2 className='ion-text-center ion-margin-top'>Sum of Soil Moisture</h2>
          <div id='moistSumChartDiv' className={s.sumChart}></div>
        </div>
      </div>
    </IonContent>
  )
}