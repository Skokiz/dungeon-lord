// ═══════════════════════════════════════════════════════════════════════════
//  LIGHTNING ELEMENTAL — рівень 15, здібність: chain (ланцюгова блискавка)
//  Гуманоїдний силует із зигзагних блискавок: плазмове ядро-торс, голова,
//  руки/ноги-болти. Постійне потріскування, кидок зубчастого болта.
// ═══════════════════════════════════════════════════════════════════════════
function drawLightningMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._lnLastT || _frameNow)) / 1000, 0.05);
  unit._lnLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._lnDir === undefined) {
    unit._lnDir = 1; unit._lnPrevX = cx;
    unit._lnPrevAcd = unit.attackCooldown;
    unit._lnT = 0; unit._lnAp = 0;
    unit._lnSeed = Math.random() * 100;
    unit._lnSparks = Array.from({length: 8}, (_, i) => ({
      ang: Math.random() * Math.PI * 2,
      r:   0.6 + Math.random() * 0.5,
      life: Math.random(),
      speed: 0.8 + Math.random() * 0.8
    }));
  }
  if (Math.abs(cx - unit._lnPrevX) > 0.2)
    unit._lnDir = cx > unit._lnPrevX ? 1 : -1;
  unit._lnPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._lnDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._lnDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._lnPrevAcd || 0) + 3) unit._lnAp = 1.0;
  unit._lnPrevAcd = acd;
  unit._lnT += dt;

  const atkDur = Math.min(0.52, atkBase / 60 * 0.68);
  if (unit._lnAp > 0) unit._lnAp = Math.max(0, unit._lnAp - dt / atkDur);

  const atkActive = unit._lnAp > 0;
  const ap        = 1 - unit._lnAp;
  const inFight   = unit.state === 'fight' || atkActive;

  // ap 0..0.22: CHARGE (arm retracts, core flashes)
  // ap 0.22..0.65: BOLT flies
  // ap 0.65..1.0: recover
  const chargeT = atkActive && ap < 0.22 ? ap / 0.22 : 0;
  const boltT   = atkActive && ap >= 0.22 && ap < 0.65 ? (ap - 0.22) / 0.43 : 0;

  // Skeleton points (humanoid silhouette)
  const floatY  = Math.sin(unit._lnT * 2.05) * s * 0.018;
  const coreCX  = cx;
  const coreCY  = fY - s * 0.48 + floatY;
  const headCX  = coreCX;
  const headCY  = coreCY - s * 0.34;
  const headR   = s * 0.088;
  const coreR   = s * 0.155;

  // Shoulders / hips
  const shX = s * 0.145;
  const shY = coreCY - s * 0.10;
  const hpX = s * 0.110;
  const hpY = coreCY + s * 0.09;
  // Hand target positions (arms extended outward+down)
  const handBaseX = s * 0.320;
  const handBaseY = coreCY + s * 0.03;
  // Foot positions (on floor)
  const footX = s * 0.120;
  const footY = fY - s * 0.006;

  const globalFlash = 1 + chargeT * 0.6 + (inFight ? 0.15 : 0) + Math.sin(unit._lnT * 18) * 0.08;

  ctx.save();

  // ── Ground electric puddle + sparks ──────────────────────────────
  ctx.strokeStyle = `rgba(120,180,255,${0.30 + Math.sin(unit._lnT * 4) * 0.15})`;
  ctx.lineWidth = s * 0.011;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.008, s * 0.38, s * 0.060, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Radial ground sparks (thin zigzag from feet)
  for (let gi = 0; gi < 4; gi++) {
    const ga   = -Math.PI + (gi / 3) * Math.PI;
    const glen = s * (0.12 + Math.abs(Math.sin(unit._lnT * 3.2 + gi)) * 0.10);
    const gx2  = cx + Math.cos(ga) * glen;
    const gy2  = fY - s * 0.005 + Math.sin(ga) * s * 0.022;
    ctx.strokeStyle = `rgba(180,220,255,${0.35 + 0.25 * Math.sin(unit._lnT * 5 + gi)})`;
    ctx.lineWidth = s * 0.010;
    _lnJaggedLine(ctx, cx, fY - s * 0.005, gx2, gy2, 3, s * 0.014, unit._lnT, unit._lnSeed + gi * 3.1);
  }

  // ── Ambient outer electric arcs (around body silhouette) ─────────
  for (let ai = 0; ai < 6; ai++) {
    const aAng = unit._lnT * 1.8 + ai * Math.PI / 3 + unit._lnSeed;
    const ar1  = s * (0.28 + 0.05 * Math.sin(unit._lnT * 2 + ai));
    const ar2  = ar1 + s * (0.08 + 0.04 * Math.sin(unit._lnT * 3.5 + ai));
    const x1   = coreCX + Math.cos(aAng) * ar1;
    const y1   = coreCY + Math.sin(aAng) * ar1 * 1.6;
    const x2   = coreCX + Math.cos(aAng + 0.4) * ar2;
    const y2   = coreCY + Math.sin(aAng + 0.4) * ar2 * 1.6;
    const aAlpha = 0.32 + 0.22 * Math.sin(unit._lnT * 4 + ai * 1.7);
    ctx.shadowColor = '#88ccff'; ctx.shadowBlur = s * 0.10;
    ctx.strokeStyle = `rgba(200,230,255,${aAlpha * globalFlash})`;
    ctx.lineWidth = s * 0.013;
    _lnJaggedLine(ctx, x1, y1, x2, y2, 3, s * 0.022, unit._lnT, unit._lnSeed + ai * 2.3);
    ctx.shadowBlur = 0;
  }

  // ── Body limbs (lightning zigzags — outer glow + bright core) ────
  // Helper: draw one limb as a thick blue glow then a thin white core
  const drawLimb = (x1, y1, x2, y2, baseW, jitter, seed, brightness) => {
    // Outer purple-blue glow
    ctx.shadowColor = '#5588ff'; ctx.shadowBlur = s * 0.14 * brightness;
    ctx.strokeStyle = `rgba(80,130,240,${0.70 * brightness})`;
    ctx.lineWidth   = baseW;
    ctx.lineCap     = 'round';
    _lnJaggedLine(ctx, x1, y1, x2, y2, 6, jitter, unit._lnT, seed);
    // Inner bright cyan
    ctx.shadowColor = '#aaddff'; ctx.shadowBlur = s * 0.20 * brightness;
    ctx.strokeStyle = `rgba(200,235,255,${0.90 * brightness})`;
    ctx.lineWidth   = baseW * 0.50;
    _lnJaggedLine(ctx, x1, y1, x2, y2, 6, jitter * 0.55, unit._lnT * 1.3, seed + 0.7);
    // Plasma hot white
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * 0.18 * brightness;
    ctx.strokeStyle = `rgba(255,255,255,${0.82 * brightness})`;
    ctx.lineWidth   = baseW * 0.18;
    _lnJaggedLine(ctx, x1, y1, x2, y2, 6, jitter * 0.35, unit._lnT * 1.7, seed + 1.4);
    ctx.shadowBlur = 0;
  };

  // Legs (2)
  drawLimb(coreCX - hpX * 0.7, hpY, coreCX - footX, footY,
           s * 0.050, s * 0.030, unit._lnSeed + 5.1, globalFlash);
  drawLimb(coreCX + hpX * 0.7, hpY, coreCX + footX, footY,
           s * 0.050, s * 0.030, unit._lnSeed + 6.3, globalFlash);

  // Arms — attack arm animates during charge/bolt
  // Resting arm angle
  [-1, 1].forEach(side => {
    const isAtk = side === dir;
    let hX, hY;
    if (isAtk && atkActive && chargeT > 0) {
      // Pull back
      hX = coreCX - side * s * (0.08 + chargeT * 0.12);
      hY = coreCY - s * (0.10 + chargeT * 0.12);
    } else if (isAtk && atkActive && boltT > 0) {
      // Thrust forward
      const th = Math.min(1, boltT * 1.6);
      hX = coreCX + side * s * (0.22 + th * 0.18);
      hY = coreCY + s * (0.00 - th * 0.04);
    } else {
      hX = coreCX + side * handBaseX;
      hY = handBaseY + Math.sin(unit._lnT * 2.2 + side) * s * 0.012;
    }
    drawLimb(coreCX + side * shX * 0.7, shY, hX, hY,
             s * 0.044, s * 0.028, unit._lnSeed + (side > 0 ? 2.4 : 3.6), globalFlash);
    // Hand spark
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * 0.22 * globalFlash;
    ctx.fillStyle = `rgba(240,248,255,${0.88 * globalFlash})`;
    ctx.beginPath(); ctx.arc(hX, hY, s * 0.028, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── Torso spine (vertical jagged bolt connecting neck→hips) ──────
  drawLimb(headCX, headCY + headR * 0.8, coreCX, coreCY + s * 0.05,
           s * 0.058, s * 0.022, unit._lnSeed + 9.7, globalFlash * 1.1);

  // ── Core (chest plasma heart) ─────────────────────────────────────
  ctx.shadowColor = '#aaccff'; ctx.shadowBlur = s * (0.42 + chargeT * 0.35) * globalFlash;
  const cGrad = ctx.createRadialGradient(coreCX, coreCY, 0, coreCX, coreCY, coreR);
  cGrad.addColorStop(0,    `rgba(255,255,255,${0.95 * globalFlash})`);
  cGrad.addColorStop(0.35, `rgba(180,220,255,${0.88 * globalFlash})`);
  cGrad.addColorStop(0.75, `rgba(80,140,255,${0.72 * globalFlash})`);
  cGrad.addColorStop(1,    `rgba(30,50,180,0)`);
  ctx.fillStyle = cGrad;
  ctx.beginPath(); ctx.arc(coreCX, coreCY, coreR, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Small inner lightning squiggles inside core
  ctx.strokeStyle = `rgba(255,255,255,${0.75 * globalFlash})`;
  ctx.lineWidth = s * 0.010;
  for (let ii = 0; ii < 2; ii++) {
    const iAng = unit._lnT * 6 + ii * Math.PI;
    _lnJaggedLine(ctx,
      coreCX + Math.cos(iAng) * coreR * 0.4,
      coreCY + Math.sin(iAng) * coreR * 0.4,
      coreCX + Math.cos(iAng + Math.PI) * coreR * 0.4,
      coreCY + Math.sin(iAng + Math.PI) * coreR * 0.4,
      3, s * 0.020, unit._lnT, unit._lnSeed + 12 + ii);
  }

  // ── Head (small plasma orb) ───────────────────────────────────────
  ctx.shadowColor = '#ccddff'; ctx.shadowBlur = s * 0.32 * globalFlash;
  const hGrad = ctx.createRadialGradient(headCX - headR * 0.25, headCY - headR * 0.25, 0, headCX, headCY, headR);
  hGrad.addColorStop(0,    `rgba(255,255,255,${0.95 * globalFlash})`);
  hGrad.addColorStop(0.45, `rgba(190,225,255,${0.88 * globalFlash})`);
  hGrad.addColorStop(1,    `rgba(80,140,255,${0.55 * globalFlash})`);
  ctx.fillStyle = hGrad;
  ctx.beginPath(); ctx.arc(headCX, headCY, headR, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Eyes (on head) ────────────────────────────────────────────────
  const eyeRr = headR * 0.33;
  const eyeSp = headR * 0.48;
  [-1, 1].forEach(side => {
    const ex = headCX + side * eyeSp;
    const ey = headCY - headR * 0.02;
    const eyeFlash = chargeT > 0.3 ? (chargeT - 0.3) / 0.7 : 0;
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * (0.22 + eyeFlash * 0.24);
    ctx.fillStyle = eyeFlash > 0.4 ? '#ffffff' : '#e8f4ff';
    ctx.beginPath(); ctx.arc(ex, ey, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(10,20,60,0.55)';
    ctx.beginPath();
    ctx.ellipse(ex + dir * eyeRr * 0.18, ey, eyeRr * 0.26, eyeRr * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Random sparks flying off body ─────────────────────────────────
  unit._lnSparks.forEach(sp => {
    sp.life -= dt * sp.speed;
    if (sp.life <= 0) {
      sp.life = 1; sp.ang = Math.random() * Math.PI * 2;
      sp.r = 0.6 + Math.random() * 0.5; sp.speed = 0.8 + Math.random() * 0.8;
    }
    const sLife = sp.life;
    const sr  = coreR + (1 - sLife) * s * 0.32 * sp.r;
    const sx  = coreCX + Math.cos(sp.ang) * sr;
    const sy  = coreCY + Math.sin(sp.ang) * sr * 1.3;
    const sa2 = sLife * 0.82;
    ctx.fillStyle = `rgba(230,245,255,${sa2})`;
    ctx.beginPath(); ctx.arc(sx, sy, s * 0.014 * sLife, 0, Math.PI * 2); ctx.fill();
  });

  // ── Lightning bolt (attack projectile) ────────────────────────────
  const boltActive = atkActive && ap > 0.22 && ap < 0.86;
  if (boltActive) {
    const progress = Math.min(1, (ap - 0.22) / 0.46);
    const boltMaxD = s * 1.90;
    const originX  = coreCX + dir * s * 0.42;
    const originY  = coreCY;
    const tipX     = originX + dir * progress * boltMaxD;
    const tipY     = originY + Math.sin(progress * Math.PI) * s * 0.08 * dir;
    const jAlpha   = boltT > 0 ? 1.0 : 1.0 - (ap - 0.65) / 0.21;

    if (jAlpha > 0) {
      // Outer blue glow
      ctx.shadowColor = '#4488ff'; ctx.shadowBlur = s * 0.40 * jAlpha;
      ctx.strokeStyle = `rgba(90,150,250,${jAlpha * 0.85})`;
      ctx.lineWidth   = s * 0.072;
      ctx.lineCap     = 'round';
      _lnJaggedLine(ctx, originX, originY, tipX, tipY, 7, s * 0.075, unit._lnT * 4, unit._lnSeed + 22);
      // Bright cyan middle
      ctx.shadowColor = '#aaddff'; ctx.shadowBlur = s * 0.30 * jAlpha;
      ctx.strokeStyle = `rgba(200,235,255,${jAlpha * 0.95})`;
      ctx.lineWidth   = s * 0.036;
      _lnJaggedLine(ctx, originX, originY, tipX, tipY, 7, s * 0.045, unit._lnT * 5, unit._lnSeed + 23);
      // Hot white core
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * 0.24 * jAlpha;
      ctx.strokeStyle = `rgba(255,255,255,${jAlpha * 0.92})`;
      ctx.lineWidth   = s * 0.014;
      _lnJaggedLine(ctx, originX, originY, tipX, tipY, 7, s * 0.022, unit._lnT * 6, unit._lnSeed + 24);
      // Tip spark
      ctx.fillStyle = `rgba(255,255,255,${jAlpha * 0.95})`;
      ctx.beginPath(); ctx.arc(tipX, tipY, s * 0.050, 0, Math.PI * 2); ctx.fill();
      // Small branching forks near tip
      for (let fi = 0; fi < 2; fi++) {
        const fA = (fi === 0 ? 0.7 : -0.7);
        const fx = tipX - dir * s * 0.15 + Math.cos(fA) * s * 0.18 * dir;
        const fy = tipY + Math.sin(fA) * s * 0.18;
        ctx.strokeStyle = `rgba(220,240,255,${jAlpha * 0.55})`;
        ctx.lineWidth   = s * 0.018;
        _lnJaggedLine(ctx, tipX - dir * s * 0.12, tipY, fx, fy, 3, s * 0.020, unit._lnT * 7, unit._lnSeed + 25 + fi);
      }
      ctx.shadowBlur = 0;
    }
  }

  // ── Branch visuals ────────────────────────────────────────────────
  const _lnBranch = unit._branch || '';
  if (_lnBranch === 'A') {
    // Thunder: dashed stun rings (idle) + shockwave ring on bolt fire + electric crown
    const _t = unit._lnT;
    const _pu = 0.55 + Math.sin(_t * 2.2) * 0.25;

    // Idle dashed stun rings
    ctx.shadowColor = '#ffff44'; ctx.shadowBlur = s * 0.22;
    ctx.setLineDash([s * 0.038, s * 0.038]);
    ctx.strokeStyle = `rgba(255,255,80,${_pu * 0.45})`;
    ctx.lineWidth = s * 0.020;
    ctx.beginPath(); ctx.ellipse(coreCX, coreCY, s * 0.48, s * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,240,60,${_pu * 0.28})`;
    ctx.lineWidth = s * 0.012;
    ctx.beginPath(); ctx.ellipse(coreCX, coreCY, s * 0.64, s * 1.00, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Shockwave ring expanding from body when bolt fires (ap 0.22–0.55)
    if (atkActive && ap > 0.22 && ap < 0.60) {
      const _sw = (ap - 0.22) / 0.38;
      const _swR  = s * (0.30 + _sw * 0.65);
      const _swAl = (1 - _sw) * 0.80;
      const _swW  = s * (0.032 - _sw * 0.024);
      ctx.shadowColor = '#ffff44'; ctx.shadowBlur = s * 0.25 * (1 - _sw);
      ctx.strokeStyle = `rgba(255,255,70,${_swAl})`;
      ctx.lineWidth = _swW;
      ctx.beginPath(); ctx.ellipse(coreCX, coreCY, _swR, _swR * 1.55, 0, 0, Math.PI * 2); ctx.stroke();
      // Second ring (slightly delayed)
      if (_sw > 0.25) {
        const _sw2 = (_sw - 0.25) / 0.75;
        ctx.strokeStyle = `rgba(220,240,80,${(1 - _sw2) * 0.50})`;
        ctx.lineWidth = s * (0.020 - _sw2 * 0.016);
        ctx.beginPath(); ctx.ellipse(coreCX, coreCY, s * (0.25 + _sw2 * 0.55), s * (0.25 + _sw2 * 0.55) * 1.55, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    // Electric crown above head (always)
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * 0.16;
    ctx.strokeStyle = 'rgba(255,255,160,0.88)';
    ctx.lineWidth = s * 0.010;
    for (let ci = 0; ci < 4; ci++) {
      const ca = -Math.PI * 0.5 + (ci - 1.5) * (Math.PI * 0.28);
      const cr1 = headR * 1.1;
      const cr2 = headR * (1.65 + 0.28 * Math.sin(_t * 5 + ci));
      _lnJaggedLine(ctx, headCX + Math.cos(ca) * cr1, headCY + Math.sin(ca) * cr1,
                         headCX + Math.cos(ca) * cr2, headCY + Math.sin(ca) * cr2,
                         3, s * 0.012, _t, unit._lnSeed + 30 + ci);
    }
    ctx.shadowBlur = 0;

  } else if (_lnBranch === 'B') {
    // Electro: idle chain arcs + TWO extra side bolts during attack phase
    const _t = unit._lnT;

    // Idle chain arcs from body (always visible)
    ctx.shadowColor = '#55aaff'; ctx.shadowBlur = s * 0.18;
    for (let ci = 0; ci < 3; ci++) {
      const cSide = ci % 2 === 0 ? 1 : -1;
      const cBaseX = coreCX + cSide * s * 0.18;
      const cBaseY = coreCY + (ci - 1) * s * 0.10;
      const cEndX = cBaseX + cSide * s * (0.42 + 0.14 * Math.sin(_t * 3 + ci));
      const cEndY = cBaseY + (ci - 1) * s * 0.08;
      ctx.strokeStyle = `rgba(160,220,255,${0.52 + 0.24 * Math.sin(_t * 4 + ci)})`;
      ctx.lineWidth = s * 0.014;
      _lnJaggedLine(ctx, cBaseX, cBaseY, cEndX, cEndY, 4, s * 0.028, _t, unit._lnSeed + 40 + ci);
      ctx.fillStyle = `rgba(220,245,255,${0.65 + 0.20 * Math.sin(_t * 6 + ci)})`;
      ctx.beginPath(); ctx.arc(cEndX, cEndY, s * 0.018, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Two extra diagonal bolts during attack (bolt phase ap 0.22–0.86)
    if (atkActive && ap > 0.22 && ap < 0.86) {
      const _bProg = Math.min(1, (ap - 0.22) / 0.46);
      const _originX = coreCX + dir * s * 0.42;
      const _originY = coreCY;
      const _bMaxD = s * 1.20;
      for (let bi = 0; bi < 2; bi++) {
        const _bOff = (bi === 0 ? -1 : 1) * s * 0.24;
        const _tipX = _originX + dir * _bProg * _bMaxD;
        const _tipY = _originY + _bOff + Math.sin(_bProg * Math.PI) * s * 0.04;
        const _bAl = Math.min(1, _bProg * 2.5) * (1 - Math.max(0, (_bProg - 0.72) / 0.28)) * 0.70;
        if (_bAl > 0) {
          ctx.shadowColor = '#88ccff'; ctx.shadowBlur = s * 0.22 * _bAl;
          ctx.strokeStyle = `rgba(180,228,255,${_bAl})`;
          ctx.lineWidth = s * 0.026; ctx.lineCap = 'round';
          _lnJaggedLine(ctx, _originX, _originY + _bOff * 0.4, _tipX, _tipY, 5, s * 0.038, _t, unit._lnSeed + 50 + bi);
          ctx.fillStyle = `rgba(220,245,255,${_bAl * 0.88})`;
          ctx.beginPath(); ctx.arc(_tipX, _tipY, s * 0.022, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  ctx.restore();
  unit._hpBarY = headCY - headR * 1.65 - s * 0.030;
}

// Draw a jagged lightning-like line from (x1,y1) to (x2,y2) with mid-segments wiggling over time
function _lnJaggedLine(c, x1, y1, x2, y2, segments, jitter, t, seed) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
  const nx = -dy / len, ny = dx / len;
  c.beginPath();
  c.moveTo(x1, y1);
  for (let i = 1; i < segments; i++) {
    const tt = i / segments;
    const off = (Math.sin(t * 11 + i * 1.9 + seed) + Math.sin(t * 17 + i * 0.8 + seed * 1.3) * 0.55) * jitter;
    c.lineTo(x1 + dx * tt + nx * off, y1 + dy * tt + ny * off);
  }
  c.lineTo(x2, y2);
  c.stroke();
}
