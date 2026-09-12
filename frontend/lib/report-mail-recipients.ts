export interface ReportMailRecipientsInput {
  /** E-mailadressen uit org_invites met rol owner en een geaccepteerde uitnodiging. */
  ownerInviteEmails: Array<string | null | undefined>
  /** organizations.contact_email; het adres uit de intake. */
  organizationContactEmail?: string | null
  /** Operator-kopie, zie getOperatorEmail(). */
  operatorEmail: string
}

/**
 * Pure ontvangerslijst voor de rapport-klaar-mail (spec 2026-09-11 par. 5).
 * Volgorde: eigenaren, dan het organisatieadres, dan de operator. Ontdubbeld
 * op kleine letters; adressen zonder apenstaartje worden overgeslagen in
 * plaats van blind aan Resend gegeven.
 */
export function buildReportMailRecipients(input: ReportMailRecipientsInput): string[] {
  const seen = new Set<string>()
  const recipients: string[] = []

  for (const raw of [...input.ownerInviteEmails, input.organizationContactEmail, input.operatorEmail]) {
    const email = (raw ?? '').trim().toLowerCase()
    if (!email || !email.includes('@')) continue
    if (seen.has(email)) continue
    seen.add(email)
    recipients.push(email)
  }

  return recipients
}
