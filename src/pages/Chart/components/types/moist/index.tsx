import s from './style.module.css'
import React, {useCallback, useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentDatetime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {handleResize} from "../../../functions/handleResize";
import {getIrrigationDates} from "../../../data/types/moist/getIrrigationDates";
import {getSumChartData} from "../../../data/types/moist/getSumChartData";
import {IonButton, IonContent, IonModal, IonSpinner, IonText, IonTitle, useIonViewDidEnter} from "@ionic/react";
import TopSection from "../../TopSection";
import IrrigationButtons from "./components/IrrigationButtons";
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
import {Autowater} from "./components/Autowater";
import {updateCommentsArray} from "../../../functions/types/moist/updateCommentsArray";
import {compareDates} from "../../../functions/types/moist/compareDates";
import {getSetAddCommentItemShowed} from "../../../functions/types/moist/getSetAddCommentItemShowed";
import {getAddCommentItemShowed} from "../../../functions/types/moist/getAddCommentItemShowed";
import {getDatetime} from "../../DateTimePicker/functions/getDatetime";
import {formatDate} from "../../../functions/formatDate";
import {logoFacebook} from "ionicons/icons";
import {handleResizeForChartLegend} from "../../../functions/types/moist/handleResizeForChartLegend";

export const MoistChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>([])
  const [disableNextButton, setDisableNextButton] = useState(true)
  const [disablePrevButton, setDisablePrevButton] = useState(true)
  const [irrigationDates, setIrrigationDates] = useState([])
  const [fullDatesArray, setFullDatesArray] = useState([])
  const [isIrrigationButtons, setIsIrrigationButtons] = useState(true)
  const [isIrrigationDataIsLoading, setIsIrrigationDataIsLoading] = useState(false)
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [currentDates, setCurrentDates] = useState<any>([])
  const [dateDifferenceInDays, setDateDifferenceInDays] = React.useState('14');
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

  // Responsibility
  const [smallScreen, setSmallScreen] = useState(false)
  const [middleScreen, setMiddleScreen] = useState(false)
  const [largeScreen, setLargeScreen] = useState(false)

  // Chart Codes
  const mainChartCode: string = 'm'
  const soilTempChartCode: string = 'mst'
  const sumChartCode: string = 'mSum'

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
          createMainChart({
            data: currentChartData,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed: false,
            moistMainComments: newCommentData,
            updateCommentsArray,
            updateChart,
            isMoistCommentsShowed,
            setMoistMainTabularDataColors
          })
        } else {
          if (currentChartData.length !== 0) {
            createMainChart({
              data: currentChartData,
              userId: props.userId,
              root,
              fullDatesArray,
              additionalChartData: props.additionalChartData,
              comparingMode,
              isNewDates: false,
              historicMode,
              showForecast,
              setMoistAddCommentModal,
              moistMainAddCommentItemShowed,
              moistMainComments: newCommentData,
              updateCommentsArray,
              updateChart,
              isMoistCommentsShowed,
              setMoistMainTabularDataColors
            })
          } else {
            createMainChart({
              data: props.chartData,
              userId: props.userId,
              root,
              fullDatesArray,
              additionalChartData: props.additionalChartData,
              comparingMode,
              isNewDates: false,
              historicMode,
              showForecast,
              setMoistAddCommentModal,
              moistMainAddCommentItemShowed,
              moistMainComments: newCommentData,
              updateCommentsArray,
              updateChart,
              isMoistCommentsShowed,
              setMoistMainTabularDataColors
            })
          }
        }
      } else if (updateReason === 'toggleComments') {
        createMainChart({
          data: currentChartData,
          userId: props.userId,
          root,
          fullDatesArray,
          additionalChartData: props.additionalChartData,
          comparingMode,
          isNewDates: false,
          historicMode,
          showForecast,
          setMoistAddCommentModal,
          moistMainAddCommentItemShowed,
          moistMainComments,
          updateCommentsArray,
          updateChart,
          isMoistCommentsShowed
        })
      } else if (updateReason === 'comparingMode') {
        if (currentChartData.length !== 0) {
          createMainChart({
            data: currentChartData,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed,
            moistMainComments,
            updateCommentsArray,
            updateChart,
            isMoistCommentsShowed
          })
        } else {
          createMainChart({
            data: props.chartData,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed,
            moistMainComments,
            updateCommentsArray,
            updateChart,
            isMoistCommentsShowed
          })
        }
      } else if (updateReason === 'dates') {
        const newMoistChartData = await getMoistMainChartData(props.sensorId, historicMode, days, endDateDays)
        setCurrentChartData(newMoistChartData.data.data)
        createMainChart({
          data: newMoistChartData.data.data,
          userId: props.userId,
          root,
          fullDatesArray,
          additionalChartData: props.additionalChartData,
          comparingMode,
          isNewDates: true,
          historicMode,
          showForecast: compareDates(endDatetime),
          setMoistAddCommentModal,
          moistMainAddCommentItemShowed,
          moistMainComments,
          updateCommentsArray,
          updateChart,
          isMoistCommentsShowed
        })
      } else if (updateReason === 'historic') {
        const historicData = await getMoistMainChartData(props.sensorId, historicMode, currentDates[0], currentDates[1])
        createMainChart({
          data: historicData.data.data,
          userId: props.userId,
          root,
          fullDatesArray,
          additionalChartData: props.additionalChartData,
          comparingMode,
          isNewDates: false,
          historicMode,
          showForecast,
          setMoistAddCommentModal,
          moistMainAddCommentItemShowed,
          moistMainComments,
          updateCommentsArray,
          updateChart,
          isMoistCommentsShowed
        })
      } else {
        if (currentChartData.length !== 0) {
          createMainChart({
            data: currentChartData,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed,
            moistMainComments,
            updateCommentsArray,
            updateChart,
            isMoistCommentsShowed,
            setMoistMainTabularDataColors,
            smallScreen,
            middleScreen,
            largeScreen
          })
        } else {
          createMainChart({
            data: props.chartData,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed,
            moistMainComments,
            updateCommentsArray,
            updateChart,
            isMoistCommentsShowed,
            setMoistMainTabularDataColors,
            smallScreen,
            middleScreen,
            largeScreen
          })
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
        const newSoilTempChartData = await getSoilTempChartData(props.sensorId, days, endDateDays)
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
        const newBatteryChartData = await getBatteryChartData(props.sensorId, days, endDateDays)
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
    getIrrigationDates(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.sensorId, setIrrigationDates, setFullDatesArray, startDate, setDisablePrevButton)
    updateChart('main', 'comments')
    updateChart('sum', 'comments')
  }, []);
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
  const handleResize = useCallback(() => {
    handleResizeForChartLegend({
      additionalChartData: props.additionalChartData,
      smallScreen,
      setSmallScreen,
      middleScreen,
      setMiddleScreen,
      largeScreen,
      setLargeScreen
    })
  }, [smallScreen, middleScreen, largeScreen])
  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])
  useEffect(() => {
    updateChart('main')
  }, [smallScreen, middleScreen, largeScreen]);

  let chartAdditionalClass: any

  return (
    <IonContent className={s.container}>
      <div className={s.wrapper}>
        <TopSection
          userId={props.userId}
          sensorId={props.sensorId}
          root={root}
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
          setComparingMode={setComparingMode}
          setHistoricMode={setHistoricMode}
          setAlarm={props.setAlarm}
          setSoilTempChartShowed={setSoilTempChartShowed}
          soilTempChartShowed={soilTempChartShowed}
          updateChart={updateChart}
          setIsCommentsShowed={setIsMoistCommentsShowed}
          isCommentsShowed={isMoistCommentsShowed}
          dateDifferenceInDays={dateDifferenceInDays}
          setDateDifferenceInDays={setDateDifferenceInDays}
          setShowForecast={setShowForecast}
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
                                setIsCommentsShowed={setIsMoistCommentsShowed}/>
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
                setAddCommentItemShowed={getSetAddCommentItemShowed(moistAddCommentModal.type, setMoistMainAddCommentItemShowed, setMoistSoilTempAddCommentItemShowed, setMoistSumAddCommentItemShowed, setMoistBatteryAddCommentItemShowed)}
                addCommentItemShowed={getAddCommentItemShowed(moistAddCommentModal.type, moistMainAddCommentItemShowed, moistSoilTempAddCommentItemShowed, moistSumAddCommentItemShowed, moistBatteryAddCommentItemShowed)}
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
                               setAddCommentModal={setMoistAddCommentModal}/>
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
              <IonButton className={s.autowaterButton} onClick={() => props.setAutowater(true)}>Autowater</IonButton>
            </div>
            <AddCommentMessage type={'main'} addCommentItemShowed={moistMainAddCommentItemShowed}
                               setAddCommentModal={setMoistAddCommentModal}/>
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
            <Autowater
              autowater={props.autowater}
              setValveSettings={props.setValveSettings}
              setChartPageType={props.setChartPageType}
              setSiteId={props.setSiteId}
              setSettingsOddBack={props.setSettingsOddBack}
              setAutowater={props.setAutowater}
              sensorId={props.sensorId}
            />
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
            fullDatesArray={fullDatesArray}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            additionalChartData={props.additionalChartData}
            batteryRoot={batteryRoot}
            sumRoot={sumRoot}
            setDateDifferenceInDays={setDateDifferenceInDays}
            setCurrentDates={setCurrentDates}
            setShowForecast={setShowForecast}
            updateChart={updateChart}
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
                             setAddCommentModal={setMoistAddCommentModal}/>
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