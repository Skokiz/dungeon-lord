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
  const _lnBranch = unit._branch || '';
  const isThunder = _lnBranch === 'A';
  const isElectro = _lnBranch === 'B';

  // ap 0..0.22: CHARGE (arm retracts, core flashes)
  // ap 0.22..0.65: BOLT flies
  // ap 0.65..1.0: recover
  const chargeT = atkActive && ap < 0.22 ? ap / 0.22 : 0;
  const boltT   = atkActive && ap >= 0.22 && ap < 0.65 ? (ap - 0.22) / 0.43 : 0;

  // Whole-body attack phrasing. Wind-up overlaps the first frames of the
  // strike, so the mass travels through the pose instead of popping in place.
  const ease = v => {
    const n = Math.max(0, Math.min(1, v));
    return n * n * (3 - 2 * n);
  };
  const windupT = !atkActive ? 0
    : ap < 0.22 ? ease(ap / 0.22)
    : ap < 0.34 ? 1 - ease((ap - 0.22) / 0.12)
    : 0;
  const thrustT = !atkActive || ap < 0.22 || ap >= 0.62 ? 0
    : ap < 0.36 ? ease((ap - 0.22) / 0.14)
    : 1 - ease((ap - 0.36) / 0.26) * 0.38;
  const recoilT = atkActive && ap >= 0.54 && ap < 0.82
    ? Math.sin(((ap - 0.54) / 0.28) * Math.PI)
    : 0;
  const settleT = atkActive && ap >= 0.72
    ? Math.sin(((ap - 0.72) / 0.28) * Math.PI * 2) * (1 - (ap - 0.72) / 0.28)
    : 0;

  // Skeleton points (humanoid silhouette)
  const isMoving = unit.state === 'move';
  const gaitPhase = unit._lnT * 5.2;
  const gait = isMoving ? Math.sin(gaitPhase) : 0;
  const footStrike = isMoving ? Math.abs(Math.cos(gaitPhase)) : 0;
  const stepLiftL = isMoving ? Math.max(0, gait) * s * 0.085 : 0;
  const stepLiftR = isMoving ? Math.max(0, -gait) * s * 0.085 : 0;
  const compression = isMoving ? footStrike * 0.055 : 0;
  const stretch = isMoving ? Math.abs(gait) * 0.065 : 0;
  const bodyScaleY = 1 + stretch - compression - windupT * 0.075 + thrustT * 0.055;
  const moveLean = isMoving ? dir * s * (0.032 + Math.abs(gait) * 0.026) : 0;
  const weightShift = isMoving ? -dir * gait * s * 0.050 : 0;
  const attackShiftX = -dir * s * 0.115 * windupT
                     + dir * s * 0.205 * thrustT
                     - dir * s * 0.095 * recoilT
                     + dir * s * 0.025 * settleT;
  const attackShiftY = s * 0.090 * windupT
                     - s * 0.052 * thrustT
                     + s * 0.046 * recoilT
                     + s * 0.014 * Math.abs(settleT);
  const floatY  = Math.sin(unit._lnT * 2.05) * s * 0.018
                + footStrike * s * 0.026 - Math.abs(gait) * s * 0.020;
  const coreCX  = cx + moveLean + weightShift + attackShiftX;
  const coreCY  = fY - s * 0.48 + floatY + attackShiftY;
  const bodyLean = dir * s * (0.020 * (isMoving ? 1 : 0)
                 - 0.070 * windupT + 0.095 * thrustT - 0.050 * recoilT);
  const headCX  = coreCX + bodyLean;
  const headCY  = coreCY - s * 0.34 * bodyScaleY;
  const headR   = s * 0.110;
  const coreR   = s * (isThunder ? 0.195 : 0.180);

  // Shoulders / hips
  const shX = s * (isThunder ? 0.175 : 0.145);
  const shY = coreCY - s * 0.10 * bodyScaleY;
  const hpX = s * 0.110;
  const hpY = coreCY + s * 0.09 * bodyScaleY;
  // Hand target positions (arms extended outward+down)
  const handBaseX = s * (isThunder ? 0.235 : 0.320);
  const handBaseY = coreCY + s * 0.03;
  // Foot positions (on floor)
  const footX = s * (isThunder ? 0.112 : 0.145);
  const footY = fY - s * 0.006;
  const attackStance = Math.max(windupT, thrustT, recoilT);
  const frontStep = s * attackStance * (0.060 + thrustT * 0.055);
  const backBrace = s * attackStance * (0.055 + windupT * 0.035);
  const footLX = cx - footX + dir * gait * s * 0.110
               + (dir === -1 ? dir * frontStep : -dir * backBrace);
  const footRX = cx + footX - dir * gait * s * 0.110
               + (dir === 1 ? dir * frontStep : -dir * backBrace);
  const footLY = footY - stepLiftL;
  const footRY = footY - stepLiftR;

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

  // Electro branch: substantial conductors grow from shoulder/back sockets.
  // They are drawn behind the torso so their roots disappear into the body
  // mass instead of reading as wires laid over the character.
  const branchConductors = [];
  if (isElectro) {
    const drawConductor = (rootX, rootY, tipX, tipY, rootW, tipW, hotSide) => {
      const dx = tipX - rootX, dy = tipY - rootY;
      const len = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
      const nx = -dy / len, ny = dx / len;
      const shoulderX = rootX + dx * 0.22;
      const shoulderY = rootY + dy * 0.22;
      const g = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
      g.addColorStop(0, 'rgba(34,58,138,0.96)');
      g.addColorStop(0.58, hotSide ? 'rgba(48,105,205,0.96)' : 'rgba(32,76,174,0.96)');
      g.addColorStop(1, 'rgba(142,210,255,0.96)');
      ctx.save();
      ctx.shadowColor = '#559dff'; ctx.shadowBlur = s * 0.15;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(rootX + nx * rootW, rootY + ny * rootW);
      ctx.quadraticCurveTo(shoulderX + nx * rootW * 1.15, shoulderY + ny * rootW * 1.15,
                           tipX + nx * tipW, tipY + ny * tipW);
      ctx.lineTo(tipX + dx / len * s * 0.045, tipY + dy / len * s * 0.045);
      ctx.lineTo(tipX - nx * tipW, tipY - ny * tipW);
      ctx.quadraticCurveTo(shoulderX - nx * rootW * 1.15, shoulderY - ny * rootW * 1.15,
                           rootX - nx * rootW, rootY - ny * rootW);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(184,225,255,0.78)';
      ctx.lineWidth = s * 0.018; ctx.stroke();
      ctx.shadowColor = '#b9e8ff'; ctx.shadowBlur = s * 0.12;
      ctx.strokeStyle = hotSide ? 'rgba(235,250,255,0.90)' : 'rgba(130,208,255,0.82)';
      ctx.lineWidth = s * 0.026;
      ctx.beginPath(); ctx.moveTo(rootX, rootY); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.restore();
      branchConductors.push({rootX, rootY, tipX, tipY});
    };

    drawConductor(coreCX - shX * 0.78, shY + s * 0.020,
                  coreCX - s * 0.43, headCY - s * 0.015,
                  s * 0.095, s * 0.047, false);
    drawConductor(coreCX + shX * 0.82, shY + s * 0.035,
                  coreCX + s * 0.58, coreCY - s * 0.20,
                  s * 0.115, s * 0.058, true);
    drawConductor(coreCX - shX * 0.58, coreCY + s * 0.055,
                  coreCX - s * 0.45, coreCY + s * 0.30,
                  s * 0.090, s * 0.052, false);
  }

  // ── Filled tapered plasma torso — the stable silhouette ──────────
  {
    const _topY = coreCY - s * 0.245 * bodyScaleY;
    const _botY = coreCY + s * 0.260 * bodyScaleY;
    const _shoulder = s * (isThunder ? 0.325 : 0.270) * (1 + compression * 0.6);
    const _waist = s * (isThunder ? 0.190 : 0.155);
    const _hip = s * (isThunder ? 0.215 : 0.190);
    ctx.save();
    ctx.shadowColor = '#66a0ff';
    ctx.shadowBlur  = s * 0.20 * globalFlash;
    const _tg = ctx.createLinearGradient(coreCX - _shoulder, _topY, coreCX + _shoulder, _botY);
    _tg.addColorStop(0,   `rgba(72,112,210,${0.42 * globalFlash})`);
    _tg.addColorStop(0.48,`rgba(172,208,255,${0.68 * globalFlash})`);
    _tg.addColorStop(1,   `rgba(45,82,185,${0.38 * globalFlash})`);
    ctx.fillStyle = _tg;
    ctx.beginPath();
    ctx.moveTo(coreCX, _topY);
    ctx.bezierCurveTo(coreCX + _shoulder*0.82, _topY, coreCX + _shoulder, coreCY - s*0.06, coreCX + _waist, coreCY + s*0.08);
    ctx.quadraticCurveTo(coreCX + _hip, _botY - s*0.05, coreCX, _botY);
    ctx.quadraticCurveTo(coreCX - _hip, _botY - s*0.05, coreCX - _waist, coreCY + s*0.08);
    ctx.bezierCurveTo(coreCX - _shoulder, coreCY - s*0.06, coreCX - _shoulder*0.82, _topY, coreCX, _topY);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(160,205,255,${0.42 * globalFlash})`;
    ctx.lineWidth = s * 0.018; ctx.stroke();
    ctx.restore();
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
  drawLimb(coreCX - hpX * 0.7, hpY, footLX, footLY,
           s * 0.070, s * 0.026, unit._lnSeed + 5.1, globalFlash);
  drawLimb(coreCX + hpX * 0.7, hpY, footRX, footRY,
           s * 0.070, s * 0.026, unit._lnSeed + 6.3, globalFlash);
  [[footLX,footLY],[footRX,footRY]].forEach(([fx,fy]) => {
    ctx.shadowColor = '#aaddff'; ctx.shadowBlur = s * 0.12;
    ctx.fillStyle = 'rgba(215,240,255,0.88)';
    ctx.beginPath(); ctx.ellipse(fx + dir*s*0.018, fy, s*0.052, s*0.026, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Arms — articulated into upper/lower segments so gait counter-swing and
  // the attack's wind-up/thrust remain legible through the plasma jitter.
  let attackHandX = coreCX + dir * handBaseX;
  let attackHandY = handBaseY;
  const handBySide = {};
  [-1, 1].forEach(side => {
    const isAtk = side === dir;
    const shoulderX = coreCX + side * shX * 0.78
                    - dir * side * gait * s * 0.030;
    const shoulderY = shY + side * gait * s * 0.012;
    let hX, hY, elbowX, elbowY;

    if (isElectro && atkActive && ap >= 0.22 && ap < 0.76) {
      // Chain discharge opens BOTH arms around the charged torso. The branch
      // attacks as a conductor network, not as the base model's casting hand.
      const openT = ap < 0.52
        ? Math.min(1, (ap - 0.22) / 0.20)
        : Math.max(0, 1 - (ap - 0.52) / 0.24);
      hX = coreCX + side * s * (0.31 + openT * 0.17);
      hY = coreCY - s * (0.015 + openT * 0.13);
      elbowX = coreCX + side * s * (0.19 + openT * 0.10);
      elbowY = coreCY + s * (0.025 - openT * 0.08);
    } else if (atkActive && isAtk && ap < 0.22) {
      // Cock the casting arm behind and below the compressed torso.
      hX = coreCX - dir * s * (0.105 + windupT * 0.105);
      hY = coreCY + s * (0.015 + windupT * 0.055);
      elbowX = coreCX - dir * s * (0.215 + windupT * 0.045);
      elbowY = coreCY - s * 0.105;
    } else if (atkActive && isAtk && ap < 0.65) {
      // The fist leads the torso; elbow follows through the same force line.
      hX = coreCX + dir * s * (0.300 + thrustT * 0.165);
      hY = coreCY - s * (0.025 + thrustT * 0.050);
      elbowX = coreCX + dir * s * (0.120 + thrustT * 0.130);
      elbowY = coreCY + s * (0.015 - thrustT * 0.045);
    } else if (atkActive && isAtk) {
      hX = coreCX + dir * s * (0.255 - recoilT * 0.070 + settleT * 0.020);
      hY = coreCY + s * (0.005 + recoilT * 0.045);
      elbowX = coreCX + dir * s * 0.105;
      elbowY = coreCY + s * 0.030;
    } else if (atkActive) {
      // Support hand closes over the chest charge, then snaps backward as a
      // counterweight to the casting-side thrust.
      const supportClose = Math.max(windupT, chargeT);
      hX = coreCX - dir * s * (0.020 + thrustT * 0.155)
         + side * s * (0.090 - supportClose * 0.045);
      hY = coreCY + s * (0.035 + thrustT * 0.105 - supportClose * 0.055);
      elbowX = coreCX + side * s * 0.205 - dir * thrustT * s * 0.070;
      elbowY = coreCY - s * 0.020 + thrustT * s * 0.085;
    } else {
      // Same-side hand travels opposite its leg; shoulders and elbows carry
      // a smaller counter-rotation to sell weight transfer.
      hX = coreCX + side * handBaseX + dir * side * gait * s * 0.105;
      hY = handBaseY - side * gait * s * 0.032
         + Math.sin(unit._lnT * 2.2 + side) * s * 0.010;
      elbowX = (shoulderX + hX) * 0.5 + side * s * 0.035
             + dir * side * gait * s * 0.035;
      elbowY = (shoulderY + hY) * 0.5 - side * gait * s * 0.018;
    }
    drawLimb(shoulderX, shoulderY, elbowX, elbowY,
             s * 0.066, s * 0.022, unit._lnSeed + (side > 0 ? 2.4 : 3.6), globalFlash);
    drawLimb(elbowX, elbowY, hX, hY,
             s * 0.058, s * 0.023, unit._lnSeed + (side > 0 ? 4.1 : 4.8), globalFlash);
    // Hand spark
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * 0.22 * globalFlash;
    ctx.fillStyle = `rgba(240,248,255,${0.88 * globalFlash})`;
    ctx.beginPath(); ctx.arc(hX, hY, s * 0.028, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    handBySide[side] = { x: hX, y: hY };
    if (isAtk) { attackHandX = hX; attackHandY = hY; }
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

  // Charge visibly converges from torso and shoulder mass into the casting
  // fist. Thunder carries a yellow payload; the base/Electro charge stays hot
  // white-blue.
  if (chargeT > 0) {
    const chargeColor = isThunder ? '255,232,54' : '224,245,255';
    const chargeAlpha = 0.30 + chargeT * 0.62;
    const chargeRoots = [
      [coreCX - dir * coreR * 0.55, coreCY + s * 0.020],
      [coreCX + dir * coreR * 0.20, coreCY - coreR * 0.68],
      [coreCX, coreCY + coreR * 0.62]
    ];
    ctx.shadowColor = isThunder ? '#ffe92f' : '#bdeaff';
    ctx.shadowBlur = s * (0.14 + chargeT * 0.18);
    ctx.strokeStyle = `rgba(${chargeColor},${chargeAlpha})`;
    ctx.lineWidth = s * (0.012 + chargeT * 0.012);
    chargeRoots.forEach((root, i) => {
      const gatherX = attackHandX + (coreCX - attackHandX) * (0.18 + i * 0.12);
      const gatherY = attackHandY + (coreCY - attackHandY) * (0.10 + i * 0.08);
      _lnJaggedLine(ctx, root[0], root[1], gatherX, gatherY,
                    4, s * 0.022, unit._lnT * 3.5, unit._lnSeed + 15 + i);
    });
    ctx.fillStyle = `rgba(${chargeColor},${0.58 + chargeT * 0.40})`;
    ctx.beginPath();
    ctx.arc(attackHandX, attackHandY, s * (0.040 + chargeT * 0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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
  const boltActive = !isElectro && atkActive && ap > 0.22 && ap < 0.86;
  if (boltActive) {
    const progress = Math.min(1, (ap - 0.22) / 0.46);
    const boltMaxD = s * 1.90;
    const originX  = attackHandX;
    const originY  = attackHandY;
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
  if (isThunder) {
    // Thunder: a dense armored coil clamps around the torso. Broad plates and
    // a continuous outer yoke alter the silhouette; yellow seams carry stun
    // charge without relying on concentric aura overlays.
    const _t = unit._lnT;
    const _pu = 0.72 + Math.sin(_t * 4.4) * 0.16;

    // Heavy shoulder armor closes the upper silhouette around the head.
    [-1, 1].forEach(side => {
      const innerX = coreCX + side * s * 0.105;
      const outerX = coreCX + side * s * 0.355;
      const topY = shY - s * (side < 0 ? 0.105 : 0.075);
      const botY = coreCY + s * 0.055;
      const plateG = ctx.createLinearGradient(innerX, topY, outerX, botY);
      plateG.addColorStop(0, 'rgba(92,126,210,0.96)');
      plateG.addColorStop(1, 'rgba(24,43,118,0.98)');
      ctx.shadowColor = '#617fff'; ctx.shadowBlur = s * 0.13;
      ctx.fillStyle = plateG;
      ctx.beginPath();
      ctx.moveTo(innerX, topY);
      ctx.lineTo(outerX, topY + s * 0.035);
      ctx.lineTo(outerX + side * s * 0.035, coreCY - s * 0.015);
      ctx.lineTo(coreCX + side * s * 0.225, botY);
      ctx.lineTo(innerX, coreCY + s * 0.015);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,226,54,${0.68 + _pu * 0.22})`;
      ctx.lineWidth = s * 0.018; ctx.stroke();
    });

    // Outer yoke: one continuous mass-hugging coil, not a floating oval.
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = '#314cae'; ctx.shadowBlur = s * 0.14;
    ctx.strokeStyle = 'rgba(25,42,110,0.98)';
    ctx.lineWidth = s * 0.105;
    ctx.beginPath();
    ctx.moveTo(coreCX - s * 0.275, coreCY - s * 0.105);
    ctx.bezierCurveTo(coreCX - s * 0.335, coreCY + s * 0.055,
                      coreCX - s * 0.240, coreCY + s * 0.245,
                      coreCX, coreCY + s * 0.285);
    ctx.bezierCurveTo(coreCX + s * 0.240, coreCY + s * 0.245,
                      coreCX + s * 0.335, coreCY + s * 0.055,
                      coreCX + s * 0.275, coreCY - s * 0.105);
    ctx.stroke();
    ctx.shadowColor = '#ffe52d'; ctx.shadowBlur = s * 0.16;
    ctx.strokeStyle = `rgba(255,228,48,${0.58 + _pu * 0.32})`;
    ctx.lineWidth = s * 0.018; ctx.stroke();

    // Two charged compression bands lock the chest into the coil.
    [-0.050, 0.090].forEach((yOff, i) => {
      const span = s * (0.245 - i * 0.025);
      const y = coreCY + s * yOff;
      ctx.shadowColor = '#1b2f88'; ctx.shadowBlur = s * 0.08;
      ctx.strokeStyle = 'rgba(30,52,132,0.96)';
      ctx.lineWidth = s * 0.070;
      ctx.beginPath();
      ctx.moveTo(coreCX - span, y - s * 0.018);
      ctx.quadraticCurveTo(coreCX, y + s * 0.060, coreCX + span, y - s * 0.018);
      ctx.stroke();
      ctx.shadowColor = '#ffe92f'; ctx.shadowBlur = s * 0.12;
      ctx.strokeStyle = `rgba(255,232,54,${0.55 + _pu * 0.30})`;
      ctx.lineWidth = s * 0.012; ctx.stroke();
    });

    // Stun discharge is angular and body-rooted; no expanding ellipse overlay.
    if (atkActive && ap > 0.22 && ap < 0.60) {
      const burst = (ap - 0.22) / 0.38;
      const burstAlpha = (1 - burst) * 0.82;
      ctx.shadowColor = '#ffed3b'; ctx.shadowBlur = s * 0.20 * (1 - burst);
      ctx.strokeStyle = `rgba(255,235,64,${burstAlpha})`;
      ctx.lineWidth = s * (0.030 - burst * 0.016);
      for (let bi = 0; bi < 6; bi++) {
        const ang = -Math.PI * 0.88 + bi * Math.PI * 0.35;
        const rootR = s * 0.26;
        const reach = s * (0.17 + burst * 0.32);
        const bx1 = coreCX + Math.cos(ang) * rootR;
        const by1 = coreCY + Math.sin(ang) * rootR * 0.78;
        _lnJaggedLine(ctx, bx1, by1,
          bx1 + Math.cos(ang) * reach, by1 + Math.sin(ang) * reach,
          3, s * 0.022, _t * 4, unit._lnSeed + 31 + bi);
      }
    }
    ctx.shadowBlur = 0;

  } else if (isElectro) {
    // Electro: sockets and discharges remain visibly attached to the massive,
    // asymmetric shoulder/back conductors drawn behind the torso.
    const _t = unit._lnT;
    branchConductors.forEach((c, ci) => {
      const socketPulse = 0.72 + Math.sin(_t * 5.5 + ci * 1.7) * 0.18;
      ctx.shadowColor = '#8fd8ff'; ctx.shadowBlur = s * 0.16;
      ctx.fillStyle = `rgba(116,194,255,${socketPulse})`;
      ctx.beginPath(); ctx.arc(c.rootX, c.rootY, s * (0.048 + ci * 0.004), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(225,248,255,${0.76 + socketPulse * 0.20})`;
      ctx.beginPath(); ctx.arc(c.tipX, c.tipY, s * (0.026 + ci * 0.004), 0, Math.PI * 2); ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Bilateral chain discharge: energy opens through both hands, crosses the
    // chest core, then forks from the rooted conductors into opposite ground
    // contacts. There is deliberately no forward copy of the base beam.
    if (atkActive && ap > 0.22 && ap < 0.86) {
      const _bProg = Math.min(1, (ap - 0.22) / 0.46);
      const _bAl = Math.min(1, _bProg * 2.8)
        * (1 - Math.max(0, (_bProg - 0.72) / 0.28));
      if (_bAl > 0) {
        const leftHand = handBySide[-1];
        const rightHand = handBySide[1];
        ctx.shadowColor = '#8fd8ff'; ctx.shadowBlur = s * 0.24 * _bAl;
        ctx.strokeStyle = `rgba(195,235,255,${0.78 * _bAl})`;
        ctx.lineWidth = s * 0.042; ctx.lineCap = 'round';
        _lnJaggedLine(ctx, leftHand.x, leftHand.y, coreCX, coreCY,
          4, s * 0.030, _t * 2.1, unit._lnSeed + 50);
        _lnJaggedLine(ctx, coreCX, coreCY, rightHand.x, rightHand.y,
          4, s * 0.030, _t * 2.1, unit._lnSeed + 51);

        branchConductors.forEach((c, bi) => {
          const side = c.tipX < coreCX ? -1 : 1;
          const groundX = coreCX + side * s * (0.55 + _bProg * (0.62 + bi * 0.10));
          const groundY = fY - s * (0.005 + bi * 0.012);
          ctx.strokeStyle = `rgba(82,150,248,${0.72 * _bAl})`;
          ctx.lineWidth = s * 0.052;
          _lnJaggedLine(ctx, c.tipX, c.tipY, groundX, groundY,
            6, s * 0.048, _t * 2.8, unit._lnSeed + 54 + bi);
          ctx.strokeStyle = `rgba(225,247,255,${0.92 * _bAl})`;
          ctx.lineWidth = s * 0.018;
          _lnJaggedLine(ctx, c.tipX, c.tipY, groundX, groundY,
            6, s * 0.025, _t * 3.4, unit._lnSeed + 58 + bi);
          ctx.fillStyle = `rgba(220,245,255,${0.82 * _bAl})`;
          ctx.beginPath(); ctx.ellipse(groundX, groundY, s * 0.060, s * 0.020, 0, 0, Math.PI * 2); ctx.fill();
        });
        ctx.shadowBlur = 0;
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
