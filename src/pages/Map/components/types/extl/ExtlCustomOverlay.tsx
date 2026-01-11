import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";

import {truncateText} from "../../../functions/truncateTextFunc";

// Интерфейсы для типизации
interface ExtlChartData {
  id: string | number;
  layerName: string;
  name: string;
  graphic: string;
  chartType: string;
  width: number;
  height: number;
  sensorId: string;
  [key: string]: unknown;
}



export const initializeExtlCustomOverlay = (isGoogleApiLoaded: boolean): any => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private chartData: ExtlChartData


      private root: ReturnType<typeof createRoot> | null = null;
      private offset: { x: number; y: number };
      private div?: HTMLElement;
      private isTextTruncated: boolean

      constructor(
        bounds: google.maps.LatLngBounds,
        data: ExtlChartData
      ) {
        super();
        this.bounds = bounds
        this.chartData = data

        this.offset = {x: 0, y: 0};
        this.isTextTruncated = this.chartData.name.length > 7
      }

      update() {
        if (this.div && this.root) {
          this.root.render(this.renderContent());
        }
        this.draw()
      }

      renderContent() {
        const img = 'https://app.agrinet.us/' + this.chartData.graphic
        // Extract URL from chartType. Format: "external:https://..."
        let extractedUrl = '#'
        if (this.chartData.chartType && typeof this.chartData.chartType === 'string') {
          if (this.chartData.chartType.startsWith('external:')) {
            extractedUrl = this.chartData.chartType.substring('external:'.length)
          } else if (this.chartData.chartType.startsWith('http')) {
            extractedUrl = this.chartData.chartType
          }
        }
        return (
          <a target='_blank' href={extractedUrl} className={s.overlay_extlOverlayWrapper} rel="noreferrer">
            <div className={s.overlay_extlOverlay}>
              <img src={img} alt="EXTL Image"
                   style={{width: `${this.chartData.width}px`, height: `${this.chartData.height}px`}}/>
              <p className={s.overlay_extlName}>{truncateText(this.chartData.name)}</p>
            </div>
            <div className={s.overlay_info}>
              {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
              <p className={s.chartName}>{this.chartData.sensorId}</p>
            </div>
          </a>
        );
      }

      onAdd() {
        const divId = `overlay-extl-${this.chartData.id}`;
        this.div = document.getElementById(divId) as HTMLElement | null;

        if (!this.div) {
          this.div = document.createElement("div");
          this.div.id = divId;
          this.div.style.borderStyle = "none";
          this.div.style.borderWidth = "0px";
          this.div.style.position = "absolute";
          this.div.style.webkitTransform = 'translateZ(0)';
          this.div.addEventListener('mouseenter', () => {
            this.div!.style.zIndex = "9999";
          });
          this.div.addEventListener('mouseleave', () => {
            this.div!.style.zIndex = "0";
          });

          this.offset = {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20
          };
          const panes = this.getPanes();
          if (panes) {
            panes.floatPane.appendChild(this.div);
          }
          if (!this.root) {
            this.root = createRoot(this.div);
            this.root.render(this.renderContent());
            this.draw();
          }
        }
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
}