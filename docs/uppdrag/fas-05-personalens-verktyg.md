# Fas 5: Personalens verktyg

## Syfte

Efter den här fasen kan bibliotekspersonalen sköta Aibi själva. De ändrar öppettider,
avvikande dagar, bemanning, hälsning, snabbfrågor, nekandetexter och annat innehåll i
vanliga formulär på svenska, och ser ändringen på skärmen inom en minut. De kan se vem som
ändrat vad och ångra. De går igenom frågorna Aibi inte kunde svara på, ser statistiken
och kör testfrågorna själva innan de släpper en ändring.

Det är fasen som gör Aibi till personalens verktyg och inte Peters.

## Förutsättningar

- Fas 4 är godkänd.
- Adminpanelen `ui/admin.html` finns och har redan import, källor, dokument,
  konflikter, frågelogg, metrics, drift, katalog och att göra. Läs den och de anrop den
  använder innan du börjar. Bygg vidare. Skriv inte om det som fungerar.
- Beslut 4 (bibliotek och stationer) och 5 (telefonnummer) behövs i den här fasen.
  Fråga Peter i början av fasen, och använd standardvalen tills han svarat.

## Uppgifter

### 5.1 Läs av hur det ser ut i dag

Gå igenom `ui/admin.html` flik för flik och skriv i STATUS: vad varje flik gör, vilka
anrop den använder, vad som är för tekniskt för personalen (JSON-fält, id:n,
engelska ord), och vad som saknas enligt målbilden avsnitt 6. Det blir planen för fasen.

### 5.2 Innehållet i databasen

Allt i målbilden avsnitt 4 under "Innehåll i databasen" ska ligga i databasen och läsas
därifrån. Det som i dag ligger i `config/bosse.yaml` eller i koden flyttas, med en
migrering som körs en gång och som inte skriver över något personalen ändrat.

Startdata för Sjöbo läses från `AIBI_DATA_DIR` vid första start. Startdata för andra
kommuner från `exempeldata/`.

`GET/PUT /api/admin/innehall/<del>` för varje del, med validering på servern: tider är
tider, öppnar före stänger, datum är datum, inga tomma namn, högst så här många
snabbfrågor. Felmeddelandena är på svenska och säger vad som ska rättas.

### 5.3 Formulär på svenska

En flik "Innehåll" med en sida per del. Formulären ska gå att använda av någon som aldrig
sett adminpanelen förut:

- **Bibliotek**: namn, adress, telefon, e-post. Öppettider som en vecka med två fält
  per dag och en ruta för "stängt". Meröppettider och bemannade tider på samma sätt.
  Avvikande dagar som en lista med datum, stängt eller andra tider, och en förklaring.
  En knapp "Lägg till helgdagar för året" som föreslår de svenska helgdagarna och
  aftnarna som personalen bockar i (räknas ut i koden, inte hämtas utifrån).
- **Stationer**: id, namn, vilket bibliotek, stående eller liggande, och adressen som
  stationen ska öppna (färdig att kopiera till Unikom, med `?station=` och `&kiosk=1`).
- **Värden**: namn, roll, hälsning, längsta svarslängd. Varning om hälsningen inte
  innehåller ordet AI: "Hälsningen måste säga att det är en AI. Aibi lägger till en
  mening om du inte skriver det själv." (regel A7, samma logik som
  `ui/components/profil.js`).
- **Snabbfrågor**: en lista per språk, med en knapp "Prova" som kör frågan och visar
  svaret. En snabbfråga som nekas går inte att spara.
- **Nekande och hänvisningar**: varianterna av nekandetexten och hänvisningarna per
  ämne. Krissvaret visas men går bara att ändra av rollen admin.
- **Röst**, **Synpunkter**, **Enkät**, **Språk** och **Återkoppling**: formulären byggs
  här, med de fält som finns i målbilden. Funktionerna själva kommer i fas 6, 7 och 8.
  Visa "Inte påslaget ännu" där funktionen saknas.
- **Kontakt**: telefonnumret som visas när ingen personal finns och när tjänsten är
  nere.

Varje formulär har en förhandsvisning: hur det ser ut på skärmen, och för öppettider
vad Aibi svarar på "Är ni öppna nu?" och "När öppnar ni i morgon?" med de nya
uppgifterna, innan de sparas.

Text som personalen skriver och som ska visas för besökare: kontrollera längden, och
varna (inte stoppa) om texten innehåller ord som gör den svår att förstå, till exempel
"erhålla", "inkomma", "tillhandahålla". En kort lista räcker.

### 5.4 Ändringen syns inom en minut

När personalen sparar ska skärmarna visa ändringen inom 60 sekunder utan omstart och
utan att någon pågående konversation bryts. Enklast: stationerna hämtar `/api/config`
igen när skärmen går i vila och var femte minut, och servern läser från databasen utan
cache, eller med en cache som töms vid PUT. Testa med Playwright.

