import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600 tracking-tight">Verisight</span>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#aanpak" className="hover:text-blue-600 transition-colors">Aanpak</a>
            <a href="#wat-je-krijgt" className="hover:text-blue-600 transition-colors">Wat je krijgt</a>
            <a href="#tarieven" className="hover:text-blue-600 transition-colors">Tarieven</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Inloggen
            </Link>
            <a
              href="mailto:hallo@verisight.nl"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Vraag een demo aan →
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            ExitScan — voor organisaties die grip willen krijgen op vertrekredenen
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Begrijp waarom medewerkers<br />
            <span className="text-blue-400">vertrekken.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Wij zetten de ExitScan voor je op, verzorgen de uitnodigingen en leveren
            dashboardinzichten en een adviesrapport op. Zonder implementatielast voor jouw team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hallo@verisight.nl"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Plan een kennismakingsgesprek
            </a>
            <a
              href="#aanpak"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors border border-white/10"
            >
              Bekijk hoe het werkt
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-5">Vroege toegang · Gehost in Europa · AVG-conform</p>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto px-6 pb-0">
          <div className="bg-slate-800 rounded-t-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Browser bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-3 flex-1 bg-slate-700 rounded text-xs text-slate-400 px-3 py-1 max-w-xs">
                app.verisight.nl/dashboard
              </div>
            </div>
            {/* Mock dashboard — single campaign, realistic first-use view */}
            <div className="bg-white">
              {/* Campaign header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">ExitScan</span>
                    <span className="text-xs text-green-600 font-medium">● Actief</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">Uitstroom 2026 — Uw organisatie</p>
                </div>
                <span className="text-xs text-gray-400 italic">Illustratief voorbeeld</span>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
                {[
                  { label: 'Responses',    value: '14/18',  sub: '78% respons' },
                  { label: 'Gem. risico',  value: '7.2/10', sub: 'HOOG', highlight: 'red' },
                  { label: 'Vermijdbaar',  value: '68%',    sub: 'van vertrek', highlight: 'amber' },
                  { label: 'Gem. diensttijd', value: '2.4j', sub: 'bij vertrek' },
                ].map((k, i) => (
                  <div key={i} className={`px-4 py-3 text-center ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                    <div className={`text-base font-bold ${k.highlight === 'red' ? 'text-red-600' : k.highlight === 'amber' ? 'text-amber-600' : 'text-gray-900'}`}>
                      {k.value}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Theme risk bars */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Risico per thema</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Leiderschap',       risk: 8.1, band: 'HOOG',   pct: 81 },
                    { label: 'Groei & Ontwikkeling', risk: 6.4, band: 'MIDDEN', pct: 64 },
                    { label: 'Cultuur',            risk: 5.9, band: 'MIDDEN', pct: 59 },
                    { label: 'Werkbelasting',      risk: 3.1, band: 'LAAG',   pct: 31 },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-36 shrink-0">{t.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.band === 'HOOG' ? 'bg-red-400' : t.band === 'MIDDEN' ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${t.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-8 text-right">{t.risk}</span>
                      <span className={`text-xs font-semibold w-14 text-right ${t.band === 'HOOG' ? 'text-red-600' : t.band === 'MIDDEN' ? 'text-amber-600' : 'text-green-600'}`}>
                        {t.band}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key insight callout */}
              <div className="mx-5 mb-5 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <span className="text-amber-500 text-sm">⚠</span>
                <p className="text-xs text-amber-800 font-medium">
                  68% van het vertrek was mogelijk te voorkomen — leiderschap is het prioritaire aandachtspunt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vertrouwensregel ──────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            Voor HR-teams bij organisaties met <strong className="text-gray-700">200–1.000 medewerkers</strong>
            {' '}· AVG-conform · Gehost in Europa · Wetenschappelijk onderbouwde methodologie
          </p>
        </div>
      </section>

      {/* ── Probleemblok ──────────────────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            HR heeft een blinde vlek
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Zonder gestructureerde data blijven vertrekredenen vaag en patronen onzichtbaar.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📝',
              title: 'Exitgesprekken geven geen data',
              desc: 'Handmatige notities, geen patronen, geen benchmarks. Elk gesprek verdwijnt in een la.',
            },
            {
              icon: '💸',
              title: 'Verloop kost meer dan je denkt',
              desc: 'Gemiddeld €15.000–€45.000 per vertrekkende medewerker aan werving, onboarding en productiviteitsverlies (SHRM / Josh Bersin Institute).',
            },
            {
              icon: '📉',
              title: 'Patronen blijven onzichtbaar',
              desc: 'Zonder structuur mist HR concrete stuurinformatie. De schade is al ontstaan voordat je het signaleert.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Aanpak / Hoe het werkt ────────────────────────────────── */}
      <section id="aanpak" className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Van uitnodiging tot advies<br />in drie stappen.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Wij regelen de uitvoering. Jij ontvangt de inzichten.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '01',
                title: 'Wij zetten de scan op',
                desc: 'Na een kort intake-gesprek configureren wij de ExitScan voor jouw organisatie en verzorgen de uitnodigingen aan vertrekkende medewerkers.',
              },
              {
                step: '02',
                title: 'Medewerkers vullen in',
                desc: 'Een gestructureerde vragenlijst — vertrouwelijk, mobiel-vriendelijk, in circa 8–12 minuten ingevuld. Gebaseerd op wetenschappelijk gevalideerde meetinstrumenten.',
              },
              {
                step: '03',
                title: 'Inzichten en debrief',
                desc: 'Je ontvangt toegang tot het dashboard met themaanalyse en aanbevelingen op organisatieniveau. Wij lichten de resultaten toe in een debrief-gesprek.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-bold text-blue-600/30 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ExitScan primair — RetentieScan als vervolgstap */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">ExitScan — nu beschikbaar</div>
              <h3 className="text-xl font-bold mb-3">Analyseer vertrek. Voorkom herhaling.</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Inzicht in de werkelijke vertrekreden, mate van vermijdbaarheid en structurele
                patronen per afdeling of thema. Vertaald naar concrete aanbevelingen voor HR en management.
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-300">
                {[
                  'Gestructureerde vertrekreden analyse',
                  'Themaherkenning per afdeling',
                  'Vermijdbaarheid per vertrekgeval',
                  'Adviesrapport voor management',
                  'Dashboard met organisatie-inzichten',
                  'Debrief-gesprek inbegrepen',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-blue-400">✓</span> {f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-wide">RetentieScan — vervolgstap</div>
                <h3 className="text-lg font-bold mb-3 text-slate-300">Meet verlooprisico bij huidig personeel.</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Voor organisaties die na de ExitScan ook inzicht willen in het risico bij zittende medewerkers.
                  Beschikbaar op aanvraag.
                </p>
              </div>
              <a
                href="mailto:hallo@verisight.nl"
                className="mt-6 block text-center text-sm font-semibold text-slate-400 border border-slate-600 rounded-xl py-2 hover:border-slate-400 hover:text-slate-300 transition-colors"
              >
                Meer informatie →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Wat je krijgt ─────────────────────────────────────────── */}
      <section id="wat-je-krijgt" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Wat je krijgt
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Geen losse tools. Geen handmatige analyses. Een compleet begeleid traject van uitnodiging tot advies.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🔍', title: 'Thema- en patroonanalyse', desc: 'Zie welke vertrekthema\'s en organisatiefactoren structureel terugkeren — op afdelings- of organisatieniveau.' },
            { icon: '📄', title: 'Adviesrapport voor management', desc: 'Professionele rapportage met bevindingen en aanbevelingen. Geschikt voor HR, directie of ondernemingsraad.' },
            { icon: '📊', title: 'Dashboard met organisatie-inzichten', desc: 'Overzicht van vertrekredenen, thema\'s en vermijdbaarheid. Inzichten op geaggregeerd niveau — nooit herleidbaar tot individuen.' },
            { icon: '🤝', title: 'Volledig begeleid', desc: 'Wij regelen de opzet, uitnodigingen en versturing. Jij hoeft geen tool te leren kennen of te beheren.' },
            { icon: '🔒', title: 'Privacy-first en AVG-conform', desc: 'Vertrouwelijke verwerking, data gehost in Europa. Resultaten worden uitsluitend op geaggregeerd niveau gedeeld.' },
            { icon: '📈', title: 'Wetenschappelijk fundament', desc: 'Gebaseerd op gevalideerde meetinstrumenten uit de arbeids- en organisatiepsychologie.' },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tarieven ──────────────────────────────────────────────── */}
      <section id="tarieven" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Eén trajectprijs — alles inbegrepen
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Geen abonnement, geen verborgen kosten. Je betaalt eenmalig per ExitScan-traject.
              De prijs is afhankelijk van de omvang van je organisatie en het aantal medewerkers.
              Vraag een offerte aan — gemiddeld antwoord binnen één werkdag.
            </p>
          </div>

          {/* Wat zit erin */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Altijd inbegrepen — geen verborgen kosten</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: '⚙️', text: 'Volledige scan-opzet door Verisight' },
                { icon: '📧', text: 'Uitnodigingen en opvolging verzorgd' },
                { icon: '📊', text: 'Dashboard met thema- en patroonanalyse' },
                { icon: '📄', text: 'Adviesrapport met aanbevelingen' },
                { icon: '🤝', text: 'Debrief-gesprek ter toelichting van de resultaten' },
                { icon: '🔒', text: 'AVG-conforme verwerking, data gehost in Europa' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="mailto:hallo@verisight.nl"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Vraag een offerte aan →
            </a>
            <p className="text-sm text-gray-400 mt-3">
              Gemiddeld antwoord binnen één werkdag
            </p>
          </div>
        </div>
      </section>

      {/* ── Sluit-CTA ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Grip op vertrekredenen begint met één gesprek.
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Plan een vrijblijvend kennismakingsgesprek en ontdek wat een ExitScan voor jouw organisatie kan opleveren.
          </p>
          <a
            href="mailto:hallo@verisight.nl"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl text-base transition-colors"
          >
            Plan een kennismakingsgesprek →
          </a>
          <p className="text-slate-600 text-sm mt-4">
            Al een account?{' '}
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors underline">
              Inloggen
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-blue-600">Verisight</span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} Verisight</span>
            <span>·</span>
            <span>AVG-conform</span>
            <span>·</span>
            <span>Gehost in Europa</span>
            <span>·</span>
            <span>Wetenschappelijk onderbouwd</span>
            <span>·</span>
            <span>Ontwikkeld vanuit HR-praktijk</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <a href="mailto:hallo@verisight.nl" className="hover:text-gray-600 transition-colors">Contact</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Privacybeleid</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Voorwaarden</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
