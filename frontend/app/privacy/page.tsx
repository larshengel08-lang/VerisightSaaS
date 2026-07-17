import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe Loep omgaat met persoonsgegevens, hosting en rechten onder de AVG voor Loep Vertrek en Loep Behoud.',
}

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacybeleid"
      description="Op deze pagina lees je hoe Loep omgaat met persoonsgegevens van klantgebruikers en respondenten binnen Loep Vertrek en Loep Behoud. Voor een publieksvriendelijke samenvatting in gewone taal kun je ook de Trust & privacy-pagina bekijken."
      lastUpdated="9 april 2026"
    >
      <section>
        <h2>0. Publieke trustlaag</h2>
        <p>
          Deze pagina geeft de juridische en operationele basis. Wil je eerst een publieksvriendelijke samenvatting zien van
          methodiek, privacy, rapportlezing en DPA, bekijk dan ook{' '}
          <Link href="/vertrouwen">Trust & privacy</Link>.
        </p>
      </section>

      <section>
        <h2>1. Wie is Loep?</h2>
        <p>
          Loep is een in Nederland gevestigde dienst voor begeleide HR-signalering en rapportage.
          Loep helpt HR-teams om vertrekredenen beter te begrijpen via Loep Vertrek en om eerder te zien waar
          behoud onder druk staat via Loep Behoud.
        </p>
        <p>
          Privacy staat daarbij niet los als juridisch blok, maar hoort bij de manier waarop het product is ingericht.
          Loep Vertrek en Loep Behoud zijn daarom ingericht voor groepsinzichten, managementsamenvatting en duidelijke
          interpretatiegrenzen, niet voor individuele oordelen of black-box voorspellingen.
        </p>
        <p>
          Loep is ingeschreven bij de Kamer van Koophandel onder nummer 42108397 (btw-id NL005499444B07).
          Voor privacyvragen of due-diligence-verzoeken kun je mailen naar{' '}
          <a href="mailto:privacy@getloep.nl">privacy@getloep.nl</a>.
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
            <strong>Respondenten:</strong> e-mailadres voor uitnodiging, antwoorden op de vragenlijst en beperkte contextgegevens
            die de klant zelf aanlevert, zoals afdeling of functieniveau.
          </li>
          <li>
            <strong>Technische gegevens:</strong> sessiegegevens, serverlogs en beveiligingsinformatie die nodig zijn
            om het platform veilig te laten werken.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Waarom verwerken wij deze gegevens?</h2>
        <ul>
          <li>Om Loep Vertrek en Loep Behoud uit te voeren en rapportages beschikbaar te maken voor de klantorganisatie.</li>
          <li>Om uitnodigingen en herinneringen te versturen aan respondenten.</li>
          <li>Om de veiligheid, betrouwbaarheid en beschikbaarheid van het platform te bewaken.</li>
          <li>Om klantorganisaties te helpen hun uitstroom te duiden en behoud eerder op groepsniveau te signaleren via Loep Behoud.</li>
        </ul>
      </section>

      <section>
        <h2>4. Op welke grondslag gebeurt dit?</h2>
        <p>
          Loep verwerkt persoonsgegevens op basis van uitvoering van de overeenkomst met de klantorganisatie,
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
          Loep verkoopt geen persoonsgegevens en deelt die niet voor marketingdoeleinden. Voor het leveren van
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
          De primaire database draait in een EU-regio. Voor apphosting en e-mailverwerking maken wij daarnaast gebruik
          van subverwerkers waarvoor passende contractuele waarborgen gelden. Op verzoek lichten wij dat verder toe.
        </p>
      </section>

      <section>
        <h2>7. Hoe beveiligen wij gegevens?</h2>
        <p>
          Loep gebruikt versleutelde verbindingen, toegangsbeperking en database-afscherming per organisatie.
          Rapportages zijn bedoeld voor groepsinzichten. Waar nodig passen wij minimale groepsgroottes,
          segmentonderdrukking, anonimisering van open tekst en betrouwbaarheidsduiding toe om herleidbaarheid en
          schijnprecisie te beperken.
        </p>
        <p>
          Voor Loep Behoud geldt aanvullend dat de uitkomsten zijn bedoeld voor groeps- en segmentinzichten over
          actieve medewerkers. Individuele signalen, individuele vertrekintentie en persoonsgerichte actieroutes worden
          niet als managementoutput gepresenteerd.
        </p>
      </section>

      <section>
        <h2>8. Gebruikt Loep cookies?</h2>
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
          en bezwaar. Je kunt hiervoor contact opnemen via <a href="mailto:privacy@getloep.nl">privacy@getloep.nl</a>.
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
          Als klantorganisatie treedt Loep op als verwerker namens jouw organisatie. Op verzoek stellen wij
          een verwerkersovereenkomst beschikbaar. Het standaardtemplate is beschikbaar op de{' '}
          <Link href="/dpa">DPA-pagina</Link>. Voor een gepersonaliseerd en ondertekend exemplaar kun je contact
          opnemen via <a href="mailto:privacy@getloep.nl">privacy@getloep.nl</a>.
        </p>
      </section>

      <section>
        <h2>11. Vragen of aanvullende afspraken</h2>
        <p>
          Voor vragen over dit privacybeleid kun je contact opnemen via{' '}
          <a href="mailto:privacy@getloep.nl">privacy@getloep.nl</a>. Bekijk ook de{' '}
          <Link href="/vertrouwen">trust & privacy-pagina</Link>, het{' '}
          <Link href="/dpa">DPA-template</Link> en de{' '}
          <Link href="/voorwaarden">algemene voorwaarden</Link>.
        </p>
      </section>
    </LegalPageShell>
  )
}

