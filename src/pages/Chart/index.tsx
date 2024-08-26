import s from './components/types/moist/style.module.css';
import {IonContent, IonModal, IonPage} from "@ionic/react";
import Header from "./components/Header";
import {MoistChartPage} from "./components/types/moist";
import {WxetChartPage} from "./components/types/wxet";
import {handleResize} from "./functions/handleResize";
import React, {useEffect, useState} from "react";
import {TempChartPage} from "./components/types/temp";
import {Alarm} from "./components/Alarm";
import {getAlarmData} from "./data/getAlarmData";
import {getFieldLabels} from "./components/Alarm/data/getFieldLabels";
import {alarmDataProcessing} from "./functions/alarmDataProcessing";

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any[];
  setSiteList: React.Dispatch<React.SetStateAction<any[]>>;
  siteId: string;
  siteName: string;
  userId: number;
  chartData?: any;
  additionalChartData: any;
  chartPageType: any;
}

const Chart = (props: ChartProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [alarm, setAlarm] = useState(false)
  const [alarmData, setAlarmData] = useState()
  const [alarmEmailOrTel1, setAlarmEmailOrTel1] = useState('Unset')
  const [alarmEmailOrTel2, setAlarmEmailOrTel2] = useState('Unset')
  const [alarmEmailOrTel3, setAlarmEmailOrTel3] = useState('Unset')
  const [alarmLowSetpoint, setAlarmLowSetpoint] = useState('Unset')
  const [alarmHighSetpoint, setAlarmHighSetpoint] = useState('Unset')
  const [alarmLowSelectedSensor, setAlarmLowSelectedSensor] = useState()
  const [alarmHighSelectedSensor, setAlarmHighSelectedSensor] = useState()
  const [alarmFieldLabelsData, setAlarmFieldLabelsData] = useState()
  const [isAlarmLowSetpointEnabled, setIsAlarmLowSetpointEnabled] = useState()
  const [isAlarmHighSetpointEnabled, setIsAlarmHighSetpointEnabled] = useState()

  useEffect(() => {
    alarmDataProcessing(
      props.siteId,
      setAlarmData,
      setAlarmEmailOrTel1,
      setAlarmEmailOrTel2,
      setAlarmEmailOrTel3,
      setAlarmLowSetpoint,
      setAlarmHighSetpoint,
      setAlarmFieldLabelsData,
      setAlarmLowSelectedSensor,
      setAlarmHighSelectedSensor,
      setIsAlarmLowSetpointEnabled,
      setIsAlarmHighSetpointEnabled
    )
  }, []);

  window.addEventListener('resize', () => {
    handleResize(setIsMobile)
  })

  const renderChartPage = () => {
    switch (props.chartPageType) {
      case 'moist':
        return (
          <MoistChartPage
            chartData={props.chartData}
            additionalChartData={props.additionalChartData}
            userId={props.userId}
            sensorId={props.siteId}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
            alarm={alarm}
            setAlarm={setAlarm}
          />
        );
      case 'wxet':
        return (
          <WxetChartPage
            chartData={props.chartData}
            sensorId={props.siteId}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
            additionalChartData={props.additionalChartData}
            userId={props.userId}
            alarm={alarm}
            setAlarm={setAlarm}
          />
        );
      case 'temp':
        return (
          <TempChartPage
            chartData={props.chartData}
            sensorId={props.siteId}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
            additionalChartData={props.additionalChartData}
            userId={props.userId}
            alarm={alarm}
            setAlarm={setAlarm}
          />
        )
      default:
        return null;
    }
  };

  return (
    <IonPage className={s.page}>
      <Header type='chartPage' setPage={props.setPage} siteName={props.siteName} siteId={props.siteId}/>
      {renderChartPage()}
      <IonModal isOpen={alarm} className={s.alarmPage}>
        <Header type='alarmPage' setAlarm={setAlarm}/>
        <Alarm
          alarm={alarm}
          setAlarm={setAlarm}
          sensorId={props.siteId}
          alarmData={alarmData}
          emailOrTel1={alarmEmailOrTel1}
          setEmailOrTel1={setAlarmEmailOrTel1}
          emailOrTel2={alarmEmailOrTel2}
          setEmailOrTel2={setAlarmEmailOrTel2}
          emailOrTel3={alarmEmailOrTel3}
          setEmailOrTel3={setAlarmEmailOrTel3}
          lowSetpoint={alarmLowSetpoint}
          setLowSetpoint={setAlarmLowSetpoint}
          highSetpoint={alarmHighSetpoint}
          setHighSetpoint={setAlarmHighSetpoint}
          fieldsLabelsData={alarmFieldLabelsData}
          lowSelectedSensor={alarmLowSelectedSensor}
          setLowSelectedSensor={setAlarmLowSelectedSensor}
          highSelectedSensor={alarmHighSelectedSensor}
          setHighSelectedSensor={setAlarmHighSelectedSensor}
          isLowSetpointEnabled={isAlarmLowSetpointEnabled}
          isHighSetpointEnabled={isAlarmHighSetpointEnabled}
          setIsLowSetpointEnabled={setIsAlarmLowSetpointEnabled}
          setIsHighSetpointEnabled={setIsAlarmHighSetpointEnabled}
        ></Alarm>
      </IonModal>
    </IonPage>
  );
}

export default Chart;
