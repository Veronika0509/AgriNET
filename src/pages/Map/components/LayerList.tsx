import s from '../style.module.css'
import {IonCheckbox, IonItem} from "@ionic/react";
import {useEffect, useState} from "react";

const LayerList = (props: any) => {
  const [activeOverlays, setActiveOverlays] = useState<any[]>([]);

  // Initialize layers array
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

  // Initialize all overlays as visible on component mount
  useEffect(() => {
    const initialOverlays = props.overlays.map((overlay: any) => {
      overlay.show();
      return overlay;
    });
    setActiveOverlays(initialOverlays);
    console.log('Active overlays:', initialOverlays);
  }, [props.overlays]);

  const toggleLayer = (checkbox: any) => {
    const layerName = checkbox.target.innerText;
    const isChecked = checkbox.detail.checked;
    
    const updatedOverlays = props.overlays.filter((overlay: any) => {
      if (overlay.layerName === layerName) {
        if (isChecked) {
          overlay.show();
          return true;
        } else {
          overlay.hide();
          return false;
        }
      }
      return activeOverlays.includes(overlay);
    });

    setActiveOverlays(updatedOverlays);
    console.log('Active overlays:', updatedOverlays);
  }

  const isLayerActive = (layerName: string) => {
    return props.overlays.some((overlay: any) => 
      overlay.layerName === layerName && activeOverlays.includes(overlay)
    );
  }

  return (
      <div className={s.layersListWrapper}>
        <div className={s.layers_checkbox}>
          {
            layers.map((layer: string) => (
                <IonItem key={layer}>
                  <IonCheckbox 
                    checked={isLayerActive(layer) || activeOverlays.length === 0}
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
