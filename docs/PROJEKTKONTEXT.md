# Projektkontext: AI Bibliotek (Aibi), Sjöbo bibliotek

Den här filen finns för att en kodagent ska förstå varför projektet ser ut som det
gör. `CLAUDE.md` säger vad som gäller i vardagen, `docs/uppdrag/` säger vad som ska
byggas härnäst, och den här filen förklarar varifrån reglerna kommer.

Uppdaterad oktober 2026. Bygger på en tidigare version från september 2026 som låg i
`~/projekt/AiBibliotekarie/docs/PROJEKTKONTEXT.md` på utvecklingsmaskinen. Om de två
skiljer sig gäller den här, men lyft skillnaden för Peter.

Repot är publikt. Därför står här inga personnamn utöver utvecklaren, inga
leverantörsnamn, inga priser ur offerter, inga IP-adresser och inga interna dokument.
Lägg aldrig till sådant.

---

## 1. Vad projektet är

Sjöbo kommuns biblioteksverksamhet bygger en AI-värd som ska stå på pekskärmar i
biblioteken och svara besökare på frågor om biblioteket, även under meröppet när
ingen personal finns på plats. Projektet ägs av Kultur och fritid inom
familjeförvaltningen. Finansiering: kommunens utvecklingsmedel och en ansökan till
Region Skåne.

I kommunen heter tjänsten **Aibi**. I koden och i äldre material kallas den ofta
**Bosse** (fullt arbetsnamn SjöBo). Namnet ska kunna bytas i inställningarna utan
kodändring, eftersom projektgruppen äger namnfrågan (vägval 15).

Ansökan lovar tre saker med olika mognad:

- **Service och tillgänglighet.** Väldefinierat och genomförbart. Det är kärnan.
- **Medborgardialog.** Bär demokratiargumentet men är minst specificerat. Byggs som
  en separat synpunktsfunktion med samtycke.
- **Trygghet under meröppet.** Omdefinierat under förarbetet till att någon svarar
  när man är ensam i huset och att man vet hur man når personal.

Tekniskt är det som byggs en avgränsad frågebesvarare mot bibliotekets egen
information, plus en separat dialogfunktion.

## 2. Tidsplan, pengar och tid

| | |
|---|---|
| Projektstart | 17 augusti 2026 |
| Projektslut | 30 november 2027 |
| Region Skåne | 350 000 kr sökta, besked efter 11 november 2026 |
| Kommunens utvecklingsmedel | 420 000 kr, beslutade |
| Hårdvaruinköp | ska vara gjort i december 2026 |
| Implementering i biblioteksmiljö | projektmånad 10–12 |
| Utvärdering och spridning | projektmånad 12–14 |

KPI i ansökan: minst 200 interaktioner och 30 procents användning under meröppet
under implementeringsfasens första två månader. Nämnaren i procenttalet är inte
definierad. Under förarbetet ersattes måtten i praktiken av containment rate (andel
samtal som löstes utan personal), fallback rate och andel frågor som besvarades.
Statistiken måste därför kunna skilja meröppet från bemannad tid.

Utvecklaren, Peter, är kommunikatör och inte utbildad utvecklare. Han har fyra
timmar betald tid i veckan för projektet och bygger med Claude Code. Det styr allt:
lösningar som kräver kontinuerlig tillsyn är fel lösningar. Varje fas ska kunna
granskas av honom på en kvart.

## 3. Hårdvara och arkitektur

- **Fem stationer:** fyra i biblioteken och en i entrén till Kulturhuset. Vilka
  bibliotek är inte bekräftat i det här repot.
- **Stationerna är tunna klienter.** De visar en webbsida i kioskläge över nätverket.
  Ingen AI körs på stationen. Allt körs på en server.
- **Offertförfrågan gäller bara hårdvaran:** pekskärm, dator eller mediaspelare,
  stativ som går att höja och sänka, mikrofon, riktad högtalare, närvarosensor (PIR),
  installation och support. AI-tjänsten bygger kommunen själv.
- **Skärmstorleken är inte bestämd.** De offerter som kommit in spänner från 27 tum
  till 43–55 tum. Om skärmen står på höjden eller på bredden är inte heller bestämt.
  Gränssnittet ska fungera i båda.
- **Ingen kamera** på stationen, uttryckligen. Närvarosensorn får inte lagra eller
  räkna något.
