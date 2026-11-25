# Munich Monks RFC – Web-App (Version 4)

Termine, Ergebnisse, Team, Basics und Konto der Munich Monks RFC – auf **Deutsch und Englisch**, als Cloudflare Worker.
Man kann die App auf dem Handy installieren („Zum Home-Bildschirm“), und sie funktioniert auch offline.

```
public/                   ← die Webseite
  index.html              ← Grundgerüst, Styles, Navigation
  extra.css               ← zusätzliche Styles
  js/
    content.js            ← ✏️ VEREINSDATEN: Team, Positionen, Scrum, Calls (jeweils de + en)
    i18n.js               ← Sprache (Deutsch / Englisch)
    core.js               ← Hilfsfunktionen, Navigation, Server-Anbindung
    ics.js                ← Kalender-Parser (SpielerPlus-ICS)
    termine.js            ← Tab „Termine“
    ergebnisse.js         ← Tab „Ergebnisse“
    team.js               ← Tab „Team“ (Ansprechpersonen + Mitglieder)
    anim.js               ← Animations-Engine für die Calls
    basics.js             ← Tab „Basics“ (Positionen, Scrum, Calls, Quiz)
    konto.js              ← Tab „Konto“ (Passkeys, Profil, Kalender, Willkommens-Fenster)
    start.js              ← Start der App
  manifest.webmanifest, sw.js, _headers, icons/
src/
  worker.js               ← Einstieg: leitet /api/* an die Datenbank
  db.js                   ← Datenbank (Durable Object mit SQLite)
wrangler.jsonc            ← Worker-Konfiguration – "name" muss wie der Worker im Dashboard heißen
```

Cloudflare baut bei jedem Commit auf `main` automatisch neu. Die Datenbank legt Cloudflare selbst an, neue Felder werden beim Start automatisch ergänzt.

## Die Tabs

- **Termine** – jede Person sieht ihre **eigenen** Termine aus SpielerPlus. Dafür fügt man im Konto einmal den persönlichen
  Kalenderlink ein (nur Links von spielerplus.de, `webcal://` wird automatisch umgewandelt). Niemand sonst sieht den Link.
  Ohne Anmeldung oder Link erscheint nur ein Hinweis.
  Bei jedem Termin kann man **„Team zuordnen“** (Mixed, FLINTA*, Flying Monks) – das gilt dann für alle.
  Der Filter „Flying Monks“ zeigt nur zugeordnete Termine; Termine ohne Team erscheinen bei Mixed und FLINTA*.
- **Ergebnisse** – Spieltag, Turnier oder Freundschaftsspiel mit beliebig vielen Spielen. Pro Spiel: **Spielstand**, **nur Ausgang**
  (Sieg/Unentschieden/Niederlage) oder **offen**. Lesen: alle. Eintragen & bearbeiten: alle angemeldeten Mitglieder.
  Löschen: Admins und die Person, die den Eintrag erstellt hat. Bei jedem Eintrag steht, wer ihn zuletzt geändert hat.
  Teams: Mixed, FLINTA*, Flying Monks (SG mit Vienna Eagles).
- **Team** – Ansprechpersonen (in `js/content.js` → `TEAM`) und darunter die **Mitgliederliste** mit Spitzname, Pronomen,
  „dabei seit“ und Positionen (nur für angemeldete Mitglieder sichtbar). Admins verwalten Mitglieder über „⋯“.
- **Basics** – Positionen, Scrum, Lineout-Calls, Pass-Calls (Feuer, Pod 10, Plus, Minus, Fiji) mit Animationen und Quiz.
- **Konto** – Anmeldung mit **Passkey** (Face ID, Fingerabdruck, Geräte-PIN), Profil (Spitzname, Pronomen, Dabei seit, Positionen),
  Sprache, SpielerPlus-Kalender, weiteres Gerät per 6-stelligem Code verbinden.

**Willkommens-Fenster:** erscheint beim ersten Besuch und danach ohne Konto höchstens einmal pro Woche.
**Erste Person, die sich registriert, wird Admin.**

## Sprache

Beim ersten Öffnen richtet sich die App nach der Handysprache (Deutsch → Deutsch, sonst Englisch).
Ändern: im Konto (wird gespeichert und gilt auf allen Geräten) oder ohne Konto über den DE | EN-Schalter im Konto-Tab bzw. Willkommens-Fenster.
Texte, die Personen selbst eintippen (Termin-Titel aus SpielerPlus, Notizen, Spitznamen), werden nicht übersetzt.

## Inhalte ändern

Alles Vereinsbezogene steht in **`public/js/content.js`** – jeweils mit `de:` und `en:`:
- **Team:** `TEAM` – Rolle, Gruppe, Name, Kontakt.
- **Positionen:** `POSITIONS`, **Scrum:** `SCRUM_PHASES` / `SCRUM_TEXT`.
- **Calls:** `CALLS` – Bewegungen in `schritte`, Texte in `de.steps` / `en.steps` (gleiche Reihenfolge).
  Neue Grundaufstellungen stehen in `js/anim.js` → `SETUPS`.

Auf GitHub die Datei öffnen → ✏️ → ändern → **Commit changes**. Nach etwa einer Minute ist die App aktuell.
Achte auf Anführungszeichen `"` und Kommas `,`.

## Lokal testen

```bash
npm install
npx wrangler dev
```

Für Tests mit einem eigenen Kalender-Server (nicht spielerplus.de) in `.dev.vars` `DEV_ICS_ANY_HOST=1` setzen – **nur lokal**, nie bei Cloudflare.

## Datenschutz

Die Adresse ist öffentlich. Ohne Anmeldung sieht man Ergebnisse, Ansprechpersonen und Basics.
Termine, Profile und die Mitgliederliste sieht man nur angemeldet. Kalenderlinks sind privat und werden nie an andere ausgegeben.
Registrieren kann sich jede Person mit dem Link; Admins können unbekannte Konten in der Mitgliederliste entfernen.
