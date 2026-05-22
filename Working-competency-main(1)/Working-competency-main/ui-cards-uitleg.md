# Uitleg van de UI cards

Dit document legt alle UI cards van dit project uit in eenvoudige taal. De tekst is bedoeld voor iemand die nog weinig of geen voorkennis heeft van UI5, component cards of de onderliggende technische logica. Daarom wordt niet alleen beschreven wat elke kaart toont, maar ook waarom ze bestaat en hoe ze stap voor stap werkt. In de broncode van deze repository staan veertien kaartmodules, en die worden hieronder allemaal behandeld.

## Eerst de basis: wat is hier eigenlijk een UI card?

Een UI card is een compacte bouwsteen in een dashboard of applicatie. Je kan zo'n card zien als een klein informatieblok met een duidelijk doel. Eén card toont bijvoorbeeld een totaalscore, een andere toont een lijst van vervallen certificaten, en nog een andere laat de gebruiker een rol kiezen.

Het grote voordeel van deze aanpak is dat complexe informatie opgesplitst wordt in kleinere, begrijpelijke stukken. In plaats van alles op één grote pagina te tonen, krijgt de gebruiker verschillende kaarten die elk een eigen taak hebben.

In dit project zijn de cards gebouwd als UI5 component cards. Dat betekent dat elke card niet alleen een stukje opmaak bevat, maar ook eigen logica heeft om data op te halen, te verwerken en te tonen.

## Belangrijke begrippen in eenvoudige taal

Voor de uitleg van de kaarten is het handig om eerst enkele begrippen te verduidelijken.

### 1. Backend

De backend is het systeem waar de gegevens vandaan komen. De kaarten tonen zelf geen vaste data die hard in de code staat. Ze vragen informatie op bij een backendservice. In dit project gebeurt dat via een request naar `/icv/employees/me`.

Eenvoudig gezegd: de card vraagt aan de backend wie de huidige medewerker is, welke rollen die persoon heeft, welke competenties en certificaten er bestaan, en welke assessmentgegevens daarbij horen.

### 2. Destination

In de code gebruiken de kaarten een destination met de naam `comp_mat_card`. Een destination is eigenlijk een geconfigureerde verbinding naar een backend. De kaart hoeft dus niet overal letterlijk het volledige backendadres te kennen. Ze vraagt eerst de destination op en gebruikt die daarna om het juiste endpoint te bereiken.

### 3. Rol

Een rol is de functie of context waarin een medewerker bekeken wordt. Eén medewerker kan meerdere rollen hebben. Dezelfde persoon kan bijvoorbeeld in verschillende contexten beoordeeld worden. Daarom is het belangrijk dat de gebruiker een rol kan selecteren.

Zodra een rol gekozen is, tonen andere kaarten alleen de informatie die relevant is voor die rol.

### 4. Assessment

Een assessment is een evaluatie of meting van een bepaald onderdeel. Dat kan gaan over een competentie of over een certificaat. De kaarten gebruiken die assessments als basis om scores, tekorten en lijsten op te bouwen.

### 5. Competentie

Een competentie is een vaardigheid, kennisdomein of bekwaamheid die relevant is voor een rol. De competency component card bekijkt vooral deze data.

### 6. Certificaat

Een certificaat is een formele kwalificatie of geldige erkenning. Certificaten hebben vaak een vervaldatum. Daarom bestaat er in deze toepassing een aparte kaart voor overdue certificates.

### 7. Gap

Een gap geeft aan of er een tekort of overschot is tussen wat verwacht wordt en wat gemeten is.

In eenvoudige termen:

- een negatieve gap betekent dat er iets ontbreekt
- een gap van nul of hoger betekent dat het niveau gehaald is of overschreden wordt

De kaarten verdelen die gaps in categorieën zodat de gebruiker sneller ziet waar de grootste problemen zitten.

## Hoe werken de kaarten samen?

De kaarten staan niet volledig los van elkaar. Ze werken samen via een gedeelde rolfilter.

Dat gebeurt als volgt:

- de gebruiker kiest een rol in de role filter card
- die gekozen rol wordt opgeslagen in `localStorage`
- er wordt ook een browser-event verstuurd
- andere kaarten luisteren naar dat event
- zodra het event binnenkomt, laden die kaarten hun data opnieuw

Dit is een belangrijk ontwerpprincipe in het project. Het betekent dat één kaart de context kan aanpassen, terwijl de andere kaarten automatisch volgen. Daardoor krijgt de gebruiker overal dezelfde rolcontext te zien, zonder dat hij elke kaart apart moet instellen.

## 1. Aggregated score card

### Wat is het doel van deze kaart?

De aggregated score card toont een samenvattende score voor de geselecteerde rol. Ze probeert dus niet alle details van alle assessments apart te tonen. In plaats daarvan geeft ze één algemeen beeld van de role readiness.

Je kan deze kaart zien als de snelste samenvatting van de situatie. Als een gebruiker weinig tijd heeft en meteen wil weten hoe goed de medewerker aansluit bij een bepaalde rol, dan is dit de eerste kaart die bekeken wordt.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet op deze kaart onder andere:

- een headline die de score interpreteert
- de naam van de medewerker
- de naam van de geselecteerde rol
- een grote percentagescore
- een voortgangsbalk of `ProgressIndicator`
- een shortfall, dus hoeveel nog ontbreekt tot 100%

