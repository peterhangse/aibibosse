# Fas 9: Katalogen

## Syfte

Efter den här fasen kan Aibi svara på "Har ni boken …?" och "Har ni något av …?" ur
bibliotekets egen katalog, så som den ser ut i den senaste exporten. Svaret säger ärligt
vad Aibi vet: att biblioteket har boken, på vilket bibliotek om det framgår, och att
Aibi inte kan se om den är inne just nu. Status "inne" visas bara om det finns en levande
källa, och den finns inte i dag.

Det här är det enda stället där Aibi kan visa boktitlar. Det är också det enklaste
stället att hitta på. Testerna är viktigare än funktionen.

## Förutsättningar

- Fas 3 är godkänd (grundningskontrollen känner till katalogens titlar).
- Fas 9 kan göras före, efter eller samtidigt med fas 6, 7 och 8.
- Beslut 12: katalogen bygger bara på importerad export. Svaren om sigel, Lånestatus och
  hur ofta export kan fås finns hos bibliotekarierna. Fråga Peter i början av fasen.
- Bakgrund i `docs/PROJEKTKONTEXT.md`: leverantören av bibliotekssystemet har sagt nej
  till ett API. En BSKO-export finns och adminpanelen har en import för den.

## Uppgifter

### 9.1 Så fungerar importen i dag

Läs importen och katalogdelen i koden och i `docs/INVENTERING.md`. Skriv i STATUS:

- vilket format exporten har och vilka fält som finns (titel, författare, ISBN, år,
  medietyp, språk, bibliotek, hylla, antal exemplar, status)
- hur många poster den senaste exporten har, utan att visa dem
- om importen ersätter allt eller lägger till, och vad som händer med poster som
  försvunnit
- hur katalogen söks i dag och hur svaret ser ut

### 9.2 Importen ska tåla upprepning

- Samma export två gånger ger samma katalog (idempotent).
- En ny export ersätter den gamla helt, i en transaktion. Misslyckas importen ligger
  den gamla kvar.
- Exporten läses från `AIBI_DATA_DIR/katalog/` eller laddas upp i adminpanelen. Filen
  sparas inte i repot och inte i loggar.
- Adminpanelen visar när katalogen senast importerades och hur många poster den har.
  Är den äldre än en inställbar gräns (standard 30 dagar), visas en varning.
- Kontrollera att exporten inte innehåller låntagaruppgifter. Gör den det: stoppa
  importen, skriv det i STATUS och fråga Peter (regel F).

### 9.3 Sökning i katalogen

