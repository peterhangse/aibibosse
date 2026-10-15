# Fas 1: Samla kodbasen i det här repot

## Syfte

Efter den här fasen finns all kod för Aibi i ett repo, och en enda tjänst serverar både
gränssnittet och API:t. Tjänsten startar med `docker compose up -d` och kör parallellt
med de gamla på port 8090. Besökaren märker ingenting ännu. Allt som fungerar i dag ska
fungera likadant efteråt, mätt med samma tester och samma utvärdering.

Fasen bygger inget nytt beteende. Den flyttar, städar och sätter upp säkerhetsnätet
(tester, CI, hemlighetsskanning) som resten av uppdraget står på.

## Förutsättningar

- Fas 0 är godkänd. Peter har sagt ok till förslaget till sammanslagning i
  `docs/INVENTERING.md`. Följ det förslaget. Där den här filen och förslaget säger olika
  saker gäller förslaget.
- Beslut 17 (Firebase) och 20 (porten) har standardval som räcker.
- Backup från fas 0 finns. Ta en ny om något ändrats i de gamla kodbaserna sedan dess.

## Uppgifter

### 1.1 Gör iordning grenen och mappstrukturen

```bash
git checkout main && git pull
git checkout -b fas-01-samla-kodbasen
```

Skapa mapparna i `01-malbild.md` avsnitt 2 som inte finns: `backend/`, `exempeldata/`,
`deploy/kiosk/`, `deploy/drift/`. Lägg en kort `README.md` i varje som säger vad som ska
ligga där.

### 1.2 Kopiera in koden utan historik

Kopiera filerna från de gamla kodbaserna enligt förslaget, **aldrig** med `git subtree`,
`git merge --allow-unrelated-histories` eller liknande. Historiken följer inte med
(regel C5).

Använd `rsync` med en uttrycklig lista över vad som ska med, inte en lista över vad som
ska bort. Det är lättare att se vad som kom in:

```bash
rsync -av --files-from=/tmp/aibi-filer.txt ~/projekt/AiBibliotekarie/ backend/
```

Följ inte med: virtuella miljöer, `__pycache__`, `.env`, databaser, loggar, ljudfiler,
modellfiler, katalogexporter, interna dokument, zip-arkiv, backupfiler och sådant fas 0
pekade ut i hemlighetsskanningen.

Skriv i commit-meddelandet varifrån varje del kom (kodbas och commit-hash i det gamla
repot), så att det går att spåra utan att historiken finns här.

### 1.3 Data utanför repot

Flytta inte data in i repot. Skapa i stället datamappen på Bosgame enligt avsnitt 2 i
målbilden, till exempel `~/aibi-data/`, och **kopiera** dit (rör inte originalen):

- publikt innehåll till `korpus/publik/`
- internt innehåll till `korpus/intern/`, bara om fas 0 visade att det redan används
  och Peter inte sagt annat (beslut 3)
- katalogexporter till `katalog/`
- databaser till `db/`. Finns flera, slå inte ihop dem ännu. Skriv i STATUS vilka som
  finns och vad de innehåller.

`exempeldata/` i repot ska innehålla ett **påhittat** bibliotek ("Exempelby bibliotek")
med några få dokument av varje typ, så att testerna och andra kommuner kan köra utan
Sjöbos data. Hitta på allt i det, även adresser och telefonnummer, och använd sådant
som tydligt inte är verkligt (till exempel telefonnummer i Post- och telestyrelsens
serie för fiktiva nummer, 070-1740605 till 070-1740699, kontrollera serien på pts.se,
och adresser på en gata som inte finns i Sjöbo).

Om Peter vill: Sjöbos publika innehåll i `exempeldata/sjobo/`. Fråga först. Bara det
som redan står på sjobo.se eller bibliotekets publika sidor.

### 1.4 Ett Python-paket

- Ta bort alla `sys.path`-hack och relativa importer över kodbasgränser. Motorn,
  servern och admin-API:t ska importeras som moduler i samma paket.
- Paketnamnet får följa befintlig kod (`app/` eller annat). Byt inte namn på saker
  bara för att målbilden föreslår svenska namn. Det viktiga är att det finns ett paket.
