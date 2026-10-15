# Fas 7: Röst

## Syfte

Efter den här fasen kan en besökare prata med Aibi och få svaret uppläst. Talet tolkas
lokalt på servern, ljudet raderas direkt, och besökaren ser vad Aibi hörde innan frågan
skickas. Personalen styr volym, tysta timmar och om skärmen får hälsa när någon kommer
nära, och kan stänga av allt ljud på alla skärmar med en knapp.

Vägval 6 (text och röst) blir verklighet. Ingen verklig persons röst används.

## Förutsättningar

- Fas 5 är godkänd. Formuläret för röst finns i adminpanelen.
- Fas 7 kan göras före, efter eller samtidigt med fas 6, 8 och 9.
- Beslut 10 har ett standardval som räcker: lokal Whisper för tal till text,
  webbläsarens röst för uppläsning, uppläsning bara vid tryck, ingen hälsning vid
  närvaro.
- Läs vad fas 0 skrev om röstdelen i `docs/INVENTERING.md`. Piper och Chatterbox
  provades och underkändes i september 2026. Prova dem inte igen utan att Peter ber om
  det.

## Uppgifter

### 7.1 Så fungerar det i dag

`ui/app.js` spelar in med `MediaRecorder`, skickar ljudet till `/api/stt` och skickar
texten direkt som fråga. `ui/components/chat.js` har en `speak()` som läser upp svaret
automatiskt om `speech.tts_enabled` är satt. Mikrofonfel visas med `alert()`, som inte
fungerar på en kiosk. Det här är utgångsläget.

### 7.2 Tal till text på servern

- `AIBI_STT=whisper-lokal` använder faster-whisper med modellen i `AIBI_STT_MODELL`
  (standard `small`), språk från besökarens språkval (standard `sv`).
- Kör på CPU med `int8` om det inte är bevisat att GPU fungerar stabilt i containern.
  ROCm i Docker på Bosgame kan kräva ändringar i Docker-inställningarna (regel B3).
  Mät tiden för en fråga på fem sekunder: målet är under två sekunder på CPU. Klarar
  `small` inte det, prova `base` och jämför träffsäkerheten.
- Modellen laddas ner till en volym (`AIBI_DATA_DIR/modeller/`) första gången, inte in
  i Docker-bilden. Storleken på `small` är långt under 5 GB (regel B4), men skriv ändå
  storleken i STATUS.
- Gränser: högst 30 sekunder och 2 MB (fas 2). Längre ljud avvisas med ett vänligt
  meddelande.
- **Ljudet raderas direkt.** Läs det i minnet om det går. Används en tempfil: i en
  `try/finally` som raderar den, i en katalog som töms vid start. Spårtestet från fas 2
  utökas med ljud: efter tolkningen finns inga ljudfiler någonstans.
- Svaret är `{text, sprak}`. Ingen text loggas.

### 7.3 Besökaren ser vad Aibi hörde

Skicka inte texten direkt. Visa den i textfältet med knapparna "Skicka" och "Rätta", där
"Rätta" öppnar skärmtangentbordet. Efter fem sekunder utan tryck skickas den. Det ger
besökaren en chans när tolkningen blivit fel, utan att det blir ett extra steg för den
som inte bryr sig.

Byt `alert()` mot ett meddelande i samtalet: "Jag kan inte höra just nu. Du kan skriva
din fråga i stället."

### 7.4 Tryck för att prata

- Ett tryck på mikrofonen startar inspelningen, ett till stoppar. Högst 20 sekunder,
  med en synlig nedräkning de sista fem.
- En tydlig indikator när mikrofonen lyssnar: färg, ikon och text ("Jag lyssnar"), inte
  bara färg (regel A16).
- Aibi lyssnar aldrig när ingen tryckt. Ingen väckfras.
- Inspelningen avbryts och kastas när skärmen återställs (finns redan,
  `kastaInspelning`).

### 7.5 Uppläsning

- `AIBI_TTS=webblasare`: webbläsarens `speechSynthesis` med en svensk röst. Välj en
  lokal röst (`voice.localService === true`) före en molnröst. Microsoft Edges
  "naturliga" röster körs i Microsofts moln och skickar svarstexten dit (beslut 10). Om
  bara molnröster finns: läs inte upp, och visa det för personalen i adminpanelen
  (stationen rapporterar vilka röster den har via `/api/samtal/slut` eller ett eget
  anrop, utan något om besökaren).
- `AIBI_TTS=server-lokal`: en lokal motor på servern som ger ljud via `/api/tts`. Bygg
  stödet i API:t och gränssnittet, men välj ingen motor utan Peters ok, eftersom de
  som provats underkändes. Lämna det som ett tillval med en tydlig plats att koppla in
  en motor.
