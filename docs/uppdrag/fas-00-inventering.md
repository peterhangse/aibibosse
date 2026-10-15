# Fas 0: Inventering och säkerhetsnät

## Syfte

Ta reda på exakt vad som finns innan något ändras. Uppdraget är skrivet av någon som
inte sett backend-koden, och kodbaserna har vuxit på flera ställen. Den här fasen
ändrar ingenting i någon befintlig tjänst. Den tar backup, kartlägger, mäter och
föreslår en plan för sammanslagningen.

## Förutsättningar

- Du kör Claude Code på Bosgame med åtkomst till Peters hemkatalog.
- Det här repot är klonat på Bosgame, till exempel i `~/projekt/aibibosse`.
- Inget annat. Fasen kräver inga beslut.

## Uppgifter

### 0.1 Läs först

Läs dokumenten i läsordningen i `docs/uppdrag/README.md`. Läs också
`~/projekt/AiBibliotekarie/CLAUDE.md` och `~/projekt/AiBibliotekarie/docs/PROJEKTKONTEXT.md`
om de finns. Notera skillnader mot `docs/PROJEKTKONTEXT.md` i det här repot.

### 0.2 Kontrollera att det är lugnt på maskinen

```bash
date; uptime; free -h; df -h ~; ollama ps
```

Är klockan mellan 01 och 06, eller kör Ollama redan en stor modell, vänta med
mätningarna i 0.7 och gör resten.

### 0.3 Ta backup

Kontrollera först att det finns plats (`df -h ~`). Ta sedan en tarball av varje kodbas
och datamapp som hör till projektet, utan virtuella miljöer och cachar:

```bash
mkdir -p ~/aibi-backup/$(date +%Y%m%d)
tar --exclude=.venv --exclude=venv --exclude=__pycache__ --exclude=.pytest_cache \
    -czf ~/aibi-backup/$(date +%Y%m%d)/AiBibliotekarie.tar.gz -C ~/projekt AiBibliotekarie
```

Gör samma sak för `~/bosse-mvp` och för koden bakom port 8086 när du hittat den (0.4).
Ta med SQLite-filer och datamappar. Skriv i STATUS.md vad som säkerhetskopierades,
storlek och sökväg.

### 0.4 Hitta allt

Bygg en karta över vad som körs och var koden ligger. Förslag på kommandon:

```bash
ss -ltnp | grep -E ':(80|443|3000|6333|8000|8080|8085|8086|8090|11434)\b'
systemctl --user list-units --type=service --all | grep -iE 'aibi|bosse|bibl|webui|qdrant|ollama'
systemctl list-units --type=service --all | grep -iE 'aibi|bosse|bibl|webui|qdrant|ollama'
docker ps -a --format '{{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
ls ~/projekt
grep -rlE "8086|ChatEngine|bosse|aibi" ~/projekt ~/bosse-mvp --include=*.py --include=*.service --include=*.yml --include=*.yaml --include=*.toml 2>/dev/null | grep -v -E '/(\.venv|venv|node_modules)/'
```

För varje tjänst som hör till projektet: vilken process, vilken katalog, vilket
kommando som startar den (`systemctl --user cat <namn>`), vilken port, vilken
Python-miljö.

Hittar du koden bakom 8086: ta backup av den också innan du läser vidare.

### 0.5 Beskriv varje kodbas

För `~/projekt/AiBibliotekarie`, `~/bosse-mvp`, koden bakom 8086 och Open WebUI-spåret
om det finns kvar:

- `git status`, `git log --oneline | head -30`, om det finns en fjärr (`git remote -v`)
- filträd utan beroenden, och antal rader per språk
- startpunkt, ramverk, Python-version, beroenden och deras versioner
- alla endpoints. Hämta `openapi.json` från tjänster som kör
  (`curl -s localhost:8086/openapi.json | python3 -m json.tool`), och läs routrarna
  för dem som inte kör.
- miljövariabler och konfigurationsfiler som läses
- datafiler: format, antal poster per typ, om de är publika eller interna
- databaser: `sqlite3 <fil> .schema` och antal rader per tabell. **Visa inget
  innehåll** ur tabeller som kan innehålla besökarnas text, bara kolumnnamn och antal.
- modeller som används (svarsmodell, embeddings, omrankning, tal) och hur de anropas
- tester: hur de körs, hur många, om de går igenom i dag
- hur kopplingen mellan delarna ser ut (till exempel `sys.path`-importer)

Kör befintliga tester. De får skriva cachar men inget annat.

### 0.6 Leta efter hemligheter och personuppgifter