Daardoor is de kaart visueel eenvoudig te begrijpen. Zelfs zonder de technische achtergrond te kennen, kan een gebruiker meestal snel afleiden of de situatie goed, matig of problematisch is.

### Waarom is deze kaart nuttig?

Deze kaart is nuttig omdat ze complexiteit reduceert. In een systeem met veel competenties, certificaten en individuele assessments is het voor een gebruiker moeilijk om meteen het totaalbeeld te zien. De aggregated score card lost dat op door één overkoepelende indicator te tonen.

Dat maakt de kaart geschikt voor:

- dashboards voor leidinggevenden
- snelle statuscontrole
- eerste oriëntatie voordat men in detail gaat kijken

### Hoe werkt deze kaart technisch stap voor stap?

De werking kan eenvoudig opgesplitst worden in enkele stappen.

1. De kaart start op als een UI5 component.
2. Ze maakt een lokaal viewmodel aan waarin tijdelijke gegevens worden bijgehouden, zoals `busy`, `score`, `roleTitle` en `error`.
3. Wanneer de card klaar is, roept ze `onCardReady` op.
4. In dat moment haalt de kaart de gedeelde rol op uit `localStorage`.
5. Daarna vraagt ze via de destination `comp_mat_card` data op uit de backend.
6. De backendrespons bevat onder andere medewerkersinformatie en beschikbare rollen.
7. De kaart bepaalt welke rol actief moet zijn.
8. Vervolgens zoekt ze in die rol naar statusinformatie, waaronder een numerieke score.
9. Die score wordt afgerond, begrensd tussen 0 en 100 en omgezet naar tekst en kleurstatus.
10. Ten slotte wordt het model geüpdatet en verschijnt de informatie in de view.

### Hoe kiest de kaart de actieve rol?

Dit is een belangrijk deel van de logica. De kaart kiest niet zomaar willekeurig een rol. Ze volgt een vaste volgorde:

- eerst kijkt ze of er al een gedeelde rol gekozen is in `localStorage`
- als die er niet is, kijkt ze naar de huidige rol uit de backend
- daarna naar een defaultrol
- als ook dat ontbreekt, kiest ze de eerste beschikbare rol uit de lijst

Zo zorgt de kaart ervoor dat ze altijd in een zinvolle context opent.

### Hoe wordt de score geïnterpreteerd?

De numerieke score is op zichzelf al nuttig, maar de kaart vertaalt die ook naar een betekenisvolle toestand.

In eenvoudige woorden:

- een hoge score betekent dat de medewerker sterk aansluit bij de rol
- een middenscore betekent dat er nog aandachtspunten zijn
- een lage score betekent dat er duidelijke risico's of tekorten zijn

De code vertaalt dat naar een visuele state zoals `Success`, `Warning` of `Error`. Daardoor hoeft de gebruiker de cijfers niet volledig te interpreteren om de boodschap te begrijpen.

### Wat gebeurt er bij een fout?

Als het laden van data mislukt, toont de kaart geen crash of lege technische foutpagina. Ze vult het model met een foutboodschap zoals “Failed to load data” en toont die in de view via een `MessageStrip`.

Dat is belangrijk voor gebruiksvriendelijkheid. De gebruiker ziet dan dat het probleem bij het laden ligt, en niet dat de applicatie volledig kapot is.

### Samengevat

De aggregated score card is dus de samenvattende kaart van het geheel. Ze beantwoordt vooral deze vraag:

“Hoe goed scoort deze medewerker in het algemeen voor de gekozen rol?”

## 2. Overdue certificates card

### Wat is het doel van deze kaart?

De overdue certificates card toont welke certificaten vervallen zijn en dus opvolging nodig hebben. Deze kaart is veel concreter en operationeler dan de aggregated score card.

Waar de aggregated score een algemene status geeft, toont deze kaart specifieke items waarop actie nodig is.

### Wat betekent “overdue” hier?

“Overdue” betekent dat een certificaat niet meer geldig is of dat de geldigheidsdatum voorbij is. In organisaties is dat vaak belangrijk omdat een vervallen certificaat kan betekenen dat iemand een bepaalde taak tijdelijk niet meer mag uitvoeren of dat er een hernieuwing nodig is.

### Welke variant staat hier in de repository?

In de broncode staat de kaart als `overdue_certificates_card`. Daarnaast bestaan er in de package-opbouw onder `__contents` ook gebouwde artefacten van kaarten. Voor de functionele uitleg is dat onderscheid minder belangrijk dan de businesslogica zelf.

Voor een scriptie is het belangrijkste dus niet een eventueel verschil tussen buildvarianten, maar het feit dat deze kaart certificeringen met overdue-status filtert en die op een bruikbare manier aan de gebruiker toont.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet op deze kaart:

- een titel of headline
- de naam van de medewerker
- een korte samenvattingstekst
- het aantal overdue certificaten
- een lijst met vervallen certificaten
- per item een naam, een vervaldatum en een statusregel

Daardoor kan de gebruiker heel snel zien hoeveel problemen er zijn en welke concrete certificaten aandacht vragen.

### Hoe werkt deze kaart technisch stap voor stap?

De werking verloopt als volgt:

