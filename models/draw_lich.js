// ═══════════════════════════════════════════════════════════════════════════
//  LICH — рівень 18, здібність: armor_pierce (ігнорує броню)
//  Король-ліч: багатоконечна корона з самоцвітами, плаваючий філактерій
//  (пульсуючий кристал), піднятий комір мантії, посох із черепом + фіолетове
//  полум'я, 4 орбітальні руни, пробивний спіральний болт.
// ═══════════════════════════════════════════════════════════════════════════
function drawLichMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._lcLastT || _frameNow)) / 1000, 0.05);
  unit._lcLastT = _frameNow;

  if (unit._lcDir === undefined) {
    unit._lcDir = 1; unit._lcPrevX = cx;
    unit._lcPrevAcd = unit.attackCooldown;
    unit._lcT = 0; unit._lcAp = 0;
    // Orbiting runes (4 symbols around body)
    unit._lcRunes = Array.from({length: 4}, (_, i) => ({
      phase: (i / 4) * Math.PI * 2
    }));
  }
  if (Math.abs(cx - unit._lcPrevX) > 0.2)
    unit._lcDir = cx > unit._lcPrevX ? 1 : -1;
  unit._lcPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._lcDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._lcDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._lcPrevAcd || 0) + 3) unit._lcAp = 1.0;
  unit._lcPrevAcd = acd;
  unit._lcT += dt;

  const atkDur = Math.min(0.64, atkBase / 60 * 0.82);
  if (unit._lcAp > 0) unit._lcAp = Math.max(0, unit._lcAp - dt / atkDur);

  const atkActive = unit._lcAp > 0;
  const ap        = 1 - unit._lcAp;
  const inFight   = unit.state === 'fight' || atkActive;

  const chargeT = atkActive && ap < 0.28 ? ap / 0.28 : 0;
  const boltT   = atkActive && ap >= 0.28 && ap < 0.68 ? (ap - 0.28) / 0.40 : 0;

  // Proportions
  const robeW  = s * 0.600;
  const robeH  = s * 0.550;
  const legH   = s * 0.140;
  const headR  = s * 0.200;
  const neckH  = s * 0.040;
  const collarH = s * 0.150;
  const crownH  = s * 0.135;

  const floatY = Math.sin(unit._lcT * 1.15) * s * 0.038;
  const bX = cx;
  const robBot = fY - legH + floatY;
  const robTop = robBot - robeH;
  const collarTop = robTop - collarH;
  const neckTop = collarTop - neckH;
  const headCY = neckTop - headR * 0.85;
  const crownBot = headCY - headR * 0.92;
  const tilt = dir * s * 0.014;

  ctx.save();

  // ── Ground dark circle with purple runes ─────────────────────────
  const auraPulse = 0.40 + Math.sin(unit._lcT * 1.5) * 0.18;
  ctx.fillStyle = `rgba(30,0,50,${auraPulse * 0.55})`;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.46, s * 0.068, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(160,0,255,${auraPulse * 0.70})`;
  ctx.lineWidth = s * 0.011;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.42, s * 0.062, 0, 0, Math.PI * 2); ctx.stroke();

  // ── Robe ──────────────────────────────────────────────────────────
  const hemL = Math.sin(unit._lcT * 1.0) * s * 0.025;
  const hemR = Math.sin(unit._lcT * 1.0 + 1.5) * s * 0.022;
  if (inFight) {
    ctx.shadowColor = '#8800ee'; ctx.shadowBlur = s * 0.24;
  }
  ctx.fillStyle = '#0d0218';
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.55 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX + robeW * 0.55 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX + robeW * 0.96,         robBot + s * 0.005 + hemR);
  ctx.lineTo(bX + robeW * 0.55,         robBot + s * 0.015 + hemR * 0.7);
  ctx.lineTo(bX + robeW * 0.15,         robBot + s * 0.020);
  ctx.lineTo(bX - robeW * 0.15,         robBot + s * 0.020);
  ctx.lineTo(bX - robeW * 0.55,         robBot + s * 0.015 + hemL * 0.7);
  ctx.lineTo(bX - robeW * 0.94,         robBot + s * 0.005 + hemL);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#220040';
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.42 + tilt, robTop + robeH * 0.05);
  ctx.lineTo(bX + robeW * 0.42 + tilt, robTop + robeH * 0.05);
  ctx.lineTo(bX + robeW * 0.78,         robBot - s * 0.025);
  ctx.lineTo(bX - robeW * 0.78,         robBot - s * 0.025);
  ctx.closePath(); ctx.fill();
  // Gold trim along outer edges
  ctx.strokeStyle = '#aa8833';
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.moveTo(bX - robeW * 0.55 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX - robeW * 0.94,         robBot + s * 0.005 + hemL);
  ctx.moveTo(bX + robeW * 0.55 + tilt, robTop + s * 0.010);
  ctx.lineTo(bX + robeW * 0.96,         robBot + s * 0.005 + hemR);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Phylactery (floating crystal near chest) ─────────────────────
  const phX = bX + tilt;
  const phY = robTop + robeH * 0.30 + Math.sin(unit._lcT * 2.2) * s * 0.020;
  const phPulse = 0.55 + Math.sin(unit._lcT * 2.5) * 0.25 + chargeT * 0.35;
  ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = s * phPulse * 0.45;
  // Crystal shape (hexagonal)
  const phR = s * 0.060;
  ctx.fillStyle = `rgba(180,40,240,${phPulse})`;
  ctx.beginPath();
  for (let pi = 0; pi < 6; pi++) {
    const pa = pi * Math.PI / 3 - Math.PI / 2;
    const px = phX + Math.cos(pa) * phR;
    const py = phY + Math.sin(pa) * phR * 1.25;
    if (pi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  // Inner brighter
  ctx.fillStyle = `rgba(240,180,255,${phPulse * 0.85})`;
  ctx.beginPath();
  for (let pi = 0; pi < 6; pi++) {
    const pa = pi * Math.PI / 3 - Math.PI / 2;
    const px = phX + Math.cos(pa) * phR * 0.55;
    const py = phY + Math.sin(pa) * phR * 0.70;
    if (pi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  // Highlight star in center
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(phX - phR * 0.15, phY - phR * 0.15, phR * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Staff ─────────────────────────────────────────────────────────
  const stX = bX + dir * robeW * 0.65 + tilt;
  const stBotY = robBot + s * 0.020;
  const stTopY = headCY - headR * 2.05;
  ctx.strokeStyle = '#0c0220'; ctx.lineWidth = s * 0.046; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(stX, stBotY); ctx.lineTo(stX, stTopY); ctx.stroke();
  ctx.strokeStyle = '#2e0a48'; ctx.lineWidth = s * 0.020;
  ctx.beginPath(); ctx.moveTo(stX + dir * s * 0.008, stBotY); ctx.lineTo(stX + dir * s * 0.008, stTopY); ctx.stroke();
  // Gold bands
  ctx.strokeStyle = '#aa8833'; ctx.lineWidth = s * 0.008;
  for (let bi = 0; bi < 4; bi++) {
    const by = stBotY - bi * s * 0.13 - s * 0.05;
    ctx.beginPath(); ctx.moveTo(stX - s * 0.028, by); ctx.lineTo(stX + s * 0.028, by); ctx.stroke();
  }
  // Skull on top
  const skR = s * 0.078;
  ctx.shadowColor = '#bb00ee'; ctx.shadowBlur = s * (0.28 + chargeT * 0.30);
  ctx.fillStyle = '#d4c8a8';
  ctx.beginPath(); ctx.arc(stX, stTopY, skR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a89880';
  ctx.beginPath(); ctx.arc(stX, stTopY + skR * 0.45, skR * 0.72, 0, Math.PI); ctx.fill();
  // Skull eyes (purple)
  ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = s * 0.20;
  ctx.fillStyle = `rgba(200,40,255,${0.88 + chargeT * 0.12})`;
  ctx.beginPath(); ctx.arc(stX - skR * 0.30, stTopY - skR * 0.08, skR * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(stX + skR * 0.30, stTopY - skR * 0.08, skR * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Purple flame on top of skull
  const flick = 0.85 + Math.sin(unit._lcT * 7) * 0.15;
  const flH = s * 0.17 * flick * (1 + chargeT * 0.35);
  ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = s * 0.40;
  const flGrad = ctx.createLinearGradient(stX, stTopY - skR * 0.8, stX, stTopY - skR - flH);
  flGrad.addColorStop(0,   'rgba(180,0,255,0.88)');
  flGrad.addColorStop(0.5, 'rgba(220,100,255,0.72)');
  flGrad.addColorStop(1,   'rgba(255,200,255,0)');
  ctx.fillStyle = flGrad;
  ctx.beginPath();
  ctx.moveTo(stX - s * 0.050, stTopY - skR * 0.9);
  ctx.quadraticCurveTo(stX - s * 0.030, stTopY - skR - flH * 0.6,
                        stX + Math.sin(unit._lcT * 3) * s * 0.020, stTopY - skR - flH);
  ctx.quadraticCurveTo(stX + s * 0.030, stTopY - skR - flH * 0.6,
                        stX + s * 0.050, stTopY - skR * 0.9);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Casting bone hand (off-dir side) ─────────────────────────────
  const hSide = -dir;
  const handX = bX + hSide * robeW * 0.48 + tilt;
  const handY = robTop + robeH * (0.42 - chargeT * 0.18);
  const handEndX = handX + hSide * s * (0.15 + chargeT * 0.08);
  const handEndY = handY - s * (0.02 + chargeT * 0.12);
  ctx.strokeStyle = '#0c0220'; ctx.lineWidth = s * 0.052; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handEndX, handEndY); ctx.stroke();
  ctx.fillStyle = '#d4c8a8';
  ctx.beginPath(); ctx.arc(handEndX, handEndY, s * 0.030, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b8aa88'; ctx.lineWidth = s * 0.014;
  for (let fi = 0; fi < 4; fi++) {
    const fAng = (fi - 1.5) * 0.30 + hSide * 0.4;
    const fEndX = handEndX + Math.cos(fAng) * s * 0.060;
    const fEndY = handEndY + Math.sin(fAng) * s * 0.060;
    ctx.beginPath(); ctx.moveTo(handEndX, handEndY); ctx.lineTo(fEndX, fEndY); ctx.stroke();
  }
  if (chargeT > 0.15) {
    ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = s * chargeT * 0.45;
    const cg = ctx.createRadialGradient(handEndX, handEndY, 0, handEndX, handEndY, s * 0.055 * chargeT);
    cg.addColorStop(0, `rgba(240,160,255,${chargeT * 0.95})`);
    cg.addColorStop(0.5, `rgba(180,0,255,${chargeT * 0.85})`);
    cg.addColorStop(1, 'rgba(60,0,120,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(handEndX, handEndY, s * 0.055 * chargeT, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── 4 orbiting rune glyphs around body ───────────────────────────
  unit._lcRunes.forEach(rn => {
    const ang = unit._lcT * 0.85 + rn.phase;
    const orbR = s * 0.55;
    const ox = cx + Math.cos(ang) * orbR;
    const oy = (headCY + robBot) / 2 + Math.sin(ang) * orbR * 0.55;
    const depth = Math.sin(ang);
    const runeAlpha = depth > 0 ? 0.88 : 0.38;
    ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = s * 0.14;
    ctx.strokeStyle = `rgba(200,100,255,${runeAlpha})`;
    ctx.lineWidth = s * 0.012;
    // Draw a pentagram-like rune
    ctx.beginPath();
    for (let pi = 0; pi < 5; pi++) {
      const pa = pi * Math.PI * 2 / 5 - Math.PI / 2;
      const prx = ox + Math.cos(pa) * s * 0.022;
      const pry = oy + Math.sin(pa) * s * 0.022;
      if (pi === 0) ctx.moveTo(prx, pry);
      const pa2 = (pi + 2) * Math.PI * 2 / 5 - Math.PI / 2;
      const prx2 = ox + Math.cos(pa2) * s * 0.022;
      const pry2 = oy + Math.sin(pa2) * s * 0.022;
      ctx.lineTo(prx2, pry2);
    }
    ctx.closePath(); ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // ── High collar (regal) ──────────────────────────────────────────
  ctx.fillStyle = '#0a0012';
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.22 + tilt, robTop + s * 0.005);
  ctx.lineTo(bX - s * 0.28 + tilt, collarTop);
  ctx.lineTo(bX - s * 0.080 + tilt, collarTop - s * 0.020);
  ctx.lineTo(bX + s * 0.080 + tilt, collarTop - s * 0.020);
  ctx.lineTo(bX + s * 0.28 + tilt, collarTop);
  ctx.lineTo(bX + s * 0.22 + tilt, robTop + s * 0.005);
  ctx.closePath(); ctx.fill();
  // Gold collar trim
  ctx.strokeStyle = '#aa8833'; ctx.lineWidth = s * 0.010;
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.28 + tilt, collarTop);
  ctx.lineTo(bX - s * 0.080 + tilt, collarTop - s * 0.020);
  ctx.lineTo(bX + s * 0.080 + tilt, collarTop - s * 0.020);
  ctx.lineTo(bX + s * 0.28 + tilt, collarTop);
  ctx.stroke();

  // Neck
  ctx.fillStyle = '#140828';
  ctx.beginPath();
  ctx.moveTo(bX - s * 0.075 + tilt, collarTop - s * 0.018);
  ctx.lineTo(bX + s * 0.075 + tilt, collarTop - s * 0.018);
  ctx.lineTo(bX + s * 0.070 + tilt, neckTop);
  ctx.lineTo(bX - s * 0.070 + tilt, neckTop);
  ctx.closePath(); ctx.fill();

  // ── Skull head ───────────────────────────────────────────────────
  if (inFight) {
    ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = s * 0.28;
  }
  ctx.fillStyle = '#c8bca0';
  ctx.beginPath(); ctx.arc(bX + tilt, headCY, headR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ddd0b8';
  ctx.beginPath(); ctx.arc(bX + tilt - headR * 0.18, headCY - headR * 0.22, headR * 0.75, 0, Math.PI * 2); ctx.fill();
  // Jaw shadow
  ctx.fillStyle = '#968866';
  ctx.beginPath(); ctx.arc(bX + tilt, headCY + headR * 0.55, headR * 0.62, 0, Math.PI); ctx.fill();
  // Cheekbones
  [-1, 1].forEach(side => {
    ctx.fillStyle = '#b4a888';
    ctx.beginPath();
    ctx.ellipse(bX + tilt + side * headR * 0.52, headCY + headR * 0.22, headR * 0.28, headR * 0.18, side * 0.3, 0, Math.PI * 2); ctx.fill();
  });
  // Nasal void
  ctx.fillStyle = '#1a0810';
  ctx.beginPath();
  ctx.ellipse(bX + tilt, headCY + headR * 0.20, headR * 0.13, headR * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  // Teeth
  ctx.fillStyle = '#d4c8b0';
  for (let ti = -2; ti <= 2; ti++) {
    ctx.fillRect(bX + tilt + ti * headR * 0.14 - s * 0.010, headCY + headR * 0.50, s * 0.020, s * 0.044);
  }
  ctx.shadowBlur = 0;

  // Eyes (purple deep glow)
  const eyeRr = headR * 0.24;
  const eyeSp = headR * 0.44;
  const eyeYY = headCY - headR * 0.04;
  [-1, 1].forEach(side => {
    const ex = bX + tilt + side * eyeSp;
    const eFl = chargeT > 0.3 ? (chargeT - 0.3) * 1.3 : 0;
    ctx.fillStyle = '#0a0010';
    ctx.beginPath(); ctx.arc(ex, eyeYY, eyeRr * 1.20, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = s * (eFl > 0.3 ? 0.45 : inFight ? 0.30 : 0.18);
    ctx.fillStyle = eFl > 0.5 ? '#ff88ff' : inFight ? '#cc44ff' : '#8800bb';
    ctx.beginPath(); ctx.arc(ex, eyeYY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(240,200,255,0.55)';
    ctx.beginPath(); ctx.arc(ex - eyeRr * 0.30, eyeYY - eyeRr * 0.30, eyeRr * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── Multi-pointed crown ──────────────────────────────────────────
  const crownPoints = 5;
  ctx.fillStyle = '#aa8833';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - headR * 0.85, crownBot + crownH * 0.6);
  for (let ci = 0; ci <= crownPoints * 2; ci++) {
    const isPoint = ci % 2 === 1;
    const pxBase = bX + tilt - headR * 0.85 + (ci / (crownPoints * 2)) * headR * 1.70;
    const pyBase = crownBot + (isPoint ? -crownH * 0.20 : crownH * 0.55);
    ctx.lineTo(pxBase, pyBase);
  }
  ctx.lineTo(bX + tilt + headR * 0.85, crownBot + crownH * 0.6);
  ctx.lineTo(bX + tilt + headR * 0.85, crownBot + crownH);
  ctx.lineTo(bX + tilt - headR * 0.85, crownBot + crownH);
  ctx.closePath(); ctx.fill();
  // Gold highlight
  ctx.fillStyle = '#d4a855';
  ctx.fillRect(bX + tilt - headR * 0.80, crownBot + crownH * 0.5, headR * 1.60, s * 0.010);
  // Crown gems (purple)
  ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = s * 0.20;
  for (let gi = 0; gi < 3; gi++) {
    const gx = bX + tilt + (gi - 1) * headR * 0.45;
    const gy = crownBot + crownH * 0.72;
    ctx.fillStyle = `rgba(200,60,255,${0.85 + Math.sin(unit._lcT * 2 + gi) * 0.12})`;
    ctx.beginPath(); ctx.arc(gx, gy, s * 0.020, 0, Math.PI * 2); ctx.fill();
  }
  // Central tall spike (with big gem)
  ctx.fillStyle = '#aa8833';
  ctx.beginPath();
  ctx.moveTo(bX + tilt - s * 0.030, crownBot);
  ctx.lineTo(bX + tilt, crownBot - s * 0.095);
  ctx.lineTo(bX + tilt + s * 0.030, crownBot);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(240,100,255,${0.90 + Math.sin(unit._lcT * 2.2) * 0.10})`;
  ctx.beginPath(); ctx.arc(bX + tilt, crownBot - s * 0.030, s * 0.018, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Armor-pierce bolt (spiral spike) ─────────────────────────────
  const boltActive = atkActive && ap > 0.28 && ap < 0.86;
  if (boltActive) {
    const progress = Math.min(1, (ap - 0.28) / 0.42);
    const boltMaxD = s * 1.80;
    const originX = handEndX;
    const originY = handEndY;
    const tipX = originX + dir * progress * boltMaxD;
    const tipY = originY + (bX - originX) * progress * 0.3;
    const tailX = originX + dir * Math.max(0, progress - 0.25) * boltMaxD;
    const jAlpha = boltT > 0 ? 1.0 : 1.0 - (ap - 0.68) / 0.18;

    if (jAlpha > 0) {
      // Main bolt with spiral pattern
      ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = s * 0.34 * jAlpha;
      // Outer glow
      const bG = ctx.createLinearGradient(tailX, originY, tipX, tipY);
      bG.addColorStop(0, 'rgba(80,0,160,0)');
      bG.addColorStop(0.2, `rgba(160,0,240,${jAlpha * 0.80})`);
      bG.addColorStop(1, `rgba(240,180,255,${jAlpha * 0.95})`);
      ctx.strokeStyle = bG; ctx.lineWidth = s * 0.068; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tailX, originY); ctx.lineTo(tipX, tipY); ctx.stroke();
      // Spiral dual strand
      for (let si = 0; si < 2; si++) {
        const off = (si === 0 ? 1 : -1) * s * 0.028;
        ctx.strokeStyle = `rgba(220,100,255,${jAlpha * 0.88})`;
        ctx.lineWidth = s * 0.018;
        ctx.beginPath();
        const segN = 12;
        for (let si2 = 0; si2 <= segN; si2++) {
          const tt = si2 / segN;
          const px2 = tailX + (tipX - tailX) * tt;
          const py2 = originY + (tipY - originY) * tt + Math.sin(tt * Math.PI * 3 + (si === 0 ? 0 : Math.PI)) * off;
          if (si2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
        }
        ctx.stroke();
      }
      // Piercing spike tip (arrow shape)
      ctx.fillStyle = `rgba(255,240,255,${jAlpha * 0.95})`;
      ctx.beginPath();
      ctx.moveTo(tipX + dir * s * 0.060, tipY);
      ctx.lineTo(tipX - dir * s * 0.030, tipY - s * 0.030);
      ctx.lineTo(tipX - dir * s * 0.030, tipY + s * 0.030);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _lcBranch = unit._branch || '';
  if (_lcBranch === 'A') {
    // Archlich: enhanced bolt sight-line + crown power surge
    ctx.save(); ctx.shadowColor = '#ff88ff'; ctx.shadowBlur = s * 0.20;
    // Extra penetrating aura around crown
    const _pu = 0.55 + Math.sin(unit._lcT * 2.2) * 0.22;
    ctx.strokeStyle = `rgba(255,100,255,${_pu * 0.55})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(bX, crownBot + s*0.06, s*0.24, s*0.06, 0, 0, Math.PI*2); ctx.stroke();
    // Armor-pierce indicator: thin white line through body center (vertical)
    ctx.strokeStyle = `rgba(255,220,255,${_pu * 0.40})`; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(bX, crownBot); ctx.lineTo(bX, fY); ctx.stroke();
    ctx.setLineDash([]);
    // 5th orbiting rune (larger)
    const _ra5 = unit._lcT * 1.25 + Math.PI * 1.60;
    const _r5 = s * 0.36;
    const _r5x = bX + Math.cos(_ra5) * _r5, _r5y = headCY + s*0.22 + Math.sin(_ra5) * _r5 * 0.42;
    ctx.fillStyle = 'rgba(255,180,255,0.72)';
    ctx.beginPath(); ctx.arc(_r5x, _r5y, s * 0.032, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_lcBranch === 'B') {
    // Necros: lifesteal aura + death wisps reaching from robe edges
    const _t = unit._lcT;
    ctx.save(); ctx.shadowColor = '#550000'; ctx.shadowBlur = s * 0.15;
    // Dark life-drain ring
    const _da = 0.30 + Math.sin(_t * 1.3) * 0.10;
    ctx.strokeStyle = `rgba(100,0,0,${_da})`; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(bX, headCY, s * 0.32, s * 0.32, 0, 0, Math.PI*2); ctx.stroke();
    // Death wisps from robe bottom
    ctx.strokeStyle = 'rgba(80,0,20,0.45)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const _wa = _t * (0.7 + i*0.25) + i * Math.PI * 0.66;
      const _wx = bX + (i-1) * s * 0.18;
      const _wy = robBot - s * 0.04;
      ctx.beginPath();
      ctx.moveTo(_wx, _wy);
      ctx.quadraticCurveTo(_wx + Math.cos(_wa)*s*0.12, _wy - s*0.12, _wx + Math.cos(_wa+1.2)*s*0.18, _wy - s*0.22);
      ctx.stroke();
    }
    ctx.shadowBlur = 0; ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = crownBot - s * 0.10;
}
