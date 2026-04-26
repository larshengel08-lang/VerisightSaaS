import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Commercial suite alignment', () => {
  it('keeps the combination route framed as a suite path with dashboard, report and Action Center in one line', () => {
    const productSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    expect(productSource).toContain('Dashboard, rapport en Action Center')
    expect(productSource).toContain('dezelfde suite-omgeving')
  })

  it('connects pricing, trust and contact copy to the bounded suite promise', () => {
    const pricingSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'tarieven-content.tsx'),
      'utf8',
    )
    const trustSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'vertrouwen-content.tsx'),
      'utf8',
    )
    const contactFormSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'contact-form.tsx'),
      'utf8',
    )

    expect(pricingSource).toContain('dashboard, rapport en Action Center')
    expect(trustSource).toContain('dashboard, rapport en Action Center')
    expect(contactFormSource).toContain('dashboard, rapport of Action Center')
  })
})