1. De kaart start op en maakt een eigen JSON-model aan.
2. In dat model zitten onder andere `busy`, `fullName`, `summaryText`, `overdueCount`, `items` en `error`.
3. Zodra de card klaar is, wordt data opgevraagd via de destination `comp_mat_card`.
4. De kaart haalt alle assessments van de medewerker op.
5. Daarna filtert ze alleen de assessments die certificaten voorstellen.
6. Vervolgens houdt ze alleen die certificaten over die de juiste overdue status hebben.
7. De overblijvende items worden gesorteerd op vervaldatum.
8. Voor elk item wordt een leesbare titel, subtitel en overdue-infotext opgebouwd.
9. Tot slot wordt het aantal items berekend en alles in het model geplaatst.

### Hoe filtert de kaart de juiste data?

De kaart gebruikt twee voorwaarden:

- het assessment moet van het type `Certification` zijn
- de status moet `O` zijn

Alleen wanneer beide voorwaarden waar zijn, wordt het item als overdue certificaat beschouwd.

Dat is belangrijk omdat de backend meestal veel meer assessments bevat dan alleen vervallen certificaten. Zonder filtering zou de kaart dus irrelevante of misleidende informatie tonen.

### Hoe wordt de overdue-informatie leesbaar gemaakt?

De backend levert een datum, maar een datum alleen zegt niet altijd genoeg. Daarom rekent de kaart ook uit hoeveel dagen een certificaat overdue is.

In gewone taal doet de kaart dit:

- ze neemt de vervaldatum van het certificaat
- ze vergelijkt die met vandaag
- daarna berekent ze het verschil in dagen
- vervolgens toont ze bijvoorbeeld “3 day(s) overdue”

Zo hoeft de gebruiker niet zelf te rekenen.

### Waarom is deze kaart belangrijk?

Deze kaart ondersteunt operationele opvolging. Een manager, HR-medewerker of coördinator kan meteen zien welke certificaten vernieuwd moeten worden. Ze is dus veel actiegerichter dan de meer analytische kaarten.

### Wat gebeurt er als er geen overdue certificaten zijn?

Dan toont de kaart geen fout, maar een positieve toestand. De samenvattingstekst wordt dan iets zoals “No overdue certificates”. Dat is belangrijk, want geen resultaten betekent in dit geval meestal goed nieuws en geen technisch probleem.

### Wat gebeurt er bij een fout?

Als het laden van de backendgegevens mislukt, vult de kaart het model met een foutboodschap en toont ze die via een `MessageStrip`.

### Samengevat

De overdue certificates card beantwoordt vooral deze vraag:

“Welke certificaten van deze medewerker zijn vervallen en vragen onmiddellijke opvolging?”

## 3. Role filter card

### Wat is het doel van deze kaart?

De role filter card is een stuurkaart. Ze toont zelf niet de belangrijkste inhoudelijke analyse, maar ze bepaalt wel in welke rolcontext de andere kaarten werken.

Je kan deze kaart zien als de centrale schakel van het dashboard. Zonder deze kaart zouden de andere kaarten geen gemeenschappelijke selectie hebben.

### Wat ziet de gebruiker op het scherm?

De kaart is visueel eenvoudig. De gebruiker ziet:

- een label bij het selectieveld
- een dropdown (`Select`) met beschikbare rollen
- eventueel een foutmelding

Die eenvoud is bewust. De kaart moet vooral duidelijk en snel bruikbaar zijn.

### Waarom is deze kaart nodig?

Een medewerker kan meerdere rollen hebben. Stel dat iemand zowel in rol A als in rol B beoordeeld kan worden. Dan moeten de andere kaarten weten voor welke rol ze data moeten tonen.

De role filter card lost dat probleem op door één gedeelde keuze te laten maken die door de rest van het dashboard gevolgd wordt.

### Hoe werkt deze kaart technisch stap voor stap?

De werking is als volgt:

1. De kaart start op en maakt een JSON-model aan.
2. Dat model bevat vooral een lijst van rollen, de geselecteerde rol en een foutstatus.
3. Daarna vraagt de kaart via de backend de gegevens van de medewerker op.
4. Uit de backendrespons haalt ze alle unieke rollen.
5. Vervolgens bepaalt ze welke rol geselecteerd moet zijn.
6. Die rol wordt in het model gezet en dus zichtbaar in de dropdown.
7. Als de gebruiker daarna een andere rol kiest, wordt die nieuwe keuze opgeslagen.
8. Er wordt ook een browser-event verstuurd zodat de andere kaarten weten dat de rol veranderd is.

### Hoe worden de rollen verzameld?

De kaart leest de rollen uit de backendrespons en haalt alleen unieke rollen over. Dat is belangrijk omdat dubbele rollen anders meerdere keren in de dropdown zouden kunnen verschijnen.

Voor elke rol wordt meestal een sleutel en een leesbare titel opgebouwd:

- de sleutel is wat de code gebruikt
- de titel is wat de gebruiker ziet

### Hoe wordt de keuze gedeeld met andere kaarten?

Dit is het belangrijkste deel van deze kaart.

Wanneer de gebruiker een nieuwe rol kiest:

- slaat de kaart de rol op in `localStorage`
- verstuurt ze een event met de naam `competencycards:sharedRoleFilterChanged`

Andere kaarten luisteren naar dat event. Zodra ze het ontvangen, halen ze de nieuwe rol op en laden ze hun data opnieuw.

