import s from "../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../functions/truncateTextFunc";

const overlaysOverlap = (overlayProjection: any, overlayA: any, overlayB: any) => {
  const positionA = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlayA.lat, overlayA.lng));
  const positionB = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlayB.lat, overlayB.lng));
  return Math.abs(positionA.x - positionB.x) < 100 && Math.abs(positionA.y - positionB.y) < 130;
}

export const initializeCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private invalidChartDataImage: any;
      private isValidChartData: boolean;
      private chartData: any;
      private setOverlayIsReady: any
      private onSensorClick: any
      private isAllMoistFuelCoordinatesOfMarkersAreReady: any
      private overlappingPairs: any
      private sensorId: string
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private history: any
      private isChartDrawn: boolean
      private root: any;

      private div?: any;

      constructor(bounds: google.maps.LatLngBounds, invalidChartDataImage: any, isValidChartData: boolean, chartData: any, setOverlayIsReady: any, onSensorClick: any, isAllMoistFuelCoordinatesOfMarkersAreReady: any, overlappingPairs: any, sensorId: string, setChartData: any, setPage: any, setSiteId: any, setSiteName: any, history: any, overlayIsReady: any, isChartDrawn: boolean) {
        super();

        this.bounds = bounds;
        this.onSensorClick = onSensorClick
        this.invalidChartDataImage = invalidChartDataImage;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.setOverlayIsReady = setOverlayIsReady;
        this.isAllMoistFuelCoordinatesOfMarkersAreReady = isAllMoistFuelCoordinatesOfMarkersAreReady
        this.overlappingPairs = overlappingPairs
        this.sensorId = sensorId
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.history = history
        this.isChartDrawn = isChartDrawn
      }

      update() {
        if (this.div && this.isChartDrawn && this.root) {
          this.root.render(this.renderContent());
        }
      }

      renderContent() {
        return (
          <div className={s.overlayContainer}>
            {this.isValidChartData ? (
              <div className={s.mainContainer} onClick={() => this.onSensorClick(this.history, this.chartData.sensorId, this.chartData.name, this.sensorId, this.setChartData, this.setPage, this.setSiteId, this.setSiteName)}>
                <div className={s.chartContainer}>
                  <div id={this.chartData.id.toString()} className={s.chart}>
                    {this.isChartDrawn ? null : (
                      <div className={s.loader}></div>
                    )}
                  </div>
                </div>
                <div className={s.chartInfo}>
                  <p className={s.chartName}>{this.chartData.name}</p>
                  {this.chartData.battery && <p className={s.chartName}>{this.chartData.battery}</p>}
                  <p>{this.chartData.sensorId}</p>
                </div>
              </div>
            ) : (
              <div>
                <div className={s.invalidChartDataImgContainer}>
                  <img src={this.invalidChartDataImage} className={s.invalidChartDataImg} alt='Invalid Chart Data'/>
                  <p className={s.invalidSensorIdText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.chartInfo}>
                  <p className={s.chartName}>{this.chartData.sensorId}</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      onAdd() {
        const onAddContent = new Promise((resolve: any) => {
          const divId = `overlay-${this.chartData.sensorId}`;
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

            this.draw()
          }

          resolve();
        }).then(() => {
          this.setOverlayIsReady((overlays: any) => [...overlays, this]);
        })
      }

      draw() {
        const overlayProjection = this.getProjection();

        const sw: any = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
        const ne: any = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());

        if (this.div) {
          this.div.style.left = sw.x + "px";
          this.div.style.top = ne.y + "px";
          this.div.style.width = "100px";
          this.div.style.height = "110px";
        }

        const overlays: any = this.isAllMoistFuelCoordinatesOfMarkersAreReady
        for (let i = 0; i < overlays.length; i++) {
          for (let j = i + 1; j < overlays.length; j++) {
            if (this.chartData.sensorId === overlays[i].id) {
              overlays[i] = {
                id: overlays[i].id,
                lat: overlays[i].lat,
                lng: overlays[i].lng,
                div: this.div
              }
            } else if (this.chartData.sensorId === overlays[j].id) {
              overlays[j] = {
                id: overlays[j].id,
                lat: overlays[j].lat,
                lng: overlays[j].lng,
                div: this.div
              }
            }
            const newPair = [overlays[i], overlays[j]];
            if (overlaysOverlap(overlayProjection, overlays[i], overlays[j])) {
              const isPairExists = this.overlappingPairs.some((pair: any) =>
                (pair[0] === newPair[0] && pair[1] === newPair[1]) ||
                (pair[0] === newPair[1] && pair[1] === newPair[0])
              );

              if (!isPairExists) {
                this.overlappingPairs.push(newPair);
              }
            } else {
              this.overlappingPairs = this.overlappingPairs.filter((pair: any) =>
                !((pair[0] === newPair[0] && pair[1] === newPair[1]) ||
                  (pair[0] === newPair[1] && pair[1] === newPair[0]))
              );
            }
          }
        }

        this.overlappingPairs.map((newPair: any) => {
          const overlay1 = newPair[0]
          const overlay2 = newPair[1]

          if (overlay1.div && overlay2.div) {
            const position1: any = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlay1.lat, overlay1.lng));
            const position2: any = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlay2.lat, overlay2.lng));

            let offsetX, offsetY;

            const dx = position2.x - position1.x;
            const dy = position2.y - position1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const offsetDistance = 80

            if (distance === 0) {
              offsetX = offsetDistance;
              offsetY = -offsetDistance;
            } else {
              const nx = dx / distance;
              const ny = dy / distance;
              offsetX = nx * offsetDistance;
              offsetY = ny * offsetDistance;
            }

            if (overlay1.div) {
              overlay1.div.style.left = `${position1.x - offsetX}px`;
              overlay1.div.style.top = `${position1.y - offsetY}px`;
            }

            if (overlay2.div) {
              overlay2.div.style.left = `${position2.x + offsetX}px`;
              overlay2.div.style.top = `${position2.y + offsetY}px`;
            }
          }
        })
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