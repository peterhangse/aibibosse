# Fas 2: Säkerhet och integritet

## Syfte

Efter den här fasen gör tjänsten det projektgruppen lovat i vägval 18 och 19: vanliga
samtal sparas inte, bara statistik utan text. Frågor som inte gick att besvara hamnar i
en maskerad granskningskö som töms. Personalnivån avgörs på servern. Adminpanelen går
inte att nå utan inloggning. Allt det här visas med automatiska tester, så att det går
att lämna till dataskyddsombudet.

Det är fasen som gör att en riktig besökare kan få stå framför skärmen.

## Förutsättningar

- Fas 1 är godkänd. Den samlade tjänsten kör på 8090 (eller 8086 om Peter sagt ok).
- `docs/INVENTERING.md` avsnittet "Avvikelser mot regler och målbild" listar vad som
  sparas i dag. Det är din arbetslista.
- Beslut 3 (personalskärmen) och 14 (lagringstid) har standardval som räcker.

## Uppgifter

### 2.1 Skriv integritetstesterna först

Innan du ändrar något: skriv testerna som visar att löftena hålls, kör dem och visa att
de faller där tjänsten bryter mot dem i dag. Samla dem i `backend/tests/integritet/`.

Det viktigaste testet är **spårtestet**. Det:

1. startar appen mot en tom databas
2. skickar ett antal frågor med unika påhittade markörer i texten, till exempel
   `"Har ni ZXQ4471-boken?"`, både sådana som besvaras och sådana som nekas, både
   publikt och som inloggad personal, med och utan `foregaende`, och en synpunkt
3. går igenom **alla tabeller i alla SQLite-filer** under `AIBI_DATA_DIR` och **alla
   filer** i datamappen och loggmappen
4. går igenom tjänstens loggutskrift från körningen
5. underkänns om en markör från en besvarad fråga finns någonstans, eller om en markör
   från en nekad fråga finns någon annanstans än i granskningskön, maskerad

Testet ska vara generellt: det letar i allt, så att en ny tabell som någon lägger till
senare också täcks.

### 2.2 Inga samtal sparas

- Ta bort `GET /api/history` och allt som skriver till den. I gränssnittet finns
  metoden `loadHistory()` i `ui/components/chat.js`, men den anropas inte (oktober
  2026). Ta bort metoden i samma pull request, och kontrollera med
  `grep -rn history ui/` att inget annat använder anropet.
- Frågeloggen ("governance", "query-log"): behåll tid, station, typ, intent, källornas
  id, modell, promptversion, latens och utfall. Ta bort fritext. Behövs fritext i
  adminpanelens frågelogg, hämta den från granskningskön, och då bara för obesvarade.
- Analysdatabasen och liknande: samma sak.
- Följdfrågor: servern lagrar inget sammanhang mellan anrop. Klienten skickar
  `foregaende` (se målbilden avsnitt 5). Finns en sessionsbuffert i minnet i dag, ta bort
  den eller gör den till en ren cache som inte överlever anropet.
- Tumme upp och ner sparar bara `{tid, station, typ, betyg}`.
- Gamla data: databaserna i `AIBI_DATA_DIR` innehåller troligen samtalstext från
  testperioden. Radera ingenting (regel B1). Skriv ett skript som visar hur många rader
  det gäller, och fråga Peter. Föreslå att tabellerna töms i den nya databasen efter
  att en tarball lagts i `~/aibi-backup/`, och att originalen ligger kvar orörda i de
  gamla kodbaserna tills Peter bestämt.

### 2.3 Statistik utan text

Ett schema för statistikhändelser enligt målbilden avsnitt 7, i en egen tabell, till
exempel `handelse(tid_timme, station, bibliotek, lage_oppet, sprak, utfall, typ, rost,
latens_ms, personalknapp, synpunkt, enkat_hjalp, enkat_trygg, betyg, samtal)`. Tiden
avrundas till hela timmar. `samtal` är ett slumpat id per samtal som inte kopplas till
något annat och som inte går att föra tillbaka till en person.

`lage_oppet` är `bemannat`, `meroppet` eller `stangt`, beräknat på servern i fas 3. Tills
dess: `okant`.

Skriv ett test som kontrollerar att tabellen inte har någon textkolumn som kan rymma
fritext (bara uppräknade värden och tal).

### 2.4 Granskningskön

- En tabell för obesvarade frågor: `{id, tid, station, sprak, maskerad_text, typ_av_nej,
  status}`.
