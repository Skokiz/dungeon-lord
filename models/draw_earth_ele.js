// ═══════════════════════════════════════════════════════════════════════════
//  EARTH ELEMENTAL — рівень 12, здібність: knockback (відкидання)
//  Кам'яний велетень: нерівне тіло, магма-очі, орбітальні уламки, пил при русі.
//  Атака: підйом руки → удар → хвиля + тріщини.
// ═══════════════════════════════════════════════════════════════════════════
function drawEarthEleMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._eeLastT || _frameNow)) / 1000, 0.05);
  unit._eeLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._eeDir === undefined) {
    unit._eeDir = 1; unit._eePrevX = cx;
    unit._eePrevAcd = unit.attackCooldown;
    unit._eeT = 0; unit._eeAp = 0;
    unit._eeShockT = 0; unit._eeSlammed = false;
    // Orbiting rock fragments
    unit._eeOrbRocks = Array.from({length: 4}, (_, i) => ({
      ang:    (i / 4) * Math.PI * 2 + Math.random() * 0.5,
      rBias:  0.88 + Math.random() * 0.18,
      yBias:  Math.random() - 0.5,
      size:   0.6 + Math.random() * 0.6,
      spin:   Math.random() * Math.PI * 2
    }));
    // Dust motes falling
    unit._eeDust = Array.from({length: 6}, () => ({
      x:    (Math.random() - 0.5) * 0.8,
      y:    Math.random(),
      vy:   0.20 + Math.random() * 0.18,
      life: Math.random(),
      size: 0.5 + Math.random() * 0.5
    }));
  }
  if (Math.abs(cx - unit._eePrevX) > 0.2)
    unit._eeDir = cx > unit._eePrevX ? 1 : -1;
  unit._eePrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._eeDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._eeDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._eePrevAcd || 0) + 3) {
    unit._eeAp = 1.0; unit._eeSlammed = false;
  }
  unit._eePrevAcd = acd;
  unit._eeT += dt;

  const atkDur = Math.min(0.70, atkBase / 60 * 0.88);
  if (unit._eeAp > 0)     unit._eeAp     = Math.max(0, unit._eeAp     - dt / atkDur);
  if (unit._eeShockT > 0) unit._eeShockT = Math.max(0, unit._eeShockT - dt * 0.95);

  const atkActive = unit._eeAp > 0;
  const ap        = 1 - unit._eeAp;
  const inFight   = unit.state === 'fight' || atkActive;

  // ── Attack sub-phases (eased): anticipation coil → explosive slam → impact → recover ──
  let windE = 0, slamE = 0, impE = 0, recE = 0;
  if (atkActive) {
    if (ap < 0.36)      { const t = ap / 0.36;          windE = 1 - Math.pow(1 - t, 2.4); }   // slow coil-up (ease-out)
    else if (ap < 0.49) { const t = (ap - 0.36) / 0.13; slamE = t * t; windE = 1 - slamE; }    // fast slam down (ease-in)
    else if (ap < 0.57) { impE = 1; slamE = 1; }                                               // impact hold
    else                { const t = (ap - 0.57) / 0.43; recE = 1 - Math.pow(1 - t, 2); slamE = 1 - recE; }
  }

  if (atkActive && ap >= 0.47 && !unit._eeSlammed) {                                            // shock fires at impact
    unit._eeShockT = 1.0; unit._eeSlammed = true;
  }

  // ── Proportions ──────────────────────────────────────────────────
  const shW   = s * 0.730;
  const hipW  = s * 0.445;
  const bodyH = s * 0.510;
  const legH  = s * 0.265;
  const headR = s * 0.262;
  const neckH = s * 0.052;

  const breathe = Math.sin(unit._eeT * 0.88) * s * 0.009;

  // ── Heavy walk cycle — a slow lumbering march with a big side-to-side weight-shift ──
  const isWalk   = unit.state === 'move';
  const walkFreq = 1.15;
  const wPh      = isWalk ? (unit._eeT * walkFreq) % 1 : 0;                              // 0..1 gait phase
  const wSway    = isWalk ? Math.sin(wPh * Math.PI * 2) * s * 0.05 : 0;                  // rock body onto stance leg
  const wBob     = isWalk ? (0.5 - 0.5 * Math.cos(wPh * Math.PI * 4)) * s * 0.030 : 0;   // drop on each foot-plant (2×)
  const wLeanTop = isWalk ? Math.sin(wPh * Math.PI * 2) * s * 0.018 : 0;                 // upper body rocks a touch more

  // ── Attack body dynamics: coil back+down → lunge forward → impact compress ──
  const atkLean  = atkActive ? (-dir * windE * s * 0.06 + dir * slamE * s * 0.13) : 0;
  const atkSquat = atkActive ? (windE * s * 0.05 + impE * s * 0.055) : 0;

  // Earthquake branch — a constant high-freq tremor shakes the mass over its planted feet
  const _quakeA = unit._branch === 'A';
  const quakeX  = _quakeA ? Math.sin(unit._eeT * 46) * s * 0.007 : 0;
  const quakeY  = _quakeA ? Math.cos(unit._eeT * 58) * s * 0.005 : 0;
  const bX      = cx + wSway + atkLean + quakeX;
  const bodyBot = fY - legH + wBob + atkSquat + quakeY;
  const bodyTop = bodyBot - bodyH;
  const neckTop = bodyTop - neckH;
  const headCY  = neckTop - headR * 0.48 + breathe - wBob * 0.35
                + (isWalk ? Math.sin(wPh * Math.PI * 2 - 0.5) * s * 0.012 : 0);          // head nestled deep into the shoulders
  const tilt    = dir * s * 0.022 + wLeanTop
                + (atkActive ? (-dir * windE * s * 0.03 + dir * slamE * s * 0.05) : 0);  // pitch into the swing

  // Where the slam fist lands — the shockwave pulse and the fist pose both use this,
  // so the ripple always starts directly under the punching fist.
  const _atkShX   = bX + dir * shW * 0.82 + tilt * 0.10;
  const slamFistX = _atkShX + dir * s * 0.30;
  const slamFistY = fY - s * 0.08;                        // fist drives down to just above the ground

  ctx.save();

  // ── Ground shadow ─────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(25,12,0,0.42)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.018, s * 0.54, s * 0.078, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Ground cracks radiating (passive, emphasizes weight) ─────────
  ctx.strokeStyle = 'rgba(40,20,5,0.45)';
  ctx.lineWidth = s * 0.010; ctx.lineCap = 'round';
  for (let ci = 0; ci < 3; ci++) {
    const cAng = (ci / 3) * Math.PI + Math.PI * 0.1;
    const cLen = s * (0.30 + 0.06 * Math.sin(unit._eeT * 0.4 + ci));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(cAng) * s * 0.18, fY + Math.sin(cAng) * s * 0.02);
    ctx.lineTo(cx + Math.cos(cAng) * (s * 0.18 + cLen) + Math.sin(cAng) * s * 0.04,
               fY + Math.sin(cAng) * (s * 0.02 + cLen * 0.3));
    ctx.stroke();
  }

  // ── Step dust — a puff kicks up under the foot that just planted ─────
  if (isWalk) {
    const plantPh = wPh % 0.5;                          // each leg plants at phase 0
    if (plantPh < 0.14) {
      const pa = (1 - plantPh / 0.14);
      const plantSide = wPh < 0.5 ? -1 : 1;
      ctx.fillStyle = `rgba(126,90,52,${(0.42 * pa).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(cx + plantSide * hipW * 0.5, fY + s * 0.008, s * (0.11 + (1 - pa) * 0.08), s * 0.032, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Dust motes falling from body ─────────────────────────────────
  unit._eeDust.forEach(d => {
    d.y += d.vy * dt;
    d.life -= dt * 0.25;
    if (d.y > 1.1 || d.life <= 0) {
      d.y = -0.05; d.x = (Math.random() - 0.5) * 0.8;
      d.vy = 0.20 + Math.random() * 0.18;
      d.life = 1; d.size = 0.5 + Math.random() * 0.5;
    }
    const dy = bodyTop + d.y * (fY - bodyTop);
    const dx = bX + d.x * shW * 0.55;
    const dAlpha = d.life * 0.55;
    ctx.fillStyle = `rgba(140,100,60,${dAlpha})`;
    ctx.beginPath();
    ctx.arc(dx, dy, s * 0.010 * d.size, 0, Math.PI * 2); ctx.fill();
  });

  // ── Shockwave + cracks (from slam) ────────────────────────────────
  if (unit._eeShockT > 0 || (_quakeA && inFight)) {
    // Earthquake keeps a restrained fault telegraph while engaging; the real
    // hit still spikes to st=1 through _eeShockT. This ensures the branch reads
    // as a ground-slam even in the key pose before the one-frame impact.
    const st    = unit._eeShockT > 0
      ? unit._eeShockT
      : (0.48 + 0.10 * Math.sin(unit._eeT * 8));
    const impX  = slamFistX;                 // pulse starts under the fist
    const impY  = fY + s * 0.005;

    ctx.strokeStyle = `rgba(160,100,30,${st * 0.72})`;
    ctx.lineWidth   = s * 0.022;
    const rr = s * (0.18 + (1 - st) * 0.95);
    ctx.beginPath();
    ctx.ellipse(impX, impY, rr, rr * 0.30, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(80,45,10,${st * 0.65})`;
    ctx.lineWidth = s * 0.016;
    const crackAngles = [0, 0.28, -0.28, 0.55, -0.55];
    crackAngles.forEach(ca => {
      const cLen = s * (0.22 + Math.abs(ca) * 0.15) * (0.6 + (1 - st) * 0.8);
      ctx.beginPath();
      ctx.moveTo(impX, impY);
      ctx.lineTo(impX + Math.cos(ca) * dir * cLen, impY + Math.sin(Math.abs(ca)) * cLen * 0.35);
      ctx.stroke();
    });

    if (st > 0.55) {
      ctx.strokeStyle = `rgba(210,140,50,${(st - 0.55) * 2 * 0.55})`;
      ctx.lineWidth   = s * 0.012;
      const rr2 = s * (0.10 + (1 - st) * 0.35);
      ctx.beginPath();
      ctx.ellipse(impX, impY, rr2, rr2 * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // kicked-up dust cloud rising from the impact
    const dp = 1 - st;
    ctx.fillStyle = `rgba(150,112,68,${(st * 0.38).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(impX, impY - dp * s * 0.16, s * (0.12 + dp * 0.20), s * (0.05 + dp * 0.07), 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(170,130,82,${(st * 0.28).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(impX - dir * s * 0.06, impY - dp * s * 0.22, s * (0.07 + dp * 0.12), s * (0.035 + dp * 0.05), 0, 0, Math.PI * 2); ctx.fill();

    if (_quakeA) {
      // Hot fault core + chunks thrust upward from the exact fist contact.
      ctx.save(); ctx.shadowColor='#ff9a28'; ctx.shadowBlur=s*0.16*st;
      ctx.strokeStyle=`rgba(255,170,52,${(0.82*st).toFixed(3)})`; ctx.lineWidth=s*0.018;
      ctx.beginPath(); ctx.moveTo(impX-dir*s*0.38,impY); ctx.lineTo(impX-dir*s*0.12,impY-s*0.025);
      ctx.lineTo(impX,impY); ctx.lineTo(impX+dir*s*0.24,impY-s*0.035);
      ctx.lineTo(impX+dir*s*0.54,impY+s*0.002); ctx.stroke();
      ctx.fillStyle=`rgba(139,88,36,${(0.82*st).toFixed(3)})`;
      for (const [ox,oy,rr,rot] of [[-0.25,-0.08,0.07,-0.5],[0.16,-0.12,0.085,0.35],[0.38,-0.055,0.055,0.7]]) {
        ctx.save(); ctx.translate(impX+dir*s*ox,impY+s*oy); ctx.rotate(rot*dir);
        ctx.beginPath(); ctx.moveTo(-s*rr,0); ctx.lineTo(0,-s*rr*1.8); ctx.lineTo(s*rr,0); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      ctx.restore();
    }
  }

  // (no fiery body bloom — an earth golem must not read as "on fire"; its heat
  //  lives only in the eyes and the molten cracks between the stones)

  // ── Legs ─────────────────────────────────────────────────────────
  // ── Faceted-stone helper: an irregular boulder shaded lit top-left → dark base.
  //    The whole golem is BUILT from these so it reads as fused rock, not panels. ──
  const _rr = (k) => { const x = Math.sin(k * 127.1) * 43758.5453; return x - Math.floor(x); };
  const boulder = (bx2, by2, rx, ry, seed, o) => {
    o = o || {};
    const n = o.n || 8, rot = o.rot || 0, P = [];
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2;
      const jit = 0.72 + 0.42 * _rr(seed * 3.3 + i);
      P.push({ x: bx2 + Math.cos(a) * rx * jit, y: by2 + Math.sin(a) * ry * jit });
    }
    ctx.beginPath();
    if (o.sharp) {                                             // angular, craggy granite facets
      ctx.moveTo(P[0].x, P[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(P[i].x, P[i].y);
    } else {                                                   // smoothed cobble
      ctx.moveTo((P[n-1].x + P[0].x) / 2, (P[n-1].y + P[0].y) / 2);
      for (let i = 0; i < n; i++) { const p = P[i], q = P[(i+1)%n]; ctx.quadraticCurveTo(p.x, p.y, (p.x+q.x)/2, (p.y+q.y)/2); }
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(bx2 - rx*0.7, by2 - ry*0.85, bx2 + rx*0.55, by2 + ry*0.9);
    g.addColorStop(0, o.lit || '#9c7038'); g.addColorStop(0.52, o.mid || '#6a4820'); g.addColorStop(1, o.occ || '#2c1d0b');
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(22,13,4,0.85)'; ctx.lineWidth = s * 0.011; ctx.lineJoin = 'round';
    ctx.fill(); ctx.stroke();
    if (o.facet !== false) {                                   // internal cleavage plane
      ctx.strokeStyle = 'rgba(24,14,5,0.4)'; ctx.lineWidth = s * 0.007; ctx.lineCap = 'round';
      const i1 = Math.max(2, Math.floor(n * 0.55));
      ctx.beginPath(); ctx.moveTo(P[1].x, P[1].y); ctx.lineTo(bx2 + rx*0.05, by2 + ry*0.02); ctx.lineTo(P[i1].x, P[i1].y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(205,166,96,0.5)'; ctx.lineWidth = s * 0.009; ctx.lineCap = 'round';   // chipped bright edge (top-left)
    const s0 = Math.floor(n * 0.60);
    ctx.beginPath(); ctx.moveTo(P[s0 % n].x, P[s0 % n].y);
    for (let i = 1; i <= 3; i++) { const p = P[(s0 + i) % n]; ctx.lineTo(p.x, p.y); }
    ctx.stroke();
    return P;
  };

  // ── EARTHQUAKE branch — shattered ground drawn UNDER the golem (before the legs)
  //    so the golem stands ON the cracked earth, magma glowing in the fissures. ──
  if (unit._branch === 'A') {
    const _qt = unit._eeT, _qp = 0.5 + 0.5 * Math.sin(_qt * 3.6);
    ctx.save();
    // Persistent FAINT cracked-ground aura — the golem always rests on broken earth
    // (subtle, so the bright molten spot below is what the eye reads on each step).
    const _fend = [];
    for (const [a0, len, sd] of [[0.30,0.60,11],[0.95,0.44,22],[1.75,0.32,33],[2.55,0.42,44],[-0.30,0.60,55],[-0.95,0.46,66],[-1.75,0.32,77],[Math.PI-0.32,0.44,88]]) {
      const pts = [{ x: cx, y: fY }]; let a = a0, rr = 0;
      for (let k = 1; k <= 4; k++) { rr += len * s / 4; a = a0 + (_rr(sd + k) - 0.5) * 0.7; pts.push({ x: cx + Math.cos(a) * rr, y: fY + Math.sin(a) * rr * 0.30 }); }
      ctx.strokeStyle = 'rgba(16,9,3,0.5)'; ctx.lineWidth = s * 0.02; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke();
      ctx.strokeStyle = `rgba(255,138,32,${(0.14 + _qp * 0.09).toFixed(3)})`; ctx.lineWidth = s * 0.006;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke();
      _fend.push(pts[pts.length - 1]);
    }
    ctx.strokeStyle = 'rgba(52,32,12,0.42)'; ctx.lineWidth = s * 0.006; ctx.lineCap = 'round';   // dim cross-cracks (plates)
    for (let i = 0; i < _fend.length; i++) {
      const p = _fend[i], q = _fend[(i + 1) % _fend.length];
      const p6 = { x: cx + (p.x - cx) * 0.58, y: fY + (p.y - fY) * 0.58 };
      const q6 = { x: cx + (q.x - cx) * 0.58, y: fY + (q.y - fY) * 0.58 };
      const mid = { x: (p6.x + q6.x) / 2 + (_rr(i * 9) - 0.5) * s * 0.05, y: (p6.y + q6.y) / 2 + (_rr(i * 5) - 0.5) * s * 0.02 };
      ctx.beginPath(); ctx.moveTo(p6.x, p6.y); ctx.lineTo(mid.x, mid.y); ctx.lineTo(q6.x, q6.y); ctx.stroke();
    }

    // ── MOLTEN QUAKE-SPOT — the ground cracks open UNDER THE FOOT the instant it
    //    plants, wells with magma, then cools and fades over ~1 second (one stride). ──
    if (isWalk) {
      [-1, 1].forEach(side => {
        const lp   = (wPh + (side === 1 ? 0.5 : 0)) % 1;   // 0 = just planted
        const life = 1 - lp;                                // 1 → 0 across one stride (~0.9s ≈ a second)
        if (life <= 0.03) return;
        const grow = Math.min(1, (1 - life) * 6);           // punches open fast on impact
        const footFwd = (0.5 - lp / 0.5) * s * 0.15 * dir;
        const fx = cx + side * hipW * 0.50 + side * s * 0.03 + footFwd, fy = fY + s * 0.012;
        const rad = s * (0.12 + grow * 0.13);
        // dark crater punched into the floor
        ctx.fillStyle = `rgba(9,5,2,${(0.44 * life).toFixed(3)})`;
        ctx.beginPath(); ctx.ellipse(fx, fy, rad, rad * 0.34, 0, 0, Math.PI * 2); ctx.fill();
        // molten glow welling up
        const gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, rad);
        gg.addColorStop(0, `rgba(255,198,92,${(0.64 * life).toFixed(3)})`);
        gg.addColorStop(0.5, `rgba(255,120,24,${(0.34 * life).toFixed(3)})`);
        gg.addColorStop(1, 'rgba(255,100,10,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(fx, fy, rad, rad * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        // jagged cracks bursting outward from the impact
        for (let i = 0; i < 5; i++) {
          const a = 0.28 + i * (2.58 / 4);
          const jit = (_rr(side * 3 + i) - 0.5) * 0.55;
          const clen = s * (0.13 + _rr(side + i * 2) * 0.055) * (0.4 + grow * 0.7);
          const mx = fx + Math.cos(a) * clen * 0.55, my = fy + Math.sin(a) * clen * 0.55 * 0.32;
          const ex = fx + Math.cos(a + jit) * clen, ey = fy + Math.sin(a + jit) * clen * 0.32;
          ctx.strokeStyle = `rgba(22,12,3,${(0.6 * life).toFixed(3)})`; ctx.lineWidth = s * 0.015; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.save(); ctx.shadowColor = '#ff7a1e'; ctx.shadowBlur = s * 0.06;
          ctx.strokeStyle = `rgba(255,142,32,${(0.5 * life).toFixed(3)})`; ctx.lineWidth = s * 0.006;
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.restore();
        }
      });
    }
    ctx.restore();
  }

  // ── Legs — squat rock columns that STEP: feet plant in world space (cx) while
  //    the body rocks over them; each leg lifts + swings a half-cycle out of phase. ──
  [-1, 1].forEach(side => {
    const lp = isWalk ? ((wPh + (side === 1 ? 0.5 : 0)) % 1) : 0;
    let footFwd = 0, lift = 0;
    if (isWalk) {
      if (lp < 0.5) { const t = lp / 0.5;         footFwd = (0.5 - t) * s * 0.15 * dir; }                                   // stance: front → back
      else          { const t = (lp - 0.5) / 0.5; footFwd = (-0.5 + t) * s * 0.15 * dir; lift = Math.sin(t * Math.PI) * s * 0.085; } // swing: lift + forward
    }
    const atkFoot = (atkActive && side === dir) ? slamE * s * 0.09 * dir : 0;   // front foot lunges on the slam
    const hipX  = bX + side * hipW * 0.50 + tilt * 0.22;
    const hipY  = bodyBot - s * 0.02;
    const footX = cx + side * hipW * 0.50 + side * s * 0.03 + footFwd + atkFoot;
    const footY = fY - s * 0.02 - lift;
    const midX  = (hipX + footX) / 2, midY = (hipY + footY) / 2;
    const legLen = Math.hypot(footX - hipX, footY - hipY);
    boulder(midX, midY, s * 0.155, legLen * 0.55 + s * 0.06, side * 13.1 + 2, { n: 7, mid:'#5e3f1c', lit:'#886030', sharp:true });   // thigh/shin mass (beefier)
    boulder(footX, footY, s * 0.180, s * 0.086, side * 7.7 + 5, { n: 7, mid:'#4a3315', lit:'#6e4c22', occ:'#1c1206', facet:false, sharp:true }); // wide foot
  });

  // ── Body — a fused mass of boulders: hips, a heavy torso core, huge shoulders ──
  const bcx = bX + tilt, bcy = (bodyTop + bodyBot) / 2;
  boulder(bcx, bodyBot - bodyH*0.14, hipW*1.20, bodyH*0.38, 4.2,  { n: 7, mid:'#5c3e1b', lit:'#886030', sharp:true });        // hips / base
  boulder(bcx, bcy + bodyH*0.04,     shW*0.60,  bodyH*0.62, 9.1,  { n: 9, mid:'#6a4820', lit:'#9c7038', sharp:true });        // torso core
  boulder(bX - shW*0.66 + tilt, bodyTop + bodyH*0.14, shW*0.40, bodyH*0.46, 21.3, { n: 7, mid:'#5a3d1a', lit:'#8a6030', sharp:true }); // L shoulder (bigger)
  boulder(bX + shW*0.66 + tilt, bodyTop + bodyH*0.14, shW*0.40, bodyH*0.46, 15.8, { n: 7, mid:'#5a3d1a', lit:'#8a6030', sharp:true }); // R shoulder
  boulder(bX - shW*0.16 + tilt, bodyTop + bodyH*0.34, shW*0.24, bodyH*0.28, 33.0, { n: 6, mid:'#6e4c22', lit:'#a0743a', facet:false }); // chest chunk

  // ── Molten core glowing through the fissures (the elemental's heart) ──
  {
    const _mg = 0.55 + 0.45 * Math.sin(unit._eeT * 1.9);
    const coreX = bcx, coreY = bcy + bodyH*0.04;
    ctx.save();
    ctx.shadowColor = '#ff8a1e'; ctx.shadowBlur = s * (0.12 + (inFight ? 0.07 : 0));
    ctx.strokeStyle = `rgba(255,140,34,${(0.48 + _mg*0.30).toFixed(3)})`; ctx.lineWidth = s*0.014; ctx.lineCap='round'; ctx.lineJoin='round';
    for (const [a, l] of [[-2.4,0.34],[-0.7,0.30],[0.5,0.36],[2.5,0.28],[1.7,0.24]]) {
      const mx2 = coreX + Math.cos(a)*l*s*0.5, my2 = coreY + Math.sin(a)*l*s*0.46;
      ctx.beginPath(); ctx.moveTo(coreX, coreY); ctx.lineTo(mx2, my2);
      ctx.lineTo(mx2 + Math.cos(a+0.4)*l*s*0.26, my2 + Math.sin(a+0.4)*l*s*0.24); ctx.stroke();
    }
    const cg = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, s*0.13);
    cg.addColorStop(0, `rgba(255,236,152,${(0.85*_mg+0.12).toFixed(3)})`);
    cg.addColorStop(0.5, `rgba(255,140,24,${(0.6*_mg+0.2).toFixed(3)})`);
    cg.addColorStop(1, 'rgba(200,50,0,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(coreX, coreY, s*0.13, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ── Moss on the shaded stone ──
  ctx.fillStyle = 'rgba(46,74,22,0.6)';
  ctx.beginPath(); ctx.ellipse(bX - shW*0.50 + tilt, bodyTop + bodyH*0.22, s*0.062, s*0.032, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bX + shW*0.42 + tilt, bodyBot - bodyH*0.18, s*0.050, s*0.026,  0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bX + shW*0.10 + tilt, bodyTop + bodyH*0.08, s*0.034, s*0.018,  0.1, 0, Math.PI*2); ctx.fill();

  ctx.shadowBlur = 0;

  // ── Arms ─────────────────────────────────────────────────────────
  [-1, 1].forEach(side => {
    const isAtk = side === dir;
    const shX   = bX + side * shW * 0.82 + tilt * 0.10;
    const shY   = bodyTop + bodyH * 0.06;

    let elbX, elbY, fistX, fistY;
    // rest pose + a heavy contralateral swing while walking (arm opposes its own leg)
    const armPh = isWalk ? ((wPh + (side === 1 ? 0 : 0.5)) % 1) : 0;
    const armSw = isWalk ? Math.sin(armPh * Math.PI * 2) * s * 0.07 * dir : 0;
    const rElbX = shX + side * s * 0.28 + armSw * 0.6, rElbY = shY + s * 0.20;
    const rFiX  = shX + side * s * 0.20 + armSw,        rFiY  = shY + s * 0.45;
    if (isAtk && atkActive) {
      const uElbX = shX + side * s * 0.20 - dir * s * 0.04, uElbY = shY - s * 0.22;   // raised: coiled overhead
      const uFiX  = shX + side * s * 0.04 - dir * s * 0.06, uFiY  = shY - s * 0.66;
      const dElbX = shX + dir * s * 0.20, dElbY = shY + (slamFistY - shY) * 0.44;   // slammed: reaching down to the ground
      const dFiX  = slamFistX,            dFiY  = slamFistY;                         // fist punches the ground (pulse origin)
      if (recE > 0) {                                   // recover: slam → rest
        elbX = dElbX + (rElbX - dElbX) * recE; elbY = dElbY + (rElbY - dElbY) * recE;
        fistX = dFiX + (rFiX - dFiX) * recE;   fistY = dFiY + (rFiY - dFiY) * recE;
      } else if (slamE > 0 || impE) {                   // slam/impact: raised → slam
        elbX = uElbX + (dElbX - uElbX) * slamE; elbY = uElbY + (dElbY - uElbY) * slamE;
        fistX = uFiX + (dFiX - uFiX) * slamE;   fistY = uFiY + (dFiY - uFiY) * slamE;
      } else {                                          // windup: rest → raised
        elbX = rElbX + (uElbX - rElbX) * windE; elbY = rElbY + (uElbY - rElbY) * windE;
        fistX = rFiX + (uFiX - rFiX) * windE;   fistY = rFiY + (uFiY - rFiY) * windE;
      }
    } else {
      elbX = rElbX; elbY = rElbY; fistX = rFiX; fistY = rFiY;
    }

    // rocky limb: overlapping boulders shoulder → elbow → massive fist
    const m1x = (shX+elbX)/2, m1y = (shY+elbY)/2, m2x = (elbX+fistX)/2, m2y = (elbY+fistY)/2;
    boulder(shX,  shY,  s*0.140, s*0.140, side*5+40, { n:6, mid:'#5e3f1c', lit:'#886030', sharp:true });
    boulder(m1x,  m1y,  s*0.120, s*0.120, side*9+42, { n:6, mid:'#5a3d1a', lit:'#846028', sharp:true });
    boulder(elbX, elbY, s*0.124, s*0.124, side*3+44, { n:6, mid:'#5a3d1a', lit:'#846028', sharp:true });
    boulder(m2x,  m2y,  s*0.114, s*0.114, side*7+46, { n:6, mid:'#583b19', lit:'#805e26', sharp:true });
    boulder(fistX, fistY, s*0.172, s*0.160, side*11+48, { n:7, mid:'#5a3e18', lit:'#8a6230', sharp:true });   // big rock fist
    ctx.fillStyle = 'rgba(28,16,6,0.42)';                                                          // knuckle chips
    ctx.beginPath(); ctx.arc(fistX - side*s*0.045, fistY + s*0.02, s*0.028, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(fistX + side*s*0.03,  fistY + s*0.03, s*0.022, 0, Math.PI*2); ctx.fill();

    if (_quakeA && isAtk) {
      // The branch-defining seismic quartz is rooted in the striking arm, not
      // parked on the passive shoulder. It follows the fist through windup/slam.
      const a = Math.atan2(fistY-elbY, fistX-elbX);
      ctx.save(); ctx.translate(fistX, fistY); ctx.rotate(a);
      ctx.shadowColor='#f6a62e'; ctx.shadowBlur=s*0.10;
      for (const [ang,h,w] of [[-0.85,0.23,0.055],[-0.28,0.31,0.064],[0.25,0.22,0.050]]) {
        const tx=Math.cos(ang)*s*h, ty=Math.sin(ang)*s*h;
        const g=ctx.createLinearGradient(0,0,tx,ty);
        g.addColorStop(0,'#5a320c'); g.addColorStop(0.58,'#d88824'); g.addColorStop(1,'#ffe1a0');
        ctx.fillStyle=g; ctx.strokeStyle='rgba(34,17,3,0.92)'; ctx.lineWidth=s*0.009;
        ctx.beginPath(); ctx.moveTo(-Math.sin(ang)*s*w,Math.cos(ang)*s*w);
        ctx.lineTo(tx,ty); ctx.lineTo(Math.sin(ang)*s*w,-Math.cos(ang)*s*w); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }

    if (isAtk && (slamE > 0.45 || impE)) {
      const gl = impE ? 1 : slamE;
      ctx.save(); ctx.shadowColor = '#ff7a1e'; ctx.shadowBlur = s * gl * 0.42;
      ctx.fillStyle = `rgba(255,120,20,${(gl * 0.4).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(fistX, fistY, s * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  });

  // ── Head — nestled between the shoulders; trap rocks bridge the neck so it never
  //    floats. Heavy angular brow + two deep, SEPARATE eye sockets (no goggle strap). ──
  boulder(bX - shW*0.34 + tilt, bodyTop - headR*0.10, shW*0.30, bodyH*0.34, 71.0, { n:6, mid:'#563a18', lit:'#846028', sharp:true }); // trap L
  boulder(bX + shW*0.34 + tilt, bodyTop - headR*0.10, shW*0.30, bodyH*0.34, 77.0, { n:6, mid:'#563a18', lit:'#846028', sharp:true }); // trap R
  boulder(bX + tilt, headCY, headR*1.02, headR*0.96, 50.0, { n: 8, mid:'#6a4820', lit:'#9c7038', sharp:true });         // skull
  // heavy brow — a jagged overhang shadow that juts OVER the eyes (a scowl, not a cap)
  ctx.fillStyle = 'rgba(18,10,4,0.58)';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR*0.64, headCY - headR*0.16);
  ctx.lineTo(bX + tilt - headR*0.34, headCY - headR*0.36);
  ctx.lineTo(bX + tilt - headR*0.05, headCY - headR*0.22);
  ctx.lineTo(bX + tilt + headR*0.30, headCY - headR*0.36);
  ctx.lineTo(bX + tilt + headR*0.64, headCY - headR*0.16);
  ctx.lineTo(bX + tilt + headR*0.56, headCY - headR*0.02);
  ctx.lineTo(bX + tilt - headR*0.56, headCY - headR*0.02);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(190,150,88,0.5)'; ctx.lineWidth = s*0.011; ctx.lineCap='round'; ctx.lineJoin='round';  // lit brow ridge
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR*0.62, headCY - headR*0.17);
  ctx.lineTo(bX + tilt - headR*0.34, headCY - headR*0.35);
  ctx.lineTo(bX + tilt - headR*0.05, headCY - headR*0.21);
  ctx.lineTo(bX + tilt + headR*0.30, headCY - headR*0.35);
  ctx.lineTo(bX + tilt + headR*0.62, headCY - headR*0.17);
  ctx.stroke();
  // deep separate eye sockets under the brow
  ctx.fillStyle = 'rgba(13,7,3,0.62)';
  for (const sSide of [-1, 1]) {
    ctx.save(); ctx.translate(bX + tilt + sSide * headR * 0.48, headCY + headR * 0.02); ctx.rotate(sSide * -0.34);
    ctx.beginPath(); ctx.ellipse(0, 0, headR * 0.33, headR * 0.20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.shadowBlur = 0;

  // ── Eyes (magma cracks) ──────────────────────────────────────────
  const eyeW  = headR * 0.30;
  const eyeH  = headR * 0.125;
  const eyeSp = headR * 0.48;
  const eyeYY = headCY + headR * 0.02;
  const eyeGlow = inFight ? 0.90 : 0.58 + Math.sin(unit._eeT * 1.6) * 0.16;

  [-1, 1].forEach(side => {
    const ex = bX + tilt + side * eyeSp;
    const eyeFlash = impE ? 1 : (slamE > 0.4 ? slamE : 0);   // eyes flare at the slam impact

    ctx.shadowColor = eyeFlash > 0.3 ? '#ffcc22' : '#ff6600';
    ctx.shadowBlur  = s * (eyeFlash > 0.3 ? 0.26 : inFight ? 0.15 : 0.09);   // tight eye glow, no head halo
    const eyeTilt = side * -0.42;                          // outer corner up → hard angry scowl
    // angular glowing slit (a blade, not a round goggle lens)
    const slit = (w, h, col) => {
      ctx.save(); ctx.translate(ex, eyeYY); ctx.rotate(eyeTilt);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-w, h * 0.35); ctx.lineTo(-w * 0.35, -h); ctx.lineTo(w, -h * 0.35); ctx.lineTo(w * 0.35, h);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    slit(eyeW * 1.18, eyeH * 1.35, '#0c0502');                                            // dark socket backing
    const eyeR = Math.floor(90 + eyeGlow * 55);
    slit(eyeW, eyeH, eyeFlash > 0.4 ? 'rgba(255,212,44,0.95)' : `rgba(255,${eyeR},0,${(eyeGlow * 0.97).toFixed(3)})`);
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255,240,182,${(eyeGlow * 0.7).toFixed(3)})`;                    // hot inner core
    ctx.beginPath(); ctx.ellipse(ex, eyeYY, eyeW * 0.38, eyeH * 0.5, eyeTilt, 0, Math.PI * 2); ctx.fill();
  });

  // ── Orbiting rock fragments ───────────────────────────────────────
  unit._eeOrbRocks.forEach((rk, ri) => {
    rk.ang += dt * 0.45;
    rk.spin += dt * 0.7;
    const rCX = cx + Math.cos(rk.ang) * s * 0.62 * rk.rBias;
    const rCY = (headCY + bodyBot) / 2 + Math.sin(rk.ang) * s * 0.22 * rk.rBias + rk.yBias * s * 0.08;
    const rS = s * 0.048 * rk.size;
    // Behind body if sin < 0 (fainter), else in front
    const inFront = Math.sin(rk.ang) < 0;
    ctx.save();
    ctx.globalAlpha = inFront ? 0.85 : 0.45;
    ctx.translate(rCX, rCY);
    ctx.rotate(rk.spin);
    ctx.fillStyle = '#3a2810';
    ctx.beginPath();
    ctx.moveTo(-rS, 0);
    ctx.lineTo(-rS * 0.55, -rS * 0.88);
    ctx.lineTo(rS * 0.42, -rS * 0.70);
    ctx.lineTo(rS, rS * 0.15);
    ctx.lineTo(rS * 0.30, rS * 0.82);
    ctx.lineTo(-rS * 0.60, rS * 0.62);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a5528';
    ctx.beginPath();
    ctx.moveTo(-rS * 0.45, -rS * 0.30);
    ctx.lineTo(rS * 0.15, -rS * 0.42);
    ctx.lineTo(rS * 0.50, rS * 0.05);
    ctx.lineTo(-rS * 0.10, rS * 0.30);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  });

  // ── Branch visuals ──────────────────────────────────────────
  const _eeBranch = unit._branch || '';
  if (_eeBranch === 'A') {
    // ── EARTHQUAKE — the shattered ground (fissure web + magma pools + foot cracks)
    //    is drawn UNDER the golem earlier; here only the dust/heat drifting up front. ──
    const _t = unit._eeT;
    ctx.save();

    // Permanent seismic fault-lines grow out of the heart and climb one shoulder.
    // A dark lip makes them read as splits in stone; the narrow hot core supplies power.
    const faultPaths = [
      [[bcx,bcy+bodyH*0.04],[bcx-dir*s*0.10,bcy-bodyH*0.08],[bcx-dir*s*0.20,bodyTop+bodyH*0.18],[bX-dir*shW*0.58,bodyTop+bodyH*0.04]],
      [[bcx,bcy+bodyH*0.05],[bcx+dir*s*0.09,bcy+bodyH*0.18],[bcx+dir*s*0.18,bodyBot-bodyH*0.12]],
      [[bcx-dir*s*0.19,bodyTop+bodyH*0.18],[bcx-dir*s*0.31,bodyTop+bodyH*0.31]],
    ];
    faultPaths.forEach(path => {
      ctx.strokeStyle = 'rgba(34,16,4,0.90)'; ctx.lineWidth = s*0.040;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(path[0][0],path[0][1]);
      for (let i=1;i<path.length;i++) ctx.lineTo(path[i][0],path[i][1]);
      ctx.stroke();
      ctx.shadowColor = '#ff9a28'; ctx.shadowBlur = s*0.12;
      ctx.strokeStyle = 'rgba(255,164,48,0.88)'; ctx.lineWidth = s*0.012;
      ctx.beginPath(); ctx.moveTo(path[0][0],path[0][1]);
      for (let i=1;i<path.length;i++) ctx.lineTo(path[i][0],path[i][1]);
      ctx.stroke(); ctx.shadowBlur = 0;
    });

    // Seismic quartz armour: a large asymmetric cluster rooted in the strike shoulder.
    const qBaseX = bX + dir*shW*0.66 + tilt;
    const qBaseY = bodyTop + bodyH*0.05;
    const crystal = (x,y,h,w,lean,seed) => {
      const tx=x+Math.sin(lean)*h, ty=y-Math.cos(lean)*h;
      const g=ctx.createLinearGradient(x,y,tx,ty);
      g.addColorStop(0,'#4b2b0b'); g.addColorStop(0.42,'#b96d18');
      g.addColorStop(0.76,'#e7a83a'); g.addColorStop(1,'#ffe3a0');
      ctx.fillStyle=g; ctx.strokeStyle='rgba(35,18,4,0.88)'; ctx.lineWidth=s*0.010;
      ctx.beginPath();
      ctx.moveTo(x-Math.cos(lean)*w,y-Math.sin(lean)*w);
      ctx.lineTo(tx,ty);
      ctx.lineTo(x+Math.cos(lean)*w,y+Math.sin(lean)*w);
      ctx.lineTo(x+Math.sin(seed)*w*0.28,y+h*0.10);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,238,176,0.62)'; ctx.lineWidth=s*0.006;
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(x-Math.cos(lean)*w*0.30,y-Math.sin(lean)*w*0.30); ctx.stroke();
    };
    ctx.shadowColor='#f6a62e'; ctx.shadowBlur=s*0.10;
    crystal(qBaseX+dir*s*0.08,qBaseY+s*0.08,s*0.30,s*0.070, dir*0.58,1.2);
    crystal(qBaseX,           qBaseY,       s*0.38,s*0.085, dir*0.26,2.1);
    crystal(qBaseX-dir*s*0.10,qBaseY+s*0.07,s*0.27,s*0.065,-dir*0.10,3.4);
    crystal(qBaseX-dir*s*0.16,qBaseY+s*0.13,s*0.19,s*0.052,-dir*0.36,4.7);
    ctx.shadowBlur=0;

    // dust / heat wisps drifting up out of the cracks
    for (let i = 0; i < 4; i++) {
      const dp = ((_t * 0.5 + i * 0.27) % 1);
      const dx2 = cx + (i - 1.5) * s * 0.24 + Math.sin(_t * 1.5 + i) * s * 0.03;
      const dy2 = fY - dp * s * 0.5;
      const da = (1 - dp) * 0.26;
      ctx.fillStyle = `rgba(152,116,74,${da.toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(dx2, dy2, s * (0.03 + dp * 0.05), s * (0.02 + dp * 0.03), 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else if (_eeBranch === 'B') {
    // ── MOUNTAIN — an immovable stone fortress: cool granite hardens the flesh,
    //    mineral crystals armour its back, a rock-and-snow peak crowns its head. ──
    const _t = unit._eeT;
    ctx.save();
    // cool granite wash (overlay leaves the dark background untouched, only cools the stone)
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#8fa6b8';
    ctx.beginPath(); ctx.ellipse(bX + tilt, (bodyTop + bodyBot) / 2, shW * 0.66, bodyH * 0.68, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bX + tilt, headCY, headR, headR, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // jagged mineral crystals armouring the shoulders/back
    for (const [cxp, cyp, lean, sc] of [
      [bX - shW*0.72 + tilt, bodyTop + bodyH*0.12, -0.55, 0.9],
      [bX - shW*0.52 + tilt, bodyTop - bodyH*0.04, -0.28, 1.15],
      [bX + shW*0.52 + tilt, bodyTop - bodyH*0.01,  0.22, 1.10],
      [bX + shW*0.74 + tilt, bodyTop + bodyH*0.14,  0.52, 0.85],
    ]) {
      const h = s * 0.17 * sc, w = s * 0.048 * sc;
      const tx = cxp + Math.sin(lean) * h, ty = cyp - Math.cos(lean) * h;
      const g = ctx.createLinearGradient(cxp, cyp, tx, ty);
      g.addColorStop(0, '#43596b'); g.addColorStop(0.6, '#82a0b6'); g.addColorStop(1, '#d4e6f2');
      ctx.fillStyle = g; ctx.strokeStyle = 'rgba(18,28,38,0.6)'; ctx.lineWidth = s * 0.006;
      ctx.beginPath();
      ctx.moveTo(cxp - Math.cos(lean)*w, cyp - Math.sin(lean)*w);
      ctx.lineTo(tx, ty);
      ctx.lineTo(cxp + Math.cos(lean)*w, cyp + Math.sin(lean)*w);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // rock peak on the crown
    ctx.fillStyle = '#6b5738'; ctx.strokeStyle = 'rgba(20,12,4,0.6)'; ctx.lineWidth = s * 0.007;
    ctx.beginPath();
    ctx.moveTo(bX + tilt, headCY - headR*1.38);
    ctx.lineTo(bX + tilt - headR*0.60, headCY - headR*0.56);
    ctx.lineTo(bX + tilt + headR*0.60, headCY - headR*0.56);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // jagged snow cap on the peak
    ctx.fillStyle = 'rgba(236,245,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(bX + tilt, headCY - headR*1.38);
    ctx.lineTo(bX + tilt - headR*0.28, headCY - headR*1.00);
    ctx.lineTo(bX + tilt - headR*0.10, headCY - headR*1.08);
    ctx.lineTo(bX + tilt + headR*0.06, headCY - headR*0.98);
    ctx.lineTo(bX + tilt + headR*0.22, headCY - headR*1.04);
    ctx.closePath(); ctx.fill();
    // slow petrify sheen breathing over the stone
    const _pz = 0.5 + 0.5 * Math.sin(_t * 1.2);
    ctx.strokeStyle = `rgba(184,204,220,${(0.10 + _pz * 0.12).toFixed(3)})`; ctx.lineWidth = s * 0.018;
    ctx.beginPath(); ctx.ellipse(bX + tilt, (bodyTop + bodyBot) / 2, shW * 0.72, bodyH * 0.74, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headCY - headR * 1.25;
}