- En `requirements.txt` (eller `pyproject.toml` med lås) med låsta versioner. Utgå
  från de versioner som kör i dag, så att beteendet inte ändras. Uppgradera ingenting
  i den här fasen.
- Python-version: den som kör i dag. Skriv den i `Dockerfile` och README.

### 1.5 En process som serverar allt

- FastAPI-appen monterar `ui/` som statiska filer på `/` och alla routrar under
  `/api/`.
- Gränssnittets anrop ska fungera mot den nya tjänsten utan ändringar i `ui/`. Där
  ett anrop byter namn: behåll det gamla namnet som alias och skriv det i README.
- CORS: ingen `*`. Samma ursprung räcker. `AIBI_TILLATNA_URSPRUNG` för undantag.
- Startar tjänsten utan `AIBI_ADMIN_TOKEN` ska den vägra starta och skriva varför.
  Saknas tokenen i den gamla tjänsten i dag, gör det här till en del av fasen.
- `/api/health` returnerar fälten i målbilden avsnitt 6. Gränssnittet räknar redan med
  `mode` eller `lage` (se `ui/components/input.js`). Skicka båda under en
  övergångsperiod.

### 1.6 Inställningar

- En modul läser alla inställningar från miljön, med pydantic-settings eller det som
  redan används.
- `.env.example` i roten med varje variabel i målbilden avsnitt 4, en kort förklaring
  per rad, inga värden. Gamla namn som finns i koden listas som alias med en
  kommentar om vilket nytt namn de motsvarar.
- `config/bosse.yaml` och liknande filer: det som är innehåll (persona, hälsning,
  snabbfrågor) ska flyttas till databasen i fas 5. Låt dem ligga kvar och läsas tills
  dess, men flytta filen till `AIBI_DATA_DIR` om den innehåller något Sjöbo-specifikt.

### 1.7 Docker

`Dockerfile`:

- en officiell `python:<version>-slim`-bild med låst version
- installera beroenden i ett eget steg så att cachen fungerar
- kör som en icke-root-användare
- `HEALTHCHECK` mot `/api/health`
- inga modeller i bilden. Whisper-modellen laddas ner till en volym första gången, i
  fas 7.

`docker-compose.yml`:

- tjänsten `aibi`, med `.env` som miljöfil, volym för `AIBI_DATA_DIR`, porten från
  `AIBI_PORT` bunden till `127.0.0.1` under utveckling
- `extra_hosts: ["host.docker.internal:host-gateway"]` så att Ollama på värden nås
- `restart: unless-stopped`
- loggrotation (`logging: driver: json-file, options: max-size, max-file`)
- Qdrant bara om fas 0 visade att den behövs, som en egen tjänst med API-nyckel, utan
  publicerad port

`.dockerignore` som utesluter `.git`, `test/ut`, `.env`, `__pycache__`, `.venv`.

Bygg och starta på 8090:

```bash
AIBI_PORT=8090 docker compose up -d --build
curl -s localhost:8090/api/health
```

Rör inte tjänsterna på 8085 och 8086 (regel B7).

### 1.8 Tester och utvärdering följer med

- Alla befintliga backendtester ska gå i den nya strukturen. De ska testa mot den
  riktiga sökmotorn (regel D1). Tester som bara går med de gamla `sys.path`-hacken
  skrivs om så att de importerar paketet, inget annat.
- Utvärderingen (`app.eval_run` eller motsvarande) ska gå att köra som ett kommando
  mot både `exempeldata/` och den riktiga korpusen i `AIBI_DATA_DIR`.
- Kör utvärderingen mot samma korpus i den gamla och den nya tjänsten. Siffrorna ska
  vara exakt lika. Är de inte det: hitta varför innan du går vidare.
- `test/kor.sh` (gränssnittstesterna) ska kunna köras mot den nya tjänsten, inte bara
  mot `test/mock_api.py`. Lägg till ett läge, till exempel `AIBI_TEST_URL=http://
  localhost:8090 bash test/kor.sh`. Mocken finns kvar för snabba körningar.

### 1.9 Ett kommando som kontrollerar allt

