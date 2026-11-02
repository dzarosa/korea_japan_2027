/* Vite-Konfiguration für das Porjekt "Korea-Japan-Reise"
Due Angabe "base: ./" sorgt dafür, dass die Pfade relativ sind. Das ist wichtig, damit die Anwendung auch auf GitHub Pages korrekt funktioniert.
Der Entwicklungsserver wird auf Port 3000 gestartet.
 */
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: {
    port: 3000
  }
});