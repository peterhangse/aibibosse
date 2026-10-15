# Fas 11: Redo för Azure

## Syfte

Efter den här fasen är bytet från Ollama på Bosgame till Azure OpenAI med kommunens egen
nyckel en ändring i `.env`. Det är testat mot en låtsasserver som beter sig som Azure,
inte mot Azure. Peter har en kostnadsuppskattning, en checklista för upphandling,
dataskydd och drift, och en plan för att byta och för att backa.

Ingenting skickas till Azure i den här fasen. Det första riktiga anropet görs först efter
Peters uttryckliga ok (beslut 19).

## Förutsättningar

- Fas 3 är godkänd (adaptern finns).
- Fas 10 bör vara klar, så att mätvärdena från Bosgame finns att jämföra med.
- Läs `docs/PROJEKTKONTEXT.md` om hur kommunen tänkt kring Azure och kostnader.

## Uppgifter

### 11.1 Azure i adaptern

- `AIBI_LLM_LEVERANTOR=azure` med `AIBI_LLM_BAS_URL` (resursens adress),
  `AIBI_LLM_NYCKEL`, `AIBI_LLM_MODELL` (namnet på driftsättningen, "deployment") och
  `AIBI_LLM_AZURE_API_VERSION`.
- Kontrollera i Microsofts aktuella dokumentation hur anropet ser ut (sökväg,
  `api-key`-sidhuvud eller Entra ID, vilken API-version som gäller) och skriv länken
  och datumet i koden. Azure har bytt sätt att adressera modeller över tid, så gissa
  inte från minnet.
- Felhantering för det Azure gör och Ollama inte gör: 429 med `retry-after`, innehåll
  som stoppats av innehållsfiltret (svar med `content_filter`), och kvot slut. Alla
  ger läge strikt för den frågan, räknas i statistiken med eget skäl, och syns i
  driftrapporten.
- Nyckeln loggas aldrig, inte ens delvis. Test som kontrollerar loggen.

### 11.2 Låtsasserver

Skriv en låtsasserver (`backend/tests/azure_atrapp.py` eller liknande) som svarar som
Azure OpenAI: samma sökväg, samma sidhuvuden, samma JSON, med strömning. Den ska kunna
ställas in att:

- svara normalt
- svara långsamt
- svara 429 med `retry-after`
- svara med innehållsfilter
- svara 401 (fel nyckel)
- inte svara alls

Kör hela utvärderingen och lasttestet mot den, med adaptern i läge `azure`.
Grundningskontrollen och nekandet ska bete sig exakt som mot Ollama. Kontrakttestet
ska gå i CI.

Bygg låtsasservern utifrån Microsofts dokumenterade format, inte utifrån vad adaptern
skickar, annars testar den bara sig själv. Spara ett exempel på ett riktigt svar från
dokumentationen som testdata.

### 11.3 Embeddings och tal

- Embeddings kan stanna lokalt (beslut 19). Om `AIBI_EMBED_LEVERANTOR=azure`: samma sätt,
  samma låtsasserver. Byte av embeddingsmodell kräver omindexering och ny utvärdering.
  Skriv det i checklistan.
- Azure Speech för tal till text och text till tal: fyll i stubbarna från fas 7 med
  rätt anrop, testat mot en låtsasserver. Avstängt som standard. Ljud till ett moln är
  ett större dataskyddsbeslut än text. Skriv det.

### 11.4 Vad som skickas

Gå igenom exakt vad som lämnar servern i läge `azure`, och skriv det i
`docs/DATASKYDD.md`:

- besökarens fråga (efter maskeringen? Bestäm om maskeringen från fas 2 ska köras
  också på frågor som skickas till modellen, och testa)
- grundsvaret och källtexterna
- personan och prompten
- inget om stationen, sessionen eller tidigare frågor

Och vad som inte skickas: nekade frågor, krisfrågor, ljud (om tal stannar lokalt),
interna dokument på publik nivå.

### 11.5 Kostnadsuppskattning

Skriv `scripts/kostnad.py` som räknar ut en uppskattning per månad från:

- antal frågor per dag (från statistiken under piloten, eller ett antagande)
- andel som går till modellen (besvarade, inte nekade)
- genomsnittligt antal token in och ut per fråga, mätt under utvärderingen
- pris per token in och ut, som Peter skriver in från Microsofts prislista för vald
  modell och region. Skriptet innehåller inga priser, eftersom de ändras.

Utskrift: kostnad per månad vid låg, normal och hög användning, och vid fem stationer.
Peter ska kunna lägga siffran i en budget.

### 11.6 Checklista

Skriv `deploy/drift/AZURE.md` som en checklista för Peter, Unikom och
dataskyddsombudet. Varje punkt ska gå att bocka av:

- Azure-resursen ligger i Sverige eller EU-region, och vald modell finns i regionen
  (kontrollera Microsofts lista vid tillfället)
- avtal: kommunens Microsoft-avtal, personuppgiftsbiträdesavtal, och vad det säger om
  lagring och användning av data
- inställningar för innehållsfilter och missbruksövervakning: vad som är standard och om
  kommunen behöver ansöka om undantag. Kontrollera vad som gäller vid tillfället.
- nyckeln i Key Vault eller i `.env` på servern, vem som har tillgång, hur den byts
- utgiftstak och budgetlarm i Azure
- dataskyddsombudets bedömning, med `docs/DATASKYDD.md` som underlag
- utvärderingen körd mot Azure (första riktiga anropen) och jämförd med Bosgame
- bytet: ändring i `.env`, `docker compose up -d`, kontroll med `/api/health` och
  testfrågorna i adminpanelen
- att backa: ändra tillbaka i `.env`. Läge strikt fungerar alltid som reserv.

### 11.7 Första riktiga anropet

Bara när Peter uttryckligen sagt ok, och när checklistans punkter för avtal och
dataskydd är avbockade. Då: kör utvärderingen mot Azure med testfrågorna (inte
besökares frågor), jämför med Bosgame, och skriv resultatet i STATUS. Det kan ligga
utanför den här fasen.

## Tester

- Kontrakttest mot låtsasservern i alla lägen i 11.2.
- Utvärderingen och lasttestet mot låtsasservern.
- Nyckeln syns aldrig i loggen eller i `/api/health`.
- Kostnadsskriptet med påhittade priser.

## Klart när

- [ ] Bytet till Azure är en ändring i `.env`, testat mot låtsasservern.
- [ ] `deploy/drift/AZURE.md` och kostnadsskriptet finns.
- [ ] `docs/DATASKYDD.md` beskriver vad som skickas.
- [ ] Inget har skickats till Azure.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet.

## Grind

Stanna. Peter har underlaget för beslutet om Azure. Han tar det vidare i kommunen.

## Fällor

- Azure OpenAI och OpenAI har nästan samma API men inte exakt. Sökvägen, sidhuvudet
  för nyckeln och modellnamnet skiljer sig. Testa båda i låtsasservern om
  `AIBI_LLM_LEVERANTOR=openai` ska stödjas.
- En större modell i Azure kan formulera friare än den lilla lokala. Grundningskontrollen
  kan underkänna fler svar. Mät, ändra inte kontrollen.
- Innehållsfiltret kan stoppa ofarliga frågor om till exempel böcker om krig eller
  kroppen. Lägg sådana i utvärderingen.
- Token räknas olika för svenska och engelska. Mät på svenska.
