import {logoFacebook} from "ionicons/icons";

export const checkOverlay = async (id: string, overlays: any[]): Promise<void> => {
  return new Promise((resolve) => {
    const checkElement = () => {
      const element = document.getElementById(id)
      if (element) {
        resolve()
      } else {
        let overlay: any
        if (overlays[0].prefix === 'm' || overlays[0].prefix === 'b') {
          overlay = overlays.find((overlay) => overlay.chartData.id.toString() === id.slice(2))
        } else {
          overlay = overlays.find((overlay) => overlay.chartData.id === id)
        }
        if (overlay) {
          overlay.update().then(() => {
            setTimeout(checkElement, 0)
          })
        } else {
          resolve()
        }
      }
    }

    checkElement()
  })
}