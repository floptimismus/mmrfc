/* ======================================================================
   ✏️  VEREINSDATEN – HIER BEARBEITEN
   Team, Positionen und Calls stehen hier – jeweils auf Deutsch (de) und Englisch (en).
   ====================================================================== */

/* ---------- 1) Allgemeine Einstellungen ---------- */
const CONFIG = {
  TIMEZONE: "Europe/Berlin",
  HORIZON_DAYS: 365,             // wie weit in die Zukunft Termine angezeigt werden
  INSTAGRAM: "munichmonks_rfc",  // Vereins-Instagram
  FOUNDED: 2016,                 // Gründungsjahr – Start der Auswahl „Dabei seit“
};

/* ---------- 2) Team & Ansprechpersonen ----------
   gruppe: "vorstand" | "coaching" | "orga" | "vertrauen" ("vertrauen" = großer Hinweis oben)
   name leer lassen = „Name folgt“. email / whatsapp / instagram nur ausfüllen, was es gibt. */
const TEAM = [
  { rolle: { de: "Confidant (Vertrauensperson)", en: "Confidant" }, gruppe: "vertrauen", name: "", pronomen: "", email: "", whatsapp: "", instagram: "" },

  { rolle: { de: "Vorstand der Munich Monks", en: "Chair of the Munich Monks" }, gruppe: "vorstand", name: "Chris", pronomen: "", email: "", whatsapp: "", instagram: "" },
  { rolle: { de: "Co-Vorstand der Munich Monks", en: "Co-Chair of the Munich Monks" }, gruppe: "vorstand", name: "Michaela", pronomen: "", email: "", whatsapp: "", instagram: "" },
  { rolle: { de: "Co-Vorstand der Munich Monks", en: "Co-Chair of the Munich Monks" }, gruppe: "vorstand", name: "Sven", pronomen: "", email: "", whatsapp: "", instagram: "" },
  { rolle: { de: "Kassenwart", en: "Treasurer" }, gruppe: "vorstand", name: "Tom", pronomen: "", email: "", whatsapp: "", instagram: "" },

  { rolle: "Coach", gruppe: "coaching", name: "Markus", pronomen: "", email: "", whatsapp: "", instagram: "" },
  { rolle: "Coach", gruppe: "coaching", name: "Dejvi", pronomen: "", email: "", whatsapp: "", instagram: "" },
  { rolle: "Coach", gruppe: "coaching", name: "Timothy", pronomen: "", email: "", whatsapp: "", instagram: "" },

  { rolle: "Social Media", gruppe: "orga", name: "Flo", pronomen: "", email: "", whatsapp: "", instagram: "" },
  { rolle: "Social Media", gruppe: "orga", name: "Sandra", pronomen: "", email: "", whatsapp: "", instagram: "" },
];