Dat is een eenvoudige maar doeltreffende manier om kaarten te synchroniseren.

### Waarom is dit architecturaal interessant?

De kaarten zijn hierdoor los gekoppeld. Dat betekent:

- de kaarten kennen elkaar niet rechtstreeks
- er is geen zware centrale applicatiestate nodig
- toch reageren ze samen op dezelfde gebruikersactie

Voor een scriptie is dit een goed voorbeeld van lichte communicatie tussen UI-componenten.

### Wat gebeurt er bij een fout?

Als de rollen niet geladen kunnen worden, toont de kaart een foutmelding in de interface. De dropdown blijft dan wel bestaan, maar de gebruiker ziet duidelijk dat de data niet correct kon worden opgehaald.

### Samengevat

De role filter card beantwoordt vooral deze vraag:

“Voor welke rol moeten alle andere kaarten hun informatie tonen?”

## 4. Competency component card

### Wat is het doel van deze kaart?

De competency component card analyseert hoe competenties van een medewerker verdeeld zijn over verschillende gapcategorieën. Ze kijkt dus niet naar certificaten, maar naar rolrelevante competenties.

Het doel is om zichtbaar te maken waar de grootste inhoudelijke tekorten zitten. Niet alleen het totaal is hier belangrijk, maar vooral de verdeling.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet in deze kaart:

- de naam van de medewerker
- de naam van de geselecteerde rol
- een visuele donutgrafiek
- een legenda naast de grafiek
- bij interactie een popover met detailitems

De donutgrafiek verdeelt de competenties in drie groepen. Zo kan de gebruiker meteen zien of de meeste competenties onder niveau, bijna op niveau of op niveau zitten.

### Waarom is deze kaart nuttig?

Een algemene score zegt dat er een probleem is of niet, maar zegt niet waar het probleem precies zit. Deze kaart maakt dat wel zichtbaar.

Ze helpt dus om bijvoorbeeld deze vragen te beantwoorden:

- zitten de meeste competenties duidelijk onder het gewenste niveau?
- zijn er vooral kleine tekorten?
- zijn de meeste competenties al voldoende ontwikkeld?

### Hoe werkt deze kaart technisch stap voor stap?

De werking kan als volgt uitgelegd worden.

1. De component start op en maakt een viewmodel aan.
2. Dat model bevat onder andere `gapCounts`, `bucketItems`, `chartMarkup`, `selectedRoleId` en `error`.
3. Zodra de card klaar is, leest ze de gedeelde rol uit `localStorage`.
4. Daarna wordt de backend aangeroepen.
5. De kaart bepaalt welke rol actief is.
6. Vervolgens wordt een mapping gemaakt van competentie-ID's die relevant zijn voor die rol.
7. Uit alle assessments worden alleen de relevante competentie-items behouden.
8. Duplicaten worden verwijderd op basis van `assessmentId`.
9. Daarna wordt per item gekeken in welke gapcategorie het hoort.
10. De aantallen per categorie worden opgeteld.
11. Op basis van die aantallen wordt HTML- en SVG-markup opgebouwd voor de donutgrafiek.
12. Ten slotte wordt alles in het model gezet zodat de view de grafiek kan tonen.

### Hoe filtert deze kaart de juiste assessments?

De kaart gebruikt niet zomaar alle assessments. Ze doet eerst een inhoudelijke selectie.

Ze sluit certificaten uit en houdt alleen competentiegerelateerde items over. Daarnaast kijkt ze of de competentie-ID behoort tot de geselecteerde rol. Dat is belangrijk, want anders zou de kaart ook competenties tonen die niet relevant zijn voor de gekozen rol.

Met andere woorden: deze kaart toont niet alle mogelijke competenties van de medewerker, maar alleen de competenties die betekenisvol zijn binnen de huidige rolcontext.

### Hoe worden de gapcategorieën opgebouwd?

De kaart gebruikt drie categorieën:

- `Gap < -1`
- `Gap = -1`
- `Gap >= 0`

In eenvoudige taal:

- `Gap < -1` betekent een duidelijk tekort
- `Gap = -1` betekent een beperkt tekort
- `Gap >= 0` betekent dat het gewenste niveau gehaald is of beter

Deze indeling maakt het voor de gebruiker makkelijker om prioriteiten te zien.

### Waarom wordt er zelf HTML en SVG opgebouwd?

De grafiek wordt niet met een standaard chartcontrol gemaakt. In plaats daarvan genereert de component zelf de nodige markup en zet die in een `core:HTML` control.

Dat heeft enkele voordelen:

- de ontwikkelaar heeft volledige controle over het uiterlijk
- de segmenten van de donut kunnen precies op maat opgebouwd worden
- de interactiviteit kan rechtstreeks aan de gegenereerde elementen gekoppeld worden

Dit is iets technischer, maar voor een scriptie is het interessant omdat het toont dat de kaart niet alleen data toont, maar ook een op maat gemaakte visualisatie construeert.

### Hoe werkt de interactie met de popover?

De donutgrafiek en legenda bevatten `data-gap-bucket` attributen. Dat zijn kleine markeringen in de HTML die aangeven bij welke categorie een element hoort.

Wanneer de gebruiker op een segment of legenda-item klikt:

- vangt de controller die klik op
- de controller zoekt welke bucket aangeklikt werd
- daarna opent hij een `Popover`
- in die popover verschijnt een lijst met de competenties uit die categorie

