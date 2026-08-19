// draw_monsters.js — Chibi-style monster renderers
// Globals: ctx, _frameNow, units, _heroStudio, _sBody, _hCtx

// ═══════════════════════════════════════════════════════════════════════════
//  HOUNDS — chibi hellhound (level 3, ability: bleed)
//  Horizontal body, wide snout, droopy hound ears, round pupils
//  Walk: 4-beat gait LB→LF→RB→RF (0.25 phase offset each)
//  Attack: crouch → leap arc → bite → land
// ═══════════════════════════════════════════════════════════════════════════
// Palette + ribbon helpers for the semi-realistic hellhound (charcoal coat,
// ember underlight, warm rim) — shared by the hound body/leg/head drawers.
const _HD_C = {
  // Тони шерсті підняті (корпус зливався з темною підлогою). edge лишаємо темним — це контур.
  edge: '#070608', occ: '#1d1620', cool: '#241c2c', dark: '#362a34',
  mid: '#50414a', midHi: '#6d585f', litW: '#8f5a36',
  ember: '#ff5a12', emberHi: '#ffd166', rim: '#ff8a3a', under: '#c8500f',
  bone: '#efe4c8', boneSh: '#c2ae86', eye: '#ffc23a',
};
function _hdRibbon(pts, fill) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b.x - a.x, dy = b.y - a.y; const dl = Math.hypot(dx, dy) || 1;
    pts[i]._px = -dy / dl; pts[i]._py = dx / dl;
  }
  const top = pts.map(p => ({ x: p.x + p._px * p.w, y: p.y + p._py * p.w }));
  const bot = pts.map(p => ({ x: p.x - p._px * p.w, y: p.y - p._py * p.w }));
  ctx.fillStyle = fill; ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);                                   // smoothed top edge
  for (let i = 1; i < n - 1; i++) { const mx = (top[i].x + top[i + 1].x) / 2, my = (top[i].y + top[i + 1].y) / 2; ctx.quadraticCurveTo(top[i].x, top[i].y, mx, my); }
  ctx.lineTo(top[n - 1].x, top[n - 1].y);
  ctx.lineTo(bot[n - 1].x, bot[n - 1].y);
  for (let i = n - 2; i > 0; i--) { const mx = (bot[i].x + bot[i - 1].x) / 2, my = (bot[i].y + bot[i - 1].y) / 2; ctx.quadraticCurveTo(bot[i].x, bot[i].y, mx, my); }
  ctx.lineTo(bot[0].x, bot[0].y);
  ctx.closePath(); ctx.fill();
}
function _hdRibbonEdge(pts, off, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const e = pts.map(p => ({ x: p.x + p._px * (p.w * off), y: p.y + p._py * (p.w * off) }));
  ctx.beginPath(); ctx.moveTo(e[0].x, e[0].y);
  for (let i = 1; i < e.length - 1; i++) { const mx = (e[i].x + e[i + 1].x) / 2, my = (e[i].y + e[i + 1].y) / 2; ctx.quadraticCurveTo(e[i].x, e[i].y, mx, my); }
  ctx.lineTo(e[e.length - 1].x, e[e.length - 1].y);
  ctx.stroke();
}

function drawHoundsMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._hdT === undefined) {
    unit._hdT    = Math.random() * Math.PI * 2;
    unit._hdDir  = 1;
    unit._hdAtkP = 0;
    unit._hdPrevCd = unit.attackCooldown || 0;
    unit._hdPrevX  = unit.x;
    unit._hdLastT  = _frameNow;
  }
  const dt = Math.min((_frameNow - unit._hdLastT) / 1000, 0.05);
  unit._hdLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._hdDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._hdPrevX) > 0.2) {
    unit._hdDir = unit.x > unit._hdPrevX ? 1 : -1;
  }
  unit._hdPrevX = unit.x;
  const dir = unit._hdDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._hdPrevCd || 0) + 3) unit._hdAtkP = 0.01;
  unit._hdPrevCd = acd;
  if (unit._hdAtkP > 0) { unit._hdAtkP += dt / 0.75; if (unit._hdAtkP >= 1) unit._hdAtkP = 0; }

  unit._hdT += dt * (unit.state === 'move' ? 3.5 : 1.0);
  const ap = unit._hdAtkP;

  // ── 4-beat walk (LB=0, LF=0.25, RB=0.5, RF=0.75) ──────────
  // side view: near=right(bright), far=left(dim)
  // legPhase 0-0.5=swing, 0.5-1.0=stance
  const gaitPhase  = ((unit._hdT % (2 * Math.PI)) / (2 * Math.PI));
  const pFarBack   = gaitPhase;
  const pFarFront  = (gaitPhase + 0.75) % 1.0;
  const pNearBack  = (gaitPhase + 0.50) % 1.0;
  const pNearFront = (gaitPhase + 0.25) % 1.0;

  // Body bob: 2 per cycle; head nod lags slightly
  let bob = 0;
  if (unit.state === 'move') {
    bob = Math.abs(Math.sin(unit._hdT * 2)) * s * 0.055;
  } else {
    bob = Math.sin(unit._hdT * 0.6) * s * 0.025;
  }
  const headNod = unit.state === 'move' ? Math.sin(unit._hdT * 2 + 0.4) * s * 0.022 : 0;

  // ── Attack: crouch → leap → bite → land ─────────────────────
  // yDisplace: positive = body goes UP, negative = body goes DOWN (crouch)
  let yDisplace = 0, lungX = 0, jawOpen = 0, bodyTilt = 0;
  let squashX = 1, squashY = 1;
  let isLeaping = false, leapArc = 0;

  if (ap > 0) {
    if (ap < 0.20) {
      // Crouch / windup
      const f = ap / 0.20, ef = f * f;
      yDisplace = -ef * s * 0.12;
      squashX   = 1 - ef * 0.10;
      squashY   = 1 + ef * 0.12;
      lungX     = -dir * s * 0.06 * ef;
    } else if (ap < 0.58) {
      // LEAP — gallop arc
      const f = (ap - 0.20) / 0.38;
      leapArc   = Math.sin(f * Math.PI);
      yDisplace = leapArc * s * 0.72;
      lungX     = dir * s * 0.50 * (1 - (1-f)*(1-f));
      bodyTilt  = dir * 0.28 * Math.sin(f * Math.PI * 0.85);
      squashX   = 1 + leapArc * 0.20;
      squashY   = 1 - leapArc * 0.14;
      jawOpen   = Math.max(0, (f - 0.38) / 0.62);
      isLeaping = true;
    } else if (ap < 0.78) {
      // Land + bite
      const f = (ap - 0.58) / 0.20;
      yDisplace = -f * f * s * 0.06;
      lungX     = dir * s * 0.50 * (1 - f);
      jawOpen   = 1.0 - f * 0.30;
      squashY   = 1.0 + f * 0.14;
      squashX   = 1.0 - f * 0.08;
    } else {
      // Recover
      const f = (ap - 0.78) / 0.22;
      jawOpen = (1 - f) * 0.70;
    }
  }

  const bx    = cx + lungX;
  const by    = fY - s * 0.38 - bob - yDisplace;
  const hx    = bx + dir * s * 0.54;
  const hy    = by - s * 0.13 + headNod;
  const headR = s * 0.31;
  const OL    = Math.max(1.2, s * 0.04);

  unit._hpBarY = hy - headR * 2.10 - 8;

  ctx.save();

  // ── Shadow (soft) + restrained ember pool ───────────────────
  const shadowAlpha = isLeaping ? Math.max(0.12, 0.34 - leapArc * 0.18) : 0.34;
  const shadowW     = isLeaping ? s * 0.52 * (1 - leapArc * 0.40) : s * 0.52;
  const _shX = cx + lungX * 0.4;
  const shg = ctx.createRadialGradient(_shX, fY + s * 0.01, s * 0.03, _shX, fY + s * 0.01, shadowW);
  shg.addColorStop(0, `rgba(8,4,6,${shadowAlpha})`);
  shg.addColorStop(0.65, `rgba(8,4,6,${shadowAlpha * 0.5})`);
  shg.addColorStop(1, 'rgba(8,4,6,0)');
  ctx.fillStyle = shg;
  ctx.beginPath(); ctx.ellipse(_shX, fY + s * 0.01, shadowW, s * 0.075, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const eg = ctx.createRadialGradient(_shX, fY, 0, _shX, fY, shadowW * 0.7);
  eg.addColorStop(0, `rgba(200,60,0,${0.22 * (1 - leapArc * 0.7)})`);
  eg.addColorStop(1, 'rgba(200,60,0,0)');
  ctx.fillStyle = eg;
  ctx.beginPath(); ctx.ellipse(_shX, fY, shadowW * 0.7, s * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── Tail — muscular, up-swept, ember-tipped (behind body) ───
  const wag = Math.sin(unit._hdT * (unit.state === 'fight' ? 8 : 2.4)) * 0.12;
  const tRootX = bx - dir * s * 0.34, tRootY = by + s * 0.02;
  const tailN = 6, tPts = [];
  for (let i = 0; i <= tailN; i++) {
    const t = i / tailN;
    const x = tRootX - dir * s * (0.06 + t * 0.34);
    const y = tRootY - s * (0.02 + Math.sin(t * 1.5) * 0.30) + wag * t * s * 0.12;
    const w = s * (0.10 * (1 - t * 0.7)) + s * 0.012;
    tPts.push({ x, y, w });
  }
  _hdRibbon(tPts, _HD_C.occ);
  _hdRibbon(tPts.map(p => ({ x: p.x, y: p.y - p.w * 0.35, w: p.w * 0.55 })), _HD_C.mid);
  const _tt = tPts[tailN];
  const flick = Math.sin(unit._hdT * 6) * s * 0.02;
  ctx.save(); ctx.shadowColor = _HD_C.ember; ctx.shadowBlur = s * 0.14; ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(220,70,10,0.85)';
  ctx.beginPath();
  ctx.moveTo(_tt.x - s * 0.032, _tt.y + s * 0.015);
  ctx.quadraticCurveTo(_tt.x - s * 0.03, _tt.y - s * 0.06, _tt.x + flick, _tt.y - s * 0.135);
  ctx.quadraticCurveTo(_tt.x + s * 0.03, _tt.y - s * 0.05, _tt.x + s * 0.028, _tt.y + s * 0.015);
  ctx.quadraticCurveTo(_tt.x, _tt.y + s * 0.04, _tt.x - s * 0.032, _tt.y + s * 0.015);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,210,90,0.9)';
  ctx.beginPath();
  ctx.moveTo(_tt.x - s * 0.014, _tt.y + s * 0.008);
  ctx.quadraticCurveTo(_tt.x - s * 0.008, _tt.y - s * 0.03, _tt.x + flick * 0.6, _tt.y - s * 0.085);
  ctx.quadraticCurveTo(_tt.x + s * 0.013, _tt.y - s * 0.02, _tt.x + s * 0.011, _tt.y + s * 0.008);
  ctx.quadraticCurveTo(_tt.x, _tt.y + s * 0.02, _tt.x - s * 0.014, _tt.y + s * 0.008);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // ── Legs + body (layered) ───────────────────────────────────
  const legW    = s * 0.12, legH = s * 0.24;
  const legBaseY = by + s * 0.13;
  const xFrFar  = bx + dir * s * 0.24;
  const xFrNear = bx + dir * s * 0.28;
  const xBkFar  = bx - dir * s * 0.26;
  const xBkNear = bx - dir * s * 0.30;
  const moving  = unit.state === 'move' && !isLeaping;
  const pFF = moving ? pFarFront  : 0.75;
  const pFB = moving ? pFarBack   : 0.75;
  const pNF = moving ? pNearFront : 0.75;
  const pNB = moving ? pNearBack  : 0.75;

  if (isLeaping) {
    _hdLegLeap(bx, by, s, OL, dir, true,  true,  leapArc);
    _hdLegLeap(bx, by, s, OL, dir, false, true,  leapArc);
    _hdHoundBody(bx, by, dir, s, OL, squashX, squashY, bodyTilt, unit._branch);
    _hdLegLeap(bx, by, s, OL, dir, true,  false, leapArc);
    _hdLegLeap(bx, by, s, OL, dir, false, false, leapArc);
  } else {
    _hdLegWalk(xBkFar,  legBaseY, fY, legW, legH, OL, true,  dir, pFB, true);
    _hdLegWalk(xFrFar,  legBaseY, fY, legW, legH, OL, true,  dir, pFF, false);
    _hdHoundBody(bx, by, dir, s, OL, squashX, squashY, bodyTilt, unit._branch);
    _hdLegWalk(xBkNear, legBaseY, fY, legW, legH, OL, false, dir, pNB, true);
    _hdLegWalk(xFrNear, legBaseY, fY, legW, legH, OL, false, dir, pNF, false);
  }

  // ── Neck — flows from the shoulders up into the skull base ──
  {
    const nBaseX = bx + dir * s * 0.26, nBaseY = by - s * 0.13;
    const nTopX  = hx - dir * headR * 0.48, nTopY = hy + headR * 0.20;
    const nMidX  = (nBaseX + nTopX) / 2 + dir * s * 0.01, nMidY = (nBaseY + nTopY) / 2 + s * 0.01;
    const neck = [
      { x: nBaseX, y: nBaseY, w: s * 0.21 },
      { x: nMidX,  y: nMidY,  w: s * 0.185 },
      { x: nTopX,  y: nTopY,  w: s * 0.16 },
    ];
    _hdRibbon(neck, _HD_C.occ);
    _hdRibbon(neck.map(p => ({ x: p.x + dir * p.w * 0.22, y: p.y - p.w * 0.12, w: p.w * 0.62 })), _HD_C.mid);
    _hdRibbonEdge(neck, 0.66, _HD_C.midHi, s * 0.018);
    _hdRibbonEdge(neck, -0.95, 'rgba(255,138,58,0.35)', s * 0.010);   // warm throat rim
    // hackle fur clumps bristling along the nape (back of neck)
    ctx.fillStyle = _HD_C.edge;
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const nx = nBaseX + (nTopX - nBaseX) * t;
      const napeY = (nBaseY + (nTopY - nBaseY) * t) - s * 0.18;
      const spikeH = s * (0.11 - t * 0.03);
      ctx.beginPath();
      ctx.moveTo(nx - dir * s * 0.035, napeY + s * 0.03);
      ctx.lineTo(nx - dir * s * 0.06, napeY - spikeH);
      ctx.lineTo(nx + dir * s * 0.02, napeY + s * 0.02);
      ctx.closePath(); ctx.fill();
    }
  }

  // ── Head ────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(hx, hy);
  const C = _HD_C, R = headR, D = dir;

  // ── Far ear (behind skull, dim, broad triangle) ──
  ctx.fillStyle = C.occ;
  ctx.beginPath();
  ctx.moveTo(-D * R * 0.14, -R * 0.66);
  ctx.lineTo(-D * R * 0.60, -R * 1.34);
  ctx.lineTo(-D * R * 0.66, -R * 0.58);
  ctx.quadraticCurveTo(-D * R * 0.40, -R * 0.64, -D * R * 0.14, -R * 0.66);
  ctx.closePath(); ctx.fill();

  // ── Head — integrated canine skull + muzzle (value-layered) ──
  const headPath = () => {
    ctx.beginPath();
    ctx.moveTo(-D * R * 0.62, -R * 0.28);                                      // nape
    ctx.quadraticCurveTo(-D * R * 0.66, -R * 0.86, -D * R * 0.02, -R * 0.86);  // cranium dome
    ctx.quadraticCurveTo(D * R * 0.30, -R * 0.84, D * R * 0.40, -R * 0.52);    // brow → muzzle base
    ctx.quadraticCurveTo(D * R * 0.72, -R * 0.34, D * R * 1.02, -R * 0.16);    // muzzle top
    ctx.quadraticCurveTo(D * R * 1.15, -R * 0.05, D * R * 1.10, R * 0.12);     // nose front
    ctx.quadraticCurveTo(D * R * 1.02, R * 0.22, D * R * 0.66, R * 0.26);      // muzzle bottom
    ctx.quadraticCurveTo(D * R * 0.30, R * 0.30, D * R * 0.06, R * 0.36);      // jowl
    ctx.quadraticCurveTo(-D * R * 0.30, R * 0.44, -D * R * 0.58, R * 0.18);    // cheek
    ctx.quadraticCurveTo(-D * R * 0.70, -R * 0.02, -D * R * 0.62, -R * 0.28);  // back to nape
    ctx.closePath();
  };
  ctx.fillStyle = C.occ; headPath(); ctx.fill();
  // lit upper skull/muzzle plane + warm lower glow (clipped)
  ctx.save(); headPath(); ctx.clip();
  const hLit = ctx.createLinearGradient(0, -R * 0.86, 0, R * 0.22);
  hLit.addColorStop(0, C.midHi); hLit.addColorStop(0.6, C.mid); hLit.addColorStop(1, 'rgba(55,44,64,0)');
  ctx.fillStyle = hLit;
  ctx.beginPath();
  ctx.moveTo(-D * R * 0.50, -R * 0.20);
  ctx.quadraticCurveTo(-D * R * 0.52, -R * 0.74, -D * R * 0.02, -R * 0.74);
  ctx.quadraticCurveTo(D * R * 0.28, -R * 0.72, D * R * 0.38, -R * 0.44);
  ctx.quadraticCurveTo(D * R * 0.70, -R * 0.28, D * R * 0.98, -R * 0.12);
  ctx.lineTo(D * R * 0.60, -R * 0.02);
  ctx.lineTo(-D * R * 0.30, -R * 0.06);
  ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  const hUg = ctx.createLinearGradient(0, 0, 0, R * 0.36);
  hUg.addColorStop(0, 'rgba(180,50,0,0)'); hUg.addColorStop(1, 'rgba(200,70,10,0.4)');
  ctx.fillStyle = hUg; headPath(); ctx.fill();
  ctx.restore();
  // rim light over the top of skull + muzzle
  ctx.strokeStyle = C.rim; ctx.lineWidth = R * 0.045; ctx.lineCap = 'round';
  ctx.save(); ctx.shadowColor = 'rgba(255,138,58,0.5)'; ctx.shadowBlur = R * 0.16;
  ctx.beginPath();
  ctx.moveTo(-D * R * 0.30, -R * 0.84);
  ctx.quadraticCurveTo(D * R * 0.30, -R * 0.84, D * R * 0.40, -R * 0.52);
  ctx.quadraticCurveTo(D * R * 0.72, -R * 0.34, D * R * 1.00, -R * 0.15);
  ctx.stroke(); ctx.restore();
  // tan/ember snout marking
  ctx.fillStyle = 'rgba(150,52,10,0.5)';
  ctx.beginPath();
  ctx.moveTo(D * R * 0.42, -R * 0.42);
  ctx.quadraticCurveTo(D * R * 0.75, -R * 0.28, D * R * 1.00, -R * 0.12);
  ctx.quadraticCurveTo(D * R * 0.78, -R * 0.08, D * R * 0.46, -R * 0.24);
  ctx.closePath(); ctx.fill();
  // nose
  const noseX = D * R * 1.05, noseY = -R * 0.01;
  ctx.fillStyle = '#0c0604';
  ctx.beginPath(); ctx.ellipse(noseX, noseY, R * 0.12, R * 0.10, -0.3 * D, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,150,60,0.5)';
  ctx.beginPath(); ctx.ellipse(noseX - D * R * 0.03, noseY - R * 0.03, R * 0.035, R * 0.028, 0, 0, Math.PI * 2); ctx.fill();

  // ── Near ear (broad pricked triangle, swept back) ──
  ctx.fillStyle = C.occ;
  ctx.beginPath();
  ctx.moveTo(D * R * 0.10, -R * 0.68);       // inner base (front)
  ctx.lineTo(-D * R * 0.26, -R * 1.50);      // tip
  ctx.lineTo(-D * R * 0.44, -R * 0.64);      // outer base (back)
  ctx.quadraticCurveTo(-D * R * 0.16, -R * 0.72, D * R * 0.10, -R * 0.68);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(160,48,10,0.62)';    // inner ember cavity
  ctx.beginPath();
  ctx.moveTo(D * R * 0.02, -R * 0.72);
  ctx.lineTo(-D * R * 0.24, -R * 1.34);
  ctx.lineTo(-D * R * 0.34, -R * 0.70);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.rim; ctx.lineWidth = R * 0.03; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(D * R * 0.10, -R * 0.68); ctx.lineTo(-D * R * 0.26, -R * 1.50); ctx.stroke();

  // Mouth — seam along muzzle bottom-third
  const mouthY = headR * 0.19 + jawOpen * headR * 0.09;
  if (jawOpen > 0.20) {
    ctx.save();
    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = headR * 0.8 * jawOpen;
    ctx.fillStyle = `rgba(255,${Math.round(80 + jawOpen*60)},0,0.92)`;
    ctx.beginPath();
    ctx.moveTo(dir * headR * 0.20, mouthY);
    ctx.quadraticCurveTo(dir * headR * 0.56, mouthY + headR * 0.07, dir * headR * 0.88, mouthY);
    ctx.lineTo(dir * headR * 0.88, mouthY + headR * 0.20 * jawOpen);
    ctx.quadraticCurveTo(dir * headR * 0.56, mouthY + headR * 0.30 * jawOpen, dir * headR * 0.20, mouthY + headR * 0.20 * jawOpen);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // lip line — dark (a tight closed muzzle, not a bright grin)
  ctx.strokeStyle = 'rgba(18,10,12,0.85)'; ctx.lineWidth = OL * 0.9; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(dir * headR * 0.18, mouthY);
  ctx.quadraticCurveTo(dir * headR * 0.55, mouthY + headR * 0.05, dir * headR * 0.92, mouthY - headR * 0.02);
  ctx.stroke();
  // faint ember only at the lip commissure
  ctx.strokeStyle = 'rgba(225,88,20,0.45)'; ctx.lineWidth = OL * 0.5;
  ctx.beginPath();
  ctx.moveTo(dir * headR * 0.30, mouthY + headR * 0.01);
  ctx.quadraticCurveTo(dir * headR * 0.55, mouthY + headR * 0.05, dir * headR * 0.78, mouthY + headR * 0.005);
  ctx.stroke();
  // a single fang glints even when the jaw is closed (menace)
  if (jawOpen < 0.12 && unit.state !== 'fight') {
    ctx.fillStyle = _HD_C.bone;
    const fx = dir * headR * 0.66;
    ctx.beginPath();
    ctx.moveTo(fx, mouthY - headR * 0.005);
    ctx.lineTo(fx + dir * headR * 0.028, mouthY + headR * 0.11);
    ctx.lineTo(fx + dir * headR * 0.066, mouthY - headR * 0.005);
    ctx.closePath(); ctx.fill();
  }

  // Fangs — bone-cream upper canines (down) + lower canines (up when open)
  if (jawOpen > 0.12 || unit.state === 'fight') {
    const fa = Math.max(0.45, jawOpen);
    ctx.fillStyle = _HD_C.bone;
    for (const [fxN, fw, fl] of [[0.26, 0.11, 0.34], [0.54, 0.10, 0.27]]) {
      ctx.beginPath();
      ctx.moveTo(dir * headR * fxN, mouthY - headR * 0.03);
      ctx.lineTo(dir * headR * (fxN + 0.03), mouthY + headR * fl * fa);
      ctx.lineTo(dir * headR * (fxN + fw), mouthY - headR * 0.03);
      ctx.closePath(); ctx.fill();
    }
    if (jawOpen > 0.25) {
      const ly = mouthY + headR * 0.20 * jawOpen;
      ctx.fillStyle = _HD_C.boneSh;
      for (const [fxN, fw] of [[0.34, 0.09], [0.60, 0.08]]) {
        ctx.beginPath();
        ctx.moveTo(dir * headR * fxN, ly + headR * 0.02);
        ctx.lineTo(dir * headR * (fxN + 0.02), ly - headR * 0.20 * fa);
        ctx.lineTo(dir * headR * (fxN + fw), ly + headR * 0.02);
        ctx.closePath(); ctx.fill();
      }
    }
  }

  // ── Single angry almond hellfire eye (profile; colour by branch) ──
  const _hb = unit._branch || '';
  const eyeGlow = _hb === 'B' ? '#ffcc30' : (_hb === 'A' ? '#ff0a00' : '#ff4400');
  const eyeIris = _hb === 'B' ? '#ffb424' : (_hb === 'A' ? '#ff2600' : '#ff6a10');
  const eyeCore = _hb === 'B' ? '#fff2b0' : C.eye;
  const eyeCX = D * headR * 0.14, eyeCY = -headR * 0.20, eyeR = headR * 0.22;
  // socket / lid shadow (almond, inner corner low)
  ctx.fillStyle = '#050302';
  ctx.beginPath();
  ctx.moveTo(eyeCX - D * eyeR * 1.2, eyeCY + eyeR * 0.15);
  ctx.quadraticCurveTo(eyeCX - D * eyeR * 0.1, eyeCY - eyeR * 1.05, eyeCX + D * eyeR * 1.25, eyeCY - eyeR * 0.30);
  ctx.quadraticCurveTo(eyeCX + D * eyeR * 0.85, eyeCY + eyeR * 0.95, eyeCX - D * eyeR * 0.9, eyeCY + eyeR * 0.75);
  ctx.closePath(); ctx.fill();
  // glowing iris
  ctx.save(); ctx.shadowColor = eyeGlow; ctx.shadowBlur = eyeR * (unit.state === 'fight' || ap > 0 ? 2.3 : 1.7);
  ctx.fillStyle = eyeIris;
  ctx.beginPath(); ctx.ellipse(eyeCX, eyeCY, eyeR * 0.82, eyeR * 0.66, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = eyeCore;
  ctx.beginPath(); ctx.ellipse(eyeCX, eyeCY, eyeR * 0.50, eyeR * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  // slit pupil
  ctx.fillStyle = '#0a0402';
  ctx.beginPath(); ctx.ellipse(eyeCX + D * eyeR * 0.05, eyeCY, eyeR * 0.13, eyeR * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  // spec highlight
  ctx.fillStyle = 'rgba(255,240,200,0.7)';
  ctx.beginPath(); ctx.arc(eyeCX - D * eyeR * 0.3, eyeCY - eyeR * 0.28, eyeR * 0.15, 0, Math.PI * 2); ctx.fill();

  // ── Heavy bony brow (angry overhang) ──
  const browI = (unit.state === 'fight' || ap > 0) ? 1.0 : 0.72;
  ctx.fillStyle = `rgba(26,18,24,${browI})`;
  ctx.beginPath();
  ctx.moveTo(eyeCX - D * eyeR * 1.35, eyeCY - eyeR * 0.65);
  ctx.quadraticCurveTo(eyeCX + D * eyeR * 0.1, eyeCY - eyeR * 1.55, eyeCX + D * eyeR * 1.4, eyeCY - eyeR * 0.80);
  ctx.quadraticCurveTo(eyeCX + D * eyeR * 0.5, eyeCY - eyeR * 0.55, eyeCX - D * eyeR * 1.35, eyeCY - eyeR * 0.65);
  ctx.closePath(); ctx.fill();
  // ember glint along the brow
  ctx.strokeStyle = `rgba(210,72,16,${browI})`; ctx.lineWidth = headR * 0.03; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(eyeCX - D * eyeR * 1.15, eyeCY - eyeR * 0.82);
  ctx.quadraticCurveTo(eyeCX + D * eyeR * 0.1, eyeCY - eyeR * 1.40, eyeCX + D * eyeR * 1.1, eyeCY - eyeR * 0.92);
  ctx.stroke();

  ctx.restore(); // head

  // ── Branch visuals (drawn in world coords after head restore) ──
  const _hBranch = unit._branch || '';
  if (_hBranch === 'A') {
    // ── PACK — battle-scarred veteran: claw-rake scars, torn ear,
    //    raised hackles, a faint blood-rage aura ──
    // 1. towering jagged mane over the withers & nape — the key silhouette
    //    change so the veteran reads as an upgrade at thumbnail size.
    const jag  = [0.20, 0.31, 0.25, 0.35, 0.23, 0.29, 0.17];
    const lean = [-0.03, -0.08, -0.02, -0.10, -0.05, -0.01, -0.06];   // varied tip sway (× dir)
    const bw   = [0.030, 0.038, 0.026, 0.040, 0.028, 0.034, 0.024];   // varied base thickness
    const mBaseX = bx + dir * s * 0.22, mBaseY = by - s * 0.27;
    const mTopX = hx - dir * headR * 0.55, mTopY = hy - headR * 0.45;
    for (let i = 0; i < jag.length; i++) {
      const t = i / (jag.length - 1);
      const nx = mBaseX + (mTopX - mBaseX) * t, ny = mBaseY + (mTopY - mBaseY) * t;
      const h = s * jag[i], w = s * bw[i], tipX = nx + dir * s * lean[i];
      ctx.fillStyle = _HD_C.edge;
      ctx.beginPath();
      ctx.moveTo(nx - dir * w, ny + s * 0.02);
      ctx.quadraticCurveTo(nx - dir * w * 0.4, ny - h * 0.55, tipX, ny - h);          // curved bristle
      ctx.quadraticCurveTo(nx + dir * w * 0.4, ny - h * 0.4, nx + dir * w * 0.85, ny - s * 0.005);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,64,16,0.45)'; ctx.lineWidth = s * 0.007; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(nx - dir * w, ny + s * 0.02); ctx.quadraticCurveTo(nx - dir * w * 0.4, ny - h * 0.55, tipX, ny - h); ctx.stroke();
    }
    // 2. diagonal claw-rake slashes across the shoulder (varied length/spacing)
    const rake = [[0.02, -0.11, 0.20, 0.20], [0.085, -0.14, 0.28, 0.25], [0.16, -0.08, 0.17, 0.17]];
    rake.forEach(([xf, yf, dxf, dyf]) => {
      const x0 = bx + dir * s * xf, y0 = by + s * yf;
      const x1 = x0 + dir * s * dxf, y1 = y0 + s * dyf;
      const cxm = (x0 + x1) / 2 + dir * s * 0.015, cym = (y0 + y1) / 2 - s * 0.02;
      ctx.strokeStyle = 'rgba(8,3,4,0.85)'; ctx.lineWidth = s * 0.026; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0 - dir * s * 0.006, y0 - s * 0.006); ctx.quadraticCurveTo(cxm, cym, x1, y1); ctx.stroke();
      ctx.save(); ctx.shadowColor = '#ff2600'; ctx.shadowBlur = s * 0.07;
      ctx.strokeStyle = '#ff3c0a'; ctx.lineWidth = s * 0.014;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cxm, cym, x1, y1); ctx.stroke();
      ctx.strokeStyle = '#ffc247'; ctx.lineWidth = s * 0.0045;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cxm, cym, x1, y1); ctx.stroke();
      ctx.restore();
    });
    // 3. big ragged chunk torn from the near ear (visibly breaks the outline)
    ctx.fillStyle = '#0a0608';
    ctx.beginPath();
    ctx.moveTo(hx - dir * headR * 0.44, hy - headR * 0.92);
    ctx.lineTo(hx - dir * headR * 0.14, hy - headR * 1.14);
    ctx.lineTo(hx - dir * headR * 0.30, hy - headR * 1.30);
    ctx.lineTo(hx - dir * headR * 0.40, hy - headR * 1.08);
    ctx.closePath(); ctx.fill();
    // 4. blood-rage aura (saturated red divergence)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const ra = ctx.createRadialGradient(bx, by, s * 0.1, bx, by, s * 0.66);
    ra.addColorStop(0, 'rgba(205,10,0,0.16)'); ra.addColorStop(1, 'rgba(205,10,0,0)');
    ctx.fillStyle = ra; ctx.beginPath(); ctx.arc(bx, by, s * 0.66, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  } else if (_hBranch === 'B') {
    // ── ALPHA — molten-gold royal: flame mane, rooted gold crown, aura ──
    const gT = _frameNow / 1000;
    // regal gold aura
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const ga = ctx.createRadialGradient(bx, by - s * 0.05, s * 0.1, bx, by - s * 0.05, s * 0.72);
    ga.addColorStop(0, 'rgba(255,180,30,0.11)'); ga.addColorStop(1, 'rgba(255,180,30,0)');
    ctx.fillStyle = ga; ctx.beginPath(); ctx.arc(bx, by - s * 0.05, s * 0.72, 0, Math.PI * 2); ctx.fill();
    // gold flame mane rising from the withers up the nape toward the head
    const mbx = bx + dir * s * 0.08, mby = by - s * 0.19;
    const mtx = hx - dir * headR * 0.55, mty = hy - headR * 0.10;
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const nx = mbx + (mtx - mbx) * t, ny = mby + (mty - mby) * t;
      const flick = Math.sin(gT * 5 + i * 1.3) * s * 0.018;
      const fh = s * (0.17 - t * 0.04);
      ctx.save(); ctx.shadowColor = '#ffb020'; ctx.shadowBlur = s * 0.05;
      ctx.fillStyle = 'rgba(235,150,20,0.82)';
      ctx.beginPath();
      ctx.moveTo(nx - dir * s * 0.03, ny);
      ctx.quadraticCurveTo(nx - dir * s * 0.02, ny - fh * 0.6, nx + flick - dir * s * 0.015, ny - fh);
      ctx.quadraticCurveTo(nx + dir * s * 0.025, ny - fh * 0.5, nx + dir * s * 0.03, ny);
      ctx.quadraticCurveTo(nx, ny + s * 0.02, nx - dir * s * 0.03, ny);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,232,120,0.9)';
      ctx.beginPath();
      ctx.moveTo(nx - dir * s * 0.012, ny);
      ctx.quadraticCurveTo(nx, ny - fh * 0.5, nx + flick * 0.6 - dir * s * 0.008, ny - fh * 0.72);
      ctx.quadraticCurveTo(nx + dir * s * 0.013, ny - fh * 0.4, nx + dir * s * 0.012, ny);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // rooted molten-gold crown emerging from the brow/crown of the skull
    ctx.save(); ctx.shadowColor = '#ffcc30'; ctx.shadowBlur = s * 0.05;
    const crX = hx + dir * headR * 0.04, crY = hy - headR * 0.62;
    for (const [cxo, len, ang] of [[-0.30, 0.62, -0.22], [-0.04, 0.78, -0.02], [0.24, 0.60, 0.20]]) {
      const rx = crX + dir * headR * cxo, ry = crY;
      const tx = rx + dir * headR * Math.sin(ang) * len, ty = ry - headR * len;
      _hdRibbon([
        { x: rx, y: ry, w: headR * 0.10 },
        { x: (rx + tx) / 2 + dir * headR * 0.03, y: (ry + ty) / 2, w: headR * 0.055 },
        { x: tx, y: ty, w: headR * 0.018 },
      ], '#c9821a');
      ctx.strokeStyle = 'rgba(255,222,110,0.85)'; ctx.lineWidth = headR * 0.028; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(rx, ry - headR * 0.02); ctx.quadraticCurveTo((rx + tx) / 2 + dir * headR * 0.03, (ry + ty) / 2, tx, ty); ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore(); // main
}

// Hellhound body — semi-realistic charcoal coat, layered values, ember
// underlight, warm rim, glowing lava fissures and a bristled dorsal ridge.
function _hdHoundBody(bx, by, dir, s, OL, squashX, squashY, tilt, branch) {
  const C = _HD_C;
  const F = dir;   // +F points forward (head/chest side)
  // Alpha (B) burns molten-gold instead of ember-orange
  const gold = branch === 'B';
  const emberCol   = gold ? '#ffb020' : C.ember;
  const emberHiCol = gold ? '#fff2b0' : C.emberHi;
  const underCol   = gold ? 'rgba(210,150,20,0.42)' : 'rgba(200,70,10,0.38)';
  const ridgeTip   = gold ? 'rgba(255,205,70,0.75)' : 'rgba(255,120,40,0.6)';
  const rimCol     = gold ? '#ffc247' : C.rim;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(tilt);
  ctx.scale(squashX, squashY);

  // ── predatory silhouette: high wither, dipped loin, deep chest, tucked belly ──
  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(F * s * 0.44, s * 0.10);                                       // deep chest front-bottom
    ctx.quadraticCurveTo(F * s * 0.49, -s * 0.06, F * s * 0.40, -s * 0.15);   // chest front up
    ctx.quadraticCurveTo(F * s * 0.34, -s * 0.30, F * s * 0.23, -s * 0.28);   // WITHER hump (high)
    ctx.quadraticCurveTo(F * s * 0.07, -s * 0.19, -F * s * 0.05, -s * 0.185); // dip into LOIN
    ctx.quadraticCurveTo(-F * s * 0.20, -s * 0.27, -F * s * 0.31, -s * 0.22); // rise to HAUNCH
    ctx.quadraticCurveTo(-F * s * 0.47, -s * 0.10, -F * s * 0.44, s * 0.07);  // round rump
    ctx.quadraticCurveTo(-F * s * 0.40, s * 0.23, -F * s * 0.23, s * 0.22);   // back thigh
    ctx.quadraticCurveTo(-F * s * 0.12, s * 0.09, -F * s * 0.02, s * 0.12);   // concave LOIN TUCK (up)
    ctx.quadraticCurveTo(F * s * 0.16, s * 0.17, F * s * 0.30, s * 0.25);     // belly → deep chest
    ctx.quadraticCurveTo(F * s * 0.41, s * 0.28, F * s * 0.44, s * 0.10);     // chest bottom close
    ctx.closePath();
  };
  ctx.fillStyle = C.occ; bodyPath(); ctx.fill();
  // core shadow + occlusion (clipped)
  ctx.save(); bodyPath(); ctx.clip();
  const coolG = ctx.createLinearGradient(0, -s * 0.10, 0, s * 0.28);
  coolG.addColorStop(0, 'rgba(20,14,26,0)'); coolG.addColorStop(1, 'rgba(20,14,26,0.55)');
  ctx.fillStyle = coolG; bodyPath(); ctx.fill();
  const occG = ctx.createRadialGradient(F * s * 0.22, s * 0.08, 0, F * s * 0.22, s * 0.08, s * 0.24);
  occG.addColorStop(0, 'rgba(8,5,10,0.5)'); occG.addColorStop(1, 'rgba(8,5,10,0)');
  ctx.fillStyle = occG; ctx.fillRect(-s * 0.5, -s * 0.32, s, s * 0.72);   // pocket behind foreleg
  // mid coat (upper body)
  ctx.fillStyle = C.mid;
  ctx.beginPath();
  ctx.moveTo(F * s * 0.40, -s * 0.12);
  ctx.quadraticCurveTo(F * s * 0.30, -s * 0.27, F * s * 0.19, -s * 0.25);
  ctx.quadraticCurveTo(F * s * 0.05, -s * 0.16, -F * s * 0.05, -s * 0.155);
  ctx.quadraticCurveTo(-F * s * 0.20, -s * 0.24, -F * s * 0.30, -s * 0.19);
  ctx.quadraticCurveTo(-F * s * 0.42, -s * 0.08, -F * s * 0.38, s * 0.06);
  ctx.lineTo(-F * s * 0.05, s * 0.02);
  ctx.lineTo(F * s * 0.28, -s * 0.02);
  ctx.closePath(); ctx.fill();
  // top-lit shoulder/back plane
  const litG = ctx.createLinearGradient(0, -s * 0.30, 0, -s * 0.02);
  litG.addColorStop(0, C.midHi); litG.addColorStop(1, 'rgba(85,68,73,0)');
  ctx.fillStyle = litG;
  ctx.beginPath();
  ctx.moveTo(F * s * 0.23, -s * 0.27);
  ctx.quadraticCurveTo(F * s * 0.07, -s * 0.185, -F * s * 0.05, -s * 0.18);
  ctx.quadraticCurveTo(-F * s * 0.20, -s * 0.26, -F * s * 0.30, -s * 0.21);
  ctx.lineTo(-F * s * 0.18, -s * 0.11);
  ctx.lineTo(F * s * 0.16, -s * 0.14);
  ctx.closePath(); ctx.fill();
  ctx.restore(); // unclip

  // subtle ember underbelly
  ctx.save(); bodyPath(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
  const ug = ctx.createLinearGradient(0, s * 0.05, 0, s * 0.26);
  ug.addColorStop(0, 'rgba(180,50,0,0)'); ug.addColorStop(1, underCol);
  ctx.fillStyle = ug; bodyPath(); ctx.fill();
  ctx.restore();

  // rim light along the back
  ctx.strokeStyle = rimCol; ctx.lineWidth = s * 0.013; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.shadowColor = 'rgba(255,138,58,0.5)'; ctx.shadowBlur = s * 0.05;
  ctx.beginPath();
  ctx.moveTo(F * s * 0.23, -s * 0.28);
  ctx.quadraticCurveTo(F * s * 0.07, -s * 0.19, -F * s * 0.05, -s * 0.185);
  ctx.quadraticCurveTo(-F * s * 0.20, -s * 0.27, -F * s * 0.31, -s * 0.22);
  ctx.quadraticCurveTo(-F * s * 0.47, -s * 0.10, -F * s * 0.44, s * 0.07);
  ctx.stroke(); ctx.restore();

  // lava fissures — tapered, charred lip, following ribs & haunch
  ctx.save(); bodyPath(); ctx.clip();
  const cracks = [
    [{ x: F * 0.33, y: -0.12 }, { x: F * 0.27, y: -0.01 }, { x: F * 0.30, y: 0.09 }, { x: F * 0.23, y: 0.18 }], // long rib, curving down
    [{ x: F * 0.11, y: -0.07 }, { x: F * 0.05, y: 0.02 }],                                                       // short nick
    [{ x: -F * 0.24, y: -0.12 }, { x: -F * 0.19, y: -0.02 }, { x: -F * 0.27, y: 0.07 }],                         // haunch, different angle
  ];
  cracks.forEach(cr => {
    const pts = cr.map((p, i) => ({ x: p.x * s, y: p.y * s, w: s * (0.020 * (1 - i / cr.length) + 0.004) }));
    // charred lip (dark, offset toward the light side)
    ctx.strokeStyle = 'rgba(10,4,6,0.7)'; ctx.lineWidth = s * 0.028; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0].x - F * s * 0.006, pts[0].y - s * 0.006);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x - F * s * 0.006, pts[i].y - s * 0.006);
    ctx.stroke();
    // glowing tapered core
    ctx.save(); ctx.shadowColor = emberCol; ctx.shadowBlur = s * 0.08;
    _hdRibbon(pts, emberCol); ctx.shadowBlur = 0;
    _hdRibbon(pts.map(p => ({ x: p.x, y: p.y, w: p.w * 0.42 })), emberHiCol);
    ctx.restore();
  });
  ctx.restore();

  // bristled dorsal ridge (follows the dipped back, tallest at the shoulders)
  const maneN = 9;
  for (let i = 0; i < maneN; i++) {
    const t = i / (maneN - 1);
    const mx = F * s * 0.23 + (-F * s * 0.31 - F * s * 0.23) * t;
    const my = -s * 0.28 + s * 0.095 * Math.sin(t * Math.PI * 0.86);   // rides the wither→loin→haunch line
    const arc = 1 - Math.abs(t - 0.12) * 1.5;
    const h = s * (0.045 + Math.max(0, arc) * 0.05) * (i % 2 ? 0.82 : 1);
    ctx.fillStyle = C.edge;
    ctx.beginPath();
    ctx.moveTo(mx - s * 0.022, my + s * 0.015);
    ctx.lineTo(mx - F * s * 0.03, my - h);
    ctx.lineTo(mx + s * 0.022, my + s * 0.015);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = ridgeTip;
    ctx.beginPath(); ctx.arc(mx - F * s * 0.03, my - h, s * 0.008, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// 4-beat walk leg: phase 0-0.5=swing(airborne), 0.5-1.0=stance(grounded)
function _hdLegWalk(baseX, baseY, floorY, w, h, ol, dim, dir, phase, hind) {
  const C = _HD_C;
  const stride = h * 0.40;
  let footX, footY;
  if (phase < 0.5) { const t = phase / 0.5; footX = baseX + dir * stride * (2*t - 1); footY = floorY - h * 0.40 * Math.sin(t * Math.PI); }
  else { const t = (phase - 0.5) / 0.5; footX = baseX + dir * stride * (1 - 2*t); footY = floorY; }
  const w0 = w * (hind ? 0.72 : 0.58);

  // contact occlusion where the near limb meets the torso
  if (!dim) {
    const cg = ctx.createRadialGradient(baseX, baseY - h * 0.04, 0, baseX, baseY - h * 0.04, h * 0.55);
    cg.addColorStop(0, 'rgba(6,4,8,0.5)'); cg.addColorStop(1, 'rgba(6,4,8,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(baseX, baseY - h * 0.04, h * 0.55, 0, Math.PI * 2); ctx.fill();
  }

  let chain;
  if (hind) {
    // rear: big thigh → thin hock, digitigrade S
    const stifleX = baseX + dir * h * 0.22, stifleY = baseY + h * 0.40;
    const hockX = baseX - dir * h * 0.04,   hockY = footY - h * 0.44;
    chain = [
      { x: baseX,   y: baseY - h * 0.06, w: w0 * 1.85 },   // haunch thigh
      { x: stifleX, y: stifleY,          w: w0 * 1.05 },
      { x: hockX,   y: hockY,            w: w0 * 0.60 },
      { x: footX,   y: footY - h * 0.02, w: w0 * 0.48 },
    ];
  } else {
    // front: shoulder → forearm → pastern (straighter)
    const elbX = baseX + dir * h * 0.05, elbY = baseY + h * 0.42;
    const wrX = footX - dir * h * 0.02,  wrY = footY - h * 0.30;
    chain = [
      { x: baseX, y: baseY - h * 0.04, w: w0 * 1.55 },
      { x: elbX,  y: elbY,             w: w0 * 0.95 },
      { x: wrX,   y: wrY,              w: w0 * 0.60 },
      { x: footX, y: footY - h * 0.02, w: w0 * 0.48 },
    ];
  }
  const base = dim ? '#0e0a12' : C.dark;            // far legs darker & desaturated
  _hdRibbon(chain, base);
  if (!dim) {
    _hdRibbon(chain.map(p => ({ x: p.x + dir * p.w * 0.30, y: p.y, w: p.w * 0.42 })), C.mid);              // front lit plane
    _hdRibbon(chain.map(p => ({ x: p.x - dir * p.w * 0.42, y: p.y, w: p.w * 0.30 })), 'rgba(8,5,10,0.5)'); // core shadow → cylinder read
    _hdRibbonEdge(chain, 0.94, 'rgba(255,138,58,0.20)', h * 0.022);
  }

  // ── paw: pastern mass the toes emerge from + short dim claws ──
  const pawCol = dim ? '#0c0810' : C.occ;
  const fpx = footX + dir * w0 * 0.18;
  ctx.fillStyle = dim ? '#0e0a12' : C.dark;
  ctx.beginPath();
  ctx.moveTo(footX - dir * w0 * 0.55, footY - h * 0.13);
  ctx.quadraticCurveTo(fpx, footY - h * 0.11, footX + dir * w0 * 1.15, footY - h * 0.03);
  ctx.quadraticCurveTo(footX + dir * w0 * 1.25, footY + w0 * 0.20, footX + dir * w0 * 0.90, footY + w0 * 0.30);
  ctx.lineTo(footX - dir * w0 * 0.45, footY + w0 * 0.30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = pawCol;
  ctx.beginPath(); ctx.ellipse(fpx, footY + w0 * 0.05, w0 * 1.15, w0 * 0.44, 0, 0, Math.PI * 2); ctx.fill();
  for (let c = 0; c < 3; c++) {
    const tx = footX - dir * w0 * 0.34 + dir * c * w0 * 0.60;
    ctx.fillStyle = pawCol;
    ctx.beginPath(); ctx.ellipse(tx, footY + w0 * 0.08, w0 * 0.32, w0 * 0.40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dim ? '#3a3020' : '#8a7856';
    ctx.beginPath();
    ctx.moveTo(tx + dir * w0 * 0.10, footY + w0 * 0.34);
    ctx.lineTo(tx + dir * w0 * 0.30, footY + w0 * 0.52);
    ctx.lineTo(tx + dir * w0 * 0.24, footY + w0 * 0.28);
    ctx.closePath(); ctx.fill();
  }
}

// Gallop legs during leap (flying-gallop pose)
function _hdLegLeap(bx, by, s, OL, dir, isBack, dim, arc) {
  const col = dim ? '#160c08' : '#221008';
  const lw = s * 0.12, lh = s * 0.22;

  // Body attachment point
  const baseX = isBack
    ? bx - dir * s * (dim ? 0.18 : 0.20)
    : bx + dir * s * (dim ? 0.12 : 0.14);
  const baseY = by + s * 0.12;

  // Knee and paw (gallop stretch toward floor)
  let kneeX, kneeY, pawX, pawY;
  if (isBack) {
    kneeX = baseX - dir * lh * 0.32 * arc;
    kneeY = baseY + lh * 0.30;
    pawX  = kneeX - dir * lh * 0.38 * arc;
    pawY  = kneeY + lh * 0.55 * (1 - arc * 0.30);
  } else {
    kneeX = baseX + dir * lh * 0.28 * arc;
    kneeY = baseY + lh * 0.26;
    pawX  = kneeX + dir * lh * 0.42 * arc;
    pawY  = kneeY + lh * 0.52 * (1 - arc * 0.28);
  }

  const w0 = lw * 0.58;
  const chain = [
    { x: baseX, y: baseY, w: w0 * 1.5 },
    { x: kneeX, y: kneeY, w: w0 * 0.95 },
    { x: pawX,  y: pawY,  w: w0 * 0.55 },
  ];
  _hdRibbon(chain, dim ? _HD_C.occ : _HD_C.dark);
  if (!dim) { const lit = chain.map(p => ({ x: p.x + dir * p.w * 0.30, y: p.y, w: p.w * 0.42 })); _hdRibbon(lit, _HD_C.mid); }
  // paw + claws
  ctx.fillStyle = dim ? _HD_C.edge : _HD_C.occ;
  ctx.beginPath(); ctx.ellipse(pawX + dir * w0 * 0.4, pawY, w0 * 1.1, w0 * 0.5, 0.3 * (isBack ? -1 : 1) * dir, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = dim ? '#5a4a34' : _HD_C.boneSh; ctx.lineWidth = w0 * 0.26; ctx.lineCap = 'round';
  for (let c = 0; c < 3; c++) {
    const cxp = pawX + dir * (w0 * 0.1 + c * w0 * 0.5);
    ctx.beginPath(); ctx.moveTo(cxp, pawY); ctx.lineTo(cxp + dir * w0 * 0.4, pawY + lh * 0.14); ctx.stroke();
  }
}

// Helper: draw one hound leg (walk/idle)
function _hdLeg(x, floorY, w, h, ol, dim) {
  const col = dim ? '#8a4a20' : '#a05830';
  const hiCol = dim ? 'rgba(180,130,80,0.3)' : 'rgba(200,150,100,0.4)';
  // Leg
  ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = ol;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, floorY - h);
  ctx.bezierCurveTo(x - w * 0.6, floorY - h * 0.5, x - w * 0.5, floorY - h * 0.1, x - w * 0.3, floorY);
  ctx.lineTo(x + w * 0.3, floorY);
  ctx.bezierCurveTo(x + w * 0.5, floorY - h * 0.1, x + w * 0.6, floorY - h * 0.5, x + w / 2, floorY - h);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Paw (round bottom)
  ctx.fillStyle = '#804520'; ctx.strokeStyle = '#000'; ctx.lineWidth = ol * 0.8;
  ctx.beginPath(); ctx.ellipse(x, floorY - h * 0.06, w * 0.45, h * 0.14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Highlight
  ctx.fillStyle = hiCol;
  ctx.beginPath(); ctx.ellipse(x - w * 0.08, floorY - h * 0.65, w * 0.2, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
}


// ═══════════════════════════════════════════════════════════════════════════
//  ZOMBIE — egg-body chibi zombie (level 4, ability: infect)
//  Blue torn suit (Trump-style), light Elvis pompadour, dance-attack
// ═══════════════════════════════════════════════════════════════════════════
function drawZombieMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._zmT === undefined) {
    unit._zmT = Math.random() * Math.PI * 2;
    unit._zmDir = 1;
    unit._zmAtkP = 0;
    unit._zmPrevCd = unit.attackCooldown || 0;
    unit._zmPrevX = unit.x;
    unit._zmLastT = _frameNow;
    unit._zmDanceTimer = Math.random() * 20;
  }
  const dt = Math.min((_frameNow - unit._zmLastT) / 1000, 0.05);
  unit._zmLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._zmDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._zmPrevX) > 0.2) {
    unit._zmDir = unit.x > unit._zmPrevX ? 1 : -1;
  }
  unit._zmPrevX = unit.x;
  const dir = unit._zmDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._zmPrevCd || 0) + 3) unit._zmAtkP = 0.01;
  unit._zmPrevCd = acd;
  if (unit._zmAtkP > 0) { unit._zmAtkP += dt / 0.9; if (unit._zmAtkP >= 1) unit._zmAtkP = 0; }

  unit._zmT += dt * (unit.state === 'move' ? 1.8 : 0.8);
  const ap = unit._zmAtkP;
  const atkActive = ap > 0;

  // Patrol dance timer — only advances outside fight/attack
  if (unit.state !== 'fight' && !atkActive) {
    unit._zmDanceTimer += dt;
    if (unit._zmDanceTimer >= 35) unit._zmDanceTimer = 0;
  }
  const patrolDancing = unit.state !== 'fight' && !atkActive && unit._zmDanceTimer >= 30;
  const dancing = patrolDancing;

  // Zombie sway: phase-shifted so body lurches LATE relative to steps (wrong-timing)
  const wobble = Math.sin(unit._zmT * 0.85 + 0.8) * 0.07;
  const bob = (unit.state === 'move' && !patrolDancing)
    ? Math.abs(Math.sin(unit._zmT * 0.8 + 0.3)) * s * 0.09
    : Math.sin(unit._zmT * 0.4) * s * 0.025;

  // Setup heroStudio coords — slim humanoid body
  const H = s * 1.85;
  const {S, sx, sy} = _heroStudio(cx, fY, H, dir);
  _hCtx = ctx;

  // Attack body lurch — synced with slam phases
  // ap 0-0.15: lean back (windup), 0.15-0.58: lunge forward (slam), 0.58+: recover
  let lurchX = 0, atkBodyTilt = 0, atkHeadNod = 0;
  if (atkActive) {
    let raw;
    if (ap < 0.18) {                               // ANTICIPATION: coil back + down
      const t = ap / 0.18, ef = t * t * (3 - 2 * t);
      raw = -ef * 0.55;
    } else if (ap < 0.52) {                        // SNAP: fast lunge forward, overshoot
      const t = (ap - 0.18) / 0.34;
      raw = -0.55 + 1.70 * (t * t);                // -0.55 → +1.15 (overshoot)
    } else if (ap < 0.66) {                        // SETTLE from overshoot
      const t = (ap - 0.52) / 0.14;
      raw = 1.15 - 0.15 * (t * t * (3 - 2 * t));
    } else {                                        // RECOVER to neutral
      const t = (ap - 0.66) / 0.34;
      raw = 1.0 - t * t * (3 - 2 * t);
    }
    lurchX      = dir * raw * 11 * S;
    atkBodyTilt = dir * raw * 0.24;                // lean back on windup, forward on slam
    atkHeadNod  = Math.max(0, raw) * 0.32;
  }

  // reachF: blend from beat pose (0) to attack slam pose (1)
  let reachF = 0;
  if (atkActive) {
    const raw = ap < 0.10 ? ap / 0.10          // quick enter
              : ap < 0.82 ? 1.0                 // hold attack
              : (1 - ap) / 0.18;               // smooth exit
    const t = Math.max(0, Math.min(1, raw));
    reachF = t * t * (3 - 2 * t);
  }

  // Dance phase
  const danceT = unit._zmT * 3.5;

  // HP bar position
  unit._hpBarY = sy(6) - 14;

  // ── Palette: rotting green flesh + torn blue suit, layered values ──
  const _zmVisualBranch = unit._branch || '';
  const _zmImmortal = _zmVisualBranch === 'B';
  const ZC = {
    edge:'#0b1206',
    skinOcc:_zmImmortal ? '#303a32' : '#28401c',
    skin:_zmImmortal ? '#505d50' : '#3f6a2a',
    skinMid:_zmImmortal ? '#6c7a69' : '#568a38',
    skinLit:_zmImmortal ? '#929e8d' : '#7bb054',
    skinHi:_zmImmortal ? '#b9c1b2' : '#9ecb74',
    suitOcc:_zmImmortal ? '#171d20' : '#101f3e',
    suit:_zmImmortal ? '#303a3e' : '#1e4488',
    suitMid:_zmImmortal ? '#505d60' : '#2f5eaa',
    suitLit:_zmImmortal ? '#7e8988' : '#5384d0',
    trOcc:_zmImmortal ? '#101313' : '#14141f',
    tr:_zmImmortal ? '#242a29' : '#292935',
    trLit:_zmImmortal ? '#48504d' : '#41415a',
    tie:_zmImmortal ? '#691d1b' : '#c22',
    tieLit:_zmImmortal ? '#a23a34' : '#e24a4a',
    tieOcc:_zmImmortal ? '#3c0d0c' : '#8a1616',
    hair:_zmImmortal ? '#96906d' : '#d6a636',
    hairLit:_zmImmortal ? '#c4bea0' : '#f2d264',
    hairOcc:_zmImmortal ? '#615d43' : '#9c7420',
    eye:_zmImmortal ? '#d8e0cc' : '#b4ff44', bone:'#e9e1c6', wound:'#742828',
  };

  ctx.save();

  // ── Shadow ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(cx + lurchX * 0.6, fY, 14 * S, 2.5 * S, 0, 0, Math.PI * 2); ctx.fill();

  // Apply wobble + attack lurch
  ctx.save();
  const forwardLean = atkActive ? 0 : dir * 0.15;
  ctx.translate(cx + lurchX, fY);
  ctx.rotate(wobble + atkBodyTilt + forwardLean);
  ctx.translate(-(cx + lurchX), -fY - bob);

  // ── Walk phase (2-beat: near=0, far=0.5) ────────────────────
  const gait    = (unit._zmT / (Math.PI * 2)) % 1;
  const phaseNr = atkActive ? 0.75 : (patrolDancing ? 0    : gait);
  const phaseFr = atkActive ? 0.25 : (patrolDancing ? 0.50 : (gait + 0.5) % 1);
  const hipY    = sy(65);
  const floorY  = sy(91);
  const hipNrX  = cx + dir * 3.5 * S;
  const hipFrX  = cx - dir * 3.5 * S;

  function _zmLeg(hipX, hipYL, flrY, phase, dim) {
    const thighLen = 13 * S, shinLen = 11 * S;
    const col = dim ? '#1c1c2c' : '#2a2a3a';
    let thighAngle, kneeBend, liftY;
    if (patrolDancing) {
      const ds = dim ? -1 : 1;
      thighAngle = dir * Math.sin(danceT * ds) * 0.28;
      kneeBend   = Math.max(0, -Math.sin(danceT * ds) * 0.65);
      liftY      = 0;
    } else if (phase < 0.5) {
      const t = phase / 0.5, ef = t * t * (3 - 2 * t);
      thighAngle = dir * (0.14 * (2 * ef - 1));
      kneeBend   = 0.11 + 0.12 * Math.sin(t * Math.PI); // always bent + extra mid-swing
      liftY      = Math.sin(t * Math.PI) * (dim ? 1.2 : 3.0) * S; // far leg drags
    } else {
      const t = (phase - 0.5) / 0.5;
      thighAngle = dir * (0.14 - 0.28 * t);
      kneeBend   = 0.11; // knees always slightly bent in stance too
      liftY      = 0;
    }
    const kx = hipX + Math.sin(thighAngle) * thighLen;
    const ky = hipYL + Math.cos(thighAngle) * thighLen;
    const shinAngle = thighAngle - kneeBend;
    const fx = kx + Math.sin(shinAngle) * shinLen;
    const fy = Math.min(ky + Math.cos(shinAngle) * shinLen, flrY) - liftY;
    // Thigh + shin
    // ── trouser leg: volumetric tapered ribbon (thigh → knee → ankle) ──
    const _lw = 3.4 * S;
    const _lchain = [
      { x: hipX, y: hipYL, w: _lw * 1.2 },
      { x: kx, y: ky, w: _lw * 0.98 },
      { x: fx, y: fy - 2 * S, w: _lw * 0.74 },
    ];
    const _trBase = dim ? ZC.trOcc : ZC.tr;
    _hdRibbon(_lchain, ZC.edge);                                                   // dark outline
    _hdRibbon(_lchain.map(p => ({ x: p.x, y: p.y, w: p.w * 0.80 })), _trBase);      // fill
    if (!dim) _hdRibbon(_lchain.map(p => ({ x: p.x + dir * 1.8 * S, y: p.y, w: p.w * 0.30 })), ZC.trLit); // sheen
    // knee
    ctx.fillStyle = _trBase; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.5 * S;
    ctx.beginPath(); ctx.arc(kx, ky, _lw * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Shoe
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(shinAngle * 0.35);
    // leather shoe: sole + rounded upper with toe box, sheen (not a flat void)
    ctx.fillStyle = '#0d0d11'; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.6 * S;
    ctx.beginPath(); ctx.ellipse(dir * 3.5 * S, 2.3 * S, 6.8 * S, 1.9 * S, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#282830'; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.7 * S;
    ctx.beginPath();
    ctx.moveTo(-dir * 2.4 * S, 1.4 * S);
    ctx.quadraticCurveTo(-dir * 3.0 * S, -2.0 * S, dir * 1.5 * S, -2.4 * S);
    ctx.quadraticCurveTo(dir * 6.8 * S, -2.2 * S, dir * 9.2 * S, 0.4 * S);
    ctx.quadraticCurveTo(dir * 8.6 * S, 1.8 * S, dir * 5.5 * S, 1.9 * S);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(150,152,175,0.30)';
    ctx.beginPath(); ctx.ellipse(dir * 2.4 * S, -1.2 * S, 3.2 * S, 1.0 * S, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(8,8,12,0.6)'; ctx.lineWidth = 0.5 * S;
    ctx.beginPath(); ctx.moveTo(dir * 5.8 * S, -1.9 * S); ctx.lineTo(dir * 6.2 * S, 1.6 * S); ctx.stroke();
    ctx.restore();
    // Torn cuff (rotting skin peeking out)
    ctx.strokeStyle = ZC.skinMid; ctx.lineWidth = 0.45 * S; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx - 2.5 * S, fy - 1.5 * S); ctx.lineTo(fx - 0.8 * S, fy + 2 * S);
    ctx.moveTo(fx + 0.5 * S, fy - 2.0 * S); ctx.lineTo(fx + 2.5 * S, fy + 1.5 * S);
    ctx.stroke();
  }

  _zmLeg(hipFrX, hipY, floorY, phaseFr, true);
  _zmLeg(hipNrX, hipY, floorY, phaseNr, false);

  // ── Arms ─────────────────────────────────────────────────────
  const pump = Math.sin(danceT);

  // Beat: slow rise → snappy drop (top-to-bottom slap motion)
  let beatF = 0.5;
  if (!dancing && !atkActive) {
    const bn = ((unit._zmT * 0.72) % (Math.PI * 2)) / (Math.PI * 2);
    if (bn < 0.40) {
      const t = bn / 0.40; beatF = t * t * (3 - 2 * t);
    } else {
      const t = (bn - 0.40) / 0.60; beatF = 1 - t * t * (3 - 2 * t);
    }
  }

  let bendL, bendR;
  if (dancing) {
    const raw = pump * 0.5 + 0.5;
    const sharp = raw < 0.5
      ? 0.5 * Math.pow(raw * 2, 3)
      : 1 - 0.5 * Math.pow((1 - raw) * 2, 3);
    bendL = sharp;
    bendR = 1 - sharp;
  } else {
    bendL = 0;
    bendR = 0;
  }

  function _zmArm(shoulderX, shoulderY, bend, side, behind, rf = 0, isDancing = false, bf = beatF) {
    // The Immortal's leading arm is a visibly mismatched replacement limb —
    // larger, heavier and reattached with crude staples. This carries the
    // resurrection/lost-limb mechanic in the silhouette instead of relying on VFX.
    const _immArm = _zmImmortal && side > 0;
    const upperLen = 14 * S * (_immArm ? 1.10 : 1);
    const foreLen  = 12 * S * (_immArm ? 1.18 : 1);
    const skinCol  = behind ? ZC.skin : ZC.skinMid;
    const sleeveCol = behind ? ZC.suitOcc : ZC.suit;
    const lw = (behind ? 4 * S : 4.5 * S) * (_immArm ? 1.28 : 1);

    // ── Zombie beat pose: angle-based shoulder + elbow articulation
    // uaAngle — upper arm from DOWNWARD vertical (0=down, π/2=forward, π=up)
    // bf=0: arm swung down-forward (beat/slap) ~45° below horiz
    // bf=1: arm raised forward-up ~18° above horiz
    const uaAngle = Math.PI * (0.25 + 0.35 * bf);
    const elbXz   = shoulderX + dir * Math.sin(uaAngle) * upperLen;
    const elbYz   = shoulderY + Math.cos(uaAngle) * upperLen;
    // faAngle — forearm from downward vertical
    // bf=1 raised: forearm droops down (14°) — classic zombie droop
    // bf=0 beat:   forearm extends forward-down (59°) — slap/reach
    const faAngle = Math.PI * (0.08 + 0.25 * (1 - bf));
    const handXz  = elbXz + dir * Math.sin(faAngle) * foreLen;
    const handYz  = elbYz + Math.cos(faAngle) * foreLen;

    // ── Dance pose: arms up, alternating bent toward head
    const spreadX = side * 5 * S * dir;
    const elbXd = shoulderX + spreadX;
    const elbYd = shoulderY - upperLen;
    const headCX = sx(50), headCY = sy(18);
    const upX = elbXd, upY = elbYd - foreLen;
    const bentDx = headCX - elbXd, bentDy = headCY - elbYd;
    const bentDist = Math.hypot(bentDx, bentDy) || 1;
    const bentX = elbXd + (bentDx / bentDist) * foreLen;
    const bentY = elbYd + (bentDy / bentDist) * foreLen;
    const handXd = upX + (bentX - upX) * bend;
    const handYd = upY + (bentY - upY) * bend;

    // ── Pose selection ────────────────────────────────────────────
    let elbX, elbY, handX, handY;
    if (isDancing) {
      elbX = elbXd; elbY = elbYd; handX = handXd; handY = handYd;
    } else if (rf > 0) {
      // ── Double overhead raise → slam ──
      // Windup: BOTH arms rise up and spread OUT to their own side (claws to the
      //   sky, framing the head) — so neither forearm ever crosses the face.
      //   Horizontal is driven by `side` here, not `dir`, which is the whole point:
      //   in pixel space near=+X / far=-X, so `side` sends each arm to its own edge.
      // Slam: the arms whip DOWN and FORWARD (horizontal swings back to `dir`).
      // ap: 0-0.15 windup, 0.15-0.58 slam, 0.58+ extended/recovery.
      let atkUa, atkFa, hSign;
      if (ap < 0.15) {
        const t = ap / 0.15, ef = t * t * (3 - 2 * t);
        atkUa = uaAngle + ef * (Math.PI * 0.92 - uaAngle);  // raise to ~166° (nearly straight up)
        atkFa = faAngle + ef * (Math.PI * 0.86 - faAngle);  // forearm stays up — claws skyward
        hSign = side;                                        // spread OUT to own side
      } else if (ap < 0.58) {
        const t = (ap - 0.15) / 0.43, ef = t * t;           // fast, snappy drop
        atkUa = Math.PI * (0.92 - ef * 0.62);               // 166°→54° down-forward
        atkFa = Math.PI * (0.86 - ef * 0.53);               // unfolds and extends: 155°→59°
        hSign = side + (dir - side) * ef;                    // spread → forward through the arc
      } else {
        const t = Math.min(1, (ap - 0.58) / 0.42), ef = t * t * (3 - 2 * t);
        atkUa = Math.PI * (0.30 + ef * 0.10);                // settle toward beat
        atkFa = Math.PI * (0.33);
        hSign = dir;
      }
      // Blend rest→attack by reachF; horizontal also eases from forward to phase sign.
      const ua = uaAngle + (atkUa - uaAngle) * rf;
      const fa = faAngle + (atkFa - faAngle) * rf;
      const hx = dir + (hSign - dir) * rf;
      elbX  = shoulderX + hx * Math.sin(ua) * upperLen;
      elbY  = shoulderY + Math.cos(ua) * upperLen;
      handX = elbX + hx * Math.sin(fa) * foreLen;
      handY = elbY + Math.cos(fa) * foreLen;
    } else {
      elbX = elbXz; elbY = elbYz; handX = handXz; handY = handYz;
    }

    // ── Upper arm (suit sleeve) — tapered ribbon ──
    const _uw = lw * 0.6;
    _hdRibbon([{x:shoulderX,y:shoulderY,w:_uw*1.28},{x:(shoulderX+elbX)/2,y:(shoulderY+elbY)/2,w:_uw*1.02},{x:elbX,y:elbY,w:_uw*0.9}], ZC.edge);
    _hdRibbon([{x:shoulderX,y:shoulderY,w:_uw*1.08},{x:(shoulderX+elbX)/2,y:(shoulderY+elbY)/2,w:_uw*0.84},{x:elbX,y:elbY,w:_uw*0.72}], sleeveCol);
    if (!behind) _hdRibbon([{x:shoulderX+dir*1.4*S,y:shoulderY,w:_uw*0.42},{x:elbX+dir*1.1*S,y:elbY,w:_uw*0.28}], ZC.suitLit);

    // ── Forearm (rotting skin, sleeve torn off) — tapered ribbon ──
    const _fw = lw * 0.5;
    _hdRibbon([{x:elbX,y:elbY,w:_fw*1.15},{x:handX,y:handY,w:_fw*0.82}], ZC.edge);
    _hdRibbon([{x:elbX,y:elbY,w:_fw*0.95},{x:handX,y:handY,w:_fw*0.64}], skinCol);
    if (!behind) _hdRibbon([{x:elbX+dir*1.0*S,y:elbY,w:_fw*0.34},{x:handX+dir*0.8*S,y:handY,w:_fw*0.24}], ZC.skinLit);

    if (_immArm) {
      // Torn window exposing the ulna, plus a dark reattachment seam and staples.
      const _fa = Math.atan2(handY - elbY, handX - elbX);
      const _mx = elbX + (handX - elbX) * 0.48;
      const _my = elbY + (handY - elbY) * 0.48;
      ctx.save(); ctx.translate(_mx, _my); ctx.rotate(_fa);
      ctx.fillStyle = 'rgba(52,24,22,0.92)'; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.55*S;
      ctx.beginPath(); ctx.ellipse(0, 0, 4.4*S, 2.6*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ZC.bone;
      ctx.beginPath(); ctx.roundRect(-3.4*S, -0.75*S, 6.8*S, 1.5*S, 0.7*S); ctx.fill();
      ctx.strokeStyle = 'rgba(20,24,22,0.92)'; ctx.lineWidth = 0.75*S;
      ctx.beginPath(); ctx.moveTo(-0.2*S,-3.2*S); ctx.lineTo(0.2*S,3.2*S); ctx.stroke();
      ctx.strokeStyle = 'rgba(225,230,218,0.95)'; ctx.lineWidth = 0.50*S;
      for (const x of [-1.7,0,1.7]) {
        ctx.beginPath(); ctx.moveTo(x*S-0.6*S,-2.7*S); ctx.lineTo(x*S+0.6*S,2.7*S); ctx.stroke();
      }
      ctx.restore();
    }

    // Elbow joint
    ctx.fillStyle = sleeveCol; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.5 * S;
    ctx.beginPath(); ctx.arc(elbX, elbY, _uw * 0.82, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Hand — oval palm + carved thumb + knuckle groove (not a mitten)
    const _ha = Math.atan2(handY - elbY, handX - elbX);
    const _pa = _ha + dir * Math.PI / 2;
    ctx.fillStyle = skinCol; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.55 * S;
    ctx.beginPath(); ctx.ellipse(handX, handY, 3.2 * S, 2.5 * S, _ha, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(handX + Math.cos(_pa) * 2.3 * S - Math.cos(_ha) * 0.6 * S, handY + Math.sin(_pa) * 2.3 * S - Math.sin(_ha) * 0.6 * S, 1.5 * S, 1.0 * S, _ha, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(12,26,8,0.5)'; ctx.lineWidth = 0.4 * S; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handX + Math.cos(_ha) * 1.3 * S - Math.cos(_pa) * 2 * S, handY + Math.sin(_ha) * 1.3 * S - Math.sin(_pa) * 2 * S);
    ctx.lineTo(handX + Math.cos(_ha) * 1.3 * S + Math.cos(_pa) * 2 * S, handY + Math.sin(_ha) * 1.3 * S + Math.sin(_pa) * 2 * S); ctx.stroke();
    if (rf > 0.25) {
      // Attack claws — tapered, splayed from the knuckles
      const clawAngle = Math.atan2(handY - elbY, handX - elbX);
      for (let fi = -1; fi <= 1; fi++) {
        const ca = clawAngle + fi * 0.34;
        const bx = handX + Math.cos(clawAngle) * 1.6 * S, by = handY + Math.sin(clawAngle) * 1.6 * S;
        _hdRibbon([{ x: bx, y: by, w: 1.1 * S }, { x: bx + Math.cos(ca) * 5 * S * rf, y: by + Math.sin(ca) * 5 * S * rf, w: 0.2 * S }], skinCol);
      }
    } else if (!isDancing) {
      // Fingers follow forearm direction (droop/extend with beat)
      const fa = Math.atan2(handY - elbY, handX - elbX);
      ctx.strokeStyle = skinCol; ctx.lineWidth = 1.0 * S; ctx.lineCap = 'round';
      for (let fi = -1; fi <= 1; fi++) {
        const ca = fa + fi * 0.28;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + Math.cos(ca) * 5 * S, handY + Math.sin(ca) * 5 * S);
        ctx.stroke();
      }
    }
  }

  // ── Torso — rotting green body, tapered shoulders→waist→hips (not a box) ──
  const _torso = () => {
    ctx.beginPath();
    ctx.moveTo(sx(38), sy(30));
    ctx.bezierCurveTo(sx(33), sy(35), sx(35), sy(46), sx(39), sy(53));
    ctx.bezierCurveTo(sx(40), sy(59), sx(40), sy(63), sx(42), sy(66));
    ctx.lineTo(sx(58), sy(66));
    ctx.bezierCurveTo(sx(60), sy(63), sx(60), sy(59), sx(61), sy(53));
    ctx.bezierCurveTo(sx(65), sy(46), sx(67), sy(35), sx(62), sy(30));
    ctx.bezierCurveTo(sx(56), sy(27), sx(44), sy(27), sx(38), sy(30));
    ctx.closePath();
  };
  ctx.fillStyle = ZC.skinOcc; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 1.0 * S;
  _torso(); ctx.fill(); ctx.stroke();
  ctx.save(); _torso(); ctx.clip();
  // mid coat over most of the body
  ctx.fillStyle = ZC.skin;
  ctx.beginPath(); ctx.moveTo(sx(40),sy(30)); ctx.bezierCurveTo(sx(37),sy(42),sx(42),sy(58),sx(46),sy(66));
  ctx.lineTo(sx(60),sy(66)); ctx.bezierCurveTo(sx(62),sy(50),sx(64),sy(38),sx(60),sy(30)); ctx.closePath(); ctx.fill();
  // lit central column (chest→belly)
  const _tg = ctx.createLinearGradient(sx(40),0,sx(60),0);
  _tg.addColorStop(0, ZC.skinMid); _tg.addColorStop(0.5, ZC.skinLit); _tg.addColorStop(1, ZC.skinMid);
  ctx.fillStyle = _tg;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(46), 8.5*S, 15*S, 0, 0, Math.PI*2); ctx.fill();
  // gaunt rib shading
  ctx.strokeStyle = 'rgba(18,36,10,0.45)'; ctx.lineWidth = 0.8*S; ctx.lineCap='round';
  for (const ry of [41,46,51]) { ctx.beginPath(); ctx.moveTo(sx(44),sy(ry)); ctx.quadraticCurveTo(sx(50),sy(ry+1.6),sx(56),sy(ry)); ctx.stroke(); }
  ctx.restore();

  // ── Torn blue suit jacket — two tapered panels hugging the torso ──
  const jacketPanel = (m) => {          // m=-1 left, +1 right
    ctx.beginPath();
    ctx.moveTo(sx(50 - m*13), sy(30));
    ctx.bezierCurveTo(sx(50 - m*17), sy(35), sx(50 - m*15), sy(46), sx(50 - m*13), sy(54));
    ctx.lineTo(sx(50 - m*12), sy(59));                 // tattered hem
    ctx.lineTo(sx(50 - m*9.5), sy(55));
    ctx.lineTo(sx(50 - m*7.5), sy(60));
    ctx.lineTo(sx(50 - m*5),  sy(55));
    ctx.lineTo(sx(50 - m*3),  sy(59));
    ctx.lineTo(sx(50 - m*2),  sy(45));                 // up the front V
    ctx.lineTo(sx(50 - m*6),  sy(36));
    ctx.closePath();
  };
  for (const m of [-1, 1]) {
    ctx.fillStyle = ZC.suitOcc; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.8*S;
    jacketPanel(m); ctx.fill(); ctx.stroke();
    ctx.save(); jacketPanel(m); ctx.clip();
    const jg = ctx.createLinearGradient(sx(50 - m*15), sy(30), sx(50 - m*3), sy(58));
    jg.addColorStop(0, ZC.suitLit); jg.addColorStop(0.55, ZC.suit); jg.addColorStop(1, ZC.suitOcc);
    ctx.fillStyle = jg; jacketPanel(m); ctx.fill();
    ctx.fillStyle = 'rgba(120,160,230,0.22)';
    ctx.beginPath(); ctx.ellipse(sx(50 - m*11), sy(35), 4*S, 6*S, m*0.2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  // Lapels
  ctx.fillStyle = ZC.suitMid; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.5*S;
  for (const m of [-1,1]) {
    ctx.beginPath(); ctx.moveTo(sx(50 - m*6), sy(36)); ctx.lineTo(sx(50 - m*2), sy(45)); ctx.lineTo(sx(50 - m*4), sy(32)); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // Belt at the waist
  ctx.strokeStyle = ZC.trOcc; ctx.lineWidth = 1.6*S; ctx.lineCap='butt';
  ctx.beginPath(); ctx.moveTo(sx(41), sy(64)); ctx.lineTo(sx(59), sy(64)); ctx.stroke();
  ctx.fillStyle = '#9a9a86'; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.4*S;
  ctx.beginPath(); ctx.rect(sx(48), sy(62.5), 4*S, 3*S); ctx.fill(); ctx.stroke();

  // ── Red tie — pendulum secondary motion (lags the body → life) ──
  const _tieSway = Math.sin(unit._zmT * 1.5 + 0.7) * 1.4
                 + (dancing ? Math.sin(danceT + 0.5) * 1.9 : 0)
                 + (unit.state === 'move' ? Math.sin(unit._zmT * 1.7 + 1.0) * 1.4 : 0)
                 - wobble * 12
                 - (atkActive ? (lurchX / S) * 0.6 : 0);
  const _tsM = _tieSway * 0.55, _tsT = _tieSway;                 // mid vs tip
  ctx.fillStyle = ZC.tie; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.4 * S;
  ctx.beginPath();
  ctx.moveTo(sx(48), sy(36));
  ctx.lineTo(sx(52), sy(36));
  ctx.lineTo(sx(53 + _tsM), sy(52));
  ctx.lineTo(sx(50 + _tsT), sy(56));
  ctx.lineTo(sx(47 + _tsM), sy(52));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Tie sheen + shaded edge
  ctx.fillStyle = ZC.tieLit;
  ctx.beginPath(); ctx.moveTo(sx(48.6),sy(37)); ctx.lineTo(sx(49.8),sy(37)); ctx.lineTo(sx(50.6 + _tsM),sy(51)); ctx.lineTo(sx(49.4 + _tsT*0.9),sy(53)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = ZC.tieOcc;
  ctx.beginPath(); ctx.moveTo(sx(51.6),sy(37)); ctx.lineTo(sx(52),sy(37)); ctx.lineTo(sx(53 + _tsM),sy(52)); ctx.lineTo(sx(52 + _tsM),sy(52)); ctx.closePath(); ctx.fill();
  // Tie knot
  ctx.fillStyle = ZC.tieOcc;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(36), 2.4 * S, 1.7 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.3 * S; ctx.stroke();

  // ── Arms — a soft jacket cap wraps each arm root (shared helper) ──
  const beatFar = Math.max(0, Math.min(1, beatF - 0.18)); // far arm lags the beat
  const _zmCap = (shX, shY, lit) => {
    const _capScale = _zmImmortal ? (lit ? 1.34 : 1.10) : 1;
    ctx.fillStyle = 'rgba(8,16,34,0.4)';
    ctx.beginPath(); ctx.ellipse(sx(shX), sy(shY + 3.4), 2.8 * S * _capScale, 2.0 * S * _capScale, 0, 0, Math.PI * 2); ctx.fill();
    const _cg = ctx.createRadialGradient(sx(shX) - 1.6 * S, sy(shY) - 1.6 * S, 0.5 * S, sx(shX), sy(shY), 5.2 * S * _capScale);
    _cg.addColorStop(0, lit ? ZC.suitLit : ZC.suitMid);
    _cg.addColorStop(1, ZC.suit);
    ctx.fillStyle = _cg;
    ctx.beginPath(); ctx.ellipse(sx(shX), sy(shY), 4.8 * S * _capScale, 3.4 * S * _capScale, lit ? 0.22 : -0.22, 0, Math.PI * 2); ctx.fill();
    if (_zmImmortal && lit) {
      // Large grave-staples lock the replacement shoulder into the torso.
      ctx.strokeStyle = 'rgba(225,230,218,0.92)'; ctx.lineWidth = 0.65*S; ctx.lineCap='round';
      for (const off of [-2.2,0,2.2]) {
        ctx.beginPath();
        ctx.moveTo(sx(shX) + off*S - 1.2*S, sy(shY) - 3.2*S);
        ctx.lineTo(sx(shX) + off*S + 1.2*S, sy(shY) + 3.0*S);
        ctx.stroke();
      }
    }
  };
  // FAR arm — full raise, but it spreads to ITS OWN (far) side, so it stays clear
  // of the head and reads as the "behind" arm. Drawn before the head for depth;
  // the NEAR arm is drawn after the head so it stays in front.
  _zmArm(sx(dir > 0 ? 35 : 65), sy(34), bendL, -1, false, reachF, dancing, beatFar);
  _zmCap(dir > 0 ? 35 : 65, 34, false);
  // ── Waist occlusion: jacket hem casts a shadow onto the shirt/trousers ──
  ctx.fillStyle = 'rgba(8,14,30,0.4)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(60), 12 * S, 2.6 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Neck — rotting green cylinder, occluded into the collar ──
  ctx.fillStyle = ZC.skinOcc;
  ctx.beginPath(); ctx.moveTo(sx(45), sy(31)); ctx.lineTo(sx(45), sy(21)); ctx.lineTo(sx(55), sy(21)); ctx.lineTo(sx(55), sy(31)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = ZC.skinMid;
  ctx.beginPath(); ctx.moveTo(sx(46.5), sy(31)); ctx.lineTo(sx(46.5), sy(21)); ctx.lineTo(sx(53.5), sy(21)); ctx.lineTo(sx(53.5), sy(31)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.7 * S;
  ctx.beginPath(); ctx.moveTo(sx(45), sy(21)); ctx.lineTo(sx(45), sy(31)); ctx.moveTo(sx(55), sy(21)); ctx.lineTo(sx(55), sy(31)); ctx.stroke();
  // cast shadow of the jaw onto the neck + collar (kills the "pasted head" read)
  ctx.fillStyle = 'rgba(10,24,7,0.5)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(26.5), 6.8 * S, 2.8 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Branch marks ON the body (drawn on the exposed skin, under the head) ──
  const _zbBr = unit._branch || '';
  if (_zbBr === 'A') {
    // PLAGUE — swollen pustules with sickly yellow pus that CONTRAST the green
    // skin, several weeping infectious ooze down the body (contagion leaking out).
    const _boils = [[46, 51, 2.3], [54.5, 47, 1.9], [50, 30, 2.0], [43.5, 46, 1.6], [56, 52, 1.5]];
    for (const [px, py, pr] of _boils) {
      ctx.fillStyle = '#1e2e0c'; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.45 * S;   // dark swollen base
      ctx.beginPath(); ctx.arc(sx(px), sy(py), pr * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a6a1a';                                                          // mid ring
      ctx.beginPath(); ctx.arc(sx(px), sy(py), pr * 0.66 * S, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(224,230,120,0.95)';                                           // yellow-pus head
      ctx.beginPath(); ctx.arc(sx(px) - 0.3 * S, sy(py) - 0.3 * S, pr * 0.34 * S, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,220,0.7)';                                            // wet highlight
      ctx.beginPath(); ctx.arc(sx(px) - 0.6 * S, sy(py) - 0.6 * S, pr * 0.13 * S, 0, Math.PI * 2); ctx.fill();
    }
    // infectious ooze weeping from the lower boils
    for (const [dx, dy, dl] of [[46, 53.4, 5.0], [56, 53.6, 3.4], [43.5, 47.8, 3.0]]) {
      ctx.fillStyle = 'rgba(150,182,40,0.72)';
      ctx.beginPath();
      ctx.moveTo(sx(dx) - 0.9 * S, sy(dy));
      ctx.quadraticCurveTo(sx(dx) - 0.3 * S, sy(dy + dl * 0.6), sx(dx) - 0.2 * S, sy(dy + dl));
      ctx.quadraticCurveTo(sx(dx) + 0.9 * S, sy(dy + dl * 0.5), sx(dx) + 0.9 * S, sy(dy));
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(210,225,90,0.6)';                                             // droplet tip
      ctx.beginPath(); ctx.arc(sx(dx) - 0.15 * S, sy(dy + dl), 0.75 * S, 0, Math.PI * 2); ctx.fill();
    }
  } else if (_zbBr === 'B') {
    // IMMORTAL — a body stitched back together from lost limbs: heavy sutures at
    // each reattachment, and a socket of exposed bone where the rot ate through.
    const _seam = (xc, yc, hw, ang) => {
      ctx.save(); ctx.translate(sx(xc), sy(yc)); ctx.rotate(ang || 0);
      ctx.strokeStyle = 'rgba(12,20,20,0.82)'; ctx.lineWidth = 0.75 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-hw * S, 0); ctx.lineTo(hw * S, 0); ctx.stroke();       // dark seam line
      ctx.strokeStyle = 'rgba(226,232,234,0.95)'; ctx.lineWidth = 0.55 * S;               // cross-stitches
      const n = Math.max(2, Math.round(hw / 1.15));
      for (let k = -n; k <= n; k++) { const x = (k * hw / n) * S; ctx.beginPath(); ctx.moveTo(x - 0.95 * S, -1.7 * S); ctx.lineTo(x + 0.95 * S, 1.7 * S); ctx.stroke(); }
      ctx.restore();
    };
    _seam(50, 27, 4.6, 0);        // neck reattach
    _seam(48.5, 42, 3.6, 0.28);   // upper chest
    _seam(50, 52, 4.2, -0.14);    // lower torso
    // exposed bone poking through torn, rotted flesh
    ctx.save(); ctx.translate(sx(55), sy(46)); ctx.rotate(0.3);
    ctx.fillStyle = 'rgba(58,38,28,0.62)';                                                // torn-flesh socket
    ctx.beginPath(); ctx.ellipse(0, 0, 2.9 * S, 3.9 * S, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ZC.bone; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.5 * S;          // bone
    ctx.beginPath(); ctx.ellipse(0, 0, 1.9 * S, 2.9 * S, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,240,0.55)';                                             // bone highlight
    ctx.beginPath(); ctx.ellipse(-0.5 * S, -0.8 * S, 0.7 * S, 1.3 * S, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,120,100,0.5)'; ctx.lineWidth = 0.3 * S;                   // rib groove
    ctx.beginPath(); ctx.moveTo(0, -2.0 * S); ctx.lineTo(0, 2.0 * S); ctx.stroke();
    ctx.restore();
  }

  // ── Head ────────────────────────────────────────────────────
  const headR = 9.6 * S;
  const headX = sx(50);
  const headY = sy(18);
  const headTilt = dancing ? Math.sin(danceT * 0.7) * 0.08
                 : atkActive ? dir * atkHeadNod * 0.5
                 : dir * 0.24 + Math.sin(unit._zmT * 0.85 - 0.5) * 0.07; // forward hang + lag

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headTilt);

  // Head — rotting green skull with form shading (lit top-left → dark)
  const _hg = ctx.createRadialGradient(-headR * 0.35, -headR * 0.4, headR * 0.15, 0, 0, headR * 1.18);
  _hg.addColorStop(0, ZC.skinHi); _hg.addColorStop(0.45, ZC.skinMid); _hg.addColorStop(1, ZC.skinOcc);
  ctx.fillStyle = _hg; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.9 * S;
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // gaunt sunken cheek hollow
  ctx.fillStyle = 'rgba(18,38,10,0.42)';
  ctx.beginPath(); ctx.ellipse(dir * headR * 0.30, headR * 0.34, headR * 0.42, headR * 0.5, 0.2, 0, Math.PI * 2); ctx.fill();
  // jaw / lower-face shadow
  ctx.fillStyle = 'rgba(22,42,13,0.4)';
  ctx.beginPath(); ctx.arc(0, headR * 0.35, headR * 0.82, 0.12 * Math.PI, 0.88 * Math.PI); ctx.fill();
  // Trump spray-tan: lighter forehead (white-out center), orange cheeks
  ctx.fillStyle = 'rgba(255,240,190,0.18)';
  ctx.beginPath(); ctx.ellipse(0, -5.5 * S, 5.5 * S, 2.8 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200,100,15,0.22)';
  ctx.beginPath(); ctx.ellipse( dir * 4.2 * S, 2.0 * S, 3.2 * S, 2.6 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-dir * 3.8 * S, 2.2 * S, 2.6 * S, 2.2 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Trump combover ──────────────────────────────────────────
  const R = headR;
  const hBase = '#b89018';  // shadow layer
  const hMain = '#d4aa28';  // main mass (brassy gold)
  const hLigh = '#eed84a';  // highlight
  const hWisp = '#a87c10';  // comb lines

  // Pompadour secondary jiggle — springy hair lags the head bob
  const hairJiggle = Math.sin(unit._zmT * 2.3 + 1.5) * 0.055
                   + (dancing ? Math.sin(danceT + 0.3) * 0.06 : 0)
                   + headTilt * 0.18
                   - (atkActive ? atkHeadNod * 0.35 : 0);
  ctx.save();
  ctx.translate(0, R * 0.25); ctx.rotate(hairJiggle); ctx.translate(0, -R * 0.25);

  // Layer 1: back base — thin coverage behind the swoop
  ctx.fillStyle = hBase; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo(-dir * R * 0.85, R * 0.05);
  ctx.bezierCurveTo(-dir * R * 0.95, -R * 0.55, -dir * R * 0.45, -R * 0.95, 0, -R * 0.92);
  ctx.bezierCurveTo( dir * R * 0.3,  -R * 0.88,  dir * R * 0.6,  -R * 0.65,  dir * R * 0.6, -R * 0.35);
  ctx.bezierCurveTo( dir * R * 0.3,  -R * 0.28, -dir * R * 0.25, -R * 0.32, -dir * R * 0.72, R * 0.08);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Layer 2: main combover — sweeps from back-low over the crown
  ctx.fillStyle = hMain; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.65 * S;
  ctx.beginPath();
  ctx.moveTo(-dir * R * 0.75, -R * 0.12);
  ctx.bezierCurveTo(-dir * R * 0.90, -R * 0.90, -dir * R * 0.2, -R * 1.32, dir * R * 0.18, -R * 1.32);
  ctx.bezierCurveTo( dir * R * 0.62, -R * 1.30,  dir * R * 1.0,  -R * 1.00,  dir * R * 1.05, -R * 0.62);
  ctx.bezierCurveTo( dir * R * 1.0,  -R * 0.30,  dir * R * 0.72, -R * 0.12,  dir * R * 0.52, -R * 0.08);
  ctx.bezierCurveTo( dir * R * 0.18, -R * 0.18, -dir * R * 0.22, -R * 0.30, -dir * R * 0.75, -R * 0.12);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Layer 3: front "flip" — the signature upswept curl at the front
  ctx.fillStyle = hMain; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo( dir * R * 0.68, -R * 0.55);
  ctx.bezierCurveTo( dir * R * 1.08, -R * 0.58,  dir * R * 1.20, -R * 0.28,  dir * R * 1.10, -R * 0.02);
  ctx.bezierCurveTo( dir * R * 1.02,  R * 0.10,  dir * R * 0.85,  R * 0.08,  dir * R * 0.78, -R * 0.05);
  ctx.bezierCurveTo( dir * R * 0.74, -R * 0.22,  dir * R * 0.72, -R * 0.40,  dir * R * 0.68, -R * 0.55);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Highlight streak along the top of the swoop
  ctx.fillStyle = 'rgba(255,240,130,0.52)';
  ctx.beginPath();
  ctx.moveTo(-dir * R * 0.32, -R * 1.00);
  ctx.bezierCurveTo( dir * R * 0.08, -R * 1.26,  dir * R * 0.52, -R * 1.20,  dir * R * 0.74, -R * 0.88);
  ctx.bezierCurveTo( dir * R * 0.46, -R * 0.96,  dir * R * 0.08, -R * 1.12, -dir * R * 0.32, -R * 1.00);
  ctx.closePath(); ctx.fill();

  // Comb sweep lines
  ctx.strokeStyle = hWisp; ctx.lineWidth = 0.45 * S; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-dir*R*0.55,-R*0.48); ctx.bezierCurveTo(-dir*R*0.50,-R*0.92, dir*R*0.12,-R*1.18, dir*R*0.58,-R*0.92); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-dir*R*0.38,-R*0.58); ctx.bezierCurveTo(-dir*R*0.20,-R*1.00, dir*R*0.30,-R*1.20, dir*R*0.68,-R*0.88); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-dir*R*0.18,-R*0.68); ctx.bezierCurveTo( dir*R*0.05,-R*1.08, dir*R*0.46,-R*1.18, dir*R*0.74,-R*0.72); ctx.stroke();

  // Flyaway wisps — the loose Trump strands
  ctx.strokeStyle = hLigh; ctx.lineWidth = 0.40 * S;
  ctx.beginPath(); ctx.moveTo( dir*R*0.60,-R*1.06); ctx.quadraticCurveTo( dir*R*0.85,-R*1.24, dir*R*0.72,-R*1.04); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( dir*R*0.40,-R*1.14); ctx.quadraticCurveTo( dir*R*0.66,-R*1.32, dir*R*0.56,-R*1.10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-dir*R*0.08,-R*1.18); ctx.quadraticCurveTo( dir*R*0.18,-R*1.40, dir*R*0.30,-R*1.20); ctx.stroke();

  ctx.restore(); // end pompadour jiggle

  // Sideburns (short — not Elvis, just Trump)
  ctx.fillStyle = hMain; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.4 * S;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(side * R * 0.82, R * 0.05);
    ctx.bezierCurveTo(side * R * 0.88, R * 0.12, side * R * 0.88, R * 0.24, side * R * 0.82, R * 0.28);
    ctx.lineTo(side * R * 0.68, R * 0.20);
    ctx.bezierCurveTo(side * R * 0.72, R * 0.12, side * R * 0.70, R * 0.05, side * R * 0.68, R * 0.05);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });

  // ── Eyes (sunken, yellow-green) ─────────────────────────────
  const eyeL = -4.5 * S * dir;
  const eyeR2 = 4.5 * S * dir;
  const eyeBaseY = -0.5 * S;
  // Eye sockets
  ctx.fillStyle = 'rgba(20,40,10,0.5)';
  ctx.beginPath(); ctx.ellipse(eyeL, eyeBaseY, 3.5 * S, 3 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(eyeR2, eyeBaseY, 3.3 * S, 2.8 * S, 0.1, 0, Math.PI * 2); ctx.fill();
  // Irises
  ctx.fillStyle = '#aacc00'; ctx.shadowColor = '#aacc00'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(eyeL, eyeBaseY, 2.4 * S, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeR2, eyeBaseY, 2.2 * S, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Pupils
  ctx.fillStyle = '#0a1a04';
  ctx.beginPath(); ctx.arc(eyeL + dir * S, eyeBaseY, 1.2 * S, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeR2 + dir * 0.7 * S, eyeBaseY + 0.3 * S, 1 * S, 0, Math.PI * 2); ctx.fill();
  // Shine
  ctx.fillStyle = 'rgba(255,255,200,0.5)';
  ctx.beginPath(); ctx.arc(eyeL - 0.5 * S, eyeBaseY - S, 0.6 * S, 0, Math.PI * 2); ctx.fill();

  // ── Trump brows — near=raised skeptical arch, far=level/slight furrow ─
  ctx.strokeStyle = '#18260a'; ctx.lineWidth = 2.0 * S; ctx.lineCap = 'round';
  const browBaseY = eyeBaseY - 3.4 * S;
  // Near brow (eyeR2): strongly raised outer → "Can you believe this?"
  ctx.beginPath();
  ctx.moveTo(eyeR2 - dir * 2.8 * S, browBaseY + 0.8 * S);   // inner: slightly down
  ctx.quadraticCurveTo(eyeR2, browBaseY - 1.8 * S,           // peak: up high
                       eyeR2 + dir * 2.4 * S, browBaseY - 2.6 * S); // outer: very high
  ctx.stroke();
  // Far brow (eyeL): flatter, slight inner furrow
  ctx.beginPath();
  ctx.moveTo(eyeL - dir * 2.2 * S, browBaseY - 0.4 * S);    // outer: moderate height
  ctx.quadraticCurveTo(eyeL, browBaseY - 0.8 * S,            // slight arch
                       eyeL + dir * 2.8 * S, browBaseY + 1.0 * S); // inner: lower = concerned
  ctx.stroke();

  // ── Nose ────────────────────────────────────────────────────
  ctx.fillStyle = '#3a5a20';
  ctx.beginPath(); ctx.ellipse(dir * 1.5 * S, 3.5 * S, 1.5 * S, 1 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Mouth — Trump duck lips pout ─────────────────────────────
  const mouthOpen = ap > 0 ? (ap < 0.4 ? ap / 0.4 : (ap < 0.6 ? 1 : 1 - (ap - 0.6) / 0.4))
                   : (dancing ? 0.3 + Math.sin(danceT) * 0.15 : 0);
  const mLine = 6.2 * S;                 // lip separation line Y
  const mBot  = mLine + 2.0 * S + mouthOpen * 2.5 * S; // bottom of lower lip (pout)

  // Mouth void when open
  if (mouthOpen > 0.06) {
    ctx.fillStyle = 'rgba(8, 3, 3, 0.96)';
    ctx.beginPath();
    ctx.ellipse(dir * 0.3 * S, mLine + mouthOpen * 1.2 * S,
                3.2 * S * (0.5 + mouthOpen * 0.5), 1.8 * S * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    // 3 front teeth visible in open pout
    ctx.fillStyle = '#c5b862'; ctx.strokeStyle = '#181206'; ctx.lineWidth = 0.3 * S;
    [[-1.9, 0.66, 1.2], [0.1, 0.72, 1.5], [1.8, 0.60, 1.1]].forEach(([tx, tw, th]) => {
      const fa = mouthOpen;
      ctx.beginPath();
      ctx.moveTo(tx * S - tw * S * 0.5, mLine + 0.1 * S);
      ctx.lineTo(tx * S,                mLine + 0.1 * S + th * S * fa);
      ctx.lineTo(tx * S + tw * S * 0.5, mLine + 0.1 * S);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }

  // Upper lip — Cupid's bow / M-shape (pursed pout)
  ctx.fillStyle = '#4a7228'; ctx.strokeStyle = '#0d0c04'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo(-3.8 * S, mLine);                                             // left corner
  ctx.bezierCurveTo(-3.2 * S, 5.0 * S, -1.8 * S, 4.6 * S, -0.8 * S, 5.2 * S); // left arch of M
  ctx.quadraticCurveTo(0, 5.6 * S, 0.8 * S, 5.2 * S);                    // M center dip
  ctx.bezierCurveTo( 1.8 * S, 4.6 * S,  3.2 * S, 5.0 * S,  3.8 * S, mLine);   // right arch
  ctx.quadraticCurveTo(0, mLine + 1.0 * S, -3.8 * S, mLine);              // bottom of upper lip
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Lower lip — fat rounded pout
  ctx.fillStyle = '#527a30';
  ctx.beginPath();
  ctx.moveTo(-3.6 * S, mLine + 0.3 * S);                                  // left edge
  ctx.bezierCurveTo(-3.6 * S, mBot, 3.6 * S, mBot, 3.6 * S, mLine + 0.3 * S); // rounded bottom
  ctx.quadraticCurveTo(0, mLine + 1.2 * S, -3.6 * S, mLine + 0.3 * S);   // close top
  ctx.closePath(); ctx.fill();
  // Lip sheen highlight on lower lip
  ctx.fillStyle = 'rgba(130,170,80,0.30)';
  ctx.beginPath(); ctx.ellipse(dir * 0.4 * S, mBot - 1.0 * S, 1.6 * S, 0.6 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Branch marks on the face (in head-local space, so they follow head tilt) ──
  if (_zbBr === 'A') {
    // infectious green drool weeping from the mouth corner
    ctx.fillStyle = 'rgba(150,185,40,0.82)';
    ctx.beginPath();
    ctx.moveTo(dir * 2.6 * S, mLine + 1.2 * S);
    ctx.quadraticCurveTo(dir * 3.1 * S, mBot + 3.4 * S, dir * 2.4 * S, mBot + 5.4 * S);
    ctx.quadraticCurveTo(dir * 1.9 * S, mBot + 3.0 * S, dir * 1.9 * S, mLine + 1.4 * S);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(205,225,90,0.7)';
    ctx.beginPath(); ctx.arc(dir * 2.35 * S, mBot + 5.2 * S, 0.85 * S, 0, Math.PI * 2); ctx.fill();
    // a pustule spreading onto the far cheek
    ctx.fillStyle = '#1e2e0c'; ctx.strokeStyle = ZC.edge; ctx.lineWidth = 0.4 * S;
    ctx.beginPath(); ctx.arc(-dir * 3.4 * S, 3.6 * S, 1.7 * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(224,230,120,0.92)';
    ctx.beginPath(); ctx.arc(-dir * 3.6 * S, 3.3 * S, 0.7 * S, 0, Math.PI * 2); ctx.fill();
  } else if (_zbBr === 'B') {
    // fresh blood from corpse-eating — smeared round the mouth, dripping off the chin
    ctx.fillStyle = 'rgba(122,20,18,0.72)';
    ctx.beginPath(); ctx.ellipse(0, mLine + 2.4 * S, 4.4 * S, 2.5 * S, 0, 0, Math.PI * 2); ctx.fill();
    for (const [bx, bl] of [[-2.4, 4.2], [1.4, 5.4], [3.0, 3.2]]) {
      ctx.beginPath();
      ctx.moveTo(bx * S - 0.7 * S, mBot + 0.4 * S);
      ctx.quadraticCurveTo(bx * S, mBot + bl * 0.6 * S, bx * S, mBot + bl * S);
      ctx.quadraticCurveTo(bx * S + 0.7 * S, mBot + bl * 0.5 * S, bx * S + 0.7 * S, mBot + 0.4 * S);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(185,45,38,0.6)';                                                // wet sheen
    ctx.beginPath(); ctx.ellipse(-dir * 1.0 * S, mLine + 1.8 * S, 1.7 * S, 0.85 * S, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore(); // head transform

  // ── NEAR (leading) arm — drawn last so the overhead raise/slam stays IN FRONT
  //    of the head. It reaches away from the head, so it never covers the face. ──
  _zmArm(sx(dir > 0 ? 65 : 35), sy(38), bendR, 1, false, reachF, dancing, beatF);
  _zmCap(dir > 0 ? 65 : 35, 38, true);

  ctx.restore(); // wobble transform

  // ── Branch visuals ──────────────────────────────────────────
  const _zmBranch = unit._branch || '';
  if (_zmBranch === 'A') {
    // ── PLAGUE — a thick toxic miasma clinging to the body, a low gas pool
    //    pooling at the feet, rising spores, and a small swarm of flies ──
    const _t = _frameNow * 0.001;
    const _pulse = 0.5 + 0.5 * Math.sin(_t * 1.6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // body miasma
    const mg = ctx.createRadialGradient(cx, fY - s * 0.85, s * 0.05, cx, fY - s * 0.85, s * 0.78);
    mg.addColorStop(0, `rgba(180,205,45,${(0.15 + _pulse * 0.09).toFixed(3)})`);
    mg.addColorStop(0.6, `rgba(150,178,30,${(0.075 + _pulse * 0.045).toFixed(3)})`);
    mg.addColorStop(1, 'rgba(150,178,30,0)');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.ellipse(cx, fY - s * 0.85, s * 0.78, s * 0.98, 0, 0, Math.PI * 2); ctx.fill();
    // low toxic gas pool creeping along the ground
    const gp = ctx.createRadialGradient(cx, fY - s * 0.02, s * 0.05, cx, fY - s * 0.02, s * 0.62);
    gp.addColorStop(0, `rgba(140,170,30,${(0.10 + _pulse * 0.05).toFixed(3)})`);
    gp.addColorStop(1, 'rgba(140,170,30,0)');
    ctx.fillStyle = gp;
    ctx.beginPath(); ctx.ellipse(cx, fY - s * 0.02, s * 0.62, s * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // rising spores
    for (let i = 0; i < 7; i++) {
      const _p = ((_t * 0.5 + i * 0.15) % 1);
      const _sx2 = cx + Math.sin(_t * 1.2 + i * 1.7) * s * 0.32 + (i - 3) * s * 0.06;
      const _sy2 = fY - s * 0.4 - _p * s * 1.2;
      const _sa = (1 - _p) * (0.45 + Math.sin(_t * 3 + i) * 0.15);
      ctx.fillStyle = `rgba(205,220,70,${_sa.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(_sx2, _sy2, s * (0.014 + (i % 3) * 0.005), 0, Math.PI * 2); ctx.fill();
    }
    // a small swarm of flies buzzing tight orbits around the corpse
    for (let f = 0; f < 3; f++) {
      const _fa = _t * (2.6 + f * 0.7) + f * 2.1;
      const _fcx = cx + dir * s * (0.24 - f * 0.14);
      const _fcy = fY - s * (1.30 - f * 0.42);
      const _fx = _fcx + Math.cos(_fa) * s * (0.12 + f * 0.03);
      const _fy = _fcy + Math.sin(_fa * 1.3) * s * (0.06 + f * 0.02);
      ctx.fillStyle = 'rgba(12,12,12,0.82)';
      ctx.beginPath(); ctx.arc(_fx, _fy, s * 0.014, 0, Math.PI * 2); ctx.fill();
    }

  } else if (_zmBranch === 'B') {
    // ── IMMORTAL — no pretty glow. A low, murky necrotic haze pools at its feet,
    //    and bone-white sparks flicker close against the body: the death-energy
    //    knitting the corpse back together, refusing to let it die. ──
    const _t = _frameNow / 1000;
    const _p = 0.5 + 0.4 * Math.sin(_t * 1.5) + 0.1 * Math.sin(_t * 4.1);
    // dark necrotic ground haze (multiply-ish: a dim murk, not a glow)
    ctx.save();
    const ng = ctx.createRadialGradient(cx, fY - s * 0.05, s * 0.05, cx, fY - s * 0.05, s * 0.66);
    ng.addColorStop(0, 'rgba(28,40,30,0.5)');
    ng.addColorStop(0.7, 'rgba(24,34,28,0.22)');
    ng.addColorStop(1, 'rgba(24,34,28,0)');
    ctx.fillStyle = ng;
    ctx.beginPath(); ctx.ellipse(cx, fY - s * 0.05, s * 0.66, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // bone-white "revival" sparks flickering against the torso/wounds
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const _sparks = [[0.10, -0.95], [-0.16, -0.70], [0.20, -0.55], [-0.06, -1.15], [0.02, -0.40]];
    for (let i = 0; i < _sparks.length; i++) {
      const flick = Math.max(0, Math.sin(_t * 3.2 + i * 1.9)) * (0.6 + 0.4 * Math.sin(_t * 7 + i));
      if (flick < 0.05) continue;
      const _mx = cx + _sparks[i][0] * s + Math.sin(_t * 2 + i) * s * 0.02;
      const _my = fY + _sparks[i][1] * s;
      const r = s * (0.02 + flick * 0.02);
      const sg = ctx.createRadialGradient(_mx, _my, 0, _mx, _my, r * 3);
      sg.addColorStop(0, `rgba(225,235,225,${(0.6 * flick).toFixed(3)})`);
      sg.addColorStop(1, 'rgba(200,220,210,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(_mx, _my, r * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(240,245,235,${(0.85 * flick).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(_mx, _my, r * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore(); // main save
}

// ═══════════════════════════════════════════════════════════════════════════
//  SPIRIT — chibi ghost (level 5, ability: scare)
//  Teardrop dome + 3-scallop wavy tail, fin-arms, cute↔scary face toggle
//  Float: sine bob, tilt in move direction, tail lags
//  Attack: pull back → lunge → hollow eyes + void mouth + fangs → snap back
// ═══════════════════════════════════════════════════════════════════════════
function drawSpiritMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._spT === undefined) {
    unit._spT      = Math.random() * Math.PI * 2;
    unit._spDir    = 1;
    unit._spAtkP   = 0;
    unit._spPrevCd = unit.attackCooldown || 0;
    unit._spPrevX  = unit.x;
    unit._spLastT  = _frameNow;
  }
  const dt = Math.min((_frameNow - unit._spLastT) / 1000, 0.05);
  unit._spLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._spDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._spPrevX) > 0.2) {
    unit._spDir = unit.x > unit._spPrevX ? 1 : -1;
  }
  unit._spPrevX = unit.x;
  const dir = unit._spDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._spPrevCd || 0) + 3) unit._spAtkP = 0.01;
  unit._spPrevCd = acd;
  if (unit._spAtkP > 0) { unit._spAtkP += dt / 0.85; if (unit._spAtkP >= 1) unit._spAtkP = 0; }

  unit._spT += dt * (unit.state === 'move' ? 2.5 : 1.2);
  const ap = unit._spAtkP;
  const atkActive = ap > 0;

  // Float bob + travel tilt
  const bob  = Math.sin(unit._spT * 1.0) * s * 0.07;
  const tilt = unit.state === 'move' ? dir * 0.12 : Math.sin(unit._spT * 0.5) * 0.04;

  // Attack phases: pull back → lunge → recover
  let lungeX = 0, scareF = 0, squashX = 1, stretchY = 1;
  if (atkActive) {
    if (ap < 0.18) {
      const t = ap / 0.18, ef = t * t;
      lungeX   = -dir * ef * s * 0.10;
      scareF   = ef * 0.5;
      squashX  = 1 - ef * 0.10;
      stretchY = 1 + ef * 0.08;
    } else if (ap < 0.50) {
      const t = (ap - 0.18) / 0.32, ef = t * t;
      lungeX   = dir * ef * s * 0.26;
      scareF   = 0.5 + ef * 0.5;
      squashX  = 1 + ef * 0.14;
      stretchY = 1 - ef * 0.09;
    } else {
      const t = (ap - 0.50) / 0.50, ef = t * t * (3 - 2 * t);
      lungeX   = dir * (1 - ef) * s * 0.26;
      scareF   = 1 - ef;
      squashX  = 1 + (1 - ef) * 0.14;
      stretchY = 1 - (1 - ef) * 0.09;
    }
  }

  const bodyX = cx + lungeX;
  const bodyY = fY - s * 0.62 - bob;
  const bR    = s * 0.34 * squashX;
  const bRy   = s * 0.34 * stretchY;

  unit._hpBarY = bodyY - bRy - 12;

  ctx.save();

  // Body tilt transform
  ctx.translate(bodyX, bodyY);
  ctx.rotate(tilt);
  ctx.translate(-bodyX, -bodyY);

  // Glow
  ctx.shadowColor = atkActive && scareF > 0.3
    ? `rgba(180,210,255,${scareF * 0.85})`
    : 'rgba(180,210,255,0.45)';
  ctx.shadowBlur = atkActive && scareF > 0.3 ? 18 * scareF : 7;

  ctx.globalAlpha *= (0.80 + 0.12 * Math.sin(unit._spT * 1.3));

  // ── Ghost body (dome + 3-scallop skirt) ─────────────────────
  const bodyR = Math.round(200 + scareF * 20);
  const bodyG = Math.round(218 + scareF * 10);
  ctx.fillStyle = `rgb(${bodyR},${bodyG},255)`;

  // Scallop wave offsets (each tail moves independently)
  const tw1 = Math.sin(unit._spT * 1.3 + 1.2) * bR * 0.16;
  const tw2 = Math.sin(unit._spT * 1.1 + 2.8) * bR * 0.14;
  const tw3 = Math.sin(unit._spT * 1.5 + 0.4) * bR * 0.12;
  const tailBot = bodyY + bRy * 0.25 + bR * 1.15;
  const valH    = bR * 0.26;

  ctx.beginPath();
  ctx.arc(bodyX, bodyY, bR, Math.PI, 0); // dome: left→right
  // Right side curves down into right scallop
  ctx.bezierCurveTo(bodyX + bR,       bodyY + bRy * 0.6,
                    bodyX + bR * 0.82, tailBot - valH + tw3,
                    bodyX + bR * 0.54, tailBot + tw3);
  // Rise to valley, drop to center scallop
  ctx.quadraticCurveTo(bodyX + bR * 0.25, tailBot - valH + tw2,
                       bodyX,              tailBot + bR * 0.12 + tw2);
  // Rise to valley, drop to left scallop
  ctx.quadraticCurveTo(bodyX - bR * 0.25, tailBot - valH + tw1,
                       bodyX - bR * 0.54, tailBot + tw1);
  // Left side curves back up to body
  ctx.bezierCurveTo(bodyX - bR * 0.82, tailBot - valH + tw1,
                    bodyX - bR,        bodyY + bRy * 0.6,
                    bodyX - bR,        bodyY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Highlight (soft upper-left rim)
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(bodyX - bR * 0.22, bodyY - bRy * 0.24, bR * 0.48, bRy * 0.36, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Fin-arms ─────────────────────────────────────────────────
  const armSwing    = Math.sin(unit._spT * 1.0 + 0.6) * 0.14;
  const atkSpread   = atkActive ? scareF * dir * s * 0.10 : 0;
  ctx.strokeStyle   = 'rgba(200,220,255,0.68)';
  ctx.lineWidth     = s * 0.052;
  ctx.lineCap       = 'round';

  // Near arm (toward enemy)
  const na1x = bodyX + dir * bR * 0.80, na1y = bodyY - bRy * 0.04;
  const na2x = na1x + dir * s * 0.20 + atkSpread;
  const na2y = na1y + s * 0.10 + armSwing * s;
  ctx.beginPath();
  ctx.moveTo(na1x, na1y);
  ctx.quadraticCurveTo((na1x + na2x) / 2, na1y + s * 0.05, na2x, na2y);
  ctx.stroke();

  // Far arm
  const fa1x = bodyX - dir * bR * 0.80, fa1y = bodyY + bRy * 0.01;
  const fa2x = fa1x - dir * s * 0.18 - atkSpread * 0.5;
  const fa2y = fa1y + s * 0.12 - armSwing * s;
  ctx.beginPath();
  ctx.moveTo(fa1x, fa1y);
  ctx.quadraticCurveTo((fa1x + fa2x) / 2, fa1y + s * 0.04, fa2x, fa2y);
  ctx.stroke();

  // ── Eyes ─────────────────────────────────────────────────────
  const eyeSpX = bR * 0.30;
  const eyeY   = bodyY - bRy * 0.08;
  const eyeRx  = bR * 0.165;
  const eyeRy  = bR * 0.195;

  // Blink timer
  const bct   = (unit._spT * 0.38) % (Math.PI * 2);
  const blink = bct > Math.PI * 1.88 ? Math.sin((bct - Math.PI * 1.88) / 0.14 * Math.PI) : 0;

  [-1, 1].forEach(side => {
    const ex = bodyX + side * eyeSpX;

    if (atkActive && scareF > 0.45) {
      // Hollow black void eyes with faint glow rim
      ctx.shadowColor = `rgba(180,220,255,${scareF * 0.8})`;
      ctx.shadowBlur  = 6 * scareF;
      ctx.fillStyle   = 'rgba(10,15,40,0.96)';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeRx * (1 + scareF * 0.55), eyeRy * (1.2 + scareF * 0.65), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Tiny pale pupil dot
      ctx.fillStyle = `rgba(160,210,255,${scareF * 0.65})`;
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeRx * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // V-brow
      ctx.strokeStyle = `rgba(190,225,255,${scareF * 0.80})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(ex - eyeRx * 0.9, eyeY - eyeRy * 1.05 - 2 - side * 3 * scareF);
      ctx.lineTo(ex + eyeRx * 0.9, eyeY - eyeRy * 1.05 - 2 + side * 3 * scareF);
      ctx.stroke();
    } else {
      // Cute dark oval + white highlight
      const eh = eyeRy * Math.max(0.06, 1 - blink);
      ctx.fillStyle = 'rgba(20,28,70,0.93)';
      ctx.beginPath();
      ctx.ellipse(ex + dir * eyeRx * 0.14, eyeY, eyeRx, eh, 0, 0, Math.PI * 2);
      ctx.fill();
      if (blink < 0.75) {
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.beginPath();
        ctx.arc(ex - eyeRx * 0.25 + dir * eyeRx * 0.14, eyeY - eh * 0.28, eyeRx * 0.30, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // ── Scary mouth ───────────────────────────────────────────────
  if (atkActive && scareF > 0.50) {
    const mf     = (scareF - 0.50) / 0.50;
    const mouthY = eyeY + eyeRy * 2.6;
    const mW     = bR * 0.44 * mf;
    const mH     = bR * 0.30 * mf;
    ctx.shadowColor = 'rgba(150,200,255,0.45)';
    ctx.shadowBlur  = 5 * mf;
    ctx.fillStyle   = 'rgba(8,12,35,0.96)';
    ctx.beginPath();
    ctx.ellipse(bodyX, mouthY, mW, mH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (mf > 0.40) {
      ctx.fillStyle = 'rgba(230,240,255,0.88)';
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(bodyX + side * mW * 0.36, mouthY - mH * 0.15);
        ctx.lineTo(bodyX + side * mW * 0.50, mouthY + mH * 0.55);
        ctx.lineTo(bodyX + side * mW * 0.22, mouthY + mH * 0.55);
        ctx.closePath();
        ctx.fill();
      });
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _spBranch = unit._branch || '';
  ctx.shadowBlur = 0;
  if (_spBranch === 'A') {
    // ── UNQUIET — a raging, vengeful spirit that spreads panic: an angry red
    //    aura pulses fast, erratic energy lashes out in jagged forks, and tiny
    //    tormented faces peel off it (the madness it inflicts on the living). ──
    const _t = _frameNow * 0.001;
    const _pulse = 0.5 + 0.5 * Math.sin(_t * 3.4);           // fast, agitated throb
    // red rage halo
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(bodyX, bodyY - bRy * 0.1, bR * 0.3, bodyX, bodyY - bRy * 0.1, bR * 1.55);
    rg.addColorStop(0, `rgba(232,38,30,${(0.16 + _pulse * 0.13).toFixed(3)})`);
    rg.addColorStop(0.55, `rgba(190,12,12,${(0.07 + _pulse * 0.05).toFixed(3)})`);
    rg.addColorStop(1, 'rgba(190,12,12,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.ellipse(bodyX, bodyY - bRy * 0.1, bR * 1.55, bRy * 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // erratic jagged crackles forking outward (panic energy, never smooth)
    ctx.strokeStyle = `rgba(255,68,56,${(0.6 + _pulse * 0.3).toFixed(3)})`; ctx.lineWidth = 2.1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 5; i++) {
      const _a = _t * 1.8 + i * (Math.PI * 2 / 5);
      let rr = bR * 0.9;
      let px = bodyX + Math.cos(_a) * rr, py = bodyY + Math.sin(_a) * rr * 0.62;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 0; k < 3; k++) {
        rr += bR * 0.24;
        const jit = (Math.sin(_t * 7 + i * 5 + k * 11) ) * 0.32;
        const aa = _a + jit;
        px = bodyX + Math.cos(aa) * rr; py = bodyY + Math.sin(aa) * rr * 0.62;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // tormented little screaming faces swirling off the spirit
    for (let i = 0; i < 2; i++) {
      const _a = _t * 1.5 + i * Math.PI;
      const wx = bodyX + Math.cos(_a) * bR * 1.2;
      const wy = bodyY - bRy * 0.25 + Math.sin(_a) * bRy * 0.85;
      const wr = s * 0.055;
      ctx.fillStyle = `rgba(255,150,140,${(0.42 + _pulse * 0.22).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(wx - wr, wy);
      ctx.bezierCurveTo(wx - wr, wy - wr * 1.5, wx + wr, wy - wr * 1.5, wx + wr, wy);
      ctx.bezierCurveTo(wx + wr, wy + wr * 0.9, wx - wr, wy + wr * 0.9, wx - wr, wy);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(70,0,0,0.8)';                     // hollow anguished eyes + wailing mouth
      ctx.beginPath(); ctx.arc(wx - wr * 0.38, wy - wr * 0.28, wr * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx + wr * 0.38, wy - wr * 0.28, wr * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(wx, wy + wr * 0.35, wr * 0.22, wr * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (_spBranch === 'B') {
    // ── PRANKSTER — a mischief spirit wearing a jester's motley cap with bells,
    //    trailing a spiral of teleport twinkles (it blinks heroes across the
    //    dungeon for its own amusement). ──
    const _t = _frameNow * 0.0025;
    // teleport twinkles — violet/cyan/pink diamonds spiralling around it
    const _cols = ['#c060ff', '#5ad0ff', '#ff78e0'];
    for (let i = 0; i < 7; i++) {
      const _a = _t * 2.0 + i * (Math.PI * 2 / 7);
      const _rad = bR * (1.05 + 0.32 * Math.sin(_t * 1.6 + i * 1.3));
      const _px = bodyX + Math.cos(_a) * _rad;
      const _py = bodyY - bRy * 0.05 + Math.sin(_a) * bRy * 0.85;
      const tw = s * 0.03 * (0.55 + 0.5 * Math.sin(_t * 4 + i * 2));
      if (tw < s * 0.008) continue;
      ctx.fillStyle = _cols[i % 3];
      ctx.beginPath();                                         // 4-point twinkle
      ctx.moveTo(_px, _py - tw * 2); ctx.lineTo(_px + tw * 0.55, _py - tw * 0.55);
      ctx.lineTo(_px + tw * 2, _py); ctx.lineTo(_px + tw * 0.55, _py + tw * 0.55);
      ctx.lineTo(_px, _py + tw * 2); ctx.lineTo(_px - tw * 0.55, _py + tw * 0.55);
      ctx.lineTo(_px - tw * 2, _py); ctx.lineTo(_px - tw * 0.55, _py - tw * 0.55);
      ctx.closePath(); ctx.fill();
    }
    // ── Jester's cap on the crown (bells jingle with a springy lag) ──
    ctx.save();
    ctx.globalAlpha = Math.min(1, ctx.globalAlpha + 0.35);    // cap reads more solid than the ghost
    const jig = Math.sin(unit._spT * 2.0) * 0.10;             // springy bell sway
    const capBandY = bodyY - bRy * 0.66;
    const _capPt = (baseCX, halfW, tipX, tipY, col) => {
      ctx.fillStyle = col; ctx.strokeStyle = 'rgba(24,16,40,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bodyX + baseCX - halfW, capBandY);
      ctx.quadraticCurveTo(bodyX + (baseCX + tipX) * 0.5 - halfW * 0.4, capBandY + (tipY - capBandY) * 0.55,
                           bodyX + tipX, bodyY + tipY);
      ctx.quadraticCurveTo(bodyX + (baseCX + tipX) * 0.5 + halfW * 0.4, capBandY + (tipY - capBandY) * 0.55,
                           bodyX + baseCX + halfW, capBandY);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // bell at the tip
      ctx.fillStyle = '#f2d64a'; ctx.strokeStyle = 'rgba(60,40,0,0.6)';
      ctx.beginPath(); ctx.arc(bodyX + tipX, bodyY + tipY, s * 0.032, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,220,0.7)';
      ctx.beginPath(); ctx.arc(bodyX + tipX - s * 0.01, bodyY + tipY - s * 0.01, s * 0.011, 0, Math.PI * 2); ctx.fill();
    };
    // droopy side points (sway with jig) + one central point
    const sw = jig * s * 0.5;
    _capPt(-bR * 0.5, bR * 0.34, -bR * 1.02 + sw, -bRy * 0.34, '#b048e0');   // left  — purple
    _capPt( bR * 0.5, bR * 0.34,  bR * 1.02 + sw, -bRy * 0.34, '#e05fc0');   // right — magenta
    _capPt( 0,        bR * 0.40,   sw * 0.6,       -bRy * 1.35, '#3aa6d6');   // centre — teal
    // cap band hugging the crown
    ctx.fillStyle = '#2b2450'; ctx.strokeStyle = 'rgba(24,16,40,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bodyX - bR * 0.82, capBandY + bRy * 0.03);
    ctx.quadraticCurveTo(bodyX, capBandY - bRy * 0.22, bodyX + bR * 0.82, capBandY + bRy * 0.03);
    ctx.quadraticCurveTo(bodyX, capBandY + bRy * 0.14, bodyX - bR * 0.82, capBandY + bRy * 0.03);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // harlequin diamonds on the band
    ctx.fillStyle = '#f2d64a';
    for (const dxb of [-0.42, 0, 0.42]) {
      const bx = bodyX + dxb * bR, by = capBandY - bRy * 0.02;
      ctx.beginPath();
      ctx.moveTo(bx, by - s * 0.02); ctx.lineTo(bx + s * 0.016, by); ctx.lineTo(bx, by + s * 0.02); ctx.lineTo(bx - s * 0.016, by);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
//  BAT — vampire bat (level 6, ability: dodge)
//  Dark near-black wings, massive fangs, glowing red eyes, wing veins
//  Flight: wingbeat bob + sinusoidal weave
//  Attack: fold wings → dive swoop → bite → snap open
// ═══════════════════════════════════════════════════════════════════════════
function drawBatMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._btT === undefined) {
    unit._btT      = Math.random() * Math.PI * 2;
    unit._btDir    = 1;
    unit._btAtkP   = 0;
    unit._btPrevCd = unit.attackCooldown || 0;
    unit._btPrevX  = unit.x;
    unit._btLastT  = _frameNow;
    unit._btSinOff = Math.random() * Math.PI * 2;
  }
  const dt = Math.min((_frameNow - unit._btLastT) / 1000, 0.05);
  unit._btLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._btDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._btPrevX) > 0.2) {
    unit._btDir = unit.x > unit._btPrevX ? 1 : -1;
  }
  unit._btPrevX = unit.x;
  const dir = unit._btDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._btPrevCd || 0) + 3) unit._btAtkP = 0.01;
  unit._btPrevCd = acd;
  if (unit._btAtkP > 0) { unit._btAtkP += dt / 0.65; if (unit._btAtkP >= 1) unit._btAtkP = 0; }

  unit._btT += dt * (unit.state === 'move' ? 7.5 : 3.8);
  const ap       = unit._btAtkP;
  const atkActive = ap > 0;

  // Wing beat: 0=up, 1=down
  const wingPhase = (Math.sin(unit._btT) + 1) / 2;
  const bob  = -Math.sin(unit._btT) * s * 0.042;   // body rises on downstroke
  const sine = Math.sin(unit._btT * 0.35 + unit._btSinOff) * s * 0.065;

  // Dive phases: fold → swoop → recover
  let diveX = 0, diveY = 0, wingFold = 0;
  if (atkActive) {
    if (ap < 0.15) {
      const t = ap / 0.15, ef = t * t;
      wingFold = ef * 0.55;  diveX = dir * ef * s * 0.07;
    } else if (ap < 0.48) {
      const t = (ap - 0.15) / 0.33, ef = t * t;
      wingFold = 0.55 + ef * 0.35;
      diveX = dir * s * (0.07 + ef * 0.28);  diveY = ef * s * 0.16;
    } else {
      const t = (ap - 0.48) / 0.52, ef = t * t * (3 - 2 * t);
      wingFold = 0.9 * (1 - ef);
      diveX = dir * s * 0.35 * (1 - ef);  diveY = s * 0.16 * (1 - ef);
    }
  }

  const bodyX = cx + diveX;
  const bodyY = fY - s * 0.60 + bob + sine + diveY;
  const bR = s * 0.155;
  const hR = s * 0.245;

  unit._hpBarY = bodyY - hR - s * 0.55 - 8;

  const inFight = unit.state === 'fight' || atkActive;
  const _btBranch = unit._branch || '';
  const _btVampire = _btBranch === 'A';
  const _btSwarm = _btBranch === 'B';

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.beginPath(); ctx.ellipse(cx, fY, s * 0.38, s * 0.06, 0, 0, Math.PI * 2); ctx.fill();

  // Red ambient glow in fight/attack
  if (inFight) {
    ctx.shadowColor = `rgba(200,0,40,${0.18 + wingFold * 0.22})`;
    ctx.shadowBlur  = s * 0.55;
    ctx.fillStyle   = 'rgba(0,0,0,0)';
    ctx.beginPath(); ctx.arc(bodyX, bodyY, bR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur  = 0;
  }

  // ── Wing drawing — spread up-and-out, value-layered membrane, rim light ──
  function drawWing(side, dim) {
    const beat = wingPhase - 0.5;              // -0.5 up .. 0.5 down
    const fold = wingFold;                      // 0..~0.9 (attack folds wings in)
    const spread = 1 - fold * (_btSwarm ? 0.50 : 0.62);

    // Arm: shoulder at upper body → wrist thrown out and UP (menacing spread)
    const shX = bodyX + side * bR * 0.5;
    const shY = bodyY - bR * 0.55;
    const wrReach = _btVampire ? 0.34 : (_btSwarm ? 0.25 : 0.30);
    const wrLift = _btVampire ? 0.18 : (_btSwarm ? 0.11 : 0.15);
    const wrX = shX + side * s * (wrReach * spread);
    const wrY = shY - s * (wrLift + beat * 0.10) * spread;

    // Branch construction, not a recolor: Vampire is one broad cape with long
    // fingers; Swarm is a compact, ragged fan with deep negative notches.
    const reach = s * (_btVampire ? 0.47 : (_btSwarm ? 0.35 : 0.42)) * spread;
    const fdefs = _btVampire ? [
      [-1.18 - beat * 0.20, 1.08], [-0.50 - beat * 0.10, 1.22], [0.12, 1.08],
    ] : _btSwarm ? [
      [-1.08 - beat * 0.28, 0.92], [-0.30 - beat * 0.14, 0.96], [0.48, 0.82],
    ] : [
      [-1.05 - beat * 0.22, 1.00], [-0.42 - beat * 0.12, 1.14], [0.20, 0.98],
    ];
    const T = fdefs.map(([a, l]) => ({
      x: wrX + side * Math.cos(a) * reach * l,
      y: wrY + Math.sin(a) * reach * l,
    }));
    const ankX = bodyX + side * bR * 0.32;
    const ankY = bodyY + bR * 1.05;

    // Leading-edge path (shoulder → wrist → top fingertip) — reused for rim light
    const _lead = () => {
      ctx.moveTo(shX, shY);
      ctx.quadraticCurveTo((shX + wrX) / 2, Math.min(shY, wrY) - s * 0.05, wrX, wrY);
      ctx.lineTo(T[0].x, T[0].y);
    };

    // ── Membrane — value depth: occluded near body → lit toward the edge ──
    const mg = ctx.createLinearGradient(shX, shY + bR, T[1].x, T[1].y);
    if (_btSwarm) {
      // Still dark, but separated from the #0d0820 studio/game floor by value.
      if (dim) { mg.addColorStop(0, '#100d16'); mg.addColorStop(1, '#292332'); }
      else     { mg.addColorStop(0, '#17121f'); mg.addColorStop(1, '#3a3045'); }
    } else if (_btVampire) {
      if (dim) { mg.addColorStop(0, '#190711'); mg.addColorStop(1, '#4c1428'); }
      else     { mg.addColorStop(0, '#260914'); mg.addColorStop(1, '#76203a'); }
    } else if (dim) { mg.addColorStop(0, '#130824'); mg.addColorStop(1, '#38205a'); }
    else            { mg.addColorStop(0, '#1c0b35'); mg.addColorStop(1, '#56317f'); }
    ctx.fillStyle = mg;
    ctx.strokeStyle = _btSwarm ? (dim ? 'rgba(88,80,103,0.38)' : 'rgba(124,112,139,0.54)') : '#070310';
    ctx.lineWidth = s * (_btSwarm ? 0.018 : 0.022);
    ctx.beginPath();
    _lead();
    if (_btSwarm) {
      // Sharp inward bites expose background between short membrane panels.
      ctx.lineTo(wrX + (T[0].x - wrX) * 0.46, wrY + (T[0].y - wrY) * 0.58 + s * 0.03);
      ctx.lineTo(T[1].x, T[1].y);
      ctx.lineTo(wrX + (T[1].x - wrX) * 0.42, wrY + (T[1].y - wrY) * 0.60 + s * 0.045);
      ctx.lineTo(T[2].x, T[2].y);
      ctx.lineTo(bodyX + side * bR * 0.78, bodyY + bR * 0.56);
      ctx.lineTo(ankX, ankY);
    } else {
      const scallop = _btVampire ? 0.075 : 0.05;
      ctx.quadraticCurveTo((T[0].x + T[1].x) / 2 - side * s * scallop, (T[0].y + T[1].y) / 2 + s * 0.03, T[1].x, T[1].y);
      ctx.quadraticCurveTo((T[1].x + T[2].x) / 2 - side * s * scallop, (T[1].y + T[2].y) / 2 + s * 0.045, T[2].x, T[2].y);
      ctx.quadraticCurveTo((T[2].x + ankX) / 2 - side * s * 0.02, (T[2].y + ankY) / 2 + s * 0.05, ankX, ankY);
    }
    ctx.quadraticCurveTo(bodyX + side * bR * 0.2, bodyY + bR * 0.25, shX, shY);                                       // inner edge
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // ── Faint membrane support veins fanning from the wrist to the trailing edge ──
    ctx.strokeStyle = _btSwarm
      ? (dim ? 'rgba(92,83,106,0.22)' : 'rgba(128,115,143,0.30)')
      : (_btVampire ? (dim ? 'rgba(105,34,55,0.56)' : 'rgba(164,55,78,0.68)')
                    : (dim ? 'rgba(58,34,88,0.42)' : 'rgba(92,56,142,0.48)'));
    ctx.lineWidth = s * (_btSwarm ? 0.009 : 0.008); ctx.lineCap = 'round';
    const veinPanels = _btSwarm
      ? [[T[1], T[2]]]
      : [[T[0], T[1]], [T[1], T[2]], [T[2], { x: ankX, y: ankY }]];
    veinPanels.forEach(([p, q]) => {
      const mx = (p.x + q.x) / 2 - side * s * 0.04, my = (p.y + q.y) / 2 + s * 0.03;
      ctx.beginPath(); ctx.moveTo(wrX, wrY); ctx.quadraticCurveTo((wrX + mx) / 2, (wrY + my) / 2, mx, my); ctx.stroke();
    });

    // ── Bones: forearm + 3 tapered fingers (dark, integrated) ──
    const boneCol = _btSwarm ? (dim ? '#302938' : '#473c50')
      : (_btVampire ? (dim ? '#250a16' : '#3e1020') : (dim ? '#0b0418' : '#170a2b'));
    _hdRibbon([{ x: shX, y: shY, w: s * (_btVampire ? 0.036 : 0.030) }, { x: wrX, y: wrY, w: s * 0.020 }], boneCol);
    T.forEach(t => _hdRibbon([{ x: wrX, y: wrY, w: s * (_btSwarm ? 0.014 : 0.016) }, { x: (wrX + t.x) / 2, y: (wrY + t.y) / 2, w: s * (_btSwarm ? 0.009 : 0.010) }, { x: t.x, y: t.y, w: s * 0.004 }], boneCol));

    // ── Rim light on the leading edge — the read on dark backgrounds ──
    ctx.strokeStyle = _btSwarm
      ? (dim ? 'rgba(112,102,127,0.48)' : 'rgba(158,143,176,0.66)')
      : (_btVampire ? (dim ? 'rgba(166,58,78,0.64)' : 'rgba(238,104,122,0.90)')
                    : (dim ? 'rgba(155,125,215,0.60)' : 'rgba(205,172,255,0.92)'));
    ctx.lineWidth = s * (_btSwarm ? 0.019 : (_btVampire ? 0.024 : 0.020)); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); _lead(); ctx.stroke();

    // ── Small hooked claw at each fingertip (dark, curls off the bone) ──
    ctx.strokeStyle = _btSwarm ? (dim ? '#443b4d' : '#66596f') : (dim ? '#2e2044' : '#4c356e');
    ctx.lineWidth = s * (_btSwarm ? 0.014 : 0.017); ctx.lineCap = 'round';
    T.forEach((t, i) => {
      const a = fdefs[i][0] - 0.7;
      ctx.beginPath(); ctx.moveTo(t.x, t.y);
      ctx.quadraticCurveTo(t.x + side * Math.cos(a) * s * 0.018, t.y + Math.sin(a) * s * 0.018,
                           t.x + side * Math.cos(a - 0.4) * s * 0.03, t.y + Math.sin(a - 0.4) * s * 0.03);
      ctx.stroke();
    });
  }

  drawWing(-dir, true);

  // Body construction follows the branch role. Vampire gets a broad cloak-like
  // chest tapering into a blood-fed abdomen; Swarm compresses into a clustered,
  // segmented core. Base keeps the original oval torso.
  if (inFight) { ctx.shadowColor = 'rgba(180,0,40,0.50)'; ctx.shadowBlur = s * 0.30; }
  const _bodyPath = () => {
    ctx.beginPath();
    if (_btVampire) {
      ctx.moveTo(bodyX, bodyY - bR * 1.28);
      ctx.bezierCurveTo(bodyX + bR * 0.94, bodyY - bR * 1.18, bodyX + bR * 1.26, bodyY - bR * 0.42, bodyX + bR * 0.98, bodyY + bR * 0.18);
      ctx.bezierCurveTo(bodyX + bR * 0.74, bodyY + bR * 0.78, bodyX + bR * 0.30, bodyY + bR * 1.52, bodyX, bodyY + bR * 1.62);
      ctx.bezierCurveTo(bodyX - bR * 0.30, bodyY + bR * 1.52, bodyX - bR * 0.74, bodyY + bR * 0.78, bodyX - bR * 0.98, bodyY + bR * 0.18);
      ctx.bezierCurveTo(bodyX - bR * 1.26, bodyY - bR * 0.42, bodyX - bR * 0.94, bodyY - bR * 1.18, bodyX, bodyY - bR * 1.28);
    } else {
      ctx.ellipse(bodyX, bodyY, bR * (_btSwarm ? 1.02 : 1.06), bR * (_btSwarm ? 1.18 : 1.24), 0, 0, Math.PI * 2);
    }
    ctx.closePath();
  };

  const _bg = ctx.createRadialGradient(bodyX - bR * 0.35, bodyY - bR * 0.5, bR * 0.1, bodyX, bodyY + bR * 0.2, bR * 1.7);
  if (_btVampire) {
    _bg.addColorStop(0, '#6f2438'); _bg.addColorStop(0.52, '#3a1022'); _bg.addColorStop(1, '#16070f');
  } else if (_btSwarm) {
    _bg.addColorStop(0, '#44384d'); _bg.addColorStop(0.55, '#29222f'); _bg.addColorStop(1, '#15111b');
  } else {
    _bg.addColorStop(0, '#3c1e56'); _bg.addColorStop(0.55, '#26113c'); _bg.addColorStop(1, '#130725');
  }
  ctx.fillStyle = _bg;
  ctx.strokeStyle = _btSwarm ? 'rgba(135,121,151,0.58)' : (_btVampire ? '#260810' : '#0a0412');
  ctx.lineWidth = s * (_btSwarm ? 0.022 : 0.05);
  _bodyPath(); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Chest construction marks survive at 34 px and reinforce the body type.
  ctx.strokeStyle = _btSwarm ? 'rgba(102,90,116,0.36)'
    : (_btVampire ? 'rgba(196,62,84,0.64)' : 'rgba(92,55,130,0.5)');
  ctx.lineWidth = s * (_btSwarm ? 0.010 : 0.013); ctx.lineCap = 'round';
  const _furRows = _btVampire ? [-0.30, 0.18, 0.68] : (_btSwarm ? [0.15] : [-0.15, 0.25, 0.62]);
  for (const fy of _furRows) {
    const half = bR * (_btSwarm ? 0.50 : 0.42);
    ctx.beginPath();
    ctx.moveTo(bodyX - half, bodyY + bR * fy);
    ctx.quadraticCurveTo(bodyX, bodyY + bR * (fy + (_btVampire ? 0.30 : 0.22)), bodyX + half, bodyY + bR * fy);
    ctx.stroke();
  }

  drawWing(dir, false);

  // ── Head ─────────────────────────────────────────────────────
  const headX = bodyX + dir * s * 0.025;
  const headY = bodyY - bR * 0.86 - hR * 0.65;

  if (inFight) { ctx.shadowColor = 'rgba(200,0,40,0.55)'; ctx.shadowBlur = s * 0.35; }
  ctx.fillStyle = _btVampire ? '#421020' : (_btSwarm ? '#27202e' : '#2d1245');
  ctx.strokeStyle = _btSwarm ? 'rgba(145,130,161,0.62)' : '#0a0412';
  ctx.lineWidth = s * (_btSwarm ? 0.024 : 0.055);
  ctx.beginPath(); ctx.arc(headX, headY, hR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Ears (tall, sharp, threatening)
  [-1, 1].forEach(side => {
    const eX  = headX + side * hR * 0.40;
    const eY  = headY - hR * 0.48;
    const etX = headX + side * hR * 0.46;
    const etY = headY - hR * 2.15;  // much taller
    ctx.fillStyle = _btVampire ? '#421020' : (_btSwarm ? '#27202e' : '#2d1245');
    ctx.strokeStyle = _btSwarm ? 'rgba(145,130,161,0.58)' : '#0a0412';
    ctx.lineWidth = s * (_btSwarm ? 0.022 : 0.045);
    ctx.beginPath();
    ctx.moveTo(eX - side * hR * 0.34, eY + hR * 0.10);
    ctx.lineTo(etX, etY);
    ctx.lineTo(eX + side * hR * 0.26, eY);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Inner ear — dark blood red
    ctx.fillStyle = _btSwarm ? '#533344' : '#7a1020';
    ctx.beginPath();
    ctx.moveTo(eX - side * hR * 0.16, eY + hR * 0.07);
    ctx.lineTo(etX + side * hR * 0.03, etY + hR * 0.35);
    ctx.lineTo(eX + side * hR * 0.12, eY + hR * 0.02);
    ctx.closePath(); ctx.fill();
  });

  // Angry V-brows
  ctx.strokeStyle = '#0a0412'; ctx.lineWidth = s * 0.048; ctx.lineCap = 'round';
  const browY = headY - hR * 0.40;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(headX + side * hR * 0.48, browY - hR * 0.15);  // outer: high
    ctx.lineTo(headX + side * hR * 0.08, browY + hR * 0.18);  // inner: low = V-shape
    ctx.stroke();
  });

  // Eyes — glowing red menace, slit pupils, NO cute highlights
  const eyeSp = hR * 0.27;
  const eyeY  = headY - hR * 0.04;
  const eyeRr = hR * 0.24;
  [-1, 1].forEach(side => {
    const ex = headX + side * eyeSp;
    ctx.shadowColor = '#ff0020'; ctx.shadowBlur = inFight ? s * 0.28 : s * 0.14;
    ctx.fillStyle = '#ff1030';
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Slit pupil (vertical)
    ctx.fillStyle = '#0a0008';
    ctx.beginPath(); ctx.ellipse(ex + dir * eyeRr * 0.20, eyeY, eyeRr * 0.22, eyeRr * 0.75, 0, 0, Math.PI * 2); ctx.fill();
  });

  // Nose (horseshoe bat-style, wider)
  ctx.fillStyle = '#5a1828';
  ctx.beginPath(); ctx.arc(headX - hR * 0.11, headY + hR * 0.32, hR * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(headX + hR * 0.11, headY + hR * 0.32, hR * 0.09, 0, Math.PI * 2); ctx.fill();

  // Mouth — snarling open in fight, always showing teeth
  const mF = atkActive
    ? Math.max(0, ap < 0.38 ? ap / 0.38 : ap < 0.58 ? 1 : 1 - (ap - 0.58) / 0.42)
    : (inFight ? 0.30 : 0);
  const mY = headY + hR * 0.60;

  // Mouth void
  if (mF > 0.05) {
    ctx.fillStyle = 'rgba(8,0,4,0.96)';
    ctx.beginPath();
    ctx.ellipse(headX, mY + hR * 0.10 * mF, hR * 0.38 * mF, hR * 0.22 * mF, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Lip line
  ctx.strokeStyle = '#0a0008'; ctx.lineWidth = s * 0.050; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headX - hR * 0.32, mY);
  ctx.quadraticCurveTo(headX + dir * hR * 0.05, mY + hR * 0.14 * (1 + mF), headX + hR * 0.32, mY);
  ctx.stroke();

  // MASSIVE fangs — the signature feature
  ctx.fillStyle = '#f0ecff'; ctx.strokeStyle = '#0a0008'; ctx.lineWidth = s * 0.030;
  [-1, 1].forEach(side => {
    const fx = headX + side * hR * 0.14;
    const fw = hR * 0.115;
    const fh = hR * (0.50 + mF * 0.40);  // huge fangs, grow on attack
    ctx.beginPath();
    ctx.moveTo(fx - fw, mY + hR * 0.02);
    ctx.lineTo(fx,      mY + fh);
    ctx.lineTo(fx + fw, mY + hR * 0.02);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Blood drip on attack
    if (mF > 0.55) {
      ctx.fillStyle = '#cc0022';
      const drip = (mF - 0.55) / 0.45;
      ctx.beginPath();
      ctx.arc(fx, mY + fh + drip * hR * 0.25, hR * 0.045 * drip, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0ecff';
    }
  });

  // Feet — small hooked claws tucked under the body (not sprawling)
  ctx.lineCap = 'round';
  [-1, 1].forEach(side => {
    const lx0 = bodyX + side * bR * 0.34, ly0 = bodyY + bR * 1.02;
    const lx1 = bodyX + side * bR * 0.52, ly1 = bodyY + bR * 1.42;
    ctx.strokeStyle = '#1a0a2c'; ctx.lineWidth = s * 0.05;              // stubby shin
    ctx.beginPath(); ctx.moveTo(lx0, ly0); ctx.lineTo(lx1, ly1); ctx.stroke();
    // three short curved talons
    ctx.strokeStyle = '#3a2850'; ctx.lineWidth = s * 0.018;
    [-0.45, 0, 0.45].forEach(ca => {
      ctx.beginPath(); ctx.moveTo(lx1, ly1);
      ctx.quadraticCurveTo(lx1 + side * ca * s * 0.03, ly1 + s * 0.03,
                           lx1 + side * ca * s * 0.045, ly1 + s * 0.055);
      ctx.stroke();
    });
  });

  // ── Branch visuals ──────────────────────────────────────────
  if (_btBranch === 'A') {
    // ── VAMPIRE — engorged with stolen blood: a pulsing crimson aura, blood
    //    running from the fangs, and red life-motes being siphoned INTO it. ──
    const _t = _frameNow * 0.001;
    const _pulse = 0.5 + 0.5 * Math.sin(_t * 2.6);
    // blood aura
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const va = ctx.createRadialGradient(bodyX, bodyY, bR * 0.3, bodyX, bodyY, bR * 2.4);
    va.addColorStop(0, `rgba(210,10,30,${(0.14 + _pulse * 0.12).toFixed(3)})`);
    va.addColorStop(0.55, `rgba(150,0,20,${(0.06 + _pulse * 0.05).toFixed(3)})`);
    va.addColorStop(1, 'rgba(150,0,20,0)');
    ctx.fillStyle = va;
    ctx.beginPath(); ctx.ellipse(bodyX, bodyY, bR * 2.4, bR * 2.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Subtle blood sheen; construction now carries the branch read.
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.20;
    ctx.fillStyle = '#c01028';
    ctx.beginPath(); ctx.ellipse(bodyX, bodyY - bR * 0.2, bR * 1.15, bR * 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // blood running from the fangs / mouth
    ctx.fillStyle = '#c00820'; ctx.strokeStyle = '#5a0012'; ctx.lineWidth = s * 0.01;
    const _mouthY = headY + hR * 0.6;
    [-0.14, 0.14].forEach(_dx => {
      const _fx = headX + _dx * hR * 2.0, _fy = _mouthY + hR * 0.5;
      const _dl = hR * (0.4 + Math.abs(Math.sin(_frameNow * 0.002 + _dx * 6)) * 0.5);
      ctx.lineWidth = s * 0.022; ctx.strokeStyle = '#c00820'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(_fx, _fy); ctx.lineTo(_fx, _fy + _dl); ctx.stroke();
      ctx.fillStyle = '#d81030';
      ctx.beginPath(); ctx.arc(_fx, _fy + _dl, hR * 0.09, 0, Math.PI * 2); ctx.fill();
    });
    // red life-motes drawn IN toward the bat (life-drain)
    for (let i = 0; i < 6; i++) {
      const _p = ((_t * 0.6 + i * 0.16) % 1);                 // 1→0 travel inward
      const _ang = i * 1.05 + _t * 0.5;
      const _rad = bR * (0.4 + (1 - _p) * 1.9);
      const _mx = bodyX + Math.cos(_ang) * _rad;
      const _my = bodyY + Math.sin(_ang) * _rad * 0.8;
      ctx.fillStyle = `rgba(230,30,55,${(_p * 0.7).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(_mx, _my, s * 0.012, 0, Math.PI * 2); ctx.fill();
    }
  } else if (_btBranch === 'B') {
    // ── SWARM — one dominant dark bat with three detached companions. ──
    const _t = _frameNow * 0.001;
    const _mini = (mx, my, ms, a) => {
      const fillA = Math.min(0.92, 0.58 + a * 0.42);
      ctx.fillStyle = `rgba(62,52,71,${fillA.toFixed(3)})`;
      [-1, 1].forEach(ws => {
        ctx.beginPath();
        ctx.moveTo(mx, my - ms * 0.05);
        ctx.quadraticCurveTo(mx + ws * ms * 0.55, my - ms * 0.5, mx + ws * ms * 1.05, my - ms * 0.12);
        ctx.quadraticCurveTo(mx + ws * ms * 0.72, my + ms * 0.02, mx + ws * ms * 0.58, my + ms * 0.22);
        ctx.quadraticCurveTo(mx + ws * ms * 0.34, my + ms * 0.02, mx, my + ms * 0.12);
        ctx.closePath(); ctx.fill();
        // One subdued leading edge is enough to separate each tiny silhouette.
        ctx.strokeStyle = `rgba(133,121,148,${(0.34 + a * 0.22).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.55, s * 0.011);
        ctx.beginPath();
        ctx.moveTo(mx, my - ms * 0.05);
        ctx.quadraticCurveTo(mx + ws * ms * 0.55, my - ms * 0.5, mx + ws * ms * 1.05, my - ms * 0.12);
        ctx.stroke();
      });
      ctx.fillStyle = `rgba(72,59,81,${fillA.toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(mx, my, ms * 0.24, ms * 0.32, 0, 0, Math.PI * 2); ctx.fill();
      // tiny red eye glint
      ctx.fillStyle = `rgba(255,40,60,${(a * 1.4).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(mx, my - ms * 0.04, ms * 0.05, 0, Math.PI * 2); ctx.fill();
    };
    // Detached positions leave negative space around the main creature at 34 px.
    const _swarm = [
      [-1.45, -0.88, 0.30, 0.72],
      [1.50, -0.72, 0.28, 0.66],
      [1.35, 0.92, 0.24, 0.58],
    ];
    _swarm.forEach(([ox, oy, ms, a], i) => {
      const dxo = Math.sin(_t * 1.4 + i * 1.7) * s * 0.06;
      const dyo = Math.cos(_t * 1.1 + i * 2.3) * s * 0.05;
      const flap = 1 + 0.18 * Math.sin(_t * 8 + i * 2);
      _mini(bodyX + ox * s * 0.68 + dxo, bodyY + oy * s * 0.52 + dyo, s * ms * flap, a);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  GOLEM — stone golem (level 7, ability: stun)
//  Inverted-triangle body (wide shoulders > hips), fists bigger than head,
//  forward-lean posture, squash on stomp, amber rune eyes, crack detail
// ═══════════════════════════════════════════════════════════════════════════
function drawGolemMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._glLastT || _frameNow)) / 1000, 0.05);
  unit._glLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._glDir === undefined) {
    unit._glDir = 1; unit._glPrevX = cx; unit._glPrevAcd = unit.attackCooldown;
    unit._glT = 0; unit._glAp = 0; unit._glRingT = 0; unit._glLegPh = 0;
  }
  if (Math.abs(cx - unit._glPrevX) > 0.2)
    unit._glDir = cx > unit._glPrevX ? 1 : -1;
  unit._glPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._glDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._glDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._glPrevAcd || 0) + 3) {
    unit._glAp = 1.0;
    if (Math.random() < 0.12) unit._glRingT = 1.0;
  }
  unit._glPrevAcd = acd;
  unit._glT += dt;

  const atkDur = Math.min(0.80, atkBase / 60 * 0.85);
  if (unit._glAp   > 0) unit._glAp   = Math.max(0, unit._glAp   - dt / atkDur);
  if (unit._glRingT > 0) unit._glRingT = Math.max(0, unit._glRingT - dt / 0.65);

  const atkActive = unit._glAp > 0;
  const ap = 1 - unit._glAp; // 0=just fired, 1=done

  const windup = unit.state === 'fight' ? 1 - Math.min(1, acd / (atkBase * 0.35)) : 0;
  const inFight = unit.state === 'fight' || atkActive;

  if (unit.state === 'move') {
    unit._glLegPh = (unit._glLegPh + dt / 0.72) % 1;
  } else {
    const frac = unit._glLegPh % 1;
    unit._glLegPh += dt * 2.0 * (frac < 0.5 ? 1 : -1);
  }

  // ── Squash on stomp ──────────────────────────────────────────────
  // Peak squash when both feet grounded (cos = 1 at ph=0,0.5)
  const sqF = unit.state === 'move'
    ? Math.max(0, Math.cos(unit._glLegPh * Math.PI * 2)) * 0.13
    : 0;
  const scX = 1 + sqF;
  const scY = 1 - sqF * 0.70;

  // ── Attack motion ────────────────────────────────────────────────
  const breathe = Math.sin(unit._glT * 0.70) * s * 0.010;
  let lurchX = 0, lurchY = 0, fistRaise = 0, fistExtend = 0;
  if (atkActive) {
    if (ap < 0.22) {                     // anticip: lean back, fist up
      const f = ap / 0.22;
      lurchX = -dir * s * 0.16 * f;  fistRaise = f;
    } else if (ap < 0.50) {             // slam: lunge hard
      const f = (ap - 0.22) / 0.28;
      lurchX = dir * s * 0.30 * f - dir * s * 0.16 * (1 - f);
      lurchY = s * 0.07 * f;
      fistRaise = 1 - f;  fistExtend = f;
    } else {                             // recovery
      const f = (ap - 0.50) / 0.50;
      lurchX = dir * s * 0.30 * (1 - f);
      lurchY = s * 0.07 * (1 - f);
    }
  } else if (windup > 0.05) {
    lurchX = -dir * s * 0.10 * windup;  fistRaise = windup * 0.80;
  }

  // ── Geometry ─────────────────────────────────────────────────────
  const bH   = s * 0.52;    // body half-height
  const legH = s * 0.36;    // leg height
  const bX   = cx + Math.sin(unit._glT * 0.50) * s * 0.006 + lurchX;
  const bY   = fY - legH - bH + breathe + lurchY;  // body CENTER above floor

  // Inverted trapezoid: wide shoulders, narrow hips
  const shW  = s * 0.72 * scX;   // shoulder half-width
  const hipW = s * 0.44 * scX;   // hip half-width
  const bodyH = bH * 2.0 * scY;
  const bodyTop = bY - bodyH * 0.50;   // top of body (shoulder level)
  const bodyBot = bY + bodyH * 0.50;   // bottom (hip level)
  const midY  = bodyTop + bodyH * 0.50;  // widest point (middle)

  // Forward lean: upper body tilts toward enemy
  const tilt = dir * s * 0.12;

  const headR = s * 0.215;
  const headY = bodyTop - headR * 1.20;

  const fR = s * 0.230;    // MASSIVE fists — bigger than head

  ctx.save();

  // ── Shadow ───────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(bX, fY + s * 0.02, shW * 1.10, s * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Legs (thick stone pillars) ────────────────────────────────────
  [-1, 1].forEach(side => {
    const liftF = Math.max(0, Math.sin((unit._glLegPh + (side === 1 ? 0 : 0.5)) * Math.PI * 2));
    const lx    = bX + side * hipW * 0.72;
    const lyTop = bodyBot - s * 0.04;
    const lyBot = fY - liftF * s * 0.14;
    const lw    = s * 0.20;

    ctx.fillStyle = '#5a4838';
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.038;
    ctx.beginPath();
    ctx.moveTo(lx - lw * 1.10, lyTop);
    ctx.lineTo(lx + lw * 1.10, lyTop);
    ctx.lineTo(lx + lw,        lyBot);
    ctx.lineTo(lx - lw,        lyBot);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Foot — flat wide block
    ctx.fillStyle = '#493828';
    ctx.beginPath();
    ctx.moveTo(lx - lw * 1.45, lyBot);
    ctx.lineTo(lx + lw * 1.45, lyBot);
    ctx.lineTo(lx + lw * 1.25, lyBot + s * 0.11);
    ctx.lineTo(lx - lw * 1.25, lyBot + s * 0.11);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Crack on leg
    ctx.strokeStyle = 'rgba(30,18,8,0.60)'; ctx.lineWidth = s * 0.016;
    ctx.beginPath();
    ctx.moveTo(lx - lw * 0.25, lyTop + (lyBot - lyTop) * 0.25);
    ctx.lineTo(lx + lw * 0.15, lyTop + (lyBot - lyTop) * 0.65);
    ctx.stroke();
  });

  // ── Far arm (behind body) ─────────────────────────────────────────
  {
    const side = -dir;
    const shX  = bX + side * shW * 0.78 + tilt * 0.25;
    const shAY = bodyTop + bodyH * 0.08;
    const elbX = shX + side * s * 0.32;
    const elbY = shAY + s * 0.35;
    const ftX  = elbX + side * s * 0.26;
    const ftY  = elbY + s * 0.30;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4a3828'; ctx.lineWidth = s * 0.30;
    ctx.beginPath(); ctx.moveTo(shX, shAY); ctx.lineTo(elbX, elbY); ctx.stroke();
    ctx.lineWidth = s * 0.26;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();

    ctx.fillStyle = '#665544'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.038;
    ctx.beginPath(); ctx.arc(ftX, ftY, fR * 0.88, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Knuckle arc
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.arc(ftX + side * fR * 0.25, ftY - fR * 0.50, fR * 0.75, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
  }

  // ── Body (inverted trapezoid) ─────────────────────────────────────
  if (inFight) { ctx.shadowColor = 'rgba(255,120,0,0.40)'; ctx.shadowBlur = s * 0.22; }

  // Dark lower half (weight / grounding)
  ctx.fillStyle = '#5a4838';
  ctx.beginPath();
  ctx.moveTo(bX - shW + tilt * 0.50, midY);
  ctx.lineTo(bX + shW + tilt * 0.50, midY);
  ctx.lineTo(bX + hipW,              bodyBot);
  ctx.lineTo(bX - hipW,              bodyBot);
  ctx.closePath(); ctx.fill();

  // Light upper half (shoulder mass)
  ctx.fillStyle = '#9a8870';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW + tilt * 0.50,  midY);
  ctx.lineTo(bX - shW + tilt * 0.50,  midY);
  ctx.closePath(); ctx.fill();

  ctx.shadowBlur = 0;

  // Outline
  ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.055; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW + tilt * 0.50,  midY);
  ctx.lineTo(bX + hipW,               bodyBot);
  ctx.lineTo(bX - hipW,               bodyBot);
  ctx.lineTo(bX - shW + tilt * 0.50,  midY);
  ctx.closePath(); ctx.stroke();

  // Crack — diagonal with highlight edge
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(28,16,6,0.72)'; ctx.lineWidth = s * 0.024;
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.22 + tilt * 0.7, bodyTop + bodyH * 0.18);
  ctx.lineTo(bX - shW * 0.04 + tilt * 0.5, bodyTop + bodyH * 0.58);
  ctx.lineTo(bX + shW * 0.16 + tilt * 0.3, bodyTop + bodyH * 0.82);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(180,155,120,0.28)'; ctx.lineWidth = s * 0.014;
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.20 + tilt * 0.7, bodyTop + bodyH * 0.18);
  ctx.lineTo(bX - shW * 0.02 + tilt * 0.5, bodyTop + bodyH * 0.58);
  ctx.stroke();

  // ── Chest rune crystal ────────────────────────────────────────────
  const crX = bX + tilt * 0.55;
  const crY = bodyTop + bodyH * 0.46;
  const crR = s * 0.105;
  ctx.shadowColor = atkActive ? '#ffaa00' : (windup > 0.20 ? '#ff7700' : '#ff4400');
  ctx.shadowBlur  = s * (atkActive ? 0.58 : 0.24 + windup * 0.25);
  ctx.fillStyle   = atkActive ? '#ffcc33' : '#ff6622';
  ctx.beginPath();
  ctx.moveTo(crX,       crY - crR * 1.55);
  ctx.lineTo(crX + crR, crY);
  ctx.lineTo(crX,       crY + crR * 1.55);
  ctx.lineTo(crX - crR, crY);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,240,175,0.68)';
  ctx.beginPath();
  ctx.moveTo(crX,             crY - crR * 0.82);
  ctx.lineTo(crX + crR * 0.5, crY - crR * 0.08);
  ctx.lineTo(crX,             crY + crR * 0.60);
  ctx.lineTo(crX - crR * 0.5, crY - crR * 0.08);
  ctx.closePath(); ctx.fill();

  // ── Near arm (attacking) ──────────────────────────────────────────
  {
    const side = dir;
    const shX  = bX + side * shW * 0.78 + tilt * 0.75;
    const shAY = bodyTop + bodyH * 0.05;
    const elbX = shX + side * s * 0.30 + dir * fistExtend * s * 0.10;
    const elbY = shAY + s * 0.32 * (1 - fistRaise * 0.65);
    const ftX  = elbX + side * s * 0.24 + dir * fistExtend * s * 0.44;
    const ftY  = elbY + s * 0.26 - fistRaise * s * 0.48;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#7a6858'; ctx.lineWidth = s * 0.32;
    ctx.beginPath(); ctx.moveTo(shX, shAY); ctx.lineTo(elbX, elbY); ctx.stroke();
    ctx.lineWidth = s * 0.28;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();

    if (atkActive && fistExtend > 0.25) {
      ctx.shadowColor = 'rgba(255,110,0,0.65)'; ctx.shadowBlur = s * 0.32;
    }
    ctx.fillStyle = '#aа9980'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.040;
    ctx.fillStyle = '#aa9980';
    ctx.beginPath(); ctx.arc(ftX, ftY, fR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // Knuckle arc + crack on fist
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.032;
    ctx.beginPath(); ctx.arc(ftX + dir * fR * 0.28, ftY - fR * 0.52, fR * 0.74, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(28,16,6,0.60)'; ctx.lineWidth = s * 0.020;
    ctx.beginPath();
    ctx.moveTo(ftX - fR * 0.30, ftY - fR * 0.25);
    ctx.lineTo(ftX + fR * 0.18, ftY + fR * 0.32);
    ctx.stroke();
  }

  // ── Neck ─────────────────────────────────────────────────────────
  const nW = headR * 0.55;
  const nTop = headY + headR * 0.85;
  ctx.fillStyle = '#7a6858'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.040;
  ctx.beginPath();
  ctx.moveTo(bX - nW + tilt * 0.55, nTop);
  ctx.lineTo(bX + nW + tilt * 0.55, nTop);
  ctx.lineTo(bX + nW * 0.85 + tilt * 0.65, bodyTop + s * 0.03);
  ctx.lineTo(bX - nW * 0.85 + tilt * 0.65, bodyTop + s * 0.03);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // ── Head (angular stone slab) ─────────────────────────────────────
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = s * 0.14;
  const hcX = bX + dir * s * 0.02 + tilt * 0.60;
  ctx.fillStyle = '#998878'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.048;
  ctx.beginPath();
  ctx.moveTo(hcX - headR * 1.25, headY + headR * 0.85);  // BL
  ctx.lineTo(hcX + headR * 1.25, headY + headR * 0.85);  // BR
  ctx.lineTo(hcX + headR * 1.05, headY - headR * 0.85);  // TR
  ctx.lineTo(hcX - headR * 1.05, headY - headR * 0.85);  // TL
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Head crack
  ctx.strokeStyle = 'rgba(28,16,6,0.55)'; ctx.lineWidth = s * 0.018;
  ctx.beginPath();
  ctx.moveTo(hcX + headR * 0.38, headY - headR * 0.72);
  ctx.lineTo(hcX + headR * 0.12, headY + headR * 0.42);
  ctx.stroke();

  // ── V-brow (single thick angry V) ─────────────────────────────────
  const browY = headY - headR * 0.16;
  const eyeSp = headR * 0.48;
  ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.108; ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(hcX - headR * 1.08, browY - headR * 0.38);
  ctx.lineTo(hcX,                browY + headR * 0.12);
  ctx.lineTo(hcX + headR * 1.08, browY - headR * 0.38);
  ctx.stroke();
  // Brow highlight top edge
  ctx.strokeStyle = 'rgba(140,118,90,0.45)'; ctx.lineWidth = s * 0.030; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hcX - headR * 1.05, browY - headR * 0.44);
  ctx.lineTo(hcX - headR * 0.05, browY + headR * 0.06);
  ctx.stroke();

  // ── Amber glow eyes ───────────────────────────────────────────────
  const eyeY  = browY + headR * 0.52;
  const eyeRr = headR * 0.215;
  [-1, 1].forEach(side => {
    const ex = hcX + side * eyeSp;
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur  = inFight ? s * 0.40 : s * 0.20;
    ctx.fillStyle   = atkActive ? '#ffcc00' : (inFight ? '#ffaa00' : '#ff8800');
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Slit pupil (vertical rectangle)
    ctx.fillStyle = '#180a00';
    ctx.beginPath(); ctx.ellipse(ex + dir * eyeRr * 0.18, eyeY, eyeRr * 0.30, eyeRr * 0.70, 0, 0, Math.PI * 2); ctx.fill();
  });

  // ── Stun shockwave ring ───────────────────────────────────────────
  if (unit._glRingT > 0) {
    const rp  = 1 - unit._glRingT;
    const rad = s * 0.32 + rp * s * 1.40;
    const alp = unit._glRingT * 0.92;
    ctx.strokeStyle = `rgba(255,175,0,${alp})`;
    ctx.lineWidth   = s * 0.068 * unit._glRingT;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, fY - s * 0.28, rad, 0, Math.PI * 2); ctx.stroke();
    if (unit._glRingT > 0.50) {
      const rad2 = s * 0.18 + rp * s * 0.75;
      const alp2 = (unit._glRingT - 0.50) / 0.50 * 0.58;
      ctx.strokeStyle = `rgba(255,220,80,${alp2})`;
      ctx.lineWidth   = s * 0.040;
      ctx.beginPath(); ctx.arc(cx, fY - s * 0.28, rad2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  unit._hpBarY = headY - headR * 1.12;
  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════
//  MINOTAUR — рівень 8, здібність: aoe4th
//  Органічні руки й ноги — єдиний bezier-штрих без видимих суглобів.
//  Тіло 3-шарове (темні краї → середній тон → центральний відблиск).
//  Атака рогами: голова нахиляється через ctx.rotate.
// ═══════════════════════════════════════════════════════════════════════════
function drawMinotaurMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._mtLastT || _frameNow)) / 1000, 0.05);
  unit._mtLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._mtDir === undefined) {
    unit._mtDir = 1; unit._mtPrevX = cx; unit._mtPrevAcd = unit.attackCooldown;
    unit._mtT = 0; unit._mtAp = 0; unit._mtRingT = 0; unit._mtLegPh = 0;
    unit._mtHitN = 0; unit._mtAoeT = 0;
  }
  if (Math.abs(cx - unit._mtPrevX) > 0.2)
    unit._mtDir = cx > unit._mtPrevX ? 1 : -1;
  unit._mtPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._mtDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._mtDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._mtPrevAcd || 0) + 3) {
    unit._mtAp   = 1.0;
    unit._mtHitN = (unit._mtHitN + 1) % 4;
    if (unit._mtHitN === 0) { unit._mtAoeT = 1.0; unit._mtRingT = 1.0; }
  }
  unit._mtPrevAcd = acd;
  unit._mtT += dt;

  const atkDur = Math.min(0.75, atkBase / 60 * 0.82);
  if (unit._mtAp    > 0) unit._mtAp    = Math.max(0, unit._mtAp    - dt / atkDur);
  if (unit._mtRingT > 0) unit._mtRingT = Math.max(0, unit._mtRingT - dt / 0.58);
  if (unit._mtAoeT  > 0) unit._mtAoeT  = Math.max(0, unit._mtAoeT  - dt / 0.72);

  const atkActive = unit._mtAp > 0;
  const ap        = 1 - unit._mtAp;
  const windup    = unit.state === 'fight' ? 1 - Math.min(1, acd / (atkBase * 0.35)) : 0;
  const inFight   = unit.state === 'fight' || atkActive;

  if (unit.state === 'move') {
    unit._mtLegPh = (unit._mtLegPh + dt / 0.55) % 1;
  } else {
    const frac = unit._mtLegPh % 1;
    unit._mtLegPh += dt * 1.8 * (frac < 0.5 ? 1 : -1);
  }

  const sqF = unit.state === 'move'
    ? Math.max(0, Math.cos(unit._mtLegPh * Math.PI * 2)) * 0.07 : 0;

  // ── Horn-charge motion ───────────────────────────────────────────
  const breathe = Math.sin(unit._mtT * 0.80) * s * 0.009;
  let lurchX = 0, lurchY = 0, dipAngle = 0, armSwing = 0;

  if (atkActive) {
    if (ap < 0.18) {
      const f = ap / 0.18;
      lurchX   = -dir * s * 0.22 * f;
      dipAngle = -dir * 0.48 * f;
    } else if (ap < 0.54) {
      const f  = (ap - 0.18) / 0.36;
      const ef = f * f * (3 - 2 * f);
      lurchX   =  dir * s * 0.52 * ef - dir * s * 0.22 * (1 - ef);
      lurchY   =  s * 0.04 * Math.sin(ef * Math.PI);
      dipAngle =  dir * 0.80 * ef;
      armSwing =  ef;
    } else {
      const f  = (ap - 0.54) / 0.46;
      lurchX   =  dir * s * 0.52 * (1 - f);
      lurchY   =  s * 0.04 * (1 - f);
      dipAngle =  dir * 0.80 * (1 - f);
      armSwing =  1 - f;
    }
  } else if (windup > 0.05) {
    lurchX   = -dir * s * 0.13 * windup;
    dipAngle = -dir * 0.32 * windup;
  }

  // ── Пропорції ────────────────────────────────────────────────────
  const headR = s * 0.255;
  const bH    = s * 0.500;
  const legH  = s * 0.430;
  const neckH = s * 0.085;
  const muzzR = headR * 0.58;

  const stretchX = atkActive && ap > 0.18 && ap < 0.54
    ? (ap - 0.18) / 0.36 * 0.10 : 0;
  const scX = 1 + sqF + stretchX;
  const scY = 1 - sqF * 0.55;

  const shW  = s * 0.800 * scX;
  const hipW = s * 0.420 * scX;
  const tilt = dir * s * 0.08;

  const bX      = cx + lurchX;
  const bY      = fY - legH - bH + breathe + lurchY;
  const bodyH   = bH * 2.0 * scY;
  const bodyTop = bY - bodyH * 0.50;
  const bodyBot = bY + bodyH * 0.50;
  const neckTopY = bodyTop - neckH;
  const headY    = neckTopY - headR * 0.90;
  const hcX      = bX + dir * s * 0.020 + tilt * 0.42;

  ctx.save();

  // ── Тінь ─────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(bX, fY + s * 0.022, shW * 1.05, s * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── НОГИ — єдиний bezier-штрих, нема видимих коліна ────────────
  // Малюємо обидві ноги ДО тіла, щоб тіло перекрило верхівки
  [-1, 1].forEach(side => {
    const phase = side === 1 ? 0 : 0.5;
    const liftF = Math.max(0, Math.sin((unit._mtLegPh + phase) * Math.PI * 2));
    const hipX  = bX + side * hipW * 0.72;
    const hipY  = bodyBot - s * 0.030;
    const ankX  = hipX + side * s * 0.040;
    const ankY  = fY - liftF * s * 0.16 - s * 0.050;
    const cpLX  = hipX + side * s * 0.075;             // коліно трохи назовні
    const cpLY  = hipY + (ankY - hipY) * 0.46;

    // Основний штрих ноги (товстий, темний)
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5a2e0e'; ctx.lineWidth = s * 0.215;
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.quadraticCurveTo(cpLX, cpLY, ankX, ankY); ctx.stroke();
    // Внутрішній відблиск (вужчий, середній тон) — дає обсяг
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.110;
    ctx.beginPath(); ctx.moveTo(hipX - side * s * 0.015, hipY); ctx.quadraticCurveTo(cpLX - side * s * 0.025, cpLY, ankX - side * s * 0.012, ankY); ctx.stroke();

    // Копито
    const hoofY = fY - liftF * s * 0.16;
    ctx.fillStyle = '#130805'; ctx.strokeStyle = '#080402'; ctx.lineWidth = s * 0.022;
    ctx.beginPath();
    ctx.ellipse(ankX, hoofY + s * 0.036, s * 0.148, s * 0.058, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#060302'; ctx.lineWidth = s * 0.014;
    ctx.beginPath(); ctx.moveTo(ankX, hoofY + s * 0.003); ctx.lineTo(ankX, hoofY + s * 0.070); ctx.stroke();
  });

  // ── ДАЛЬНЯ РУКА — єдиний bezier від плеча до кулака ─────────────
  {
    const side = -dir;
    const shX = bX + side * shW * 0.78 + tilt * 0.10;
    const shY = bodyTop + s * 0.020;
    // CP = лікоть (виступає назовні)
    const cpX = shX + side * s * 0.30;
    const cpY = shY + s * 0.42;
    // Кулак (трохи ближче до тіла ніж лікоть, нижче)
    const ftX = shX + side * s * 0.22 - armSwing * dir * s * 0.28;
    const ftY = shY + s * 0.78;

    // Лікоть — явна точка для звуження
    const elbX = cpX, elbY = cpY;
    ctx.lineCap = 'round';
    // Верхня рука (товща)
    ctx.strokeStyle = '#5a2e0e'; ctx.lineWidth = s * 0.228;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(elbX, elbY); ctx.stroke();
    // Передпліччя (тонше — звуження)
    ctx.strokeStyle = '#5a2e0e'; ctx.lineWidth = s * 0.172;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();
    // Відблиски (зверху вниз)
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.110;
    ctx.beginPath(); ctx.moveTo(shX + dir*s*0.042, shY); ctx.lineTo(elbX + dir*s*0.030, elbY); ctx.stroke();
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.078;
    ctx.beginPath(); ctx.moveTo(elbX + dir*s*0.030, elbY); ctx.lineTo(ftX + dir*s*0.018, ftY - s*0.04); ctx.stroke();
    // Кулак
    ctx.fillStyle = '#6a3c18'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.arc(ftX, ftY, s * 0.174, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ka = Math.PI * 0.5 + (i - 1) * 0.35;
      ctx.beginPath();
      ctx.moveTo(ftX + Math.cos(ka) * s * 0.090, ftY + Math.sin(ka) * s * 0.090);
      ctx.lineTo(ftX + Math.cos(ka) * s * 0.158, ftY + Math.sin(ka) * s * 0.158);
      ctx.stroke();
    }
  }

  // ── ТІЛО — 3 шари (темні краї → середній → центральний відблиск) ─
  if (inFight) { ctx.shadowColor = 'rgba(200,40,0,0.40)'; ctx.shadowBlur = s * 0.22; }

  // Шар 1: темна основа — перевернута трапеція (широкі плечі зверху)
  ctx.fillStyle = '#4e2408';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + hipW,              bodyBot);
  ctx.lineTo(bX - hipW,              bodyBot);
  ctx.closePath(); ctx.fill();

  // Шар 2: середній тон (трохи менша всередині)
  ctx.fillStyle = '#7a4020';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.74 + tilt, bodyTop + bodyH * 0.05);
  ctx.lineTo(bX + shW * 0.74 + tilt, bodyTop + bodyH * 0.05);
  ctx.lineTo(bX + hipW * 0.78,       bodyBot - bodyH * 0.04);
  ctx.lineTo(bX - hipW * 0.78,       bodyBot - bodyH * 0.04);
  ctx.closePath(); ctx.fill();

  // Шар 3: центральний відблиск (ефект 3D)
  ctx.fillStyle = '#9a5228';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.22 + tilt, bodyTop + bodyH * 0.07);
  ctx.lineTo(bX + shW * 0.22 + tilt, bodyTop + bodyH * 0.07);
  ctx.lineTo(bX + hipW * 0.34,       bodyBot - bodyH * 0.10);
  ctx.lineTo(bX - hipW * 0.34,       bodyBot - bodyH * 0.10);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;

  // Обводка тіла
  ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.050; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + hipW,              bodyBot);
  ctx.lineTo(bX - hipW,              bodyBot);
  ctx.closePath(); ctx.stroke();

  // Грудні дуги + лінія живота
  ctx.strokeStyle = 'rgba(22,8,2,0.55)'; ctx.lineWidth = s * 0.026; ctx.lineCap = 'round';
  const pCX = bX + tilt * 0.55, pCY = bodyTop + bodyH * 0.24;
  [-1, 1].forEach(side => {
    ctx.beginPath(); ctx.arc(pCX + side * shW * 0.22, pCY, shW * 0.24, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(22,8,2,0.38)'; ctx.lineWidth = s * 0.018;
  ctx.beginPath(); ctx.moveTo(pCX, pCY + bodyH * 0.18); ctx.lineTo(pCX, bodyBot - bodyH * 0.14); ctx.stroke();

  // Пучки шерсті
  ctx.strokeStyle = '#2a1006'; ctx.lineWidth = s * 0.020; ctx.lineCap = 'round';
  const furCX = pCX, furCY = bodyTop + bodyH * 0.42;
  [[-0.16, 0, -0.23, -0.15], [0, 0, 0, -0.19], [0.16, 0, 0.23, -0.15],
   [-0.09, 0.16, -0.14, 0.01], [0.09, 0.16, 0.12, 0.01]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(furCX + x1*s, furCY + y1*s); ctx.lineTo(furCX + x2*s, furCY + y2*s); ctx.stroke();
  });

  // ── ШИЯ ─────────────────────────────────────────────────────────
  const neckW = s * 0.192;
  ctx.fillStyle = '#6a3818'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.034;
  ctx.beginPath();
  ctx.moveTo(bX - neckW + tilt * 0.58,        bodyTop + s * 0.014);
  ctx.lineTo(bX + neckW + tilt * 0.58,        bodyTop + s * 0.014);
  ctx.lineTo(bX + neckW * 0.76 + tilt * 0.78, neckTopY + s * 0.014);
  ctx.lineTo(bX - neckW * 0.76 + tilt * 0.78, neckTopY + s * 0.014);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Шийний м'яз
  ctx.strokeStyle = 'rgba(22,8,2,0.48)'; ctx.lineWidth = s * 0.018; ctx.lineCap = 'round';
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(bX + side * neckW * 0.45 + tilt * 0.60, bodyTop + s * 0.020);
    ctx.lineTo(bX + side * neckW * 0.30 + tilt * 0.76, neckTopY + s * 0.014);
    ctx.stroke();
  });

  // ── БЛИЖНЯ РУКА ─────────────────────────────────────────────────
  {
    const side = dir;
    const shX = bX + side * shW * 0.78 + tilt * 0.88;
    const shY = bodyTop + s * 0.020;
    const cpX = shX + side * s * 0.30;
    const cpY = shY + s * 0.42;
    const ftX = shX + side * s * 0.22 - armSwing * dir * s * 0.28;
    const ftY = shY + s * 0.78;

    const elbX = cpX, elbY = cpY;
    ctx.lineCap = 'round';
    // Верхня рука (товща)
    ctx.strokeStyle = '#8a5028'; ctx.lineWidth = s * 0.240;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(elbX, elbY); ctx.stroke();
    // Передпліччя (тонше)
    ctx.strokeStyle = '#8a5028'; ctx.lineWidth = s * 0.182;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();
    // Відблиски
    ctx.strokeStyle = '#aa6635'; ctx.lineWidth = s * 0.115;
    ctx.beginPath(); ctx.moveTo(shX - dir*s*0.040, shY); ctx.lineTo(elbX - dir*s*0.030, elbY); ctx.stroke();
    ctx.strokeStyle = '#aa6635'; ctx.lineWidth = s * 0.082;
    ctx.beginPath(); ctx.moveTo(elbX - dir*s*0.030, elbY); ctx.lineTo(ftX - dir*s*0.018, ftY - s*0.04); ctx.stroke();
    ctx.fillStyle = '#aa6635'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.030;
    ctx.beginPath(); ctx.arc(ftX, ftY, s * 0.174, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ka = Math.PI * 0.5 + (i - 1) * 0.35;
      ctx.beginPath();
      ctx.moveTo(ftX + Math.cos(ka) * s * 0.090, ftY + Math.sin(ka) * s * 0.090);
      ctx.lineTo(ftX + Math.cos(ka) * s * 0.158, ftY + Math.sin(ka) * s * 0.158);
      ctx.stroke();
    }
  }

  // ── ГОЛОВА (rotate для атаки рогами) ─────────────────────────────
  ctx.save();
  ctx.translate(hcX, headY);
  ctx.rotate(dipAngle);

  // Вуха
  [-1, 1].forEach(side => {
    const eX = side * headR * 0.92, eY = -headR * 0.08;
    ctx.fillStyle = '#6a3818'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.026;
    ctx.beginPath();
    ctx.moveTo(eX, eY);
    ctx.bezierCurveTo(eX + side*headR*0.52, eY - headR*0.45,
                      eX + side*headR*0.70, eY + headR*0.26,
                      eX + side*headR*0.30, eY + headR*0.40);
    ctx.quadraticCurveTo(eX, eY + headR*0.22, eX, eY);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b05538';
    ctx.beginPath();
    ctx.moveTo(eX + side*headR*0.08, eY + headR*0.07);
    ctx.bezierCurveTo(eX + side*headR*0.34, eY - headR*0.24,
                      eX + side*headR*0.46, eY + headR*0.16,
                      eX + side*headR*0.20, eY + headR*0.28);
    ctx.quadraticCurveTo(eX + side*headR*0.06, eY + headR*0.18,
                         eX + side*headR*0.08, eY + headR*0.07);
    ctx.closePath(); ctx.fill();
  });

  // Голова (основа)
  if (inFight) { ctx.shadowColor = 'rgba(160,30,0,0.32)'; ctx.shadowBlur = s * 0.16; }
  ctx.fillStyle = '#8a5025'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.050;
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Відблиск щоки
  ctx.fillStyle = 'rgba(154,84,42,0.40)';
  ctx.beginPath(); ctx.ellipse(-dir * headR * 0.28, -headR * 0.10, headR * 0.35, headR * 0.30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── РОГИ — великі, класична бича крива ──────────────────────────
  [-1, 1].forEach(side => {
    const bx  =  side * headR * 0.75,  by  = -headR * 0.40;
    const cpx =  side * headR * 2.80,  cpy = -headR * 0.60;
    const tx  =  side * headR * 2.00,  ty  = -headR * 2.40;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4a2a06'; ctx.lineWidth = headR * 0.48;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(cpx, cpy, tx, ty); ctx.stroke();
    ctx.strokeStyle = '#c49030'; ctx.lineWidth = headR * 0.30;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(cpx, cpy, tx, ty); ctx.stroke();
    const mx = bx + (cpx - bx) * 0.50, my = by + (cpy - by) * 0.50;
    ctx.strokeStyle = '#ead87a'; ctx.lineWidth = headR * 0.100;
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(cpx, cpy, tx, ty); ctx.stroke();
  });

  // V-брова — малюємо ДО голови щоб вона виступала над очима
  const browY = -headR * 0.10;
  // Тінь брови (темна підкладка)
  ctx.strokeStyle = '#180604'; ctx.lineWidth = s * 0.130; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-headR * 1.08, browY - headR * 0.50);
  ctx.lineTo(0,              browY + headR * 0.08);
  ctx.lineTo( headR * 1.08, browY - headR * 0.50);
  ctx.stroke();
  // Основна брова
  ctx.strokeStyle = '#3a1208'; ctx.lineWidth = s * 0.095;
  ctx.beginPath();
  ctx.moveTo(-headR * 1.05, browY - headR * 0.46);
  ctx.lineTo(0,              browY + headR * 0.05);
  ctx.lineTo( headR * 1.05, browY - headR * 0.46);
  ctx.stroke();
  // Відблиск верхнього краю
  ctx.strokeStyle = 'rgba(180,130,70,0.45)'; ctx.lineWidth = s * 0.028;
  ctx.beginPath();
  ctx.moveTo(-headR * 1.02, browY - headR * 0.52);
  ctx.lineTo(-headR * 0.05, browY + headR * 0.02);
  ctx.stroke();

  // Морда — спочатку (очі малюватимуться зверху)
  // Розміщена НИЖЧЕ середини голови, не перекриває очі
  const mzY = headR * 0.52, mzX = dir * headR * 0.16;
  const mzW = muzzR * 0.95, mzH = muzzR * 0.68;
  ctx.fillStyle = '#7a4520'; ctx.strokeStyle = '#2a1008'; ctx.lineWidth = s * 0.036;
  ctx.beginPath(); ctx.ellipse(mzX, mzY, mzW, mzH, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9a5a2e';
  ctx.beginPath(); ctx.ellipse(mzX, mzY - mzH*0.10, mzW*0.72, mzH*0.60, 0, 0, Math.PI*2); ctx.fill();

  // Ніздрі
  const snortF = inFight ? (Math.sin(unit._mtT * 6.5) * 0.5 + 0.5) : 0;
  ctx.fillStyle = '#1a0806';
  [-1, 1].forEach(side => {
    const nx = mzX + side * mzW * 0.36;
    ctx.beginPath(); ctx.ellipse(nx, mzY - mzH*0.10, mzW*0.22, mzH*0.28, side*0.32, 0, Math.PI*2); ctx.fill();
    if (snortF > 0.50 && inFight) {
      const pA = (snortF - 0.50) * 0.80;
      ctx.fillStyle = `rgba(255,255,255,${pA})`;
      ctx.beginPath(); ctx.arc(nx + dir*mzW*0.26, mzY - mzH*0.58, mzW*0.19*snortF, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(nx + dir*mzW*0.44, mzY - mzH*0.80, mzW*0.12*snortF, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a0806';
    }
  });

  // Кільце в носі
  ctx.strokeStyle = '#d0d0e0'; ctx.lineWidth = s * 0.030; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.arc(mzX, mzY + mzH*0.24, mzW*0.28, Math.PI*0.10, Math.PI*0.90); ctx.stroke();

  // Очі — ПІСЛЯ морди, завжди поверх
  const eyeY = browY + headR * 0.48, eyeSpX = headR * 0.48, eyeRr = headR * 0.240;
  [-1, 1].forEach(side => {
    const ex = side * eyeSpX;
    ctx.shadowColor = '#ff2200'; ctx.shadowBlur = inFight ? s * 0.52 : s * 0.22;
    ctx.fillStyle = atkActive ? '#ff7700' : (inFight ? '#ee2200' : '#cc1800');
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#060000';
    ctx.beginPath(); ctx.arc(ex + dir*eyeRr*0.32, eyeY + eyeRr*0.08, eyeRr*0.52, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,60,0.72)';
    ctx.beginPath(); ctx.arc(ex - eyeRr*0.36, eyeY - eyeRr*0.36, eyeRr*0.24, 0, Math.PI*2); ctx.fill();
  });

  ctx.restore(); // кінець блоку голови

  // ── AoE ground sweep ring ─────────────────────────────────────────
  if (unit._mtRingT > 0) {
    const rp    = 1 - unit._mtRingT;
    const isAoe = unit._mtAoeT > 0;
    const rad   = s * (isAoe ? 0.60 : 0.28) + rp * s * (isAoe ? 1.90 : 1.10);
    const alp   = unit._mtRingT * 0.95;
    ctx.strokeStyle = `rgba(${isAoe ? '255,80,0' : '210,55,0'},${alp})`;
    ctx.lineWidth   = s * (isAoe ? 0.080 : 0.052) * unit._mtRingT;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, fY - s * 0.12, rad, 0, Math.PI * 2); ctx.stroke();
    if (isAoe && unit._mtRingT > 0.42) {
      const rad2 = s * 0.28 + rp * s * 0.88;
      const alp2 = (unit._mtRingT - 0.42) / 0.58 * 0.58;
      ctx.strokeStyle = `rgba(255,145,0,${alp2})`;
      ctx.lineWidth = s * 0.044;
      ctx.beginPath(); ctx.arc(cx, fY - s * 0.12, rad2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _mtBranch = unit._branch || '';
  if (_mtBranch === 'A') {
    // Berserker: blood crack lines from feet + rage aura
    ctx.strokeStyle = 'rgba(175,18,0,0.58)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (const [x0, x1, x2] of [[-0.30, -0.55, -0.82], [0.05, 0.32, 0.60], [0.38, 0.62, 0.78]]) {
      ctx.beginPath();
      ctx.moveTo(cx + x0*s, fY - 1); ctx.lineTo(cx + x1*s, fY + 2); ctx.lineTo(cx + x2*s, fY - 1);
      ctx.stroke();
    }
    ctx.save(); ctx.shadowColor = '#ff2200'; ctx.shadowBlur = s * 0.32;
    ctx.strokeStyle = 'rgba(200,28,0,0.22)'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.58, s*0.52, s*0.72, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_mtBranch === 'B') {
    // Defender: protective blue aura ring
    ctx.save(); ctx.shadowColor = '#4466ff'; ctx.shadowBlur = s * 0.28;
    const _rp = 0.72 + Math.sin(_frameNow * 0.0018) * 0.04;
    ctx.strokeStyle = 'rgba(55,100,225,0.38)'; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.55, s*_rp, s*_rp*0.88, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,150,255,0.16)'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.55, s*_rp*1.14, s*_rp*1.02, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }

  unit._hpBarY = headY - dipAngle * headR - headR * 1.85;
  ctx.restore();
}
