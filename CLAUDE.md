# aibibosse

Gränssnittet för Aibi/Bosse, AI-värden på Sjöbo bibliotek. Backend finns inte i
det här repot.

Läs `README.md` innan du ändrar något, särskilt avsnitten "Filer och
laddningsordning", "Så beter sig skärmarna", "Ändringslogg" och "Kvar att göra".

Regler som gäller i hela repot:

- Hälsningen ska alltid säga att det är en AI.
- Skärmen ska återställas helt vid inaktivitet, så att nästa besökare aldrig
  ser något från den förra.
- Personalknappen får inte lova mer än bemanningen tillåter.
- Källor är bara text. Inga länkar, QR-koder eller kopiering. Svaret ska räcka
  i samtalet.
- Namnet hämtas från `AIBI.namn()` i `ui/components/profil.js`, aldrig hårdkodat.
- Kör `bash test/kor.sh` efter varje ändring i `ui/` och se till att allt är PASS.
- Lägg till en rad i README:s ändringslogg när du ändrar något som påverkar
  hur skärmarna beter sig.
