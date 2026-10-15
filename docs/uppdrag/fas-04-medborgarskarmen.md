# Fas 4: Medborgarskärmen

## Syfte

Efter den här fasen finns en enda skärm för besökarna. Den ser ut som Sjöbo kommun, visar
svarskort och förslag på följdfrågor, har språkval, större text och kontrast, och
fungerar i stående och liggande format från 27 till 55 tum och på mobil. I kioskläge har
den ett eget tangentbord med å, ä och ö, går inte att lämna, och laddar om sig själv om
något hängt sig.

Det är det besökaren ser. Peter ska kunna visa det för projektgruppen.

## Förutsättningar

- Fas 3 är godkänd. SSE-händelserna `kort`, `kallor`, `forslag` och `meta` finns.
- Läs `docs/GRAFISK-PROFIL.md`, `CLAUDE.md` och README:s ändringslogg för oktober 2026.
  Mycket i `ui/` är redan gjort och testat (49 kontroller i `test/ui_test.py`). Bygg
  vidare på det. Skriv inte om.
- Beslut 1 (namnet) och 18 (kioskvyn) har standardval som räcker. Beslut 2 (avataren)
  behövs först i fas 10.

## Uppgifter

### 4.1 Skärmdumpar före

Ta skärmdumpar av `ui/index.html` och `ui/kiosk/index.html` i 1080×1920, 1920×1080,
2560×1440 och 390×844 innan du ändrar något. Lägg dem i
`docs/uppdrag/granskning/bilder/fas-04-fore/`. Testramverket i `test/` kan redan ta
skärmdumpar.

### 4.2 Svarskorten in i Bosse-vyn

Kioskvyn (`ui/kiosk/kiosk.js`) har kort för bok, evenemang, öppettid, tjänst och
bibliotek, med rättningarna från oktober 2026 (bok med okänd status, öppettid med dag,
bibliotekskort med adress). Flytta dem till en komponent, `ui/components/kort.js`, och
använd den i Bosse-vyn.

- Korten kommer i SSE-händelsen `kort` och visas under svarstexten.
- Ett kort upprepar inte svaret. Det är för den som vill se detaljerna.
- Kort för bok visar aldrig "inne" utan en levande källa (regel A2, fas 9).
- Kort för öppettid markerar dagens rad och skriver ut "Meröppet" och "Personal på
  plats" som text, inte bara med färg (regel A16).
- Inga länkar, inga QR-koder (regel A13).

### 4.3 Förslag på följdfrågor

`forslag` visas som knappar under svaret, högst tre. Ett tryck skickar frågan som om
besökaren skrivit den. Snabbfrågorna på startskärmen kommer från `/api/config`
(`ui.quick_questions`), inte från `app.js`.

Byt reservlistan i `ui/app.js` (raden med "Vad är bästa barnboken just nu?"). Boktips
ligger utanför uppdraget och den frågan nekas. Reservlistan ska bara innehålla frågor
som motorn besvarar i `exempeldata/`, och ett test ska köra dem.

### 4.4 Språkval

- Språkknappen från kioskvyn flyttas in. Den visar bara språk som är släppta enligt
  `/api/config` (beslut 9). I dag bara svenska, så knappen syns inte förrän ett andra
  språk släppts.
- Gränssnittets texter flyttas till `ui/sprak/sv.json` och `ui/sprak/en.json`. Inga
  texter i JavaScript-filerna utom som reserv. Fas 8 bygger vidare på det här.
- `lang`-attributet på `<html>` följer språket, och `dir="rtl"` sätts för språk som
  skrivs från höger.

### 4.5 Kommunens grafiska profil

Enligt `docs/GRAFISK-PROFIL.md`:

- Lato som lokal fil i `ui/typsnitt/` (Regular, Italic, Bold, Black, i woff2). Lato är
  licensierad under SIL Open Font License, så filerna får ligga i repot med licensen
  bredvid. Ladda ner dem en gång från en källa du kan visa (till exempel
  `@fontsource/lato` via npm) och checka in dem. Inga anrop till Google Fonts eller
  andra CDN (regel G).
- Sjöbodigital #248187 för knappar och markeringar. Vit text på den håller 4,6:1, men
  på grått #f5f5f5 blir det 4,2:1, som inte räcker för vanlig text. Använd den mörkare
  varianten eller vit bakgrund där det behövs, och låt axe-core avgöra.
- Logotypen i `ui/profil/sjobo/` nere till höger, i frizon enligt profilen. Den
  liggande i färg på ljus bakgrund, den negativa på mörk (kontrastläget). Logotypen är
  en inställning per kommun, så andra kommuner byter fil utan att ändra kod.
