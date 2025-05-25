import React, {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentDatetime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import TopSection from "../../TopSection";
import s from "../wxet/style.module.css";
import {IonContent, useIonToast} from "@ionic/react";
import {createTempChart} from "../../../functions/types/temp/createTempChart";
import {handleResize} from "../../../functions/handleResize";
import {getTempMainChartData} from "../../../../Map/data/types/temp/getTempMainChartData";
import {getNwsForecastData} from "../../../data/types/temp&wxet/getNwsForecastData";
import {TabularData} from "../../TabularData";
import {Export} from "../../Export";
import {ButtonAndSpinner} from "../../TabularData/components/ButtonAndSpinner";
import {AddCommentButton} from "../../AddComment/components/AddCommentButton";
import {AddCommentMessage} from "../../AddComment/components/AddCommentMessage";
import {getComments} from "../../AddComment/data/getComments";
import AddCommentModal from "../../AddComment/components/AddCommentModal";
import {compareDates} from "../../../functions/types/moist/compareDates";
import {formatDate} from "../../../functions/formatDate";
import {getDaysFromChartData} from "../../../functions/getDaysFromChartData";
import {setDynamicChartHeight} from "../../../functions/chartHeightCalculator";

export const TempChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>()
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [currentDates, setCurrentDates] = useState([])
  const [dateDifferenceInDays, setDateDifferenceInDays] = React.useState('14');
  const [nwsForecast, setNwsForecast] = useState(false)
  const [nwsForecastDays, setNwsForecastDays] = useState(1)
  const [nwsForecastData, setNwsForecastData] = useState(undefined)
  const [tabularDataColors, setTabularDataColors] = useState()
  const [present] = useIonToast();
  const [tempTabularData, setTempTabularData] = useState<any>(null)
  const [isTempTabularDataLoading, setIsTempTabularDataLoading] = useState(false)
  const chartCode: string = 'tempRh'
  // Add Comment
  const [tempAddCommentModal, setTempAddCommentModal] = useState<any>(undefined)
  const [tempComments, setTempComments] = useState();
  const [tempAddCommentItemShowed, setTempAddCommentItemShowed] = useState<any>(false)
  const [isTempCommentsShowed, setIsTempCommentsShowed] = useState(false)

  const updateCommentsArray = async (type: string) => {
    const newComments: any = await getComments(type, props.sensorId, getDaysFromChartData(currentChartData))
    setTempComments(newComments.data)
  }
  const updateChart = async (updateReason?: string, days?: any, endDateDays?: any) => {
    if (updateReason === 'comments') {
      const data = days ? days : currentChartData
      const comments: any = await getComments('T', props.sensorId, getDaysFromChartData(data))
      setTempComments(comments.data)
      if (tempAddCommentItemShowed === 'comments') {
        setTempAddCommentItemShowed(false)
      }
      createTempChart(
        data,
        root,
        props.isMobile,
        props.additionalChartData,
        nwsForecastData,
        setTempAddCommentModal,
        tempAddCommentItemShowed === 'comments' ? false : tempAddCommentItemShowed,
        comments.data,
        updateCommentsArray,
        props.userId,
        props.sensorId,
        isTempCommentsShowed,
        setTabularDataColors
      )
    } else if (updateReason === 'nwsForecast') {
      let newChartData: any
      if (nwsForecast) {
        newChartData = await getNwsForecastData(props.sensorId, props.userId, nwsForecastDays)
        setNwsForecastData(newChartData.data[0])
      } else {
        setNwsForecastData(undefined)
      }
      createTempChart(
        currentChartData,
        root,
        props.isMobile,
        props.additionalChartData,
        nwsForecast ? newChartData.data[0] : undefined,
        setTempAddCommentModal,
        tempAddCommentItemShowed,
        tempComments,
        updateCommentsArray,
        props.userId,
        props.sensorId,
        isTempCommentsShowed
      )
    } else if (updateReason === 'dates') {
      const newChartData: any = await getTempMainChartData(present, props.sensorId, props.userId, days, endDateDays)
      setCurrentChartData(newChartData.data.data)

      if (isTempCommentsShowed) {
        updateChart('comments', newChartData.data.data)
      } else {
        createTempChart(
          newChartData.data.data,
          root,
          props.isMobile,
          props.additionalChartData,
          nwsForecastData,
          setTempAddCommentModal,
          tempAddCommentItemShowed,
          tempComments,
          updateCommentsArray,
          props.userId,
          props.sensorId,
          isTempCommentsShowed
        )
      }
    } else if (updateReason === 'sameData') {
      createTempChart(
        currentChartData.initialData ? currentChartData.data : currentChartData,
        root,
        props.isMobile,
        props.additionalChartData,
        nwsForecastData,
        setTempAddCommentModal,
        tempAddCommentItemShowed,
        tempComments,
        updateCommentsArray,
        props.userId,
        props.sensorId,
        isTempCommentsShowed,
        setTabularDataColors
      )
    } else {
      const newData: any = await getTempMainChartData(present, props.sensorId, props.userId, currentDates[0], currentDates[1])
      setCurrentChartData(newData.data.data)
      createTempChart(
        newData.data.data,
        root,
        props.isMobile,
        props.additionalChartData,
        nwsForecastData,
        setTempAddCommentModal,
        tempAddCommentItemShowed,
        tempComments,
        updateCommentsArray,
        props.userId,
        props.sensorId,
        isTempCommentsShowed,
        setTabularDataColors
      )
    }
  }

  useEffect(() => {
    setCurrentChartData({
      data: props.chartData,
      initialData: true
    })
    handleResize(props.setIsMobile)
    setDynamicChartHeight('tempChartDiv')
  }, []);
  useEffect(() => {
    if (currentChartData && currentChartData.initialData) {
      updateChart('sameData')
      setCurrentChartData(currentChartData.data)
    }
  }, [currentChartData])
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      const updateCharts = async () => {
        const endDatetime = new Date(currentDates[1]).setHours(0, 0, 0, 0)
        if (endDatetime) {
          if (nwsForecast && compareDates(endDatetime)) {
            setNwsForecast(compareDates(endDatetime))
          }
        }
        const days = (endDatetime - new Date(currentDates[0]).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000)
        updateChart('dates', days, formatDate(new Date(endDatetime + (1000 * 60 * 60 * 24))))
      }
      updateCharts()
    }
  }, [props.isMobile, currentDates]);
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      updateChart('nwsForecast')
    }
  }, [props.isMobile, nwsForecast, nwsForecastDays]);
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      setDynamicChartHeight('tempChartDiv')
      if (tempAddCommentItemShowed === 'comments') {
        updateChart('comments')
      } else {
        updateChart('sameData')
      }
    }
  }, [tempAddCommentItemShowed])
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      if (isTempCommentsShowed) {
        updateChart('comments')
      } else {
        updateChart('sameData')
      }
    }
  }, [isTempCommentsShowed]);
  window.addEventListener("resize", () => setDynamicChartHeight('tempChartDiv'))

  return (
    <IonContent>
      <div className={s.wrapper}>
        <div data-chart-section="top">
          <TopSection
            sensorId={props.sensorId}
            root={root}
            isMobile={props.isMobile}
            setCurrentChartData={setCurrentChartData}
            endDate={endDate}
            startDate={startDate}
            setEndDate={setEndDate}
            setStartDate={setStartDate}
            additionalChartData={props.additionalChartData}
            type={'temp'}
            userId={props.userId}
            setCurrentDates={setCurrentDates}
            setNwsForecast={setNwsForecast}
            nwsForecastDays={nwsForecastDays}
            setNwsForecastDays={setNwsForecastDays}
            setAlarm={props.setAlarm}
            isCommentsShowed={isTempCommentsShowed}
            setIsCommentsShowed={setIsTempCommentsShowed}
            dateDifferenceInDays={dateDifferenceInDays}
            setDateDifferenceInDays={setDateDifferenceInDays}
          />
        </div>
        <div data-chart-section="main-header">
          <h2 className='ion-text-center ion-margin-top'>Temperature RH</h2>
          <div className={s.additionalButtons}>
            <ButtonAndSpinner data={tempTabularData} setData={setTempTabularData}
                              setIsLoading={setIsTempTabularDataLoading} sensorId={props.sensorId} chartCode={chartCode}
                              isLoading={isTempTabularDataLoading}/>
            <Export chartCode={chartCode} sensorId={props.sensorId} userId={props.userId}/>
            <AddCommentButton
              addCommentItemShowed={tempAddCommentItemShowed}
              setAddCommentItemShowed={setTempAddCommentItemShowed}
              isCommentsShowed={isTempCommentsShowed}
              setIsCommentsShowed={setIsTempCommentsShowed}
            />
          </div>
          <AddCommentMessage
            type='temp'
            addCommentItemShowed={tempAddCommentItemShowed}
            setAddCommentModal={setTempAddCommentModal}
          ></AddCommentMessage>
          {tempAddCommentModal && <AddCommentModal
              type={'temp'}
              userId={props.userId}
              sensorId={props.sensorId}
              addCommentModal={tempAddCommentModal}
              setAddCommentModal={setTempAddCommentModal}
              setComments={setTempComments}
              setAddCommentItemShowed={setTempAddCommentItemShowed}
              addCommentItemShowed={tempAddCommentItemShowed}
              updateChart={updateChart}
          />}
          <TabularData
            type={'temp'}
            sensorId={props.sensorId}
            colors={tabularDataColors}
            data={tempTabularData}
            setData={setTempTabularData}
            isLoading={isTempTabularDataLoading}
            setIsLoading={setIsTempTabularDataLoading}
            chartCode={chartCode}
          />
        </div>
        <div id='tempChartDiv' className={s.chart}></div>
      </div>
    </IonContent>
  )
}