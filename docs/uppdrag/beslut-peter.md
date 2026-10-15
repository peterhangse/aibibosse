# Beslut som Peter (eller projektgruppen) äger

Kodagenten fattar inte de här besluten. Varje punkt har ett **standardval** som gäller
tills Peter bestämt annat, så att arbetet inte står still. Bygg alltid så att valet
går att ändra i inställningarna utan kodändring.

När Peter har bestämt: skriv beslutet och datumet under punkten, och ta bort
"Öppet". Fråga om ett beslut senast i den fas som står under "Behövs".

---

## 1. Namnet på skärmen
Öppet. Vägval 15: projektgruppen bestämmer. I kommunen används Aibi, i koden Bosse.
**Standard:** startdata för Sjöbo sätter namnet till Aibi. Koden har inget hårdkodat namn.
**Behövs:** fas 4.

## 2. Avataren
Öppet. Illustrationen är AI-genererad (ritad med kod av en AI-assistent). Enligt
kommunens rutiner ska externt AI-material hanteras av kommunikation centralt och märkas.
**Standard:** avataren finns kvar under utveckling. Inför test med besökare stängs den av
med en inställning om inget ok finns. Alternativ: en bild kommunen äger, eller bara namn
och roll i text.
**Behövs:** före pilot med besökare (fas 10).

## 3. Personalskärmen och interna dokument
Öppet. Bibliotekspersonalen har redan en intern assistent i Copilot Studio. Aibis
personalnivå riskerar att bli en andra.
**Standard:** personalskärmen finns kvar bakom inloggning. Inga interna dokument läggs in
i Aibi förrän Peter sagt ok och dataskyddsombudet har sagt sitt.
**Behövs:** fas 2.

## 4. Bibliotek och stationer
Öppet. Fem stationer: fyra bibliotek och Kulturhusets entré.
**Standard:** en station, Sjöbo bibliotek, i startdatan. Övriga läggs till i adminpanelen.
**Behövs:** fas 5. Vilka bibliotek, deras adresser, öppettider, meröppettider och
bemannade tider ska komma från personalen, aldrig gissas.

## 5. Telefonnummer som visas
Öppet. Visas när ingen personal finns och när tjänsten är nere.
**Standard:** inget nummer visas. Kommunens växel är 0416-270 00 (verifierat ur grafiska
manualen), men om det är rätt nummer för biblioteksfrågor avgör Peter.
**Behövs:** fas 5.

## 6. Synpunkter: funktionsbrevlåda och e-post
Öppet. Vägval 11: synpunkterna mejlas till en funktionsbrevlåda, aldrig en personlig
adress. Tjänsten behöver ett SMTP-relä, troligen från Unikom.
**Standard:** synpunktsknappen är avstängd tills både adress och SMTP finns. I
utvecklingen skickas e-posten till en lokal testserver (till exempel MailHog eller en
fil), aldrig ut.
**Behövs:** fas 6.

## 7. Återkoppling till besökarna
Öppet. Beslutades i första versionen av vägvalen (gamla V12) men ströks ur den
slutliga listan.
**Standard:** funktionen byggs men är avstängd.
**Behövs:** fas 6.

## 8. Enkätfrågornas formulering
Öppet. Vägval 2: två frågor efter avslutat samtal. Kravspecen föreslog "Fick du hjälp?"
och "Kändes det tryggt att kunna fråga här?".
**Standard:** de två frågorna, med svaren Ja, Delvis, Nej och Ja, Vet inte, Nej.
Redigerbara i adminpanelen.
**Behövs:** fas 6.

## 9. Språk som släpps
Öppet. Vägval 13: varje språk testas av någon som talar det innan det släpps.
**Standard:** svenska släppt. Engelska byggt men inte släppt. Andra språk läggs till i
listan och är avstängda tills Peter markerat dem som testade.
**Behövs:** fas 8. Vilka språk som prioriteras bestämmer projektgruppen.

