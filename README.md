# aibibosse

Sjöbo bibliotek — AI-värd. Det här repot innehåller **frontend/UI-skalen** för
AiBi/Bosse och Firebase Hosting-konfigurationen för att publicera dem statiskt.
Själva chatten kräver en separat live-backend.

## Vad som finns i repot just nu

| Del | Fil/rutt | Syfte |
|---|---|---|
| Medborgarskärm | `/index.html` | Publik Bosse-chatt med välkomstläge, snabbfrågor, talstöd och handoff till personal |
| Personalskärm | `/personal.html` | Samma chattkärna men i personalnivå/intern kontext |
| Admin | `/admin.html` | Adminpanel för token-skyddad drift, import, källor, konflikter, metrics, frågelogg och att-göra |
| Kioskvy | `/kiosk/index.html` | Separat kioskgränssnitt för källgrundade svar/kort |
| Landningssida | `/kiosk/landning.html` | Enkel routning mellan medborgare, personal och admin |

## Frontend-läge efter senaste merge

- Publik och personal använder samma kärna i `ui/app.js` och komponenterna i
  `ui/components/`.
- Mobilchatten har uppdaterats så att innehållet scrollar separat från
  inmatningsfältet, vilket minskar overflow-problem på små skärmar.
- Publika Bosse-vyn har attract/idle-läge, snabbfrågor, mikrofon, uppläsning av
  svar och källa-per-svar.
- Adminpanelen innehåller dokumentimport, katalogimport, källregister,
  konfliktlösning, metrics/analys, frågelogg och manuella att-göra-poster.
- Kioskvyn använder ett eget lättviktsflöde i `ui/kiosk/` och anropar ett
  separat chat-endpoint-flöde.

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
- `ui.greeting` ska säga att det är en AI (AI-förordningen art. 50, vägval 16).
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
  session, inmatning, uppläsning, öppen QR-kod och val av textstorlek och
  kontrast. Kioskvyn glömmer också följdfrågans sammanhang och byter tillbaka
  till svenska.
- Svarar inte `/api/health` visar Bosse att tjänsten inte
  fungerar och hur man når personal, och inmatningen stängs. Hälsan kontrolleras
  igen varje minut. "(övar)" för dummy-läget syns bara på personalskärmen.
- En källa med `url`, `lank`, `href` eller `hemsida` visas som en
  knapp som öppnar en QR-kod. Källor utan adress är bara text.
- Knappar för större text och högre kontrast finns på
  Bosse och i kioskvyn. Färdiga svar läses upp av skärmläsare. På pekskärm tar
  inmatningsfältet inte fokus av sig självt, så att skärmtangentbordet inte
  fälls upp efter varje svar.
- Kioskvyn skickar `foregaende` med värdet av
  `tolkad_fraga` från förra svaret. Fältet skickas bara om backend har
  returnerat `tolkad_fraga`, och töms när ett svar har `nekad: true`.
- I kioskvyn visas bara `tillganglig: true` eller `false`
  som inne eller utlånad. Allt annat visas som att vi inte kan se om boken är inne.

`ui/vendor/qrcode.js` är qrcode-generator 1.4.4 av Kazuhiko Arase, MIT-licens.

## Hosting och deploy

Firebase Hosting är konfigurerat i `firebase.json` för att publicera katalogen
`ui/`. Befintliga filer som `/personal.html`, `/admin.html`,
`/kiosk/index.html` och `/kiosk/landning.html` serveras direkt, medan övriga
vägar faller tillbaka till `/index.html`.

Aktuell Firebase-koppling i repot:

- Projektfil: `/.firebaserc`
- Standardprojekt: `aibi`
- Publik katalog: `/ui`

Det finns **ingen separat deploy-workflow i repot** för hosting. Publicering av
UI:t sker manuellt med Firebase CLI.

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

## Viktiga begränsningar

- Firebase Hosting publicerar bara det statiska UI:t, inte FastAPI/Ollama eller
  annan serverlogik.
- Admin kräver `BOSSE_ADMIN_TOKEN`, men tokenen ska inte ligga i repot.
- Om backend eller proxy inte är uppe kan UI:t laddas men chatten vara offline.

## Säkerhet

Inga tokens eller nycklar ska committas. `BOSSE_ADMIN_TOKEN` ska ligga i
driftmiljön, inte i koden.
