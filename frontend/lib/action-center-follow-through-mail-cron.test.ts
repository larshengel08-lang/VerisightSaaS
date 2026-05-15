import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const vercelJson = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')

describe('action center follow-through mail cron config', () => {
  it('adds exactly one bounded cron path for the mail dispatcher', () => {
    expect(vercelJson).toMatch(/"crons"/)
    expect(vercelJson).toMatch(/"path"\s*:\s*"\/api\/action-center-follow-through-mails"/)
  })
})
