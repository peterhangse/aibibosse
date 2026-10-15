# Fas 12: Överlämning

## Syfte

Efter den här fasen kan någon annan än Peter och kodagenten ta hand om Aibi. Personalen
har en handbok. Den som driftar servern har en driftinstruktion. En annan kommun kan
starta sin egen Aibi från repot. Arkitekturen är beskriven för den som ska ändra i
koden. Allt i målbilden är kontrollerat en sista gång och redovisat.

## Förutsättningar

- Fas 0–11 är godkända, eller medvetet uppskjutna av Peter.
- Beslut 16 (licens) behövs i den här fasen.

## Uppgifter

### 12.1 Handbok för personalen

`docs/handbok/personal.md`, på enkel svenska, för bibliotekspersonal som inte har sett
Aibi förut. Följ kommunens skrivregler (klarspråk, du-tilltal, viktigast först). Med
skärmdumpar.

- Vad Aibi är och inte är, i fem meningar
- Vad Aibi kan svara på, och vad den nekar
- Logga in i adminpanelen
- Ändra öppettider, avvikande dagar och bemanning
- Ändra hälsning och snabbfrågor
- Gå igenom obesvarade frågor
- Läsa statistiken
- Köra testfrågorna efter en ändring
- Stänga av ljudet på alla skärmar
- Vad du gör när skärmen visar "Jag är inte tillgänglig just nu"
- Vem du kontaktar

Ge handboken till Peter som utkast. Han låter någon i personalen läsa och testa den.

### 12.2 Driftinstruktion

`deploy/drift/DRIFT.md`, för Unikom eller den som driftar servern:

- krav på servern (processor, minne, disk, operativsystem, Docker)
- installation från början, steg för steg, med `.env`
- start, stopp, loggar, hälsokontroll
- uppdatering, med `scripts/kontroll.sh` som grind
- backup och återställning (från fas 10.8)
- byte av språkmodell och leverantör, med hänvisning till `AZURE.md`
- certifikat för HTTPS
- vanliga fel och vad man gör
- vad som aldrig ska göras (till exempel lägga interna dokument i repot)

### 12.3 För andra kommuner

`docs/ANDRA-KOMMUNER.md`:

- vad Aibi är, och vad kommunen behöver ha (server, skärmar, någon som äger innehållet)
- installation med `exempeldata/` som start
- vad som måste bytas: logotyp och färger (`ui/profil/`), namn och hälsning,
  bibliotek och öppettider, korpusen
- vad som inte ska ändras utan att förstå varför: reglerna i `docs/uppdrag/00-regler.md`,
  grundningskontrollen, nekandet
- vilka beslut Sjöbo fattade och varför (hänvisa till `docs/VAGVAL.md`)
- licensen (beslut 16)

Prova instruktionen själv: klona repot i en ren container, följ bara texten, och skriv
upp varje gång det inte räckte. Rätta texten tills det går.

### 12.4 Arkitektur

`docs/ARKITEKTUR.md`, för en utvecklare:

- en bild (i Mermaid eller som text) av delarna och flödet för en fråga
- moduler och vad de gör
- databasens tabeller
- API:t, genererat från `openapi.json` eller med hänvisning till det
- testerna och utvärderingen: vad de visar och hur de körs
- var reglerna i `00-regler.md` är implementerade, med filnamn

### 12.5 Sista kontrollen

Gå igenom `01-malbild.md`, `00-regler.md` avsnitt A och kravspecens id:n i
`docs/PROJEKTKONTEXT.md` punkt för punkt. För varje: uppfyllt, delvis eller inte, med
var det visas (test, skärmdump, dokument). Skriv det i `docs/uppdrag/SLUTRAPPORT.md`
med mätvärdestabellen från STATUS och en lista över det som är kvar.

### 12.6 Städning, med ok

Skriv ett förslag på vad som kan städas:

- de gamla kodbaserna på Bosgame, till `_arkiv/` (regel B1)
- gamla tjänster på 8085 och 8086 om de fortfarande kör
- `ui/dev/` om Peter inte behöver det
- `test/mock_api.py` om testerna kan gå mot den riktiga tjänsten
- Firebase-arbetsflödet (beslut 17)

Gör ingenting av det utan Peters ok, punkt för punkt.

### 12.7 Licens

När Peter bestämt (beslut 16): lägg licensfilen i roten och en rad i README.

### 12.8 Repot

- README: kort och för människor. Vad Aibi är, en skärmdump, hur man startar, var
  dokumentationen finns, ändringsloggen.
- CLAUDE.md: uppdaterad för nästa utvecklare, med reglerna och kommandona.
- `docs/uppdrag/`: ligger kvar som historik. Skriv överst i README där att uppdraget är
  avslutat och var slutrapporten finns.

## Tester

- En installation i en ren container enligt `docs/ANDRA-KOMMUNER.md` går igenom, och
  testfrågorna är gröna mot `exempeldata/`.
- `scripts/kontroll.sh` grönt.
- Gitleaks på hela historiken i repot, inte bara grenen.

## Klart när

- [ ] Handboken, driftinstruktionen, instruktionen för andra kommuner och arkitekturen
      finns.
- [ ] Installationen från noll har provats.
- [ ] `docs/uppdrag/SLUTRAPPORT.md` finns.
- [ ] Städförslaget är skrivet.
- [ ] Granskningsunderlaget skrivet.

## Grind

Stanna. Peter godkänner överlämningen. Uppdraget är klart.

## Fällor

- Dokumentation skriven av den som byggt systemet hoppar över det som känns självklart.
  Därför provas installationen från noll, och handboken av någon i personalen.
- Skärmdumpar i handboken ska inte visa riktiga besökares frågor eller interna
  dokument.
- Det är frestande att skriva att allt är klart. Slutrapporten ska säga vad som inte är
  det.