Zo krijgt de gebruiker eerst een compacte samenvatting en daarna, op aanvraag, de detailinformatie.

### Waarom is deze kaart analytisch sterk?

Deze kaart gaat verder dan een simpele lijst. Ze groepeert, visualiseert en maakt interactief inzicht mogelijk. Daarom is dit een sterke analytische kaart. Ze helpt de gebruiker niet alleen om data te lezen, maar ook om patronen te herkennen.

### Wat gebeurt er bij een fout?

Als de backendaanroep mislukt, wordt het model niet met oude of misleidende waarden gevuld. De kaart zet dan de tellingen terug naar nul, maakt een lege grafiek en toont een foutmelding.

### Samengevat

De competency component card beantwoordt vooral deze vraag:

“Hoe zijn de rolrelevante competenties van deze medewerker verdeeld over verschillende niveaus van tekort of geschiktheid?”

## 5. Assessment component card

### Wat is het doel van deze kaart?

De assessment component card lijkt qua opbouw sterk op de competency component card, maar ze focust op certificeringsassessments in plaats van op rolrelevante competenties.

De kaart is dus bedoeld om te laten zien hoe certificaten of certificeringsgerelateerde assessments verdeeld zijn over de verschillende gapniveaus.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet:

- de naam van de medewerker
- de geselecteerde rol
- een donutgrafiek
- een legenda met aantallen per categorie
- eventueel een foutmelding

Visueel lijkt deze kaart sterk op de competency component card. Dat is logisch, want beide kaarten willen verdelingen tonen. Het verschil zit vooral in welke data erin terechtkomt.

### Waarom bestaat deze kaart naast de competency component card?

Competenties en certificaten zijn niet hetzelfde.

Competenties gaan meestal over bredere bekwaamheden of vaardigheden. Certificaten zijn vaak formeler en kunnen verlopen. Omdat die twee soorten informatie functioneel anders zijn, is het nuttig om ze ook in aparte kaarten te analyseren.

Daardoor krijgt de gebruiker een duidelijker onderscheid tussen:

- algemene inhoudelijke bekwaamheid
- formele of gecertificeerde kwalificaties

### Hoe werkt deze kaart technisch stap voor stap?

De werking lijkt sterk op die van de competency component card:

1. De component start op en maakt een viewmodel aan.
2. Ze leest de gedeelde rolfilter uit.
3. Daarna roept ze de backend aan via `comp_mat_card`.
4. Ze bepaalt welke rol actief is.
5. Duplicaten in assessments worden verwijderd.
6. Daarna filtert de component alleen de assessments van het type `Certification`.
7. Elk assessment wordt in een gapcategorie geplaatst.
8. De aantallen per categorie worden opgeteld.
9. Daaruit wordt opnieuw HTML- en SVG-markup gemaakt voor een donutgrafiek.
10. De view toont vervolgens het resultaat.

### Welke gapcategorieën gebruikt deze kaart?

Ook hier zijn er drie categorieën:

- `Gap < -1`
- `Gap = -1`
- `Gap >= 0`

Dat betekent dat de gebruiker op een consistente manier naar de data kan kijken. Zowel bij competenties als bij certificeringsassessments blijft de logica van de visualisatie gelijkaardig.

### Waarom is dat onderscheid belangrijk?

Het onderscheid is belangrijk omdat een gebruiker anders te veel verschillende soorten data door elkaar zou zien. Door certificaten apart te analyseren, kan men sneller zien of het probleem vooral ligt in formele certificering of eerder in bredere competentieontwikkeling.

### Hoe verschilt deze kaart van de overdue certificates card?

Dat is een belangrijk onderscheid.

De overdue certificates card vraagt:

“Welke certificaten zijn vervallen?”

De assessment component card vraagt eerder:

“Hoe zijn de certificeringsassessments verdeeld over verschillende gapniveaus?”

De eerste kaart is dus operationeel en actiegericht. De tweede kaart is analytischer en meer gericht op verdeling en patroonherkenning.

### Wat gebeurt er bij een fout?

Bij een fout wordt het model met veilige standaardwaarden gevuld en verschijnt een foutmelding in de view. De kaart blijft dus stabiel, ook als de backend tijdelijk niet beschikbaar is.

### Samengevat

De assessment component card beantwoordt vooral deze vraag:

“Hoe ziet de verdeling van certificeringsassessments eruit voor de geselecteerde rol?”

## 6. Assessments card

### Wat is het doel van deze kaart?

De assessments card geeft een breder analytisch overzicht van alle assessments samen. Waar de assessment component card inzoomt op certificeringsassessments, groepeert deze kaart het volledige assessmentlandschap in drie duidelijke categorieen.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet vooral een samenvatting van aantallen in drie groepen:

- `On Track`
- `Minor Gap`
- `Major Gap`

Daardoor wordt meteen zichtbaar hoeveel assessments goed zitten, hoeveel kleine tekorten hebben en hoeveel duidelijk problematisch zijn.

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart haalt opnieuw data op via de destination `comp_mat_card` en leest de assessments uit `/icv/employees/me`. Daarna wordt voor elk assessment de gapwaarde gelezen.

De indeling is eenvoudig:

- gap groter dan of gelijk aan nul wordt `On Track`
- gap exact `-1` wordt `Minor Gap`
- gap kleiner dan `-1` wordt `Major Gap`

