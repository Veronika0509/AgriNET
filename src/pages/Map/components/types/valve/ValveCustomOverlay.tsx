import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {onValveSensorClick} from "../../../functions/types/valve/onValveSensorClick";
import {truncateText} from "../../../functions/truncateTextFunc";
import {simpleColors} from "../../../../../assets/getColors";
// import {onMoistSensorClick} from "../../../functions/types/moist/onMoistSensorClick";

export const initializeValveCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: any;
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private setChartPageType: any
      private history: any
      private isValveMarkerChartDrawn: boolean
      private setValveOverlays: any
      private userId: any
      private bgColor: any

      private layerName: string
      private root: any;
      private offset: { x: number; y: number };
      private div?: any;

      constructor(
        bounds: google.maps.LatLngBounds,
        isValidChartData: boolean,
        chartData: any,
        setChartData: any,
        setPage: any,
        setSiteId: any,
        setSiteName: any,
        setChartPageType: any,
        history: any,
        isValveMarkerChartDrawn: boolean,
        setValveOverlays: any,
        userId: any
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
        this.bgColor = this.chartData.bgColor && simpleColors[this.chartData.bgColor.toLowerCase()]

        this.layerName = chartData.layerName
        this.offset = { x: 0, y: 0 };
      }

      update() {
        return new Promise<void>((resolve) => {
          if (this.div && this.isValveMarkerChartDrawn && this.root) {
            this.root.render(this.renderContent());
          }
          resolve();
        });
      }

      renderContent() {
        return (
          <div className={`${s.overlay_container}`} onClick={() => onValveSensorClick(
            this.history,
            this.userId,
            this.chartData.sensorId,
            this.chartData.name,
            this.setChartData,
            this.setPage,
            this.setSiteId,
            this.setSiteName,
            this.setChartPageType
          )}>
            {this.isValidChartData ? (
              <div>
                <div className={`${s.overlay_chartContainer} ${s.overlay_valveChartContainer}`}>
                  <div className={s.overlay_chartWrapper} style={this.chartData.bgColor && {background: `#${this.bgColor}`}}>
                    <div style={{
                      display: this.isValveMarkerChartDrawn ? 'block' : 'none',
                      ...(this.bgColor && { background: `#${this.bgColor}` })
                    }} id={`${this.chartData.id}`}
                         className={`${s.overlay_chart} ${s.overlay_chart__valve}`}></div>
                    <div
                      className={`${s.overlay_valveEnabled} ${this.chartData.enabled && s.overlay_valveEnabled__enabled}`}></div>
                  </div>
                  {this.isValveMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p style={{marginTop: this.isValveMarkerChartDrawn ? '0' : '15px'}}
                     className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  <p className={s.chartName}>{this.chartData.name}</p>
                  <p>{this.chartData.sensorId}</p>
                </div>
              </div>
            ) : (
              <div className={`${s.overlay_container} ${s.overlay_invalidOverlayContainer}`}>
                <div className={s.overlay_wxetNotValidData}>
                  <div className={s.overlay_wxetNotValidDataRectangle}>
                    <p className={s.overlay_wxetNotValidDataRectangleText}>no data</p>
                  </div>
                  <p
                    className={`${s.overlay_wxetNotValidName} ${s.overlay_underInformationOverlayText}`}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  <p className={s.overlay_text}>{this.chartData.sensorId}</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      onAdd() {
        new Promise((resolve: any) => {
          const divId = `overlay-${this.chartData.id}`;
          this.div = document.getElementById(divId);

          if (!this.div) {
            this.div = document.createElement("div");
            this.div.id = divId;
            this.div.style.borderStyle = "none";
            this.div.style.borderWidth = "0px";
            this.div.style.position = "absolute";
            this.div.style.WebkitTransform = 'translateZ(0)';
            this.div.addEventListener('mouseenter', () => {
              this.div.style.zIndex = "9999";
            });
            this.div.addEventListener('mouseleave', () => {
              this.div.style.zIndex = "0";
            });

            this.offset = {
              x: (Math.random() - 0.5) * 20,
              y: (Math.random() - 0.5) * 20
            };
            const panes: any = this.getPanes();
            panes.floatPane.appendChild(this.div);
            if (!this.root) {
              this.root = createRoot(this.div);
            }
            const content = this.renderContent()
            this.root.render(content);
          }
          resolve()
        }).then(() => {
          if (this.isValidChartData) {
            this.setValveOverlays((overlays: any[]) => {
              const overlayExists = overlays.some(overlay => overlay.chartData.id === this.chartData.id);

              if (!overlayExists) {
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
          (this.div.parentNode as HTMLElement).removeChild(this.div);
          delete this.div;
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

      setMap(map: any) {
        return new Promise((resolve: any) => {
          super.setMap(map);
          resolve();
        });
      }
    }
  }
}