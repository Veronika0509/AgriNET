import s from '../../style.module.css'
import React, {useEffect, useRef, useState} from "react";
import {handleResize} from "../../../../../functions/handleResize";
import {IonContent, useIonAlert} from "@ionic/react";
import TopSection from "../../../../TopSection";
import {getCurrentDatetime} from "../../../../DateTimePicker/functions/getCurrentDatetime";
import {getStartDate} from "../../../../DateTimePicker/functions/getStartDate";
import {TabularData} from "../../../../TabularData";
import {ButtonAndSpinner} from "../../../../TabularData/components/ButtonAndSpinner";
import {createFuelChart} from "../../../../../functions/types/wxet/createFuelChart";
import {getFuelMainChartData} from "../../../../../../Map/data/types/wxet/getFuelMainChartData";
import {getSensorItems} from "../../../../../../Map/data/getSensorItems";
import {AddCommentMessage} from "../../../../AddComment/components/AddCommentMessage";
import {AddCommentButton} from "../../../../AddComment/components/AddCommentButton";
import AddCommentModal from "../../../../AddComment/components/AddCommentModal";
import {setDynamicChartHeight} from "../../../../../functions/chartHeightCalculator";

export const FuelChartPage = (props: any) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>()
  const currentDate: any = getCurrentDatetime()
  const initialStartDate: any = getStartDate(getCurrentDatetime())
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [currentDates, setCurrentDates] = useState<any>()
  const chartCode: string = 'single'
  const [dateDifferenceInDays, setDateDifferenceInDays] = React.useState('14');
  const [locations, setLocations] = useState<any>([])
  const [currentLocation, setCurrentLocation] = useState<any>()
  // Add Comment
  const [fuelAddCommentModal, setFuelAddCommentModal] = useState<any>(undefined)
  const [isFuelCommentsShowed, setIsFuelCommentsShowed] = useState(false)
  const [fuelComments, setFuelComments] = useState();
  const [fuelAddCommentItemShowed, setFuelAddCommentItemShowed] = useState<any>(false)
  // Tabular Data
  const [fuelTabularData, setFuelTabularData] = useState<any>(null)
  const [isFuelTabularDataLoading, setIsFuelTabularDataLoading] = useState(false)

  const [presentDataAlert] = useIonAlert();
  const [presentLocationAlert] = useIonAlert();
  const locationSelectRef: any = useRef()

  const onLocationChange = async (value: any) => {
    if (value === 'All') {
      presentLocationAlert({
        header: 'Sorry...',
        message: 'This feature not implemented yet',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: async () => locationSelectRef.current.open()
          }
        ]
      })
    } else {
      const allSensorItems = getSensorItems(undefined, props.siteList)
      allSensorItems.map(async (sensorItem: any) => {
        if (sensorItem.name === value) {
          props.setSiteName(sensorItem.name)
          props.setSiteId(sensorItem.sensorId)
          setCurrentLocation(sensorItem)
          let newChartData: any
          if (currentDates) {
            newChartData = await getFuelMainChartData(sensorItem.sensorId, currentDates[1], currentDates[0])
          } else {
            newChartData = await getFuelMainChartData(sensorItem.sensorId)
          }
          createFuelChart(newChartData.data.data, root, fuelAddCommentItemShowed, setFuelAddCommentModal, fuelComments, isFuelCommentsShowed)
          setCurrentChartData(newChartData.data.data)
        }
      })
    }
  }

  useEffect(() => {
    setCurrentChartData({data: props.chartData, initialData: true})
    handleResize(props.setIsMobile)
    props.siteList.map((site: any) => {
      site.layers.map((layer: any) => {
        if (layer.name === 'WXET') {
          layer.markers.map((marker: any) => {
            if (marker.sensorId === props.sensorId) {
              layer.markers.map((neededMarker: any) => {
                if (neededMarker.markerType === 'fuel') {
                  setLocations((prevLocations: any) => {
                    const exists = prevLocations.some((loc: any) => loc.id === neededMarker.id)
                    if (exists) {
                      return prevLocations;
                    }
                    return [...prevLocations, neededMarker];
                  })
                }
              })
            }
          })
        }
      })
    })
    setDynamicChartHeight('fuelChartDiv')
  }, []);
  useEffect(() => {
    if (currentChartData && currentChartData.initialData) {
      createFuelChart(currentChartData.data, root, fuelAddCommentItemShowed, setFuelAddCommentModal, fuelComments, isFuelCommentsShowed)
      setCurrentChartData(currentChartData.data)
    }
  }, [currentChartData])
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      const updateCharts = async () => {
        try {
          const newChartData = await getFuelMainChartData(props.sensorId, currentDates[1], currentDates[0])
          createFuelChart(newChartData.data.data, root, fuelAddCommentItemShowed, setFuelAddCommentModal, fuelComments, isFuelCommentsShowed)
          setCurrentChartData(newChartData.data.data)
        } catch (e) {
          presentDataAlert({
            header: 'Please Standby',
            message: 'Standby: Data is being re routed',
            buttons: [
              {
                text: 'Close',
                role: 'cancel',
              }
            ]
          })
        }
      }
      if (currentDates) {
        updateCharts()
      }
    }
  }, [currentDates]);
  useEffect(() => {
    if (currentChartData && !currentChartData.initialData) {
      setDynamicChartHeight('fuelChartDiv')
      createFuelChart(currentChartData, root, fuelAddCommentItemShowed, setFuelAddCommentModal, fuelComments, isFuelCommentsShowed)
    }
  }, [fuelAddCommentItemShowed]);
  window.addEventListener("resize", () => setDynamicChartHeight('fuelChartDiv'))

  return (
    <IonContent>
      <div className={s.wrapper}>
        <div data-chart-section="top">
          <TopSection
            sensorId={props.sensorId}
            root={root}
            setCurrentChartData={setCurrentChartData}
            endDate={endDate}
            startDate={startDate}
            setEndDate={setEndDate}
            setStartDate={setStartDate}
            type={'fuel'}
            setCurrentDates={setCurrentDates}
            setAlarm={props.setAlarm}
            dateDifferenceInDays={dateDifferenceInDays}
            setDateDifferenceInDays={setDateDifferenceInDays}
            locations={locations}
            onLocationChange={onLocationChange}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            locationSelectRef={locationSelectRef}
            isCommentsShowed={isFuelCommentsShowed}
            setIsCommentsShowed={setIsFuelCommentsShowed}
          />
        </div>
        <div data-chart-section="main-header">
          <div className={s.additionalButtons}>
            <ButtonAndSpinner data={fuelTabularData} setData={setFuelTabularData}
                              setIsLoading={setIsFuelTabularDataLoading} sensorId={props.sensorId} chartCode={chartCode}
                              isLoading={isFuelTabularDataLoading} type={'fuel'}/>
            <AddCommentButton addCommentItemShowed={fuelAddCommentItemShowed}
                              setAddCommentItemShowed={setFuelAddCommentItemShowed}
                              isCommentsShowed={isFuelCommentsShowed}
                              setIsCommentsShowed={setIsFuelCommentsShowed}/>
          </div>
          <AddCommentMessage type={'fuel'} addCommentItemShowed={fuelAddCommentItemShowed}
                             setAddCommentModal={setFuelAddCommentModal}/>
          {fuelAddCommentModal && <AddCommentModal
              type={fuelAddCommentModal.type}
              userId={props.userId}
              sensorId={props.sensorId}
              addCommentModal={fuelAddCommentModal.date}
              setAddCommentItemShowed={setFuelAddCommentItemShowed}
              addCommentItemShowed={fuelAddCommentItemShowed}
              setAddCommentModal={setFuelAddCommentModal}
          />}
          <TabularData
            type={'fuel'}
            sensorId={props.sensorId}
            data={fuelTabularData}
            setData={setFuelTabularData}
            isLoading={isFuelTabularDataLoading}
            setIsLoading={setIsFuelTabularDataLoading}
            chartCode={chartCode}
          />
        </div>
        <div id='fuelChartDiv' className={s.chart}></div>
      </div>
    </IonContent>
  )
}