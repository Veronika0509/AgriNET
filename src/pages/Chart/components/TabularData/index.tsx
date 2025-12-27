import React, {useEffect, useRef, useState} from "react";
import {TempTable} from "./components/types/temp/TempTable";
import {onDataSet} from "./functions/onDataSet";
import {ButtonAndSpinner} from "./components/ButtonAndSpinner";
import {WxetModalTable} from "./components/types/wxet/WxetModalTable";
import {MoistTable} from "./components/types/moist/MoistTable";
import {FuelModalTable} from "./components/types/wxet/FuelModalTable";

interface DataItem {
  DateTime: string;
  [key: string]: unknown;
}

interface TabularDataItem {
  data: DataItem[];
  sensorCount?: number;
  label?: string;
  isFiltered?: boolean;
  freshness?: string;
  [key: string]: unknown;
}

interface TabularDataProps {
  type: 'temp' | 'wxet' | 'fuel' | 'moist' | string;
  sensorId: string;
  colors?: string[];
  data: TabularDataItem | TabularDataItem[] | { data: TabularDataItem[] };
  setData: (data: TabularDataItem | TabularDataItem[] | { data: TabularDataItem[] } | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  chartCode: string;
}

export const TabularData: React.FC<TabularDataProps> = ({
                                                     type,
                                                     colors,
                                                     sensorId,
                                                     data,
                                                     setData,
                                                     isLoading,
                                                     setIsLoading,
                                                     chartCode
                                                   }) => {
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
  const wxetModal = useRef<HTMLIonModalElement>(null);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const fuelModal = useRef<HTMLIonModalElement>(null);

  // Wxet
  const freshnessColors: Record<string, string> = {
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
        data as any,
        isWxetMobile,
        setData,
        setIsWxetModalOpen,
        setIsFuelModalOpen,
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
              {Array.isArray(data) && data.length ? (
                <div>
                  {(data as TabularDataItem[]).map((tabularData: TabularDataItem, index: number) => (
                    <TempTable key={index} tabularData={tabularData} isMobile={isMobile}
                               freshnessColors={freshnessColors}/>
                  ))}
                </div>
              ) : (
                <div>
                  <TempTable tabularData={data} isMobile={isMobile} freshnessColors={freshnessColors}/>
                </div>
              )}
            </div>
          ) : type === 'wxet' ? (
            <WxetModalTable setData={setData} setIsWxetModalOpen={setIsWxetModalOpen} modal={wxetModal}
                            isWxetModalOpen={isWxetModalOpen} data={data} isWxetMobile={isWxetMobile}/>
          ) : type === 'fuel' ? (
            <FuelModalTable setData={setData} setIsFuelModalOpen={setIsFuelModalOpen} modal={fuelModal}
                            isFuelModalOpen={isFuelModalOpen} data={data} isWxetMobile={isWxetMobile}/>
          ) : (
            <MoistTable type={type} data={data} colors={colors} firstRowColor={firstRowColor}
                        isWxetMobile={isWxetMobile}/>
          )
          }
        </div>
      )}
    </div>
  )
}