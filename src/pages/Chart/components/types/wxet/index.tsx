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
import {getBatteryChartData} from "../../../data/types/wxet/getBatteryChartData";
import {TabularData} from "../../TabularData";
import {Export} from "../../Export";
import {ButtonAndSpinner} from "../../TabularData/components/ButtonAndSpinner";
import {AddCommentButton} from "../../AddComment/components/AddCommentButton";
import {AddCommentMessage} from "../../AddComment/components/AddCommentMessage";
import {compareDates} from "../../../functions/types/moist/compareDates";
import {formatDate} from "../../../functions/formatDate";
import {setDynamicChartHeight} from "../../../functions/chartHeightCalculator";
import {createAdditionalChart} from "../../../functions/types/moist/createAdditionalChart";
import login from "../../../../Login";

export const WxetChartPage = (props: any) => {
  const root = useRef<any>(null);
  const batteryRoot = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>()
  const [currentBatteryChartData, setCurrentBatteryChartData] = useState<any>([])
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
  const [batteryChartShowed, setBatteryChartShowed] = useState<boolean>(false)
  const chartCode: string = 'weather_leaf'
  const [dateDifferenceInDays, setDateDifferenceInDays] = React.useState('14');

  const updateChart = async (chartType: string) => {
    if (chartType === 'battery') {
      const endDatetime = currentDates ? new Date(currentDates[1]).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0)
      const days = currentDates ? (endDatetime - new Date(currentDates[0]).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000) : 14
      const newBatteryChartData = await getBatteryChartData(props.sensorId, days, formatDate(new Date(endDatetime + (1000 * 60 * 60 * 24))))
      setCurrentBatteryChartData(newBatteryChartData.data)
      createAdditionalChart(
        "battery",
        newBatteryChartData.data,
        batteryRoot,
        undefined,
        undefined,
        props.sensorId,
        undefined,
        false,
        undefined,
        props.userId,
        undefined,
        false,
      )
    }
  };

  useEffect(() => {
    setCurrentChartData({
      data: props.chartData,
      initialData: true
    })
    handleResize(props.setIsMobile)
    setDynamicChartHeight('wxetChartDiv')
  }, []);
  useEffect(() => {
    if (currentChartData && currentChartData.initialData) {
      createWxetChart(currentChartData.data, root, props.isMobile, props.additionalChartData, nwsForecastData)
      setCurrentChartData(currentChartData.data)
    }
  }, [currentChartData]);
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      const updateCharts = async () => {
        const endDatetime = new Date(currentDates[1]).setHours(0, 0, 0, 0)
        const days = (endDatetime - new Date(currentDates[0]).setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000)
        const newChartData = await getWxetMainChartData(props.sensorId, days, formatDate(new Date(endDatetime + (1000 * 60 * 60 * 24))))
        createWxetChart(newChartData.data.data, root, props.isMobile, props.additionalChartData, nwsForecastData)
        setCurrentChartData(newChartData.data.data)
      }
      updateCharts()
    }
  }, [currentDates]);
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      if (nwsForecast) {
        const updateChart = async () => {
          const newChartData = await getNwsForecastData(props.sensorId, props.userId, nwsForecastDays)
          setNwsForecastData(newChartData.data[0])
          createWxetChart(currentChartData, root, props.isMobile, props.additionalChartData, newChartData.data[0])
        }
        updateChart()
      } else {
        if (nwsForecastData) {
          setNwsForecastData(undefined)
          createWxetChart(currentChartData, root, props.isMobile, props.additionalChartData, nwsForecast)
        }
      }
    }
  }, [nwsForecast, nwsForecastDays]);
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      createWxetChart(currentChartData, root, props.isMobile, props.additionalChartData, nwsForecastData)
    }
  }, [props.isMobile]);
  window.addEventListener("resize", () => setDynamicChartHeight('wxetChartDiv'))

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
            type={'wxet'}
            setCurrentDates={setCurrentDates}
            setNwsForecast={setNwsForecast}
            nwsForecastDays={nwsForecastDays}
            setNwsForecastDays={setNwsForecastDays}
            setAlarm={props.setAlarm}
            dateDifferenceInDays={dateDifferenceInDays}
            setDateDifferenceInDays={setDateDifferenceInDays}
            batteryChartShowed={batteryChartShowed}
            setBatteryChartShowed={setBatteryChartShowed}
            batteryRoot={batteryRoot}
            updateChart={updateChart}
          />
        </div>

        {/* Battery Chart Section */}
        <div style={{display: batteryChartShowed ? 'block' : 'none'}} className="ion-margin-top">
          <h2 className="ion-text-center">Battery Volts</h2>
          <div className={s.additionalChart} id="batteryChart"></div>
        </div>

        <div data-chart-section="main-header">
          <h2 className='ion-text-center ion-margin-top'>Weather Station</h2>
          <div className={s.additionalButtons}>
            <ButtonAndSpinner data={wxetTabularData} setData={setWxetTabularData}
                              setIsLoading={setIsWxetTabularDataLoading} sensorId={props.sensorId} chartCode={chartCode}
                              isLoading={isWxetTabularDataLoading}/>
            <Export chartCode={chartCode} sensorId={props.sensorId} userId={props.userId}/>
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
        </div>
        <div id='wxetChartDiv' className={s.chart}></div>
      </div>
    </IonContent>
  )
}