import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import wxetOverlayMoon from '../../../../../assets/images/icons/wxetOverlayMoon.svg'
import wxetOverlaySun from '../../../../../assets/images/icons/wxetOverlaySun.svg'
import {truncateText} from "../../../functions/truncateTextFunc";
import {onWxetSensorClick} from "../../../functions/types/wxet/onWxetSensorClick";
import {getOptions} from "../../../data/getOptions";
import skull from "../../../../../assets/images/skull.svg";
import alarm from '../../../../../assets/images/icons/wxetAlarm.png'

interface WxetChartData {
  sensorId: string;
  mainId: string | number;
  name: string;
  freshness?: string;
  data: {
    metric: string;
    tempTrend?: string;
    battery?: number;
    batteryPercentage?: number;
    solar?: number;
    alarmEnabled?: boolean;
    [key: string]: unknown;
  };
}

interface History {
  push: (path: string) => void;
}

export const initializeWxetCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private setChartData: (data: unknown) => void
      private setPage: (page: number) => void
      private setSiteId: (id: string | number) => void
      private setSiteName: (name: string) => void
      private setAdditionalChartData: (data: { metric: unknown; type: unknown }) => void
      private history: History
      private bounds: google.maps.LatLngBounds;
      private isValidData: boolean;
      private chartData: WxetChartData;
      private setChartPageType: (type: string) => void
      private borderColor: string

      private root: ReturnType<typeof createRoot> | null;
      private offset: { x: number; y: number };
      private div: HTMLElement | null;
      private isTextTruncated: boolean

      constructor(
        setChartData: (data: unknown) => void,
        setPage: (page: number) => void,
        setSiteId: (id: string | number) => void,
        setSiteName: (name: string) => void,
        setAdditionalChartData: (data: { metric: unknown; type: unknown }) => void,
        history: History,
        bounds: google.maps.LatLngBounds,
        isValidData: boolean,
        data: WxetChartData,
        setChartPageType: (type: string) => void
      ) {
        super();

        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.setAdditionalChartData = setAdditionalChartData
        this.history = history
        this.bounds = bounds
        this.isValidData = isValidData
        this.chartData = data
        this.setChartPageType = setChartPageType

        this.root = null
        this.div = null
        this.offset = { x: 0, y: 0 };
        this.isTextTruncated = this.isValidData ? this.chartData.name.length > 20 : this.chartData.name.length > 7
        this.borderColor = 'gray'
      }

      update() {
        if (this.div && this.root) {
          this.root.render(this.renderContent());
        }
        this.draw()
      }

      renderContent() {
        const tempMetric: string = this.chartData.data.metric === 'AMERICA' ? "°F" : "°C"
        const rainMetric: string = this.chartData.data.metric === 'AMERICA' ? "inch" : "mm"
        const windMetric: string = this.chartData.data.metric === 'AMERICA' ? "MPH" : "KPH"
        let termRendArrow = "";
        switch (this.chartData.data.tempTrend) {
          case "up":
            termRendArrow = "⇧";
            break;
          case "down":
            termRendArrow = "⇩";
            break;
        }
        const isBattery: boolean = this.chartData.data.battery !== undefined && this.chartData.data.battery !== null
        const isBatteryPercentage: boolean = this.chartData.data.batteryPercentage !== undefined && this.chartData.data.batteryPercentage !== null
        if (this.isValidData && !this.chartData.freshness) {
        }
        return (
          <div className={s.overlay_wxetOverlay}>
            {
              this.isValidData ? (
                <div onClick={() => onWxetSensorClick(
                  this.history,
                  String(this.chartData.sensorId),
                  this.chartData.name,
                  this.setChartData,
                  this.setPage,
                  this.setSiteId,
                  this.setSiteName,
                  this.setAdditionalChartData,
                  this.setChartPageType
                )}>
                  <div className={s.overlay_wxetOverlayContainer} style={{ background: this.borderColor }}>
                    <div className={s.overlay_wxetOverlayInnerContainer} style={{backgroundColor: String(this.chartData.data.bgColor || '')}}>
                      <img src={this.chartData.data.solar ? wxetOverlaySun : wxetOverlayMoon} className={s.overlay_wxetOverlayImage}
                           alt=""/>
                      <div>
                        <p>Temp: {String(this.chartData.data.temp || '')} {tempMetric} {termRendArrow}</p>
                        <p>Hi: {String(this.chartData.data.tempHi || '')} {tempMetric}</p>
                        <p>Lo: {String(this.chartData.data.tempLo || '')} {tempMetric}</p>
                        <p>RH: {String(this.chartData.data.rh || '')} %</p>
                        <p>Rain: {String(this.chartData.data.totalRain || '')} {rainMetric}</p>
                        <p>Wind: {String(this.chartData.data.wind || '')} {windMetric} {String(this.chartData.data.windDirection || '')}</p>
                        <p>Solar rad: {String(this.chartData.data.solar || '')} W/m2</p>
                        {this.chartData.data.alarmEnabled && <div className={s.overlay_wxetOverlayAlarm}>
                            <img src={alarm} alt="Alarm Image"/>
                        </div>}
                      </div>
                    </div>
                    <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name, 'wxet')}</p>
                  </div>
                  <div className={`${s.overlay_info} ${s.overlay_validWxetOverlayInfo}`}>
                    {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                    {isBattery && (
                      <div>
                        {isBatteryPercentage && (
                          <p className={s.overlay_text}>{this.chartData.data.batteryPercentage}%</p>
                        )}
                        <p className={s.overlay_text}>{this.chartData.data.battery} VDC</p>
                      </div>
                    )}
                    <p className={s.overlay_text}>{String(this.chartData.sensorId)}</p>
                  </div>
                </div>
              ) : (
                <div className={s.overlay_skullImage}>
                  <div className={s.overlay_skullImageContent}>
                    <img src={skull} alt=""/>
                    <p>{truncateText(this.chartData.name)}</p>
                  </div>
                  <div className={s.overlay_info}>
                    {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                    <p className={s.chartName}>{String(this.chartData.sensorId)}</p>
                  </div>
                </div>
              )
            }
          </div>
        );
      }

      async setBorderColor() {
        const options = await getOptions()
        this.borderColor = options.data[`freshness.${this.chartData.freshness}.color`]
      }

      onAdd() {
        const divId = `overlay-${String(this.chartData.mainId)}`;
        this.div = document.getElementById(divId) as HTMLElement | null;

        if (!this.div) {
          this.div = document.createElement("div");
          this.div.id = divId;
          this.div.style.borderStyle = "none";
          this.div.style.borderWidth = "0px";
          this.div.style.position = "absolute";
          this.div.style.webkitTransform = 'translateZ(0)';
          this.div.addEventListener('mouseenter', () => {
            if (this.div) {
              this.div.style.zIndex = "9999";
            }
          });
          this.div.addEventListener('mouseleave', () => {
            if (this.div) {
              this.div.style.zIndex = "0";
            }
          });

          this.offset = {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20
          };
          const panes = this.getPanes();
          if (panes && this.div) {
            panes.floatPane.appendChild(this.div);
          }
          if (!this.root && this.div) {
            this.root = createRoot(this.div);
          }
          this.setBorderColor().then(() => {
            if (this.root) {
              this.root.render(this.renderContent());
              this.draw();
            }
          });
        }
      }

      getDiv() {
        return this.div;
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !this.div) return;

        const position = this.bounds.getCenter();
        const pixel = projection.fromLatLngToDivPixel(position);

        if (pixel) {
          this.div.style.left = `${pixel.x + this.offset.x}px`;
          this.div.style.top = `${pixel.y + this.offset.y}px`;
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          (this.div.parentNode as HTMLElement).removeChild(this.div);
          this.div = null;
        }
      }


      hide() {
        if (this.div) {
          this.div.style.visibility = "hidden";
        }
      }

      show() {
        if (this.div) {
          this.div.style.visibility = "visible";
        }
      }

      setMap(map: google.maps.Map | null) {
        return new Promise<void>((resolve: () => void) => {
          super.setMap(map);
          resolve();
        });
      }
    }
  }
  return undefined;
}