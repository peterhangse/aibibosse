# Målbild: så ska Aibi se ut när uppdraget är klart

Den här filen beskriver slutläget. Faserna beskriver vägen dit. När en fas och
målbilden verkar säga olika saker gäller målbilden, men fråga Peter om skillnaden
påverkar något han ser.

Målbilden är skriven utan att författaren sett backend-koden. Fas 0 kartlägger vad
som faktiskt finns. Där koden redan löser något på ett annat men fungerande sätt
behåller du det och skriver avvikelsen i `docs/INVENTERING.md`. Det som är fast är
gränserna, reglerna och beteendet utåt. Modulnamn och filindelning får följa det som
finns.

## 1. En mening

En enda tjänst, i ett enda repo, som serverar både gränssnittet och API:t från samma
adress, svarar bara ur bibliotekets egen kunskapsbas, fungerar helt utan språkmodell
och blir bättre med en, och som går att starta hos en annan kommun med
`docker compose up -d`.

## 2. Repot

```
aibibosse/
  CLAUDE.md                 kort, operativ, läses varje session
  README.md                 för människor: vad, hur man startar, ändringslogg
  Dockerfile
  docker-compose.yml        aibi (+ valfri qdrant). Ollama ligger utanför.
  .env.example              alla inställningar för drift, utan värden
  backend/
    requirements.txt        eller pyproject.toml, med låsta versioner
    app/ eller aibi/        Python-paketet. Namnet får följa befintlig kod.
      main.py               FastAPI-app, monterar ui/ och alla routrar
      installningar         läser .env (pydantic-settings)
      motor/                ChatEngine, sökning, routing, nekande, följdfrågor,
                            omformulering och grundningskontroll
      korpus/               inläsning, import, källor, konflikter, katalog
      modeller/             adapter mot språkmodell, embeddings, omrankning
      rost/                 tal till text och text till tal
      api/                  publik, personal, admin
      lagring/              SQLite: innehåll, statistik, granskningskö,
                            ändringslogg, utkorg för synpunkter
    tests/                  pytest, mot riktig sökmotor
    eval/                   testfrågor och körskript för utvärdering
  ui/                       gränssnittet (finns)
  test/                     gränssnittstester med Playwright (finns)
  exempeldata/              ett påhittat bibliotek, för tester och andra kommuner
  deploy/
    kiosk/                  instruktion för stationerna (Unikom)
    drift/                  instruktion för servern, backup, uppdatering
  docs/                     den här mappen med flera
```

**Data ligger utanför repot.** Tjänsten läser allt som är kommunens från en
datamapp, `AIBI_DATA_DIR` (i containern `/data`, på Bosgame till exempel
`~/aibi-data`):

```
$AIBI_DATA_DIR/
  korpus/publik/            bibliotekets publika innehåll (json, md, csv)
  korpus/intern/            personalens interna dokument. Aldrig i git.
  katalog/                  katalogexporter. Aldrig i git.
  db/aibi.sqlite            innehåll, statistik, köer, loggar
  backup/                   nattliga kopior av db och korpus
```

Publikt innehåll om Sjöbo bibliotek (öppettider, tjänster, regler) är offentlig
information och får finnas som startdata i repot under `exempeldata/sjobo/` om Peter
vill. Interna dokument, katalogexporter, databaser och loggar får aldrig ligga i repot.

## 3. Processen

- **En process** (uvicorn) serverar `ui/` som statiska filer och alla `/api/`-anrop.
  Samma ursprung, inga CORS-undantag för stationerna.
- **Ingen AI på stationerna.** De visar `https://<server>/?station=<id>&kiosk=1`.
- **Ollama** körs utanför containern, på värddatorn, och nås via
  `host.docker.internal`. Den exponeras inte utåt.
- **Qdrant** används bara om fas 0 visar att den redan används och ger mätbart bättre
  resultat. Annars räcker den inbyggda sökningen. Om den används: egen container,
  API-nyckel, inte exponerad.
- **Schemalagda jobb** (hämtning av källor, rensning av granskningskön, backup) körs i
  samma process med en enkel schemaläggare, eller som separata kommandon som cron
  anropar. Ingen ny tjänst för det.

## 4. Inställningar: två sorter

**Drift och hemligheter i `.env`.** Sätts vid installation av den som driftar. Kan
inte läsas eller ändras från webben.

