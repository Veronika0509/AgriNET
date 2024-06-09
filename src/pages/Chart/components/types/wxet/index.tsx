import s from './style.module.css'
import {useEffect, useRef, useState} from "react";
import {updateWxetChart} from "../../../functions/types/wxet/updateWxetChart";
import {handleResize} from "../../../functions/handleResize";
import {IonContent} from "@ionic/react";
import TopSection from "../../TopSection";
import {getCurrentDatetime} from "../../DateTimePicker/functions/getCurrentTime";
import {getStartDate} from "../../DateTimePicker/functions/getStartDate";

export const WxetChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState()
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);

  useEffect(() => {
    setCurrentChartData(props.chartData)
    updateWxetChart(props.chartData, root, props.isMobile, props.additionalChartData)
    handleResize(props.setIsMobile)
  }, []);

  useEffect(() => {
    if (currentChartData) {
      updateWxetChart(currentChartData, root, props.isMobile, props.additionalChartData)
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
        type={'wxet'}
      />
      <div id='wxetChartDiv' className={s.chart}></div>
    </IonContent>
  )
}