- Den bruna bannern för personalskärmen (#4a3426) ligger kvar.

Behåll det som fungerar i dagens utseende. Profilen ska synas, inte ta över. Visa Peter
före och efter.

### 4.6 Namn och avatar

- Namnet kommer alltid från `/api/config` (regel A15). Standardvärdet i
  `ui/components/profil.js` är i dag "Bosse". Byt till något neutralt som "Bibliotekets
  AI-värd" och låt startdatan för Sjöbo sätta "Aibi" (beslut 1).
- Avataren blir en inställning med tre lägen: illustrationen som finns, en bild som
  kommunen laddar upp, eller bara namn och roll i text. Standard under utveckling:
  illustrationen. Inför besökare: avstängd om Peter inte sagt annat (beslut 2).
- En uppladdad bild får en alt-text från inställningarna.

### 4.7 Kioskläge

`?kiosk=1` slår på kioskläget. Utan parametern beter sig sidan som en vanlig webbsida
(för mobil och för personalen).

- **Skärmtangentbord**: ett eget, enkelt tangentbord i HTML med svensk layout (å, ä, ö),
  stora tangenter, mellanslag, radera, skicka, och en knapp för siffror. Det visas när
  textfältet får fokus och döljs efter att frågan skickats. Det ska fungera med
  skärmläsare och tangentbord också. Inga externa bibliotek om det går att lösa enkelt.
  Windows inbyggda tangentbord kan vara ett alternativ, men det beter sig olika mellan
  versioner. Ett eget ger samma upplevelse överallt. Skriv valet i STATUS.
- Ingen markering av text, ingen högerklicksmeny, ingen dra-och-släpp, ingen zoom med
  nyp (men "Större text" fungerar).
- Ingen autofokus på pekskärm (finns redan i `tillganglighet.js`).
- **Station**: `?station=<id>` skickas med i `/api/config`, `/api/chat`, `/api/human`,
  enkäten och statistiken.
- **Vilosida**: när `/api/health` inte svarar visas en lugn sida med namnet, "Jag är
  inte tillgänglig just nu" och telefonnumret om det finns (beslut 5). Sidan försöker
  igen var 30:e sekund och återgår när servern svarar.
- **Vaktfunktion**: om sidan inte haft ett lyckat anrop mot servern på 10 minuter
  trots att servern svarar, eller om JavaScript kastat ett oväntat fel, laddas sidan om.
  Dessutom en omladdning varje natt klockan 04 (tid från servern).
- **Samtalsslut**: när skärmen återställs (vila, "Ny fråga" eller efter enkäten)
  skickas `POST /api/samtal/slut` med orsaken.

### 4.8 Personalinloggning

Inloggningsrutan från fas 2 får samma utseende som resten. Personalskärmen visar tydligt
att den är inloggad, och har en knapp för att logga ut. Den loggar ut själv efter åtta
timmar och efter 30 minuters inaktivitet på en kioskstation.

### 4.9 Layouter

Testa och justera i:

- stående 1080×1920 (27 till 55 tum stående)
- liggande 1920×1080 och 2560×1440
- 3840×2160 med skalning 150 procent och 200 procent (stora skärmar kör ofta så)
- mobil 390×844 och 360×740

Text ska gå att läsa på en meters avstånd på en 55-tumsskärm och inte vara jättelik på
27 tum. Använd `clamp()` med viewport-enheter för grundstorleken, som redan delvis görs
i `ui/style.css`.

### 4.10 Kioskvyn och landningssidan

Flytta `ui/kiosk/` och `ui/kiosk/landning.html` till `ui/dev/` (beslut 18). Ingenting på
medborgarskärmen länkar dit. Gränssnittstesterna för kioskvyn flyttas med eller tas bort
om funktionen nu finns i Bosse-vyn och testas där. Rör du tester: skriv i
granskningsunderlaget vilka som flyttats och varför.

### 4.11 Tillgänglighet

- Lägg in axe-core i gränssnittstesterna (som npm-beroende i `test/`, inte via CDN).
  Kör det på startskärmen, efter ett svar med kort, med större text, med kontrast, med
  skärmtangentbordet öppet och på vilosidan. Inga fel med påverkan "serious" eller
  "critical".
- Tangentbordsnavigering genom hela flödet, med synligt fokus.
- Skärmläsaren får svaret upplästa när det är klart (finns), och korten har rubriker.
- Information ges aldrig bara med färg (regel A16).

## Tester

- Alla befintliga gränssnittstester gröna, plus nya för kort, förslag, språkval,
  kioskläge, tangentbord, vilosida, vaktfunktion (med falsk tid), station och
  samtalsslut.
- axe-core enligt 4.11.
- Återställningen vid inaktivitet rensar också tangentbordet, språkvalet, kort och
  förslag (regel A8). Utöka det befintliga testet.
- Skärmdumpar efter, i samma storlekar som 4.1.

## Klart när

- [ ] En medborgarskärm med kort, förslag, språkval, profil och kioskläge.
- [ ] Inga anrop till externa adresser från gränssnittet (kontrollera i Playwright att
      alla anrop går till samma ursprung).
- [ ] axe-core grönt.
- [ ] Skärmdumpar före och efter i granskningsunderlaget.
- [ ] README:s beskrivning av gränssnittet uppdaterad, liksom CLAUDE.md om reglerna
      ändrats.

## Grind

Stanna. Peter tittar på skärmdumparna och, om det går, på en riktig skärm i stående och
liggande. Han bestämmer namnet (beslut 1) om det inte redan är gjort.

## Fällor

- Kioskvyn och Bosse-vyn har olika sätt att bygga upp DOM:en. Flytta funktionen, inte
  koden rakt av.
- `zoom` i CSS (används för större text) beter sig olika i webbläsare. Edge och Chrome
  klarar det. Testa i Chromium.
- Ett eget tangentbord som tar fokus från textfältet gör att skärmläsare tappar bort
  sig. Låt textfältet ha fokus och skriv in tecknen programmatiskt.
- `user-select: none` på hela sidan gör att textfältet inte går att markera. Undanta
  det.
- Nattlig omladdning när någon står och pratar med skärmen: vänta tills skärmen är i
  vila.