- `AIBI_TTS=azure`: en stub som fas 11 fyller i. Skickar ingenting.
- Uppläsning vid tryck: en högtalarknapp på varje svar. Automatisk uppläsning är en
  inställning i adminpanelen, avstängd som standard.
- Bara svarstexten läses upp, inte källor eller kort.

### 7.6 Volym, tysta timmar och av-knapp

I adminpanelen, per station och för alla:

- volym (0–100)
- tysta timmar (tidsintervall per veckodag) när inget ljud spelas, tomt som standard
- automatisk uppläsning på eller av
- hälsning vid närvaro på eller av, och hur ofta (standard: högst en gång per tre
  minuter, aldrig under tysta timmar)
- `POST /api/admin/rost/av` och `/pa`: en knapp högst upp i adminpanelen, "Stäng av
  ljudet på alla skärmar". Stationerna ser ändringen inom 30 sekunder. Det här är för
  dagen då något låter fel och personalen behöver tystnad nu.

Gränssnittet hämtar inställningarna med `/api/config`. När ljudet är av syns ingen
högtalarknapp. Mikrofonen fungerar fortfarande.

### 7.7 Hälsning vid närvaro

Bygg det, men lämna det avstängt (beslut 10). När närvarosensorn (fas 10) säger att någon
är nära och funktionen är på: läs upp hälsningen en gång, med gränserna i 7.6. Hälsningen
ska också synas som text.

### 7.8 Ortnamn och svåra ord

Whisper hör ofta fel på svenska ortnamn. Gör en testuppsättning med inspelningar av
fraser som "När öppnar biblioteket i Blentarp?", "Finns det bibliotek i Vollsjö?" och
med Sjöbo, Lövestad och Vombsjön. Spela in dem själv med en syntetisk röst (en lokal
röst, ingen riktig person) eller be Peter spela in, och spara inspelningarna som
testdata bara om Peter godkänner att hans röst ligger i ett publikt repo. Annars ligger
de i `AIBI_DATA_DIR` och testet hoppas över i CI.

Använd faster-whispers `initial_prompt` med bibliotekens och orternas namn för att
förbättra träffen. Mät med och utan.

### 7.9 HTTPS

Webbläsare ger bara tillgång till mikrofonen i en säker miljö: `https://` eller
`http://localhost`. En station som öppnar `http://<server>:8086/` får ingen mikrofon.
Skriv det tydligt i `deploy/kiosk/` och i STATUS. För piloten behövs ett certifikat
eller en lokal omvänd proxy (fas 10). Mikrofonknappen ska döljas när
`window.isSecureContext` är falskt, med en rad i personalskärmens status om varför.

## Tester

- Backend: `/api/stt` med en kort testfil (genererad i testet eller incheckad,
  några kilobyte) ger text, för långt ljud avvisas, för stor fil avvisas, inga
  ljudfiler kvar efteråt.
- Ortnamnstesterna enligt 7.8, med träffsäkerheten före och efter `initial_prompt`.
- Playwright: Chromium med `--use-fake-device-for-media-stream` och
  `--use-file-for-fake-audio-capture` ger en fejkad mikrofon. Tryck, tala, se texten i
  fältet, skicka. Nedräkning och stopp vid 20 sekunder. Mikrofonen dold utan säker
  miljö. Tysta timmar döljer högtalarknappen. Av-knappen i adminpanelen slår igenom.
  Återställning kastar inspelningen.
- Spårtestet med ljud.

## Klart när

- [ ] En besökare kan fråga med rösten och se vad Aibi hörde innan frågan skickas.
- [ ] Uppläsning vid tryck fungerar med en lokal svensk röst.
- [ ] Volym, tysta timmar och av-knappen fungerar.
- [ ] Hälsning vid närvaro finns och är avstängd.
- [ ] Ljud lämnar inga spår.
- [ ] Tidsmätning av tal till text står i STATUS.
- [ ] `scripts/kontroll.sh` grönt, granskningsunderlaget skrivet.

## Grind

Stanna. Peter pratar med skärmen, gärna med ortnamn och en fråga med bakgrundsljud, och
lyssnar på uppläsningen. Han bestämmer om rösten räcker för piloten.

## Fällor

- `MediaRecorder` ger olika format i olika webbläsare (webm/opus i Chromium, mp4 i
  Safari). Servern ska ta emot båda och lita på innehållet, inte på filnamnet.
- `speechSynthesis.getVoices()` är tom första gången. Vänta på `voiceschanged`.
- Uppläsning som fortsätter efter att skärmen återställts är ett integritetsproblem:
  nästa besökare hör förra svaret. Avbryt med `speechSynthesis.cancel()` vid
  återställning.
- En bibliotekslokal är tyst. Standardvolymen ska vara låg.
- Whisper hittar ibland på text när ljudet är tyst ("Tack för att du tittade!"). Filtrera
  bort tomma eller mycket korta inspelningar och kända hallucinationsfraser innan svaret
  skickas.
