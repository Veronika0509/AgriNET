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
import { TempTable } from "./components/types/temp/TempTable";
import {onDataSet} from "./functions/onDataSet";
import {ButtonAndSpinner} from "./components/ButtonAndSpinner";
import chart from "../../index";
import {WxetModalTable} from "./components/types/wxet/WxetModalTable";
import {MoistTable} from "./components/types/moist/MoistTable";

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
  } else {
    chartCode = ''
  }

  // Wxet

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
      onDataSet(
        type,
        data,
        isWxetMobile,
        setData,
        setIsWxetModalOpen,
        setFirstRowColor,
        freshnessColors,
        setIsLoading
      )

    }
  }, [data]);

  return (
    <div>
      <ButtonAndSpinner data={data} setData={setData} setIsLoading={setIsLoading} sensorId={sensorId} chartCode={chartCode} isLoading={isLoading} />
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
                <WxetModalTable setData={setData} setIsWxetModalOpen={setIsWxetModalOpen} modal={modal} isWxetModalOpen={isWxetModalOpen} data={data} isWxetMobile={isWxetMobile} />
              ) : (
                <MoistTable type={type} data={data} colors={colors} firstRowColor={firstRowColor} isWxetMobile={isWxetMobile} />
              )}
            </div>
          )
          }
        </div>
      )}
    </div>
  )
}