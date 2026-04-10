interface History {
  push: (path: string) => void;
}

export const back = (
  setPage: (page: number) => void,
  _history: History,
  _returnToMapTab?: string | null,
  clearReturnToMapTab?: () => void
): void => {
  setPage(1);
  // URL sync hook handles updating the URL when page changes
  if (clearReturnToMapTab) {
    clearReturnToMapTab();
  }
};