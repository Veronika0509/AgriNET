import s from '../style.module.css'
import {IonCheckbox, IonItem} from "@ionic/react";
import {useEffect, useState} from "react";
import login from "../../Login";
import {CollisionResolver} from "./CollisionResolver";

const LayerList = (props: any) => {
  let layers: string[] = []

  props.siteList.map((site: any) => {
    if (site.name === props.secondMap) {
      site.layers.map((layer: any) => {
        if (!layers.includes(layer.name)) {
          layers.push(layer.name)
        }
      })
    }
  })

  const toggleLayer = (checkbox: any) => {
    props.allOverlays.forEach((overlay: any) => {
      if (checkbox.target.innerText === overlay.layerName) {
        if (checkbox.detail.checked) {
          overlay.show()
          if (!props.activeOverlays.includes(overlay)) {
            props.setActiveOverlays((prevActiveOverlays: any) => {
              const exists = prevActiveOverlays.some(
                  (existingOverlay: any) => existingOverlay.chartData.sensorId === overlay.chartData.sensorId
              );
              return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
            });
          }
        } else {
          overlay.hide()
          props.setActiveOverlays((prevActiveOverlays: any) =>
              prevActiveOverlays.filter((active: any) => active.chartData.sensorId !== overlay.chartData.sensorId)
          );
        }
      }
    })
  }

  return (
      <div className={s.layersListWrapper}>
        <div className={s.layers_checkbox}>
          {
            layers.map((layer: string) => (
                <IonItem key={layer}>
                  <IonCheckbox checked justify="space-between" onIonChange={(checkbox) => toggleLayer(checkbox)}>{layer}</IonCheckbox>
                </IonItem>
            ))
          }
        </div>
      </div>
  )
}

export default LayerList