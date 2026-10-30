# Tilkobling af tjenester

Supabase-adressen, den offentlige nøgle og Web3Forms-nøglen er indsat i services-config.js. Supabase kræver, at SUPABASE-OPSAETNING.sql køres i projektets SQL Editor. Live statistik og modtagelse af feedback skal kontrolleres efter upload.

## Supabase
1. Opret et projekt i Supabase.
2. Kør SUPABASE-OPSAETNING.sql i projektets SQL Editor. Dette opretter private datatabeller og to serverfunktioner. Adgangskoden 1234 lagres som en hash på serveren; den findes ikke i hjemmesidens JavaScript. SQL-filen er kun til opsætning og bør ikke uploades til GitHub Pages.
3. Sæt projektets URL og offentlige publishable key (eller legacy anon key) i services-config.js. Brug aldrig service_role eller secret key.
4. Upload de opdaterede webfiler. Tilvælg statistik i pop-up'en, navigér rundt, klik tre gange på VIA-logoet, og log ind med 1234. Kontrollér, at data vises.

PIN 1234 er en svag kode. Den kan ændres i Supabase: update ai_private.admin set pin_hash=extensions.crypt('DIN NYE KODE',extensions.gen_salt('bf')) where id=true;
Tre klik er kun en genvej, ikke adgangsbeskyttelse. RPC'en kontrollerer koden på serveren. Før bred offentlig brug bør der tilføjes loginbegrænsning eller rigtig brugerlogin; denne første version har ingen begrænsning af PIN-forsøg. Indsendte statistikhændelser er browseroplysninger og kan ikke garanteres fri for robotter eller manipulation.

## Web3Forms
Den leverede adgangsnøgle er indsat i web3formsAccessKey i services-config.js. Modtageradressen bestemmes af nøglens opsætning hos Web3Forms.
Upload de opdaterede filer, send en test fra den publicerede side, og kontrollér modtagelsen i LGAD@VIA.DK. Ingen testmail er sendt som del af opdateringen.
Formularen bevarer teksten ved fejl og viser kun succes efter tjenestens bekræftelse.

## Statistik
Der registreres kun efter aktivt tilvalg. Titel og institution er valgfrie, og spring over giver ingen registrering. Knappen Statistikvalg er fjernet fra sidefoden. Førstegangsvalget huskes i browseren; tidligere registreringer slettes ikke automatisk. Browser-ID, valg og profil gemmes lokalt. Ved slettede browserdata vises pop-up'en igen.
Besøg er indlæsninger af hjemmesiden. Unikke besøgende er forskellige browser-ID'er. Periode, dagsfordeling, timer og ugedage beregnes på serveren i Europe/Copenhagen. Et downloadklik er ikke bevis for, at download blev fuldført. Appinstallationshændelser afhænger af browserens understøttelse.
SQL, live Supabase, browserdialoger og Web3Forms-levering kræver afprøvning efter tilkoblingen. Browsernes personidentifikation og blokering kan give undertælling.

## Upload
Upload alle webfiler og mapper, herunder services-config.js og admin-statistik.js. Gem SUPABASE-OPSAETNING.sql og denne vejledning til opsætningen; de behøver ikke være på den offentlige side.

## Anbefalinger via mail
Knappen åbner brugerens standard-mailprogram med en færdig anbefaling og hjemmesidens adresse. Der kræves ingen ekstra mailtjeneste. Ved åbning af en lokal HTML-fil tilføjes intet lokalt fil-link.