Skriv `scripts/kontroll.sh`. Det är kommandot som körs före varje push och vid varje
grind. Det ska:

1. köra backendtesterna (`pytest -q`)
2. köra utvärderingen i läge strikt mot `exempeldata/` och jämföra med en sparad
   baslinje (`backend/eval/baslinje.json`). Faller recall eller nekande: rött.
3. köra gränssnittstesterna (`bash test/kor.sh`)
4. köra hemlighetsskanningen (gitleaks) på arbetskopian och på de commits som inte
   finns på `main`
5. skriva en sammanfattning på svenska: antal gröna av totalt per del

Exit-kod 0 bara om allt är grönt.

### 1.10 GitHub Actions

`.github/workflows/tester.yml` som kör samma kontroll på varje pull request och push
till `main`, utan Sjöbos data (bara `exempeldata/`) och utan språkmodell (läge strikt).
Playwright behöver Chromium. Använd den officiella Playwright-bilden eller
`npx playwright install --with-deps chromium` i CI (inte på Bosgame, där finns den).

Låt Firebase-arbetsflödet vara (beslut 17).

### 1.11 Dokumentation

- `README.md`: hur man startar med Docker, hur man startar för utveckling utan Docker,
  var datan ligger, hur man kör kontrollen. Lägg en rad i ändringsloggen.
- `CLAUDE.md`: uppdatera kommandona (kontrollen, var backend ligger).
- `deploy/drift/` får en första `DRIFT.md` med bara start, stopp och loggar. Resten
  kommer i fas 12.

## Tester

- Alla befintliga backendtester gröna i nya repot.
- Utvärderingen ger samma siffror i den gamla och den nya tjänsten, mot samma korpus.
- Ett nytt test som startar appen och kontrollerar att `/` ger `index.html`, att
  `/api/health` svarar och att appen vägrar starta utan admintoken.
- Gränssnittstesterna gröna mot den nya tjänsten på 8090.
- Gitleaks hittar ingenting i grenen.
- CI går grönt på pull requesten.

## Klart när

- [ ] All kod som förslaget i fas 0 pekade ut finns i `backend/`, utan historik.
- [ ] `docker compose up -d` startar tjänsten på 8090, och `/` visar medborgarskärmen.
- [ ] `scripts/kontroll.sh` är grönt och CI är grönt.
- [ ] Utvärderingen ger samma recall och nekande som i fas 0, och baslinjen är sparad.
- [ ] Inga data, nycklar eller interna dokument i git (gitleaks och en manuell titt på
      `git diff --stat main`).
- [ ] De gamla tjänsterna på 8085 och 8086 kör orörda.
- [ ] README, CLAUDE.md och STATUS är uppdaterade, granskningsunderlaget skrivet.

## Grind

Stanna. Peter öppnar `http://localhost:8090/` på Bosgame (eller via sin vanliga väg till
maskinen), ställer tre frågor han brukar ställa och jämför med 8086. Han säger ok eller
pekar ut skillnader.

Efter ok: fråga Peter om de gamla tjänsterna ska stoppas och den nya ta över 8086 nu
eller senare (beslut 20). Gör det inte utan ett uttryckligt ja. Visa kommandona för att
byta och för att backa.

## Fällor

- Två kodbaser kan ha olika versioner av samma modul (till exempel två `ChatEngine`).
  Ta den som körs på 8086 i dag, inte den som ser nyast ut.
- Relativa sökvägar till datafiler (`../data/`) slutar fungera i containern. Allt ska
  gå via `AIBI_DATA_DIR`.
- SQLite i en Docker-volym: se till att containern äger filen, annars blir det
  skrivfel först när någon sparar något.
- `host.docker.internal` fungerar inte på Linux utan `extra_hosts`.
- Ollama lyssnar ofta bara på `127.0.0.1`. Då når containern den inte. Att ändra det
  är en ändring av Ollama-tjänsten (regel B3). Fråga, och föreslå hellre
  `network_mode: host` för utvecklingen om det räcker.
- En baslinje som sparas efter en ändring är ingen baslinje. Spara den från den gamla
  tjänsten först.
