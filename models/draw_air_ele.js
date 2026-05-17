// ═══════════════════════════════════════════════════════════════════════════
//  AIR ELEMENTAL — рівень 13, здібність: no_die (40% шанс пережити смерть)
//  Вихор без твердого тіла: 6 кручених вітрових потоків, дебрі, вітровий удар.
//  Ghost state (unit._transparent): повний fade + мерехтіння.
// ═══════════════════════════════════════════════════════════════════════════
function drawAirEleMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._aeLastT || _frameNow)) / 1000, 0.05);
  unit._aeLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._aeDir === undefined) {
    unit._aeDir = 1; unit._aePrevX = cx;
    unit._aePrevAcd = unit.attackCooldown;
    unit._aeT = 0; unit._aeAp = 0;
    unit._aeSeed = Math.random() * 100;
    // Wind streams (each is a helical band around the body axis)
    unit._aeStreams = Array.from({length: 6}, (_, i) => ({
      phaseOff: (i / 6) * Math.PI * 2,
      yBias:    i / 5,                 // 0 (top) → 1 (bottom)
      speed:    2.4 + (i % 2) * 0.6
    }));
    // Debris caught in the wind
    unit._aeDebris = Array.from({length: 8}, () => ({
      ang:   Math.random() * Math.PI * 2,
      r:     0.4 + Math.random() * 0.5,
      yBias: Math.random(),
      speed: 1.8 + Math.random() * 1.4,
      size:  0.5 + Math.random() * 0.5,
      life:  Math.random()
    }));
  }
  if (Math.abs(cx - unit._aePrevX) > 0.2)
    unit._aeDir = cx > unit._aePrevX ? 1 : -1;
  unit._aePrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._aeDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._aeDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._aePrevAcd || 0) + 3) unit._aeAp = 1.0;
  unit._aePrevAcd = acd;
  unit._aeT += dt;

  const atkDur = Math.min(0.58, atkBase / 60 * 0.75);
  if (unit._aeAp > 0) unit._aeAp = Math.max(0, unit._aeAp - dt / atkDur);

  const atkActive = unit._aeAp > 0;
  const ap        = 1 - unit._aeAp;
  const inFight   = unit.state === 'fight' || atkActive;

  const ghosted   = unit._transparent || false;
  const ghostFlicker = ghosted ? (0.40 + Math.sin(unit._aeT * 6) * 0.18) : 1.0;
  const globalA   = ghosted ? 0.35 : 1.0;

  const coilT   = atkActive && ap < 0.26 ? ap / 0.26 : 0;
  const slashT  = atkActive && ap >= 0.26 && ap < 0.62 ? (ap - 0.26) / 0.36 : 0;
  const expandT = atkActive && ap >= 0.62 ? Math.sin((ap - 0.62) / 0.38 * Math.PI) : 0;

  // ── Vortex geometry ──────────────────────────────────────────────
  const floatY = Math.sin(unit._aeT * 1.90) * s * 0.035;
  const vortexTopY = fY - s * 0.90 + floatY;
  const vortexBotY = fY - s * 0.010;
  const vortexH = vortexBotY - vortexTopY;
  const bX = cx + coilT * dir * s * 0.018 - expandT * dir * s * 0.010;
  const focalCY = vortexTopY + vortexH * 0.40;   // where eyes sit

  // Width by height: narrow at top, wider at middle, narrowing toward bottom
  function widthAt(tt) {
    const profile = Math.sin(tt * Math.PI) * 0.82 + 0.12;
    return s * 0.38 * profile * (1 + expandT * 0.12 - coilT * 0.10);
  }

  ctx.save();
  ctx.globalAlpha = globalA;

  // ── Ground wind gust (swirling dust ring) ───────────────────────
  for (let gi = 0; gi < 7; gi++) {
    const ga = unit._aeT * 2.2 + (gi / 7) * Math.PI * 2 + unit._aeSeed;
    const gr = s * (0.28 + 0.08 * Math.sin(unit._aeT * 1.8 + gi));
    const gx = cx + Math.cos(ga) * gr;
    const gy = fY + s * 0.006 + Math.sin(ga) * s * 0.028;
    const gAlpha = (0.35 + 0.22 * Math.sin(ga)) * ghostFlicker;
    ctx.fillStyle = `rgba(210,236,255,${gAlpha})`;
    ctx.beginPath();
    ctx.ellipse(gx, gy, s * 0.045, s * 0.018, ga, 0, Math.PI * 2);
    ctx.fill();
  }
  // Dust line
  ctx.strokeStyle = `rgba(170,215,255,${0.24 * ghostFlicker})`;
  ctx.lineWidth = s * 0.010;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.006, s * 0.40, s * 0.056, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ── Helical wind streams (6) — THE body ──────────────────────────
  // Each stream is a sinuous curve along the vertical axis
  unit._aeStreams.forEach((st, si) => {
    const lobes = 1.4;   // how many helical turns
    const streamAlpha = (0.50 + 0.18 * Math.sin(unit._aeT * 1.5 + si)) * ghostFlicker;
    // Draw stream with gradient thickness
    ctx.save();
    ctx.shadowColor = '#aaddff';
    ctx.shadowBlur = s * 0.18 * ghostFlicker;
    const grad = ctx.createLinearGradient(0, vortexTopY, 0, vortexBotY);
    grad.addColorStop(0,   'rgba(200,230,255,0)');
    grad.addColorStop(0.3, `rgba(210,238,255,${streamAlpha * 0.9})`);
    grad.addColorStop(0.7, `rgba(180,220,255,${streamAlpha * 0.75})`);
    grad.addColorStop(1,   'rgba(160,205,240,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = s * 0.028;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const segs = 24;
    for (let i = 0; i <= segs; i++) {
      const tt = i / segs;                                    // 0 top → 1 bottom
      const yy = vortexTopY + tt * vortexH;
      const half = widthAt(tt);
      // Helical angle at this height (depends on stream phase + time)
      const ang = tt * lobes * Math.PI * 2 + unit._aeT * st.speed + st.phaseOff;
      const xx = bX + Math.cos(ang) * half;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();
  });

  // Secondary fainter streams (opposite rotation for depth)
  for (let si = 0; si < 3; si++) {
    const phaseOff = (si / 3) * Math.PI * 2 + Math.PI * 0.3;
    const streamAlpha = 0.30 * ghostFlicker;
    ctx.save();
    ctx.shadowColor = '#ddeeff'; ctx.shadowBlur = s * 0.10;
    ctx.strokeStyle = `rgba(230,248,255,${streamAlpha})`;
    ctx.lineWidth = s * 0.015;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const segs = 20;
    for (let i = 0; i <= segs; i++) {
      const tt = i / segs;
      const yy = vortexTopY + tt * vortexH;
      const half = widthAt(tt) * 0.7;
      const ang = -tt * 1.8 * Math.PI * 2 - unit._aeT * 3.2 + phaseOff;
      const xx = bX + Math.cos(ang) * half;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── Debris particles (leaves/dust caught in wind) ────────────────
  unit._aeDebris.forEach(db => {
    db.life -= dt * db.speed * 0.3;
    db.ang += dt * db.speed * 1.8;
    if (db.life <= 0) {
      db.life = 1;
      db.ang = Math.random() * Math.PI * 2;
      db.r = 0.4 + Math.random() * 0.5;
      db.yBias = Math.random();
      db.speed = 1.8 + Math.random() * 1.4;
      db.size = 0.5 + Math.random() * 0.5;
    }
    const yy = vortexTopY + db.yBias * vortexH;
    const half = widthAt(db.yBias) * db.r;
    const xx = bX + Math.cos(db.ang) * half;
    const yOff = Math.sin(db.ang) * half * 0.35;
    const dAlpha = db.life * 0.70 * ghostFlicker;
    ctx.fillStyle = `rgba(190,225,255,${dAlpha})`;
    ctx.beginPath();
    ctx.ellipse(xx, yy + yOff, s * 0.015 * db.size, s * 0.006 * db.size, db.ang, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Focal core (glowing concentration — where face would be) ─────
  const coreR = s * 0.11;
  ctx.shadowColor = '#ccddff'; ctx.shadowBlur = s * 0.30 * ghostFlicker;
  const cGrad = ctx.createRadialGradient(bX - coreR * 0.25, focalCY - coreR * 0.25, 0, bX, focalCY, coreR);
  cGrad.addColorStop(0,    `rgba(255,255,255,${0.75 * ghostFlicker})`);
  cGrad.addColorStop(0.50, `rgba(180,225,255,${0.52 * ghostFlicker})`);
  cGrad.addColorStop(1,    `rgba(130,190,250,0)`);
  ctx.fillStyle = cGrad;
  ctx.beginPath(); ctx.arc(bX, focalCY, coreR, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Eyes (two bright concentration points) ───────────────────────
  const eyeRr = coreR * 0.32;
  const eyeSp = coreR * 0.58;
  [-1, 1].forEach(side => {
    const ex = bX + side * eyeSp;
    const ey = focalCY - coreR * 0.05;
    const eyeFlash = coilT > 0.5 ? (coilT - 0.5) * 2 : 0;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur  = s * (0.22 + eyeFlash * 0.30) * ghostFlicker;
    ctx.fillStyle   = eyeFlash > 0.5 ? '#ffffff' : '#e0f4ff';
    ctx.beginPath(); ctx.arc(ex, ey, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(40,80,160,0.45)';
    ctx.beginPath();
    ctx.ellipse(ex + dir * eyeRr * 0.18, ey, eyeRr * 0.26, eyeRr * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Wind slash (crescent blade attack) ───────────────────────────
  const jetActive = atkActive && ap > 0.26 && ap < 0.90;
  if (jetActive) {
    const progress  = Math.min(1, (ap - 0.26) / 0.42);
    const bladeMaxD = s * 1.60;
    const originX   = bX + dir * widthAt(0.45) * 0.9;
    const originY   = focalCY;
    const tipX      = originX + dir * progress * bladeMaxD;
    const tailX     = originX + dir * Math.max(0, progress - 0.32) * bladeMaxD;
    const jAlpha    = slashT > 0 ? 1.0 : 1.0 - (ap - 0.62) / 0.28;

    if (jAlpha > 0 && Math.abs(tipX - tailX) > 2) {
      ctx.globalAlpha = globalA * jAlpha;
      const bG = ctx.createLinearGradient(tailX, originY, tipX, originY);
      bG.addColorStop(0,    'rgba(140,200,255,0)');
      bG.addColorStop(0.20, `rgba(190,230,255,${jAlpha * 0.78})`);
      bG.addColorStop(1,    `rgba(245,252,255,${jAlpha * 0.94})`);
      ctx.strokeStyle = bG; ctx.lineWidth = s * 0.090; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, originY + s * 0.055 * dir);
      ctx.quadraticCurveTo((tailX + tipX) / 2, originY - s * 0.115 * dir, tipX, originY);
      ctx.stroke();

      const bG2 = ctx.createLinearGradient(tailX, originY, tipX, originY);
      bG2.addColorStop(0,   'rgba(200,238,255,0)');
      bG2.addColorStop(0.3, `rgba(235,250,255,${jAlpha * 0.62})`);
      bG2.addColorStop(1,   `rgba(255,255,255,${jAlpha * 0.82})`);
      ctx.strokeStyle = bG2; ctx.lineWidth = s * 0.034;
      ctx.beginPath();
      ctx.moveTo(tailX, originY - s * 0.038 * dir);
      ctx.quadraticCurveTo((tailX + tipX) / 2, originY - s * 0.178 * dir, tipX, originY - s * 0.026 * dir);
      ctx.stroke();

      ctx.shadowColor = '#c0e8ff'; ctx.shadowBlur = s * 0.26;
      ctx.fillStyle = `rgba(230,248,255,${jAlpha * 0.80})`;
      ctx.beginPath(); ctx.arc(tipX, originY, s * 0.042, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = globalA;
    }
  }

  // ── Ghost aura ───────────────────────────────────────────────────
  if (ghosted) {
    ctx.globalAlpha = 0.40 + Math.sin(unit._aeT * 3.5) * 0.15;
    ctx.strokeStyle = 'rgba(220,242,255,0.50)';
    ctx.lineWidth   = s * 0.022;
    ctx.beginPath();
    ctx.ellipse(bX, (vortexTopY + vortexBotY) / 2,
                s * 0.42, s * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _aeBranch = unit._branch || '';
  if (_aeBranch === 'A') {
    // Storm: lightning arcs within the vortex + electric blue tint
    const _t = unit._aeT || 0;
    ctx.save(); ctx.shadowColor = '#88aaff'; ctx.shadowBlur = s * 0.18;
    ctx.strokeStyle = 'rgba(120,160,255,0.60)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const _ang = _t * (1.8 + i*0.4) + i * Math.PI * 0.67;
      const _r = s * (0.18 + i*0.07);
      const _midY = (vortexTopY + vortexBotY) / 2;
      const _x1 = bX + Math.cos(_ang) * _r;
      const _y1 = _midY + Math.sin(_ang) * _r * 0.55;
      const _x2 = bX + Math.cos(_ang + Math.PI) * _r;
      const _y2 = _midY + Math.sin(_ang + Math.PI) * _r * 0.55;
      ctx.beginPath(); ctx.moveTo(_x1, _y1); ctx.lineTo(_x2, _y2); ctx.stroke();
    }
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_aeBranch === 'B') {
    // Whirlwind: spinning blade silhouettes in the vortex
    const _t = unit._aeT || 0;
    ctx.save(); ctx.globalAlpha = 0.45;
    ctx.strokeStyle = '#ccddff'; ctx.lineWidth = s * 0.025; ctx.lineCap = 'round';
    const _midY = (vortexTopY + vortexBotY) * 0.48;
    for (let i = 0; i < 3; i++) {
      const _ang = _t * 4.0 + i * Math.PI * 0.66;
      const _r = s * 0.28;
      const _bx1 = bX + Math.cos(_ang) * _r * 0.35;
      const _by1 = _midY + Math.sin(_ang) * _r * 0.20;
      const _bx2 = bX + Math.cos(_ang + Math.PI) * _r;
      const _by2 = _midY + Math.sin(_ang + Math.PI) * _r * 0.55;
      ctx.beginPath(); ctx.moveTo(_bx1, _by1); ctx.lineTo(_bx2, _by2); ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = vortexTopY - s * 0.040;
}
