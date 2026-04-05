import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600 tracking-tight">Verisight</span>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#hoe-het-werkt" className="hover:text-blue-600 transition-colors">Hoe het werkt</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#prijzen" className="hover:text-blue-600 transition-colors">Prijzen</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Inloggen
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Gratis starten →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            ExitScan & RetentieScan — nu beschikbaar
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Weet waarom medewerkers<br />
            <span className="text-blue-400">vertrekken.</span>{' '}
            Voordat het te laat is.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Verisight geeft HR-teams diepgaande inzichten in verlooprisico —
            wetenschappelijk onderbouwd op basis van de Zelfdeterminatietheorie,
            direct toepasbaar in het dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Start gratis proefperiode
            </Link>
            <a
              href="#hoe-het-werkt"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors border border-white/10"
            >
              Bekijk hoe het werkt
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-5">14 dagen gratis · Geen creditcard vereist · AVG-conform</p>
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
            {/* Mock dashboard */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-5 w-32 bg-gray-800 rounded font-bold text-gray-900 text-sm flex items-center px-2">Campaigns</div>
                </div>
                <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">+ Nieuwe campaign</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'ExitScan Q2 2025', type: 'ExitScan', invited: 24, completed: 18, risk: '7.2', band: 'HOOG' },
                  { name: 'RetentieScan Operations', type: 'RetentieScan', invited: 45, completed: 31, risk: '4.8', band: 'MIDDEN' },
                  { name: 'ExitScan Sales', type: 'ExitScan', invited: 12, completed: 9, risk: '3.1', band: 'LAAG' },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${c.type === 'ExitScan' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {c.type}
                        </span>
                        <div className="text-xs font-semibold text-gray-800 mt-1">{c.name}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      <div className="text-center"><div className="text-sm font-bold text-gray-900">{c.invited}</div><div className="text-xs text-gray-400">Uitgen.</div></div>
                      <div className="text-center"><div className="text-sm font-bold text-gray-900">{c.completed}</div><div className="text-xs text-gray-400">Ingevuld</div></div>
                      <div className="text-center"><div className="text-sm font-bold text-gray-900">{Math.round(c.completed/c.invited*100)}%</div><div className="text-xs text-gray-400">Respons</div></div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(c.completed/c.invited*100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Gem. risico</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900">{c.risk}<span className="text-xs font-normal text-gray-400">/10</span></span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${c.band === 'HOOG' ? 'bg-red-100 text-red-700' : c.band === 'MIDDEN' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {c.band}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vertrouwensregel ──────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            Gebruikt door HR-teams bij organisaties met <strong className="text-gray-700">50–5.000 medewerkers</strong> · AVG-conform · Gehost in Europa
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
            Zonder gestructureerde data weet je pas waarom iemand vertrekt als het te laat is.
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
              desc: 'Gemiddeld €15.000–€45.000 per vertrekkende medewerker aan werving, onboarding en productiviteitsverlies.',
            },
            {
              icon: '🔮',
              title: 'Je weet niet wie er daarna vertrekt',
              desc: 'Zonder meting geen voorspelling. Tegen de tijd dat je het merkt, zijn ze al weg.',
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

      {/* ── Hoe het werkt ─────────────────────────────────────────── */}
      <section id="hoe-het-werkt" className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Twee scans. Één dashboard.<br />Volledig inzicht.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Van uitnodiging tot aanbeveling in drie stappen.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Maak een campaign aan',
                desc: 'Kies ExitScan voor vertrekkende medewerkers of RetentieScan voor huidig personeel. Genereer gepersonaliseerde survey-links in één klik.',
              },
              {
                step: '02',
                title: 'Medewerkers vullen in',
                desc: 'Een gevalideerde vragenlijst op basis van de Zelfdeterminatietheorie (SDT). Anoniem, mobiel-vriendelijk, in gemiddeld 8 minuten ingevuld.',
              },
              {
                step: '03',
                title: 'Inzichten in je dashboard',
                desc: 'Risicoscores per medewerker, organisatiefactoren, patroonanalyse en concrete aanbevelingen. Exporteerbaar als professioneel PDF-rapport.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-bold text-blue-600/30 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ExitScan vs RetentieScan */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">ExitScan</div>
              <h3 className="text-xl font-bold mb-3">Analyseer vertrek. Voorkom herhaling.</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Inzicht in de werkelijke vertrekreden, mate van vermijdbaarheid en de vervangingskosten
                per medewerker. Identificeer structurele patronen voordat ze escaleren.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                {['Vertrekreden analyse', 'Vermijdbaarheidscore', 'Vervangingskostenberekening', 'Patroonherkenning per afdeling'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-blue-400">✓</span> {f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="text-purple-400 font-bold text-sm mb-2 uppercase tracking-wide">RetentieScan</div>
              <h3 className="text-xl font-bold mb-3">Voorspel verloop. Grijp vroeg in.</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Meet betrokkenheid, autonomie, verbondenheid en werkdruk bij actieve medewerkers.
                Identificeer wie het hoogste verlooprisico draagt — vóór het zover is.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                {['Risicoscore per medewerker', 'SDT basisbehoeften meting', 'UWES betrokkenheidsscore', 'Turnover intention index'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-purple-400">✓</span> {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Alles wat HR nodig heeft
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Geen losse tools. Geen handmatige analyses. Eén platform voor alle verloopinzichten.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '📊', title: 'Risicoscore per medewerker', desc: 'Automatisch berekend op basis van SDT + 6 organisatiefactoren. Schaal van 1–10.' },
            { icon: '🔍', title: 'Patroonanalyse', desc: 'Zie welke afdelingen of functieniveaus structureel het hoogste risico lopen.' },
            { icon: '📄', title: 'PDF-rapporten', desc: 'Professionele rapportage voor management, directie of ondernemingsraad. Eén klik.' },
            { icon: '🔒', title: 'Privacy-first', desc: 'AVG-conform, geanonimiseerde data, volledig gehost in Europa (Supabase EU).' },
            { icon: '🚀', title: 'Binnen 10 minuten live', desc: 'Maak een campaign aan, genereer links en verstuur. Geen implementatietraject.' },
            { icon: '📈', title: 'Wetenschappelijk fundament', desc: 'Gebaseerd op de Zelfdeterminatietheorie (Van den Broeck et al., 2010).' },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prijzen ───────────────────────────────────────────────── */}
      <section id="prijzen" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transparante prijzen
            </h2>
            <p className="text-gray-500">Geen verborgen kosten. Maandelijks opzegbaar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '€199',
                desc: 'Voor kleine HR-teams die willen starten met data-gedreven exitanalyse.',
                features: ['1 organisatie', '3 actieve campaigns', 'Onbeperkt respondenten', 'PDF-rapporten', 'E-mail support'],
                cta: 'Start gratis',
                href: '/signup',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '€499',
                desc: 'Voor groeiende organisaties met meerdere afdelingen of entiteiten.',
                features: ['5 organisaties', 'Onbeperkt campaigns', 'Onbeperkt respondenten', 'PDF-rapporten + API', 'Prioriteit support'],
                cta: 'Start gratis',
                href: '/signup',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Op maat',
                desc: 'Voor grote organisaties met specifieke eisen rondom integratie en beveiliging.',
                features: ['Onbeperkt organisaties', 'White-label optie', 'SSO / SAML', 'SLA garantie', 'Dedicated support'],
                cta: 'Neem contact op',
                href: 'mailto:hallo@verisight.nl',
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-7 border ${plan.highlight
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200'
                  : 'bg-white border-gray-200'}`}
              >
                <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`}>
                  {plan.name}
                </div>
                <div className={`text-3xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                  {plan.price !== 'Op maat' && <span className={`text-sm font-normal ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>/mnd</span>}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                      <span className={plan.highlight ? 'text-blue-200' : 'text-blue-500'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors ${plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sluit-CTA ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om verloop inzichtelijk te maken?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Start vandaag met een gratis proefperiode van 14 dagen. Geen creditcard vereist.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl text-base transition-colors"
          >
            Maak een gratis account aan →
          </Link>
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
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Verisight · AVG-conform · Gehost in Europa
          </p>
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
