/* ======================================================================
   ANIMATIONS-ENGINE für Calls (Lineout + Pass)
   ====================================================================== */
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
/* Grundaufstellungen der Animationen. Spielfeld 360×290, Angriff nach oben. */
const RUCK_FIELD = () => `<rect width="360" height="290" rx="14" fill="#123320"/>
      <line x1="40" y1="176" x2="340" y2="176" stroke="#fff" stroke-opacity=".28" stroke-dasharray="6 7"/>
      <text x="344" y="189" text-anchor="end" class="flab" fill-opacity=".55">${T("Vorteilslinie", "Gain line")}</text>
      <ellipse cx="101" cy="170" rx="22" ry="15" fill="#6b4a2b" fill-opacity=".55" stroke="#ffcc00" stroke-opacity=".5" stroke-dasharray="3 4"/>
      <text x="101" y="148" text-anchor="middle" class="flab" fill="#ffcc00">RUCK</text>
      <path d="M330 222 l-8 14 h5 v22 h6 v-22 h5z" fill="#ffcc00"/><text x="330" y="272" text-anchor="middle" class="flab" fill="#ffcc00">${T("ANGRIFF", "ATTACK")}</text>
      <text x="56" y="112" class="flab" fill-opacity=".5">${T("↑ Gegner*innen", "↑ Opposition")}</text>`;
