# Fas 10: Kiosk och pilot

## Syfte

Efter den här fasen har Aibi gått ett dygn på en riktig skärm utan fel, klarat fem
stationer samtidigt, och kommit tillbaka av sig själv efter att servern startats om och
nätet försvunnit. Unikom har en instruktion för att ställa in stationerna. Det finns en
checklista för dagen då den första besökaren får prova.

Fasen har två delar. Den tekniska delen (10.1–10.8) kan göras på Bosgame och en skärm hos
Peter. Piloten med besökare (10.9) kräver beslut 2 (avataren) och 13 (hur skärmen når
servern), och görs bara när de finns.

## Förutsättningar

- Fas 0–5 är godkända. Fas 6–9 är godkända eller medvetet uppskjutna av Peter.
- Det finns en skärm att testa på, gärna en av de upphandlade. Fråga Peter vilken och
  var.
- Beslut 11 (sensorn) har ett standardval som räcker för den tekniska delen.

## Uppgifter

### 10.1 Närvarosensorn

- Gränssnittet lyssnar efter en inställbar tangent (standard F13) som betyder "någon är
  nära". De flesta USB-sensorer kan ställas in att skicka en tangent. Tangenten ställs in
  i adminpanelen per station.
- Vid närvaro: skärmen vaknar från vilosidan eller skärmsläckaren, och om hälsning vid
  närvaro är på (fas 7), hälsas besökaren enligt gränserna.
- Ingen närvaro i en inställbar tid: skärmen går i vila, och samtalet återställs enligt
  den vanliga regeln.
- **Ingenting registreras.** Inte antal, inte tider, inte i statistiken (regel A12). Ett
  test kontrollerar att sensorhändelser inte ger några anrop till servern.
- Tangenten får inte skriva något i textfältet eller utlösa något annat. Testa att F13
  inte gör något i Edge när fältet har fokus.

Fungerar sensorn som köps på ett annat sätt (till exempel seriell port eller ett eget
program): bygg inte stöd för det utan Peters ok. Skriv i STATUS vad som behövs.

### 10.2 Skärmsläckare och vila

- En lugn vilosida när ingen använt skärmen på en stund: namnet, en mening om vad Aibi
  kan hjälpa till med och "Tryck på skärmen eller skriv en fråga". Inget som rör sig
  snabbt. Den ska inte se ut som reklam.
- Nattläge: utanför bibliotekets öppettider (inklusive meröppet) kan skärmen dimmas
  eller visa en svart sida med en liten rad, om personalen slagit på det i adminpanelen.
  Själva skärmen stängs av av Windows eller skärmens schema, inte av Aibi.

### 10.3 Vaktfunktionen på riktigt

Fas 4 byggde vaktfunktionen. Prova den på riktig hårdvara:

- servern startas om medan skärmen visar ett svar
- nätverkskabeln dras ur i fem minuter
- servern svarar med fel (500) i två minuter
- en JavaScript-fel framkallas från personalskärmens konsol

I alla fallen ska skärmen visa vilosidan för fel och komma tillbaka av sig själv inom en
minut efter att felet är borta, utan att någon rör den.

Hälsoanrop var 30:e sekund i kioskläge (i dag 60 sekunder i `ui/app.js`).

### 10.4 HTTPS för stationerna

Mikrofonen kräver HTTPS (fas 7.9). Utan HTTPS fungerar allt utom rösten.

- Enklast utan ny tjänst: uvicorn med certifikat (`--ssl-keyfile`, `--ssl-certfile`),
  sökvägarna i `AIBI_TLS_NYCKEL` och `AIBI_TLS_CERT`.
- Certifikatet ska komma från Unikom (kommunens interna certifikatutfärdare) när
  tjänsten flyttar in i kommunens nät. För Bosgame-piloten: ett eget certifikat som
  stationen litar på, installerat av den som har behörighet på stationen. Skriv båda
  vägarna i `deploy/kiosk/KIOSK.md`.
- Lägg inte till en omvänd proxy (nginx, Caddy) om uvicorn räcker. Om den behövs, fråga
  först (regel G).

### 10.5 Instruktion för Unikom

Skriv `deploy/kiosk/KIOSK.md` för den som ställer in stationerna. Den ska gå att följa
utan att ha läst något annat i repot:

- vad stationen ska göra: visa en webbsida i helskärm, inget annat
- adressen per station (från adminpanelen, fas 5.3)
- inställning av Windows kioskläge (tilldelad åtkomst, "Assigned Access") med Microsoft
  Edge i helskärmsläge. Kontrollera stegen mot Microsofts aktuella dokumentation när du
  skriver, och länka till den. Ange Windows-version och Edge-version du utgått från.
- Edge-flaggor och policyer som behövs: helskärm, ingen första-körningsdialog, ingen
  översättningsfråga, inget sparat lösenord, mikrofon tillåten för tjänstens adress,
  automatisk uppspelning av ljud tillåten för tjänstens adress, inga molnröster om
  beslut 10 säger det
