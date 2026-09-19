# aibibosse

Sjöbo bibliotek — AI-värd. Tre roller i ett repo (offentligt).

| Skärm | Fil | Nivå |
|---|---|---|
| Medborgare (kiosk) | `ui/kiosk/` | publik |
| Personal | `ui/personal.html` | intern |
| Admin | `ui/admin.html` | admin (token) |

## Publicera på webben (web.app)

Chatten kräver en live-backend (FastAPI + Ollama) — **Firebase Hosting är
statiskt och kan bara hosta UI-skalen**, inte chatten. För ren statisk
publicering av gränssnitten:

```bash
cd /home/nyhetsfabriken/projekt/aibibosse
firebase login            # interaktivt — kräver din inloggning
firebase projects:create aibibosse   # välj/ändra projekt-ID i .firebaserc
firebase deploy --only hosting
```

Resultat: `https://aibibosse.web.app`.

## Automatisk deploy till Firebase Hosting (GitHub Actions)

Repot innehåller en workflow i
`.github/workflows/firebase-hosting-deploy.yml`
som deployar till Firebase Hosting vid push till `main` eller `master`.

Sätt följande repository secret i GitHub för att den ska fungera:

- `FIREBASE_SERVICE_ACCOUNT_AIBI` = service account JSON för Firebase-projektet
  `aibi`

Workflowen kan också köras manuellt via **Run workflow** i GitHub Actions.

## Ta bort Firebase-koppling om du inte vill hosta

Radera `.firebaserc` och `firebase.json`.

## Notis

Inga tokens/nycklar i repot — `BOSSE_ADMIN_TOKEN` ligger i systemd-enheten,
inte i kod.
