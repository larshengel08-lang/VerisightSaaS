import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Lees de algemene voorwaarden van Verisight voor het gebruik van ExitScan en RetentieScan.',
}

export default function VoorwaardenPage() {
  return (
    <LegalPageShell
      title="Algemene voorwaarden"
      description="Op deze pagina lees je de basisvoorwaarden voor het gebruik van Verisight, ExitScan en RetentieScan. Voor een publieksvriendelijke trustsamenvatting kun je ook de Trust & privacy-pagina bekijken."
      lastUpdated="9 april 2026"
    >
      <section>
        <h2>0. Trust & privacy in gewone taal</h2>
        <p>
          Deze voorwaarden vormen de formele contractlaag. Wil je eerst een publieke samenvatting zien van methodiek,
          privacy, rapportlezing en juridische ondersteuning, bekijk dan ook{' '}
          <Link href="/vertrouwen">Trust & privacy</Link>.
        </p>
      </section>

      <section>
        <h2>1. Definities</h2>
        <ul>
          <li>
            <strong>Verisight:</strong> de dienst en software voor ExitScan, RetentieScan, rapportage en bijbehorende begeleiding.
          </li>
          <li>
            <strong>Klant:</strong> de organisatie die een of meer Verisight-producten afneemt.
          </li>
          <li>
            <strong>Gebruiker:</strong> een bevoegde medewerker van de klantorganisatie met toegang tot het platform.
          </li>
          <li>
            <strong>Respondent:</strong> een (voormalig of actief) medewerker die een Verisight-vragenlijst invult.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Waarop zijn deze voorwaarden van toepassing?</h2>
        <p>
          Deze voorwaarden gelden voor iedere overeenkomst tussen Verisight en de klantorganisatie, tenzij schriftelijk
          iets anders is afgesproken. Door de dienst te gebruiken accepteert de klant deze voorwaarden.
        </p>
      </section>

      <section>
        <h2>3. Wat levert Verisight?</h2>
        <p>
          Verisight levert begeleide productvormen met software, uitnodigingen, analyse en rapportage. Dat kan
          onder meer bestaan uit ExitScan, RetentieScan of een combinatie daarvan, met:
        </p>
        <ul>
          <li>inrichting van de campagne;</li>
          <li>versturen van uitnodigingen en herinneringen;</li>
          <li>verzamelen en analyseren van antwoorden;</li>
          <li>dashboardtoegang en rapportage;</li>
          <li>persoonlijke toelichting op de uitkomsten.</li>
        </ul>
        <p>
          De standaarddienst is organisatiegebonden en begeleid van opzet. Verisight biedt op dit moment geen
          publieke self-service checkout, seat- of usageabonnementen, tenzij schriftelijk anders overeengekomen.
        </p>
      </section>

      <section>
        <h2>4. Wat verwachten wij van de klant?</h2>
        <ul>
          <li>Dat aangeleverde gegevens juist, volledig en rechtmatig zijn.</li>
          <li>Dat alleen bevoegde medewerkers toegang krijgen tot het platform.</li>
          <li>Dat respondenten passend worden geinformeerd over de verwerking van hun gegevens.</li>
          <li>Dat de dienst wordt gebruikt in overeenstemming met wet- en regelgeving.</li>
        </ul>
      </section>

      <section>
        <h2>5. Persoonsgegevens en rollen</h2>
        <p>
          Voor de verwerking van persoonsgegevens van respondenten treedt Verisight in beginsel op als verwerker en de
          klantorganisatie als verwerkingsverantwoordelijke. Meer hierover lees je in het{' '}
          <Link href="/privacy">privacybeleid</Link>. Op verzoek kan een verwerkersovereenkomst beschikbaar worden
          gesteld.
        </p>
      </section>

      <section>
        <h2>6. Intellectueel eigendom</h2>
        <p>
          De software, rapportformats, vragenlijsten en methodische opzet van Verisight blijven eigendom van Verisight.
          De klant krijgt een gebruiksrecht voor de duur van de overeenkomst. Klantdata en uitkomsten die specifiek
          voor de klant zijn verzameld, blijven van de klant.
        </p>
        <p>
          RetentieScan mag niet worden gebruikt als individueel beoordelings-, performance- of beslisinstrument op persoonsniveau.
        </p>
      </section>

      <section>
        <h2>7. Vertrouwelijkheid</h2>
        <p>
          Verisight en de klant behandelen vertrouwelijke informatie zorgvuldig en delen die alleen als dat nodig is
          voor uitvoering van de overeenkomst of als de wet dat vereist.
        </p>
      </section>

      <section>
        <h2>8. Beschikbaarheid en ondersteuning</h2>
        <p>
          Verisight streeft naar betrouwbare dienstverlening en communiceert gepland onderhoud waar mogelijk vooraf.
          Omdat het om software en externe infrastructuur gaat, kan volledige ononderbroken beschikbaarheid niet worden
          gegarandeerd.
        </p>
      </section>

      <section>
        <h2>9. Aansprakelijkheid</h2>
        <p>
          De aansprakelijkheid van Verisight is beperkt tot directe schade en maximaal het bedrag dat de klant in de
          drie maanden voorafgaand aan de schadeveroorzakende gebeurtenis voor de dienst heeft betaald, tenzij de wet
          dwingend anders bepaalt.
        </p>
        <p>
          Verisight is niet aansprakelijk voor indirecte schade, gevolgschade, gemiste omzet of schade die ontstaat
          door onjuiste of onvolledige gegevens die door de klant zijn aangeleverd.
        </p>
      </section>

      <section>
        <h2>10. Betaling en facturering</h2>
        <p>
          Verisight stuurt bij aanvang van het traject een factuur voor het overeengekomen bedrag. De betalingstermijn
          bedraagt 14 dagen na factuurdatum, tenzij schriftelijk anders afgesproken. Bij overschrijding van de
          betalingstermijn is Verisight gerechtigd de dienst tijdelijk op te schorten totdat betaling is ontvangen.
        </p>
        <p>
          Verisight werkt in de huidige productvorm met offerte, trajectafspraak en handmatige facturatie. Er geldt
          geen standaard self-serve checkout, seatbilling of automatisch recurring abonnement, tenzij partijen dat
          later schriftelijk expliciet overeenkomen.
        </p>
        <p>
          Prijzen zijn exclusief btw, tenzij anders vermeld. Verisight behoudt zich het recht voor om bij uitgebreide
          aanpassingen of meerwerk buiten de overeengekomen scope een aanvullende offerte voor te leggen.
        </p>
      </section>

      <section>
        <h2>11. Klachten</h2>
        <p>
          Klachten over de geleverde dienst kunnen worden gemeld via{' '}
          <a href="mailto:hallo@verisight.nl">hallo@verisight.nl</a>. Verisight streeft ernaar klachten binnen
          10 werkdagen te beoordelen en te beantwoorden. Klachten schorten de betalingsverplichting niet op.
        </p>
      </section>

      <section>
        <h2>12. Looptijd en einde van de overeenkomst</h2>
        <p>
          De overeenkomst loopt voor de afgesproken periode of campagne. Na beindiging kan klantdata gedurende een
          beperkte periode — maximaal 6 maanden — beschikbaar blijven voor export, waarna gegevens volgens het
          bewaarbeleid worden verwijderd of geanonimiseerd.
        </p>
        <p>
          Verisight is gerechtigd de overeenkomst met onmiddellijke ingang te beëindigen als de klant de
          voorwaarden wezenlijk schendt en dit na schriftelijke ingebrekestelling niet binnen 10 werkdagen herstelt.
        </p>
      </section>

      <section>
        <h2>13. Wijzigingen</h2>
        <p>
          Verisight kan deze voorwaarden aanpassen. Als een wijziging materieel is, informeren wij actieve klanten
          vooraf. De meest recente versie blijft publiek beschikbaar op deze pagina.
        </p>
      </section>

      <section>
        <h2>14. Toepasselijk recht</h2>
        <p>
          Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter
          in Nederland, tenzij partijen eerst een andere vorm van geschiloplossing afspreken.
        </p>
      </section>

      <section>
        <h2>15. Contact</h2>
        <p>
          Voor vragen over deze voorwaarden kun je mailen naar{' '}
          <a href="mailto:hallo@verisight.nl">hallo@verisight.nl</a>. Bekijk ook{' '}
          <Link href="/vertrouwen">Trust & privacy</Link>, het{' '}
          <Link href="/privacy">privacybeleid</Link> en de{' '}
          <Link href="/dpa">verwerkersovereenkomst</Link>.
        </p>
      </section>
    </LegalPageShell>
  )
}
