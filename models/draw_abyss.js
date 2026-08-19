// ═══════════════════════════════════════════════════════════════════════════
//  ABYSS — рівень 19, здібність: absorb_hero (засмоктує героя)
//  Елдрічний портал Порожнечі: чорна спіраль із 5 щупальцями навколо,
//  4 горизонтальні очі в пустоті, гравітаційне спотворення.
//  При absorbedHero — силует героя видно всередині.
// ═══════════════════════════════════════════════════════════════════════════
function drawAbyssMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._abLastT || _frameNow)) / 1000, 0.05);
  unit._abLastT = _frameNow;

  if (unit._abDir === undefined) {
    unit._abDir = 1; unit._abPrevX = cx;
    unit._abPrevAcd = unit.attackCooldown;
    unit._abT = 0; unit._abAp = 0;
    // 5 tentacles spaced around portal
    unit._abTentacles = Array.from({length: 5}, (_, i) => ({
      baseAng: (i / 5) * Math.PI * 2,
      phase:   Math.random() * Math.PI * 2,
      freq:    1.2 + Math.random() * 0.8,
      segments: 6
    }));
  }
  if (Math.abs(cx - unit._abPrevX) > 0.2)
    unit._abDir = cx > unit._abPrevX ? 1 : -1;
  unit._abPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._abDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._abDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._abPrevAcd || 0) + 3) {
    unit._abAp = 1.0;
    // Pick tentacle whose current orbital position is closest to enemy direction
    const targetAng = dir > 0 ? 0 : Math.PI;
    let bestIdx = 0, bestDist = Infinity;
    unit._abTentacles.forEach((tn, ti) => {
      const ang = tn.baseAng + unit._abT * 0.35;
      let d = ang - targetAng;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      d = Math.abs(d);
      if (d < bestDist) { bestDist = d; bestIdx = ti; }
    });
    unit._abAttackIdx = bestIdx;
  }
  unit._abPrevAcd = acd;
  unit._abT += dt;

  const atkDur = Math.min(0.68, atkBase / 60 * 0.82);
  if (unit._abAp > 0) unit._abAp = Math.max(0, unit._abAp - dt / atkDur);

  const atkActive  = unit._abAp > 0;
  const ap         = 1 - unit._abAp;
  const inFight    = unit.state === 'fight' || atkActive;
  const absorbed   = unit.absorbedHero || false;
  const _abBranch  = unit._branch || '';

  // Єдина крива удару для тіла й атакуючого щупальця. Старі reachT/grabT
  // обривали довжину точно на межі 0.30 і створювали візуальний стрибок.
  let strikeReach = 0;
  if (atkActive) {
    if (ap < 0.14) {
      strikeReach = 0;                         // коротке збирання сили
    } else if (ap < 0.38) {
      const f = (ap - 0.14) / 0.24;
      strikeReach = 1 - Math.pow(1 - f, 3);   // різкий викид
    } else if (ap < 0.58) {
      strikeReach = 1;                         // читабельний контакт
    } else if (ap < 0.92) {
      const f = (ap - 0.58) / 0.34;
      const r = 1 - f;
      strikeReach = r * r * (3 - 2 * r);      // м'яке втягування
    }
  }

  const floatY = Math.sin(unit._abT * 1.10) * s * 0.028;
  const spinR  = unit._abT * (-1.55);
  const bodyR  = s * 0.400;
  // Portal mass follows the strike a little, so the attacking limb is driven
  // by the whole creature instead of animating while the body remains frozen.
  const bX = cx + dir * s * 0.045 * strikeReach;
  const bY = fY - s * 0.560 + floatY;

  ctx.save();

  // ── Dark gravitational shadow on floor (stretched) ───────────────
  ctx.fillStyle = 'rgba(5,0,12,0.72)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.62, s * 0.090, 0, 0, Math.PI * 2); ctx.fill();

  // Branch silhouettes are established behind the common portal body.
  if (_abBranch === 'A') {
    // Infinite: a tall event-horizon eye, deliberately unlike the low base portal.
    ctx.save();
    ctx.shadowColor = '#8b22ff'; ctx.shadowBlur = s * 0.34;
    const halo = ctx.createRadialGradient(bX, bY, bodyR * 0.10, bX, bY, s * 0.72);
    halo.addColorStop(0, 'rgba(138,45,255,0.22)');
    halo.addColorStop(0.52, 'rgba(78,12,155,0.18)');
    halo.addColorStop(1, 'rgba(28,0,65,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.ellipse(bX, bY, s * 0.56, s * 0.78, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(155,72,255,0.72)'; ctx.lineWidth = s * 0.050;
    ctx.beginPath(); ctx.ellipse(bX, bY, s * 0.43, s * 0.64, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(215,155,255,0.42)'; ctx.lineWidth = s * 0.018;
    ctx.beginPath(); ctx.ellipse(bX, bY, s * 0.50, s * 0.72, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  } else if (_abBranch === 'B') {
    // Multiarmed: a broad shoulder-like darkness mass that anchors the extra limbs.
    ctx.save();
    ctx.shadowColor = '#6d009b'; ctx.shadowBlur = s * 0.20;
    ctx.fillStyle = 'rgba(22,0,34,0.78)';
    ctx.beginPath(); ctx.ellipse(bX, bY + s * 0.03, s * 0.64, s * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Gravitational distortion rings (expanding inward) ────────────
  for (let ri = 0; ri < 4; ri++) {
    const rOff = (ri / 4) * Math.PI * 2;
    const rWarp = bodyR * (1.22 + ri * 0.22 + Math.sin(unit._abT * 0.8 + rOff) * 0.05);
    const rAlpha = (0.42 - ri * 0.08) * (inFight ? 1.3 : 1.0);
    ctx.strokeStyle = `rgba(60,0,140,${Math.max(0, rAlpha)})`;
    ctx.lineWidth = s * (0.017 - ri * 0.003);
    ctx.beginPath();
    ctx.ellipse(bX, bY, rWarp, rWarp * (0.92 - ri * 0.04), spinR * 0.10 + ri * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Додаткові руки Багаторукої гілки лежать ЗА порталом. Корені заходять
  // глибоко під його край, тому істота не виглядає складеною з паличок.
  if (_abBranch === 'B') {
    ctx.save();
    ctx.shadowColor = '#8a00c8'; ctx.shadowBlur = s * 0.15;
    for (let i = 0; i < 4; i++) {
      const upper = i < 2;
      const side = i % 2 === 0 ? -1 : 1;
      const drive = atkActive && side === dir;
      const rootX = bX + side * bodyR * 0.34;
      const rootY = bY + (upper ? -s * 0.12 : s * 0.13);
      const restLen = s * (upper ? 0.57 : 0.49);
      const hitLen = drive ? s * (upper ? 0.70 : 0.48) * strikeReach : 0;
      const len = restLen + hitLen;
      const endX = rootX + side * len;
      const endY = drive
        ? bY + (upper ? -s * 0.10 : s * 0.13)
        : Math.min(
            bY + (upper ? -s * 0.35 : s * 0.34) + Math.sin(unit._abT * 1.8 + i) * s * 0.055,
            fY - s * 0.05
          );
      const points = [
        { x: rootX, y: rootY },
        { x: rootX + side * len * 0.28, y: rootY + (upper ? -s * 0.11 : s * 0.09) },
        { x: rootX + side * len * 0.62, y: drive ? endY + (upper ? -s * 0.10 : s * 0.08) : (rootY + endY) * 0.5 },
        { x: endX, y: endY }
      ];
      const grad = ctx.createLinearGradient(rootX, rootY, endX, endY);
      grad.addColorStop(0, 'rgba(8,0,18,0.98)');
      grad.addColorStop(0.58, 'rgba(50,3,78,0.96)');
      grad.addColorStop(1, 'rgba(116,18,158,0.92)');
      ctx.fillStyle = grad;
      _abRibbonPath(ctx, points, s * (drive ? 0.115 : 0.095), s * 0.018); ctx.fill();
      ctx.fillStyle = 'rgba(151,45,203,0.54)';
      _abRibbonPath(ctx, points, s * (drive ? 0.050 : 0.038), s * 0.007); ctx.fill();
    }
    ctx.restore();
  }

  // ── TENTACLES (5, around portal edge) ────────────────────────────
  unit._abTentacles.forEach((tn, ti) => {
    // Attacking tentacle = the one closest to enemy at strike start (locked)
    const isAttackTentacle = ti === (unit._abAttackIdx ?? -1) && atkActive;
    const wave = Math.sin(unit._abT * tn.freq + tn.phase);
    let reachLen = isAttackTentacle
      ? s * (0.56 + strikeReach * 1.08)
      : s * (0.55 + wave * 0.15);
    if (_abBranch === 'A' && !isAttackTentacle) reachLen *= 0.62;
    if (_abBranch === 'A' && isAttackTentacle) reachLen *= 1.08;
    if (_abBranch === 'B') reachLen *= 1.22;
    // Base anchor: its natural orbital position (even when attacking)
    const baseA = tn.baseAng + unit._abT * 0.35;
    const bx0 = bX + Math.cos(baseA) * bodyR * 0.85;
    const by0 = bY + Math.sin(baseA) * bodyR * 0.70;
    // End direction: attack tentacle straightens toward enemy, others keep orbital direction
    const endDirX = isAttackTentacle ? dir : Math.cos(baseA);
    const endDirY = isAttackTentacle ? 0 : Math.sin(baseA);
    const ex2 = bx0 + endDirX * reachLen;
    // Щупальця, спрямовані вниз, пробивали лінію підлоги (~20px під нею). Клампимо
    // кінець із запасом на wobble (perp-зсув до s*0.04) — сегменти лерпаються між
    // by0 і ey2, тож обмеження кінця тримає всю криву над підлогою.
    const _abFloorY = fY - s * 0.05;
    const ey2 = Math.min(
      by0 + endDirY * reachLen + (isAttackTentacle ? 0 : wave * s * 0.12),
      _abFloorY
    );

    // Draw one filled tapered ribbon. The portal body is painted afterwards
    // and hides the root, making each tentacle grow from the void itself.
    ctx.save();
    ctx.shadowColor = '#6600cc'; ctx.shadowBlur = s * 0.16;
    const segN = tn.segments;
    const depthA = Math.sin(baseA);
    const alpha = isAttackTentacle ? 1.0 : (depthA > 0 ? 0.95 : 0.55);
    const branchThick = _abBranch === 'B' ? 1.30 : _abBranch === 'A' ? 0.72 : 1;
    const tentaclePts = [];
    for (let si = 0; si <= segN; si++) {
      const t2 = si / segN;
      const wobble = Math.sin(t2 * Math.PI * 2 + unit._abT * 2.5 + tn.phase) * s * 0.04 * (1 - t2 * 0.5);
      const perp = { x: -endDirY, y: endDirX };
      const px = bx0 + (ex2 - bx0) * t2 + perp.x * wobble;
      const py = by0 + (ey2 - by0) * t2 + perp.y * wobble;
      tentaclePts.push({ x: px, y: py });
    }
    const outer = ctx.createLinearGradient(bx0, by0, ex2, ey2);
    outer.addColorStop(0, `rgba(4,0,12,${alpha})`);
    outer.addColorStop(0.55, `rgba(25,0,52,${alpha})`);
    outer.addColorStop(1, _abBranch === 'A' && isAttackTentacle
      ? `rgba(126,38,188,${alpha})`
      : `rgba(76,4,125,${alpha})`);
    ctx.fillStyle = outer;
    _abRibbonPath(
      ctx, tentaclePts,
      s * 0.092 * branchThick * (isAttackTentacle ? 1.34 : 0.90),
      s * 0.014 * branchThick
    );
    ctx.fill();
    ctx.fillStyle = _abBranch === 'A' && isAttackTentacle
      ? `rgba(202,126,255,${alpha * 0.64})`
      : `rgba(105,18,172,${alpha * 0.60})`;
    _abRibbonPath(
      ctx, tentaclePts,
      s * 0.038 * branchThick * (isAttackTentacle ? 1.28 : 0.88),
      s * 0.004
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // ── Portal body (dark vortex) ────────────────────────────────────
  ctx.shadowColor = '#5500aa';
  ctx.shadowBlur = s * (inFight ? 0.50 : 0.26);
  // Outer black ring
  ctx.save();
  ctx.globalAlpha = 0.95;
  _abVoidPath(ctx, bX, bY, bodyR * 1.02, bodyR * 0.96, 3, 1.40, unit._abT, 0);
  ctx.fillStyle = '#080014'; ctx.fill();
  // Mid void
  _abVoidPath(ctx, bX, bY, bodyR * 0.82, bodyR * 0.78, 4, 2.10, unit._abT, Math.PI * 0.6);
  ctx.fillStyle = '#14002a'; ctx.fill();
  ctx.restore();
  // Spiral swirl lines inside
  ctx.save();
  _abVoidPath(ctx, bX, bY, bodyR * 0.85, bodyR * 0.80, 4, 2.10, unit._abT, Math.PI * 0.6);
  ctx.clip();
  ctx.strokeStyle = `rgba(120,0,200,${0.50 + Math.sin(unit._abT * 1.5) * 0.20})`;
  ctx.lineWidth = s * 0.012;
  for (let spi = 0; spi < 3; spi++) {
    const spOff = spi * Math.PI * 2 / 3;
    ctx.beginPath();
    const spN = 36;
    for (let si = 0; si <= spN; si++) {
      const tt = si / spN;
      const ang = tt * Math.PI * 4 + spinR + spOff;
      const rr = tt * bodyR * 0.75;
      const xx = bX + Math.cos(ang) * rr;
      const yy = bY + Math.sin(ang) * rr * 0.92;
      if (si === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.shadowBlur = 0;

  // ── Absorbed hero silhouette (when absorbedHero) ─────────────────
  if (absorbed) {
    ctx.save();
    _abVoidPath(ctx, bX, bY, bodyR * 0.70, bodyR * 0.66, 4, 2.10, unit._abT, Math.PI * 0.6);
    ctx.clip();
    // Screaming hero silhouette
    const hAlpha = 0.40 + Math.sin(unit._abT * 3) * 0.18;
    ctx.shadowColor = '#ff3344'; ctx.shadowBlur = s * 0.30;
    ctx.fillStyle = `rgba(140,0,30,${hAlpha})`;
    // Body
    ctx.beginPath();
    ctx.ellipse(bX, bY + s * 0.04, s * 0.06, s * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(bX, bY - s * 0.10, s * 0.055, 0, Math.PI * 2); ctx.fill();
    // Arms flailing
    ctx.strokeStyle = `rgba(140,0,30,${hAlpha})`;
    ctx.lineWidth = s * 0.022; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bX - s * 0.05, bY - s * 0.04);
    ctx.lineTo(bX - s * 0.15, bY - s * 0.18 + Math.sin(unit._abT * 4) * s * 0.03);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX + s * 0.05, bY - s * 0.04);
    ctx.lineTo(bX + s * 0.15, bY - s * 0.18 + Math.sin(unit._abT * 4 + 1.5) * s * 0.03);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── 4 eyes (horizontally staggered in the void) ──────────────────
  const eyePositions = [
    { x: -0.42, y: -0.18, size: 1.0 },
    { x: -0.15, y: -0.05, size: 1.2 },
    { x:  0.15, y: -0.05, size: 1.2 },
    { x:  0.42, y: -0.18, size: 1.0 }
  ];
  eyePositions.forEach((ep, ei) => {
    const ex = bX + ep.x * bodyR;
    const ey = bY + ep.y * bodyR;
    const er = s * 0.026 * ep.size;
    const blinkT = (Math.sin(unit._abT * 0.9 + ei * 1.3) + 1) * 0.5;
    if (blinkT < 0.08) return;  // blink
    ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = s * (inFight ? 0.28 : 0.15);
    // Dark socket
    ctx.fillStyle = '#000004';
    ctx.beginPath(); ctx.arc(ex, ey, er * 1.4, 0, Math.PI * 2); ctx.fill();
    // Purple iris
    ctx.fillStyle = inFight ? '#dd66ff' : '#9900cc';
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
    // Pupil
    ctx.fillStyle = '#100018';
    ctx.beginPath(); ctx.arc(ex + dir * er * 0.20, ey, er * 0.45, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,220,255,0.60)';
    ctx.beginPath(); ctx.arc(ex - er * 0.30, ey - er * 0.30, er * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── Debris particles orbiting (sucked in) ────────────────────────
  for (let i = 0; i < 10; i++) {
    const da = spinR + i * Math.PI * 2 / 10;
    const dAge = ((unit._abT * 0.4 + i * 0.17) % 1);
    const dr = bodyR * (0.40 + (1 - dAge) * 0.90);
    const dx2 = bX + Math.cos(da) * dr;
    const dy2 = bY + Math.sin(da) * dr * 0.80;
    const dAlpha = dAge * 0.55;
    ctx.fillStyle = `rgba(100,0,180,${dAlpha})`;
    ctx.beginPath(); ctx.arc(dx2, dy2, s * 0.014, 0, Math.PI * 2); ctx.fill();
  }

  // ── Branch visuals ──────────────────────────────────────────
  if (_abBranch === 'A') {
    // Infinite: fast absorption rings, a vertical singularity pupil and suction lance.
    const _t = unit._abT;
    for (let i = 0; i < 3; i++) {
      const _phase = (_t * 1.10 + i * 0.34) % 1.0;
      const _rad = bodyR * (0.25 + _phase * 1.10);
      const _alp = (1 - _phase) * 0.38;
      ctx.strokeStyle = `rgba(100,0,180,${_alp})`; ctx.lineWidth = s * 0.06 * (1 - _phase);
      ctx.beginPath(); ctx.arc(bX, bY, _rad, 0, Math.PI*2); ctx.stroke();
    }
    ctx.save();
    ctx.shadowColor = '#d28cff'; ctx.shadowBlur = s * 0.30;
    const eye = ctx.createRadialGradient(bX - s*0.03, bY - s*0.04, 0, bX, bY, bodyR*(0.42 + strikeReach*0.07));
    eye.addColorStop(0, '#f3d9ff'); eye.addColorStop(0.18, '#ad5cff');
    eye.addColorStop(0.52, '#4f0a84'); eye.addColorStop(1, 'rgba(16,0,34,0)');
    ctx.fillStyle = eye;
    ctx.beginPath(); ctx.ellipse(bX, bY, bodyR * (0.24 + strikeReach*0.06), bodyR * (0.55 + strikeReach*0.10), 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#030006';
    ctx.beginPath(); ctx.ellipse(bX, bY, bodyR * (0.075 + strikeReach*0.025), bodyR * (0.34 + strikeReach*0.07), 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  } else if (_abBranch === 'B') {
    // The four branch arms were already rendered behind the portal. Only the
    // permanent devouring maw belongs on the front face.
    ctx.save();
    ctx.fillStyle = '#020003';
    ctx.beginPath(); ctx.ellipse(bX, bY + s*0.04, s*0.25, s*0.13, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#d8a8ee';
    for (let i = 0; i < 6; i++) {
      const tx = bX + (i - 2.5) * s*0.075;
      const top = i % 2 === 0;
      ctx.beginPath();
      ctx.moveTo(tx - s*0.025, bY + s*(top ? -0.055 : 0.125));
      ctx.lineTo(tx + s*0.025, bY + s*(top ? -0.055 : 0.125));
      ctx.lineTo(tx, bY + s*(top ? 0.025 : 0.045));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = bY - bodyR * 1.12 - s * 0.040;
}

function _abVoidPath(c, cx, cy, rx, ry, lobes, speed, t, phase) {
  c.beginPath();
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const w = Math.sin(a * lobes + t * speed + phase) * 0.11;
    c.lineTo(cx + Math.cos(a) * rx * (1 + w), cy + Math.sin(a) * ry * (1 + w));
  }
  c.closePath();
}

// Smooth filled ribbon with a wide organic root and a tapered tip. It replaces
// constant-width stroked "sticks" and lets the portal overpaint every root seam.
function _abRibbonPath(c, points, startW, endW) {
  if (!points || points.length < 2) return;
  const left = [], right = [];
  const last = points.length - 1;
  for (let i = 0; i <= last; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(last, i + 1)];
    const dx = next.x - prev.x, dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const t = i / last;
    const w = startW + (endW - startW) * t;
    left.push({ x: points[i].x + nx * w, y: points[i].y + ny * w });
    right.push({ x: points[i].x - nx * w, y: points[i].y - ny * w });
  }

  const traceSide = side => {
    for (let i = 1; i < side.length - 1; i++) {
      const mx = (side[i].x + side[i + 1].x) * 0.5;
      const my = (side[i].y + side[i + 1].y) * 0.5;
      c.quadraticCurveTo(side[i].x, side[i].y, mx, my);
    }
    c.lineTo(side[side.length - 1].x, side[side.length - 1].y);
  };

  c.beginPath();
  c.moveTo(left[0].x, left[0].y);
  traceSide(left);
  const rev = right.slice().reverse();
  c.lineTo(rev[0].x, rev[0].y);
  traceSide(rev);
  c.closePath();
}
