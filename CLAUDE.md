# aibibosse

Aibi (i koden ofta Bosse), AI-värden på Sjöbo bibliotek. Repot innehåller i dag
gränssnittet. Backend finns på Peters utvecklingsmaskin (Bosgame) och flyttas hit
enligt uppdraget nedan.

## Uppdraget

Arbetet styrs av uppdragsspecifikationen i `docs/uppdrag/`. Börja varje session med
`docs/uppdrag/README.md` och `docs/uppdrag/STATUS.md`. Arbetet sker i faser, och efter
varje fas stannar du och väntar på Peters ok.

Reglerna i `docs/uppdrag/00-regler.md` gäller alltid och går före allt annat. De
viktigaste i korthet:

- Repot är publikt. Inga nycklar, `.env`, IP-adresser, interna dokument, databaser,
  loggar eller besökares frågor i git.
- Ta aldrig bort något på Bosgame. Rör inte Nyhetsfabriken. Starta eller stoppa inte
  tjänsterna på 8085 och 8086 utan ok.
- Mergea aldrig till `main` utan Peters ok i samma session.
- Svara bara ur kunskapsbasen. Hitta aldrig på. Nekade svar går aldrig via
  språkmodellen.
- Påstå aldrig att något fungerar utan att ha kört kommandot och visat utskriften.
- Skriv till Peter på svenska och i klartext.

## Regler för gränssnittet

- Hälsningen ska alltid säga att det är en AI.
- Skärmen ska återställas helt vid inaktivitet, så att nästa besökare aldrig
  ser något från den förra.
- Personalknappen får inte lova mer än bemanningen tillåter.
- Källor är bara text. Inga länkar, QR-koder eller kopiering. Svaret ska räcka
  i samtalet.
- Namnet hämtas från `AIBI.namn()` i `ui/components/profil.js`, aldrig hårdkodat.
- Inga externa typsnitt, CDN-länkar eller spårning.
- Kör `bash test/kor.sh` efter varje ändring i `ui/` och se till att allt är PASS.
  När `scripts/kontroll.sh` finns (fas 1) är det kommandot som gäller.
- Lägg till en rad i README:s ändringslogg när du ändrar något som påverkar
  hur skärmarna beter sig.

Läs `README.md` innan du ändrar i `ui/`, särskilt avsnitten "Filer och
laddningsordning", "Så beter sig skärmarna", "Ändringslogg" och "Kvar att göra".
