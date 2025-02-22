export const compareDates = (targetDateInMillis: any) => {
  const targetDate = new Date(targetDateInMillis).setHours(0, 0, 0, 0);
  const currentDate = new Date().setHours(0, 0, 0, 0);
  return targetDate === currentDate
}