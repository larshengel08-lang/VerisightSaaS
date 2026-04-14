import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Verwerkersovereenkomst',
  description:
    'Standaard verwerkersovereenkomst (DPA) van Verisight voor klantorganisaties - AVG-conform en afgestemd op ExitScan en RetentieScan.',
}

export default function DpaPage() {
  return (
    <LegalPageShell
      title="Verwerkersovereenkomst"
      description="Onderstaande verwerkersovereenkomst is het standaardtemplate dat Verisight hanteert voor klantorganisaties. Het document is op verzoek beschikbaar als gepersonaliseerde, ondertekende versie. Neem hiervoor contact op via privacy@verisight.nl. Voor de buyer-facing samenvatting van trust en privacy kun je ook de trust & privacy-pagina bekijken."
      lastUpdated="13 april 2026"
    >
      <section>
        <h2>Publieke trustlaag</h2>
        <p>
          Deze DPA is de formele verwerkerslaag. Voor een compact publiek overzicht van methodiek, privacy,
          rapportlezing en juridische support kun je ook naar{' '}
          <Link href="/vertrouwen">Trust & privacy</Link>.
        </p>
      </section>

      <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-6 py-4 text-sm text-blue-900">
        <strong>Let op:</strong> Dit is een standaardtemplate. Velden aangeduid met{' '}
        <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">[...]</code> worden ingevuld op basis van
        uw organisatiegegevens. Neem contact op via{' '}
        <a href="mailto:privacy@verisight.nl" className="underline">
          privacy@verisight.nl
        </a>{' '}
        voor een gepersonaliseerd en ondertekend exemplaar.
      </div>

      <section>
        <h2>Partijen</h2>
        <p>Deze verwerkersovereenkomst wordt gesloten tussen:</p>
        <p>
          <strong>Verwerkingsverantwoordelijke:</strong>{' '}
          <span className="font-mono text-sm">[KLANTORGANISATIE]</span>, gevestigd te{' '}
          <span className="font-mono text-sm">[KLANTADRES]</span>, hierna te noemen
          &quot;Verwerkingsverantwoordelijke&quot;;
        </p>
        <p>en</p>
        <p>
          <strong>Verwerker:</strong> Verisight, Nederlandse dienst voor begeleide HR-signalerings- en
          rapportageproducten. Volledige bedrijfsgegevens worden opgenomen in de gepersonaliseerde en ondertekende
          versie van deze overeenkomst. Verisight is bereikbaar via{' '}
          <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>, hierna te noemen
          &quot;Verwerker&quot;.
        </p>
        <p>
          De dienst is ingericht voor gegroepeerde managementinzichten met expliciete privacy- en
          interpretatiegrenzen. Verwerker levert geen persoonsgerichte voorspel- of beoordelingsoutput.
        </p>
      </section>

      <section>
        <h2>1. Dienst en reikwijdte</h2>
        <p>
          Deze overeenkomst heeft betrekking op de verwerking van persoonsgegevens in het kader van de ExitScan-
          en/of RetentieScan-dienstverlening van Verwerker. De overeenkomst loopt gelijk met de looptijd van de
          onderliggende dienstverleningsovereenkomst, tenzij Partijen schriftelijk anders overeenkomen.
        </p>
      </section>

      <section>
        <h2>2. Categorieen persoonsgegevens</h2>
        <ul>
          <li>
            <strong>Accountgegevens HR-gebruikers:</strong> naam en zakelijk e-mailadres van HR-medewerkers en
            beheerders.
          </li>
          <li>
            <strong>Respondentgegevens:</strong> e-mailadres voor uitnodiging en herinnering, surveyantwoorden en
            beperkte contextgegevens zoals afdeling, functieniveau of diensttijd.
          </li>
          <li>
            <strong>Technische gegevens:</strong> logging- en beveiligingsinformatie die nodig is om het platform
            veilig en betrouwbaar te laten functioneren.
          </li>
        </ul>
        <p>De categorieen betrokkenen zijn:</p>
        <ul>
          <li>HR-medewerkers en beheerders van de Verwerkingsverantwoordelijke;</li>
          <li>Respondenten: voormalig of actief personeel van de Verwerkingsverantwoordelijke.</li>
        </ul>
      </section>

      <section>
        <h2>3. Doel van de verwerking</h2>
        <p>
          Verwerker verwerkt persoonsgegevens uitsluitend ten behoeve van de uitvoering van ExitScan en/of
          RetentieScan, inclusief uitnodigingen, herinneringen, dashboardtoegang, rapportage en noodzakelijke
          technische beveiliging.
        </p>
        <p>
          Wanneer RetentieScan wordt ingezet op actieve medewerkers, zijn de uitkomsten nadrukkelijk bedoeld voor
          groeps- en segmentinzichten. Individuele signalen, individuele vertrekintentie op persoonsniveau en
          persoonsgerichte actieroutes worden niet als managementoutput verstrekt.
        </p>
      </section>

      <section>
        <h2>4. Instructies en geheimhouding</h2>
        <p>
          Verwerker verwerkt persoonsgegevens uitsluitend op basis van gedocumenteerde instructies van de
          Verwerkingsverantwoordelijke, zoals vastgelegd in deze overeenkomst en de dienstverleningsovereenkomst.
        </p>
        <p>
          Verwerker zorgt ervoor dat alle personen die persoonsgegevens verwerken in het kader van de Dienst,
          gebonden zijn aan een passende geheimhoudingsverplichting.
        </p>
      </section>

      <section>
        <h2>5. Beveiliging</h2>
        <p>
          Verwerker treft passende technische en organisatorische maatregelen om persoonsgegevens te beveiligen
          tegen verlies, onrechtmatige verwerking of ongeautoriseerde toegang. Deze maatregelen omvatten ten minste:
        </p>
        <ul>
          <li>versleuteling van gegevens tijdens transport via TLS/HTTPS;</li>
          <li>database-afscherming per organisatie via toegangsbeperking en tenant-isolatie;</li>
          <li>beperkte toegang voor medewerkers van Verwerker op basis van need-to-know;</li>
          <li>minimum groepsgroottes, segmentonderdrukking en terughoudende rapportage om herleidbaarheid te beperken;</li>
          <li>anonimisering van open tekst waar dat nodig is voor veilige groepsduiding.</li>
        </ul>
      </section>

      <section>
        <h2>6. Subverwerkers</h2>
        <p>De Verwerkingsverantwoordelijke verleent Verwerker toestemming om gebruik te maken van subverwerkers.</p>
        <ul>
          <li>
            <strong>Supabase Inc.</strong> - database, authenticatie en opslag;
          </li>
          <li>
            <strong>Vercel Inc.</strong> - hosting van de webapplicatie;
          </li>
          <li>
            <strong>Resend Inc.</strong> - verzending van e-mailuitnodigingen en herinneringen.
          </li>
        </ul>
        <p>
          Bij inschakeling van nieuwe subverwerkers stelt Verwerker de Verwerkingsverantwoordelijke vooraf op de
          hoogte. Voor doorgifte buiten de EER worden passende contractuele waarborgen toegepast.
        </p>
      </section>

      <section>
        <h2>7. Rechten van betrokkenen</h2>
        <p>
          Verwerker verleent medewerking aan de Verwerkingsverantwoordelijke bij het honoreren van verzoeken van
          betrokkenen op grond van de AVG, waaronder inzage, correctie, verwijdering, beperking van verwerking,
          dataportabiliteit en bezwaar.
        </p>
      </section>

      <section>
        <h2>8. Datalekken</h2>
        <p>
          Verwerker meldt een geconstateerde inbreuk in verband met persoonsgegevens zo spoedig mogelijk bij de
          Verwerkingsverantwoordelijke, en verstrekt daarbij voor zover beschikbaar de aard van de inbreuk, de
          categorieen betrokkenen, de vermoedelijke gevolgen en de genomen of voorgestelde maatregelen.
        </p>
      </section>

      <section>
        <h2>9. Bewaartermijnen en einde dienstverlening</h2>
        <p>
          Na afloop van de dienstverlening verwijdert of anonimiseert Verwerker persoonsgegevens conform het
          overeengekomen bewaarbeleid, tenzij wettelijke verplichtingen een langere bewaring vereisen.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Voor vragen over deze verwerkersovereenkomst of voor een gepersonaliseerde en ondertekende versie kunt u
          contact opnemen via <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>. Bekijk daarnaast ook{' '}
          <Link href="/privacy">het privacybeleid</Link> en{' '}
          <Link href="/vertrouwen">Trust & privacy</Link>.
        </p>
      </section>
    </LegalPageShell>
  )
}
