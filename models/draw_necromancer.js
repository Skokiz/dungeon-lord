// ═══════════════════════════════════════════════════════════════════════════
//  NECROMANCER — рівень 10, здібність: raise_dead (піднімає скелетів)
//  Капюшон із черепом, посох із палаючим черепом, 3 орбітальні черепи-фаміліари,
//  кістяна рука-кастер, 3 руки мертвих при raise_dead, зелена некро-магія.
// ═══════════════════════════════════════════════════════════════════════════
function drawNecromancerMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._ncLastT || _frameNow)) / 1000, 0.05);
  unit._ncLastT = _frameNow;

  if (unit._ncDir === undefined) {
    unit._ncDir = 1; unit._ncPrevX = cx;
    unit._ncPrevAcd = unit.attackCooldown;
    unit._ncT = 0; unit._ncAp = 0; unit._ncRaiseT = 0;
    unit._ncSkulls = Array.from({length: 3}, (_, i) => ({
      phase: (i / 3) * Math.PI * 2,
      rBias: 0.88 + Math.random() * 0.15
    }));
  }
  if (Math.abs(cx - unit._ncPrevX) > 0.2)
    unit._ncDir = cx > unit._ncPrevX ? 1 : -1;
  unit._ncPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._ncDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._ncDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._ncPrevAcd || 0) + 3) { unit._ncAp = 1.0; unit._ncRaiseT = 1.0; }
  unit._ncPrevAcd = acd;
  unit._ncT += dt;

  const atkDur = Math.min(0.64, atkBase / 60 * 0.80);
  if (unit._ncAp > 0)     unit._ncAp     = Math.max(0, unit._ncAp     - dt / atkDur);
  if (unit._ncRaiseT > 0) unit._ncRaiseT = Math.max(0, unit._ncRaiseT - dt * 0.85);

  const atkActive   = unit._ncAp > 0;
  const ap          = 1 - unit._ncAp;
  const inFight     = unit.state === 'fight' || atkActive;
  const raiseActive = unit._ncRaiseT > 0;

  const chantT = atkActive && ap < 0.30 ? ap / 0.30 : 0;
  const castT  = atkActive && ap >= 0.30 && ap < 0.65 ? (ap - 0.30) / 0.35 : 0;

  const robeW  = s * 0.620;
  const robeH  = s * 0.540;
  const legH   = s * 0.145;
  const headR  = s * 0.200;
  const neckH  = s * 0.036;

  const floatY = Math.sin(unit._ncT * 1.20) * s * 0.045;
  const bX     = cx;
  const robBot = fY - legH + floatY;
  const robTop = robBot - robeH;
  const neckTop = robTop - neckH;
  const headCY = neckTop - headR * 0.88;
  const tilt   = dir * s * 0.018;

  ctx.save();

  // ── Ground necro circle (pulsing pentagram) ──────────────────────
  const auraPulse = 0.38 + Math.sin(unit._ncT * 1.8) * 0.20 + (raiseActive ? 0.30 : 0);
  ctx.fillStyle = `rgba(20,50,15,${auraPulse * 0.55})`;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.48, s * 0.070, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(60,220,80,${auraPulse * 0.55})`;
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.44, s * 0.062, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = `rgba(120,255,120,${auraPulse * 0.30})`;
  ctx.lineWidth = s * 0.008;
  for (let pi = 0; pi < 5; pi++) {
    const ang = unit._ncT * 0.3 + pi * Math.PI * 2 / 5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * s * 0.32, fY + s * 0.014 + Math.sin(ang) * s * 0.045);
    ctx.lineTo(cx + Math.cos(ang + Math.PI * 4/5) * s * 0.32,
               fY + s * 0.014 + Math.sin(ang + Math.PI * 4/5) * s * 0.045);
    ctx.stroke();
  }

  // ── Robe ──────────────────────────────────────────────────────────
  const hemL = Math.sin(unit._ncT * 1.0) * s * 0.030;
  const hemR = Math.sin(unit._ncT * 1.0 + 1.5) * s * 0.028;
  if (inFight) {
    ctx.shadowColor = '#44aa66'; ctx.shadowBlur = s * 0.24;
  }
  ctx.fillStyle = '#0d0518';
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.48 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX + robeW * 0.48 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX + robeW * 0.96,         robBot + s * 0.005 + hemR);
  ctx.lineTo(bX + robeW * 0.55,         robBot + s * 0.012 + hemR * 0.6);
  ctx.lineTo(bX + robeW * 0.15,         robBot + s * 0.020);
  ctx.lineTo(bX - robeW * 0.15,         robBot + s * 0.020);
  ctx.lineTo(bX - robeW * 0.55,         robBot + s * 0.012 + hemL * 0.6);
  ctx.lineTo(bX - robeW * 0.94,         robBot + s * 0.005 + hemL);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#221040';
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.38 + tilt, robTop + robeH * 0.05);
  ctx.lineTo(bX + robeW * 0.38 + tilt, robTop + robeH * 0.05);
  ctx.lineTo(bX + robeW * 0.78,         robBot - s * 0.025);
  ctx.lineTo(bX - robeW * 0.78,         robBot - s * 0.025);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#080418';
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.16 + tilt, robTop + robeH * 0.10);
  ctx.lineTo(bX + robeW * 0.16 + tilt, robTop + robeH * 0.10);
  ctx.lineTo(bX + robeW * 0.30,         robBot - s * 0.030);
  ctx.lineTo(bX - robeW * 0.30,         robBot - s * 0.030);
  ctx.closePath(); ctx.fill();
  // Green trim along robe edges
  ctx.strokeStyle = `rgba(80,220,100,${0.55 + Math.sin(unit._ncT * 2) * 0.15})`;
  ctx.lineWidth = s * 0.010;
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.48 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX - robeW * 0.94,         robBot + s * 0.005 + hemL);
  ctx.moveTo(bX + robeW * 0.48 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX + robeW * 0.96,         robBot + s * 0.005 + hemR);
  ctx.stroke();
  // Rune on chest
  ctx.strokeStyle = `rgba(120,255,140,${0.60 + chantT * 0.30})`;
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.moveTo(bX + tilt, robTop + robeH * 0.14);
  ctx.lineTo(bX + tilt, robTop + robeH * 0.50);
  ctx.moveTo(bX - s * 0.060 + tilt, robTop + robeH * 0.28);
  ctx.lineTo(bX + s * 0.060 + tilt, robTop + robeH * 0.28);
  ctx.moveTo(bX - s * 0.050 + tilt, robTop + robeH * 0.42);
  ctx.lineTo(bX + s * 0.050 + tilt, robTop + robeH * 0.42);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Staff ─────────────────────────────────────────────────────────
  const stX = bX + dir * robeW * 0.68 + tilt;
  const stBotY = robBot + s * 0.022;
  const stTopY = headCY - headR * 1.80;
  ctx.strokeStyle = '#160a1c'; ctx.lineWidth = s * 0.044; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(stX, stBotY); ctx.lineTo(stX, stTopY); ctx.stroke();
  ctx.strokeStyle = '#2e1a38'; ctx.lineWidth = s * 0.020;
  ctx.beginPath(); ctx.moveTo(stX + dir * s * 0.008, stBotY); ctx.lineTo(stX + dir * s * 0.008, stTopY); ctx.stroke();
  // Bone bindings
  ctx.strokeStyle = '#d4c8a8'; ctx.lineWidth = s * 0.008;
  for (let bi = 0; bi < 3; bi++) {
    const by = stBotY - (bi + 1) * s * 0.13;
    ctx.beginPath(); ctx.moveTo(stX - s * 0.030, by); ctx.lineTo(stX + s * 0.030, by); ctx.stroke();
  }
  // Skull on top
  const skTopR = s * 0.070;
  ctx.shadowColor = '#55ff66'; ctx.shadowBlur = s * (0.22 + chantT * 0.30);
  ctx.fillStyle = '#d4c8a8';
  ctx.beginPath(); ctx.arc(stX, stTopY, skTopR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a89880';
  ctx.beginPath(); ctx.arc(stX, stTopY + skTopR * 0.45, skTopR * 0.70, 0, Math.PI); ctx.fill();
  ctx.shadowColor = '#44ff77'; ctx.shadowBlur = s * 0.22;
  ctx.fillStyle = `rgba(80,255,100,${0.85 + chantT * 0.15})`;
  ctx.beginPath(); ctx.arc(stX - skTopR * 0.32, stTopY - skTopR * 0.08, skTopR * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(stX + skTopR * 0.32, stTopY - skTopR * 0.08, skTopR * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Green flame above skull
  const flFlick = Math.sin(unit._ncT * 6.5) * 0.18 + 0.82;
  const flH = s * 0.16 * flFlick * (1 + chantT * 0.40);
  ctx.shadowColor = '#44ff66'; ctx.shadowBlur = s * 0.35;
  const flGrad = ctx.createLinearGradient(stX, stTopY - skTopR * 0.8, stX, stTopY - skTopR - flH);
  flGrad.addColorStop(0,   'rgba(80,255,120,0.85)');
  flGrad.addColorStop(0.5, 'rgba(140,255,160,0.70)');
  flGrad.addColorStop(1,   'rgba(200,255,220,0)');
  ctx.fillStyle = flGrad;
  ctx.beginPath();
  ctx.moveTo(stX - s * 0.050, stTopY - skTopR * 0.9);
  ctx.quadraticCurveTo(stX - s * 0.030, stTopY - skTopR - flH * 0.6,
                        stX + Math.sin(unit._ncT * 3) * s * 0.020, stTopY - skTopR - flH);
  ctx.quadraticCurveTo(stX + s * 0.030, stTopY - skTopR - flH * 0.6,
                        stX + s * 0.050, stTopY - skTopR * 0.9);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Casting hand ─────────────────────────────────────────────────
  const hSide = -dir;
  const handX = bX + hSide * robeW * 0.48 + tilt;
  const handY = robTop + robeH * (0.45 - chantT * 0.20);
  const handEndX = handX + hSide * s * (0.14 + chantT * 0.10);
  const handEndY = handY - s * (0.04 + chantT * 0.14);
  ctx.strokeStyle = '#160a1c'; ctx.lineWidth = s * 0.055; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handEndX, handEndY); ctx.stroke();
  ctx.fillStyle = '#d4c8a8';
  ctx.beginPath(); ctx.arc(handEndX, handEndY, s * 0.032, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b8aa88'; ctx.lineWidth = s * 0.014;
  for (let fi = 0; fi < 4; fi++) {
    const fAng = (fi - 1.5) * 0.32 + hSide * 0.5;
    const fEndX = handEndX + Math.cos(fAng) * s * 0.065;
    const fEndY = handEndY + Math.sin(fAng) * s * 0.065;
    ctx.beginPath(); ctx.moveTo(handEndX, handEndY); ctx.lineTo(fEndX, fEndY); ctx.stroke();
  }
  if (chantT > 0.15) {
    ctx.shadowColor = '#55ff77'; ctx.shadowBlur = s * chantT * 0.48;
    const cgr = ctx.createRadialGradient(handEndX, handEndY, 0, handEndX, handEndY, s * 0.060 * chantT);
    cgr.addColorStop(0, `rgba(180,255,200,${chantT * 0.95})`);
    cgr.addColorStop(0.5, `rgba(80,255,120,${chantT * 0.85})`);
    cgr.addColorStop(1, 'rgba(20,120,40,0)');
    ctx.fillStyle = cgr;
    ctx.beginPath(); ctx.arc(handEndX, handEndY, s * 0.060 * chantT, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Neck ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#120822';
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.085 + tilt, robTop);
  ctx.lineTo(bX + s * 0.085 + tilt, robTop);
  ctx.lineTo(bX + s * 0.072 + tilt, neckTop);
  ctx.lineTo(bX - s * 0.072 + tilt, neckTop);
  ctx.closePath(); ctx.fill();

  // ── Hood (pointed, jagged) ───────────────────────────────────────
  if (inFight) {
    ctx.shadowColor = '#55ff77'; ctx.shadowBlur = s * 0.22;
  }
  ctx.fillStyle = '#0a0414';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 1.10, headCY + headR * 0.82);
  ctx.lineTo(bX + tilt - headR * 1.20, headCY - headR * 0.20);
  ctx.lineTo(bX + tilt - headR * 0.80, headCY - headR * 0.95);
  ctx.lineTo(bX + tilt + dir * headR * 0.05, headCY - headR * 1.28);
  ctx.lineTo(bX + tilt + headR * 0.80, headCY - headR * 0.95);
  ctx.lineTo(bX + tilt + headR * 1.20, headCY - headR * 0.20);
  ctx.lineTo(bX + tilt + headR * 1.10, headCY + headR * 0.82);
  ctx.lineTo(bX + tilt + headR * 0.60, headCY + headR * 0.90);
  ctx.lineTo(bX + tilt - headR * 0.60, headCY + headR * 0.90);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#000005';
  ctx.beginPath();
  ctx.ellipse(bX + tilt + dir * headR * 0.05, headCY, headR * 0.80, headR * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Skull jaw visible
  ctx.fillStyle = '#b0a088';
  ctx.beginPath();
  ctx.ellipse(bX + tilt, headCY + headR * 0.35, headR * 0.55, headR * 0.30, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#5a4a30'; ctx.lineWidth = s * 0.010; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 0.40, headCY + headR * 0.45);
  ctx.lineTo(bX + tilt + headR * 0.40, headCY + headR * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#c8b8a0';
  for (let ti = -2; ti <= 2; ti++) {
    ctx.fillRect(bX + tilt + ti * headR * 0.14 - s * 0.008, headCY + headR * 0.46, s * 0.016, s * 0.025);
  }

  // Eyes inside hood
  const eyeR = headR * 0.18;
  const eyeYY = headCY - headR * 0.02;
  [-1, 1].forEach(side => {
    const exe = bX + tilt + side * headR * 0.32;
    const eFl = chantT > 0.3 ? (chantT - 0.3) * 1.4 : 0;
    ctx.shadowColor = '#55ff77';
    ctx.shadowBlur = s * (eFl > 0.4 ? 0.55 : inFight ? 0.38 : 0.22);
    ctx.fillStyle = `rgba(${Math.floor(40 + eFl * 140)},255,${Math.floor(80 + eFl * 80)},${0.85 + eFl * 0.15})`;
    ctx.beginPath(); ctx.arc(exe, eyeYY, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a1a08';
    ctx.beginPath();
    ctx.ellipse(exe + dir * eyeR * 0.16, eyeYY, eyeR * 0.24, eyeR * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220,255,220,${0.55 + eFl * 0.35})`;
    ctx.beginPath(); ctx.arc(exe - eyeR * 0.30, eyeYY - eyeR * 0.28, eyeR * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── 3 orbiting skulls ────────────────────────────────────────────
  unit._ncSkulls.forEach(sk => {
    const ang = unit._ncT * 1.10 + sk.phase;
    const orbR = s * 0.52 * sk.rBias;
    const ox = cx + Math.cos(ang) * orbR;
    const oy = (headCY + robBot) / 2 + Math.sin(ang) * orbR * 0.60;
    const depth = Math.sin(ang);
    const skR = s * (0.050 + depth * 0.012);
    const skAlpha = depth > 0 ? 0.95 : 0.40;
    ctx.shadowColor = '#55ff77'; ctx.shadowBlur = s * 0.16 * skAlpha;
    ctx.fillStyle = `rgba(212,200,168,${skAlpha})`;
    ctx.beginPath(); ctx.arc(ox, oy, skR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(168,152,128,${skAlpha})`;
    ctx.beginPath(); ctx.arc(ox, oy + skR * 0.42, skR * 0.72, 0, Math.PI); ctx.fill();
    ctx.shadowColor = '#55ff77'; ctx.shadowBlur = s * 0.14 * skAlpha;
    ctx.fillStyle = `rgba(80,255,100,${skAlpha})`;
    ctx.beginPath(); ctx.arc(ox - skR * 0.30, oy - skR * 0.08, skR * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ox + skR * 0.30, oy - skR * 0.08, skR * 0.22, 0, Math.PI * 2); ctx.fill();
    if (depth > 0) {
      ctx.fillStyle = `rgba(80,220,100,${skAlpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(ox - Math.cos(ang) * s * 0.040, oy - Math.sin(ang) * s * 0.024, skR * 0.80, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  });

  // ── Raise_dead: 3 skeletal hands erupt ───────────────────────────
  if (raiseActive) {
    const rt = unit._ncRaiseT;
    const handRise = Math.sin(rt * Math.PI);
    [-1.1, 0, 0.9].forEach((off, hi) => {
      const hx = cx + dir * s * (0.50 + off * 0.45);
      const hySurface = fY + s * 0.020;
      const hyTop = hySurface - s * 0.28 * handRise;
      ctx.strokeStyle = '#c8b8a0'; ctx.lineWidth = s * 0.044; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hySurface); ctx.lineTo(hx + (hi - 1) * s * 0.03, hyTop); ctx.stroke();
      ctx.strokeStyle = '#a89880'; ctx.lineWidth = s * 0.018;
      for (let fi = 0; fi < 4; fi++) {
        const fAng = -Math.PI * 0.5 + (fi - 1.5) * 0.35;
        const fx2 = hx + (hi - 1) * s * 0.03 + Math.cos(fAng) * s * 0.06 * handRise;
        const fy2 = hyTop + Math.sin(fAng) * s * 0.06 * handRise;
        ctx.beginPath(); ctx.moveTo(hx + (hi - 1) * s * 0.03, hyTop); ctx.lineTo(fx2, fy2); ctx.stroke();
      }
      ctx.fillStyle = `rgba(50,80,30,${rt * 0.55})`;
      ctx.beginPath();
      ctx.ellipse(hx, hySurface, s * 0.08, s * 0.018, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = '#55ff66'; ctx.shadowBlur = s * 0.20;
      ctx.fillStyle = `rgba(80,220,100,${rt * 0.60})`;
      ctx.beginPath(); ctx.arc(hx + (hi - 1) * s * 0.03, hyTop, s * 0.018, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // ── Cast bolt ────────────────────────────────────────────────────
  const boltActive = atkActive && ap > 0.30 && ap < 0.86;
  if (boltActive) {
    const progress = Math.min(1, (ap - 0.30) / 0.42);
    const boltMaxD = s * 1.80;
    const originX = handEndX;
    const originY = handEndY;
    const tipX = originX + dir * progress * boltMaxD;
    const tipY = originY + (bX - originX) * progress * 0.4;
    const tailX = originX + dir * Math.max(0, progress - 0.30) * boltMaxD;
    const jAlpha = castT > 0 ? 1.0 : 1.0 - (ap - 0.65) / 0.21;

    if (jAlpha > 0) {
      ctx.shadowColor = '#55ff77'; ctx.shadowBlur = s * 0.32 * jAlpha;
      const bG = ctx.createLinearGradient(tailX, originY, tipX, tipY);
      bG.addColorStop(0,    'rgba(40,120,40,0)');
      bG.addColorStop(0.25, `rgba(80,220,100,${jAlpha * 0.82})`);
      bG.addColorStop(1,    `rgba(200,255,220,${jAlpha * 0.92})`);
      ctx.strokeStyle = bG; ctx.lineWidth = s * 0.075; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tailX, originY); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.strokeStyle = `rgba(240,255,240,${jAlpha * 0.90})`;
      ctx.lineWidth = s * 0.026;
      ctx.beginPath(); ctx.moveTo(tailX, originY); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.fillStyle = `rgba(140,255,160,${jAlpha * 0.85})`;
      ctx.beginPath(); ctx.arc(tipX, tipY, s * 0.042, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _ncBranch = unit._branch || '';
  if (_ncBranch === 'A') {
    // Arch-Necromancer: extra 4th skull + golden crowns on all 3 skulls + wider aura
    const _t4 = unit._ncT * 1.05 + Math.PI * 1.55;
    const _r4 = s * 0.42;
    const _sx = cx + Math.cos(_t4) * _r4;
    const _sy = headCY + s * 0.25 + Math.sin(_t4) * _r4 * 0.38;
    const _sr = s * 0.080;
    ctx.save(); ctx.shadowColor = '#00ff44'; ctx.shadowBlur = s * 0.20;
    ctx.fillStyle = '#d8c898'; ctx.strokeStyle = '#0a0800'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(_sx, _sy, _sr, _sr*0.88, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#08070f';
    ctx.beginPath(); ctx.ellipse(_sx - _sr*0.28, _sy + _sr*0.10, _sr*0.28, _sr*0.25, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(_sx + _sr*0.28, _sy + _sr*0.10, _sr*0.28, _sr*0.25, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#44ff66'; ctx.globalAlpha = 0.80;
    ctx.beginPath(); ctx.arc(_sx - _sr*0.28, _sy + _sr*0.08, _sr*0.12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(_sx + _sr*0.28, _sy + _sr*0.08, _sr*0.12, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.restore();

    // Golden crowns on the 3 existing orbiting skulls (drawn as overlay)
    unit._ncSkulls.forEach(sk => {
      const _sAng = unit._ncT * 1.10 + sk.phase;
      const _sOrbR = s * 0.52 * sk.rBias;
      const _sox = cx + Math.cos(_sAng) * _sOrbR;
      const _soy = (headCY + robBot) / 2 + Math.sin(_sAng) * _sOrbR * 0.60;
      const _sdep = Math.sin(_sAng);
      const _sskR = s * (0.050 + _sdep * 0.012);
      const _sAlp = (_sdep > 0 ? 0.90 : 0.38);
      ctx.save();
      ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = s * 0.10 * _sAlp;
      ctx.strokeStyle = `rgba(255,200,30,${_sAlp})`; ctx.lineWidth = s * 0.006; ctx.lineCap = 'square';
      // Mini crown: base bar + 3 teeth
      ctx.beginPath();
      ctx.moveTo(_sox - _sskR * 0.55, _soy - _sskR * 0.82);
      ctx.lineTo(_sox - _sskR * 0.55, _soy - _sskR * 0.55);
      ctx.lineTo(_sox - _sskR * 0.18, _soy - _sskR * 0.55);
      ctx.lineTo(_sox, _soy - _sskR * 1.05);
      ctx.lineTo(_sox + _sskR * 0.18, _soy - _sskR * 0.55);
      ctx.lineTo(_sox + _sskR * 0.55, _soy - _sskR * 0.55);
      ctx.lineTo(_sox + _sskR * 0.55, _soy - _sskR * 0.82);
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.restore();
    });

    // Wider aura ring
    ctx.save(); ctx.shadowColor = '#33ff55'; ctx.shadowBlur = s * 0.18;
    ctx.strokeStyle = 'rgba(50,230,80,0.20)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, fY + s*0.014, s*0.60, s*0.088, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();

  } else if (_ncBranch === 'B') {
    // Dark Mage: floating hex sigil + purple-eyed skulls + dark fog

    // Purple eye overlays on all 3 orbiting skulls
    unit._ncSkulls.forEach(sk => {
      const _sAng = unit._ncT * 1.10 + sk.phase;
      const _sOrbR = s * 0.52 * sk.rBias;
      const _sox = cx + Math.cos(_sAng) * _sOrbR;
      const _soy = (headCY + robBot) / 2 + Math.sin(_sAng) * _sOrbR * 0.60;
      const _sdep = Math.sin(_sAng);
      const _sskR = s * (0.050 + _sdep * 0.012);
      const _sAlp = _sdep > 0 ? 0.92 : 0.38;
      ctx.save();
      ctx.shadowColor = '#bb22ff'; ctx.shadowBlur = s * 0.13 * _sAlp;
      // Darker skull tint (purple wash)
      ctx.fillStyle = `rgba(80,10,120,${_sAlp * 0.38})`;
      ctx.beginPath(); ctx.arc(_sox, _soy, _sskR * 1.05, 0, Math.PI*2); ctx.fill();
      // Purple eye override
      ctx.fillStyle = `rgba(200,55,255,${_sAlp})`;
      ctx.beginPath(); ctx.arc(_sox - _sskR*0.30, _soy - _sskR*0.08, _sskR*0.22, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(_sox + _sskR*0.30, _soy - _sskR*0.08, _sskR*0.22, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();
    });

    // Floating hex curse sigil beside body
    const _t = unit._ncT;
    const _sgX = cx + dir * s * 0.46;
    const _sgY = headCY - s * 0.10 + Math.sin(_t * 0.85) * s * 0.06;
    const _sgR = s * 0.09;
    ctx.save(); ctx.shadowColor = '#aa22ff'; ctx.shadowBlur = s * 0.15;
    ctx.strokeStyle = 'rgba(170,40,255,0.72)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (const rot of [0, Math.PI / 3]) {
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        const ang = rot + (k / 3) * Math.PI * 2;
        const _px = _sgX + Math.cos(ang) * _sgR, _py = _sgY + Math.sin(ang) * _sgR;
        if (k === 0) ctx.moveTo(_px, _py); else ctx.lineTo(_px, _py);
      }
      ctx.closePath(); ctx.stroke();
    }
    ctx.fillStyle = '#220040';
    ctx.beginPath(); ctx.arc(_sgX, _sgY, _sgR * 0.30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(200,80,255,0.55)';
    ctx.beginPath(); ctx.arc(_sgX, _sgY, _sgR * 0.14, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
    // Dark purple fog on ground
    ctx.fillStyle = 'rgba(50,10,80,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, fY + s*0.014, s*0.52, s*0.082, 0, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
  unit._hpBarY = stTopY - flH - s * 0.05;
}