De kaart bewaart die groepering ook intern, zodat de visualisatie of verdere interactie op die gegroepeerde data kan steunen.

### Waarom is deze kaart nuttig?

Deze kaart is nuttig wanneer de gebruiker niet alleen naar een score wil kijken, maar wil weten hoe de totale populatie assessments verdeeld is. Ze zit dus tussen een pure totaalscore en een detailkaart in.

### Samengevat

De assessments card beantwoordt vooral deze vraag:

“Hoe zijn alle assessments samen verdeeld over goed, licht problematisch en sterk problematisch?”

## 7. All assessments card

### Wat is het doel van deze kaart?

De all assessments card is een lijstkaart die alle assessments zichtbaar maakt in een meer operationele vorm. In plaats van samenvattende tellingen of grafieken te tonen, laat ze concrete items zien die de gebruiker stuk voor stuk kan lezen.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet:

- een lijst van assessmentitems
- een teller met het aantal zichtbare items
- een filter waarmee gewisseld kan worden tussen alle items, alleen certificeringen of alleen competenties

Deze kaart is vooral nuttig wanneer iemand niet alleen patronen wil zien, maar de concrete onderliggende records wil doorlopen.

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart haalt de data een eerste keer op uit `/icv/employees/me` en bewaart die daarna in een modulecache. Wanneer de gebruiker van filter verandert, wordt de backend niet opnieuw aangesproken. De kaart bouwt dan gewoon een nieuwe lijst op basis van de gecachte data.

De filtering gebeurt in drie standen:

- `all`: alles tonen
- `Certification`: alleen assessments met certificeringsschaal
- `Competency`: alleen niet-certificeringsitems

Per item wordt ook een beschrijving opgebouwd. Bij certificaten gaat dat meestal over de geldigheidsdatum. Bij competenties wordt eerder een status zoals `On Track`, `Minor Gap` of `Major Gap` getoond.

### Waarom is deze kaart nuttig?

Deze kaart is de meest directe brug tussen analyse en detail. De gebruiker hoeft niet eerst via een popover of extra navigatie naar de concrete items te gaan, maar krijgt ze meteen in een lijst.

### Samengevat

De all assessments card beantwoordt vooral deze vraag:

“Welke assessmentitems bestaan er concreet, en wil ik daarvan alles, alleen certificeringen of alleen competenties zien?”

## 8. Assessment detail card

### Wat is het doel van deze kaart?

De assessment detail card is een compacte detailkaart die geen volledige lijst toont, maar wel heel snel laat zien hoeveel rolrelevante assessments in elke gapklasse vallen.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet normaal drie regels of blokken:

- `Gap > 0`
- `Gap = -1`
- `Gap < -1`

Naast elke regel staat het aantal assessments dat in die categorie valt.

### Hoe werkt deze kaart technisch in grote lijnen?

Deze kaart leest eerst de huidige rol uit de kaartconfiguratie of filterinstelling. Daarna roept ze `/icv/employees/me` op, eventueel met `targetRoles` als parameter. Uit alle assessments houdt ze alleen de rolrelevante items over voor de geselecteerde rol.

Pas daarna telt ze hoeveel items in elk gapvak zitten. Daardoor is deze kaart kleiner en specifieker dan de assessments card: ze toont niet alle assessments in het algemeen, maar alleen de relevante set voor de gekozen context.

### Waarom is deze kaart nuttig?

Deze kaart is nuttig wanneer je in een compacte vorm wil zien waar de rolrelevante knelpunten zitten, zonder meteen een volledige lijst of donutvisualisatie te openen.

### Samengevat

De assessment detail card beantwoordt vooral deze vraag:

“Hoeveel rolrelevante assessments zitten voor deze selectie in elke gapcategorie?”

## 9. Certification assessments card

### Wat is het doel van deze kaart?

De certification assessments card is een analytische kaart die alleen certificeringsassessments bekijkt en die opnieuw groepeert volgens gapniveau.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet een verdeling van certificeringsassessments over:

- `On Track`
- `Minor Gap`
- `Major Gap`

Bij interactie kan de gebruiker ook detailitems openen per categorie.

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart luistert naar dezelfde gedeelde rolfilter als andere kaarten via `localStorage` en het event `competencycards:sharedRoleFilterChanged`. Zodra de rol verandert, roept de kaart haar data opnieuw op.

Bij het ophalen filtert ze de assessments naar items waarvan het type `Certification` is. Daarna worden die ingedeeld in de drie gapgroepen. Wanneer de gebruiker op een segment klikt, opent een popover met de betreffende certificaten, inclusief status en geldigheidsdatum.

### Waarom is deze kaart nuttig?

Deze kaart is analytisch sterker dan een gewone certificatenlijst, omdat ze onmiddellijk laat zien of de problemen zich opstapelen in een bepaalde categorie. Ze combineert dus focus op certificaten met patroonherkenning.

### Samengevat

De certification assessments card beantwoordt vooral deze vraag:

“Hoe zijn de certificeringsassessments voor de gekozen rol verdeeld over de verschillende gapniveaus?”

## 10. Certifications list card

### Wat is het doel van deze kaart?

De certifications list card is de eenvoudige lijstvariant voor certificaten. Ze toont niet de verdeling, maar de concrete certificeringsitems zelf.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet per certificaat onder andere:

