import React, {useEffect, useRef, useState} from 'react';
import s from './style.module.css';
import {
  IonButton,
  IonContent, IonDatetime, IonDatetimeButton,
  IonHeader,
  IonIcon, IonLabel, IonModal,
  IonPage, IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import axios from "axios";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {useHistory} from 'react-router-dom';
import {refreshOutline} from 'ionicons/icons';
import {irrigationDatesRequest} from "./functions/irriationDatesRequest";
import {onIrrigationButtonClick} from "./functions/onIrrigationButtonClick";
import {createChart} from "./functions/createChart";
import {handleResize} from "./functions/handleResize";
import {back} from "./functions/back";
import {updateChart} from "./functions/updateChart";
import Header from "./components/Header";
import IrrigationButtons from "./components/IrrigationButtons";
import DateTimePicker from "./components/DateTimePicker";
import TopSection from "./components/TopSection";
import {getCurrentDatetime} from "./components/DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "./components/DateTimePicker/functions/getStartDate";

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any[];
  setSiteList: React.Dispatch<React.SetStateAction<any[]>>;
  siteId: string;
  siteName: string;
  userId: number;
  chartData?: any;
  linesCount: any
}

const Chart = (props: ChartProps) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>([])
  const [isMobile, setIsMobile] = useState(false)
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

  window.addEventListener('resize', () => {
    handleResize(setIsMobile)
  })
  useEffect(() => {
    updateChart(props.chartData, root, isMobile, fullDatesArray, props.linesCount)
  }, [isMobile]);
  useEffect(() => {
    if (fullDatesArray) {
      updateChart(props.chartData, root, isMobile, fullDatesArray, props.linesCount)
    }
  }, [fullDatesArray])
  useEffect(() => {
    setCurrentChartData(props.chartData)
    updateChart(props.chartData, root, isMobile, fullDatesArray, props.linesCount)
    irrigationDatesRequest(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.siteId, setIrrigationDates, setFullDatesArray)
    handleResize(setIsMobile)
  }, []);

  return (
    <IonPage className={s.page}>
      <Header setPage={props.setPage} siteName={props.siteName} siteId={props.siteId}/>
      <IonContent className={s.container}>
        <div className={s.wrapper}>
          <TopSection sensorId={props.siteId} root={root} isMobile={isMobile} fullDatesArray={fullDatesArray}
                      setCurrentChartData={setCurrentChartData} setDisableNextButton={setDisableNextButton}
                      setDisablePrevButton={setDisablePrevButton} startDate={startDate} setStartDate={setStartDate}
                      endDate={endDate} setEndDate={setEndDate} linesCount={props.linesCount}/>
          <div>
            <div className={s.chart} id='chartdiv'></div>
            <IrrigationButtons isIrrigationDataIsLoading={isIrrigationDataIsLoading}
                               isIrrigationButtons={isIrrigationButtons} currentChartData={currentChartData}
                               irrigationDates={irrigationDates} setDisableNextButton={setDisableNextButton}
                               setDisablePrevButton={setDisablePrevButton} disableNextButton={disableNextButton}
                               disablePrevButton={disablePrevButton} siteId={props.siteId} userId={props.userId}
                               setCurrentChartData={setCurrentChartData} root={root} isMobile={isMobile}
                               fullDatesArray={fullDatesArray} setStartDate={setStartDate}
                               setEndDate={setEndDate}/>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Chart;
