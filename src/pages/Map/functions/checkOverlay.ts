export const checkOverlay = async (id: string, overlays: any[]): Promise<void> => {
  return new Promise((resolve) => {
    const checkElement = () => {
      const element = document.getElementById(id)
      if (element) {
        resolve()
      } else {
        const overlay = overlays.find((overlay) => overlay.chartData.id === id)
        if (overlay) {
          overlay.update().then(() => {
            console.log(123)
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