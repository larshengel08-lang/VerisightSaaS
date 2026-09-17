import { getReminderDueDate } from '@/lib/dashboard/reminder-due'

/**
 * Een send_reminders-auditevent dat de klant zelf heeft overgeslagen
 * (metadata.channel = 'skipped_by_customer'). Leest de ongetypeerde rij uit
 * Supabase veilig uit, zodat de pagina's geen eigen cast nodig hebben.
 */
export function isSkippedReminderEvent(event: unknown): boolean {
  if (!event || typeof event !== 'object' || !('metadata' in event)) return false
  const metadata = (event as { metadata: unknown }).metadata
  if (!metadata || typeof metadata !== 'object' || !('channel' in metadata)) return false
  return (metadata as { channel: unknown }).channel === 'skipped_by_customer'
}

/**
 * Of de herinnering als afgehandeld (verstuurd of overgeslagen) telt. Zelfde
 * regel als isReminderDue: alleen een event op of na de herinneringsdag telt,
 * datums vergeleken als UTC YYYY-MM-DD. Zo zeggen tijdlijn en herinneringskaart
 * nooit iets anders.
 */
export function isReminderHandled(args: {
  launchDate: string | null
  delayDays: number
  handledAt: string | null
}): boolean {
  if (!args.handledAt) return false
  const dueDate = getReminderDueDate(args.launchDate, args.delayDays)
  if (!dueDate) return false
  return args.handledAt.slice(0, 10) >= dueDate
}
