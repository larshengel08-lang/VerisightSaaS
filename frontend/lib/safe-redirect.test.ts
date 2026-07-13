import { describe, expect, it } from 'vitest'
import { safeInternalPath } from './safe-redirect'

describe('safeInternalPath (L10 open-redirect guard)', () => {
  it('laat een gewoon intern pad door', () => {
    expect(safeInternalPath('/dashboard')).toBe('/dashboard')
    expect(safeInternalPath('/campaigns/123?tab=x')).toBe('/campaigns/123?tab=x')
  })

  it('weigert protocol-relatieve en backslash-escapes', () => {
    expect(safeInternalPath('//evil.com')).toBe('/')
    expect(safeInternalPath('/\\evil.com')).toBe('/')
    expect(safeInternalPath('///evil.com')).toBe('/')
  })

  it('weigert absolute en schema-URLs', () => {
    expect(safeInternalPath('https://evil.com')).toBe('/')
    expect(safeInternalPath('http://evil.com')).toBe('/')
    expect(safeInternalPath('javascript:alert(1)')).toBe('/')
  })

  it('valt terug op de meegegeven fallback', () => {
    expect(safeInternalPath(null, '/dashboard')).toBe('/dashboard')
    expect(safeInternalPath('', '/dashboard')).toBe('/dashboard')
    expect(safeInternalPath(undefined, '/dashboard')).toBe('/dashboard')
    expect(safeInternalPath('evil.com', '/dashboard')).toBe('/dashboard')
  })
})
