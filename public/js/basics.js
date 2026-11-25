/* ======================================================================
   TAB: BASICS – Positionen, Scrum, Lineout-Calls, Pass-Calls, Quiz
   ====================================================================== */
const CT = c => L(c);                        // Call-Texte in der aktuellen Sprache (fr/es über Wörterbuch)
const CN = c => L(c.name);                   // Call-Name (z. B. Feuer / Fire)
const Basics = { group: "alle", sel: {}, anims: {}, quiz: { cat: "alle", score: 0, total: 0, streak: 0, cur: null, answered: false } };
const PLAY_I = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
const PAUSE_I = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>';
const REPLAY_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5"/></svg>';

const BASICS_SECTIONS = [
  ["sec-pos", { de: "Positionen", en: "Positions" }], ["sec-scrum", "Scrum"],
  ["sec-lineout", "Lineout-Calls"], ["sec-pass", { de: "Pass-Calls", en: "Passing calls" }], ["sec-quiz", "Quiz"],
];
const CAT_INTRO = {
  lineout: {
    de: `<p><b>Lineout</b> (Gasse): Spielfortsetzung, wenn der Ball im Aus war. Beide Teams stellen sich in zwei Reihen auf, der <b>Hooker</b> wirft den Ball gerade dazwischen.</p>
      <p><b>Jumper</b> springen hoch und fangen. <b>Lifter</b> heben sie an – vorne und hinten – und setzen sie sicher wieder ab.</p>
      <p>Ein <b>Pod</b> ist so ein Dreier-Team aus Front-Lifter, Jumper und Back-Lifter. Wir haben zwei: Pod 1 (L1, J1, L2) vorne und Pod 2 (L3, J2, L4) dahinter.</p>
      <p>Mit dem <b>Call</b> sagen wir an, wohin der Ball fliegt und was danach passiert – die Gegner*innen sollen's natürlich nicht wissen.</p>`,
    en: `<p><b>Lineout</b>: restarts play after the ball has gone into touch. Both teams line up in two rows and the <b>hooker</b> throws the ball straight down the middle.</p>
      <p><b>Jumpers</b> go up and catch. <b>Lifters</b> lift them – front and back – and bring them back down safely.</p>
      <p>A <b>pod</b> is a group of three: front lifter, jumper and back lifter. We have two: Pod 1 (L1, J1, L2) at the front and Pod 2 (L3, J2, L4) behind.</p>
      <p>The <b>call</b> tells everyone where the ball goes and what happens next – without the opposition knowing, of course.</p>` },
  pass: {
    de: `<p>Nach einem <b>Ruck</b> (Gedränge um den Ball am Boden) holt die <b>9</b> den Ball und spielt ihn weiter. Mit dem <b>Pass-Call</b> sagen wir an, wohin.</p>
      <p>Ein <b>Forward-Pod</b> ist eine kleine Gruppe Forwards, die zusammen anläuft. Beim <b>Diamant-Pod</b> stehen vier im Diamant: der <b>Podleader (L)</b> vorne, <b>A</b> auf der Seite der 9, <b>B</b> auf der anderen Seite und <b>C</b> dahinter.</p>
      <p>In den Grafiken liegt der Ruck etwas links der Mitte, gespielt wird nach rechts. Angriff ist nach oben ↑</p>`,
    en: `<p>After a <b>ruck</b> (the contest for the ball on the ground) the <b>9</b> picks up the ball and moves it on. The <b>passing call</b> tells everyone where.</p>
      <p>A <b>forward pod</b> is a small group of forwards running together. In the <b>diamond pod</b> four players form a diamond: the <b>pod leader (L)</b> at the front, <b>A</b> on the 9's side, <b>B</b> on the other side and <b>C</b> behind.</p>
      <p>In the graphics the ruck is slightly left of centre and we play to the right. We attack upwards ↑</p>` },
};

