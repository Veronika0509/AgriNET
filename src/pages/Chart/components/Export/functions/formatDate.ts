export const formatDateToISO = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // месяцы начинаются с 0, поэтому +1
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

// Собираем строку в формате ISO 8601
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

  return isoString
}