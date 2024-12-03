import s from '../style.module.css'
import {IonCheckbox, IonItem} from "@ionic/react";
import {useEffect, useState} from "react";
import login from "../../Login";
import {CollisionResolver} from "./CollisionResolver";

const LayerList = (props: any) => {
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  let layers: string[] = []

  useEffect(() => {
    // Initialize with all layers active
    const initialLayers = props.siteList
      .filter((site: any) => site.name === props.secondMap)
      .flatMap((site: any) => site.layers.map((layer: any) => layer.name))
      .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index);
    
    setActiveOverlays(initialLayers);
    
    // Show all overlays initially
    props.overlays.forEach((overlay: any) => {
      overlay.show();
    });
  }, [props.siteList, props.secondMap]);

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
    const layerName = checkbox.target.innerText;
    
    props.overlays.forEach((overlay: any) => {
      if (layerName === overlay.layerName) {
        if (checkbox.detail.checked) {
          overlay.show();
          setActiveOverlays(prev => {
            const newOverlays = [...prev, layerName];
            console.log('Active overlays:', newOverlays);
            return newOverlays;
          });
        } else {
          overlay.hide();
          setActiveOverlays(prev => {
            const newOverlays = prev.filter(name => name !== layerName);
            console.log('Active overlays:', newOverlays);
            return newOverlays;
          });
        }
      }
    });
  }

  return (
    <div className={s.layersListWrapper}>
      <div className={s.layers_checkbox}>
        {
          layers.map((layer: string) => (
            <IonItem key={layer}>
              <IonCheckbox 
                checked={activeOverlays.includes(layer)}
                justify="space-between" 
                onIonChange={(checkbox) => toggleLayer(checkbox)}
              >
                {layer}
              </IonCheckbox>
            </IonItem>
          ))
        }
      </div>
    </div>
  )
}

export default LayerList
