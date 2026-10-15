# Fas 6: Synpunkter, enkät och återkoppling

## Syfte

Efter den här fasen kan en besökare lämna en synpunkt till biblioteket från skärmen, och
den når en funktionsbrevlåda med e-post. Ingenting sparas i tjänsten efter att e-posten
gått. Efter ett samtal får besökaren två korta frågor, och svaren syns som siffror i
statistiken. Återkoppling till besökarna finns byggd men avstängd.

Vägval 2 (enkäten), 10 (egen knapp med samtyckesruta) och 11 (synpunkterna mejlas till
en funktionsbrevlåda och läses av projektledaren varje månad) blir verklighet. Beslut 6, 7 och
8 styr vad som syns.

## Förutsättningar

- Fas 5 är godkänd. Formulären för synpunkter, enkät och återkoppling finns i
  adminpanelen.
- Fas 6 kan göras före, efter eller samtidigt med fas 7, 8 och 9.
- Beslut 6: utan funktionsbrevlåda och SMTP är synpunktsknappen avstängd. Bygg allt
  ändå och testa mot en lokal testserver för e-post.

## Uppgifter

### 6.1 Synpunktsknappen

- En knapp "Lämna en synpunkt" som syns när funktionen är påslagen i adminpanelen och
  både `AIBI_SYNPUNKT_TILL` och SMTP är inställda. Annars syns den inte alls.
- Ett fönster med:
  - en kort förklaring i tre meningar, som personalen kan ändra. Den ska säga vad som
    samlas in, vem som läser det och att man inte ska skriva namn eller känsliga
    uppgifter (vägval 10). Startinnehåll, som Peter godkänner:
    "Din synpunkt skickas med e-post till biblioteket och läses en gång i månaden.
    Synpunkter till kommunen blir allmänna handlingar. Skriv inte ditt namn eller
    något annat som visar vem du är."
  - ett textfält, högst 1000 tecken, med räknare
  - kategorier om personalen lagt in några (till exempel "Beröm", "Förslag",
    "Något fungerade inte"), som valfria knappar
  - en ruta för samtycke, med texten från adminpanelen, som måste bockas i
  - knapparna "Skicka" och "Avbryt"
- Skärmtangentbordet fungerar i fönstret.
- Efter skickat: "Tack. Din synpunkt är skickad till biblioteket." Fönstret stängs och
  samtalet fortsätter.
- Allt i fönstret rensas när skärmen återställs (regel A8).

### 6.2 Maskering och e-post

- Personnummer, telefonnummer och e-postadresser maskeras i synpunkter innan de
  skickas, med maskeringen från fas 2. Det följer av att besökaren inte ska lämna
  uppgifter om sig själv. Om projektgruppen senare vill kunna svara besökare går
  telefon och e-post att släppa igenom med en inställning, men personnummer maskeras
  alltid.
- E-posten skickas från `AIBI_SMTP_FRAN` till `AIBI_SYNPUNKT_TILL`, aldrig till en
  personlig adress som personalen skrivit in i adminpanelen (adressen sätts i `.env`,
  regel A18).
- Ämnesrad: "Synpunkt från Aibi, <bibliotek>, <kategori>". Brödtext: synpunkten,
  station, tid (till minuten), språk. Inget annat. Ingen session, inget samtal.
- **Utkorg**: synpunkten sparas i en tabell bara tills e-posten gått. Försök igen med
  ökande väntetid. Efter sju dagar utan lyckat utskick raderas den och adminpanelen
  visar en varning (antal, inte text). Lyckat utskick raderar raden direkt.
- I utvecklingen: en lokal testserver för e-post. Det enklaste som fungerar utan ny
  tjänst är en SMTP-server i testerna (`aiosmtpd`) eller att skriva e-posten till en
  fil i `AIBI_DATA_DIR/utkorg-test/` när `AIBI_SMTP_VARD=fil`. Skicka aldrig ut e-post
  under utveckling.