/* ---------- 3) Positionen (15er-Rugby) ---------- */
const POS_GROUPS = {
  alle: { label: { de: "Alle 15", en: "All 15" }, nums: [], text: { de: "Tippe auf eine Rückennummer, um mehr über die Position zu erfahren. Angriffsrichtung ist nach oben ↑", en: "Tap a shirt number to learn more about the position. We attack upwards ↑" } },
  fwd: { label: "Forwards", nums: [1, 2, 3, 4, 5, 6, 7, 8], text: { de: "<b>Forwards (Stürmer*innen) · 1–8</b> – gewinnen den Ball: im Scrum, im Lineout, im Ruck und im Maul. Viel Kontakt, viel Teamwork.", en: "<b>Forwards · 1–8</b> – win the ball: in the scrum, the lineout, the ruck and the maul. Lots of contact, lots of teamwork." } },
  backs: { label: "Backs", nums: [9, 10, 11, 12, 13, 14, 15], text: { de: "<b>Backs (Hintermannschaft) · 9–15</b> – machen aus dem Ball Raumgewinn und Punkte: passen, laufen, kicken.", en: "<b>Backs · 9–15</b> – turn possession into metres and points: passing, running, kicking." } },
  front: { label: "Front Row", nums: [1, 2, 3], text: { de: "<b>Front Row (Erste Reihe) · 1–3</b> – das Fundament im Gedränge. Kraft, Technik und ganz viel Vertrauen zueinander.", en: "<b>Front Row · 1–3</b> – the foundation of the scrum. Strength, technique and lots of trust in each other." } },
  second: { label: "Second Row", nums: [4, 5], text: { de: "<b>Second Row (Zweite Reihe) · 4–5</b> – der Motor im Scrum und die Luftwaffe im Lineout.", en: "<b>Second Row · 4–5</b> – the engine of the scrum and the air force of the lineout." } },
  backrow: { label: "Back Row", nums: [6, 7, 8], text: { de: "<b>Back Row (Dritte Reihe) · 6–8</b> – die Allrounder*innen: tackeln, tragen, Bälle klauen.", en: "<b>Back Row · 6–8</b> – the all-rounders: tackling, carrying, stealing the ball." } },
  half: { label: "Halfbacks", nums: [9, 10], text: { de: "<b>Halfbacks (Halbspieler*innen) · 9–10</b> – das Gehirn des Teams. Hier wird entschieden, wohin der Ball geht.", en: "<b>Halfbacks · 9–10</b> – the brains of the team. This is where we decide where the ball goes." } },
  centre: { label: "Centres", nums: [12, 13], text: { de: "<b>Centres (Innendreiviertel) · 12–13</b> – Durchbrüche durch die Mitte und harte Tackles.", en: "<b>Centres · 12–13</b> – line breaks through the middle and big tackles." } },
  three: { label: "Back Three", nums: [11, 14, 15], text: { de: "<b>Back Three (Hinterleute) · 11, 14, 15</b> – Tempo, hohe Bälle fangen, Tries legen und die letzte Verteidigungslinie.", en: "<b>Back Three · 11, 14, 15</b> – pace, catching high balls, scoring tries and the last line of defence." } },
};
const POSITIONS = {
  1: { en: "Loosehead Prop", de: "Linker Pfeiler",
    tx: { de: { aufgaben: ["Gedränge stabil halten und Druck machen", "Kurze, harte Läufe mit Ball (Carries)", "Rucks sichern und viel tackeln"], scrum: "Links in der ersten Reihe. Der Kopf ist außen, nur eine Schulter am Gegenüber – daher „loose head“. Bindet mit dem rechten Arm am Hooker.", lineout: "Meist vorderer Lifter: hebt den Jumper an Oberschenkeln/Shorts hoch.", skills: ["Kraft", "Rumpfstabilität", "Kontakt-Ausdauer", "Scrum-Technik"], passt: "du gern schiebst, hebst und Kontakt magst – und es dir nichts ausmacht, dass deine Arbeit oft unsichtbar ist. Das Team weiß genau, was es an dir hat." },
          en: { aufgaben: ["Keep the scrum stable and apply pressure", "Short, hard runs with the ball (carries)", "Secure rucks and make lots of tackles"], scrum: "Left side of the front row. The head is on the outside with only one shoulder against the opponent – hence “loose head”. Binds onto the hooker with the right arm.", lineout: "Usually the front lifter: lifts the jumper by the thighs/shorts.", skills: ["Strength", "Core stability", "Contact endurance", "Scrum technique"], passt: "you love pushing, lifting and contact – and don't mind that your work is often invisible. The team knows exactly how much you're worth." } } },
  2: { en: "Hooker", de: "Hakler*in",
    tx: { de: { aufgaben: ["Wirft beim Lineout ein – einer der wichtigsten Würfe im Spiel", "Hakt im Gedränge den Ball mit dem Fuß nach hinten", "Viel Arbeit am Breakdown, tackeln, tragen"], scrum: "In der Mitte der ersten Reihe, bindet über die Schultern beider Props und hakt den eingeworfenen Ball nach hinten.", lineout: "Wirft den Ball ein – und muss alle Calls im Kopf haben.", skills: ["Präziser Wurf", "Kommunikation", "Kraft + Beweglichkeit", "Übersicht"], passt: "du Verantwortung magst, gern mitten im Geschehen bist und Lust hast, an deinem Wurf zu feilen." },
          en: { aufgaben: ["Throws in at the lineout – one of the most important throws in the game", "Hooks the ball back with the foot in the scrum", "Lots of work at the breakdown, tackling, carrying"], scrum: "Middle of the front row, binds over the shoulders of both props and hooks the ball back.", lineout: "Throws the ball in – and has to know every call by heart.", skills: ["Accurate throw", "Communication", "Strength + mobility", "Awareness"], passt: "you like responsibility, love being in the thick of it and want to perfect your throw." } } },
  3: { en: "Tighthead Prop", de: "Rechter Pfeiler",
    tx: { de: { aufgaben: ["Anker des Gedränges – hier wirkt der meiste Druck", "Tackeln, Carries, Rucks sichern", "Stabilität für das ganze Pack"], scrum: "Rechts in der ersten Reihe. Der Kopf steckt zwischen gegnerischem Hooker und Loosehead – „tight head“. Technisch die anspruchsvollste Scrum-Position.", lineout: "Lifter, meist in der Mitte oder hinten.", skills: ["Maximalkraft", "Nacken- & Rumpfstabilität", "Geduld", "Technik"], passt: "du stabil wie ein Fels sein willst und es feierst, wenn das Gedränge nach vorne rollt." },
          en: { aufgaben: ["Anchor of the scrum – this is where most pressure goes", "Tackling, carries, securing rucks", "Stability for the whole pack"], scrum: "Right side of the front row. The head sits between the opposing hooker and loosehead – “tight head”. Technically the most demanding scrum position.", lineout: "Lifter, usually in the middle or at the back.", skills: ["Maximum strength", "Neck & core stability", "Patience", "Technique"], passt: "you want to be solid as a rock and love it when the scrum rolls forward." } } },
  4: { en: "Lock", de: "Zweite Reihe (links)",
    tx: { de: { aufgaben: ["Motor des Gedränges", "Haupt-Jumper im Lineout, fängt Kick-offs", "Viel Arbeit in Rucks und Mauls"], scrum: "Hinter der ersten Reihe, Kopf zwischen Prop und Hooker. Schiebt mit voller Kraft.", lineout: "Haupt-Jumper – bei uns oft J1.", skills: ["Sprungkraft", "Fangen in der Luft", "Kraft", "Ausdauer"], passt: "du hoch hinaus willst, Power hast und die Drecksarbeit nicht scheust." },
          en: { aufgaben: ["Engine of the scrum", "Main lineout jumper, catches kick-offs", "Lots of work in rucks and mauls"], scrum: "Behind the front row, head between prop and hooker. Pushes with full power.", lineout: "Main jumper – for us often J1.", skills: ["Jumping power", "Catching in the air", "Strength", "Endurance"], passt: "you want to reach new heights, have power and don't shy away from the dirty work." } } },
  5: { en: "Lock", de: "Zweite Reihe (rechts)",
    tx: { de: { aufgaben: ["Schiebt im Gedränge mit der 4 zusammen", "Jumper im Lineout, oft auch für die Calls zuständig", "Kick-offs fangen, Mauls stark machen"], scrum: "Hinter der ersten Reihe, Kopf zwischen Hooker und Tighthead. Bindet eng mit der 4.", lineout: "Jumper – bei uns oft J2. Häufig sagt die 5 die Calls an.", skills: ["Sprungkraft", "Kommunikation", "Kraft", "Spielverständnis"], passt: "du gern Verantwortung im Sturm übernimmst und in der Luft zu Hause bist." },
          en: { aufgaben: ["Pushes in the scrum together with the 4", "Lineout jumper, often in charge of the calls", "Catches kick-offs, makes mauls strong"], scrum: "Behind the front row, head between hooker and tighthead. Binds tightly with the 4.", lineout: "Jumper – for us often J2. The 5 often calls the lineouts.", skills: ["Jumping power", "Communication", "Strength", "Game sense"], passt: "you like taking responsibility in the pack and feel at home in the air." } } },
  6: { en: "Blindside Flanker", de: "Flügelstürmer*in (geschlossene Seite)",
    tx: { de: { aufgaben: ["Tackle-Maschine auf der kurzen Seite des Feldes", "Carries und Rucks klären", "Zusätzliche Lineout-Option"], scrum: "Außen an der zweiten Reihe angebunden, schiebt mit und löst sich schnell zum Verteidigen.", lineout: "Jumper oder Lifter – flexibel einsetzbar.", skills: ["Tackling", "Ausdauer", "Physis", "Spielverständnis"], passt: "du gern tackelst, schnell wieder aufstehst und überall mit anpackst." },
          en: { aufgaben: ["Tackling machine on the short side of the pitch", "Carries and clearing rucks", "Extra lineout option"], scrum: "Bound on the outside of the second row, pushes and breaks off quickly to defend.", lineout: "Jumper or lifter – very flexible.", skills: ["Tackling", "Endurance", "Physicality", "Game sense"], passt: "you love tackling, get up quickly and help out everywhere." } } },
  7: { en: "Openside Flanker", de: "Flügelstürmer*in (offene Seite)",
    tx: { de: { aufgaben: ["Als erste*r am Ball nach jedem Tackle", "Ball am Boden stehlen („Jackal“)", "Druck auf die gegnerischen Halbspieler*innen"], scrum: "Außen angebunden, löst sich als erste*r und jagt die gegnerische 9 oder 10.", lineout: "Oft Lifter hinten oder Absicherung.", skills: ["Schnelligkeit", "Ausdauer", "Ballgefühl am Boden", "Mut"], passt: "du nie stehenbleibst, gern Bälle klaust und immer da bist, wo's brennt." },
          en: { aufgaben: ["First to the ball after every tackle", "Steals the ball on the ground (“jackal”)", "Puts pressure on the opposing halfbacks"], scrum: "Bound on the outside, breaks off first and hunts the opposing 9 or 10.", lineout: "Often lifter at the back or sweeper.", skills: ["Speed", "Endurance", "Skills on the ground", "Courage"], passt: "you never stop, love stealing the ball and are always where the action is." } } },
  8: { en: "Number Eight", de: "Nummer Acht",
    tx: { de: { aufgaben: ["Verbindung zwischen Forwards und Backs", "Starke Läufe direkt aus dem Gedränge", "Übersicht im Sturm"], scrum: "Ganz hinten zwischen den Locks. Kontrolliert den Ball an den Füßen und kann ihn selbst aufnehmen.", lineout: "Jumper oder Lifter hinten.", skills: ["Kraft + Tempo", "Ballhandling", "Entscheidungsfreude"], passt: "du Forward-Power mit Ballgefühl verbinden willst und gern Entscheidungen triffst." },
          en: { aufgaben: ["Link between forwards and backs", "Strong runs straight from the scrum", "Overview in the pack"], scrum: "Right at the back between the locks. Controls the ball at the feet and can pick it up.", lineout: "Jumper or lifter at the back.", skills: ["Power + pace", "Ball handling", "Decision making"], passt: "you want to combine forward power with ball skills and like making decisions." } } },
  9: { en: "Scrum-half", de: "Gedrängehalb",
    tx: { de: { aufgaben: ["Holt den Ball aus jedem Ruck, Maul und Gedränge und verteilt ihn", "Dirigiert die Forwards", "Viele Pässe, ab und zu ein Box-Kick"], scrum: "Wirft den Ball ins Gedränge ein und nimmt ihn hinten wieder auf.", lineout: "Steht hinter der Gasse und nimmt den Ball vom Jumper an.", skills: ["Schneller Pass", "Laufbereitschaft", "Laute Stimme", "Spielübersicht"], passt: "du flink bist, viel redest und gern zwischen den Großen den Ton angibst." },
          en: { aufgaben: ["Gets the ball out of every ruck, maul and scrum and distributes it", "Directs the forwards", "Lots of passes, the occasional box kick"], scrum: "Feeds the ball into the scrum and picks it up again at the back.", lineout: "Stands behind the line and takes the ball from the jumper.", skills: ["Quick pass", "Work rate", "Loud voice", "Vision"], passt: "you're nippy, talk a lot and like calling the shots among the big ones." } } },
  10: { en: "Fly-half", de: "Verbindungshalb",
    tx: { de: { aufgaben: ["Spielmacher*in: passen, laufen oder kicken?", "Oft Kicker*in für Penalties und Conversions", "Organisiert die Backline"], scrum: "Steht hinten bereit und startet den Angriff der Backs.", lineout: "Startpunkt der Backline-Spielzüge nach dem Lineout.", skills: ["Übersicht", "Passen", "Kicken", "Ruhe unter Druck"], passt: "du gern Spiele liest, Verantwortung übernimmst und ein Gefühl für Raum hast." },
          en: { aufgaben: ["Playmaker: pass, run or kick?", "Often the kicker for penalties and conversions", "Organises the backline"], scrum: "Waits behind and launches the backs' attack.", lineout: "Starting point of the backline moves after the lineout.", skills: ["Vision", "Passing", "Kicking", "Calm under pressure"], passt: "you like reading the game, taking responsibility and have a feel for space." } } },
  11: { en: "Left Wing", de: "Außendreiviertel links (Flügel)",
    tx: { de: { aufgaben: ["Tries legen!", "Tempo auf der Außenbahn", "Hohe Bälle fangen und den Außenraum verteidigen"], scrum: "Nicht im Gedränge – steht weit außen in der Backline.", lineout: "Weit außen oder als Überraschungsläufer*in.", skills: ["Schnelligkeit", "Fangen", "1-gegen-1", "Mut im Tackle"], passt: "du schnell bist und es liebst, über die Linie zu fliegen." },
          en: { aufgaben: ["Score tries!", "Pace on the outside", "Catch high balls and defend the wide channels"], scrum: "Not in the scrum – stands wide out in the backline.", lineout: "Wide out or as a surprise runner.", skills: ["Speed", "Catching", "1-on-1", "Brave in the tackle"], passt: "you're fast and love flying over the try line." } } },
  12: { en: "Inside Centre", de: "Innendreiviertel (innen)",
    tx: { de: { aufgaben: ["Zweite*r Spielmacher*in neben der 10", "Harte Läufe durch die Mitte", "Starke Verteidigung"], scrum: "Nicht im Gedränge – greift mit der Backline an oder verteidigt.", lineout: "Läuft die geplanten Backline-Moves.", skills: ["Passen & Kicken", "Kraft im Kontakt", "Tackling"], passt: "du zwischen Power und Spielwitz pendelst." },
          en: { aufgaben: ["Second playmaker next to the 10", "Hard runs through the middle", "Strong defence"], scrum: "Not in the scrum – attacks or defends with the backline.", lineout: "Runs the planned backline moves.", skills: ["Passing & kicking", "Power in contact", "Tackling"], passt: "you swing between power and creativity." } } },
  13: { en: "Outside Centre", de: "Innendreiviertel (außen)",
    tx: { de: { aufgaben: ["Durchbrüche mit Tempo", "Bälle an die Flügel weitergeben", "Verteidigen mit viel Raum um dich"], scrum: "Nicht im Gedränge – Teil der Backline.", lineout: "Teil der Backline-Moves, oft als Durchbruchsläufer*in.", skills: ["Tempo", "Täuschungen (Side-Step)", "Lesen der Verteidigung", "Tackling im offenen Feld"], passt: "du schnell bist, Lücken siehst und keine Angst vor offenem Raum hast." },
          en: { aufgaben: ["Line breaks with pace", "Moving the ball on to the wings", "Defending with lots of space around you"], scrum: "Not in the scrum – part of the backline.", lineout: "Part of the backline moves, often as the strike runner.", skills: ["Pace", "Side-step", "Reading the defence", "Open-field tackling"], passt: "you're quick, spot gaps and aren't afraid of open space." } } },
  14: { en: "Right Wing", de: "Außendreiviertel rechts (Flügel)",
    tx: { de: { aufgaben: ["Tries legen!", "Tempo auf der rechten Außenbahn", "Hohe Bälle fangen, den Außenraum verteidigen"], scrum: "Nicht im Gedränge – steht weit außen in der Backline.", lineout: "Weit außen oder als Überraschungsläufer*in.", skills: ["Schnelligkeit", "Fangen", "1-gegen-1", "Mut im Tackle"], passt: "du schnell bist und Lust auf Meter an der Seitenlinie hast." },
          en: { aufgaben: ["Score tries!", "Pace on the right wing", "Catch high balls, defend the wide channels"], scrum: "Not in the scrum – stands wide out in the backline.", lineout: "Wide out or as a surprise runner.", skills: ["Speed", "Catching", "1-on-1", "Brave in the tackle"], passt: "you're fast and love making metres down the touchline." } } },
  15: { en: "Fullback", de: "Schlussspieler*in",
    tx: { de: { aufgaben: ["Letzte Verteidigungslinie", "Hohe Kicks fangen, zurückkicken oder kontern", "Schaltet sich als Extra-Person in den Angriff ein"], scrum: "Nicht im Gedränge – steht ganz hinten.", lineout: "Steht tief und sichert nach hinten ab.", skills: ["Sicheres Fangen", "Kicken", "Übersicht", "Tackling im 1-gegen-1"], passt: "du Ruhe bewahrst, gern hohe Bälle fängst und den Überblick von hinten liebst." },
          en: { aufgaben: ["Last line of defence", "Catch high kicks, kick back or counter-attack", "Joins the attack as the extra player"], scrum: "Not in the scrum – stands right at the back.", lineout: "Stands deep and covers behind.", skills: ["Safe hands", "Kicking", "Vision", "1-on-1 tackling"], passt: "you stay calm, love catching high balls and enjoy the view from the back." } } },
};

