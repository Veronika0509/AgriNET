import s from './style.module.css'
import React, {useEffect, useRef, useState} from "react";
import {handleResize} from "../../../functions/handleResize";
import {IonContent, useIonToast} from "@ionic/react";
import TopSection from "../../TopSection";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentDatetime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {createWxetChart} from "../../../functions/types/wxet/createWxetChart";
import {getWxetMainChartData} from "../../../../Map/data/types/wxet/getWxetMainChartData";
import {getNwsForecastData} from "../../../data/types/temp&wxet/getNwsForecastData";
import {TabularData} from "../../TabularData";
import {Export} from "../../Export";
import {ButtonAndSpinner} from "../../TabularData/components/ButtonAndSpinner";
import {AddCommentButton} from "../../AddComment/components/AddCommentButton";
import {AddCommentMessage} from "../../AddComment/components/AddCommentMessage";
import {compareDates} from "../../../functions/types/moist/compareDates";
import {formatDate} from "../../../functions/formatDate";

export const WxetChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState()
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [currentDates, setCurrentDates] = useState<any>()
  const [nwsForecast, setNwsForecast] = useState(false)
  const [nwsForecastDays, setNwsForecastDays] = useState(1)
  const [nwsForecastData, setNwsForecastData] = useState(undefined)
  const [wxetTabularData, setWxetTabularData] = useState<any>(null)
  const [isWxetTabularDataLoading, setIsWxetTabularDataLoading] = useState(false)
  const chartCode: string = 'weather_leaf'
  const [dateDifferenceInDays, setDateDifferenceInDays] = React.useState('14');

  useEffect(() => {
    setCurrentChartData(props.chartData)
    createWxetChart(props.chartData, root, props.isMobile, props.additionalChartData, nwsForecastData)
    handleResize(props.setIsMobile)
  }, []);
  useEffect(() => {
    const updateCharts = async () => {
      const endDatetime = new Date(currentDates[1]).setHours(0, 0, 0, 0)
      if (endDatetime) {
        if (nwsForecast && compareDates(endDatetime)) {
          setNwsForecast(compareDates(endDatetime))
        }
      }

      const days = (endDatetime - new Date(currentDates[0]).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000)
      const newChartData = await getWxetMainChartData(props.sensorId, days, formatDate(new Date(endDatetime + (1000 * 60 * 60 * 24))))
      createWxetChart(newChartData.data.data, root, props.isMobile, props.additionalChartData, nwsForecastData)
      setCurrentChartData(newChartData.data.data)
    }
    updateCharts()
  }, [props.isMobile, currentDates]);
  useEffect(() => {
    if (nwsForecast) {
      const updateChart = async () => {
        const newChartData = await getNwsForecastData(props.sensorId, props.userId, nwsForecastDays)
        setNwsForecastData(newChartData.data[0])
        if (currentChartData) {
          createWxetChart(currentChartData, root, props.isMobile, props.additionalChartData, newChartData.data[0])
        } else {
          createWxetChart(props.chartData, root, props.isMobile, props.additionalChartData, newChartData.data[0])
        }
      }
      updateChart()
    } else {
      setNwsForecastData(undefined)
      if (currentChartData) {
        createWxetChart(currentChartData, root, props.isMobile, props.additionalChartData, nwsForecast)
      } else {
        createWxetChart(props.chartData, root, props.isMobile, props.additionalChartData, nwsForecast)
      }
    }
  }, [props.isMobile, nwsForecast, nwsForecastDays]);

  return (
    <IonContent>
      <div className={s.wrapper}>
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
          type={'wxet'}
          setCurrentDates={setCurrentDates}
          setNwsForecast={setNwsForecast}
          nwsForecastDays={nwsForecastDays}
          setNwsForecastDays={setNwsForecastDays}
          setAlarm={props.setAlarm}
          dateDifferenceInDays={dateDifferenceInDays}
          setDateDifferenceInDays={setDateDifferenceInDays}
        />
        <h2 className='ion-text-center'>Weather Station</h2>
        <div className={s.additionalButtons}>
          <ButtonAndSpinner data={wxetTabularData} setData={setWxetTabularData} setIsLoading={setIsWxetTabularDataLoading} sensorId={props.sensorId} chartCode={chartCode} isLoading={isWxetTabularDataLoading} />
          <Export chartCode={chartCode} sensorId={props.sensorId} userId={props.userId} />
        </div>
        <TabularData
          type={'wxet'}
          sensorId={props.sensorId}
          data={wxetTabularData}
          setData={setWxetTabularData}
          isLoading={isWxetTabularDataLoading}
          setIsLoading={setIsWxetTabularDataLoading}
          chartCode={chartCode}
        />
        <div id='wxetChartDiv' className={s.chart}></div>
      </div>
    </IonContent>
  )
}