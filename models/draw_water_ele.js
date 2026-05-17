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
    unit._weT = 0; unit._weAp = 0; unit._weAbsorbT = 0;
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
  if (Math.abs(cx - unit._wePrevX) > 0.2)
    unit._weDir = cx > unit._wePrevX ? 1 : -1;
  unit._wePrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._weDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._weDir;

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

  const windUp  = atkActive && ap < 0.28  ? ap / 0.28 : 0;
  const spitT   = atkActive && ap > 0.28 && ap < 0.62 ? (ap-0.28)/0.34 : 0;
  const rebound = atkActive && ap > 0.62 ? Math.sin((ap-0.62)/0.38 * Math.PI) : 0;
  const sqX     = 1 - windUp * 0.12 + rebound * 0.04;
  const leanX   = (-dir) * (windUp * 0.08 - rebound * 0.05) * s;

  // ── Proportions (teardrop: narrow top → wide base) ───────────────
  const floatY   = Math.sin(unit._weT * 1.62) * s * 0.026;
  const headR    = s * 0.128;
  const headCY   = fY - s * 0.88 + floatY;
  const bodyTopY = headCY + headR * 0.55;
  const bodyBotY = fY - s * 0.045;
  const bodyH    = bodyBotY - bodyTopY;
  const bX       = cx + leanX;

  const wNeck = s * 0.080;
  const wShld = s * 0.190;
  const wMid  = s * 0.255;
  const wHip  = s * 0.305;
  const wBot  = s * 0.345;

  function widthAt(yy) {
    const t = Math.max(0, Math.min(1, (yy - bodyTopY) / bodyH));
    let w;
    if (t < 0.18)      w = wNeck + (wShld - wNeck) * (t / 0.18);
    else if (t < 0.48) w = wShld + (wMid  - wShld) * ((t - 0.18) / 0.30);
    else if (t < 0.80) w = wMid  + (wHip  - wMid)  * ((t - 0.48) / 0.32);
    else               w = wHip  + (wBot  - wHip)  * ((t - 0.80) / 0.20);
    return w * sqX;
  }

  ctx.save();

  // ── Big puddle with expanding ripple rings ───────────────────────
  ctx.fillStyle = 'rgba(0,60,140,0.42)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.010, s * 0.55, s * 0.082, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(30,110,200,0.38)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.008, s * 0.48, s * 0.066, 0, 0, Math.PI * 2);
  ctx.fill();
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
  function buildBody(shrink) {
    ctx.beginPath();
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const yy = bodyTopY + (i / steps) * bodyH;
      const ww = widthAt(yy) * shrink;
      const wob = Math.sin((yy * 0.09) + unit._weT * 2.40) * s * 0.020 * shrink;
      const px = bX - ww + wob;
      if (i === 0) ctx.moveTo(px, yy); else ctx.lineTo(px, yy);
    }
    ctx.quadraticCurveTo(bX - widthAt(bodyBotY) * shrink * 0.5, fY + s * 0.020,
                         bX, fY + s * 0.004);
    ctx.quadraticCurveTo(bX + widthAt(bodyBotY) * shrink * 0.5, fY + s * 0.020,
                         bX + widthAt(bodyBotY) * shrink, bodyBotY);
    for (let i = steps; i >= 0; i--) {
      const yy = bodyTopY + (i / steps) * bodyH;
      const ww = widthAt(yy) * shrink;
      const wob = Math.sin((yy * 0.09) + unit._weT * 2.40 + 1.8) * s * 0.020 * shrink;
      ctx.lineTo(bX + ww + wob, yy);
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
  for (let ri = 0; ri < 8; ri++) {
    const phase = ((ri / 8 + unit._weT * 0.34) % 1);
    const ry = bodyTopY + phase * bodyH;
    const rw = widthAt(ry) * 0.90;
    const rAlpha = Math.sin(phase * Math.PI) * 0.60;
    ctx.strokeStyle = `rgba(170,225,255,${rAlpha})`;
    ctx.lineWidth = s * 0.013;
    ctx.beginPath();
    ctx.ellipse(bX + Math.sin(unit._weT * 1.2 + ri) * s * 0.008, ry, rw, s * 0.015, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Inner bright vertical flow streak
  const flowGrad = ctx.createLinearGradient(bX - wHip * 0.6, bodyTopY, bX - wHip * 0.6, bodyBotY);
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
    const dx = bX + d.side * (dw + s * 0.008);
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
    const gx = cx + sp.off * s * 0.30 + sp.vx * s * lifeT;
    const gy = fY + s * 0.006 + (sp.vy * s * lifeT + 1.8 * s * lifeT * lifeT);
    if (gy < fY + s * 0.015) {
      ctx.fillStyle = `rgba(170,225,255,${sp.life * 0.80})`;
      ctx.beginPath();
      ctx.arc(gx, gy, s * 0.015 * sp.life, 0, Math.PI * 2); ctx.fill();
    }
  });

  // ── Head (water droplet sphere) ──────────────────────────────────
  if (inFight) {
    ctx.shadowColor = absorbActive ? '#c0f2ff' : '#38c8ff';
    ctx.shadowBlur  = s * (absorbActive ? 0.55 : 0.28);
  }
  ctx.fillStyle = 'rgba(20,80,160,0.85)';
  ctx.beginPath(); ctx.arc(bX, headCY, headR * 1.05, 0, Math.PI * 2); ctx.fill();
  const hGrad = ctx.createRadialGradient(bX - headR * 0.25, headCY - headR * 0.30, 0, bX, headCY, headR);
  hGrad.addColorStop(0,    'rgba(220,245,255,0.95)');
  hGrad.addColorStop(0.40, 'rgba(100,185,250,0.90)');
  hGrad.addColorStop(1,    'rgba(20,80,180,0.70)');
  ctx.fillStyle = hGrad;
  ctx.beginPath(); ctx.arc(bX, headCY, headR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(230,250,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(bX - headR * 0.32, headCY - headR * 0.35, headR * 0.35, headR * 0.20, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── Eyes ──────────────────────────────────────────────────────────
  const eyeRr = headR * 0.28;
  const eyeSp = headR * 0.45;
  const eyeYY = headCY - headR * 0.05;
  [-1, 1].forEach(side => {
    const ex = bX + side * eyeSp;
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

  // ── Mouth + charge orb (spit attack) ─────────────────────────────
  const mouthCX = bX + dir * headR * 0.50;
  const mouthY  = headCY + headR * 0.48;
  const mouthOpen = windUp * 0.75 + spitT * 0.45;
  if (mouthOpen > 0.05) {
    ctx.fillStyle = `rgba(0,20,50,${mouthOpen * 0.75})`;
    ctx.beginPath();
    ctx.ellipse(mouthCX, mouthY, headR * 0.16 * mouthOpen, headR * 0.22 * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    if (windUp > 0.2) {
      ctx.shadowColor = '#80e8ff'; ctx.shadowBlur = s * windUp * 0.40;
      ctx.fillStyle = `rgba(180,240,255,${windUp * 0.90})`;
      ctx.beginPath(); ctx.arc(mouthCX, mouthY, headR * 0.10 * windUp, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ── Water jet (spit attack) ──────────────────────────────────────
  const jetActive = atkActive && ap > 0.28 && ap < 0.82;
  if (jetActive) {
    const jProg = Math.min(1, (ap - 0.28) / 0.38);
    const jetMaxD = s * 1.35;
    const jetHead = mouthCX + dir * jProg * jetMaxD;
    const jetTail = mouthCX + dir * Math.max(0, jProg - 0.30) * jetMaxD;
    const jetTailC = dir > 0 ? Math.max(mouthCX, jetTail) : Math.min(mouthCX, jetTail);
    const jAlpha  = spitT > 0 ? 1.0 : 1.0 - (ap - 0.62) / 0.20;

    if (Math.abs(jetHead - jetTailC) > 2 && jAlpha > 0) {
      const jg = ctx.createLinearGradient(jetTailC, mouthY, jetHead, mouthY);
      jg.addColorStop(0,   'rgba(40,150,220,0)');
      jg.addColorStop(0.25,`rgba(70,190,255,${jAlpha * 0.78})`);
      jg.addColorStop(1,   `rgba(200,242,255,${jAlpha * 0.96})`);
      ctx.strokeStyle = jg; ctx.lineWidth = s * 0.090; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(jetTailC, mouthY); ctx.lineTo(jetHead, mouthY); ctx.stroke();
      const jg2 = ctx.createLinearGradient(jetTailC, mouthY, jetHead, mouthY);
      jg2.addColorStop(0,   'rgba(180,240,255,0)');
      jg2.addColorStop(0.4, `rgba(220,248,255,${jAlpha * 0.60})`);
      jg2.addColorStop(1,   `rgba(255,255,255,${jAlpha * 0.80})`);
      ctx.strokeStyle = jg2; ctx.lineWidth = s * 0.034;
      ctx.beginPath(); ctx.moveTo(jetTailC, mouthY); ctx.lineTo(jetHead, mouthY); ctx.stroke();

      ctx.shadowColor = '#80e8ff'; ctx.shadowBlur = s * 0.28;
      ctx.fillStyle = `rgba(140,225,255,${jAlpha * 0.75})`;
      ctx.beginPath(); ctx.arc(jetHead, mouthY, s * 0.046, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
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
  const _weBranch = unit._branch || '';
  if (_weBranch === 'A') {
    // Split: hairline fissure across body (showing where it'll divide)
    ctx.save(); ctx.shadowColor = '#aaddff'; ctx.shadowBlur = s * 0.08;
    ctx.strokeStyle = 'rgba(180,230,255,0.55)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    const _fY2 = headCY + s * 0.30;
    ctx.beginPath(); ctx.moveTo(bX - s*0.28, _fY2); ctx.lineTo(bX + s*0.28, _fY2); ctx.stroke();
    for (const xOff of [-0.10, 0.10]) {
      ctx.beginPath(); ctx.moveTo(bX + xOff*s, _fY2); ctx.lineTo(bX + xOff*s + s*0.04, _fY2 - s*0.22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bX + xOff*s, _fY2); ctx.lineTo(bX + xOff*s - s*0.04, _fY2 + s*0.18); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200,240,255,0.28)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bX - s*0.26, _fY2); ctx.lineTo(bX + s*0.26, _fY2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_weBranch === 'B') {
    // Bastion: shield bubble + regen glow halo
    ctx.save(); ctx.shadowColor = '#66aaff'; ctx.shadowBlur = s * 0.15;
    const _pu = 0.40 + Math.sin(_frameNow * 0.0018) * 0.14;
    ctx.strokeStyle = `rgba(100,180,255,${_pu * 0.70})`; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.ellipse(bX, headCY + s*0.18, s*0.42, s*0.55, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = `rgba(160,220,255,${_pu * 0.28})`; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(bX, headCY + s*0.18, s*0.50, s*0.63, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headCY - headR * 1.25 - s * 0.030;
}
