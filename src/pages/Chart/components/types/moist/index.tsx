import s from "./style.module.css"
import { useCallback, useEffect, useRef, useState, startTransition } from "react"
import * as am5 from "@amcharts/amcharts5"
import { getCurrentDatetime } from "../../DateTimePicker/functions/getCurrentDatetime"
import { getDatetime } from "../../DateTimePicker/functions/getDatetime"
import { getIrrigationDates } from "../../../data/types/moist/getIrrigationDates"
import { getSumChartData } from "../../../data/types/moist/getSumChartData"
import { IonButton, IonContent } from "@ionic/react"
import TopSection from "../../TopSection"
import IrrigationButtons from "./components/IrrigationButtons"
import { createMainChart } from "../../../functions/types/moist/createMainChart"
import { getMoistMainChartData } from "../../../../Map/data/types/moist/getMoistMainChartData"
import { createAdditionalChart } from "../../../functions/types/moist/createAdditionalChart"
import { TabularData } from "../../TabularData"
import { Export } from "../../Export"
import { ButtonAndSpinner } from "../../TabularData/components/ButtonAndSpinner"
import { AddCommentButton } from "../../AddComment/components/AddCommentButton"
import { AddCommentMessage } from "../../AddComment/components/AddCommentMessage"
import AddCommentModal from "../../AddComment/components/AddCommentModal"
import { getComments } from "../../AddComment/data/getComments"
import { getSoilTempChartData } from "../../../data/types/moist/getSoilTempChartData"
import { getBatteryChartData } from "../../../data/types/moist/getBatteryChartData"
import { Autowater } from "./components/Autowater"
import { updateCommentsArray } from "../../../functions/types/moist/updateCommentsArray"
import { compareDates } from "../../../functions/types/moist/compareDates"
import { getSetAddCommentItemShowed } from "../../../functions/types/moist/getSetAddCommentItemShowed"
import { handleResizeForChartLegend } from "../../../functions/types/moist/handleResizeForChartLegend"
import {getDaysFromChartData} from "../../../functions/getDaysFromChartData";
import {setDynamicChartHeight} from "../../../functions/chartHeightCalculator";
import { formatDate } from "../../../functions/formatDate";
import { useAppContext } from "../../../../../context/AppContext";
import { useHistory } from 'react-router-dom';
import { loadChartPreferences } from "../../../../../utils/chartPreferences";
import { TimeSeriesDataItem } from "../../../../../types/api";
import { debugLog } from "../../../../../utils/debugConfig";
import {loadGoogleApi} from "@/functions/loadGoogleApiFunc";

// Define TypeScript interfaces
type ChartDataItem = TimeSeriesDataItem;

interface BudgetLine {
  value: number;
  label: string;
}

interface ChartData {
  data: ChartDataItem[]
  budgetLines?: BudgetLine[]
  metric?: string
}

interface ChartResponse {
  data: ChartData
  status?: number
}

interface CommentsResponse {
  data: Comment[]
  status?: number
}

interface Comment {
  id: string
  date: string
  text: string
  userId: string | number
  [key: string]: unknown
}


interface SetCommentModalParams {
  isOpen: boolean
  date?: number
  value?: number
  sensorId?: string | number
  type?: string
}

interface AdditionalChartData {
  linesCount: number
  legend: object
}

interface TabularDataState {
  data: Record<string, unknown>[] | null
  isLoading: boolean
  colors: string[]
}

interface TabularDataStateMap {
  main: TabularDataState
  sum: TabularDataState
  soilTemp: TabularDataState
}

interface CommentsState {
  main: Comment[] | undefined
  sum: Comment[] | undefined
  soilTemp: Comment[] | undefined
  battery: Comment[] | undefined
}

interface AddCommentItemState {
  main: boolean
  sum: boolean
  soilTemp: boolean
  battery: boolean
}

interface ScreenSizeState {
  small: boolean
  middle: boolean
  large: boolean
}

interface CommentModal {
  type: string
  date: string | number | Date
}

// Chart type constants
const CHART_TYPES = {
  MAIN: "main",
  SUM: "sum",
  SOIL_TEMP: "soilTemp",
  BATTERY: "battery",
}

// Chart codes
const CHART_CODES = {
  MAIN: "m",
  SOIL_TEMP: "mst",
  SUM: "mSum",
}

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_ARRAY: any[] = [];

interface MoistChartPageProps {
  sensorId: string;
  userId: string | number;
  additionalChartData: AdditionalChartData;
  autowater: boolean;
  setAutowater: (value: boolean) => void;
  setValveSettings?: (value: boolean) => void;
  setChartPageType?: (value: string) => void;
  setSiteId?: (value: string) => void;
  setSettingsOddBack?: (value: boolean) => void;
  setAlarm?: (value: boolean) => void;
  [key: string]: unknown;
}

