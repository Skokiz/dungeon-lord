// ═══════════════════════════════════════════════════════════════════════════
//  DRAGON — рівень 20 (бос), здібність: breath (вогняне дихання)
//  Класичний квадрупед: арковане тіло, довга S-шия, масивна голова з рогами,
//  сегментований хвіст із шипами та стрілкою, крилата мембрана з кістками.
//  Хода — діагональний хід на 4 лапах. Атака: інхейл (шия дугою назад) →
//  ривок голови вперед → конус полум'я з іскрами → відновлення.
// ═══════════════════════════════════════════════════════════════════════════
function drawDragonMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._drLastT || _frameNow)) / 1000, 0.05);
  unit._drLastT = _frameNow;

  if (unit._drDir === undefined) {
    unit._drDir = 1; unit._drPrevX = cx;
    unit._drPrevAcd = unit.attackCooldown;
    unit._drT = 0; unit._drAp = 0;
    unit._drEmbers = Array.from({length: 14}, () => ({ life: Math.random() }));
  }
  if (Math.abs(cx - unit._drPrevX) > 0.2)
    unit._drDir = cx > unit._drPrevX ? 1 : -1;
  unit._drPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._drDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._drDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._drPrevAcd || 0) + 3) unit._drAp = 1.0;
  unit._drPrevAcd = acd;
  unit._drT += dt;

  const atkDur = Math.min(0.85, atkBase / 60 * 0.95);
  if (unit._drAp > 0) unit._drAp = Math.max(0, unit._drAp - dt / atkDur);

  const atkActive = unit._drAp > 0;
  const ap        = 1 - unit._drAp;
  const inFight   = unit.state === 'fight' || atkActive;
  const bTime = unit._drT;

  // ── Attack phases with easing ────────────────────────────────────
  // Inhale (slow wind-up: neck arches back, throat fills with glow) →
  // Thrust (fast: head snaps forward) →
  // Breathe (sustained flame cone) →
  // Recover (slow return).
  const AP_INHALE = 0.28;
  const AP_THRUST = 0.38;   // quick forward snap
  const AP_BREATHE = 0.76;  // sustained exhale
  let inhaleE = 0, thrustE = 0, breatheE = 0, recoverE = 0;
  if (atkActive) {
    if (ap < AP_INHALE) {
      const t = ap / AP_INHALE;
      inhaleE = 1 - Math.pow(1 - t, 2.2);
    } else if (ap < AP_THRUST) {
      const t = (ap - AP_INHALE) / (AP_THRUST - AP_INHALE);
      thrustE = Math.pow(t, 1.8);
      inhaleE = 1;                   // keep inhale posture briefly
    } else if (ap < AP_BREATHE) {
      const t = (ap - AP_THRUST) / (AP_BREATHE - AP_THRUST);
      breatheE = 1;
      thrustE = 1;
      // Slight oscillation for sustained breath
    } else {
      const t = (ap - AP_BREATHE) / (1 - AP_BREATHE);
      recoverE = 1 - Math.pow(1 - t, 2);
      breatheE = 1 - recoverE;
      thrustE = 1 - recoverE;
    }
  }

  const breathCD    = unit.breathCooldown || 480;
  const breathReady = breathCD < 16 || breathCD >= 470;

  // ── Walk cycle (diagonal gait, 4-legged) ─────────────────────────
  const isWalking = unit.state === 'move';
  const walkFreq  = 1.30;
  const walkPhase = isWalking ? ((bTime * walkFreq) % 1) : 0;
  // Body Y bob: subtle (heavy dragon doesn't bounce much)
  const walkBob = isWalking
    ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.020
    : 0;
  const walkSway = isWalking
    ? Math.sin(walkPhase * Math.PI * 2) * s * 0.008
    : 0;
  // Shoulder/hip roll with walk
  const walkShoulderTilt = isWalking ? Math.sin(walkPhase * Math.PI * 2) * 0.032 : 0;

  // Idle breathing
  const breatheY = Math.sin(bTime * 0.85) * s * 0.008;
  const idleHeadBob = Math.sin(bTime * 0.60) * s * 0.014;

  // ── Proportions (quadrupedal) ────────────────────────────────────
  const bodyH   = s * 0.32;
  const bodyLen = s * 0.92;                // total body length (shoulder-to-hip)
  const neckLen = s * 0.56;
  const tailLen = s * 1.05;
  const legH    = s * 0.30;
  const headW   = s * 0.25;
  const headH   = s * 0.26;

  // ── Positions ────────────────────────────────────────────────────
  const bX = cx + walkSway;
  const bodyCenterY = fY - legH - bodyH * 0.35 + walkBob + breatheY;
  const bodyTopY    = bodyCenterY - bodyH * 0.50;
  const bodyBotY    = bodyCenterY + bodyH * 0.50;

  const frontHipX = bX + dir * bodyLen * 0.38;    // shoulder socket
  const backHipX  = bX - dir * bodyLen * 0.38;    // hip socket

  // Neck base (top-front of body, slightly forward of shoulder socket)
  const neckBaseX = bX + dir * bodyLen * 0.44;
  const neckBaseY = bodyTopY + s * 0.02;

  // Neck end = head base. Attack moves head: inhale pulls UP-BACK, thrust pushes DOWN-FORWARD
  const neckEndDX = dir * neckLen * (0.55 - inhaleE * 0.25 + thrustE * 0.30);
  const neckEndDY = -neckLen * (0.80 + inhaleE * 0.12 - thrustE * 0.20);
  const headBaseX = neckBaseX + neckEndDX;
  const headBaseY = neckBaseY + neckEndDY;

  const headCX = headBaseX + dir * headW * 0.30 + (idleHeadBob * 0.8) * (1 - inhaleE - thrustE - recoverE);
  const headCY = headBaseY + idleHeadBob * 0.2;
  // Head rotation: snout up on inhale, forward-down on thrust
  const headRot = -inhaleE * 0.40 + thrustE * 0.28 - recoverE * 0.05;
  // Jaw open amount
  const jawOpen = inhaleE * s * 0.012 + thrustE * s * 0.045 + breatheE * s * 0.055;
  // Throat glow amount (builds during inhale, peaks during breathe)
  const throatGlow = inhaleE * 0.50 + thrustE * 0.80 + breatheE * (0.80 + Math.sin(bTime * 18) * 0.12);

  // Tail base
  const tailBaseX = bX - dir * bodyLen * 0.50;
  const tailBaseY = bodyBotY - s * 0.02;

  ctx.save();

  // ═══════════════════════════════════════════════════════════════
  // RENDER PIPELINE (back to front): shadow → far wing → tail →
  // far legs → body → near legs → belly highlight → neck → head →
  // near wing → fire breath
  // ═══════════════════════════════════════════════════════════════

  // ── 1. Ground shadow (stretched) ─────────────────────────────────
  ctx.fillStyle = 'rgba(30,0,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.015, bodyLen * 0.90, s * 0.078, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── 2. FAR WING (behind body, smaller/darker for depth) ──────────
  const wingBeat = isWalking
    ? Math.sin(walkPhase * Math.PI * 2) * 0.10
    : Math.sin(bTime * 0.70) * 0.06;
  // Far wing shoulder attaches at back-top of body
  const fwShX = bX - dir * s * 0.02;
  const fwShY = bodyTopY + s * 0.01;
  // Humerus → elbow (up-back)
  const fwElbX = fwShX - dir * s * 0.32;
  const fwElbY = fwShY - s * (0.48 + wingBeat * 0.06);
  // Finger tips (leading, middle, trailing)
  const fwTip1X = fwShX - dir * s * 0.68;                    // leading (highest)
  const fwTip1Y = fwShY - s * (0.62 + wingBeat * 0.12);
  const fwTip2X = fwShX - dir * s * 0.52;
  const fwTip2Y = fwShY - s * (0.28 + wingBeat * 0.05);
  const fwTip3X = fwShX - dir * s * 0.30;
  const fwTip3Y = fwShY + s * 0.06;
  // Membrane
  ctx.fillStyle = 'rgba(42,5,0,0.82)';
  ctx.beginPath();
  ctx.moveTo(fwShX, fwShY);
  ctx.quadraticCurveTo(fwElbX - s * 0.05, fwElbY - s * 0.04, fwTip1X, fwTip1Y);
  ctx.quadraticCurveTo(fwTip1X + dir * s * 0.06, fwElbY, fwTip2X, fwTip2Y);
  ctx.quadraticCurveTo(fwTip2X + dir * s * 0.05, (fwTip2Y + fwTip3Y) / 2, fwTip3X, fwTip3Y);
  ctx.quadraticCurveTo(fwShX - dir * s * 0.10, fwShY + s * 0.08, fwShX, fwShY);
  ctx.closePath();
  ctx.fill();
  // Wing bones (thin)
  ctx.strokeStyle = '#1a0200'; ctx.lineWidth = s * 0.014; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(fwShX, fwShY); ctx.quadraticCurveTo(fwElbX - s * 0.03, fwElbY - s * 0.03, fwTip1X, fwTip1Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fwElbX, fwElbY); ctx.lineTo(fwTip2X, fwTip2Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fwElbX, fwElbY); ctx.lineTo(fwTip3X, fwTip3Y); ctx.stroke();

  // ── 3. TAIL (long curving segmented, spiked, with arrowhead) ─────
  const tailSegs = 12;
  const tailPts = [];
  for (let ti = 0; ti <= tailSegs; ti++) {
    const t = ti / tailSegs;
    // X: from tail base extending -dir direction
    const x = tailBaseX - dir * tailLen * t;
    // Y: starts at tail base, curves down (gravity) + sin wave
    const arc = Math.sin(t * Math.PI * 0.65) * s * 0.10;                // sag downward
    const wave = Math.sin(t * Math.PI * 2.2 + bTime * 1.3 + (isWalking ? walkPhase * Math.PI * 2 : 0))
               * s * 0.07 * t;
    const y = tailBaseY + arc * 0.6 + wave - t * s * 0.02;              // slight lift at tip
    const w = s * (0.18 * (1 - t * 0.92));                              // tapers
    tailPts.push({ x, y, w });
  }
  // Tail main body — fill
  ctx.fillStyle = '#4a0e00';
  ctx.beginPath();
  ctx.moveTo(tailPts[0].x, tailPts[0].y - tailPts[0].w);
  for (let ti = 1; ti <= tailSegs; ti++) ctx.lineTo(tailPts[ti].x, tailPts[ti].y - tailPts[ti].w);
  const tip = tailPts[tailSegs];
  // Arrowhead extensions at tail tip
  ctx.lineTo(tip.x - dir * s * 0.04, tip.y - s * 0.06);
  ctx.lineTo(tip.x - dir * s * 0.13, tip.y);
  ctx.lineTo(tip.x - dir * s * 0.04, tip.y + s * 0.06);
  for (let ti = tailSegs; ti >= 0; ti--) ctx.lineTo(tailPts[ti].x, tailPts[ti].y + tailPts[ti].w);
  ctx.closePath();
  ctx.fill();
  // Tail mid tone (belly side)
  ctx.fillStyle = '#7a1800';
  ctx.beginPath();
  for (let ti = 0; ti <= tailSegs; ti++) {
    const p = tailPts[ti];
    if (ti === 0) ctx.moveTo(p.x, p.y - p.w * 0.35);
    else ctx.lineTo(p.x, p.y - p.w * 0.35);
  }
  for (let ti = tailSegs; ti >= 0; ti--) ctx.lineTo(tailPts[ti].x, tailPts[ti].y + tailPts[ti].w * 0.15);
  ctx.closePath();
  ctx.fill();
  // Belly highlight stripe
  ctx.fillStyle = '#a83a18';
  ctx.beginPath();
  for (let ti = 0; ti <= tailSegs; ti++) {
    const p = tailPts[ti];
    if (ti === 0) ctx.moveTo(p.x, p.y + p.w * 0.40);
    else ctx.lineTo(p.x, p.y + p.w * 0.40);
  }
  for (let ti = tailSegs; ti >= 0; ti--) ctx.lineTo(tailPts[ti].x, tailPts[ti].y + tailPts[ti].w * 0.85);
  ctx.closePath();
  ctx.fill();
  // Top spikes along tail
  ctx.fillStyle = '#1a0400';
  for (let ti = 0; ti < tailSegs; ti += 1) {
    const p = tailPts[ti];
    const spikeH = s * (0.045 + (ti % 2) * 0.015) * (1 - ti / tailSegs * 0.5);
    ctx.beginPath();
    ctx.moveTo(p.x - s * 0.015, p.y - p.w);
    ctx.lineTo(p.x + (ti % 2 === 0 ? s * 0.005 : -s * 0.005), p.y - p.w - spikeH);
    ctx.lineTo(p.x + s * 0.015, p.y - p.w);
    ctx.closePath();
    ctx.fill();
  }
  // Scale pattern on tail side
  ctx.strokeStyle = '#2a0600'; ctx.lineWidth = s * 0.005;
  for (let ti = 1; ti < tailSegs; ti += 2) {
    const p = tailPts[ti];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.w * 0.45, 0, Math.PI);
    ctx.stroke();
  }

  // ── 4. FAR LEGS (behind body, slightly offset) ───────────────────
  // Walk phase per leg (diagonal gait):
  //   near-front: 0, far-back: 0 (diagonal pair)
  //   near-back: 0.5, far-front: 0.5 (diagonal pair)
  const legState = (phaseOffset) => {
    if (!isWalking) return { liftY: 0, fwdX: 0, kneeX: 0, kneeY: 0 };
    const p = (walkPhase + phaseOffset) % 1;
    if (p < 0.5) {
      // Stance
      const t = p / 0.5;
      return {
        liftY: 0,
        fwdX: (0.5 - t) * 0.16 * s * dir,
        kneeX: 0,
        kneeY: Math.sin(t * Math.PI) * s * 0.006
      };
    }
    // Swing
    const t = (p - 0.5) / 0.5;
    return {
      liftY: Math.sin(t * Math.PI) * s * 0.050,
      fwdX: (-0.5 + t) * 0.16 * s * dir,
      kneeX: dir * Math.sin(t * Math.PI) * s * 0.018,
      kneeY: Math.sin(t * Math.PI) * s * 0.015
    };
  };
  const drawLeg = (hipX, hipY, zOffset, legPhase, scale) => {
    const ls = legState(legPhase);
    const kx = hipX + ls.kneeX + dir * s * 0.008 + zOffset.x;
    const ky = hipY + legH * 0.50 - ls.kneeY + zOffset.y;
    const fx = hipX + ls.fwdX + dir * s * 0.020 + zOffset.x;
    const fy = fY - s * 0.008 - ls.liftY + zOffset.y;

    ctx.lineCap = 'round';
    // Thigh (dark)
    ctx.strokeStyle = zOffset.far ? '#300700' : '#4a0e00';
    ctx.lineWidth = s * 0.200 * scale;
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kx, ky); ctx.stroke();
    // Shin
    ctx.strokeStyle = zOffset.far ? '#1a0400' : '#3d0a00';
    ctx.lineWidth = s * 0.145 * scale;
    ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    // Thigh highlight
    ctx.strokeStyle = zOffset.far ? '#5a1000' : '#7a2800';
    ctx.lineWidth = s * 0.080 * scale;
    ctx.beginPath(); ctx.moveTo(hipX + dir*s*0.020, hipY); ctx.lineTo(kx + dir*s*0.014, ky); ctx.stroke();
    // Knee scale (plate)
    ctx.fillStyle = zOffset.far ? '#2a0500' : '#4a1200';
    ctx.beginPath(); ctx.arc(kx, ky, s * 0.028 * scale, 0, Math.PI * 2); ctx.fill();
    // Foot (3 claws, stepped position)
    ctx.fillStyle = zOffset.far ? '#1a0400' : '#2a0600';
    ctx.beginPath();
    ctx.ellipse(fx, fy + s * 0.015, s * 0.080 * scale, s * 0.030 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Claws
    ctx.strokeStyle = zOffset.far ? '#4a1000' : '#6a1800'; ctx.lineWidth = s * 0.022 * scale;
    for (let ci = 0; ci < 3; ci++) {
      const cOff = (ci - 1) * s * 0.032;
      ctx.beginPath();
      ctx.moveTo(fx + cOff, fy + s * 0.020);
      ctx.lineTo(fx + cOff + dir * s * 0.010, fy + s * 0.045);
      ctx.stroke();
    }
  };

  // Far legs (smaller, darker)
  drawLeg(backHipX - dir * s * 0.02, bodyBotY - s * 0.005, { x: dir * s * 0.010, y: -s * 0.008, far: true }, 0.00, 0.88);   // far back
  drawLeg(frontHipX - dir * s * 0.02, bodyBotY - s * 0.005, { x: dir * s * 0.010, y: -s * 0.008, far: true }, 0.50, 0.88); // far front

  // ── 5. BODY (arched back, tapered belly, scaled) ─────────────────
  const shoulderHumpY = bodyTopY - s * 0.03;
  // Chest glow during attack
  if (inhaleE > 0 || breatheE > 0 || breathReady) {
    const cg = Math.max(inhaleE * 0.5, breatheE, breathReady ? 0.35 : 0);
    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = s * cg * 0.30;
  }
  // Dark base
  ctx.fillStyle = '#3d0a00';
  ctx.beginPath();
  // Top line: neck base → shoulder hump → mid-back → hip
  ctx.moveTo(neckBaseX, neckBaseY);
  ctx.bezierCurveTo(
    neckBaseX - dir * s * 0.03, shoulderHumpY - s * 0.02,
    bX + dir * bodyLen * 0.10, shoulderHumpY - s * 0.01,
    tailBaseX + dir * s * 0.03, bodyTopY + s * 0.04
  );
  // Back-hip curve down
  ctx.quadraticCurveTo(tailBaseX - dir * s * 0.02, bodyCenterY, tailBaseX + dir * s * 0.04, bodyBotY - s * 0.02);
  // Belly curve (sag downward)
  ctx.bezierCurveTo(
    bX - dir * bodyLen * 0.10, bodyBotY + s * 0.04,
    bX + dir * bodyLen * 0.15, bodyBotY + s * 0.05,
    neckBaseX - dir * s * 0.02, bodyBotY - s * 0.02
  );
  // Front curve up to neck base
  ctx.quadraticCurveTo(neckBaseX + dir * s * 0.02, bodyBotY - bodyH * 0.4, neckBaseX, neckBaseY);
  ctx.closePath(); ctx.fill();
  // Mid crimson layer (smaller inset)
  ctx.fillStyle = '#7a1800';
  ctx.beginPath();
  ctx.moveTo(neckBaseX - dir * s * 0.04, neckBaseY + s * 0.04);
  ctx.bezierCurveTo(
    neckBaseX - dir * s * 0.10, bodyTopY + s * 0.04,
    bX, bodyTopY + s * 0.04,
    tailBaseX + dir * s * 0.04, bodyTopY + s * 0.08
  );
  ctx.quadraticCurveTo(tailBaseX, bodyCenterY - s * 0.02, tailBaseX + dir * s * 0.02, bodyBotY - s * 0.05);
  ctx.bezierCurveTo(
    bX, bodyBotY - s * 0.01,
    bX + dir * s * 0.1, bodyBotY,
    neckBaseX - dir * s * 0.05, bodyBotY - s * 0.05
  );
  ctx.closePath(); ctx.fill();
  // Belly lighter (paler front-bottom, glows during breath)
  ctx.fillStyle = breatheE > 0 ? `rgba(${200 + breatheE * 55},${60 + breatheE * 60},${20 + breatheE * 30},1)` : '#a83a18';
  ctx.beginPath();
  ctx.moveTo(neckBaseX - dir * s * 0.06, bodyBotY - bodyH * 0.18);
  ctx.bezierCurveTo(
    bX - dir * bodyLen * 0.05, bodyBotY - s * 0.015,
    bX + dir * bodyLen * 0.10, bodyBotY - s * 0.020,
    tailBaseX + dir * s * 0.05, bodyBotY - bodyH * 0.15
  );
  ctx.lineTo(tailBaseX + dir * s * 0.06, bodyBotY - bodyH * 0.05);
  ctx.bezierCurveTo(
    bX + dir * bodyLen * 0.12, bodyBotY + s * 0.02,
    bX - dir * bodyLen * 0.06, bodyBotY + s * 0.02,
    neckBaseX - dir * s * 0.05, bodyBotY - bodyH * 0.08
  );
  ctx.closePath(); ctx.fill();
  // Belly scales (arcs across belly)
  ctx.strokeStyle = '#7a2800'; ctx.lineWidth = s * 0.009; ctx.lineCap = 'round';
  for (let bi = 0; bi < 5; bi++) {
    const bx = bX + (bi - 2) * bodyLen * 0.17;
    ctx.beginPath();
    ctx.arc(bx, bodyBotY - bodyH * 0.10, s * 0.075, 0, Math.PI);
    ctx.stroke();
  }
  // Scale pattern on side of body (rows of small arcs)
  ctx.strokeStyle = '#2a0600'; ctx.lineWidth = s * 0.007;
  for (let rowI = 0; rowI < 3; rowI++) {
    const ry = bodyTopY + bodyH * (0.18 + rowI * 0.22);
    for (let ci = 0; ci < 8; ci++) {
      const rx = tailBaseX + dir * (ci + 0.5) * bodyLen * 0.12 + (rowI % 2) * bodyLen * 0.06;
      if (Math.abs(rx - bX) > bodyLen * 0.44) continue;
      ctx.beginPath(); ctx.arc(rx, ry, s * 0.032, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Spine ridge of spikes along back
  ctx.fillStyle = '#1a0200';
  const spineSegs = 8;
  for (let si = 0; si < spineSegs; si++) {
    const t = si / (spineSegs - 1);
    // Interpolate along back top
    const sx = tailBaseX + dir * t * (neckBaseX - tailBaseX);
    // Back arch at shoulders
    const arc = 1 - Math.abs(t - 0.45) * 2.2;   // peaks near shoulder
    const sy = bodyTopY - s * 0.008 + (arc > 0 ? -arc * s * 0.030 : 0);
    const sh = s * (0.055 + (si % 2) * 0.014) * (0.7 + arc * 0.6);
    ctx.beginPath();
    ctx.moveTo(sx - s * 0.020, sy + s * 0.010);
    ctx.lineTo(sx + (si % 2 === 0 ? s * 0.004 : -s * 0.004), sy - sh);
    ctx.lineTo(sx + s * 0.020, sy + s * 0.010);
    ctx.closePath(); ctx.fill();
  }
  // Chest heart glow (central glowing spot — location of fire furnace inside)
  const heartX = bX + dir * bodyLen * 0.12;
  const heartY = bodyCenterY + bodyH * 0.10;
  const heartGlow = 0.55 + Math.sin(bTime * 2.0) * 0.20 + inhaleE * 0.60 + breatheE * 0.45;
  ctx.shadowColor = '#ff8800'; ctx.shadowBlur = s * heartGlow * 0.55;
  const hg = ctx.createRadialGradient(heartX, heartY, 0, heartX, heartY, s * 0.13);
  hg.addColorStop(0, `rgba(255,240,140,${heartGlow * 0.90})`);
  hg.addColorStop(0.5, `rgba(255,110,0,${heartGlow * 0.80})`);
  hg.addColorStop(1, 'rgba(200,20,0,0)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(heartX, heartY, s * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── 6. NEAR LEGS (full size, in front of body) ───────────────────
  drawLeg(backHipX, bodyBotY, { x: 0, y: 0, far: false }, 0.50, 1.00);   // near back
  drawLeg(frontHipX, bodyBotY, { x: 0, y: 0, far: false }, 0.00, 1.00);  // near front

  // ── 7. NECK (S-curve from shoulders to head) ─────────────────────
  // Neck has a main S-curve. Mid control point curves backward during inhale, forward during thrust
  const neckMidX = neckBaseX + dir * neckLen * (0.30 + thrustE * 0.08 - inhaleE * 0.08);
  const neckMidY = neckBaseY - neckLen * (0.35 + inhaleE * 0.12 - thrustE * 0.05);
  // Draw neck with thickness that tapers
  const neckSegs = 8;
  const neckPts = [];
  for (let ni = 0; ni <= neckSegs; ni++) {
    const t = ni / neckSegs;
    // Quadratic bezier
    const omt = 1 - t;
    const nx = omt * omt * neckBaseX + 2 * omt * t * neckMidX + t * t * headBaseX;
    const ny = omt * omt * neckBaseY + 2 * omt * t * neckMidY + t * t * headBaseY;
    // Thickness tapers from 0.17 at base to 0.095 at head
    const nw = s * (0.17 - t * 0.07);
    // Perpendicular normal (for offsetting top/bottom)
    const dx = 2 * omt * (neckMidX - neckBaseX) + 2 * t * (headBaseX - neckMidX);
    const dy = 2 * omt * (neckMidY - neckBaseY) + 2 * t * (headBaseY - neckMidY);
    const dl = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = -dy / dl, py = dx / dl;
    neckPts.push({ x: nx, y: ny, w: nw, px, py });
  }
  // Fill neck (top edge → bottom edge)
  ctx.fillStyle = '#3d0a00';
  ctx.beginPath();
  ctx.moveTo(neckPts[0].x + neckPts[0].px * neckPts[0].w, neckPts[0].y + neckPts[0].py * neckPts[0].w);
  for (let ni = 1; ni <= neckSegs; ni++) {
    const p = neckPts[ni];
    ctx.lineTo(p.x + p.px * p.w, p.y + p.py * p.w);
  }
  for (let ni = neckSegs; ni >= 0; ni--) {
    const p = neckPts[ni];
    ctx.lineTo(p.x - p.px * p.w, p.y - p.py * p.w);
  }
  ctx.closePath(); ctx.fill();
  // Neck mid tone (upper)
  ctx.fillStyle = '#7a1800';
  ctx.beginPath();
  ctx.moveTo(neckPts[0].x + neckPts[0].px * neckPts[0].w * 0.35, neckPts[0].y + neckPts[0].py * neckPts[0].w * 0.35);
  for (let ni = 1; ni <= neckSegs; ni++) {
    const p = neckPts[ni];
    ctx.lineTo(p.x + p.px * p.w * 0.35, p.y + p.py * p.w * 0.35);
  }
  for (let ni = neckSegs; ni >= 0; ni--) {
    const p = neckPts[ni];
    ctx.lineTo(p.x - p.px * p.w * 0.80, p.y - p.py * p.w * 0.80);
  }
  ctx.closePath(); ctx.fill();
  // Belly stripe on neck (underside, lighter)
  ctx.fillStyle = '#a83a18';
  ctx.beginPath();
  ctx.moveTo(neckPts[0].x - neckPts[0].px * neckPts[0].w * 0.55, neckPts[0].y - neckPts[0].py * neckPts[0].w * 0.55);
  for (let ni = 1; ni <= neckSegs; ni++) {
    const p = neckPts[ni];
    ctx.lineTo(p.x - p.px * p.w * 0.55, p.y - p.py * p.w * 0.55);
  }
  for (let ni = neckSegs; ni >= 0; ni--) {
    const p = neckPts[ni];
    ctx.lineTo(p.x - p.px * p.w * 0.92, p.y - p.py * p.w * 0.92);
  }
  ctx.closePath(); ctx.fill();
  // Neck spikes (running along top)
  ctx.fillStyle = '#1a0200';
  for (let ni = 0; ni < neckSegs; ni++) {
    const p = neckPts[ni];
    const sH = s * 0.038 * (1 - ni / neckSegs * 0.4);
    ctx.beginPath();
    ctx.moveTo(p.x + p.px * p.w - p.px * s * 0.001, p.y + p.py * p.w - p.py * s * 0.001);
    ctx.lineTo(p.x + p.px * (p.w + sH) + (ni % 2 === 0 ? 1 : -1) * dir * s * 0.005,
               p.y + p.py * (p.w + sH));
    ctx.lineTo(p.x + p.px * p.w + p.px * s * 0.001, p.y + p.py * p.w + p.py * s * 0.001);
    ctx.closePath(); ctx.fill();
  }
  // Underside belly scales
  ctx.strokeStyle = '#7a2800'; ctx.lineWidth = s * 0.006;
  for (let ni = 1; ni < neckSegs; ni += 2) {
    const p = neckPts[ni];
    ctx.beginPath();
    ctx.moveTo(p.x - p.px * p.w * 0.70 - p.py * s * 0.025, p.y - p.py * p.w * 0.70 + p.px * s * 0.025);
    ctx.lineTo(p.x - p.px * p.w * 0.70 + p.py * s * 0.025, p.y - p.py * p.w * 0.70 - p.px * s * 0.025);
    ctx.stroke();
  }

  // ── 8. HEAD (rotated by headRot, detailed) ───────────────────────
  ctx.save();
  ctx.translate(headCX, headCY);
  ctx.rotate(headRot * dir);
  const lx = 0, ly = 0;   // local coords (since we translated)
  // Upper skull (elongated oval)
  if (inFight) {
    ctx.shadowColor = breatheE > 0 ? '#ffaa00' : '#cc2200';
    ctx.shadowBlur = s * (breatheE > 0 ? 0.55 : 0.22);
  }
  // Dark base head
  ctx.fillStyle = '#4a0e00';
  ctx.beginPath();
  ctx.moveTo(lx - dir * headW * 0.60, ly + headH * 0.20);
  ctx.quadraticCurveTo(lx - dir * headW * 0.78, ly - headH * 0.50, lx - dir * headW * 0.20, ly - headH * 0.85);
  ctx.quadraticCurveTo(lx + dir * headW * 0.50, ly - headH * 0.92, lx + dir * headW * 1.00, ly - headH * 0.30);
  ctx.quadraticCurveTo(lx + dir * headW * 1.22, ly + headH * 0.10, lx + dir * headW * 1.05, ly + headH * 0.22);
  ctx.lineTo(lx - dir * headW * 0.25, ly + headH * 0.22);
  ctx.closePath(); ctx.fill();
  // Lower jaw (hinged at back, opens with jawOpen)
  ctx.fillStyle = '#3d0a00';
  ctx.beginPath();
  ctx.moveTo(lx - dir * headW * 0.20, ly + headH * 0.20);
  ctx.quadraticCurveTo(lx + dir * headW * 0.30, ly + headH * 0.48 + jawOpen, lx + dir * headW * 0.98, ly + headH * 0.30 + jawOpen);
  ctx.lineTo(lx + dir * headW * 1.22, ly + headH * 0.28 + jawOpen);
  ctx.lineTo(lx + dir * headW * 1.22, ly + headH * 0.18);
  ctx.quadraticCurveTo(lx + dir * headW * 0.55, ly + headH * 0.30, lx - dir * headW * 0.20, ly + headH * 0.22);
  ctx.closePath(); ctx.fill();
  // Lower jaw belly
  ctx.fillStyle = '#7a2800';
  ctx.beginPath();
  ctx.ellipse(lx + dir * headW * 0.45, ly + headH * 0.38 + jawOpen * 0.6,
              headW * 0.50, headH * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  // Mid tone upper head
  ctx.fillStyle = '#7a2800';
  ctx.beginPath();
  ctx.moveTo(lx - dir * headW * 0.40, ly + headH * 0.10);
  ctx.quadraticCurveTo(lx - dir * headW * 0.55, ly - headH * 0.40, lx - dir * headW * 0.10, ly - headH * 0.70);
  ctx.quadraticCurveTo(lx + dir * headW * 0.40, ly - headH * 0.75, lx + dir * headW * 0.90, ly - headH * 0.20);
  ctx.quadraticCurveTo(lx + dir * headW * 1.00, ly + headH * 0.05, lx + dir * headW * 0.85, ly + headH * 0.12);
  ctx.lineTo(lx - dir * headW * 0.10, ly + headH * 0.10);
  ctx.closePath(); ctx.fill();
  // Teeth (upper row)
  ctx.fillStyle = '#e8dcb4';
  for (let ti = 0; ti < 5; ti++) {
    const tx = lx + dir * headW * (-0.05 + ti * 0.22);
    ctx.beginPath();
    ctx.moveTo(tx - s * 0.012, ly + headH * 0.20);
    ctx.lineTo(tx, ly + headH * 0.20 + s * 0.035);
    ctx.lineTo(tx + s * 0.012, ly + headH * 0.20);
    ctx.closePath(); ctx.fill();
  }
  // Front fangs
  ctx.beginPath();
  ctx.moveTo(lx + dir * headW * 0.98, ly + headH * 0.20);
  ctx.lineTo(lx + dir * headW * 1.02, ly + headH * 0.20 + s * 0.060);
  ctx.lineTo(lx + dir * headW * 1.06, ly + headH * 0.20);
  ctx.closePath(); ctx.fill();
  // Lower teeth (visible when mouth open)
  if (jawOpen > s * 0.010) {
    ctx.fillStyle = '#d8cba0';
    for (let ti = 0; ti < 5; ti++) {
      const tx = lx + dir * headW * (-0.02 + ti * 0.22);
      ctx.beginPath();
      ctx.moveTo(tx - s * 0.010, ly + headH * 0.30 + jawOpen);
      ctx.lineTo(tx, ly + headH * 0.30 + jawOpen - s * 0.028);
      ctx.lineTo(tx + s * 0.010, ly + headH * 0.30 + jawOpen);
      ctx.closePath(); ctx.fill();
    }
  }
  // Throat glow inside open mouth (when charging/breathing)
  if (throatGlow > 0.05) {
    const tgX = lx + dir * headW * 0.55;
    const tgY = ly + headH * 0.28 + jawOpen * 0.4;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = s * throatGlow * 0.55;
    const tg = ctx.createRadialGradient(tgX, tgY, 0, tgX, tgY, s * 0.080);
    tg.addColorStop(0, `rgba(255,240,140,${throatGlow * 0.95})`);
    tg.addColorStop(0.5, `rgba(255,100,0,${throatGlow * 0.85})`);
    tg.addColorStop(1, 'rgba(180,20,0,0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.ellipse(tgX, tgY, s * 0.080, s * 0.036 + jawOpen * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  // Horns (4, varying sizes, swept back)
  const hornConfigs = [
    { bx: -0.10, by: -0.72, len: 0.40, ang: -Math.PI * 0.25 },
    { bx:  0.10, by: -0.80, len: 0.45, ang: -Math.PI * 0.32 },
    { bx:  0.30, by: -0.72, len: 0.34, ang: -Math.PI * 0.20 },
    { bx:  0.48, by: -0.60, len: 0.26, ang: -Math.PI * 0.14 }
  ];
  hornConfigs.forEach(h => {
    const hbx = lx + dir * headW * h.bx;
    const hby = ly + headH * h.by;
    // Horn sweeps -dir (backward)
    const hMx = hbx - dir * s * (0.05 + h.len * 0.3);
    const hMy = hby + Math.cos(h.ang) * s * h.len * 0.4 - s * h.len * 0.25;
    const hTx = hbx - dir * s * h.len * 0.85;
    const hTy = hby - s * h.len * 0.5;
    // Dark base
    ctx.strokeStyle = '#1a0200'; ctx.lineWidth = s * (0.055 - h.len * 0.02); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hbx, hby); ctx.quadraticCurveTo(hMx, hMy, hTx, hTy); ctx.stroke();
    // Mid tone
    ctx.strokeStyle = '#3a1400'; ctx.lineWidth = s * (0.030 - h.len * 0.01);
    ctx.beginPath(); ctx.moveTo(hbx + dir * s * 0.004, hby); ctx.quadraticCurveTo(hMx + dir * s * 0.004, hMy, hTx + dir * s * 0.004, hTy); ctx.stroke();
  });
  // Eye socket + eye (yellow, angry)
  const eyeCX = lx + dir * headW * 0.30;
  const eyeCY = ly - headH * 0.26;
  const eyeRr = headH * 0.11;
  ctx.shadowColor = breatheE > 0 ? '#ffcc00' : '#ff4400';
  ctx.shadowBlur = s * (breatheE > 0 ? 0.42 : inFight ? 0.28 : 0.14);
  // Black socket
  ctx.fillStyle = '#100200';
  ctx.beginPath(); ctx.arc(eyeCX, eyeCY, eyeRr * 1.35, 0, Math.PI * 2); ctx.fill();
  // Yellow iris
  ctx.fillStyle = breatheE > 0 ? '#ffdd55' : (inFight ? '#ff8800' : '#dd4400');
  ctx.beginPath(); ctx.arc(eyeCX, eyeCY, eyeRr, 0, Math.PI * 2); ctx.fill();
  // Vertical slit pupil
  ctx.fillStyle = '#0a0000';
  ctx.beginPath();
  ctx.ellipse(eyeCX + dir * eyeRr * 0.10, eyeCY, eyeRr * 0.20, eyeRr * 0.88, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,180,0.60)';
  ctx.beginPath(); ctx.arc(eyeCX - eyeRr * 0.30, eyeCY - eyeRr * 0.30, eyeRr * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Brow ridge (furious)
  ctx.strokeStyle = '#1a0200'; ctx.lineWidth = s * 0.014; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(eyeCX - dir * eyeRr * 1.35, eyeCY - eyeRr * 0.85);
  ctx.lineTo(eyeCX + dir * eyeRr * 1.15, eyeCY - eyeRr * 1.30);
  ctx.stroke();
  // Nostril
  ctx.fillStyle = '#0a0200';
  ctx.beginPath();
  ctx.ellipse(lx + dir * headW * 0.88, ly - headH * 0.05, headW * 0.05, headH * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  // Small ear-fin above eye
  ctx.fillStyle = '#3a1400';
  ctx.beginPath();
  ctx.moveTo(lx + dir * headW * 0.05, ly - headH * 0.50);
  ctx.lineTo(lx - dir * headW * 0.08, ly - headH * 0.92);
  ctx.lineTo(lx + dir * headW * 0.18, ly - headH * 0.75);
  ctx.closePath(); ctx.fill();
  // Smoke puffs from nostril when idle/charging
  if (breathReady || inhaleE > 0.2) {
    const puff = inhaleE > 0 ? inhaleE : 0.3;
    ctx.fillStyle = `rgba(200,150,120,${puff * 0.40})`;
    ctx.beginPath();
    ctx.arc(lx + dir * headW * (1.10 + (1 - (bTime % 1)) * 0.30),
            ly - headH * 0.10 - (1 - (bTime % 1)) * s * 0.05,
            s * 0.024, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();   // head rotation

  // ── 9. NEAR WING (over body, large with full bone detail) ────────
  const nwShX = neckBaseX - dir * s * 0.04;
  const nwShY = bodyTopY - s * 0.010;
  const nwBeat = isWalking
    ? Math.sin(walkPhase * Math.PI * 2) * 0.15
    : Math.sin(bTime * 0.70 + 0.4) * 0.08;
  // Bones
  const nwElbX = nwShX - dir * s * 0.40;
  const nwElbY = nwShY - s * (0.58 + nwBeat * 0.08);
  const nwTip1X = nwShX - dir * s * 0.82;                     // leading edge
  const nwTip1Y = nwShY - s * (0.78 + nwBeat * 0.18);
  const nwTip2X = nwShX - dir * s * 0.68;
  const nwTip2Y = nwShY - s * (0.38 + nwBeat * 0.05);
  const nwTip3X = nwShX - dir * s * 0.42;
  const nwTip3Y = nwShY + s * 0.02;
  const nwBodyAttachX = nwShX + dir * s * 0.02;
  const nwBodyAttachY = nwShY + s * 0.12;
  // Membrane (dark red)
  ctx.fillStyle = '#3d0a00';
  ctx.beginPath();
  ctx.moveTo(nwShX, nwShY);
  ctx.quadraticCurveTo(nwElbX - s * 0.04, nwElbY - s * 0.04, nwTip1X, nwTip1Y);
  ctx.quadraticCurveTo(nwTip1X + dir * s * 0.06, (nwTip1Y + nwTip2Y) / 2, nwTip2X, nwTip2Y);
  ctx.quadraticCurveTo(nwTip2X + dir * s * 0.06, (nwTip2Y + nwTip3Y) / 2, nwTip3X, nwTip3Y);
  ctx.quadraticCurveTo(nwBodyAttachX - dir * s * 0.06, nwBodyAttachY, nwBodyAttachX, nwBodyAttachY);
  ctx.closePath();
  ctx.fill();
  // Membrane mid tone (subtle)
  ctx.fillStyle = 'rgba(122,24,0,0.60)';
  ctx.beginPath();
  ctx.moveTo(nwShX, nwShY + s * 0.03);
  ctx.quadraticCurveTo(nwElbX, nwElbY, (nwElbX + nwTip2X) / 2, (nwElbY + nwTip2Y) / 2);
  ctx.lineTo(nwTip3X, nwTip3Y);
  ctx.quadraticCurveTo(nwBodyAttachX, nwBodyAttachY, nwShX, nwShY + s * 0.03);
  ctx.closePath();
  ctx.fill();
  // Bones
  ctx.strokeStyle = '#1a0200'; ctx.lineWidth = s * 0.024; ctx.lineCap = 'round';
  // Humerus
  ctx.beginPath();
  ctx.moveTo(nwShX, nwShY);
  ctx.quadraticCurveTo(nwElbX - s * 0.02, nwElbY - s * 0.02, nwElbX, nwElbY);
  ctx.stroke();
  // Fingers from elbow
  [{ x: nwTip1X, y: nwTip1Y }, { x: nwTip2X, y: nwTip2Y }, { x: nwTip3X, y: nwTip3Y }].forEach(tip => {
    ctx.beginPath(); ctx.moveTo(nwElbX, nwElbY); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  });
  // Bone highlight
  ctx.strokeStyle = '#4a1200'; ctx.lineWidth = s * 0.010;
  ctx.beginPath();
  ctx.moveTo(nwShX + s * 0.004, nwShY - s * 0.006);
  ctx.quadraticCurveTo(nwElbX, nwElbY - s * 0.010, nwTip1X + dir * s * 0.008, nwTip1Y + s * 0.008);
  ctx.stroke();
  // Finger claws
  ctx.fillStyle = '#1a0200';
  [{ x: nwTip1X, y: nwTip1Y }, { x: nwTip2X, y: nwTip2Y }].forEach(tip => {
    ctx.beginPath(); ctx.arc(tip.x, tip.y, s * 0.020, 0, Math.PI * 2); ctx.fill();
  });
  // Elbow claw (thumb)
  ctx.beginPath();
  ctx.moveTo(nwElbX, nwElbY);
  ctx.lineTo(nwElbX - dir * s * 0.035, nwElbY - s * 0.012);
  ctx.lineTo(nwElbX, nwElbY + s * 0.018);
  ctx.closePath(); ctx.fill();

  // ── 10. FIRE BREATH (cone from mouth during breatheE phase) ──────
  if (thrustE > 0 || breatheE > 0) {
    const bAlpha = breatheE > 0 ? 1 : thrustE * 0.6;
    if (bAlpha > 0) {
      // Mouth position in world space (head is rotated, but mouth is roughly here)
      const mouthLocalX = dir * headW * 1.20;
      const mouthLocalY = headH * 0.25 + jawOpen * 0.5;
      // Rotate local mouth point back to world
      const mouthAngle = headRot * dir;
      const mcos = Math.cos(mouthAngle), msin = Math.sin(mouthAngle);
      const mouthX = headCX + mouthLocalX * mcos - mouthLocalY * msin;
      const mouthY = headCY + mouthLocalX * msin + mouthLocalY * mcos;
      // Breath direction aligned with head forward
      const fwdX = Math.cos(mouthAngle) * dir;
      const fwdY = Math.sin(mouthAngle) * dir;
      const breathLen = s * (1.2 + breatheE * 1.6);
      const breathWide = s * (0.2 + breatheE * 0.35);

      // Outer dark red cone
      ctx.fillStyle = `rgba(180,50,0,${bAlpha * 0.50})`;
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      const e1x = mouthX + fwdX * breathLen;
      const e1y = mouthY + fwdY * breathLen;
      // Perpendicular for cone width
      const perpX = -fwdY, perpY = fwdX;
      ctx.quadraticCurveTo(
        mouthX + fwdX * breathLen * 0.5 + perpX * breathWide * 0.9,
        mouthY + fwdY * breathLen * 0.5 + perpY * breathWide * 0.9,
        e1x + perpX * breathWide * 0.3, e1y + perpY * breathWide * 0.3
      );
      ctx.lineTo(e1x - perpX * breathWide * 0.3, e1y - perpY * breathWide * 0.3);
      ctx.quadraticCurveTo(
        mouthX + fwdX * breathLen * 0.5 - perpX * breathWide * 0.9,
        mouthY + fwdY * breathLen * 0.5 - perpY * breathWide * 0.9,
        mouthX, mouthY
      );
      ctx.closePath(); ctx.fill();
      // Mid orange cone
      ctx.fillStyle = `rgba(255,100,0,${bAlpha * 0.76})`;
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      ctx.quadraticCurveTo(
        mouthX + fwdX * breathLen * 0.5 + perpX * breathWide * 0.55,
        mouthY + fwdY * breathLen * 0.5 + perpY * breathWide * 0.55,
        e1x + perpX * breathWide * 0.15, e1y + perpY * breathWide * 0.15
      );
      ctx.lineTo(e1x - perpX * breathWide * 0.15, e1y - perpY * breathWide * 0.15);
      ctx.quadraticCurveTo(
        mouthX + fwdX * breathLen * 0.5 - perpX * breathWide * 0.55,
        mouthY + fwdY * breathLen * 0.5 - perpY * breathWide * 0.55,
        mouthX, mouthY
      );
      ctx.closePath(); ctx.fill();
      // Inner bright yellow core jet
      ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = s * 0.42 * bAlpha;
      const jg = ctx.createLinearGradient(mouthX, mouthY, e1x, e1y);
      jg.addColorStop(0, `rgba(255,240,120,${bAlpha * 0.96})`);
      jg.addColorStop(0.5, `rgba(255,140,0,${bAlpha * 0.82})`);
      jg.addColorStop(1, 'rgba(200,60,0,0)');
      ctx.strokeStyle = jg; ctx.lineWidth = s * 0.068; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      ctx.lineTo(e1x, e1y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ember particles inside cone
      unit._drEmbers.forEach((em, ei) => {
        em.life = ((unit._drT * 3 + ei * 0.17) % 1);
        const eT = em.life;
        const ePos = eT;
        const eX = mouthX + fwdX * ePos * breathLen;
        const eY = mouthY + fwdY * ePos * breathLen;
        const eSpread = (Math.sin(ei + bTime * 5) * breathWide * ePos * 0.7);
        const eXp = eX + perpX * eSpread;
        const eYp = eY + perpY * eSpread;
        const eSize = s * 0.018 * (1 - eT * 0.7);
        const eAlpha = (1 - eT) * bAlpha * 0.90;
        ctx.fillStyle = `rgba(255,${Math.floor(200 + eT * 55)},${Math.floor(40 + eT * 120)},${eAlpha})`;
        ctx.beginPath(); ctx.arc(eXp, eYp, eSize, 0, Math.PI * 2); ctx.fill();
      });
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _drBranch = unit._branch || '';
  if (_drBranch === 'A') {
    // Inferno: embers rising from spine + heart-glow intensification + fire shimmer
    ctx.save();
    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = s * 0.18;
    for (let i = 0; i < 6; i++) {
      const _ep = ((_frameNow * 0.0007 + i * 0.17) % 1.0);
      const _ex = bX - dir * bodyLen * (0.30 - i * 0.10) + Math.sin(_frameNow*0.0012 + i*1.2)*s*0.04;
      const _ey = bodyTopY - _ep * s * 0.55;
      const _ea = (1 - _ep) * 0.55;
      const _er = s * (0.022 - _ep * 0.016);
      if (_er > 0) {
        ctx.fillStyle = `rgba(255,${Math.floor(100 + _ep * 120)},0,${_ea})`;
        ctx.beginPath(); ctx.arc(_ex, _ey, _er, 0, Math.PI*2); ctx.fill();
      }
    }
    // Intensified heart glow pulse
    ctx.shadowColor = '#ff4400'; ctx.shadowBlur = s * 0.45;
    const _hg2 = ctx.createRadialGradient(heartX, heartY, 0, heartX, heartY, s * 0.22);
    _hg2.addColorStop(0,   'rgba(255,255,140,0.55)');
    _hg2.addColorStop(0.5, 'rgba(255,80,0,0.32)');
    _hg2.addColorStop(1,   'rgba(200,20,0,0)');
    ctx.fillStyle = _hg2;
    ctx.beginPath(); ctx.arc(heartX, heartY, s * 0.22, 0, Math.PI*2); ctx.fill();
    // Scale shimmer stripe (orange diagonal)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,120,0,0.20)'; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bX - dir*bodyLen*0.38, bodyCenterY - bodyH*0.15);
    ctx.lineTo(bX + dir*bodyLen*0.28, bodyTopY + s*0.04);
    ctx.stroke();
    ctx.restore();

  } else if (_drBranch === 'B') {
    // Frost: ice crystal spines + idle cloud + ICE BREATH replaces fire during attack
    ctx.save();
    ctx.shadowColor = '#88ddff'; ctx.shadowBlur = s * 0.15;
    // Ice crystal spines along back (larger than base, alternating sizes)
    for (let i = 0; i < 6; i++) {
      const _ix = bX - dir*bodyLen*(0.35 - i*0.12);
      const _iy = bodyTopY - s * 0.005;
      const _ih = s * (0.095 + Math.abs(Math.sin(i * 1.4 + 0.3)) * 0.065);
      ctx.fillStyle = i%2===0 ? 'rgba(200,238,255,0.78)' : 'rgba(140,210,255,0.60)';
      ctx.strokeStyle = 'rgba(100,180,255,0.55)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(_ix, _iy - _ih);
      ctx.lineTo(_ix - s*0.018, _iy + s*0.010);
      ctx.lineTo(_ix + s*0.018, _iy + s*0.010);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Secondary small crystal beside main
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(180,230,255,0.40)';
        ctx.beginPath();
        ctx.moveTo(_ix + dir*s*0.025, _iy - _ih*0.60);
        ctx.lineTo(_ix + dir*s*0.013, _iy + s*0.006);
        ctx.lineTo(_ix + dir*s*0.037, _iy + s*0.006);
        ctx.closePath(); ctx.fill();
      }
    }
    // Idle frost breath cloud at mouth
    const _fc = 0.28 + Math.sin(_frameNow * 0.0018) * 0.09;
    ctx.fillStyle = `rgba(190,235,255,${_fc})`;
    ctx.beginPath(); ctx.ellipse(headCX + dir*s*0.30, headBaseY + s*0.04, s*0.16, s*0.065, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // ── ICE BREATH cone drawn over fire breath during attack ──────────
    if (thrustE > 0 || breatheE > 0) {
      const _bAlpha = breatheE > 0 ? 1 : thrustE * 0.6;
      if (_bAlpha > 0) {
        // Mouth position (same formula as base breath section)
        const _mLA  = dir * headW * 1.20;
        const _mLB  = headH * 0.25 + jawOpen * 0.5;
        const _mAng = headRot * dir;
        const _mc   = Math.cos(_mAng), _ms = Math.sin(_mAng);
        const _mX   = headCX + _mLA * _mc - _mLB * _ms;
        const _mY   = headCY + _mLA * _ms + _mLB * _mc;
        const _bLen  = s * (1.2 + breatheE * 1.6);
        const _bWide = s * (0.2 + breatheE * 0.35);
        const _fwdX  = _mc * dir, _fwdY = _ms * dir;
        const _e1x   = _mX + _fwdX * _bLen, _e1y = _mY + _fwdY * _bLen;
        const _pX    = -_fwdY, _pY = _fwdX;

        // Outer deep-blue cone (fully covers fire cone)
        ctx.fillStyle = `rgba(20,80,200,${_bAlpha * 0.70})`;
        ctx.beginPath(); ctx.moveTo(_mX, _mY);
        ctx.quadraticCurveTo(
          _mX + _fwdX*_bLen*0.5 + _pX*_bWide*0.9, _mY + _fwdY*_bLen*0.5 + _pY*_bWide*0.9,
          _e1x + _pX*_bWide*0.3, _e1y + _pY*_bWide*0.3
        );
        ctx.lineTo(_e1x - _pX*_bWide*0.3, _e1y - _pY*_bWide*0.3);
        ctx.quadraticCurveTo(
          _mX + _fwdX*_bLen*0.5 - _pX*_bWide*0.9, _mY + _fwdY*_bLen*0.5 - _pY*_bWide*0.9,
          _mX, _mY
        );
        ctx.closePath(); ctx.fill();

        // Mid pale-blue cone
        ctx.fillStyle = `rgba(140,215,255,${_bAlpha * 0.82})`;
        ctx.beginPath(); ctx.moveTo(_mX, _mY);
        ctx.quadraticCurveTo(
          _mX + _fwdX*_bLen*0.5 + _pX*_bWide*0.55, _mY + _fwdY*_bLen*0.5 + _pY*_bWide*0.55,
          _e1x + _pX*_bWide*0.15, _e1y + _pY*_bWide*0.15
        );
        ctx.lineTo(_e1x - _pX*_bWide*0.15, _e1y - _pY*_bWide*0.15);
        ctx.quadraticCurveTo(
          _mX + _fwdX*_bLen*0.5 - _pX*_bWide*0.55, _mY + _fwdY*_bLen*0.5 - _pY*_bWide*0.55,
          _mX, _mY
        );
        ctx.closePath(); ctx.fill();

        // Inner bright ice-white core jet
        ctx.shadowColor = '#ccf0ff'; ctx.shadowBlur = s * 0.42 * _bAlpha;
        const _ijg = ctx.createLinearGradient(_mX, _mY, _e1x, _e1y);
        _ijg.addColorStop(0,   `rgba(245,252,255,${_bAlpha * 0.96})`);
        _ijg.addColorStop(0.5, `rgba(180,235,255,${_bAlpha * 0.84})`);
        _ijg.addColorStop(1,   'rgba(80,160,255,0)');
        ctx.strokeStyle = _ijg; ctx.lineWidth = s * 0.068; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(_mX, _mY); ctx.lineTo(_e1x, _e1y); ctx.stroke();
        ctx.shadowBlur = 0;

        // Ice crystal shards (replace embers)
        for (let ii = 0; ii < 10; ii++) {
          const _iT   = ((_frameNow * 0.003 + ii * 0.10) % 1.0);
          const _iX   = _mX + _fwdX * _iT * _bLen;
          const _iY   = _mY + _fwdY * _iT * _bLen;
          const _iSpr = Math.sin(ii * 1.7 + bTime * 3) * _bWide * _iT * 0.65;
          const _iXp  = _iX + _pX * _iSpr, _iYp = _iY + _pY * _iSpr;
          const _iSz  = s * 0.015 * (1 - _iT * 0.65);
          const _iAlp = (1 - _iT) * _bAlpha * 0.90;
          ctx.fillStyle = `rgba(${Math.floor(200 + _iT*55)},${Math.floor(228 + _iT*27)},255,${_iAlp})`;
          ctx.beginPath(); ctx.arc(_iXp, _iYp, _iSz, 0, Math.PI*2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headBaseY - s * 0.35;
}
