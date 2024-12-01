import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onTempSensorClick} from "../../../functions/types/temp/onTempSensorClick";
import {moveOverlays} from "../../../functions/moveOverlays";
import {useIonToast} from "@ionic/react";
import {adjustOverlayPosition} from "../../../functions/adjustOverlayPosition";

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
      private offset: { x: number; y: number };
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
        this.offset = { x: 0, y: 0 };
      }

      update() {
        if (this.div && this.isTempMarkerChartDrawn && this.root) {
          this.root.render(this.renderContent());
        }

        this.draw()
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
// Add a small random initial offset to help prevent perfect overlaps
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
          // Apply the stored offset when drawing
          this.div.style.left = `${pixel.x + this.offset.x}px`;
          this.div.style.top = `${pixel.y + this.offset.y}px`;
        }
      }

      updatePosition(x: number, y: number) {
        this.offset.x += x;
        this.offset.y += y;
        this.draw();
      }

      getDiv() {
        return this.div;
      }
      // draw() {
      //   const projection = this.getProjection()
      //   const sw: any = projection.fromLatLngToDivPixel(this.bounds.getSouthWest());
      //   const ne: any = projection.fromLatLngToDivPixel(this.bounds.getNorthEast());
      //
      //   if (this.div) {
      //     this.div.style.left = sw.x + "px";
      //     this.div.style.top = ne.y + "px";
      //   }
      //   // const projection = this.getProjection();
      //   // const map: any = this.getMap();
      //   // if (!projection || !map) return;
      //   //
      //   // const offset = adjustOverlayPosition(
      //   //   projection,
      //   //   this,
      //   //   this.isAllCoordinatesOfMarkersAreReady,
      //   //   this.bounds,
      //   //   map
      //   // );
      //   //
      //   // const position = this.bounds.getCenter();
      //   // const pixel: any = projection.fromLatLngToDivPixel(position);
      //   //
      //   // if (this.div && offset) {
      //   //   this.div.style.left = (pixel.x + offset.x) + "px";
      //   //   this.div.style.top = (pixel.y + offset.y) + "px";
      //   // }
      //   // moveOverlays(
      //   //   projection,
      //   //   this.bounds,
      //   //   this.div,
      //   //   this.isAllCoordinatesOfMarkersAreReady,
      //   //   this.chartData.mainId,
      //   //   this.overlappingPairs
      //   // )
      // }

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