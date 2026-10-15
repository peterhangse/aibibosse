# Uppdrag: Aibi från test till MVP deluxe

Det här är uppdragsspecifikationen för Claude Code. Den tar AI-värden för Sjöbo
bibliotek från dagens läge, med flera prototyper på olika ställen, till en samlad,
testad och dokumenterad tjänst som kör som pilot på Bosgame med en skärm i Sjöbo och
som är redo att flyttas till en kommunal server och kopplas mot Azure OpenAI.

Peter beställer och granskar. Du bygger. Arbetet sker i faser, och efter varje fas
stannar du och väntar på Peters ok.

## Läs i den här ordningen innan du gör något

1. `docs/uppdrag/00-regler.md`, reglerna. Gäller alltid, före allt annat.
2. `docs/PROJEKTKONTEXT.md`, varför projektet ser ut som det gör.
3. `docs/VAGVAL.md`, projektgruppens 19 beslut.
4. `docs/uppdrag/01-malbild.md`, hur det ska se ut när det är klart.
5. `docs/uppdrag/beslut-peter.md`, vad du inte får bestämma och vad som gäller tills dess.
6. `docs/uppdrag/STATUS.md`, var arbetet står.
7. Fasfilen för den fas du ska göra, till exempel `docs/uppdrag/fas-00-inventering.md`.

Läs dessutom `README.md` i repots rot. Dess ändringslogg beskriver vad som gjorts i
gränssnittet i oktober 2026.

## Vad "MVP deluxe" betyder

Uppdraget är klart när allt det här stämmer:

- All kod ligger i det här repot, en tjänst serverar gränssnitt och API, och de gamla
  kodbaserna på Bosgame ligger kvar orörda som arkiv.
- Tjänsten startar med `docker compose up -d` och fungerar utan språkmodell (läge
  strikt) och med (läge formulerad, Ollama på Bosgame).
- Svaren håller måtten i `01-malbild.md` avsnitt 10, mätt och dokumenterat.
- Integritet, säkerhet och nekande är testade med automatiska tester.
- En medborgarskärm i kommunens grafiska profil, med svarskort, följdfrågor,
  personalknapp, synpunkter, enkät, röst, språkval, större text och kontrast.
- Personalen kan ändra öppettider, bemanning, hälsning, snabbfrågor och annat innehåll
  i adminpanelen, se statistik, gå igenom obesvarade frågor och köra testfrågorna.
- Katalogfrågor besvaras ur importerad export, utan att hitta på om en bok är inne.
- Kioskläge med skärmtangentbord, närvarosensor och vilosida fungerar på en riktig
  skärm, och det finns en instruktion för Unikom.
- Bytet till Azure OpenAI är en ändring i `.env`, testad mot en låtsasserver, med en
  kostnadsuppskattning och en checklista för dataskyddsombudet.
- Dokumentation finns för personalen, för driften och för andra kommuner.

## Faserna

