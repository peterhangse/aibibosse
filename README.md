# aibibosse

Sjöbo bibliotek — AI-värd. Det här repot innehåller **frontend/UI-skalen** för
AiBi/Bosse och Firebase Hosting-konfigurationen för att publicera dem statiskt.
Själva chatten kräver en separat live-backend.

Planen för att samla backend här och ta tjänsten till pilot står i
`docs/uppdrag/README.md`.

## Vad som finns i repot just nu

| Del | Fil/rutt | Syfte |
|---|---|---|
| Medborgarskärm | `/index.html` | Publik Bosse-chatt med viloskärm, snabbfrågor, talstöd och personalknapp |
| Personalskärm | `/personal.html` | Samma chattkärna men i personalnivå/intern kontext |
| Admin | `/admin.html` | Adminpanel för token-skyddad drift, import, källor, konflikter, metrics, frågelogg och att-göra |
| Kioskvy | `/kiosk/index.html` | Separat kioskgränssnitt för källgrundade svar och svarskort, SV/EN |
| Landningssida | `/kiosk/landning.html` | Väljer mellan medborgare (`/`), personal och admin, med länk till kioskvyn |

## Filer och laddningsordning

```
ui/
  index.html, personal.html   Bosse (medborgare och personal)
  app.js                      Bosses logik: hälsning, återställning, chatt, röst
  style.css                   Bosses utseende, inklusive stående pekskärm
  admin.html                  Adminpanelen (egen stil och logik)
  components/
    profil.js                 Inställningar från /api/config, namn, hälsning,
                              bemanning. Måste laddas före övriga komponenter.
    tillganglighet.js         Knappar för större text och kontrast,
                              uppläsning för skärmläsare, autofokus av på pekskärm
    gemensam.css              Stil som delas av Bosse och kioskvyn
    avatar.js, chat.js, input.js   Bosses delar
  kiosk/
    index.html, kiosk.js, kiosk.css   Kioskvyn
    landning.html             Landningssidan
test/
  kor.sh                      Kör alla gränssnittstester
  mock_api.py                 Låtsas-API som ersätter backend under test
  ui_test.py                  Playwright-kontroller, skärmdumpar till test/ut/
```

Ordningen på skript i Bosse är `profil.js`, `tillganglighet.js`, `avatar.js`,
`chat.js`, `input.js`, `app.js`. Kioskvyn laddar `profil.js` och
`tillganglighet.js` från `../components/` före `kiosk.js`. Bosse och
personalskärmen använder samma kärna, och personalskärmen sätter
`window.AIBI_NIVA = 'personal'`.

## API-beroenden

Repot innehåller **inte** backend-koden. Frontenderna förutsätter att följande
API:er finns på samma origin eller bakom en reverse proxy:

- Bosse-chatten: `/api/config`, `/api/health`, `/api/chat`, `/api/stt`,
  `/api/human`, `/api/history`, `/api/feedback`
- Admin: `/api/admin/*`
- Kioskflödet: `/api/v1/chat`

Utan dessa endpoints blir sidorna bara statiska skal.

## Inställningar i `/api/config`

Alla skärmar läser samma inställningar från `/api/config`
(`ui/components/profil.js`). Fält som saknas får ett standardvärde, så sidan
fungerar även när backend inte svarar.

```json
{
  "personality": { "nickname": "Bosse", "role": "Bibliotekets AI-värd" },
  "ui": {
    "greeting": "Hej! Jag är Bosse, bibliotekets AI-värd. Vad undrar du?",
    "quick_questions": ["När öppnar ni på lördag?", "Hur skaffar jag lånekort?"],
    "open_now": "Biblioteket har öppet till 19 i dag.",
    "idle_seconds": 75
  },
  "kontakt": { "telefon": "0416-XX XX XX" },
  "bemanning": [
    { "dagar": [1, 2, 3, 4, 5], "fran": "10:00", "till": "18:00" },
    { "dagar": [6], "fran": "10:00", "till": "14:00" }
  ]
}
```

- `personality.nickname` är namnet som visas överallt i gränssnittet. Byt här
  om projektgruppen bestämmer ett annat namn.
- `ui.greeting` ska säga att det är en AI (AI-förordningen art. 50, vägval 14).
  Saknas ordet AI lägger gränssnittet själv till en mening.
- `ui.idle_seconds` är tiden utan aktivitet innan skärmen återställs.
  Standard är 75 sekunder för Bosse och 120 för kioskvyn.
