import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import wxetOverlayMoon from '../../../../../assets/images/icons/wxetOverlayMoon.svg'
import wxetOverlaySun from '../../../../../assets/images/icons/wxetOverlaySun.svg'
import {moveOverlays} from "../../../functions/moveOverlays";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onWxetSensorClick} from "../../../functions/types/wxet/onWxetSensorClick";
import {adjustOverlayPosition} from "../../../functions/adjustOverlayPosition";

export const initializeWxetCustomOverlay = (isGoogleApiLoaded: any) => {
  if (isGoogleApiLoaded) {
    return class CustomOverlayExport extends google.maps.OverlayView {
      private isAllCoordinatesOfMarkersAreReady: any
      private overlappingPairs: any
      private setChartData: any
      private setPage: any
      private setSiteId: any
      private setSiteName: any
      private setAdditionalChartData: any
      private history: any
      private userId: any
      private bounds: google.maps.LatLngBounds;
      private isValidData: boolean;
      private chartData: any;
      private setChartPageType: any

      private layerName: string
      private root: any;
      private div?: any;

      constructor(
        isAllCoordinatesOfMarkersAreReady: any,
        overlappingPairs: any,
        setChartData: any,
        setPage: any,
        setSiteId: any,
        setSiteName: any,
        setAdditionalChartData: any,
        history: any,
        userId: any,
        bounds: google.maps.LatLngBounds,
        isValidData: boolean,
        data: any,
        setChartPageType: any
      ) {
        super();

        this.isAllCoordinatesOfMarkersAreReady = isAllCoordinatesOfMarkersAreReady
        this.overlappingPairs = overlappingPairs
        this.setChartData = setChartData
        this.setPage = setPage
        this.setSiteId = setSiteId
        this.setSiteName = setSiteName
        this.setAdditionalChartData = setAdditionalChartData
        this.history = history
        this.userId = userId
        this.bounds = bounds
        this.isValidData = isValidData
        this.chartData = data
        this.layerName = data.layerName
        this.setChartPageType = setChartPageType
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
        return (
          <div className={s.overlay_container}>
            {
              this.isValidData ? (
                <div onClick={() => onWxetSensorClick(
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
                  <div className={s.overlay_wxetOverlayContainer}>
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
                    <p className={s.overlay_underInformationOverlayText}>{this.chartData.name}</p>
                  </div>
                  <div className={`${s.overlay_info} ${s.overlay_validWxetOverlayInfo}`}>
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
                <div
                  className={`${s.overlay_container} ${s.overlay_invalidOverlayContainer}`}
                >
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
              )
            }
          </div>
        );
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

          const panes: any = this.getPanes();
          panes.floatPane.appendChild(this.div);
          if (!this.root) {
            this.root = createRoot(this.div);
          }
          this.root.render(this.renderContent());

          this.draw()
        }
      }

      draw() {
        const projection = this.getProjection()
        const sw: any = projection.fromLatLngToDivPixel(this.bounds.getSouthWest());
        const ne: any = projection.fromLatLngToDivPixel(this.bounds.getNorthEast());

        if (this.div) {
          this.div.style.left = sw.x + "px";
          this.div.style.top = ne.y + "px";
        }
        // const projection = this.getProjection();
        // const map: any = this.getMap();
        // if (!projection || !map) return;
        //
        // const offset = adjustOverlayPosition(
        //   projection,
        //   this,
        //   this.isAllCoordinatesOfMarkersAreReady,
        //   this.bounds,
        //   map
        // );
        //
        // const position = this.bounds.getCenter();
        // const pixel: any = projection.fromLatLngToDivPixel(position);
        //
        // if (this.div && offset) {
        //   this.div.style.left = (pixel.x + offset.x) + "px";
        //   this.div.style.top = (pixel.y + offset.y) + "px";
        // }
        // moveOverlays(
        //   projection,
        //   this.bounds,
        //   this.div,
        //   this.isAllCoordinatesOfMarkersAreReady,
        //   this.data.mainId,
        //   this.overlappingPairs
        // )
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