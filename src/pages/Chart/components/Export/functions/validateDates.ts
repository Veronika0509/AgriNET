export const validateDates = (
  fromDate: string | Date,
  toDate: string | Date
): string | undefined => {
  const fromDateTime = new Date(fromDate)
  const toDateTime = new Date(toDate)

  const fromDateTrimmed = new Date(
    fromDateTime.getFullYear(),
    fromDateTime.getMonth(),
    fromDateTime.getDate(),
    fromDateTime.getHours(),
    fromDateTime.getMinutes(),
    0,
    0
  )

  const toDateTrimmed = new Date(
    toDateTime.getFullYear(),
    toDateTime.getMonth(),
    toDateTime.getDate(),
    toDateTime.getHours(),
    toDateTime.getMinutes(),
    0,
    0
  )

  const fromTime = fromDateTrimmed.getTime()
  const toTime = toDateTrimmed.getTime()

  if (fromTime > toTime) {
    return 'To Date must be after From Date'
  } else if (fromTime === toTime) {
    return 'To Date equals From Date'
  }
  
  return undefined
}
