import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import wxetOverlayMoon from '../../../../../assets/images/icons/wxetOverlayMoon.svg'
import wxetOverlaySun from '../../../../../assets/images/icons/wxetOverlaySun.svg'
import {truncateText} from "../../../functions/truncateTextFunc";
import {onWxetSensorClick} from "../../../functions/types/wxet/onWxetSensorClick";
import {getOptions} from "../../../data/getOptions";
import {logoFacebook} from "ionicons/icons";
import skull from "../../../../../assets/images/skull.svg";

export const initializeWxetCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private setAdditionalChartData: any
      private history: any
      private bounds: google.maps.LatLngBounds;
      private isValidData: boolean;
      private chartData: any;
      private setChartPageType: any
      private borderColor: any

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
        setAdditionalChartData: any,
        history: any,
        bounds: google.maps.LatLngBounds,
        isValidData: boolean,
        data: any,
        setChartPageType: any
      ) {
        super();

        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.setAdditionalChartData = setAdditionalChartData
        this.history = history
        this.bounds = bounds
        this.isValidData = isValidData
        this.chartData = data
        this.setChartPageType = setChartPageType

        this.layerName = data.layerName
        this.offset = { x: 0, y: 0 };
        this.isTextTruncated = this.isValidData ? this.chartData.name.length > 20 : this.chartData.name.length > 7
        this.borderColor = 'gray'
      }

      update() {
        if (this.div && this.root) {
          this.root.render(this.renderContent());
        }
        this.draw()
      }

      renderContent() {
        const tempMetric: string = this.chartData.data.metric === 'AMERICA' ? "°F" : "°C"
        const rainMetric: string = this.chartData.data.metric === 'AMERICA' ? "inch" : "mm"
        const windMetric: string = this.chartData.data.metric === 'AMERICA' ? "MPH" : "KPH"
        let termRendArrow = "";
        switch (this.chartData.data.tempTrend) {
          case "up":
            termRendArrow = "⇧";
            break;
          case "down":
            termRendArrow = "⇩";
            break;
        }
        const isBattery: boolean = this.chartData.data.battery !== undefined && this.chartData.data.battery !== null
        const isBatteryPercentage: boolean = this.chartData.data.batteryPercentage !== undefined && this.chartData.data.batteryPercentage !== null
        if (this.isValidData && !this.chartData.freshness) {
          console.log('chart data is valid but freshness id undefined', this.chartData.sensorId, this.chartData.freshness)
        }
        return (
          <div className={s.overlay_wxetOverlay}  onClick={() => onWxetSensorClick(
            this.history,
            this.chartData.sensorId,
            this.chartData.name,
            this.setChartData,
            this.setPage,
            this.setSiteId,
            this.setSiteName,
            this.setAdditionalChartData,
            this.setChartPageType
          )}>
            {
              this.isValidData ? (
                <div>
                  <div className={s.overlay_wxetOverlayContainer} style={{ background: this.borderColor }}>
                    <div className={s.overlay_wxetOverlayInnerContainer} style={{backgroundColor: this.chartData.data.bgColor}}>
                      <img src={this.chartData.data.solar ? wxetOverlaySun : wxetOverlayMoon} className={s.overlay_wxetOverlayImage}
                           alt=""/>
                      <div className={s.wxetOverlayData}>
                        <p className={s.wxetOverlayDataText}>Temp: {this.chartData.data.temp} {tempMetric} {termRendArrow}</p>
                        <p className={s.wxetOverlayDataText}>Hi: {this.chartData.data.tempHi} {tempMetric}</p>
                        <p className={s.wxetOverlayDataText}>Lo: {this.chartData.data.tempLo} {tempMetric}</p>
                        <p className={s.wxetOverlayDataText}>RH: {this.chartData.data.rh} %</p>
                        <p className={s.wxetOverlayDataText}>Rain: {this.chartData.data.totalRain} {rainMetric}</p>
                        <p
                          className={s.wxetOverlayDataText}>Wind: {this.chartData.data.wind} {windMetric} {this.chartData.data.windDirection}</p>
                        <p className={s.wxetOverlayDataText}>Solar rad: {this.chartData.data.solar} W/m2</p>
                      </div>
                    </div>
                    <p className={s.overlay_underInformationOverlayText}>{truncateText(this.chartData.name, 'wxet')}</p>
                  </div>
                  <div className={`${s.overlay_info} ${s.overlay_validWxetOverlayInfo}`}>
                    {this.isTextTruncated ? <p className={s.chartName}>{this.chartData.name}</p> : null}
                    {isBattery && (
                      <div>
                        {isBatteryPercentage && (
                          <p className={s.overlay_text}>{this.chartData.data.batteryPercentage}%</p>
                        )}
                        <p className={s.overlay_text}>{this.chartData.data.battery} VDC</p>
                      </div>
                    )}
                    <p className={s.overlay_text}>{this.chartData.sensorId}</p>
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
                    <p className={s.chartName}>{this.chartData.sensorId}</p>
                  </div>
                </div>
              )
            }
          </div>
        );
      }

      async setBorderColor() {
        const options = await getOptions()
        this.borderColor = options.data[`freshness.${this.chartData.freshness}.color`]
      }

      onAdd() {
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