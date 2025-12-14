import s from "./style.module.css"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { getCurrentDatetime } from "../../DateTimePicker/functions/getCurrentDatetime"
import { getStartDate } from "../../DateTimePicker/functions/getStartDate"
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
import { getAddCommentItemShowed } from "../../../functions/types/moist/getAddCommentItemShowed"
import { handleResizeForChartLegend } from "../../../functions/types/moist/handleResizeForChartLegend"
import {getDaysFromChartData} from "../../../functions/getDaysFromChartData";
import {setDynamicChartHeight} from "../../../functions/chartHeightCalculator";
import { useAppContext } from "../../../../../context/AppContext";
import { useHistory } from 'react-router-dom';

// Define TypeScript interfaces
interface ChartData {
  data: Record<string, unknown>[]
  budgetLines?: Record<string, unknown>[]
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

interface TabularDataState {
  data: Record<string, unknown> | null
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
  date: string
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

interface MoistChartPageProps {
  sensorId: string | number;
  userId: string | number;
  [key: string]: unknown;
}

export const MoistChartPage = (props: MoistChartPageProps) => {
  const { setPage } = useAppContext();
  const history = useHistory();

  // Chart refs
  const root = useRef<HTMLDivElement>(null)
  const batteryRoot = useRef<HTMLDivElement>(null)
  const soilTempRoot = useRef<HTMLDivElement>(null)
  const sumRoot = useRef<HTMLDivElement>(null)

  // Date state
  const currentDate: string = getCurrentDatetime()
  const initialStartDate: string = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate)
  const [endDate, setEndDate] = useState<string>(currentDate)
  const [currentDates, setCurrentDates] = useState<string[]>([])
  const [dateDifferenceInDays, setDateDifferenceInDays] = useState<string>("14")

