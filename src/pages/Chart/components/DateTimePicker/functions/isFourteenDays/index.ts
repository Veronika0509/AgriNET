export const isFourteenDays = (startDate: any, endDate: any) => {
  const startDatetime: any = new Date(startDate);
  const endDatetime: any = new Date(endDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const fourteenDaysInMilliseconds = 14 * millisecondsPerDay;
  const differenceInMilliseconds = Math.abs(startDatetime - endDatetime);
  return differenceInMilliseconds < fourteenDaysInMilliseconds;
}