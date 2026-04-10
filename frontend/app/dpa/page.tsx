import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Verwerkersovereenkomst',
  description:
    'Standaard verwerkersovereenkomst (DPA) van Verisight voor klantorganisaties — AVG-conform, beschikbaar in het Nederlands.',
}

export default function DpaPage() {
  return (
    <LegalPageShell
      title="Verwerkersovereenkomst"
      description="Onderstaande verwerkersovereenkomst is het standaardtemplate dat Verisight hanteert voor klantorganisaties. Het document is op verzoek beschikbaar als gepersonaliseerde, ondertekende versie. Neem hiervoor contact op via privacy@verisight.nl."
      lastUpdated="10 april 2026"
    >
      {/* Intro notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-6 py-4 text-sm text-blue-900 mb-2">
        <strong>Let op:</strong> Dit is een standaardtemplate. Velden aangeduid met{' '}
        <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">[…]</code> worden ingevuld op basis
        van uw organisatiegegevens. Neem contact op via{' '}
        <a href="mailto:privacy@verisight.nl" className="underline">
          privacy@verisight.nl
        </a>{' '}
        voor een gepersonaliseerd en ondertekend exemplaar.
      </div>

      {/* Partijen */}
      <section>
        <h2>Partijen</h2>
        <p>
          Deze verwerkersovereenkomst wordt gesloten tussen:
        </p>
        <p>
          <strong>Verwerkingsverantwoordelijke:</strong>{' '}
          <span className="font-mono text-sm">[KLANTORGANISATIE]</span>, gevestigd te{' '}
          <span className="font-mono text-sm">[KLANTADRES]</span>, hierna te noemen &quot;Verwerkingsverantwoordelijke&quot;;
        </p>
        <p>
          en
        </p>
        <p>
          <strong>Verwerker:</strong> Verisight, gevestigd te [adres], KvK-nummer [KvK-nummer],
          bereikbaar via{' '}
          <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>, hierna te noemen
          &quot;Verwerker&quot;;
        </p>
        <p>
          hierna gezamenlijk aangeduid als &quot;Partijen&quot;.
        </p>
      </section>

      {/* Artikel 1 */}
      <section>
        <h2>Artikel 1 — Definities</h2>
        <p>In deze overeenkomst wordt verstaan onder:</p>
        <ul>
          <li>
            <strong>Verwerkingsverantwoordelijke:</strong> de natuurlijke persoon of rechtspersoon die het doel
            van en de middelen voor de verwerking van persoonsgegevens vaststelt.
          </li>
          <li>
            <strong>Verwerker:</strong> de natuurlijke persoon of rechtspersoon die ten behoeve van de
            Verwerkingsverantwoordelijke persoonsgegevens verwerkt.
          </li>
          <li>
            <strong>Betrokkene:</strong> de identificeerbare of geïdentificeerde natuurlijke persoon op wie de
            persoonsgegevens betrekking hebben.
          </li>
          <li>
            <strong>Persoonsgegevens:</strong> alle informatie over een geïdentificeerde of identificeerbare
            natuurlijke persoon als bedoeld in artikel 4, lid 1, AVG.
          </li>
          <li>
            <strong>Inbreuk in verband met persoonsgegevens (Datalek):</strong> een inbreuk op de beveiliging
            die per ongeluk of op onrechtmatige wijze leidt tot de vernietiging, het verlies, de wijziging of
            de ongeoorloofde verstrekking van of de ongeoorloofde toegang tot doorgezonden, opgeslagen of
            anderszins verwerkte gegevens.
          </li>
          <li>
            <strong>AVG:</strong> de Algemene Verordening Gegevensbescherming (EU) 2016/679.
          </li>
          <li>
            <strong>Dienst:</strong> de ExitScan-dienstverlening van Verwerker zoals omschreven in de tussen
            Partijen gesloten dienstverleningsovereenkomst.
          </li>
        </ul>
      </section>

      {/* Artikel 2 */}
      <section>
        <h2>Artikel 2 — Onderwerp en duur</h2>
        <p>
          Deze verwerkersovereenkomst heeft betrekking op de verwerking van persoonsgegevens die plaatsvindt
          in het kader van de Dienst ExitScan van Verwerker. De overeenkomst treedt in werking op het moment
          van aanvaarding en loopt gelijk met de looptijd van de tussen Partijen gesloten
          dienstverleningsovereenkomst, tenzij Partijen schriftelijk anders overeenkomen.
        </p>
      </section>

      {/* Artikel 3 */}
      <section>
        <h2>Artikel 3 — Aard, doel en omvang van de verwerking</h2>
        <p>
          Verwerker verwerkt persoonsgegevens uitsluitend ten behoeve van de uitvoering van ExitScan. De
          verwerking omvat de volgende categorieën van gegevens:
        </p>
        <ul>
          <li>
            <strong>Accountgegevens HR-gebruikers:</strong> naam en zakelijk e-mailadres van HR-medewerkers
            en beheerders bij de Verwerkingsverantwoordelijke.
          </li>
          <li>
            <strong>Surveygegevens respondenten:</strong> e-mailadres (voor uitnodiging en herinnering) en
            antwoorden op de ExitScan-vragenlijst.
          </li>
          <li>
            <strong>Contextgegevens respondenten:</strong> door de Verwerkingsverantwoordelijke aangeleverde
            informatie zoals afdeling, functieniveau en diensttijd, voor zover nodig voor segmentatie en
            rapportage.
          </li>
        </ul>
        <p>De categorieën betrokkenen zijn:</p>
        <ul>
          <li>HR-medewerkers en beheerders van de Verwerkingsverantwoordelijke;</li>
          <li>Respondenten: (voormalig) medewerkers van de Verwerkingsverantwoordelijke.</li>
        </ul>
      </section>

      {/* Artikel 4 */}
      <section>
        <h2>Artikel 4 — Verplichtingen van de Verwerker</h2>
        <p>Verwerker verwerkt persoonsgegevens uitsluitend op basis van gedocumenteerde instructies van de Verwerkingsverantwoordelijke, zoals vastgelegd in deze overeenkomst en de dienstverleningsovereenkomst.</p>
        <p>
          Indien een instructie van de Verwerkingsverantwoordelijke naar het oordeel van Verwerker in strijd
          is met de AVG of andere toepasselijke privacywetgeving, stelt Verwerker de
          Verwerkingsverantwoordelijke hiervan onverwijld schriftelijk op de hoogte vóórdat uitvoering wordt
          gegeven aan de betreffende instructie.
        </p>
      </section>

      {/* Artikel 5 */}
      <section>
        <h2>Artikel 5 — Geheimhouding</h2>
        <p>
          Verwerker zorgt ervoor dat alle personen die persoonsgegevens verwerken in het kader van de Dienst,
          gebonden zijn aan een passende geheimhoudingsverplichting, hetzij op grond van een wettelijke
          verplichting, hetzij op contractuele basis. Deze verplichting blijft van kracht na beëindiging van
          de arbeidsrelatie of contractuele samenwerking.
        </p>
      </section>

      {/* Artikel 6 */}
      <section>
        <h2>Artikel 6 — Beveiliging</h2>
        <p>
          Verwerker treft passende technische en organisatorische maatregelen om persoonsgegevens te
          beveiligen tegen verlies, onrechtmatige verwerking of ongeautoriseerde toegang. Deze maatregelen
          omvatten ten minste:
        </p>
        <ul>
          <li>Versleuteling van gegevens in opslag en tijdens transport (TLS/HTTPS);</li>
          <li>
            Strikte toegangsbeperking op databaseniveau: gegevens zijn per tenant (organisatie) volledig
            afgeschermd via Row Level Security (RLS);
          </li>
          <li>Beveiligde verbindingen voor alle communicatie met het platform;</li>
          <li>Beperkte toegang voor medewerkers van Verwerker, op basis van het need-to-know-principe.</li>
        </ul>
      </section>

      {/* Artikel 7 */}
      <section>
        <h2>Artikel 7 — Subverwerkers</h2>
        <p>
          De Verwerkingsverantwoordelijke verleent Verwerker toestemming om de volgende subverwerkers in te
          schakelen:
        </p>
        <ul>
          <li>
            <strong>Supabase Inc.</strong> — database, authenticatie en opslag;
          </li>
          <li>
            <strong>Vercel Inc.</strong> — hosting van de webapplicatie;
          </li>
          <li>
            <strong>Resend Inc.</strong> — verzending van e-mailuitnodigingen en herinneringen.
          </li>
        </ul>
        <p>
          Deze subverwerkers zijn gevestigd in de EER of verwerken gegevens op basis van passende waarborgen
          (waaronder Standaardcontractbepalingen, SCC&apos;s). De Verwerkingsverantwoordelijke aanvaardt het
          gebruik van bovengenoemde subverwerkers door het ondertekenen van deze overeenkomst.
        </p>
        <p>
          Bij inschakeling van nieuwe subverwerkers stelt Verwerker de Verwerkingsverantwoordelijke ten
          minste <strong>14 kalenderdagen</strong> van tevoren schriftelijk op de hoogte. De
          Verwerkingsverantwoordelijke heeft het recht om binnen die termijn bezwaar te maken.
        </p>
      </section>

      {/* Artikel 8 */}
      <section>
        <h2>Artikel 8 — Rechten van betrokkenen</h2>
        <p>
          Verwerker verleent medewerking aan de Verwerkingsverantwoordelijke bij het honoreren van verzoeken
          van betrokkenen op grond van de AVG, waaronder het recht op inzage, rectificatie, gegevenswissing,
          beperking van de verwerking, dataportabiliteit en bezwaar. Verzoeken van betrokkenen die
          rechtstreeks bij Verwerker binnenkomen, worden doorgestuurd naar de Verwerkingsverantwoordelijke.
        </p>
      </section>

      {/* Artikel 9 */}
      <section>
        <h2>Artikel 9 — Datalekken en beveiligingsincidenten</h2>
        <p>
          Verwerker meldt een geconstateerde inbreuk in verband met persoonsgegevens zo spoedig mogelijk bij
          de Verwerkingsverantwoordelijke, doch uiterlijk <strong>binnen 36 uur</strong> na ontdekking. De
          melding bevat ten minste: de aard van de inbreuk, de categorieën en het (geschatte) aantal
          betrokkenen en persoonsgegevensrecords, de te verwachten gevolgen en de maatregelen die zijn of
          worden getroffen om de inbreuk aan te pakken.
        </p>
        <p>
          De Verwerkingsverantwoordelijke is verantwoordelijk voor eventuele melding aan de Autoriteit
          Persoonsgegevens en betrokkenen.
        </p>
      </section>

      {/* Artikel 10 */}
      <section>
        <h2>Artikel 10 — Gegevensbeschermingseffectbeoordeling (DPIA)</h2>
        <p>
          Indien de Verwerkingsverantwoordelijke op basis van artikel 35 AVG verplicht is een
          gegevensbeschermingseffectbeoordeling (DPIA) uit te voeren, verleent Verwerker alle redelijkerwijs
          benodigde medewerking, waaronder het verstrekken van informatie over de gebruikte technische en
          organisatorische maatregelen.
        </p>
      </section>

      {/* Artikel 11 */}
      <section>
        <h2>Artikel 11 — Doorgifte buiten de EER</h2>
        <p>
          Supabase en Vercel kunnen gegevens (mede) verwerken buiten de Europese Economische Ruimte (EER).
          Verwerker zorgt ervoor dat passende waarborgen van toepassing zijn, zoals Standaardcontractbepalingen
          (SCC&apos;s) of een adequaatheidsbesluit van de Europese Commissie. Op schriftelijk verzoek van de
          Verwerkingsverantwoordelijke verstrekt Verwerker nadere informatie over de toepasselijke
          safeguards.
        </p>
      </section>

      {/* Artikel 12 */}
      <section>
        <h2>Artikel 12 — Teruglevering en verwijdering van gegevens</h2>
        <p>
          Na afloop of beëindiging van de dienstverleningsovereenkomst kiest de
          Verwerkingsverantwoordelijke binnen redelijke termijn of de persoonsgegevens worden teruggegeven
          of verwijderd.
        </p>
        <p>
          Campagnegegevens blijven gedurende maximaal <strong>6 maanden</strong> na afloop van het traject
          beschikbaar voor export via het dashboard. Na het verstrijken van deze termijn verwijdert Verwerker
          de betreffende gegevens, tenzij een wettelijke bewaarverplichting van toepassing is.
        </p>
      </section>

      {/* Artikel 13 */}
      <section>
        <h2>Artikel 13 — Audit en verantwoording</h2>
        <p>
          Verwerker stelt op verzoek van de Verwerkingsverantwoordelijke alle informatie beschikbaar die
          nodig is om de naleving van deze overeenkomst en de verplichtingen uit hoofde van artikel 28 AVG
          aan te tonen.
        </p>
        <p>
          De Verwerkingsverantwoordelijke heeft het recht om, op eigen kosten en met een redelijke
          opzegtermijn van ten minste <strong>4 weken</strong>, een onafhankelijke audit te laten uitvoeren
          naar de naleving van deze overeenkomst door Verwerker. Verwerker verleent hiertoe medewerking,
          voor zover dit redelijkerwijs van hem gevraagd kan worden en de bedrijfsvoering niet onevenredig
          wordt belast.
        </p>
      </section>

      {/* Artikel 14 */}
      <section>
        <h2>Artikel 14 — Aansprakelijkheid</h2>
        <p>
          De aansprakelijkheid van Verwerker voor schade die voortvloeit uit of verband houdt met de
          verwerking van persoonsgegevens is beperkt conform de aansprakelijkheidsbepaling in de algemene
          voorwaarden van Verwerker. Verwerker is niet aansprakelijk voor schade die het gevolg is van
          niet-naleving door de Verwerkingsverantwoordelijke van de AVG of deze overeenkomst.
        </p>
      </section>

      {/* Artikel 15 */}
      <section>
        <h2>Artikel 15 — Wijzigingen</h2>
        <p>
          Wijzigingen van deze overeenkomst zijn alleen geldig indien zij schriftelijk zijn overeengekomen
          en door beide Partijen zijn ondertekend.
        </p>
      </section>

      {/* Artikel 16 */}
      <section>
        <h2>Artikel 16 — Toepasselijk recht en geschillenbeslechting</h2>
        <p>
          Op deze overeenkomst is uitsluitend Nederlands recht van toepassing. Geschillen worden voorgelegd
          aan de bevoegde rechter in Nederland.
        </p>
      </section>

      {/* Artikel 17 — Ondertekening */}
      <section>
        <h2>Artikel 17 — Ondertekening</h2>
        <p>
          Aldus overeengekomen en in tweevoud opgemaakt en ondertekend:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Blok Verwerkingsverantwoordelijke */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm space-y-3">
            <p className="font-semibold text-gray-800">Verwerkingsverantwoordelijke</p>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="text-gray-500">Naam organisatie:</span>
                <br />
                <span className="font-mono text-xs">[KLANTORGANISATIE]</span>
              </p>
              <p>
                <span className="text-gray-500">Naam ondertekenaar:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-4">&nbsp;</span>
              </p>
              <p>
                <span className="text-gray-500">Functie:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-4">&nbsp;</span>
              </p>
              <p>
                <span className="text-gray-500">Datum:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-4">&nbsp;</span>
              </p>
              <p>
                <span className="text-gray-500">Handtekening:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-8">&nbsp;</span>
              </p>
            </div>
          </div>

          {/* Blok Verwerker */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm space-y-3">
            <p className="font-semibold text-gray-800">Verwerker</p>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="text-gray-500">Naam organisatie:</span>
                <br />
                <strong>Verisight</strong>
              </p>
              <p>
                <span className="text-gray-500">Naam ondertekenaar:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-4">&nbsp;</span>
              </p>
              <p>
                <span className="text-gray-500">Functie:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-4">&nbsp;</span>
              </p>
              <p>
                <span className="text-gray-500">Datum:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-4">&nbsp;</span>
              </p>
              <p>
                <span className="text-gray-500">Handtekening:</span>
                <br />
                <span className="inline-block w-full border-b border-gray-300 mt-8">&nbsp;</span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500 italic">
          Dit template is op verzoek beschikbaar als Word-document. Neem contact op via{' '}
          <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>.
        </p>
      </section>
    </LegalPageShell>
  )
}