- **Driftmodell:** biblioteksverksamheten äger lösningen och innehållet, kommunens
  IT-bolag Unikom driftar. Vad Unikom kräver för att ta över något som utvecklats
  internt är inte klarlagt. Det påverkar förpackningen, så bygg standardiserat:
  Docker, `.env`, dokumentation.

## 4. Strategin: MVP lokalt först, sedan moln

Peter har formulerat strategin själv: först bevisa hela kedjan med lokala modeller
på sin egen maskin (kallad Bosgame, en AMD Ryzen AI Max+ 395 med 128 GB delat minne,
Ubuntu). När det fungerar läggs tjänsten på en server och svarsmodellen byts mot
**Azure OpenAI med kommunens egen API-nyckel**. Kommunen står för kostnaden.

Följder för koden:

- Modellen måste vara utbytbar via inställningar. Ollama, Azure OpenAI och vanlig
  OpenAI-kompatibel tjänst ska fungera utan kodändring.
- Embeddings och omrankning är också modeller. Vad som flyttar till molnet och vad
  som stannar är inte avgjort (vägval 4 och dataskyddsombudets bedömning). Bygg inte
  in något som låser den frågan.
- Spridning till andra kommuner är ett uttalat mål. Tekniskt betyder det en
  Docker-image, en `docker-compose.yml`, en `.env.example` och ett kom-igång på en
  sida. Nycklar och motorval sätts i `.env` vid installation, aldrig i ett
  webbgränssnitt. Innehållet (namn, öppettider, hälsning, tilltal) sätts i
  adminpanelen.

Bosgame är Peters egen maskin och kör även hans andra projekt, bland annat ett
nattligt språkgranskningssystem (Nyhetsfabriken) som använder samma Ollama. Aibi får
inte störa det, och inget i det systemet får ändras inom det här uppdraget.

## 5. Vad förarbetet visade

**Förstudien** kom fram till att invånarna i första hand efterfrågar tillgänglighet,
information och service, inte AI som teknik. Nyttan bedömdes som tydligast i interna
processer. Rekommendationen var avgränsade tester. Personalen uttryckte oro för
beroende av kommersiella och utländska aktörer. Det förklarar varför lösningen är
medvetet liten och varför lokal drift och utbytbara motorer värderas högt.

**Studiebesök i Gävle och Stockholm** gav tre lärdomar:

- *Gävle:* en fysisk AI-enhet för en kvarts miljon gav opålitliga svar, hade dålig
  support och slutade inlåst i ett skåp. Köp inte hårdvara innan du vet vad den ska
  göra.
- *Nacka:* det som fungerade var mjukvara mot bibliotekets egna data. Störst nytta
  på webben, inte i lokalen. Det tog månader att få svaren tillräckligt bra.
  Begränsningen till egna data sågs som en fördel.
- *Kulturhuset Stockholm:* mest verkningsfullt var en medarbetare som byggde små
  verktyg själv. Medborgardialogen bestod av enkla omröstningar på skärm.

Sammantaget: bygg smått, lägg tiden på innehållet, lita inte på hårdvara.

En senare forskningsrapport om AI-projekt i offentlig sektor varnade för
"pilotkyrkogårdar" (piloter som aldrig tas i drift för att ingen tänkt på
förvaltningen från start) och för eldsjälsdrivna öar som hänger på en person.
Därför: kod i git, skriven driftinstruktion, fler än en som kan köra det.

## 6. Fattade vägval

De 21 vägvalen står i `docs/VAGVAL.md`, med alternativen och motiveringen. En
kodagent ska inte ifrågasätta dem utan att lyfta frågan till Peter. Kort:

- Trygghet = någon svarar, och man vet hur man når personal. Mäts med två frågor efter
  samtalet.
- Fem skärmar köps, en sätts upp i Sjöbo först.
- Molndrift i princip, men var språkmodellen körs är öppet.
- Närvarosensor väcker skärmen och får AI-värden att hälsa. Ren PIR, inget lagras.
- Text och röst. Volymkontroll, tysta timmar och av-knapp för personalen är krav.
- Personalen äger innehållet, utvecklaren tekniken.
- Version ett: öppettider och praktisk information. Katalogen kommer efter.
- Frågor utanför området: erkänn och hänvisa vidare i samma svar.
- Medborgardialog via egen knapp med samtyckesruta. Projektledaren läser månadsvis
  via funktionsbrevlåda. Kollektiv återkoppling till besökarna en till två gånger om
  året beslutades i den första versionen men ströks ur den slutliga listan. Bygg
  funktionen avstängd som standard och fråga Peter.