export const MoistChartPage = (props: MoistChartPageProps) => {
  const { setPage, setBudgetEditorReturnPage, pushToNavigationHistory } = useAppContext();
  const history = useHistory();

  // Chart refs - amCharts Root refs
  const root = useRef<am5.Root | null>(null)
  const batteryRoot = useRef<am5.Root | null>(null)
  const soilTempRoot = useRef<am5.Root | null>(null)
  const sumRoot = useRef<am5.Root | null>(null)

  // Date state - Load saved preference from storage
  const currentDate: string = getCurrentDatetime()
  const savedPreferences = loadChartPreferences()
  const savedDays = Number(savedPreferences.dateDifferenceInDays) || 14

  const [dateDifferenceInDays, setDateDifferenceInDays] = useState<number>(savedDays)

  // Calculate initial start date based on saved preference
  const initialStartDate = (() => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - savedDays);
    return getDatetime(date);
  })()

  const [startDate, setStartDate] = useState<string>(initialStartDate)
  const [endDate, setEndDate] = useState<string>(currentDate)

  // Initialize currentDates with saved preference so initial server request uses correct date range
  const [currentDates, setCurrentDates] = useState<string[]>(() => {
    const endDateFormatted = formatDate(new Date(currentDate));
    return [savedDays.toString(), endDateFormatted];
  })

  // Chart data state
  const [currentChartData, setCurrentChartData] = useState<ChartDataItem[]>([])
  const [irrigationDates, setIrrigationDates] = useState<string[]>([])
  const [fullDatesArray, setFullDatesArray] = useState<string[] | undefined>()
  const [currentSumChartData, setCurrentSumChartData] = useState<ChartData>({ data: [] })
  const [currentSoilTempChartData, setCurrentSoilTempChartData] = useState<ChartData>({ data: [] })
  const [currentBatteryChartData, setCurrentBatteryChartData] = useState<ChartData>({ data: [] })
  const [newDaysData, setNewDaysData] = useState<{days?: number; newEndDateFormatted?: string; endDatetime?: string}>({})

  // UI state
  const [disableNextButton, setDisableNextButton] = useState<boolean>(true)
  const [disablePrevButton, setDisablePrevButton] = useState<boolean>(true)
  const [isIrrigationButtons, setIsIrrigationButtons] = useState<boolean>(true)
  const [isIrrigationDataIsLoading, setIsIrrigationDataIsLoading] = useState<boolean>(false)
  const [comparingMode, setComparingMode] = useState<boolean>(false)
  const [historicMode, setHistoricMode] = useState<boolean>(false)
  const [showForecast, setShowForecast] = useState<boolean>(true)
  const [isMoistCommentsShowed, setIsMoistCommentsShowed] = useState<boolean>(false)
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false)

  // Chart visibility state
  const [batteryChartShowed, setBatteryChartShowed] = useState<boolean>(false)
  const [soilTempChartShowed, setSoilTempChartShowed] = useState<boolean>(false)

  // Tabular data state - consolidated into objects
  const [tabularData, setTabularData] = useState<TabularDataStateMap>({
    main: { data: null, isLoading: false, colors: [] },
    sum: { data: null, isLoading: false, colors: [] },
    soilTemp: { data: null, isLoading: false, colors: [] },
  })

  // Comments state - consolidated into objects
  const [comments, setComments] = useState<CommentsState>({
    main: undefined,
    sum: undefined,
    soilTemp: undefined,
    battery: undefined,
  })

  // Comment UI state - consolidated into objects
  const [addCommentItemShowed, setAddCommentItemShowed] = useState<AddCommentItemState>({
    main: false,
    sum: false,
    soilTemp: false,
    battery: false,
  })

  // Modal state
  const [moistAddCommentModal, setMoistAddCommentModal] = useState<CommentModal | undefined>(undefined)

  // Wrapper function to adapt setMoistAddCommentModal to the expected type
  const setMoistAddCommentModalWrapper = (params: SetCommentModalParams | ((prev: CommentModal | undefined) => CommentModal | undefined)) => {
    if (typeof params === 'function') {
      setMoistAddCommentModal(prev => {
        const result = params(prev);
        return result ? { type: result.type, date: result.date } : undefined;
      });
    } else {
      setMoistAddCommentModal({ type: params.type || '', date: params.date || 0 });
    }
  };

  // Wrapper function to adapt updateCommentsArray to the expected type
  const updateCommentsArrayWrapper = ((type: string, _data?: unknown) => {
    // Call updateCommentsArray with the appropriate parameters
    if (type === 'main') {
      updateCommentsArray('M', props.sensorId as any, updateComments, currentChartData);
    } else if (type === 'sum') {
      updateCommentsArray('MSum', props.sensorId as any, updateComments, currentSumChartData.data);
    } else if (type === 'soilTemp') {
      updateCommentsArray('MST', props.sensorId as any, updateComments, currentSoilTempChartData.data);
    } else if (type === 'battery') {
      updateCommentsArray('MBattery', props.sensorId as any, updateComments, currentBatteryChartData.data);
    }
  }) as any;

  // Responsive design state
  const [screenSize, setScreenSize] = useState<ScreenSizeState>({
    small: false,
    middle: false,
    large: false,
  })

  // Helper function to update tabular data
  const updateTabularData = (type: keyof TabularDataStateMap, updates: Partial<TabularDataState>): void => {
    setTabularData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...updates,
      },
    }))
  }

  // Helper function to update comments
  const updateComments = (type: keyof CommentsState, data: Comment[] | undefined): void => {
    setComments((prev) => ({
      ...prev,
      [type]: data,
    }))
  }

  // Helper function to update comment UI state
  const updateAddCommentItemShowed = (type: keyof AddCommentItemState, value: boolean): void => {
    setAddCommentItemShowed((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  // Memoized resize handler
  const handleResize = useCallback(() => {
    setDynamicChartHeight('mainChart')
    setDynamicChartHeight('sumChart')
    handleResizeForChartLegend({
      additionalChartData: props.additionalChartData,
      smallScreen: screenSize.small,
      setSmallScreen: (value: boolean) => setScreenSize((prev) => ({ ...prev, small: value })),
      middleScreen: screenSize.middle,
      setMiddleScreen: (value: boolean) => setScreenSize((prev) => ({ ...prev, middle: value })),
      largeScreen: screenSize.large,
      setLargeScreen: (value: boolean) => setScreenSize((prev) => ({ ...prev, large: value })),
    })
  }, [screenSize, props.additionalChartData])

  const updateChart = useCallback(
    async (
      typeOfChart: string,
      updateReason?: string,
      days?: number,
      endDateDays?: string,
      endDatetime?: string,
    ): Promise<void> => {
      const fetchComments = async (chartType: string, data: ChartDataItem[]): Promise<Comment[]> => {
        let apiChartType: string
        let commentType: keyof CommentsState
        let currentData: ChartDataItem[] | undefined
        switch (chartType) {
          case CHART_TYPES.MAIN:
            apiChartType = "M"
            commentType = "main"
            currentData = currentChartData
            break
          case CHART_TYPES.SOIL_TEMP:
            apiChartType = "MST"
            commentType = "soilTemp"
            currentData = currentSoilTempChartData.data
            break
          case CHART_TYPES.SUM:
            apiChartType = "MSum"
            commentType = "sum"
            currentData = currentSumChartData.data
            break
          case CHART_TYPES.BATTERY:
            apiChartType = "MBattery"
            commentType = "battery"
            currentData = currentBatteryChartData.data
            break
          default:
            apiChartType = "M"
            commentType = "main"
        }
        if (data) {
          currentData = data
        }
        const response: CommentsResponse = await getComments(apiChartType, props.sensorId, getDaysFromChartData(currentData))
        updateComments(commentType, response.data)
        return response.data
      }

      if (typeOfChart === CHART_TYPES.MAIN) {
        if (updateReason === "comments") {
          const newCommentData: Comment[] = await fetchComments(CHART_TYPES.MAIN, currentChartData)
          createMainChart({
            data: currentChartData,
            sensorId: props.sensorId,
            updateComments: () => updateComments("main", undefined),
            userId: String(props.userId),
            root,
            fullDatesArray: fullDatesArray ? fullDatesArray.map(d => new Date(d)) : false,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal: (params: SetCommentModalParams) => setMoistAddCommentModal({ type: params.type || '', date: params.date || 0 }),
            moistMainAddCommentItemShowed: typeof addCommentItemShowed.main === 'boolean' ? addCommentItemShowed.main : false,
            moistMainComments: newCommentData.map(c => ({ ...c, comment: c.text })),
            updateCommentsArray: updateCommentsArray as any,
            isMoistCommentsShowed,
            setMoistMainTabularDataColors: (colors: string[]) => updateTabularData("main", { colors }),
            smallScreen: screenSize.small,
            middleScreen: screenSize.middle,
            largeScreen: screenSize.large,
          })
        } else if (updateReason === "dates") {
          const newMoistChartData: ChartResponse = await getMoistMainChartData(
            props.sensorId,
            historicMode,
            days,
            endDateDays,
          )
          let dataEndDate = new Date(newMoistChartData.data.data[newMoistChartData.data.data.length - 1].DateTime).getTime()
          const dataStartDate = new Date(newMoistChartData.data.data[0].DateTime).getTime()
          if (historicMode) {
            const lastIndex = newMoistChartData.data.data.findIndex((dataItem: Record<string, unknown>) => dataItem['MS 1'] === undefined)
            if (lastIndex === -1) {
              dataEndDate = new Date(newMoistChartData.data.data[newMoistChartData.data.data.length - 1].DateTime).getTime()
            } else {
              dataEndDate = new Date(newMoistChartData.data.data[lastIndex - 1].DateTime).getTime()
            }
          }
          if (isIrrigationButtons) {
            if (dataEndDate < new Date(new Date(fullDatesArray[fullDatesArray.length - 1]).setHours(0, 0, 0, 0)).getTime()) {
              setDisableNextButton(false)
            }
            if (dataEndDate >= new Date(new Date(fullDatesArray[fullDatesArray.length - 1]).setHours(0, 0, 0, 0)).getTime()) {
              setDisableNextButton(true)
            }
            if (dataStartDate < new Date(new Date(fullDatesArray[0]).setHours(0, 0, 0, 0)).getTime()) {
              setDisablePrevButton(true)
            }
            if (dataStartDate >= new Date(new Date(fullDatesArray[0]).setHours(0, 0, 0, 0)).getTime()) {
              setDisablePrevButton(false)
            }
          }
          setCurrentChartData(newMoistChartData.data.data)

          if (isMoistCommentsShowed) {
            // Load comments with the new data directly
            const newCommentData: Comment[] = await fetchComments(CHART_TYPES.MAIN, newMoistChartData.data.data)
            createMainChart({
              data: newMoistChartData.data.data,
              sensorId: props.sensorId,
              updateComments: () => updateComments("main", undefined),
              userId: String(props.userId),
              root,
              fullDatesArray: fullDatesArray ? fullDatesArray.map(d => new Date(d)) : false,
              additionalChartData: props.additionalChartData,
              comparingMode,
              isNewDates: true,
              historicMode,
              showForecast: compareDates(Number(endDatetime || 0)),
              setMoistAddCommentModal: (params: SetCommentModalParams) => setMoistAddCommentModal({ type: params.type || '', date: params.date || 0 }),
              moistMainAddCommentItemShowed: typeof addCommentItemShowed.main === 'boolean' ? addCommentItemShowed.main : false,
              moistMainComments: newCommentData.map(c => ({ ...c, comment: c.text })),
              updateCommentsArray: updateCommentsArray as any,
              isMoistCommentsShowed,
            })
          } else {
            createMainChart({
              data: newMoistChartData.data.data,
              sensorId: props.sensorId,
              updateComments: () => updateComments("main", undefined),
              userId: String(props.userId),
              root,
              fullDatesArray: fullDatesArray ? fullDatesArray.map(d => new Date(d)) : false,
              additionalChartData: props.additionalChartData,
              comparingMode,
              isNewDates: true,
              historicMode,
              showForecast: compareDates(Number(endDatetime || 0)),
              setMoistAddCommentModal: (params: SetCommentModalParams) => setMoistAddCommentModal({ type: params.type || '', date: params.date || 0 }),
              moistMainAddCommentItemShowed: typeof addCommentItemShowed.main === 'boolean' ? addCommentItemShowed.main : false,
              moistMainComments: comments.main ? comments.main.map(c => ({ ...c, comment: c.text })) : [],
              updateCommentsArray: updateCommentsArray as any,
              isMoistCommentsShowed,
            })
          }
        } else if (updateReason === "sameData") {
          createMainChart({
            data: currentChartData,
            sensorId: props.sensorId,
            updateComments: () => updateComments("main", undefined),
            userId: String(props.userId),
            root,
            fullDatesArray: fullDatesArray ? fullDatesArray.map(d => new Date(d)) : false,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal: (params: SetCommentModalParams) => setMoistAddCommentModal({ type: params.type || '', date: params.date || 0 }),
            moistMainAddCommentItemShowed: typeof addCommentItemShowed.main === 'boolean' ? addCommentItemShowed.main : false,
            moistMainComments: comments.main ? comments.main.map(c => ({ ...c, comment: c.text })) : [],
            updateCommentsArray: updateCommentsArray as any,
            isMoistCommentsShowed,
            setMoistMainTabularDataColors: (colors: string[]) => updateTabularData("main", { colors }),
            smallScreen: screenSize.small,
            middleScreen: screenSize.middle,
            largeScreen: screenSize.large,
          })
        } else {
          const newData: ChartResponse = await getMoistMainChartData(
            props.sensorId,
            historicMode,
            Number(currentDates[0]),
            currentDates[1],
          )
          setCurrentChartData(newData.data.data)

          createMainChart({
            data: newData.data.data,
            sensorId: props.sensorId,
            updateComments: () => updateComments("main", undefined),
            userId: String(props.userId),
            root,
            fullDatesArray: fullDatesArray ? fullDatesArray.map(d => new Date(d)) : false,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal: (params: SetCommentModalParams) => setMoistAddCommentModal({ type: params.type || '', date: params.date || 0 }),
            moistMainAddCommentItemShowed: typeof addCommentItemShowed.main === 'boolean' ? addCommentItemShowed.main : false,
            moistMainComments: comments.main ? comments.main.map(c => ({ ...c, comment: c.text })) : [],
            updateCommentsArray: updateCommentsArray as any,
            isMoistCommentsShowed,
            setMoistMainTabularDataColors: (colors: string[]) => updateTabularData("main", { colors }),
            smallScreen: screenSize.small,
            middleScreen: screenSize.middle,
            largeScreen: screenSize.large,
          })
        }
      }

      else if (typeOfChart === CHART_TYPES.SUM) {
        if (updateReason === "comments") {
          const newComments: Comment[] = await fetchComments(CHART_TYPES.SUM, currentSumChartData.data)
          createAdditionalChart(
            "sum",
            currentSumChartData.data,
            sumRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("sum", undefined),
            addCommentItemShowed.sum,
            newComments,
            props.userId,
            () => updateChart(CHART_TYPES.SUM, 'comments'),
            isMoistCommentsShowed,
            currentSumChartData.budgetLines,
            historicMode,
            showForecast,
            (colors: string[]) => updateTabularData("sum", { colors })
          )
        } else if (updateReason === "dates") {
          const newSumChartData: ChartResponse = await getSumChartData(props.sensorId, historicMode, days, endDateDays)
          setCurrentSumChartData(newSumChartData.data)

          if (isMoistCommentsShowed) {
            // Load comments with the new data directly
            const newComments: Comment[] = await fetchComments(CHART_TYPES.SUM, newSumChartData.data.data)
            createAdditionalChart(
              "sum",
              newSumChartData.data.data,
              sumRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("sum", undefined),
              addCommentItemShowed.sum,
              newComments,
              props.userId,
              () => updateChart(CHART_TYPES.SUM, 'dates'),
              isMoistCommentsShowed,
              newSumChartData.data.budgetLines,
              historicMode,
              showForecast,
              (colors: string[]) => updateTabularData("sum", { colors }),
            )
          } else {
            createAdditionalChart(
              "sum",
              newSumChartData.data.data,
              sumRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("sum", undefined),
              addCommentItemShowed.sum,
              comments.sum,
              props.userId,
              () => updateChart(CHART_TYPES.SUM, 'dates'),
              isMoistCommentsShowed,
              newSumChartData.data.budgetLines,
              historicMode,
              showForecast,
              (colors: string[]) => updateTabularData("sum", { colors }),
            )
          }
        } else if (updateReason === "sameData") {
          createAdditionalChart(
            "sum",
            currentSumChartData.data,
            sumRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("sum", undefined),
            addCommentItemShowed.sum,
            comments.sum,
            props.userId,
            () => updateChart(CHART_TYPES.SUM, 'sameData'),
            isMoistCommentsShowed,
            currentSumChartData.budgetLines,
            historicMode,
            showForecast,
            (colors: string[]) => updateTabularData("sum", { colors })
          )
        } else {
          const newData: ChartResponse = await getSumChartData(
            props.sensorId,
            historicMode,
            Number(currentDates[0]),
            currentDates[1],
          )
          setCurrentSumChartData(newData.data)
          createAdditionalChart(
            "sum",
            newData.data.data,
            sumRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("sum", undefined),
            addCommentItemShowed.sum,
            comments.sum,
            props.userId,
            () => updateChart(CHART_TYPES.SUM),
            isMoistCommentsShowed,
            newData.data.budgetLines,
            historicMode,
            showForecast,
            (colors: string[]) => updateTabularData("sum", { colors })
          )
        }
      }

      else if (typeOfChart === CHART_TYPES.SOIL_TEMP) {
        if (updateReason === "comments") {
          const newComments: Comment[] = await fetchComments(CHART_TYPES.SOIL_TEMP, currentSoilTempChartData.data)

          createAdditionalChart(
            "soilTemp",
            currentSoilTempChartData.data,
            soilTempRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("soilTemp", undefined),
            addCommentItemShowed.soilTemp,
            newComments,
            props.userId,
            () => updateChart(CHART_TYPES.SOIL_TEMP, 'comments'),
            isMoistCommentsShowed,
            undefined,
            undefined,
            undefined,
            undefined,
            props.additionalChartData.linesCount,
            currentSoilTempChartData.metric,
            (colors: string[]) => updateTabularData("soilTemp", { colors }),
          )
        } else if (updateReason === "dates") {
          const newSoilTempChartData: ChartResponse = await getSoilTempChartData(props.sensorId, days, endDateDays)
          setCurrentSoilTempChartData(newSoilTempChartData.data)

          if (isMoistCommentsShowed) {
            // Load comments with the new data directly
            const newComments: Comment[] = await fetchComments(CHART_TYPES.SOIL_TEMP, newSoilTempChartData.data.data)
            createAdditionalChart(
              "soilTemp",
              newSoilTempChartData.data.data,
              soilTempRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("soilTemp", undefined),
              addCommentItemShowed.soilTemp,
              newComments,
              props.userId,
              () => updateChart(CHART_TYPES.SOIL_TEMP, 'dates'),
              isMoistCommentsShowed,
              undefined,
              undefined,
              undefined,
              undefined,
              props.additionalChartData.linesCount,
              newSoilTempChartData.data.metric,
              (colors: string[]) => updateTabularData("soilTemp", { colors }),
            )
          } else {
            createAdditionalChart(
              "soilTemp",
              newSoilTempChartData.data.data,
              soilTempRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("soilTemp", undefined),
              addCommentItemShowed.soilTemp,
              comments.soilTemp,
              props.userId,
              () => updateChart(CHART_TYPES.SOIL_TEMP, 'dates'),
              isMoistCommentsShowed,
              undefined,
              undefined,
              undefined,
              undefined,
              props.additionalChartData.linesCount,
              newSoilTempChartData.data.metric,
              (colors: string[]) => updateTabularData("soilTemp", { colors }),
            )
          }
        } else if (updateReason === "sameData") {
          createAdditionalChart(
            "soilTemp",
            currentSoilTempChartData.data,
            soilTempRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("soilTemp", undefined),
            addCommentItemShowed.soilTemp,
            comments.soilTemp,
            props.userId,
            () => updateChart(CHART_TYPES.SOIL_TEMP, 'sameData'),
            isMoistCommentsShowed,
            undefined,
            undefined,
            undefined,
            undefined,
            props.additionalChartData.linesCount,
            currentSoilTempChartData.metric,
            (colors: string[]) => updateTabularData("soilTemp", { colors }),
          )
        } else {
          const newSoilTempChartData: ChartResponse = await getSoilTempChartData(
            props.sensorId,
            Number(currentDates[0]),
            currentDates[1],
          )
          setCurrentSoilTempChartData(newSoilTempChartData.data)

          if (isMoistCommentsShowed) {
            // Load comments with the new data
            const newComments: Comment[] = await fetchComments(CHART_TYPES.SOIL_TEMP, newSoilTempChartData.data.data)
            createAdditionalChart(
              "soilTemp",
              newSoilTempChartData.data.data,
              soilTempRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("soilTemp", undefined),
              addCommentItemShowed.soilTemp,
              newComments,
              props.userId,
              () => updateChart(CHART_TYPES.SOIL_TEMP),
              isMoistCommentsShowed,
              undefined,
              undefined,
              undefined,
              undefined,
              props.additionalChartData.linesCount,
              newSoilTempChartData.data.metric,
              (colors: string[]) => updateTabularData("soilTemp", { colors }),
            )
          } else {
            createAdditionalChart(
              "soilTemp",
              newSoilTempChartData.data.data,
              soilTempRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("soilTemp", undefined),
              addCommentItemShowed.soilTemp,
              comments.soilTemp,
              props.userId,
              () => updateChart(CHART_TYPES.SOIL_TEMP),
              isMoistCommentsShowed,
              undefined,
              undefined,
              undefined,
              undefined,
              props.additionalChartData.linesCount,
              newSoilTempChartData.data.metric,
              (colors: string[]) => updateTabularData("soilTemp", { colors }),
            )
          }
        }
      }

      else if (typeOfChart === CHART_TYPES.BATTERY) {
        if (updateReason === "comments") {
          const newComments: Comment[] = await fetchComments(CHART_TYPES.BATTERY, currentBatteryChartData.data)
          createAdditionalChart(
            "battery",
            currentBatteryChartData.data,
            batteryRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("battery", undefined),
            addCommentItemShowed.battery,
            newComments,
            props.userId,
            () => updateChart(CHART_TYPES.BATTERY, 'comments'),
            isMoistCommentsShowed,
          )
        } else if (updateReason === "dates") {
          const newBatteryChartData: ChartResponse = await getBatteryChartData(props.sensorId, days, endDateDays)
          setCurrentBatteryChartData(newBatteryChartData.data)

          if (isMoistCommentsShowed) {
            // Load comments with the new data directly
            const newComments: Comment[] = await fetchComments(CHART_TYPES.BATTERY, newBatteryChartData.data.data)
            createAdditionalChart(
              "battery",
              newBatteryChartData.data.data,
              batteryRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("battery", undefined),
              addCommentItemShowed.battery,
              newComments,
              props.userId,
              () => updateChart(CHART_TYPES.BATTERY),
              isMoistCommentsShowed,
            )
          } else {
            createAdditionalChart(
              "battery",
              newBatteryChartData.data.data,
              batteryRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("battery", undefined),
              addCommentItemShowed.battery,
              comments.battery,
              props.userId,
              () => updateChart(CHART_TYPES.BATTERY),
              isMoistCommentsShowed,
            )
          }
        } else if (updateReason === 'sameData') {
          createAdditionalChart(
            "battery",
            currentBatteryChartData.data,
            batteryRoot,
            setMoistAddCommentModalWrapper,
            updateCommentsArrayWrapper,
            props.sensorId,
            () => updateComments("battery", undefined),
            addCommentItemShowed.battery,
            comments.battery,
            props.userId,
            () => updateChart(CHART_TYPES.BATTERY, 'sameData'),
            isMoistCommentsShowed,
          )
        } else {
          const newBatteryChartData: ChartResponse = await getBatteryChartData(
            props.sensorId,
            Number(currentDates[0]),
            currentDates[1],
          )
          setCurrentBatteryChartData(newBatteryChartData.data)

          if (isMoistCommentsShowed) {
            // Load comments with the new data
            const newComments: Comment[] = await fetchComments(CHART_TYPES.BATTERY, newBatteryChartData.data.data)
            createAdditionalChart(
              "battery",
              newBatteryChartData.data.data,
              batteryRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("battery", undefined),
              addCommentItemShowed.battery,
              newComments,
              props.userId,
              () => updateChart(CHART_TYPES.BATTERY),
              isMoistCommentsShowed,
            )
          } else {
            createAdditionalChart(
              "battery",
              newBatteryChartData.data.data,
              batteryRoot,
              setMoistAddCommentModalWrapper,
              updateCommentsArrayWrapper,
              props.sensorId,
              () => updateComments("battery", undefined),
              addCommentItemShowed.battery,
              comments.battery,
              props.userId,
              () => updateChart(CHART_TYPES.BATTERY),
              isMoistCommentsShowed,
            )
          }
        }
      }
    },
    [
      currentChartData,
      fullDatesArray,
      comparingMode,
      historicMode,
      showForecast,
      currentDates,
      comments,
      isMoistCommentsShowed,
      screenSize,
      addCommentItemShowed,
    ],
  )

  useEffect(() => {
    getIrrigationDates(
      setIsIrrigationDataIsLoading,
      setIsIrrigationButtons,
      Number(props.userId),
      props.sensorId,
      setIrrigationDates,
      setFullDatesArray,
      startDate,
      setDisablePrevButton,
    )
    setDynamicChartHeight('mainChart')
    setDynamicChartHeight('sumChart')
  }, [])

  useEffect(() => {
    if (fullDatesArray !== undefined) {
      updateChart(CHART_TYPES.MAIN)
      updateChart(CHART_TYPES.SUM)
    }
  }, [fullDatesArray])

  useEffect(() => {
    debugLog.comments(`[MoistChartPage useEffect] isMoistCommentsShowed changed to: ${isMoistCommentsShowed}`);
    debugLog.comments(`[MoistChartPage useEffect] fullDatesArray defined: ${fullDatesArray !== undefined}, isLoadingComments: ${isLoadingComments}`);

    if (fullDatesArray !== undefined && !isLoadingComments) {
      if (isMoistCommentsShowed) {
        debugLog.comments('[MoistChartPage useEffect] Comments ENABLED - Starting to load comments for all charts');
        debugLog.comments(`[MoistChartPage useEffect] Battery chart showed: ${batteryChartShowed}, Soil temp showed: ${soilTempChartShowed}`);

        // Prevent multiple simultaneous calls
        setIsLoadingComments(true)

        // Use startTransition to defer heavy chart updates and keep UI responsive
        startTransition(() => {
          // Execute chart updates with delays between each to yield to the browser
          const updateChartsWithDelay = async () => {
            try {
              debugLog.comments('[MoistChartPage] Updating MAIN chart with comments...');
              await updateChart(CHART_TYPES.MAIN, 'comments')
              debugLog.comments('[MoistChartPage] MAIN chart updated with comments');
              // Yield to browser to process UI updates
              await new Promise(resolve => setTimeout(resolve, 100))

              debugLog.comments('[MoistChartPage] Updating SUM chart with comments...');
              await updateChart(CHART_TYPES.SUM, 'comments')
              debugLog.comments('[MoistChartPage] SUM chart updated with comments');
              // Yield to browser to process UI updates
              await new Promise(resolve => setTimeout(resolve, 100))

              if (soilTempChartShowed) {
                debugLog.comments('[MoistChartPage] Updating SOIL TEMP chart with comments...');
                await updateChart(CHART_TYPES.SOIL_TEMP, 'comments')
                debugLog.comments('[MoistChartPage] SOIL TEMP chart updated with comments');
                await new Promise(resolve => setTimeout(resolve, 100))
              }
              if (batteryChartShowed) {
                debugLog.comments('[MoistChartPage] Updating BATTERY chart with comments...');
                await updateChart(CHART_TYPES.BATTERY, 'comments')
                debugLog.comments('[MoistChartPage] BATTERY chart updated with comments');
              }
              debugLog.comments('[MoistChartPage] All charts updated with comments successfully');
            } catch (error) {
              debugLog.commentsError('[MoistChartPage] Error updating charts with comments:', error);
            } finally {
              setIsLoadingComments(false)
              debugLog.comments('[MoistChartPage] Finished loading comments, isLoadingComments set to false');
            }
          }

          updateChartsWithDelay()
        })
      } else {
        debugLog.comments('[MoistChartPage useEffect] Comments DISABLED - Updating charts without comments');
        // When disabling comments, use startTransition as well
        startTransition(() => {
          debugLog.comments('[MoistChartPage] Updating MAIN chart (sameData)...');
          updateChart(CHART_TYPES.MAIN, 'sameData')
          debugLog.comments('[MoistChartPage] Updating SUM chart (sameData)...');
          updateChart(CHART_TYPES.SUM, 'sameData')
          if (soilTempChartShowed) {
            debugLog.comments('[MoistChartPage] Updating SOIL TEMP chart (sameData)...');
            updateChart(CHART_TYPES.SOIL_TEMP, 'sameData')
          }
          if (batteryChartShowed) {
            debugLog.comments('[MoistChartPage] Updating BATTERY chart (sameData)...');
            updateChart(CHART_TYPES.BATTERY, 'sameData')
          }
          debugLog.comments('[MoistChartPage] All charts updated without comments');
        })
      }
    } else {
      if (fullDatesArray === undefined) {
        debugLog.comments('[MoistChartPage useEffect] Skipping - fullDatesArray is undefined');
      }
      if (isLoadingComments) {
        debugLog.comments('[MoistChartPage useEffect] Skipping - already loading comments');
      }
    }
  }, [isMoistCommentsShowed])

  // Update charts when add comment mode changes
  useEffect(() => {
    if (currentChartData.length > 0) {
      setDynamicChartHeight('mainChart')
      updateChart(CHART_TYPES.MAIN, 'sameData')
    }
  }, [addCommentItemShowed.main])
  useEffect(() => {
    if (currentChartData.length > 0) {
      setDynamicChartHeight('sumChart')
      updateChart(CHART_TYPES.SUM, 'sameData')
    }
  }, [addCommentItemShowed.sum])
  useEffect(() => {
    if (currentChartData.length > 0) {
      updateChart(CHART_TYPES.SOIL_TEMP, 'sameData')
    }
  }, [addCommentItemShowed.soilTemp])
  useEffect(() => {
    if (currentChartData.length > 0) {
      updateChart(CHART_TYPES.BATTERY, 'sameData')
    }
  }, [addCommentItemShowed.battery])

  useEffect(() => {
    if (fullDatesArray !== undefined) {
      updateChart(CHART_TYPES.MAIN)
      updateChart(CHART_TYPES.SUM)
    }
  }, [historicMode]);
  useEffect(() => {
    if (fullDatesArray !== undefined) {
      updateChart(CHART_TYPES.MAIN, 'sameData')
    }
  }, [comparingMode]);
  useEffect(() => {
    if (newDaysData.days) {
      updateChart('main', 'dates', newDaysData.days, newDaysData.newEndDateFormatted, newDaysData.endDatetime)
      updateChart('sum', 'dates', newDaysData.days, newDaysData.newEndDateFormatted, newDaysData.endDatetime)
      if (soilTempChartShowed) {
        updateChart('soilTemp', 'dates', newDaysData.days, newDaysData.newEndDateFormatted, newDaysData.endDatetime)
      }
      if (batteryChartShowed) {
        updateChart('battery', 'dates', newDaysData.days, newDaysData.newEndDateFormatted, newDaysData.endDatetime)
      }
    }
  }, [showForecast, newDaysData]);

  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])
  useEffect(() => {
    updateChart(CHART_TYPES.MAIN)
  }, [screenSize])
  useEffect(() => {
    setDynamicChartHeight('mainChart')
  }, [tabularData.main]);
  useEffect(() => {
    setDynamicChartHeight('sumChart')
  }, [tabularData.sum]);

  return (
    <IonContent className={s.container}>
      <div className={s.wrapper}>
        <div data-chart-section="top">
          <TopSection
            userId={props.userId}
            sensorId={props.sensorId}
            root={root}
            fullDatesArray={fullDatesArray}
            setCurrentChartData={setCurrentChartData}
            setDisableNextButton={setDisableNextButton}
            setDisablePrevButton={setDisablePrevButton}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            additionalChartData={props.additionalChartData}
            type={"moist"}
            setBatteryChartShowed={setBatteryChartShowed}
            batteryChartShowed={batteryChartShowed}
            batteryRoot={batteryRoot}
            sumRoot={sumRoot}
            setCurrentDates={setCurrentDates}
            setComparingMode={setComparingMode}
            setHistoricMode={setHistoricMode}
            setAlarm={props.setAlarm}
            setSoilTempChartShowed={setSoilTempChartShowed}
            soilTempChartShowed={soilTempChartShowed}
            updateChart={updateChart}
            setIsCommentsShowed={setIsMoistCommentsShowed}
            isCommentsShowed={isMoistCommentsShowed}
            dateDifferenceInDays={dateDifferenceInDays}
            setDateDifferenceInDays={setDateDifferenceInDays}
            setShowForecast={setShowForecast}
            setNewDaysData={setNewDaysData}
          />
        </div>

        <div>
          {/* Soil Temperature Chart Section */}
          <div style={{display: soilTempChartShowed ? 'block' : 'none'}} className="ion-margin-top">
            <h2 className="ion-text-center">Soil Temperature</h2>
            <div className={s.additionalButtons}>
              <ButtonAndSpinner
                data={tabularData.soilTemp.data}
                setData={(data: any) => updateTabularData("soilTemp", {data})}
                setIsLoading={(isLoading: boolean) => updateTabularData("soilTemp", {isLoading})}
                sensorId={props.sensorId}
                chartCode={CHART_CODES.SOIL_TEMP}
                isLoading={tabularData.soilTemp.isLoading}
              />
              <Export chartCode={CHART_CODES.SOIL_TEMP} sensorId={props.sensorId} userId={props.userId}/>
              <AddCommentButton
                addCommentItemShowed={addCommentItemShowed.soilTemp}
                setAddCommentItemShowed={(value: boolean) => updateAddCommentItemShowed("soilTemp", value)}
                isCommentsShowed={isMoistCommentsShowed}
                setIsCommentsShowed={setIsMoistCommentsShowed}
              />
            </div>

            <AddCommentMessage
              type={CHART_TYPES.SOIL_TEMP}
              addCommentItemShowed={addCommentItemShowed.soilTemp}
              setAddCommentModal={setMoistAddCommentModal}
            />

            <TabularData
              type="moistSoilTemp"
              sensorId={props.sensorId}
              colors={tabularData.soilTemp.colors}
              data={(tabularData.soilTemp.data as any) || EMPTY_ARRAY}
              setData={(data: any) => updateTabularData("soilTemp", {data})}
              chartCode={CHART_CODES.SOIL_TEMP}
              isLoading={tabularData.soilTemp.isLoading}
              setIsLoading={(isLoading: boolean) => updateTabularData("soilTemp", {isLoading})}
            />

            <div className={s.additionalChart} id="soilTempChart"></div>
          </div>
          {/* Battery Chart Section */}
          <div style={{display: batteryChartShowed ? 'block' : 'none'}} className="ion-margin-top">
            <h2 className="ion-text-center">Battery Volts</h2>
            <div className={s.additionalButtons}>
              <AddCommentButton
                addCommentItemShowed={addCommentItemShowed.battery}
                setAddCommentItemShowed={(value: boolean) => updateAddCommentItemShowed("battery", value)}
                isCommentsShowed={isMoistCommentsShowed}
                setIsCommentsShowed={setIsMoistCommentsShowed}
              />
            </div>

            <AddCommentMessage
              type={CHART_TYPES.BATTERY}
              addCommentItemShowed={addCommentItemShowed.battery}
              setAddCommentModal={setMoistAddCommentModal}
            />

            <div className={s.additionalChart} id="batteryChart"></div>
          </div>

          {/* Main Soil Moisture Chart Section */}
          <div>
            <div data-chart-section="main-header">
              <h2 className="ion-text-center">Soil Moisture</h2>
              <div className={s.additionalButtons}>
                <ButtonAndSpinner
                  data={tabularData.main.data}
                  setData={(data: any) => updateTabularData("main", {data})}
                  setIsLoading={(isLoading: boolean) => updateTabularData("main", {isLoading})}
                  sensorId={props.sensorId}
                  chartCode={CHART_CODES.MAIN}
                  isLoading={tabularData.main.isLoading}
                />
                <Export chartCode={CHART_CODES.MAIN} sensorId={props.sensorId} userId={props.userId}/>
                <AddCommentButton
                  addCommentItemShowed={addCommentItemShowed.main}
                  setAddCommentItemShowed={(value: boolean) => updateAddCommentItemShowed("main", value)}
                  isCommentsShowed={isMoistCommentsShowed}
                  setIsCommentsShowed={setIsMoistCommentsShowed}
                />
                <IonButton className={s.autowaterButton} onClick={() => props.setAutowater(true)}>
                  Autowater
                </IonButton>
                <IonButton className={s.autowaterButton} onClick={() => {
                  pushToNavigationHistory('/chart', 2);
                  setBudgetEditorReturnPage('chart');
                  setPage(0);
                  history.push('/budget');
                }}>
                  Budget Lines Editor
                </IonButton>
              </div>

              <AddCommentMessage
                type={CHART_TYPES.MAIN}
                addCommentItemShowed={addCommentItemShowed.main}
                setAddCommentModal={setMoistAddCommentModal}
              />

              <TabularData
                type="moistMain"
                sensorId={props.sensorId}
                colors={tabularData.main.colors}
                data={(tabularData.main.data as any) || EMPTY_ARRAY}
                setData={(data: any) => updateTabularData("main", {data})}
                chartCode={CHART_CODES.MAIN}
                isLoading={tabularData.main.isLoading}
                setIsLoading={(isLoading: boolean) => updateTabularData("main", {isLoading})}
              />
            </div>

            <div className={s.chart} id="mainChart" ></div>

            <Autowater
              autowater={props.autowater}
              setValveSettings={props.setValveSettings}
              setChartPageType={props.setChartPageType}
              setSiteId={props.setSiteId}
              setSettingsOddBack={props.setSettingsOddBack}
              setAutowater={props.setAutowater}
              sensorId={props.sensorId}
            />
          </div>

          {/* Irrigation Buttons Section */}
          <IrrigationButtons
            isIrrigationDataIsLoading={isIrrigationDataIsLoading}
            isIrrigationButtons={isIrrigationButtons}
            currentChartData={currentChartData}
            irrigationDates={irrigationDates}
            disableNextButton={disableNextButton}
            disablePrevButton={disablePrevButton}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setDateDifferenceInDays={setDateDifferenceInDays}
            setCurrentDates={(dates: [number, string]) => setCurrentDates([String(dates[0]), dates[1]])}
            setShowForecast={setShowForecast}
            updateChartsWithDates={(params: { days?: number; newEndDateFormatted?: string; endDatetime?: number }) =>
              setNewDaysData({ ...params, endDatetime: params.endDatetime?.toString() })
            }
          />
        </div>

        {/* Sum Chart Section */}
        <div data-chart-section="sumHeader">
          <h2 className="ion-text-center ion-margin-top">Sum of Soil Moisture</h2>
          <div className={s.additionalButtons}>
            <ButtonAndSpinner
              data={tabularData.sum.data}
              setData={(data: any) => updateTabularData("sum", {data})}
              setIsLoading={(isLoading: boolean) => updateTabularData("sum", {isLoading})}
              sensorId={props.sensorId}
              chartCode={CHART_CODES.SUM}
              isLoading={tabularData.sum.isLoading}
            />
            <Export chartCode={CHART_CODES.SUM} sensorId={props.sensorId} userId={props.userId}/>
            <AddCommentButton
              addCommentItemShowed={addCommentItemShowed.sum}
              setAddCommentItemShowed={(value: boolean) => updateAddCommentItemShowed("sum", value)}
              isCommentsShowed={isMoistCommentsShowed}
              setIsCommentsShowed={setIsMoistCommentsShowed}
            />
          </div>

          <AddCommentMessage
            type={CHART_TYPES.SUM}
            addCommentItemShowed={addCommentItemShowed.sum}
            setAddCommentModal={setMoistAddCommentModal}
          />

          <TabularData
            type="moistSum"
            sensorId={props.sensorId}
            colors={tabularData.sum.colors}
            data={(tabularData.sum.data as any) || EMPTY_ARRAY}
            setData={(data: any) => updateTabularData("sum", {data})}
            chartCode={CHART_CODES.SUM}
            isLoading={tabularData.sum.isLoading}
            setIsLoading={(isLoading: boolean) => updateTabularData("sum", {isLoading})}
          />
        </div>
        <div id="sumChart" className={s.sumChart}></div>

        {/* Comment Modal */}
        {moistAddCommentModal && (
          <AddCommentModal
            type={moistAddCommentModal.type as 'main' | 'soilTemp' | 'sum' | 'temp' | 'battery'}
            userId={props.userId}
            sensorId={props.sensorId}
            addCommentModal={new Date(moistAddCommentModal.date)}
            setAddCommentModal={(_modal: boolean) => setMoistAddCommentModal(undefined)}
            setAddCommentItemShowed={getSetAddCommentItemShowed(
              moistAddCommentModal.type as 'main' | 'soilTemp' | 'sum' | 'temp' | 'battery',
              (value: boolean) => updateAddCommentItemShowed("main", value),
              (value: boolean) => updateAddCommentItemShowed("soilTemp", value),
              (value: boolean) => updateAddCommentItemShowed("sum", value),
              (value: boolean) => updateAddCommentItemShowed("battery", value),
            ) || ((_item: string) => {})}
            onCommentAdded={async () => {
              const type = moistAddCommentModal.type as 'main' | 'soilTemp' | 'sum' | 'temp' | 'battery'

              // First update comments array and refresh chart
              if (type === 'main') {
                await updateCommentsArray('M', props.sensorId as any, updateComments, currentChartData)
                await updateChart(CHART_TYPES.MAIN, 'comments')
              } else if (type === 'soilTemp') {
                await updateCommentsArray('MST', props.sensorId as any, updateComments, currentSoilTempChartData.data)
                await updateChart(CHART_TYPES.SOIL_TEMP, 'comments')
              } else if (type === 'sum') {
                await updateCommentsArray('MSum', props.sensorId as any, updateComments, currentSumChartData.data)
                await updateChart(CHART_TYPES.SUM, 'comments')
              } else if (type === 'battery') {
                await updateCommentsArray('MBattery', props.sensorId as any, updateComments, currentBatteryChartData.data)
                await updateChart(CHART_TYPES.BATTERY, 'comments')
              }

              // Then turn off add comment mode after chart is updated
              setTimeout(() => {
                if (type === 'main') {
                  updateAddCommentItemShowed("main", false)
                } else if (type === 'soilTemp') {
                  updateAddCommentItemShowed("soilTemp", false)
                } else if (type === 'sum') {
                  updateAddCommentItemShowed("sum", false)
                } else if (type === 'battery') {
                  updateAddCommentItemShowed("battery", false)
                }
              }, 100)
            }}
          />
        )}
      </div>
    </IonContent>
  )
}
