import s from '../style.module.css'
import {IonCheckbox, IonItem} from "@ionic/react";
import {useEffect, useState} from "react";
import login from "../../Login";
import {CollisionResolver} from "./CollisionResolver";

const LayerList = (props: any) => {
  let layers: string[] = []
  const [checkedLayers, setCheckedLayers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Initialize all layers as checked
    const initialCheckedState: {[key: string]: boolean} = {};
    props.siteList.forEach((site: any) => {
      if (site.name === props.secondMap) {
        site.layers.forEach((layer: any) => {
          initialCheckedState[layer.name] = true;
        });
      }
    });
    setCheckedLayers(initialCheckedState);
  }, [props.secondMap, props.siteList]);

  props.siteList.map((site: any) => {
    if (site.name === props.secondMap) {
      site.layers.map((layer: any) => {
        if (!layers.includes(layer.name)) {
          layers.push(layer.name)
        }
      })
    }
  })

  const toggleLayer = (checkbox: any, layerName: string) => {
    const isChecked = checkbox.detail.checked;
    setCheckedLayers(prev => ({
      ...prev,
      [layerName]: isChecked
    }));

    props.allOverlays.forEach((overlay: any) => {
      if (layerName === overlay.layerName) {
        if (isChecked) {
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
                  <IonCheckbox
                    checked={checkedLayers[layer]}
                    justify="space-between"
                    onIonChange={(checkbox) => toggleLayer(checkbox, layer)}
                  >
                    {layer === 'SoilTemp' ? 'Temp/RH' : layer}
                  </IonCheckbox>
                </IonItem>
            ))
          }
        </div>
      </div>
  )
}

export default LayerList