- de naam van het certificaat
- de geldigheidsdatum
- de statustekst
- een visuele highlight zoals `Success`, `Warning` of `Error`

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart haalt alle assessments op en filtert vervolgens alleen die records waarvan `status.type` gelijk is aan `Certification`. Daarna wordt per item een leesbare titel, geldigheidsregel en highlight opgebouwd.

De highlight wordt afgeleid van de kleurinformatie die vanuit de status komt. Daardoor kan de gebruiker snel zien welke items geruststellend zijn en welke aandacht vragen.

### Waarom is deze kaart nuttig?

Deze kaart is nuttig voor iemand die geen geaggregeerde donut of score nodig heeft, maar een concrete, scanbare lijst van alle certificaten met hun toestand.

### Samengevat

De certifications list card beantwoordt vooral deze vraag:

“Welke certificaten bestaan er voor deze medewerker, en wat is hun huidige geldigheid of status?”

## 11. Competencies list card

### Wat is het doel van deze kaart?

De competencies list card doet voor competenties wat de certifications list card voor certificaten doet. Ze maakt de competentiegegevens rechtstreeks leesbaar in lijstvorm.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet per competentie:

- de naam
- een korte gapinterpretatie zoals `On Track`, `Minor Gap` of `Major Gap`
- een statustekst
- een visuele highlight

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart filtert uit alle assessments alleen die records waarvoor `status.type` gelijk is aan `Competency`. Daarna wordt de gapwaarde vertaald naar een leesbaar label.

Het effect is dat de gebruiker niet eerst cijfers of ruwe backendvelden hoeft te interpreteren. De kaart zet de technische data om naar begrijpelijke categorieen.

### Waarom is deze kaart nuttig?

Deze kaart is nuttig als aanvulling op de competency component card. De donut geeft het patroon, maar de lijst toont welke individuele competenties achter dat patroon zitten.

### Samengevat

De competencies list card beantwoordt vooral deze vraag:

“Welke competenties zijn er, en hoe staat elk item er afzonderlijk voor?”

## 12. Auto updated overview card

### Wat is het doel van deze kaart?

De auto updated overview card toont welke assessments automatisch geactualiseerd werden. Dat is belangrijk omdat niet elk assessment handmatig aangepast wordt; sommige items worden op basis van koppelingen of achtergrondlogica automatisch bijgewerkt.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet:

- een teller van auto-updated items tegenover het totaal aantal assessments
- een lijst van de automatisch bijgewerkte items
- per item het type, de status en bijkomende context zoals commentaar, curriculuminformatie of LMS-koppeling

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart laadt alle assessments en filtert daarna enkel de records waarvoor `autoUpdated === true`. Vervolgens bouwt ze per item een detailregel op.

Daarin wordt bijvoorbeeld getoond:

- of het om een competentie of certificering gaat
- of er commentaar aanwezig is
- of er een curriculum-ID of LMS-link gekoppeld is

De lijst wordt daarna alfabetisch gesorteerd, zodat de gebruiker ze makkelijk kan doorlopen.

### Waarom is deze kaart nuttig?

Deze kaart maakt de herkomst van updates transparanter. Voor functioneel beheer en auditing is dat belangrijk, omdat de gebruiker zo ziet welke informatie niet door handmatige beoordeling maar door automatische synchronisatie ontstaan is.

### Samengevat

De auto updated overview card beantwoordt vooral deze vraag:

“Welke assessments zijn automatisch bijgewerkt, en via welke gekoppelde informatie of logica lijkt dat gebeurd te zijn?”

## 13. Profile summary card

### Wat is het doel van deze kaart?

De profile summary card geeft context over de persoon achter alle assessments. Zonder die context zouden de andere kaarten veel technischer en abstracter aanvoelen.

### Wat ziet de gebruiker op het scherm?

De kaart toont onder andere:

- naam en initialen
- relatie tot de huidige gebruiker
- e-mailadres en user-ID
- jobcode en functienaam
- afdeling, divisie, locatie en land
- startdatum
- naam van de manager
- teamgrootte

### Hoe werkt deze kaart technisch in grote lijnen?

De kaart haalt de medewerkersdata op uit `/icv/employees/me` en neemt daaruit een reeks profielvelden over. Sommige waarden worden nog licht verwerkt, bijvoorbeeld:

- initialen worden afgeleid uit de naam
- de hire date wordt omgezet naar een leesbare datum
- de relationToCurrentUser wordt in hoofdletters gezet

### Waarom is deze kaart nuttig?

Deze kaart is nuttig omdat ze de rest van het dashboard inbedt in een herkenbare personeelscontext. Ze beantwoordt eerst wie de medewerker is, voordat de andere kaarten tonen hoe die persoon scoort.

### Samengevat

De profile summary card beantwoordt vooral deze vraag:

“Over welke medewerker gaat dit dashboard precies?”

## 14. Group component card

### Wat is het doel van deze kaart?

De group component card verschuift het perspectief van een individuele medewerker naar een team of competentiegroep. Ze toont dus niet meer alleen persoonlijke assessments, maar teamreadiness binnen een geselecteerde groep.

### Wat ziet de gebruiker op het scherm?

De gebruiker ziet hier meestal:

