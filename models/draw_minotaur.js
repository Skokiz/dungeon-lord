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

  // ── Evolution branches ───────────────────────────────────────────
  //  A = Берсерк — enraged CRIMSON hide + glowing rage veins + fury aura
  //  B = Захисник — bull-brown hide under heavy bronze/iron ARMOUR
  const _br = unit._branch || '';
  const _isBerserk  = (_br === 'A');
  const _isDefender = (_br === 'B');
  // Skin palette (Berserk recolours the hide to crimson; base/Defender stay bull-brown)
  const C1  = _isBerserk ? '#4a140e' : '#2e1608';   // darkest base
  const C2  = _isBerserk ? '#7d2418' : '#5a2d18';   // mid muscle
  const C3  = _isBerserk ? '#b0402a' : '#7a4020';   // highlight
  const C4  = _isBerserk ? '#c05038' : '#8a4825';   // pec highlight
  const C5  = _isBerserk ? '#45120c' : '#2a1608';   // neck base
  const C6  = _isBerserk ? '#7d2418' : '#5a2d14';   // neck mid / thigh / calf
  const C7  = _isBerserk ? '#3a0e08' : '#1c0d05';   // shin
  const C8  = _isBerserk ? '#a83824' : '#7a3a1a';   // thigh highlight
  const C9  = _isBerserk ? '#9a3020' : '#6a3218';   // shin highlight
  const C10 = _isBerserk ? '#3a0f0a' : '#241005';   // fist base
  const C11 = _isBerserk ? '#6a2015' : '#4a2211';   // fist mid / thumb

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

  // ── Ram attack motion: COIL → explosive DRIVE → settle. Eased (not linear) for
  //    snap, and continuous across phase seams so nothing pops. ────────────────
  const eOut = t => 1 - (1 - t) * (1 - t);   // fast-out (explosive)
  const eIn  = t => t * t;                    // slow settle
  // atkExt = normalized forward extension of the strike (0 = neutral, 1 = full gore reach).
  // Peaks exactly at the charge→recover seam (ap 0.52) with NO neutral-pose gap there.
  // Branch on contiguous ap ranges (NOT on phase-var > 0), so the seams at ap=0.28
  // and ap=0.52 are covered with no neutral-pose dropout. Poses are continuous:
  // charge starts exactly at the coil extreme (d=0) and the peak sits at ap=0.52 (b=1).
  let rushX = 0, headPitch = 0, headDrop = 0, headDropX = 0, leanBody = 0, atkExt = 0;
  if (atkActive && ap < 0.28) {
    // COIL — rear head + torso UP and BACK, load weight onto the rear hoof.
    // eOut front-loads the rear so it reads up-and-back early (snappier anticipation).
    const w = eOut(windUpT);
    rushX     = -dir * w * s * 0.22;
    headPitch = -w * 0.28;                        // chin up / horns cocked back
    headDrop  = -w * s * 0.14;                    // head rears up
    leanBody  = -dir * w * 0.30;
  } else if (atkActive && ap < 0.52) {
    // EXPLODE forward — continuous from the coil extreme (d=0), eased fast to the peak
    const d = eOut(chargeT);
    rushX     = dir * s * (-0.22 + d * 0.58) * aoeMult;
    headPitch = -0.28 + d * 1.13;                 // slams chin-up → full gore-down
    headDrop  = (-0.14 + d * 0.27) * s;
    headDropX = dir * d * s * 0.08;
    leanBody  = dir * (-0.30 + d * 0.70);
    atkExt    = d;
  } else if (atkActive) {
    // SETTLE from the PEAK (b=1 at ap=0.52) back to neutral, tiny overshoot past it
    const b = eIn(1 - recoverT);
    rushX     = dir * s * 0.36 * b * aoeMult - dir * Math.sin(recoverT * Math.PI) * s * 0.025;
    headPitch = 0.85 * b;
    headDrop  = 0.13 * s * b;
    headDropX = dir * 0.08 * s * b;
    leanBody  = dir * 0.40 * b;
    atkExt    = b;
  }

  // Shockwave trigger on impact (mid-charge)
  if (aoeCharging && atkActive && chargeT > 0.55 && !unit._mnStruck) {
    unit._mnWaveT = 1.0; unit._mnStruck = true;
  }

  // ── Proportions (TALLER + MORE MUSCLE) ───────────────────────────
  const shW    = s * 0.600;      // a bit wider for bulk
  const hipW   = s * 0.310;      // V-taper
  const bodyH  = s * 0.490;      // taller torso
  const legH   = s * 0.400;      // longer, heavier legs
  const headW  = s * 0.258;      // smaller head → less big-headed/derpy
  const headH  = s * 0.298;
  const neckH  = s * 0.104;       // visible thick bull neck (head no longer sits on the torso)
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
    ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.086   // deep vertical drop at each footfall = tonnage
    : 0;
  // impact absorb: an extra "thud" dip just AFTER each contact (breaks the smooth sine
  // so the weight lands rather than glides)
  const _stepT = isWalking ? (walkPhase % 0.5) / 0.5 : 0;             // 0 at each contact → 1 next contact
  const impactDip = (isWalking && _stepT < 0.36) ? Math.sin(_stepT / 0.36 * Math.PI) * s * 0.032 : 0;
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
    ? (1 - Math.abs(Math.sin((walkPhase + 0.08) * Math.PI * 2))) * s * 0.032
    : 0;
  // head leads/settles fore–aft slightly out of phase with the body (overlapping action)
  const walkHeadLead = isWalking ? Math.sin((walkPhase - 0.06) * Math.PI * 2) * s * 0.013 : 0;

  const stepBob  = walkBob + impactDip;
  const stepSide = isWalking ? walkSwayX : weightShift;

  const bX = cx + stepSide * 0.5 + rushX + walkLean;
  const bodyBot = fY - legH + stepBob;
  const bodyTop = bodyBot - bodyH - breatheY;
  const neckTop = bodyTop - neckH;
  const headCY = neckTop - headH * 0.50 + breatheY + headBob + walkHeadBob + headDrop;
  const headCX = bX + dir * s * 0.030 + neckLean + leanBody * s * 0.8 + headDropX + walkHeadLead * dir;
  const tilt = dir * s * 0.016 + shoulderRoll + leanBody * s * 0.5 + shTiltWalk * s * 0.8;

  ctx.save();

  // ── Ground shadow ────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(15,4,0,0.48)';
  ctx.beginPath();
  ctx.ellipse(cx + rushX * 0.5, fY + s * 0.020, s * 0.54, s * 0.082, 0, 0, Math.PI * 2); ctx.fill();

  // ── Berserk fury aura (pulsing heat haze behind the whole body) ──
  if (_isBerserk) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const _aP = 0.5 + 0.5 * Math.sin(bTime * 4);
    const _aCY = bodyTop + bodyH * 0.45;
    const _ag = ctx.createRadialGradient(bX, _aCY, s * 0.20, bX, _aCY, s * 0.74);
    _ag.addColorStop(0,   `rgba(255,70,26,${(0.26 + _aP * 0.10).toFixed(3)})`);
    _ag.addColorStop(0.55,`rgba(210,38,14,${(0.13 + _aP * 0.05).toFixed(3)})`);
    _ag.addColorStop(1,   'rgba(180,20,0,0)');
    ctx.fillStyle = _ag;
    ctx.beginPath(); ctx.ellipse(bX, _aCY, s * 0.70, s * 0.84, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

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
  const tailSway = Math.sin(bTime * 1.3) * s * 0.055 + weightShift * 1.5 - rushX * 0.3
                 + (isWalking ? Math.sin(walkPhase * Math.PI * 2 + Math.PI) * s * 0.055 : 0);  // swings counter to the hips
  const tailBaseX = bX - dir * s * 0.22;                 // rear-side (not centered on the crotch)
  const tailBaseY = bodyBot - s * 0.060;
  const tailEndX  = tailBaseX - dir * s * 0.06 + tailSway;
  const tailEndY  = tailBaseY + s * 0.21;
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
  // fur tuft at the tail tip — a compact cluster (not a spread bead-chain)
  ctx.fillStyle = '#0a0402';
  for (let ti = 0; ti < 5; ti++) {
    const ta = (ti / 5) * Math.PI * 2;
    const tx = tailEndX + Math.cos(ta) * s * 0.022 + Math.sin(bTime * 2) * s * 0.004;
    const ty = tailEndY + s * 0.012 + Math.sin(ta) * s * 0.026;
    ctx.beginPath();
    ctx.arc(tx, ty, s * 0.019, 0, Math.PI * 2); ctx.fill();
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
        // Knee compresses to ABSORB the landing (strongest just after contact)
        walkKneeBendY = Math.sin(Math.min(1, t * 1.7) * Math.PI) * s * 0.019;
        walkKneeDrive = 0;
      } else {
        // SWING: foot arcs from back, up, forward
        const t = (legPhase - 0.5) / 0.5;               // 0..1
        walkFwd = (-0.48 + t * 0.96) * s * 0.15;        // longer stride
        walkFootLift = Math.sin(t * Math.PI) * s * 0.100;   // pick the hoof up decisively (heavy plod)
        // Knee lifts forward and bends strongly during swing
        walkKneeDrive = Math.sin(t * Math.PI) * s * 0.066;
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
    // Attack leg drive: the REAR hoof stays planted while the body lunges forward
    // (the leg extends = a real push-off), the FRONT hoof steps into the charge.
    let atkFootX = 0;
    if (atkActive) {
      if (side === -dir) atkFootX = -rushX * 0.9;                       // rear: plant → drive
      else               atkFootX = (chargeT - windUpT) * dir * s * 0.05; // front: step in
    }
    const hoofX = hipX + side * s * 0.030 + walkFwd + pawLift * dir * 0.8 + atkFootX;
    const hoofY = fY - s * 0.008 + idleLift - pawLift - walkFootLift;

    // Upper leg (thick thigh)
    ctx.strokeStyle = C1; ctx.lineWidth = s * 0.220; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kneeX, kneeY); ctx.stroke();
    // Shin
    ctx.strokeStyle = C7; ctx.lineWidth = s * 0.160;
    ctx.beginPath(); ctx.moveTo(kneeX, kneeY); ctx.lineTo(hoofX, hoofY); ctx.stroke();
    // Thigh muscle (front)
    ctx.strokeStyle = C6; ctx.lineWidth = s * 0.085;
    ctx.beginPath(); ctx.moveTo(hipX + dir*s*0.024, hipY); ctx.lineTo(kneeX + dir*s*0.018, kneeY); ctx.stroke();
    // Thigh highlight (quadriceps bulge)
    ctx.strokeStyle = C8; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.moveTo(hipX + dir*s*0.034, hipY - s * 0.005); ctx.lineTo(kneeX + dir*s*0.022, kneeY + s * 0.008); ctx.stroke();
    // Calf muscle (back of shin)
    ctx.strokeStyle = C6; ctx.lineWidth = s * 0.048;
    ctx.beginPath(); ctx.moveTo(kneeX - dir*s*0.015, kneeY); ctx.lineTo(hoofX - dir*s*0.008, hoofY - s*0.016); ctx.stroke();
    // Shin highlight (front)
    ctx.strokeStyle = C9; ctx.lineWidth = s * 0.020;
    ctx.beginPath(); ctx.moveTo(kneeX + dir*s*0.012, kneeY + s*0.010); ctx.lineTo(hoofX + dir*s*0.010, hoofY - s*0.010); ctx.stroke();
    // Fur tuft at knee
    ctx.fillStyle = '#0a0402';
    for (let fi = 0; fi < 3; fi++) {
      ctx.beginPath();
      ctx.arc(kneeX - side * s * 0.020 + fi * s * 0.015 * side, kneeY + s * 0.006, s * 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hoof — heavy CLOVEN hoof (wide block, front face, central cleft)
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.moveTo(hoofX - s * 0.075, hoofY - s * 0.010);
    ctx.lineTo(hoofX + dir * s * 0.090, hoofY - s * 0.006);
    ctx.quadraticCurveTo(hoofX + dir * s * 0.110, hoofY + s * 0.024, hoofX + dir * s * 0.085, hoofY + s * 0.044);
    ctx.lineTo(hoofX - s * 0.070, hoofY + s * 0.044);
    ctx.quadraticCurveTo(hoofX - s * 0.092, hoofY + s * 0.018, hoofX - s * 0.075, hoofY - s * 0.010);
    ctx.closePath(); ctx.fill();
    // front hoof-wall highlight
    ctx.fillStyle = '#241205';
    ctx.beginPath();
    ctx.ellipse(hoofX + dir * s * 0.020, hoofY + s * 0.026, s * 0.070, s * 0.020, 0, 0, Math.PI * 2); ctx.fill();
    // cloven cleft (splits the hoof toe)
    ctx.strokeStyle = '#000'; ctx.lineWidth = s * 0.012; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hoofX + dir * s * 0.028, hoofY + s * 0.004);
    ctx.lineTo(hoofX + dir * s * 0.030, hoofY + s * 0.044);
    ctx.stroke();
    // rim glint
    ctx.strokeStyle = 'rgba(120,80,50,0.5)'; ctx.lineWidth = s * 0.006;
    ctx.beginPath();
    ctx.moveTo(hoofX - s * 0.060, hoofY - s * 0.004);
    ctx.lineTo(hoofX + dir * s * 0.075, hoofY - s * 0.002);
    ctx.stroke();

    // footfall dust — a punchy burst blooms under THIS hoof as it PLANTS (short window
    // so it reads under one foot at a time), then spreads and settles = heavy weight
    if (isWalking && legPhase < 0.14) {
      const fp = legPhase / 0.14;                    // 0 = just struck → 1 = dissipated
      for (let pi = 0; pi < 4; pi++) {
        const pa = (pi - 1.5) * 0.55;
        ctx.fillStyle = `rgba(158,118,78,${((1 - fp) * 0.55).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hoofX - dir * s * 0.02 + Math.cos(pa) * s * 0.13 * fp,
                hoofY + s * 0.035 - fp * s * 0.06,
                s * (0.026 + fp * 0.055), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // ── Belt + fur skirt (clean scalloped fur flaps, not jagged scribbles) ─
  const skirtH = s * 0.150;
  const skTop  = bodyBot - s * 0.025;
  const skHalf = hipW * 1.26;
  ctx.fillStyle = '#1a0a04';
  ctx.beginPath();
  ctx.moveTo(bX - skHalf, skTop);
  const _flaps = 4, _step = (skHalf * 2) / _flaps;
  for (let fi = 0; fi < _flaps; fi++) {
    const xM = bX - skHalf + (fi + 0.5) * _step;
    const xR = bX - skHalf + (fi + 1) * _step;
    const fh = skirtH * ((fi === 1 || fi === 2) ? 1.0 : 0.80);
    ctx.quadraticCurveTo(xM, skTop + fh, xR, skTop);
  }
  ctx.closePath(); ctx.fill();
  // fur-strand shading down each flap
  ctx.strokeStyle = 'rgba(46,22,8,0.6)'; ctx.lineWidth = s * 0.006; ctx.lineCap = 'round';
  for (let fi = 0; fi < _flaps; fi++) {
    const xM = bX - skHalf + (fi + 0.5) * _step;
    ctx.beginPath(); ctx.moveTo(xM, skTop + s * 0.02); ctx.lineTo(xM, skTop + skirtH * 0.66); ctx.stroke();
  }
  ctx.fillStyle = C1;
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
  // single metallic stud (NOT two dots — that read as a little face on the belly)
  ctx.fillStyle = '#c8b24a';
  ctx.beginPath(); ctx.arc(bX, bodyBot - s * 0.037, s * 0.013, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,246,205,0.72)';
  ctx.beginPath(); ctx.arc(bX - s * 0.004, bodyBot - s * 0.041, s * 0.006, 0, Math.PI * 2); ctx.fill();

  // ── Torso (V-trapezoid, muscular) ────────────────────────────────
  if (inFight) {
    ctx.shadowColor = aoeCharging ? '#ff2200' : '#5a2015';
    ctx.shadowBlur  = s * (aoeCharging ? 0.42 : 0.22);
  }
  // Base dark
  ctx.fillStyle = C1;
  ctx.beginPath();
  ctx.moveTo(bX - shW + tilt, bodyTop + s * 0.020);
  ctx.lineTo(bX - shW * 0.50 + tilt, bodyTop - s * 0.030);
  ctx.lineTo(bX + shW * 0.50 + tilt, bodyTop - s * 0.030);
  ctx.lineTo(bX + shW + tilt, bodyTop + s * 0.020);
  ctx.lineTo(bX + hipW + s * 0.010, bodyBot - s * 0.060);
  ctx.lineTo(bX - hipW - s * 0.010, bodyBot - s * 0.060);
  ctx.closePath(); ctx.fill();
  // Mid muscle
  ctx.fillStyle = C2;
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.86 + tilt, bodyTop + s * 0.030);
  ctx.lineTo(bX + shW * 0.86 + tilt, bodyTop + s * 0.030);
  ctx.lineTo(bX + hipW * 0.80,        bodyBot - s * 0.075);
  ctx.lineTo(bX - hipW * 0.80,        bodyBot - s * 0.075);
  ctx.closePath(); ctx.fill();
  // Center highlight
  ctx.fillStyle = C3;
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
  ctx.fillStyle = C4;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.ellipse(bX + side * shW * 0.20 + tilt, bodyTop + s * 0.100 + breatheY * 0.5, s * 0.095, s * 0.058, side * 0.2, 0, Math.PI * 2); ctx.fill();
  });
  // (no vertical sternum line — with the horizontal pec line it formed a cross/dagger)
  // Abs — 3 rows of PAIRED muscle volumes: soft shadow UNDER + highlight ON TOP
  // (carved by light, not etched with stroke lines that read as scribble/scars)
  for (let ai = 0; ai < 3; ai++) {
    const ay = bodyTop + s * (0.214 + ai * 0.072);
    [-1, 1].forEach(side => {
      ctx.fillStyle = 'rgba(16,6,2,0.36)';
      ctx.beginPath();
      ctx.ellipse(bX + side * s * 0.050 + tilt, ay + s * 0.026, s * 0.050, s * 0.019, side * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(142,80,44,0.52)';
      ctx.beginPath();
      ctx.ellipse(bX + side * s * 0.050 + tilt, ay - s * 0.004, s * 0.046, s * 0.030, side * 0.15, 0, Math.PI * 2); ctx.fill();
    });
  }
  // (removed etched oblique side-lines — they read as a stray C-scribble/scar)
  ctx.shadowBlur = 0;

  // ── Berserk rage veins — branching MAGMA CRACKS lit from under the hide ──
  //  each crack forks along the muscle groups, glows red with a soft bloom, and
  //  carries a hot white-yellow core (so it reads as molten, not painted-on).
  if (_isBerserk) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const _vp = 0.6 + 0.4 * Math.sin(bTime * 5);
    const _cracks = [
      [[0.00,0.02],[0.00,0.13],[-0.05,0.24],[-0.09,0.37],[-0.07,0.50]],   // center → left ab gutter
      [[0.00,0.13],[0.05,0.24],[0.08,0.37],[0.06,0.50]],                   //        → right ab gutter
      [[-0.03,0.05],[-0.13,0.09],[-0.21,0.17],[-0.25,0.28]],               // left pec seam
      [[-0.21,0.17],[-0.30,0.21]],                                          //   offshoot
      [[ 0.03,0.06],[ 0.13,0.10],[ 0.21,0.18],[ 0.24,0.30]],               // right pec seam
      [[ 0.21,0.18],[ 0.30,0.23]],                                          //   offshoot
      [[-0.02,0.02],[-0.05,-0.07],[-0.04,-0.14]],                          // up the neck (left)
      [[ 0.02,0.02],[ 0.05,-0.07],[ 0.04,-0.14]],                          // up the neck (right)
    ];
    const _crackPath = (pts) => {
      ctx.beginPath();
      ctx.moveTo(bX + pts[0][0]*s + tilt, bodyTop + pts[0][1]*s);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i+1][0]) / 2, my = (pts[i][1] + pts[i+1][1]) / 2;
        ctx.quadraticCurveTo(bX + pts[i][0]*s + tilt, bodyTop + pts[i][1]*s, bX + mx*s + tilt, bodyTop + my*s);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(bX + last[0]*s + tilt, bodyTop + last[1]*s);
    };
    // outer emissive red glow
    ctx.shadowColor = '#ff4410'; ctx.shadowBlur = s * 0.07;
    ctx.strokeStyle = `rgba(255,72,26,${(0.42 * _vp).toFixed(3)})`; ctx.lineWidth = s * 0.020;
    _cracks.forEach(c => { _crackPath(c); ctx.stroke(); });
    // hot white-yellow molten core
    ctx.shadowColor = '#ffaa30'; ctx.shadowBlur = s * 0.03;
    ctx.strokeStyle = `rgba(255,236,156,${(0.75 * _vp).toFixed(3)})`; ctx.lineWidth = s * 0.008;
    _cracks.forEach(c => { _crackPath(c); ctx.stroke(); });
    ctx.restore();
  }

  // ── Defender armour: heavy breastplate over the chest ──
  if (_isDefender) {
    ctx.save();
    const pcx = bX + tilt, ptop = bodyTop + s * 0.028, pbot = bodyBot - s * 0.085;
    ctx.beginPath();
    ctx.moveTo(pcx - shW * 0.70, ptop);
    ctx.lineTo(pcx + shW * 0.70, ptop);
    ctx.lineTo(pcx + hipW * 0.78, pbot);
    ctx.quadraticCurveTo(pcx, pbot + s * 0.055, pcx - hipW * 0.78, pbot);
    ctx.closePath();
    const pg = ctx.createLinearGradient(pcx - shW * 0.4, ptop, pcx + shW * 0.4, pbot);
    pg.addColorStop(0, '#7c7360'); pg.addColorStop(0.5, '#4c4637'); pg.addColorStop(1, '#26221b');
    ctx.fillStyle = pg; ctx.fill();
    // raised pec plates (muscled cuirass) — dome highlight + shadow crease beneath
    [-1, 1].forEach(sd => {
      const cxp = pcx + sd * shW * 0.30, cyp = ptop + s * 0.12;
      const dg2 = ctx.createRadialGradient(cxp - sd * s * 0.03, cyp - s * 0.03, s * 0.01, cxp, cyp, s * 0.20);
      dg2.addColorStop(0, 'rgba(150,140,112,0.55)'); dg2.addColorStop(0.7, 'rgba(90,82,64,0.0)'); dg2.addColorStop(1, 'rgba(90,82,64,0)');
      ctx.fillStyle = dg2;
      ctx.beginPath(); ctx.ellipse(cxp, cyp, s * 0.17, s * 0.12, sd * 0.12, 0, Math.PI * 2); ctx.fill();
      // crease under the pec
      ctx.strokeStyle = 'rgba(14,11,7,0.5)'; ctx.lineWidth = s * 0.012; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pcx + sd * s * 0.02, ptop + s * 0.06);
      ctx.quadraticCurveTo(cxp, cyp + s * 0.10, pcx + sd * shW * 0.52, ptop + s * 0.16);
      ctx.stroke();
    });
    // central ridge
    ctx.strokeStyle = 'rgba(20,16,10,0.55)'; ctx.lineWidth = s * 0.014;
    ctx.beginPath(); ctx.moveTo(pcx, ptop + s * 0.05); ctx.lineTo(pcx, pbot - s * 0.02); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,188,150,0.4)'; ctx.lineWidth = s * 0.006;
    ctx.beginPath(); ctx.moveTo(pcx - s * 0.008, ptop + s * 0.06); ctx.lineTo(pcx - s * 0.008, pbot - s * 0.03); ctx.stroke();
    // bronze top trim + rivets
    ctx.strokeStyle = '#8a7038'; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pcx - shW * 0.68, ptop + s * 0.012); ctx.lineTo(pcx + shW * 0.68, ptop + s * 0.012); ctx.stroke();
    ctx.fillStyle = '#c2b078';
    for (let ri = 0; ri < 6; ri++) { const rx = pcx - shW * 0.56 + ri * shW * 0.224; ctx.beginPath(); ctx.arc(rx, ptop + s * 0.04, s * 0.011, 0, Math.PI * 2); ctx.fill(); }
    // left-edge sheen
    ctx.strokeStyle = 'rgba(205,195,155,0.35)'; ctx.lineWidth = s * 0.007;
    ctx.beginPath(); ctx.moveTo(pcx - shW * 0.62, ptop + s * 0.09); ctx.lineTo(pcx - hipW * 0.70, pbot - s * 0.02); ctx.stroke();
    ctx.restore();
  }

  // ── Deltoids (shaded shoulder muscle caps, not black fur balls) ──
  [-1, 1].forEach(side => {
    const pX = bX + side * shW * 0.90 + tilt * 0.2;
    const pY = bodyTop + s * 0.045;
    ctx.fillStyle = C1;
    ctx.beginPath(); ctx.ellipse(pX, pY, s * 0.116, s * 0.102, side * 0.30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C2;
    ctx.beginPath(); ctx.ellipse(pX - side * s * 0.010, pY - s * 0.006, s * 0.084, s * 0.072, side * 0.30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C3;
    ctx.beginPath(); ctx.ellipse(pX - side * s * 0.024, pY - s * 0.022, s * 0.046, s * 0.038, side * 0.30, 0, Math.PI * 2); ctx.fill();
    // small fur tuft on the outer-top edge (character, not a big black ball)
    ctx.fillStyle = '#0a0402';
    for (let ti = 0; ti < 3; ti++) {
      const ta = side * (0.5 + ti * 0.30) - Math.PI * 0.5;
      ctx.beginPath();
      ctx.arc(pX + Math.cos(ta) * s * 0.108, pY - s * 0.010 + Math.sin(ta) * s * 0.090, s * 0.023, 0, Math.PI * 2); ctx.fill();
    }
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
    // Walk arm swing — a whole-arm PENDULUM from the shoulder (not a forearm wobble):
    // the elbow itself drives fore-aft, the fist LAGS it (lead-and-drag overshoot), the
    // forward arm swings cross-body toward camera while the trailing arm tucks behind the hip.
    const armSwingF    = isWalking ? Math.sin((armPhase + 0.07) * Math.PI * 2) : 0;   // fist lags the elbow
    const elbFwd       = armSwing  * dir * s * 0.160;                 // big elbow travel = real pendulum
    const swingFistFwd = armSwingF * dir * s * 0.255;
    const swingFistUp  = armSwingF * s * 0.060;                        // signed: fwd raises, back drops
    const crossBody    = isWalking ? Math.max(0, armSwingF) * -side * s * 0.055 : 0;  // forward arm crosses in
    // Attack arm choreography (elbows tuck IN — never bow out like flailing wings):
    //   wind-up  → fists cock BACK + UP (coil / anticipation)
    //   charge   → fists DRIVE forward + up to brace behind the lowered horns
    //   recover  → settle back to rest
    const atkTuck  = windUpT > 0 ? windUpT : chargeT > 0 ? 1 : recoverT > 0 ? (1 - recoverT) : 0;
    const atkCock  = windUpT > 0 ? windUpT : 0;
    const atkDrive = chargeT > 0 ? (0.4 + chargeT * 0.6) : recoverT > 0 ? (1 - recoverT) * 0.5 : 0;
    const elbX = shX + side * s * (0.12 - flex * 0.02 - atkTuck * 0.060) + elbFwd + crossBody * 0.5
               - dir * atkCock * s * 0.04 + dir * atkDrive * s * 0.03;
    const elbY = shY + s * (0.22 - flex * 0.04 - Math.max(0, armSwing) * 0.04) - atkTuck * s * 0.02;
    const fistX = shX + side * s * 0.05 + swingFistFwd + crossBody
                - dir * atkCock * s * 0.06 + dir * atkDrive * s * 0.12;
    const fistY = shY + s * (0.46 - flex * 0.08) - swingFistUp
                - atkCock * s * 0.12 - atkDrive * s * 0.14;

    ctx.lineCap = 'round';
    // BICEP (upper arm) — thick dark base
    ctx.strokeStyle = C1; ctx.lineWidth = s * 0.238;
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.quadraticCurveTo(elbX + side * s * 0.02, shY + s * 0.10, elbX, elbY);
    ctx.stroke();
    // Bicep mid tone
    ctx.strokeStyle = C2; ctx.lineWidth = s * 0.110;
    ctx.beginPath();
    ctx.moveTo(shX + side * s * 0.020, shY);
    ctx.quadraticCurveTo(elbX + side * s * 0.025, shY + s * 0.10, elbX + side * s * 0.005, elbY);
    ctx.stroke();
    // Bicep bulge highlight (extra bulge when flexed)
    ctx.strokeStyle = C3; ctx.lineWidth = s * (0.038 + flex * 0.018);
    ctx.beginPath();
    ctx.moveTo(shX + side * s * 0.035, shY + s * 0.005);
    ctx.quadraticCurveTo(elbX + side * s * (0.040 + flex * 0.015), shY + s * 0.095, elbX + side * s * 0.012, elbY - s * 0.010);
    ctx.stroke();
    // FOREARM (thick, widening toward the fist)
    ctx.strokeStyle = C1; ctx.lineWidth = s * 0.206;
    ctx.beginPath();
    ctx.moveTo(elbX, elbY);
    ctx.quadraticCurveTo(elbX + side * s * 0.005, (elbY + fistY) / 2, fistX, fistY);
    ctx.stroke();
    // Forearm mid
    ctx.strokeStyle = C2; ctx.lineWidth = s * 0.090;
    ctx.beginPath();
    ctx.moveTo(elbX + side * s * 0.016, elbY);
    ctx.quadraticCurveTo(elbX + side * s * 0.020, (elbY + fistY) / 2, fistX + side * s * 0.010, fistY);
    ctx.stroke();
    // Forearm vein/muscle highlight
    ctx.strokeStyle = C3; ctx.lineWidth = s * 0.026;
    ctx.beginPath();
    ctx.moveTo(elbX + side * s * 0.028, elbY + s * 0.010);
    ctx.quadraticCurveTo(elbX + side * s * 0.030, (elbY + fistY) / 2, fistX + side * s * 0.016, fistY - s * 0.012);
    ctx.stroke();
    // ── Clenched FIST — blocky mass + knuckle ridge + thumb (a real hand) ──
    // the forward-swinging fist enlarges slightly toward camera (foreshortening depth)
    const fr = s * (0.078 + flex * 0.012) * (1 + Math.max(0, armSwingF) * 0.18);
    // main fist mass (rounded block, wider than tall)
    ctx.fillStyle = C10;
    ctx.beginPath();
    ctx.moveTo(fistX - fr, fistY - fr * 0.25);
    ctx.quadraticCurveTo(fistX - fr, fistY + fr * 0.9, fistX, fistY + fr * 0.9);
    ctx.quadraticCurveTo(fistX + fr, fistY + fr * 0.9, fistX + fr, fistY - fr * 0.25);
    ctx.quadraticCurveTo(fistX + fr, fistY - fr, fistX, fistY - fr);
    ctx.quadraticCurveTo(fistX - fr, fistY - fr, fistX - fr, fistY - fr * 0.25);
    ctx.closePath(); ctx.fill();
    // knuckle ridge — 4 bumps across the top (leading) edge
    ctx.fillStyle = '#3f1d0e';
    for (let ki = 0; ki < 4; ki++) {
      ctx.beginPath();
      ctx.arc(fistX - fr * 0.6 + ki * fr * 0.4, fistY - fr * 0.52, fr * 0.26, 0, Math.PI * 2); ctx.fill();
    }
    // finger separations
    ctx.strokeStyle = 'rgba(10,4,2,0.55)'; ctx.lineWidth = s * 0.006; ctx.lineCap = 'round';
    for (let ki = 1; ki < 4; ki++) {
      const lx = fistX - fr * 0.6 + ki * fr * 0.4 - fr * 0.2;
      ctx.beginPath(); ctx.moveTo(lx, fistY - fr * 0.30); ctx.lineTo(lx, fistY + fr * 0.55); ctx.stroke();
    }
    // thumb wrapping the front (dir-facing) side
    ctx.fillStyle = C11;
    ctx.beginPath();
    ctx.ellipse(fistX + dir * fr * 0.78, fistY + fr * 0.12, fr * 0.34, fr * 0.52, dir * 0.45, 0, Math.PI * 2); ctx.fill();
    // top highlight
    ctx.fillStyle = 'rgba(122,64,32,0.7)';
    ctx.beginPath(); ctx.ellipse(fistX - fr * 0.18, fistY - fr * 0.55, fr * 0.34, fr * 0.18, 0, 0, Math.PI * 2); ctx.fill();

    // ── Berserk: magma crack running down the arm (spreads the glow off the torso) ──
    if (_isBerserk) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const _vp2 = 0.6 + 0.4 * Math.sin(bTime * 5 + side);
      const _armCrack = () => {
        ctx.beginPath();
        ctx.moveTo(shX + side * s * 0.03, shY + s * 0.05);
        ctx.quadraticCurveTo(elbX + side * s * 0.035, (shY + elbY) / 2, elbX + side * s * 0.005, elbY);
        ctx.quadraticCurveTo(elbX + side * s * 0.02, (elbY + fistY) / 2, fistX - dir * s * 0.015, fistY - s * 0.06);
      };
      ctx.shadowColor = '#ff4410'; ctx.shadowBlur = s * 0.055;
      ctx.strokeStyle = `rgba(255,72,26,${(0.36 * _vp2).toFixed(3)})`; ctx.lineWidth = s * 0.016; _armCrack(); ctx.stroke();
      ctx.shadowColor = '#ffaa30'; ctx.shadowBlur = s * 0.025;
      ctx.strokeStyle = `rgba(255,236,156,${(0.60 * _vp2).toFixed(3)})`; ctx.lineWidth = s * 0.006; _armCrack(); ctx.stroke();
      ctx.restore();
    }

    // ── Defender armour: pauldron (shoulder) + bracer (forearm) ──
    if (_isDefender) {
      const pX = shX, pY = shY - s * 0.02;
      // spike (behind the dome)
      ctx.fillStyle = '#6a6252';
      ctx.beginPath(); ctx.moveTo(pX - side * s * 0.03, pY - s * 0.10); ctx.lineTo(pX - side * s * 0.065, pY - s * 0.20); ctx.lineTo(pX + s * 0.006, pY - s * 0.11); ctx.closePath(); ctx.fill();
      // main dome
      const dg = ctx.createRadialGradient(pX - side * s * 0.03, pY - s * 0.04, s * 0.01, pX, pY, s * 0.15);
      dg.addColorStop(0, '#948668'); dg.addColorStop(0.55, '#5f5747'); dg.addColorStop(1, '#2f2a22');
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.ellipse(pX, pY, s * 0.140, s * 0.120, side * 0.28, 0, Math.PI * 2); ctx.fill();
      // lower lame
      ctx.fillStyle = '#4a4436';
      ctx.beginPath(); ctx.ellipse(pX + side * s * 0.02, pY + s * 0.075, s * 0.116, s * 0.052, side * 0.28, 0, Math.PI * 2); ctx.fill();
      // bronze rim + rivets + sheen
      ctx.strokeStyle = '#8a7038'; ctx.lineWidth = s * 0.012; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(pX, pY + s * 0.012, s * 0.140, s * 0.112, side * 0.28, 0.15, Math.PI - 0.15); ctx.stroke();
      ctx.fillStyle = '#c2b078';
      for (let ri = 0; ri < 3; ri++) { const ra = side * (0.5 + ri * 0.34) - Math.PI * 0.5; ctx.beginPath(); ctx.arc(pX + Math.cos(ra) * s * 0.116, pY - s * 0.01 + Math.sin(ra) * s * 0.100, s * 0.010, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(205,195,155,0.5)';
      ctx.beginPath(); ctx.ellipse(pX - side * s * 0.045, pY - s * 0.045, s * 0.05, s * 0.030, side * 0.28, 0, Math.PI * 2); ctx.fill();
      // bracer on the forearm (elbow → fist)
      const bmx = (elbX + fistX) / 2, bmy = (elbY + fistY) / 2;
      ctx.save();
      ctx.translate(bmx, bmy); ctx.rotate(Math.atan2(fistY - elbY, fistX - elbX));
      const bl = Math.hypot(fistX - elbX, fistY - elbY) * 0.60;
      const brg = ctx.createLinearGradient(0, -s * 0.11, 0, s * 0.11);
      brg.addColorStop(0, '#8c8066'); brg.addColorStop(0.5, '#544d3d'); brg.addColorStop(1, '#2c2720');
      ctx.fillStyle = brg;
      ctx.beginPath(); ctx.moveTo(-bl * 0.5, -s * 0.108); ctx.lineTo(bl * 0.5, -s * 0.096); ctx.lineTo(bl * 0.5, s * 0.096); ctx.lineTo(-bl * 0.5, s * 0.108); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a7038'; ctx.lineWidth = s * 0.010;
      ctx.beginPath(); ctx.moveTo(bl * 0.48, -s * 0.092); ctx.lineTo(bl * 0.48, s * 0.092); ctx.stroke();
      ctx.fillStyle = '#c2b078';
      ctx.beginPath(); ctx.arc(-bl * 0.28, -s * 0.055, s * 0.009, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bl * 0.15, -s * 0.055, s * 0.009, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  });

  // ── Neck (thick bull neck) ───────────────────────────────────────
  ctx.fillStyle = C5;
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.115 + tilt, bodyTop + s * 0.015);
  ctx.lineTo(bX + s * 0.115 + tilt, bodyTop + s * 0.015);
  ctx.lineTo(bX + s * 0.095 + tilt + leanBody * s * 0.4, neckTop + s * 0.005);
  ctx.lineTo(bX - s * 0.095 + tilt + leanBody * s * 0.4, neckTop + s * 0.005);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = C6;
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
  ctx.fillStyle = C1;
  ctx.beginPath();
  ctx.ellipse(headCX, headCY, headW * 0.95, headH * 0.90, 0, 0, Math.PI * 2); ctx.fill();
  // Muzzle (bigger, blunter bull snout)
  ctx.fillStyle = C1;
  ctx.beginPath();
  ctx.ellipse(headCX + dir * headW * 0.36, headCY + headH * 0.30, headW * 0.86, headH * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();
  // Upper face mid tone
  ctx.fillStyle = C2;
  ctx.beginPath();
  ctx.ellipse(headCX - dir * headW * 0.08, headCY - headH * 0.15, headW * 0.78, headH * 0.60, 0, 0, Math.PI * 2); ctx.fill();
  // Muzzle highlight
  ctx.fillStyle = C3;
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
  // Nostril steam — 2 faint puffs jetting well FORWARD of the snout (not a dot-cluster
  // hovering by the nose ring)
  if (inFight) {
    unit._mnSteam.forEach((st, si) => {
      st.life -= dt * 1.3;
      if (st.life <= 0) st.life = 1;
      if (si > 1) return;                          // only 2 puffs
      const sLife = st.life;
      const sx = headCX + dir * headW * (0.98 + (1 - sLife) * 0.55);
      const sy = headCY + headH * 0.20 + si * headH * 0.10 + (1 - sLife) * -headH * 0.12;
      ctx.fillStyle = `rgba(225,210,190,${(sLife * 0.20).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(sx, sy, s * (0.014 + (1 - sLife) * 0.018), 0, Math.PI * 2); ctx.fill();
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
  // Nose ring (smaller — declutters the muzzle)
  ctx.strokeStyle = '#8a6822'; ctx.lineWidth = s * 0.010;
  ctx.beginPath();
  ctx.arc(headCX + dir * headW * 0.58, headCY + headH * 0.64, s * 0.038, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#aa8833'; ctx.lineWidth = s * 0.005;
  ctx.beginPath();
  ctx.arc(headCX + dir * headW * 0.58, headCY + headH * 0.64, s * 0.038, -Math.PI * 0.2, Math.PI * 0.3); ctx.stroke();
  ctx.shadowBlur = 0;

  // Brow ridge — heavy, low, angled DOWN toward center = angry squint
  ctx.fillStyle = '#1e0d05';
  [-1, 1].forEach(side => {
    const bx0 = headCX - dir * headW * 0.06 + side * headW * 0.14;   // inner
    const bx1 = headCX - dir * headW * 0.06 + side * headW * 0.54;   // outer
    const by  = headCY - headH * 0.16;
    ctx.beginPath();
    ctx.moveTo(bx0, by + headH * 0.05);
    ctx.lineTo(bx1, by - headH * 0.09);
    ctx.lineTo(bx1, by + headH * 0.05);
    ctx.lineTo(bx0, by + headH * 0.15);
    ctx.closePath(); ctx.fill();
  });
  // Eyes (glow red on attack) — smaller, wider apart, higher under the heavy brow
  const eyeR = headH * 0.100;
  const eyeYY = headCY - headH * 0.105;
  const attackGlow = chargeT > 0 ? chargeT : 0;
  [-1, 1].forEach(side => {
    const ex = headCX - dir * headW * 0.05 + side * headW * 0.39;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(ex, eyeYY, eyeR * 1.18, eyeR * 0.85, side * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = _isBerserk ? '#ff6a10' : (aoeCharging ? '#ff3300' : '#ff5500');
    ctx.shadowBlur = s * (aoeCharging || attackGlow > 0.3 ? 0.45 : inFight ? 0.32 : (_isBerserk ? 0.42 : 0.16));
    ctx.fillStyle = aoeCharging || attackGlow > 0.5 ? '#ffaa00' : (inFight ? '#ee2200' : (_isBerserk ? '#ff6a1e' : '#c81800'));
    ctx.beginPath();
    ctx.arc(ex, eyeYY, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (_isBerserk && !inFight) {
      // blazing white-hot core + bloom (fury reads on the face) — no cold pupil
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,214,110,0.9)';
      ctx.beginPath(); ctx.arc(ex, eyeYY, eyeR * 0.58, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,232,0.95)';
      ctx.beginPath(); ctx.arc(ex, eyeYY, eyeR * 0.30, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      // pupil — barely offset so the pair doesn't read cross-eyed when the head tilts
      ctx.fillStyle = '#050000';
      ctx.beginPath();
      ctx.ellipse(ex + dir * eyeR * 0.08, eyeYY, eyeR * 0.32, eyeR * 0.58, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,220,180,0.70)';
      ctx.beginPath(); ctx.arc(ex - eyeR * 0.28, eyeYY - eyeR * 0.30, eyeR * 0.17, 0, Math.PI * 2); ctx.fill();
    }
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
    ctx.fillStyle = C1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * s * 0.080, -s * 0.020);
    ctx.lineTo(side * s * 0.045, s * 0.070);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = C3;
    ctx.beginPath();
    ctx.moveTo(side * s * 0.015, s * 0.008);
    ctx.lineTo(side * s * 0.052, -s * 0.008);
    ctx.lineTo(side * s * 0.035, s * 0.048);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  });

  // ── Defender armour: war-helm brow band + nose guard (frames the eyes) ──
  if (_isDefender) {
    const _by = headCY - headH * 0.30;
    // brow band
    ctx.beginPath();
    ctx.moveTo(headCX - headW * 0.80, _by - headH * 0.01);
    ctx.quadraticCurveTo(headCX, _by - headH * 0.22, headCX + headW * 0.80, _by - headH * 0.01);
    ctx.lineTo(headCX + headW * 0.80, _by + headH * 0.15);
    ctx.quadraticCurveTo(headCX, _by - headH * 0.02, headCX - headW * 0.80, _by + headH * 0.15);
    ctx.closePath();
    const _hg = ctx.createLinearGradient(headCX, _by - headH * 0.22, headCX, _by + headH * 0.15);
    _hg.addColorStop(0, '#948668'); _hg.addColorStop(1, '#36302a');
    ctx.fillStyle = _hg; ctx.fill();
    // bronze lower edge
    ctx.strokeStyle = '#8a7038'; ctx.lineWidth = s * 0.012; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(headCX - headW * 0.76, _by + headH * 0.115); ctx.quadraticCurveTo(headCX, _by - headH * 0.01, headCX + headW * 0.76, _by + headH * 0.115); ctx.stroke();
    // rivets across the band
    ctx.fillStyle = '#c2b078';
    for (let ri = -2; ri <= 2; ri++) { ctx.beginPath(); ctx.arc(headCX + ri * headW * 0.33, _by - headH * 0.02 - Math.abs(ri) * headH * 0.025, s * 0.010, 0, Math.PI * 2); ctx.fill(); }
    // nose guard down between the eyes
    ctx.fillStyle = '#57503f';
    ctx.beginPath();
    ctx.moveTo(headCX - headW * 0.09, _by + headH * 0.08);
    ctx.lineTo(headCX + headW * 0.09, _by + headH * 0.08);
    ctx.lineTo(headCX + headW * 0.055, headCY + headH * 0.12);
    ctx.lineTo(headCX - headW * 0.055, headCY + headH * 0.12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(195,183,145,0.45)'; ctx.lineWidth = s * 0.006;
    ctx.beginPath(); ctx.moveTo(headCX, _by + headH * 0.08); ctx.lineTo(headCX, headCY + headH * 0.10); ctx.stroke();
    // sheen
    ctx.fillStyle = 'rgba(205,195,155,0.3)';
    ctx.beginPath(); ctx.ellipse(headCX - headW * 0.30, _by - headH * 0.05, headW * 0.24, headH * 0.05, -0.2, 0, Math.PI * 2); ctx.fill();
  }

  // ── Horns — THE weapon: thick TAPERED bull horns that hook FORWARD ──
  // Filled tapered shape (wide keratin base → sharp point), not a uniform
  // round-cap stroke (that read as a worm). Tip sweeps in `dir` for the ram.
  [-1, 1].forEach(side => {
    const base = { x: headCX + side * headW * 0.50, y: headCY - headH * 0.50 };
    const ctrl = { x: headCX + side * headW * 1.00, y: headCY - headH * 1.02 };
    const tip  = { x: headCX + side * headW * 0.60 + dir * headW * 0.50, y: headCY - headH * 1.16 };
    const w0 = s * 0.062;                              // base half-width → tapers to a point
    const N = 12, L = [], R = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, mt = 1 - t;
      const x = mt*mt*base.x + 2*mt*t*ctrl.x + t*t*tip.x;
      const y = mt*mt*base.y + 2*mt*t*ctrl.y + t*t*tip.y;
      let tx = 2*mt*(ctrl.x - base.x) + 2*t*(tip.x - ctrl.x);
      let ty = 2*mt*(ctrl.y - base.y) + 2*t*(tip.y - ctrl.y);
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl;
      const w = w0 * mt * (0.55 + 0.45 * mt);          // convex taper → sharp
      L.push([x + nx*w, y + ny*w]); R.push([x - nx*w, y - ny*w]);
    }
    const trace = () => {
      ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
      for (let i = 1; i < L.length; i++) ctx.lineTo(L[i][0], L[i][1]);
      for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
      ctx.closePath();
    };
    // keratin body: darker base → bright bone tip
    trace();
    const hgr = ctx.createLinearGradient(base.x, base.y, tip.x, tip.y);
    hgr.addColorStop(0, '#7d6a42'); hgr.addColorStop(0.45, '#c6b487');
    hgr.addColorStop(0.82, '#eee2bf'); hgr.addColorStop(1, '#fbf4dc');
    ctx.fillStyle = hgr; ctx.fill();
    // thin dark contour for read
    ctx.strokeStyle = 'rgba(28,20,8,0.62)'; ctx.lineWidth = s * 0.008; ctx.lineJoin = 'round';
    trace(); ctx.stroke();
    // sheen along the upper (outer) edge
    ctx.strokeStyle = 'rgba(255,249,228,0.55)'; ctx.lineWidth = s * 0.012; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) { const p = L[i]; if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    ctx.stroke();
    // ridge bands across the lower horn
    ctx.strokeStyle = 'rgba(88,68,32,0.5)'; ctx.lineWidth = s * 0.007;
    for (let ri = 2; ri <= 6; ri++) { const li = ri; if (L[li] && R[li]) { ctx.beginPath(); ctx.moveTo(L[li][0], L[li][1]); ctx.lineTo(R[li][0], R[li][1]); ctx.stroke(); } }
    // AoE / charge glow along the horn
    const hornGlow = aoeCharging ? (0.55 + Math.sin(bTime * 6) * 0.20)
                   : chargeT > 0.3 ? (chargeT - 0.3) * 1.5 : 0;
    if (hornGlow > 0) {
      ctx.save();
      ctx.shadowColor = aoeCharging ? '#ff3300' : '#ffcc44';
      ctx.shadowBlur = s * hornGlow * 0.5;
      ctx.strokeStyle = aoeCharging ? `rgba(255,120,40,${(hornGlow*0.7).toFixed(3)})` : `rgba(255,222,120,${(hornGlow*0.6).toFixed(3)})`;
      ctx.lineWidth = s * 0.010; trace(); ctx.stroke();
      ctx.restore();
    }
    // impact accent at the horn tip at max reach — the gore visibly LANDS
    // (keyed to actual extension so it fires AT the peak, ap≈0.52, not before it)
    if (atkExt > 0.7) {
      const ia = (atkExt - 0.7) / 0.3;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = s * 0.12 * ia;
      ctx.fillStyle = `rgba(255,242,205,${(ia * 0.75).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(tip.x, tip.y, s * (0.016 + 0.026 * ia), 0, Math.PI * 2); ctx.fill();
      for (let mi = 0; mi < 3; mi++) {
        const ma = -Math.PI * 0.5 + (mi - 1) * 0.55;
        ctx.fillStyle = `rgba(215,185,145,${(ia * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(tip.x + Math.cos(ma) * s * 0.055 * ia + dir * s * 0.03 * ia, tip.y + Math.sin(ma) * s * 0.055 * ia, s * 0.012 * ia, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  });

  // ── Defender armour: iron collars banding the horn bases ──
  if (_isDefender) {
    [-1, 1].forEach(side => {
      const bx = headCX + side * headW * 0.50, by = headCY - headH * 0.50;
      ctx.save();
      ctx.translate(bx, by); ctx.rotate(side * 0.62);
      const cg = ctx.createLinearGradient(-s * 0.06, 0, s * 0.06, 0);
      cg.addColorStop(0, '#2c2720'); cg.addColorStop(0.5, '#7a705a'); cg.addColorStop(1, '#2c2720');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.ellipse(0, s * 0.01, s * 0.060, s * 0.072, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a7038'; ctx.lineWidth = s * 0.009;
      ctx.beginPath(); ctx.ellipse(0, -s * 0.012, s * 0.056, s * 0.030, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, s * 0.030, s * 0.050, s * 0.028, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  ctx.restore();  // head rotation

  // ── Berserk rising heat embers/wisps off the shoulders ──
  if (_isBerserk) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = '#ff6010';
    for (let ei = 0; ei < 8; ei++) {
      const ph = (bTime * 0.5 + ei / 8) % 1;                          // 0 (spawn) → 1 (faded high)
      const ex2 = bX + Math.sin(ei * 2.3 + bTime * 0.8) * shW * (0.55 + ph * 0.4) + (ei - 3.5) * s * 0.025;
      const ey2 = bodyTop + s * 0.08 - ph * s * 0.62;
      const ea = (1 - ph) * 0.6;
      ctx.shadowBlur = s * 0.03;
      ctx.fillStyle = `rgba(255,${(140 + ph * 95) | 0},${(38 + ph * 40) | 0},${ea.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(ex2, ey2, s * (0.006 + (1 - ph) * 0.011), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headCY - headH * 1.45;
}