### 5.5 Ändringslogg

- Varje PUT skriver en rad: tid, roll (redaktör eller admin), vilken del, hela värdet
  före och efter.
- En flik "Ändringar" med listan, filter på del och period, och en knapp "Återställ
  till den här versionen". Återställningen är själv en ändring och loggas.
- Ändringsloggen innehåller aldrig besökares text.

### 5.6 Granskningskön

En flik "Obesvarade frågor" med kön från fas 2:

- frågan (maskerad), tid, station, språk och typ av nej
- knappar: "Klar" (raderar), och "Gör till innehåll" som öppnar ett utkast till ett
  nytt dokument eller en ny hänvisning med frågan ifylld. Utkastet sparas först när
  personalen skrivit svaret och tryckt spara. Frågan raderas ur kön när utkastet
  sparats.
- gruppering av liknande frågor, så att tio varianter av samma fråga syns som en
- en rad överst om hur länge frågorna sparas, med värdet från `AIBI_GRANSKNING_DAGAR`

### 5.7 Statistik

En flik "Statistik" med:

- antal samtal och frågor per dag, vecka och månad, per station och bibliotek
- andel besvarade, nekade och kris
- andel under meröppet (projektets mål är 30 procent av interaktionerna, se
  `docs/PROJEKTKONTEXT.md`)
- de vanligaste typerna av frågor (intent), inte frågorna själva
- användning av personalknappen, rösten, språken, synpunkter
- tumme upp och ner, enkätsvaren
- grundning underkänd och fallback till strikt läge
- svarstid, p50 och p95

Diagram med enkel inbyggd SVG eller en liten lokal fil, inga externa bibliotek via CDN.
`GET /api/admin/statistik.csv` med samma urval.

Projektets nyckeltal (200 interaktioner, 30 procent meröppet) syns som en rad överst med
aktuellt värde för vald period.

### 5.8 Testfrågor

En flik "Testfrågor":

- listan med testfrågor (de publika ur `backend/eval/`), och personalens egna som de
  lagt till
- knappen "Kör alla" anropar `POST /api/admin/testfragor/kor` och visar resultatet: för
  varje fråga svaret, om det blev rätt, och om det nekades
- en sammanfattning högst upp: X av Y rätt, jämfört med förra körningen
- personalen kan lägga till en fråga med förväntat svar (ett eller flera ord som ska
  finnas) eller "ska nekas"

Körningen ska gå i bakgrunden och inte blockera tjänsten. Den använder läge strikt om
inget annat väljs, så att den inte belastar Bosgame.

### 5.9 Export och import

`GET /api/admin/export` ger en zip med allt innehåll, korpusen (publik och intern om
rollen är admin), testfrågorna och statistiken, och en `LASMIG.txt` som förklarar
innehållet. En import av samma zip återställer innehållet (efter en bekräftelse). Det är
både backup och sättet för en annan kommun att börja.

### 5.10 Roller

Redaktören får: innehåll, granskningskön, statistik, testfrågor. Admin får dessutom:
källor, import, katalog, export, röstavstängning, krissvaret. Knappar som rollen inte
får använda syns inte. Servern kontrollerar oavsett.

## Tester

- Backend: validering för varje del, ändringslogg och återställning, behörighet per
  roll och anrop, export och import tur och retur.
- Playwright: en redaktör ändrar en öppettid, förhandsvisningen visar rätt svar, sparar,
  och en station visar det nya svaret inom 60 sekunder. Samma för hälsningen.
- axe-core på adminpanelens flikar.
- Spårtestet från fas 2 grönt, med de nya tabellerna.

## Klart när

- [ ] Allt innehåll i målbilden avsnitt 4 går att ändra i formulär, utan JSON.
- [ ] Ändringsloggen fungerar och går att återställa från.
- [ ] Granskningskön, statistiken och testfrågorna finns som flikar.
- [ ] Export och import fungerar.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet.

## Grind

Stanna. Peter loggar in som redaktör, ändrar en öppettid och hälsningen, och ser
ändringarna på skärmen. Han lämnar adminpanelen till någon i personalen och skriver vad
den personen fastnade på. Det är en del av grinden.

## Fällor

- Personalen kommer att skriva öppettider på många sätt ("10-18", "10.00–18.00",
  "kl 10"). Ta emot alla i formuläret och spara i ett format.
- Helgdagar som infaller på olika datum varje år (påsk, midsommar, alla helgons dag)
  räknas ut, de hårdkodas inte.
- En ändringslogg som sparar hela värdet blir stor om någon klistrar in långa texter.
  Det är ändå rätt val. Rensa inte.
- Bygg inte ett generellt formulärramverk. Fem enkla formulär är lättare att ändra.
