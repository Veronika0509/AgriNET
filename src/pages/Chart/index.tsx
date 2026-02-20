import s from './components/types/moist/style.module.css';
import {IonModal, IonPage} from "@ionic/react";
import Header from "./components/Header";
import {MoistChartPage} from "./components/types/moist";
import {WxetChartPage} from "./components/types/wxet";
import {handleResize} from "./functions/handleResize";
import React, {useEffect, useState, useCallback} from "react";
import {TempChartPage} from "./components/types/temp";
import {Alarm} from "./components/Alarm";
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

  // Wrapper functions for setpoint handlers to accept string | number
  const handleSetLowSetpoint = useCallback((value: string | number) => {
    setAlarmLowSetpoint(typeof value === 'string' ? parseFloat(value) : value)
  }, [])

  const handleSetHighSetpoint = useCallback((value: string | number) => {
    setAlarmHighSetpoint(typeof value === 'string' ? parseFloat(value) : value)
  }, [])

  // Handle browser/device back button for Chart page modals
  // Push history state when opening a modal, handle popstate to close it
  const alarmRef = React.useRef(alarm)
  const valveArchiveRef = React.useRef(valveArchive)
  const valveSettingsRef = React.useRef(valveSettings)
  const valveCreateRef = React.useRef(valveCreate)
  const autowaterRef = React.useRef(autowater)
  alarmRef.current = alarm
  valveArchiveRef.current = valveArchive
  valveSettingsRef.current = valveSettings
  valveCreateRef.current = valveCreate
  autowaterRef.current = autowater

  // Push history entry when any modal opens
  useEffect(() => {
    if (alarm) window.history.pushState({ chartModal: 'alarm' }, '')
  }, [alarm])
  useEffect(() => {
    if (valveArchive) window.history.pushState({ chartModal: 'valveArchive' }, '')
  }, [valveArchive])
  useEffect(() => {
    if (valveSettings) window.history.pushState({ chartModal: 'valveSettings' }, '')
  }, [valveSettings])
  useEffect(() => {
    if (valveCreate) window.history.pushState({ chartModal: 'valveCreate' }, '')
  }, [valveCreate])
  useEffect(() => {
    if (autowater) window.history.pushState({ chartModal: 'autowater' }, '')
  }, [autowater])

  // Listen for popstate to close the topmost modal
  // Uses a global flag to prevent App.tsx popstate handler from also firing
  useEffect(() => {
    const handlePopState = () => {
      if (autowaterRef.current) {
        setAutowater(false)
        ;(window as any).__popstateHandledByModal = true
      } else if (valveCreateRef.current) {
        setValveCreate(false)
        ;(window as any).__popstateHandledByModal = true
      } else if (valveSettingsRef.current) {
        setValveSettings(false)
        ;(window as any).__popstateHandledByModal = true
      } else if (valveArchiveRef.current) {
        setValveArchive(false)
        ;(window as any).__popstateHandledByModal = true
      } else if (alarmRef.current) {
        setAlarm(false)
        ;(window as any).__popstateHandledByModal = true
      }
      // If no modal is open, let App.tsx popstate handler deal with page-level navigation
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Handle Capacitor/Ionic hardware back button for Chart modals
  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(20, (processNextHandler: () => void) => {
        if (autowaterRef.current) {
          setAutowater(false)
        } else if (valveCreateRef.current) {
          setValveCreate(false)
        } else if (valveSettingsRef.current) {
          setValveSettings(false)
        } else if (valveArchiveRef.current) {
          setValveArchive(false)
        } else if (alarmRef.current) {
          setAlarm(false)
        } else {
          // No modal open — let lower priority handlers deal with page navigation
          processNextHandler()
        }
      })
    }

    document.addEventListener('ionBackButton', handler)
    return () => document.removeEventListener('ionBackButton', handler)
  }, [])

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
          setLowSetpoint={handleSetLowSetpoint}
          highSetpoint={alarmHighSetpoint}
          setHighSetpoint={handleSetHighSetpoint}
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
