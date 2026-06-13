/** Returns the YYYY-MM-DD on which the first reminder becomes due, or null if no launch date. */
export function getReminderDueDate(launchDate: string | null, delayDays: number): string | null {
  if (!launchDate) return null
  if (!Number.isFinite(delayDays)) return null
  const base = new Date(`${launchDate}T00:00:00Z`)
  if (Number.isNaN(base.getTime())) return null
  base.setUTCDate(base.getUTCDate() + delayDays)
  return base.toISOString().slice(0, 10)
}

export function isReminderDue(args: {
  launchDate: string | null
  delayDays: number
  today: string
  alreadySentAt: string | null
}): boolean {
  const dueDate = getReminderDueDate(args.launchDate, args.delayDays)
  if (!dueDate) return false
  if (args.today < dueDate) return false
  if (args.alreadySentAt) {
    const sentDate = args.alreadySentAt.slice(0, 10)
    if (sentDate >= dueDate) return false
  }
  return true
}
