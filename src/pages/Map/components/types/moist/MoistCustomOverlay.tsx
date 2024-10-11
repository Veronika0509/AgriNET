import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onMoistSensorClick} from "../../../functions/types/moist/onMoistSensorClick";
import {moveOverlays} from "../../../functions/moveOverlays";

export const initializeMoistCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private invalidChartDataImage: any;
      private isValidChartData: boolean;
      private chartData: any;
      private isAllCoordinatesOfMarkersAreReady: any
      private overlappingPairs: any
      // private sensorId: string
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

      private layerName: string
      private root: any;
      private div?: any;

      constructor(
        bounds: google.maps.LatLngBounds,
        invalidChartDataImage: any,
        isValidChartData: boolean,
        chartData: any,
        isAllCoordinatesOfMarkersAreReady: any,
        overlappingPairs: any,
        // sensorId: string,
        setChartData: any,
        setPage: any,
        setSiteId: any,
        setSiteName: any,
        history: any,
        isMoistMarkerChartDrawn: boolean,
        setAdditionalChartData: any,
        siteList: any,
        setMoistOverlays: any,
        setChartPageType: any
      ) {
        super();

        this.bounds = bounds;
        this.invalidChartDataImage = invalidChartDataImage;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.isAllCoordinatesOfMarkersAreReady = isAllCoordinatesOfMarkersAreReady
        this.overlappingPairs = overlappingPairs
        // this.sensorId = sensorId
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.history = history
        this.isMoistMarkerChartDrawn = isMoistMarkerChartDrawn
        this.setAdditionalChartData = setAdditionalChartData
        this.siteList = siteList
        this.layerName = chartData.layerName
        this.setMoistOverlays = setMoistOverlays
        this.setChartPageType = setChartPageType
      }

      update() {
        if (this.div && this.isMoistMarkerChartDrawn && this.root) {
          this.root.render(this.renderContent());
        }
      }

      renderContent() {
        return (
          <div className={s.overlayContainer} onClick={() => onMoistSensorClick(
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
          )}>
            {this.isValidChartData ? (
              <div className={s.mainContainer}>
                <div className={s.chartContainer}>
                  <div id={this.chartData.id} className={s.chart} style={{ display: this.isMoistMarkerChartDrawn ? 'block' : 'none' }}></div>
                  {this.isMoistMarkerChartDrawn ? null : (
                    <div className={s.loader}></div>
                  )}
                  <p className={s.underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlayInfo}>
                  <p className={s.chartName}>{this.chartData.name}</p>
                  {this.chartData.battery && <p className={s.chartName}>{this.chartData.battery}</p>}
                  <p>{this.chartData.sensorId}</p>
                </div>
              </div>
            ) : (
              <div className={`${s.overlayContainer} ${s.invalidOverlayContainer}`}>
                <div className={s.invalidMoistChartDataImgContainer}>
                  <img src={this.invalidChartDataImage} className={s.invalidChartDataImg} alt='Invalid Chart Data'/>
                  <p className={s.underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlayInfo}>
                  <p className={s.chartName}>{this.chartData.sensorId}</p>
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

            if (this.chartData.battery !== null) {
              if (!this.chartData.battery.toString().includes(" VDC")) {
                this.chartData.battery = this.chartData.battery + ' VDC'
              }
            }

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
            this.setMoistOverlays((overlays: any[]) => {
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

      draw() {
        const projection = this.getProjection()
        moveOverlays(
          projection,
          this.bounds,
          this.div,
          this.isAllCoordinatesOfMarkersAreReady,
          this.chartData.mainId,
          this.overlappingPairs
        )
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

      getPosition() {
        if (this.bounds) {
          return this.bounds.getCenter();
        } else {
          return null;
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