```
AIBI_PORT=8086
AIBI_DATA_DIR=/data
AIBI_PUBLIK_URL=                    adressen stationerna använder
AIBI_TILLATNA_URSPRUNG=             tom = bara samma ursprung

AIBI_LLM_LAGE=strikt                strikt | formulerad
AIBI_LLM_LEVERANTOR=av              av | ollama | azure | openai
AIBI_LLM_BAS_URL=
AIBI_LLM_NYCKEL=
AIBI_LLM_MODELL=
AIBI_LLM_AZURE_API_VERSION=
AIBI_LLM_TIDSGRANS_S=20

AIBI_EMBED_LEVERANTOR=av            av | ollama | lokal | azure
AIBI_EMBED_MODELL=bge-m3
AIBI_OMRANKNING=av                  av | lokal

AIBI_STT=av                         av | whisper-lokal | azure
AIBI_STT_MODELL=small
AIBI_TTS=webblasare                 av | webblasare | server-lokal | azure

AIBI_ADMIN_TOKEN=                   krävs, tjänsten startar inte utan
AIBI_REDAKTOR_TOKEN=                rollen redaktör (fas 2)
AIBI_PERSONALKOD=                   krävs om personalnivån är påslagen
AIBI_SESSIONSHEMLIGHET=             för cookies
AIBI_GRANSKNING_DAGAR=30            längsta tid en obesvarad fråga sparas

AIBI_SMTP_VARD=
AIBI_SMTP_PORT=587
AIBI_SMTP_ANVANDARE=
AIBI_SMTP_LOSENORD=
AIBI_SMTP_FRAN=
AIBI_SYNPUNKT_TILL=                 funktionsbrevlådan

AIBI_LIBRIS=av                      av | pa (fas 9)
AIBI_LIBRIS_SIGEL=

AIBI_TLS_CERT=                      sökväg till certifikat, för mikrofonen (fas 10)
AIBI_TLS_NYCKEL=

QDRANT_URL=
QDRANT_API_KEY=
```

Namnen är förslag. Finns redan andra namn i koden (till exempel `BOSSE_ADMIN_TOKEN`,
`OLLAMA_MODEL`, `USE_DUMMY`), behåll dem som alias i en övergångsperiod och skriv
mappningen i `.env.example`.

**Innehåll i databasen, redigeras i adminpanelen.** Personalen äger det. Ändringar
loggas med tid och vem, och kan återställas.

- Bibliotek: namn, adress, telefon, e-post, öppettider per veckodag, avvikande dagar
  (helgdagar, lov), meröppettider, bemannade tider.
- Stationer: id, visningsnamn, vilket bibliotek, orientering om den är känd.
- Persona: namn, roll, tilltal, hälsning per språk, längsta svarslängd.
- Snabbfrågor per språk.
- Nekande: varianter av nekandetexten och hänvisningar per ämne (till exempel
  försörjningsstöd hänvisas till kommunens kontaktcenter).
- Röst: på eller av, volym, tysta timmar, uppläsning automatiskt eller vid tryck,
  hälsning vid närvaro och hur ofta.
- Synpunkter: på eller av, samtyckestext, kategorier.
- Enkät: på eller av, de två frågorna och svarsalternativen.
- Språk: lista med språk och om de är släppta.
- Återkoppling: på eller av, text som visas på skärmen.
- Kontakt: telefonnummer som visas när ingen personal finns eller tjänsten är nere.

`/api/config?station=<id>` lämnar ut den publika delen för en station, med
beräknade värden som `oppet_nu`, `bemannat_nu` och `nasta_bemannade`. Gränssnittet
räknar inte själv på öppettider om servern kan göra det.

## 5. Hur ett svar blir till

```
fråga ──► normalisera (max 300 tecken, trimma, språk)
      ──► krisord? ──ja──► fast krissvar (112 + personalen), loggas som nekad
      ──► routing till intent ──ingen──► följdfråga? ──nej──► NEKA
      ──► typfiltrerad sökning ──under tröskeln──► NEKA
      ──► grundsvar (deterministiskt) + kort + källor
      ──► läge strikt? ──ja──► skicka grundsvar
      ──► språkmodell formulerar om (persona, språk, längd)
      ──► grundningskontroll ──underkänd──► skicka grundsvar
      ──► skicka formulerat svar
NEKA  ──► nekandetext (variant) + hänvisning, aldrig via språkmodell
      ──► frågan till granskningskön (maskerad, se avsnitt 7)
```

**Grundsvaret är sanningen.** Det deterministiska svaret, korten och källorna bestäms
utan språkmodell. Språkmodellen får bara formulera om.

**Grundningskontrollen** körs på varje omformulerat svar innan det skickas. Det
underkänns om något av följande gäller:

- det innehåller en siffra, tid, datum, veckodag, pris, telefonnummer, e-postadress
  eller webbadress som inte finns i grundsvaret eller källtexten,
- det innehåller en boktitel, ett evenemangsnamn eller ett biblioteksnamn som inte
  finns i källorna,
