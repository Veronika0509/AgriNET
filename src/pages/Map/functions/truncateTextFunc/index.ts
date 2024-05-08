export function truncateText(str: any) {
  if (str.length > 7) {
    return str.substring(0, 10 - 3) + '...';
  } else {
    return str;
  }
}