Kör en skanning i de gamla kodbaserna och deras git-historik, till exempel med
gitleaks i Docker eller `detect-secrets`. **Skriv aldrig ut själva värdena**, bara fil,
rad och typ. Leta också efter:

- `.env`-filer, nycklar och token i kod eller konfiguration
- interna dokument (nivå intern) i datamappar
- loggar, databaser eller exportfiler med besökares frågor
- IP-adresser och värdnamn

Resultatet avgör vad som får flyttas till det publika repot i fas 1.

### 0.7 Mät utgångsläget

Utanför 01–06 och när maskinen inte är belastad:

- Antal tester och hur många som går igenom, per kodbas.
- `app.eval_run` (eller motsvarande): recall@5, andel nekade av dem som ska nekas.
- Latens: skicka de 30 första testfrågorna i `docs/uppdrag/testfragor.md` till
  tjänsten på 8086, en i taget, i det läge den kör nu. Mät tid till första
  SSE-händelse och till `[DONE]`. Ange p50 och p95.
- Minnesanvändning för tjänsterna (`ps -o rss,cmd`).
- Vilket läge svarsmodellen kör i, och vilken modell.

Skriv siffrorna i mätvärdestabellen i STATUS.md.

### 0.8 Jämför med målbilden och reglerna

Gå igenom `01-malbild.md` och `00-regler.md` punkt för punkt och avgör för varje:
finns, finns delvis, saknas, eller strider mot regeln. Leta särskilt efter:

- om servern sparar samtalstext (till exempel bakom `/api/history`, frågeloggen,
  analysdatabasen)
- om `niva` från klienten styr vad som söks
- om adminpanelen kan köras utan token
- om Ollama eller Qdrant går att nå från nätverket, och om Qdrant har API-nyckel
- om nekade svar någonsin går via språkmodellen
- om det finns en grundningskontroll, och vad den gör ("andel naiva" i driftrapporten)
- om följdfrågor (`foregaende`, `tolkad_fraga`) är byggda
- hur `/api/human` meddelar personalen, om alls
- vad röstdelen gör och vilka modeller den använder

### 0.9 Föreslå sammanslagningen

Skriv ett förslag på hur koden ska samlas i det här repot enligt `01-malbild.md`:

- vilken kodbas som är grund för vad (motor, server, admin-API, röst)
- vad som flyttas, vad som skrivs om och vad som lämnas i arkivet, med skäl
- vilka datafiler som får ligga i repot (publika) och vilka som ska ligga i
  `AIBI_DATA_DIR`
- hur de befintliga testerna följer med
- vilka endpoints som behåller sina namn och vilka som byter, och vad det betyder för
  gränssnittet
- risker, och i vilken ordning stegen i fas 1 bör göras

### 0.10 Skriv inventeringen

Skriv `docs/INVENTERING.md` med rubrikerna:

```
# Inventering, <datum>
## Sammanfattning (högst tio rader)
## Tjänster och portar
## Kodbaserna
## Endpoints
## Data och databaser
## Modeller
## Tester och mätvärden
## Avvikelser mot regler och målbild
## Förslag till sammanslagning
## Frågor till Peter
```

Repot är publikt. I inventeringen får inte stå: IP-adresser, nycklar, token,
användarnamn och lösenord, titlar eller innehåll ur interna dokument, eller besökares
frågor. Skriv antal, inte innehåll.

## Tester

Inga nya tester i den här fasen. Befintliga tester körs och resultatet redovisas.

## Klart när

- [ ] Backup finns för alla kodbaser och datamappar, och sökvägarna står i STATUS.md.
- [ ] `docs/INVENTERING.md` finns med alla rubriker ifyllda.
- [ ] Mätvärdestabellen i STATUS.md har en första rad.
- [ ] Ingen befintlig tjänst, fil eller inställning har ändrats (förutom backup och
      cachar från testkörningar). Bekräfta med `git status` i varje gammal kodbas.
- [ ] Granskningsunderlaget `docs/uppdrag/granskning/fas-00.md` är skrivet.

## Grind

Stanna. Peter läser sammanfattningen och förslaget till sammanslagning och säger ok,
eller rättar. Fas 1 får inte börja förrän förslaget är godkänt.

## Fällor

- Det kan finnas fler versioner av samma fil på olika ställen, och den som kör är inte
  alltid den senaste i git. Kontrollera vilken katalog processen faktiskt kör från
  (`ls -l /proc/<pid>/cwd`).
- Open WebUI-spåret var ett experiment. Låt det inte styra målbilden.
- Det finns många backupfiler och zip-arkiv i hemkatalogen. Läs dem inte som källa om
  det finns ett git-repo med samma innehåll.
