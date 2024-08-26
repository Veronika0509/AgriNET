import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onTempSensorClick} from "../../../functions/types/temp/onTempSensorClick";
import {moveOverlays} from "../../../functions/moveOverlays";
import {useIonToast} from "@ionic/react";

export const initializeTempCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: any;
      private isAllCoordinatesOfMarkersAreReady: any
      private overlappingPairs: any
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private history: any
      private isTempMarkerChartDrawn: boolean
      private setAdditionalChartData: any
      private siteList: any
      private setTempOverlays: any
      private setChartPageType: any
      private userId: any
      private present: any

      private layerName: string
      private root: any;
      private div?: any;

      constructor(
        bounds: google.maps.LatLngBounds,
        isValidChartData: boolean,
        chartData: any,
        isAllCoordinatesOfMarkersAreReady: any,
        overlappingPairs: any,
        setChartData: any,
        setPage: any,
        setSiteId: any,
        setSiteName: any,
        history: any,
        isTempMarkerChartDrawn: boolean,
        setAdditionalChartData: any,
        siteList: any,
        setTempOverlays: any,
        setChartPageType: any,
        userId: any,
        present: any
      ) {
        super();

        this.bounds = bounds;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.isAllCoordinatesOfMarkersAreReady = isAllCoordinatesOfMarkersAreReady
        this.overlappingPairs = overlappingPairs
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.history = history
        this.isTempMarkerChartDrawn = isTempMarkerChartDrawn
        this.setAdditionalChartData = setAdditionalChartData
        this.siteList = siteList
        this.layerName = chartData.layerName
        this.setTempOverlays = setTempOverlays
        this.setChartPageType = setChartPageType
        this.userId = userId
        this.present = present
      }

      update() {
        if (this.div && this.isTempMarkerChartDrawn && this.root) {
          this.root.render(this.renderContent());
        }

        this.draw()
      }

      renderContent() {
        console.log(this.chartData.id)
        return (
          <div className={s.overlayContainer}>
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
                <div className={s.chartContainer}>
                  <div id={this.chartData.id} className={s.chart} style={{ display: this.isTempMarkerChartDrawn ? 'block' : 'none' }}></div>
                  {this.isTempMarkerChartDrawn ? null : (
                    <div className={s.loader}></div>
                  )}
                  <p className={s.underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlayInfo}>
                  <p className={s.chartName}>{this.chartData.name}</p>
                  {this.chartData.batteryPercentage && <p className={s.chartName}>Battery: {this.chartData.batteryPercentage}%</p>}
                  <p>{this.chartData.sensorId}</p>
                </div>
              </div>
            ) : (
              <div className={`${s.overlayContainer} ${s.invalidOverlayContainer}`}>
                <div className={s.wxetNotValidData}>
                  <div className={s.wxetNotValidDataRectangle}>
                    <p className={s.wxetNotValidDataRectangleText}>no data</p>
                  </div>
                  <p className={`${s.wxetNotValidName} ${s.underInformationOverlayText}`}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlayInfo}>
                  <p className={s.overlayText}>{this.chartData.sensorId}</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      onAdd() {
        new Promise((resolve: any) => {
          const divId = `overlay-${this.chartData.mainId}`;
          this.div = document.getElementById(divId);

          if (!this.div) {
            this.div = document.createElement("div");
            this.div.id = divId;
            this.div.style.borderStyle = "none";
            this.div.style.borderWidth = "0px";
            this.div.style.position = "absolute";

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
            this.setTempOverlays((overlays: any) => [...overlays, this]);
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