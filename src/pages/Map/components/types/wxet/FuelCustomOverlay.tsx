import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import {truncateText} from "../../../functions/truncateTextFunc";
import {getOptions} from "../../../data/getOptions";
import skull from "../../../../../assets/images/skull.svg";
import {onFuelSensorClick} from "../../../functions/types/wxet/onFuelSensorClick";

// Интерфейсы для типизации
interface FuelChartData {
  id: string | number;
  mainId: string | number;
  layerName: string;
  name: string;
  sensorId: string;
  batteryPercentage?: number;
  freshness?: string;
  [key: string]: unknown;
}

interface History {
  push: (path: string) => void;
  [key: string]: unknown;
}

interface FuelCustomOverlayInstance {
  chartData: FuelChartData;
  [key: string]: unknown;
}

export const initializeFuelCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private setChartData: (data: unknown) => void
      private setPage: (page: number) => void
      private setSiteId: (id: string | number) => void
      private setSiteName: (name: string) => void
      private history: History
      private bounds: google.maps.LatLngBounds;
      private isValidData: boolean;
      private chartData: FuelChartData;
      private setChartPageType: (type: string) => void
      private isFuelMarkerChartDrawn: boolean
      private borderColor: string
      private setFuelOverlays: (overlays: FuelCustomOverlayInstance[] | ((prev: FuelCustomOverlayInstance[]) => FuelCustomOverlayInstance[])) => void

      private root: ReturnType<typeof createRoot> | null;
      private offset: { x: number; y: number };
      private div?: HTMLElement | null;
      private isTextTruncated: boolean

      constructor(
        setChartData: (data: unknown) => void,
        setPage: (page: number) => void,
        setSiteId: (id: string | number) => void,
        setSiteName: (name: string) => void,
        history: History,
        bounds: google.maps.LatLngBounds,
        isValidData: boolean,
        data: FuelChartData,
        setChartPageType: (type: string) => void,
        isFuelMarkerChartDrawn: boolean,
        setFuelOverlays: (overlays: FuelCustomOverlayInstance[] | ((prev: FuelCustomOverlayInstance[]) => FuelCustomOverlayInstance[])) => void
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

        this.offset = {x: 0, y: 0};
        this.isTextTruncated = this.chartData.name.length > 7
        this.borderColor = 'gray'
        this.root = null
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
                  String(this.chartData.sensorId),
                  this.chartData.name,
                  this.setChartData,
                  this.setPage,
                  this.setSiteId,
                  this.setSiteName,
                  this.setChartPageType
                )
              }}>
                <div className={s.overlay_chartContainer} style={{background: this.borderColor}}>
                  <div id={String(this.chartData.id)} className={s.overlay_chart}
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
                  <p>{String(this.chartData.sensorId)}</p>
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
                  <p className={s.chartName}>{String(this.chartData.sensorId)}</p>
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
        new Promise<void>(async (resolve) => {
          const divId = `overlay-${String(this.chartData.mainId)}`;
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
            this.setBorderColor().then(() => {
              if (this.root) {
                this.root.render(this.renderContent());
                this.draw();
              }
            });
          }
          resolve()
        }).then(() => {
          if (this.isValidData) {
            this.setFuelOverlays((overlays: FuelCustomOverlayInstance[]) => {
              const newOverlayId = this.chartData.id;
              const overlayExists = overlays.some(overlay => overlay.chartData.id === newOverlayId);

              if (!overlayExists) {
                return [...overlays, this as unknown as FuelCustomOverlayInstance];
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