- det är längre än personans gräns (standard tre meningar),
- det innehåller uppmaningar som inte finns i grundsvaret (till exempel "ring",
  "mejla", "klicka") utan motsvarighet i källan,
- språkmodellen svarade med fel eller tog för lång tid.

Underkännandet räknas i statistiken (grundning_underkand) och syns i driftrapporten.
Strömmade delar får inte visas innan kontrollen är klar. Strömma därför först när
kontrollen är gjord, eller strömma grundsvaret direkt och byt bara ut det om
omformuleringen godkänns innan besökaren hunnit läsa. Välj det enklaste som ger svar
inom latenskraven och skriv valet i STATUS.

**Språkmodellen ser aldrig** nekade frågor, interna dokument på publik nivå, tidigare
besökares frågor eller något utöver frågan, grundsvaret och källtexten.

**Följdfrågor**: klienten skickar `foregaende` (den tolkade frågan från förra svaret).
Servern lagrar inget sammanhang. Regeln om ordförrådet i `00-regler.md` gäller.

**Fallback**: kan språkmodellen inte nås används läge strikt automatiskt. `/api/health`
visar det, och statistiken räknar det.

## 6. API

Allt under `/api/`. JSON in och ut, utom chatten (SSE) och ljud. Befintliga anrop som
gränssnittet redan använder ska fungera hela vägen, eller ändras i samma pull request
som gränssnittet.

### Publikt (stationer, ingen inloggning)

| Anrop | Vad |
|---|---|
| `GET /api/health` | `{status, lage, leverantor, modell, version}`. `lage` är `formulerad`, `strikt`, `dummy` eller `offline`. |
| `GET /api/config?station=` | Publik konfiguration för stationen, se avsnitt 4. |
| `POST /api/chat` | SSE. In: `{message, sprak?, foregaende?, station?}`, sidhuvud `X-Session-Id` (slumpat i webbläsaren per samtal). |
| `POST /api/samtal/slut` | `{session_id, station, orsak}`. Orsak `vila`, `nytt` eller `enkat`. För statistikens samtalslängd. |
| `POST /api/stt` | Ljud in (webm/ogg), `{text, sprak}` ut. Ljudet sparas aldrig. |
| `POST /api/tts` | Bara om `AIBI_TTS` är `server-lokal` eller `azure`. Text in, ljud ut. |
| `POST /api/human` | `{station, session_id}`. Ut: `{message, bemannat, nasta_bemannade}`. |
| `POST /api/feedback` | `{session_id, message_idx, rating}`. Ingen text. |
| `POST /api/enkat` | `{station, svar_hjalp, svar_trygg}`. Ingen text, ingen session. |
| `POST /api/synpunkt` | `{station, text, kategori?, samtycke: true}`. Skickas med e-post. |
| `GET /api/aterkoppling` | Publicerad återkoppling om funktionen är på. |

SSE-händelserna i `/api/chat`, en JSON per `data:`-rad:

```
{"chunk": "text"}                      del av svaret, i ordning
{"kort": [...]}                        svarskort (bok, evenemang, öppettid, tjänst, bibliotek)
{"kallor": [{"id", "titel", "typ"}]}   källor, bara text
{"forslag": ["…", "…"]}                förslag på följdfrågor
{"meta": {"tolkad_fraga", "nekad", "typ", "uppfoljning", "lage"}}
{"session_id": "…"}
{"ersatt": "text"}                     bara om fas 3 väljer att strömma grundsvaret först
data: [DONE]
```

`GET /api/history` tas bort. Servern sparar inte samtal (vägval 18).

### Personal

| Anrop | Vad |
|---|---|
| `POST /api/personal/logga-in` | `{kod}`. Sätter en httpOnly-cookie (SameSite=Strict, 8 timmar). |
| `POST /api/personal/logga-ut` | Tar bort cookien. |
| `GET /api/personal/jag` | `{inloggad, niva}`. |

Personalskärmen använder samma `/api/chat`. Servern avgör nivån från cookien. Ett
`niva`-fält i anropet ignoreras.

### Admin

Inloggning med `AIBI_ADMIN_TOKEN` mot en sessionscookie. Sidhuvudet `X-Admin-Token`
får finnas kvar för skript. Två roller räcker: **redaktör** (innehåll, granskningskö,
statistik) och **admin** (allt, inklusive källor, import och röstavstängning). Om två
roller blir för mycket i piloten räcker en, men skriv det i STATUS.

Befintliga anrop i adminpanelen behålls: import, omindexering, källor, dokument,
konflikter, frågelogg, metrics, analys, importer, drift, katalog, att göra.

Nya:

