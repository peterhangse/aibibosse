# Regler för uppdraget

Läs hela den här filen innan du gör något. Reglerna gäller i varje fas, och de går före
allt annat i uppdraget. Krockar en uppgift med en regel, gör inte uppgiften. Stanna och
fråga Peter.

## A. Produktregler som aldrig får brytas

1. **Svara bara ur kunskapsbasen.** Aldrig ur språkmodellens eget minne eller från
   webben i stunden.
2. **Hitta aldrig på** öppettider, datum, tider, priser, regler, telefonnummer,
   adresser, boktitlar eller om en bok är inne. Saknas uppgiften ska svaret säga det.
3. **Neka är grundregeln.** Svar ges bara när både en känd avsikt (intent) och ett
   dokument av rätt typ över relevanströskeln finns. Ingen uppsamlingsregel som låter
   en fråga besvaras av det dokument som råkade ranka högst.
4. **Nekade svar går aldrig till en språkmodell.** Den skulle göra ett ärligt nej till
   ett vänligt kanske. Nekandet formuleras med färdiga texter, i flera varianter, och
   hänvisar alltid vidare (personal, disken eller webbplatsen).
5. **Språkmodellen får bara formulera om ett svar som redan är grundat.** Efter varje
   omformulering kontrolleras svaret mot källan (se `01-malbild.md`, avsnitt 5). Klarar
   det inte kontrollen visas det deterministiska svaret i stället.
6. **Följdfrågor får aldrig bli en väg runt nekandet.** En följdfråga ärver bara
   sammanhang om varje innehållsord finns i kunskapsbasens ordförråd eller är en
   veckodag.
7. **Hälsningen säger att det är en AI** (AI-förordningen artikel 50, vägval 14).
8. **Skärmen återställs helt vid inaktivitet.** Nästa besökare får aldrig se eller ärva
   något från den förra: inte samtal, inte sammanhang, inte inspelning, inte språkval,
   inte textstorlek.
9. **Personalknappen lovar aldrig mer än bemanningen tillåter** (vägval 1).
10. **Från vanliga samtal sparas statistik utan text** (vägval 18). Undantaget är
    frågor som inte kunde besvaras: de sparas i en granskningskö, gås igenom av
    personalen och raderas efter genomgång eller senast efter inställd tid.
11. **Synpunkter skickas till kommunens funktionsbrevlåda och sparas inte i tjänsten**
    efter att de skickats.
12. **Ingen kamera, ingen räkning av besökare, ingen identifiering.** Närvarosensorn
    väcker skärmen och ingenting annat sparas.
13. **Källor är bara text.** Inga länkar, QR-koder eller kopiering i källorna. Svaret
    ska räcka i samtalet. Peter tog bort en QR-funktion av just det skälet.
14. **Personalens innehåll är personalens.** Formatet ska gå att redigera i
    adminpanelen utan kodkunskap. Flytta aldrig innehåll in i kod.
15. **Namnet hämtas från inställningarna**, aldrig hårdkodat. I kommunen heter tjänsten
    Aibi, i koden ofta Bosse.
16. **Tillgänglighet är ett krav.** WCAG 2.1 AA och EN 301 549. Information ges aldrig
    bara med ljud, färg eller bild.
17. **Nivå (publik eller intern) avgörs på servern**, aldrig av vad webbläsaren
    skickar.
18. **Motorer och nycklar sätts i `.env`**, aldrig i ett webbgränssnitt. Innehåll sätts
    i adminpanelen.

## B. Säkerhet på utvecklingsmaskinen (Bosgame)

Bosgame är Peters egen maskin och kör även andra projekt, bland annat Nyhetsfabriken
med nattliga körningar mellan ungefär 01 och 06. Han vill inte att något tas bort eller
ändras utan att han bett om det.

1. **Ta aldrig bort filer, mappar, containrar, modeller, tjänster eller databaser.**
   Ska något bort: flytta det till en mapp som heter `_arkiv/` bredvid, och bara efter
   Peters ok. Det gäller även gamla kodbaser efter sammanslagningen.
2. **Rör inte Nyhetsfabriken**, Fabrik, språkgranskningen, deras tjänster, databaser,
   cron- eller systemd-jobb. Läs gärna, ändra aldrig.
3. **Ändra inte Ollama-tjänsten, Docker-inställningar, brandväggen eller systemd för
   andra tjänster** utan Peters ok. Visa kommandot och hur det backas först, och vänta.
4. **Hämta inga nya modeller större än 5 GB** utan Peters ok, och kör aldrig
   `ollama rm`.
