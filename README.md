# Munich Monks RFC – Web-App

Termine, Team, Positionen und Calls der Munich Monks RFC, als Web-App für Cloudflare Pages.
Man kann sie auf dem Handy installieren („Zum Home-Bildschirm“), und sie funktioniert auch offline.

```
public/                 ← die eigentliche Webseite
  index.html            ← die App (Vereinsdaten oben im Block „VEREINSDATEN – HIER BEARBEITEN“)
  manifest.webmanifest  ← App-Name & Icons zum Installieren
  sw.js                 ← Offline-Modus
  _headers              ← Cache-Einstellungen
  icons/
functions/api/
  ics.js                ← /api/ics: lädt den SpielerPlus-Kalender live
  photos/               ← /api/photos: Team-Fotos speichern (Cloudflare KV, nur bei Pages)
src/worker.js           ← Einstieg, wenn die App als Cloudflare **Worker** läuft (leitet /api/ics weiter)
wrangler.jsonc          ← Worker-Konfiguration – "name" muss wie der Worker im Dashboard heißen
```

> **Läuft als Worker (workers.dev):** Cloudflare liest `wrangler.jsonc` und baut bei jedem Commit automatisch neu.
> Live-Termine funktionieren, Fotos speichern ist im Worker noch nicht eingerichtet.
> Die Anleitung unten zu „Pages“ und „KV“ ist dann nicht nötig.

## Mit Cloudflare verbinden (einmalig, ca. 10 Minuten)

### 1. Webseite erstellen
1. Auf **cloudflare.com** ein kostenloses Konto anlegen und die E-Mail bestätigen. Fragt Cloudflare nach einer Domain, das überspringen.
2. Links im Menü **Workers & Pages** → **Create** → Reiter **Pages**.
   Falls der Reiter fehlt: unten auf „Looking to deploy Pages? Get started“ klicken.
3. **Connect to Git** → **GitHub** → im GitHub-Fenster den Zugriff auf das Repository `mmrfc` erlauben.
4. `mmrfc` auswählen → **Begin setup** und Folgendes einstellen:
   - **Project name:** `munich-monks` (das wird die Adresse)
   - **Framework preset:** `None`
   - **Build command:** leer lassen
   - **Build output directory:** `public`
5. **Save and Deploy** klicken und etwa eine Minute warten. Danach ist die App unter `https://munich-monks.pages.dev` erreichbar.

### 2. Speicher für die Team-Fotos
1. Links im Menü **Storage & Databases** → **KV** → **Create**, als Name `PHOTOS` eintragen.
2. Bei **Workers & Pages** → Projekt **munich-monks** → **Settings** → **Bindings** → **Add** → **KV namespace**:
   als Variable name `PHOTOS` eintragen und den KV namespace `PHOTOS` auswählen → **Save**.
3. Ebenfalls unter **Settings** → **Variables and Secrets** → **Add**:
   Type `Secret`, Variable name `ADMIN_TOKEN`, als Value ein Passwort eigener Wahl eintragen (aufschreiben!) → **Save**.
4. Reiter **Deployments** → beim obersten Eintrag auf **…** → **Retry deployment**, damit die Einstellungen aktiv werden.

## Im Alltag

- **Inhalte ändern** (Team, Calls, Positionen): auf GitHub `public/index.html` öffnen → ✏️ → ändern → **Commit changes**.
  Nach etwa einer Minute ist die Webseite automatisch aktuell. Achte beim Ändern auf Anführungszeichen `"` und Kommas `,`.
- **Fotos hinzufügen:** `https://munich-monks.pages.dev/?admin#team` öffnen → **📷 Fotos bearbeiten** →
  bei einer Person auf 📷 tippen → beim ersten Speichern das Admin-Passwort eingeben.
- **Auf dem Handy installieren:**
  - **iPhone (Safari):** Teilen-Symbol → „Zum Home-Bildschirm“
  - **Android (Chrome):** Drei-Punkte-Menü → „App installieren“
- **Anderer Kalender-Link:** unter Settings → Variables and Secrets die Variable `ICS_URL` setzen.
  Ohne diese Variable wird der Link aus `functions/api/ics.js` verwendet.

## Datenschutz

Eine `pages.dev`-Seite ist **öffentlich**: Alle, die den Link haben, sehen Namen, Fotos und Termine.
Soll die App nur fürs Team sein, im Cloudflare-Dashboard unter **Zero Trust → Access** eine Anmeldung per E-Mail-Code davorschalten
(für bis zu 50 Personen kostenlos). Der SpielerPlus-Link enthält einen persönlichen Token und steht im Quelltext.