- `bemanning` är när personal finns på plats. `dagar` är 1 = måndag till
  7 = söndag. Utanför de tiderna säger personalknappen att ingen finns på plats,
  vilket nummer man kan ringa och när personalen är tillbaka. Är listan tom
  lovar knappen ingenting om när någon kommer.
- `kontakt.telefon` visas i personalknappens svar och när tjänsten är nere.

## Så beter sig skärmarna

- Efter `idle_seconds` utan aktivitet töms samtal,
  session, inmatning, uppläsning, personalknappens svar och val av textstorlek
  och kontrast. Personalskärmen återställs inte. Kioskvyn glömmer också följdfrågans sammanhang och byter tillbaka
  till svenska.
- Svarar inte `/api/health` visar Bosse att tjänsten inte
  fungerar och hur man når personal, och inmatningen stängs. Hälsan kontrolleras
  igen varje minut. "(övar)" för dummy-läget syns bara på personalskärmen.
- Källor visas som text under svaret ("Enligt våra källor: …") och gör
  ingenting när man trycker. De finns för att visa var svaret kommer ifrån
  (krav F7), inte för att skicka besökaren vidare. Bygg inte in länkar,
  QR-koder eller kopiering i källorna.
- Knappar för större text och högre kontrast finns på
  Bosse och i kioskvyn. Färdiga svar läses upp av skärmläsare. På pekskärm tar
  inmatningsfältet inte fokus av sig självt, så att skärmtangentbordet inte
  fälls upp efter varje svar.
- Kioskvyn skickar `foregaende` med värdet av
  `tolkad_fraga` från förra svaret. Fältet skickas bara om backend har
  returnerat `tolkad_fraga`, och töms när ett svar har `nekad: true`.
- I kioskvyn visas bara `tillganglig: true` eller `false`
  som inne eller utlånad. Allt annat visas som att vi inte kan se om boken är inne.
- I kioskvyn visar bibliotekskortet adress, telefon och e-post. Öppettidskortet
  visar dag och tider.

## Testa

```bash
bash test/kor.sh
```

Skriptet startar fyra låtsas-API:er (utan backend, fullt, bemannat och nere),
kör alla kontroller i Chromium och skriver PASS eller FAIL för var och en.
Skärmdumpar i liggande, stående pekskärm och mobil hamnar i `test/ut/`. Kör det
efter varje ändring i `ui/`. Låtsas-API:t svarar med påhittade testsvar och
säger ingenting om hur den riktiga backend beter sig.

## Hosting och deploy

Firebase Hosting är konfigurerat i `firebase.json` för att publicera katalogen
`ui/`. Befintliga filer som `/personal.html`, `/admin.html`,
`/kiosk/index.html` och `/kiosk/landning.html` serveras direkt, medan övriga
vägar faller tillbaka till `/index.html`.

Aktuell Firebase-koppling i repot:

- Projektfil: `/.firebaserc`
- Standardprojekt: `aibi`
- Publik katalog: `/ui`

Deployen från GitHub Actions har hittills aldrig gått igenom (se nedan), så
sidan ligger inte uppe på web.app än.

### Manuell publicering

```bash
cd /path/to/aibibosse
firebase login
firebase use aibi
firebase deploy --only hosting
```

## Automatisk deploy till Firebase Hosting (GitHub Actions)

Repot innehåller en workflow i
`.github/workflows/firebase-hosting-deploy.yml`
som deployar till Firebase Hosting vid push till `main` eller `master`.

Sätt följande repository secret i GitHub för att den ska fungera:

- `FIREBASE_SERVICE_ACCOUNT_AIBI` = service account JSON för Firebase-projektet
  `aibi`

Workflowen kan också köras manuellt via **Run workflow** i GitHub Actions.

Status oktober 2026: varje körning har fallit med `Failed to authenticate,
have you run firebase login?`. Secreten saknas eller är fel, och projekt-ID:t
är troligen inte `aibi`, eftersom projekt-ID:n är unika i hela Firebase. Kör
`firebase projects:list` för att se det riktiga ID:t och
`firebase init hosting:github` för att skapa nyckeln och secreten. Rätta sedan
`.firebaserc` och `--project` i workflowen. Tills dess är det normalt att
deployen faller vid varje push till `main`.

## Viktiga begränsningar

- Firebase Hosting publicerar bara det statiska UI:t, inte FastAPI/Ollama eller
  annan serverlogik.