| Fas | Fil | Vad | Grind |
|---|---|---|---|
| 0 | `fas-00-inventering.md` | Kartlägg allt som finns, ta backup, ändra ingenting | Peter godkänner kartan och planen för sammanslagningen |
| 1 | `fas-01-samla-kodbasen.md` | Flytta backend hit, en tjänst, Docker, CI | Alla gamla tester gröna i nya repot, tjänsten kör parallellt |
| 2 | `fas-02-sakerhet-integritet.md` | Nivå på servern, inga samtal sparas, granskningskö, säkerhet | Integritets- och säkerhetstesterna gröna |
| 3 | `fas-03-svarsmotorn.md` | Strikt och formulerat läge, grundningskontroll, följdfrågor, öppettider | Utvärderingen når målen |
| 4 | `fas-04-medborgarskarmen.md` | En skärm, kommunens profil, svarskort, kioskläge, tangentbord | Peter har sett skärmen i stående och liggande |
| 5 | `fas-05-personalens-verktyg.md` | Innehåll i formulär, ändringslogg, granskningskö, statistik, testfrågor | Peter har ändrat en öppettid själv och sett den på skärmen |
| 6 | `fas-06-dialog-och-enkat.md` | Synpunkter med samtycke, enkät, återkoppling | Synpunkt når testbrevlådan, enkäten syns i statistiken |
| 7 | `fas-07-rost.md` | Tal in, tal ut, volym, tysta timmar, av-knapp | Peter har pratat med skärmen |
| 8 | `fas-08-sprak.md` | Flera språk utan att tappa grundningen | Engelska klarar testfrågorna |
| 9 | `fas-09-katalogen.md` | Katalogfrågor ur export, Libris som tillval | Katalogtesterna gröna, inget påhittat |
| 10 | `fas-10-kiosk-och-pilot.md` | Sensor, vaktfunktion, last- och dygnstest, pilot | Skärmen har gått ett dygn utan fel |
| 11 | `fas-11-azure-redo.md` | Azure som inställning, låtsasserver, kostnad, checklista | Peter har allt som behövs för beslutet |
| 12 | `fas-12-overlamning.md` | Dokumentation för personal, drift och andra kommuner | Peter godkänner överlämningen |

Faserna 6–9 är fristående från varandra. Om Peter vill ändra ordningen går det bra,
men fas 0–5 görs i ordning och fas 10 kräver att 0–5 är klara.

## Så går en fas till

1. **Läs fasfilen** och de delar av koden den gäller. Läs om reglerna om det var längre
   sedan.
2. **Skapa en gren**: `git checkout -b fas-NN-kort-namn` från en uppdaterad `main`.
3. **Skriv en plan** i STATUS.md: vilka filer du tänker ändra, i vilken ordning, och
   vad som kan gå sönder. Rör planen något i regelns avsnitt B eller F, vänta på Peter.
   Annars kör.
4. **Skriv testerna först** för det beteende fasen ska ge. Visa att de faller.
5. **Bygg** i små steg. Committa varje fungerande steg.
6. **Kör hela kontrollen**: backendtester, utvärderingen, gränssnittstesterna,
   hemlighetsskanningen. Alla gröna.
7. **Skriv granskningsunderlaget** (se nedan) och uppdatera STATUS.md, README:s
   ändringslogg och CLAUDE.md om något i dem blivit fel.
8. **Öppna en pull request** med granskningsunderlaget som beskrivning.
9. **Stanna.** Säg till Peter att fasen väntar på hans granskning och vad han behöver
   göra. Börja inte nästa fas.

## Granskningsunderlaget

Peter har fyra timmar i veckan. Granskningen ska ta högst en kvart. Skriv
`docs/uppdrag/granskning/fas-NN.md` med exakt de här rubrikerna och inget annat:

```
# Fas NN: <namn>

## Vad som är nytt för besökaren eller personalen
Högst fem punkter, i vardagsspråk.

## Prova själv
Högst fem steg. Adress att öppna eller kommando att köra, och vad Peter ska se.

## Mätt
Testresultat (antal gröna av totalt), utvärderingen före och efter, latens.
Klistra in den riktiga utskriften, förkortad.

## Skärmdumpar
Länkar till bilder i docs/uppdrag/granskning/bilder/ om gränssnittet ändrats.
Inga riktiga besökarfrågor i bilderna.

## Risker och sådant jag är osäker på
Det viktigaste avsnittet. Var konkret.

## Beslut som behövs
Hänvisa till numret i beslut-peter.md.
```

## Om du kör fast

- Står det i fasfilen att något finns, men det finns inte: skriv det i STATUS.md,
  föreslå en väg och fråga.
- Kräver en uppgift något du inte har (nyckel, hårdvara, adress, beslut): bygg allt
  runt omkring bakom en avstängd inställning, skriv vad som saknas och gå vidare med
  resten av fasen.
- Går ett test inte att få grönt: ändra inte testet för att det ska gå igenom. Beskriv
  felet och fråga.
- Har du gjort ett misstag: säg det rakt ut i STATUS.md, med vad som hände och hur det
  rättades.
