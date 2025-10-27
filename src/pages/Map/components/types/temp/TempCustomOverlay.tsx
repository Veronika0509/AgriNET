import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onTempSensorClick} from "../../../functions/types/temp/onTempSensorClick";
import skull from "../../../../../assets/images/skull.svg";
import alarm from "../../../../../assets/images/icons/wxetAlarm.png";

interface TempChartData {
  id: string | number;
  sensorId: string | number;
  name: string;
  freshness?: string;
  batteryPercentage?: number;
  alarmEnabled?: boolean;
}

interface History {
  push: (path: string) => void;
}

interface AdditionalChartData {
  metric: unknown;
}

type PresentFunction = (data: unknown) => void;

interface TempCustomOverlayInstance {
  chartData: TempChartData;
  [key: string]: unknown;
}

export const initializeTempCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: TempChartData;
      private setChartData: (data: unknown[]) => void
      private setPage: (page: number) => void
      private setSiteId: (id: string | number) => void
      private setSiteName: (name: string) => void
      private history: History
      private isTempMarkerChartDrawn: boolean
      private setAdditionalChartData: (data: AdditionalChartData) => void
      private setTempOverlays: (fn: (overlays: TempCustomOverlayInstance[]) => TempCustomOverlayInstance[]) => void
      private setChartPageType: (type: string) => void
      private userId: string | number
      private present: PresentFunction

      private root: ReturnType<typeof createRoot> | null;
      private offset: { x: number; y: number };
      private div: HTMLElement | null;
      private isTextTruncated: boolean
      private borderColor: string

      constructor(
        bounds: google.maps.LatLngBounds,
        isValidChartData: boolean,
        chartData: TempChartData,
        setChartData: (data: unknown[]) => void,
        setPage: (page: number) => void,
        setSiteId: (id: string | number) => void,
        setSiteName: (name: string) => void,
        history: History,
        isTempMarkerChartDrawn: boolean,
        setAdditionalChartData: (data: AdditionalChartData) => void,
        setTempOverlays: (fn: (overlays: TempCustomOverlayInstance[]) => TempCustomOverlayInstance[]) => void,
        setChartPageType: (type: string) => void,
        userId: string | number,
        present: PresentFunction
      ) {
        super();

        this.bounds = bounds;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.history = history
        this.isTempMarkerChartDrawn = isTempMarkerChartDrawn
        this.setAdditionalChartData = setAdditionalChartData
        this.setTempOverlays = setTempOverlays
        this.setChartPageType = setChartPageType
        this.userId = userId
        this.present = present

        this.root = null
        this.div = null
        this.offset = { x: 0, y: 0 };
        this.isTextTruncated = this.chartData.name.length > 7
        this.borderColor = 'gray'
      }

      update() {
        return new Promise<void>((resolve) => {
          if (this.div && this.isTempMarkerChartDrawn && this.root) {
            this.root.render(this.renderContent());
          }
          resolve();
        });
      }

      renderContent() {
        if (this.isValidChartData && !this.chartData.freshness) {
          console.log('chart data is valid but freshness id undefined', this.chartData.sensorId, this.chartData.freshness)
        }
        return (
          <div className={s.overlay_container}>
            {this.isValidChartData ? (
              <div className={s.mainContainer} onClick={() => onTempSensorClick(
                this.history,
                this.chartData.sensorId,
                this.chartData.name,
                this.setChartData,
                this.setPage,
                this.setSiteId,
                this.setSiteName,
                this.setAdditionalChartData,
                this.setChartPageType,
                this.userId,
                this.present
              )}>
                <div className={s.overlay_chartContainer} style={{background: this.borderColor}}>
                  <div id={String(this.chartData.id)} className={s.overlay_chart} style={{ display: this.isTempMarkerChartDrawn ? 'block' : 'none' }}>
                    {this.chartData.alarmEnabled && (
                      <div className={`${s.overlay_wxetOverlayAlarm} ${s.overlay_tempOverlayAlarm}`}>
                        <img src={alarm} alt="Alarm Image"/>
                      </div>
                    )}
                  </div>
                  {this.isTempMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                  {this.chartData.batteryPercentage && <p className={s.chartName}>Battery: {this.chartData.batteryPercentage}%</p>}
                  <p>{String(this.chartData.sensorId)}</p>
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
            )}
          </div>
        );
      }

      async setBorderColor() {
        const freshnessColors: Record<string, string> = {
          '30m': '#8BF972',
          '60m': '#8BF972',
          '1h': '#8BF972',
          '6h': 'yellow',
          '12h': 'red',
        };
        this.borderColor = this.chartData.freshness ? freshnessColors[this.chartData.freshness] || 'gray' : 'gray'
      }

      onAdd() {
        new Promise<void>(async (resolve: () => void) => {
          const divId = `overlay-${String(this.chartData.id)}`;
          this.div = document.getElementById(divId) as HTMLElement | null;

          if (!this.div) {
            await this.setBorderColor()
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
            if (this.root) {
              this.root.render(this.renderContent());
            }
          }
          resolve()
        }).then(() => {
          if (this.isValidChartData) {
            this.setTempOverlays((overlays: TempCustomOverlayInstance[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);

              if (!overlayExists) {
                return [...overlays, this as unknown as TempCustomOverlayInstance];
              }

              return overlays;
            });
          }
        })
        this.update()
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

      getDiv() {
        return this.div;
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