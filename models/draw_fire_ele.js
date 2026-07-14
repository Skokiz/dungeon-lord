// ═══════════════════════════════════════════════════════════════════════════
//  FIRE ELEMENTAL — рівень 14, здібність: explode (AoE вибух при смерті)
//  Справжнє полум'я: широкий низ → язики догори, висхідні іскри, тлінь під ногами.
// ═══════════════════════════════════════════════════════════════════════════
function drawFireEleMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._feLastT || _frameNow)) / 1000, 0.05);
  unit._feLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._feDir === undefined) {
    unit._feDir = 1; unit._fePrevX = cx;
    unit._fePrevAcd = unit.attackCooldown;
    unit._feT = 0; unit._feAp = 0;
    unit._feSeed = Math.random() * 100;
    unit._feEmbers = Array.from({length: 10}, () => ({
      x:    (Math.random() - 0.5) * 0.6,
      y:    Math.random(),
      vx:   (Math.random() - 0.5) * 0.15,
      vy:   -0.6 - Math.random() * 0.35,
      life: Math.random(),
      size: 0.5 + Math.random() * 0.6
    }));
    unit._feTongues = Array.from({length: 5}, (_, i) => ({
      off:   (i - 2) * 0.28,
      phase: Math.random() * Math.PI * 2,
      freq:  2.0 + Math.random() * 1.8,
      heightBias: 0.85 + Math.random() * 0.30
    }));
  }
  if (Math.abs(cx - unit._fePrevX) > 0.2)
    unit._feDir = cx > unit._fePrevX ? 1 : -1;
  unit._fePrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._feDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._feDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._fePrevAcd || 0) + 3) unit._feAp = 1.0;
  unit._fePrevAcd = acd;
  unit._feT += dt;

  const atkDur = Math.min(0.62, atkBase / 60 * 0.78);
  if (unit._feAp > 0) unit._feAp = Math.max(0, unit._feAp - dt / atkDur);

  const atkActive = unit._feAp > 0;
  const ap        = 1 - unit._feAp;
  const inFight   = unit.state === 'fight' || atkActive;

  // Attack phases
  const chargeT = atkActive && ap < 0.28 ? ap / 0.28 : 0;
  const throwT  = atkActive && ap >= 0.28 && ap < 0.68 ? (ap - 0.28) / 0.40 : 0;
  const recoilT = atkActive && ap >= 0.68 ? Math.sin((ap - 0.68) / 0.32 * Math.PI) : 0;

  // ── Geometry: flame-shaped silhouette (wide base, tapers up) ─────
  const baseHalfW = s * 0.34;
  const flameTopBase = fY - s * 0.88;
  const flameTopY = flameTopBase - chargeT * s * 0.04 + recoilT * s * 0.05;
  const flameBotY = fY - s * 0.015;
  const bX = cx;
  const coreCY = (flameTopY * 0.62 + flameBotY * 0.38);

  ctx.save();

  // ── Burning coal base (ground glow) ──────────────────────────────
  ctx.shadowColor = '#ff6600'; ctx.shadowBlur = s * 0.32;
  const coalGrad = ctx.createRadialGradient(cx, fY + s * 0.01, 0, cx, fY + s * 0.01, s * 0.48);
  coalGrad.addColorStop(0,    'rgba(255,220,80,0.85)');
  coalGrad.addColorStop(0.4,  'rgba(255,120,0,0.60)');
  coalGrad.addColorStop(1,    'rgba(100,0,0,0)');
  ctx.fillStyle = coalGrad;
  ctx.beginPath(); ctx.ellipse(cx, fY + s * 0.012, s * 0.48, s * 0.085, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Embers on ground (static glow dots)
  for (let gi = 0; gi < 5; gi++) {
    const ga = (gi / 5) * Math.PI * 2 + unit._feSeed;
    const gr = s * (0.18 + 0.12 * Math.sin(unit._feT * 1.5 + gi));
    const gx = cx + Math.cos(ga) * gr;
    const gy = fY + s * 0.010 + Math.sin(ga) * s * 0.025;
    const gPulse = 0.55 + 0.30 * Math.sin(unit._feT * 3 + gi * 1.3);
    ctx.fillStyle = `rgba(255,${Math.floor(140 + gPulse * 80)},0,${gPulse})`;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = s * 0.12;
    ctx.beginPath(); ctx.arc(gx, gy, s * 0.016, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Flame body builder (flame silhouette path) ───────────────────
  // Flame silhouette uses a tongue with sine wobble — draws one large flame
  function drawFlameLayer(halfW, topY, botY, offXFactor, phase, lobes, fillStyle, alpha) {
    const topYJit = topY + Math.sin(unit._feT * 3 + phase) * s * 0.020;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    const steps = 20;
    // Left side up
    for (let i = 0; i <= steps; i++) {
      const tt = i / steps;
      const yy = botY - tt * (botY - topYJit);
      // Width tapers: at tt=0 (bottom) = halfW, at tt=1 (top) = 0
      // Non-linear: narrower faster near top
      const taper = Math.pow(1 - tt, 1.3);
      const wob = Math.sin(tt * lobes * Math.PI + unit._feT * 3.5 + phase) * s * 0.030 * (1 - tt * 0.6);
      const offX = offXFactor * s * 0.05 * Math.sin(tt * Math.PI * 0.7 + unit._feT * 1.6);
      const px = bX + offX - halfW * taper + wob;
      if (i === 0) ctx.moveTo(px, yy); else ctx.lineTo(px, yy);
    }
    // Right side down
    for (let i = steps; i >= 0; i--) {
      const tt = i / steps;
      const yy = botY - tt * (botY - topYJit);
      const taper = Math.pow(1 - tt, 1.3);
      const wob = Math.sin(tt * lobes * Math.PI + unit._feT * 3.5 + phase + 1.8) * s * 0.030 * (1 - tt * 0.6);
      const offX = offXFactor * s * 0.05 * Math.sin(tt * Math.PI * 0.7 + unit._feT * 1.6);
      const px = bX + offX + halfW * taper + wob;
      ctx.lineTo(px, yy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Body shadow glow
  if (inFight) {
    ctx.shadowColor = chargeT > 0.5 ? '#ffcc00' : '#ff5500';
    ctx.shadowBlur  = s * (chargeT > 0.5 ? 0.58 : 0.32);
  }
  // 3 layers: outer dark red, mid orange, inner yellow
  drawFlameLayer(baseHalfW * 1.06, flameTopY - s * 0.02, flameBotY + s * 0.01, 0, unit._feSeed, 3, '#5a1000', 0.88);
  drawFlameLayer(baseHalfW * 0.92, flameTopY + s * 0.02, flameBotY - s * 0.005, 0.6, unit._feSeed + 1.3, 4, '#cc3a00', 0.92);
  drawFlameLayer(baseHalfW * 0.68, flameTopY + s * 0.08, flameBotY - s * 0.05, -0.5, unit._feSeed + 2.7, 5, '#ff8800', 0.80);
  // Bright inner hot yellow
  drawFlameLayer(baseHalfW * 0.42, flameTopY + s * 0.15, flameBotY - s * 0.12, 0.3, unit._feSeed + 4.1, 6, `rgba(255,${Math.floor(220 + chargeT * 35)},${Math.floor(50 + chargeT * 80)},0.90)`, 0.85);
  ctx.shadowBlur = 0;

  // ── Separate flame tongues leaping off top ───────────────────────
  unit._feTongues.forEach((tg, ti) => {
    const tX = bX + tg.off * baseHalfW * 0.95;
    const tBaseY = flameTopY - s * 0.04;
    const tH = s * (0.18 + 0.08 * Math.sin(unit._feT * tg.freq + tg.phase)) * tg.heightBias * (1 + chargeT * 0.35);
    const tW = s * (0.048 + 0.015 * Math.sin(unit._feT * 2.8 + ti));
    const tTopX = tX + Math.sin(unit._feT * 2.5 + tg.phase) * s * 0.020;
    const tTopY = tBaseY - tH;

    ctx.save();
    ctx.shadowColor = '#ff9900'; ctx.shadowBlur = s * 0.24;
    const tgrad = ctx.createLinearGradient(tX, tBaseY, tTopX, tTopY);
    tgrad.addColorStop(0,   'rgba(255,80,0,0.85)');
    tgrad.addColorStop(0.5, 'rgba(255,170,20,0.75)');
    tgrad.addColorStop(1,   'rgba(255,235,80,0)');
    ctx.fillStyle = tgrad;
    ctx.beginPath();
    ctx.moveTo(tX - tW, tBaseY);
    ctx.quadraticCurveTo(tX - tW * 1.3, (tBaseY + tTopY) / 2 + s * 0.025, tTopX, tTopY);
    ctx.quadraticCurveTo(tX + tW * 1.3, (tBaseY + tTopY) / 2 + s * 0.025, tX + tW, tBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // ── Rising embers ────────────────────────────────────────────────
  unit._feEmbers.forEach(em => {
    em.life -= dt * 0.55;
    em.x += em.vx * dt * 0.8;
    em.y += em.vy * dt * 0.8;
    if (em.life <= 0 || em.y < -0.2) {
      em.life = 1;
      em.x = (Math.random() - 0.5) * 0.6;
      em.y = 0.9 + Math.random() * 0.1;
      em.vx = (Math.random() - 0.5) * 0.15;
      em.vy = -0.6 - Math.random() * 0.35;
      em.size = 0.5 + Math.random() * 0.6;
    }
    const ex = bX + em.x * baseHalfW;
    const ey = flameBotY - (1 - em.y) * (flameBotY - flameTopY) * 1.2;
    const eAlpha = em.life * 0.85;
    ctx.shadowColor = '#ff7700'; ctx.shadowBlur = s * 0.14;
    const emColor = em.life > 0.6 ? 'rgba(255,230,120,' : em.life > 0.3 ? 'rgba(255,140,30,' : 'rgba(200,40,0,';
    ctx.fillStyle = emColor + eAlpha + ')';
    ctx.beginPath(); ctx.arc(ex, ey, s * 0.014 * em.size, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── Core plasma heart (inside body) ──────────────────────────────
  const coreR = s * 0.135;
  const glow  = 0.72 + Math.sin(unit._feT * 2.0) * 0.18 + chargeT * 0.30;
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur  = s * (0.32 + glow * 0.24);
  const cGrad = ctx.createRadialGradient(bX - coreR * 0.2, coreCY - coreR * 0.2, 0, bX, coreCY, coreR);
  cGrad.addColorStop(0,    `rgba(255,252,200,${glow * 0.95})`);
  cGrad.addColorStop(0.40, `rgba(255,170,30,${glow * 0.90})`);
  cGrad.addColorStop(1,    `rgba(200,40,0,${glow * 0.55})`);
  ctx.fillStyle = cGrad;
  ctx.beginPath(); ctx.arc(bX, coreCY, coreR, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Eyes ──────────────────────────────────────────────────────────
  const eyeRr = coreR * 0.32;
  const eyeSp = coreR * 0.64;
  const eyeYY = coreCY - coreR * 0.10;
  [-1, 1].forEach(side => {
    const ex = bX + side * eyeSp;
    const eyeFlash = chargeT > 0.5 ? (chargeT - 0.5) * 2 : 0;
    ctx.shadowColor = eyeFlash > 0.4 ? '#ffffaa' : '#ff8800';
    ctx.shadowBlur  = s * (eyeFlash > 0.4 ? 0.48 : inFight ? 0.28 : 0.14);
    ctx.fillStyle = eyeFlash > 0.5 ? '#fffce0' : inFight ? '#ffcc44' : '#ff8820';
    ctx.beginPath(); ctx.arc(ex, eyeYY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(40,5,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(ex + dir * eyeRr * 0.18, eyeYY, eyeRr * 0.26, eyeRr * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,252,200,${0.48 + eyeFlash * 0.30})`;
    ctx.beginPath(); ctx.arc(ex - eyeRr * 0.30, eyeYY - eyeRr * 0.28, eyeRr * 0.18, 0, Math.PI * 2); ctx.fill();
  });

  // ── Charge orb in mouth (wind-up) ────────────────────────────────
  if (chargeT > 0.12) {
    const orbX = bX + dir * coreR * 0.55;
    const orbY = coreCY + coreR * 0.30;
    const orbR = s * 0.060 * chargeT;
    ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = s * chargeT * 0.50;
    const oGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR);
    oGrad.addColorStop(0, `rgba(255,252,180,${chargeT * 0.95})`);
    oGrad.addColorStop(0.5, `rgba(255,160,0,${chargeT * 0.85})`);
    oGrad.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = oGrad;
    ctx.beginPath(); ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Fireball (throw phase) ───────────────────────────────────────
  const ballActive = atkActive && ap > 0.28 && ap < 0.88;
  if (ballActive) {
    const progress  = Math.min(1, (ap - 0.28) / 0.44);
    const ballMaxD  = s * 1.70;
    const originX   = bX + dir * baseHalfW * 0.40;
    const originY   = coreCY + s * 0.02;
    const ballX     = originX + dir * progress * ballMaxD;
    const ballY     = originY - Math.sin(progress * Math.PI) * s * 0.12;
    const tailX     = originX + dir * Math.max(0, progress - 0.28) * ballMaxD;
    const jAlpha    = throwT > 0 ? 1.0 : 1.0 - (ap - 0.68) / 0.20;
    const ballR     = s * (0.070 - progress * 0.018);

    if (jAlpha > 0) {
      const tg = ctx.createLinearGradient(tailX, ballY, ballX, ballY);
      tg.addColorStop(0, 'rgba(200,50,0,0)');
      tg.addColorStop(0.3, `rgba(255,100,0,${jAlpha * 0.55})`);
      tg.addColorStop(1, 'rgba(255,200,0,0)');
      ctx.strokeStyle = tg; ctx.lineWidth = s * 0.058; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tailX, ballY); ctx.lineTo(ballX, ballY); ctx.stroke();

      ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = s * 0.40 * jAlpha;
      const bGrad = ctx.createRadialGradient(ballX - ballR * 0.3, ballY - ballR * 0.3, 0, ballX, ballY, ballR * 1.6);
      bGrad.addColorStop(0, `rgba(255,252,160,${jAlpha * 0.95})`);
      bGrad.addColorStop(0.40, `rgba(255,140,0,${jAlpha * 0.88})`);
      bGrad.addColorStop(1, 'rgba(200,40,0,0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath(); ctx.arc(ballX, ballY, ballR * 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,252,220,${jAlpha * 0.90})`;
      ctx.beginPath(); ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _feBranch = unit._branch || '';
  if (_feBranch === 'A') {
    // Inferno: DoT aura ring + counter-burn crown at top
    const _t = _frameNow * 0.001;
    ctx.save(); ctx.shadowColor = '#ff8800'; ctx.shadowBlur = s * 0.20;
    const _pu = 0.45 + Math.sin(_t * 2.2) * 0.18;
    ctx.strokeStyle = `rgba(255,90,0,${_pu * 0.55})`; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(bX, flameBotY - s*0.35, s*0.52, s*0.52, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,150,0,${_pu * 0.22})`; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.ellipse(bX, flameBotY - s*0.35, s*0.62, s*0.62, 0, 0, Math.PI*2); ctx.stroke();
    // Extra ember crown at tip
    for (let i = 0; i < 4; i++) {
      const _ea = _t * 3.0 + i * Math.PI * 0.50;
      const _ex = bX + Math.cos(_ea) * s * 0.16;
      const _ey = flameTopY - Math.abs(Math.sin(_ea)) * s * 0.10;
      ctx.fillStyle = `rgba(255,200,50,${0.60 + Math.sin(_t*3+i)*0.25})`;
      ctx.beginPath(); ctx.arc(_ex, _ey, s*0.025, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_feBranch === 'B') {
    // Lava: volcanic crust texture lines + slow heavy glow
    ctx.save(); ctx.shadowColor = '#cc3300'; ctx.shadowBlur = s * 0.12;
    ctx.strokeStyle = 'rgba(80,25,0,0.60)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    const _cY = (flameTopY + flameBotY) * 0.50;
    for (const [x0, y0, x1, y1] of [
      [-0.28, 0, -0.14, 0.18], [0.10, -0.15, 0.26, 0.08], [-0.08, 0.22, 0.12, 0.32]
    ]) {
      ctx.beginPath();
      ctx.moveTo(bX + x0*s, _cY + y0*s); ctx.lineTo(bX + x1*s, _cY + y1*s);
      ctx.stroke();
    }
    // Лава жевріє з тріщин: повільний нерівний пульс (як вугілля)
    const _lvT = _frameNow / 1000;
    const _lvP = 0.5 + 0.35 * Math.sin(_lvT * 1.3) + 0.15 * Math.sin(_lvT * 3.7);
    ctx.strokeStyle = `rgba(255,60,0,${(0.16 + _lvP * 0.30).toFixed(3)})`; ctx.lineWidth = 2.5;
    ctx.shadowBlur = s * (0.08 + _lvP * 0.10);
    ctx.beginPath(); ctx.moveTo(bX - s*0.27, _cY); ctx.lineTo(bX - s*0.13, _cY + s*0.18); ctx.stroke();
    ctx.strokeStyle = `rgba(255,120,20,${(_lvP * 0.22).toFixed(3)})`; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bX + s*0.10, _cY - s*0.15); ctx.lineTo(bX + s*0.26, _cY + s*0.08); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = flameTopY - s * 0.06;
}