- **Maskering** innan något skrivs: personnummer (med och utan sekel, med och utan
  bindestreck, samordningsnummer), telefonnummer (svenska format, med och utan
  landsnummer och mellanslag), e-postadresser, långa sifferföljder (sex siffror eller
  fler), och kortnummer som ser ut som kortnummer. Allt blir `[borttaget]`.
- Maskeringen har egna tester med minst 30 fall, både sådant som ska maskeras och
  sådant som inte ska det (årtal, ISBN i en boksökning, "öppet till 19"). ISBN är ett
  gränsfall: välj att maskera det i kön (det går inte att skilja säkert från andra
  sifferföljder) och skriv valet i testet. Exempel finns i `testfragor.md`.
- Rensningsjobb: raderar rader äldre än `AIBI_GRANSKNING_DAGAR`. Körs vid start och en
  gång per dygn. Test med fryst tid.
- `POST /api/admin/granskning/<id>/klar` raderar raden direkt.
- Krisfrågor (fas 3) läggs inte i kön alls. De räknas bara.

### 2.5 Personalnivån på servern

- `POST /api/personal/logga-in` med `{kod}` jämför mot `AIBI_PERSONALKOD` med en
  jämförelse som tar lika lång tid oavsett svar (`hmac.compare_digest`). Fel kod:
  fördröjning och räknare, låst i 15 minuter efter tio fel från samma adress.
- Cookien är httpOnly, `SameSite=Strict`, `Secure` när tjänsten körs över HTTPS,
  signerad med `AIBI_SESSIONSHEMLIGHET`, giltig åtta timmar.
- `/api/chat` avgör nivån från cookien. Fältet `niva` i anropet, sidhuvuden som
  `X-Niva`, frågeparametrar och allt annat från klienten ignoreras.
- `ui/personal.html` får en enkel inloggningsruta (siffror eller ord, stor text). Den
  visar en vänlig rad om koden var fel, inget mer. Utseendet får vara enkelt. Fas 4 gör
  det snyggt.
- Beslut 3: om Peter inte sagt annat finns personalnivån kvar bakom inloggning, men
  inga interna dokument läggs till. Det som redan finns i `korpus/intern/` kan ligga
  kvar.

Tester: anrop med `niva: "intern"` utan cookie ger bara publika källor. Anrop med
förfalskad cookie, utgången cookie och cookie signerad med fel hemlighet ger publik nivå.
Ett internt dokument med en unik markör får aldrig synas i ett publikt svar, inte i
källor, inte i kort och inte i förslag.

### 2.6 Adminpanelen

- Inloggning med `AIBI_ADMIN_TOKEN` mot en sessionscookie, som för personalen.
  `X-Admin-Token` finns kvar för skript. Ingen token i URL:en.
- Två roller (redaktör och admin) enligt målbilden avsnitt 6. Det räcker med två
  tokens i `.env` (`AIBI_ADMIN_TOKEN` och `AIBI_REDAKTOR_TOKEN`) i piloten. Riktiga
  konton är inte en del av uppdraget.
- Varje admin-anrop utan giltig session ger 401. Testa det automatiskt för **varje**
  route under `/api/admin/`, genom att lista routrarna från appen, så att en ny route
  inte kan glömmas.
- Skrivande anrop kräver att sidhuvudet `Origin` stämmer, som skydd mot CSRF.

### 2.7 Gränser och missbruk

- Frågor längre än 300 tecken kortas av på servern (gränssnittet gör det redan).
- Uppladdningar till import: storleksgräns, tillåtna filtyper, inga sökvägar i
  filnamnet.
- Ljud till `/api/stt`: högst 2 MB och 30 sekunder (används i fas 7).
- Hastighetsbegränsning per station och per adress på `/api/chat`, `/api/stt`,
  `/api/synpunkt` och inloggningen. Generös nog för en skärm där många ställer frågor i
  följd, till exempel 30 frågor per minut och station. Utan nytt beroende om det går.
- Tidsgräns på varje anrop till språkmodellen (finns i `.env`).

### 2.8 Prompt-injektion

Skriv `backend/tests/sakerhet/test_injektion.py` med frågorna i `testfragor.md`
(avsnittet om injektion) och fler. Testerna ska visa att:

- en fråga som försöker få tjänsten att strunta i reglerna antingen nekas eller får
  samma grundsvar som en vanlig fråga om samma sak
- systemprompten, promptversionen och interna dokument aldrig syns i ett svar
- text i ett dokument i korpusen som ser ut som en instruktion inte följs (lägg ett
  sådant dokument i testdatan)

