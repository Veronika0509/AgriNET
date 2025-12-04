interface History {
  push: (path: string) => void;
}

export const back = (
  setPage: (page: number) => void,
  history: History,
  returnToMapTab?: string | null,
  clearReturnToMapTab?: () => void
): void => {
  setPage(1);
  // Navigate back to map page
  // The Chart Header sets forceMapTab flag in AppContext to ensure Map tab is shown
  history.push('/map');
  if (clearReturnToMapTab) {
    clearReturnToMapTab();
  }
};