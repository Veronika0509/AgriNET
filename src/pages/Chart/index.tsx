import s from './components/types/moist/style.module.css';
import {IonContent, IonModal, IonPage} from "@ionic/react";
import Header from "./components/Header";
import {MoistChartPage} from "./components/types/moist";
import {WxetChartPage} from "./components/types/wxet";
import {handleResize} from "./functions/handleResize";
import React, {useEffect, useState} from "react";
import {TempChartPage} from "./components/types/temp";
import {Alarm} from "./components/Alarm";
import {getAlarmData} from "./components/Alarm/data/getAlarmData";
import {getFieldLabels} from "./components/Alarm/data/getFieldLabels";
import {alarmDataProcessing} from "./functions/alarmDataProcessing";
import {ValveChartPage} from "./components/types/valve";

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
  setAdditionalChartData: any,
  setChartData: any,
  setSiteId: any,
  setSiteName: any,
  setChartPageType: any
}

const Chart = (props: ChartProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [alarmOddBack, setAlarmOddBack] = useState(false)
  const [settingsOddBack, setSettingsOddBack] = useState(false)
  const [autowater, setAutowater] = useState<any>(false)
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
  const [isAlarmEnableActionSheet, setIsAlarmEnableActionSheet] = useState(false)
  const [isAlarmEnabledToastOpen, setIsAlarmEnabledToastOpen] = useState(false)
  const [isAlarmDisabledToastOpen, setIsAlarmDisabledToastOpen] = useState(false)
  // Valve
  const [valveArchive, setValveArchive] = useState(false)
  const [valveSettings, setValveSettings] = useState(false)
  const [valveCreate, setValveCreate] = useState(false)

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
            setChartData={props.setChartData}
            setSiteId={props.setSiteId}
            setChartPageType={props.setChartPageType}
            setValveSettings={setValveSettings}
            alarmOddBack={alarmOddBack}
            setAlarmOddBack={setAlarmOddBack}
            settingsOddBack={settingsOddBack}
            setSettingsOddBack={setSettingsOddBack}
            autowater={autowater}
            setAutowater={setAutowater}
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
      case 'valve':
        return (
          <ValveChartPage
            chartData={props.chartData}
            sensorId={props.siteId}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
            userId={props.userId}
            valveArchive={valveArchive}
            setValveArchive={setValveArchive}
            valveSettings={valveSettings}
            setValveSettings={setValveSettings}
            valveCreate={valveCreate}
            setValveCreate={setValveCreate}
            siteList={props.siteList}
            setLowSelectedSensor={setAlarmLowSelectedSensor}
            setLowSetpoint={setAlarmLowSetpoint}
            isSetpointEnabled={isAlarmLowSetpointEnabled}
            setIsSetpointEnabled={setIsAlarmLowSetpointEnabled}
            setIsEnableActionSheet={setIsAlarmEnableActionSheet}
            setIsEnabledToastOpen={setIsAlarmEnabledToastOpen}
            setIsDisabledToastOpen={setIsAlarmDisabledToastOpen}
            setAdditionalChartData={props.setAdditionalChartData}
            setChartData={props.setChartData}
            setSiteId={props.setSiteId}
            setSiteName={props.setSiteName}
            setChartPageType={props.setChartPageType}
            setAlarm={setAlarm}
            alarmOddBack={alarmOddBack}
            setAlarmOddBack={setAlarmOddBack}
            settingsOddBack={settingsOddBack}
            setSettingsOddBack={setSettingsOddBack}
            setAutowater={setAutowater}
          />
        )
      default:
        return null;
    }
  };

  return (
    <IonPage className={s.page}>
      <Header
        type='chartPage'
        setPage={props.setPage}
        siteName={props.siteName}
        sensorId={props.siteId}
        chartType={props.chartPageType}
        setValveArchive={setValveArchive}
        setValveSettings={setValveSettings}
        setValveCreate={setValveCreate}
        alarmOddBack={alarmOddBack}
        setAlarmOddBack={setAlarmOddBack}
        settingsOddBack={settingsOddBack}
        setSettingsOddBack={setSettingsOddBack}
      />
      {renderChartPage()}
      <IonModal isOpen={alarm} className={s.alarmPage}>
        <Header type='alarmPage' setAlarm={setAlarm} alarmOddBack={alarmOddBack} setAlarmOddBack={setAlarmOddBack} settingsOddBack={settingsOddBack} setSettingsOddBack={setSettingsOddBack} setChartPageType={props.setChartPageType} />
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
          isEnableActionSheet={isAlarmEnableActionSheet}
          setIsEnableActionSheet={setIsAlarmEnableActionSheet}
          isEnabledToastOpen={isAlarmEnabledToastOpen}
          setIsEnabledToastOpen={setIsAlarmEnabledToastOpen}
          isDisabledToastOpen={isAlarmDisabledToastOpen}
          setIsDisabledToastOpen={setIsAlarmDisabledToastOpen}
        ></Alarm>
      </IonModal>
    </IonPage>
  );
}

export default Chart;