| Anrop | Vad |
|---|---|
| `GET/PUT /api/admin/innehall/<del>` | Delarna i avsnitt 4. PUT loggas i ändringsloggen. |
| `GET /api/admin/andringslogg` | Vem, när, vad, med möjlighet att återställa. |
| `GET /api/admin/granskning` | Obesvarade frågor (maskerade). |
| `POST /api/admin/granskning/<id>/klar` | Raderar frågan. |
| `GET /api/admin/statistik` | Sammanställd statistik, filter på period och station. |
| `GET /api/admin/statistik.csv` | Samma som CSV. |
| `GET /api/admin/testfragor` | Testfrågorna. `PUT` lägger till egna. |
| `POST /api/admin/testfragor/kor` | Kör alla och returnerar resultat (krav Q5). |
| `POST /api/admin/rost/av` och `/pa` | Snabb av-knapp för ljudet på alla stationer. |
| `GET /api/admin/export` | Zip med innehåll, korpus och statistik (krav K4, E1). |

## 7. Integritet: vad som sparas, var och hur länge

| Uppgift | Var | Hur länge |
|---|---|---|
| Fråga som besvarades | bara i minnet under anropet | inte alls |
| Fråga som inte kunde besvaras | granskningskön, maskerad | tills personalen markerat klar, högst `AIBI_GRANSKNING_DAGAR` |
| Ljud från mikrofonen | minnet eller tempfil | raderas direkt efter tolkningen |
| Synpunkt | utkorgen tills e-posten gått iväg | raderas när den skickats, högst 7 dagar |
| Statistikhändelse | databasen | så länge projektet behöver, utan fritext |
| Driftlogg | loggfil | 30 dagar, utan fritext |
| Personalens frågor | som besökarnas | som besökarnas |

**Maskering** innan något sparas i granskningskön: personnummer, telefonnummer,
e-postadresser och långa sifferföljder ersätts med `[borttaget]`. Maskeringen har egna
tester.

**Statistikhändelser** innehåller bara: tidpunkt (timme), station, bibliotek,
meröppet eller bemannat, språk, typ av utfall (besvarad med typ, nekad, kris,
fallback, grundning underkänd), om röst användes, latens, om personalknappen,
synpunktsknappen eller enkäten användes, tumme upp eller ner, enkätsvar. Session-id
får användas för att räkna samtal men slumpas per samtal och kopplas aldrig till
något annat.

Frågeloggen i adminpanelen ("governance") behåller tid, typ, källor, modell,
promptversion och latens, men visar fritext bara för obesvarade frågor, från
granskningskön.

## 8. Gränssnittet

- **En medborgarskärm**: Bosse-vyn (`ui/index.html`) med svarskort och språkval från
  kioskvyn. Kioskvyn och landningssidan finns kvar bara som utvecklarverktyg eller tas
  bort efter Peters ok.
- **Kommunens grafiska profil**: Lato, Sjöbodigital #248187, logotypen nere till
  höger. Se `docs/GRAFISK-PROFIL.md`.
- **Kioskläge** (`?kiosk=1`): eget skärmtangentbord med å, ä och ö, ingen markering av
  text, ingen högerklicksmeny, ingen autofokus, vaktfunktion som laddar om sidan om den
  hängt sig.
- **Stående och liggande** skärmar från 27 till 55 tum, och mobil.
- **Tillgänglighet**: större text, kontrast, skärmläsare, tangentbord, WCAG 2.1 AA.
  Kontrolleras automatiskt med axe-core i gränssnittstesterna.
- **Personalskärm** bakom inloggning.
- **Adminpanel** med svenska formulär för allt innehåll, inga JSON-fält att skriva i.

## 9. Drift

- `docker compose up -d` startar allt utom Ollama.
- Hälsokontroll i Docker, omstart vid krasch, loggrotation.
- Nattlig backup av databasen och korpusen, sju dagar bakåt.
- Uppdatering: `git pull && docker compose up -d --build`, med testsviten som grind.
- Stationerna visar en vilosida om servern inte svarar, och laddar om sig själva när
  den kommer tillbaka.

## 10. Mätbara krav

| Krav | Mål |
|---|---|
| Recall@5 på testfrågorna | inte lägre än vid fas 0, och minst 0,95 |
| Nekade av dem som ska nekas | 100 procent |
| Rätt svar på frågor som ska besvaras (acceptanstest) | minst 95 procent |
| Påhittade fakta i svar | 0 |
| Svarstid, läge strikt, p95 på servern | under 500 ms |
| Svarstid, läge formulerad, p95 tills första text syns | under 4 s på Bosgame |
| Fem stationer, en fråga var tionde sekund, 30 minuter | inga fel, p95 inom målen |
| 24 timmars körning | inget minnesläckage, inga omstarter |
| Gränssnittstester och axe-core | alla gröna, inga allvarliga tillgänglighetsfel |
