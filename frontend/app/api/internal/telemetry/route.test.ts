import { describe, expect, it } from 'vitest'
import { POST } from './route'

describe('internal telemetry route', () => {
  it('rejects incomplete telemetry payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/internal/telemetry', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    expect(response.status).toBe(400)
  })
})
