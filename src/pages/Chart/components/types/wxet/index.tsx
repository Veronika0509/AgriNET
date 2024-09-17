import s from './style.module.css'
import React, {useEffect, useRef, useState} from "react";
import {handleResize} from "../../../functions/handleResize";
import {IonContent, useIonToast} from "@ionic/react";
import TopSection from "../../TopSection";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {createWxetChart} from "../../../functions/types/wxet/createWxetChart";
import {getWxetMainChartData} from "../../../../Map/data/types/wxet/getWxetMainChartData";
import {getNwsForecastData} from "../../../data/types/temp&wxet/getNwsForecastData";
import {TabularData} from "../../TabularData";
import {Export} from "../../Export";

export const WxetChartPage = (props: any) => {
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

  useEffect(() => {
    setCurrentChartData(props.chartData)
    createWxetChart(props.chartData, root, props.isMobile, props.additionalChartData, nwsForecastData)
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

      const newChartData = await getWxetMainChartData(props.sensorId, days, endDateDays)
      createWxetChart(newChartData.data.data, root, props.isMobile, props.additionalChartData, nwsForecastData)
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
        />
        <h2 className='ion-text-center'>Weather Station</h2>
        <div className={s.additionalButtons}>
          <TabularData type={'wxet'} sensorId={props.sensorId} />
          <Export type='wxet' sensorId={props.sensorId} userId={props.userId} />
        </div>
        <div id='wxetChartDiv' className={s.chart}></div>
      </div>
    </IonContent>
  )
}