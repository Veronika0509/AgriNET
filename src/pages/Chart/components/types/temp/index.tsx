import React, {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import TopSection from "../../TopSection";
import s from "./style.module.css";
import {IonContent, useIonToast} from "@ionic/react";
import {createTempChart} from "../../../functions/types/temp/createTempChart";
import {handleResize} from "../../../functions/handleResize";
import {getTempMainChartData} from "../../../../Map/data/types/temp/getTempMainChartData";
import {getNwsForecastData} from "../../../data/types/temp&wxet/getNwsForecastData";
import {TabularData} from "../../TabularData";
import {Export} from "../../Export";
import {ButtonAndSpinner} from "../../TabularData/components/ButtonAndSpinner";

export const TempChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState()
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [currentDates, setCurrentDates] = useState([])
  const [nwsForecast, setNwsForecast] = useState(false)
  const [nwsForecastDays, setNwsForecastDays] = useState(1)
  const [nwsForecastData, setNwsForecastData] = useState(undefined)
  const [tabularDataColors, setTabularDataColors] = useState()
  const [present] = useIonToast();
  const [tempTabularData, setTempTabularData] = useState<any>(null)
  const [isTempTabularDataLoading, setIsTempTabularDataLoading] = useState(false)
  const chartCode: string = 'tempRh'

  useEffect(() => {
    setCurrentChartData(props.chartData)
    createTempChart(props.chartData, root, props.isMobile, props.additionalChartData, nwsForecastData, setTabularDataColors)
    handleResize(props.setIsMobile)
  }, []);
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

      if (endDatetime) {
        if (nwsForecast && compareDates(endDatetime)) {
          setNwsForecast(compareDates(endDatetime))
        }
      }

      const newChartData: any = await getTempMainChartData(present, props.sensorId, props.userId, days, endDateDays)
      createTempChart(newChartData.data.data, root, props.isMobile, props.additionalChartData, nwsForecastData)
      setCurrentChartData(newChartData.data.data)
    }
    updateCharts(currentDates[0], currentDates[1], currentDates[2], currentDates[3])
  }, [props.isMobile, currentDates]);
  useEffect(() => {
    if (nwsForecast) {
      const updateChart = async () => {
        const newChartData = await getNwsForecastData(props.sensorId, props.userId, nwsForecastDays)
        setNwsForecastData(newChartData.data[0])
        if (currentChartData) {
          createTempChart(currentChartData, root, props.isMobile, props.additionalChartData, newChartData.data[0])
        } else {
          createTempChart(props.chartData, root, props.isMobile, props.additionalChartData, newChartData.data[0])
        }
      }
      updateChart()
    } else {
      setNwsForecastData(undefined)
      if (currentChartData) {
        createTempChart(currentChartData, root, props.isMobile, props.additionalChartData, nwsForecast)
      } else {
        createTempChart(props.chartData, root, props.isMobile, props.additionalChartData, nwsForecast)
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
          type={'temp'}
          userId={props.userId}
          setCurrentDates={setCurrentDates}
          setNwsForecast={setNwsForecast}
          nwsForecastDays={nwsForecastDays}
          setNwsForecastDays={setNwsForecastDays}
          setAlarm={props.setAlarm}
        />
        <h2 className='ion-text-center'>Temperature RH</h2>
        <div className={s.additionalButtons}>
          <ButtonAndSpinner data={tempTabularData} setData={setTempTabularData} setIsLoading={setIsTempTabularDataLoading} sensorId={props.sensorId} chartCode={chartCode} isLoading={isTempTabularDataLoading} />
          <Export chartCode={chartCode} sensorId={props.sensorId} userId={props.userId} />
        </div>
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
        <div id='tempChartDiv' className={s.chart}></div>
      </div>
    </IonContent>
  )
}