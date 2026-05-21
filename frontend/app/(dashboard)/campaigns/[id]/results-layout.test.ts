import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ResultsLayout } from './results-layout'

describe('ResultsLayout', () => {
  it('renders blocks in the fixed HR order', () => {
    const html = renderToStaticMarkup(
      createElement(ResultsLayout, {
        sections: {
          response: createElement('div', null, 'Responsbasis'),
          signal: createElement('div', null, 'Kernsignaal'),
          synthesis: createElement('div', null, 'Signalen in samenhang'),
          drivers: createElement('div', null, 'Drivers & prioriteiten'),
          depth: createElement('div', null, 'Verdiepingslagen'),
          voices: createElement('div', null, 'Survey-stemmen'),
        },
      }),
    )

    expect(html).toContain('Responsbasis')
    expect(html).toContain('Kernsignaal')
    expect(html).toContain('Signalen in samenhang')
    expect(html).toContain('Drivers &amp; prioriteiten')
    expect(html).toContain('Verdiepingslagen')
    expect(html).toContain('Survey-stemmen')
  })
})