- att Windows skärmtangentbord ska vara avstängt om Aibis eget används (fas 4.7)
- att stationen startar Edge av sig själv efter omstart och strömavbrott
- skärmens orientering, skalning (100–200 procent) och strömschema
- sensorn: hur den kopplas och ställs in att skicka F13
- att ingen kamera ska vara ansluten (regel A12)
- hur man ser att stationen fungerar, och vem man ringer när den inte gör det
- vad som behövs i nätet: stationen når servern på en port, inget annat; servern når
  ingenting utanför (förutom Azure efter fas 11)

### 10.6 Lasttest

Skriv `scripts/lasttest.py` som simulerar fem stationer som var och en ställer en fråga
var tionde sekund i 30 minuter, med frågor ur testfrågorna, både besvarade och nekade,
och några följdfrågor. Mät fel, p50 och p95, i båda lägena. Kör det utanför 01–06 och
efter att ha kontrollerat att maskinen inte är belastad (regel B5).

Målet står i `01-malbild.md` avsnitt 10.

### 10.7 Dygnstest

Låt en skärm (eller en Playwright-session i kioskläge) gå i 24 timmar mot tjänsten, med
en fråga var femte minut och vila däremellan. Mät minnet för tjänsten och för
webbläsaren varje timme. Inget minnesläckage, inga omstarter, inga fel.

Dygnstestet går över natten. Fråga Peter innan, eftersom Nyhetsfabriken kör 01–06. Med
läge strikt under natten belastas maskinen knappt. Med läge formulerad: fråga.

### 10.8 Backup och återställning

- Nattlig backup av databasen och korpusen i `AIBI_DATA_DIR/backup/`, sju dagar bakåt
  (målbilden avsnitt 9). SQLite kopieras med `.backup` eller `VACUUM INTO`, inte med
  `cp` medan tjänsten skriver.
- Öva återställning: starta en ny container mot en tom datamapp, återställ från
  backupen, kör testfrågorna. Skriv tiden det tog och stegen i `deploy/drift/DRIFT.md`.

### 10.9 Pilot med besökare

Görs först när beslut 2 och 13 är fattade, och efter Peters ok.

Skriv `docs/PILOT.md` med en checklista för dagen före och dagen då piloten startar:

- beslut 1, 2, 3, 5, 9, 10, 13 och 14 är fattade och inställda
- dataskyddsombudet har läst `docs/DATASKYDD.md`
- personalen på biblioteket vet vad Aibi är, vad den inte kan, hur de stänger av
  ljudet och vem de ringer
- en skylt vid skärmen som säger att det är en AI och att samtal inte sparas (texten
  skrivs av Peter, Aibi kan föreslå)
- testfrågorna körs på plats och är gröna
- vilka mätvärden som följs under piloten och hur ofta (statistikfliken)
- hur piloten avbryts: vem som får, och hur (av-knapp för ljud, stäng av stationen,
  stoppa tjänsten)

Under piloten: gå igenom granskningskön och statistiken en gång i veckan med Peter, och
skriv vad som ändrats i STATUS.

## Tester

- Playwright: sensortangenten väcker skärmen och ger inga serveranrop, vila efter
  inaktivitet, vaktfunktionen vid serveromstart, nätavbrott och fel (med route-mockning).
- Lasttest och dygnstest enligt 10.6 och 10.7, med resultat i granskningsunderlaget.
- Återställningsövningen.

## Klart när

- [ ] Lasttestet når målen i båda lägena.
- [ ] Dygnstestet har gått utan fel och utan minnesläckage.
- [ ] Felövningarna i 10.3 har gjorts på riktig hårdvara.
- [ ] `deploy/kiosk/KIOSK.md` finns och Peter har skickat den till Unikom.
- [ ] Backup och återställning är övade och dokumenterade.
- [ ] `docs/PILOT.md` finns.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet.

## Grind

Stanna. Peter tittar på dygnstestet och checklistan. Piloten med besökare startar först
när beslut 13 är fattat och Peter sagt ok.

## Fällor

- En skärm som tappar nätet visar Edges egen felsida och kommer inte tillbaka av sig
  själv. Vilosidan måste ligga i den redan laddade sidan, inte på servern.
- Windows uppdateringar startar om datorn på natten. Edge ska starta igen av sig själv,
  och sidan ska klara att servern inte svarar första minuten.
- Stora skärmar med skalning 200 procent ger en annan layout än testerna i 1080×1920.
  Testa på den riktiga skärmen.
- Ett lasttest som körs från Bosgame mot Bosgame mäter inte nätet till biblioteket. Skriv
  det som en begränsning.
- Kioskläge i Windows ändras mellan versioner. Skriv vilken version instruktionen gäller.
