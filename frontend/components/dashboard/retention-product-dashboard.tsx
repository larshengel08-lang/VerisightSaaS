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

type RetentionThemeCard = {
  key: string
  title: string
  count: number
  implication: string
  quote?: string | null
  relationLabel?: string | null
  evidenceLabel: string
}

interface RetentionProductDashboardProps {
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
  engagementLabel: string
  turnoverIntentionLabel: string
  stayIntentLabel: string
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
  surveyThemes: RetentionThemeCard[]
  verificationTrackLabel: string
  ownerRoleLabel: string
  firstStepLabel: string
  reviewMomentLabel: string
}

export function RetentionProductDashboard({
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
  engagementLabel,
  turnoverIntentionLabel,
  stayIntentLabel,
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
}: RetentionProductDashboardProps) {
  const topPriorityRows = factorRows.slice(0, 3)

  return (
    <div className="space-y-6">
      <ResultsBoardroomHeader
        moduleHref={moduleHref}
        moduleLabel={moduleLabel}
        moduleBackLinkLabel={moduleBackLinkLabel}
        campaignName={campaignName}
        organizationName={organizationName}
        routePeriodLabel={routePeriodLabel}
        scopeLabel={scopeLabel}
        productLabel="RetentieScan"
        statusLabel={statusLabel}
        actions={headerActions}
      />

      <ResultsBoardroomSection
        eyebrow="1. Kernsignaal"
        title="Kernsignaal"
        description="RetentieScan opent het groepsbeeld als behoudssignaal. Lees score, aanvullende signalen en factorbeeld samen als eerste verificatiehulp."
        aside={
          <span className="border border-[rgba(13,27,42,0.15)] bg-[#FEB234] px-3 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#132033]">
            {primarySignalBandLabel}
          </span>
        }
      >
        <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] xl:grid-cols-[minmax(0,1.15fr),minmax(320px,0.85fr)]">
          <div className="grid gap-px bg-[rgba(13,27,42,0.15)]">
            <BoardroomMetricTile
              label="Retentiesignaal"
              value={primarySignalScoreLabel}
              note="Het retentiesignaal laat zien hoe scherp behoudsdruk gemiddeld terugkomt in de leesbare responses."
              tone="white"
              prominent
            />
            <div className="grid gap-px bg-[rgba(13,27,42,0.15)] sm:grid-cols-3">
              <BoardroomMetricTile
                label="Bevlogenheid"
                value={engagementLabel}
                note="Lees deze waarde samen met behoudsdruk en aanvullende signalen."
                tone="chalk"
              />
              <BoardroomMetricTile
                label="Vertrekintentie"
                value={turnoverIntentionLabel}
                note="Laat zien hoe expliciet vertrekdenken nu op groepsniveau terugkomt."
                tone="chalk"
              />
              <BoardroomMetricTile
                label="Blijfintentie"
                value={stayIntentLabel}
                note="Helpt bepalen of twijfel al richting blijven of juist richting vertrek beweegt."
                tone="chalk"
              />
            </div>
          </div>
          <div className="grid gap-px bg-[rgba(13,27,42,0.15)]">
            <BoardroomMetricTile
              label="Bestuurlijke vraag"
              value="Eerst toetsen"
              note={firstManagementQuestion}
              tone="ink"
            />
            <div className="grid gap-px bg-[rgba(13,27,42,0.15)] sm:grid-cols-2">
              <BoardroomMetricTile
                label="Scherpste factor"
                value={strongestFactorLabel}
                note={strongestFactorNote}
                tone="white"
              />
              <BoardroomMetricTile
                label="Status"
                value={statusLabel}
                note="Gebruik de band als leesdiscipline, niet als individuele voorspelling."
                tone="white"
              />
            </div>
          </div>
        </div>
      </ResultsBoardroomSection>

      <ResultsBoardroomSection
        eyebrow="2. Responsbasis / leessterkte"
        title="Responsbasis / leessterkte"
        description="Deze laag laat zien hoe stevig het gegroepeerde beeld gelezen mag worden en welke suppressiegrenzen blijven gelden."
        aside={
          <span className="border border-[rgba(13,27,42,0.15)] bg-white px-3 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
            Leessterkte — {readStrengthLabel}
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
              Leesgrenzen
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#44505C]">
              {trustNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </ResultsBoardroomSection>

      <ResultsBoardroomSection
        eyebrow="3. Signaalopbouw"
        title="Signaalopbouw"
        description="De compositie laat zien hoe de signalen in de groep verdeeld zijn. Lees dit als patroonbeeld en niet als bewezen causaliteit."
      >
        <SignalCompositionRibbon
          title="Behoudsbeeld in lagen"
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

      <ResultsBoardroomSection
        eyebrow="4. Prioriteitenbeeld"
        title="Prioriteitenbeeld"
        description="De horizontale as toont beleving, de verticale as bestuurlijke aandacht. Gebruik de topkaarten om het eerste behoudsspoor te kiezen."
      >
        {factorRows.length > 0 ? (
          <div className="space-y-5">
            <PriorityScatterPlot rows={factorRows} xLabel="Beleving" yLabel="Bestuurlijke aandacht" />
            <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] lg:grid-cols-3">
              {topPriorityRows.map((row, index) => (
                <BoardroomMetricTile
                  key={row.factor}
                  label={`Topprioriteit 0${index + 1}`}
                  value={row.factor}
                  note={`${row.band} — ${row.note}`}
                  tone={index === 0 ? 'amber' : 'white'}
                />
              ))}
            </div>
            <FactorTable
              factorAverages={factorAverages}
              scanType="retention"
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

      <ResultsBoardroomSection
        eyebrow="5. Basisbehoeften / SDT"
        title="Basisbehoeften / SDT"
        description="De basisbehoeften helpen het groepsbeeld verdiepen zonder er losse bewijsvoering van te maken."
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

      <ResultsBoardroomSection
        eyebrow="6. Survey-stemmen"
        title="Survey-stemmen"
        description="Open signalen verdiepen het behoudsbeeld waar de anonimiteitsgrens dat toelaat. Quotes blijven geanonimiseerd en worden onderdrukt als de drempel te smal is."
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
                    {theme.count}
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

      <ResultsBoardroomSection
        eyebrow="7. Bestuurlijke handoff"
        title="Bestuurlijke handoff"
        description="Rond de boardroom-read af met een eerste verificatiespoor, een begrensde eigenaar en een reviewmoment. Dit blijft een managementhandoff, geen breed workflowproduct."
        tone="ink"
      >
        <div className="grid gap-px border border-[#2B3A4E] bg-[#2B3A4E] lg:grid-cols-2 xl:grid-cols-4">
          <BoardroomMetricTile
            label="Eerste verificatiespoor"
            value={verificationTrackLabel}
            note="Kies eerst welk spoor bestuurlijk getoetst moet worden voordat bredere opvolging volgt."
            tone="ink"
          />
          <BoardroomMetricTile
            label="Bestuurlijke vraag"
            value="Eerst verifiëren"
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
  )
}