## 10. Rösten
Öppet. Vägval 6: text och röst. Piper och Chatterbox provades i september och
underkändes. Ingen verklig persons röst får klonas utan skriftligt avtal.
**Standard:** tal till text med lokal Whisper på servern. Text till tal med webbläsarens
svenska röst. Uppläsning sker när besökaren trycker, inte automatiskt. Hälsning vid
närvaro är avstängd. Tysta timmar är tomma tills personalen fyllt i dem.
**Att veta:** Microsoft Edges "naturliga" röster körs i Microsofts moln. Då skickas
svarstexten (inte besökarens fråga) dit. Det kan vara godtagbart, men är ett beslut.
**Behövs:** fas 7.

## 11. Närvarosensorn
Öppet. Hur sensorn kopplas beror på hårdvaran som köps.
**Standard:** gränssnittet tolkar en inställbar tangent (förslag F13) som "någon är
nära". De flesta USB-sensorer kan ställas in att skicka en tangent. Inget registreras.
**Behövs:** fas 10, när hårdvaran är känd.

## 12. Katalogen
Öppet. Vilken sigel Sjöbos bibliotek har i Libris, om Libris Lånestatus är påslaget,
och hur ofta en BSKO-export kan fås. Svaren finns hos bibliotekarierna.
**Standard:** katalogen bygger bara på importerad export. Status "inne" visas aldrig utan
en levande källa.
**Behövs:** fas 9.

## 13. Hur pilotskärmen når servern
Öppet och blockerande för pilot med besökare. Bosgame är Peters egen maskin. För att en
skärm i biblioteket ska nå tjänsten krävs ett beslut med Unikom: tillfällig server i
kommunens nät, Bosgame på plats i kommunens nät, eller annat.
**Standard:** inget. Piloten körs på Bosgame i Peters nät tills beslutet finns. Uppdraget
levererar allt som behövs för att flytta (Docker, dokumentation).
**Behövs:** fas 10.

## 14. Hur länge obesvarade frågor sparas
Öppet. Vägval 18 och 19: dataskyddsombudet ska ha sagt sitt.
**Standard:** 30 dagar, eller tills personalen markerat frågan som klar.
**Behövs:** fas 2.

## 15. Krissvar
Öppet. Om någon skriver något som tyder på fara för liv ska svaret inte vara ett vanligt
nekande.
**Standard:** "Om du eller någon annan är i fara, ring 112. Du kan också vända dig till
personalen." Andra nummer (till exempel stödlinjer) läggs till först när Peter har
kontrollerat dem.
**Behövs:** fas 3.

## 16. Licens för repot
Öppet. Repot är publikt och tänkt att kopieras av andra kommuner, men saknar licens. Utan
licens får ingen formellt använda koden.
**Standard:** ingen licensfil läggs till. Peter tar frågan med kommunen. EUPL-1.2 och MIT
är vanliga val i offentlig sektor.
**Behövs:** fas 12.

## 17. Firebase-deployen
Öppet. Arbetsflödet faller vid varje push till `main`. När tjänsten serveras från samma
process som API:t behövs inte Firebase för gränssnittet, men en demosida kan vara
användbar.
**Standard:** lämnas som det är.
**Behövs:** fas 1.

## 18. Kioskvyn och landningssidan
Öppet. När svarskorten och språkvalet flyttat in i Bosse-vyn behövs inte kioskvyn.
**Standard:** båda flyttas till `ui/dev/` och länkas inte från medborgarskärmen.
**Behövs:** fas 4.

## 19. Azure OpenAI
Öppet. Kräver Azure-resurs i Sverige eller EU, nyckel i Key Vault eller `.env`,
utgiftstak, personuppgiftsbiträdesavtal och dataskyddsombudets bedömning. Embeddings
kan stanna lokalt eller flytta.
**Standard:** inget skickas till Azure. Fas 11 förbereder och testar mot en låtsasserver.
**Behövs:** efter fas 11, och bara med Peters uttryckliga ok.

## 20. Porten för den samlade tjänsten
Öppet. I dag finns tjänster på 8085 och 8086.
**Standard:** den samlade tjänsten körs på 8090 under utvecklingen, parallellt med de
gamla. När Peter sagt ok stoppas de gamla och den nya tar över 8086.
**Behövs:** fas 1.
