# Vägval för AI-bibliotekarien

Projektgruppens beslut från förarbetet hösten 2026, i den version som togs fram som
underlag till projektgruppen (19 vägval). Texten nedan är dokumentets egen, med
alternativen som övervägdes och det valda markerat med ✅.

En kodagent ska följa vägvalen och inte ifrågasätta dem utan att lyfta frågan till
Peter. Ser du att ett vägval krockar med något i uppdraget, stanna och fråga.

## Två numreringar

Vägvalen fanns först i en version med 21 punkter. Kravspecifikationen hänvisar till
den äldre numreringen med [V1]–[V21]. Två punkter ströks i den slutliga versionen:
återkopplingen till besökare (gamla V12) och "Vad frågar vi referensgruppen först"
(gamla V14). I det här repot används den nya numreringen 1–19.

| Ny | Ämne | Gammal (kravspec) |
|---|---|---|
| 1 | Vad trygghet betyder | V1 |
| 2 | Hur trygghet mäts | V2 |
| 3 | Antal skärmar | V3 |
| 4 | Var tjänsten körs | V4 |
| 5 | Rörelsedetektorerna | V5 |
| 6 | Röst | V6 |
| 7 | Vem bygger kunskapsbasen | V7 |
| 8 | Omfattning i version ett | V8 |
| 9 | Frågor utanför området | V9 |
| 10 | Hur dialogen startas | V10 |
| 11 | Vem läser synpunkterna | V11 |
| — | Återkoppling till besökare (struken) | V12 |
| 12 | Vad referensgruppen påverkar | V13 |
| — | Vad referensgruppen tillfrågas om först (struken) | V14 |
| 13 | Tolkstöd och flera språk | V15 |
| 14 | AI i hälsningen | V16 |
| 15 | Vem bestämmer namnet | V17 |
| 16 | Peters roll | V18 |
| 17 | Vem äger lösningen | V19 |
| 18 | Vad som sparas från vanliga samtal | V20 |
| 19 | Dataskyddsombudet | V21 |

---

Under förarbetet har ett antal frågor behövt besvaras innan vi går vidare med inköp
och utveckling. Nedan står varje fråga med de alternativ som övervägts, och det
alternativ vi landat i markerat. Motiveringen står i kursiv text under alternativen.

## Trygghet (1–2)

Ansökan lovar att AI-agenten ska bidra till ökad upplevd trygghet under meröppet.
Trygghet är svårt att definiera och ännu svårare att mäta, så vi har behövt bestämma
vad vi konkret menar och hur vi ska följa upp det.

**1. Vad menar vi med trygghet i projektet?**
a) Att någon svarar när man är ensam i huset ✅
b) Att man hittar rätt och vet vad som gäller
**c) Att man vet hur man når personal vid behov** ✅
d) Vi tar bort trygghet som eget mål

*a och c hänger ihop: Bosse ska både finnas där och kunna slussa vidare. Det ger något
konkret att bygga, till skillnad från trygghet som en allmän känsla. "Kontakta
personal" ska vara synligt hela tiden, och det han lovar måste stämma med när
personalen faktiskt svarar.*

**2. Hur mäter vi trygghet?**
**a) Enkätfråga till besökare i meröppet** ✅
b) Referensgruppen bedömer
c) Vi mäter inte, vi beskriver kvalitativt

*Två frågor på skärmen efter avslutat samtal — fler frågor sänker svarsfrekvensen
kraftigt. Mätningen startar dag ett, även när Bosse är dålig, annars finns inget att
jämföra med senare. Referensgruppen kompletterar i ord.*

## Teknik och inköp (3–6)

Hårdvarubudgeten har en deadline som styr när inköpen måste göras. Frågorna här
handlar om hur många enheter vi köper, var mjukvaran körs och vilka funktioner
skärmarna ska ha.

**3. Hur många skärmar köper vi först?**
**a) Fem direkt** ✅
b) En, testa, sedan fyra
c) Två — Sjöbo och ett filialbibliotek

*Budgetdeadline styr inköpet. Men inköp och driftsättning är olika beslut — vi
föreslår att en sätts upp i Sjöbo först och de andra fyra monteras när den fungerat
några veckor. Då behöver fel bara rättas på ett ställe.*

**4. Var ska Bosse köras?**
a) Lokalt på varje skärm
b) På server hos Unikom
c) På egen maskin i kommunens nät
**d) I molnet — skärmarna är uppkopplade** ✅

*Två saker kallas moln: applikationen i molnet med språkmodellen kvar hos oss, eller
en extern språkmodell dit varje besökarfråga skickas. Det senare kräver
personuppgiftsbiträdesavtal och krockar med förstudiens invändning om beroende av
utländska aktörer. Frågan behöver avgöras med digitaliseringsstrategen och Unikom.*

