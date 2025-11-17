import {logoFacebook} from "ionicons/icons";

interface Overlay {
  prefix: string;
  chartData: {
    id: string | number;
  };
  update: () => Promise<void>;
}

export const checkOverlay = async (id: string, overlays: Overlay[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 20 // Maximum number of attempts
    const checkInterval = 100 // milliseconds between checks

    const checkElement = () => {
      attempts++
      const element = document.getElementById(id)

      if (element) {
        console.log(`Element ${id} found after ${attempts} attempt(s)`)
        resolve()
      } else if (attempts >= maxAttempts) {
        console.warn(`Element ${id} not found after ${maxAttempts} attempts. Giving up.`)
        // Resolve anyway to not block the process entirely
        resolve()
      } else {
        let overlay: Overlay | undefined
        if (overlays.length > 0 && (overlays[0].prefix === 'm' || overlays[0].prefix === 'b')) {
          overlay = overlays.find((overlay) => overlay.chartData.id.toString() === id.slice(2))
        } else {
          overlay = overlays.find((overlay) => overlay.chartData.id === id)
        }

        if (overlay) {
          overlay.update().then(() => {
            setTimeout(checkElement, checkInterval)
          }).catch((error) => {
            console.error(`Error updating overlay for ${id}:`, error)
            setTimeout(checkElement, checkInterval)
          })
        } else {
          // No overlay found, wait and retry anyway in case it's being created
          setTimeout(checkElement, checkInterval)
        }
      }
    }

    checkElement()
  })
}