/* ---------- Spielfeld mit 15 Positionen ---------- */
const GROUP_OF = n => n <= 3 ? "front" : n <= 5 ? "second" : n <= 8 ? "backrow" : n <= 10 ? "half" : (n === 12 || n === 13) ? "centre" : "three";
const FIELD_POS = { 1: [144, 200], 2: [180, 196], 3: [216, 200], 4: [162, 240], 5: [198, 240], 6: [120, 250], 7: [240, 250], 8: [180, 278], 9: [100, 286], 10: [116, 342], 12: [184, 364], 13: [252, 384], 11: [44, 372], 14: [316, 402], 15: [180, 428] };
function fieldSVG() {
  let lines = "";
  for (let i = 0; i < 9; i++) lines += `<rect x="10" y="${10 + i * 50}" width="340" height="25" fill="#16391f"/>`;
  const pl = Object.entries(FIELD_POS).map(([n, [x, y]]) =>
    `<g class="pl" data-n="${n}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${n} ${POSITIONS[n].en}">
      <circle r="24" fill="transparent"/><circle class="sel" r="25" fill="none" stroke="#ffcc00" stroke-width="2.5"/>
      <g transform="scale(1.3)">${jerseyInner(n, n > 9 ? 9.5 : 10.5)}</g></g>`).join("");
  return `<svg class="field" viewBox="0 0 360 460" role="img" aria-label="${T("Rugby-Spielfeld mit 15 Positionen", "Rugby pitch with 15 positions")}">
    <rect x="0" y="0" width="360" height="460" rx="14" fill="#123320"/>${lines}
    <g stroke="#fff" stroke-opacity=".75" stroke-width="2" fill="none">
      <rect x="10" y="10" width="340" height="440"/>
      <line x1="10" y1="40" x2="350" y2="40"/><line x1="10" y1="100" x2="350" y2="100"/>
      <line x1="10" y1="152" x2="350" y2="152" stroke-dasharray="8 7" stroke-opacity=".5"/>
    </g>
    <g stroke="#fff" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="6 8"><line x1="30" y1="10" x2="30" y2="450"/><line x1="330" y1="10" x2="330" y2="450"/></g>
    <g fill="none" stroke="#fff" stroke-width="3" stroke-opacity=".8"><path d="M170 40 V12 M190 40 V12 M170 26 H190"/></g>
    <g font-family="Barlow Condensed,system-ui" font-weight="700" font-size="11" fill="#fff" fill-opacity=".6">
      <text x="36" y="34">TRY-LINE</text><text x="36" y="94">22 m</text><text x="36" y="146">10 m</text>
    </g>
    <g fill="#ffcc00"><path d="M318 50 l-8 14 h5 v24 h6 v-24 h5z"/></g>
    <text x="314" y="98" text-anchor="middle" font-family="Barlow Condensed,system-ui" font-weight="700" font-size="11" fill="#ffcc00">${T("ANGRIFF", "ATTACK")}</text>
    <ellipse cx="180" cy="238" rx="94" ry="60" fill="#ffcc00" fill-opacity=".05" stroke="#ffcc00" stroke-opacity=".35" stroke-dasharray="4 5"/>
    <text x="268" y="186" font-family="Barlow Condensed,system-ui" font-weight="700" font-size="11" fill="#ffcc00" fill-opacity=".8">SCRUM</text>
    ${pl}</svg>`;
}
function applyPosGroup() {
  const g = POS_GROUPS[Basics.group];
  $$("[data-pg]").forEach(b => b.setAttribute("aria-pressed", b.dataset.pg === Basics.group));
  $$(".pl").forEach(el => el.classList.toggle("dim", g.nums.length > 0 && !g.nums.includes(+el.dataset.n)));
  $("#grpInfo").innerHTML = L(g.text);
}
function openPosition(n) {
  const p = POSITIONS[n], tx = L(p.tx), grp = GROUP_OF(n), fwd = n <= 8;
  $$(".pl").forEach(el => el.classList.toggle("active", +el.dataset.n === n));
  openSheet(`<div class="poshead">
      <svg viewBox="-19 -18 38 40" class="posj" aria-hidden="true">${jerseyInner(n, n > 9 ? 10 : 11)}</svg>
      <div><div class="prole">${L(fwd ? "Forwards" : "Backs")} · ${esc(L(POS_GROUPS[grp].label))}</div><h2>${esc(p.en)}</h2>${LANG === "en" ? "" : `<div class="de">${esc(LANG === "de" ? p.de : tr("pos." + n))}</div>`}</div></div>
    <h4>${T("Aufgaben im Spiel", "Jobs in the game")}</h4><ul class="mini">${tx.aufgaben.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
    <div class="twocol"><div class="box"><h4>${T("Im Scrum", "In the scrum")}</h4><p>${esc(tx.scrum)}</p></div><div class="box"><h4>${T("Im Lineout", "In the lineout")}</h4><p>${esc(tx.lineout)}</p></div></div>
    <h4>${T("Typische Skills", "Typical skills")}</h4><div class="tags">${tx.skills.map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
    <div class="fit"><b>${T("Passt zu dir, wenn …", "Suits you if …")}</b> ${esc(tx.passt)}</div>
    <div class="posnav"><button class="btn" data-pn="${n === 1 ? 15 : n - 1}">← ${n === 1 ? 15 : n - 1}</button><button class="btn" data-pn="${n === 15 ? 1 : n + 1}">${n === 15 ? 1 : n + 1} →</button></div>`);
  $$("[data-pn]", $("#sheetInner")).forEach(b => b.onclick = () => openPosition(+b.dataset.pn));
}
document.addEventListener("sheetclosed", () => $$(".pl.active").forEach(el => el.classList.remove("active")));