**5. Vad ska rörelsedetektorerna göra?**
**a) Väcka skärmen ur viloläge** ✅
**b) Få Bosse att hälsa** ✅
c) Räkna besökare
d) Vi köper dem inte nu

*En mörk skärm blir inte använd, så det här är sannolikt skillnaden mellan att bli
ignorerad och att fungera. Sensorerna ska vara rena PIR-givare som varken filmar eller
räknar individer — skriv in det i beställningen. Ställ räckvidden snävt så att han
inte hälsar på alla som passerar.*

**6. Ska Bosse ha röst?**
**a) Text och röst** ✅
b) Bara text initialt
c) Röst in, text ut

*Röst är rätt för dem som inte skriver gärna. Men röst plus rörelsesensor betyder att
en maskin säger hej högt i ett tyst rum flera gånger i timmen — bygg därför in
volymkontroll, tysta timmar och en av-knapp personalen når själva. Riktad högtalare är
bättre än fri ljudavgivning.*

## Kunskapsbas (7–9)

En språkmodell utan avgränsning hittar på svar. Vi har beslutat att Bosse ska hållas
till bibliotekets egen information, vilket gör kunskapsbasen till projektets tyngsta
arbete.

**7. Vem bygger kunskapsbasen?**
a) Peter
b) Bibliotekspersonalen
c) Extern leverantör
**d) Personalen tar innehållet, Peter tekniken** ✅

*Personalen vet vad folk faktiskt frågar om i disken, och den som skrivit innehållet
rättar det när det blir fel. Gör det enkelt — en delad fil, inte ett system som kräver
utbildning. Börja med att personalen skriver ner de trettio vanligaste frågorna under
en vecka.*

**8. Vad ska han kunna svara på i första versionen?**
**a) Bara öppettider och praktisk info** ✅
b) Öppettider plus boktips ur katalogen
c) Allt om biblioteket, inklusive evenemang och tjänster

*Öppettider, lånekort, grupprum och meröppetregler är vad folk faktiskt frågar om.
Katalogintegration är det som stoppat andra bibliotek — Nacka brottas fortfarande med
det. En AI-bibliotekarie som alltid har rätt öppettid är mer värd än en som ibland
tipsar om en bok vi inte har.*

**9. Vad gör han med frågor utanför området?**
**a) Säger att han inte kan svara** ✅
**b) Hänvisar till personal eller webben** ✅
c) Svarar allmänt om han kan

*Erkänn begränsningen och peka på vägen framåt i samma andetag. Skriv flera varianter
så att han inte upprepar samma mening varje gång. Testa aktivt att han vägrar — ställ
frågor om recept, sjukvård och narkotika under testperioden i stället för att lita på
inställningarna.*

## Medborgardialog (10–11)

Ansökan lovar kontinuerlig dialog med invånarna. Det förutsätter att vi sparar det som
sägs, vilket krockar med integritetsambitionen — därför har dialogen separerats från
vanliga samtal.

**10. Hur startas dialogen?**
**a) Egen knapp med samtyckesruta** ✅
b) Bosse frågar själv ibland
c) Separat läge på skärmen

*Besökaren förstår att just det här sparas, och alla andra samtal kan lämnas
osparade. Rutan säger vad som samlas in, vem som läser det och att man inte ska skriva
namn eller känsliga uppgifter — tre meningar, inte en integritetspolicy. Knappen ger
också ett mått på hur många som faktiskt använder dialogdelen.*

**11. Vem läser det som kommer in, och hur ofta?**
**a) Projektledaren, månadsvis — synpunkterna mejlas vidare** ✅
b) Bibliotekschefen, kvartalsvis
c) Hela projektgruppen på möten

*Kvartalsvis blir i praktiken aldrig. Använd en funktionsbrevlåda, aldrig en personlig
adress, så att det fungerar vid semester och personalbyte. Synpunkter till en kommun är
normalt allmänna handlingar — det behöver hanteras rätt.*

## Referensgruppen (12–13)

Gruppen är redan tillfrågad och klar. Frågorna gäller vad de ska göra och vad
inkluderingen kräver i praktiken.

**12. Vad får referensgruppen påverka?**
a) Allt utom tekniken
b) Innehåll, tilltal och placering
**c) Vi testar färdiga lösningar på dem** ✅

*Ansökan talar om workshops och aktivt samarbete under utvecklingsfasen — ta reda på
vad gruppen blivit lovad, så att de inte förväntar sig medskapande och får en
användartest. Justera hellre språket mot gruppen än upplägget. Test av färdiga
lösningar ger mest användbar information, om det görs tidigt nog att svaren hinner
påverka något.*