Bygg dessutom en **ond låtsasmodell**: en adapter som alltid svarar med påhittade
öppettider, ett telefonnummer, en webbadress och en boktitel. Kör utvärderingen med den
i läge formulerad. Grundningskontrollen (fas 3) ska stoppa varje svar och falla tillbaka
på grundsvaret. Testet skrivs nu och får vara markerat som väntat fel tills fas 3.

### 2.9 Webbsäkerhet

- Säkerhetssidhuvuden på alla svar: `Content-Security-Policy` utan `unsafe-inline` för
  skript (flytta inline-skript i `ui/` till filer), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, `Permissions-Policy` som tillåter mikrofon bara för
  samma ursprung och stänger kamera och plats, `frame-ancestors 'none'`.
- XSS: ett test som lägger `<img src=x onerror=...>` och `<script>` i ett dokument,
  i en fråga och i en synpunkt, och kontrollerar i Playwright att inget körs. Svarstext
  ska alltid sättas som text, aldrig som HTML, utom det som `ui/components/chat.js`
  uttryckligen formaterar. Läs den koden och kontrollera att den escapar först.
- `pip-audit` på beroendena. Lägg det i `scripts/kontroll.sh` som en varning, inte ett
  stopp, och skriv fynden i STATUS.

### 2.10 Bosgame

Ta reda på, utan att ändra något:

- om Ollama (11434) och Qdrant (6333) går att nå från ett annat nät än maskinen själv
  (`ss -ltnp`, vilken adress de lyssnar på, brandväggens regler)
- om Qdrant har API-nyckel

Skriv fynden i STATUS. Behöver något ändras: visa kommandot och hur det backas, och
vänta på Peter (regel B3, B8).

### 2.11 Loggar

- Driftloggen innehåller aldrig frågans text, svaret, ljud eller synpunkter. Ett filter
  i loggningen som ersätter sådana fält, och ett test som kontrollerar loggen efter
  spårtestet.
- Uvicorns åtkomstlogg skriver URL:er. Kontrollera att ingen URL innehåller fritext (till
  exempel en GET med frågan som parameter).
- Loggrotation, 30 dagar.

### 2.12 Underlag för dataskyddsombudet

Skriv `docs/DATASKYDD.md` på svenska för någon som inte är tekniker:

- vad tjänsten gör, i fem meningar
- vilka uppgifter som behandlas, var och hur länge (tabellen i målbilden avsnitt 7,
  med de faktiska värdena)
- vad som inte behandlas (kamera, ansikten, identitet, samtalstext)
- maskeringen, med exempel
- vilka tester som visar det, och hur man kör dem
- vilka tredjeparter som är inblandade (inga i fas 0–10), och vad som ändras vid Azure
- frågor som behöver svar från dataskyddsombudet

Skriv det så att det kan bifogas utan att redigeras, men markera det tydligt som utkast
tills Peter läst det.

## Tester

- Spårtestet grönt.
- Maskeringstesterna gröna, minst 30 fall.
- Nivåtesterna gröna.
- Admin-401-testet grönt för alla routrar.
- Injektionstesterna gröna, utom den onda modellen som väntar på fas 3.
- XSS-testerna gröna i Playwright.
- Utvärderingen oförändrad mot baslinjen.

## Klart när

- [ ] Inget samtal sparas, visat med spårtestet.
- [ ] Granskningskön fungerar, maskerar och rensas.
- [ ] Personalnivån avgörs bara på servern.
- [ ] Adminpanelen kräver inloggning för allt.
- [ ] `docs/DATASKYDD.md` finns som utkast.
- [ ] Fynden om Ollama och Qdrant står i STATUS.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet.

## Grind

Stanna. Peter läser `docs/DATASKYDD.md` och granskningsunderlaget. Han bestämmer vad som
händer med gamla samtalsdata (2.2) och om något i Bosgames nät ska ändras (2.10).

## Fällor

- Det är lätt att missa en tabell, en loggfil eller en cache. Därför letar spårtestet i
  allt, inte i en lista.
- Uvicorn, FastAPI och undantag skriver ibland anropets innehåll i felloggen. Testa med
  ett anrop som orsakar ett fel.
- Maskering med en enda regex blir fel. Skriv en regel per sort och testa var för sig.
- En CSP utan `unsafe-inline` bryter gränssnittet om det finns inline-skript eller
  `onclick`-attribut. Kör gränssnittstesterna efter.
- Cookies med `Secure` fungerar inte över vanlig http på `localhost` i alla webbläsare.
  Sätt `Secure` efter inställning, inte alltid.