- Hastighetsbegränsning: högst fem synpunkter per station och tio minuter.

### 6.3 Enkäten

- Visas efter ett samtal där besökaren fått minst ett svar som inte var ett nej, när
  besökaren trycker "Ny fråga" eller "Klar", eller när skärmen är på väg att gå i vila
  (till exempel efter 60 sekunder utan aktivitet, innan återställningen).
- Två frågor från adminpanelen (beslut 8). Startinnehåll:
  - "Fick du hjälp?" med Ja, Delvis, Nej
  - "Kändes det tryggt att kunna fråga här?" med Ja, Vet inte, Nej
- Stora knappar, en fråga i taget eller båda på samma skärm (pröva båda och visa Peter).
  En tydlig knapp "Hoppa över". Försvinner av sig själv efter 20 sekunder.
- `POST /api/enkat` med station och svaren. Ingen session, ingen tid finare än timmen,
  inget fritextfält.
- Visas inte oftare än en gång per samtal, och inte efter ett krissvar.

### 6.4 Tumme upp och ner

Finns redan (`/api/feedback`). Kontrollera att det bara sparas enligt fas 2, och att det
syns i statistiken. Låt det vara som det är om det fungerar.

### 6.5 Återkoppling

Gamla vägval 12 ströks ur den slutliga listan (beslut 7). Bygg funktionen men lämna den
avstängd:

- i adminpanelen: en ruta "Visa återkoppling på skärmen" och ett textfält där
  personalen skriver vad de ändrat efter besökarnas synpunkter, till exempel "Ni
  frågade efter längre öppettider på lördagar. Från mars har vi öppet till 15."
- `GET /api/aterkoppling` returnerar texten bara om funktionen är på
- på skärmen: en diskret rad på startskärmen, under snabbfrågorna, när funktionen är på

### 6.6 Statistik

Synpunkter (antal, kategori), enkätsvar och tummar syns i statistikfliken från fas 5,
per station och period. Inget innehåll från synpunkterna.

## Tester

- Backend: synpunkt med samtycke skickas till testservern, med rätt ämnesrad och
  maskering. Utan samtycke: 400. För lång text: kortas av eller 400, välj och testa.
  Utkorgen raderar efter lyckat utskick och efter sju dagar (fryst tid). Fel från SMTP
  ger nya försök.
- Spårtestet från fas 2 med en synpunkt: efter utskick finns texten ingenstans.
- Playwright: knappen syns bara när funktionen är på och inställd. Hela flödet med
  skärmtangentbordet. Enkäten visas efter ett besvarat samtal, inte efter bara ett nej,
  inte efter krissvar, och försvinner efter 20 sekunder. Återställning rensar fönstret.
- axe-core på fönstren.

## Klart när

- [ ] En synpunkt når testbrevlådan och lämnar inget spår i tjänsten.
- [ ] Enkätsvaren syns i statistiken.
- [ ] Återkopplingen fungerar när den slås på, och är av som standard.
- [ ] Synpunktsknappen är av tills beslut 6 är fattat.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet, med skärmdumpar av
      fönstren.

## Grind

Stanna. Peter skickar en synpunkt från skärmen, ser den i testbrevlådan, svarar på
enkäten och ser svaret i statistiken. Han tar med sig frågan om funktionsbrevlåda och
SMTP-relä till Unikom (beslut 6).

## Fällor

- En e-post som misslyckas tyst gör att synpunkter försvinner. Utkorgen och varningen i
  adminpanelen är skälet.
- Enkäten får inte komma i vägen för nästa besökare. Den ska aldrig ligga kvar när
  skärmen återställs.
- Ämnesraden får inte innehålla synpunktens text. Den syns i brevlådans översikt och
  i loggar hos e-postservern.
- Svenska tecken i e-post: använd `email.message.EmailMessage` med UTF-8, inte
  hemsnickrade sidhuvuden.
