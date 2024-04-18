export function truncateText(str: any) {
  if (str.length > 13) {
    return str.substring(0, 13 - 3) + '...';
  } else {
    return str;
  }
}