export const handleResize = (setIsMobile: (value: boolean) => void) => {
  setIsMobile(window.innerWidth < 850)
};