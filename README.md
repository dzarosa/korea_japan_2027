# korea_japan_2027
Webanwendung zur Reiseplanung und Reisekostenabrechnung für Südkorea und Japan im Jahr 2027.
Entwickelt im Rahmen der ESA_01 – Front-End-Webentwicklung.

**Die Anwendung ist unter folgender Adresse abrufbar:** https://dzarosa.github.io/korea_japan_2027/  
**Repository:** https://github.com/dzarosa/korea_japan_2027

Hierbei handelt es sich um eine interaktive, responsive Website für eine zehntägige Reise durch Korea und Japan. Der Reiseplaner verbindet Tagesrouten, eine Leaflet-Karte, Besuchermarkierungen und eine gemeinsame Kostenabrechnung. Das Projekt wurde mit Vite und striktem TypeScript realisiert.

## Funktionen
**Reiseplanung und Karten:**
- Tagesübersicht: Hier sehen Sie die Reisetage mit dem jeweiligen Reiseziel, der Unterkunft und den geplanten Stationen.
- Routeninformationen: Dazu gehören Sehenswürdigkeiten, Weg Beschreibungen, Verkehrsmittel sowie ungefähre Entfernungen und Reisezeiten.
- Interaktive Karte: Anzeige mit Leaflet und Kartenmaterial von OpenStreetMap.
- Stadtauswahl: Die Schnellnavigation führt zu Seoul, Busan, Osaka und Tokio.
- Externe Navigation: Es gibt weiterführende Links zu Kakao Maps für südkoreanische Ziele und zu Google Maps für japanische Ziele.
- Besuchte Orte: Bereits besuchte Stationen können in der Verwaltungsoberfläche markiert werden.
- Reiseübersicht: Hier wird eine Zusammenfassung der Reisetage, Stationen und Routenabschnitte berechnet.

**Reisekostenabrechnung:**
- Hier können Sie Ausgaben und Überweisungen erfassen und verwalten.
- Einsehbar sind die Zahlungsstatus für offene, bezahlte und überweisungsbezogene Positionen.
- Ein Überblick über die individuellen Kosten und die Gruppenabrechnung ist ebenfalls möglich.
- Verschiedene Ansichten für Reiseteilnehmer und Administratoren.
- Die Speicherung der Daten erfolgt im Browser (localStorage).
- Mithilfe von JSON können Daten gespeichert und wiederhergestellt werden.
- Es gibt eine Anbindung an Google Apps Script/Google Drive zum manuellen Laden und Speichern von Kostendaten. Im Quellcode ist eine automatische Prüfung auf neuere Cloud-Daten vorgesehen.

## Eingesetzte Technologien
Technologie						Verwendung
HTML5							Semantische Seitenstruktur
CSS3							Responsive Gestaltung und visuelle Darstellung
TypeScript						Typisierte Anwendungslogik und Datenmodelle
Vite							Entwicklungsserver und Produktions-Build
Leaflet							Interaktive Kartendarstellung
OpenStreetMap					Kartengrundlage
Google Maps / Kakao Maps		Links zur externen Routen- und Zielnavigation
Browser-`localStorage`			Lokale Speicherung von Reisekostendaten
Google Apps Script				Optionale Cloud-Schnittstelle für Kostendaten
GitHub Pages					Hosting der statischen Webanwendung

## Projektstruktur

index.html             		Semantisches HTML und optimiertes Schriftladen
src/web.ts             		Zentraler Einstieg und Initialisierung
src/types.ts           		Gemeinsame TypeScript-Datenmodelle
src/route.ts           		Typisierte Reise- und Geodaten
src/map.ts             		Karte, Tagesnavigation und Routendarstellung
src/esa.ts             		Typisierte, interaktive Reisezusammenfassung
src/shared.ts          		Speicherung, Berechnungen, Import/Export und Sync
src/costs.ts           		Anmeldung und Kostenverwaltung
src/actions.ts         		Validierung und Änderungen an Kosten/Überweisungen
src/design.css         		Responsives Layout und konsolidiertes Design
lighthouse.png         		Screenshot des Lighthouse-Audits
lighthouse_bericht.html 	Gespeicherter Lighthouse-Bericht
package.json          		npm-Skripte und Abhängigkeiten
package-lock.json      		Festgelegte npm-Abhängigkeiten
vite.config.ts         		Vite-Konfiguration für GitHub Pages
tsconfig.json          		TypeScript-Hauptkonfiguration
tsconfig.app.json      		TypeScript-Konfiguration der Anwendung
tsconfig.node.json     		TypeScript-Konfiguration der Build-Umgebung
reflexion_zarosa.pdf   		Kurze Projektdokumentation und Reflexion
.gitignore             		Von Git ausgeschlossene Dateien
.gitattributes         		Git-Dateiattribute
README.md             		Projektdokumentation
dist/                  		Generierter Produktionsbuild

## Installation und lokaler Start

Voraussetzungen: Git, Node.js in einer mit Vite 7 kompatiblen Version und npm.

1. Repository herunterladen:
   git clone https://github.com/dzarosa/korea_japan_2027.git
   cd korea_japan_2027

2. Abhängigkeiten installieren:
   npm install

3. Entwicklungsserver starten:
   npm run dev

4. Die vom Terminal angezeigte lokale Adresse öffnen (projektseitig ist Port 3000 konfiguriert, üblicherweise http://localhost:3000/).
Produktionsversion testen
npm run build
npm run preview

Der Build erzeugt den Ordner dist/. Mit dem Preview-Befehl wird ein lokaler Server für die gebaute Version gestartet. Die konkrete URL wird im Anschluss im Terminal angezeigt.
Die Veröffentlichung erfolgt über GitHub Pages.

Für ein Projekt-Repository kann Vite wie folgt konfiguriert werden:
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/korea_japan_2027/',
  server: { port: 3000 },
});

Bei Veröffentlichung mit dem npm-Paket gh-pages kann das scripts-Objekt in package.json um folgende Einträge ergänzt werden:

{
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

**Hinweis:** Mithilfe dieser beiden Schlüssel werden die vorhandenen Scripts ergänzt, nicht das gesamte package.json ersetzt. Das Paket „gh-pages” muss als Development-Dependency installiert sein (npm install -D gh-pages).
Anschließend kann mit dem Befehl npm run deploy veröffentlicht werden. 

## ESA_01 – Technische Anforderungen:
- semantisches HTML mit den Elementen header, nav, main, footer, section, aside und article,
- Zugänglichkeitsattribute wie aria-label, beschriftete Schaltflächen und strukturierte Navigation.
- Responsive Darstellung für unterschiedliche Bildschirmgrößen.
- TypeScript-Interfaces und typisierte Funktionen.
- Array-Verarbeitung, z. B. mit map() und reduce() zur Aufbereitung von Reisedaten.

## Prüfungen
**Für die Studienabgabe sind die unten stehenden Überprüfungen vorgesehen bzw. dokumentiert:**
- Lighthouse Accessibility der veröffentlichten Seite: **96/100 (Desktop, 03.11.2026)c
- Semantische HTML-Struktur und ARIA-Beschriftungen
- `npm run build` zur TypeScript- und Build-Prüfung
- Interaktive Karte, Tagesnavigation und Reiseübersicht
- Benutzer- und Adminansicht sowie Kosten- und Überweisungsfunktionen
- JSON-Export und -Import

Der Accessibility-Wert erfüllt mit mindestens 80 Punkten die Vorgabe der ESA_01. Die Lighthouse-Werte können je nach Zeitpunkt des Tests, verwendetem Gerät und Testumgebung schwanken.
**Screenshot:** lighthouse.png (/lighthouse.png)