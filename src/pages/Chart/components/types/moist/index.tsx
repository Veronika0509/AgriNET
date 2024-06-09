import s from './style.module.css'
import {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import {handleResize} from "../../../functions/handleResize";
import {updateMoistChart} from "../../../functions/types/moist/updateMoistChart";
import {irrigationDatesRequest} from "../../../data/irriationDatesRequest";
import {sumChartDataRequest} from "../../../data/sumChartDataRequest";
import {IonContent} from "@ionic/react";
import TopSection from "../../TopSection";
import IrrigationButtons from "./IrrigationButtons";

export const MoistChartPage = (props: any) => {
  const root = useRef<any>(null);
  const sumRoot = useRef<any>(null);
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

  useEffect(() => {
    updateMoistChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData)
  }, [props.isMobile]);
  useEffect(() => {
    if (fullDatesArray) {
      updateMoistChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData)
    }
  }, [fullDatesArray])
  useEffect(() => {
    setCurrentChartData(props.chartData)
    updateMoistChart(props.chartData, root, props.isMobile, fullDatesArray, props.additionalChartData)
    irrigationDatesRequest(setIsIrrigationDataIsLoading, setIsIrrigationButtons, props.userId, props.siteId, setIrrigationDates, setFullDatesArray)
    handleResize(props.setIsMobile)

    sumChartDataRequest(props.siteId, sumRoot)
  }, []);

  return (
    <IonContent className={s.container}>
      <div className={s.wrapper}>
        <TopSection sensorId={props.siteId} root={root} isMobile={props.isMobile} fullDatesArray={fullDatesArray}
                    setCurrentChartData={setCurrentChartData} setDisableNextButton={setDisableNextButton}
                    setDisablePrevButton={setDisablePrevButton} startDate={startDate} setStartDate={setStartDate}
                    endDate={endDate} setEndDate={setEndDate} additionalChartData={props.additionalChartData} type={'moistFuel'} />
        <div>
          <div className={s.chart} id='moistChartDiv'></div>
          <IrrigationButtons isIrrigationDataIsLoading={isIrrigationDataIsLoading}
                             isIrrigationButtons={isIrrigationButtons} currentChartData={currentChartData}
                             irrigationDates={irrigationDates} setDisableNextButton={setDisableNextButton}
                             setDisablePrevButton={setDisablePrevButton} disableNextButton={disableNextButton}
                             disablePrevButton={disablePrevButton} siteId={props.siteId} userId={props.userId}
                             setCurrentChartData={setCurrentChartData} root={root} isMobile={props.isMobile}
                             fullDatesArray={fullDatesArray} setStartDate={setStartDate}
                             setEndDate={setEndDate} additionalChartData={props.additionalChartData} />
        </div>
        <div className={s.sumChart}>
          <h2 className='ion-text-center ion-margin-top'>Sum of Soil Moisture</h2>
          <div id='moistSumChartDiv' className={s.sumChart}></div>
        </div>
      </div>
    </IonContent>
  )
}