- Egen intent för katalogfrågor: titel, författare, ISBN, ämne ("böcker om
  trädgård"), serie.
- Titel- och författarsökning tål stavfel, versaler och saknade diakritiska tecken
  ("hakan nesser" hittar Håkan Nesser). Använd den sökning som redan finns i motorn
  om den räcker.
- ISBN normaliseras (bindestreck, mellanslag, ISBN-10 till ISBN-13) innan sökning.
- Hittas ingen post över tröskeln: nej, med hänvisning till personalen och
  bibliotekets webbkatalog (utan länk, regel A13).
- Hittas flera: högst tre i svaret, som kort, med "Det finns fler. Fråga personalen."

### 9.4 Svaret

Grundsvaret för en bok följer en mall, till exempel:

> Ja, biblioteket har "Titel" av Författare. Jag kan inte se om den är inne just nu.
> Fråga personalen, eller sök i bibliotekets katalog.

- Med bibliotek: "Den finns på Sjöbo bibliotek och Blentarps bibliotek."
- Aldrig "den är inne", "den är tillgänglig", "du kan låna den nu" eller liknande utan
  en levande källa. Grundningskontrollen ska ha en egen regel för det, oavsett om
  orden finns i källtexten.
- Bokkortet (`typ: bok`) har `tillganglig: null` och visar "Vi kan inte se om den är
  inne. Fråga personalen." (finns redan i kioskvyn från oktober 2026).
- Boktips och rekommendationer ("Vad ska jag läsa?", "Vilken är bästa barnboken?") nekas
  med en hänvisning till personalen. Det ligger utanför uppdraget.

### 9.5 Libris som tillval

Libris är den nationella katalogen och har öppna gränssnitt. Bygg en modul som är
avstängd tills Peter gett bibliotekets sigel och sagt ok (beslut 12):

- `AIBI_LIBRIS=av|pa`, `AIBI_LIBRIS_SIGEL=`
- Kontrollera vilket gränssnitt som passar i Libris dokumentation när du bygger (Xsearch
  eller SRU) och skriv valet och länken i koden.
- Används för att komplettera exporten med uppgifter som saknas (till exempel om exporten
  bara har titel): bara bibliografiska uppgifter, aldrig status.
- Svar cachas i 24 timmar. Tidsgräns 3 sekunder. Utan svar: svara ur exporten som om
  Libris inte fanns.
- Frågan som skickas till Libris är en titel, ett författarnamn eller ett ISBN, inte
  besökarens fråga. Det är ändå en extern tjänst (regel G). Skriv det i
  `docs/DATASKYDD.md` och låt Peter bestämma.
- Inga anrop till Libris i CI. Spela in svar som testdata (fixtures) en gång, och
  testa mot dem.

### 9.6 Lånestatus

Om Peter får veta att Libris Lånestatus är påslaget för biblioteket, eller att det finns
någon annan levande källa: bygg en adapter som ger `tillganglig: true|false|null`. Utan
källa är svaret alltid `null`. Bygg inte adaptern förrän källan finns. Skriv i STATUS
vad som behövs.

### 9.7 Titlar som grundningskontrollen känner till

Katalogens titlar och författare blir en del av listan som grundningskontrollen
jämför mot (fas 3.4). En titel som modellen nämner och som inte finns i det aktuella
svarets källor underkänns, även om den finns i katalogen.

## Tester

- Importen: idempotent, transaktion vid fel, varning vid gammal katalog, stopp vid
  låntagaruppgifter (testa med en påhittad fil).
- Sökning: stavfel, diakritiska tecken, ISBN-10 och ISBN-13, flera träffar, ingen träff.
- **Aldrig "inne"**: ett test som kör alla katalogfrågor i utvärderingen i båda lägena,
  med en låtsasmodell som försöker skriva "den är inne", och kontrollerar att inget svar
  säger att en bok är tillgänglig.
- **Aldrig påhittade titlar**: frågor om böcker som inte finns i katalogen ska nekas,
  även när titeln är känd (till exempel en världskänd roman som inte finns i
  exempelkatalogen).
- Boktips nekas.
- Libris mot inspelade svar: tidsgräns, cache, tillbakafall.
- En exempelkatalog i `exempeldata/` med 50 påhittade böcker, så att testerna går i CI.

## Klart när

- [ ] Katalogfrågor besvaras ur exporten, med ärligt svar om status.
- [ ] Inga påhittade titlar och aldrig "inne", visat med tester.
- [ ] Libris finns som avstängt tillval.
- [ ] Utvärderingen har minst 20 katalogfrågor och 10 som ska nekas.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet.

## Grind

Stanna. Peter frågar efter fem böcker han vet finns och fem han vet inte finns, och
kontrollerar svaren. Han tar med frågorna om sigel, Lånestatus och export till
bibliotekarierna.

## Fällor

- Exporter från bibliotekssystem har ofta fel teckenkodning (Latin-1, MARC-8). Testa med
  å, ä och ö i titlar och författare.
- Samma bok i flera upplagor ger flera poster. Slå ihop på titel och författare i
  svaret, visa inte fem rader för samma bok.
- "Har ni Harry Potter?" är en serie, inte en titel. Svara med att det finns böcker i
  serien, inte med en lista på sju titlar.
- En katalog med tiotusentals poster gör sökningen långsammare. Mät latensen i läge
  strikt efter importen. Kravet under 500 ms gäller fortfarande.