- een keuzelijst met groepen
- een readinesssamenvatting voor het geselecteerde team
- een donutverdeling over `At risk`, `Attention` en `Strong`
- een lijst van teamleden
- popovers met teamleden per categorie

### Hoe werkt deze kaart technisch in grote lijnen?

Deze kaart gebruikt een bredere backendstroom dan de individuele kaarten. Eerst haalt ze beschikbare groepen op via `/help/groups`. Daarna bepaalt ze voor de gekozen groep een boomstructuur van medewerkers en assessments via een groepstree-endpoint.

Op basis van die boomstructuur bouwt de kaart per teamlid een samenvatting op:

- hoeveel assessments relevant zijn
- hoeveel daarvan gehaald zijn
- hoeveel overdue of gepland zijn
- welk readinesspercentage daaruit volgt

Daarna worden de teamleden ingedeeld in drie readinessstaten:

- `Strong`
- `Attention`
- `At risk`

Die informatie voedt zowel de donut als de ledenlijst en de popovers.

### Waarom is deze kaart nuttig?

Deze kaart is belangrijk omdat ze het dashboard uitbreidt van individuele opvolging naar teamsturing. Een manager kan zo niet alleen een persoon, maar een hele groep analyseren en de risicocategorieen binnen het team zien.

### Samengevat

De group component card beantwoordt vooral deze vraag:

“Hoe staat een volledig team of competentiegroep ervoor, en welke medewerkers vragen de meeste aandacht?”

## Vergelijking van de veertien kaarten

Om het verschil tussen alle kaarten nog duidelijker te maken, kan je ze opdelen in enkele functionele groepen.

### 1. Sturings- en contextkaarten

Deze kaarten bepalen of verduidelijken de context waarin de rest werkt:

- de role filter card kiest de actieve rol
- de profile summary card toont over welke medewerker het gaat
- de group component card verlegt het perspectief van individu naar team of groep

### 2. Samenvattende kaarten

Deze kaarten geven snel een algemeen beeld:

- de aggregated score card geeft het totaalbeeld
- de assessments card groepeert alle assessments op hoog niveau
- de assessment detail card toont compacte tellingen per gapcategorie

### 3. Analytische verdelingskaarten

Deze kaarten gebruiken vooral grafische of gegroepeerde analyse:

- de competency component card analyseert rolrelevante competentiegaps
- de assessment component card analyseert certificeringsgaps
- de certification assessments card groepeert certificeringsassessments voor de gekozen rol

### 4. Lijst- en opvolgingskaarten

Deze kaarten tonen concrete items waarop de gebruiker kan inzoomen of actie ondernemen:

- de overdue certificates card toont concrete problemen die meteen opvolging vragen
- de all assessments card toont alle assessments met filters
- de certifications list card toont alle certificaten in lijstvorm
- de competencies list card toont alle competenties in lijstvorm
- de auto updated overview card toont welke items automatisch geactualiseerd werden

Je kan dus zeggen dat de kaarten samen een volledige informatieketen vormen:

- eerst wordt duidelijk over wie of over welke groep het gaat
- daarna kiest de gebruiker indien nodig een rol
- vervolgens ziet hij een algemene score of samenvatting
- daarna kan hij inzoomen op competenties, certificeringen, gaps of concrete lijstitems
- ten slotte kan hij opvolgen welke certificaten overdue zijn of welke assessments automatisch werden bijgewerkt

## Architecturale meerwaarde van deze oplossing

Voor een scriptie is het nuttig om ook het algemene ontwerp te benoemen. De meerwaarde van deze oplossing zit niet alleen in de individuele kaarten, maar ook in de manier waarop ze samen functioneren.

De belangrijkste sterke punten zijn:

- modulaire opbouw: elke kaart heeft een duidelijk afgebakende verantwoordelijkheid
- herbruikbare databron: meerdere kaarten gebruiken dezelfde backendbestemming
- gedeelde context: de rolfilter wordt centraal gedeeld
- duidelijke scheiding tussen context, samenvatting, analyse en operationele opvolging
- combinatie van individuele en teamgerichte inzichten
- fouttolerantie: kaarten tonen foutmeldingen in plaats van volledig te falen

Dat maakt het systeem begrijpelijker voor de gebruiker en beheersbaarder voor ontwikkelaars.

## Conclusie

Deze veertien UI cards zijn samen ontworpen om informatie over medewerkers, rollen, teams, competenties, certificaten en assessments op een gestructureerde manier te tonen.

De aggregated score card geeft een snel totaalbeeld. De profile summary card maakt duidelijk over wie het gaat. De role filter card bepaalt de gedeelde context voor rolgebonden kaarten. De competency component card, assessment component card, assessments card, assessment detail card en certification assessments card helpen om patronen en gapverdelingen te begrijpen. De all assessments card, certifications list card en competencies list card tonen concrete items in lijstvorm. De overdue certificates card legt de nadruk op dringende opvolging. De auto updated overview card toont automatische actualisaties. De group component card voegt daar nog een team- of groepsperspectief aan toe.

Voor iemand zonder voorkennis is het belangrijkste inzicht dit: de kaarten tonen niet allemaal hetzelfde, maar vullen elkaar aan. Sommige kaarten bepalen de context, andere vatten samen, andere analyseren patronen en nog andere tonen concrete opvolgitems. Samen helpen ze de gebruiker om van een algemene indruk naar gerichte analyse en concrete actie te gaan.