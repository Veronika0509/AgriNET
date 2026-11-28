import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import {truncateText} from "../../../functions/truncateTextFunc";
import skull from "../../../../../assets/images/skull.svg";
import alarm from "../../../../../assets/images/icons/wxetAlarm.png";
import type { SensorInfo } from "../../modals/SensorInfoDialog";
import { LongPressTracker } from "../../../utils/longPress";
import { UNIVERSAL_FRESHNESS_COLORS } from "../../../config/universalMarker";
import type { UniversalChartDataItem } from "../../../functions/types/universal/createUniversalMarker";

export interface UniversalCustomOverlayInstance {
  chartData: UniversalChartDataItem;
  isUniversalMarkerChartDrawn: boolean;
  update: () => Promise<void>;
  [key: string]: unknown;
}

/**
 * Map marker for the universal layer. Same look as the Temp RH marker, but size,
 * colors and freshness thresholds come from the UniMarker parameters.
 */
export const initializeUniversalCustomOverlay = (isGoogleApiLoaded: boolean) => {
  if (isGoogleApiLoaded) {
    return class UniversalCustomOverlay extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private isValidChartData: boolean;
      private chartData: UniversalChartDataItem;
      private setUniversalOverlays: (fn: (overlays: UniversalCustomOverlayInstance[]) => UniversalCustomOverlayInstance[]) => void
      private onLongPress: (info: SensorInfo) => void
      public isUniversalMarkerChartDrawn: boolean = false

      private root: ReturnType<typeof createRoot> | null = null;
      private offset: { x: number; y: number } = { x: 0, y: 0 };
      private div: HTMLElement | null = null;
      private isTextTruncated: boolean
      private longPress: LongPressTracker = new LongPressTracker(() => this.onLongPress(this.getSensorInfo()));
      private _pendingHidden: boolean = false;

      constructor(
        bounds: google.maps.LatLngBounds,
        isValidChartData: boolean,
        chartData: UniversalChartDataItem,
        setUniversalOverlays: (fn: (overlays: UniversalCustomOverlayInstance[]) => UniversalCustomOverlayInstance[]) => void,
        onLongPress: (info: SensorInfo) => void
      ) {
        super();
        this.bounds = bounds;
        this.isValidChartData = isValidChartData;
        this.chartData = chartData;
        this.setUniversalOverlays = setUniversalOverlays
        this.onLongPress = onLongPress
        this.isTextTruncated = this.chartData.name.length > 7
      }

      update() {
        return new Promise<void>((resolve) => {
          if (this.div && this.root) {
            this.root.render(this.renderContent());
          }
          resolve();
        });
      }

      private getSensorInfo(): SensorInfo {
        return {
          name: this.chartData.name,
          sensorId: String(this.chartData.sensorId),
          battery: this.chartData.battery !== null ? `${this.chartData.battery}V` : undefined,
        };
      }

      private get borderColor(): string {
        const freshness = this.chartData.freshness
        return freshness === 'skull' ? 'gray' : UNIVERSAL_FRESHNESS_COLORS[freshness]
      }

      renderContent() {
        const { width, height } = this.chartData.params
        return (
          <div
              className={s.overlay_container}
              style={{ width }}
              onTouchStart={this.longPress.start}
              onTouchEnd={this.longPress.end}
              onTouchMove={this.longPress.move}
            >
            {this.isValidChartData ? (
              <div className={s.mainContainer} onClick={() => {
                if (this.longPress.wasLongPress) return;
                // TODO(universal): open the universal chart page (step 2).
              }}>
                {/* 25px = padding + bottom title, same as the Temp RH marker (75px container / 50px chart) */}
                <div className={s.overlay_chartContainer} style={{ background: this.borderColor, height: height + 25 }}>
                  <div id={this.chartData.id} className={s.overlay_chart} style={{ height, display: this.isUniversalMarkerChartDrawn ? 'block' : 'none' }}>
                    {this.chartData.alarmEnabled && (
                      <div className={`${s.overlay_wxetOverlayAlarm} ${s.overlay_tempOverlayAlarm}`}>
                        <img src={alarm} alt="Alarm Image"/>
                      </div>
                    )}
                  </div>
                  {this.isUniversalMarkerChartDrawn ? null : (
                    <div className={s.overlay_loader}></div>
                  )}
                  <p className={s.overlay_underInformationOverlayText} style={{ color: '#000' }}>
                    {truncateText(this.chartData.name)}
                  </p>
                </div>
                <div className={s.overlay_info}>
                  {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                  {this.chartData.battery !== null && <p className={s.chartName}>Battery: {this.chartData.battery}V</p>}
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
                  {this.chartData.battery !== null && <p className={s.chartName}>Battery: {this.chartData.battery}V</p>}
                  <p className={s.chartName}>{String(this.chartData.sensorId)}</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      onAdd() {
        const divId = `overlay-${this.chartData.id}`;
        this.div = document.getElementById(divId) as HTMLElement | null;

        if (!this.div) {
          this.div = document.createElement("div");
          this.div.id = divId;
          this.div.style.borderStyle = "none";
          this.div.style.borderWidth = "0px";
          this.div.style.position = "absolute";
          this.div.style.webkitTransform = 'translateZ(0)';
          this.div.addEventListener('mouseenter', () => {
            if (this.div) this.div.style.zIndex = "9999";
          });
          this.div.addEventListener('mouseleave', () => {
            if (this.div) this.div.style.zIndex = "0";
          });

          this.offset = {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20
          };
          const panes = this.getPanes();
          if (panes) {
            panes.floatPane.appendChild(this.div);
            if (this._pendingHidden) {
              this.div.style.visibility = "hidden";
            }
          }
          if (!this.root) {
            this.root = createRoot(this.div);
          }
          this.root.render(this.renderContent());
        }

        if (this.isValidChartData) {
          this.setUniversalOverlays((overlays: UniversalCustomOverlayInstance[]) => {
            const overlayExists = overlays.some(overlay => overlay.chartData.id === this.chartData.id);
            return overlayExists ? overlays : [...overlays, this as unknown as UniversalCustomOverlayInstance];
          });
        }
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !this.div) return;

        const pixel = projection.fromLatLngToDivPixel(this.bounds.getCenter());
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

      hide() {
        this._pendingHidden = true;
        if (this.div) {
          this.div.style.visibility = "hidden";
        }
      }

      show() {
        this._pendingHidden = false;
        if (this.div) {
          this.div.style.visibility = "visible";
        }
      }
    }
  }
  return undefined;
}
