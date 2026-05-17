// ═══════════════════════════════════════════════════════════════════════════
//  MINOTAUR — рівень 8, здібність: aoe4th (AoE кожен 4-й удар)
//  Високий м'язистий бик-воїн: широкі роги в боки, контрапост, живі ідл-
//  анімації. Атака — ТАРАН РОГАМИ: ривок уперед із нахиленою головою.
//  На 4-й удар — подовжений ривок + ґрунтова хвиля.
// ═══════════════════════════════════════════════════════════════════════════
function drawMinotaurMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._mnLastT || _frameNow)) / 1000, 0.05);
  unit._mnLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._mnDir === undefined) {
    unit._mnDir = 1; unit._mnPrevX = cx;
    unit._mnPrevAcd = unit.attackCooldown;
    unit._mnT = 0; unit._mnAp = 0;
    unit._mnWaveT = 0; unit._mnStruck = false;
    unit._mnSteam = Array.from({length: 3}, () => ({ life: Math.random() }));
    unit._mnDust  = Array.from({length: 4}, () => ({ life: Math.random(), side: Math.random() < 0.5 ? -1 : 1 }));
  }
  if (Math.abs(cx - unit._mnPrevX) > 0.2)
    unit._mnDir = cx > unit._mnPrevX ? 1 : -1;
  unit._mnPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._mnDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._mnDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._mnPrevAcd || 0) + 3) {
    unit._mnAp = 1.0; unit._mnStruck = false;
  }
  unit._mnPrevAcd = acd;
  unit._mnT += dt;

  const atkDur = Math.min(0.66, atkBase / 60 * 0.82);
  if (unit._mnAp > 0)    unit._mnAp    = Math.max(0, unit._mnAp    - dt / atkDur);
  if (unit._mnWaveT > 0) unit._mnWaveT = Math.max(0, unit._mnWaveT - dt * 1.10);

  const atkActive = unit._mnAp > 0;
  const ap        = 1 - unit._mnAp;
  const inFight   = unit.state === 'fight' || atkActive;

  const aoeCharging = ((unit.aoeHitCount || 0) % 4) === 3;

  // ── Horn-charge attack phases ────────────────────────────────────
  // ap 0..0.28 WIND-UP: lean back, head lowers preparing horns
  // ap 0.28..0.52 CHARGE: lunge forward with horns, strongest at mid
  // ap 0.52..1.0 RECOVER: pull back
  const windUpT = atkActive && ap < 0.28 ? ap / 0.28 : 0;
  const chargeT = atkActive && ap >= 0.28 && ap < 0.52 ? (ap - 0.28) / 0.24 : 0;
  const recoverT = atkActive && ap >= 0.52 ? (ap - 0.52) / 0.48 : 0;

  // AoE: extended forward reach and shockwave at peak
  const aoeMult = aoeCharging ? 1.40 : 1.0;

  // Rush forward (body translates toward dir at impact)
  let rushX = 0;
  if (windUpT > 0) rushX = -dir * windUpT * s * 0.09;
  else if (chargeT > 0) {
    const bell = 4 * chargeT * (1 - chargeT);  // peak in middle
    rushX = dir * bell * s * 0.26 * aoeMult;
  }
  else if (recoverT > 0) rushX = dir * (1 - recoverT) * s * 0.16 * aoeMult;

  // Head pitch: tilt chin down during attack (horns point forward)
  let headPitch = 0;
  if (windUpT > 0) headPitch = windUpT * 0.30;
  else if (chargeT > 0) headPitch = 0.40 + chargeT * 0.10;
  else if (recoverT > 0) headPitch = 0.40 * (1 - recoverT);

  // Body lean
  let leanBody = 0;
  if (windUpT > 0) leanBody = -dir * windUpT * 0.10;
  else if (chargeT > 0) leanBody = dir * (0.12 + chargeT * 0.10);
  else if (recoverT > 0) leanBody = dir * 0.20 * (1 - recoverT);

  // Shockwave trigger on impact (mid-charge)
  if (aoeCharging && atkActive && chargeT > 0.55 && !unit._mnStruck) {
    unit._mnWaveT = 1.0; unit._mnStruck = true;
  }

  // ── Proportions (TALLER + MORE MUSCLE) ───────────────────────────
  const shW    = s * 0.600;      // a bit wider for bulk
  const hipW   = s * 0.310;      // V-taper
  const bodyH  = s * 0.490;      // taller torso
  const legH   = s * 0.360;      // much longer legs
  const headW  = s * 0.285;
  const headH  = s * 0.325;
  const neckH  = s * 0.070;
  const hornLen = s * 0.290;

  // ── Organic idle animation ───────────────────────────────────────
  const bTime = unit._mnT;
  const breatheY    = Math.sin(bTime * 1.10) * s * 0.020;
  const breatheBel  = Math.sin(bTime * 1.10 + 0.4) * s * 0.014;
  const weightShift = Math.sin(bTime * 0.45) * s * 0.022;
  const shoulderRoll = Math.sin(bTime * 0.70) * s * 0.010;
  const headBob     = Math.sin(bTime * 1.20 + 0.5) * s * 0.012;
  const headTilt    = Math.sin(bTime * 0.55) * 0.06;
  const neckLean    = Math.sin(bTime * 0.80) * s * 0.008;

  // ── Walk cycle (heavy bipedal, digitigrade hooves) ───────────────
  const isWalking = unit.state === 'move';
  const walkFreq  = 1.65;                                // slow heavy plod (cycles/sec)
  const walkPhase = isWalking ? ((bTime * walkFreq) % 1) : 0;
  // Body Y bob: LOW at contacts (0, 0.5), HIGH at mid-stance (0.25, 0.75)
  // Using (1 - |sin(2πφ)|) → peaks at 0, 0.5; troughs at 0.25, 0.75
  const walkBob = isWalking
    ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.034
    : 0;
  // Body X sway: weight on the planted leg (side = -1 when walkPhase < 0.5)
  const walkSwayX = isWalking
    ? Math.sin(walkPhase * Math.PI * 2) * s * 0.018
    : 0;
  // Hip tilt: down on the SWINGING leg side
  // When walkPhase in [0,0.5] → leg(-1) stance, leg(+1) swing → hips tilt toward +1
  const hipTiltWalk = isWalking ? Math.sin(walkPhase * Math.PI * 2) * 0.065 : 0;
  // Shoulder counter-tilt (opposite of hips for natural counter-rotation)
  const shTiltWalk = isWalking ? -Math.sin(walkPhase * Math.PI * 2) * 0.045 : 0;
  // Slight forward lean when walking
  const walkLean = isWalking ? dir * s * 0.020 : 0;
  // Head bob during walk (slightly delayed)
  const walkHeadBob = isWalking
    ? (1 - Math.abs(Math.sin((walkPhase + 0.08) * Math.PI * 2))) * s * 0.022
    : 0;

  const stepBob  = walkBob;
  const stepSide = isWalking ? walkSwayX : weightShift;

  const bX = cx + stepSide * 0.5 + rushX + walkLean;
  const bodyBot = fY - legH + stepBob;
  const bodyTop = bodyBot - bodyH - breatheY;
  const neckTop = bodyTop - neckH;
  const headCY = neckTop - headH * 0.50 + breatheY + headBob + walkHeadBob;
  const headCX = bX + dir * s * 0.030 + neckLean + leanBody * s * 0.8;
  const tilt = dir * s * 0.016 + shoulderRoll + leanBody * s * 0.5 + shTiltWalk * s * 0.8;

  ctx.save();

  // ── Ground shadow ────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(15,4,0,0.48)';
  ctx.beginPath();
  ctx.ellipse(cx + rushX * 0.5, fY + s * 0.020, s * 0.54, s * 0.082, 0, 0, Math.PI * 2); ctx.fill();

  // ── Ground dust on charge ────────────────────────────────────────
  if (chargeT > 0 || recoverT > 0) {
    unit._mnDust.forEach((d, di) => {
      d.life -= dt * 2.5;
      if (d.life <= 0) {
        d.life = 1; d.side = Math.random() < 0.5 ? -1 : 1;
      }
      const dLife = d.life;
      const dx = bX - dir * s * 0.25 + d.side * s * 0.12 - dir * (1 - dLife) * s * 0.30;
      const dy = fY + s * 0.010 - (1 - dLife) * s * 0.05;
      ctx.fillStyle = `rgba(140,95,55,${dLife * 0.55})`;
      ctx.beginPath();
      ctx.arc(dx, dy, s * (0.022 + (1 - dLife) * 0.025), 0, Math.PI * 2); ctx.fill();
    });
  }

  // Ground paw-scrape during wind-up (front hoof grinds floor)
  if (windUpT > 0.3) {
    ctx.strokeStyle = `rgba(60,30,10,${windUpT * 0.6})`;
    ctx.lineWidth = s * 0.012;
    ctx.beginPath();
    ctx.moveTo(bX + dir * s * 0.10, fY + s * 0.015);
    ctx.lineTo(bX + dir * s * 0.26, fY + s * 0.015);
    ctx.stroke();
  }

  // ── AoE ground shockwave ─────────────────────────────────────────
  if (unit._mnWaveT > 0) {
    const wt = unit._mnWaveT;
    const wR = s * (0.28 + (1 - wt) * 1.25);
    ctx.strokeStyle = `rgba(255,80,20,${wt * 0.78})`;
    ctx.lineWidth   = s * 0.034;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    const startA = dir > 0 ? -Math.PI * 0.85 : Math.PI * 0.15;
    const endA   = dir > 0 ? -Math.PI * 0.15 : Math.PI * 0.85;
    ctx.ellipse(bX, fY + s * 0.012, wR, wR * 0.34, 0, startA, endA);
    ctx.stroke();
    if (wt > 0.3) {
      ctx.strokeStyle = `rgba(255,220,80,${(wt - 0.3) * 1.4 * 0.62})`;
      ctx.lineWidth = s * 0.018;
      const wR2 = s * (0.16 + (1 - wt) * 0.85);
      ctx.beginPath();
      ctx.ellipse(bX, fY + s * 0.012, wR2, wR2 * 0.32, 0, startA, endA);
      ctx.stroke();
    }
    for (let di = 0; di < 5; di++) {
      const da = startA + (di / 4) * (endA - startA);
      const dx2 = bX + Math.cos(da) * wR * 0.92;
      const dy2 = fY + s * 0.012 + Math.sin(da) * wR * 0.32 - (1 - wt) * s * 0.03;
      ctx.fillStyle = `rgba(150,80,30,${wt * 0.75})`;
      ctx.beginPath();
      ctx.moveTo(dx2 - s * 0.016, dy2);
      ctx.lineTo(dx2, dy2 - s * 0.022);
      ctx.lineTo(dx2 + s * 0.016, dy2 + s * 0.008);
      ctx.closePath(); ctx.fill();
    }
  }

  // ── Tail ─────────────────────────────────────────────────────────
  const tailSway = Math.sin(bTime * 1.3) * s * 0.055 + weightShift * 1.5 - rushX * 0.3;
  const tailBaseX = bX - dir * s * 0.08;
  const tailBaseY = bodyBot - s * 0.060;
  const tailEndX  = tailBaseX - dir * s * 0.08 + tailSway;
  const tailEndY  = tailBaseY + s * 0.22;
  const tailMidX  = (tailBaseX + tailEndX) / 2 - dir * s * 0.04;
  const tailMidY  = (tailBaseY + tailEndY) / 2 + s * 0.02;
  ctx.strokeStyle = '#1a0a04'; ctx.lineWidth = s * 0.030; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(tailMidX, tailMidY, tailEndX, tailEndY);
  ctx.stroke();
  ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = s * 0.014;
  ctx.beginPath();
  ctx.moveTo(tailBaseX + s * 0.004, tailBaseY);
  ctx.quadraticCurveTo(tailMidX + s * 0.004, tailMidY, tailEndX, tailEndY);
  ctx.stroke();
  ctx.fillStyle = '#0a0402';
  for (let ti = 0; ti < 4; ti++) {
    const tt = ti * 0.18;
    const tx = tailEndX + Math.cos(tt * Math.PI + Math.sin(bTime * 2) * 0.3) * s * 0.030;
    const ty = tailEndY + Math.sin(tt * Math.PI + Math.sin(bTime * 2) * 0.3) * s * 0.030 + ti * s * 0.008;
    ctx.beginPath();
    ctx.arc(tx, ty, s * (0.024 - ti * 0.003), 0, Math.PI * 2); ctx.fill();
  }

  // ── Legs (walk cycle OR contrapposto idle + paw-scrape on windup) ─
  const contraBias = Math.sin(bTime * 0.45);
  [-1, 1].forEach(side => {
    // Walk phase: side=-1 leads first, side=+1 is 0.5 cycle behind
    const legPhase = isWalking ? ((walkPhase + (side === 1 ? 0.5 : 0)) % 1) : 0;
    // Compute walk-based foot position (relative to hip)
    let walkFwd = 0, walkFootLift = 0, walkKneeDrive = 0, walkKneeBendY = 0;
    if (isWalking) {
      if (legPhase < 0.5) {
        // STANCE: foot stays planted; moves from +front to -back relative to hip as body passes
        const t = legPhase / 0.5;                       // 0..1
        walkFwd = (0.45 - t * 0.9) * s * 0.14;          // +0.063 → -0.063
        walkFootLift = 0;
        // Slight knee compression mid-stance (absorb weight)
        walkKneeBendY = Math.sin(t * Math.PI) * s * 0.008;
        walkKneeDrive = 0;
      } else {
        // SWING: foot arcs from back, up, forward
        const t = (legPhase - 0.5) / 0.5;               // 0..1
        walkFwd = (-0.45 + t * 0.9) * s * 0.14;         // -0.063 → +0.063
        walkFootLift = Math.sin(t * Math.PI) * s * 0.075;
        // Knee lifts forward and bends strongly during swing
        walkKneeDrive = Math.sin(t * Math.PI) * s * 0.050;
        walkKneeBendY = Math.sin(t * Math.PI) * s * 0.022;
      }
    }
    // Idle contrapposto (only when not moving and not attacking)
    const isWeighted = (side === (contraBias > 0 ? 1 : -1));
    const idleLift = !isWeighted && !isWalking && !atkActive ? Math.abs(contraBias) * s * 0.018 : 0;
    const idleKneeX = !isWeighted && !isWalking && !atkActive ? Math.abs(contraBias) * s * 0.012 : 0;
    // Paw scrape during attack wind-up (front leg only, overrides walk for that leg)
    const isFront = (side === dir);
    const pawLift = isFront && windUpT > 0.25 ? Math.sin(windUpT * Math.PI * 3) * s * 0.030 : 0;
    // Hip position: includes hip tilt for walk (down on swing side)
    const hipTiltAmt = isWalking ? hipTiltWalk * side * (-1) : 0;  // down on swing leg
    const hipX = bX + side * hipW * 0.85 - tilt * 0.15;
    const hipY = bodyBot - weightShift * 0.2 + hipTiltAmt * s * 0.4;
    // Knee: pulled forward in dir direction during swing, bent upward
    const kneeX = hipX + side * s * 0.018 + idleKneeX * side
                + dir * walkKneeDrive + pawLift * dir * 0.5;
    const kneeY = hipY + legH * 0.48 + idleLift * 0.5
                - pawLift * 0.5 - walkKneeBendY - walkFootLift * 0.35;
    const hoofX = hipX + side * s * 0.030 + walkFwd + pawLift * dir * 0.8;
    const hoofY = fY - s * 0.008 + idleLift - pawLift - walkFootLift;

    // Upper leg (thick thigh)
    ctx.strokeStyle = '#2e1608'; ctx.lineWidth = s * 0.220; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kneeX, kneeY); ctx.stroke();
    // Shin
    ctx.strokeStyle = '#1c0d05'; ctx.lineWidth = s * 0.160;
    ctx.beginPath(); ctx.moveTo(kneeX, kneeY); ctx.lineTo(hoofX, hoofY); ctx.stroke();
    // Thigh muscle (front)
    ctx.strokeStyle = '#5a2d14'; ctx.lineWidth = s * 0.085;
    ctx.beginPath(); ctx.moveTo(hipX + dir*s*0.024, hipY); ctx.lineTo(kneeX + dir*s*0.018, kneeY); ctx.stroke();
    // Thigh highlight (quadriceps bulge)
    ctx.strokeStyle = '#7a3a1a'; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.moveTo(hipX + dir*s*0.034, hipY - s * 0.005); ctx.lineTo(kneeX + dir*s*0.022, kneeY + s * 0.008); ctx.stroke();
    // Calf muscle (back of shin)
    ctx.strokeStyle = '#5a2d14'; ctx.lineWidth = s * 0.048;
    ctx.beginPath(); ctx.moveTo(kneeX - dir*s*0.015, kneeY); ctx.lineTo(hoofX - dir*s*0.008, hoofY - s*0.016); ctx.stroke();
    // Shin highlight (front)
    ctx.strokeStyle = '#6a3218'; ctx.lineWidth = s * 0.020;
    ctx.beginPath(); ctx.moveTo(kneeX + dir*s*0.012, kneeY + s*0.010); ctx.lineTo(hoofX + dir*s*0.010, hoofY - s*0.010); ctx.stroke();
    // Fur tuft at knee
    ctx.fillStyle = '#0a0402';
    for (let fi = 0; fi < 3; fi++) {
      ctx.beginPath();
      ctx.arc(kneeX - side * s * 0.020 + fi * s * 0.015 * side, kneeY + s * 0.006, s * 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hoof
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.ellipse(hoofX, hoofY + s * 0.018, s * 0.100, s * 0.040, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c0d05';
    ctx.fillRect(hoofX - s * 0.004, hoofY + s * 0.006, s * 0.008, s * 0.024);
    ctx.fillStyle = '#3a1c08';
    ctx.beginPath();
    ctx.ellipse(hoofX + dir * s * 0.028, hoofY + s * 0.010, s * 0.054, s * 0.020, 0, 0, Math.PI * 2); ctx.fill();
  });

  // ── Belt + fur skirt ─────────────────────────────────────────────
  const skirtH = s * 0.155;
  ctx.fillStyle = '#1a0a04';
  ctx.beginPath();
  ctx.moveTo(bX - hipW * 1.28, bodyBot - s * 0.025);
  ctx.lineTo(bX + hipW * 1.28, bodyBot - s * 0.025);
  for (let fi = 6; fi >= 0; fi--) {
    const fx = bX + hipW * 1.28 - fi * hipW * 2.56 / 6;
    const fh = skirtH * (fi % 2 === 0 ? 1.0 : 0.78);
    ctx.lineTo(fx, bodyBot - s * 0.025 + fh);
    if (fi > 0) ctx.lineTo(fx - hipW * 2.56 / 12, bodyBot - s * 0.025 + fh * 0.5);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2e1608';
  ctx.fillRect(bX - hipW * 1.25, bodyBot - s * 0.025, hipW * 2.50, s * 0.016);
  ctx.fillStyle = '#0a0402';
  ctx.fillRect(bX - hipW * 1.32, bodyBot - s * 0.056, hipW * 2.64, s * 0.044);
  ctx.fillStyle = '#2a1008';
  ctx.fillRect(bX - hipW * 1.32, bodyBot - s * 0.056, hipW * 2.64, s * 0.012);
  // Buckle
  ctx.fillStyle = '#8a6822';
  ctx.beginPath();
  ctx.ellipse(bX, bodyBot - s * 0.034, s * 0.056, s * 0.031, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#aa8833';
  ctx.beginPath();
  ctx.ellipse(bX, bodyBot - s * 0.037, s * 0.042, s * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0d8c0';
  ctx.beginPath(); ctx.arc(bX, bodyBot - s * 0.037, s * 0.018, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(bX - s * 0.006, bodyBot - s * 0.041, s * 0.004, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(bX + s * 0.006, bodyBot - s * 0.041, s * 0.004, 0, Math.PI * 2); ctx.fill();

  // ── Torso (V-trapezoid, muscular) ────────────────────────────────
  if (inFight) {
    ctx.shadowColor = aoeCharging ? '#ff2200' : '#5a2015';
    ctx.shadowBlur  = s * (aoeCharging ? 0.42 : 0.22);
  }
  // Base dark
  ctx.fillStyle = '#2e1608';
  ctx.beginPath();
  ctx.moveTo(bX - shW + tilt, bodyTop + s * 0.020);
  ctx.lineTo(bX - shW * 0.50 + tilt, bodyTop - s * 0.030);
  ctx.lineTo(bX + shW * 0.50 + tilt, bodyTop - s * 0.030);
  ctx.lineTo(bX + shW + tilt, bodyTop + s * 0.020);
  ctx.lineTo(bX + hipW + s * 0.010, bodyBot - s * 0.060);
  ctx.lineTo(bX - hipW - s * 0.010, bodyBot - s * 0.060);
  ctx.closePath(); ctx.fill();
  // Mid muscle
  ctx.fillStyle = '#5a2d18';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.86 + tilt, bodyTop + s * 0.030);
  ctx.lineTo(bX + shW * 0.86 + tilt, bodyTop + s * 0.030);
  ctx.lineTo(bX + hipW * 0.80,        bodyBot - s * 0.075);
  ctx.lineTo(bX - hipW * 0.80,        bodyBot - s * 0.075);
  ctx.closePath(); ctx.fill();
  // Center highlight
  ctx.fillStyle = '#7a4020';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.40 + tilt, bodyTop + s * 0.040);
  ctx.lineTo(bX + shW * 0.40 + tilt, bodyTop + s * 0.040);
  ctx.lineTo(bX + shW * 0.16,         bodyBot - s * 0.130);
  ctx.lineTo(bX - shW * 0.16,         bodyBot - s * 0.130);
  ctx.closePath(); ctx.fill();
  // Pec line (horizontal chest division) — bold
  ctx.strokeStyle = '#1e0a04'; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.40 + tilt, bodyTop + s * 0.080);
  ctx.quadraticCurveTo(bX + tilt, bodyTop + s * 0.150, bX + shW * 0.40 + tilt, bodyTop + s * 0.080);
  ctx.stroke();
  // Pec highlights (bulging chest)
  ctx.fillStyle = '#8a4825';
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.ellipse(bX + side * shW * 0.20 + tilt, bodyTop + s * 0.100 + breatheY * 0.5, s * 0.095, s * 0.058, side * 0.2, 0, Math.PI * 2); ctx.fill();
  });
  // Central sternum line
  ctx.strokeStyle = '#1e0a04'; ctx.lineWidth = s * 0.013;
  ctx.beginPath();
  ctx.moveTo(bX + tilt, bodyTop + s * 0.070);
  ctx.lineTo(bX + tilt, bodyBot - s * 0.130);
  ctx.stroke();
  // Abs (4 rows, more defined)
  ctx.lineWidth = s * 0.012;
  for (let ai = 0; ai < 4; ai++) {
    const ay = bodyTop + s * (0.200 + ai * 0.065);
    ctx.beginPath();
    ctx.moveTo(bX - s * 0.085 + tilt, ay);
    ctx.lineTo(bX + s * 0.085 + tilt, ay);
    ctx.stroke();
    // Ab bulge highlights (left + right)
    ctx.fillStyle = 'rgba(138,76,40,0.55)';
    [-1, 1].forEach(side => {
      ctx.beginPath();
      ctx.ellipse(bX + side * s * 0.042 + tilt, ay + s * 0.025, s * 0.038, s * 0.022, 0, 0, Math.PI * 2); ctx.fill();
    });
  }
  // Oblique lines (side torso)
  ctx.strokeStyle = '#1e0a04'; ctx.lineWidth = s * 0.010;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(bX + side * s * 0.120 + tilt, bodyTop + s * 0.200);
    ctx.quadraticCurveTo(bX + side * s * 0.165, bodyTop + s * 0.350,
                          bX + side * s * 0.095, bodyBot - s * 0.090);
    ctx.stroke();
  });
  // Chest fur
  ctx.fillStyle = '#1a0a04';
  ctx.beginPath();
  ctx.ellipse(bX + tilt, bodyTop + s * 0.110, s * 0.050, s * 0.082, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Shoulder fur pauldrons ───────────────────────────────────────
  [-1, 1].forEach(side => {
    const pX = bX + side * shW * 0.92 + tilt * 0.2;
    const pY = bodyTop + s * 0.015;
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.ellipse(pX, pY + s * 0.030, s * 0.112, s * 0.082, side * 0.25, 0, Math.PI * 2); ctx.fill();
    for (let ti = 0; ti < 4; ti++) {
      const ta = side * (0.3 + ti * 0.35) - Math.PI * 0.5;
      const tRx = pX + Math.cos(ta) * s * 0.115;
      const tRy = pY + s * 0.025 + Math.sin(ta) * s * 0.080;
      ctx.beginPath();
      ctx.arc(tRx, tRy, s * 0.032, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#2e1608';
    ctx.beginPath();
    ctx.ellipse(pX - side * s * 0.020, pY + s * 0.012, s * 0.070, s * 0.048, side * 0.25, 0, Math.PI * 2); ctx.fill();
  });

  // ── Arms (BIG MUSCLED, swing opposite to legs during walk) ───────
  [-1, 1].forEach(side => {
    // Arm swings OPPOSITE to same-side leg: side=-1 arm phase = walkPhase+0.5 (same as leg +1)
    const armPhase = isWalking ? ((walkPhase + (side === -1 ? 0.5 : 0)) % 1) : 0;
    // armSwing: +1 = arm forward, -1 = arm back
    const armSwing = isWalking ? Math.sin(armPhase * Math.PI * 2) : 0;
    // Flex tighter during attack
    const flex = (windUpT > 0 ? windUpT * 0.4 : 0) + (chargeT > 0 ? chargeT * 0.7 : 0) + (recoverT > 0 ? (1-recoverT) * 0.5 : 0);
    const shX = bX + side * shW * 0.85 + tilt * 0.15;
    const shY = bodyTop + s * 0.055;
    // Elbow bends more when arm swings forward
    const elbFwd = armSwing * dir * s * 0.030;
    const elbX = shX + side * s * (0.12 - flex * 0.02) + elbFwd;
    const elbY = shY + s * (0.22 - flex * 0.04 - Math.max(0, armSwing) * 0.04);
    // Fist swings forward/back along dir axis
    const swingFistFwd = armSwing * dir * s * 0.080;
    const swingFistUp  = Math.max(0, armSwing) * s * 0.025;
    const fistX = shX + side * s * 0.05 - (chargeT > 0 ? dir * s * 0.04 : 0) + swingFistFwd;
    const fistY = shY + s * (0.46 - flex * 0.08) - swingFistUp;

    ctx.lineCap = 'round';
    // BICEP (upper arm) — thick dark base
    ctx.strokeStyle = '#2e1608'; ctx.lineWidth = s * 0.210;
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.quadraticCurveTo(elbX + side * s * 0.02, shY + s * 0.10, elbX, elbY);
    ctx.stroke();
    // Bicep mid tone
    ctx.strokeStyle = '#5a2d18'; ctx.lineWidth = s * 0.110;
    ctx.beginPath();
    ctx.moveTo(shX + side * s * 0.020, shY);
    ctx.quadraticCurveTo(elbX + side * s * 0.025, shY + s * 0.10, elbX + side * s * 0.005, elbY);
    ctx.stroke();
    // Bicep bulge highlight (extra bulge when flexed)
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * (0.038 + flex * 0.018);
    ctx.beginPath();
    ctx.moveTo(shX + side * s * 0.035, shY + s * 0.005);
    ctx.quadraticCurveTo(elbX + side * s * (0.040 + flex * 0.015), shY + s * 0.095, elbX + side * s * 0.012, elbY - s * 0.010);
    ctx.stroke();
    // FOREARM (thick)
    ctx.strokeStyle = '#2e1608'; ctx.lineWidth = s * 0.180;
    ctx.beginPath();
    ctx.moveTo(elbX, elbY);
    ctx.quadraticCurveTo(elbX + side * s * 0.005, (elbY + fistY) / 2, fistX, fistY);
    ctx.stroke();
    // Forearm mid
    ctx.strokeStyle = '#5a2d18'; ctx.lineWidth = s * 0.090;
    ctx.beginPath();
    ctx.moveTo(elbX + side * s * 0.016, elbY);
    ctx.quadraticCurveTo(elbX + side * s * 0.020, (elbY + fistY) / 2, fistX + side * s * 0.010, fistY);
    ctx.stroke();
    // Forearm vein/muscle highlight
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.026;
    ctx.beginPath();
    ctx.moveTo(elbX + side * s * 0.028, elbY + s * 0.010);
    ctx.quadraticCurveTo(elbX + side * s * 0.030, (elbY + fistY) / 2, fistX + side * s * 0.016, fistY - s * 0.012);
    ctx.stroke();
    // Elbow joint (visible)
    ctx.fillStyle = '#1a0a04';
    ctx.beginPath(); ctx.arc(elbX, elbY, s * 0.040, 0, Math.PI * 2); ctx.fill();
    // Clenched fist (bigger during attack)
    ctx.fillStyle = '#2a1008';
    ctx.beginPath();
    ctx.arc(fistX, fistY, s * (0.055 + flex * 0.010), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2010';
    ctx.beginPath();
    ctx.arc(fistX - side * s * 0.015, fistY - s * 0.015, s * 0.028, 0, Math.PI * 2); ctx.fill();
    // Knuckle line
    ctx.strokeStyle = '#0a0402'; ctx.lineWidth = s * 0.008;
    ctx.beginPath();
    ctx.moveTo(fistX - s * 0.032, fistY - s * 0.010);
    ctx.lineTo(fistX + s * 0.032, fistY - s * 0.010);
    ctx.stroke();
  });

  // ── Neck (thick bull neck) ───────────────────────────────────────
  ctx.fillStyle = '#2a1608';
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.115 + tilt, bodyTop + s * 0.015);
  ctx.lineTo(bX + s * 0.115 + tilt, bodyTop + s * 0.015);
  ctx.lineTo(bX + s * 0.095 + tilt + leanBody * s * 0.4, neckTop + s * 0.005);
  ctx.lineTo(bX - s * 0.095 + tilt + leanBody * s * 0.4, neckTop + s * 0.005);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a2d14';
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.055 + tilt, bodyTop + s * 0.015);
  ctx.lineTo(bX + s * 0.055 + tilt, bodyTop + s * 0.015);
  ctx.lineTo(bX + s * 0.045 + tilt + leanBody * s * 0.4, neckTop + s * 0.005);
  ctx.lineTo(bX - s * 0.045 + tilt + leanBody * s * 0.4, neckTop + s * 0.005);
  ctx.closePath(); ctx.fill();
  // Neck tendons/muscle line
  ctx.strokeStyle = '#1a0a04'; ctx.lineWidth = s * 0.008;
  ctx.beginPath();
  ctx.moveTo(bX + tilt - s * 0.020, bodyTop + s * 0.015);
  ctx.lineTo(bX + tilt - s * 0.015 + leanBody * s * 0.4, neckTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bX + tilt + s * 0.020, bodyTop + s * 0.015);
  ctx.lineTo(bX + tilt + s * 0.015 + leanBody * s * 0.4, neckTop);
  ctx.stroke();

  // ── Head (with attack pitch) ─────────────────────────────────────
  if (inFight) {
    ctx.shadowColor = aoeCharging ? '#ff2200' : '#5a2515';
    ctx.shadowBlur  = s * (aoeCharging ? 0.40 : 0.22);
  }
  ctx.save();
  ctx.translate(headCX, headCY);
  ctx.rotate(headTilt + dir * headPitch);   // ram head down toward dir during attack
  ctx.translate(-headCX, -headCY);

  // Base skull
  ctx.fillStyle = '#2e1608';
  ctx.beginPath();
  ctx.ellipse(headCX, headCY, headW * 0.95, headH * 0.90, 0, 0, Math.PI * 2); ctx.fill();
  // Muzzle
  ctx.fillStyle = '#2e1608';
  ctx.beginPath();
  ctx.ellipse(headCX + dir * headW * 0.32, headCY + headH * 0.30, headW * 0.72, headH * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  // Upper face mid tone
  ctx.fillStyle = '#5a2d18';
  ctx.beginPath();
  ctx.ellipse(headCX - dir * headW * 0.08, headCY - headH * 0.15, headW * 0.78, headH * 0.60, 0, 0, Math.PI * 2); ctx.fill();
  // Muzzle highlight
  ctx.fillStyle = '#7a4020';
  ctx.beginPath();
  ctx.ellipse(headCX + dir * headW * 0.38, headCY + headH * 0.22, headW * 0.48, headH * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  // Forehead fur tuft
  ctx.fillStyle = '#0a0402';
  for (let ti = 0; ti < 5; ti++) {
    const tx = headCX - dir * headW * 0.25 + ti * headW * 0.105;
    const ty = headCY - headH * 0.65 - (ti % 2) * s * 0.012;
    ctx.beginPath();
    ctx.arc(tx, ty, s * 0.028, 0, Math.PI * 2); ctx.fill();
  }
  // Nostrils
  ctx.fillStyle = '#050200';
  ctx.beginPath();
  ctx.ellipse(headCX + dir * headW * 0.62, headCY + headH * 0.22, headW * 0.070, headH * 0.050, dir * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(headCX + dir * headW * 0.62, headCY + headH * 0.40, headW * 0.058, headH * 0.038, dir * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = s * 0.005;
  ctx.beginPath();
  ctx.ellipse(headCX + dir * headW * 0.62, headCY + headH * 0.22, headW * 0.070, headH * 0.050, dir * 0.15, 0, Math.PI * 2); ctx.stroke();
  // Nostril steam
  if (inFight) {
    unit._mnSteam.forEach((st, si) => {
      st.life -= dt * 1.3;
      if (st.life <= 0) st.life = 1;
      const sLife = st.life;
      const sx = headCX + dir * headW * (0.70 + (1 - sLife) * 0.50);
      const sy = headCY + headH * 0.30 + (si - 1) * headH * 0.06 + (1 - sLife) * -headH * 0.10;
      ctx.fillStyle = `rgba(230,215,195,${sLife * 0.55})`;
      ctx.beginPath(); ctx.arc(sx, sy, s * (0.022 + (1 - sLife) * 0.022), 0, Math.PI * 2); ctx.fill();
    });
  }
  // Mouth with fangs
  ctx.strokeStyle = '#050200'; ctx.lineWidth = s * 0.015; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headCX + dir * headW * 0.10, headCY + headH * 0.52);
  ctx.quadraticCurveTo(headCX + dir * headW * 0.45, headCY + headH * 0.63, headCX + dir * headW * 0.78, headCY + headH * 0.50);
  ctx.stroke();
  ctx.fillStyle = '#e8dcb8';
  [0.30, 0.55].forEach(tp => {
    const tx = headCX + dir * headW * tp;
    ctx.beginPath();
    ctx.moveTo(tx - s * 0.011, headCY + headH * 0.52);
    ctx.lineTo(tx, headCY + headH * 0.66);
    ctx.lineTo(tx + s * 0.011, headCY + headH * 0.52);
    ctx.closePath(); ctx.fill();
  });
  // Nose ring
  ctx.strokeStyle = '#8a6822'; ctx.lineWidth = s * 0.013;
  ctx.beginPath();
  ctx.arc(headCX + dir * headW * 0.60, headCY + headH * 0.63, s * 0.050, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#aa8833'; ctx.lineWidth = s * 0.006;
  ctx.beginPath();
  ctx.arc(headCX + dir * headW * 0.60, headCY + headH * 0.63, s * 0.050, -Math.PI * 0.2, Math.PI * 0.3); ctx.stroke();
  ctx.shadowBlur = 0;

  // Eyes (glow red on attack)
  const eyeR = headH * 0.13;
  const eyeYY = headCY - headH * 0.12;
  const attackGlow = chargeT > 0 ? chargeT : 0;
  [-1, 1].forEach(side => {
    const ex = headCX - dir * headW * 0.08 + side * headW * 0.30;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(ex, eyeYY, eyeR * 1.20, eyeR * 0.95, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = aoeCharging ? '#ff3300' : '#ff5500';
    ctx.shadowBlur = s * (aoeCharging || attackGlow > 0.3 ? 0.45 : inFight ? 0.32 : 0.16);
    ctx.fillStyle = aoeCharging || attackGlow > 0.5 ? '#ffaa00' : (inFight ? '#ee2200' : '#aa1800');
    ctx.beginPath();
    ctx.arc(ex, eyeYY, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#050000';
    ctx.beginPath();
    ctx.ellipse(ex + dir * eyeR * 0.18, eyeYY, eyeR * 0.24, eyeR * 0.65, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,180,0.70)';
    ctx.beginPath(); ctx.arc(ex - eyeR * 0.30, eyeYY - eyeR * 0.30, eyeR * 0.18, 0, Math.PI * 2); ctx.fill();
  });

  // Ears (twitching independently)
  [-1, 1].forEach(side => {
    const twitch = Math.sin(bTime * 2.2 + side * 1.7) * 0.08
                 + (Math.sin(bTime * 7 + side * 3) > 0.85 ? 0.25 : 0);
    const erX = headCX + side * headW * 0.88 - dir * headW * 0.05;
    const erY = headCY - headH * 0.22;
    ctx.save();
    ctx.translate(erX, erY);
    ctx.rotate(twitch * side);
    ctx.fillStyle = '#2e1608';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * s * 0.080, -s * 0.020);
    ctx.lineTo(side * s * 0.045, s * 0.070);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a4020';
    ctx.beginPath();
    ctx.moveTo(side * s * 0.015, s * 0.008);
    ctx.lineTo(side * s * 0.052, -s * 0.008);
    ctx.lineTo(side * s * 0.035, s * 0.048);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  });

  // ── Horns — THE weapon ──────────────────────────────────────────
  [-1, 1].forEach(side => {
    const hBx = headCX + side * headW * 0.70;
    const hBy = headCY - headH * 0.48;
    const hMx = headCX + side * headW * 1.50;
    const hMy = headCY - headH * 0.75;
    const hTx = headCX + side * headW * 1.40 + dir * headW * 0.15;
    const hTy = headCY - headH * 1.30;
    // Dark outline
    ctx.strokeStyle = '#1a1408'; ctx.lineWidth = s * 0.094; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hBx, hBy);
    ctx.quadraticCurveTo(hMx, hMy, hTx, hTy);
    ctx.stroke();
    // Ivory base
    ctx.strokeStyle = '#c4b488'; ctx.lineWidth = s * 0.070;
    ctx.beginPath();
    ctx.moveTo(hBx, hBy);
    ctx.quadraticCurveTo(hMx, hMy, hTx, hTy);
    ctx.stroke();
    // Highlight
    ctx.strokeStyle = '#e8dcb8'; ctx.lineWidth = s * 0.024;
    ctx.beginPath();
    ctx.moveTo(hBx, hBy - s * 0.014);
    ctx.quadraticCurveTo(hMx + side * s * 0.010, hMy - s * 0.018, hTx + side * s * 0.005, hTy - s * 0.008);
    ctx.stroke();
    // AoE red glow on horns (since this is the weapon now, on every attack too)
    const hornGlow = aoeCharging ? (0.55 + Math.sin(bTime * 6) * 0.20)
                   : chargeT > 0.3 ? (chargeT - 0.3) * 1.5 : 0;
    if (hornGlow > 0) {
      ctx.shadowColor = aoeCharging ? '#ff3300' : '#ffcc44';
      ctx.shadowBlur = s * hornGlow * 0.50;
      ctx.strokeStyle = aoeCharging
        ? `rgba(255,120,40,${hornGlow * 0.75})`
        : `rgba(255,220,100,${hornGlow * 0.65})`;
      ctx.lineWidth = s * 0.034;
      ctx.beginPath();
      ctx.moveTo(hBx, hBy);
      ctx.quadraticCurveTo(hMx, hMy, hTx, hTy);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // Sharp tip
    ctx.fillStyle = '#1a0f04';
    ctx.beginPath(); ctx.arc(hTx, hTy, s * 0.030, 0, Math.PI * 2); ctx.fill();
    // Tip highlight (sharp)
    ctx.fillStyle = hornGlow > 0 ? `rgba(255,220,100,${hornGlow * 0.9})` : '#aa9060';
    ctx.beginPath(); ctx.arc(hTx + dir * s * 0.008, hTy - s * 0.008, s * 0.014, 0, Math.PI * 2); ctx.fill();
    // Ridge bands
    ctx.strokeStyle = 'rgba(90,70,30,0.55)'; ctx.lineWidth = s * 0.007;
    for (let ri = 1; ri <= 3; ri++) {
      const rt = ri / 4;
      const rx = (1 - rt) * (1 - rt) * hBx + 2 * (1 - rt) * rt * hMx + rt * rt * hTx;
      const ry = (1 - rt) * (1 - rt) * hBy + 2 * (1 - rt) * rt * hMy + rt * rt * hTy;
      const tx = 2 * (1 - rt) * (hMx - hBx) + 2 * rt * (hTx - hMx);
      const ty = 2 * (1 - rt) * (hMy - hBy) + 2 * rt * (hTy - hMy);
      const tl = Math.sqrt(tx * tx + ty * ty);
      const px = -ty / tl, py = tx / tl;
      ctx.beginPath();
      ctx.moveTo(rx - px * s * 0.024, ry - py * s * 0.024);
      ctx.lineTo(rx + px * s * 0.024, ry + py * s * 0.024);
      ctx.stroke();
    }
  });

  // Motion trail behind horn tips during charge
  if (chargeT > 0.1 && chargeT < 0.9) {
    const trailA = Math.sin(chargeT * Math.PI) * 0.55;
    [-1, 1].forEach(side => {
      const hTx = headCX + side * headW * 1.40 + dir * headW * 0.15;
      const hTy = headCY - headH * 1.30;
      // Trail streak behind tip
      const trailLen = s * 0.28 * chargeT * aoeMult;
      ctx.strokeStyle = aoeCharging ? `rgba(255,120,40,${trailA})` : `rgba(220,230,245,${trailA})`;
      ctx.lineWidth = s * 0.035;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hTx, hTy);
      ctx.lineTo(hTx - dir * trailLen, hTy + s * 0.015);
      ctx.stroke();
    });
  }

  ctx.restore();  // head rotation

  ctx.restore();
  unit._hpBarY = headCY - headH * 1.45;
}
