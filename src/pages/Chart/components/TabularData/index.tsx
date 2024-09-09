import React, {useEffect, useRef, useState} from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSpinner,
  IonText,
  IonToolbar
} from "@ionic/react";
import s from "../types/moist/style.module.css";
import {gridOutline} from "ionicons/icons";
import {getTabularData} from "../../data/getTabularData";
import {onTabularDataClick} from "../../functions/onTabularDataClick";
import { TempTable } from "./components/TempTable";

interface TabularData {
  type: any,
  sensorId: string,
  colors?: any
}

export const TabularData: React.FC<TabularData> = ({type, colors, sensorId}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 750);
  const [firstRowColor, setFirstRowColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 750);
      setIsWxetMobile(window.innerWidth < 425)
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Moist Main
  const [moistMainTabularData, setMoistMainTabularData] = useState<any>(null)
  const [isMoistMainTabularDataLoading, setIsMoistMainTabularDataLoading] = useState(false)
  // Moist Sum
  const [moistSumTabularData, setMoistSumTabularData] = useState<any>(null)
  const [isMoistSumTabularDataLoading, setIsMoistSumTabularDataLoading] = useState(false)
  // Moist SoilTemp
  const [moistSoilTempTabularData, setMoistSoilTempTabularData] = useState<any>(null)
  const [isMoistSoilTempTabularDataLoading, setIsMoistSoilTempTabularDataLoading] = useState(false)
  // Temp
  const [tempTabularData, setTempTabularData] = useState<any>(null)
  const [isTempTabularDataLoading, setIsTempTabularDataLoading] = useState(false)
  // Wxet
  const [wxetTabularData, setWxetTabularData] = useState<any>(null)
  const [isWxetTabularDataLoading, setIsWxetTabularDataLoading] = useState(false)
  const [isWxetModalOpen, setIsWxetModalOpen] = useState(false);
  const [isWxetMobile, setIsWxetMobile] = useState(window.innerWidth < 425);
  const modal = useRef<HTMLIonModalElement>(null);

  let data: any
  let setData: any
  let isLoading: any
  let setIsLoading: any
  let chartCode: string
  if (type === 'moistMain') {
    data = moistMainTabularData
    setData = setMoistMainTabularData
    isLoading = isMoistMainTabularDataLoading
    setIsLoading = setIsMoistMainTabularDataLoading
    chartCode = 'm'
  } else if (type === 'moistSum') {
    data = moistSumTabularData
    setData = setMoistSumTabularData
    isLoading = isMoistSumTabularDataLoading
    setIsLoading = setIsMoistSumTabularDataLoading
    chartCode = 'mSum'
  } else if (type === 'moistSoilTemp') {
    data = moistSoilTempTabularData
    setData = setMoistSoilTempTabularData
    isLoading = isMoistSoilTempTabularDataLoading
    setIsLoading = setIsMoistSoilTempTabularDataLoading
    chartCode = 'mst'
  } else if (type === 'temp') {
    data = tempTabularData
    setData = setTempTabularData
    isLoading = isTempTabularDataLoading
    setIsLoading = setIsTempTabularDataLoading
    chartCode = 'tempRh'
  } else if (type === 'wxet') {
    data = wxetTabularData
    setData = setWxetTabularData
    isLoading = isWxetTabularDataLoading
    setIsLoading = setIsWxetTabularDataLoading
    chartCode = 'weather_leaf'
  }

  // Wxet
  const onWxetModalCancelClick = () => {
    setData(null)
    setIsWxetModalOpen(false)
  }

  const freshnessColors: any = {
    'undefined': '#000',
    '30m': '#8BF972FF',
    '6h': '#8BF972FF',
    '3h': '#FFFF00FF',
    '13h': '#FFFF00FF',
    '3d': '#808080FF',
    'outdated': '#000000FF'
  };

  useEffect(() => {
    if (data) {
      if (type === 'wxet') {
        if (!data.isFiltered && isWxetMobile) {
          const dataArray = data.data
          dataArray.sort((a: any, b: any) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
          const lastDate = new Date(dataArray[dataArray.length - 1].DateTime);
          const twoWeeksBefore = new Date(lastDate.getTime());
          twoWeeksBefore.setDate(lastDate.getDate() - 14);
          const filteredArray = dataArray.filter(
            (item: any) => new Date(item.DateTime).getTime() >= twoWeeksBefore.getTime()
          );
          setData({
            data: [...filteredArray].reverse(),
            sensorCount: data.sensorCount,
            label: data.label,
            isFiltered: true,
            freshness: data.freshness
          })
        }
        setIsWxetModalOpen(true)
      } else {
        if (data.label) {
          setFirstRowColor(freshnessColors[data.freshness] || undefined);
        } else {
          let dataWithColors: any[] = []
          if (data.data) {
            data.data.map((table: any) => {
              dataWithColors.push({
                data: table.data,
                freshnessColor: freshnessColors[table.freshness],
                label: table.label,
                isReady: true
              })
            })
            setData(dataWithColors, true)
          }
        }
      }
      setIsLoading(false)
    }
  }, [data]);

  return (
    <div>
      <div>
        <IonButton
          fill={data ? 'outline' : 'solid'}
          onClick={() => onTabularDataClick(data, setData, setIsLoading, sensorId, chartCode)}
          className={s.tabularButton}
          disabled={isLoading}
          id={'tabularDataTrigger'}
        >
          <IonIcon slot="start" icon={gridOutline}></IonIcon>
          Tabular Data
        </IonButton>
        <IonSpinner name="circular" color='primary' className={s.tabularDataSpinner}
                    style={{display: isLoading ? 'block' : 'none'}}></IonSpinner>
      </div>
      {data && (
        <div>
          {type === 'temp' ? (
            <div>
              {data.length ? (
                <div>
                  {data.map((tabularData: any, index: number) => (
                    <TempTable key={index} tabularData={tabularData} colors={colors} isMobile={isMobile} freshnessColors={freshnessColors} />
                  ))}
                </div>
              ) : (
                <div>
                  <TempTable tabularData={data} colors={colors} isMobile={isMobile} freshnessColors={freshnessColors} />
                </div>
              )}
            </div>
          ) : (
            <div>
              {type === 'wxet' ? (
                <IonModal ref={modal} isOpen={isWxetModalOpen}>
                  <IonHeader>
                    <IonToolbar>
                      <IonButtons slot="start">
                        <IonButton onClick={onWxetModalCancelClick}>Cancel</IonButton>
                      </IonButtons>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent>
                    <table className={s.mainTempWxetTabularDataTable}>
                      <thead className={s.mainTabularDataTableThead}>
                      <tr className={s.mainWxetTabularDataTableTh}>
                        {Array.from({length: data.sensorCount}, (_, index) => (
                          <React.Fragment key={`sensor-group-${index}`}>
                            <th className={s.mainTabularDataTableTh}>Time</th>
                            <th className={s.mainTabularDataTableTh}>Solar Radiation</th>
                            <th className={s.mainTabularDataTableTh}>RH</th>
                            <th className={s.mainTabularDataTableTh}>Air Temp</th>
                            <th className={s.mainTabularDataTableTh}>Rain</th>
                            <th className={s.mainTabularDataTableTh}>Wind Speed</th>
                            <th className={s.mainTabularDataTableTh}>Wind Gust</th>
                            <th className={s.mainTabularDataTableTh}>Leaf Wetness</th>
                            <th className={s.mainTabularDataTableTh}>GDD</th>
                            <th className={s.mainTabularDataTableTh}>AGDD</th>
                          </React.Fragment>
                        ))}
                      </tr>
                      </thead>
                      <tbody className={s.mainTabularDataTableTbody}>
                      {data.data.map((row: any, index: number) => (
                        <tr key={index} className={`${s.mainTabularDataTableTr} ${'ion-margin-top'}`}>
                          <td data-label={'Time'}
                              className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText} ${s.mainTempWxetTabularDataTableTdBlack}`}>{row.DateTime}</td>
                          {Array.from({length: data.sensorCount}, (_, sensorIndex) =>
                            <React.Fragment key={`sensor-fragment-${sensorIndex}`}>
                              <td data-label={'Solar Radiation'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.solar_display === 0 ? '0' : row.solar_display}</td>
                              <td data-label={'RH'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.RH === 0 ? '0' : row.RH}</td>
                              <td data-label={'Air Temp'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.Temp === 0 ? '0' : row.Temp}</td>
                              <td data-label={'Rain'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.rain_display === 0 ? '0' : row.rain_display}</td>
                              <td data-label={'Wind Speed'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.wind_display === 0 ? '0' : row.wind_display}</td>
                              <td data-label={'Wind Gust'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.gust_display === 0 ? '0' : row.gust_display}</td>
                              <td data-label={'Leaf Wetness'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.LW === 0 ? '0' : row.LW}</td>
                              <td data-label={'GDD'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.gdd === 0 ? '0' : row.gdd}</td>
                              <td data-label={'AGDD'}
                                  className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${s.wxetBlackText}`}>{row.agdd === 0 ? '0' : row.agdd}</td>
                            </React.Fragment>
                          )}
                        </tr>
                      ))}
                      </tbody>
                    </table>
                    {isWxetMobile && (
                      <IonText>You can see only two weeks data on mobile platform. To see full dataset use browser.</IonText>
                    )}
                  </IonContent>
                </IonModal>
              ) : (
                <table className={`${s.mainTabularDataTable} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTable}`}>
                  <thead className={s.mainTabularDataTableThead}>
                  <tr>
                    <th className={`${s.mainTabularDataTableTh} ${s.mainTabularDataTableThLarge}`}>{data.label}</th>
                    {Array.from({length: data.sensorCount}, (_, index) => (
                      <th key={index} className={s.mainTabularDataTableTh}
                          style={{backgroundColor: type === 'moistSum' ? `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})` : type === 'moistSoilTemp' ? `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})` : `rgb(${colors[index][0]}, ${colors[index][1]}, ${colors[index][2]})`}}>
                        {type === 'moistMain' && (
                          <>{4 * (index + 1)}inch</>
                        )}
                        {type === 'moistSum' && (
                          <>Sum Average</>
                        )}
                        {type === 'moistSoilTemp' && (
                          <>{4 * (index + 1)}inch</>
                        )}
                      </th>
                    ))}
                  </tr>
                  </thead>
                  <tbody className={s.mainTabularDataTableTbody}>
                  {data.data.map((row: any, index: number) => (
                    <tr key={index} className={`${s.mainTabularDataTableTr} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTr}`}>
                      <td className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd} ${
                        (index === 0 &&
                          (row.freshness === 'undefined' ||
                            row.freshness === '3d' ||
                            row.freshness === 'outdated'))
                          ? s.mainTabularDataTableThead
                          : ''
                      }`}  data-label='Time' style={index === 0 ? {backgroundColor: firstRowColor} : {color: '#000'}}>{row.DateTime}</td>
                      {Array.from({length: data.sensorCount}, (_, index) =>
                        <td key={index} data-label={`${4 * (index + 1)}inch`} style={isWxetMobile && type === 'moistSoilTemp' ? {backgroundColor: `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})`} : {}} className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd}`}>
                          {type === 'moistMain' && row[`MABS${index}`]}
                          {type === 'moistSum' && `${row[`SumAve`]} inches`}
                          {type === 'moistSoilTemp' && `${row[`MABS${index}`]}°F`}
                        </td>
                      )}
                    </tr>
                  ))}
                  </tbody>
                </table>
              )}
            </div>
          )
          }
        </div>
      )}
    </div>
  )
}