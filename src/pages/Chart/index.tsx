import s from './components/types/moist/style.module.css';
import {IonPage} from "@ionic/react";
import Header from "./components/Header";
import {MoistChartPage} from "./components/types/moist";
import {WxetChartPage} from "./components/types/wxet";
import {handleResize} from "./functions/handleResize";
import {useState} from "react";

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
}

const Chart = (props: ChartProps) => {
  const [isMobile, setIsMobile] = useState(false)

  window.addEventListener('resize', () => {
    handleResize(setIsMobile)
  })

  return (
    <IonPage className={s.page}>
      <Header setPage={props.setPage} siteName={props.siteName} siteId={props.siteId}/>
      {
        props.chartPageType === 'moistFuel' ? (
          <MoistChartPage chartData={props.chartData} additionalChartData={props.additionalChartData} userId={props.userId} siteId={props.siteId} isMobile={isMobile} setIsMobile={setIsMobile} />
        ) : props.chartPageType === 'wxet' && (
          <WxetChartPage chartData={props.chartData} sensorId={props.siteId} isMobile={isMobile} setIsMobile={setIsMobile} additionalChartData={props.additionalChartData} />
        )
      }
    </IonPage>
  );
}

export default Chart;
