import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onMoistSensorClick} from "../../../functions/types/moist/onMoistSensorClick";
import {getOptions} from "../../../data/getOptions";
import skull from '../../../../../assets/images/skull.svg'

// Интерфейсы для типизации
interface MoistChartData {
  id: string | number;
  layerName: string;
  name: string;
  sensorId: string | number;
  mainId: string | number;
  battery?: string;
  freshness?: string;
  [key: string]: unknown;
}

interface History {
  push: (path: string) => void;
  [key: string]: unknown;
}

interface SiteList {
  [key: string]: unknown;
}

interface MoistOverlayRef {
  current: MoistCustomOverlayInstance[];
}

interface MoistCustomOverlayInstance {
  chartData: MoistChartData;
  isValidChartData: boolean;
  toUpdate: boolean;
  show: () => void;
  hide: () => void;
  [key: string]: unknown;
}

interface AdditionalChartData {
  [key: string]: unknown;
}

export const initializeMoistCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private isBudgetEditorMap: boolean
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: MoistChartData;
      private setChartData: (data: unknown[]) => void
      private setPage: (page: number) => void
      private setSiteId: (id: string | number) => void
      private setSiteName: (name: string) => void
      private history: History
      private isMoistMarkerChartDrawn: boolean
      private setAdditionalChartData: (data: AdditionalChartData) => void
      private siteList: SiteList
      private setMoistOverlays: (overlays: MoistCustomOverlayInstance[] | ((prev: MoistCustomOverlayInstance[]) => MoistCustomOverlayInstance[])) => void
      private setChartPageType: (type: string) => void
      private moistOverlaysRef: MoistOverlayRef
      private currentSensorId: string | number
      private setCurrentSensorId: (id: string | number) => void
      private borderColor: string
      private toUpdate: boolean

      private div?: HTMLElement | null;
      private root: ReturnType<typeof createRoot> | null;
      private offset: { x: number; y: number };
      private prefix: string;
      private isCurrentOverlay: boolean;
      private isTextTruncated: boolean

      constructor(
        isBudgetEditorMap: boolean,
        bounds: google.maps.LatLngBounds,
        _invalidChartDataImage: string,
        isValidChartData: boolean,
        chartData: MoistChartData,
        setChartData: (data: unknown[]) => void,
        setPage: (page: number) => void,
        setSiteId: (id: string | number) => void,
        setSiteName: (name: string) => void,
        history: History,
        isMoistMarkerChartDrawn: boolean,
        setAdditionalChartData: (data: AdditionalChartData) => void,
        siteList: SiteList,
        setMoistOverlays: (overlays: MoistCustomOverlayInstance[] | ((prev: MoistCustomOverlayInstance[]) => MoistCustomOverlayInstance[])) => void,
        setChartPageType: (type: string) => void,
        moistOverlaysRef: MoistOverlayRef,
        currentSensorId: string | number,
        setCurrentSensorId: (id: string | number) => void,
        _toUpdate: boolean
      ) {
        super();
        this.isBudgetEditorMap = isBudgetEditorMap
        this.bounds = bounds;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.history = history
        this.isMoistMarkerChartDrawn = isMoistMarkerChartDrawn
        this.setAdditionalChartData = setAdditionalChartData
        this.siteList = siteList
        this.setMoistOverlays = setMoistOverlays
        this.setChartPageType = setChartPageType
        this.moistOverlaysRef = moistOverlaysRef
        this.currentSensorId = currentSensorId
        this.setCurrentSensorId = setCurrentSensorId
        this.toUpdate = _toUpdate

        this.offset = {x: 0, y: 0};
        this.prefix = this.isBudgetEditorMap ? 'b' : 'm'
        this.isCurrentOverlay = this.chartData.sensorId === this.currentSensorId
        this.borderColor = 'gray'
        this.isTextTruncated = this.chartData.name.length > 7
        this.root = null
      }

      update(currentSensorId?: string | number) {
        return new Promise<void>((resolve) => {
          if (currentSensorId && this.div) {
            this.currentSensorId = currentSensorId;
            this.isCurrentOverlay = this.chartData.sensorId === currentSensorId;
            this.div.removeEventListener('mouseenter', this._onMouseEnter);
            this.div.removeEventListener('mouseleave', this._onMouseLeave);
            this._onMouseEnter = () => {
              if (this.div) {
                this.div.style.zIndex = "10000";
              }
            };
            this._onMouseLeave = () => {
              if (this.div) {
                this.div.style.zIndex = this.isCurrentOverlay ? "9999" : "0";
              }
            };
            this.div.style.zIndex = this.isCurrentOverlay ? "9999" : "0";
            this.div.addEventListener('mouseenter', this._onMouseEnter);
            this.div.addEventListener('mouseleave', this._onMouseLeave);
          }

          // Always re-render for budget editor overlays to update loader state
          if (this.div && this.root) {
            // For budget editor overlays, always render
            // For regular map overlays, only render when chart is ready
            const shouldRender = this.prefix === 'b' || !this.isValidChartData || (this.isValidChartData && this.isMoistMarkerChartDrawn);
            if (shouldRender) {
              this.root.render(this.renderContent());
            }
          }
          this.draw()
          resolve();
        });
      }

      private _onMouseEnter: () => void = () => {
      };
      private _onMouseLeave: () => void = () => {
      };

      renderContent() {
        const onMarkerClick = () => {
          if (this.isBudgetEditorMap) {
            if (!this.isCurrentOverlay) {
              this.setCurrentSensorId(this.chartData.sensorId)
            }
          } else {
            onMoistSensorClick(
              this.history,
              String(this.chartData.sensorId),
              this.chartData.mainId,
              this.chartData.name,
              this.setChartData,
              this.setPage,
              this.setSiteId,
              this.setSiteName,
              this.setAdditionalChartData,
              this.siteList,
              this.setChartPageType
            )
          }
        }
        if (this.isValidChartData && !this.chartData.freshness) {
        }
        return (
          <div className={s.overlay_container} onClick={onMarkerClick}
               style={{width: this.isCurrentOverlay ? '62px' : '58px'}}>
            {this.isValidChartData ? (
              <div className={s.mainContainer}>
                <div className={s.overlay_chartContainer} style={{
                  boxShadow: this.isCurrentOverlay
                    ? '0 0 20px 10px rgba(255, 255, 0, 0.8)'
                    : 'none',
                  border: this.isCurrentOverlay ? '3px solid #ffff00' : '1px solid #000',
                  background: this.borderColor,
                  position: 'relative'
                }}>
                  <div id={`${this.prefix}-${String(this.chartData.id)}`} className={s.overlay_chart}></div>
                  {this.isMoistMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader} style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: this.borderColor,
                      zIndex: 10
                    }}></div>
                  )}
                  <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                  {this.chartData.battery && <p className={s.chartName}>{this.chartData.battery}</p>}
                  <p>{String(this.chartData.sensorId)}</p>
                </div>
              </div>
            ) : (
              <div className={s.overlay_skullImage}>
                <div className={s.overlay_skullImageContent} style={{
                  boxShadow: this.isCurrentOverlay
                    ? '0 0 20px 10px rgba(255, 255, 0, 0.8)'
                    : 'none',
                  border: this.isCurrentOverlay ? '3px solid #ffff00' : 'none',
                }}>
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
        const options = await getOptions()
        this.borderColor = options.data[`freshness.${this.chartData.freshness}.color`]
      }

      onAdd() {
        new Promise<void>(async (resolve) => {
          const divId = `overlay-${this.prefix}-${String(this.chartData.id)}`;
          this.div = document.getElementById(divId) as HTMLElement | null;

          if (this.div) return resolve();

          await this.setBorderColor()
          this.div = document.createElement("div");
          this.div.id = String(divId);
          this.div.style.position = "absolute";
          this.div.style.webkitTransform = 'translateZ(0)';
          this.div.style.borderRadius = '12px';

          const setupZIndex = () => {
            if (this.prefix === 'b' && this.div) {
              this.div.style.zIndex = this.isCurrentOverlay ? "9999" : "0";
              if (!this.isCurrentOverlay) addHoverEffect();
            } else {
              addHoverEffect();
            }
          }

          const addHoverEffect = () => {
            if (this.div) {
              this.div.addEventListener('mouseenter', () => {
                if (this.div) {
                  this.div.style.zIndex = "10000";
                }
              });
              this.div.addEventListener('mouseleave', () => {
                if (this.div) {
                  this.div.style.zIndex = "0";
                }
              });
            }
          }

          setupZIndex();

          if (this.chartData.battery && !this.chartData.battery.toString().includes(" VDC")) {
            this.chartData.battery += " VDC";
          }

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

          resolve();
        }).then(() => {
          if (this.isValidChartData) {
            this.setMoistOverlays((overlays: MoistCustomOverlayInstance[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);
              
              if (!overlayExists) {
                if (this.prefix === 'b') {
                  if (!this.moistOverlaysRef.current.some((overlay: MoistCustomOverlayInstance) => overlay.chartData.id === this.chartData.id)) {
                    this.moistOverlaysRef.current.push(this as unknown as MoistCustomOverlayInstance);
                  }
                }

                return [...overlays, this as unknown as MoistCustomOverlayInstance];
              }
              return overlays;
            });
          } else {
            this.setMoistOverlays((overlays: MoistCustomOverlayInstance[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);
              if (!overlayExists) {
                if (this.prefix === 'b') {
                  if (!this.moistOverlaysRef.current.some((overlay: MoistCustomOverlayInstance) => overlay.chartData.id === this.chartData.id)) {
                    this.moistOverlaysRef.current.push(this as unknown as MoistCustomOverlayInstance);
                  }
                }
                return [...overlays, this as unknown as MoistCustomOverlayInstance];
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
        if (this.div) {
          this.div.removeEventListener('mouseenter', this._onMouseEnter);
          this.div.removeEventListener('mouseleave', this._onMouseLeave);

          if (this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
          }
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