  // Chart data state
  const [currentChartData, setCurrentChartData] = useState<Record<string, unknown>[]>([])
  const [irrigationDates, setIrrigationDates] = useState<string[]>([])
  const [fullDatesArray, setFullDatesArray] = useState<string[] | undefined>()
  const [currentSumChartData, setCurrentSumChartData] = useState<ChartData>({})
  const [currentSoilTempChartData, setCurrentSoilTempChartData] = useState<ChartData>({})
  const [currentBatteryChartData, setCurrentBatteryChartData] = useState<Record<string, unknown>[]>([])
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
  const updateAddCommentItemShowed = (type: keyof AddCommentItemState, value: boolean | string): void => {
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
      const fetchComments = async (chartType: string, data: Record<string, unknown>[]): Promise<Comment[]> => {
        let apiChartType: string
        let commentType: keyof CommentsState
        let currentData: Record<string, unknown>[] | undefined

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
            currentData = currentBatteryChartData
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
          const newCommentData: Comment[] = await fetchComments(CHART_TYPES.MAIN, days)

          if (addCommentItemShowed.main === "comments") {
            updateAddCommentItemShowed("main", false)
          }

          createMainChart({
            data: days || currentChartData,
            sensorId: props.sensorId,
            updateComments,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: !!days,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed: addCommentItemShowed.main === "comments" ? false : addCommentItemShowed.main,
            moistMainComments: newCommentData,
            updateCommentsArray,
            updateChart,
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
            updateChart(CHART_TYPES.MAIN, 'comments', newMoistChartData.data.data)
          } else {
            createMainChart({
              data: newMoistChartData.data.data,
              sensorId: props.sensorId,
              updateComments,
              userId: props.userId,
              root,
              fullDatesArray,
              additionalChartData: props.additionalChartData,
              comparingMode,
              isNewDates: true,
              historicMode,
              showForecast: compareDates(endDatetime),
              setMoistAddCommentModal,
              moistMainAddCommentItemShowed: addCommentItemShowed.main,
              moistMainComments: comments.main,
              updateCommentsArray,
              updateChart,
              isMoistCommentsShowed,
            })
          }
        } else if (updateReason === "sameData") {
          createMainChart({
            data: currentChartData,
            sensorId: props.sensorId,
            updateComments,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed: addCommentItemShowed.main,
            moistMainComments: comments.main,
            updateCommentsArray,
            updateChart,
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
            currentDates[0],
            currentDates[1],
          )
          setCurrentChartData(newData.data.data)

          createMainChart({
            data: newData.data.data,
            sensorId: props.sensorId,
            updateComments,
            userId: props.userId,
            root,
            fullDatesArray,
            additionalChartData: props.additionalChartData,
            comparingMode,
            isNewDates: false,
            historicMode,
            showForecast,
            setMoistAddCommentModal,
            moistMainAddCommentItemShowed: addCommentItemShowed.main,
            moistMainComments: comments.main,
            updateCommentsArray,
            updateChart,
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
          const newComments: Comment[] = await fetchComments(CHART_TYPES.SUM, days)

          if (addCommentItemShowed.sum === "comments") {
            updateAddCommentItemShowed("sum", false)
          }

          createAdditionalChart(
            "sum",
            days || currentSumChartData.data,
            sumRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.sum === "comments" ? false : addCommentItemShowed.sum,
            newComments,
            props.userId,
            updateChart,
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
            updateChart(CHART_TYPES.SUM, 'comments', newSumChartData.data.data)
          } else {
            createAdditionalChart(
              "sum",
              newSumChartData.data.data,
              sumRoot,
              setMoistAddCommentModal,
              updateCommentsArray,
              props.sensorId,
              updateComments,
              addCommentItemShowed.sum,
              comments.sum,
              props.userId,
              updateChart,
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
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.sum,
            comments.sum,
            props.userId,
            updateChart,
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
            currentDates[0],
            currentDates[1],
          )
          setCurrentSumChartData(newData.data)
          createAdditionalChart(
            "sum",
            newData.data.data,
            sumRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.sum,
            comments.sum,
            props.userId,
            updateChart,
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
          const newComments: Comment[] = await fetchComments(CHART_TYPES.SOIL_TEMP, days)

          if (addCommentItemShowed.soilTemp === "comments") {
            updateAddCommentItemShowed("soilTemp", false)
          }

          createAdditionalChart(
            "soilTemp",
            days || currentSoilTempChartData.data,
            soilTempRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.soilTemp === "comments" ? false : addCommentItemShowed.soilTemp,
            newComments,
            props.userId,
            updateChart,
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
            updateChart(CHART_TYPES.SOIL_TEMP, 'comments', newSoilTempChartData.data.data)
          } else {
            createAdditionalChart(
              "soilTemp",
              newSoilTempChartData.data.data,
              soilTempRoot,
              setMoistAddCommentModal,
              updateCommentsArray,
              props.sensorId,
              updateComments,
              addCommentItemShowed.soilTemp,
              comments.soilTemp,
              props.userId,
              updateChart,
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
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.soilTemp,
            comments.soilTemp,
            props.userId,
            updateChart,
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
            currentDates[0],
            currentDates[1],
          )
          setCurrentSoilTempChartData(newSoilTempChartData.data)

          createAdditionalChart(
            "soilTemp",
            newSoilTempChartData.data.data,
            soilTempRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.soilTemp,
            comments.soilTemp,
            props.userId,
            updateChart,
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

      else if (typeOfChart === CHART_TYPES.BATTERY) {
        if (updateReason === "comments") {
          const newComments: Comment[] = await fetchComments(CHART_TYPES.BATTERY, days && days.data)

          if (addCommentItemShowed.battery === "comments") {
            updateAddCommentItemShowed("battery", false)
          }

          createAdditionalChart(
            "battery",
            days || currentBatteryChartData,
            batteryRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.battery === "comments" ? false : addCommentItemShowed.battery,
            newComments,
            props.userId,
            updateChart,
            isMoistCommentsShowed,
          )
        } else if (updateReason === "dates") {
          const newBatteryChartData: ChartResponse = await getBatteryChartData(props.sensorId, days, endDateDays)
          setCurrentBatteryChartData(newBatteryChartData.data)

          if (isMoistCommentsShowed) {
            updateChart(CHART_TYPES.BATTERY, 'comments', newBatteryChartData.data)
          } else {
            createAdditionalChart(
              "battery",
              newBatteryChartData.data,
              batteryRoot,
              setMoistAddCommentModal,
              updateCommentsArray,
              props.sensorId,
              updateComments,
              addCommentItemShowed.battery,
              comments.battery,
              props.userId,
              updateChart,
              isMoistCommentsShowed,
            )
          }
        } else if (updateReason === 'sameData') {
          createAdditionalChart(
            "battery",
            currentBatteryChartData,
            batteryRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.battery,
            comments.battery,
            props.userId,
            updateChart,
            isMoistCommentsShowed,
          )
        } else {
          const newBatteryChartData: ChartResponse = await getBatteryChartData(
            props.sensorId,
            currentDates[0],
            currentDates[1],
          )
          setCurrentBatteryChartData(newBatteryChartData.data)

          createAdditionalChart(
            "battery",
            newBatteryChartData.data,
            batteryRoot,
            setMoistAddCommentModal,
            updateCommentsArray,
            props.sensorId,
            updateComments,
            addCommentItemShowed.battery,
            comments.battery,
            props.userId,
            updateChart,
            isMoistCommentsShowed,
          )
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
      addCommentItemShowed,
      comments,
      isMoistCommentsShowed,
      screenSize,
    ],
  )

  useEffect(() => {
    getIrrigationDates(
      setIsIrrigationDataIsLoading,
      setIsIrrigationButtons,
      props.userId,
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
    if (fullDatesArray !== undefined) {
      if (isMoistCommentsShowed) {
        updateChart(CHART_TYPES.MAIN, 'comments')
        updateChart(CHART_TYPES.SUM, 'comments')
        if (soilTempChartShowed) {
          updateChart(CHART_TYPES.SOIL_TEMP, 'comments')
        }
        if (batteryChartShowed) {
          updateChart(CHART_TYPES.BATTERY, 'comments')
        }
      } else {
        updateChart(CHART_TYPES.MAIN, 'sameData')
        updateChart(CHART_TYPES.SUM, 'sameData')
        if (soilTempChartShowed) {
          updateChart(CHART_TYPES.SOIL_TEMP, 'sameData')
        }
        if (batteryChartShowed) {
          updateChart(CHART_TYPES.BATTERY, 'sameData')
        }
      }
    }
  }, [isMoistCommentsShowed])

  useEffect(() => {
    if (fullDatesArray !== undefined) {
      setDynamicChartHeight('mainChart')
      if (addCommentItemShowed.main === "comments") {
        updateChart(CHART_TYPES.MAIN, "comments")
      } else {
        updateChart(CHART_TYPES.MAIN, 'sameData')
      }
    }
  }, [addCommentItemShowed.main])
  useEffect(() => {
    if (fullDatesArray !== undefined) {
      setDynamicChartHeight('sumChart')
      if (addCommentItemShowed.sum === "comments") {
        updateChart(CHART_TYPES.SUM, "comments")
      } else {
        updateChart(CHART_TYPES.SUM, 'sameData')
      }
    }
  }, [addCommentItemShowed.sum])
  useEffect(() => {
    if (fullDatesArray !== undefined) {
      if (addCommentItemShowed.soilTemp === "comments") {
        updateChart(CHART_TYPES.SOIL_TEMP, "comments")
      } else {
        updateChart(CHART_TYPES.SOIL_TEMP, 'sameData')
      }
    }
  }, [addCommentItemShowed.soilTemp])
  useEffect(() => {
    if (fullDatesArray !== undefined) {
      if (addCommentItemShowed.battery === "comments") {
        updateChart(CHART_TYPES.BATTERY, "comments")
      } else {
        updateChart(CHART_TYPES.BATTERY, 'sameData')
      }
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
      updateChart('soilTemp', 'dates', newDaysData.days, newDaysData.newEndDateFormatted, newDaysData.endDatetime)
      updateChart('battery', 'dates', newDaysData.days, newDaysData.newEndDateFormatted, newDaysData.endDatetime)
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
                setData={(data: Record<string, unknown>) => updateTabularData("soilTemp", {data})}
                setIsLoading={(isLoading: boolean) => updateTabularData("soilTemp", {isLoading})}
                sensorId={props.sensorId}
                chartCode={CHART_CODES.SOIL_TEMP}
                isLoading={tabularData.soilTemp.isLoading}
              />
              <Export chartCode={CHART_CODES.SOIL_TEMP} sensorId={props.sensorId} userId={props.userId}/>
              <AddCommentButton
                addCommentItemShowed={addCommentItemShowed.soilTemp}
                setAddCommentItemShowed={(value: boolean | string) => updateAddCommentItemShowed("soilTemp", value)}
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
              data={tabularData.soilTemp.data}
              setData={(data: Record<string, unknown>[]) => updateTabularData("soilTemp", {data})}
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
                  setData={(data: Record<string, unknown>[]) => updateTabularData("main", {data})}
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
                data={tabularData.main.data}
                setData={(data: Record<string, unknown>) => updateTabularData("main", {data})}
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
            setDisableNextButton={setDisableNextButton}
            setDisablePrevButton={setDisablePrevButton}
            disableNextButton={disableNextButton}
            disablePrevButton={disablePrevButton}
            sensorId={props.sensorId}
            setCurrentChartData={setCurrentChartData}
            root={root}
            fullDatesArray={fullDatesArray}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            additionalChartData={props.additionalChartData}
            batteryRoot={batteryRoot}
            sumRoot={sumRoot}
            setDateDifferenceInDays={setDateDifferenceInDays}
            setCurrentDates={setCurrentDates}
            setShowForecast={setShowForecast}
            updateChartsWithDates={setNewDaysData}
            setHistoricMode={setHistoricMode}
          />
        </div>

        {/* Sum Chart Section */}
        <div data-chart-section="sumHeader">
          <h2 className="ion-text-center ion-margin-top">Sum of Soil Moisture</h2>
          <div className={s.additionalButtons}>
            <ButtonAndSpinner
              data={tabularData.sum.data}
              setData={(data: Record<string, unknown>) => updateTabularData("sum", {data})}
              setIsLoading={(isLoading: boolean) => updateTabularData("sum", {isLoading})}
              sensorId={props.sensorId}
              chartCode={CHART_CODES.SUM}
              isLoading={tabularData.sum.isLoading}
            />
            <Export chartCode={CHART_CODES.SUM} sensorId={props.sensorId} userId={props.userId}/>
            <AddCommentButton
              addCommentItemShowed={addCommentItemShowed.sum}
              setAddCommentItemShowed={(value: boolean | string) => updateAddCommentItemShowed("sum", value)}
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
            data={tabularData.sum.data}
            setData={(data: Record<string, unknown>) => updateTabularData("sum", {data})}
            chartCode={CHART_CODES.SUM}
            isLoading={tabularData.sum.isLoading}
            setIsLoading={(isLoading: boolean) => updateTabularData("sum", {isLoading})}
          />
        </div>
        <div id="sumChart" className={s.sumChart}></div>

        {/* Comment Modal */}
        {moistAddCommentModal && (
          <AddCommentModal
            type={moistAddCommentModal.type}
            userId={props.userId}
            sensorId={props.sensorId}
            addCommentModal={moistAddCommentModal.date}
            setMoistAddCommentModal={setMoistAddCommentModal}
            setMoistMainComments={(data: Comment[]) => updateComments("main", data)}
            setAddCommentItemShowed={getSetAddCommentItemShowed(
              moistAddCommentModal.type,
              (value: boolean | string) => updateAddCommentItemShowed("main", value),
              (value: boolean | string) => updateAddCommentItemShowed("soilTemp", value),
              (value: boolean | string) => updateAddCommentItemShowed("sum", value),
              (value: boolean | string) => updateAddCommentItemShowed("battery", value),
            )}
            addCommentItemShowed={getAddCommentItemShowed(
              moistAddCommentModal.type,
              addCommentItemShowed.main,
              addCommentItemShowed.soilTemp,
              addCommentItemShowed.sum,
              addCommentItemShowed.battery,
            )}
            setAddCommentModal={setMoistAddCommentModal}
            updateChart={updateChart}
          />
        )}
      </div>
    </IonContent>
  )
}