const RUCK_BASE = {
  R1: { x: 92, y: 178, role: "fwd", label: "" }, R2: { x: 110, y: 178, role: "fwd", label: "" },
  OR1: { x: 92, y: 160, role: "opp" }, OR2: { x: 110, y: 160, role: "opp" },
  SH: { x: 102, y: 196, role: "back", label: "9" },
  D1: { x: 136, y: 118, role: "opp" }, D2: { x: 168, y: 118, role: "opp" }, D3: { x: 200, y: 118, role: "opp" },
  D4: { x: 232, y: 118, role: "opp" }, D5: { x: 264, y: 118, role: "opp" }, D6: { x: 298, y: 118, role: "opp" },
};
const RUCK_LEGEND = () => `<div class="legend"><span><i class="lg l"></i>${L("Forwards")}</span><span><i class="lg j"></i>${T("Podleader", "Pod leader")}</span><span><i class="lg b"></i>${T("9 + Backs", "9 + backs")}</span><span><i class="lg o"></i>${T("Gegner*innen", "Opposition")}</span><span><i class="lg s"></i>${T("Support / Laufweg", "Support / run")}</span></div>`;
const RUCK_INTRO = () => T("Aufstellung: Ruck etwas links der Mitte, die 9 holt den Ball. Gespielt wird nach rechts.", "Set-up: ruck slightly left of centre, the 9 gets the ball. We play to the right.");
const SETUPS = {
  lineout: {
    ball: "H", viewBox: "8 58 296 222",
    ents: {
      H: { x: 24, y: 140, role: "hooker", label: "H", name: "Hooker" },
      L1: { x: 96, y: 158, role: "lifter", label: "L1" }, J1: { x: 114, y: 158, role: "jumper", label: "J1" }, L2: { x: 132, y: 158, role: "lifter", label: "L2" },
      L3: { x: 156, y: 158, role: "lifter", label: "L3" }, J2: { x: 174, y: 158, role: "jumper", label: "J2" }, L4: { x: 192, y: 158, role: "lifter", label: "L4" },
      SH: { x: 150, y: 196, role: "back", label: "9" }, FH: { x: 232, y: 246, role: "back", label: "10" }, IC: { x: 280, y: 262, role: "back", label: "12" },
      O1: { x: 96, y: 122, role: "opp" }, O2: { x: 114, y: 122, role: "opp" }, O3: { x: 132, y: 122, role: "opp" }, O4: { x: 156, y: 122, role: "opp" }, O5: { x: 174, y: 122, role: "opp" }, O6: { x: 192, y: 122, role: "opp" },
    },
    legend: () => `<div class="legend"><span><i class="lg j"></i>${L("Jumper")}</span><span><i class="lg l"></i>${L("Lifter")}</span><span><i class="lg h"></i>${L("Hooker")}</span><span><i class="lg b"></i>${L("Backs")}</span><span><i class="lg o"></i>${T("Gegner*innen", "Opposition")}</span><span><i class="lg s"></i>${T("Support-Lauf", "Support run")}</span></div>`,
    intro: () => T("Aufstellung: Hooker an der Seitenlinie, unser Lineout gegenüber den Gegner*innen.", "Set-up: hooker on the touchline, our lineout opposite the opposition."),
    field: () => `<rect width="360" height="290" rx="14" fill="#123320"/>
      <rect x="0" y="0" width="40" height="290" fill="#0c1f14"/>
      <text x="24" y="272" text-anchor="middle" class="flab">${T("AUS", "TOUCH")}</text>
      <line x1="40" y1="0" x2="40" y2="290" stroke="#fff" stroke-width="2.5" stroke-opacity=".85"/>
      <line x1="90" y1="0" x2="90" y2="290" stroke="#fff" stroke-opacity=".35" stroke-dasharray="6 7"/>
      <line x1="200" y1="0" x2="200" y2="290" stroke="#fff" stroke-opacity=".35" stroke-dasharray="6 7"/>
      <text x="90" y="274" text-anchor="middle" class="flab">5 m</text><text x="200" y="274" text-anchor="middle" class="flab">15 m</text>
      <line x1="40" y1="140" x2="212" y2="140" stroke="#ffcc00" stroke-opacity=".45" stroke-dasharray="3 5"/>
      <text x="214" y="143" class="flab" fill="#ffcc00">${L("Line of touch")}</text>
      <path d="M280 168 l-8 14 h5 v22 h6 v-22 h5z" fill="#ffcc00"/><text x="280" y="220" text-anchor="middle" class="flab" fill="#ffcc00">${T("ANGRIFF", "ATTACK")}</text>
      <text x="214" y="118" class="flab" fill-opacity=".5">${T("↑ Gegner*innen", "↑ Opposition")}</text>`,
  },
  // Feuer: ein Forward-Pod steht zwischen 9 und 10 im Passweg
  ruck_fire: {
    ball: "SH", viewBox: "50 96 300 190", legend: RUCK_LEGEND, intro: RUCK_INTRO, field: RUCK_FIELD,
    ents: { ...RUCK_BASE,
      F1: { x: 138, y: 202, role: "fwd", label: "F" }, F2: { x: 152, y: 206, role: "fwd", label: "F" }, F3: { x: 166, y: 202, role: "fwd", label: "F" },
      FH: { x: 182, y: 220, role: "back", label: "10" }, IC: { x: 230, y: 236, role: "back", label: "12" }, OC: { x: 278, y: 252, role: "back", label: "13" } },
  },
  // Pod 10: der Pod steht neben der 10
  ruck_pod10: {
    ball: "SH", viewBox: "50 96 300 190", legend: RUCK_LEGEND, intro: RUCK_INTRO, field: RUCK_FIELD,
    ents: { ...RUCK_BASE,
      FH: { x: 176, y: 216, role: "back", label: "10" },
      P1: { x: 206, y: 232, role: "fwd", label: "P1" }, P2: { x: 220, y: 226, role: "lead", label: "P2" }, P3: { x: 234, y: 232, role: "fwd", label: "P3" },
      IC: { x: 272, y: 238, role: "back", label: "12" }, OC: { x: 312, y: 254, role: "back", label: "13" } },
  },
  // Diamant-Pod für Plus / Minus / Fiji: L vorne, A (Seite der 9) links, B rechts, C hinten
  ruck_diamond: {
    ball: "SH", viewBox: "50 96 300 190", legend: RUCK_LEGEND, intro: RUCK_INTRO, field: RUCK_FIELD,
    ents: { ...RUCK_BASE,
      LD: { x: 172, y: 214, role: "lead", label: "L" }, A: { x: 158, y: 228, role: "fwd", label: "A" },
      B: { x: 186, y: 228, role: "fwd", label: "B" }, C: { x: 172, y: 242, role: "fwd", label: "C" },
      FH: { x: 236, y: 246, role: "back", label: "10" }, IC: { x: 276, y: 262, role: "back", label: "12" } },
  },
};
function buildStates(call) {
  const S = SETUPS[call.setup];
  let s = { ents: {}, holder: S.ball, maul: null, support: [], lauf: [] };
  for (const [id, e] of Object.entries(S.ents)) s.ents[id] = { ...e, lift: 0 };
  const states = [s];
  for (const st of call.schritte) {
    const n = { ents: {}, holder: s.holder, maul: s.maul, support: s.support, lauf: s.lauf };
    for (const [id, e] of Object.entries(s.ents)) n.ents[id] = { ...e };
    for (const [id, xy] of Object.entries(st.move || {})) if (n.ents[id]) { n.ents[id].x = xy[0]; n.ents[id].y = xy[1]; }
    for (const [id, v] of Object.entries(st.lift || {})) if (n.ents[id]) n.ents[id].lift = v;
    if (st.maul !== undefined) n.maul = st.maul;
    if (st.support !== undefined) n.support = st.support;
    if (st.lauf !== undefined) n.lauf = st.lauf;
    if (st.ball) n.holder = st.ball.to;
    states.push(n); s = n;
  }
  return states;
}
class CallAnim {
  constructor(svgEl, call, { onStep, hideText } = {}) {
    this.svg = svgEl; this.call = call; this.onStep = onStep || (() => {}); this.hideText = hideText;
    this.states = buildStates(call); this.k = 0; this.playing = false; this.raf = null; this.token = 0;
    this.build(); this.draw(0, 1);
  }
  build() {
    const S = SETUPS[this.call.setup];
    let html = S.field() + `<g class="runs"></g><g class="trails"></g><rect class="maul" rx="14" fill="#ffcc00" fill-opacity=".14" stroke="#ffcc00" stroke-dasharray="5 4" opacity="0"/><text class="maultx flab" fill="#ffcc00" opacity="0">MAUL</text>`;
    for (const [id, e] of Object.entries(this.states[0].ents)) {
      const st = { jumper: ["#ffcc00", "#000", "#000"], lead: ["#ffcc00", "#000", "#000"], lifter: ["#fff", "#000", "#000"], fwd: ["#fff", "#000", "#000"], hooker: ["#000", "#ffcc00", "#ffcc00"], back: ["#000", "#fff", "#fff"], opp: ["#6b6b6b", "#3a3a3a", "#fff"] }[e.role];
      html += `<g class="ent ${e.role}" data-id="${id}"><ellipse class="sh" rx="11" ry="7" fill="#000" opacity="0"/><circle class="supring" r="14" fill="none" stroke="#ffcc00" stroke-width="1.8" stroke-dasharray="3 3" opacity="0"/>
        <circle r="${e.role === "opp" ? 8 : 9.5}" fill="${st[0]}" stroke="${st[1]}" stroke-width="${e.role === "hooker" ? 3 : 2}" ${e.role === "opp" ? 'opacity=".55"' : ""}/>
        ${e.label ? `<text y="4" text-anchor="middle" fill="${st[2]}">${e.label}</text>` : ""}</g>`;
    }
    html += `<g class="ballg"><ellipse class="bsh" rx="6" ry="3" fill="#000" opacity=".35"/><g class="ball"><ellipse rx="7" ry="4.6" fill="#fff" stroke="#000" stroke-width="1.3"/><path d="M-2 -1.5h4M-2 1.5h4" stroke="#000" stroke-width=".9"/></g></g>`;
    this.svg.innerHTML = html;
    this.el = {}; $$(".ent", this.svg).forEach(g => this.el[g.dataset.id] = g);
  }
  holderPos(state, id) { const e = state.ents[id]; return e ? [e.x + 7, e.y - 6 - 10 * e.lift] : [0, 0]; }
  // zeichnet den Übergang von Schritt k-1 nach k bei Fortschritt t (0..1)
  draw(k, t) {
    const A = this.states[Math.max(0, k - 1)], B = this.states[k], e = ease(t), step = this.call.schritte[k - 1];
    for (const [id, g] of Object.entries(this.el)) {
      const a = A.ents[id], b = B.ents[id];
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e, lift = a.lift + (b.lift - a.lift) * e;
      g.setAttribute("transform", `translate(${x} ${y - 10 * lift})`);
      const c = g.querySelector("circle"); c.setAttribute("transform", `scale(${1 + .3 * lift})`);
      const sh = g.querySelector(".sh"); sh.setAttribute("cy", 10 * lift + 4); sh.setAttribute("opacity", .45 * lift);
      g.classList.toggle("lifted", lift > .5);
      const inA = A.support.includes(id), inB = B.support.includes(id);
      g.querySelector(".supring").setAttribute("opacity", inB ? (inA ? 1 : e) : (inA ? 1 - e : 0));
    }
    // Ball
    let bx, by, h = 0;
    const cur = { ents: {} };
    for (const id in B.ents) { const a = A.ents[id], b = B.ents[id]; cur.ents[id] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, lift: a.lift + (b.lift - a.lift) * e }; }
    if (step && step.ball && k > 0) {
      const p0 = this.holderPos(A, A.holder), p1 = this.holderPos(B, step.ball.to);
      const tt = t; bx = p0[0] + (p1[0] - p0[0]) * tt; by = p0[1] + (p1[1] - p0[1]) * tt; h = (step.ball.arc || 0) * Math.sin(Math.PI * tt);
    } else { [bx, by] = this.holderPos(cur, B.holder); }
    const bg = this.svg.querySelector(".ballg");
    bg.querySelector(".bsh").setAttribute("transform", `translate(${bx} ${by + 6})`);
    bg.querySelector(".ball").setAttribute("transform", `translate(${bx} ${by - h}) scale(${1 + h / 60})`);
    // Flugbahnen bis inkl. Schritt k
    let trails = "";
    for (let i = 1; i <= k; i++) {
      const s = this.call.schritte[i - 1]; if (!s.ball || !(s.ball.arc > 0)) continue;
      const p0 = this.holderPos(this.states[i - 1], this.states[i - 1].holder), p1 = this.holderPos(this.states[i], s.ball.to);
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2 - 2 * s.ball.arc;
      const frac = i === k ? t : 1;
      trails += `<path d="M${p0[0]} ${p0[1]} Q${mx} ${my} ${p1[0]} ${p1[1]}" pathLength="1" stroke-dasharray="${frac} 1" fill="none" stroke="#ffcc00" stroke-width="2" stroke-opacity="${i === k ? .9 : .35}" stroke-linecap="round"/>`;
    }
    this.svg.querySelector(".trails").innerHTML = trails;
    // Laufwege (Support-Läufe + Ballträger*in)
    let runs = "";
    for (const id of new Set([...B.support, ...B.lauf])) {
      let j0 = k; while (j0 > 1 && (this.states[j0 - 1].support.includes(id) || this.states[j0 - 1].lauf.includes(id))) j0--;
      const pts = []; for (let j = j0 - 1; j < k; j++) pts.push(this.states[j].ents[id]); pts.push(cur.ents[id]);
      const sup = B.support.includes(id);
      runs += `<polyline points="${pts.map(p => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ")}" fill="none" stroke="${sup ? "#ffcc00" : "#fff"}" stroke-width="2" stroke-dasharray="4 4" stroke-opacity="${sup ? .7 : .5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    this.svg.querySelector(".runs").innerHTML = runs;
    // Maul
    const maul = B.maul, mr = this.svg.querySelector(".maul"), mt = this.svg.querySelector(".maultx");
    if (maul && maul.length) {
      const xs = maul.map(id => cur.ents[id].x), ys = maul.map(id => cur.ents[id].y);
      const x0 = Math.min(...xs) - 15, y0 = Math.min(...ys) - 15, x1 = Math.max(...xs) + 15, y1 = Math.max(...ys) + 15;
      mr.setAttribute("x", x0); mr.setAttribute("y", y0); mr.setAttribute("width", x1 - x0); mr.setAttribute("height", y1 - y0);
      const op = A.maul ? 1 : e; mr.setAttribute("opacity", op); mt.setAttribute("opacity", op); mt.setAttribute("x", x1 + 6); mt.setAttribute("y", (y0 + y1) / 2 + 4);
    } else { mr.setAttribute("opacity", 0); mt.setAttribute("opacity", 0); }
  }
  animateStep(k) {
    const tok = this.token, D = (this.call.schritte[k - 1].dauer || 1000) / (this.speed || 1);
    return new Promise(res => {
      const t0 = performance.now();
      const f = now => {
        if (tok !== this.token) return res(false);
        const t = Math.min(1, (now - t0) / D); this.draw(k, t);
        if (t < 1) this.raf = requestAnimationFrame(f); else { this.k = k; this.onStep(k); res(true); }
      };
      this.onStep(k, true);
      this.raf = requestAnimationFrame(f);
    });
  }
  stop() { this.token++; cancelAnimationFrame(this.raf); this.playing = false; this.onStep(this.k); }
  reset() { this.stop(); this.k = 0; this.draw(0, 1); this.onStep(0); }
  async play(fromStart) {
    this.token++; cancelAnimationFrame(this.raf);
    if (fromStart || this.k >= this.call.schritte.length) { this.k = 0; this.draw(0, 1); }
    this.playing = true; const tok = this.token;
    while (this.k < this.call.schritte.length && tok === this.token) {
      const ok = await this.animateStep(this.k + 1); if (!ok) return;
      await new Promise(r => setTimeout(r, 260));
    }
    if (tok === this.token) { this.playing = false; this.onStep(this.k); }
  }
  async next() { if (this.k >= this.call.schritte.length) return; this.token++; this.playing = false; await this.animateStep(this.k + 1); }
  prev() { this.stop(); this.k = Math.max(0, this.k - 1); this.draw(this.k, 1); this.onStep(this.k); }
}
