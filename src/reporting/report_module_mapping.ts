export interface V2ToV3ModuleMapping {
  v2Module: string
  status: 'behouden' | 'samengevoegd' | 'gesplitst' | 'verwijderd' | 'nieuw'
  v3Destination: string
  notes: string
}

export const V2_TO_V3_MODULE_MAPPING: V2ToV3ModuleMapping[] = [
  {
    v2Module: 'M1 Cover + KPI strip + 3 exec cards',
    status: 'behouden',
    v3Destination: 'P1 Executive cover',
    notes: 'Identiek, inclusief KPI strip en drie executive cards.'
  },
  {
    v2Module: 'M2 Bestuurlijke handoff (3-stap)',
    status: 'behouden',
    v3Destination: 'P2 Bestuurlijke handoff',
    notes: 'Drie handoff-blokken blijven, blok 4 nonclaim is nieuw en verplicht.'
  },
  {
    v2Module: 'M3 Prioriteitenbeeld (scatter)',
    status: 'behouden',
    v3Destination: 'P3 Drivers zone A',
    notes: 'Scatter blijft ongewijzigd in as-semantiek.'
  },
  {
    v2Module: 'M4 Factor detail cards',
    status: 'behouden',
    v3Destination: 'P3 Drivers zone B',
    notes: 'Maximaal twee factorcards, altijd top-2 op signaalwaarde.'
  },
  {
    v2Module: 'M5 Prioriteit & verificatievragen',
    status: 'verwijderd',
    v3Destination: 'P5 actiekaarten',
    notes: 'Geen zelfstandige pagina meer; verificatievragen leven verder binnen P5.'
  },
  {
    v2Module: 'M6-ES Frictieverdeling / M6-RS Retentiesignaal quad',
    status: 'samengevoegd',
    v3Destination: 'P4 zone C',
    notes: 'Zelfstandige signaalpagina vervalt; gauge + verdeling blijven binnen P4.'
  },
  {
    v2Module: 'M7-ES / M7-RS kernbalken',
    status: 'samengevoegd',
    v3Destination: 'P4 zone A+B',
    notes: 'Hoofdredenen, intentiegroepen en cofactors verhuizen naar de kernsignalenpagina.'
  },
  {
    v2Module: 'M8 Quotes',
    status: 'samengevoegd',
    v3Destination: 'P4 zone D',
    notes: 'Quotes zijn een conditioneel blok en krijgen geen eigen pagina meer.'
  },
  {
    v2Module: 'M9 30–90 dagenroute',
    status: 'behouden',
    v3Destination: 'P5 Eerste route & managementactie',
    notes: 'Route, eigenaar, eerste stap en review blijven op één actiepagina.'
  },
  {
    v2Module: 'M10 Methodiek & verantwoording',
    status: 'gesplitst',
    v3Destination: 'P6 + B1',
    notes: 'Compacte leeswijzer blijft in P6; technische accountability verhuist naar B1.'
  },
  {
    v2Module: 'M7b Segmentanalyse',
    status: 'nieuw',
    v3Destination: 'A1 Segmentanalyse',
    notes: 'Segmentanalyse wordt een expliciete appendix en verdwijnt uit de main flow.'
  }
]

export const DISALLOWED_V2_MAIN_FLOW_MODULES = ['M5', 'M6-ES', 'M6-RS', 'M7b', 'M8', 'M10-full']
