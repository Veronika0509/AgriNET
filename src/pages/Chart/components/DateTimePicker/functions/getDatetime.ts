export const getDatetime = (props: Date): string => {
  const year = props.getFullYear();
  const month = props.getMonth() + 1;
  const day = props.getDate();
  const hours = props.getHours();
  const minutes = props.getMinutes();
  const seconds = props.getSeconds();

  const formattedDateTime:string = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedDateTime;
}