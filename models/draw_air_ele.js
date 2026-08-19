// ═══════════════════════════════════════════════════════════════════════════
//  AIR ELEMENTAL — рівень 13, здібність: no_die (40% шанс пережити смерть)
//  Вихор без твердого тіла: 3 широкі повітряні стрічки, дебрі, вітровий удар.
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
    unit._aeStreams = Array.from({length: 3}, (_, i) => ({
      phaseOff: (i / 3) * Math.PI * 2,
      yBias:    i / 2,                 // 0 (top) → 1 (bottom)
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
  const _aeBranch = unit._branch || '';

  const ghosted   = unit._transparent || false;
  const ghostFlicker = ghosted ? (0.40 + Math.sin(unit._aeT * 6) * 0.18) : 1.0;
  const globalA   = ghosted ? 0.35 : 1.0;

  const coilT   = atkActive && ap < 0.26 ? ap / 0.26 : 0;
  const slashT  = atkActive && ap >= 0.26 && ap < 0.62 ? (ap - 0.26) / 0.36 : 0;
  const expandT = atkActive && ap >= 0.62 ? Math.sin((ap - 0.62) / 0.38 * Math.PI) : 0;
  // Keep the established 26/36/38 attack timing, but make the pose read as
  // compression -> whole-body release -> recoil instead of a hand-cast spell.
  const releaseT = slashT > 0 ? 1 - Math.pow(1 - slashT, 3) : 0;
  const driveT   = !atkActive ? (unit.state === 'fight' ? 0.22 : 0)
                 : ap < 0.26 ? 0
                 : ap < 0.62 ? releaseT
                 : Math.max(0, 1 - (ap - 0.62) / 0.38);
  const recoilT = expandT;
  const compressionT = !atkActive ? 0
                     : ap < 0.26 ? coilT
                     : ap < 0.42 ? Math.max(0, 1 - (ap - 0.26) / 0.16)
                     : 0;

  // ── Vortex geometry ──────────────────────────────────────────────
  const floatY = Math.sin(unit._aeT * 1.90) * s * 0.035;
  const stateLean = unit.state === 'fight' ? dir * s * 0.045
                  : unit.state === 'move'  ? dir * s * 0.030 : 0;
  const heightMul = _aeBranch === 'A' ? 1.10 : _aeBranch === 'B' ? 0.86 : 1.0;
  const vortexTopY = fY - s * 1.06 * heightMul + floatY
                   + compressionT * s * 0.18 - driveT * s * 0.065
                   + recoilT * s * 0.035;
  const vortexBotY = fY - s * 0.010;
  const vortexH = vortexBotY - vortexTopY;
  const bX = cx + stateLean - compressionT * dir * s * 0.085
           + driveT * dir * s * 0.16 - recoilT * dir * s * 0.18;

  function bodyCenterAt(tt) {
    const envelope = Math.sin(Math.max(0, Math.min(1, tt)) * Math.PI);
    const organicDrift = Math.sin(tt * Math.PI * 2.25 + unit._aeT * 1.35 + unit._aeSeed)
                       * s * 0.018 * envelope;
    const releaseShear = dir * s * (driveT * 0.11 - compressionT * 0.045)
                       * Math.exp(-Math.pow((tt - 0.40) / 0.28, 2));
    const whirlwindTwist = _aeBranch === 'B'
      ? Math.sin(tt * Math.PI * 2.15 + unit._aeT * 1.15 + unit._aeSeed * 0.35)
        * s * 0.082 * envelope
      : 0;
    return bX + organicDrift + releaseShear + whirlwindTwist;
  }
  const focalCY = vortexTopY + vortexH * 0.40;   // where eyes sit
  const focalX = bodyCenterAt(0.40);

  // Width by height: narrow at top, wider at middle, narrowing toward bottom
  function widthAt(tt) {
    const rounded = Math.pow(Math.max(0, Math.sin(tt * Math.PI)), 0.68);
    const profile = rounded * 0.80 + 0.18;
    const stormMantle = _aeBranch === 'A'
      ? Math.exp(-Math.pow((tt - 0.40) / 0.22, 2)) * 0.10 : 0;
    const branchWidth = _aeBranch === 'A' ? 1.05 : _aeBranch === 'B' ? 0.98 : 1;
    return s * 0.48 * (profile + stormMantle) * branchWidth
      * (1 + driveT * 0.075 + recoilT * 0.08 - compressionT * 0.20);
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

  // ── Branch mass behind the core ──────────────────────────────────
  // These shapes overlap the body on purpose: branch identity grows out of the
  // same air mass instead of orbiting around it as separate decoration.
  if (_aeBranch === 'A') {
    const mantleTop = vortexTopY + vortexH * 0.24;
    const mantleMid = vortexTopY + vortexH * 0.46;
    const mantleBot = vortexTopY + vortexH * 0.70;
    const mantleG = ctx.createLinearGradient(0, mantleTop, 0, mantleBot);
    mantleG.addColorStop(0, `rgba(80,105,184,${0.68 * ghostFlicker})`);
    mantleG.addColorStop(0.55, `rgba(48,70,142,${0.76 * ghostFlicker})`);
    mantleG.addColorStop(1, `rgba(35,51,108,${0.18 * ghostFlicker})`);
    ctx.save();
    ctx.shadowColor = '#526fdd'; ctx.shadowBlur = s * 0.20;
    ctx.fillStyle = mantleG;
    ctx.beginPath();
    ctx.moveTo(bodyCenterAt(0.25), mantleTop);
    ctx.bezierCurveTo(bX - s * 0.24, mantleTop - s * 0.035,
                      bX - s * 0.70, mantleTop + s * 0.055,
                      bX - s * 0.76, mantleMid);
    ctx.bezierCurveTo(bX - s * 0.72, mantleMid + s * 0.17,
                      bX - s * 0.43, mantleBot + s * 0.04,
                      bodyCenterAt(0.70), mantleBot);
    ctx.bezierCurveTo(bX + s * 0.43, mantleBot + s * 0.04,
                      bX + s * 0.72, mantleMid + s * 0.17,
                      bX + s * 0.76, mantleMid);
    ctx.bezierCurveTo(bX + s * 0.70, mantleTop + s * 0.055,
                      bX + s * 0.24, mantleTop - s * 0.035,
                      bodyCenterAt(0.25), mantleTop);
    ctx.closePath(); ctx.fill();

    // Dense thunderheads root the mantle's extreme width back into the torso.
    [-1, 1].forEach(side => {
      const shX = bX + side * s * 0.51;
      const shY = mantleTop + s * 0.105;
      ctx.fillStyle = `rgba(68,91,165,${0.88 * ghostFlicker})`;
      ctx.beginPath();
      ctx.ellipse(shX, shY, s * 0.25, s * 0.16, side * 0.10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(110,139,218,${0.32 * ghostFlicker})`;
      ctx.beginPath();
      ctx.ellipse(shX - side * s * 0.055, shY - s * 0.035,
                  s * 0.13, s * 0.075, side * 0.10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  } else if (_aeBranch === 'B') {
    const lobes = [
      { tt: 0.27, side:  1, reach: 0.36, lift: -0.085 },
      { tt: 0.49, side: -1, reach: 0.43, lift:  0.015 },
      { tt: 0.70, side:  1, reach: 0.29, lift:  0.070 }
    ];
    ctx.save();
    ctx.shadowColor = '#dff6ff'; ctx.shadowBlur = s * 0.15;
    lobes.forEach((lobe, i) => {
      const yy = vortexTopY + vortexH * lobe.tt;
      const side = lobe.side;
      const rootX = bodyCenterAt(lobe.tt) + side * widthAt(lobe.tt) * 0.45;
      const rootH = s * (0.105 - i * 0.012);
      const breathe = Math.sin(unit._aeT * 2.0 + i * 1.7) * s * 0.018;
      const tipX = rootX + side * (s * lobe.reach + breathe);
      const tipY = yy + s * lobe.lift;
      ctx.fillStyle = `rgba(224,246,255,${(0.66 - i * 0.08) * ghostFlicker})`;
      ctx.strokeStyle = `rgba(111,184,230,${0.70 * ghostFlicker})`;
      ctx.lineWidth = s * 0.012;
      ctx.beginPath();
      ctx.moveTo(rootX, yy - rootH);
      ctx.bezierCurveTo(rootX + side * s * 0.16, yy - rootH * 1.30,
                        tipX - side * s * 0.04, tipY - rootH * 0.75,
                        tipX, tipY);
      ctx.bezierCurveTo(tipX - side * s * 0.12, tipY + rootH * 0.62,
                        rootX + side * s * 0.13, yy + rootH * 0.28,
                        rootX, yy + rootH);
      ctx.bezierCurveTo(rootX + side * s * 0.08, yy + rootH * 0.16,
                        rootX + side * s * 0.10, yy - rootH * 0.20,
                        rootX, yy - rootH);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
  }

  // ── Broad rooted arms ────────────────────────────────────────────
  // Filled bands begin well inside the torso, so even at mobile size they read
  // as limbs made from the body rather than two bright sticks pasted onto it.
  {
    const shoulderT = 0.43;
    const shoulderY = vortexTopY + vortexH * shoulderT;
    const shoulderW = widthAt(shoulderT);
    const stateReach = unit.state === 'move' ? 0.88 : unit.state === 'fight' ? 1.10 : 0.76;
    [-1, 1].forEach(side => {
      const lead = side === dir;
      const branchReach = _aeBranch === 'B' ? 0.78 : _aeBranch === 'A' ? 1.12 : 1;
      const rootX = bodyCenterAt(shoulderT) + side * shoulderW * 0.34;
      const rootHalf = s * (_aeBranch === 'A' ? 0.105 : 0.080)
                     * (1 - compressionT * 0.18 + recoilT * 0.12);
      let tipX = rootX + side * s * 0.43 * stateReach * branchReach;
      let tipY = shoulderY + side * s * 0.025;

      if (unit.state === 'move' && !atkActive) {
        tipX -= dir * s * 0.12;
        tipY += s * 0.08;
      }
      if (atkActive) {
        tipX -= side * s * 0.22 * compressionT;
        tipY += s * 0.16 * compressionT;
        tipX += dir * s * (lead ? 0.30 : -0.09) * driveT;
        tipY += s * (lead ? -0.08 : 0.10) * driveT;
        tipX -= dir * s * 0.14 * recoilT;
        tipY += s * 0.08 * recoilT;
      }

      const armG = ctx.createLinearGradient(rootX, shoulderY, tipX, tipY);
      if (_aeBranch === 'A') {
        armG.addColorStop(0, `rgba(77,101,181,${0.88 * ghostFlicker})`);
        armG.addColorStop(0.72, `rgba(112,145,229,${0.65 * ghostFlicker})`);
        armG.addColorStop(1, `rgba(165,196,255,${0.20 * ghostFlicker})`);
      } else {
        armG.addColorStop(0, `rgba(184,222,249,${0.72 * ghostFlicker})`);
        armG.addColorStop(0.72, `rgba(218,242,255,${0.57 * ghostFlicker})`);
        armG.addColorStop(1, `rgba(245,253,255,${0.16 * ghostFlicker})`);
      }
      ctx.save();
      ctx.shadowColor = _aeBranch === 'A' ? '#7899f5' : '#cceeff';
      ctx.shadowBlur = s * 0.12;
      ctx.fillStyle = armG;
      ctx.beginPath();
      ctx.moveTo(rootX, shoulderY - rootHalf);
      ctx.bezierCurveTo(rootX + side * s * 0.17, shoulderY - rootHalf * 1.25,
                        tipX - side * s * 0.12, tipY - rootHalf * 0.48,
                        tipX, tipY);
      ctx.bezierCurveTo(tipX - side * s * 0.07, tipY + rootHalf * 0.58,
                        rootX + side * s * 0.15, shoulderY + rootHalf * 1.08,
                        rootX, shoulderY + rootHalf);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(243,252,255,${0.34 * ghostFlicker})`;
      ctx.lineWidth = s * 0.018; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rootX + side * s * 0.03, shoulderY - rootHalf * 0.18);
      ctx.quadraticCurveTo(rootX + side * s * 0.23, shoulderY - rootHalf * 0.62,
                           tipX - side * s * 0.055, tipY);
      ctx.stroke();
      ctx.restore();
    });
  }

  // ── Filled vortex core — САМЕ ВІН дає силует ─────────────────────
  // Раніше тіло складалось лише зі штрихів (stroke), тож на малому розмірі елементаль
  // перетворювався на сіру пляму без форми. Підкладаємо напівпрозорий залитий корпус
  // за тим самим профілем widthAt(), а спіралі лягають зверху як деталь.
  {
    const _segs = 26;
    const _bg = ctx.createLinearGradient(0, vortexTopY, 0, vortexBotY);
    if (_aeBranch === 'A') {
      _bg.addColorStop(0,    `rgba(126,155,225,${0.12 * ghostFlicker})`);
      _bg.addColorStop(0.34, `rgba(92,126,205,${0.54 * ghostFlicker})`);
      _bg.addColorStop(0.70, `rgba(75,102,172,${0.40 * ghostFlicker})`);
      _bg.addColorStop(1,    `rgba(52,70,125,${0.14 * ghostFlicker})`);
    } else if (_aeBranch === 'B') {
      _bg.addColorStop(0,    `rgba(245,252,255,${0.12 * ghostFlicker})`);
      _bg.addColorStop(0.34, `rgba(225,244,255,${0.54 * ghostFlicker})`);
      _bg.addColorStop(0.72, `rgba(178,220,250,${0.40 * ghostFlicker})`);
      _bg.addColorStop(1,    `rgba(145,198,235,${0.14 * ghostFlicker})`);
    } else {
      _bg.addColorStop(0,    `rgba(196,226,255,${0.08 * ghostFlicker})`);
      _bg.addColorStop(0.38, `rgba(206,234,255,${0.48 * ghostFlicker})`);
      _bg.addColorStop(0.72, `rgba(176,214,250,${0.38 * ghostFlicker})`);
      _bg.addColorStop(1,    `rgba(150,196,236,${0.14 * ghostFlicker})`);
    }
    ctx.fillStyle = _bg;
    ctx.beginPath();
    for (let i = 0; i <= _segs; i++) {           // права твірна: згори → вниз
      const tt = i / _segs;
      const yy = vortexTopY + tt * vortexH;
      const ripple = Math.sin(tt * Math.PI * 5.2 + unit._aeT * 1.8 + unit._aeSeed)
                   * s * 0.012 * Math.sin(tt * Math.PI);
      const xx = bodyCenterAt(tt) + widthAt(tt) * 0.92 + ripple;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    for (let i = _segs; i >= 0; i--) {           // ліва твірна: знизу → вгору
      const tt = i / _segs;
      const ripple = Math.sin(tt * Math.PI * 4.7 - unit._aeT * 1.55 + unit._aeSeed * 0.7)
                   * s * 0.014 * Math.sin(tt * Math.PI);
      ctx.lineTo(bodyCenterAt(tt) - widthAt(tt) * 0.92 - ripple,
                 vortexTopY + tt * vortexH);
    }
    ctx.closePath(); ctx.fill();
  }

  // ── Three broad helical ribbons — detail over the filled body ────
  unit._aeStreams.forEach((st, si) => {
    const lobes = 0.80;
    const streamAlpha = (0.34 + 0.10 * Math.sin(unit._aeT * 1.5 + si)) * ghostFlicker;
    // Draw stream with gradient thickness
    ctx.save();
    ctx.shadowColor = '#aaddff';
    ctx.shadowBlur = s * 0.11 * ghostFlicker;
    const grad = ctx.createLinearGradient(0, vortexTopY, 0, vortexBotY);
    grad.addColorStop(0,   'rgba(200,230,255,0)');
    grad.addColorStop(0.3, `rgba(210,238,255,${streamAlpha * 0.9})`);
    grad.addColorStop(0.7, `rgba(180,220,255,${streamAlpha * 0.75})`);
    grad.addColorStop(1,   'rgba(160,205,240,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = s * 0.038;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const segs = 24;
    for (let i = 0; i <= segs; i++) {
      const tt = i / segs;                                    // 0 top → 1 bottom
      const yy = vortexTopY + tt * vortexH;
      const half = widthAt(tt);
      // Helical angle at this height (depends on stream phase + time)
      const ang = tt * lobes * Math.PI * 2 + unit._aeT * st.speed + st.phaseOff;
      const xx = bodyCenterAt(tt) + Math.cos(ang) * half;
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();
  });

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
    const xx = bodyCenterAt(db.yBias) + Math.cos(db.ang) * half;
    const yOff = Math.sin(db.ang) * half * 0.35;
    const dAlpha = db.life * 0.70 * ghostFlicker;
    ctx.fillStyle = `rgba(190,225,255,${dAlpha})`;
    ctx.beginPath();
    ctx.ellipse(xx, yy + yOff, s * 0.015 * db.size, s * 0.006 * db.size, db.ang, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Focal core / face ────────────────────────────────────────────
  const coreR = s * 0.15;
  function drawFocalFace() {
    ctx.save();
    ctx.shadowColor = '#ccddff'; ctx.shadowBlur = s * 0.16 * ghostFlicker;
    const cGrad = ctx.createRadialGradient(focalX - coreR * 0.25, focalCY - coreR * 0.25,
                                           0, focalX, focalCY, coreR);
    cGrad.addColorStop(0,    `rgba(255,255,255,${0.82 * ghostFlicker})`);
    cGrad.addColorStop(0.52, `rgba(180,225,255,${0.68 * ghostFlicker})`);
    cGrad.addColorStop(1,    `rgba(105,155,220,${0.16 * ghostFlicker})`);
    ctx.fillStyle = cGrad;
    ctx.beginPath(); ctx.arc(focalX, focalCY, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Compact inner air-mass lets the two eyes survive at mobile size.
    ctx.fillStyle = _aeBranch === 'A'
      ? `rgba(48,67,122,${0.52 * ghostFlicker})`
      : `rgba(72,115,164,${0.50 * ghostFlicker})`;
    ctx.beginPath();
    ctx.ellipse(focalX, focalCY + coreR * 0.05, coreR * 0.72, coreR * 0.58,
                _aeBranch === 'B' ? -0.14 * dir : 0, 0, Math.PI * 2);
    ctx.fill();

    const eyeRr = coreR * 0.22;
    const eyeSp = coreR * 0.52;
    [-1, 1].forEach(side => {
      const ex = focalX + side * eyeSp;
      const ey = focalCY - coreR * 0.05;
      const eyeFlash = compressionT > 0.5 ? (compressionT - 0.5) * 2 : 0;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur  = s * (0.07 + eyeFlash * 0.16) * ghostFlicker;
      ctx.fillStyle   = eyeFlash > 0.5 ? '#ffffff' : '#eaf8ff';
      ctx.beginPath(); ctx.arc(ex, ey, eyeRr, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(18,43,88,0.92)';
      ctx.beginPath(); ctx.ellipse(ex + dir * eyeRr * 0.18, ey, eyeRr * 0.34, eyeRr * 0.66, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
  drawFocalFace();

  // ── Whole-body pressure release ──────────────────────────────────
  // The burst shares a broad root with the torso and grows as one curved mass.
  // There is no wand, rectangular beam, or detached projectile tip.
  // Whirlwind does not cast the same forward pressure cone as base/Storm.
  // Its release stays centred on the body and blooms radially below.
  const jetActive = _aeBranch !== 'B' && atkActive && ap > 0.26 && ap < 0.90;
  if (jetActive) {
    const burstT = ap < 0.62 ? releaseT : Math.max(0, 1 - (ap - 0.62) / 0.28);
    const jAlpha = ap < 0.62 ? 1 : Math.max(0, 1 - (ap - 0.62) / 0.28);
    const rootT = 0.43;
    const originX = bodyCenterAt(rootT) + dir * widthAt(rootT) * 0.50;
    const originY = vortexTopY + vortexH * rootT;
    const reach = s * (0.22 + 1.34 * burstT);
    const tipX = originX + dir * reach;
    const curl = dir * s * (0.055 + 0.035 * Math.sin(unit._aeT * 7.0));
    const upperRootX = bodyCenterAt(0.31) + dir * widthAt(0.31) * 0.34;
    const lowerRootX = bodyCenterAt(0.58) + dir * widthAt(0.58) * 0.30;
    const upperRootY = vortexTopY + vortexH * 0.31;
    const lowerRootY = vortexTopY + vortexH * 0.58;

    ctx.save();
    ctx.globalAlpha = globalA * jAlpha;
    ctx.shadowColor = _aeBranch === 'A' ? '#8babff' : '#bfeaff';
    ctx.shadowBlur = s * 0.20;
    const burstG = ctx.createLinearGradient(originX, originY, tipX, originY);
    if (_aeBranch === 'A') {
      burstG.addColorStop(0, 'rgba(80,108,195,0.78)');
      burstG.addColorStop(0.58, 'rgba(133,169,239,0.62)');
      burstG.addColorStop(1, 'rgba(214,236,255,0.04)');
    } else {
      burstG.addColorStop(0, 'rgba(171,219,249,0.76)');
      burstG.addColorStop(0.58, 'rgba(218,242,255,0.58)');
      burstG.addColorStop(1, 'rgba(250,254,255,0.03)');
    }
    ctx.fillStyle = burstG;
    ctx.beginPath();
    ctx.moveTo(upperRootX, upperRootY);
    ctx.bezierCurveTo(originX + dir * reach * 0.22, originY - s * 0.25,
                      tipX - dir * reach * 0.18, originY - s * 0.20,
                      tipX, originY - curl);
    ctx.bezierCurveTo(tipX - dir * reach * 0.16, originY + s * 0.16,
                      originX + dir * reach * 0.24, originY + s * 0.23,
                      lowerRootX, lowerRootY);
    ctx.bezierCurveTo(originX - dir * s * 0.05, originY + s * 0.08,
                      originX - dir * s * 0.04, originY - s * 0.08,
                      upperRootX, upperRootY);
    ctx.closePath(); ctx.fill();

    // Nested pressure folds describe an expanding wave without turning it into
    // a straight laser. Each fold remains visually tied to the filled release.
    ctx.shadowBlur = 0;
    ctx.lineCap = 'round';
    [0.38, 0.62, 0.82].forEach((frac, i) => {
      const foldX = originX + dir * reach * frac;
      const foldH = s * (0.105 + i * 0.027) * burstT;
      ctx.strokeStyle = `rgba(242,252,255,${0.64 - i * 0.14})`;
      ctx.lineWidth = s * (0.026 - i * 0.004);
      ctx.beginPath();
      ctx.moveTo(foldX - dir * s * 0.045, originY - foldH);
      ctx.quadraticCurveTo(foldX + dir * s * 0.075,
                           originY - curl * (0.35 + i * 0.18),
                           foldX - dir * s * 0.025, originY + foldH);
      ctx.stroke();
    });
    ctx.restore();
  }

  // ── Ghost aura ───────────────────────────────────────────────────
  if (ghosted) {
    ctx.globalAlpha = 0.40 + Math.sin(unit._aeT * 3.5) * 0.15;
    ctx.strokeStyle = 'rgba(220,242,255,0.50)';
    ctx.lineWidth   = s * 0.022;
    ctx.beginPath();
    ctx.ellipse(bodyCenterAt(0.50), (vortexTopY + vortexBotY) / 2,
                s * (_aeBranch === 'A' ? 0.72 : _aeBranch === 'B' ? 0.50 : 0.46),
                s * (_aeBranch === 'B' ? 0.45 : 0.55), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = globalA;
  }

  // ── Branch foreground structure ──────────────────────────────────
  if (_aeBranch === 'A') {
    // Rooted crown and shoulder lightning reinforce the heavy mantle already
    // carrying the silhouette; these are seams in the mass, not orbiting arcs.
    const _t = unit._aeT || 0;
    ctx.save();
    ctx.shadowColor = '#91adff'; ctx.shadowBlur = s * 0.18;
    const crownRootY = vortexTopY + s * 0.16;
    const crownRootX = bodyCenterAt(0.12);
    ctx.fillStyle = `rgba(82,108,192,${0.74 * ghostFlicker})`;
    ctx.strokeStyle = `rgba(190,216,255,${0.82 * ghostFlicker})`;
    ctx.lineWidth = s * 0.018; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(crownRootX - s * 0.22, crownRootY);
    ctx.lineTo(crownRootX - s * 0.18, vortexTopY - s * 0.035);
    ctx.lineTo(crownRootX - s * 0.055, crownRootY - s * 0.075);
    ctx.lineTo(crownRootX + Math.sin(_t * 2.8) * s * 0.018,
               vortexTopY - s * 0.13);
    ctx.lineTo(crownRootX + s * 0.07, crownRootY - s * 0.065);
    ctx.lineTo(crownRootX + s * 0.21, vortexTopY - s * 0.025);
    ctx.lineTo(crownRootX + s * 0.22, crownRootY);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = `rgba(211,230,255,${0.84 * ghostFlicker})`;
    ctx.lineWidth = s * 0.026; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [-1, 1].forEach(side => {
      const shX = bX + side * s * 0.66;
      const shY = vortexTopY + vortexH * 0.36;
      const innerX = bodyCenterAt(0.44) + side * widthAt(0.44) * 0.46;
      const innerY = vortexTopY + vortexH * 0.44;
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.lineTo(shX - side * s * 0.12, shY + s * 0.065);
      ctx.lineTo(shX - side * s * 0.20, shY + s * 0.025);
      ctx.lineTo(innerX, innerY);
      ctx.stroke();
    });
    ctx.restore();
  } else if (_aeBranch === 'B') {
    // Fixed, body-following curl seams clarify the asymmetric S-twist. The
    // crescents themselves were filled behind the torso and never orbit it.
    ctx.save();
    ctx.shadowColor = '#e8f8ff'; ctx.shadowBlur = s * 0.10;
    ctx.strokeStyle = `rgba(242,252,255,${0.70 * ghostFlicker})`;
    ctx.lineWidth = s * 0.022; ctx.lineCap = 'round';
    [0.28, 0.49, 0.70].forEach((tt, i) => {
      const yy = vortexTopY + vortexH * tt;
      const side = i === 1 ? -1 : 1;
      const center = bodyCenterAt(tt);
      ctx.beginPath();
      ctx.moveTo(center - side * widthAt(tt) * 0.28, yy - s * 0.045);
      ctx.quadraticCurveTo(center + side * widthAt(tt) * 0.34,
                           yy - side * s * 0.085,
                           center + side * widthAt(tt) * 0.61,
                           yy + s * 0.035);
      ctx.stroke();
    });

    // Whirlwind release: the compact S-body opens into four rooted crescent
    // vanes around its own axis. This keeps the attack radial and prevents the
    // branch from collapsing back into the base model's horizontal cone.
    if (atkActive && ap > 0.20 && ap < 0.92) {
      const spinUp = ap < 0.62
        ? Math.max(0, Math.min(1, (ap - 0.20) / 0.42))
        : Math.max(0, 1 - (ap - 0.62) / 0.30);
      const easedSpin = 1 - Math.pow(1 - spinUp, 3);
      const hubX = bodyCenterAt(0.48);
      const hubY = vortexTopY + vortexH * 0.48;
      ctx.shadowColor = '#dff7ff'; ctx.shadowBlur = s * 0.18 * easedSpin;
      for (let i = 0; i < 4; i++) {
        const ang = unit._aeT * 3.2 + easedSpin * 1.65 + i * Math.PI * 0.5;
        const ux = Math.cos(ang), uy = Math.sin(ang);
        const tx = -uy, ty = ux;
        const innerR = s * 0.22;
        const outerR = s * (0.43 + easedSpin * 0.32);
        const rootX = hubX + ux * innerR;
        const rootY = hubY + uy * innerR * 0.72;
        const tipX = hubX + ux * outerR;
        const tipY = hubY + uy * outerR * 0.72;
        const vaneW = s * (0.060 + easedSpin * 0.055);
        const vg = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
        vg.addColorStop(0, `rgba(176,222,248,${0.22 + easedSpin * 0.42})`);
        vg.addColorStop(0.68, `rgba(226,247,255,${0.30 + easedSpin * 0.48})`);
        vg.addColorStop(1, 'rgba(248,254,255,0.04)');
        ctx.fillStyle = vg;
        ctx.beginPath();
        ctx.moveTo(rootX - tx * vaneW, rootY - ty * vaneW);
        ctx.quadraticCurveTo(
          hubX + ux * outerR * 0.72 + tx * vaneW * 1.7,
          hubY + uy * outerR * 0.52 + ty * vaneW * 1.7,
          tipX, tipY
        );
        ctx.quadraticCurveTo(
          hubX + ux * outerR * 0.60 - tx * vaneW * 0.55,
          hubY + uy * outerR * 0.44 - ty * vaneW * 0.55,
          rootX + tx * vaneW, rootY + ty * vaneW
        );
        ctx.closePath(); ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // Foreground branch seams can cross the core; repaint the identity point.
  if (_aeBranch) drawFocalFace();

  ctx.restore();
  unit._hpBarY = vortexTopY - s * 0.040;
}
