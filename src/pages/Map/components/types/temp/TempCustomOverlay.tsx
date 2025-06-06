import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onTempSensorClick} from "../../../functions/types/temp/onTempSensorClick";
import skull from "../../../../../assets/images/skull.svg";
import alarm from "../../../../../assets/images/icons/wxetAlarm.png";

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
      private isTextTruncated: boolean
      private borderColor: any

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
                  <div id={this.chartData.id} className={s.overlay_chart} style={{ display: this.isTempMarkerChartDrawn ? 'block' : 'none' }}>
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
                  <p>{this.chartData.sensorId}</p>
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
                  <p className={s.chartName}>{this.chartData.sensorId}</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      async setBorderColor() {
        const freshnessColors: any = {
          '30m': 'yellow',
          '60m': 'green',
          '1h': 'green',
          '6h': 'yellow',
          '12h': 'red',
        };
        this.borderColor = freshnessColors[this.chartData.freshness]
      }

      onAdd() {
        new Promise(async (resolve: any) => {
          const divId = `overlay-${this.chartData.id}`;
          this.div = document.getElementById(divId);

          if (!this.div) {
            await this.setBorderColor()
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