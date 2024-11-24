export function truncateText(str: any) {
  if (str.length > 6) {
    return str.substring(0, 9 - 3) + '...';
  } else {
    return str;
  }
}