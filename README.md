# aibibosse — sjöbo biblioteks AI-värd

Huvudmapp med tre skärmar + kiosk, redo för Firebase Hosting.

## Struktur

```
ui/
  index.html      Medborgare (publik kiosk-start)
  personal.html   Personal (intern nivå)
  admin.html      Admin (kräver token)
  kiosk/          AiBi-kiosken (landning + chattklient)
  backend/        (ej hostat — kräver FastAPI + Ollama)
```

## Deploy

Statisk hosting täcker **bara UI-skalen**. Chatten kräver en backend
(FastAPI + Ollama) — kan inte köras på Firebase Hosting.

```bash
firebase login          # interaktivt — krävs av dig
firebase deploy --only hosting
```

## Korsreferens

- `bosse` · FastAPI :8086 + SSE `/api/chat` + admin-token
- `AiBibliotekarie` · korpus, retrieval, kiosk
