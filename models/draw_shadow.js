// ═══════════════════════════════════════════════════════════════════════════
//  SHADOW — рівень 9, здібність: invis (невидимість кожні 6с на 1с)
//  Тінь, що піднімається з темної калюжі: рваний humanoid-силует із хвилястими
//  краями, постійні вусики-щупальця, пронизливі очі. При invis тіло тоне в
//  підлогу, очі ледь жевріють — потім підіймається знову.
// ═══════════════════════════════════════════════════════════════════════════
function drawShadowMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._shLastT || _frameNow)) / 1000, 0.05);
  unit._shLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._shDir === undefined) {
    unit._shDir = 1; unit._shPrevX = cx; unit._shPrevAcd = unit.attackCooldown;
    unit._shT = 0; unit._shAp = 0; unit._shAlpha = 1.0;
    unit._shSeed = Math.random() * 100;
    // Rising wisps from pool
    unit._shWisps = Array.from({length: 8}, () => ({
      off:  (Math.random() - 0.5) * 1.0,
      y:    Math.random(),
      speed: 0.35 + Math.random() * 0.35,
      life: Math.random(),
      size: 0.5 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.5
    }));
    // Edge tendril anchors (which points on silhouette emit tendrils)
    unit._shTendrils = Array.from({length: 5}, (_, i) => ({
      tPos:  0.25 + (i / 5) * 0.65,        // height on body (0=bottom,1=top)
      side:  i % 2 === 0 ? -1 : 1,
      phase: Math.random() * Math.PI * 2,
      len:   0.8 + Math.random() * 0.5
    }));
  }
  if (Math.abs(cx - unit._shPrevX) > 0.2)
    unit._shDir = cx > unit._shPrevX ? 1 : -1;
  unit._shPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._shDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._shDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._shPrevAcd || 0) + 3) unit._shAp = 1.0;
  unit._shPrevAcd = acd;
  unit._shT += dt * (unit.state === 'move' ? 1.55 : 1);

  const atkDur = Math.min(0.55, atkBase / 60 * 0.75);
  if (unit._shAp > 0) unit._shAp = Math.max(0, unit._shAp - dt / atkDur);

  const atkActive = unit._shAp > 0;
  const ap        = 1 - unit._shAp;
  const inFight   = unit.state === 'fight' || atkActive;
  const _shBranch = unit._branch || '';

  // ── Invis transition (smooth alpha + body rise) ──────────────────
  const invisOn = unit.invisActive || false;
  const targetAlpha = invisOn ? 0.08 : 1.0;
  unit._shAlpha += (targetAlpha - unit._shAlpha) * Math.min(1, dt * 3.2);
  const alpha  = unit._shAlpha;
  const riseT  = Math.max(0, Math.min(1, (alpha - 0.08) / 0.92));  // 0=sunk, 1=full up
  const eyeAlpha = Math.max(alpha, 0.25);  // eyes stay eerily visible even when invis

  // ── Attack lurch ─────────────────────────────────────────────────
  let lurchX = 0;
  let armStretch = 0;
  let lean = 0;
  if (atkActive) {
    if (ap < 0.22) {
      const f = ap / 0.22;
      lurchX = -dir * s * 0.14 * f;
      lean = -dir * 0.10 * f;
    } else if (ap < 0.55) {
      const f = (ap - 0.22) / 0.33;
      const ef = f * f * (3 - 2 * f);
      lurchX = dir * s * 0.38 * ef - dir * s * 0.14 * (1 - ef);
      armStretch = ef;
      lean = dir * 0.18 * ef - dir * 0.10 * (1 - ef);
    } else {
      const f = (ap - 0.55) / 0.45;
      lurchX = dir * s * 0.38 * (1 - f);
      armStretch = 1 - f;
      lean = dir * 0.18 * (1 - f);
    }
  }

  // ── Body geometry ────────────────────────────────────────────────
  const movePulse = unit.state === 'move' ? Math.sin(unit._shT * 3.4) : 0;
  const moveLift = unit.state === 'move'
    ? (0.5 - 0.5 * Math.cos(unit._shT * 3.4)) * s * 0.052 : 0;
  const moveLean = unit.state === 'move'
    ? dir * s * (0.040 + Math.max(0, movePulse) * 0.075) : 0;
  const floatY = Math.sin(unit._shT * 1.75) * s * 0.028 - moveLift;
  const walkSway = unit.state === 'move' ? dir * movePulse * s * 0.052 : 0;
  const floatX = Math.sin(unit._shT * 0.88) * s * 0.014 + walkSway;
  const bX     = cx + lurchX + floatX;
  // Top position depends on rise: fully up or sunk into pool
  const bodyTopY = fY - s * (0.05 + 0.90 * riseT) + floatY;
  const bodyBotY = fY - s * 0.005;
  const bodyH   = bodyBotY - bodyTopY;
  // Head position near top
  const headR   = s * 0.165;
  const headCY  = bodyTopY + headR * 0.85;

  ctx.save();

  // ── Floor pool (ALWAYS visible — even during invis) ──────────────
  ctx.fillStyle = 'rgba(8,4,20,0.72)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.018, s * 0.38, s * 0.075, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(20,10,40,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.010, s * 0.30, s * 0.056, 0, 0, Math.PI * 2); ctx.fill();
  // Inner pulsing darker pool
  const poolPulse = 0.65 + Math.sin(unit._shT * 1.4) * 0.22;
  ctx.fillStyle = `rgba(0,0,8,${poolPulse})`;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.012, s * 0.20, s * 0.038, 0, 0, Math.PI * 2); ctx.fill();
  // Thin purple ring around pool
  ctx.strokeStyle = `rgba(80,50,160,${0.30 + invisOn * 0.30 + Math.sin(unit._shT * 2) * 0.10})`;
  ctx.lineWidth = s * 0.010;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.012, s * 0.33, s * 0.060, 0, 0, Math.PI * 2); ctx.stroke();

  // A short floor-smear trails the glide. It is anchored to the pool rather
  // than the body, so the shadow feels pulled forward instead of bobbing in place.
  if (unit.state === 'move') {
    const trailA = 0.10 + Math.abs(movePulse) * 0.12;
    ctx.fillStyle = `rgba(42,22,82,${trailA})`;
    ctx.beginPath();
    ctx.ellipse(cx - dir * s * 0.19, fY + s * 0.014,
                s * (0.25 + Math.abs(movePulse) * 0.10), s * 0.042,
                0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Rising wisps from pool (always active, stronger when invis) ──
  unit._shWisps.forEach(w => {
    w.y += w.speed * dt;
    w.life -= dt * 0.4;
    if (w.y > 1.0 || w.life <= 0) {
      w.y = 0; w.life = 1;
      w.off = (Math.random() - 0.5) * 1.0;
      w.speed = 0.35 + Math.random() * 0.35;
      w.size = 0.5 + Math.random() * 0.6;
      w.drift = (Math.random() - 0.5) * 0.5;
    }
    const wy = fY - w.y * s * (invisOn ? 0.60 : 0.85);
    const wx = cx + w.off * s * 0.22 + w.drift * s * 0.10 * w.y
      - (unit.state === 'move' ? dir * s * 0.10 * w.y : 0);
    const wAlpha = w.life * (1 - w.y * 0.5) * (invisOn ? 0.72 : 0.45);
    ctx.fillStyle = `rgba(40,20,70,${wAlpha})`;
    ctx.beginPath();
    ctx.ellipse(wx, wy, s * 0.028 * w.size, s * 0.048 * w.size * (1 + w.y * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
    // Purple tint on top
    ctx.fillStyle = `rgba(80,50,160,${wAlpha * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(wx, wy - s * 0.015, s * 0.020 * w.size, s * 0.024 * w.size, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Body (only when risen enough) ────────────────────────────────
  if (riseT > 0.04) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Width profile function (cloak-like)
    // t: 0=bottom, 1=top
    const topScale = 0.4 + 0.6 * riseT;
    function bodyWidth(t) {
      const base = t < 0.08  ? s * (0.38 + 0.06 * Math.sin(t * 10))        // spread into pool
                 : t < 0.30  ? s * (0.22 + 0.08 * Math.sin(t * 12 + unit._shSeed))  // cloak lower
                 : t < 0.55  ? s * (0.26)                                             // torso
                 : t < 0.75  ? s * (0.20)                                             // shoulders narrowing
                 : t < 0.90  ? s * (0.16)                                             // neck
                 :             s * (0.13);                                            // near head
      const timeJit = Math.sin(t * 6 + unit._shT * 2.5 + unit._shSeed) * s * 0.022;
      const lobes = Math.sin(t * 20 + unit._shT * 3 + unit._shSeed * 0.7) * s * 0.018;
      const gloomMantle = _shBranch === 'B'
        ? Math.exp(-Math.pow((t - 0.58) / 0.24, 2)) * s * 0.085 : 0;
      // Assassin keeps a lean lower cloak and a sharp, readable shoulder line.
      const assassinCut = _shBranch === 'A'
        ? Math.exp(-Math.pow((t - 0.63) / 0.11, 2)) * s * 0.045
          - Math.exp(-Math.pow((t - 0.20) / 0.20, 2)) * s * 0.025
        : 0;
      return base + timeJit + lobes + gloomMantle + assassinCut;
    }
    function bodyLeanX(t) {
      return lean * s * t * 0.9 + moveLean * t;  // top glides first, hem trails
    }

    // Body shadow glow
    if (inFight) {
      ctx.shadowColor = atkActive ? '#9988ff' : '#5533aa';
      ctx.shadowBlur  = s * (atkActive ? 0.45 : 0.26);
    }

    // Build body path
    function buildBody(widthMul) {
      ctx.beginPath();
      const steps = 28;
      // Left edge (bottom → top)
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        const yy = bodyBotY - tt * bodyH;
        const ww = bodyWidth(tt) * widthMul;
        const lx = bodyLeanX(tt);
        const px = bX + lx - ww;
        if (i === 0) ctx.moveTo(px, yy); else ctx.lineTo(px, yy);
      }
      // Top cap (above head — small rounded)
      ctx.lineTo(bX + bodyLeanX(1.0), bodyTopY - s * 0.010);
      // Right edge (top → bottom)
      for (let i = steps; i >= 0; i--) {
        const tt = i / steps;
        const yy = bodyBotY - tt * bodyH;
        const ww = bodyWidth(tt) * widthMul;
        const lx = bodyLeanX(tt);
        const px = bX + lx + ww;
        ctx.lineTo(px, yy);
      }
      ctx.closePath();
    }

    // Moroku carries a broad permanent mantle so it reads before any aura proc.
    if (_shBranch === 'B') {
      // During the claw lunge the old mantle became too faint/narrow and the
      // branch collapsed back to the base silhouette. Let the shroud lag and
      // spread as the core drives forward, like a heavy cloak catching air.
      ctx.globalAlpha = alpha * (0.36 + armStretch * 0.20);
      buildBody(1.46 + armStretch * 0.24);
      ctx.fillStyle = atkActive ? '#543493' : '#42247d';
      ctx.fill();
    }

    // Outer smoky aura (biggest, faintest)
    ctx.globalAlpha = alpha * 0.52;
    buildBody(1.18);
    ctx.fillStyle = _shBranch === 'B' ? 'rgba(65,35,120,0.82)'
                  : _shBranch === 'A' ? 'rgba(112,101,132,0.90)'
                  : 'rgba(102,72,158,0.92)';
    ctx.fill();

    // Mid body (main darkness)
    ctx.globalAlpha = alpha * 0.92;
    buildBody(1.00);
    ctx.fillStyle = _shBranch === 'A' ? '#2a2232'
                  : _shBranch === 'B' ? '#130b27' : '#24163b';
    ctx.fill();

    // Inner slightly lighter (depth)
    ctx.globalAlpha = alpha * 0.80;
    ctx.save();
    buildBody(0.82);
    ctx.clip();
    const gradFill = ctx.createLinearGradient(bX, bodyTopY, bX, bodyBotY);
    if (_shBranch === 'B') {
      gradFill.addColorStop(0, '#4a2a88');
      gradFill.addColorStop(0.58, '#261548');
      gradFill.addColorStop(1, '#0d0719');
    } else if (_shBranch === 'A') {
      gradFill.addColorStop(0, '#9586a8');
      gradFill.addColorStop(0.58, '#594b66');
      gradFill.addColorStop(1, '#2b2035');
    } else {
      gradFill.addColorStop(0, '#8768bd');
      gradFill.addColorStop(0.58, '#52387e');
      gradFill.addColorStop(1, '#281944');
    }
    ctx.fillStyle = gradFill;
    ctx.fillRect(bX - s * 0.5, bodyTopY - s * 0.05, s, bodyH + s * 0.1);
    ctx.restore();

    // A compact shoulder-to-waist value mass keeps the body legible at s=34
    // without turning the apparition into a solid, armoured figure.
    if (_shBranch !== 'B') {
      const coreX = bX + bodyLeanX(0.58);
      const coreTopY = bodyBotY - bodyH * 0.72;
      const coreBotY = bodyBotY - bodyH * 0.16;
      const coreShoulder = s * (_shBranch === 'A' ? 0.145 : 0.16);
      const coreWaist = s * (_shBranch === 'A' ? 0.060 : 0.085);
      const coreFill = ctx.createLinearGradient(coreX, coreTopY, coreX, coreBotY);
      if (_shBranch === 'A') {
        coreFill.addColorStop(0, 'rgba(213,201,226,0.78)');
        coreFill.addColorStop(0.48, 'rgba(132,116,150,0.58)');
      } else {
        coreFill.addColorStop(0, 'rgba(190,156,240,0.82)');
        coreFill.addColorStop(0.48, 'rgba(116,82,174,0.62)');
      }
      coreFill.addColorStop(1, 'rgba(20,12,38,0)');
      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle = coreFill;
      ctx.beginPath();
      ctx.moveTo(coreX - coreShoulder, coreTopY + s * 0.035);
      ctx.quadraticCurveTo(coreX, coreTopY - s * 0.025,
                           coreX + coreShoulder, coreTopY + s * 0.035);
      ctx.lineTo(coreX + coreWaist, coreBotY);
      ctx.quadraticCurveTo(coreX, coreBotY + s * 0.025,
                           coreX - coreWaist, coreBotY);
      ctx.closePath();
      ctx.fill();
    }

    // Purple outline aura
    ctx.globalAlpha = alpha;
    buildBody(1.00);
    ctx.strokeStyle = atkActive
      ? `rgba(205,190,255,${0.88 * alpha})`
      : _shBranch === 'B'
        ? `rgba(145,105,235,${(0.72 + Math.sin(unit._shT * 2) * 0.10) * alpha})`
        : _shBranch === 'A'
          ? `rgba(218,205,232,${(0.78 + Math.sin(unit._shT * 2) * 0.08) * alpha})`
          : `rgba(190,151,246,${(0.80 + Math.sin(unit._shT * 2) * 0.08) * alpha})`;
    ctx.lineWidth = s * 0.030;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // ── Edge tendrils (wispy wisps extending outward) ──────────────
    unit._shTendrils.forEach(td => {
      const tLife = (Math.sin(unit._shT * 1.6 + td.phase) * 0.5 + 0.5);
      const yy = bodyBotY - td.tPos * bodyH;
      const ww = bodyWidth(td.tPos);
      const sx = bX + bodyLeanX(td.tPos) + td.side * ww;
      const tLen = s * 0.18 * td.len * tLife;
      const ex = sx + td.side * tLen;
      const ey = yy - s * 0.02 * tLife + Math.sin(unit._shT * 2.2 + td.phase) * s * 0.03;
      const midX = (sx + ex) / 2 + td.side * s * 0.04;
      const midY = (yy + ey) / 2 - s * 0.04;
      const tgAlpha = alpha * tLife * 0.58;

      ctx.strokeStyle = _shBranch === 'A'
        ? `rgba(126,110,145,${tgAlpha * 1.20})`
        : `rgba(94,62,142,${tgAlpha * 1.18})`;
      ctx.lineWidth = s * 0.040 * td.len;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, yy);
      ctx.quadraticCurveTo(midX, midY, ex, ey);
      ctx.stroke();
      // Tip wisp
      ctx.fillStyle = _shBranch === 'A'
        ? `rgba(166,148,185,${tgAlpha * 0.95})`
        : `rgba(132,92,190,${tgAlpha * 0.95})`;
      ctx.beginPath(); ctx.arc(ex, ey, s * 0.018 * td.len, 0, Math.PI * 2); ctx.fill();
    });

    // ── Attack claw — a tapered mass growing out of the torso ──────
    if (armStretch > 0.05) {
      const armStart = {
        x: bX + bodyLeanX(0.55) + dir * bodyWidth(0.55) * 0.38,
        y: bodyBotY - 0.55 * bodyH
      };
      const reachLen = s * (0.30 + armStretch * 0.50);
      const armEnd = {
        x: armStart.x + dir * reachLen,
        y: armStart.y + s * 0.08
      };
      const armMid = {
        x: armStart.x + dir * reachLen * 0.55,
        y: armStart.y - s * 0.06
      };
      const shoulderX = bX + bodyLeanX(0.55) + dir * bodyWidth(0.55) * 0.86;
      const rootW = s * (0.105 + armStretch * 0.035);
      const midW = rootW * 0.66;
      const tipW = rootW * 0.34;

      // The fill begins inside the body; only exposed side contours are stroked.
      // This removes the hose-like round line and the glued-on shoulder seam.
      ctx.shadowColor = '#9988ff'; ctx.shadowBlur = s * 0.32 * armStretch;
      const armGrad = ctx.createLinearGradient(armStart.x, armStart.y, armEnd.x, armEnd.y);
      armGrad.addColorStop(0, _shBranch === 'A' ? '#2a2232' : _shBranch === 'B' ? '#130b27' : '#24163b');
      armGrad.addColorStop(0.62, _shBranch === 'A' ? '#55455f' : '#28154b');
      armGrad.addColorStop(1, '#100821');
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.moveTo(armStart.x, armStart.y - rootW * 0.30);
      ctx.quadraticCurveTo(shoulderX, armStart.y - rootW, armMid.x, armMid.y - midW);
      ctx.quadraticCurveTo(armEnd.x - dir*s*0.07, armEnd.y - tipW, armEnd.x, armEnd.y - tipW);
      ctx.lineTo(armEnd.x, armEnd.y + tipW);
      ctx.quadraticCurveTo(armEnd.x - dir*s*0.07, armEnd.y + tipW, armMid.x, armMid.y + midW);
      ctx.quadraticCurveTo(shoulderX, armStart.y + rootW, armStart.x, armStart.y + rootW * 0.30);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = `rgba(150,118,225,${0.35 + armStretch * 0.42})`;
      ctx.lineWidth = s * 0.020;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shoulderX, armStart.y - rootW * 0.82);
      ctx.quadraticCurveTo(armMid.x, armMid.y - midW, armEnd.x, armEnd.y - tipW);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shoulderX, armStart.y + rootW * 0.82);
      ctx.quadraticCurveTo(armMid.x, armMid.y + midW, armEnd.x, armEnd.y + tipW);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Claw fingers at tip (3 splayed)
      const clawCol = `rgba(200,180,255,${0.60 + armStretch * 0.35})`;
      ctx.strokeStyle = clawCol;
      ctx.lineWidth = s * 0.022;
      for (let c = 0; c < 3; c++) {
        const ca = (c - 1) * 0.45;
        const cEndX = armEnd.x + Math.cos(ca) * dir * s * 0.18;
        const cEndY = armEnd.y + Math.sin(ca) * s * 0.18;
        ctx.beginPath();
        ctx.moveTo(armEnd.x, armEnd.y);
        ctx.lineTo(cEndX, cEndY);
        ctx.stroke();
        // Sharp tip
        ctx.fillStyle = '#06040e';
        ctx.beginPath(); ctx.arc(cEndX, cEndY, s * 0.013, 0, Math.PI * 2); ctx.fill();
      }
      // Residual shadow trail (short dashes behind arm for motion)
      for (let tr = 1; tr <= 3; tr++) {
        const tra = armStretch - tr * 0.12;
        if (tra <= 0) continue;
        const trReach = s * (0.30 + tra * 0.50);
        const trX = armStart.x + dir * trReach;
        ctx.fillStyle = `rgba(80,55,160,${tra * 0.30})`;
        ctx.beginPath();
        ctx.ellipse(trX, armEnd.y, s * 0.025, s * 0.055, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ── Head (only when risen) ───────────────────────────────────────
  if (riseT > 0.20) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const headX = bX + lean * s * 0.9 + moveLean;
    ctx.shadowColor = atkActive ? '#9988ff' : '#553399';
    ctx.shadowBlur  = s * (atkActive ? 0.42 : 0.20);
    // Head base (slight oval)
    ctx.fillStyle = _shBranch === 'A' ? '#342b3d'
                  : _shBranch === 'B' ? '#050209' : '#321f50';
    ctx.beginPath();
    ctx.ellipse(headX, headCY, headR * 0.92, headR * 1.05, 0, 0, Math.PI * 2); ctx.fill();
    // Hood-like darker band at top
    ctx.fillStyle = _shBranch === 'A' ? '#5d4e69'
                  : _shBranch === 'B' ? '#0c0720' : '#5c3b82';
    ctx.beginPath();
    ctx.ellipse(headX, headCY - headR * 0.15, headR * 0.82, headR * 0.68, 0, 0, Math.PI * 2); ctx.fill();
    // Outline aura
    ctx.strokeStyle = atkActive ? 'rgba(170,150,255,0.85)'
                    : _shBranch === 'A' ? 'rgba(218,205,232,0.84)'
                    : _shBranch === 'B' ? 'rgba(60,40,130,0.55)'
                    : 'rgba(185,145,240,0.84)';
    ctx.lineWidth = s * 0.022;
    ctx.beginPath();
    ctx.ellipse(headX, headCY, headR * 0.92, headR * 1.05, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Eyes (drawn LAST, always partially visible) ──────────────────
  const eyeVisT = Math.max(riseT, 0.5);  // eyes visible even when sunk
  if (eyeVisT > 0.15) {
    const headX = bX + lean * s * 0.9 + moveLean;
    const eyeR  = headR * 0.26;
    const eyeSp = headR * 0.46;
    const eyeY  = headCY + headR * 0.05;
    // When sunk, eyes hover near pool surface
    const eyeYActual = riseT > 0.15 ? eyeY : fY - s * 0.08;
    [-1, 1].forEach(side => {
      const ex = headX + side * eyeSp;
      const eyeFlash = atkActive && ap > 0.20 && ap < 0.55
        ? (ap - 0.20) / 0.35 : 0;

      ctx.save();
      ctx.globalAlpha = eyeAlpha * eyeVisT;
      // Outer glow
      ctx.shadowColor = eyeFlash > 0.3 ? '#ffffff' : '#55ddff';
      ctx.shadowBlur  = s * (eyeFlash > 0.3 ? 0.55 : inFight ? 0.38 : 0.22);
      ctx.fillStyle   = eyeFlash > 0.5 ? '#eefcff'
                      : (inFight ? '#55e4ff' : '#2ea0cc');
      ctx.beginPath();
      ctx.arc(ex, eyeYActual, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Vertical slit pupil
      ctx.fillStyle = '#020410';
      ctx.beginPath();
      ctx.ellipse(ex + dir * eyeR * 0.20, eyeYActual,
                  eyeR * 0.26, eyeR * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = `rgba(200,245,255,${0.60 + eyeFlash * 0.30})`;
      ctx.beginPath();
      ctx.arc(ex - eyeR * 0.32, eyeYActual - eyeR * 0.30, eyeR * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  // ── Branch visuals ──────────────────────────────────────────
  if (_shBranch === 'A' && riseT > 0.30) {
    // Assassin: twin daggers materialising at arm level
    ctx.globalAlpha = alpha * 0.88;
    const _dagY = bodyBotY - bodyH * 0.52;
    [-1, 1].forEach(side => {
      const _lead = side === dir;
      const _dagDrive = atkActive ? armStretch : 0;
      const _dagX = bX + bodyLeanX(0.52) + side * s * 0.32
                  + dir * s * _dagDrive * (_lead ? 0.30 : 0.09);
      const _dagYY = _dagY - s * _dagDrive * (_lead ? 0.07 : -0.02);
      const _ang = side * 0.38 + dir * _dagDrive * (_lead ? 1.02 : 0.38);
      // Shadow forearms join the knives to the torso, widening the combat read.
      ctx.strokeStyle = '#17111f'; ctx.lineWidth = s * 0.070; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bX + bodyLeanX(0.52) + side * bodyWidth(0.52) * 0.72, _dagY - s * 0.015);
      ctx.quadraticCurveTo(_dagX - dir*s*0.06, _dagYY + s*0.07, _dagX, _dagYY + s * 0.045);
      ctx.stroke();
      ctx.save(); ctx.translate(_dagX, _dagYY); ctx.rotate(_ang);
      // Blade
      ctx.fillStyle = '#c0c8d8'; ctx.strokeStyle = '#05040a'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-s*0.022, 0); ctx.lineTo(s*0.022, 0); ctx.lineTo(0, -s*0.25);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Fuller
      ctx.strokeStyle = 'rgba(220,230,255,0.50)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -s*0.02); ctx.lineTo(0, -s*0.21); ctx.stroke();
      // Grip
      ctx.fillStyle = '#1a0a00'; ctx.strokeStyle = '#05040a'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.rect(-s*0.016, 0, s*0.032, s*0.09); ctx.fill(); ctx.stroke();
      // Guard
      ctx.fillStyle = '#444455'; ctx.beginPath(); ctx.rect(-s*0.036, -s*0.004, s*0.072, s*0.018); ctx.fill(); ctx.stroke();
      // Gold glow
      ctx.save(); ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = s*0.08;
      ctx.strokeStyle = 'rgba(255,200,0,0.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-s*0.018, 0); ctx.lineTo(s*0.018, 0); ctx.lineTo(0, -s*0.20); ctx.closePath(); ctx.stroke();
      ctx.restore();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  } else if (_shBranch === 'B' && riseT > 0.20) {
    // Obscurity: one breathing fear halo + two offset shadow echoes.
    const _t = _frameNow * 0.001;
    ctx.save();
    ctx.shadowColor = '#8d66ff'; ctx.shadowBlur = s * 0.18;
    for (let i = 0; i < 1; i++) {
      const _phase = (_t * 0.55) % 1.0;
      const _rad = s * (0.42 + _phase * 0.62);
      const _alp = (1 - _phase) * 0.50 * alpha;
      ctx.strokeStyle = `rgba(126,82,220,${_alp})`;
      ctx.lineWidth = s * 0.035 * (1 - _phase);
      ctx.beginPath(); ctx.ellipse(bX, fY - s*0.40, _rad, _rad * 0.62, 0, 0, Math.PI*2); ctx.stroke();
    }

    [-1, 1].forEach(side => {
      const echoX = bX + side * s * 0.31 + Math.sin(_t * 2.1 + side) * s * 0.025;
      const echoY = headCY + s * 0.05;
      ctx.globalAlpha = alpha * 0.34;
      ctx.fillStyle = '#25154a';
      ctx.beginPath(); ctx.ellipse(echoX, echoY, headR * 0.58, headR * 0.78, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#7e62da';
      ctx.beginPath(); ctx.arc(echoX + side*s*0.018, echoY, s*0.018, 0, Math.PI*2); ctx.fill();
    });

    if (atkActive && armStretch > 0.05) {
      // A large trailing crescent preserves Moroku's wide silhouette at the
      // exact moment the central body lunges toward the target.
      const backX = bX - dir * s * (0.12 + armStretch * 0.12);
      ctx.globalAlpha = alpha * (0.34 + armStretch * 0.24);
      ctx.fillStyle = '#281347';
      ctx.strokeStyle = 'rgba(151,105,235,0.72)'; ctx.lineWidth = s * 0.026;
      ctx.beginPath();
      ctx.moveTo(bX + dir*s*0.08, bodyTopY + s*0.16);
      ctx.bezierCurveTo(backX - dir*s*0.50, bodyTopY + s*0.18,
                        backX - dir*s*0.56, bodyBotY - s*0.18,
                        bX - dir*s*0.12, bodyBotY);
      ctx.bezierCurveTo(backX - dir*s*0.20, bodyBotY - s*0.30,
                        backX - dir*s*0.12, bodyTopY + s*0.34,
                        bX + dir*s*0.08, bodyTopY + s*0.16);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // Wide floor mantle with two split tails.
    ctx.globalAlpha = 0.50 * alpha;
    ctx.fillStyle = '#130923';
    ctx.beginPath(); ctx.ellipse(cx + lurchX*0.34, fY + s*0.014,
                                s*(0.58 + armStretch*0.14), s*0.105, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = bodyTopY - s * 0.10;
}
