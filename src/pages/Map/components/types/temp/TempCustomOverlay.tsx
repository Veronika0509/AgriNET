import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onTempSensorClick} from "../../../functions/types/temp/onTempSensorClick";

export const initializeTempCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: any;
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private history: any
      private isTempMarkerChartDrawn: boolean
      private setAdditionalChartData: any
      private setTempOverlays: any
      private setChartPageType: any
      private userId: any
      private present: any

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
        history: any,
        isTempMarkerChartDrawn: boolean,
        setAdditionalChartData: any,
        setTempOverlays: any,
        setChartPageType: any,
        userId: any,
        present: any
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

        this.layerName = chartData.layerName
        this.offset = { x: 0, y: 0 };
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
                <div className={s.overlay_chartContainer}>
                  <div id={this.chartData.id} className={s.overlay_chart} style={{ display: this.isTempMarkerChartDrawn ? 'block' : 'none' }}></div>
                  {this.isTempMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  <p className={s.chartName}>{this.chartData.name}</p>
                  {this.chartData.batteryPercentage && <p className={s.chartName}>Battery: {this.chartData.batteryPercentage}%</p>}
                  <p>{this.chartData.sensorId}</p>
                </div>
              </div>
            ) : (
              <div className={`${s.overlay_container} ${s.overlay_invalidOverlayContainer}`}>
                <div className={s.overlay_wxetNotValidData}>
                  <div className={s.overlay_wxetNotValidDataRectangle}>
                    <p className={s.overlay_wxetNotValidDataRectangleText}>no data</p>
                  </div>
                  <p className={`${s.overlay_wxetNotValidName} ${s.overlay_underInformationOverlayText}`}>{truncateText(this.chartData.name)}</p>
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
          }
          resolve()
        }).then(() => {
          if (this.isValidChartData) {
            this.setTempOverlays((overlays: any[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);

              if (!overlayExists) {
                return [...overlays, this];
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
        if (this.div) {
          (this.div.parentNode as HTMLElement).removeChild(this.div);
          delete this.div;
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