/* ---------- 4) Scrum ---------- */
const SCRUM_PHASES = [
  { k: "crouch", label: "1 · Crouch", oy: 46, ext: 0, text: { de: "<b>Crouch</b> (Hocke): Alle binden innerhalb des eigenen Packs. Die erste Reihe geht tief, Rücken gerade, Kopf hoch.", en: "<b>Crouch</b>: everyone binds within their own pack. The front row gets low, back straight, head up." } },
  { k: "bind", label: "2 · Bind", oy: 74, ext: 1, text: { de: "<b>Bind</b> (Binden): Die Props greifen mit dem äußeren Arm ans Trikot der gegnerischen Props. Noch kein Druck!", en: "<b>Bind</b>: the props grip the opposing props' shirts with their outside arm. No pushing yet!" } },
  { k: "set", label: "3 · Set", oy: 88, ext: 1, text: { de: "<b>Set</b>: Die Packs gehen zusammen. 9 rollt den Ball in den Tunnel, die 2 hakt ihn nach hinten zur 8.", en: "<b>Set</b>: the packs engage. The 9 rolls the ball into the tunnel, the 2 hooks it back to the 8." } },
];
const SCRUM_TEXT = {
  de: { intro: "Das <b>Scrum</b> (Gedränge) von oben: Unsere 8 Forwards gegen die 8 der Gegner*innen. Gestrichelte Linien = wer an wem festhält (bindet).",
    list: ["<b>Erste Reihe (1–3):</b> 2 bindet über die Schultern von 1 und 3.", "<b>Zweite Reihe (4–5):</b> binden aneinander, Kopf in die Lücke zwischen Prop und Hooker.", "<b>Flanker (6, 7):</b> binden außen an der zweiten Reihe.", "<b>Nummer 8:</b> ganz hinten zwischen den Locks – kontrolliert den Ball an den Füßen."] },
  en: { intro: "The <b>scrum</b> from above: our 8 forwards against the opposition's 8. Dashed lines = who holds on to whom (binds).",
    list: ["<b>Front row (1–3):</b> the 2 binds over the shoulders of 1 and 3.", "<b>Second row (4–5):</b> bind to each other, heads in the gap between prop and hooker.", "<b>Flankers (6, 7):</b> bind on the outside of the second row.", "<b>Number 8:</b> right at the back between the locks – controls the ball at the feet."] },
};