- Referensgruppen testar färdiga lösningar.
- Flera språk, men varje språk testas av någon som talar det innan det släpps.
- AI-värden säger i hälsningen att den är en AI.
- Biblioteksverksamheten äger, Unikom driftar.
- Från vanliga samtal sparas statistik utan text. Undantag: frågor som inte kunde
  besvaras loggas, gås igenom av personalen och raderas efter genomgång.
- Dataskyddsombudet ska kopplas in. Fyra frågor: var språkmodellen körs, hur
  synpunkter hanteras som allmänna handlingar, att sensorerna inte lagrar något, och
  vad som sparas och raderas.

## 7. Kravspecifikationen

Under hösten skrevs en kravspecifikation och en offertförfrågan. Hårdvarudelen gick
vidare. AI-tjänstens krav (del B) bygger kommunen nu själv, och de fungerar som
checklista för det här uppdraget. De viktigaste:

- F1–F3: svara bara ur kunskapsbasen, hitta aldrig på, neka med hänvisning.
- F4: säga att det är en AI. F5: personalknapp alltid synlig, med ärligt besked.
- F6: återställning vid inaktivitet. F7: visa källa. F8–F10: text, röst, volym,
  tysta timmar, av-knapp.
- F11: synpunkter i separat funktion med samtycke, till funktionsbrevlåda.
- F12: fler språk med test per språk. F13: följdfrågor som inte kringgår vägran.
- F14: väckning och hälsning via sensor. F15: två enkätfrågor. F16: namn, hälsning
  och tilltal ändras utan leverantör.
- K1–K7: personalen redigerar själv, ändring slår igenom på alla stationer,
  öppettider med avvikelser, export i öppet format, ändringslogg, evenemang
  försvinner efter sitt datum, utvalda webbsidor kan hämtas.
- Q1–Q5: automatiska tester mot fasta frågor, acceptanstest (förslag 95 procent rätt
  på frågor som ska besvaras och alla nekade av dem som ska nekas), varsel och
  återställning vid modellbyte, egna testfrågor, kommunen kan köra testerna själv.
- T1–T5: EN 301 549 och WCAG 2.1 AA, större text och kontrast, aldrig information
  bara i ljud, färg eller bild, lättläst svenska.
- D1–D10: personuppgiftsbiträdesavtal vid moln, behandling inom EU/EES, ingen
  träning på kommunens data, ingen fritext från vanliga samtal, synpunkter sparas
  inte i tjänsten, loggar utan fritext, kryptering, AI-förordningens artikel 50.
- L4: när tjänsten inte fungerar visar stationen det och hur man når personal.
- M1–M4: statistik utan personuppgifter eller fritext, per station och månad.
- E1–E3: export av allt vid avtalets slut, dokumenterat API.

## 8. Kodbaserna som finns, oktober 2026

Projektet har vuxit i flera steg, och alla delar ligger inte på samma ställe. Det
här är vad som är känt från samtalen. Fas 0 i uppdraget verifierar det.

1. **`~/bosse-mvp`** på Bosgame. Första prototypen: FastAPI, Ollama, enkel frontend,
   SSE-chatt på `/api/chat`, tumme upp och ner, personalknapp, analys i SQLite,
   adminsida med token, röst via Whisper och Piper (Piper underkändes som
   "värdelös"), personan i `config/bosse.yaml`. Importerar delar av
   AiBibliotekarie via `sys.path`.
2. **`~/projekt/AiBibliotekarie`** på Bosgame. Hjärnan: korpus i `data/*.json`,
   deterministisk hybrid-sökning (BM25, n-gram och valfri vektorfusion med RRF),
   intent-routing till spår (bok, tjänst, evenemang, öppettid, bibliotek), vägran
   som grundregel med relevanströskel 0,34, evenemang filtreras på datum,
   golden questions och `app.eval_run` (recall@5 omkring 0,95 i september), en egen
   kiosksida och `/api/v1/chat`. Tjänsten har körts som `aibi-8085.service`
   (systemd, användarnivå). Testsviten var 61 tester i slutet av september.
   Har en egen `CLAUDE.md` och `docs/PROJEKTKONTEXT.md`.
