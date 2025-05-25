import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {getOptions} from "../../../data/getOptions";
import skull from "../../../../../assets/images/skull.svg";
import {onFuelSensorClick} from "../../../functions/types/wxet/onFuelSensorClick";

export const initializeFuelCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private history: any
      private bounds: google.maps.LatLngBounds;
      private isValidData: boolean;
      private chartData: any;
      private setChartPageType: any
      private isFuelMarkerChartDrawn: boolean
      private borderColor: any
      private setFuelOverlays: any

      private layerName: string
      private root: any;
      private offset: { x: number; y: number };
      private div?: any;
      private isTextTruncated: boolean

      constructor(
        setChartData: any,
        setPage: any,
        setSiteId: any,
        setSiteName: any,
        history: any,
        bounds: google.maps.LatLngBounds,
        isValidData: boolean,
        data: any,
        setChartPageType: any,
        isFuelMarkerChartDrawn: any,
        setFuelOverlays: any
      ) {
        super();

        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.history = history
        this.bounds = bounds
        this.isValidData = isValidData
        this.chartData = data
        this.setChartPageType = setChartPageType
        this.isFuelMarkerChartDrawn = isFuelMarkerChartDrawn
        this.setFuelOverlays = setFuelOverlays

        this.layerName = data.layerName
        this.offset = {x: 0, y: 0};
        this.isTextTruncated = this.chartData.name.length > 7
        this.borderColor = 'gray'
      }

      update() {
        return new Promise<void>((resolve) => {
          if (this.div && this.isFuelMarkerChartDrawn && this.root) {
            this.root.render(this.renderContent());
          }
          resolve();
        });
      }

      renderContent() {
        return (
          <div className={s.overlay_fuelContainer}>
            {this.isValidData ? (
              <div className={s.mainContainer} onClick={() => {
                onFuelSensorClick(
                  this.history,
                  this.chartData.sensorId,
                  this.chartData.name,
                  this.setChartData,
                  this.setPage,
                  this.setSiteId,
                  this.setSiteName,
                  this.setChartPageType
                )
              }}>
                <div className={s.overlay_chartContainer} style={{background: this.borderColor}}>
                  <div id={this.chartData.id} className={s.overlay_chart}
                       style={{display: this.isFuelMarkerChartDrawn ? 'block' : 'none'}}></div>
                  {this.isFuelMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={`${s.overlay_info} ${s.overlay_fuelInfo}`}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                  {this.chartData.batteryPercentage &&
                      <p className={s.chartName}>Battery: {this.chartData.batteryPercentage}%</p>}
                  <p>{this.chartData.sensorId}</p>
                </div>
              </div>
            ) : (
              <div className={s.overlay_skullImage}>
                <div className={s.overlay_skullImageContent}>
                  <img src={skull} alt=""/>
                  <p>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={`${s.overlay_info} ${s.overlay_fuelInfo}`}>
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
          const divId = `overlay-${this.chartData.mainId}`;
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
            this.setBorderColor().then(() => {
              this.root.render(this.renderContent());
              this.draw();
            });
          }
          resolve()
        }).then(() => {
          if (this.isValidData) {
            this.setFuelOverlays((overlays: any[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);

              if (!overlayExists) {
                return [...overlays, this];
              }

              return overlays;
            });
          }
        })
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