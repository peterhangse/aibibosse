# Grafisk profil för Aibis skärmar

Aibi är en kommunal tjänst och ska se ut som Sjöbo kommun, inte som en produkt med
egen stil. Den här filen sammanfattar det som gäller för webb och skärmar ur Sjöbo
kommuns Grafiska manual 2026.1. Manualen är fast: det är inte tillåtet att ändra
logotypen eller använda andra typsnitt eller färger i kommunens kommunikation.
Frågor om profilen går till kommunikatörerna på kommunledningsförvaltningen.

Gränssnittet använder i dag en egen varm palett (orange #c45c26 och brunt) och
typsnittet Inter. Det byts i fas 4 mot värdena nedan. Allt som har med profil att göra
ska ligga i CSS-variabler och i inställningarna, så att en annan kommun kan byta
profil utan att röra koden.

## Färger

För webb och andra digitala produktioner är huvudfärgen **Sjöbodigital #248187**.
Den används på knappar, länkar, aktiva val och markeringar.

Profilfärgerna används i 100 eller 50 procents mättnad. Låt en färg dominera per vy.

| Färg | 100 % | 50 % |
|---|---|---|
| Sjöboblå | #50a2c1 | #b3cfdf |
| Sjöbogrön | #87aa84 | #c3d5c2 |
| Sjöboguld | #9b895d | #cdc3ad |
| Sjöborosa | #ee73a0 | #f6b8d0 |
| Sjöboorange | #f28d35 | #f9c699 |
| Sjöbosvart | #000000 | #9d9d9c |

Logotypens egna färger: guld #9b895d, röd #bf292b, svart #000000. De används bara i
logotypen.

### Kontrast

WCAG 2.1 AA kräver 4,5:1 för vanlig text och 3:1 för stor text och grafiska
komponenter. Kontrollera varje kombination med kod innan den används. Några saker att
veta:

- Vit text på #248187 ger 4,6:1. Det klarar AA med liten marginal. #248187 som
  textfärg på ljusgrå bakgrund (#f5f5f5) ger bara 4,2:1 och klarar inte AA för vanlig
  text. Använd #248187 för text bara på vit bakgrund, och mät varje ny kombination.
- Profilfärgerna i 50 procent är bakgrundsfärger. Text på dem ska vara svart.
- Ljusa profilfärger (Sjöboorange, Sjöborosa, Sjöboblå 100 %) fungerar inte som
  textfärg på vitt.
- Kontrastläget i gränssnittet är svart på vitt och behöver inte följa profilen.

## Typsnitt

För webb och digitala produktioner: **Lato**. Rubriker i Lato Bold eller Black,
brödtext i Lato Regular. Ladda typsnittet lokalt från repot (fonts i `ui/profil/`)
och inte från Google Fonts, så att stationerna inte är beroende av en extern tjänst
och inga besökares anrop går till Google. Lato har öppen licens (SIL OFL).

## Logotyp

Filerna ligger i `ui/profil/sjobo/` med en egen README. Kort:

- Placeras till höger, gärna nere till höger, så att björnen tittar in mot innehållet.
- Frizon minst 25 procent av logotypens höjd.
- Liggande färgversion på ljus bakgrund, negativ (vit) på mörk.
- Skala aldrig ojämnt och beskär aldrig.

Avsändaren är alltid Sjöbo kommun, inte förvaltningen eller biblioteket som
organisation. Bibliotekets namn får stå i texten, till exempel "Sjöbo bibliotek" under
AI-värdens namn.

## Runda former

Runda bollar är kommunens återkommande grafiska element i bilder. I gränssnittet kan
rundade knappar och bubblor användas fritt. Kompletterande grafiska element används
sparsamt och ska förankras med kommunikatörerna.

## Bilder och AI-material

Kommunens rutiner för AI-bildmaterial gäller även gränssnittet:

- Fotorealistiska bilder på människor får inte användas.
- AI-material får inte föreställa en verklig plats, person eller händelse.
- Allt AI-material märks, både i filnamnet (`_AIgen` eller `_AIassist`) och vid
  användning.
- Ska AI-material användas externt hanterar kommunikation centralt frågan.

Avataren i `ui/components/avatar.js` är en illustration ritad med kod av en
AI-assistent. Den är alltså AI-genererad och visas externt. Den får inte bytas mot en
fotorealistisk eller AI-genererad bild av en människa. Om den ska stå kvar i drift
avgör Peter tillsammans med kommunikatörerna, se `docs/uppdrag/beslut-peter.md`.
Bygg därför avataren som en utbytbar del: en inställning ska kunna slå av den eller
byta den mot en bild som kommunen äger.
