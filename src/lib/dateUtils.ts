export function formatDateInput(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseDateInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export function getDateInputRange(dateString: string): { start: string; end: string } {
  const day = parseDateInput(dateString)
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0)
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)

  return { start: start.toISOString(), end: end.toISOString() }
}

export function dateInputAtCurrentTime(dateString: string, now = new Date()): string {
  const date = parseDateInput(dateString)
  date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

  return date.toISOString()
}

export function toComparableDate(date: Date | string): Date {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return parseDateInput(date)
  }

  return new Date(date)
}

export function isSameLocalDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = toComparableDate(date1)
  const d2 = toComparableDate(date2)

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}
