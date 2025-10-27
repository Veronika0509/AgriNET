interface History {
  push: (path: string) => void;
}

export const back = (
  setPage: (page: number) => void,
  history: History
): void => {
  setPage(1);
  history.push('/map');
};