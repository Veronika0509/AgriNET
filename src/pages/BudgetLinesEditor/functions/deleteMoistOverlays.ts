export const deleteMoistOverlays = async (props: any): Promise<void> => {
  return new Promise((resolve) => {
    props.moistOverlaysRef.current.forEach((overlay: any) => {
      overlay.setMap(null);
    });
    props.moistOverlaysRef.current = [];
    props.setMoistOverlays([]);
    const allOverlayDivs = document.querySelectorAll('[id^="overlay-b-"]');
    allOverlayDivs.forEach((el) => el.remove());

    const checkOverlaysRemoved = () => {
      const stillExists = document.querySelector('[id^="overlay-b-"]');
      if (!stillExists) {
        resolve();
      } else {
        requestAnimationFrame(() => setTimeout(checkOverlaysRemoved, 10));
      }
    };

    checkOverlaysRemoved();
  });
};