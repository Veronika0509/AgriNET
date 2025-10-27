export function truncateText(str: string, type?: string): string {
  if (str.length > 7 && !type) {
    return str.substring(0, 7)
  } else if (type === 'wxet') {
    return str.substring(0, 20)
  } else {
    return str;
  }
}