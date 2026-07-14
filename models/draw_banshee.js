// ═══════════════════════════════════════════════════════════════════════════
//  BANSHEE — рівень 17, здібність: scream (крик страху)
//  Жахливий дух-риданниця: череп-обличчя з пустими орбітами та гаваючим ротом,
//  довге хвилясте волосся, тільки верхня частина тіла, знизу — шлейф з тканини,
//  спектральні кігтисті руки, ритмічні хвилі від крику.
// ═══════════════════════════════════════════════════════════════════════════
function drawBansheeMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._bsLastT || _frameNow)) / 1000, 0.05);
  unit._bsLastT = _frameNow;

  if (unit._bsDir === undefined) {
    unit._bsDir = 1; unit._bsPrevX = cx;
    unit._bsPrevAcd = unit.attackCooldown;
    unit._bsT = 0; unit._bsAp = 0; unit._bsScreamT = 0;
    unit._bsHair = Array.from({length: 9}, (_, i) => ({
      phase: Math.random() * Math.PI * 2,
      lenBias: 0.85 + Math.random() * 0.35,
      freq: 1.5 + Math.random() * 0.9
    }));
  }
  if (Math.abs(cx - unit._bsPrevX) > 0.2)
    unit._bsDir = cx > unit._bsPrevX ? 1 : -1;
  unit._bsPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._bsDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._bsDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._bsPrevAcd || 0) + 3) { unit._bsAp = 1.0; unit._bsScreamT = 1.0; }
  unit._bsPrevAcd = acd;
  unit._bsT += dt;

  const atkDur = Math.min(0.60, atkBase / 60 * 0.75);
  if (unit._bsAp > 0)     unit._bsAp     = Math.max(0, unit._bsAp     - dt / atkDur);
  if (unit._bsScreamT > 0) unit._bsScreamT = Math.max(0, unit._bsScreamT - dt * 0.58);

  const atkActive  = unit._bsAp > 0;
  const ap         = 1 - unit._bsAp;
  const inFight    = unit.state === 'fight' || atkActive;
  const screaming  = unit._bsScreamT > 0;

  const inhaleT = atkActive && ap < 0.22 ? ap / 0.22 : 0;
  const screamP = atkActive && ap >= 0.22 && ap < 0.72 ? (ap - 0.22) / 0.50 : 0;
  const recovB  = atkActive && ap >= 0.72 ? (ap - 0.72) / 0.28 : 0;

  // Head pitch/tilt during scream:
  // Inhale: head tilts BACK (arching), mouth raises
  // Scream: head thrusts FORWARD (in dir) and DOWN, body leans into it
  // Recover: settles
  const headPitchAtk = -inhaleT * 0.18 + screamP * 0.26 - recovB * 0.05;
  const bodyLeanAtk  = -inhaleT * 0.02 * dir + screamP * 0.07 * dir;   // body eases forward on scream
  const headLeanAtk  = -inhaleT * 0.04 * dir + screamP * 0.08 * dir;   // head leans more
  // Slight tremor when screaming at peak
  const scrShake = screamP > 0.15 ? Math.sin(unit._bsT * 55) * s * 0.004 * screamP : 0;

  // ── Positions ─────────────────────────────────────────────────────
  const floatY  = Math.sin(unit._bsT * 1.30) * s * 0.060;
  const bodyRX  = s * 0.245;
  const bodyRY  = s * 0.290;
  const tailH   = s * 0.600;
  const headR   = s * 0.225;
  const bX      = cx + bodyLeanAtk * s + scrShake;
  const bY      = fY - s * 0.760 + floatY;
  const headCX  = bX + headLeanAtk * s;
  const headCY  = bY - bodyRY * 0.92;

  ctx.save();

  // ── Mist swirl trail below (flowing dress dissolves to wisp) ─────
  ctx.save();
  const tailTopY = bY + bodyRY * 0.55;
  const tailBotY = tailTopY + tailH;
  const tailBotX = bX + Math.sin(unit._bsT * 1.25) * s * 0.075;
  // Tail shape (flowing tattered dress)
  const tailPath = () => {
    ctx.beginPath();
    ctx.moveTo(bX - bodyRX * 0.90, tailTopY);
    // Left wavy edge
    const segs = 10;
    for (let i = 1; i <= segs; i++) {
      const tt = i / segs;
      const yy = tailTopY + tt * tailH;
      const tapered = bodyRX * 0.90 * (1 - tt * 0.7);
      const wob = Math.sin(tt * 8 + unit._bsT * 1.9) * s * (0.020 + tt * 0.025);
      ctx.lineTo(bX - tapered + wob - s * tt * 0.05, yy);
    }
    // Jagged bottom edge (multiple pointed tatters)
    for (let ti = 0; ti <= 4; ti++) {
      const tx = bX - bodyRX * 0.25 + ti * bodyRX * 0.125;
      const ty = tailBotY - (ti % 2 === 0 ? s * 0.05 : 0) + Math.sin(unit._bsT * 2 + ti) * s * 0.022;
      ctx.lineTo(tx + Math.sin(unit._bsT * 1.8) * s * 0.030, ty);
    }
    // Right wavy edge (bottom → top)
    for (let i = segs; i >= 1; i--) {
      const tt = i / segs;
      const yy = tailTopY + tt * tailH;
      const tapered = bodyRX * 0.90 * (1 - tt * 0.7);
      const wob = Math.sin(tt * 8 + unit._bsT * 1.9 + 1.8) * s * (0.020 + tt * 0.025);
      ctx.lineTo(bX + tapered + wob + s * tt * 0.05, yy);
    }
    ctx.closePath();
  };
  ctx.globalAlpha = 0.78;
  // Outer layer
  const tGrad = ctx.createLinearGradient(bX, tailTopY, bX, tailBotY);
  tGrad.addColorStop(0, 'rgba(80,105,155,0.85)');
  tGrad.addColorStop(0.6, 'rgba(65,90,140,0.55)');
  tGrad.addColorStop(1, 'rgba(100,130,180,0)');
  ctx.fillStyle = tGrad;
  tailPath();
  ctx.fill();
  ctx.restore();

  // ── Directional scream cone (THE attack — sound projected forward) ─
  if (screaming || screamP > 0) {
    const st = Math.max(unit._bsScreamT, screamP);
    // Mouth position is computed later, but approximate it here for origin
    const mx0 = (bX + headLeanAtk * s) + dir * headR * 0.18;
    const my0 = headCY + headR * 0.42;
    // 5 forward-traveling arcs (sound waves) in a cone
    for (let wi = 0; wi < 5; wi++) {
      const wPhase = ((wi / 5 + unit._bsT * 0.9) % 1);
      const fade   = Math.sin(wPhase * Math.PI);          // peaks in middle of life
      const dist   = s * (0.10 + wPhase * 0.85);
      const wX     = mx0 + dir * dist;
      const wY     = my0;
      const arcR   = s * (0.10 + wPhase * 0.30);
      const wAlpha = st * fade * 0.70;
      // Outer soft wave
      ctx.strokeStyle = `rgba(180,215,245,${wAlpha})`;
      ctx.lineWidth = s * 0.016 * (1 - wPhase * 0.4);
      ctx.beginPath();
      // Open arc facing dir — parenthesis shape opening toward enemy
      const baseA = dir > 0 ? 0 : Math.PI;
      ctx.arc(wX, wY, arcR, baseA - Math.PI * 0.38, baseA + Math.PI * 0.38);
      ctx.stroke();
      // Inner brighter wave
      ctx.strokeStyle = `rgba(230,245,255,${wAlpha * 0.6})`;
      ctx.lineWidth = s * 0.008 * (1 - wPhase * 0.4);
      ctx.beginPath();
      ctx.arc(wX, wY, arcR * 0.78, baseA - Math.PI * 0.32, baseA + Math.PI * 0.32);
      ctx.stroke();
    }
    // Haze cone filling the area in front of mouth
    const coneLen = s * 0.95;
    const coneOpen = s * 0.42;
    const hg = ctx.createLinearGradient(mx0, my0, mx0 + dir * coneLen, my0);
    hg.addColorStop(0, `rgba(220,235,255,${st * 0.38})`);
    hg.addColorStop(0.55, `rgba(180,215,245,${st * 0.18})`);
    hg.addColorStop(1, 'rgba(160,200,240,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(mx0, my0);
    ctx.lineTo(mx0 + dir * coneLen, my0 - coneOpen);
    ctx.lineTo(mx0 + dir * coneLen, my0 + coneOpen);
    ctx.closePath(); ctx.fill();
    // Ghostly screaming faces flying out
    for (let gi = 0; gi < 3; gi++) {
      const gPhase = ((gi / 3 + unit._bsT * 0.7 + 0.3) % 1);
      const gAlpha = st * Math.sin(gPhase * Math.PI) * 0.70;
      if (gAlpha < 0.03) continue;
      const gD = s * (0.25 + gPhase * 0.70);
      const gX = mx0 + dir * gD + Math.sin(gPhase * 12) * s * 0.020;
      const gY = my0 + Math.sin(gi + unit._bsT * 2) * s * 0.055;
      const gR = s * 0.042;
      ctx.fillStyle = `rgba(215,230,250,${gAlpha * 0.85})`;
      ctx.beginPath(); ctx.arc(gX, gY, gR, 0, Math.PI * 2); ctx.fill();
      // Hollow eyes
      ctx.fillStyle = `rgba(20,30,60,${gAlpha})`;
      ctx.beginPath(); ctx.arc(gX - gR * 0.30, gY - gR * 0.15, gR * 0.18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(gX + gR * 0.30, gY - gR * 0.15, gR * 0.18, 0, Math.PI * 2); ctx.fill();
      // Open mouth (vertical oval)
      ctx.beginPath(); ctx.ellipse(gX, gY + gR * 0.30, gR * 0.16, gR * 0.30, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Residual radial rings (softer, background scream presence)
  if (screaming) {
    const st = unit._bsScreamT;
    for (let ri = 0; ri < 4; ri++) {
      const rt = Math.max(0, st - ri * 0.22);
      if (rt <= 0) continue;
      const rr = bodyRX * (1.5 + (1 - rt) * 3.5 + ri * 0.3);
      ctx.strokeStyle = `rgba(200,220,250,${rt * (ri === 0 ? 0.70 : 0.35)})`;
      ctx.lineWidth = s * (ri === 0 ? 0.022 : 0.012);
      ctx.beginPath();
      ctx.ellipse(bX + dir * headR * 0.15, headCY + headR * 0.35,
                  rr, rr * 0.52, 0,
                  -Math.PI * 0.5 + dir * 0.3, Math.PI * 0.5 + dir * 0.3);
      ctx.stroke();
    }
  }

  // ── Long hair (flowing from head) ────────────────────────────────
  if (inFight) {
    ctx.shadowColor = screaming ? '#ccddff' : '#778899';
    ctx.shadowBlur = s * 0.22;
  }
  unit._bsHair.forEach((h, i) => {
    const hAng = -Math.PI * 0.75 + (i / 8) * Math.PI * 0.50 + Math.sin(unit._bsT * h.freq + h.phase) * 0.18;
    const hLen = s * 0.40 * h.lenBias;
    const hX0 = bX + Math.cos(hAng + Math.PI * 0.5) * headR * 0.85;
    const hY0 = headCY + Math.sin(hAng + Math.PI * 0.5) * headR * 0.85;
    const hX2 = bX + Math.cos(hAng) * (headR + hLen) - dir * s * 0.05;
    const hY2 = headCY + Math.sin(hAng) * (headR + hLen) + s * (0.10 + Math.sin(unit._bsT * 1.6 + h.phase) * 0.08);
    const hX1 = (hX0 + hX2) / 2 - dir * s * 0.04 + Math.sin(unit._bsT * 1.7 + h.phase) * s * 0.025;
    const hY1 = (hY0 + hY2) / 2 + s * 0.03;
    const hAlpha = 0.55 + Math.sin(unit._bsT * 1.5 + h.phase) * 0.15;
    const hGrad = ctx.createLinearGradient(hX0, hY0, hX2, hY2);
    hGrad.addColorStop(0, `rgba(215,230,245,${hAlpha})`);
    hGrad.addColorStop(0.6, `rgba(160,180,210,${hAlpha * 0.8})`);
    hGrad.addColorStop(1, 'rgba(100,130,170,0)');
    ctx.strokeStyle = hGrad;
    ctx.lineWidth = s * (0.024 - i * 0.001);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hX0, hY0);
    ctx.quadraticCurveTo(hX1, hY1, hX2, hY2);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // ── Upper body (torso) — translucent blue-white ──────────────────
  if (inFight) {
    ctx.shadowColor = screaming ? '#ddeeff' : '#88aac8';
    ctx.shadowBlur = s * (screaming ? 0.42 : 0.22);
  }
  ctx.save();
  ctx.globalAlpha = 0.72;
  // Outer robe over torso
  ctx.fillStyle = 'rgba(70,95,140,0.75)';
  ctx.beginPath();
  _bsWispPath(ctx, bX, bY, bodyRX * 1.06, bodyRY * 1.04, 3, 1.50, unit._bsT, 0);
  ctx.fill();
  // Mid layer
  ctx.fillStyle = 'rgba(140,175,215,0.72)';
  _bsWispPath(ctx, bX, bY, bodyRX, bodyRY, 4, 2.20, unit._bsT, Math.PI * 0.55);
  ctx.fill();
  ctx.restore();
  ctx.shadowBlur = 0;

  // ── Spectral claw arms (skeletal long hands) ─────────────────────
  // During scream: hands rise UP toward head (clutching temples — classic scream pose)
  [-1, 1].forEach(side => {
    const ashX = bX + side * bodyRX * 0.72;
    const ashY = bY - bodyRY * 0.18;
    // Rest: hands dangle slightly outward
    let aEndX = ashX + side * s * 0.26;
    let aEndY = ashY + s * 0.18;
    // During scream, interpolate toward "hands at temples" pose
    const clutchT = Math.max(inhaleT * 0.7, screamP, recovB * 0.3 * (1 - recovB));
    if (clutchT > 0) {
      // Target: hands near head (just below ears, slightly out from head sides)
      const clutchX = headCX + side * (headR * 0.92 + s * 0.02);
      const clutchY = headCY + headR * 0.10;
      aEndX = aEndX * (1 - clutchT) + clutchX * clutchT;
      aEndY = aEndY * (1 - clutchT) + clutchY * clutchT;
    }
    // Translucent sleeve
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = 'rgba(170,205,235,0.80)';
    ctx.lineWidth = s * 0.070;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ashX, ashY); ctx.lineTo(aEndX, aEndY); ctx.stroke();
    // Bony wrist
    ctx.strokeStyle = 'rgba(210,225,240,0.85)';
    ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.moveTo(aEndX - side * s * 0.05, aEndY - s * 0.01); ctx.lineTo(aEndX, aEndY); ctx.stroke();
    ctx.restore();
    // Long skeletal fingers (5 fingers splayed)
    const clawCol = screaming ? 'rgba(240,248,255,0.90)' : 'rgba(180,215,240,0.75)';
    ctx.strokeStyle = clawCol;
    ctx.lineWidth = s * 0.014;
    ctx.lineCap = 'round';
    for (let fi = 0; fi < 5; fi++) {
      const fAng = Math.PI * 0.15 + (fi - 2) * 0.22;
      const fEndX = aEndX + Math.cos(fAng) * side * s * (0.10 + (fi === 0 || fi === 4 ? 0 : 0.02));
      const fEndY = aEndY + Math.sin(fAng) * s * 0.10;
      ctx.beginPath(); ctx.moveTo(aEndX, aEndY); ctx.lineTo(fEndX, fEndY); ctx.stroke();
      // Pointed tip
      ctx.fillStyle = 'rgba(220,235,250,0.9)';
      ctx.beginPath(); ctx.arc(fEndX, fEndY, s * 0.010, 0, Math.PI * 2); ctx.fill();
    }
  });

  // ── Skull-like head (rotates during scream: back on inhale, forward on scream) ─
  if (inFight) {
    ctx.shadowColor = screaming ? '#ffffff' : '#aaccee';
    ctx.shadowBlur = s * (screaming ? 0.48 : 0.24);
  }
  ctx.save();
  // Apply head pitch rotation around head center
  ctx.translate(headCX, headCY);
  ctx.rotate(headPitchAtk * dir);
  ctx.translate(-headCX, -headCY);
  ctx.globalAlpha = 0.95;
  // Head base (pale ghostly)
  ctx.fillStyle = 'rgba(180,210,235,0.92)';
  ctx.beginPath();
  ctx.ellipse(headCX, headCY, headR * 0.86, headR * 1.05, 0, 0, Math.PI * 2); ctx.fill();
  // Mid tone
  ctx.fillStyle = 'rgba(210,232,248,0.85)';
  ctx.beginPath();
  ctx.ellipse(headCX - headR * 0.18, headCY - headR * 0.20, headR * 0.68, headR * 0.85, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // ── Hollow eye sockets (dark voids with dim glow) ────────────────
  const eyeRr = headR * 0.24;
  const eyeSp = headR * 0.38;
  const eyeYY = headCY - headR * 0.15;
  [-1, 1].forEach(side => {
    const ex = headCX + side * eyeSp;
    // Dark socket
    ctx.fillStyle = 'rgba(5,10,25,0.95)';
    ctx.beginPath();
    ctx.ellipse(ex, eyeYY, eyeRr * 1.15, eyeRr * 1.35, 0, 0, Math.PI * 2); ctx.fill();
    // Inner glow point
    ctx.shadowColor = screaming ? '#ccddff' : '#5577aa';
    ctx.shadowBlur = s * (screaming ? 0.32 : 0.16);
    ctx.fillStyle = screaming ? 'rgba(200,220,255,0.90)' : 'rgba(100,140,200,0.55)';
    ctx.beginPath();
    ctx.arc(ex, eyeYY + eyeRr * 0.1, eyeRr * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Tear streak under eye (grief)
    ctx.strokeStyle = 'rgba(140,180,220,0.55)';
    ctx.lineWidth = s * 0.008;
    ctx.beginPath();
    ctx.moveTo(ex, eyeYY + eyeRr * 0.9);
    ctx.lineTo(ex + side * s * 0.010, eyeYY + eyeRr * 2.2);
    ctx.stroke();
  });

  // ── Gaping mouth (elongated wailing shape, much wider during scream) ─
  const mouthW = headR * (0.26 + inhaleT * 0.20 + screamP * 0.40);
  const mouthH = headR * (0.42 + inhaleT * 0.40 + screamP * 0.80);
  const mouthX = headCX + dir * headR * 0.04;
  const mouthY = headCY + headR * 0.42;
  // Bright glow from inside mouth during scream (light projected out)
  if (screamP > 0.05) {
    ctx.save();
    ctx.shadowColor = '#ddeeff'; ctx.shadowBlur = s * screamP * 0.42;
    const mg = ctx.createRadialGradient(mouthX, mouthY, 0, mouthX, mouthY, mouthW * 1.4);
    mg.addColorStop(0, `rgba(240,250,255,${screamP * 0.65})`);
    mg.addColorStop(0.5, `rgba(200,225,255,${screamP * 0.35})`);
    mg.addColorStop(1, 'rgba(180,210,250,0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY, mouthW * 1.35, mouthH * 1.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Dark void
  ctx.fillStyle = 'rgba(5,8,25,0.94)';
  ctx.beginPath();
  ctx.ellipse(mouthX, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2); ctx.fill();
  // Teeth (jagged, visible when mouth open)
  if (mouthH > headR * 0.50) {
    ctx.fillStyle = 'rgba(200,215,235,0.85)';
    // Upper teeth
    for (let ti = -2; ti <= 2; ti++) {
      const tx = mouthX + ti * mouthW * 0.26;
      ctx.beginPath();
      ctx.moveTo(tx - s * 0.008, mouthY - mouthH * 0.95);
      ctx.lineTo(tx, mouthY - mouthH * 0.55);
      ctx.lineTo(tx + s * 0.008, mouthY - mouthH * 0.95);
      ctx.closePath(); ctx.fill();
    }
    // Lower teeth
    for (let ti = -2; ti <= 2; ti++) {
      const tx = mouthX + ti * mouthW * 0.26 + mouthW * 0.13;
      ctx.beginPath();
      ctx.moveTo(tx - s * 0.007, mouthY + mouthH * 0.95);
      ctx.lineTo(tx, mouthY + mouthH * 0.55);
      ctx.lineTo(tx + s * 0.007, mouthY + mouthH * 0.95);
      ctx.closePath(); ctx.fill();
    }
  }
  // Scream bright rim when actively screaming
  if (screaming && screamP > 0) {
    ctx.shadowColor = '#ddeeff'; ctx.shadowBlur = s * unit._bsScreamT * 0.30;
    ctx.strokeStyle = `rgba(200,225,255,${unit._bsScreamT * 0.80})`;
    ctx.lineWidth = s * 0.014;
    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY, mouthW * 1.10, mouthH * 1.06, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();   // close head rotation save

  // ── Branch visuals ──────────────────────────────────────────
  const _bsBranch = unit._branch || '';
  if (_bsBranch === 'A') {
    // Piercing: sharp wail-lines extending outward + drain tendrils from hands
    const _t = unit._bsT;
    const _sf = Math.max(0, Math.sin(_t * 2.8)) * 0.85 + 0.15;
    ctx.strokeStyle = `rgba(200,220,255,${_sf * 0.40})`; ctx.lineWidth = 1.0; ctx.lineCap = 'round';
    // Wail rays (short horizontal lines extending to the sides)
    for (let i = 0; i < 6; i++) {
      const _ang = (i / 6) * Math.PI * 2 + _t * 0.55;
      const _r0 = s * 0.30, _r1 = s * (0.48 + _sf * 0.14);
      ctx.globalAlpha = _sf * 0.55;
      ctx.beginPath();
      ctx.moveTo(headCX + Math.cos(_ang)*_r0, headCY + Math.sin(_ang)*_r0*0.55);
      ctx.lineTo(headCX + Math.cos(_ang)*_r1, headCY + Math.sin(_ang)*_r1*0.55);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Drain wisps from claw tips toward nearby target
    ctx.save(); ctx.shadowColor = '#aabbff'; ctx.shadowBlur = s * 0.12;
    ctx.strokeStyle = 'rgba(150,170,255,0.38)'; ctx.lineWidth = 1.4;
    for (const side of [-1, 1]) {
      const _cx2 = bX + side * s * 0.32, _cy2 = bY + bodyRY * 0.40;
      const _ex  = bX + side * dir * s * 0.55, _ey = _cy2 - s * 0.04;
      ctx.beginPath();
      ctx.moveTo(_cx2, _cy2);
      ctx.quadraticCurveTo((_cx2+_ex)/2, _cy2 - s*0.08, _ex, _ey);
      ctx.stroke();
    }
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_bsBranch === 'B') {
    // Phantom: примарний двійник дрейфує позаду і «дихає» прозорістю
    const _phT = _frameNow / 1000;
    ctx.save(); ctx.globalAlpha = 0.14 + 0.12 * Math.sin(_phT * 1.6);
    const _offX = -dir * s * (0.15 + 0.06 * Math.sin(_phT * 0.9))
                + Math.sin(_phT * 2.3) * s * 0.02;
    // Ghost body
    ctx.strokeStyle = '#aabbd8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(bX + _offX, bY, bodyRX * 1.05, bodyRY * 1.05, 0, 0, Math.PI*2); ctx.stroke();
    // Ghost head
    ctx.beginPath(); ctx.arc(headCX + _offX, headCY, headR * 1.08, 0, Math.PI*2); ctx.stroke();
    // Ghost tail
    const _ty = bY + bodyRY * 0.55;
    ctx.beginPath();
    ctx.moveTo(bX + _offX - bodyRX*0.55, _ty);
    ctx.quadraticCurveTo(bX + _offX, _ty + tailH*0.55, bX + _offX + bodyRX*0.30, _ty + tailH*0.90);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();   // close outermost save
  unit._hpBarY = headCY - headR * 1.22;
}

function _bsWispPath(c, cx, cy, rx, ry, lobes, speed, t, phase) {
  c.beginPath();
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const w = Math.sin(a * lobes + t * speed + phase) * 0.095;
    c.lineTo(cx + Math.cos(a) * rx * (1 + w), cy + Math.sin(a) * ry * (1 + w));
  }
  c.closePath();
}