/* ---------- 5) Calls ----------
   kategorie: "lineout" | "pass" · setup: Grundaufstellung der Grafik ("lineout" | "ruck_fire" | "ruck_pod10" | "ruck_diamond")
   schritte (Animation): move { Spieler: [x, y] } · lift { Spieler: 1|0 } · ball { to, arc } · maul [...] · support [...] · lauf [...] · dauer (ms)
   Die Texte pro Schritt stehen in de.steps / en.steps (gleiche Reihenfolge wie schritte).
   Spielfeld 360×290, Angriff nach oben.
   Lineout: H = Hooker · L1 J1 L2 = Pod 1 · L3 J2 L4 = Pod 2 · SH = 9 · FH = 10 · IC = 12 · O1–O6 = Gegner*innen
   Pass-Calls: SH = 9 · FH = 10 · IC = 12 · OC = 13 · F1–F3 / P1–P3 = Forward-Pod · LD = Podleader, A/B/C = Diamant-Pod · D1–D6 = Gegner*innen */
const CALLS = [
  {
    id: "giesinger", name: "Giesinger", kategorie: "lineout", setup: "lineout",
    schritte: [
      { dauer: 1000 },
      { move: { L1: [100, 160], L2: [128, 160], O1: [100, 124], O3: [128, 124] }, lift: { J1: 1, O2: 0.55 }, ball: { to: "J1", arc: 34 }, dauer: 1050 },
      { lift: { J1: 0, O2: 0 }, move: { SH: [130, 192], O1: [102, 128], O2: [116, 128], O3: [132, 128] }, ball: { to: "SH", arc: 6 }, dauer: 900 },
      { move: { FH: [236, 226], O4: [168, 118], O5: [190, 116], O6: [212, 116] }, ball: { to: "FH", arc: 10 }, dauer: 900 },
      { move: { FH: [244, 196], IC: [282, 222], O5: [208, 150], O6: [234, 158] }, dauer: 900 },
    ],
    de: { kurz: "Wurf auf den ersten Jumper (J1)",
      erklaerung: "Unser Standard-Call: kurzer, sicherer Wurf auf den Jumper von Pod 1. Wenig Flugzeit, wenig Risiko – perfekt, wenn wir den Ball einfach sicher haben wollen.",
      wer: [["Hooker", "Wirft gerade auf J1."], ["Pod 1 (L1 + L2)", "Front- und Back-Lifter heben J1 gemeinsam."], ["J1", "Springt, fängt mit beiden Händen über dem Kopf, landet kontrolliert."], ["9", "Steht hinter J1 bereit und nimmt den Ball an."]],
      achtung: ["Timing: J1 springt, wenn der Ball die Hand des Hookers verlässt.", "Lifter halten J1, bis die Füße wieder sicher am Boden sind.", "Ball nach unten zu 9 geben – nicht in die Gegner-Hände tippen."],
      steps: ["Call „Giesinger“ – alle wissen: der Ball geht auf J1.", "Der Hooker wirft – gleichzeitig heben L1 und L2 J1 hoch. J1 ist ganz oben, wenn der Ball ankommt. Der gegnerische Jumper springt mit, kommt aber nicht ran.", "J1 fängt, landet sicher und gibt den Ball nach unten zu 9. Die Gegner*innen landen mit leeren Händen.", "9 passt auf 10 – die Gegner*innen verschieben Richtung Ball.", "10 läuft an, 12 kommt mit – die Verteidigung kommt zu spät. Lineout gewonnen ✓"] },
    en: { kurz: "Throw to the first jumper (J1)",
      erklaerung: "Our standard call: a short, safe throw to the Pod 1 jumper. Little flight time, little risk – perfect when we simply want to keep the ball.",
      wer: [["Hooker", "Throws straight to J1."], ["Pod 1 (L1 + L2)", "Front and back lifter lift J1 together."], ["J1", "Jumps, catches with both hands above the head, lands under control."], ["9", "Waits behind J1 and takes the ball."]],
      achtung: ["Timing: J1 jumps when the ball leaves the hooker's hands.", "Lifters hold J1 until both feet are safely back on the ground.", "Give the ball down to the 9 – don't tap it into the opposition's hands."],
      steps: ["Call “Giesinger” – everyone knows: the ball goes to J1.", "The hooker throws – at the same time L1 and L2 lift J1. J1 is at the top when the ball arrives. The opposing jumper goes up too but can't reach it.", "J1 catches, lands safely and gives the ball down to the 9. The opposition lands empty-handed.", "9 passes to 10 – the opposition shifts towards the ball.", "10 runs onto it, 12 comes along – the defence is too late. Lineout won ✓"] },
  },
  {
    id: "isar", name: "Isar", kategorie: "lineout", setup: "lineout",
    schritte: [
      { dauer: 1000 },
      { move: { L3: [160, 160], L4: [188, 160], O4: [160, 124], O6: [188, 124] }, lift: { J2: 1, O5: 0.55 }, ball: { to: "J2", arc: 44 }, dauer: 1150 },
      { lift: { J2: 0, O5: 0 }, move: { SH: [176, 194], O4: [162, 128], O5: [176, 128], O6: [190, 128] }, ball: { to: "SH", arc: 6 }, dauer: 900 },
      { move: { FH: [240, 226], O1: [120, 116], O2: [140, 116], O6: [214, 120] }, ball: { to: "FH", arc: 10 }, dauer: 900 },
      { move: { FH: [248, 196], IC: [284, 222], O5: [212, 156], O6: [236, 162] }, dauer: 900 },
    ],
    de: { kurz: "Wurf auf den zweiten Jumper (J2)",
      erklaerung: "Längerer Wurf nach hinten auf den Jumper von Pod 2. Gut, wenn die Gegner*innen vorne auf J1 lauern – dafür braucht der Wurf mehr Präzision.",
      wer: [["Hooker", "Längerer Wurf mit etwas mehr Bogen auf J2."], ["Pod 2 (L3 + L4)", "Front- und Back-Lifter heben J2."], ["J2", "Springt, fängt und landet kontrolliert."], ["9", "Läuft hinter J2 und übernimmt den Ball."]],
      achtung: ["Der Wurf ist länger: Hooker und J2 brauchen eingespieltes Timing.", "Pod 1 bleibt am Boden – nicht mitspringen, sonst verwirrt's.", "9 rechtzeitig nach hinten verschieben."],
      steps: ["Call „Isar“ – Ziel ist J2.", "Der Hooker wirft weit über die Mitte – gleichzeitig heben L3 und L4 J2 hoch. Der gegnerische Jumper springt mit, ist aber zu niedrig.", "J2 fängt, landet und gibt nach unten zu 9.", "9 passt auf 10 – die Gegner*innen verschieben Richtung Ball.", "10 attackiert mit 12, bevor die Verteidigung steht. Lineout gewonnen ✓"] },
    en: { kurz: "Throw to the second jumper (J2)",
      erklaerung: "A longer throw to the Pod 2 jumper at the back. Good when the opposition is waiting for J1 at the front – but the throw needs more precision.",
      wer: [["Hooker", "Longer throw with a bit more arc to J2."], ["Pod 2 (L3 + L4)", "Front and back lifter lift J2."], ["J2", "Jumps, catches and lands under control."], ["9", "Runs behind J2 and takes the ball."]],
      achtung: ["The throw is longer: hooker and J2 need well-practised timing.", "Pod 1 stays on the ground – don't jump too, it only confuses things.", "9 shifts back in time."],
      steps: ["Call “Isar” – the target is J2.", "The hooker throws long down the middle – at the same time L3 and L4 lift J2. The opposing jumper goes up too but is too low.", "J2 catches, lands and gives it down to the 9.", "9 passes to 10 – the opposition shifts towards the ball.", "10 attacks with 12 before the defence is set. Lineout won ✓"] },
  },
  {
    id: "sieben", name: "7", kategorie: "lineout", setup: "lineout",
    schritte: [
      { dauer: 1000 },
      { move: { L1: [112, 158], J1: [130, 158], L2: [148, 158], L3: [170, 158], J2: [188, 158], L4: [206, 158], O1: [112, 122], O2: [130, 122], O3: [148, 122], O4: [170, 122], O5: [188, 122], O6: [206, 122] }, dauer: 900 },
      { move: { L1: [106, 152], O1: [114, 124], O3: [146, 124] }, lift: { J1: 0.35, O2: 0.6 }, ball: { to: "L1", arc: 8 }, dauer: 750 },
      { lift: { J1: 0, O2: 0 }, move: { L1: [72, 128], J1: [92, 142], L2: [112, 146], O1: [108, 124], O2: [126, 120] }, support: ["J1", "L2"], lauf: ["L1"], dauer: 800 },
      { move: { L1: [56, 100], J1: [74, 118], L2: [94, 124], O1: [106, 112], O2: [126, 112], O3: [146, 116] }, dauer: 750 },
      { move: { L1: [64, 72], J1: [82, 90], L2: [102, 96], O1: [118, 108], O2: [136, 110], O3: [154, 114] }, dauer: 750 },
      { move: { L1: [92, 46], J1: [108, 64], L2: [126, 70], O1: [110, 84], O2: [132, 88], O3: [150, 94] }, dauer: 850 },
    ],
    de: { kurz: "Täuschung mit Pod 1 – Front-Lifter fängt und läuft",
      erklaerung: "Der Überraschungs-Call: Beide Pods gehen weiter nach hinten, Pod 1 täuscht einen Sprung an. Der Front-Lifter (L1) dreht sich zum Hooker, bekommt einen schnellen, flachen Ball und läuft direkt selbst los, J1 und L2 laufen als Support mit. Kein Pass zu 9 oder den Backs.",
      wer: [["Pod 1 + Pod 2", "Gehen beim Call weiter nach hinten – vorne entsteht Platz."], ["J1 + L2", "Täuschen einen Sprung an – und laufen danach sofort als Support hinter L1."], ["L1 (Front-Lifter)", "Dreht sich zum Hooker, fängt den Ball und läuft sofort los."], ["Hooker", "Schneller, flacher Wurf direkt auf L1."]],
      achtung: ["Schnell ausführen, bevor sich die Gegner*innen sortieren.", "Die Täuschung von Pod 1 muss echt aussehen.", "L1 läuft selbst weiter – nicht zu 9 oder den Backs passen.", "Support eng dranbleiben: eine Armlänge hinter/neben L1."],
      steps: ["Call „7“ – beide Pods wissen Bescheid.", "Beide Pods gehen weiter nach hinten – vorne entsteht Platz.", "Pod 1 täuscht einen Sprung an – gleichzeitig kommt der schnelle, flache Wurf auf L1, der sich zum Hooker gedreht hat.", "L1 läuft schräg Richtung Seitenlinie an den Gegner*innen vorbei – J1 und L2 lösen sich sofort als Support.", "Weiter schräg nach vorne – die Gegner*innen wollen L1 ins Aus drängen.", "Leichte Kurve zurück ins Feld – so kann niemand L1 einfach ins Aus schieben.", "Raumgewinn ✓ – Support direkt dran, kein Pass zu 9 oder den Backs."] },
    en: { kurz: "Dummy with Pod 1 – the front lifter catches and runs",
      erklaerung: "The surprise call: both pods move further back, Pod 1 fakes a jump. The front lifter (L1) turns to the hooker, gets a quick, flat ball and takes off straight away, J1 and L2 follow in support. No pass to the 9 or the backs.",
      wer: [["Pod 1 + Pod 2", "Move further back on the call – space opens up at the front."], ["J1 + L2", "Fake a jump – then immediately run in support behind L1."], ["L1 (front lifter)", "Turns to the hooker, catches the ball and runs straight away."], ["Hooker", "Quick, flat throw straight to L1."]],
      achtung: ["Do it quickly, before the opposition gets organised.", "Pod 1's dummy has to look real.", "L1 keeps running – no pass to the 9 or the backs.", "Support stays close: one arm's length behind/next to L1."],
      steps: ["Call “7” – both pods know what's up.", "Both pods move further back – space opens up at the front.", "Pod 1 fakes a jump – at the same time the quick, flat throw goes to L1, who has turned to the hooker.", "L1 runs at an angle towards the touchline, past the opposition – J1 and L2 break off in support straight away.", "Keep going forward at an angle – the opposition tries to push L1 into touch.", "A slight curve back into the pitch – that way nobody can simply push L1 into touch.", "Metres gained ✓ – support right there, no pass to the 9 or the backs."] },
  },
  {
    id: "hook", name: "Hooker", kategorie: "lineout", setup: "lineout",
    schritte: [
      { dauer: 1000 },
      { move: { L3: [168, 158], J2: [186, 158], L4: [204, 158], O4: [168, 122], O5: [186, 122], O6: [204, 122] }, dauer: 900 },
      { move: { L3: [172, 160], L4: [200, 160], H: [80, 182], O4: [172, 124], O6: [200, 124] }, lift: { J2: 1, O5: 0.55 }, ball: { to: "J2", arc: 46 }, lauf: ["H"], dauer: 1150 },
      { move: { H: [150, 160] }, lift: { O5: 0 }, ball: { to: "H", arc: 12 }, dauer: 900 },
      { lift: { J2: 0 }, move: { H: [152, 112], L2: [140, 132], L3: [164, 134], O3: [124, 116], O4: [180, 116] }, support: ["L2", "L3"], dauer: 900 },
      { move: { H: [153, 90], L2: [138, 110], L3: [168, 112], O3: [132, 106], O4: [174, 106], O2: [118, 112], O5: [190, 112] }, dauer: 900 },
      { move: { H: [154, 74], L2: [136, 94], L3: [172, 96], O3: [136, 98], O4: [170, 98] }, dauer: 800 },
    ],
    de: { kurz: "Pod 2 öffnet eine Lücke, Ball zurück zum Hooker",
      erklaerung: "Trickspielzug: Pod 2 baut eine größere Lücke zu Pod 1 auf und bekommt den Einwurf. Der Hooker läuft nach dem Wurf über unsere Spielfeldseite in die Lücke zwischen Pod 1 und Pod 2, bekommt den Ball zurück und läuft weiter. Pod 1 und Pod 2 laufen als Support mit. Kein Pass zu 9 oder den Backs.",
      wer: [["Pod 2 (L3, J2, L4)", "Geht beim Call nach hinten und öffnet eine größere Lücke zu Pod 1."], ["Hooker", "Wirft auf J2 und läuft sofort über unsere Seite in die Lücke."], ["J2", "Gibt den Ball direkt zum Hooker in der Lücke."], ["L2 + L3 (Support)", "Die beiden Lifter an der Lücke laufen links und rechts hinter dem Hooker mit."]],
      achtung: ["Hooker muss sofort nach dem Wurf loslaufen – über unsere Seite, nicht durch die Gasse.", "J2 spielt den Ball kontrolliert – lieber kurz und sicher.", "Der Hooker läuft selbst weiter – kein Pass zu 9 oder den Backs.", "Funktioniert nur, wenn niemand den Call verrät 🤫"],
      steps: ["Call „Hooker“ – sieht aus wie ein Wurf auf Pod 2 …", "Pod 2 geht nach hinten und baut eine größere Lücke zu Pod 1 auf.", "Der Hooker wirft auf J2 – gleichzeitig heben L3 und L4 J2 hoch, und der Hooker läuft sofort über unsere Seite los. Der gegnerische Jumper springt mit, kommt aber nicht ran.", "Hooker läuft in die Lücke zwischen Pod 1 und Pod 2 – J2 gibt ihm den Ball.", "Hooker bricht durch die Lücke – L2 und L3 lösen sich als Support.", "Support-Lauf: L2 und L3 laufen links und rechts direkt hinter dem Hooker. Die Gegner*innen drehen sich zu spät um.", "Raumgewinn durch die Mitte ✓ – kein Pass zu 9 oder den Backs."] },
    en: { kurz: "Pod 2 opens a gap, ball back to the hooker",
      erklaerung: "Trick play: Pod 2 opens a bigger gap to Pod 1 and gets the throw. After throwing, the hooker runs along our side of the line into the gap between Pod 1 and Pod 2, gets the ball back and keeps running. Pod 1 and Pod 2 follow in support. No pass to the 9 or the backs.",
      wer: [["Pod 2 (L3, J2, L4)", "Moves back on the call and opens a bigger gap to Pod 1."], ["Hooker", "Throws to J2 and immediately runs along our side into the gap."], ["J2", "Gives the ball straight to the hooker in the gap."], ["L2 + L3 (support)", "The two lifters next to the gap run left and right behind the hooker."]],
      achtung: ["The hooker has to go straight after the throw – along our side, not through the line.", "J2 plays the ball under control – short and safe.", "The hooker keeps running – no pass to the 9 or the backs.", "Only works if nobody gives the call away 🤫"],
      steps: ["Call “Hooker” – looks like a throw to Pod 2 …", "Pod 2 moves back and opens a bigger gap to Pod 1.", "The hooker throws to J2 – at the same time L3 and L4 lift J2, and the hooker immediately runs along our side. The opposing jumper goes up too but can't reach it.", "The hooker runs into the gap between Pod 1 and Pod 2 – J2 gives them the ball.", "The hooker breaks through the gap – L2 and L3 break off in support.", "Support line: L2 and L3 run left and right right behind the hooker. The opposition turns around too late.", "Metres gained through the middle ✓ – no pass to the 9 or the backs."] },
  },
  {
    id: "dhl", name: "DHL", kategorie: "lineout", setup: "lineout",
    schritte: [
      { dauer: 1000 },
      { move: { L1: [100, 160], L2: [128, 160], O1: [100, 124], O3: [128, 124] }, lift: { J1: 1, O2: 0.55 }, ball: { to: "J1", arc: 34 }, dauer: 1050 },
      { lift: { J1: 0, O2: 0 }, move: { J1: [114, 158], L1: [94, 164], L2: [134, 164], O1: [94, 138], O2: [114, 134], O3: [134, 138], O4: [97, 116], O5: [114, 112], O6: [131, 116] }, dauer: 900 },
      { move: { L3: [97, 186], J2: [114, 186], L4: [131, 186], H: [114, 208], SH: [156, 224] }, maul: ["J1", "L1", "L2", "L3", "J2", "L4", "H"], dauer: 1000 },
      { ball: { to: "H", arc: 0 }, dauer: 800 },
      { move: { J1: [114, 128], L1: [94, 134], L2: [134, 134], L3: [97, 156], J2: [114, 156], L4: [131, 156], H: [114, 178], O1: [94, 108], O2: [114, 104], O3: [134, 108], O4: [97, 86], O5: [114, 82], O6: [131, 86], SH: [156, 194] }, dauer: 1600 },
      { move: { J1: [114, 110], L1: [94, 116], L2: [134, 116], L3: [97, 138], J2: [114, 138], L4: [131, 138], H: [114, 160], O1: [94, 90], O2: [114, 86], O3: [134, 90], O4: [97, 68], O5: [114, 66], O6: [131, 68], SH: [154, 176] }, dauer: 1300 },
    ],
    de: { kurz: "Lineout wird zum Maul – fangen, landen, schieben",
      erklaerung: "Wir liefern das Paket – zuverlässig über die Linie 📦. J1 fängt, landet, alle binden sofort an und das Maul schiebt als Einheit nach vorne. Der Ball wird nach hinten durchgereicht.",
      wer: [["J1", "Fängt, landet stabil und dreht sich mit dem Rücken zu den Gegner*innen."], ["L1 + L2", "Bleiben dran und binden sofort an J1."], ["Pod 2 + Hooker", "Kommen von hinten dazu und binden an."], ["Letzte Person", "Bekommt den Ball durchgereicht und hält ihn hinten sicher."], ["9", "Steht hinter dem Maul und entscheidet, wann der Ball raus geht."]],
      achtung: ["Tief bleiben und eng binden – ein Maul ist nur so stark wie seine Bindung.", "Ball schnell nach hinten weitergeben.", "Gemeinsam schieben: kleine Schritte, auf Kommando."],
      steps: ["Call „DHL“ – heute wird geliefert.", "Wurf auf J1 – gleichzeitig heben L1 und L2 J1 hoch. Der gegnerische Jumper springt mit, kommt aber nicht ran.", "J1 landet, L1 und L2 binden sofort an. Die Gegner*innen stellen sich dem Maul entgegen.", "Pod 2 und der Hooker binden hinten an – das Maul steht.", "Ball wird nach hinten durchgereicht.", "Schieben! Alle gemeinsam nach vorne – die Gegner*innen werden zurückgedrängt.", "Paket zugestellt ✓ – 9 entscheidet, wann der Ball raus geht."] },
    en: { kurz: "The lineout becomes a maul – catch, land, drive",
      erklaerung: "We deliver the parcel – reliably over the line 📦. J1 catches, lands, everyone binds on straight away and the maul drives forward as one unit. The ball is passed back through the maul.",
      wer: [["J1", "Catches, lands solidly and turns their back to the opposition."], ["L1 + L2", "Stay on and bind onto J1 immediately."], ["Pod 2 + hooker", "Join from behind and bind on."], ["Last person", "Gets the ball passed back and holds it safely at the back."], ["9", "Stands behind the maul and decides when the ball comes out."]],
      achtung: ["Stay low and bind tight – a maul is only as strong as its binding.", "Move the ball back quickly.", "Drive together: small steps, on the call."],
      steps: ["Call “DHL” – today we deliver.", "Throw to J1 – at the same time L1 and L2 lift J1. The opposing jumper goes up too but can't reach it.", "J1 lands, L1 and L2 bind on straight away. The opposition sets up against the maul.", "Pod 2 and the hooker bind on at the back – the maul is set.", "The ball is passed back through the maul.", "Drive! Everyone forward together – the opposition is pushed back.", "Parcel delivered ✓ – the 9 decides when the ball comes out."] },
  },

  /* ----- Pass-Calls (Ruck etwas links der Mitte, gespielt wird nach rechts) ----- */
  {
    id: "feuer", name: { de: "Feuer", en: "Fire" }, kategorie: "pass", setup: "ruck_fire",
    schritte: [
      { dauer: 1100 },
      { move: { F1: [136, 152], F2: [152, 146], F3: [168, 152], D2: [158, 126], D3: [190, 126] }, lauf: ["F1", "F2", "F3"], dauer: 900 },
      { move: { FH: [186, 208] }, ball: { to: "FH", arc: 14 }, dauer: 950 },
      { move: { FH: [194, 196], IC: [238, 214] }, ball: { to: "IC", arc: 10 }, dauer: 850 },
      { move: { IC: [244, 204], OC: [288, 226] }, ball: { to: "OC", arc: 10 }, lauf: [], dauer: 850 },
      { move: { OC: [298, 168], D5: [268, 128], D6: [312, 132] }, lauf: ["OC"], dauer: 1000 },
    ],
    de: { kurz: "9 passt direkt zur 10, weiter in die Backs",
      erklaerung: "Schneller Ball nach außen: Aus dem Ruck passt die 9 direkt zur 10, die 10 spielt weiter an die Backs (12, 13). Steht ein Forward-Pod im Passweg, macht er einen Dummy-Run nach vorne – das bindet Verteidiger*innen und hält den Weg frei.",
      wer: [["9", "Passt aus dem Ruck direkt zur 10 – ohne Umweg über die Forwards."], ["Forward-Pod im Weg", "Macht einen Dummy-Run nach vorne und zieht die Verteidigung auf sich."], ["10", "Fängt im Laufen und spielt sofort weiter zur 12."], ["12 + 13", "Laufen mit Tempo an, der Ball geht bis in den Außenraum."]],
      achtung: ["Der Dummy-Run muss echt aussehen – mit Tempo und Blick zum Ball.", "Der Pass der 9 geht hinter dem Pod vorbei, nicht durch ihn hindurch.", "Backs starten tief genug, damit sie mit Tempo auf den Ball laufen."],
      steps: ["Call „Feuer“ – der Ball geht direkt von der 9 zur 10.", "Der Pod im Passweg macht einen Dummy-Run nach vorne – die Verteidigung wird gebunden.", "9 passt direkt zur 10, hinter dem Pod vorbei.", "10 spielt sofort weiter zur 12.", "12 passt zur 13.", "13 attackiert den Außenraum ✓"] },
    en: { kurz: "9 passes straight to 10, then on through the backs",
      erklaerung: "Quick ball wide: from the ruck the 9 passes straight to the 10, who moves it on to the backs (12, 13). If a forward pod is standing in the passing lane, it makes a dummy run forward – that holds defenders and keeps the lane clear.",
      wer: [["9", "Passes from the ruck straight to the 10 – no detour via the forwards."], ["Forward pod in the way", "Makes a dummy run forward and draws the defence."], ["10", "Catches on the run and moves it straight on to the 12."], ["12 + 13", "Run onto it at pace, the ball goes all the way wide."]],
      achtung: ["The dummy run has to look real – with pace and eyes on the ball.", "The 9's pass goes behind the pod, not through it.", "Backs start deep enough to hit the ball at pace."],
      steps: ["Call “Fire” – the ball goes straight from the 9 to the 10.", "The pod in the passing lane makes a dummy run forward – the defence is held.", "9 passes straight to 10, behind the pod.", "10 moves it straight on to the 12.", "12 passes to 13.", "13 attacks the wide channel ✓"] },
  },
  {
    id: "pod10", name: "Pod 10", kategorie: "pass", setup: "ruck_pod10",
    schritte: [
      { dauer: 1200 },
      { move: { FH: [180, 208] }, ball: { to: "FH", arc: 14 }, dauer: 950 },
      { move: { P1: [208, 214], P2: [222, 208], P3: [236, 214], FH: [184, 202] }, ball: { to: "P2", arc: 6 }, dauer: 850 },
      { move: { P2: [224, 160], P1: [208, 172], P3: [240, 172], D4: [228, 128], D3: [204, 128], D5: [258, 128] }, support: ["P1", "P3"], lauf: ["P2"], dauer: 1000 },
      { move: { P2: [226, 148], P1: [210, 160], P3: [242, 160] }, dauer: 800 },
    ],
    de: { kurz: "Der Pod steht an der 10 – 9 → 10 → Pod",
      erklaerung: "Der nächste Forward-Pod stellt sich nicht neben die 9, sondern erst neben die 10. Aus dem Ruck passt die 9 zur 10, die 10 spielt den Ball noch einmal weiter in den Pod. So greifen die Forwards eine Stelle weiter außen an, wo die Verteidigung oft dünner ist.",
      wer: [["Forward-Pod", "Stellt sich neben die 10 statt neben die 9 und läuft auf den Pass an."], ["9", "Passt aus dem Ruck zur 10."], ["10", "Zieht die Verteidigung an und passt kurz in den Pod."], ["Pod-Mitte", "Trägt den Ball in den Kontakt, die anderen beiden sind direkt Support."]],
      achtung: ["Der Pod wartet tief genug und läuft erst mit dem Pass der 9 los.", "Kurzer, flacher Pass von der 10 – der Pod muss ihn im vollen Lauf fangen können.", "Support bleibt eng dran, damit der nächste Ruck schnell steht."],
      steps: ["Call „Pod 10“ – der Pod steht nicht an der 9, sondern neben der 10.", "9 passt aus dem Ruck zur 10.", "Der Pod läuft an – 10 passt kurz zur Pod-Mitte (P2).", "P2 trägt den Ball in den Kontakt, P1 und P3 sind direkt als Support dran.", "Raumgewinn ✓ – schneller Ball für den nächsten Ruck."] },
    en: { kurz: "The pod stands next to the 10 – 9 → 10 → pod",
      erklaerung: "The next forward pod doesn't line up next to the 9 but next to the 10. From the ruck the 9 passes to the 10, who moves the ball on once more into the pod. That way the forwards attack one channel further out, where the defence is often thinner.",
      wer: [["Forward pod", "Lines up next to the 10 instead of the 9 and runs onto the pass."], ["9", "Passes from the ruck to the 10."], ["10", "Draws the defence and gives a short pass into the pod."], ["Middle of the pod", "Carries into contact, the other two are right there in support."]],
      achtung: ["The pod waits deep enough and only goes with the 9's pass.", "Short, flat pass from the 10 – the pod has to catch it at full speed.", "Support stays close so the next ruck forms quickly."],
      steps: ["Call “Pod 10” – the pod isn't next to the 9 but next to the 10.", "9 passes from the ruck to the 10.", "The pod runs onto it – the 10 gives a short pass to the middle of the pod (P2).", "P2 carries into contact, P1 and P3 are right there in support.", "Metres gained ✓ – quick ball for the next ruck."] },
  },
  {
    id: "plus", name: "Plus", kategorie: "pass", setup: "ruck_diamond",
    schritte: [
      { dauer: 1200 },
      { move: { LD: [174, 204], A: [160, 218], B: [188, 218], C: [174, 232] }, ball: { to: "LD", arc: 8 }, dauer: 900 },
      { move: { LD: [176, 192], A: [162, 206], B: [198, 200], C: [176, 218] }, ball: { to: "B", arc: 5 }, dauer: 750 },
      { move: { B: [206, 156], LD: [190, 168], A: [176, 178], C: [218, 172], D3: [200, 126], D4: [228, 126] }, support: ["LD", "A", "C"], lauf: ["B"], dauer: 1000 },
      { move: { B: [210, 142], LD: [194, 156], A: [180, 166], C: [224, 158] }, dauer: 850 },
    ],
    de: { kurz: "Diamant-Pod: Pass auf die von der 9 abgewandte Seite",
      erklaerung: "Viererpod in Diamantform. Die 9 passt aus dem Ruck zum Podleader vorne. Der Podleader spielt weiter zur Support-Person auf der Seite, die von der 9 abgewandt ist. Die anderen drei kommen sofort als Support zur neuen Ballträgerin.",
      wer: [["9", "Passt aus dem Ruck zum Podleader."], ["Podleader (L)", "Fängt, zieht die Verteidigung an und passt zur Seite weg von der 9 (B)."], ["Support auf der abgewandten Seite (B)", "Läuft auf den Pass an und wird zur neuen Ballträgerin."], ["L, A + C", "Kommen als Support zu B."]],
      achtung: ["Der Diamant bleibt eng: eine Armlänge Abstand.", "B startet erst, wenn der Podleader den Ball hat.", "Alle Supporter*innen ziehen sofort mit zum neuen Ballträger."],
      steps: ["Call „Plus“ – Viererpod in Diamantform.", "9 passt aus dem Ruck zum Podleader (L).", "Der Podleader passt zur Support-Person auf der von der 9 abgewandten Seite (B).", "B trägt den Ball weiter – L, A und C kommen als Support.", "Support bleibt eng dran ✓"] },
    en: { kurz: "Diamond pod: pass to the side away from the 9",
      erklaerung: "Four-player pod in a diamond shape. The 9 passes from the ruck to the pod leader at the front. The pod leader moves it on to the support player on the side away from the 9. The other three come straight in to support the new ball carrier.",
      wer: [["9", "Passes from the ruck to the pod leader."], ["Pod leader (L)", "Catches, draws the defence and passes to the side away from the 9 (B)."], ["Support on the far side (B)", "Runs onto the pass and becomes the new ball carrier."], ["L, A + C", "Come in to support B."]],
      achtung: ["Keep the diamond tight: one arm's length apart.", "B only goes once the pod leader has the ball.", "All supporters move with the new ball carrier straight away."],
      steps: ["Call “Plus” – four-player pod in a diamond.", "9 passes from the ruck to the pod leader (L).", "The pod leader passes to the support player on the side away from the 9 (B).", "B carries on – L, A and C come in support.", "Support stays close ✓"] },
  },
  {
    id: "minus", name: "Minus", kategorie: "pass", setup: "ruck_diamond",
    schritte: [
      { dauer: 1200 },
      { move: { LD: [174, 204], A: [160, 218], B: [188, 218], C: [174, 232] }, ball: { to: "LD", arc: 8 }, dauer: 900 },
      { move: { LD: [176, 192], A: [154, 200], B: [190, 206], C: [174, 216] }, ball: { to: "A", arc: 5 }, dauer: 750 },
      { move: { A: [148, 156], LD: [164, 168], B: [178, 178], C: [134, 170], D2: [150, 126], D1: [124, 126] }, support: ["LD", "B", "C"], lauf: ["A"], dauer: 1000 },
      { move: { A: [146, 142], LD: [160, 156], B: [174, 166], C: [130, 158] }, dauer: 850 },
    ],
    de: { kurz: "Diamant-Pod: Pass auf die Seite der 9",
      erklaerung: "Viererpod in Diamantform. Die 9 passt aus dem Ruck zum Podleader vorne. Der Podleader spielt zurück zur Support-Person auf der Seite der 9. Die anderen drei kommen sofort als Support zur neuen Ballträgerin.",
      wer: [["9", "Passt aus dem Ruck zum Podleader."], ["Podleader (L)", "Fängt, zieht die Verteidigung an und passt zur Seite der 9 (A)."], ["Support auf der Seite der 9 (A)", "Läuft auf den Pass an und wird zur neuen Ballträgerin."], ["L, B + C", "Kommen als Support zu A."]],
      achtung: ["Der Diamant bleibt eng: eine Armlänge Abstand.", "Der Pass geht gegen die Laufrichtung – kurz und sicher spielen.", "Alle Supporter*innen ziehen sofort mit zum neuen Ballträger."],
      steps: ["Call „Minus“ – Viererpod in Diamantform.", "9 passt aus dem Ruck zum Podleader (L).", "Der Podleader passt zur Support-Person auf der Seite der 9 (A).", "A trägt den Ball weiter – L, B und C kommen als Support.", "Support bleibt eng dran ✓"] },
    en: { kurz: "Diamond pod: pass to the 9's side",
      erklaerung: "Four-player pod in a diamond shape. The 9 passes from the ruck to the pod leader at the front. The pod leader plays it back to the support player on the 9's side. The other three come straight in to support the new ball carrier.",
      wer: [["9", "Passes from the ruck to the pod leader."], ["Pod leader (L)", "Catches, draws the defence and passes to the 9's side (A)."], ["Support on the 9's side (A)", "Runs onto the pass and becomes the new ball carrier."], ["L, B + C", "Come in to support A."]],
      achtung: ["Keep the diamond tight: one arm's length apart.", "The pass goes against the direction of play – keep it short and safe.", "All supporters move with the new ball carrier straight away."],
      steps: ["Call “Minus” – four-player pod in a diamond.", "9 passes from the ruck to the pod leader (L).", "The pod leader passes to the support player on the 9's side (A).", "A carries on – L, B and C come in support.", "Support stays close ✓"] },
  },
  {
    id: "fiji", name: "Fiji", kategorie: "pass", setup: "ruck_diamond",
    schritte: [
      { dauer: 1200 },
      { move: { LD: [174, 204], A: [160, 218], B: [188, 218], C: [174, 232] }, ball: { to: "LD", arc: 8 }, dauer: 900 },
      { move: { LD: [176, 190], A: [162, 202], B: [190, 202], C: [182, 212], D3: [184, 128], D2: [160, 128] }, ball: { to: "C", arc: 4 }, dauer: 750 },
      { move: { C: [234, 178], LD: [180, 182], A: [166, 192], B: [196, 192], FH: [242, 234], IC: [282, 240], D4: [226, 128] }, lauf: ["C"], dauer: 1000 },
      { move: { C: [246, 166], IC: [286, 204] }, ball: { to: "IC", arc: 10 }, dauer: 800 },
      { move: { IC: [294, 152], D5: [270, 128], D6: [318, 132] }, lauf: ["IC"], dauer: 950 },
    ],
    de: { kurz: "Diamant-Pod: Pass nach hinten, schräger Lauf Richtung Backs",
      erklaerung: "Viererpod in Diamantform. Die 9 passt aus dem Ruck zum Podleader vorne. Der Podleader gibt den Ball an die Support-Person hinter sich (C). Die nutzt die Lücke und läuft schräg Richtung Backs – dort spielt sie noch einen Pass weiter, z. B. zur 12.",
      wer: [["9", "Passt aus dem Ruck zum Podleader."], ["Podleader (L)", "Zieht die Verteidigung auf sich und gibt den Ball nach hinten zu C."], ["Support hinten (C)", "Läuft schräg durch die Lücke Richtung Backs und spielt weiter."], ["12", "Läuft auf den Pass von C an und greift außen an."]],
      achtung: ["Der Podleader muss die Verteidigung wirklich binden – sonst ist die Lücke zu.", "C startet tief genug, um mit Tempo durch die Lücke zu laufen.", "Die Backs bleiben auf Höhe, damit der Weiterpass ankommt."],
      steps: ["Call „Fiji“ – Viererpod in Diamantform.", "9 passt aus dem Ruck zum Podleader (L).", "Der Podleader bindet die Verteidigung und gibt den Ball nach hinten zu C.", "C nutzt die Lücke und läuft schräg Richtung Backs.", "C spielt weiter zur 12.", "12 greift den Außenraum an ✓"] },
    en: { kurz: "Diamond pod: pass behind, angled run towards the backs",
      erklaerung: "Four-player pod in a diamond shape. The 9 passes from the ruck to the pod leader at the front. The pod leader gives the ball to the support player behind (C), who uses the gap and runs at an angle towards the backs – where they play one more pass, e.g. to the 12.",
      wer: [["9", "Passes from the ruck to the pod leader."], ["Pod leader (L)", "Draws the defence and gives the ball back to C."], ["Support behind (C)", "Runs at an angle through the gap towards the backs and plays on."], ["12", "Runs onto C's pass and attacks wide."]],
      achtung: ["The pod leader has to really hold the defence – otherwise the gap closes.", "C starts deep enough to hit the gap at pace.", "The backs stay level so the next pass can reach them."],
      steps: ["Call “Fiji” – four-player pod in a diamond.", "9 passes from the ruck to the pod leader (L).", "The pod leader holds the defence and gives the ball back to C.", "C uses the gap and runs at an angle towards the backs.", "C passes on to the 12.", "12 attacks the wide channel ✓"] },
  },
];
const CALL_CATS = {
  lineout: { label: { de: "Lineout-Calls", en: "Lineout calls" }, short: "Lineout" },
  pass: { label: { de: "Pass-Calls", en: "Passing calls" }, short: { de: "Pass", en: "Passing" } },
};
