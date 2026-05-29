import type { ReactNode } from 'react'
import { FactorTable } from '@/components/dashboard/factor-table'
import {
  BoardroomEmptyState,
  BoardroomKeyValueList,
  BoardroomMetricTile,
  ResultsBoardroomHeader,
  ResultsBoardroomSection,
} from '@/components/dashboard/results-boardroom-primitives'
import {
  type BoardroomFactorRow,
  type BoardroomSdtRow,
  type CompositionSegment,
  PriorityScatterPlot,
  SdtTriangleMap,
  SignalCompositionRibbon,
} from '@/components/dashboard/results-boardroom-visuals'
import type { CampaignItemScoresResponse } from '@/lib/types'

type ExitThemeCard = {
  key: string
  title: string
  count: number
  implication: string
  quote?: string | null
  relationLabel?: string | null
  evidenceLabel: string
}

interface ExitProductDashboardProps {
  moduleHref: string
  moduleLabel: string
  moduleBackLinkLabel: string
  campaignName: string
  organizationName: string
  routePeriodLabel: string
  scopeLabel: string
  statusLabel: string
  headerActions: ReactNode
  primarySignalScoreLabel: string
  primarySignalBandLabel: string
  strongestFactorLabel: string
  strongestFactorNote: string
  dominantThemeLabel: string
  dominantThemeNote: string
  executiveSummary: string
  firstManagementQuestion: string
  totalInvited: string
  totalCompleted: string
  responseRate: string
  responseContextNote: string
  readStrengthLabel: string
  trustNotes: string[]
  compositionSegments: CompositionSegment[]
  compositionHighlights: Array<{ label: string; value: string; body: string }>
  factorRows: BoardroomFactorRow[]
  factorAverages: Record<string, number>
  sdtRows: BoardroomSdtRow[]
  itemScores?: CampaignItemScoresResponse | null
  surveyThemes: ExitThemeCard[]
  verificationTrackLabel: string
  ownerRoleLabel: string
  firstStepLabel: string
  reviewMomentLabel: string
}

