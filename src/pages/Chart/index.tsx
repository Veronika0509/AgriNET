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
import {FuelChartPage} from "./components/types/wxet/components/fuel";

// Типы
import type { Site, SensorData, ChartPageType, UserId, SiteId } from '../../types';

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: Site[];
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>;
  siteId: SiteId;
  siteName: string;
  userId: UserId;
  chartData: SensorData[];
  additionalChartData: SensorData[];
  chartPageType: ChartPageType;
  setAdditionalChartData: React.Dispatch<React.SetStateAction<SensorData[]>>;
  setChartData: React.Dispatch<React.SetStateAction<SensorData[]>>;
  setSiteId: React.Dispatch<React.SetStateAction<SiteId>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
  setChartPageType: React.Dispatch<React.SetStateAction<ChartPageType>>;
}

const Chart = (props: ChartProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [alarmOddBack, setAlarmOddBack] = useState(false)
  const [settingsOddBack, setSettingsOddBack] = useState(false)
  const [autowater, setAutowater] = useState<any>(false)
  const [alarm, setAlarm] = useState(false)
  const [alarmData, setAlarmData] = useState<unknown>()
  const [alarmEmailOrTel1, setAlarmEmailOrTel1] = useState<string>('Unset')
  const [alarmEmailOrTel2, setAlarmEmailOrTel2] = useState<string>('Unset')
  const [alarmEmailOrTel3, setAlarmEmailOrTel3] = useState<string>('Unset')
  const [alarmLowSetpoint, setAlarmLowSetpoint] = useState<number>(0)
  const [alarmHighSetpoint, setAlarmHighSetpoint] = useState<number>(0)
  const [alarmLowSelectedSensor, setAlarmLowSelectedSensor] = useState<string>('')
  const [alarmHighSelectedSensor, setAlarmHighSelectedSensor] = useState<string>('')
  const [alarmFieldLabelsData, setAlarmFieldLabelsData] = useState<unknown>()
  const [isAlarmLowSetpointEnabled, setIsAlarmLowSetpointEnabled] = useState<boolean>(false)
  const [isAlarmHighSetpointEnabled, setIsAlarmHighSetpointEnabled] = useState<boolean>(false)
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
            additionalChartData={props.additionalChartData as any}
            userId={props.userId}
            sensorId={props.siteId}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
            alarm={alarm}
            setAlarm={setAlarm}
            setChartData={props.setChartData}
            setSiteId={props.setSiteId as any}
            setChartPageType={props.setChartPageType as any}
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
      case 'fuel':
        return (
          <FuelChartPage
            chartData={props.chartData}
            sensorId={props.siteId}
            setIsMobile={setIsMobile}
            userId={props.userId}
            alarm={alarm}
            setAlarm={setAlarm}
            siteList={props.siteList}
            setSiteName={props.setSiteName}
            setSiteId={props.setSiteId}
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
        <Header type='alarmPage' setAlarm={setAlarm} alarmOddBack={alarmOddBack} setAlarmOddBack={setAlarmOddBack} settingsOddBack={settingsOddBack} setSettingsOddBack={setSettingsOddBack} setChartPageType={props.setChartPageType as any} />
        <Alarm
          alarm={alarm}
          setAlarm={setAlarm}
          sensorId={props.siteId}
          alarmData={alarmData as any}
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
          fieldsLabelsData={alarmFieldLabelsData as any}
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
