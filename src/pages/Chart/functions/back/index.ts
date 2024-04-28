export const back = (setPage: any, history: any): void => {
  setPage(1);
  history.push('/map');
};