function SectionMiniNav() {
  const items = [
    ['kernsignaal', 'Kernsignaal'],
    ['responsbasis', 'Responsbasis'],
    ['signaalopbouw', 'Signaalopbouw'],
    ['prioriteiten', 'Prioriteiten'],
    ['survey-stemmen', 'Survey-stemmen'],
    ['handoff', 'Handoff'],
  ] as const

  return (
    <nav className="sticky top-3 z-10 border border-[rgba(13,27,42,0.15)] bg-[#F7F4EE]/95 px-3 py-3 backdrop-blur">
      <ul className="flex flex-wrap gap-2">
        {items.map(([href, label]) => (
          <li key={href}>
            <a
              href={`#${href}`}
              className="inline-flex border border-[rgba(13,27,42,0.15)] bg-white px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#44505C] transition-colors hover:text-[#132033]"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ExitProductDashboard({
  moduleHref,
  moduleLabel,
  moduleBackLinkLabel,
  campaignName,
  organizationName,
  routePeriodLabel,
  scopeLabel,
  statusLabel,
  headerActions,
  primarySignalScoreLabel,
  primarySignalBandLabel,
  strongestFactorLabel,
  strongestFactorNote,
  dominantThemeLabel,
  dominantThemeNote,
  executiveSummary,
  firstManagementQuestion,
  totalInvited,
  totalCompleted,
  responseRate,
  responseContextNote,
  readStrengthLabel,
  trustNotes,
  compositionSegments,
  compositionHighlights,
  factorRows,
  factorAverages,
  sdtRows,
  itemScores,
  surveyThemes,
  verificationTrackLabel,
  ownerRoleLabel,
  firstStepLabel,
  reviewMomentLabel,
}: ExitProductDashboardProps) {
  const topPriorityRows = factorRows.slice(0, 3)
  const responseBasisLabel = `${totalCompleted} ingevuld / ${responseRate}`

  return (
    <div className="space-y-5">
      <ResultsBoardroomHeader
        moduleHref={moduleHref}
        moduleLabel={moduleLabel}
        moduleBackLinkLabel={moduleBackLinkLabel}
        campaignName={campaignName}
        organizationName={organizationName}
        routePeriodLabel={routePeriodLabel}
        scopeLabel={scopeLabel}
        productLabel="ExitScan"
        statusLabel={statusLabel}
        actions={headerActions}
      />

      <SectionMiniNav />

      <section
        aria-label="Executive result strip"
        className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] xl:grid-cols-6"
      >
        {[
          { label: 'Frictiescore', value: primarySignalScoreLabel, note: 'Primaire groepsscore' },
          { label: 'Band / status', value: primarySignalBandLabel, note: 'Samenvatting op groepsniveau' },
          { label: 'Dominant thema', value: dominantThemeLabel, note: 'Wat in de resultaten het meest opvalt' },
          { label: 'Scherpste factor', value: strongestFactorLabel, note: 'Eerste aandachtspunt om te bespreken' },
          { label: 'Responsbasis', value: responseBasisLabel, note: `${totalInvited} uitgenodigd` },
          { label: 'Bestuurlijke vraag', value: 'Eerste prioriteit', note: firstManagementQuestion },
        ].map((item, index) => (
          <BoardroomMetricTile
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            tone={index === 0 ? 'amber' : 'white'}
          />
        ))}
      </section>

      <div id="kernsignaal">
        <ResultsBoardroomSection
          eyebrow="1. Kernsignaal"
          title="Kernsignaal"
          description="Gebruik deze terugblik op vertrekredenen als compacte samenvatting van wat nu het sterkst terugkomt. Lees het beeld als groepsinterpretatie, niet als harde oorzaakverklaring."
          aside={
            <span className="border border-[rgba(13,27,42,0.15)] bg-[#FEB234] px-3 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#132033]">
              {primarySignalBandLabel}
            </span>
          }
        >
          <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] xl:grid-cols-[minmax(0,1.2fr),minmax(320px,0.8fr)]">
            <div className="space-y-5 bg-white px-5 py-5 sm:px-6 sm:py-6">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
                Frictiescore
              </p>
              <p className="dash-number text-[clamp(3.2rem,9vw,6.5rem)] leading-none tracking-[-0.08em] text-[#132033]">
                {primarySignalScoreLabel}
              </p>
              <p className="max-w-3xl text-base leading-8 text-[#132033]">{executiveSummary}</p>
              <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] sm:grid-cols-3">
                <BoardroomMetricTile
                  label="Dominant thema"
                  value={dominantThemeLabel}
                  note={dominantThemeNote}
                  tone="chalk"
                />
                <BoardroomMetricTile
                  label="Scherpste factor"
                  value={strongestFactorLabel}
                  note={strongestFactorNote}
                  tone="chalk"
                />
                <BoardroomMetricTile
                  label="Resultaten beschikbaar"
                  value={statusLabel}
                  note="Gebruik dit als eerste samenvatting op groepsniveau; geen harde oorzaakverklaring."
                  tone="chalk"
                />
              </div>
            </div>
            <div className="grid gap-px bg-[rgba(13,27,42,0.15)]">
              <BoardroomMetricTile
                label="Bestuurlijke vraag"
                value="Eerste prioriteit"
                note={firstManagementQuestion}
                tone="ink"
              />
              <BoardroomMetricTile
                label="Interpretatiegrens"
                value="Resultaten beschikbaar"
                note="Lees dit vertrekbeeld als vertrekduiding op groepsniveau. Wat samenvalt vraagt verificatie; het bewijst geen oorzaak."
                tone="white"
              />
            </div>
          </div>
        </ResultsBoardroomSection>
      </div>

      <div id="responsbasis">
        <ResultsBoardroomSection
          eyebrow="2. Responsbasis / leessterkte"
          title="Responsbasis / leessterkte"
          description="Detailinzichten worden alleen getoond bij voldoende respons. Kleine groepen blijven verborgen om anonimiteit te beschermen."
          aside={
            <span className="border border-[rgba(13,27,42,0.15)] bg-white px-3 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
              Leessterkte - {readStrengthLabel}
            </span>
          }
        >
          <BoardroomKeyValueList
            items={[
              { label: 'Uitgenodigd', value: totalInvited },
              { label: 'Ingevuld', value: totalCompleted },
              { label: 'Respons', value: responseRate },
              { label: 'Leessterkte', value: readStrengthLabel },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(280px,0.9fr)]">
            <div className="border border-[rgba(13,27,42,0.15)] bg-[#F4F1EA] px-4 py-4 text-sm leading-6 text-[#44505C]">
              {responseContextNote}
            </div>
            <div className="border border-[rgba(13,27,42,0.15)] bg-white px-4 py-4">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
                Interpretatiegrens
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#44505C]">
                {trustNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </ResultsBoardroomSection>
      </div>

      <div id="signaalopbouw">
        <ResultsBoardroomSection
          eyebrow="3. Signaalopbouw"
          title="Welke lagen kleuren het vertrekbeeld?"
          description="De compositie laat zien welke lagen nu het sterkst terugkomen. Lees dit als indicatief patroonbeeld, geen causale verdeling."
        >
          <SignalCompositionRibbon
            title="Vertrekbeeld in lagen"
            segments={compositionSegments}
            note="Indicatief patroonbeeld, geen causale verdeling."
          />
          <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] lg:grid-cols-3">
            {compositionHighlights.map((item) => (
              <BoardroomMetricTile
                key={item.label}
                label={item.label}
                value={item.value}
                note={item.body}
                tone="white"
              />
            ))}
          </div>
        </ResultsBoardroomSection>
      </div>

      <div id="prioriteiten">
        <ResultsBoardroomSection
          eyebrow="4. Prioriteitenbeeld"
          title="Prioriteitenbeeld"
          description="De horizontale as toont beleving; de verticale as laat zien welke factoren bestuurlijk eerst aandacht vragen. Gebruik dit voor verificatie en prioritering."
        >
          {factorRows.length > 0 ? (
            <div className="space-y-5">
              <PriorityScatterPlot rows={factorRows} xLabel="Beleving" yLabel="Bestuurlijke aandacht" />
              <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] lg:grid-cols-3">
                {topPriorityRows.map((row, index) => (
                  <BoardroomMetricTile
                    key={row.factor}
                    label={`Topprioriteit 0${index + 1}`}
                    value={`${row.factor} · ${row.score}`}
                    note={`${row.band}. ${row.note}${row.question ? ` Eerste toetsvraag: ${row.question}` : ''}`}
                    tone={index === 0 ? 'amber' : 'white'}
                  />
                ))}
              </div>
              <FactorTable
                factorAverages={factorAverages}
                scanType="exit"
                itemScores={itemScores}
                showIntro={false}
              />
            </div>
          ) : (
            <BoardroomEmptyState
              title="Onvoldoende data"
              body="Nog geen veilige prioriteitenkaart beschikbaar voor organisatiefactoren."
            />
          )}
        </ResultsBoardroomSection>
      </div>

      <ResultsBoardroomSection
        eyebrow="5. Basisbehoeften / SDT"
        title="Basisbehoeften / SDT"
        description="Gebruik deze laag als verdieping op het vertrekbeeld. De positie van de punt laat zien welke basisbehoeften relatief meer onder druk staan."
      >
        {sdtRows.length > 0 ? (
          <SdtTriangleMap rows={sdtRows} />
        ) : (
          <BoardroomEmptyState
            title="Nog niet beschikbaar"
            body="Voor deze route zijn geen SDT-scores vrijgegeven of veilig genoeg om op groepsniveau te tonen."
          />
        )}
      </ResultsBoardroomSection>

      <div id="survey-stemmen">
        <ResultsBoardroomSection
          eyebrow="6. Survey-stemmen"
          title="Survey-stemmen"
          description="Open signalen verdiepen het beeld waar de anonimiteitsgrens dat toelaat. Quotes blijven geanonimiseerd en onderdrukt bij te lage n."
        >
          {surveyThemes.length > 0 ? (
            <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] xl:grid-cols-3">
              {surveyThemes.map((theme) => (
                <div key={theme.key} className="space-y-4 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
                        {theme.evidenceLabel}
                      </p>
                      <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-[#132033]">
                        {theme.title}
                      </h3>
                    </div>
                    <span className="border border-[rgba(13,27,42,0.15)] bg-[#F4F1EA] px-2 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#44505C]">
                      n={theme.count}
                    </span>
                  </div>
                  {theme.relationLabel ? (
                    <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#A06D11]">
                      {theme.relationLabel}
                    </p>
                  ) : null}
                  <p className="text-sm leading-6 text-[#44505C]">{theme.implication}</p>
                  {theme.quote ? (
                    <blockquote className="border-l border-[#FEB234] pl-3 text-sm italic leading-6 text-[#132033]">
                      &quot;{theme.quote}&quot;
                    </blockquote>
                  ) : (
                    <p className="text-xs leading-5 text-[#44505C]">
                      Quote onderdrukt zolang de anonimiteitsgrens voor dit thema te smal blijft.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <BoardroomEmptyState
              title="Nog geen open signaallaag"
              body="Er zijn nog geen bruikbare open antwoorden of themaclusters die veilig op groepsniveau getoond kunnen worden."
            />
          )}
        </ResultsBoardroomSection>
      </div>

      <div id="handoff">
        <ResultsBoardroomSection
          eyebrow="7. Management handoff"
          title="Management handoff"
          description="Sluit af met een eerste verificatiespoor, een eigenaar en een concreet reviewmoment. Gebruik dit als bounded managementsamenvatting: eerst bespreken voordat bredere actie volgt."
          tone="ink"
        >
          <div className="grid gap-px border border-[#2B3A4E] bg-[#2B3A4E] lg:grid-cols-2 xl:grid-cols-4">
            <BoardroomMetricTile
              label="Eerste verificatiespoor"
              value={verificationTrackLabel}
              note="Kies eerst welk onderwerp management als eerste moet bespreken."
              tone="ink"
            />
            <BoardroomMetricTile
              label="Bestuurlijke vraag"
              value="Eerste prioriteit"
              note={firstManagementQuestion}
              tone="ink"
            />
            <BoardroomMetricTile
              label="Eerste eigenaar"
              value={ownerRoleLabel}
              note={firstStepLabel}
              tone="ink"
            />
            <BoardroomMetricTile
              label="Reviewmoment"
              value="Vastleggen"
              note={reviewMomentLabel}
              tone="ink"
            />
          </div>
        </ResultsBoardroomSection>
      </div>
    </div>
  )
}

