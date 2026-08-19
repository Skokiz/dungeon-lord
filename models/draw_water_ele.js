// ═══════════════════════════════════════════════════════════════════════════
//  WATER ELEMENTAL — рівень 11, здібність: absorb (щит поглинає урон)
//  Тіло-водоспад: брижі котяться ВНИЗ, велика калюжа, падаючі краплі.
// ═══════════════════════════════════════════════════════════════════════════
function drawWaterEleMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._weLastT || _frameNow)) / 1000, 0.05);
  unit._weLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._weDir === undefined) {
    unit._weDir = 1; unit._wePrevX = cx;
    unit._wePrevAcd = unit.attackCooldown;
    unit._weT = 0; unit._weAp = 0; unit._weAbsorbT = 0; unit._weMove = 0;
    unit._weDrops = Array.from({length: 6}, () => ({
      side:  Math.random() < 0.5 ? -1 : 1,
      y:     Math.random(),
      speed: 0.35 + Math.random() * 0.30,
      size:  0.7 + Math.random() * 0.5
    }));
    unit._weSplashes = Array.from({length: 4}, () => ({
      life: Math.random(),
      vx:   (Math.random() - 0.5) * 0.6,
      vy:   -0.5 - Math.random() * 0.4,
      off:  (Math.random() - 0.5) * 0.6
    }));
  }
  const moveDx = cx - unit._wePrevX;
  if (Math.abs(moveDx) > 0.2)
    unit._weDir = moveDx > 0 ? 1 : -1;
  unit._wePrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._weDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._weDir;
  const moveTarget = unit.state === 'move' ? 1 : 0;
  unit._weMove += (moveTarget - unit._weMove) * Math.min(1, dt * 8);

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._wePrevAcd || 0) + 3) unit._weAp = 1.0;
  unit._wePrevAcd = acd;
  if (unit.absorbActive) { unit._weAbsorbT = 1.0; unit.absorbActive = false; }
  unit._weT += dt;

  const atkDur = Math.min(0.58, atkBase / 60 * 0.75);
  if (unit._weAp > 0)     unit._weAp     = Math.max(0, unit._weAp     - dt / atkDur);
  if (unit._weAbsorbT > 0) unit._weAbsorbT = Math.max(0, unit._weAbsorbT - dt * 0.80);

  const atkActive    = unit._weAp > 0;
  const ap           = 1 - unit._weAp;
  const inFight      = unit.state === 'fight' || atkActive;
  const absorbActive = unit._weAbsorbT > 0;
  const _weBranch    = unit._branch || '';

  const windUp  = atkActive && ap < 0.28  ? ap / 0.28 : 0;
  const spitT   = atkActive && ap > 0.28 && ap < 0.62 ? (ap-0.28)/0.34 : 0;
  const rebound = atkActive && ap > 0.62 ? Math.sin((ap-0.62)/0.38 * Math.PI) : 0;
  const windEase = windUp * windUp * (3 - 2 * windUp);
  const releaseCompression = atkActive && ap >= 0.28 && ap < 0.43
    ? 1 - (ap - 0.28) / 0.15 : 0;
  const compression = Math.max(windEase, releaseCompression);
  const lanceOut = spitT > 0
    ? 1 - Math.pow(1 - spitT, 3)
    : (atkActive && ap >= 0.62 && ap < 0.82 ? 1 - (ap - 0.62) / 0.20 : 0);
  const splitShot = _weBranch === 'A' ? lanceOut : 0;
  const bastionWave = _weBranch === 'B' ? lanceOut : 0;
  const bodyLanceOut = _weBranch === 'B' ? 0 : _weBranch === 'A' ? lanceOut * 0.18 : lanceOut;
  const sqX      = 1 - compression * 0.18 - bodyLanceOut * 0.10
                 + bastionWave * 0.24 + rebound * 0.05;
  const upperPull = -dir * s * (compression * 0.13 - rebound * 0.075);

  // ── Proportions: one continuous living-water silhouette ─────────
  const floatY   = Math.sin(unit._weT * 1.62) * s * 0.026;
  const headR    = s * 0.170;
  const headCY   = fY - s * 0.88 + floatY
                 + s * (compression * 0.085 - rebound * 0.025 + bastionWave * 0.18);
  const bodyTopY = headCY - headR * 0.94;
  const bodyBotY = fY - s * 0.045;
  const bodyH    = bodyBotY - bodyTopY;
  const moveWave = Math.sin(unit._weT * 4.4) * unit._weMove;
  const movePush = dir * s * unit._weMove * (0.075 + moveWave * 0.022);

  function axisAt(yy) {
    const t = Math.max(0, Math.min(1, (yy - bodyTopY) / bodyH));
    const planted = Math.pow(1 - t, 1.18);
    const flowRoll = Math.sin(t * Math.PI * 1.15 + unit._weT * 4.4) *
      s * 0.018 * unit._weMove * Math.sin(t * Math.PI);
    return cx + (movePush + upperPull) * planted + flowRoll;
  }
  const bX = axisAt(bodyTopY + bodyH * 0.52);
  const headX = axisAt(headCY);

  // Профіль був монотонно розширений донизу → силует читався як конус/торт, не істота.
  // Тепер найширше в корпусі, основа звужена — форма краплі-істоти.
  const wTop  = s * 0.045;
  const wHead = s * 0.205;
  const wNeck = s * 0.165;
  const wShld = s * 0.275;
  const wMid  = s * 0.315;   // найширша точка
  const wHip  = s * 0.268;
  const wBot  = s * 0.205;

  function widthAt(yy) {
    const t = Math.max(0, Math.min(1, (yy - bodyTopY) / bodyH));
    let w;
    if (t < 0.08)      w = wTop  + (wHead - wTop)  * (t / 0.08);
    else if (t < 0.24) w = wHead + (wNeck - wHead) * ((t - 0.08) / 0.16);
    else if (t < 0.40) w = wNeck + (wShld - wNeck) * ((t - 0.24) / 0.16);
    else if (t < 0.62) w = wShld + (wMid  - wShld) * ((t - 0.40) / 0.22);
    else if (t < 0.84) w = wMid  + (wHip  - wMid)  * ((t - 0.62) / 0.22);
    else               w = wHip  + (wBot  - wHip)  * ((t - 0.84) / 0.16);
    if (_weBranch === 'B') {
      const shellBand = Math.sin(Math.PI * Math.max(0, Math.min(1, (t - 0.06) / 0.90)));
      w *= 1 + shellBand * 0.26;
    }
    return w * sqX;
  }

  ctx.save();

  // ── Big puddle with expanding ripple rings ───────────────────────
  const puddleWide = s * (_weBranch === 'B' ? 0.64 : 0.55);
  ctx.fillStyle = 'rgba(0,60,140,0.42)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.010, puddleWide, s * 0.082, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(30,110,200,0.38)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.008, puddleWide * 0.87, s * 0.066, 0, 0, Math.PI * 2);
  ctx.fill();
  if (unit._weMove > 0.03) {
    const wakeX = cx - dir * s * (0.22 + unit._weMove * 0.32);
    ctx.fillStyle = `rgba(30,130,205,${unit._weMove * 0.42})`;
    ctx.beginPath();
    ctx.moveTo(cx - dir * s * 0.02, fY - s * 0.025);
    ctx.quadraticCurveTo(wakeX, fY - s * 0.070, wakeX - dir * s * 0.18, fY + s * 0.002);
    ctx.quadraticCurveTo(wakeX, fY + s * 0.060, cx + dir * s * 0.10, fY + s * 0.024);
    ctx.closePath(); ctx.fill();
  }
  for (let pi = 0; pi < 3; pi++) {
    const phase = ((pi / 3 + unit._weT * 0.45) % 1);
    const rr = s * (0.22 + phase * 0.40);
    const rAlpha = Math.sin(phase * Math.PI) * 0.58;
    ctx.strokeStyle = `rgba(140,210,255,${rAlpha})`;
    ctx.lineWidth = s * 0.012;
    ctx.beginPath();
    ctx.ellipse(cx, fY + s * 0.010, rr, rr * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── Absorb rings around full body ────────────────────────────────
  if (absorbActive) {
    const at = unit._weAbsorbT;
    for (let ri = 0; ri < 2; ri++) {
      const rt = Math.max(0, at - ri * 0.45);
      if (rt <= 0) continue;
      const ringR = s * (0.42 + (1 - rt) * 2.0);
      ctx.strokeStyle = `rgba(${ri === 0 ? '80,200,255' : '180,240,255'},${rt * (ri === 0 ? 0.70 : 0.42)})`;
      ctx.lineWidth   = s * (ri === 0 ? 0.022 : 0.013);
      ctx.beginPath();
      ctx.ellipse(bX, (headCY + fY) / 2, ringR, ringR * 1.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ── Body silhouette path builder ─────────────────────────────────
  function contourX(yy, side, shrink) {
    const t = Math.max(0, Math.min(1, (yy - bodyTopY) / bodyH));
    const ww = widthAt(yy) * shrink;
    const wob = Math.sin((yy * 0.09) + unit._weT * 2.40 + (side > 0 ? 1.8 : 0)) *
      s * 0.020 * shrink;
    let px = axisAt(yy) + side * ww + wob;

    // Locomotion transfers the upper/mid mass forward while the floor contact
    // remains planted.  The rear edge thins into a low, attached tail.
    const frontFlow = Math.sin(Math.PI * Math.max(0, Math.min(1, (t - 0.18) / 0.70)));
    const tailFlow = Math.pow(Math.max(0, (t - 0.68) / 0.32), 1.35);
    if (side === dir) px += dir * s * unit._weMove * frontFlow * (0.035 + moveWave * 0.008);
    else              px -= dir * s * unit._weMove * tailFlow * (0.20 + Math.abs(moveWave) * 0.035);

    // The attack is the body: a narrow band of its forward contour becomes
    // the lance, so there is never a detached projectile/streak.
    if (side === dir && bodyLanceOut > 0) {
      const lanceCenterT = Math.max(0.13, Math.min(0.28, (headCY - bodyTopY) / bodyH + 0.025));
      const lanceBand = Math.max(0, 1 - Math.abs(t - lanceCenterT) / 0.115);
      px += dir * s * 1.08 * bodyLanceOut * Math.pow(lanceBand, 0.72);
    }
    return px;
  }

  function buildBody(shrink) {
    ctx.beginPath();
    const steps = 18;
    const firstStep = _weBranch === 'A' ? 3 : 0;
    for (let i = firstStep; i <= steps; i++) {
      const yy = bodyTopY + (i / steps) * bodyH;
      const px = contourX(yy, -1, shrink);
      if (i === firstStep) ctx.moveTo(px, yy); else ctx.lineTo(px, yy);
    }
    const leftBaseX = contourX(bodyBotY, -1, shrink);
    const rightBaseX = contourX(bodyBotY, 1, shrink);
    ctx.quadraticCurveTo((leftBaseX + cx) * 0.5, fY + s * 0.020,
                         cx, fY + s * 0.004);
    ctx.quadraticCurveTo((cx + rightBaseX) * 0.5, fY + s * 0.020,
                         rightBaseX, bodyBotY);
    for (let i = steps; i >= firstStep; i--) {
      const yy = bodyTopY + (i / steps) * bodyH;
      ctx.lineTo(contourX(yy, 1, shrink), yy);
    }
    if (_weBranch === 'A') {
      const joinY = bodyTopY + (firstStep / steps) * bodyH;
      const crownX = axisAt(joinY);
      const bladeSpread = s * (0.145 + Math.sin(unit._weT * 2.1) * 0.010) * shrink;
      const bladeTipY = bodyTopY - s * 0.025;
      const notchY = bodyTopY + s * 0.145;
      ctx.quadraticCurveTo(crownX + s * 0.235 * shrink, bodyTopY + s * 0.055,
                           crownX + bladeSpread, bladeTipY);
      ctx.quadraticCurveTo(crownX + s * 0.105 * shrink, bodyTopY + s * 0.055,
                           crownX, notchY);
      ctx.quadraticCurveTo(crownX - s * 0.105 * shrink, bodyTopY + s * 0.055,
                           crownX - bladeSpread, bladeTipY);
      ctx.quadraticCurveTo(crownX - s * 0.235 * shrink, bodyTopY + s * 0.055,
                           contourX(joinY, -1, shrink), joinY);
    }
    ctx.closePath();
  }

  if (inFight) {
    ctx.shadowColor = absorbActive ? '#80ecff' : '#2298cc';
    ctx.shadowBlur  = s * (absorbActive ? 0.50 : windUp > 0.5 ? 0.42 : 0.22);
  }

  // Outer dark body
  ctx.save();
  ctx.globalAlpha = 0.82;
  buildBody(1.04); ctx.fillStyle = '#022c55'; ctx.fill();
  // Mid blue
  buildBody(1.00); ctx.fillStyle = '#0f64aa'; ctx.fill();
  // Clip for internal ripples
  buildBody(0.98); ctx.clip();

  // ── Downward-scrolling ripple bands (WATER signature) ────────────
  // Були 8 еліпсів на всю ширину — силует читався як стос кілець («торт»).
  // Тепер це короткі ПОХИЛІ дуги-відблиски по черзі з боків: відчуття течії, не ярусів.
  for (let ri = 0; ri < 3; ri++) {
    const phase = ((ri / 3 + unit._weT * 0.30) % 1);
    const ry = bodyTopY + phase * bodyH;
    const rw = widthAt(ry);
    const rAxis = axisAt(ry);
    const side = (ri % 2 === 0) ? 1 : -1;                 // по черзі ліворуч/праворуч
    const rAlpha = Math.sin(phase * Math.PI) * 0.50;
    const x0 = rAxis - side * rw * 0.70;
    const x1 = rAxis + side * rw * 0.38;
    const tilt = s * 0.030 * side;                        // нахил дуги
    ctx.strokeStyle = `rgba(170,225,255,${rAlpha})`;
    ctx.lineWidth = s * 0.016;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, ry + tilt * 0.5);
    ctx.quadraticCurveTo((x0 + x1) / 2, ry - s * 0.020, x1, ry - tilt * 0.5);
    ctx.stroke();
  }

  // Inner bright vertical flow streak
  const flowGrad = ctx.createLinearGradient(headX - wHip * 0.6, bodyTopY, bX - wHip * 0.6, bodyBotY);
  flowGrad.addColorStop(0,   'rgba(180,235,255,0)');
  flowGrad.addColorStop(0.3, 'rgba(180,235,255,0.35)');
  flowGrad.addColorStop(1,   'rgba(130,210,255,0)');
  ctx.fillStyle = flowGrad;
  ctx.fillRect(bX - wHip * 0.9, bodyTopY, wHip * 0.55, bodyH);
  ctx.restore();
  ctx.shadowBlur = 0;

  // ── Falling droplets along body edges ────────────────────────────
  unit._weDrops.forEach(d => {
    d.y += d.speed * dt;
    if (d.y > 1.08) {
      d.y = -0.04;
      d.side = Math.random() < 0.5 ? -1 : 1;
      d.speed = 0.35 + Math.random() * 0.30;
      d.size = 0.7 + Math.random() * 0.5;
    }
    const dy = bodyTopY + d.y * bodyH;
    const dw = widthAt(dy);
    const dx = axisAt(dy) + d.side * (dw + s * 0.008);
    const dAlpha = Math.min(1, (1 - d.y) * 1.5 + 0.3);
    ctx.fillStyle = `rgba(150,220,255,${dAlpha * 0.85})`;
    ctx.beginPath();
    ctx.ellipse(dx, dy, s * 0.014 * d.size, s * 0.025 * d.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(240,252,255,${dAlpha * 0.55})`;
    ctx.beginPath();
    ctx.arc(dx - s * 0.004, dy - s * 0.008 * d.size, s * 0.005 * d.size, 0, Math.PI * 2); ctx.fill();
  });

  // Splash droplets from puddle
  unit._weSplashes.forEach(sp => {
    sp.life -= dt * 1.2;
    if (sp.life <= 0) {
      sp.life = 1;
      sp.vx = (Math.random() - 0.5) * 0.6;
      sp.vy = -0.5 - Math.random() * 0.4;
      sp.off = (Math.random() - 0.5) * 0.8;
    }
    const lifeT = 1 - sp.life;
    const gx = cx - dir * unit._weMove * s * (0.08 + lifeT * 0.18) +
      sp.off * s * 0.30 + sp.vx * s * lifeT;
    const gy = fY + s * 0.006 + (sp.vy * s * lifeT + 1.8 * s * lifeT * lifeT);
    if (gy < fY + s * 0.015) {
      ctx.fillStyle = `rgba(170,225,255,${sp.life * 0.80})`;
      ctx.beginPath();
      ctx.arc(gx, gy, s * 0.015 * sp.life, 0, Math.PI * 2); ctx.fill();
    }
  });

  // ── Face highlight inside the continuous water mass ─────────────
  if (inFight) {
    ctx.shadowColor = absorbActive ? '#c0f2ff' : '#38c8ff';
    ctx.shadowBlur  = s * (absorbActive ? 0.55 : 0.28);
  }
  const hGrad = ctx.createRadialGradient(headX - headR * 0.25, headCY - headR * 0.30, 0, headX, headCY, headR * 1.12);
  hGrad.addColorStop(0,    'rgba(220,245,255,0.95)');
  hGrad.addColorStop(0.42, 'rgba(100,185,250,0.72)');
  hGrad.addColorStop(1,    'rgba(20,80,180,0)');
  ctx.fillStyle = hGrad;
  ctx.beginPath(); ctx.arc(headX, headCY, headR * 1.12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(230,250,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(headX - headR * 0.32, headCY - headR * 0.35, headR * 0.35, headR * 0.20, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── Eyes ──────────────────────────────────────────────────────────
  const eyeRr = headR * 0.28;
  const eyeSp = headR * 0.45;
  const eyeYY = headCY - headR * 0.05;
  [-1, 1].forEach(side => {
    const ex = headX + side * eyeSp;
    const eyeFlash = windUp > 0.5 ? windUp - 0.5 : (spitT > 0.3 ? (1 - spitT) * 0.6 : 0);
    ctx.shadowColor = absorbActive ? '#ffffff' : '#38e2ff';
    ctx.shadowBlur  = s * (absorbActive ? 0.40 : inFight ? 0.22 : 0.12);
    ctx.fillStyle = absorbActive || eyeFlash > 0.5 ? '#eefeff'
                  : inFight ? '#88e8ff' : '#3ecaee';
    ctx.beginPath(); ctx.arc(ex, eyeYY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,18,46,0.60)';
    ctx.beginPath();
    ctx.ellipse(ex + dir * eyeRr * 0.18, eyeYY, eyeRr * 0.28, eyeRr * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(240,252,255,${0.55 + eyeFlash * 0.25})`;
    ctx.beginPath(); ctx.arc(ex - eyeRr * 0.30, eyeYY - eyeRr * 0.30, eyeRr * 0.20, 0, Math.PI * 2); ctx.fill();
  });

  // ── Pressure hollow during the compressed wind-up ────────────────
  const mouthCX = headX + dir * headR * 0.42;
  const mouthY  = headCY + headR * 0.48;
  const mouthOpen = compression * (1 - lanceOut * 0.82);
  if (mouthOpen > 0.05) {
    ctx.fillStyle = `rgba(0,20,50,${mouthOpen * 0.75})`;
    ctx.beginPath();
    ctx.ellipse(mouthCX, mouthY, headR * 0.18 * mouthOpen, headR * 0.25 * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Body-lance highlight: contained by the stretched silhouette ──
  if (bodyLanceOut > 0.01) {
    const lanceY = headCY + headR * 0.10;
    const lanceRootX = axisAt(lanceY) + dir * widthAt(lanceY) * 0.28;
    const lanceTipX = contourX(lanceY, dir, 1.0) - dir * s * 0.012;
    const lg = ctx.createLinearGradient(lanceRootX, lanceY, lanceTipX, lanceY);
    lg.addColorStop(0, 'rgba(105,205,255,0.08)');
    lg.addColorStop(0.62, `rgba(170,232,255,${bodyLanceOut * 0.52})`);
    lg.addColorStop(1, `rgba(240,252,255,${bodyLanceOut * 0.92})`);
    ctx.shadowColor = '#70dfff'; ctx.shadowBlur = s * 0.18 * bodyLanceOut;
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(lanceRootX, lanceY - s * 0.042);
    ctx.quadraticCurveTo(lanceRootX + dir * s * 0.46 * bodyLanceOut, lanceY - s * 0.030,
                         lanceTipX, lanceY);
    ctx.quadraticCurveTo(lanceRootX + dir * s * 0.46 * bodyLanceOut, lanceY + s * 0.030,
                         lanceRootX, lanceY + s * 0.042);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (rebound > 0.08) {
    const recoilY = headCY + headR * 0.14;
    const recoilFront = axisAt(recoilY) + dir * widthAt(recoilY) * 0.82;
    ctx.strokeStyle = `rgba(180,235,255,${rebound * 0.46})`;
    ctx.lineWidth = s * 0.018; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(recoilFront, recoilY - s * 0.055);
    ctx.quadraticCurveTo(recoilFront - dir * s * 0.12, recoilY,
                         recoilFront - dir * s * 0.035, recoilY + s * 0.080);
    ctx.stroke();
  }

  // Split attack: the compressed twin crown expels two discrete teardrop
  // masses. Short necks keep the release physically readable; at peak the
  // droplets separate, and the main body visibly recoils instead of growing a
  // rigid beak like the base lance.
  if (_weBranch === 'A' && splitShot > 0.01) {
    const launch = 1 - Math.pow(1 - splitShot, 2);
    const rootX = headX + dir * headR * 0.55;
    ctx.save(); ctx.shadowColor = '#8ee8ff'; ctx.shadowBlur = s * 0.18;
    [-1, 1].forEach((side, i) => {
      const rootY = headCY + side * s * 0.115;
      const shotX = rootX + dir * s * (0.15 + launch * (0.82 + i * 0.10));
      const shotY = rootY + side * s * (0.035 + launch * 0.070);
      const dropR = s * (0.150 + (1 - launch) * 0.050);
      if (launch < 0.66) {
        ctx.strokeStyle = `rgba(104,205,252,${(1 - launch / 0.66) * 0.72})`;
        ctx.lineWidth = s * (0.090 - launch * 0.050); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo((rootX + shotX) * 0.5, shotY - side * s * 0.025, shotX, shotY);
        ctx.stroke();
      }
      const dg = ctx.createRadialGradient(
        shotX - dir * dropR * 0.25, shotY - dropR * 0.25, 0,
        shotX, shotY, dropR * 1.25
      );
      dg.addColorStop(0, 'rgba(235,252,255,0.96)');
      dg.addColorStop(0.45, 'rgba(92,205,255,0.88)');
      dg.addColorStop(1, 'rgba(12,89,180,0.12)');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.moveTo(shotX + dir * dropR * 1.35, shotY);
      ctx.quadraticCurveTo(shotX, shotY - dropR, shotX - dir * dropR * 0.95, shotY);
      ctx.quadraticCurveTo(shotX, shotY + dropR, shotX + dir * dropR * 1.35, shotY);
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

  // Bastion attack: the shell squats and sends its stored pressure through the
  // planted puddle as a low ground wave. No face-lance or enclosing halo.
  if (_weBranch === 'B' && bastionWave > 0.01) {
    const wave = 1 - Math.pow(1 - bastionWave, 2);
    const waveRootX = cx + dir * widthAt(bodyBotY) * 0.42;
    const waveTipX = waveRootX + dir * s * (0.18 + wave * 1.28);
    const crestH = s * (0.08 + wave * 0.17);
    const wg = ctx.createLinearGradient(waveRootX, fY, waveTipX, fY);
    wg.addColorStop(0, 'rgba(38,151,225,0.86)');
    wg.addColorStop(0.62, 'rgba(116,221,255,0.72)');
    wg.addColorStop(1, 'rgba(220,250,255,0.04)');
    ctx.save(); ctx.shadowColor = '#5ed7ff'; ctx.shadowBlur = s * 0.16;
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(waveRootX - dir * s * 0.04, fY + s * 0.006);
    ctx.quadraticCurveTo(
      waveRootX + dir * s * (0.42 + wave * 0.20), fY - crestH,
      waveTipX, fY - s * 0.015
    );
    ctx.quadraticCurveTo(
      waveRootX + dir * s * (0.52 + wave * 0.24), fY + s * 0.020,
      waveRootX - dir * s * 0.04, fY + s * 0.006
    );
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(225,251,255,${0.38 + wave * 0.45})`;
    ctx.lineWidth = s * 0.020; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(waveRootX, fY - s * 0.008);
    ctx.quadraticCurveTo(
      waveRootX + dir * s * (0.42 + wave * 0.20), fY - crestH * 0.88,
      waveTipX, fY - s * 0.015
    );
    ctx.stroke(); ctx.restore();
  }

  // ── Orbiting droplets (absorb) ───────────────────────────────────
  if (absorbActive) {
    const at = unit._weAbsorbT;
    ctx.shadowColor = '#80e8ff'; ctx.shadowBlur = s * 0.20;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + unit._weT * 2.20;
      const dr  = s * 0.38 * (0.88 + (1.0 - at) * 0.50);
      ctx.fillStyle = `rgba(130,228,255,${at * 0.80})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * dr,
              (headCY + fY) / 2 + Math.sin(ang) * dr * 0.80, s * 0.019, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ── Branch visuals ──────────────────────────────────────────
  if (_weBranch === 'A') {
    // Split: the crown is already two fused blades in buildBody; this deep,
    // flowing seam makes the bifurcation readable through the shared mass.
    const seamTopY = bodyTopY + s * 0.135;
    const seamBotY = bodyTopY + bodyH * 0.72;
    const seamTopX = axisAt(seamTopY);
    const seamBotX = axisAt(seamBotY);
    const seamBend = Math.sin(unit._weT * 2.0) * s * 0.022;
    ctx.save(); ctx.lineCap = 'round';
    ctx.shadowColor = '#bcecff'; ctx.shadowBlur = s * 0.10;
    ctx.strokeStyle = 'rgba(0,42,92,0.70)'; ctx.lineWidth = s * 0.038;
    ctx.beginPath();
    ctx.moveTo(seamTopX, seamTopY);
    ctx.bezierCurveTo(seamTopX + seamBend, seamTopY + s * 0.18,
                      seamBotX - seamBend, seamBotY - s * 0.16,
                      seamBotX, seamBotY);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(205,244,255,0.78)'; ctx.lineWidth = s * 0.011;
    ctx.stroke();
    ctx.restore();
  } else if (_weBranch === 'B') {
    // Bastion: thickness lives on the body itself — broad shield shoulders,
    // heavy side rims and pressure plates instead of an enclosing oval halo.
    const shellTopY = bodyTopY + s * 0.10;
    const shellMidY = bodyTopY + bodyH * 0.48;
    const shellBotY = bodyTopY + bodyH * 0.88;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = '#4bbcff'; ctx.shadowBlur = s * 0.09;
    for (const side of [-1, 1]) {
      const topX = axisAt(shellTopY) + side * widthAt(shellTopY) * 0.70;
      const midX = axisAt(shellMidY) + side * widthAt(shellMidY) * 0.98;
      const botX = axisAt(shellBotY) + side * widthAt(shellBotY) * 0.88;
      ctx.strokeStyle = 'rgba(0,42,92,0.76)'; ctx.lineWidth = s * 0.068;
      ctx.beginPath(); ctx.moveTo(topX, shellTopY);
      ctx.quadraticCurveTo(midX + side * s * 0.035, shellMidY, botX, shellBotY); ctx.stroke();
      ctx.strokeStyle = 'rgba(135,218,255,0.72)'; ctx.lineWidth = s * 0.026;
      ctx.stroke();

      for (let plate = 0; plate < 3; plate++) {
        const pt = 0.29 + plate * 0.19;
        const py = bodyTopY + bodyH * pt;
        const px = axisAt(py) + side * widthAt(py) * 0.78;
        ctx.strokeStyle = 'rgba(190,238,255,0.42)'; ctx.lineWidth = s * 0.016;
        ctx.beginPath();
        ctx.moveTo(px - side * s * 0.10, py - s * 0.025);
        ctx.quadraticCurveTo(px, py, px + side * s * 0.075, py + s * 0.035);
        ctx.stroke();
      }
    }
    const crownLeft = axisAt(shellTopY) - widthAt(shellTopY) * 0.70;
    const crownRight = axisAt(shellTopY) + widthAt(shellTopY) * 0.70;
    ctx.strokeStyle = 'rgba(0,42,92,0.76)'; ctx.lineWidth = s * 0.068;
    ctx.beginPath(); ctx.moveTo(crownLeft, shellTopY);
    ctx.quadraticCurveTo(axisAt(bodyTopY) , bodyTopY - s * 0.035, crownRight, shellTopY); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,225,255,0.72)'; ctx.lineWidth = s * 0.025;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headCY - headR * 1.25 - s * 0.030;
}