/* ---------- Scrum ---------- */
function scrumSVG() {
  const P = { 1: [140, 112], 2: [170, 109], 3: [200, 112], 4: [155, 145], 5: [185, 145], 6: [117, 152], 7: [223, 152], 8: [170, 180], 9: [96, 98] };
  const bind = [[2, 1], [2, 3], [4, 5], [4, 1], [5, 3], [6, 4], [7, 5], [8, 4], [8, 5]];
  const line = ([a, b]) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`;
  return `<svg class="scrum" viewBox="60 24 220 176" role="img" aria-label="${T("Scrum-Bindung von oben", "Scrum binding from above")}">
    <rect x="60" y="24" width="220" height="176" fill="#123320"/>
    <g id="oppRow" class="opp">${[[140, "3"], [170, "2"], [200, "1"]].map(([x, n]) => `<circle cx="${x}" cy="0" r="14"/><text x="${x}" y="4">${n}</text>`).join("")}</g>
    <g id="extBind" stroke="#ffcc00" stroke-width="3" stroke-linecap="round" opacity="0"><line x1="140" y1="112" x2="196" y2="0" id="b1"/><line x1="200" y1="112" x2="144" y2="0" id="b3"/></g>
    <g stroke="#ffcc00" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6" opacity=".9">${bind.map(line).join("")}</g>
    ${Object.entries(P).map(([n, [x, y]]) => `<g class="sp" data-n="${n}" transform="translate(${x} ${y})"><circle r="${n == 9 ? 12 : 14}" fill="${n == 9 ? "#000" : "#ffcc00"}" stroke="${n == 9 ? "#fff" : "#000"}" stroke-width="2"/><text y="5" fill="${n == 9 ? "#fff" : "#000"}">${n}</text></g>`).join("")}
    <g id="sball" transform="translate(112 100)"><ellipse rx="7" ry="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/></g>
  </svg>`;
}
const Scrum = { phase: 0, raf: null };
function setScrumPhase(i, animate = true) {
  Scrum.phase = i; const ph = SCRUM_PHASES[i];
  $$(".scrumbtn").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
  $("#scrumText").innerHTML = L(ph.text);
  const opp = $("#oppRow"), ext = $("#extBind"), ball = $("#sball");
  cancelAnimationFrame(Scrum.raf);
  const from = +(opp.dataset.oy || 46), t0 = performance.now(), D = animate ? 600 : 0;
  const frame = now => {
    const t = D ? Math.min(1, (now - t0) / D) : 1, e = ease(t), oy = from + (ph.oy - from) * e;
    opp.setAttribute("transform", `translate(0 ${oy})`); opp.dataset.oy = oy;
    ext.setAttribute("opacity", ph.ext ? e * (ph.ext) + (1 - e) * (+ext.dataset.o || 0) : (1 - e) * (+ext.dataset.o || 0));
    $("#b1").setAttribute("y2", oy); $("#b3").setAttribute("y2", oy);
    if (t < 1) Scrum.raf = requestAnimationFrame(frame); else { ext.dataset.o = ph.ext; if (ph.k === "set") rollBall(); else ball.setAttribute("transform", "translate(112 100)"); }
  };
  Scrum.raf = requestAnimationFrame(frame);
}
function rollBall() {
  const ball = $("#sball"), pts = [[112, 100], [170, 99], [170, 128], [170, 196]], t0 = performance.now(), D = 2000;
  const f = now => {
    const t = Math.min(1, (now - t0) / D), seg = Math.min(2, Math.floor(t * 3)), lt = t * 3 - seg, a = pts[seg], b = pts[seg + 1];
    ball.setAttribute("transform", `translate(${a[0] + (b[0] - a[0]) * ease(lt)} ${a[1] + (b[1] - a[1]) * ease(lt)})`);
    if (t < 1 && Scrum.phase === 2) Scrum.raf = requestAnimationFrame(f);
  };
  setTimeout(() => { Scrum.raf = requestAnimationFrame(f); }, 300);
}

/* ---------- Seite aufbauen ---------- */
function renderBasics(anchor) {
  const root = $("#tab-basics");
  if (!$("#sec-pos", root)) {
    const st = L(SCRUM_TEXT);
    root.innerHTML = `
      <div class="hero"><div class="top"><small>Basics</small><h1>${T("Rugby verstehen", "Understand rugby")}</h1></div><div class="stripe"></div>
        <div class="body"><p>${T("Positionen, Scrum und unsere eigenen Calls – zum Anschauen, Lernen und im Quiz testen 🏉", "Positions, the scrum and our own calls – to watch, learn and test yourself in the quiz 🏉")}</p></div></div>
      <nav class="jumpbar" aria-label="${T("Bereiche", "Sections")}">${BASICS_SECTIONS.map(([id, l]) => `<a class="chip" href="#basics" data-jump="${id}">${esc(L(l))}</a>`).join("")}</nav>

      <section id="sec-pos" class="bsec">
        <h2 class="sectionh">${T("Positionen", "Positions")}</h2>
        <p class="mut">${T("Im 15er-Rugby gibt's für jede Statur und jedes Talent eine Position. Tippe auf eine Nummer!", "In 15s rugby there's a position for every build and every talent. Tap a number!")}</p>
        <div class="chips">${Object.entries(POS_GROUPS).map(([k, g]) => `<button class="chip" data-pg="${k}" aria-pressed="${Basics.group === k}">${esc(L(g.label))}</button>`).join("")}</div>
        <div class="grpinfo" id="grpInfo"></div>
        <div class="fieldwrap">${fieldSVG()}</div>
      </section>

      <section id="sec-scrum" class="bsec">
        <div class="card">
          <h2 class="cardh">${T("So bindet das Gedränge", "How the scrum binds")}</h2>
          <p class="mut">${st.intro}</p>
          ${scrumSVG()}
          <div class="seg">${SCRUM_PHASES.map((p, i) => `<button class="scrumbtn" data-sp="${i}">${p.label}</button>`).join("")}</div>
          <p id="scrumText" class="scrumtext"></p>
          <ul class="mini">${st.list.map(li => `<li>${li}</li>`).join("")}</ul>
        </div>
      </section>

      <section id="sec-lineout" class="bsec"><h2 class="sectionh">${T("Lineout-Calls", "Lineout calls")}</h2><div id="calls-lineout"></div></section>
      <section id="sec-pass" class="bsec"><h2 class="sectionh">${T("Pass-Calls", "Passing calls")}</h2><div id="calls-pass"></div></section>
      <section id="sec-quiz" class="bsec"><h2 class="sectionh">${T("Quiz", "Quiz")}</h2><div id="quizBody"></div></section>`;

    $$("[data-jump]", root).forEach(a => a.onclick = ev => { ev.preventDefault(); const s = $("#" + a.dataset.jump); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); });
    $$("[data-pg]", root).forEach(b => b.onclick = () => { Basics.group = b.dataset.pg; applyPosGroup(); });
    $$(".pl", root).forEach(g => { g.onclick = () => openPosition(+g.dataset.n); g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPosition(+g.dataset.n); } }; });
    $$(".sp", root).forEach(g => g.onclick = () => openPosition(+g.dataset.n));
    $$("[data-sp]", root).forEach(b => b.onclick = () => setScrumPhase(+b.dataset.sp));
    applyPosGroup(); setScrumPhase(0, false);
    renderCallSection("lineout"); renderCallSection("pass"); renderQuiz();
  }
  if (anchor) setTimeout(() => { const s = $("#" + anchor); if (s) s.scrollIntoView({ block: "start" }); }, 30);
}

/* ---------- Call-Bereich (Lineout oder Pass) ---------- */
function renderCallSection(cat) {
  const box = $("#calls-" + cat);
  const list = CALLS.filter(c => c.kategorie === cat);
  if (!list.find(c => c.id === Basics.sel[cat])) Basics.sel[cat] = list[0].id;
  const c = list.find(x => x.id === Basics.sel[cat]), tx = CT(c), S = SETUPS[c.setup];
  box.innerHTML = `
    <details class="basics"><summary>🤓 ${T(`${L(CALL_CATS[cat].short)}-Basics für Neue`, TP("{0} basics for newcomers", L(CALL_CATS[cat].short)))}</summary>${L(CAT_INTRO[cat])}</details>
    <div class="callpick">${list.map(x => `<button data-call="${x.id}" aria-pressed="${x.id === c.id}"><b>${esc(CN(x))}</b><span>${esc(CT(x).kurz)}</span></button>`).join("")}</div>
    <div class="card callcard">
      <div class="callhead"><div class="callname">${esc(CN(c))}</div><div class="mut">${esc(tx.kurz)}</div></div>
      <svg class="anim" viewBox="${S.viewBox}" data-anim role="img" aria-label="${T("Animation des Calls", "Animation of the call")} ${esc(CN(c))}"></svg>
      ${S.legend()}
      <div class="caption" data-cap></div>
      <div class="ctrls">
        <button class="cbtn" data-c="prev" aria-label="${T("Schritt zurück", "Step back")}">◀</button>
        <button class="cbtn main" data-c="play" aria-label="${T("Abspielen", "Play")}">${PLAY_I}</button>
        <button class="cbtn" data-c="next" aria-label="${T("Nächster Schritt", "Next step")}">▶</button>
        <button class="cbtn" data-c="replay" aria-label="${T("Von vorn", "From the start")}">${REPLAY_I}</button>
      </div>
      <div class="dots" data-dots>${c.schritte.map((_, i) => `<i data-d="${i + 1}"></i>`).join("")}</div>
      <p class="expl">${esc(tx.erklaerung)}</p>
      <h4>${T("Wer macht was?", "Who does what?")}</h4>
      <div class="who">${tx.wer.map(([r, t]) => `<div><b>${esc(r)}</b><span>${esc(t)}</span></div>`).join("")}</div>
      <h4>${T("Darauf achten", "Watch out for")}</h4><ul class="mini check">${tx.achtung.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
    </div>`;
  $$("[data-call]", box).forEach(b => b.onclick = () => {
    Basics.sel[cat] = b.dataset.call; Basics.anims[cat] && Basics.anims[cat].stop();
    renderCallSection(cat); setTimeout(() => Basics.anims[cat].play(true), 150);
  });
  const cap = $("[data-cap]", box), dots = $$("[data-dots] i", box), play = $("[data-c=play]", box);
  Basics.anims[cat] && Basics.anims[cat].stop();
  const anim = Basics.anims[cat] = new CallAnim($("[data-anim]", box), c, {
    onStep: k => {
      cap.innerHTML = k === 0 ? `<span class="sn">Start</span>${esc(S.intro())}` : `<span class="sn">${k}/${c.schritte.length}</span>${esc(tx.steps[k - 1] || "")}`;
      dots.forEach((d, i) => { d.classList.toggle("on", i < k); d.classList.toggle("cur", i === k - 1); });
      play.innerHTML = anim && anim.playing ? PAUSE_I : PLAY_I;
    },
  });
  anim.onStep(0);
  play.onclick = () => anim.playing ? anim.stop() : anim.play(false);
  $("[data-c=replay]", box).onclick = () => anim.play(true);
  $("[data-c=next]", box).onclick = () => anim.next();
  $("[data-c=prev]", box).onclick = () => anim.prev();
  dots.forEach(d => d.onclick = () => { anim.stop(); anim.k = +d.dataset.d; anim.draw(anim.k, 1); anim.onStep(anim.k); });
}

/* ---------- Quiz (Lineout + Pass) ---------- */
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function renderQuiz() {
  const body = $("#quizBody"), Q = Basics.quiz;
  const pool = CALLS.filter(c => Q.cat === "alle" || c.kategorie === Q.cat);
  if (!Q.cur || Q.answered || !pool.includes(Q.cur)) {
    let p; do { p = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && Q.cur && p.id === Q.cur.id);
    Q.cur = p; Q.answered = false;
  }
  const c = Q.cur, S = SETUPS[c.setup];
  const opts = shuffle(CALLS.filter(x => x.kategorie === c.kategorie));
  body.innerHTML = `
    <div class="chips">${[["alle", T("Alle Calls", "All calls")], ["lineout", L("Lineout")], ["pass", T("Pass", "Passing")]].map(([k, v]) => `<button class="chip" data-qcat="${k}" aria-pressed="${Q.cat === k}">${v}</button>`).join("")}</div>
    <div class="quizbar"><span>${T("Punkte", "Points")} <b data-qs>${Q.score}/${Q.total}</b></span><span>${T("Serie", "Streak")} <b data-qk>${Q.streak}${Q.streak >= 3 ? " 🔥" : ""}</b></span></div>
    <div class="card callcard">
      <div class="callhead"><div class="callname">${T("Welcher Call ist das?", "Which call is this?")}</div><div class="mut">${T("Schau genau hin, wohin der Ball fliegt – und was danach passiert.", "Watch closely where the ball goes – and what happens next.")}</div></div>
      <svg class="anim" viewBox="${S.viewBox}" data-anim role="img" aria-label="${T("Quiz-Animation", "Quiz animation")}"></svg>
      ${S.legend()}
      <div class="ctrls"><button class="cbtn main" data-qreplay aria-label="${T("Nochmal ansehen", "Watch again")}">${REPLAY_I}</button></div>
      <div class="answers">${opts.map(o => `<button class="ans" data-ans="${o.id}">${esc(CN(o))}</button>`).join("")}</div>
      <div class="qfb" data-qfb hidden></div>
    </div>`;
  Basics.anims.quiz && Basics.anims.quiz.stop();
  const anim = Basics.anims.quiz = new CallAnim($("[data-anim]", body), c, { hideText: true });
  $("[data-qreplay]", body).onclick = () => anim.play(true);
  $$("[data-qcat]", body).forEach(b => b.onclick = () => { Q.cat = b.dataset.qcat; Q.cur = null; anim.stop(); renderQuiz(); });
  $$("[data-ans]", body).forEach(b => b.onclick = () => {
    if (Q.answered) return; Q.answered = true; Q.total++;
    const ok = b.dataset.ans === c.id;
    if (ok) { Q.score++; Q.streak++; } else Q.streak = 0;
    $$("[data-ans]", body).forEach(x => { x.disabled = true; if (x.dataset.ans === c.id) x.classList.add("right"); });
    if (!ok) b.classList.add("wrong");
    const fb = $("[data-qfb]", body); fb.hidden = false;
    const praise = T(["Stark! 💪", "Sitzt! 🎯", "Genau so! 🏉"], ["Strong! 💪", "Nailed it! 🎯", "Spot on! 🏉"])[Q.total % 3];
    fb.innerHTML = `<p><b>${ok ? praise : T("Knapp daneben – das war ", "Close – that was ") + esc(CN(c)) + "."}</b> ${esc(CT(c).kurz)}.</p>
      <div class="btnrow"><button class="btn primary" data-qnext>${T("Nächste Frage →", "Next question →")}</button><button class="btn" data-qlearn>${T("Call ansehen", "View call")}</button></div>`;
    $("[data-qs]", body).textContent = `${Q.score}/${Q.total}`;
    $("[data-qk]", body).textContent = Q.streak + (Q.streak >= 3 ? " 🔥" : "");
    $("[data-qnext]", body).onclick = () => { anim.stop(); renderQuiz(); };
    $("[data-qlearn]", body).onclick = () => {
      anim.stop(); Basics.sel[c.kategorie] = c.id; renderCallSection(c.kategorie);
      $("#sec-" + c.kategorie).scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => Basics.anims[c.kategorie].play(true), 500);
    };
  });
  // Quiz-Animation erst starten, wenn der Bereich sichtbar ist
  if (Basics.quizObs) Basics.quizObs.disconnect();
  if ("IntersectionObserver" in window) {
    Basics.quizObs = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { Basics.quizObs.disconnect(); setTimeout(() => anim.play(true), 300); } }, { threshold: .4 });
    Basics.quizObs.observe($("[data-anim]", body));
  } else setTimeout(() => anim.play(true), 350);
}

onShow.basics = anchor => renderBasics(anchor);
