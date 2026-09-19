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

## Hosting och deploy

Firebase Hosting är konfigurerat i `firebase.json` för att publicera katalogen
`ui/` och skriva om alla routes till `/index.html`.

Aktuell Firebase-koppling i repot:

- Projektfil: `/.firebaserc`
- Standardprojekt: `aibi`
- Publik katalog: `/ui`

Det finns **ingen separat deploy-workflow i repot** för hosting. Publicering av
UI:t sker manuellt med Firebase CLI.

### Manuell publicering

```bash
cd /home/runner/work/aibibosse/aibibosse
firebase login
firebase use aibi
firebase deploy --only hosting
```

## Viktiga begränsningar

- Firebase Hosting publicerar bara det statiska UI:t, inte FastAPI/Ollama eller
  annan serverlogik.
- Admin kräver `BOSSE_ADMIN_TOKEN`, men tokenen ska inte ligga i repot.
- Om backend eller proxy inte är uppe kan UI:t laddas men chatten vara offline.

## Säkerhet

Inga tokens eller nycklar ska committas. `BOSSE_ADMIN_TOKEN` ska ligga i
driftmiljön, inte i koden.
