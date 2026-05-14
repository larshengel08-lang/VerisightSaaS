import React, { type ReactNode } from 'react'

type ResultsLayoutProps = {
  sections: {
    response: ReactNode
    signal: ReactNode
    synthesis: ReactNode
    drivers: ReactNode
    depth: ReactNode
    voices: ReactNode
  }
}

export function ResultsLayout({ sections }: ResultsLayoutProps) {
  return (
    <div className="space-y-8">
      <section id="responsbasis">{sections.response}</section>
      <section id="kernsignaal">{sections.signal}</section>
      <section id="signalen-in-samenhang">{sections.synthesis}</section>
      <section id="drivers-en-prioriteiten">{sections.drivers}</section>
      <section id="verdiepingslagen">{sections.depth}</section>
      <section id="survey-stemmen">{sections.voices}</section>
    </div>
  )
}