5. **En tung modellkörning i taget.** Kör inga stora utvärderingar eller
   indexeringar mellan 01 och 06 utan att fråga. Kontrollera med `ollama ps` och
   `nvidia-smi`/`rocm-smi` eller `free -h` att maskinen inte redan är belastad.
6. **Ta backup innan du ändrar något som inte ligger i git**: tarball med datum i
   namnet under `~/aibi-backup/`.
7. **Starta, stoppa eller byt port på levande tjänster först efter Peters ok.** Det
   gäller särskilt tjänsterna på 8085 och 8086 och allt som en testskärm kan vara
   kopplad till.
8. **Exponera inga portar mot internet.** Ollama (11434) och Qdrant (6333) ska bara
   nås från maskinen själv eller från Docker-nätet. Qdrant ska ha API-nyckel.

## C. Git och GitHub

Repot `peterhangse/aibibosse` är **publikt**.

1. **En gren per fas** (`fas-01-samla-kodbasen` och så vidare), en pull request per fas.
   Mergea aldrig själv till `main` utan att Peter sagt ok i samma session.
2. **Committa ofta**, ett fungerande steg i taget, med meddelanden på svenska.
3. **Skriv aldrig om historiken på `main`** och använd aldrig `--force` mot `main`.
4. **Inget hemligt i git, någonsin:** inga nycklar, token, lösenord, `.env`-filer,
   IP-adresser till Bosgame, interna dokument (nivå intern), katalogexporter,
   databaser, loggar, ljudfiler eller riktiga frågor från besökare. Kör
   hemlighetsskanningen (fas 1) före varje push.
5. **Gamla kodbaser flyttas in utan sin git-historik.** Historiken kan innehålla saker
   som inte får bli publika. Gamla repon ligger kvar orörda på Bosgame som arkiv.
6. Arbetsflödet för Firebase-deploy faller vid varje push till `main` tills nyckeln är
   rättad. Det är känt och inget du ska laga utan Peters beslut.

## D. Kvalitet

1. **Testa genom den riktiga sökmotorn.** Tester med attrapp-retriever bevisar ingenting
   om träffsäkerhet.
2. **Skriv testet först** för varje beteende som rör svar, nekande, integritet eller
   säkerhet. Visa att det faller, bygg, visa att det går igenom.
3. **Kör hela testsviten efter varje ändring**: backendtester, utvärderingen av
   testfrågorna och gränssnittstesterna (`bash test/kor.sh`). Allt ska gå igenom.
4. **Recall och nekande får aldrig bli sämre.** Rör du sökning, routing eller
   tröskeln: kör utvärderingen före och efter och visa båda siffrorna.
5. **Tröskeln 0,34** är satt mot mätning. Ändras den, mät om mot både testfrågorna och
   nekandefallen.
6. **Påstå aldrig att något fungerar utan att ha kört kommandot** i samma arbetspass
   och visat utskriften.
7. **Titta på gränssnittet** med skärmdumpar i stående, liggande och mobil innan du
   säger att en ändring i `ui/` är klar.

## E. Hur du pratar med Peter

1. Skriv på svenska och i klartext. Peter är kommunikatör, inte utvecklare.
2. Förklara vad en ändring gör för besökaren eller personalen, inte bara vad koden gör.
3. När Peter ska köra något: ge kommandot färdigt att kopiera, ett i taget, och säg
   vad han ska se.
4. Fråga hellre en gång för mycket än gissa i det som rör innehåll, integritet,
   pengar eller sådant andra ser.
5. Föreslå hellre en liten ändring som går att förstå än en stor som går fort.

## F. När du ska stanna och fråga

Stanna, beskriv läget kort och vänta på Peter när:

- en fas är klar (se grinden i fasfilen),
- ett beslut i `beslut-peter.md` behövs och standardvalet inte räcker,
- du behöver göra något i avsnitt B som kräver ok,
- testerna inte går att få gröna utan att ändra ett befintligt test,
- verkligheten på maskinen skiljer sig från det uppdraget antar på ett sätt som
  ändrar planen,
- du hittar personuppgifter, nycklar eller interna dokument på ett ställe där de inte
  borde vara.

## G. Förbjudet

- Bygga om något som redan finns och fungerar utan att först visa varför.
- Lägga till ett nytt ramverk, en ny databas eller en ny tjänst när det befintliga
  räcker.
- Skicka besökares frågor eller ljud till en extern tjänst i fas 0–10. Alla motorer
  är lokala tills Azure-steget i fas 11, och det steget kräver Peters uttryckliga ok.
- Lägga in spårning, analysverktyg från tredje part, externa typsnitt eller CDN-länkar
  i gränssnittet.
- Klona en riktig persons röst.
