import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.LOEP_FROM_EMAIL ?? 'hallo@verisight.nl'

export interface LoepEmail {
  to: string
  subject: string
  html: string
}

export async function sendLoepEmail({ to, subject, html }: LoepEmail): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY niet ingesteld — e-mail niet verstuurd naar', to)
    return
  }

  const { error } = await resend.emails.send({
    from: `Loep <${FROM}>`,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`E-mail naar ${to} mislukt: ${error.message}`)
  }
}
