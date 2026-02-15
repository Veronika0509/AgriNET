import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import {onValveSensorClick} from "../../../functions/types/valve/onValveSensorClick";
import {truncateText} from "../../../functions/truncateTextFunc";
import {simpleColors} from "../../../../../assets/getColors";
import skull from "../../../../../assets/images/skull.svg";
import {IonAlert} from '@ionic/react';
import React from 'react';

interface ValveChartData {
  id: string | number;
  sensorId: string;
  name: string;
  bgColor?: string;
  enabled?: boolean;
}

interface History {
  push: (path: string) => void;
}

interface ValveCustomOverlayInstance {
  chartData: ValveChartData;
  [key: string]: unknown;
}

export const initializeValveCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: ValveChartData;
      private setChartData: (data: unknown) => void
      private setPage: (page: number) => void
      private setSiteId: (id: string) => void
      private setSiteName: (name: string) => void
      private setChartPageType: (type: string) => void
      private history: History
      private isValveMarkerChartDrawn: boolean
      private setValveOverlays: (fn: (overlays: ValveCustomOverlayInstance[]) => ValveCustomOverlayInstance[]) => void
      private userId: string | number
      private bgColor: string | undefined

      private root: ReturnType<typeof createRoot> | null;
      private offset: { x: number; y: number };
      private div: HTMLElement | null;
      private isTextTruncated: boolean
      private longPressTimer: NodeJS.Timeout | null = null;
      private showInfoDialog: boolean = false;
      private wasLongPress: boolean = false;

      constructor(
        bounds: google.maps.LatLngBounds,
        isValidChartData: boolean,
        chartData: ValveChartData,
        setChartData: (data: unknown) => void,
        setPage: (page: number) => void,
        setSiteId: (id: string) => void,
        setSiteName: (name: string) => void,
        setChartPageType: (type: string) => void,
        history: History,
        isValveMarkerChartDrawn: boolean,
        setValveOverlays: (fn: (overlays: ValveCustomOverlayInstance[]) => ValveCustomOverlayInstance[]) => void,
        userId: string | number
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
        this.bgColor = this.chartData.bgColor ? simpleColors[this.chartData.bgColor.toLowerCase()] : undefined

        this.root = null
        this.div = null
        this.offset = { x: 0, y: 0 };
        this.isTextTruncated = this.chartData.name.length > 7
      }

      update() {
        return new Promise<void>((resolve) => {
          if (this.div && this.isValveMarkerChartDrawn && this.root) {
            this.root.render(this.renderContent());
          }
          resolve();
        });
      }

      private handleTouchStart = (e: React.TouchEvent) => {
        this.wasLongPress = false;
        this.longPressTimer = setTimeout(() => {
          this.wasLongPress = true;
          this.showInfoDialog = true;
          if (this.root) {
            this.root.render(this.renderContent());
          }
        }, 600);
      };

      private handleTouchEnd = () => {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
        setTimeout(() => {
          this.wasLongPress = false;
        }, 100);
      };

      private handleTouchMove = () => {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      };

      private closeInfoDialog = () => {
        this.showInfoDialog = false;
        if (this.root) {
          this.root.render(this.renderContent());
        }
      };

      renderContent() {
        const infoMessage = this.isValidChartData
          ? [
              this.isTextTruncated ? `Name: ${this.chartData.name}` : null,
              `Sensor ID: ${String(this.chartData.sensorId)}`
            ].filter(Boolean).join('\n')
          : [
              this.isTextTruncated ? `Name: ${this.chartData.name}` : null,
              `Sensor ID: ${String(this.chartData.sensorId)}`
            ].filter(Boolean).join('\n');

        return (
          <React.Fragment>
          <div
            className={`${s.overlay_container}`}
            onClick={() => {
              if (this.wasLongPress) return;
              onValveSensorClick(
                this.history,
                this.userId,
                String(this.chartData.sensorId),
                this.chartData.name,
                this.setChartData,
                this.setPage,
                this.setSiteId,
                this.setSiteName,
                this.setChartPageType
              );
            }}
            onTouchStart={this.handleTouchStart}
            onTouchEnd={this.handleTouchEnd}
            onTouchMove={this.handleTouchMove}
          >
            {this.isValidChartData ? (
              <div>
                <div className={`${s.overlay_chartContainer} ${s.overlay_valveChartContainer}`} style={{background: '#96fd66'}}>
                  <div className={s.overlay_chartWrapper} style={this.chartData.bgColor && this.bgColor ? {background: `#${this.bgColor}`} : undefined}>
                    <div style={{
                      display: this.isValveMarkerChartDrawn ? 'block' : 'none',
                      ...(this.bgColor && {background: `#${this.bgColor}`})
                    }} id={String(this.chartData.id)}
                         className={`${s.overlay_chart} ${s.overlay_chart__valve}`}>
                      <div
                        className={`${s.overlay_valveEnabled} ${this.chartData.enabled && s.overlay_valveEnabled__enabled}`}></div>
                    </div>
                  </div>
                  {this.isValveMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p style={{
                    marginTop: this.isValveMarkerChartDrawn ? '0' : '15px',
                    color: (this.chartData.freshness === '3d' || this.chartData.freshness === 'outdated') ? '#fff' : '#000'
                  }}
                     className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name)}</p>
                </div>
                <div className={s.overlay_info}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                  <p>{String(this.chartData.sensorId)}</p>
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
                  <p className={s.chartName}>{String(this.chartData.sensorId)}</p>
                </div>
              </div>
            )}
          </div>
          <IonAlert
            isOpen={this.showInfoDialog}
            onDidDismiss={this.closeInfoDialog}
            header="Sensor Information"
            message={infoMessage}
            buttons={['OK']}
          />
          </React.Fragment>
        );
      }

      onAdd() {
        new Promise<void>((resolve: () => void) => {
          const divId = `overlay-${String(this.chartData.id)}`;
          this.div = document.getElementById(divId) as HTMLElement | null;

          if (!this.div) {
            this.div = document.createElement("div");
            this.div.id = divId;
            this.div.style.borderStyle = "none";
            this.div.style.borderWidth = "0px";
            this.div.style.position = "absolute";
            this.div.style.webkitTransform = 'translateZ(0)';
            this.div.addEventListener('mouseenter', () => {
              if (this.div) {
                this.div.style.zIndex = "9999";
              }
            });
            this.div.addEventListener('mouseleave', () => {
              if (this.div) {
                this.div.style.zIndex = "0";
              }
            });

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
              const content = this.renderContent()
              this.root.render(content);
            }
          }
          resolve()
        }).then(() => {
          if (this.isValidChartData) {
            this.setValveOverlays((overlays: ValveCustomOverlayInstance[]) => {
              const overlayExists = overlays.some(overlay => overlay.chartData.id === this.chartData.id);

              if (!overlayExists) {
                return [...overlays, this as unknown as ValveCustomOverlayInstance];
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
        if (this.div && this.div.parentNode) {
          (this.div.parentNode as HTMLElement).removeChild(this.div);
          this.div = null;
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