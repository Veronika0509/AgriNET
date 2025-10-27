import {logoFacebook} from "ionicons/icons";

interface Overlay {
  prefix: string;
  chartData: {
    id: string | number;
  };
  update: () => Promise<void>;
}

export const checkOverlay = async (id: string, overlays: Overlay[]): Promise<void> => {
  return new Promise((resolve) => {
    const checkElement = () => {
      const element = document.getElementById(id)
      if (element) {
        resolve()
      } else {
        let overlay: Overlay | undefined
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