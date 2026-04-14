export function formatBackendDetail(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim()
  }

  if (Array.isArray(detail)) {
    const parts = detail
      .map(item => {
        if (typeof item === 'string' && item.trim()) {
          return item.trim()
        }
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>
          const location = Array.isArray(record.loc)
            ? record.loc.filter(part => typeof part === 'string' || typeof part === 'number').join('.')
            : null
          const message = typeof record.msg === 'string' ? record.msg.trim() : null
          if (location && message) {
            return `${location}: ${message}`
          }
          if (message) {
            return message
          }
        }
        return null
      })
      .filter((value): value is string => Boolean(value))

    if (parts.length > 0) {
      return parts.join(' ')
    }
  }

  if (detail && typeof detail === 'object') {
    const record = detail as Record<string, unknown>
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim()
    }
    if (typeof record.detail === 'string' && record.detail.trim()) {
      return record.detail.trim()
    }
  }

  return 'Backend error'
}

export function buildResendResultMessage(result: { sent: number; failed: number; skipped: number }) {
  const parts: string[] = []

  if (result.sent > 0) {
    parts.push(`${result.sent} uitnodiging(en) verstuurd.`)
  }
  if (result.failed > 0) {
    parts.push(`${result.failed} mislukt.`)
  }
  if (result.skipped > 0) {
    parts.push(`${result.skipped} overgeslagen.`)
  }

  if (parts.length > 0) {
    return parts.join(' ')
  }

  return 'Geen openstaande respondenten met e-mailadres gevonden.'
}
