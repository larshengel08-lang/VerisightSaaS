import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('homepage dashboard preview label', () => {
  it('adds a small management dashboard context label without changing the preview itself', () => {
    const homepageSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'),
      'utf8',
    )

    expect(homepageSource).toContain('item.title === \'Dashboard\'')
    expect(homepageSource).toContain('Dit is het managementdashboard dat Loep beheert en aanlevert')
    expect(homepageSource).toContain('u ontvangt het rapport en de')
    expect(homepageSource).toContain('bespreking.')
    expect(homepageSource).toContain("['Behoud', '#cfe7dd']")
    expect(homepageSource).toContain("['Onboarding', '#d8e4ea']")
    expect(homepageSource).toContain("['Vertrek', '#eaded6']")
  })
})
