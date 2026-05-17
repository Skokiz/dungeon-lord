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
  unit._shT += dt;

  const atkDur = Math.min(0.55, atkBase / 60 * 0.75);
  if (unit._shAp > 0) unit._shAp = Math.max(0, unit._shAp - dt / atkDur);

  const atkActive = unit._shAp > 0;
  const ap        = 1 - unit._shAp;
  const inFight   = unit.state === 'fight' || atkActive;

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
  const floatY = Math.sin(unit._shT * 1.75) * s * 0.028;
  const floatX = Math.sin(unit._shT * 0.88) * s * 0.010;
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
    const wx = cx + w.off * s * 0.22 + w.drift * s * 0.10 * w.y;
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
      return base + timeJit + lobes;
    }
    function bodyLeanX(t) {
      return lean * s * t * 0.9;  // more lean at top
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

    // Outer smoky aura (biggest, faintest)
    ctx.globalAlpha = alpha * 0.38;
    buildBody(1.18);
    ctx.fillStyle = 'rgba(30,15,55,0.70)';
    ctx.fill();

    // Mid body (main darkness)
    ctx.globalAlpha = alpha * 0.92;
    buildBody(1.00);
    ctx.fillStyle = '#08050e';
    ctx.fill();

    // Inner slightly lighter (depth)
    ctx.globalAlpha = alpha * 0.80;
    ctx.save();
    buildBody(0.82);
    ctx.clip();
    const gradFill = ctx.createLinearGradient(bX, bodyTopY, bX, bodyBotY);
    gradFill.addColorStop(0, '#1a0f38');
    gradFill.addColorStop(0.6, '#0e0720');
    gradFill.addColorStop(1, '#050208');
    ctx.fillStyle = gradFill;
    ctx.fillRect(bX - s * 0.5, bodyTopY - s * 0.05, s, bodyH + s * 0.1);
    ctx.restore();

    // Purple outline aura
    ctx.globalAlpha = alpha;
    buildBody(1.00);
    ctx.strokeStyle = atkActive
      ? `rgba(180,160,255,${0.80 * alpha})`
      : `rgba(70,45,140,${(0.48 + Math.sin(unit._shT * 2) * 0.15) * alpha})`;
    ctx.lineWidth = s * 0.020;
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

      ctx.strokeStyle = `rgba(30,18,60,${tgAlpha})`;
      ctx.lineWidth = s * 0.040 * td.len;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, yy);
      ctx.quadraticCurveTo(midX, midY, ex, ey);
      ctx.stroke();
      // Tip wisp
      ctx.fillStyle = `rgba(60,35,120,${tgAlpha * 0.8})`;
      ctx.beginPath(); ctx.arc(ex, ey, s * 0.018 * td.len, 0, Math.PI * 2); ctx.fill();
    });

    // ── Attack claw-tendril (long reaching shadow) ─────────────────
    if (armStretch > 0.05) {
      const armStart = {
        x: bX + bodyLeanX(0.55) + dir * bodyWidth(0.55) * 0.85,
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

      // Dark arm base
      ctx.shadowColor = '#9988ff'; ctx.shadowBlur = s * 0.32 * armStretch;
      ctx.strokeStyle = '#06040e';
      ctx.lineWidth = s * 0.12 * (0.7 + armStretch * 0.5);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(armStart.x, armStart.y);
      ctx.quadraticCurveTo(armMid.x, armMid.y, armEnd.x, armEnd.y);
      ctx.stroke();
      // Inner tint
      ctx.strokeStyle = '#1e1240';
      ctx.lineWidth = s * 0.055;
      ctx.beginPath();
      ctx.moveTo(armStart.x, armStart.y);
      ctx.quadraticCurveTo(armMid.x, armMid.y, armEnd.x, armEnd.y);
      ctx.stroke();
      // Purple glow line
      ctx.strokeStyle = `rgba(160,130,255,${armStretch * 0.78})`;
      ctx.lineWidth = s * 0.022;
      ctx.beginPath();
      ctx.moveTo(armStart.x, armStart.y);
      ctx.quadraticCurveTo(armMid.x, armMid.y, armEnd.x, armEnd.y);
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
    const headX = bX + lean * s * 0.9;
    ctx.shadowColor = atkActive ? '#9988ff' : '#553399';
    ctx.shadowBlur  = s * (atkActive ? 0.42 : 0.20);
    // Head base (slight oval)
    ctx.fillStyle = '#050209';
    ctx.beginPath();
    ctx.ellipse(headX, headCY, headR * 0.92, headR * 1.05, 0, 0, Math.PI * 2); ctx.fill();
    // Hood-like darker band at top
    ctx.fillStyle = '#0c0720';
    ctx.beginPath();
    ctx.ellipse(headX, headCY - headR * 0.15, headR * 0.82, headR * 0.68, 0, 0, Math.PI * 2); ctx.fill();
    // Outline aura
    ctx.strokeStyle = atkActive ? 'rgba(170,150,255,0.85)' : 'rgba(60,40,130,0.55)';
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.ellipse(headX, headCY, headR * 0.92, headR * 1.05, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Eyes (drawn LAST, always partially visible) ──────────────────
  const eyeVisT = Math.max(riseT, 0.5);  // eyes visible even when sunk
  if (eyeVisT > 0.15) {
    const headX = bX + lean * s * 0.9;
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
  const _shBranch = unit._branch || '';
  if (_shBranch === 'A' && riseT > 0.30) {
    // Assassin: twin daggers materialising at arm level
    ctx.globalAlpha = alpha * 0.88;
    const _dagY = bodyBotY - bodyH * 0.52;
    [-1, 1].forEach(side => {
      const _dagX = bX + side * s * 0.30;
      const _ang = side * 0.38;
      ctx.save(); ctx.translate(_dagX, _dagY); ctx.rotate(_ang);
      // Blade
      ctx.fillStyle = '#c0c8d8'; ctx.strokeStyle = '#05040a'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-s*0.018, 0); ctx.lineTo(s*0.018, 0); ctx.lineTo(0, -s*0.20);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Fuller
      ctx.strokeStyle = 'rgba(220,230,255,0.50)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -s*0.02); ctx.lineTo(0, -s*0.17); ctx.stroke();
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
    // Obscurity: expanding darkness aura rings
    const _t = _frameNow * 0.001;
    for (let i = 0; i < 2; i++) {
      const _phase = (_t * 0.55 + i * 0.50) % 1.0;
      const _rad = s * (0.40 + _phase * 0.80);
      const _alp = (1 - _phase) * 0.28 * alpha;
      ctx.strokeStyle = `rgba(20,8,45,${_alp})`;
      ctx.lineWidth = s * 0.05 * (1 - _phase);
      ctx.beginPath(); ctx.ellipse(bX, fY - s*0.40, _rad, _rad * 0.62, 0, 0, Math.PI*2); ctx.stroke();
    }
    // Dark tendrils spreading on floor
    ctx.save(); ctx.globalAlpha = 0.40 * alpha;
    ctx.fillStyle = '#05020d';
    ctx.beginPath(); ctx.ellipse(cx, fY + s*0.018, s*0.55, s*0.10, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = bodyTopY - s * 0.10;
}
