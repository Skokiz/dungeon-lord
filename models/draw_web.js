// ═══════════════════════════════════════════════════════════════════════════
//  WEB — пастка від Арахни. Павутина навколо захопленого героя.
//  Тільки союзники можуть її знищити, герой у павутині не рухається/не б'є.
// ═══════════════════════════════════════════════════════════════════════════
function drawWebEntity(web, camY) {
  const s  = web.size;
  const cx = web.x;
  const cy = web.y - camY - s * 0.42;   // center around hero body
  const dt = Math.min((_frameNow - (web._wLastT || _frameNow)) / 1000, 0.05);
  web._wLastT = _frameNow;
  if (web._wT === undefined) web._wT = 0;
  web._wT += dt;
  const t = web._wT;

  // Damage feedback — shake when HP drops
  const hpFrac = Math.max(0, (web.hp || 0) / (web.maxHp || 1));
  const dmgShake = (web._wDmgShake || 0) > 0 ? web._wDmgShake : 0;
  if (web._wDmgShake > 0) web._wDmgShake = Math.max(0, web._wDmgShake - dt * 3);
  const shakeX = dmgShake * Math.sin(t * 60) * s * 0.010;
  const shakeY = dmgShake * Math.sin(t * 72) * s * 0.008;

  const R = s * 0.72;   // outer radius of web

  ctx.save();
  ctx.translate(cx + shakeX, cy + shakeY);

  // Soft glow behind web (wispy silk mist)
  const mistAlpha = 0.15 + 0.08 * Math.sin(t * 1.5);
  ctx.fillStyle = `rgba(220,225,245,${mistAlpha * hpFrac})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.15, R * 0.95, 0, 0, Math.PI * 2); ctx.fill();

  // ── RADIAL STRANDS (7 anchors going outward like spokes of a wheel) ─
  const strandCount = 8;
  const strandAlpha = 0.60 + 0.12 * Math.sin(t * 1.8);
  ctx.strokeStyle = `rgba(235,235,255,${strandAlpha * hpFrac})`;
  ctx.lineWidth = s * 0.010;
  ctx.lineCap = 'round';
  for (let i = 0; i < strandCount; i++) {
    const a = (i / strandCount) * Math.PI * 2 + t * 0.05;
    const jit = Math.sin(t * 1.3 + i) * 0.02;
    const xEnd = Math.cos(a) * R * (0.95 + jit);
    const yEnd = Math.sin(a) * R * 0.78 * (0.95 + jit);    // slight vertical flatten
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
  }

  // ── SPIRAL WEB (catching silk — connecting arcs between strands) ──
  const spiralLayers = 4;
  for (let sl = 0; sl < spiralLayers; sl++) {
    const rRatio = (sl + 1) / (spiralLayers + 1);
    const rx = R * rRatio;
    const ry = R * 0.78 * rRatio;
    ctx.strokeStyle = `rgba(215,220,245,${(0.35 + sl * 0.05) * hpFrac})`;
    ctx.lineWidth = s * (0.008 - sl * 0.001);
    ctx.beginPath();
    // Slightly wobbly elliptical ring
    const segs = 24;
    for (let si = 0; si <= segs; si++) {
      const ang = (si / segs) * Math.PI * 2 + t * 0.1 * (sl + 1);
      const wob = 1 + Math.sin(ang * 3 + t * 1.2 + sl) * 0.04;
      const x = Math.cos(ang) * rx * wob;
      const y = Math.sin(ang) * ry * wob;
      if (si === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Bright silk nodes at intersections (small dots)
  ctx.fillStyle = `rgba(250,250,255,${0.55 * hpFrac})`;
  for (let i = 0; i < strandCount; i++) {
    const a = (i / strandCount) * Math.PI * 2 + t * 0.05;
    for (let sl = 0; sl < spiralLayers; sl++) {
      const rRatio = (sl + 1) / (spiralLayers + 1);
      const x = Math.cos(a) * R * rRatio;
      const y = Math.sin(a) * R * 0.78 * rRatio;
      ctx.beginPath();
      ctx.arc(x, y, s * 0.006, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Cracks appear when HP is low (< 60%)
  if (hpFrac < 0.6) {
    const crackIntensity = 1 - hpFrac / 0.6;
    ctx.strokeStyle = `rgba(40,20,60,${crackIntensity * 0.6})`;
    ctx.lineWidth = s * 0.014;
    for (let ci = 0; ci < 3; ci++) {
      const ca = (ci * 2.1 + web._wT * 0.3) % (Math.PI * 2);
      const cLen = R * (0.3 + crackIntensity * 0.4);
      ctx.beginPath();
      ctx.moveTo(Math.cos(ca) * R * 0.2, Math.sin(ca) * R * 0.2);
      const bends = 3;
      for (let bi = 1; bi <= bends; bi++) {
        const bt = bi / bends;
        const ang = ca + Math.sin(bi * 1.7) * 0.3;
        const rr = R * 0.2 + cLen * bt;
        ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.78);
      }
      ctx.stroke();
    }
  }

  // Trapped hero visual indicator: small pulsing center
  const coreGlow = 0.50 + 0.22 * Math.sin(t * 3);
  ctx.fillStyle = `rgba(180,200,240,${coreGlow * 0.45 * hpFrac})`;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.060, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  // HP bar pos for web
  web._hpBarY = cy - R * 0.95;
}
