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
  const flameTopY = flameTopBase - chargeT * s * 0.04 + recoilT * s * 0.14;
  const flameBotY = fY - s * 0.015;
  const bX = cx + dir * (chargeT * s * 0.10 - recoilT * s * 0.18);   // lean into the wind-up, then visibly compress and kick back
  const coreCY = (flameTopY * 0.62 + flameBotY * 0.38);

  ctx.save();

  // ── Burning coal base (ground glow) ──────────────────────────────
  ctx.shadowColor = '#ff6600'; ctx.shadowBlur = s * 0.14;
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

  // ── ONE cohesive flame body ──────────────────────────────────────
  // A single organic silhouette: a wide rounded base that rises and splits into
  // licking tongues at the top, filled with ONE hot-core→cool-edge gradient. The
  // whole outline morphs (tongues + sides wave) — no stacked opaque layers.
  const _inferno    = (unit._branch === 'A');
  const _tongueBst  = _inferno ? 1.18 : 1.0;
  const _heightBst  = _inferno ? 1.12 : 1.0;
  const _nTongues   = _inferno ? 2 : 3;
  const _chg        = chargeT;   // charging pulls the flame taller/hotter too

  const buildFlame = (halfW, botY, topY, phase, wobAmp, nT, tBst) => {
    const _t = unit._feT, H = botY - topY;
    // agitated licking edge — one smooth low-freq harmonic (a high-freq one made sharp
    // bulges whose blurred shadow read as a detached blob). Stronger toward the top.
    const wob = (tt, ph) => Math.sin(tt * 2.3 + _t * 3.0 + ph) * wobAmp * (0.4 + tt * 0.7);
    const P = [];
    // Inferno changes the actual outline: broad shoulder flares pinch into a tall,
    // split crown. Base/Lava keep the calmer tapered teardrop silhouette.
    const sideXs = _inferno
      ? [0.84, 0.96, 1.16, 0.78, 1.02, 0.62]
      : [0.80, 0.86, 0.80, 0.70, 0.57, 0.42];
    const sideYs = [0.02, 0.16, 0.30, 0.44, 0.58, 0.73];
    for (let i = 0; i < sideYs.length; i++) P.push({ x: bX - halfW * sideXs[i] + wob(sideYs[i], phase), y: botY - H * sideYs[i] });
    const tips = [];
    const tipSpread = _inferno ? 0.52 : 0.36;
    for (let k = 0; k < nT; k++) tips.push(nT === 1 ? 0 : -tipSpread + k * (tipSpread * 2 / (nT - 1)));
    tips.forEach((fx, k) => {
      const lick = Math.abs(Math.sin(_t * (2.3 + k * 0.7) + phase + k * 1.3));
      const tipH = H * (_inferno ? 0.24 + 0.04 * lick : 0.15 + 0.16 * lick) * tBst * (1 + _chg * 0.4);
      const tipX = bX + fx * halfW * (_inferno ? 1.16 : 1) + Math.sin(_t * 2.2 + k + phase) * wobAmp * 1.8;
      if (k > 0) P.push({
        x: bX + (tips[k - 1] + fx) * 0.5 * halfW,
        y: topY + H * (_inferno ? 0.19 : 0.09)
      });                                                                                       // deep fork for Inferno; shallow licking valleys otherwise
      P.push({ x: tipX, y: topY - tipH });                                                     // tongue tip
    });
    for (let i = sideYs.length - 1; i >= 0; i--) P.push({ x: bX + halfW * sideXs[i] + wob(sideYs[i], phase + 2.5), y: botY - H * sideYs[i] });
    return P;
  };
  const traceFlame = (P) => {
    ctx.beginPath();
    ctx.moveTo(P[0].x, P[0].y);
    for (let i = 0; i < P.length - 1; i++) { const p = P[i], q = P[i + 1]; ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2); }
    ctx.lineTo(P[P.length - 1].x, P[P.length - 1].y);
    ctx.quadraticCurveTo(bX, P[P.length - 1].y + s * 0.015, P[0].x, P[0].y);   // gentle dancing bottom
    ctx.closePath();
  };

  const _topY = flameTopY - (_heightBst - 1) * (flameBotY - flameTopY) - _chg * s * 0.05;
  const _halfW = baseHalfW * (_inferno ? 1.04 : 1);   // crown shoulders stay readable at the 34 px gameplay size
  const _P = buildFlame(_halfW, flameBotY, _topY, unit._feSeed, s * 0.032 * (_inferno ? 1.4 : 1), _nTongues, _tongueBst);

  // ambient light the flame casts — a smooth symmetric radial halo (NOT a blurred
  // copy of the jagged silhouette: shadowBlur turned asymmetric edge-bulges into a
  // detached floating blob). This emits even, predictable light around the body.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const haloR = baseHalfW * (inFight ? 2.15 : 1.8) * (_inferno ? 1.2 : 1);
  const haloG = ctx.createRadialGradient(bX, coreCY, s * 0.04, bX, coreCY, haloR);
  haloG.addColorStop(0,   _inferno ? 'rgba(255,150,40,0.34)' : 'rgba(255,120,20,0.26)');
  haloG.addColorStop(0.5, _inferno ? 'rgba(255,90,0,0.14)'   : 'rgba(240,70,0,0.11)');
  haloG.addColorStop(1,   'rgba(255,60,0,0)');
  ctx.fillStyle = haloG;
  ctx.beginPath(); ctx.ellipse(bX, coreCY, haloR * 0.82, haloR * 1.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // main body: ONE radial gradient — white-hot heart → orange → translucent cool edges,
  // so the silhouette melts into the halo (no hard dark rim, no second-layer look)
  ctx.save();
  const fg = ctx.createRadialGradient(bX, coreCY, s * 0.034, bX, coreCY, baseHalfW * 1.9);
  fg.addColorStop(0,    _inferno ? '#fff4c8' : '#ffe08a');
  fg.addColorStop(0.30, _inferno ? '#ffbe3a' : '#ffa018');
  fg.addColorStop(0.62, '#ee4c00');
  fg.addColorStop(0.85, 'rgba(176,36,0,0.92)');
  fg.addColorStop(1,    'rgba(94,16,0,0)');
  ctx.fillStyle = fg;
  traceFlame(_P); ctx.fill();
  ctx.restore();

  // a soft ADDITIVE inner heat bloom (blends into the body, not a hard layer)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const ig = ctx.createRadialGradient(bX, coreCY + s * 0.02, 0, bX, coreCY + s * 0.02, baseHalfW * 1.05);
  ig.addColorStop(0,   _inferno ? 'rgba(255,255,235,0.55)' : 'rgba(255,238,150,0.45)');
  ig.addColorStop(0.5, 'rgba(255,150,20,0.22)');
  ig.addColorStop(1,   'rgba(255,90,0,0)');
  ctx.fillStyle = ig; traceFlame(_P); ctx.fill();
  ctx.restore();
  // (no outline stroke — fire has no contour; a traced rim reads as a second layer)

  // internal flame life — soft additive licks rising through the body, CLIPPED to the
  // silhouette. Gives value variation (bright ridges / darker valleys) so it reads as
  // living fire, without stacking separate opaque flame shapes on top.
  ctx.save();
  traceFlame(_P); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const _flH = flameBotY - flameTopY;
  for (let li = 0; li < 3; li++) {
    const lph = unit._feSeed * 1.7 + li * 2.3;
    const lx  = bX + (li - 1) * _halfW * 0.44 + Math.sin(unit._feT * 2.4 + lph) * _halfW * 0.18;
    const lbY = flameBotY - s * 0.03;
    const ltY = coreCY - s * 0.04 - (0.35 + 0.30 * Math.abs(Math.sin(unit._feT * 1.9 + lph))) * _flH * 0.5;
    const lw  = _halfW * (0.30 + 0.06 * Math.sin(unit._feT * 3.1 + lph));
    const lg  = ctx.createLinearGradient(lx, lbY, lx, ltY);
    lg.addColorStop(0,   'rgba(255,150,20,0)');
    lg.addColorStop(0.45, _inferno ? 'rgba(255,214,96,0.22)' : 'rgba(255,184,54,0.17)');
    lg.addColorStop(1,   'rgba(255,240,175,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(lx - lw * 0.5, lbY);
    ctx.quadraticCurveTo(lx - lw * 0.15, (lbY + ltY) * 0.5, lx, ltY);
    ctx.quadraticCurveTo(lx + lw * 0.15, (lbY + ltY) * 0.5, lx + lw * 0.5, lbY);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // ── Rising embers ────────────────────────────────────────────────
  unit._feEmbers.forEach(em => {
    em.life -= dt * 0.55;
    em.x += em.vx * dt * 0.8;
    em.y += em.vy * dt * 0.8;
    if (em.life <= 0 || em.y < -0.2) {
      em.life = 1;
      em.x = (Math.random() - 0.5) * 0.42;
      em.y = 0.9 + Math.random() * 0.1;
      em.vx = (Math.random() - 0.5) * 0.10;
      em.vy = -0.6 - Math.random() * 0.35;
      em.size = 0.5 + Math.random() * 0.6;
    }
    // embers ride UP the narrowing flame — keep them inside the tapering silhouette
    const taper = 0.35 + 0.65 * em.y;   // wide at bottom (y=1) → narrow near top (y=0)
    const ex = bX + Math.max(-0.42, Math.min(0.42, em.x)) * baseHalfW * taper;
    const ey = flameBotY - (1 - em.y) * (flameBotY - flameTopY) * 1.05;
    const eAlpha = em.life * 0.8;
    ctx.shadowColor = '#ff7700'; ctx.shadowBlur = s * 0.08;
    const emColor = em.life > 0.6 ? 'rgba(255,230,120,' : em.life > 0.3 ? 'rgba(255,140,30,' : 'rgba(200,40,0,';
    ctx.fillStyle = emColor + eAlpha + ')';
    ctx.beginPath(); ctx.arc(ex, ey, s * 0.014 * em.size, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── Core heart — a brighter REGION of the same flame that bleeds outward, not a
  //    pasted ball: soft edgeless additive bloom, no hard boundary, no lit-sphere. ──
  const coreR = s * 0.135;
  const glow  = 0.56 + Math.sin(unit._feT * 2.0) * 0.15 + chargeT * 0.30;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cGrad = ctx.createRadialGradient(bX, coreCY, 0, bX, coreCY, coreR * 2.05);
  cGrad.addColorStop(0,    `rgba(255,238,196,${(glow * 0.70).toFixed(3)})`);   // warmer + dimmer so the face isn't a stark white blob
  cGrad.addColorStop(0.36, `rgba(255,194,76,${(glow * 0.50).toFixed(3)})`);
  cGrad.addColorStop(0.72, `rgba(255,116,18,${(glow * 0.22).toFixed(3)})`);
  cGrad.addColorStop(1,    'rgba(255,90,0,0)');
  ctx.fillStyle = cGrad;
  ctx.beginPath(); ctx.arc(bX, coreCY, coreR * 2.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── Eyes — narrow dark-warm almonds where the fire runs coolest. NO white sclera,
  //    NO pupil, NO catchlight — that combination read as pasted googly eyes. These are
  //    edgeless cool dips in the hot core, so they belong to the flame. ──
  const eyeRr = coreR * 0.40;
  const eyeSp = coreR * 0.62;
  const eyeYY = coreCY - coreR * 0.04;
  [-1, 1].forEach(side => {
    const ex = bX + side * eyeSp;
    const eg = ctx.createRadialGradient(ex, eyeYY, 0, ex, eyeYY, eyeRr);
    eg.addColorStop(0,    'rgba(30,3,0,0.94)');
    eg.addColorStop(0.55, 'rgba(74,14,0,0.52)');
    eg.addColorStop(1,    'rgba(120,35,0,0)');
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.ellipse(ex, eyeYY, eyeRr * 0.90, eyeRr * 1.16, 0, 0, Math.PI * 2); ctx.fill();
    // a tiny off-center warm catchlight — a spark of life (small + soft, NEVER a full ring).
    // Same treatment in every state; it just brightens a hair when charging (a glare).
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,206,124,${(0.5 + chargeT * 0.35).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(ex - dir * eyeRr * 0.24, eyeYY - eyeRr * 0.32, eyeRr * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  // ── Charge gather in front of the mouth (wind-up anticipation) ───────
  if (chargeT > 0.10) {
    const orbX = bX + dir * (baseHalfW * 0.24 + chargeT * s * 0.05);   // concentrated right at the mouth-front
    const orbY = coreCY + coreR * 0.95;
    const orbR = s * (0.045 + chargeT * 0.072);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // sparks spiralling INWARD into the forming ball (soft dots — not hard vector strokes)
    for (let k = 0; k < 6; k++) {
      const ip  = ((unit._feT * 1.6 + k / 6) % 1);              // 1→0 : outside → sucked into the orb
      const ang = k * 2.2 + unit._feT * 3.0;
      const rad = orbR * (0.5 + ip * 3.0);
      const spx = orbX + Math.cos(ang) * rad;
      const spy = orbY + Math.sin(ang) * rad * 0.7;
      ctx.fillStyle = `rgba(255,222,130,${((1 - ip) * chargeT * 0.7).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(spx, spy, s * 0.0095 * (1 - ip * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    // the gathering ball — concentrated white-hot core → orange (a tight ball, not a smudge)
    ctx.shadowColor = '#ffcc33'; ctx.shadowBlur = s * chargeT * 0.5;
    const oGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR * 1.5);
    oGrad.addColorStop(0,    `rgba(255,255,246,${(0.55 + chargeT * 0.45).toFixed(3)})`);
    oGrad.addColorStop(0.28, `rgba(255,236,150,${(chargeT * 0.9).toFixed(3)})`);
    oGrad.addColorStop(0.6,  `rgba(255,150,20,${(chargeT * 0.55).toFixed(3)})`);
    oGrad.addColorStop(1,    'rgba(255,60,0,0)');
    ctx.fillStyle = oGrad;
    ctx.beginPath(); ctx.arc(orbX, orbY, orbR * 1.5, 0, Math.PI * 2); ctx.fill();
    // tight white-hot center
    ctx.fillStyle = `rgba(255,255,250,${(0.5 + chargeT * 0.4).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(orbX, orbY, orbR * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Fireball (throw phase) ───────────────────────────────────────
  const ballActive = atkActive && ap > 0.28 && ap < 0.88;
  if (ballActive) {
    const progress  = Math.min(1, (ap - 0.28) / 0.44);
    const ballMaxD  = s * 1.82;
    const rootX     = bX + dir * coreR * 0.22;
    const rootY     = coreCY + s * 0.10;
    const streamD   = baseHalfW * 0.34 + progress * ballMaxD;
    const ballX     = rootX + dir * streamD;
    const ballY     = rootY - Math.sin(progress * Math.PI) * s * 0.12;
    const jAlpha    = throwT > 0 ? 1.0 : 1.0 - (ap - 0.68) / 0.20;
    const ballR     = s * (0.096 - progress * 0.022);

    if (jAlpha > 0) {
      // One continuous, tapered silhouette grows out of the body and swells into
      // its projectile head. There is no independently drawn ball that can detach.
      const rootHalf = s * (0.092 - progress * 0.018);
      const headBackX = ballX - dir * ballR * 0.92;
      const streamGrad = ctx.createLinearGradient(rootX, rootY, ballX + dir * ballR, ballY);
      streamGrad.addColorStop(0, `rgba(238,62,0,${(jAlpha * 0.82).toFixed(3)})`);
      streamGrad.addColorStop(0.32, `rgba(255,116,0,${(jAlpha * 0.90).toFixed(3)})`);
      streamGrad.addColorStop(0.72, `rgba(255,210,74,${(jAlpha * 0.96).toFixed(3)})`);
      streamGrad.addColorStop(1, `rgba(255,252,218,${(jAlpha * 0.96).toFixed(3)})`);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = s * 0.26 * jAlpha;
      ctx.fillStyle = streamGrad;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY - rootHalf);
      ctx.bezierCurveTo(
        rootX + dir * streamD * 0.24, rootY - rootHalf * 0.72,
        headBackX, ballY - ballR * 0.72,
        ballX, ballY - ballR
      );
      ctx.quadraticCurveTo(ballX + dir * ballR * 1.34, ballY, ballX, ballY + ballR);
      ctx.bezierCurveTo(
        headBackX, ballY + ballR * 0.72,
        rootX + dir * streamD * 0.20, rootY + rootHalf * 0.72,
        rootX, rootY + rootHalf
      );
      ctx.quadraticCurveTo(rootX - dir * s * 0.025, rootY, rootX, rootY - rootHalf);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _feBranch = unit._branch || '';
  const _midY = (flameTopY + flameBotY) * 0.5;
  if (_feBranch === 'A') {
    // ── INFERNO — the elemental roars into a raging blaze: a pulsing heat-halo,
    //    a corona of flames licking all around the body, a white-hot heart, and a
    //    storm of sparks howling upward. It should look FURIOUS. ──
    const _t = unit._feT;
    const _hb = 0.5 + 0.5 * Math.sin(_t * 3.4);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // pulsing blaze halo
    const hg = ctx.createRadialGradient(bX, _midY, coreR * 0.4, bX, _midY, s * 0.62);
    hg.addColorStop(0, `rgba(255,150,30,${(0.13 + _hb * 0.10).toFixed(3)})`);
    hg.addColorStop(0.6, `rgba(255,90,0,${(0.06 + _hb * 0.06).toFixed(3)})`);
    hg.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(bX, _midY, s * 0.56, s * 0.66, 0, 0, Math.PI * 2); ctx.fill();
    // (no extra core bloom here — the base already burns white-hot via _inferno, and
    //  a bloom over the core would wash out the face)
    // storming embers howling upward — hot and glowing (not dull dust)
    ctx.shadowColor = '#ff9000'; ctx.shadowBlur = s * 0.06;
    for (let i = 0; i < 10; i++) {
      const sp = ((_t * 0.85 + i * 0.10) % 1);
      const sxp = bX + Math.sin(_t * 2.2 + i * 2.3) * baseHalfW * (0.35 + sp * 0.5) + (i - 4.5) * s * 0.011;
      const syp = flameBotY - sp * (flameBotY - flameTopY) * 1.55;
      ctx.fillStyle = `rgba(255,${Math.floor(205 + sp * 50)},${Math.floor(80 + sp * 70)},${((1 - sp * 0.7) * 0.95).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(sxp, syp, s * (0.009 + (1 - sp) * 0.013), 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  } else if (_feBranch === 'B') {
    // ── LAVA — the fire cools into molten rock: rounded charred CRUST rocks (top-lit,
    //    hot-rimmed) float on the body; the molten flame glows BETWEEN them as lava. ──
    const _t = unit._feT;
    const _fr = (k) => { const x = Math.sin(k * 91.7) * 43758.5453; return x - Math.floor(x); };
    const rock = (px, py, w, h, sd) => {
      const n = 7, P = [];
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const jit = 0.72 + 0.42 * _fr(sd * 3 + i); P.push({ x: px + Math.cos(a) * w * jit, y: py + Math.sin(a) * h * jit }); }
      const trace = () => { ctx.beginPath(); ctx.moveTo((P[n - 1].x + P[0].x) / 2, (P[n - 1].y + P[0].y) / 2); for (let i = 0; i < n; i++) { const p = P[i], q = P[(i + 1) % n]; ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2); } ctx.closePath(); };
      // rock body: cooler grey-brown top (ambient) → dark charred underside (volume)
      const g = ctx.createLinearGradient(px, py - h * 1.1, px, py + h * 1.15);
      g.addColorStop(0, '#5a4530'); g.addColorStop(0.5, '#2a1810'); g.addColorStop(1, '#120904');
      trace(); ctx.fillStyle = g; ctx.fill();
      // hot lava rim glowing along the lower edge (additive — lava peeking under the rock)
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = '#ff5000'; ctx.shadowBlur = s * 0.06;
      ctx.strokeStyle = `rgba(255,120,18,${(0.55 + 0.22 * Math.sin(_t * 2 + sd)).toFixed(3)})`; ctx.lineWidth = s * 0.013; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const lo = Math.floor(n * 0.10);
      ctx.beginPath(); ctx.moveTo(P[lo].x, P[lo].y);
      for (let i = 1; i <= Math.ceil(n * 0.5); i++) { const p = P[(lo + i) % n]; ctx.lineTo(p.x, p.y); }
      ctx.stroke(); ctx.restore();
      // soft top-facet ambient sheen — breaks up the flat black, gives the chunk volume
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const amb = ctx.createRadialGradient(px - w * 0.25, py - h * 0.45, 0, px - w * 0.25, py - h * 0.45, w * 0.85);
      amb.addColorStop(0, 'rgba(122,98,72,0.30)'); amb.addColorStop(1, 'rgba(122,98,72,0)');
      trace(); ctx.fillStyle = amb; ctx.fill(); ctx.restore();
      // cool grey glint on a top facet
      ctx.strokeStyle = 'rgba(140,110,82,0.45)'; ctx.lineWidth = s * 0.004; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(P[Math.floor(n * 0.62)].x, P[Math.floor(n * 0.62)].y); ctx.lineTo(P[Math.floor(n * 0.80)].x, P[Math.floor(n * 0.80)].y); ctx.stroke();
    };
    // molten underglow the crust sits into — lava glowing through the seams
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const _sgY = flameBotY - s * 0.13;
    const _sg = ctx.createRadialGradient(bX, _sgY, s * 0.02, bX, _sgY, baseHalfW * 1.15);
    _sg.addColorStop(0, 'rgba(255,150,26,0.50)'); _sg.addColorStop(0.5, 'rgba(255,80,0,0.26)'); _sg.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = _sg; ctx.beginPath(); ctx.ellipse(bX, _sgY, baseHalfW * 1.02, s * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // charred crust — a stable rocky mound banked against the lower body (the elemental's
    // cooled base), kept BELOW the face so it never reads as a mustache. Two overlapping rows.
    rock(bX - baseHalfW * 0.44, flameBotY - s * 0.055, s * 0.150, s * 0.100, 1);   // bottom row
    rock(bX + baseHalfW * 0.02, flameBotY - s * 0.035, s * 0.165, s * 0.108, 3);
    rock(bX + baseHalfW * 0.46, flameBotY - s * 0.060, s * 0.145, s * 0.100, 2);
    rock(bX - baseHalfW * 0.22, flameBotY - s * 0.165, s * 0.128, s * 0.094, 6);   // upper row (banked higher)
    rock(bX + baseHalfW * 0.25, flameBotY - s * 0.175, s * 0.122, s * 0.092, 7);
    // dripping magma globs from the bottom edge
    ctx.save(); ctx.shadowColor = '#ff5500'; ctx.shadowBlur = s * 0.16;
    for (let i = 0; i < 3; i++) {
      const dp = ((_t * 0.5 + i * 0.4) % 1);
      const dx2 = bX + (i - 1) * baseHalfW * 0.55;
      const dy2 = flameBotY - s * 0.02 + dp * s * 0.20;
      const dr = s * 0.026 * (1 - dp * 0.4);
      ctx.fillStyle = `rgba(255,${Math.floor(130 - dp * 70)},0,${(0.9 * (1 - dp * 0.5)).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(dx2, dy2, dr, dr * 1.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // 4. a magma bubble welling up and popping
    const bp = (_t * 0.7) % 1;
    const bx2 = bX + Math.sin(unit._feSeed) * baseHalfW * 0.3;
    const by2 = flameBotY - s * 0.04 - bp * s * 0.13;   // wells up WITHIN the mound, never floats above it
    const br = s * 0.03 * (bp < 0.85 ? 1 : (1 - (bp - 0.85) / 0.15));
    if (br > 0.002) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,180,60,${(0.5 * (1 - bp)).toFixed(3)})`; ctx.beginPath(); ctx.arc(bx2, by2, br, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }

  ctx.restore();
  unit._hpBarY = flameTopY - s * 0.06;
}
