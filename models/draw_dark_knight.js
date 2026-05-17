// ═══════════════════════════════════════════════════════════════════════════
//  DARK KNIGHT — рівень 16, здібність: reflect (відбиває магію)
//  Саурон у плаці: висока струнка фігура, корона з 11 тонких променистих
//  шипів-голок, витягнутий шолом, вогняні очі, довга накидка. Одноручна
//  булава в dir-руці (друга рука вільна). Повний walk cycle.
// ═══════════════════════════════════════════════════════════════════════════
function drawDarkKnightMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._dkLastT || _frameNow)) / 1000, 0.05);
  unit._dkLastT = _frameNow;

  if (unit._dkDir === undefined) {
    unit._dkDir = 1; unit._dkPrevX = cx;
    unit._dkPrevAcd = unit.attackCooldown;
    unit._dkT = 0; unit._dkAp = 0; unit._dkReflectT = 0;
  }
  if (Math.abs(cx - unit._dkPrevX) > 0.2)
    unit._dkDir = cx > unit._dkPrevX ? 1 : -1;
  unit._dkPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._dkDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._dkDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._dkPrevAcd || 0) + 3) unit._dkAp = 1.0;
  unit._dkPrevAcd = acd;
  if (unit.reflectActive) { unit._dkReflectT = 1.0; unit.reflectActive = false; }
  unit._dkT += dt;

  const atkDur = Math.min(0.72, atkBase / 60 * 0.88);
  if (unit._dkAp > 0)      unit._dkAp      = Math.max(0, unit._dkAp - dt / atkDur);
  if (unit._dkReflectT > 0) unit._dkReflectT = Math.max(0, unit._dkReflectT - dt * 0.95);

  const atkActive = unit._dkAp > 0;
  const ap        = 1 - unit._dkAp;
  const inFight   = unit.state === 'fight' || atkActive;
  const reflect   = unit._dkReflectT;

  // Time reference (needed by attack shake below)
  const bTime = unit._dkT;

  // ── Attack phases with proper easing ─────────────────────────────
  // Anticipation (slow wind-up) → explosive strike → impact hold → slow recovery
  const AP_WINDUP = 0.38;      // slow build
  const AP_STRIKE = 0.48;      // fast strike (10% of total)
  const AP_IMPACT = 0.55;      // brief hold at hit
  // Eased phase values (0..1 within each phase)
  let windUpE = 0, strikeE = 0, impactE = 0, recoverE = 0;
  if (atkActive) {
    if (ap < AP_WINDUP) {
      const t = ap / AP_WINDUP;
      windUpE = 1 - Math.pow(1 - t, 2.4);        // ease-out: slow build to peak
    } else if (ap < AP_STRIKE) {
      const t = (ap - AP_WINDUP) / (AP_STRIKE - AP_WINDUP);
      strikeE = Math.pow(t, 2.2);                // ease-in quartic: explosive acceleration
    } else if (ap < AP_IMPACT) {
      impactE = 1;                               // held (brief pause at contact)
      strikeE = 1;                               // keep mace at strike end pos
    } else {
      const t = (ap - AP_IMPACT) / (1 - AP_IMPACT);
      recoverE = 1 - Math.pow(1 - t, 2);         // ease-out return
      strikeE = 1 - recoverE;                    // mace returns
    }
  }
  // Legacy aliases used downstream (kept for compat with existing glow/trail code)
  const raiseT = windUpE;
  const slamT  = strikeE > 0 && impactE === 0 ? (1 - strikeE) : 0;

  // Body-wide attack transforms
  // Lean: back during wind-up, forward during strike, settle during recovery
  const attackLean = -dir * windUpE * s * 0.11
                   +  dir * strikeE * s * 0.14
                   +  dir * recoverE * 0 * s;  // settles back
  // Vertical squat: low during wind-up, rise briefly into strike, drop at impact (recoil)
  const attackSquat = windUpE * s * 0.055
                    - strikeE * s * 0.020
                    + impactE * s * 0.045;       // impact compress
  // Horizontal impact shake (small jitter for ~0.1s after impact)
  const shakeT = impactE > 0 ? 1 : (recoverE > 0 && recoverE < 0.18 ? 1 - recoverE / 0.18 : 0);
  const attackShakeX = shakeT * Math.sin(bTime * 90) * s * 0.010;
  const attackShakeY = shakeT * Math.sin(bTime * 82 + 1.3) * s * 0.006;

  // ── Proportions (TALL + SLIM, Sauron silhouette) ─────────────────
  const shW     = s * 0.500;          // narrow shoulders
  const hipW    = s * 0.255;          // slim V-taper hips
  const bodyH   = s * 0.580;          // tall slender torso
  const legH    = s * 0.475;          // very long legs
  const headR   = s * 0.175;          // smaller head (crown dominates)
  const neckH   = s * 0.055;

  // ── Idle animation ───────────────────────────────────────────────
  const breatheY = Math.sin(bTime * 0.80) * s * 0.010;
  const idleSway = Math.sin(bTime * 0.40) * s * 0.008;
  const shoulderRoll = Math.sin(bTime * 0.65) * s * 0.006;

  // ── Walk cycle ───────────────────────────────────────────────────
  const isWalking = unit.state === 'move';
  const walkFreq  = 1.35;                                      // slow imperial march
  const walkPhase = isWalking ? ((bTime * walkFreq) % 1) : 0;
  const walkBob = isWalking
    ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.026
    : 0;
  const walkSwayX = isWalking
    ? Math.sin(walkPhase * Math.PI * 2) * s * 0.014
    : 0;
  const hipTiltWalk = isWalking ? Math.sin(walkPhase * Math.PI * 2) * 0.048 : 0;
  const shTiltWalk  = isWalking ? -Math.sin(walkPhase * Math.PI * 2) * 0.030 : 0;
  const walkLean    = isWalking ? dir * s * 0.012 : 0;

  const stepBob  = walkBob;
  const stepSide = isWalking ? walkSwayX : idleSway;

  const bX      = cx + stepSide + walkLean + attackLean + attackShakeX;
  const bodyBot = fY - legH + stepBob + attackSquat + attackShakeY;
  const bodyTop = bodyBot - bodyH - breatheY;
  const neckTop = bodyTop - neckH;
  const headCY  = neckTop - headR * 0.95;
  // Extra torso/head pitch forward during strike (leans into the swing)
  const attackPitch = dir * (strikeE * 0.22 - windUpE * 0.10);
  const tilt    = dir * s * 0.012 + shoulderRoll + shTiltWalk * s * 0.7 + attackPitch * s * 1.0;

  ctx.save();

  // ── Ground shadow ────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.018, s * 0.48, s * 0.080, 0, 0, Math.PI * 2); ctx.fill();

  // ── Cape (behind body, long and flowing) ─────────────────────────
  const capeSway = Math.sin(bTime * 1.0) * s * 0.022 + (isWalking ? Math.sin(walkPhase * Math.PI * 2) * s * 0.020 : 0);
  ctx.save();
  // Outer dark cape
  ctx.fillStyle = '#050812';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.80, bodyTop - s * 0.020);
  ctx.lineTo(bX + shW * 0.80, bodyTop - s * 0.020);
  ctx.quadraticCurveTo(bX + shW * 0.92 + capeSway * 0.4, bodyTop + bodyH * 0.5,
                        bX + shW * 0.62 + capeSway, fY + s * 0.005);
  // Tattered jagged bottom
  const capeBot = fY + s * 0.005;
  for (let ci = 5; ci >= 0; ci--) {
    const cxPos = bX + (shW * 0.62 + capeSway) - ci * (shW * 1.24 / 5);
    const tatter = (ci % 2 === 0 ? 0 : s * 0.040);
    ctx.lineTo(cxPos, capeBot + tatter);
    if (ci > 0) ctx.lineTo(cxPos - (shW * 1.24 / 10), capeBot + s * 0.075);
  }
  ctx.quadraticCurveTo(bX - shW * 0.92 + capeSway * 0.2, bodyTop + bodyH * 0.5,
                        bX - shW * 0.80, bodyTop - s * 0.020);
  ctx.closePath(); ctx.fill();
  // Blood-red inner lining glimpse
  ctx.fillStyle = '#3a0610';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.54, bodyTop);
  ctx.lineTo(bX + shW * 0.54, bodyTop);
  ctx.quadraticCurveTo(bX + shW * 0.62 + capeSway * 0.5, bodyTop + bodyH * 0.4,
                        bX + shW * 0.42 + capeSway * 0.8, fY - s * 0.005);
  ctx.quadraticCurveTo(bX + capeSway * 0.4, fY - s * 0.025,
                        bX - shW * 0.42 + capeSway * 0.5, fY - s * 0.005);
  ctx.quadraticCurveTo(bX - shW * 0.62 + capeSway * 0.3, bodyTop + bodyH * 0.4,
                        bX - shW * 0.54, bodyTop);
  ctx.closePath(); ctx.fill();
  // Cape edge highlights
  ctx.strokeStyle = 'rgba(80,25,40,0.55)';
  ctx.lineWidth = s * 0.008;
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.80, bodyTop - s * 0.020);
  ctx.quadraticCurveTo(bX - shW * 0.92 + capeSway * 0.2, bodyTop + bodyH * 0.5, bX - shW * 0.62 + capeSway, capeBot);
  ctx.moveTo(bX + shW * 0.80, bodyTop - s * 0.020);
  ctx.quadraticCurveTo(bX + shW * 0.92 + capeSway * 0.4, bodyTop + bodyH * 0.5, bX + shW * 0.62 + capeSway, capeBot);
  ctx.stroke();
  ctx.restore();

  // ── Reflect aegis bubble ─────────────────────────────────────────
  if (reflect > 0) {
    ctx.save();
    ctx.shadowColor = '#6699ff'; ctx.shadowBlur = s * reflect * 0.55;
    const cyMid = (headCY + bodyBot) / 2;
    const gr = ctx.createRadialGradient(bX, cyMid, 0, bX, cyMid, s * 0.78);
    gr.addColorStop(0,    `rgba(120,180,255,${reflect * 0.08})`);
    gr.addColorStop(0.7,  `rgba(90,150,255,${reflect * 0.20})`);
    gr.addColorStop(1,    `rgba(180,220,255,${reflect * 0.55})`);
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.ellipse(bX, cyMid, s * 0.46, s * 0.92, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(160,200,255,${reflect * 0.72})`;
    ctx.lineWidth = s * 0.010;
    ctx.beginPath();
    ctx.ellipse(bX, cyMid, s * 0.46, s * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
    for (let hi = 0; hi < 6; hi++) {
      const ha = hi * Math.PI / 3 + bTime;
      ctx.beginPath();
      ctx.arc(bX + Math.cos(ha) * s * 0.42, cyMid + Math.sin(ha) * s * 0.86, s * 0.036, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Legs (walk cycle + armored greaves) ──────────────────────────
  [-1, 1].forEach(side => {
    // Walk phase: side=-1 leads first, side=+1 is 0.5 behind
    const legPhase = isWalking ? ((walkPhase + (side === 1 ? 0.5 : 0)) % 1) : 0;
    let walkFwd = 0, walkFootLift = 0, walkKneeBendY = 0, walkKneeDrive = 0;
    if (isWalking) {
      if (legPhase < 0.5) {
        // STANCE
        const t = legPhase / 0.5;
        walkFwd = (0.45 - t * 0.9) * s * 0.13;
        walkKneeBendY = Math.sin(t * Math.PI) * s * 0.007;
      } else {
        // SWING
        const t = (legPhase - 0.5) / 0.5;
        walkFwd = (-0.45 + t * 0.9) * s * 0.13;
        walkFootLift = Math.sin(t * Math.PI) * s * 0.065;
        walkKneeDrive = Math.sin(t * Math.PI) * s * 0.042;
        walkKneeBendY = Math.sin(t * Math.PI) * s * 0.020;
      }
    }
    // Hip tilt: down on swing leg
    const hipTiltAmt = isWalking ? hipTiltWalk * side * (-1) : 0;
    // Attack lunge: front leg (dir side) plants forward, back leg pushes
    const isFrontLeg = (side === dir);
    let atkFootFwd = 0, atkFootLift = 0, atkKneeBend = 0;
    if (atkActive) {
      if (isFrontLeg) {
        // Front leg: lifts during wind-up, lunges forward during strike
        atkFootLift = windUpE * s * 0.040;
        atkFootFwd  = -windUpE * s * 0.030 + strikeE * s * 0.145 + impactE * s * 0.145
                    + recoverE * s * 0.145 * (1 - recoverE);
        atkKneeBend = windUpE * s * 0.025 + impactE * s * 0.012;
      } else {
        // Back leg: pushes back, straightens during strike
        atkFootFwd = -windUpE * s * 0.015 - strikeE * s * 0.060 - impactE * s * 0.060
                   - recoverE * s * 0.060 * (1 - recoverE);
        atkKneeBend = windUpE * s * 0.018;
      }
    }
    const lsX = bX + side * hipW * 0.62 + tilt * 0.2;
    const lsY = bodyBot + hipTiltAmt * s * 0.4;
    const lkX = lsX + side * s * 0.012 + dir * walkKneeDrive + dir * atkFootFwd * 0.3;
    const lkY = lsY + legH * 0.48 - walkKneeBendY - walkFootLift * 0.35 - atkKneeBend;
    const lfX = lkX + side * s * 0.020 + walkFwd + atkFootFwd;
    const lfY = fY - s * 0.008 - walkFootLift - atkFootLift;

    // Thigh (dark base)
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#040610'; ctx.lineWidth = s * 0.155;
    ctx.beginPath(); ctx.moveTo(lsX, lsY); ctx.lineTo(lkX, lkY); ctx.stroke();
    // Shin (greaves)
    ctx.strokeStyle = '#060a18'; ctx.lineWidth = s * 0.130;
    ctx.beginPath(); ctx.moveTo(lkX, lkY); ctx.lineTo(lfX, lfY); ctx.stroke();
    // Thigh mid
    ctx.strokeStyle = '#14203a'; ctx.lineWidth = s * 0.060;
    ctx.beginPath(); ctx.moveTo(lsX + dir*s*0.016, lsY); ctx.lineTo(lkX + dir*s*0.014, lkY); ctx.stroke();
    // Shin mid
    ctx.strokeStyle = '#1e2d48'; ctx.lineWidth = s * 0.046;
    ctx.beginPath(); ctx.moveTo(lkX + dir*s*0.014, lkY); ctx.lineTo(lfX + dir*s*0.012, lfY - s*0.018); ctx.stroke();
    // Edge highlight
    ctx.strokeStyle = '#34445c'; ctx.lineWidth = s * 0.006;
    ctx.beginPath();
    ctx.moveTo(lsX + dir*s*0.028, lsY + s*0.015);
    ctx.lineTo(lkX + dir*s*0.022, lkY - s*0.015);
    ctx.stroke();
    // Knee cap (diamond plate with spike)
    ctx.fillStyle = '#0a1020';
    ctx.beginPath();
    ctx.moveTo(lkX, lkY - s * 0.024);
    ctx.lineTo(lkX + side * s * 0.040, lkY);
    ctx.lineTo(lkX, lkY + s * 0.024);
    ctx.lineTo(lkX - side * s * 0.022, lkY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#020408';
    ctx.beginPath();
    ctx.moveTo(lkX + side * s * 0.010, lkY - s * 0.008);
    ctx.lineTo(lkX + side * s * 0.068, lkY - s * 0.008);
    ctx.lineTo(lkX + side * s * 0.035, lkY + s * 0.005);
    ctx.closePath(); ctx.fill();
    // Sabaton (pointed long boot)
    ctx.fillStyle = '#040610';
    ctx.beginPath();
    ctx.moveTo(lfX - s * 0.038, lfY + s * 0.008);
    ctx.lineTo(lfX + side * s * 0.125, lfY + s * 0.020);
    ctx.lineTo(lfX + side * s * 0.062, lfY + s * 0.034);
    ctx.lineTo(lfX - s * 0.035, lfY + s * 0.030);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#142040';
    ctx.beginPath();
    ctx.moveTo(lfX - s * 0.030, lfY + s * 0.011);
    ctx.lineTo(lfX + side * s * 0.100, lfY + s * 0.018);
    ctx.lineTo(lfX + side * s * 0.054, lfY + s * 0.024);
    ctx.lineTo(lfX - s * 0.028, lfY + s * 0.022);
    ctx.closePath(); ctx.fill();
  });

  // ── Waist plate + tassets ────────────────────────────────────────
  if (inFight) {
    ctx.shadowColor = atkActive ? '#4466aa' : '#1a2a4a';
    ctx.shadowBlur  = s * (atkActive ? 0.28 : 0.12);
  }
  ctx.fillStyle = '#040610';
  ctx.beginPath();
  ctx.moveTo(bX - hipW - s * 0.035, bodyBot - s * 0.015);
  ctx.lineTo(bX + hipW + s * 0.035, bodyBot - s * 0.015);
  ctx.lineTo(bX + hipW + s * 0.020, bodyBot + s * 0.080);
  ctx.lineTo(bX - hipW - s * 0.020, bodyBot + s * 0.080);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1e3050'; ctx.lineWidth = s * 0.007;
  for (let di = 1; di < 5; di++) {
    const dx2 = bX - hipW + (di / 5) * hipW * 2;
    ctx.beginPath(); ctx.moveTo(dx2, bodyBot - s * 0.012); ctx.lineTo(dx2, bodyBot + s * 0.077); ctx.stroke();
  }
  // Belt line
  ctx.fillStyle = '#14182a';
  ctx.fillRect(bX - hipW - s * 0.035, bodyBot - s * 0.020, hipW * 2 + s * 0.070, s * 0.013);
  for (let si = 0; si < 5; si++) {
    const sx = bX - hipW + si * hipW * 2 / 4;
    ctx.fillStyle = '#2a3044';
    ctx.beginPath(); ctx.arc(sx, bodyBot - s * 0.013, s * 0.010, 0, Math.PI * 2); ctx.fill();
  }

  // ── Body breastplate (SLIM, tall, 3 layers) ──────────────────────
  ctx.fillStyle = '#040610';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.95 + tilt,  bodyTop - s * 0.015);
  ctx.lineTo(bX - shW * 0.58 + tilt,  bodyTop - s * 0.045);
  ctx.lineTo(bX + shW * 0.58 + tilt,  bodyTop - s * 0.045);
  ctx.lineTo(bX + shW * 0.95 + tilt,  bodyTop - s * 0.015);
  ctx.lineTo(bX + hipW + s * 0.020,   bodyBot + s * 0.005);
  ctx.lineTo(bX - hipW - s * 0.018,   bodyBot + s * 0.005);
  ctx.closePath(); ctx.fill();
  // Mid steel
  ctx.fillStyle = '#10182a';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.66 + tilt*0.7, bodyTop + bodyH*0.04);
  ctx.lineTo(bX + shW * 0.66 + tilt*0.7, bodyTop + bodyH*0.04);
  ctx.lineTo(bX + hipW * 0.78,            bodyBot - bodyH*0.05);
  ctx.lineTo(bX - hipW * 0.78,            bodyBot - bodyH*0.05);
  ctx.closePath(); ctx.fill();
  // Chest highlight (central narrow stripe)
  ctx.fillStyle = '#1e2d48';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.24 + tilt*0.5, bodyTop + bodyH*0.05);
  ctx.lineTo(bX + shW * 0.24 + tilt*0.5, bodyTop + bodyH*0.05);
  ctx.lineTo(bX + shW * 0.10,             bodyBot - bodyH*0.14);
  ctx.lineTo(bX - shW * 0.12,             bodyBot - bodyH*0.14);
  ctx.closePath(); ctx.fill();
  // Plate segment lines (thin horizontal bands)
  ctx.strokeStyle = '#000'; ctx.lineWidth = s * 0.010; ctx.lineCap = 'butt';
  for (let bi = 0; bi < 2; bi++) {
    const by = bodyTop + bodyH * (0.32 + bi * 0.26);
    ctx.beginPath();
    ctx.moveTo(bX - shW * 0.70 + tilt, by);
    ctx.quadraticCurveTo(bX + tilt, by + s * 0.018, bX + shW * 0.70 + tilt, by);
    ctx.stroke();
  }
  // Central chest glyph — Eye of Sauron
  const runePulse = 0.65 + Math.sin(bTime * 1.8) * 0.22 + (atkActive ? 0.2 : 0);
  ctx.shadowColor = '#ff5522'; ctx.shadowBlur = s * runePulse * 0.32;
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.beginPath();
  ctx.ellipse(bX + tilt, bodyTop + bodyH * 0.26, s * 0.058, s * 0.026, 0, 0, Math.PI * 2); ctx.fill();
  const runeGrad = ctx.createRadialGradient(bX + tilt, bodyTop + bodyH * 0.26, 0,
                                             bX + tilt, bodyTop + bodyH * 0.26, s * 0.055);
  runeGrad.addColorStop(0, `rgba(255,180,40,${runePulse * 0.95})`);
  runeGrad.addColorStop(0.45, `rgba(255,80,0,${runePulse * 0.85})`);
  runeGrad.addColorStop(1, 'rgba(120,20,0,0)');
  ctx.fillStyle = runeGrad;
  ctx.beginPath();
  ctx.ellipse(bX + tilt, bodyTop + bodyH * 0.26, s * 0.050, s * 0.021, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(bX + tilt, bodyTop + bodyH * 0.26, s * 0.005, s * 0.017, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Spiked pauldrons (pointed, leaner) ───────────────────────────
  [-1, 1].forEach(side => {
    const pX = bX + side * shW * 0.94 + tilt * 0.3;
    const pY = bodyTop - s * 0.012;
    ctx.fillStyle = '#04060e';
    ctx.beginPath();
    ctx.ellipse(pX, pY + s * 0.045, s * 0.145, s * 0.095, side * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10182a';
    ctx.beginPath();
    ctx.ellipse(pX - side * s * 0.020, pY + s * 0.030, s * 0.095, s * 0.062, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    // 3 long thin spikes upward-outward
    const spikes = [
      { ang: -Math.PI * 0.62, len: 0.140 },
      { ang: -Math.PI * 0.42, len: 0.160 },
      { ang: -Math.PI * 0.22, len: 0.120 }
    ];
    spikes.forEach(sp => {
      const sA = sp.ang * side;
      const spBaseX = pX + Math.cos(sA) * s * 0.130;
      const spBaseY = pY + s * 0.045 + Math.sin(sA) * s * 0.088;
      const spTipX = spBaseX + Math.cos(sA) * s * sp.len;
      const spTipY = spBaseY + Math.sin(sA) * s * sp.len;
      const perpA = sA + Math.PI / 2;
      ctx.fillStyle = '#060a18';
      ctx.beginPath();
      ctx.moveTo(spBaseX + Math.cos(perpA) * s * 0.013, spBaseY + Math.sin(perpA) * s * 0.013);
      ctx.lineTo(spTipX, spTipY);
      ctx.lineTo(spBaseX - Math.cos(perpA) * s * 0.013, spBaseY - Math.sin(perpA) * s * 0.013);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#24324a';
      ctx.beginPath();
      ctx.moveTo(spBaseX + Math.cos(perpA) * s * 0.005, spBaseY + Math.sin(perpA) * s * 0.005);
      ctx.lineTo(spTipX - Math.cos(sA) * s * 0.010, spTipY - Math.sin(sA) * s * 0.010);
      ctx.lineTo(spBaseX - Math.cos(perpA) * s * 0.003, spBaseY - Math.sin(perpA) * s * 0.003);
      ctx.closePath(); ctx.fill();
    });
  });
  ctx.shadowBlur = 0;

  // ── Arms (one-handed mace: dir arm holds, off-hand is free) ──────
  // Mace grip trajectory — natural arc through all phases, with proper easing
  // Key poses:
  //   REST     grip = bX + dir*0.16, bodyTop + 0.36 ;  ang = -π/2 + dir*0.40
  //   WINDUP   grip = bX + dir*(-0.04), bodyTop - 0.28; ang = -π/2 - dir*0.55 (pointing up-back)
  //   STRIKE   grip = bX + dir*0.26, bodyTop + 0.22;    ang = -π/2 + dir*1.55 (pointing forward-down)
  // Phase-weighted blend: (rest, windup, strike, recovery)
  const rest = { gx: bX + dir * s * 0.16, gy: bodyTop + s * 0.36, an: -Math.PI * 0.5 + dir * 0.40 };
  // Wind-up: hand goes UP HIGH above head (slightly on dir side), mace tip points back-up.
  // This keeps grip/forearm OUTSIDE the body silhouette.
  const wu   = { gx: bX + dir * s * 0.05, gy: bodyTop - s * 0.34, an: -Math.PI * 0.5 - dir * 0.75 };
  const st   = { gx: bX + dir * s * 0.26, gy: bodyTop + s * 0.22, an: -Math.PI * 0.5 + dir * 1.55 };

  // Determine weights (how much of each pose is active)
  const idleW  = 1 - Math.max(windUpE, strikeE, recoverE);
  // During recovery, blend back from strike pose to rest
  const wWU  = atkActive ? (ap < AP_WINDUP ? windUpE : (strikeE > 0 ? 1 - strikeE : 0)) : 0;
  const wST  = atkActive ? (ap < AP_WINDUP ? 0 : (ap < AP_STRIKE ? strikeE : (ap < AP_IMPACT ? 1 : 1 - recoverE))) : 0;
  const wREST = 1 - wWU - wST;

  const gripX     = wREST * rest.gx + wWU * wu.gx + wST * st.gx;
  const gripY     = wREST * rest.gy + wWU * wu.gy + wST * st.gy;
  const weaponAng = wREST * rest.an + wWU * wu.an + wST * st.an;

  // Dir-side arm (holds mace)
  {
    const shX = bX + dir * shW * 0.85 + tilt * 0.15;
    const shY = bodyTop + s * 0.050;
    // Elbow explicit poses — during wind-up it stays ABOVE shoulder (not across chest)
    const restElb = { ex: shX + dir * s * 0.16, ey: shY + s * 0.22 };
    const wuElb   = { ex: shX + dir * s * 0.10, ey: shY - s * 0.16 };   // raised high, same dir side
    const stElb   = { ex: shX + dir * s * 0.22, ey: shY + s * 0.06 };
    const elbX = wREST * restElb.ex + wWU * wuElb.ex + wST * stElb.ex;
    const elbY = wREST * restElb.ey + wWU * wuElb.ey + wST * stElb.ey;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#040610'; ctx.lineWidth = s * 0.128;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo(elbX, elbY, gripX, gripY); ctx.stroke();
    ctx.strokeStyle = '#14203a'; ctx.lineWidth = s * 0.062;
    ctx.beginPath(); ctx.moveTo(shX + dir*s*0.016, shY); ctx.quadraticCurveTo(elbX + dir*s*0.010, elbY, gripX + dir*s*0.008, gripY); ctx.stroke();
    ctx.strokeStyle = '#2c3a58'; ctx.lineWidth = s * 0.018;
    ctx.beginPath(); ctx.moveTo(shX + dir*s*0.028, shY + s*0.006); ctx.quadraticCurveTo(elbX + dir*s*0.018, elbY - s*0.006, gripX + dir*s*0.014, gripY - s*0.008); ctx.stroke();
    ctx.fillStyle = '#0c1224';
    ctx.beginPath(); ctx.arc(elbX, elbY, s * 0.038, 0, Math.PI * 2); ctx.fill();
    // Gauntlet
    ctx.fillStyle = '#040610';
    ctx.beginPath();
    ctx.ellipse(gripX, gripY, s * 0.050, s * 0.042, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e2d48';
    ctx.beginPath();
    ctx.ellipse(gripX - dir * s * 0.008, gripY - s * 0.010, s * 0.034, s * 0.024, 0, 0, Math.PI * 2); ctx.fill();
    // Knuckle spikes
    ctx.fillStyle = '#0c1224';
    for (let kn = 0; kn < 3; kn++) {
      const kx = gripX + (kn - 1) * s * 0.018;
      ctx.beginPath();
      ctx.moveTo(kx - s * 0.007, gripY - s * 0.018);
      ctx.lineTo(kx, gripY - s * 0.040);
      ctx.lineTo(kx + s * 0.007, gripY - s * 0.018);
      ctx.closePath(); ctx.fill();
    }
  }

  // Off-hand arm (-dir side): free, swings during walk, clenched at side otherwise
  {
    const side = -dir;
    // Arm swing opposite to same-side leg
    const armPhase = isWalking ? ((walkPhase + (side === -1 ? 0.5 : 0)) % 1) : 0;
    const armSwing = isWalking ? Math.sin(armPhase * Math.PI * 2) : 0;
    const shX = bX + side * shW * 0.85 + tilt * 0.15;
    const shY = bodyTop + s * 0.050;
    const elbFwd = armSwing * dir * s * 0.026;
    const elbX = shX + side * s * 0.10 + elbFwd;
    const elbY = shY + s * (0.22 - Math.max(0, armSwing) * 0.040);
    const fistSwingFwd = armSwing * dir * s * 0.070;
    const fistSwingUp  = Math.max(0, armSwing) * s * 0.022;
    const fistX = shX + side * s * 0.04 + fistSwingFwd;
    const fistY = shY + s * 0.44 - fistSwingUp;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#040610'; ctx.lineWidth = s * 0.120;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo(elbX, elbY, fistX, fistY); ctx.stroke();
    ctx.strokeStyle = '#14203a'; ctx.lineWidth = s * 0.058;
    ctx.beginPath(); ctx.moveTo(shX + side*s*0.014, shY); ctx.quadraticCurveTo(elbX + side*s*0.010, elbY, fistX + side*s*0.008, fistY); ctx.stroke();
    ctx.strokeStyle = '#2c3a58'; ctx.lineWidth = s * 0.016;
    ctx.beginPath(); ctx.moveTo(shX + side*s*0.024, shY + s*0.006); ctx.quadraticCurveTo(elbX + side*s*0.014, elbY - s*0.006, fistX + side*s*0.010, fistY - s*0.006); ctx.stroke();
    ctx.fillStyle = '#0c1224';
    ctx.beginPath(); ctx.arc(elbX, elbY, s * 0.034, 0, Math.PI * 2); ctx.fill();
    // Clenched fist gauntlet
    ctx.fillStyle = '#040610';
    ctx.beginPath(); ctx.arc(fistX, fistY, s * 0.044, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e2d48';
    ctx.beginPath(); ctx.arc(fistX - side * s * 0.010, fistY - s * 0.010, s * 0.026, 0, Math.PI * 2); ctx.fill();
    // Knuckle spikes
    ctx.fillStyle = '#0c1224';
    for (let kn = 0; kn < 3; kn++) {
      const kx = fistX + (kn - 1) * s * 0.016;
      ctx.beginPath();
      ctx.moveTo(kx - s * 0.006, fistY - s * 0.012);
      ctx.lineTo(kx, fistY - s * 0.034);
      ctx.lineTo(kx + s * 0.006, fistY - s * 0.012);
      ctx.closePath(); ctx.fill();
    }
  }

  // ── MACE (long thin handle + spiked ball head) ───────────────────
  const weaponLen = s * 0.74;
  const handleEndX = gripX + Math.cos(weaponAng) * weaponLen;
  const handleEndY = gripY + Math.sin(weaponAng) * weaponLen;

  // Handle
  ctx.strokeStyle = '#060a18'; ctx.lineWidth = s * 0.036; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(gripX, gripY); ctx.lineTo(handleEndX, handleEndY); ctx.stroke();
  ctx.strokeStyle = '#2a3248'; ctx.lineWidth = s * 0.014;
  ctx.beginPath();
  ctx.moveTo(gripX + Math.cos(weaponAng + Math.PI/2) * s * 0.008, gripY + Math.sin(weaponAng + Math.PI/2) * s * 0.008);
  ctx.lineTo(handleEndX + Math.cos(weaponAng + Math.PI/2) * s * 0.008, handleEndY + Math.sin(weaponAng + Math.PI/2) * s * 0.008);
  ctx.stroke();
  // Grip leather wrap
  const pPx = Math.cos(weaponAng + Math.PI / 2);
  const pPy = Math.sin(weaponAng + Math.PI / 2);
  ctx.strokeStyle = '#1a0a08'; ctx.lineWidth = s * 0.046;
  ctx.beginPath();
  ctx.moveTo(gripX - Math.cos(weaponAng) * s * 0.040, gripY - Math.sin(weaponAng) * s * 0.040);
  ctx.lineTo(gripX + Math.cos(weaponAng) * s * 0.050, gripY + Math.sin(weaponAng) * s * 0.050);
  ctx.stroke();
  ctx.strokeStyle = '#0a0404'; ctx.lineWidth = s * 0.007;
  for (let wi = 0; wi < 4; wi++) {
    const wt = (wi / 3 - 0.5) * s * 0.090;
    ctx.beginPath();
    ctx.moveTo(gripX + Math.cos(weaponAng) * wt - pPx * s * 0.022, gripY + Math.sin(weaponAng) * wt - pPy * s * 0.022);
    ctx.lineTo(gripX + Math.cos(weaponAng) * wt + pPx * s * 0.022, gripY + Math.sin(weaponAng) * wt + pPy * s * 0.022);
    ctx.stroke();
  }

  // Mace head (spiked ball)
  if (slamT > 0) {
    ctx.shadowColor = '#6699ff'; ctx.shadowBlur = s * slamT * 0.38;
  }
  const maceR = s * 0.085;
  ctx.fillStyle = '#0a1020';
  ctx.beginPath();
  ctx.arc(handleEndX, handleEndY, maceR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a3450';
  ctx.beginPath();
  ctx.arc(handleEndX - s * 0.020, handleEndY - s * 0.020, maceR * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a708a';
  ctx.beginPath();
  ctx.arc(handleEndX - s * 0.028, handleEndY - s * 0.030, maceR * 0.22, 0, Math.PI * 2); ctx.fill();
  // 8 spikes
  for (let si = 0; si < 8; si++) {
    const sa = (si / 8) * Math.PI * 2;
    const spLen = s * (0.072 + (si % 2 === 0 ? 0.010 : 0));
    const sBaseX = handleEndX + Math.cos(sa) * maceR * 0.95;
    const sBaseY = handleEndY + Math.sin(sa) * maceR * 0.95;
    const sTipX = handleEndX + Math.cos(sa) * (maceR + spLen);
    const sTipY = handleEndY + Math.sin(sa) * (maceR + spLen);
    const perpA = sa + Math.PI / 2;
    ctx.fillStyle = '#040610';
    ctx.beginPath();
    ctx.moveTo(sBaseX + Math.cos(perpA) * s * 0.014, sBaseY + Math.sin(perpA) * s * 0.014);
    ctx.lineTo(sTipX, sTipY);
    ctx.lineTo(sBaseX - Math.cos(perpA) * s * 0.014, sBaseY - Math.sin(perpA) * s * 0.014);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#24324a';
    ctx.beginPath();
    ctx.moveTo(sBaseX + Math.cos(perpA) * s * 0.005, sBaseY + Math.sin(perpA) * s * 0.005);
    ctx.lineTo(sTipX - Math.cos(sa) * s * 0.008, sTipY - Math.sin(sa) * s * 0.008);
    ctx.lineTo(sBaseX - Math.cos(perpA) * s * 0.002, sBaseY - Math.sin(perpA) * s * 0.002);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(handleEndX, handleEndY, s * 0.018, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Strike motion trail (multi-stroke arc following actual mace path) ─
  if (strikeE > 0.10 && strikeE < 1.0 && impactE === 0) {
    // Draw "ghost" trail of past mace positions by interpolating between wu and st poses
    const tipNow = handleEndX;
    const tipNowY = handleEndY;
    for (let g = 0; g < 4; g++) {
      const look = 0.08 + g * 0.045;                   // how far back in time
      const eT = Math.max(0, strikeE - look);
      // Recompute grip at past time
      const pgX = wu.gx + eT * (st.gx - wu.gx);
      const pgY = wu.gy + eT * (st.gy - wu.gy);
      const pAn = wu.an + eT * (st.an - wu.an);
      const ptX = pgX + Math.cos(pAn) * weaponLen;
      const ptY = pgY + Math.sin(pAn) * weaponLen;
      const gAlpha = (1 - g / 4) * 0.55 * Math.sin(strikeE * Math.PI);
      ctx.strokeStyle = `rgba(140,190,255,${gAlpha})`;
      ctx.lineWidth = s * (0.058 - g * 0.010);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pgX, pgY);
      ctx.lineTo(ptX, ptY);
      ctx.stroke();
    }
    // Leading white-blue streak at current mace position
    const leadA = Math.sin(strikeE * Math.PI) * 0.82;
    ctx.shadowColor = '#88bbff'; ctx.shadowBlur = s * 0.28 * leadA;
    ctx.strokeStyle = `rgba(220,235,255,${leadA})`;
    ctx.lineWidth = s * 0.022;
    ctx.beginPath();
    ctx.moveTo(gripX, gripY);
    ctx.lineTo(tipNow, tipNowY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── IMPACT effects (shockwave + sparks + bright flash) ───────────
  if (impactE > 0 || (recoverE > 0 && recoverE < 0.22)) {
    const impT = impactE > 0 ? 1 : 1 - recoverE / 0.22;
    // Ground shockwave centered under mace head impact point
    const impX = handleEndX;
    const impY = fY + s * 0.010;
    const ringR = s * (0.15 + (1 - impT) * 0.55);
    ctx.strokeStyle = `rgba(140,200,255,${impT * 0.78})`;
    ctx.lineWidth   = s * 0.024;
    ctx.beginPath();
    ctx.ellipse(impX, impY, ringR, ringR * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Inner brighter ring
    ctx.strokeStyle = `rgba(220,240,255,${impT * 0.55})`;
    ctx.lineWidth = s * 0.014;
    const ringR2 = ringR * 0.62;
    ctx.beginPath();
    ctx.ellipse(impX, impY, ringR2, ringR2 * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Sparks radiating outward from mace head
    ctx.fillStyle = `rgba(220,240,255,${impT * 0.90})`;
    for (let si = 0; si < 7; si++) {
      const sa = -Math.PI + si * Math.PI / 6;
      const sLen = s * (0.08 + (1 - impT) * 0.14);
      const sx = handleEndX + Math.cos(sa) * sLen;
      const sy = handleEndY + Math.sin(sa) * sLen - (1 - impT) * s * 0.03;
      ctx.beginPath();
      ctx.arc(sx, sy, s * 0.010 * impT, 0, Math.PI * 2); ctx.fill();
    }
    // Bright flash on mace head at first impact frame
    if (impactE > 0) {
      ctx.shadowColor = '#ddeeff'; ctx.shadowBlur = s * 0.42 * impactE;
      ctx.fillStyle = `rgba(240,252,255,${impactE * 0.85})`;
      ctx.beginPath();
      ctx.arc(handleEndX, handleEndY, maceR * 1.25, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    // Dust puff below impact
    ctx.fillStyle = `rgba(100,80,70,${impT * 0.55})`;
    ctx.beginPath();
    ctx.ellipse(impX, impY, ringR * 0.70, ringR * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ── Neck (gorget) ────────────────────────────────────────────────
  ctx.fillStyle = '#040610';
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.082 + tilt, bodyTop + s * 0.002);
  ctx.lineTo(bX + s * 0.082 + tilt, bodyTop + s * 0.002);
  ctx.lineTo(bX + s * 0.070 + tilt, neckTop);
  ctx.lineTo(bX - s * 0.070 + tilt, neckTop);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#14203a';
  ctx.fillRect(bX - s * 0.070 + tilt, bodyTop, s * 0.140, s * 0.010);

  // ── HELMET (tall, elongated pointed, like Sauron's) ──────────────
  if (inFight) {
    ctx.shadowColor = '#ff5522'; ctx.shadowBlur = s * 0.22;
  }
  // Helmet base — more elongated and tall
  ctx.fillStyle = '#040610';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 0.90, headCY + headR * 0.85);
  ctx.lineTo(bX + tilt - headR * 1.05, headCY - headR * 0.20);
  ctx.lineTo(bX + tilt - headR * 0.88, headCY - headR * 1.05);
  ctx.lineTo(bX + tilt - headR * 0.30, headCY - headR * 1.38);
  ctx.lineTo(bX + tilt + headR * 0.30, headCY - headR * 1.28);
  ctx.lineTo(bX + tilt + headR * 0.92, headCY - headR * 0.65);
  ctx.lineTo(bX + tilt + headR * 0.94, headCY + headR * 0.25);
  ctx.lineTo(bX + tilt + headR * 0.76, headCY + headR * 0.88);
  ctx.closePath(); ctx.fill();
  // Mid layer
  ctx.fillStyle = '#14203a';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 0.58, headCY + headR * 0.65);
  ctx.lineTo(bX + tilt - headR * 0.72, headCY - headR * 0.12);
  ctx.lineTo(bX + tilt - headR * 0.56, headCY - headR * 0.92);
  ctx.lineTo(bX + tilt + headR * 0.20, headCY - headR * 1.14);
  ctx.lineTo(bX + tilt + headR * 0.70, headCY - headR * 0.52);
  ctx.lineTo(bX + tilt + headR * 0.70, headCY + headR * 0.68);
  ctx.closePath(); ctx.fill();
  // Cheek plate (pentagonal, highlighted)
  ctx.fillStyle = '#22304a';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 0.45, headCY - headR * 0.18);
  ctx.lineTo(bX + tilt + headR * 0.40, headCY - headR * 0.22);
  ctx.lineTo(bX + tilt + headR * 0.52, headCY + headR * 0.28);
  ctx.lineTo(bX + tilt + headR * 0.22, headCY + headR * 0.58);
  ctx.lineTo(bX + tilt - headR * 0.38, headCY + headR * 0.55);
  ctx.closePath(); ctx.fill();
  // Central ridge line (up from brow to crown point)
  ctx.strokeStyle = '#000'; ctx.lineWidth = s * 0.012; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bX + tilt, headCY - headR * 1.34);
  ctx.lineTo(bX + tilt, headCY + headR * 0.35);
  ctx.stroke();
  // Nose guard
  ctx.fillStyle = '#060a18';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - s * 0.018, headCY - headR * 0.30);
  ctx.lineTo(bX + tilt + s * 0.018, headCY - headR * 0.30);
  ctx.lineTo(bX + tilt + s * 0.013, headCY + headR * 0.68);
  ctx.lineTo(bX + tilt - s * 0.013, headCY + headR * 0.68);
  ctx.closePath(); ctx.fill();
  // Visor slit
  ctx.fillStyle = '#000002';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 0.62, headCY - headR * 0.15);
  ctx.lineTo(bX + tilt - s * 0.020, headCY - headR * 0.12);
  ctx.lineTo(bX + tilt - s * 0.020, headCY + headR * 0.10);
  ctx.lineTo(bX + tilt - headR * 0.60, headCY + headR * 0.13);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bX + tilt + s * 0.020, headCY - headR * 0.12);
  ctx.lineTo(bX + tilt + headR * 0.64, headCY - headR * 0.10);
  ctx.lineTo(bX + tilt + headR * 0.62, headCY + headR * 0.15);
  ctx.lineTo(bX + tilt + s * 0.020, headCY + headR * 0.10);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;

  // EYE GLOW
  [-1, 1].forEach(side => {
    const ex = bX + tilt + side * headR * 0.34;
    const ey = headCY - headR * 0.02;
    const eyeGlow = 0.72 + Math.sin(bTime * 2.2) * 0.22 + (atkActive ? 0.2 : 0);
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = s * eyeGlow * 0.55;
    const eGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, headR * 0.22);
    eGrad.addColorStop(0, `rgba(255,220,120,${eyeGlow})`);
    eGrad.addColorStop(0.40, `rgba(255,100,20,${eyeGlow * 0.90})`);
    eGrad.addColorStop(1, 'rgba(120,0,0,0)');
    ctx.fillStyle = eGrad;
    ctx.beginPath();
    ctx.ellipse(ex, ey, headR * 0.22, headR * 0.10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,240,180,${eyeGlow * 0.82})`;
    ctx.beginPath();
    ctx.ellipse(ex, ey, headR * 0.08, headR * 0.050, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.ellipse(ex + dir * headR * 0.02, ey, headR * 0.023, headR * 0.044, 0, 0, Math.PI * 2); ctx.fill();
  });

  // ── CROWN OF SPIKES (11 thin radiating needle-blades, Sauron sunburst)
  const crownBaseY = headCY - headR * 1.18;
  const crownCenterX = bX + tilt;
  // Spikes arranged in a radial fan from -160° to -20° (covering the top half)
  // Central (-90°) longest, decreasing toward edges
  const crownSpikes = [];
  const numSpikes = 11;
  for (let si = 0; si < numSpikes; si++) {
    const t = si / (numSpikes - 1);                      // 0..1
    const ang = -Math.PI * 0.88 + t * Math.PI * 0.76;    // from -158° to -22°
    const distFromCenter = Math.abs(t - 0.5) * 2;        // 0 at center, 1 at edges
    const len = 0.62 - distFromCenter * 0.34;            // center tallest, edges shorter
    crownSpikes.push({ ang, len });
  }
  crownSpikes.forEach(sp => {
    const baseRx = headR * 0.70;
    const baseRy = headR * 0.30;
    const spBaseX = crownCenterX + Math.cos(sp.ang) * baseRx;
    const spBaseY = crownBaseY + Math.sin(sp.ang) * baseRy;
    const spTipX = crownCenterX + Math.cos(sp.ang) * (baseRx + s * sp.len);
    const spTipY = crownBaseY + Math.sin(sp.ang) * (baseRy + s * sp.len);
    const perpA = sp.ang + Math.PI / 2;
    const perpX = Math.cos(perpA);
    const perpY = Math.sin(perpA);
    const baseW = s * 0.016;
    // Dark thin blade body
    ctx.fillStyle = '#020408';
    ctx.beginPath();
    ctx.moveTo(spBaseX + perpX * baseW, spBaseY + perpY * baseW);
    ctx.lineTo(spTipX, spTipY);
    ctx.lineTo(spBaseX - perpX * baseW, spBaseY - perpY * baseW);
    ctx.closePath(); ctx.fill();
    // Thin highlight along one edge (catches light)
    ctx.strokeStyle = '#2a3650';
    ctx.lineWidth = s * 0.006;
    ctx.beginPath();
    ctx.moveTo(spBaseX + perpX * baseW * 0.3, spBaseY + perpY * baseW * 0.3);
    ctx.lineTo(spTipX, spTipY);
    ctx.stroke();
    // Sharp bright tip
    ctx.fillStyle = '#4a5a78';
    ctx.beginPath();
    ctx.arc(spTipX, spTipY, s * 0.005, 0, Math.PI * 2); ctx.fill();
  });
  // Crown ring base
  ctx.fillStyle = '#060a18';
  ctx.beginPath();
  ctx.ellipse(crownCenterX, crownBaseY + headR * 0.05, headR * 0.72, headR * 0.20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1a2438';
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.ellipse(crownCenterX, crownBaseY, headR * 0.70, headR * 0.26, 0, 0, Math.PI * 2); ctx.stroke();

  // ── Branch visuals ──────────────────────────────────────────
  const _dkBranch = unit._branch || '';
  if (_dkBranch === 'A') {
    // Black Blade: void-dark aura on mace + armor-piercing rune
    const _t = unit._dkT;
    ctx.save(); ctx.shadowColor = '#220033'; ctx.shadowBlur = s * 0.22;
    // Void aura ring around mace hand
    const _mhX = bX + dir * s * 0.34, _mhY = bodyTop + bodyH * 0.58;
    ctx.strokeStyle = 'rgba(80,0,120,0.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(_mhX, _mhY, s * 0.16, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(140,20,200,0.28)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(_mhX, _mhY, s * 0.22, 0, Math.PI*2); ctx.stroke();
    // Rune on chest
    const _rx = bX, _ry = bodyTop + bodyH * 0.35;
    ctx.strokeStyle = `rgba(170,0,255,${0.40 + Math.sin(_t*1.8)*0.15})`; ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(_rx - s*0.06, _ry - s*0.06); ctx.lineTo(_rx + s*0.06, _ry + s*0.06); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(_rx + s*0.06, _ry - s*0.06); ctx.lineTo(_rx - s*0.06, _ry + s*0.06); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(_rx, _ry - s*0.08); ctx.lineTo(_rx, _ry + s*0.08); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_dkBranch === 'B') {
    // Abyss Armor: absorb/reflect rune plates on pauldrons + dark aura
    ctx.save(); ctx.shadowColor = '#003366'; ctx.shadowBlur = s * 0.18;
    const _t = unit._dkT;
    const _pulse = 0.32 + Math.sin(_t * 1.5) * 0.12;
    // Shoulder rune circles
    for (const side of [-1, 1]) {
      const _px = bX + side * s * 0.30, _py = bodyTop + s * 0.10;
      ctx.strokeStyle = `rgba(30,80,200,${_pulse * 1.4})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(_px, _py, s * 0.10, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(80,140,255,${_pulse})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(_px, _py, s * 0.07, 0, Math.PI*2); ctx.stroke();
    }
    // Body absorb shimmer
    ctx.strokeStyle = `rgba(40,100,220,0.18)`; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(bX, bodyTop + bodyH*0.45, s*0.28, s*0.38, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }

  ctx.restore();
  // HP bar above tallest spike
  const topSpikeTip = crownBaseY + Math.sin(-Math.PI * 0.50) * (headR * 0.30 + s * 0.62);
  unit._hpBarY = topSpikeTip - s * 0.040;
}