**13. Hur löser vi tolkstöd och flera språk?**
a) Ryms i de 5 000
**b) Tolk tas från kommunens medel — och Bosse ska klara flera språk** ✅
c) Vi klarar oss utan

*Två separata saker: mänsklig tolk på mötena kostar riktiga pengar, flerspråkighet i
mjukvaran kostar inget extra. Men en språkmodell svarar flytande på arabiska även om
den har fel, och kvaliteten varierar kraftigt mellan språk. Testa varje språk med
någon som talar det — släpp hellre tre som fungerar än tio som inte testats.*

## Persona och kommunikation (14–16)

Hur Bosse presenterar sig avgör både förtroendet och om han används. Här finns också
ett lagkrav på transparens att förhålla sig till.

**14. Ska han säga att han är AI?**
**a) Ja, i hälsningen** ✅
b) Ja, men bara om någon frågar
c) Skylt vid skärmen räcker

*En skylt läser ingen — det måste ligga i det första han säger. "Hej, jag är Bosse,
bibliotekets AI-värd" krockar inte med värmen och möter transparenskraven. Han kan vara
varm och lokal och samtidigt ärlig om vad han är.*

**15. Vem bestämmer namnet?**
**a) Projektgruppen** ✅
b) Referensgruppen
c) Öppen omröstning bland besökare

*Rimligt, särskilt eftersom han redan har ett namn personalen känner igen. Kalla det
då inte medskapande utåt. Vill vi ändå ge referensgruppen inflytande är tilltalet en
bra kandidat — duar han, hur formell är han.*

**16. Vad är Peters roll formellt?**
a) Kommunikatör i projektet
b) Kommunikatör och utvecklare
**c) Utvecklare tills upphandling sker** ✅

*Prototypen är ett verkligt försprång. Men koden behöver ligga i kommunens git och inte
bara på en maskin i tjänsterummet, det behövs en skriven instruktion för start och
uppdatering, och minst en person till måste kunna göra det. Sätt en uttalad tidpunkt
när rollen omprövas.*

## Drift och data (17–19)

Det som avgör om lösningen överlever projektet är vem som förvaltar den och hur
personuppgifter hanteras. Båda frågorna är billigare att lösa nu än senare.

**17. Vem äger lösningen efter november 2027?**
a) Biblioteksverksamheten
**b) Biblioteksverksamheten äger, Unikom driftar** ✅
c) Oklart — utreds under projektet

*Biblioteket äger innehållet och besluten, Unikom svarar för att lådan står upp. Få
det bekräftat nu, medan vi är en kund med projektpengar. Fråga särskilt vad Unikom
kräver för att ta över drift av något som utvecklats internt — svaret påverkar hur vi
bygger redan i höst.*

**18. Vad sparar vi från vanliga samtal?**
a) Ingenting
**b) Statistik utan text** ✅
c) Frågorna men inte svaren

*Antal samtal, längd, tid på dygnet och hur ofta han klarade frågan — utan att spara
vad någon skrev. Ett dokumenterat undantag: frågor han inte kunde besvara loggas, gås
igenom av personalen och raderas efter genomgång, annars går han inte att förbättra.
Notera att beslut 4 påverkar detta.*

**19. Är dataskyddsombudet inkopplat?**
a) Ja
**b) Nej — kontaktas den här veckan** ✅
c) Digitaliseringsstrategen räcker

*Fyra saker till det mötet: var språkmodellen körs, hur synpunkterna hanteras som
allmänna handlingar, att sensorerna inte lagrar något, och vad som sparas respektive
raderas. Digitaliseringsstrategen är rätt person för tekniken men kan inte göra
personuppgiftsbedömningen. Gör det nu medan svaren kan påverka bygget.*

## Öppna frågor att ta ställning till

- **Beslut 4:** ska språkmodellen köras hos extern leverantör eller inom kommunen?
  Avgörs med digitaliseringsstrategen och Unikom.
- **Beslut 12:** vad har referensgruppen blivit lovad?
- **Beslut 17:** vad kräver Unikom för att ta över driften?

## Senare förtydliganden från Peter (september–oktober 2026)

- Stationerna är tunna klienter mot en webbsida. Ingen AI-dator per kiosk.
- Svarsmodellen ska i produktion köras mot Azure OpenAI med kommunens egen nyckel.
  Först byggs en MVP med lokala modeller.
- Offertförfrågan gäller bara hårdvaran. AI-tjänsten byggs internt.
- I kommunen heter tjänsten Aibi.
- Lösningen ska vara lätt att kopiera för andra kommuner.
- Den femte stationen står i entrén till Kulturhuset.
