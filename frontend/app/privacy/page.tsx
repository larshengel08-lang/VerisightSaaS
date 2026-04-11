import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe Verisight omgaat met persoonsgegevens, hosting en rechten onder de AVG.',
}

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacybeleid"
      description="Op deze pagina lees je hoe Verisight omgaat met persoonsgegevens van klantgebruikers en respondenten binnen ExitScan."
      lastUpdated="9 april 2026"
    >
      <section>
        <h2>1. Wie is Verisight?</h2>
        <p>
          Verisight is een in Nederland gevestigde dienst voor begeleide uitstroomanalyse. Verisight helpt
          HR-teams om vertrekredenen beter te begrijpen via een begeleid ExitScan-traject met dashboard en
          rapportage.
        </p>
        <p>
          Publieke bedrijfsgegevens, waaronder KvK-nummer en vestigingsadres, worden op deze pagina aangevuld zodra
          de formele inschrijving is afgerond. Tot die tijd kun je voor privacyvragen of due-diligence-verzoeken mailen naar{' '}
          <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>.
        </p>
      </section>

      <section>
        <h2>2. Welke gegevens verwerken wij?</h2>
        <p>Afhankelijk van de rol verwerken wij verschillende soorten gegevens.</p>
        <ul>
          <li>
            <strong>HR-gebruikers en beheerders:</strong> naam, zakelijk e-mailadres en inloggegevens.
          </li>
          <li>
            <strong>Respondenten:</strong> e-mailadres voor uitnodiging, surveyantwoorden en beperkte contextgegevens
            die de klant zelf aanlevert, zoals afdeling of functieniveau.
          </li>
          <li>
            <strong>Technische gegevens:</strong> sessiegegevens, serverlogs en beveiligingsinformatie die nodig is
            om het platform veilig te laten werken.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Waarom verwerken wij deze gegevens?</h2>
        <ul>
          <li>Om ExitScan uit te voeren en rapportages beschikbaar te maken voor de klantorganisatie.</li>
          <li>Om uitnodigingen en herinneringen te versturen aan respondenten.</li>
          <li>Om de veiligheid, betrouwbaarheid en beschikbaarheid van het platform te bewaken.</li>
          <li>Om klantorganisaties te helpen hun uitstroom in groepsverband te analyseren.</li>
        </ul>
      </section>

      <section>
        <h2>4. Op welke grondslag gebeurt dit?</h2>
        <p>
          Verisight verwerkt persoonsgegevens op basis van uitvoering van de overeenkomst met de klantorganisatie,
          gerechtvaardigd belang voor beveiliging en platformbeheer, en waar nodig toestemming of vrijwillige
          deelname van respondenten. De klantorganisatie blijft verantwoordelijk voor het informeren van respondenten
          over de verwerking binnen haar eigen context.
        </p>
      </section>

      <section>
        <h2>5. Hoe lang bewaren wij gegevens?</h2>
        <p>
          Campagnedata wordt bewaard zolang dat nodig is voor het overeengekomen traject en maximaal 2 jaar na
          afronding van de campagne, tenzij een andere bewaartermijn schriftelijk is afgesproken. Respondentgegevens
          die alleen nodig zijn voor uitnodiging en herinneringen worden niet langer bewaard dan functioneel nodig.
        </p>
      </section>

      <section>
        <h2>6. Delen wij gegevens met derden?</h2>
        <p>
          Verisight verkoopt geen persoonsgegevens en deelt deze niet voor marketingdoeleinden. Voor het leveren van
          de dienst maken wij gebruik van verwerkers.
        </p>
        <ul>
          <li>
            <strong>Supabase:</strong> database en authenticatie.
          </li>
          <li>
            <strong>Vercel:</strong> hosting van de webapplicatie.
          </li>
          <li>
            <strong>Resend:</strong> verzending van uitnodigingen en herinneringen.
          </li>
        </ul>
        <p>
          Als doorgifte buiten de EER plaatsvindt, wordt passende contractuele bescherming toegepast. Op verzoek
          lichten wij dat verder toe.
        </p>
      </section>

      <section>
        <h2>7. Hoe beveiligen wij gegevens?</h2>
        <p>
          Verisight gebruikt versleutelde verbindingen, toegangsbeperking en database-afscherming per organisatie.
          Rapportages zijn bedoeld voor groepsinzichten. Waar nodig worden minimale groepsgroottes of
          betrouwbaarheidsduiding toegepast om herleidbaarheid te beperken.
        </p>
      </section>

      <section>
        <h2>8. Gebruikt Verisight cookies?</h2>
        <p>
          Op de marketing-site gebruiken wij geen trackingcookies. Binnen het platform gebruiken wij alleen
          functionele sessiecookies die nodig zijn om gebruikers ingelogd te houden en het systeem veilig te laten
          werken.
        </p>
      </section>

      <section>
        <h2>9. Welke rechten heb je?</h2>
        <p>
          Onder de AVG heb je recht op inzage, correctie, verwijdering, beperking van verwerking, dataportabiliteit
          en bezwaar. Je kunt hiervoor contact opnemen via <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>.
          Wij reageren in principe binnen 30 dagen.
        </p>
        <p>
          Je kunt daarnaast een klacht indienen bij de{' '}
          <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">
            Autoriteit Persoonsgegevens
          </a>.
        </p>
      </section>

      <section>
        <h2>10. Verwerkersovereenkomst (DPA)</h2>
        <p>
          Als klantorganisatie treedt Verisight op als verwerker namens jouw organisatie. Op verzoek stellen wij
          een verwerkersovereenkomst beschikbaar. Het standaardtemplate is beschikbaar op de{' '}
          <Link href="/dpa">DPA-pagina</Link>. Voor een gepersonaliseerd en ondertekend exemplaar kun je contact
          opnemen via <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>.
        </p>
      </section>

      <section>
        <h2>11. Vragen of aanvullende afspraken</h2>
        <p>
          Voor vragen over dit privacybeleid kun je contact opnemen via{' '}
          <a href="mailto:privacy@verisight.nl">privacy@verisight.nl</a>. Bekijk ook de{' '}
          <Link href="/voorwaarden">algemene voorwaarden</Link>.
        </p>
      </section>
    </LegalPageShell>
  )
}
