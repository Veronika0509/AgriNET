export function truncateText(str: any, type?: string) {
  if (str.length > 7 && !type) {
    return str.substring(0, 7)
  } else if (type === 'wxet') {
    return str.substring(0, 20)
  } else {
    return str;
  }
}