- Admin kräver `BOSSE_ADMIN_TOKEN`, men tokenen ska inte ligga i repot.
- Om backend eller proxy inte är uppe kan UI:t laddas men chatten vara offline.

## Säkerhet

Inga tokens eller nycklar ska committas. `BOSSE_ADMIN_TOKEN` ska ligga i
driftmiljön, inte i koden.

## Ändringslogg

Ändringar gjorda med Claude, för den som tar vid i nästa session.

### 2026-10-15 — Uppdragsspecifikation för MVP deluxe

- Ny mapp `docs/uppdrag/` med uppdraget som tar Aibi från test till en samlad,
  testad tjänst som kör som pilot på Bosgame och är redo för Azure. Börja i
  `docs/uppdrag/README.md`. Reglerna står i `docs/uppdrag/00-regler.md`.
- Bakgrund i `docs/PROJEKTKONTEXT.md`, projektgruppens beslut i
  `docs/VAGVAL.md` och kommunens grafiska profil i `docs/GRAFISK-PROFIL.md`.
- Sjöbo kommuns logotyper i `ui/profil/sjobo/`. Andra kommuner byter dem.
- Hänvisningarna till vägvalen i README och `profil.js` följer nu den
  slutliga numreringen (19 vägval). Tabellen i `docs/VAGVAL.md` visar den
  gamla och den nya.
- Inget i gränssnittet är ändrat.

### 2026-10-14 — PR #7: stående pekskärm och samma stil

- Bosse fyller hela skärmen på stående skärmar som är minst 700 × 1000 px
  (media query i `style.css`), med större text och knappar.
- Personalbannern ligger överst i chattrutan i stället för bredvid den.
- Kioskvyn och landningssidan har bytt från egen blå stil till Bosses färger
  och typsnitt. "Medborgare" på landningssidan leder till Bosse (`/`).

### 2026-10-15 — PR #8: AI-hälsning, återställning, personalknapp och tillgänglighet

- Ny `components/profil.js` med alla inställningar. Namnet, hälsningen,
  väntetiden, bemanningen och telefonnumret kommer därifrån.
- Hälsning, viloskärm och kioskvy säger att det är en AI (AI-förordningen
  art. 50 och vägval 14).
- Återställning vid inaktivitet i både Bosse och kioskvyn. Förut låg samtalet
  kvar under viloskärmen, och kioskvyn återställdes inte alls.
- Personalknappen visar sitt svar under knappen och lovar inte att någon kommer
  när biblioteket är obemannat (vägval 1).
- Felläge när `/api/health` inte svarar. Alla `mode` utom `offline` och
  `dummy` räknas som igång, så att till exempel en Azure-backend inte visas
  som nere.
- Ny `components/tillganglighet.js` och `components/gemensam.css`.
- Kioskvyn skickar `foregaende` för följdfrågor. En bok med okänd status
  visades som "Utlånad just nu" och visas nu som okänd.

### 2026-10-15 — QR-koden borttagen igen

- PR #8 gjorde källor med webbadress till knappar som öppnade en QR-kod.
  Det är borttaget, liksom `components/qr.js` och `vendor/qrcode.js`.
  Skälet: Aibi ska ge svaret i samtalet och inte skicka besökaren vidare till
  en webbsida. Källorna är nu bara text, och bibliotekskortet i kioskvyn har
  ingen "Öppna i mobilen"-knapp.
- Testerna ligger nu i repot under `test/`.

## Kvar att göra

Allt nedan, och mycket mer, är planerat i `docs/uppdrag/`. Listan står kvar
som sammanfattning.

Det här kräver ändringar i backend, som inte finns i det här repot:

- Personalnivån bestäms i dag av webbläsaren (`window.AIBI_NIVA` och
  `?niva=personal` i adressen). Den måste avgöras på servern, annars kan vem
  som helst se interna dokument om backend litar på fältet.
- Gränssnittet hämtar samtalshistorik per session och adminpanelen visar de
  senaste frågorna. Kontrollera att backend följer vägval 18: statistik utan
  text, och bara obesvarade frågor sparas tills personalen gått igenom dem.
- `/api/config` behöver skicka `bemanning` och `kontakt.telefon`, annars visar
  personalknappen bara en neutral text.
- Synpunktsknapp med samtyckesruta (vägval 10–11) och två enkätfrågor efter
  avslutat samtal (vägval 2) finns inte än.
- Bosse och kioskvyn är fortfarande två separata medborgarskärmar. Tanken är
  att flytta svarskorten och språkvalet in i Bosse och sedan ta bort kioskvyn.

