interface History {
  push: (path: string) => void;
}

export const back = (
  setPage: (page: number) => void,
  history: History,
  _returnToMapTab?: string | null,
  clearReturnToMapTab?: () => void
): void => {
  setPage(1);
  // Navigate back to map page
  window.history.replaceState(null, '', '/AgriNET/map');
  if (clearReturnToMapTab) {
    clearReturnToMapTab();
  }
};