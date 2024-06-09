import s from "../../../style.module.css";
import {createRoot} from "react-dom/client";
import React from "react";
import wxetOverlayMoon from '../../../../../assets/images/icons/wxetOverlayMoon.svg'
import wxetOverlaySun from '../../../../../assets/images/icons/wxetOverlaySun.svg'
import {moveOverlays} from "../../../functions/moveOverlays";
import {truncateText} from "../../../functions/truncateTextFunc";
import {onWxetSensorClick} from "../../../functions/types/wxet/onWxetSensorClick";

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
      private data: any;
      private overlaysToFit: any
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
        overlaysToFit: any,
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
        this.data = data
        this.layerName = data.layerName
        this.overlaysToFit = overlaysToFit
        this.setChartPageType = setChartPageType
      }

      update() {
        if (this.div && this.root) {
          this.root.render(this.renderContent());
        }
        this.draw()
      }

      renderContent() {
        const tempMetric: string = this.data.data.metric === 'AMERICA' ? "°F" : "°C"
        const rainMetric: string = this.data.data.metric === 'AMERICA' ? "inch" : "mm"
        const windMetric: string = this.data.data.metric === 'AMERICA' ? "MPH" : "KPH"
        let termRendArrow = "";
        switch (this.data.data.tempTrend) {
          case "up":
            termRendArrow = "⇧";
            break;
          case "down":
            termRendArrow = "⇩";
            break;
        }
        const isBattery: boolean = this.data.data.battery !== undefined && this.data.data.battery !== null
        const isBatteryPercentage: boolean = this.data.data.batteryPercentage !== undefined && this.data.data.batteryPercentage !== null
        return (
          <div className={s.overlayContainer}>
            {
              this.isValidData ? (
                <div onClick={() => onWxetSensorClick(
                  this.history,
                  this.data.sensorId,
                  this.data.name,
                  this.setChartData,
                  this.setPage,
                  this.setSiteId,
                  this.setSiteName,
                  this.setAdditionalChartData,
                  this.setChartPageType,
                  this.userId,
                  )}>
                  <div className={s.wxetOverlayContainer}>
                    <div className={s.wxetOverlayInnerContainer} style={{backgroundColor: this.data.data.bgColor}}>
                      <img src={this.data.data.solar ? wxetOverlaySun : wxetOverlayMoon} className={s.wxetOverlayImage}
                           alt=""/>
                      <div className={s.wxetOverlayData}>
                        <p className={s.wxetOverlayDataText}>Temp: {this.data.data.temp} {tempMetric} {termRendArrow}</p>
                        <p className={s.wxetOverlayDataText}>Hi: {this.data.data.tempHi} {tempMetric}</p>
                        <p className={s.wxetOverlayDataText}>Lo: {this.data.data.tempLo} {tempMetric}</p>
                        <p className={s.wxetOverlayDataText}>RH: {this.data.data.rh} %</p>
                        <p className={s.wxetOverlayDataText}>Rain: {this.data.data.totalRain} {rainMetric}</p>
                        <p
                          className={s.wxetOverlayDataText}>Wind: {this.data.data.wind} {windMetric} {this.data.data.windDirection}</p>
                        <p className={s.wxetOverlayDataText}>Solar rad: {this.data.data.solar} W/m2</p>
                      </div>
                    </div>
                    <p className={s.underInformationOverlayText}>{this.data.name}</p>
                  </div>
                  <div className={`${s.overlayInfo} ${s.validWxetOverlayInfo}`}>
                    {isBattery && (
                      <div>
                        {isBatteryPercentage && (
                          <p className={s.overlayText}>{this.data.data.batteryPercentage}%</p>
                        )}
                        <p className={s.overlayText}>{this.data.data.battery} VDC</p>
                      </div>
                    )}
                    <p className={s.overlayText}>{this.data.sensorId}</p>
                  </div>
                </div>
              ) : (
                <div className={`${s.overlayContainer} ${s.invalidOverlayContainer}`}>
                  <div className={s.wxetNotValidData}>
                    <div className={s.wxetNotValidDataRectangle}>
                      <p className={s.wxetNotValidDataRectangleText}>no data</p>
                    </div>
                    <p className={`${s.wxetNotValidName} ${s.underInformationOverlayText}`}>{truncateText(this.data.name)}</p>
                  </div>
                  <div className={s.overlayInfo}>
                    <p className={s.overlayText}>{this.data.sensorId}</p>
                  </div>
                </div>
              )
            }
          </div>
        );
      }

      onAdd() {
        const divId = `overlay-${this.data.sensorId}`;
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
        moveOverlays(
          projection,
          this.bounds,
          this.div,
          this.isAllCoordinatesOfMarkersAreReady,
          this.data.sensorId,
          this.overlappingPairs,
          this.overlaysToFit
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