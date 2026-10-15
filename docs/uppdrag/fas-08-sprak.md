# Fas 8: Fler språk

## Syfte

Efter den här fasen kan en besökare välja ett annat språk än svenska och få svar på det
språket, med samma grundning som på svenska. Kunskapsbasen är fortfarande svensk. Frågan
översätts till svenska, besvaras som vanligt, och svaret översätts tillbaka och
kontrolleras. Går något fel får besökaren det svenska svaret och en förklaring på sitt
språk. Ett språk syns på skärmen först när någon som talar det har testat det.

Vägval 13 blir verklighet. Engelska byggs och testas först. Vilka språk som kommer sedan
bestämmer projektgruppen (beslut 9).

## Förutsättningar

- Fas 4 (språkfilerna i `ui/sprak/`) och fas 5 (språklistan i adminpanelen) är
  godkända.
- Fas 3 (grundningskontrollen) är godkänd.
- Fas 8 kan göras före, efter eller samtidigt med fas 6, 7 och 9.

## Uppgifter

### 8.1 Språklistan

- I databasen: språkkod, namn på språket självt ("English", "العربية", "Українська"),
  skriftriktning, och status: `av`, `testas` eller `slappt`.
- `/api/config` lämnar bara ut språk med status `slappt`. Personalskärmen visar också
  `testas`, så att personal och testare kan prova på riktig skärm.
- Bara rollen admin får ändra status till `slappt`, och det loggas i ändringsloggen med
  vem som testat (fritext, till exempel "testat av X på biblioteket", skrivet av
  personalen).

### 8.2 Gränssnittets texter

- Alla fasta texter i `ui/sprak/<kod>.json`: knappar, hälsning (om personalen inte
  skrivit en egen för språket), nekandetexterna, felmeddelanden, enkäten, synpunktsfönstret,
  vilosidan, skärmtangentbordets etiketter.
- Översättningar som görs av en AI märks i filen (`"_kalla": "maskinoversatt"`) och
  får inte släppas förrän en människa gått igenom dem. Adminpanelen visar vilka texter
  som är maskinöversatta.
- Skärmtangentbordet får layouter för de språk som har andra tecken. För engelska räcker
  den svenska layouten. För språk med annat alfabet: visa en rad om att skriva på
  telefonen eller med rösten fungerar, i stället för att bygga en ny layout, tills
  projektgruppen bett om det.
- Höger-till-vänster: `dir="rtl"` på `<html>`, och layouten speglas med logiska
  CSS-egenskaper (`margin-inline-start` i stället för `margin-left`). Testa med arabiska
  även om språket inte släpps.

### 8.3 Svar på andra språk

Kedjan i läge formulerad:

```
fråga (språk X) ──► språkmodellen översätter till svenska
                ──► vanliga kedjan (fas 3), med den svenska frågan
                ──► nekad? ──ja──► fast nekandetext på språk X, aldrig via modellen
                ──► grundsvar (svenska)
                ──► språkmodellen formulerar svaret på språk X
                ──► grundningskontroll mot det svenska grundsvaret
                ──► underkänd? ──ja──► svenskt grundsvar + fast rad på språk X:
                                       "Jag kunde inte svara på ditt språk. Här är
                                        svaret på svenska."
```

- Den översatta svenska frågan skickas i `meta.tolkad_fraga` så att följdfrågor fungerar
  med samma ordförrådsregel (regel A6).
- Grundningskontrollen behöver kunna jämföra tal, tider, datum och namn mellan språk.
  Tal och tider normaliseras. Veckodagar och månader översätts med en tabell per språk,
  inte med modellen. Namn och titlar ska stå oförändrade.
- Krisord finns per språk i datafilen från fas 3. Krissvaret är en fast text per språk,
  med 112.
- Kort och källor visas med svenska titlar och översatta etiketter ("Öppettider" blir
  "Opening hours", men "Sjöbo bibliotek" står kvar).

I läge strikt finns ingen modell att översätta med. Då: frågor på andra språk får det
svenska svaret och raden ovan. Om frågan inte går att tolka på svenska (sökningen hittar
inget) nekas den med den fasta texten på språk X. Skriv det i adminpanelens beskrivning
av språken.

### 8.4 Språkval och språkigenkänning

- Besökaren väljer språk med knappen. Valet återställs vid vila (regel A8).
- Skriver någon på engelska när svenska är valt: känn igen det (en enkel lokal
  igenkänning räcker, till exempel ett litet bibliotek eller fasttext-modellen
  lid.176.ftz om det redan finns, annars ord-listor) och fråga "Do you want to continue
  in English?" med två knappar. Byt inte språk utan att fråga.
- Tal till text (fas 7) får språket från valet, så att Whisper inte gissar.

### 8.5 Utvärdering per språk

- Översätt testfrågorna till engelska. Det får en AI göra, men en människa ska gå
  igenom dem, och de märks som maskinöversatta tills dess.
- Kör utvärderingen för engelska: samma mått som för svenska, plus andel som föll
  tillbaka till svenska.
- Mål för att ett språk ska kunna föreslås för release: minst 90 procent acceptans,
  100 procent korrekt nekade, 0 påhittade fakta, och högst 10 procent tillbakafall till
  svenska.

### 8.6 Testprotokoll för den som talar språket

Skriv `docs/sprak/TESTPROTOKOLL.md`: en instruktion på enkel svenska för en person som
talar språket och ska testa det på skärmen. Tjugo frågor att ställa (på svenska i
protokollet, testaren ställer dem på sitt språk), vad som ska kontrolleras (stämmer
fakta, låter det naturligt, är något obegripligt eller stötande), och ett formulär för
resultatet. Testaren loggar in på personalskärmen och testar där.

### 8.7 Latens

Två extra modellanrop gör svaret långsammare. Mät p95 till första text för engelska och
skriv det i STATUS. Ligger det över 4 sekunder: visa svaret på svenska direkt med en rad
"Översätter …" och byt ut när översättningen godkänts, eller föreslå en annan väg.

## Tester

- Backend: kedjan i 8.3 med en låtsasmodell som översätter rätt, en som översätter fel
  (lägger till en tid), och en som inte svarar. Den andra och tredje ska ge svenskt
  svar med raden. Nekande på språk X går aldrig via modellen.
- Utvärderingen för engelska enligt 8.5.
- Playwright: språkvalet visar bara släppta språk, personalskärmen visar också
  `testas`, `lang` och `dir` sätts, arabiska speglar layouten, valet återställs vid vila,
  frågan om att byta språk.
- axe-core med engelska och med RTL.

## Klart när

- [ ] Engelska klarar målen i 8.5 och står som `testas`.
- [ ] Höger-till-vänster fungerar i layouten.
- [ ] Testprotokollet finns.
- [ ] Inget språk utom svenska är släppt (det gör Peter).
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet, med exempelsvar på
      engelska.

## Grind

Stanna. Peter (eller någon han väljer) testar engelska enligt protokollet. Projektgruppen
bestämmer vilka språk som ska byggas härnäst.

## Fällor

- En liten lokal modell kan vara bra på svenska och dålig på andra språk, eller tvärtom.
  Mät per språk.
- Modellen översätter gärna namn ("Sjöbo library", "Lake Vomb"). Grundningskontrollen
  ska underkänna det, och prompten ska be om att namn står kvar.
- Maskinöversatta texter i gränssnittet ser färdiga ut. Märkningen är det enda som
  hindrar att de släpps otestade.
- Engelska frågor om "opening hours tomorrow" kräver att datumlogiken i fas 3 får den
  svenska frågan, inte den engelska.
