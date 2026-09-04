# Pensionsblik

Pensionsblik er bygget på samme måde som campingappen Rejseklar: almindelig HTML, CSS og JavaScript-moduler uden React, TypeScript, pakkeinstallation eller byggeproces.

## Start appen lokalt

1. Åbn Terminal i denne projektmappe.
2. Kør `python3 -m http.server 4173`.
3. Åbn `http://localhost:4173` i Safari eller en anden browser.

Appen skal åbnes gennem den lokale webserver. Hvis `index.html` åbnes direkte som en fil, virker moduler, database og offlinefunktion ikke korrekt.

## Historiske data

Den klargjorte historik ligger i den Git-udelukkede fil `private-data/pensionsblik-historik.json`. Den bliver derfor ikke offentliggjort på GitHub.

Importér historikken sådan:

1. Åbn appens **Indstillinger**.
2. Tryk **Importér sikkerhedskopi**.
3. Vælg `private-data/pensionsblik-historik.json`.
4. Fjern markeringen i **Sammenflet ved import**, hvis historikken skal erstatte eksisterende registreringer.

## Funktioner

- Registrering og redigering af pensionsopsparing
- Historik med periodefiltre
- Prognoser med 5 % årlig vækst som standard
- Justerbar vækstrate, pensionsalder og tema
- Lokal IndexedDB-database
- Privat JSON-backup og import
- Mobilvenligt PWA-design til iPhone
- Installation som PWA og offlinefunktion
- Ingen server, konto eller tracking

## Test

Der er ingen pakker, som skal installeres. Med Node.js tilgængelig køres:

```bash
npm test
```

Testene bruger kun Node.js' indbyggede testværktøj.

## GitHub Pages

Hele projektet kan udgives direkte fra repository-roden. Der skal ikke køres en produktionsbygning. Aktivér GitHub Pages for den relevante branch og rodmappe.

Når den udgivne app er åbnet, importeres den private historikfil manuelt. Dermed bliver opsparingstallene i browseren og kommer ikke med i det offentlige repository.

## Installation på iPhone

1. Åbn GitHub Pages-adressen i Safari.
2. Tryk på Del.
3. Vælg **Føj til hjemmeskærm**.
4. Åbn appen fra hjemmeskærmen én gang med internet.

Data gemmes kun i browseren og kan forsvinde, hvis webstedsdata slettes. Eksportér derfor jævnligt en sikkerhedskopi.
