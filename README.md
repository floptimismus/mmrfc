# Munich Monks RFC – Web-App

Termine, Ergebnisse, Team, Positionen, Calls und Mitglieder der Munich Monks RFC, als Cloudflare Worker.
Man kann die App auf dem Handy installieren („Zum Home-Bildschirm“), und sie funktioniert auch offline.

```
public/                 ← die Webseite
  index.html            ← App-Grundgerüst + Termine, Team, Positionen, Calls
                           (Vereinsdaten oben im Block „VEREINSDATEN – HIER BEARBEITEN“)
  ergebnisse.js         ← Tab „Ergebnisse“
  konto.js              ← Konto (Passkeys), Profil, Mitgliederliste
  extra.css             ← Styles für Ergebnisse & Konto
  manifest.webmanifest, sw.js, _headers, icons/
src/
  worker.js             ← Einstieg: leitet /api/* weiter
  db.js                 ← Datenbank (Durable Object mit SQLite): Konten, Profile, Ergebnisse
functions/api/ics.js    ← holt den SpielerPlus-Kalender (/api/ics)
wrangler.jsonc          ← Worker-Konfiguration – "name" muss wie der Worker im Dashboard heißen
```

Cloudflare baut bei jedem Commit auf `main` automatisch neu. Die Datenbank legt Cloudflare beim ersten Deploy selbst an.

## Konten & Mitglieder

- **Anmelden mit Passkey:** Oben rechts auf den Personen-Knopf → Username wählen → „Konto erstellen“.
  Der Passkey wird per Face ID, Fingerabdruck oder Geräte-PIN gespeichert. Ein Passwort gibt es nicht.
- **Die erste Person, die sich registriert, wird Admin.** Also direkt nach dem Deploy selbst registrieren!
- **Profil:** Spitzname, Pronomen und alle Positionen (1–15), die man spielen kann.
- **Mitgliederliste:** sehen nur angemeldete Mitglieder, mit Suche und Filter nach Position.
- **Weiteres Gerät** (z. B. Laptop oder neues Handy): Konto → „Weiteres Gerät verbinden“ → 6-stelliger Code.
  Auf dem neuen Gerät: Konto → „Mit Code verbinden“. Der Code gilt 15 Minuten.
- **Alle Geräte verloren?** Ein Admin erstellt in der Mitgliederliste (⋯) einen Code für die Person.
- **Admins** können andere zu Admins machen und Mitglieder entfernen.

## Ergebnisse

- Ein Eintrag ist ein **Spieltag, Turnier oder Freundschaftsspiel** mit **einem oder mehreren Spielen**
  (Gegner, eigene Punkte, Gegner-Punkte), dazu optional Titel, Ort, Team (Mixed/FLINTA*), Platzierung und Notizen.
- Datum, Titel und Ort kann man aus einem Termin im Kalender übernehmen.
- **Lesen kann jede Person, eintragen und bearbeiten nur Admins.**
- Oben stehen Saison-Bilanz (Siege, Unentschieden, Niederlagen) und Punkte. Die Saison läuft von August bis Juli.

## Im Alltag

- **Inhalte ändern** (Team, Calls, Positionen): auf GitHub `public/index.html` öffnen → ✏️ → ändern → **Commit changes**.
  Nach etwa einer Minute ist die Webseite automatisch aktuell. Achte beim Ändern auf Anführungszeichen `"` und Kommas `,`.
- **Anderer Kalender-Link:** im Cloudflare-Dashboard beim Worker unter Settings → Variables and Secrets die Variable `ICS_URL` setzen.
- **Lokal testen:** `npm install` und danach `npx wrangler dev` → http://localhost:8787

## Datenschutz

Die Adresse ist öffentlich. Ohne Anmeldung sieht man Termine, Ergebnisse, Ansprechpersonen, Positionen und Calls.
Profile und die Mitgliederliste sieht man nur angemeldet. Registrieren kann sich allerdings jede Person, die den Link hat.
Admins können unbekannte Konten in der Mitgliederliste entfernen.
Der SpielerPlus-Link enthält einen persönlichen Token und steht im Quelltext.
