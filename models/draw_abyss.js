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

  const reachT = atkActive && ap < 0.30 ? ap / 0.30 : 0;
  const grabT  = atkActive && ap >= 0.30 && ap < 0.65 ? (ap - 0.30) / 0.35 : 0;

  const floatY = Math.sin(unit._abT * 1.10) * s * 0.028;
  const spinR  = unit._abT * (-1.55);
  const bodyR  = s * 0.400;
  const bX = cx;
  const bY = fY - s * 0.560 + floatY;

  ctx.save();

  // ── Dark gravitational shadow on floor (stretched) ───────────────
  ctx.fillStyle = 'rgba(5,0,12,0.72)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.62, s * 0.090, 0, 0, Math.PI * 2); ctx.fill();

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

  // ── TENTACLES (5, around portal edge) ────────────────────────────
  unit._abTentacles.forEach((tn, ti) => {
    // Attacking tentacle = the one closest to enemy at strike start (locked)
    const isAttackTentacle = ti === (unit._abAttackIdx ?? -1) && atkActive;
    const wave = Math.sin(unit._abT * tn.freq + tn.phase);
    const reachLen = isAttackTentacle
      ? s * (0.55 + reachT * 0.95 + grabT * 0.05)
      : s * (0.55 + wave * 0.15);
    // Base anchor: its natural orbital position (even when attacking)
    const baseA = tn.baseAng + unit._abT * 0.35;
    const bx0 = bX + Math.cos(baseA) * bodyR * 0.85;
    const by0 = bY + Math.sin(baseA) * bodyR * 0.70;
    // End direction: attack tentacle straightens toward enemy, others keep orbital direction
    const endDirX = isAttackTentacle ? dir : Math.cos(baseA);
    const endDirY = isAttackTentacle ? 0 : Math.sin(baseA);
    const ex2 = bx0 + endDirX * reachLen;
    const ey2 = by0 + endDirY * reachLen + (isAttackTentacle ? 0 : wave * s * 0.12);

    // Draw tentacle as multi-segment wavy line
    ctx.save();
    ctx.shadowColor = '#6600cc'; ctx.shadowBlur = s * 0.16;
    const segN = tn.segments;
    const depthA = Math.sin(baseA);
    const alpha = isAttackTentacle ? 1.0 : (depthA > 0 ? 0.95 : 0.55);

    // Outer thick dark layer
    ctx.strokeStyle = `rgba(10,0,25,${alpha})`;
    ctx.lineWidth = s * 0.080 * (isAttackTentacle ? 1.0 : 0.88);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let si = 0; si <= segN; si++) {
      const t2 = si / segN;
      // Lerp with wavy offset
      const wobble = Math.sin(t2 * Math.PI * 2 + unit._abT * 2.5 + tn.phase) * s * 0.04 * (1 - t2 * 0.5);
      const perp = {
        x: -endDirY, y: endDirX
      };
      const px = bx0 + (ex2 - bx0) * t2 + perp.x * wobble;
      const py = by0 + (ey2 - by0) * t2 + perp.y * wobble;
      if (si === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Inner purple tint
    ctx.strokeStyle = `rgba(80,0,160,${alpha * 0.70})`;
    ctx.lineWidth = s * 0.042 * (isAttackTentacle ? 1.0 : 0.88);
    ctx.beginPath();
    for (let si = 0; si <= segN; si++) {
      const t2 = si / segN;
      const wobble = Math.sin(t2 * Math.PI * 2 + unit._abT * 2.5 + tn.phase) * s * 0.04 * (1 - t2 * 0.5);
      const perp = { x: -endDirY, y: endDirX };
      const px = bx0 + (ex2 - bx0) * t2 + perp.x * wobble;
      const py = by0 + (ey2 - by0) * t2 + perp.y * wobble;
      if (si === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Tip (pointed claw/suckers)
    ctx.fillStyle = `rgba(140,0,220,${alpha})`;
    ctx.beginPath();
    ctx.arc(ex2, ey2, s * 0.035 * (isAttackTentacle ? 1.1 : 0.95), 0, Math.PI * 2);
    ctx.fill();
    // 3 small claws at tip
    if (isAttackTentacle) {
      ctx.strokeStyle = '#220040'; ctx.lineWidth = s * 0.014;
      for (let cl = 0; cl < 3; cl++) {
        const ca = -0.55 + cl * 0.55;
        ctx.beginPath();
        ctx.moveTo(ex2, ey2);
        ctx.lineTo(ex2 + endDirX * s * 0.05 + Math.cos(ca) * s * 0.04 * dir,
                   ey2 + endDirY * s * 0.05 + Math.sin(ca) * s * 0.04);
        ctx.stroke();
      }
    }
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
  const _abBranch = unit._branch || '';
  if (_abBranch === 'A') {
    // Infinite: faster absorption pulse rings + brighter vortex center
    const _t = unit._abT;
    for (let i = 0; i < 3; i++) {
      const _phase = (_t * 1.10 + i * 0.34) % 1.0;
      const _rad = bodyR * (0.25 + _phase * 1.10);
      const _alp = (1 - _phase) * 0.38;
      ctx.strokeStyle = `rgba(100,0,180,${_alp})`; ctx.lineWidth = s * 0.06 * (1 - _phase);
      ctx.beginPath(); ctx.arc(cx, bY, _rad, 0, Math.PI*2); ctx.stroke();
    }
    // Brighter void center
    ctx.save(); ctx.shadowColor = '#6600cc'; ctx.shadowBlur = s * 0.22;
    ctx.fillStyle = 'rgba(40,0,80,0.40)';
    ctx.beginPath(); ctx.arc(cx, bY, bodyR * 0.32, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_abBranch === 'B') {
    // Multiarmed: 3 extra short tentacle stubs radiating around portal
    const _t = unit._abT;
    ctx.save(); ctx.shadowColor = '#440088'; ctx.shadowBlur = s * 0.10;
    ctx.strokeStyle = 'rgba(60,0,100,0.55)'; ctx.lineWidth = s * 0.065; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const _ba = (i / 4) * Math.PI * 2 + _t * 0.22 + Math.PI * 0.25;
      const _sx = cx + Math.cos(_ba) * bodyR * 0.80;
      const _sy = bY + Math.sin(_ba) * bodyR * 0.80;
      const _ex = _sx + Math.cos(_ba + Math.sin(_t*1.2 + i) * 0.40) * s * 0.22;
      const _ey = _sy + Math.sin(_ba + Math.sin(_t*1.2 + i) * 0.40) * s * 0.22;
      ctx.beginPath(); ctx.moveTo(_sx, _sy); ctx.lineTo(_ex, _ey); ctx.stroke();
      ctx.fillStyle = 'rgba(40,0,80,0.60)';
      ctx.beginPath(); ctx.arc(_ex, _ey, s*0.035, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.restore();
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