3. **Bosse på port 8086** ("giftermålet"). Server med SSE-chatt och grounding, som
   importerar AiBibliotekariens `ChatEngine` i processen. Adminpanelen i det här
   repot pratar med den: import av filer, katalogimport från BSKO-export,
   registrerade källor med automatisk hämtning, konflikter mellan källor, frågelogg,
   latens, driftrapport, grounding-andel, granskningsstatus och ägare per dokument,
   att göra-lista, nivåerna publik och intern. Var koden ligger är inte bekräftat.
4. **Open WebUI-spåret.** Ett försök i Fabrik-arbetet att köra Bosse som Open WebUI
   med Ollama, Qdrant och bge-m3 och 890 sidor från sjobo.se. Det var ett snabbspår
   för att prova RAG, inte produkten. Behåll det inte som grund.
5. **Det här repot, `peterhangse/aibibosse`.** Gränssnittet: Bosse för medborgare
   och personal, adminpanelen, kioskvyn och landningssidan, plus tester i `test/`.
   Se README för vad som ändrats i oktober.

Tre saker som redan kostat tid och som inte får upprepas:

- **Testsviten var grön medan svaren var fel.** Testerna använde en attrapp i stället
  för den riktiga sökmotorn, och "Hur länge får jag låna en bok?" besvarades med en
  romantitel. Testa genom riktig `Retriever` eller testa inget.
- **Frågor utanför biblioteket besvarades med en slumpmässig boktitel**, eftersom
  skyddet bara slog till vid noll träffar. Vägran är grundregel: svar ges bara när
  både en känd intent och ett dokument av rätt typ över tröskeln finns.
- **Kvadratisk sortering i sökningen** gav 590 ms per sökning vid 2 000 dokument.
  Sortera en gång per rankare, aldrig i en loop över dokument.

## 9. Katalogen

Biblioteken ingår i konsortiet Bibliotek SkåneSydost (BSKO) med Axiells system.
Axiell har sagt nej till API rakt in i systemet. Vägar som utretts, enklast först:
nattlig eller manuell export av bestånd (BSKO-import finns i adminpanelen), Libris
öppna API för bibliografiska data och bestånd per sigel, Z39.50 eller SRU som ofta
redan är påslaget, och Libris tjänst Lånestatus om den är konfigurerad. Oavsett väg
gäller: hitta aldrig på om en bok är inne. "Jag kan inte se om den är inne just nu"
är ett godtagbart svar.

## 10. Kunskapsbasen och sjobo.se

Slutsatsen var att inte skrapa hela sjobo.se. Det dränker rätt svar i brus och gör en
biblioteksassistent till en kommunövergripande myndighetsbot med ett ansvar ingen på
biblioteket kan bära. Peka i stället ut tio till tjugo sidor, hämta dem nattligt, kör
testsviten efteråt och behåll gårdagens version om resultatet blev sämre.
Sitevisions REST-API är att föredra framför skrapning. Öppettider ligger som egen
uppgift som personalen redigerar, inte som text från webben.

Personalen samlar de vanligaste frågorna i disken. Det är kunskapsbas, kravspec och
testmaterial i ett.

## 11. Andra AI-projekt i kommunen

Bibliotekspersonalen har en separat intern assistent i Microsoft Copilot Studio
("Kai") med rutiner och planer från SharePoint. Den är en annan produkt för en annan
målgrupp. Aibis personalnivå (interna dokument) ska inte konkurrera med den. Om
Aibis personalskärm ska finnas kvar är en fråga för Peter, se
`docs/uppdrag/beslut-peter.md`.

## 12. Bedömningsgrunder

När du väger två lösningar mot varandra:

- Rätt svar slår många svar. En assistent som alltid har rätt öppettid är mer värd än
  en som ibland tipsar om en bok biblioteket inte har.
- Att neka är ett bra svar. Ett ärligt nej med hänvisning till personalen är bättre än
  ett osäkert ja.
- Personalen ska kunna rätta innehåll utan utvecklaren. Kräver en rättad öppettid en
  kodändring är lösningen fel.
- Ingenting får hänga på en person.
- Enkelt nog att förklara för projektgruppen på två meningar.
- Det som andra kommuner ska kunna köra måste fungera utan Bosgame, utan Azure och
  utan Peter.
