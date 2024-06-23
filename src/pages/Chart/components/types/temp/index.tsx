import {useEffect, useRef, useState} from "react";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";
import TopSection from "../../TopSection";
import s from "./style.module.css";
import {IonContent} from "@ionic/react";
import {createTempChart} from "../../../functions/types/temp/createTempChart";
import {handleResize} from "../../../functions/handleResize";

export const TempChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState()
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);

  useEffect(() => {
    setCurrentChartData(props.chartData)
    createTempChart(props.chartData, root, props.isMobile, props.additionalChartData)
    handleResize(props.setIsMobile)
  }, []);

  useEffect(() => {
    if (currentChartData) {
      createTempChart(currentChartData, root, props.isMobile, props.additionalChartData)
    }
  }, [props.isMobile, currentChartData]);

  return (
    <IonContent>
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
      />
      <div id='tempChartDiv' className={s.chart}></div>
    </IonContent>
  )
}