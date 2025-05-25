import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import {truncateText} from "../../../functions/truncateTextFunc";
import {logoFacebook} from "ionicons/icons";

export const initializeExtlCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private chartData: any

      private layerName: string
      private root: any;
      private offset: { x: number; y: number };
      private div?: any;
      private isTextTruncated: boolean

      constructor(
        bounds: any,
        data: any
      ) {
        super();
        this.bounds = bounds
        this.chartData = data

        this.layerName = data.layerName
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
        return (
          <a target='_blank' href={this.chartData.chartType.substring(this.chartData.chartType.indexOf("https"))} className={s.overlay_extlOverlayWrapper}>
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

      setMap(map: any) {
        return new Promise((resolve: any) => {
          super.setMap(map);
          resolve();
        });
      }
    }
  }
}