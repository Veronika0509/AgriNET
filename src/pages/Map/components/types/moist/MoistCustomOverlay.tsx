import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onMoistSensorClick} from "../../../functions/types/moist/onMoistSensorClick";
import {getOptions} from "../../../data/getOptions";
import skull from '../../../../../assets/images/skull.svg'

export const initializeMoistCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private isBudgetEditorMap: any
      private bounds: google.maps.LatLngBounds;
      private invalidChartDataImage: any;
      private isValidChartData: boolean;
      private chartData: any;
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private history: any
      private isMoistMarkerChartDrawn: boolean
      private setAdditionalChartData: any
      private siteList: any
      private setMoistOverlays: any
      private setChartPageType: any
      private moistOverlaysRef: any
      private currentSensorId: any
      private setCurrentSensorId: any
      private borderColor: any
      private toUpdate: boolean

      private div?: any;
      private layerName: string
      private root: any;
      private offset: { x: number; y: number };
      private prefix: any;
      private isCurrentOverlay: any;
      private isTextTruncated: boolean

      constructor(
        isBudgetEditorMap: any,
        bounds: google.maps.LatLngBounds,
        invalidChartDataImage: any,
        isValidChartData: boolean,
        chartData: any,
        setChartData: any,
        setPage: any,
        setSiteId: any,
        setSiteName: any,
        history: any,
        isMoistMarkerChartDrawn: boolean,
        setAdditionalChartData: any,
        siteList: any,
        setMoistOverlays: any,
        setChartPageType: any,
        moistOverlaysRef: any,
        currentSensorId: any,
        setCurrentSensorId: any,
        toUpdate: boolean
      ) {
        super();
        this.isBudgetEditorMap = isBudgetEditorMap
        this.bounds = bounds;
        this.invalidChartDataImage = invalidChartDataImage;
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
        this.toUpdate = toUpdate

        this.layerName = chartData.layerName
        this.offset = {x: 0, y: 0};
        this.prefix = this.isBudgetEditorMap ? 'b' : 'm'
        this.isCurrentOverlay = this.chartData.sensorId === this.currentSensorId
        this.borderColor = 'gray'
        this.isTextTruncated = this.chartData.name.length > 7
      }

      update(currentSensorId?: any) {
        return new Promise<void>((resolve) => {
          if (currentSensorId) {
            this.currentSensorId = currentSensorId;
            this.isCurrentOverlay = this.chartData.sensorId === currentSensorId;
            this.div.removeEventListener('mouseenter', this._onMouseEnter);
            this.div.removeEventListener('mouseleave', this._onMouseLeave);
            this._onMouseEnter = () => {
              this.div.style.zIndex = "10000";
            };
            this._onMouseLeave = () => {
              this.div.style.zIndex = this.isCurrentOverlay ? "9999" : "0";
            };
            this.div.style.zIndex = this.isCurrentOverlay ? "9999" : "0";
            this.div.addEventListener('mouseenter', this._onMouseEnter);
            this.div.addEventListener('mouseleave', this._onMouseLeave);
          }

          if (this.div && this.root) {
            const shouldRender = !this.isValidChartData || (this.isValidChartData && this.isMoistMarkerChartDrawn);
            if (shouldRender) {
              console.log('rerendered')
              this.root.render(this.renderContent());
            }
          }
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
              this.chartData.sensorId,
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
          console.log('chart data is valid but freshness id undefined', this.chartData.sensorId, this.chartData.freshness)
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
                  background: this.borderColor
                }}>
                  <div style={{display: this.isMoistMarkerChartDrawn ? 'block' : 'none'}}
                       id={`${this.prefix}-${this.chartData.id}`} className={s.overlay_chart}></div>
                  {this.isMoistMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                  {this.chartData.battery && <p className={s.chartName}>{this.chartData.battery}</p>}
                  <p>{this.chartData.sensorId}</p>
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
                  <p className={s.chartName}>{this.chartData.sensorId}</p>
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
        new Promise(async (resolve: any) => {
          const divId = `overlay-${this.prefix}-${this.chartData.id}`;
          this.div = document.getElementById(divId);

          if (this.div) return resolve();

          await this.setBorderColor()
          this.div = document.createElement("div");
          this.div.id = divId;
          this.div.style.position = "absolute";
          this.div.style.WebkitTransform = 'translateZ(0)';
          this.div.style.borderRadius = '12px';

          const setupZIndex = () => {
            if (this.prefix === 'b') {
              this.div.style.zIndex = this.isCurrentOverlay ? "9999" : "0";
              if (!this.isCurrentOverlay) addHoverEffect();
            } else {
              addHoverEffect();
            }
          }

          const addHoverEffect = () => {
            this.div.addEventListener('mouseenter', () => {
              this.div.style.zIndex = "10000";
            });
            this.div.addEventListener('mouseleave', () => {
              this.div.style.zIndex = "0";
            });
          }

          setupZIndex();

          if (this.chartData.battery && !this.chartData.battery.toString().includes(" VDC")) {
            this.chartData.battery += " VDC";
          }

          this.offset = {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20
          };

          const panes: any = this.getPanes();
          panes.floatPane.appendChild(this.div);

          if (!this.root) {
            this.root = createRoot(this.div);
          }
          this.root.render(this.renderContent());

          resolve();
        }).then(() => {
          if (this.isValidChartData) {
            this.setMoistOverlays((overlays: any[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);

              if (!overlayExists) {
                if (this.prefix === 'b') {
                  if (!this.moistOverlaysRef.current.some((overlay: any) => overlay.chartData.id === this.chartData.id)) {
                    this.moistOverlaysRef.current.push(this);
                  }
                }
                return [...overlays, this];
              }

              return overlays;
            });
          } else if (this.prefix === 'b') {
            this.setMoistOverlays((overlays: any[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);

              if (!overlayExists) {
                if (!this.moistOverlaysRef.current.some((overlay: any) => overlay.chartData.id === this.chartData.id)) {
                  this.moistOverlaysRef.current.push(this);
                }
                return [...overlays, this];
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

      setMap(map: any) {
        return new Promise((resolve: any) => {
          super.setMap(map);
          resolve();
        });
      }
    }
  }
}