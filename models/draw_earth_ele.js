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

  const raisT = atkActive && ap < 0.30 ? ap / 0.30 : 0;
  const slamT = atkActive && ap >= 0.30 && ap < 0.50 ? 1.0 - (ap - 0.30) / 0.20 : 0;

  if (atkActive && ap >= 0.29 && !unit._eeSlammed) {
    unit._eeShockT = 1.0; unit._eeSlammed = true;
  }

  // ── Proportions ──────────────────────────────────────────────────
  const shW   = s * 0.730;
  const hipW  = s * 0.445;
  const bodyH = s * 0.510;
  const legH  = s * 0.265;
  const headR = s * 0.232;
  const neckH = s * 0.052;

  const breathe = Math.sin(unit._eeT * 0.88) * s * 0.009;
  const stepBob = unit.state === 'move'
    ? Math.abs(Math.sin(unit._eeT * 2.6)) * s * 0.018 : 0;
  const bX      = cx;
  const bodyBot = fY - legH + stepBob;
  const bodyTop = bodyBot - bodyH;
  const neckTop = bodyTop - neckH;
  const headCY  = neckTop - headR * 0.85 + breathe;
  const tilt    = dir * s * 0.022;

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

  // ── Step dust puff ───────────────────────────────────────────────
  if (unit.state === 'move' && Math.sin(unit._eeT * 2.6) < -0.7) {
    ctx.fillStyle = 'rgba(120,85,50,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + dir * s * 0.05, fY + s * 0.006, s * 0.16, s * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
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
  if (unit._eeShockT > 0) {
    const st    = unit._eeShockT;
    const impX  = bX + dir * shW * 0.60;
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
  }

  if (inFight) {
    ctx.shadowColor = '#cc5500';
    ctx.shadowBlur  = s * (slamT > 0 ? 0.40 : 0.18);
  }

  // ── Legs ─────────────────────────────────────────────────────────
  [-1, 1].forEach(side => {
    const lsX = bX + side * hipW * 0.54 + tilt * 0.28;
    const lsY = bodyBot;
    const lfX = lsX + side * s * 0.048;
    const lfY = fY - s * 0.016;

    ctx.lineCap = 'square';
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.230;
    ctx.beginPath(); ctx.moveTo(lsX, lsY); ctx.lineTo(lfX, lfY); ctx.stroke();
    ctx.strokeStyle = '#6a4820'; ctx.lineWidth = s * 0.108;
    ctx.beginPath(); ctx.moveTo(lsX + side*s*0.022, lsY); ctx.lineTo(lfX + side*s*0.020, lfY - s*0.022); ctx.stroke();
    ctx.strokeStyle = '#957030'; ctx.lineWidth = s * 0.038;
    ctx.beginPath(); ctx.moveTo(lsX + side*s*0.038, lsY); ctx.lineTo(lfX + side*s*0.032, lfY - s*0.030); ctx.stroke();
    ctx.fillStyle = '#251205';
    ctx.beginPath(); ctx.ellipse(lfX, lfY + s*0.022, s*0.118, s*0.042, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a3a10';
    ctx.beginPath(); ctx.ellipse(lfX + side*s*0.020, lfY + s*0.010, s*0.062, s*0.024, 0, 0, Math.PI*2); ctx.fill();
  });

  // ── Body (jagged rock polygon, 3 layers) ─────────────────────────
  ctx.fillStyle = '#3a2810';
  ctx.beginPath();
  ctx.moveTo(bX - shW*0.90 + tilt,      bodyTop - s*0.032);
  ctx.lineTo(bX - shW*0.62 + tilt,      bodyTop - s*0.065);
  ctx.lineTo(bX - shW*0.34 + tilt,      bodyTop - s*0.018);
  ctx.lineTo(bX + shW*0.28 + tilt,      bodyTop - s*0.025);
  ctx.lineTo(bX + shW*0.64 + tilt,      bodyTop - s*0.055);
  ctx.lineTo(bX + shW*0.92 + tilt,      bodyTop - s*0.022);
  ctx.lineTo(bX + hipW + s*0.038,       bodyBot + s*0.012);
  ctx.lineTo(bX + hipW*0.28,            bodyBot + s*0.018);
  ctx.lineTo(bX - hipW*0.32,            bodyBot + s*0.014);
  ctx.lineTo(bX - hipW - s*0.030,       bodyBot + s*0.010);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#6a4820';
  ctx.beginPath();
  ctx.moveTo(bX - shW*0.68 + tilt*0.7,  bodyTop + bodyH*0.04);
  ctx.lineTo(bX - shW*0.42 + tilt*0.7,  bodyTop + bodyH*0.01);
  ctx.lineTo(bX + shW*0.38 + tilt*0.7,  bodyTop + bodyH*0.02);
  ctx.lineTo(bX + shW*0.70 + tilt*0.7,  bodyTop + bodyH*0.05);
  ctx.lineTo(bX + hipW*0.80,             bodyBot - bodyH*0.05);
  ctx.lineTo(bX - hipW*0.82,             bodyBot - bodyH*0.05);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#957030';
  ctx.beginPath();
  ctx.moveTo(bX - shW*0.22 + tilt*0.5,  bodyTop + bodyH*0.06);
  ctx.lineTo(bX + shW*0.20 + tilt*0.5,  bodyTop + bodyH*0.06);
  ctx.lineTo(bX + shW*0.10,             bodyBot - bodyH*0.12);
  ctx.lineTo(bX - shW*0.12,             bodyBot - bodyH*0.12);
  ctx.closePath(); ctx.fill();

  // Rock cracks
  ctx.strokeStyle = '#1c0c04'; ctx.lineWidth = s*0.013; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bX - shW*0.52 + tilt, bodyTop + bodyH*0.10);
  ctx.lineTo(bX - shW*0.34 + tilt, bodyTop + bodyH*0.42);
  ctx.lineTo(bX - shW*0.40 + tilt, bodyTop + bodyH*0.70);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bX + shW*0.54 + tilt, bodyTop + bodyH*0.08);
  ctx.lineTo(bX + shW*0.38 + tilt, bodyTop + bodyH*0.36);
  ctx.lineTo(bX + shW*0.45 + tilt, bodyTop + bodyH*0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bX - shW*0.45 + tilt, bodyTop + bodyH*0.54);
  ctx.lineTo(bX + shW*0.42 + tilt, bodyTop + bodyH*0.52);
  ctx.stroke();

  // Moss
  ctx.fillStyle = 'rgba(38,68,18,0.58)';
  ctx.beginPath(); ctx.ellipse(bX - shW*0.40 + tilt, bodyTop + bodyH*0.20, s*0.068, s*0.036, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bX + shW*0.32 + tilt, bodyTop + bodyH*0.62, s*0.052, s*0.028,  0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bX - shW*0.10 + tilt, bodyBot - bodyH*0.08, s*0.040, s*0.020,  0.0, 0, Math.PI*2); ctx.fill();

  ctx.shadowBlur = 0;

  // ── Arms ─────────────────────────────────────────────────────────
  [-1, 1].forEach(side => {
    const isAtk = side === dir;
    const shX   = bX + side * shW * 0.82 + tilt * 0.10;
    const shY   = bodyTop + bodyH * 0.06;

    let elbX, elbY, fistX, fistY;
    if (isAtk && atkActive && raisT > 0) {
      elbX  = shX + side * s * 0.25;
      elbY  = shY - s * 0.18 * raisT;
      fistX = shX + side * s * 0.10 + dir * s * 0.08 * raisT;
      fistY = shY - s * 0.50 * raisT;
    } else if (isAtk && atkActive && slamT > 0) {
      const sp = 1 - slamT;
      elbX  = shX + side * s * 0.25 - dir * s * 0.08 * sp;
      elbY  = shY - s * 0.18 + s * 0.28 * sp;
      fistX = shX + side * s * 0.10 + dir * s * (0.08 + 0.48 * sp);
      fistY = shY - s * 0.50 + s * 0.68 * sp;
    } else {
      elbX  = shX + side * s * 0.28;
      elbY  = shY + s * 0.20;
      fistX = shX + side * s * 0.20;
      fistY = shY + s * 0.45;
    }

    ctx.lineCap = 'square';
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.235;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(elbX, elbY); ctx.stroke();
    ctx.strokeStyle = '#6a4820'; ctx.lineWidth = s * 0.115;
    ctx.beginPath(); ctx.moveTo(shX + side*s*0.030, shY); ctx.lineTo(elbX + side*s*0.022, elbY); ctx.stroke();
    ctx.strokeStyle = '#957030'; ctx.lineWidth = s * 0.042;
    ctx.beginPath(); ctx.moveTo(shX + side*s*0.045, shY); ctx.lineTo(elbX + side*s*0.032, elbY + s*0.018); ctx.stroke();

    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.198;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(fistX, fistY); ctx.stroke();
    ctx.strokeStyle = '#6a4820'; ctx.lineWidth = s * 0.095;
    ctx.beginPath(); ctx.moveTo(elbX + side*s*0.018, elbY); ctx.lineTo(fistX + side*s*0.015, fistY - s*0.020); ctx.stroke();

    ctx.fillStyle = '#251208';
    ctx.beginPath(); ctx.arc(fistX, fistY, s * 0.112, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5528';
    ctx.beginPath(); ctx.arc(fistX - side*s*0.030, fistY - s*0.028, s * 0.058, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3e18';
    ctx.beginPath(); ctx.arc(fistX + side*s*0.025, fistY - s*0.015, s * 0.040, 0, Math.PI * 2); ctx.fill();

    if (isAtk && slamT > 0.25) {
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur  = s * slamT * 0.45;
      ctx.fillStyle   = `rgba(255,100,0,${slamT * 0.35})`;
      ctx.beginPath(); ctx.arc(fistX, fistY, s * 0.118, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur  = 0;
    }
  });

  // ── Neck ─────────────────────────────────────────────────────────
  ctx.fillStyle = '#4a3218';
  ctx.beginPath();
  ctx.moveTo(bX - shW*0.20 + tilt, bodyTop);
  ctx.lineTo(bX + shW*0.20 + tilt, bodyTop);
  ctx.lineTo(bX + s*0.108 + tilt,  neckTop);
  ctx.lineTo(bX - s*0.108 + tilt,  neckTop);
  ctx.closePath(); ctx.fill();

  // ── Head (jagged boulder) ────────────────────────────────────────
  if (inFight) {
    ctx.shadowColor = '#ff6000';
    ctx.shadowBlur  = s * (slamT > 0 ? 0.45 : 0.22);
  }
  ctx.fillStyle = '#3a2810';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR*0.88, headCY + headR*0.65);
  ctx.lineTo(bX + tilt - headR*1.00, headCY - headR*0.08);
  ctx.lineTo(bX + tilt - headR*0.78, headCY - headR*0.82);
  ctx.lineTo(bX + tilt - headR*0.22, headCY - headR*1.08);
  ctx.lineTo(bX + tilt + headR*0.32, headCY - headR*0.98);
  ctx.lineTo(bX + tilt + headR*0.96, headCY - headR*0.52);
  ctx.lineTo(bX + tilt + headR*0.94, headCY + headR*0.22);
  ctx.lineTo(bX + tilt + headR*0.74, headCY + headR*0.70);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6a4820';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR*0.62, headCY + headR*0.50);
  ctx.lineTo(bX + tilt - headR*0.74, headCY - headR*0.04);
  ctx.lineTo(bX + tilt - headR*0.46, headCY - headR*0.70);
  ctx.lineTo(bX + tilt + headR*0.20, headCY - headR*0.82);
  ctx.lineTo(bX + tilt + headR*0.74, headCY - headR*0.36);
  ctx.lineTo(bX + tilt + headR*0.68, headCY + headR*0.52);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1c0c04'; ctx.lineWidth = s*0.012; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR*0.18, headCY - headR*0.62);
  ctx.lineTo(bX + tilt + headR*0.08, headCY - headR*0.05);
  ctx.lineTo(bX + tilt + headR*0.22, headCY + headR*0.40);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Eyes (magma cracks) ──────────────────────────────────────────
  const eyeW  = headR * 0.385;
  const eyeH  = headR * 0.172;
  const eyeSp = headR * 0.42;
  const eyeYY = headCY - headR * 0.10;
  const eyeGlow = inFight ? 0.90 : 0.58 + Math.sin(unit._eeT * 1.6) * 0.16;

  [-1, 1].forEach(side => {
    const ex = bX + tilt + side * eyeSp;
    const eyeFlash = slamT > 0.3 ? slamT : 0;

    ctx.shadowColor = eyeFlash > 0.3 ? '#ffcc22' : '#ff6600';
    ctx.shadowBlur  = s * (eyeFlash > 0.3 ? 0.55 : inFight ? 0.32 : 0.16);
    ctx.fillStyle = '#0c0502';
    ctx.beginPath(); ctx.ellipse(ex, eyeYY, eyeW*1.18, eyeH*1.25, 0, 0, Math.PI*2); ctx.fill();
    const eyeR = Math.floor(90 + eyeGlow * 55);
    ctx.fillStyle = eyeFlash > 0.4
      ? 'rgba(255,210,40,0.92)'
      : `rgba(255,${eyeR},0,${eyeGlow * 0.95})`;
    ctx.beginPath(); ctx.ellipse(ex, eyeYY, eyeW, eyeH, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(180,40,0,${eyeGlow * 0.60})`;
    ctx.lineWidth = s * 0.011; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - eyeW*0.55, eyeYY);
    ctx.lineTo(ex, eyeYY - eyeH*0.55);
    ctx.lineTo(ex + eyeW*0.55, eyeYY);
    ctx.stroke();
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
    // Earthquake: radiating ground crack lines + tremor shimmer
    ctx.strokeStyle = 'rgba(90,55,15,0.55)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    const _shk = Math.sin(_frameNow * 0.0060) * s * 0.012;
    for (const [ang, len] of [[0.18, 0.58], [0.90, 0.45], [-0.20, 0.62], [-0.80, 0.40]]) {
      ctx.beginPath();
      ctx.moveTo(bX + _shk, fY);
      ctx.lineTo(bX + Math.cos(ang)*len*s + _shk, fY + Math.sin(ang)*s*0.08);
      ctx.stroke();
    }
    // Orange quake ring
    ctx.save(); ctx.shadowColor = '#ff6600'; ctx.shadowBlur = s * 0.10;
    ctx.strokeStyle = 'rgba(180,90,0,0.28)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(bX, fY, s*0.55, s*0.085, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_eeBranch === 'B') {
    // Mountain: snow cap on head + solid armor glow
    ctx.save(); ctx.shadowColor = '#aaddff'; ctx.shadowBlur = s * 0.10;
    // Snow peak
    ctx.fillStyle = 'rgba(230,240,255,0.72)';
    ctx.beginPath();
    ctx.moveTo(bX, headCY - headR * 1.25);
    ctx.lineTo(bX - headR * 0.55, headCY - headR * 0.60);
    ctx.lineTo(bX + headR * 0.55, headCY - headR * 0.60);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,220,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(bX + headR*0.20, headCY - headR * 0.90);
    ctx.lineTo(bX - headR*0.22, headCY - headR * 0.60);
    ctx.lineTo(bX + headR*0.52, headCY - headR * 0.60);
    ctx.closePath(); ctx.fill();
    // Armor shimmer ring
    ctx.strokeStyle = 'rgba(150,110,70,0.28)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(bX, headCY + s*0.10, s*0.40, s*0.55, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headCY - headR * 1.25;
}
