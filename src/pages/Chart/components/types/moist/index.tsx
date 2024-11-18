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
import {ButtonAndSpinner} from "../../TabularData/components/ButtonAndSpinner";
import {AddCommentButton} from "../../AddComment/components/AddCommentButton";
import {AddCommentMessage} from "../../AddComment/components/AddCommentMessage";
import AddCommentModal from "../../AddComment/components/AddCommentModal";
import {getComments} from "../../AddComment/data/getComments";
import {getSoilTempChartData} from "../../../data/types/moist/getSoilTempChartData";
import {getBatteryChartData} from "../../../data/types/moist/getBatteryChartData";

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
  // Tabular Data
  // Moist Main
  const [moistMainTabularData, setMoistMainTabularData] = useState<any>(null)
  const [isMoistMainTabularDataLoading, setIsMoistMainTabularDataLoading] = useState(false)
  const [moistMainTabularDataColors, setMoistMainTabularDataColors] = useState<any>([])
  // Moist Sum
  const [moistSumTabularData, setMoistSumTabularData] = useState<any>(null)
  const [isMoistSumTabularDataLoading, setIsMoistSumTabularDataLoading] = useState(false)
  const [moistSumTabularDataColors, setMoistSumTabularDataColors] = useState<any>([])
  // Moist SoilTemp
  const [moistSoilTempTabularData, setMoistSoilTempTabularData] = useState<any>(null)
  const [isMoistSoilTempTabularDataLoading, setIsMoistSoilTempTabularDataLoading] = useState(false)
  const [moistSoilTempTabularDataColors, setMoistSoilTempTabularDataColors] = useState<any>([])
  // Add Comment
  const [moistAddCommentModal, setMoistAddCommentModal] = useState<any>(undefined)
  const [isMoistCommentsShowed, setIsMoistCommentsShowed] = useState(false)
    // Main
  const [moistMainComments, setMoistMainComments] = useState();
  const [moistMainAddCommentItemShowed, setMoistMainAddCommentItemShowed] = useState<any>(false)
    // Battery
  const [moistBatteryAddCommentItemShowed, setMoistBatteryAddCommentItemShowed] = useState<any>(false)
  const [moistBatteryComments, setMoistBatteryComments] = useState();
    // Sum
  const [moistSumAddCommentItemShowed, setMoistSumAddCommentItemShowed] = useState<any>(false)
  const [moistSumComments, setMoistSumComments] = useState();
    // Soil Temp
  const [moistSoilTempAddCommentItemShowed, setMoistSoilTempAddCommentItemShowed] = useState<any>(false)
  const [moistSoilTempComments, setMoistSoilTempComments] = useState();

  // Chart Codes
  const mainChartCode: string = 'm'
  const soilTempChartCode: string = 'mst'
  const sumChartCode: string = 'mSum'

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

  const updateCommentsArray = async (type: string) => {
    const newComments: any = await getComments(type, props.sensorId)
    if (type === 'M') {
      setMoistMainComments(newComments.data)
    } else if (type === 'MSum') {
      setMoistSumComments(newComments.data)
    } else if (type === 'MST') {
      setMoistSoilTempComments(newComments.data)
    } else {
      setMoistBatteryComments(newComments.data)
    }
  }
  const updateChart = async (
    typeOfChart: string,
    updateReason?: string,
    days?: any,
    endDateDays?: any,
    endDatetime?: any
  ) => {
    const getCommentsFunc = async () => {
      let chartType: any
      let setData: any

      if (typeOfChart === 'main') {
        chartType = 'M'
        setData = setMoistMainComments
      } else if (typeOfChart === 'soilTemp') {
        chartType = 'MST'
        setData = setMoistSoilTempComments
      } else if (typeOfChart === 'sum') {
        chartType = 'MSum'
        setData = setMoistSumComments
      } else {
        chartType = 'MBattery'
        setData = setMoistBatteryComments
      }
      const comments: any = await getComments(chartType, props.sensorId)
      setData(comments.data)
      return comments.data
    }
    if (typeOfChart === 'main') {
      if (updateReason === 'comments') {
        const newCommentData = await getCommentsFunc()
        if (moistMainAddCommentItemShowed === 'comments') {
          setMoistMainAddCommentItemShowed(false)
          createMainChart(
            currentChartData, props.userId, root, props.isMobile,
            fullDatesArray, props.additionalChartData, comparingMode,
            false, historicMode, showForecast,
            setMoistAddCommentModal, false, newCommentData,
            updateCommentsArray, updateChart, isMoistCommentsShowed, setMoistMainTabularDataColors
          )
        } else {
          createMainChart(
            currentChartData, props.userId, root, props.isMobile,
            fullDatesArray, props.additionalChartData, comparingMode,
            false, historicMode, showForecast,
            setMoistAddCommentModal, moistMainAddCommentItemShowed, newCommentData,
            updateCommentsArray, updateChart, isMoistCommentsShowed, setMoistMainTabularDataColors
          )
        }
      } else if (updateReason === 'toggleComments') {
        createMainChart(
          currentChartData, props.userId, root, props.isMobile,
          fullDatesArray, props.additionalChartData, comparingMode,
          false, historicMode, showForecast,
          setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
          updateCommentsArray, updateChart, isMoistCommentsShowed
        )
      } else if (updateReason === 'comparingMode') {
        if (currentChartData) {
          createMainChart(
            currentChartData, props.userId, root, props.isMobile,
            fullDatesArray, props.additionalChartData, comparingMode,
            false, historicMode, showForecast,
            setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
            updateCommentsArray, updateChart, isMoistCommentsShowed
          )
        } else {
          if (currentChartData) {
            createMainChart(
              currentChartData, props.userId, root, props.isMobile,
              fullDatesArray, props.additionalChartData, comparingMode,
              false, historicMode, showForecast,
              setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
              updateCommentsArray, updateChart, isMoistCommentsShowed
            )
          } else {
            createMainChart(
              props.chartData, props.userId, root, props.isMobile,
              fullDatesArray, props.additionalChartData, comparingMode,
              false, historicMode, showForecast,
              setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
              updateCommentsArray, updateChart, isMoistCommentsShowed
            )
          }
        }
      } else if (updateReason === 'dates') {
        const newMoistChartData = await getMoistMainChartData(props.sensorId, historicMode, days, endDateDays)
        setCurrentChartData(newMoistChartData.data.data)
        createMainChart(
          newMoistChartData.data.data, props.userId, root, props.isMobile,
          fullDatesArray, props.additionalChartData, comparingMode,
          true, historicMode, compareDates(endDatetime),
          setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
          updateCommentsArray, updateChart, isMoistCommentsShowed
        )
      } else if (updateReason === 'historic') {
        const historicData = await getMoistMainChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
        createMainChart(
          historicData.data.data, props.userId, root, props.isMobile,
          fullDatesArray, props.additionalChartData, comparingMode,
          false, historicMode, showForecast,
          setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
          props.userId, updateCommentsArray, updateChart, isMoistCommentsShowed
        )
      } else {
        if (currentChartData) {
          createMainChart(
            currentChartData, props.userId, root, props.isMobile,
            fullDatesArray, props.additionalChartData, comparingMode,
            false, historicMode, showForecast,
            setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
            updateCommentsArray, updateChart, isMoistCommentsShowed, setMoistMainTabularDataColors
          )
        } else {
          createMainChart(
            props.chartData, props.userId, root, props.isMobile,
            fullDatesArray, props.additionalChartData, comparingMode,
            false, historicMode, showForecast,
            setMoistAddCommentModal, moistMainAddCommentItemShowed, moistMainComments,
            updateCommentsArray, updateChart, isMoistCommentsShowed, setMoistMainTabularDataColors
          )
        }
      }
    } else if (typeOfChart === 'sum') {
      if (updateReason === 'comments') {
        const data = await getSumChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
        const newComments = await getCommentsFunc()
        if (moistSumAddCommentItemShowed === 'comments') {
          setMoistSumAddCommentItemShowed(false)
          createAdditionalChart(
            'sum', data.data.data, sumRoot,
            setMoistAddCommentModal, updateCommentsArray, false,
            newComments, props.userId, updateChart, isMoistCommentsShowed, data.data.budgetLines,
            historicMode
          )
        } else {
          createAdditionalChart(
            'sum', data.data.data, sumRoot,
            setMoistAddCommentModal, updateCommentsArray, moistSumAddCommentItemShowed,
            newComments, props.userId, updateChart, isMoistCommentsShowed, data.data.budgetLines,
            historicMode
          )
        }
      } else if (updateReason === 'historic') {
        const historicData = await getSumChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
        createAdditionalChart(
          'sum', historicData.data.data, sumRoot,
          setMoistAddCommentModal, updateCommentsArray, moistSumAddCommentItemShowed,
          moistSumComments, props.userId, updateChart, isMoistCommentsShowed, historicData.data.budgetLines,
          historicMode
        )
      } else if (updateReason === 'dates') {
        const newSumChartData = await getSumChartData(props.sensorId, historicMode, days, endDateDays)
        createAdditionalChart(
          'sum', newSumChartData.data.data, sumRoot,
          setMoistAddCommentModal, updateCommentsArray, moistSumAddCommentItemShowed,
          moistSumComments, props.userId, updateChart, isMoistCommentsShowed, newSumChartData.data.budgetLines,
          historicMode, setMoistSumTabularDataColors
        )
      } else {
        const data = await getSumChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
        createAdditionalChart(
          'sum', data.data.data, sumRoot,
          setMoistAddCommentModal, updateCommentsArray, moistSumAddCommentItemShowed,
          moistSumComments, props.userId, updateChart, isMoistCommentsShowed, data.data.budgetLines,
          historicMode
        )
      }
    } else if (typeOfChart === 'soilTemp') {
      if (updateReason === 'comments') {
        const comments: any = await getCommentsFunc()
        const newSoilTempChartData = await getSoilTempChartData(props.sensorId, currentDates[0], currentDates[1])
        if (moistSoilTempAddCommentItemShowed === 'comments') {
          setMoistSoilTempAddCommentItemShowed(false)
          createAdditionalChart(
            'soilTemp',
            newSoilTempChartData.data.data,
            soilTempRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            false,
            comments,
            props.userId,
            updateChart,
            isMoistCommentsShowed,
            undefined,
            undefined,
            undefined,
            props.additionalChartData.linesCount,
            newSoilTempChartData.data.metric,
            setMoistSoilTempTabularDataColors
          )
        } else {
          createAdditionalChart(
            'soilTemp',
            newSoilTempChartData.data.data,
            soilTempRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            moistSoilTempAddCommentItemShowed,
            comments,
            props.userId,
            updateChart,
            isMoistCommentsShowed,
            undefined,
            undefined,
            undefined,
            props.additionalChartData.linesCount,
            newSoilTempChartData.data.metric,
            setMoistSoilTempTabularDataColors
          )
        }
      } else if (updateReason === 'dates') {
        const newSoilTempChartData = await getSoilTempChartData(props.sensorId, currentDates[0], currentDates[1])
        createAdditionalChart(
          'soilTemp',
          newSoilTempChartData.data.data,
          soilTempRoot,
          setMoistAddCommentModal,
          updateCommentsArray,
          moistSoilTempAddCommentItemShowed,
          moistSoilTempComments,
          props.userId,
          updateChart,
          isMoistCommentsShowed,
          undefined,
          undefined,
          undefined,
          props.additionalChartData.linesCount,
          newSoilTempChartData.data.metric,
          setMoistSoilTempTabularDataColors
        )
      } else {
        const newSoilTempChartData = await getSoilTempChartData(props.sensorId, currentDates[0], currentDates[1])
        createAdditionalChart(
          'soilTemp',
          newSoilTempChartData.data.data,
          soilTempRoot,
          setMoistAddCommentModal,
          updateCommentsArray,
          moistSoilTempAddCommentItemShowed,
          moistSoilTempComments,
          props.userId,
          updateChart,
          isMoistCommentsShowed,
          undefined,
          undefined,
          undefined,
          props.additionalChartData.linesCount,
          newSoilTempChartData.data.metric,
          setMoistSoilTempTabularDataColors
        )
      }
    } else if (typeOfChart === 'battery') {
      if (updateReason === 'comments') {
        const comments: any = await getCommentsFunc()
        const newBatteryChartData = await getBatteryChartData(props.sensorId, currentDates[0], currentDates[1])
        if (moistBatteryAddCommentItemShowed === 'comments') {
          setMoistBatteryAddCommentItemShowed(false)
          createAdditionalChart(
            'battery', newBatteryChartData.data, batteryRoot,
            setMoistAddCommentModal, updateCommentsArray, false,
            comments, props.userId, updateChart, isMoistCommentsShowed
          )
        } else {
          createAdditionalChart(
            'battery', newBatteryChartData.data, batteryRoot,
            setMoistAddCommentModal, updateCommentsArray, moistBatteryAddCommentItemShowed,
            comments, props.userId, updateChart, isMoistCommentsShowed
          )
        }
      } else if (updateReason === 'dates') {
        const newBatteryChartData = await getBatteryChartData(props.sensorId, currentDates[0], currentDates[1])
        createAdditionalChart(
          'battery', newBatteryChartData.data, batteryRoot,
          setMoistAddCommentModal, updateCommentsArray, moistBatteryAddCommentItemShowed,
          moistBatteryComments, props.userId, updateChart, isMoistCommentsShowed
        )
      } else {
        const newBatteryChartData = await getBatteryChartData(props.sensorId, currentDates[0], currentDates[1])
        createAdditionalChart(
          'battery', newBatteryChartData.data, batteryRoot,
          setMoistAddCommentModal, updateCommentsArray, moistBatteryAddCommentItemShowed,
          moistBatteryComments, props.userId, updateChart, isMoistCommentsShowed
        )
      }
    }
  }

  useEffect(() => {
    setCurrentChartData(props.chartData)
    getIrrigationDates(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.sensorId, setIrrigationDates, setFullDatesArray)
    handleResize(props.setIsMobile)
    updateChart('main', 'comments')
    updateChart('sum', 'comments')
  }, []);
  useEffect(() => {
    updateChart('main')
  }, [props.isMobile]);
  useEffect(() => {
    if (fullDatesArray) {
      updateChart('main')
    }
  }, [fullDatesArray])
  useEffect(() => {
    updateChart('main', 'comparingMode')
  }, [comparingMode]);
  useEffect(() => {
    updateChart('main', 'historic')
    updateChart('sum', 'historic')
  }, [historicMode]);
  useEffect(() => {
    const updateChartsWithNewDates = async (days?: any, endDateDays?: any, startDatetime?: any, endDatetime?: any) => {
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

      updateChart('main', 'dates', days, endDateDays, endDatetime)
      updateChart('sum', 'dates', days, endDateDays, endDatetime)
      updateChart('soilTemp', 'dates', days, endDateDays, endDatetime)
      updateChart('battery', 'dates', days, endDateDays, endDatetime)
    }
    updateChartsWithNewDates(currentDates[0], currentDates[1], currentDates[2], currentDates[3])
  }, [currentDates, props.isMobile]);
  useEffect(() => {
    if (moistMainAddCommentItemShowed === 'comments') {
      updateChart('main', 'comments')
    } else {
      updateChart('main')
    }
  }, [moistMainAddCommentItemShowed]);
  useEffect(() => {
    if (moistSumAddCommentItemShowed === 'comments') {
      updateChart('sum', 'comments')
    } else {
      updateChart('sum')
    }
  }, [moistSumAddCommentItemShowed]);
  useEffect(() => {
    if (moistSoilTempAddCommentItemShowed === 'comments') {
      updateChart('soilTemp', 'comments')
    } else {
      updateChart('soilTemp')
    }
  }, [moistSoilTempAddCommentItemShowed]);
  useEffect(() => {
    if (moistBatteryAddCommentItemShowed === 'comments') {
      updateChart('battery', 'comments')
    } else {
      updateChart('battery')
    }
  }, [moistBatteryAddCommentItemShowed]);
  useEffect(() => {
    updateChart('main')
    updateChart('sum')
    updateChart('soilTemp')
    updateChart('battery')
  }, [isMoistCommentsShowed]);

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
  const getSetAddCommentItemShowed = (type: string) => {
    if (type === 'main') {
      return setMoistMainAddCommentItemShowed
    } else if (type === 'soilTemp') {
      return setMoistSoilTempAddCommentItemShowed
    } else if (type === 'sum') {
      return setMoistSumAddCommentItemShowed
    } else if (type === 'battery') {
      return setMoistBatteryAddCommentItemShowed
    }
  }
  const getAddCommentItemShowed = (type: string) => {
    if (type === 'main') {
      return moistMainAddCommentItemShowed
    } else if (type === 'soilTemp') {
      return moistSoilTempAddCommentItemShowed
    } else if (type === 'sum') {
      return moistSumAddCommentItemShowed
    } else if (type === 'battery') {
      return moistBatteryAddCommentItemShowed
    }
  }

  return (
    <IonContent className={s.container}>
      <div className={s.wrapper}>
        <TopSection
          userId={props.userId}
          sensorId={props.sensorId}
          root={root}
          isMobile={props.isMobile}
          fullDatesArray={fullDatesArray}
          setCurrentChartData={setCurrentChartData}
          setDisableNextButton={setDisableNextButton}
          setDisablePrevButton={setDisablePrevButton}
          startDate={startDate}
          setStartDate={setStartDate}
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
          setComparingMode={setComparingMode}
          setHistoricMode={setHistoricMode}
          setAlarm={props.setAlarm}
          setSoilTempChartShowed={setSoilTempChartShowed}
          soilTempChartShowed={soilTempChartShowed}
          updateChart={updateChart}
          setIsCommentsShowed={setIsMoistCommentsShowed}
          isCommentsShowed={isMoistCommentsShowed}
        />
        <div>
          <div className='ion-margin-top' style={{display: soilTempChartShowed ? 'block' : 'none'}}>
            <h2 className='ion-text-center'>Soil Temperature</h2>
            <div className={s.additionalButtons}>
              <ButtonAndSpinner data={moistSoilTempTabularData} setData={setMoistSoilTempTabularData}
                                setIsLoading={setIsMoistSoilTempTabularDataLoading} sensorId={props.sensorId}
                                chartCode={soilTempChartCode} isLoading={isMoistSoilTempTabularDataLoading}/>
              <Export chartCode={soilTempChartCode} sensorId={props.sensorId} userId={props.userId}/>
              <AddCommentButton addCommentItemShowed={moistSoilTempAddCommentItemShowed}
                                setAddCommentItemShowed={setMoistSoilTempAddCommentItemShowed}
                                isCommentsShowed={isMoistCommentsShowed}
                                setIsCommentsShowed={setIsMoistCommentsShowed}
              />
            </div>
            <AddCommentMessage type={'soilTemp'} addCommentItemShowed={moistSoilTempAddCommentItemShowed}
                               setAddCommentModal={setMoistAddCommentModal}/>
            {moistAddCommentModal && <AddCommentModal
              type={moistAddCommentModal.type}
              userId={props.userId}
              sensorId={props.sensorId}
              addCommentModal={moistAddCommentModal.date}
              setMoistAddCommentModal={setMoistAddCommentModal}
              setMoistMainComments={setMoistMainComments}
              setAddCommentItemShowed={getSetAddCommentItemShowed(moistAddCommentModal.type)}
              addCommentItemShowed={getAddCommentItemShowed(moistAddCommentModal.type)}
              setAddCommentModal={setMoistAddCommentModal}
              updateChart={updateChart}
            />}
            <TabularData
              type='moistSoilTemp'
              sensorId={props.sensorId}
              colors={moistSoilTempTabularDataColors}
              data={moistSoilTempTabularData}
              setData={setMoistSoilTempTabularData}
              chartCode={soilTempChartCode}
              isLoading={isMoistSoilTempTabularDataLoading}
              setIsLoading={setIsMoistSoilTempTabularDataLoading}
            />
            <div className={s.additionalChart} id='soilTempChart'></div>
          </div>
          <div className='ion-margin-top' style={{display: batteryChartShowed ? 'block' : 'none'}}>
            <h2 className='ion-text-center'>Battery Volts</h2>
            <div className={s.additionalButtons}>
              <AddCommentButton addCommentItemShowed={moistBatteryAddCommentItemShowed}
                                setAddCommentItemShowed={setMoistBatteryAddCommentItemShowed}
                                isCommentsShowed={isMoistCommentsShowed}
                                setIsCommentsShowed={setIsMoistCommentsShowed}/>
            </div>
            <AddCommentMessage type={'battery'} addCommentItemShowed={moistBatteryAddCommentItemShowed}
                               setAddCommentModal={setMoistAddCommentModal} />
            <div className={s.additionalChart} id='batteryChart'></div>
          </div>
          <div className='ion-margin-top'>
            <h2 className='ion-text-center'>Soil Moisture</h2>
            <div className={s.additionalButtons}>
              <ButtonAndSpinner data={moistMainTabularData} setData={setMoistMainTabularData}
                                setIsLoading={setIsMoistMainTabularDataLoading} sensorId={props.sensorId}
                                chartCode={mainChartCode} isLoading={isMoistMainTabularDataLoading}/>
              <Export chartCode={mainChartCode} sensorId={props.sensorId} userId={props.userId}/>
              <AddCommentButton addCommentItemShowed={moistMainAddCommentItemShowed}
                                setAddCommentItemShowed={setMoistMainAddCommentItemShowed}
                                isCommentsShowed={isMoistCommentsShowed}
                                setIsCommentsShowed={setIsMoistCommentsShowed}/>
            </div>
            <AddCommentMessage type={'main'} addCommentItemShowed={moistMainAddCommentItemShowed}
                               setAddCommentModal={setMoistAddCommentModal} />
            <TabularData
              type='moistMain'
              sensorId={props.sensorId}
              colors={moistMainTabularDataColors}
              data={moistMainTabularData}
              setData={setMoistMainTabularData}
              chartCode={mainChartCode}
              isLoading={isMoistMainTabularDataLoading}
              setIsLoading={setIsMoistMainTabularDataLoading}
            />
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
          <div className={s.additionalButtons}>
            <ButtonAndSpinner data={moistSumTabularData} setData={setMoistSumTabularData}
                              setIsLoading={setIsMoistSumTabularDataLoading} sensorId={props.sensorId}
                              chartCode={sumChartCode} isLoading={isMoistSumTabularDataLoading}/>
            <Export chartCode={sumChartCode} sensorId={props.sensorId} userId={props.userId}/>
            <AddCommentButton addCommentItemShowed={moistSumAddCommentItemShowed}
                              setAddCommentItemShowed={setMoistSumAddCommentItemShowed}
                              isCommentsShowed={isMoistCommentsShowed}
                              setIsCommentsShowed={setIsMoistCommentsShowed}/>
          </div>
          <AddCommentMessage type={'sum'} addCommentItemShowed={moistSumAddCommentItemShowed}
                             setAddCommentModal={setMoistAddCommentModal} />
          <TabularData
            type='moistSum'
            sensorId={props.sensorId}
            colors={moistSumTabularDataColors}
            data={moistSumTabularData}
            setData={setMoistSumTabularData}
            chartCode={sumChartCode}
            isLoading={isMoistSumTabularDataLoading}
            setIsLoading={setIsMoistSumTabularDataLoading}
          />
          <div id='sumChart' className={s.sumChart}></div>
        </div>
      </div>
    </IonContent>
  )
}