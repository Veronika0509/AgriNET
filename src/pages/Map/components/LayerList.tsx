import s from '../style.module.css'
import {IonCheckbox, IonItem} from "@ionic/react";

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
    props.overlays.forEach((overlay: any) => {
      if (checkbox.target.innerText === overlay.layerName) {
        if (checkbox.detail.checked) {
          overlay.show()
        } else {
          overlay.hide()
        }
      }
    })
  }

  return (
    <div className={s.layersListWrapper}>
      <div className={s.layersCheckbox}>
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