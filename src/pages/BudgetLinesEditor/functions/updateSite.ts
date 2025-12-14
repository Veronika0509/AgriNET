import {deleteMoistOverlays} from "./deleteMoistOverlays";

export const updateSite = async (props: any) => {
  await deleteMoistOverlays({
    moistOverlaysRef: props.moistOverlaysRef,
    setMoistOverlays: props.setMoistOverlays
  })
  props.setCurrentSite(props.value)
  const newMarkers: any[] = []
  props.sites.map((site: any) => {
    if (site.name === props.value) {
      site.layers.map((layer: any) => {
        if (layer.name === 'Moist' || layer.name === 'moist') {
          layer.markers.forEach((marker: any) => {
            const alreadyExists = newMarkers.some((m) => m.sensorId === marker.sensorId)
            if (!alreadyExists) {
              newMarkers.push(marker)
            }
          })
        }
      })
    }
  })

  props.setCurrentSensorId(newMarkers[0].sensorId)
  props.setMoistSensors(newMarkers)
}