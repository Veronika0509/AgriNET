import React, {useEffect, useRef, useState} from "react";
import { TempTable } from "./components/types/temp/TempTable";
import {onDataSet} from "./functions/onDataSet";
import {ButtonAndSpinner} from "./components/ButtonAndSpinner";
import {WxetModalTable} from "./components/types/wxet/WxetModalTable";
import {MoistTable} from "./components/types/moist/MoistTable";

interface TabularData {
  type: any,
  sensorId: string,
  colors?: any,
  data: any,
  setData: any,
  isLoading: boolean,
  setIsLoading: any,
  chartCode: string
}

export const TabularData: React.FC<TabularData> = ({type, colors, sensorId, data, setData, isLoading, setIsLoading, chartCode}) => {
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
  // Wxet
  const [isWxetModalOpen, setIsWxetModalOpen] = useState(false);
  const [isWxetMobile, setIsWxetMobile] = useState(window.innerWidth < 425);
  const modal = useRef<HTMLIonModalElement>(null);

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