import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import {onValveSensorClick} from "../../../functions/types/valve/onValveSensorClick";
import {truncateText} from "../../../functions/truncateTextFunc";
import {simpleColors} from "../../../../../assets/getColors";
import skull from "../../../../../assets/images/skull.svg";
import type { SensorInfo } from "../../modals/SensorInfoDialog";
import { LongPressTracker } from "../../../utils/longPress";

interface ValveChartData {
  id: string | number;
  sensorId: string;
  name: string;
  bgColor?: string;
  enabled?: boolean;
  freshness?: string;
}

interface History {
  push: (path: string) => void;
}

interface ValveCustomOverlayInstance {
  chartData: ValveChartData;
  [key: string]: unknown;
}

export const initializeValveCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: ValveChartData;
      private setChartData: (data: unknown) => void
      private setPage: (page: number) => void
      private setSiteId: (id: string) => void
      private setSiteName: (name: string) => void
      private setChartPageType: (type: string) => void
      private history: History
      private isValveMarkerChartDrawn: boolean
      private setValveOverlays: (fn: (overlays: ValveCustomOverlayInstance[]) => ValveCustomOverlayInstance[]) => void
      private userId: string | number
      private bgColor: string | undefined
      private onLongPress: (info: SensorInfo) => void

      private root: ReturnType<typeof createRoot> | null;
      private offset: { x: number; y: number };
      private div: HTMLElement | null;
      private isTextTruncated: boolean
      private longPress: LongPressTracker = new LongPressTracker(() => this.onLongPress(this.getSensorInfo()));

      constructor(
        bounds: google.maps.LatLngBounds,
        isValidChartData: boolean,
        chartData: ValveChartData,
        setChartData: (data: unknown) => void,
        setPage: (page: number) => void,
        setSiteId: (id: string) => void,
        setSiteName: (name: string) => void,
        setChartPageType: (type: string) => void,
        history: History,
        isValveMarkerChartDrawn: boolean,
        setValveOverlays: (fn: (overlays: ValveCustomOverlayInstance[]) => ValveCustomOverlayInstance[]) => void,
        userId: string | number,
        onLongPress: (info: SensorInfo) => void
      ) {
        super();
        this.bounds = bounds;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.setChartPageType = setChartPageType
        this.history = history
        this.isValveMarkerChartDrawn = isValveMarkerChartDrawn
        this.setValveOverlays = setValveOverlays
        this.userId = userId
        this.onLongPress = onLongPress
        this.bgColor = this.chartData.bgColor ? simpleColors[this.chartData.bgColor.toLowerCase()] : undefined

        this.root = null
        this.div = null
        this.offset = { x: 0, y: 0 };
        this.isTextTruncated = this.chartData.name.length > 7
      }

      update() {
        return new Promise<void>((resolve) => {
          if (this.div && this.isValveMarkerChartDrawn && this.root) {
            this.root.render(this.renderContent());
          }
          resolve();
        });
      }

      private getSensorInfo(): SensorInfo {
        return {
          name: this.chartData.name,
          sensorId: String(this.chartData.sensorId),
        };
      }

      renderContent() {
        return (
          <div
            className={`${s.overlay_container}`}
            onClick={() => {
              if (this.longPress.wasLongPress) return;
              onValveSensorClick(
                this.history,
                this.userId,
                String(this.chartData.sensorId),
                this.chartData.name,
                this.setChartData,
                this.setPage,
                this.setSiteId,
                this.setSiteName,
                this.setChartPageType
              );
            }}
            onTouchStart={this.longPress.start}
            onTouchEnd={this.longPress.end}
            onTouchMove={this.longPress.move}
          >
            {this.isValidChartData ? (
              <div>
                <div className={`${s.overlay_chartContainer} ${s.overlay_valveChartContainer}`} style={{background: '#96fd66'}}>
                  <div className={s.overlay_chartWrapper} style={this.chartData.bgColor && this.bgColor ? {background: `#${this.bgColor}`} : undefined}>
                    <div style={{
                      display: this.isValveMarkerChartDrawn ? 'block' : 'none',
                      ...(this.bgColor && {background: `#${this.bgColor}`})
                    }} id={String(this.chartData.id)}
                         className={`${s.overlay_chart} ${s.overlay_chart__valve}`}>
                      <div
                        className={`${s.overlay_valveEnabled} ${this.chartData.enabled && s.overlay_valveEnabled__enabled}`}></div>
                    </div>
                  </div>
                  {this.isValveMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p style={{
                    marginTop: this.isValveMarkerChartDrawn ? '0' : '15px',
                    color: (this.chartData.freshness === '3d' || this.chartData.freshness === 'outdated') ? '#fff' : '#000'
                  }}
                     className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
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

      onAdd() {
        new Promise<void>((resolve: () => void) => {
          const divId = `overlay-${String(this.chartData.id)}`;
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
            if (this.root) {
              const content = this.renderContent()
              this.root.render(content);
            }
          }
          resolve()
        }).then(() => {
          if (this.isValidChartData) {
            this.setValveOverlays((overlays: ValveCustomOverlayInstance[]) => {
              const overlayExists = overlays.some(overlay => overlay.chartData.id === this.chartData.id);

              if (!overlayExists) {
                return [...overlays, this as unknown as ValveCustomOverlayInstance];
              }

              return overlays;
            });
          }
        })
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

      /**
       *  Set the visibility to 'hidden' or 'visible'.
       */
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