import { describe, expect, it } from 'vitest'
import {
  buildLaunchControlState,
  buildParticipantCommunicationPreview,
  createDefaultParticipantCommunicationConfig,
  createDefaultReminderConfig,
  validateReminderConfig,
} from '@/lib/launch-controls'

describe('launch controls', () => {
  it('blocks launch until date, reminder settings, and explicit confirmation are in place', () => {
    const state = buildLaunchControlState({
      launchDate: null,
      participantCommsConfig: createDefaultParticipantCommunicationConfig(),
      reminderConfig: createDefaultReminderConfig(),
      launchConfirmedAt: null,
    })

    expect(state.ready).toBe(false)
    expect(state.blockers.join(' ')).toContain('startdatum')
    expect(state.blockers.join(' ')).toContain('launchbevestiging')
  })

  it('rejects unsupported reminder presets', () => {
    expect(
      validateReminderConfig({
        enabled: true,
        firstReminderAfterDays: 4,
        maxReminderCount: 2,
      }).join(' '),
    ).toContain('eerste reminder')

    expect(
      validateReminderConfig({
        enabled: true,
        firstReminderAfterDays: 5,
        maxReminderCount: 4,
      }).join(' '),
    ).toContain('maximum aantal reminders')
  })

  it('keeps preview copy canonical while allowing bounded customer context', () => {
    const preview = buildParticipantCommunicationPreview({
      scanType: 'retention',
      deliveryMode: 'baseline',
      launchDate: '2026-05-01',
      participantCommsConfig: {
        senderName: 'HR Team Noord',
        replyToEmail: 'hr@example.com',
        introContext: 'We kondigen dit intern alvast kort aan.',
        closingContext: 'Vragen over planning kun je aan HR stellen.',
      },
    })

    expect(preview.subject).toContain('RetentieScan')
    expect(preview.body.join(' ')).toContain('We kondigen dit intern alvast kort aan.')
    expect(preview.body.join(' ')).toContain('1 mei 2026')
    expect(preview.body.join(' ')).toContain('Verisight verzorgt de uitnodiging')
    expect(preview.body.join(' ')).toContain('Vragen over planning kun je aan HR stellen.')
    expect(preview.replyToEmail).toBe('hr@example.com')
  })
})
