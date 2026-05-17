// draw_monsters.js — Chibi-style monster renderers
// Globals: ctx, _frameNow, units, _heroStudio, _sBody, _hCtx

// ═══════════════════════════════════════════════════════════════════════════
//  HOUNDS — chibi hellhound (level 3, ability: bleed)
//  Horizontal body, wide snout, droopy hound ears, round pupils
//  Walk: 4-beat gait LB→LF→RB→RF (0.25 phase offset each)
//  Attack: crouch → leap arc → bite → land
// ═══════════════════════════════════════════════════════════════════════════
function drawHoundsMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._hdT === undefined) {
    unit._hdT    = Math.random() * Math.PI * 2;
    unit._hdDir  = 1;
    unit._hdAtkP = 0;
    unit._hdPrevCd = unit.attackCooldown || 0;
    unit._hdPrevX  = unit.x;
    unit._hdLastT  = _frameNow;
  }
  const dt = Math.min((_frameNow - unit._hdLastT) / 1000, 0.05);
  unit._hdLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._hdDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._hdPrevX) > 0.2) {
    unit._hdDir = unit.x > unit._hdPrevX ? 1 : -1;
  }
  unit._hdPrevX = unit.x;
  const dir = unit._hdDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._hdPrevCd || 0) + 3) unit._hdAtkP = 0.01;
  unit._hdPrevCd = acd;
  if (unit._hdAtkP > 0) { unit._hdAtkP += dt / 0.75; if (unit._hdAtkP >= 1) unit._hdAtkP = 0; }

  unit._hdT += dt * (unit.state === 'move' ? 3.5 : 1.0);
  const ap = unit._hdAtkP;

  // ── 4-beat walk (LB=0, LF=0.25, RB=0.5, RF=0.75) ──────────
  // side view: near=right(bright), far=left(dim)
  // legPhase 0-0.5=swing, 0.5-1.0=stance
  const gaitPhase  = ((unit._hdT % (2 * Math.PI)) / (2 * Math.PI));
  const pFarBack   = gaitPhase;
  const pFarFront  = (gaitPhase + 0.75) % 1.0;
  const pNearBack  = (gaitPhase + 0.50) % 1.0;
  const pNearFront = (gaitPhase + 0.25) % 1.0;

  // Body bob: 2 per cycle; head nod lags slightly
  let bob = 0;
  if (unit.state === 'move') {
    bob = Math.abs(Math.sin(unit._hdT * 2)) * s * 0.055;
  } else {
    bob = Math.sin(unit._hdT * 0.6) * s * 0.025;
  }
  const headNod = unit.state === 'move' ? Math.sin(unit._hdT * 2 + 0.4) * s * 0.022 : 0;

  // ── Attack: crouch → leap → bite → land ─────────────────────
  // yDisplace: positive = body goes UP, negative = body goes DOWN (crouch)
  let yDisplace = 0, lungX = 0, jawOpen = 0, bodyTilt = 0;
  let squashX = 1, squashY = 1;
  let isLeaping = false, leapArc = 0;

  if (ap > 0) {
    if (ap < 0.20) {
      // Crouch / windup
      const f = ap / 0.20, ef = f * f;
      yDisplace = -ef * s * 0.12;
      squashX   = 1 - ef * 0.10;
      squashY   = 1 + ef * 0.12;
      lungX     = -dir * s * 0.06 * ef;
    } else if (ap < 0.58) {
      // LEAP — gallop arc
      const f = (ap - 0.20) / 0.38;
      leapArc   = Math.sin(f * Math.PI);
      yDisplace = leapArc * s * 0.72;
      lungX     = dir * s * 0.50 * (1 - (1-f)*(1-f));
      bodyTilt  = dir * 0.28 * Math.sin(f * Math.PI * 0.85);
      squashX   = 1 + leapArc * 0.20;
      squashY   = 1 - leapArc * 0.14;
      jawOpen   = Math.max(0, (f - 0.38) / 0.62);
      isLeaping = true;
    } else if (ap < 0.78) {
      // Land + bite
      const f = (ap - 0.58) / 0.20;
      yDisplace = -f * f * s * 0.06;
      lungX     = dir * s * 0.50 * (1 - f);
      jawOpen   = 1.0 - f * 0.30;
      squashY   = 1.0 + f * 0.14;
      squashX   = 1.0 - f * 0.08;
    } else {
      // Recover
      const f = (ap - 0.78) / 0.22;
      jawOpen = (1 - f) * 0.70;
    }
  }

  const bx    = cx + lungX;
  const by    = fY - s * 0.38 - bob - yDisplace;
  const hx    = bx + dir * s * 0.44;
  const hy    = by - s * 0.10 + headNod;
  const headR = s * 0.31;
  const OL    = Math.max(1.2, s * 0.04);

  unit._hpBarY = hy - headR * 2.10 - 8;

  ctx.save();

  // ── Shadow ──────────────────────────────────────────────────
  const shadowAlpha = isLeaping ? Math.max(0.10, 0.25 - leapArc * 0.15) : 0.25;
  const shadowW     = isLeaping ? s * 0.55 * (1 - leapArc * 0.40) : s * 0.55;
  ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
  ctx.beginPath(); ctx.ellipse(cx + lungX * 0.4, fY, shadowW, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  // Hellfire ember glow on ground
  const glowA = shadowAlpha * 0.7 * (1 - leapArc * 0.8);
  ctx.shadowColor = '#ff2200'; ctx.shadowBlur = s * 0.55 * (1 - leapArc * 0.7);
  ctx.fillStyle = `rgba(200,50,0,${glowA})`;
  ctx.beginPath(); ctx.ellipse(cx + lungX * 0.4, fY, shadowW * 0.65, s * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── Tail — Doberman docked stub ─────────────────────────────
  const stubWag = Math.sin(unit._hdT * (unit.state === 'fight' ? 9 : 3)) * s * 0.03;
  const tx0 = bx - dir * s * 0.38, ty0 = by - s * 0.10;
  const tx1 = tx0 - dir * s * 0.03 + stubWag, ty1 = ty0 - s * 0.18;
  ctx.save();
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = s * 0.14;
  ctx.strokeStyle = '#000'; ctx.lineWidth = s * 0.11 + OL; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(tx0, ty0); ctx.lineTo(tx1, ty1); ctx.stroke();
  ctx.strokeStyle = '#1c0c08'; ctx.lineWidth = s * 0.11;
  ctx.beginPath(); ctx.moveTo(tx0, ty0); ctx.lineTo(tx1, ty1); ctx.stroke();
  ctx.fillStyle = '#ff5500';
  ctx.beginPath(); ctx.arc(tx1, ty1, s * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── Legs + body (layered) ───────────────────────────────────
  const legW    = s * 0.12, legH = s * 0.22;
  const legBaseY = by + s * 0.16;
  const xFrFar  = bx + dir * s * 0.14;
  const xFrNear = bx + dir * s * 0.16;
  const xBkFar  = bx - dir * s * 0.16;
  const xBkNear = bx - dir * s * 0.18;
  const moving  = unit.state === 'move' && !isLeaping;
  const pFF = moving ? pFarFront  : 0.75;
  const pFB = moving ? pFarBack   : 0.75;
  const pNF = moving ? pNearFront : 0.75;
  const pNB = moving ? pNearBack  : 0.75;

  if (isLeaping) {
    _hdLegLeap(bx, by, s, OL, dir, true,  true,  leapArc);
    _hdLegLeap(bx, by, s, OL, dir, false, true,  leapArc);
    _hdHoundBody(bx, by, dir, s, OL, squashX, squashY, bodyTilt);
    _hdLegLeap(bx, by, s, OL, dir, true,  false, leapArc);
    _hdLegLeap(bx, by, s, OL, dir, false, false, leapArc);
  } else {
    _hdLegWalk(xFrFar,  legBaseY, fY, legW, legH, OL, true,  dir, pFF);
    _hdLegWalk(xBkFar,  legBaseY, fY, legW, legH, OL, true,  dir, pFB);
    _hdHoundBody(bx, by, dir, s, OL, squashX, squashY, bodyTilt);
    _hdLegWalk(xFrNear, legBaseY, fY, legW, legH, OL, false, dir, pNF);
    _hdLegWalk(xBkNear, legBaseY, fY, legW, legH, OL, false, dir, pNB);
  }

  // ── Head ────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(hx, hy);

  // Far ear — Doberman erect triangular ear (back of skull)
  ctx.save();
  ctx.shadowColor = '#ff3300'; ctx.shadowBlur = headR * 0.25;
  ctx.fillStyle = '#160a06'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL;
  ctx.beginPath();
  ctx.moveTo(-dir * headR * 0.24, -headR * 0.82);   // base front
  ctx.lineTo(-dir * headR * 0.40, -headR * 1.64);   // tip
  ctx.lineTo(-dir * headR * 0.60, -headR * 0.78);   // base back
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5e1e0c';
  ctx.beginPath();
  ctx.moveTo(-dir * headR * 0.28, -headR * 0.82);
  ctx.lineTo(-dir * headR * 0.40, -headR * 1.50);
  ctx.lineTo(-dir * headR * 0.54, -headR * 0.80);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Head — Doberman wedge skull (elongated, dome at back, tapers to stop)
  ctx.save();
  ctx.shadowColor = '#ff3300'; ctx.shadowBlur = headR * 0.50;
  ctx.fillStyle = '#1e0e08'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL;
  ctx.beginPath();
  ctx.moveTo(-dir * headR * 0.66, -headR * 0.48);
  ctx.bezierCurveTo(-dir * headR * 0.56, -headR * 0.94, dir * headR * 0.08, -headR * 0.92, dir * headR * 0.26, -headR * 0.62);
  ctx.bezierCurveTo(dir * headR * 0.36, -headR * 0.44, dir * headR * 0.32, -headR * 0.18, dir * headR * 0.22, headR * 0.00);
  ctx.bezierCurveTo(dir * headR * 0.14, headR * 0.14, dir * headR * 0.04, headR * 0.30, -dir * headR * 0.14, headR * 0.38);
  ctx.bezierCurveTo(-dir * headR * 0.42, headR * 0.46, -dir * headR * 0.68, headR * 0.26, -dir * headR * 0.70, -headR * 0.02);
  ctx.bezierCurveTo(-dir * headR * 0.74, -headR * 0.28, -dir * headR * 0.72, -headR * 0.42, -dir * headR * 0.66, -headR * 0.48);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  // Skull highlight (top-back dome)
  ctx.fillStyle = 'rgba(65,18,5,0.38)';
  ctx.beginPath(); ctx.ellipse(-dir * headR * 0.32, -headR * 0.32, headR * 0.34, headR * 0.26, -0.15, 0, Math.PI * 2); ctx.fill();

  // Near ear — Doberman erect ear, slightly more centered (near side)
  ctx.save();
  ctx.shadowColor = '#ff3300'; ctx.shadowBlur = headR * 0.28;
  ctx.fillStyle = '#1e0e08'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL;
  ctx.beginPath();
  ctx.moveTo(-dir * headR * 0.02, -headR * 0.86);   // base front (near center)
  ctx.lineTo(-dir * headR * 0.16, -headR * 1.72);   // tip
  ctx.lineTo(-dir * headR * 0.36, -headR * 0.82);   // base back
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6e2412';
  ctx.beginPath();
  ctx.moveTo(-dir * headR * 0.06, -headR * 0.86);
  ctx.lineTo(-dir * headR * 0.16, -headR * 1.58);
  ctx.lineTo(-dir * headR * 0.30, -headR * 0.84);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Muzzle — Doberman: rectangular, parallel-sided, long
  {
    const mzL = headR * 0.14, mzR = headR * 1.00;
    const mzT = -headR * 0.06, mzB = headR * 0.30, mzCr = headR * 0.09;
    ctx.save(); ctx.scale(dir, 1);
    ctx.fillStyle = '#1e0e08'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL;
    ctx.beginPath();
    ctx.moveTo(mzL, mzT);
    ctx.lineTo(mzR - mzCr, mzT); ctx.arcTo(mzR, mzT, mzR, mzT + mzCr, mzCr);
    ctx.lineTo(mzR, mzB - mzCr); ctx.arcTo(mzR, mzB, mzR - mzCr, mzB, mzCr);
    ctx.lineTo(mzL, mzB); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Rust/ember marking (Doberman tan muzzle)
    ctx.fillStyle = 'rgba(155,52,8,0.72)';
    ctx.beginPath();
    ctx.moveTo(mzL, mzT + headR*0.04);
    ctx.lineTo(mzR - mzCr*1.1, mzT + headR*0.04);
    ctx.arcTo(mzR - headR*0.02, mzT + headR*0.04, mzR - headR*0.02, mzT + mzCr, mzCr*0.8);
    ctx.lineTo(mzR - headR*0.02, mzB - mzCr);
    ctx.arcTo(mzR - headR*0.02, mzB - headR*0.04, mzR - mzCr, mzB - headR*0.04, mzCr*0.8);
    ctx.lineTo(mzL, mzB - headR*0.04); ctx.closePath(); ctx.fill();
    // Nose
    const noseX = mzR - headR*0.04, noseY = (mzT + mzB) * 0.5;
    ctx.fillStyle = '#0c0604'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL * 0.7;
    ctx.beginPath(); ctx.ellipse(noseX, noseY, headR*0.10, headR*0.09, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,80,0,0.42)';
    ctx.beginPath(); ctx.ellipse(noseX - headR*0.05, noseY - headR*0.01, headR*0.033, headR*0.027, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(noseX + headR*0.02, noseY - headR*0.01, headR*0.033, headR*0.027, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // Mouth — seam along muzzle bottom-third
  const mouthY = headR * 0.19 + jawOpen * headR * 0.09;
  if (jawOpen > 0.20) {
    ctx.save();
    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = headR * 0.8 * jawOpen;
    ctx.fillStyle = `rgba(255,${Math.round(80 + jawOpen*60)},0,0.92)`;
    ctx.beginPath();
    ctx.moveTo(dir * headR * 0.20, mouthY);
    ctx.quadraticCurveTo(dir * headR * 0.56, mouthY + headR * 0.07, dir * headR * 0.88, mouthY);
    ctx.lineTo(dir * headR * 0.88, mouthY + headR * 0.20 * jawOpen);
    ctx.quadraticCurveTo(dir * headR * 0.56, mouthY + headR * 0.30 * jawOpen, dir * headR * 0.20, mouthY + headR * 0.20 * jawOpen);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = '#cc4400'; ctx.lineWidth = OL * 0.8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(dir * headR * 0.20, mouthY);
  ctx.quadraticCurveTo(dir * headR * 0.56, mouthY + headR * 0.07, dir * headR * 0.88, mouthY - headR * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(dir * headR * 0.88, mouthY);
  ctx.quadraticCurveTo(dir * headR * 0.93, mouthY + headR * 0.04, dir * headR * 0.88, mouthY + headR * 0.09);
  ctx.stroke();

  // Fangs
  if (jawOpen > 0.15 || unit.state === 'fight') {
    const fa = Math.max(0.4, jawOpen);
    ctx.fillStyle = '#ffe4c0'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL * 0.5;
    for (const [fxN, fw] of [[0.30, 0.13], [0.52, 0.11]]) {
      ctx.beginPath();
      ctx.moveTo(dir * headR * fxN, mouthY - headR * 0.02);
      ctx.lineTo(dir * headR * (fxN + 0.04), mouthY + headR * 0.28 * fa);
      ctx.lineTo(dir * headR * (fxN + fw), mouthY - headR * 0.02);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  // Eyes — hellfire, no white sclera
  const eyeX1 = dir * headR * (-0.05), eyeX2 = dir * headR * 0.18;
  const eyeY  = -headR * 0.18;
  const eyeR  = headR * 0.19;
  // Dark pits
  ctx.fillStyle = '#060302'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL * 0.7;
  ctx.beginPath(); ctx.ellipse(eyeX1, eyeY, eyeR, eyeR * 1.05, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(eyeX2, eyeY, eyeR*0.9, eyeR, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Glowing fire iris
  ctx.save();
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = eyeR * 2.2;
  ctx.fillStyle = '#ff6600';
  ctx.beginPath(); ctx.ellipse(eyeX1 + dir*eyeR*0.18, eyeY, eyeR*0.74, eyeR*0.80, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(eyeX2 + dir*eyeR*0.16, eyeY, eyeR*0.66, eyeR*0.72, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // Hot center
  ctx.fillStyle = '#ffcc44';
  ctx.beginPath(); ctx.arc(eyeX1 + dir*eyeR*0.18, eyeY, eyeR*0.30, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeX2 + dir*eyeR*0.16, eyeY, eyeR*0.26, 0, Math.PI*2); ctx.fill();
  // Vertical slit pupil
  ctx.fillStyle = '#0a0402';
  ctx.beginPath(); ctx.ellipse(eyeX1 + dir*eyeR*0.18, eyeY, eyeR*0.10, eyeR*0.60, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(eyeX2 + dir*eyeR*0.16, eyeY, eyeR*0.08, eyeR*0.52, 0, 0, Math.PI*2); ctx.fill();

  // Doberman rust brow dots (tan spot above each eye — breed hallmark)
  ctx.save();
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = eyeR * 1.0;
  ctx.fillStyle = 'rgba(180,65,10,0.88)';
  ctx.beginPath(); ctx.ellipse(eyeX1, eyeY - eyeR * 1.30, eyeR * 0.38, eyeR * 0.28, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(eyeX2, eyeY - eyeR * 1.25, eyeR * 0.32, eyeR * 0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // Bony brows — always visible on hellhound
  {
    const browIntensity = (unit.state === 'fight' || ap > 0) ? 1.0 : 0.55;
    ctx.save();
    ctx.shadowColor = '#ff2200'; ctx.shadowBlur = OL * (unit.state === 'fight' ? 4 : 1.5);
    ctx.strokeStyle = `rgba(180,60,10,${browIntensity})`; ctx.lineWidth = OL*1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(eyeX1-eyeR, eyeY-eyeR*1.10); ctx.lineTo(eyeX1+eyeR*0.5, eyeY-eyeR*1.62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(eyeX2+eyeR*0.5, eyeY-eyeR*1.10); ctx.lineTo(eyeX2-eyeR*0.30, eyeY-eyeR*1.62); ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // head

  // ── Branch visuals (drawn in world coords after head restore) ──
  const _hBranch = unit._branch || '';
  if (_hBranch === 'A') {
    // Pack: jagged battle scars across chest
    ctx.strokeStyle = '#cc2200'; ctx.lineWidth = OL * 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx - dir*s*0.02, by - s*0.06); ctx.lineTo(bx + dir*s*0.18, by + s*0.10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + dir*s*0.01, by - s*0.01); ctx.lineTo(bx + dir*s*0.14, by + s*0.16); ctx.stroke();
    // Pack claw badge above head
    ctx.save(); ctx.shadowColor = '#ff4400'; ctx.shadowBlur = s * 0.12;
    ctx.strokeStyle = 'rgba(220,70,10,0.60)'; ctx.lineWidth = OL * 1.0;
    const _px = hx - dir * headR * 0.75, _py = hy - headR * 1.55;
    for (const [da, dl] of [[-0.38, 0.52], [0, 0.62], [0.38, 0.52]]) {
      ctx.beginPath();
      ctx.moveTo(_px + da*headR*0.7, _py);
      ctx.lineTo(_px + da*headR*0.7, _py + dl*headR);
      ctx.stroke();
    }
    ctx.restore();
  } else if (_hBranch === 'B') {
    // Alpha: golden mane collar + crown spikes
    ctx.save(); ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = s * 0.22;
    ctx.fillStyle = 'rgba(210,160,10,0.68)';
    ctx.beginPath(); ctx.ellipse(bx - dir*s*0.04, by - s*0.20, s*0.20, s*0.11, dir*0.25, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ddaa10'; ctx.lineWidth = OL * 1.3;
    for (const [dx, dy] of [[-0.28, 2.0], [0, 2.35], [0.28, 2.0]]) {
      ctx.beginPath();
      ctx.moveTo(hx + dir*dx*headR, hy - headR * dy * 0.28);
      ctx.lineTo(hx + dir*dx*headR, hy - headR * dy * 0.28 - headR * 0.42);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore(); // main
}

// Hellhound body — dark charcoal with lava cracks and dorsal spikes
function _hdHoundBody(bx, by, dir, s, OL, squashX, squashY, tilt) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(tilt);
  ctx.scale(squashX, squashY);
  // Ember body aura
  ctx.shadowColor = '#ff3300'; ctx.shadowBlur = s * 0.22;
  ctx.fillStyle = '#0e0704'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL;
  ctx.beginPath(); ctx.ellipse(0, s*0.04, s*0.43, s*0.26, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1e1008';
  ctx.beginPath(); ctx.ellipse(0, 0, s*0.42, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  // Lava crack fissures
  ctx.save();
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = s * 0.18;
  ctx.strokeStyle = '#ff6600'; ctx.lineWidth = s * 0.028; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s*0.18, -s*0.12); ctx.lineTo(-s*0.08, s*0.05); ctx.lineTo(-s*0.03, s*0.14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( s*0.05, -s*0.17); ctx.lineTo( s*0.11, -s*0.03); ctx.lineTo( s*0.07, s*0.11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( s*0.20, -s*0.10); ctx.lineTo( s*0.22, s*0.07); ctx.stroke();
  // Bright crack cores
  ctx.strokeStyle = '#ffcc44'; ctx.lineWidth = s * 0.010;
  ctx.beginPath(); ctx.moveTo(-s*0.18, -s*0.12); ctx.lineTo(-s*0.08, s*0.05); ctx.lineTo(-s*0.03, s*0.14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( s*0.05, -s*0.17); ctx.lineTo( s*0.11, -s*0.03); ctx.lineTo( s*0.07, s*0.11); ctx.stroke();
  ctx.restore();
  // Doberman rust/ember chest spots and throat marking
  ctx.fillStyle = 'rgba(160,55,10,0.72)';
  // Two forechest spots (Doberman hallmark)
  ctx.beginPath(); ctx.ellipse(dir*s*0.28, s*0.10, s*0.07, s*0.05, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(dir*s*0.22, s*0.02, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  // Belly underline ember strip
  ctx.fillStyle = 'rgba(130,45,8,0.50)';
  ctx.beginPath(); ctx.ellipse(0, s*0.16, s*0.20, s*0.06, 0, 0, Math.PI*2); ctx.fill();

  // Dorsal spine spikes with ember tips
  ctx.save();
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = s * 0.14;
  for (let i = 0; i < 4; i++) {
    const spX = -s*0.25 + i * s*0.17;
    const tipY = -s*0.26 - (i === 1 || i === 2 ? s*0.05 : 0);
    ctx.fillStyle = '#1a0c06'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL * 0.65;
    ctx.beginPath();
    ctx.moveTo(spX - s*0.045, -s*0.17);
    ctx.lineTo(spX, tipY);
    ctx.lineTo(spX + s*0.045, -s*0.17);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff6600';
    ctx.beginPath(); ctx.arc(spX, tipY, s * 0.020, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffdd55';
    ctx.beginPath(); ctx.arc(spX, tipY, s * 0.009, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

// 4-beat walk leg: phase 0-0.5=swing(airborne), 0.5-1.0=stance(grounded)
function _hdLegWalk(baseX, baseY, floorY, w, h, ol, dim, dir, phase) {
  const col = dim ? '#160c08' : '#221008';
  const stride = h * 0.40;
  let footX, footY;
  if (phase < 0.5) {
    // Swing: foot arcs forward through the air
    const t = phase / 0.5;
    footX = baseX + dir * stride * (2*t - 1);
    footY = floorY - h * 0.42 * Math.sin(t * Math.PI);
  } else {
    // Stance: body moves over planted foot → foot slides back relative to body
    const t = (phase - 0.5) / 0.5;
    footX = baseX + dir * stride * (1 - 2*t);
    footY = floorY;
  }
  // Natural knee: midpoint + droop downward
  const kneeX = (baseX + footX) * 0.5;
  const kneeY = Math.min((baseY + footY) * 0.5 + h * 0.20, floorY - h * 0.08);
  ctx.strokeStyle = '#000'; ctx.lineWidth = w + ol; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(footX, footY); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(footX, footY); ctx.stroke();
  ctx.fillStyle = '#160a06'; ctx.strokeStyle = '#000'; ctx.lineWidth = ol * 0.7;
  ctx.beginPath(); ctx.ellipse(footX, footY - h * 0.05, w * 0.44, h * 0.12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

// Gallop legs during leap (flying-gallop pose)
function _hdLegLeap(bx, by, s, OL, dir, isBack, dim, arc) {
  const col = dim ? '#160c08' : '#221008';
  const lw = s * 0.12, lh = s * 0.22;

  // Body attachment point
  const baseX = isBack
    ? bx - dir * s * (dim ? 0.18 : 0.20)
    : bx + dir * s * (dim ? 0.12 : 0.14);
  const baseY = by + s * 0.12;

  // Knee and paw (gallop stretch toward floor)
  let kneeX, kneeY, pawX, pawY;
  if (isBack) {
    kneeX = baseX - dir * lh * 0.32 * arc;
    kneeY = baseY + lh * 0.30;
    pawX  = kneeX - dir * lh * 0.38 * arc;
    pawY  = kneeY + lh * 0.55 * (1 - arc * 0.30);
  } else {
    kneeX = baseX + dir * lh * 0.28 * arc;
    kneeY = baseY + lh * 0.26;
    pawX  = kneeX + dir * lh * 0.42 * arc;
    pawY  = kneeY + lh * 0.52 * (1 - arc * 0.28);
  }

  ctx.strokeStyle = '#000'; ctx.lineWidth = lw * 0.85 + OL; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(pawX, pawY); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = lw * 0.85;
  ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(pawX, pawY); ctx.stroke();
  // Knee joint
  ctx.fillStyle = dim ? '#160c08' : '#221008';
  ctx.beginPath(); ctx.arc(kneeX, kneeY, lw*0.35, 0, Math.PI*2); ctx.fill();
  // Paw
  ctx.fillStyle = '#160a06'; ctx.strokeStyle = '#000'; ctx.lineWidth = OL * 0.7;
  ctx.beginPath(); ctx.ellipse(pawX, pawY, lw*0.44, lh*0.14, 0.3*(isBack?-1:1)*dir, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}

// Helper: draw one hound leg (walk/idle)
function _hdLeg(x, floorY, w, h, ol, dim) {
  const col = dim ? '#8a4a20' : '#a05830';
  const hiCol = dim ? 'rgba(180,130,80,0.3)' : 'rgba(200,150,100,0.4)';
  // Leg
  ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = ol;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, floorY - h);
  ctx.bezierCurveTo(x - w * 0.6, floorY - h * 0.5, x - w * 0.5, floorY - h * 0.1, x - w * 0.3, floorY);
  ctx.lineTo(x + w * 0.3, floorY);
  ctx.bezierCurveTo(x + w * 0.5, floorY - h * 0.1, x + w * 0.6, floorY - h * 0.5, x + w / 2, floorY - h);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Paw (round bottom)
  ctx.fillStyle = '#804520'; ctx.strokeStyle = '#000'; ctx.lineWidth = ol * 0.8;
  ctx.beginPath(); ctx.ellipse(x, floorY - h * 0.06, w * 0.45, h * 0.14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Highlight
  ctx.fillStyle = hiCol;
  ctx.beginPath(); ctx.ellipse(x - w * 0.08, floorY - h * 0.65, w * 0.2, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
}


// ═══════════════════════════════════════════════════════════════════════════
//  ZOMBIE — egg-body chibi zombie (level 4, ability: infect)
//  Blue torn suit (Trump-style), light Elvis pompadour, dance-attack
// ═══════════════════════════════════════════════════════════════════════════
function drawZombieMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._zmT === undefined) {
    unit._zmT = Math.random() * Math.PI * 2;
    unit._zmDir = 1;
    unit._zmAtkP = 0;
    unit._zmPrevCd = unit.attackCooldown || 0;
    unit._zmPrevX = unit.x;
    unit._zmLastT = _frameNow;
    unit._zmDanceTimer = Math.random() * 20;
  }
  const dt = Math.min((_frameNow - unit._zmLastT) / 1000, 0.05);
  unit._zmLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._zmDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._zmPrevX) > 0.2) {
    unit._zmDir = unit.x > unit._zmPrevX ? 1 : -1;
  }
  unit._zmPrevX = unit.x;
  const dir = unit._zmDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._zmPrevCd || 0) + 3) unit._zmAtkP = 0.01;
  unit._zmPrevCd = acd;
  if (unit._zmAtkP > 0) { unit._zmAtkP += dt / 0.9; if (unit._zmAtkP >= 1) unit._zmAtkP = 0; }

  unit._zmT += dt * (unit.state === 'move' ? 1.8 : 0.8);
  const ap = unit._zmAtkP;
  const atkActive = ap > 0;

  // Patrol dance timer — only advances outside fight/attack
  if (unit.state !== 'fight' && !atkActive) {
    unit._zmDanceTimer += dt;
    if (unit._zmDanceTimer >= 35) unit._zmDanceTimer = 0;
  }
  const patrolDancing = unit.state !== 'fight' && !atkActive && unit._zmDanceTimer >= 30;
  const dancing = patrolDancing;

  // Zombie sway: phase-shifted so body lurches LATE relative to steps (wrong-timing)
  const wobble = Math.sin(unit._zmT * 0.85 + 0.8) * 0.07;
  const bob = (unit.state === 'move' && !patrolDancing)
    ? Math.abs(Math.sin(unit._zmT * 0.8 + 0.3)) * s * 0.09
    : Math.sin(unit._zmT * 0.4) * s * 0.025;

  // Setup heroStudio coords — slim humanoid body
  const H = s * 1.85;
  const {S, sx, sy} = _heroStudio(cx, fY, H, dir);
  _hCtx = ctx;

  // Attack body lurch — synced with slam phases
  // ap 0-0.15: lean back (windup), 0.15-0.58: lunge forward (slam), 0.58+: recover
  let lurchX = 0, atkBodyTilt = 0, atkHeadNod = 0;
  if (atkActive) {
    let raw;
    if (ap < 0.15) {
      const t = ap / 0.15;
      raw = -(t * t * (3 - 2 * t)) * 0.35;       // lean back slightly
    } else if (ap < 0.58) {
      const t = (ap - 0.15) / 0.43;
      raw = t * t;                                 // fast lunge forward (snap)
    } else {
      const t = (ap - 0.58) / 0.42;
      raw = 1 - t * t * (3 - 2 * t);              // ease back to neutral
    }
    lurchX      = dir * raw * 10 * S;
    atkBodyTilt = dir * Math.max(0, raw) * 0.20;
    atkHeadNod  = Math.max(0, raw) * 0.28;
  }

  // reachF: blend from beat pose (0) to attack slam pose (1)
  let reachF = 0;
  if (atkActive) {
    const raw = ap < 0.10 ? ap / 0.10          // quick enter
              : ap < 0.82 ? 1.0                 // hold attack
              : (1 - ap) / 0.18;               // smooth exit
    const t = Math.max(0, Math.min(1, raw));
    reachF = t * t * (3 - 2 * t);
  }

  // Dance phase
  const danceT = unit._zmT * 3.5;

  // HP bar position
  unit._hpBarY = sy(6) - 14;

  ctx.save();

  // ── Shadow ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(cx + lurchX * 0.6, fY, 14 * S, 2.5 * S, 0, 0, Math.PI * 2); ctx.fill();

  // Apply wobble + attack lurch
  ctx.save();
  const forwardLean = atkActive ? 0 : dir * 0.15;
  ctx.translate(cx + lurchX, fY);
  ctx.rotate(wobble + atkBodyTilt + forwardLean);
  ctx.translate(-(cx + lurchX), -fY - bob);

  // ── Walk phase (2-beat: near=0, far=0.5) ────────────────────
  const gait    = (unit._zmT / (Math.PI * 2)) % 1;
  const phaseNr = atkActive ? 0.75 : (patrolDancing ? 0    : gait);
  const phaseFr = atkActive ? 0.25 : (patrolDancing ? 0.50 : (gait + 0.5) % 1);
  const hipY    = sy(65);
  const floorY  = sy(91);
  const hipNrX  = cx + dir * 3.5 * S;
  const hipFrX  = cx - dir * 3.5 * S;

  function _zmLeg(hipX, hipYL, flrY, phase, dim) {
    const thighLen = 13 * S, shinLen = 11 * S;
    const col = dim ? '#1c1c2c' : '#2a2a3a';
    let thighAngle, kneeBend, liftY;
    if (patrolDancing) {
      const ds = dim ? -1 : 1;
      thighAngle = dir * Math.sin(danceT * ds) * 0.28;
      kneeBend   = Math.max(0, -Math.sin(danceT * ds) * 0.65);
      liftY      = 0;
    } else if (phase < 0.5) {
      const t = phase / 0.5, ef = t * t * (3 - 2 * t);
      thighAngle = dir * (0.14 * (2 * ef - 1));
      kneeBend   = 0.11 + 0.12 * Math.sin(t * Math.PI); // always bent + extra mid-swing
      liftY      = Math.sin(t * Math.PI) * (dim ? 1.2 : 3.0) * S; // far leg drags
    } else {
      const t = (phase - 0.5) / 0.5;
      thighAngle = dir * (0.14 - 0.28 * t);
      kneeBend   = 0.11; // knees always slightly bent in stance too
      liftY      = 0;
    }
    const kx = hipX + Math.sin(thighAngle) * thighLen;
    const ky = hipYL + Math.cos(thighAngle) * thighLen;
    const shinAngle = thighAngle - kneeBend;
    const fx = kx + Math.sin(shinAngle) * shinLen;
    const fy = Math.min(ky + Math.cos(shinAngle) * shinLen, flrY) - liftY;
    // Thigh + shin
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5.5 * S + 1.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hipX, hipYL); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 5.5 * S;
    ctx.beginPath(); ctx.moveTo(hipX, hipYL); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    // Knee cap
    ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.4 * S;
    ctx.beginPath(); ctx.arc(kx, ky, 2.2 * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Shoe
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(shinAngle * 0.35);
    ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.7 * S;
    ctx.beginPath(); ctx.ellipse(dir * 3.5 * S, 1.5 * S, 6.5 * S, 2.5 * S, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.ellipse(dir * 1.5 * S, 0.5 * S, 2.5 * S, 1.2 * S, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Torn cuff
    ctx.strokeStyle = '#4a7a30'; ctx.lineWidth = 0.45 * S; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx - 2.5 * S, fy - 1.5 * S); ctx.lineTo(fx - 0.8 * S, fy + 2 * S);
    ctx.moveTo(fx + 0.5 * S, fy - 2.0 * S); ctx.lineTo(fx + 2.5 * S, fy + 1.5 * S);
    ctx.stroke();
  }

  _zmLeg(hipFrX, hipY, floorY, phaseFr, true);
  _zmLeg(hipNrX, hipY, floorY, phaseNr, false);

  // ── Arms ─────────────────────────────────────────────────────
  const pump = Math.sin(danceT);

  // Beat: slow rise → snappy drop (top-to-bottom slap motion)
  let beatF = 0.5;
  if (!dancing && !atkActive) {
    const bn = ((unit._zmT * 0.72) % (Math.PI * 2)) / (Math.PI * 2);
    if (bn < 0.40) {
      const t = bn / 0.40; beatF = t * t * (3 - 2 * t);
    } else {
      const t = (bn - 0.40) / 0.60; beatF = 1 - t * t * (3 - 2 * t);
    }
  }

  let bendL, bendR;
  if (dancing) {
    const raw = pump * 0.5 + 0.5;
    const sharp = raw < 0.5
      ? 0.5 * Math.pow(raw * 2, 3)
      : 1 - 0.5 * Math.pow((1 - raw) * 2, 3);
    bendL = sharp;
    bendR = 1 - sharp;
  } else {
    bendL = 0;
    bendR = 0;
  }

  function _zmArm(shoulderX, shoulderY, bend, side, behind, rf = 0, isDancing = false, bf = beatF) {
    const upperLen = 14 * S;
    const foreLen  = 12 * S;
    const skinCol  = behind ? '#4a7228' : '#5a8c3a';
    const sleeveCol = behind ? '#1a3a6a' : '#1e4488';
    const lw = behind ? 4 * S : 4.5 * S;

    // ── Zombie beat pose: angle-based shoulder + elbow articulation
    // uaAngle — upper arm from DOWNWARD vertical (0=down, π/2=forward, π=up)
    // bf=0: arm swung down-forward (beat/slap) ~45° below horiz
    // bf=1: arm raised forward-up ~18° above horiz
    const uaAngle = Math.PI * (0.25 + 0.35 * bf);
    const elbXz   = shoulderX + dir * Math.sin(uaAngle) * upperLen;
    const elbYz   = shoulderY + Math.cos(uaAngle) * upperLen;
    // faAngle — forearm from downward vertical
    // bf=1 raised: forearm droops down (14°) — classic zombie droop
    // bf=0 beat:   forearm extends forward-down (59°) — slap/reach
    const faAngle = Math.PI * (0.08 + 0.25 * (1 - bf));
    const handXz  = elbXz + dir * Math.sin(faAngle) * foreLen;
    const handYz  = elbYz + Math.cos(faAngle) * foreLen;

    // ── Dance pose: arms up, alternating bent toward head
    const spreadX = side * 5 * S * dir;
    const elbXd = shoulderX + spreadX;
    const elbYd = shoulderY - upperLen;
    const headCX = sx(50), headCY = sy(18);
    const upX = elbXd, upY = elbYd - foreLen;
    const bentDx = headCX - elbXd, bentDy = headCY - elbYd;
    const bentDist = Math.hypot(bentDx, bentDy) || 1;
    const bentX = elbXd + (bentDx / bentDist) * foreLen;
    const bentY = elbYd + (bentDy / bentDist) * foreLen;
    const handXd = upX + (bentX - upX) * bend;
    const handYd = upY + (bentY - upY) * bend;

    // ── Pose selection ────────────────────────────────────────────
    let elbX, elbY, handX, handY;
    if (isDancing) {
      elbX = elbXd; elbY = elbYd; handX = handXd; handY = handYd;
    } else if (rf > 0) {
      // ── Overhead slam: windup up-back → fast slam down-forward ──
      // ap: 0-0.15 windup, 0.15-0.58 slam, 0.58+ extended/recovery
      let atkUa, atkFa;
      if (ap < 0.15) {
        // Windup: arms raise up and back
        const t = ap / 0.15;
        const ef = t * t * (3 - 2 * t);
        atkUa = uaAngle + ef * (Math.PI * 0.85 - uaAngle); // raise to ~153°
        atkFa = faAngle + ef * (Math.PI * 0.55 - faAngle); // forearm folds back
      } else if (ap < 0.58) {
        // Slam: fast arc down-forward (use squared ease for snap)
        const t = (ap - 0.15) / 0.43;
        const ef = t * t;                                   // fast non-eased drop
        atkUa = Math.PI * (0.85 - ef * 0.60);              // 153°→45° (down-forward)
        atkFa = Math.PI * (0.55 - ef * 0.22);              // unfolds: 99°→59°
      } else {
        // Extended + recovery
        const t = Math.min(1, (ap - 0.58) / 0.42);
        const ef = t * t * (3 - 2 * t);
        atkUa = Math.PI * (0.25 + ef * 0.35);              // recover to beat
        atkFa = Math.PI * (0.33 - ef * 0.25);              // recover to beat
      }
      // Blend from beat pose into attack pose using reachF
      const ua = uaAngle + (atkUa - uaAngle) * rf;
      const fa = faAngle + (atkFa - faAngle) * rf;
      elbX  = shoulderX + dir * Math.sin(ua) * upperLen;
      elbY  = shoulderY + Math.cos(ua) * upperLen;
      handX = elbX + dir * Math.sin(fa) * foreLen;
      handY = elbY + Math.cos(fa) * foreLen;
    } else {
      elbX = elbXz; elbY = elbYz; handX = handXz; handY = handYz;
    }

    // Sleeve (upper arm)
    ctx.strokeStyle = '#000'; ctx.lineWidth = lw + 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(elbX, elbY); ctx.stroke();
    ctx.strokeStyle = sleeveCol; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(elbX, elbY); ctx.stroke();

    // Forearm (skin — sleeve torn off)
    ctx.strokeStyle = '#000'; ctx.lineWidth = lw * 0.8 + 1.5;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(handX, handY); ctx.stroke();
    ctx.strokeStyle = skinCol; ctx.lineWidth = lw * 0.8;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(handX, handY); ctx.stroke();

    // Elbow joint
    ctx.fillStyle = sleeveCol; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5 * S;
    ctx.beginPath(); ctx.arc(elbX, elbY, lw * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Hand (+ drooping fingers in shuffle, claws in reach)
    ctx.fillStyle = skinCol; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.6 * S;
    ctx.beginPath(); ctx.arc(handX, handY, 3 * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (rf > 0.25) {
      // Attack claws
      const clawAngle = Math.atan2(handY - elbY, handX - elbX);
      ctx.strokeStyle = skinCol; ctx.lineWidth = 1.2 * S; ctx.lineCap = 'round';
      for (let fi = -1; fi <= 1; fi++) {
        const ca = clawAngle + fi * 0.30;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + Math.cos(ca) * 5 * S * rf, handY + Math.sin(ca) * 5 * S * rf);
        ctx.stroke();
      }
    } else if (!isDancing) {
      // Fingers follow forearm direction (droop/extend with beat)
      const fa = Math.atan2(handY - elbY, handX - elbX);
      ctx.strokeStyle = skinCol; ctx.lineWidth = 1.0 * S; ctx.lineCap = 'round';
      for (let fi = -1; fi <= 1; fi++) {
        const ca = fa + fi * 0.28;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + Math.cos(ca) * 5 * S, handY + Math.sin(ca) * 5 * S);
        ctx.stroke();
      }
    }
  }

  // ── Torso (green skin, narrow humanoid) ─────────────────────
  ctx.fillStyle = '#4a7a30'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9 * S;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(30));
  ctx.bezierCurveTo(sx(60), sy(30), sx(67), sy(33), sx(67), sy(38));
  ctx.bezierCurveTo(sx(66), sy(48), sx(64), sy(56), sx(62), sy(65));
  ctx.lineTo(sx(38), sy(65));
  ctx.bezierCurveTo(sx(36), sy(56), sx(34), sy(48), sx(33), sy(38));
  ctx.bezierCurveTo(sx(33), sy(33), sx(40), sy(30), sx(50), sy(30));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Torso highlight
  ctx.fillStyle = 'rgba(100,160,60,0.35)';
  ctx.beginPath();
  ctx.ellipse(sx(46), sy(40), 7 * S, 6 * S, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // ── Belt line ───────────────────────────────────────────────
  ctx.strokeStyle = '#1a1a28'; ctx.lineWidth = 1.2 * S;
  ctx.beginPath();
  ctx.moveTo(sx(36), sy(64)); ctx.lineTo(sx(64), sy(64));
  ctx.stroke();
  // Belt buckle
  ctx.fillStyle = '#888'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.4 * S;
  ctx.beginPath(); ctx.rect(sx(48), sy(63), 4 * S, 3 * S); ctx.fill(); ctx.stroke();

  // ── Blue suit jacket (torn, fitted to slim body) ────────────
  ctx.fillStyle = '#1e4488'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.7 * S;
  // Left panel
  ctx.beginPath();
  ctx.moveTo(sx(33), sy(34));
  ctx.lineTo(sx(34), sy(60));
  // Tattered bottom
  ctx.lineTo(sx(37), sy(58)); ctx.lineTo(sx(39), sy(62));
  ctx.lineTo(sx(42), sy(57)); ctx.lineTo(sx(44), sy(61));
  ctx.lineTo(sx(46), sy(56));
  // V opening
  ctx.lineTo(sx(48), sy(44));
  ctx.lineTo(sx(44), sy(36));
  ctx.lineTo(sx(33), sy(34));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Right panel
  ctx.beginPath();
  ctx.moveTo(sx(67), sy(34));
  ctx.lineTo(sx(66), sy(60));
  ctx.lineTo(sx(63), sy(57)); ctx.lineTo(sx(61), sy(61));
  ctx.lineTo(sx(58), sy(58)); ctx.lineTo(sx(56), sy(62));
  ctx.lineTo(sx(54), sy(56));
  ctx.lineTo(sx(52), sy(44));
  ctx.lineTo(sx(56), sy(36));
  ctx.lineTo(sx(67), sy(34));
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Lapels (lighter blue triangles)
  ctx.fillStyle = '#2a5498';
  ctx.beginPath();
  ctx.moveTo(sx(44), sy(36)); ctx.lineTo(sx(48), sy(44)); ctx.lineTo(sx(46), sy(33));
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx(56), sy(36)); ctx.lineTo(sx(52), sy(44)); ctx.lineTo(sx(54), sy(33));
  ctx.closePath(); ctx.fill();

  // Jacket highlight
  ctx.fillStyle = 'rgba(80,130,220,0.2)';
  ctx.beginPath();
  ctx.moveTo(sx(35), sy(36)); ctx.lineTo(sx(42), sy(36));
  ctx.lineTo(sx(40), sy(48)); ctx.lineTo(sx(35), sy(50));
  ctx.closePath(); ctx.fill();

  // ── Red tie (crooked) ───────────────────────────────────────
  ctx.fillStyle = '#cc2222'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.4 * S;
  ctx.beginPath();
  ctx.moveTo(sx(48), sy(36));
  ctx.lineTo(sx(52), sy(36));
  ctx.lineTo(sx(53), sy(52));
  ctx.lineTo(sx(50), sy(56));
  ctx.lineTo(sx(47), sy(52));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Tie knot
  ctx.fillStyle = '#aa1818';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(36), 2.2 * S, 1.5 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 0.3 * S; ctx.stroke();

  // ── Rip/tear marks ──────────────────────────────────────────
  ctx.strokeStyle = '#4a7a30'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath(); ctx.moveTo(sx(36), sy(40)); ctx.lineTo(sx(39), sy(44)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx(38), sy(42)); ctx.lineTo(sx(35), sy(46)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx(63), sy(50)); ctx.lineTo(sx(66), sy(54)); ctx.stroke();

  // ── Both arms — asymmetric shoulders, far arm lags beat by 0.18 ──
  const beatFar = Math.max(0, Math.min(1, beatF - 0.18)); // far arm slightly behind
  _zmArm(sx(dir > 0 ? 35 : 65), sy(34), bendL, -1, false, reachF, dancing, beatFar); // far: higher shoulder
  _zmArm(sx(dir > 0 ? 65 : 35), sy(38), bendR,  1, false, reachF, dancing, beatF);  // near: lower shoulder

  // ── Neck ────────────────────────────────────────────────────
  ctx.fillStyle = '#5a8c3a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.7 * S;
  ctx.beginPath();
  ctx.moveTo(sx(44), sy(30));
  ctx.lineTo(sx(44), sy(24));
  ctx.lineTo(sx(56), sy(24));
  ctx.lineTo(sx(56), sy(30));
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // ── Head ────────────────────────────────────────────────────
  const headR = 11 * S;
  const headX = sx(50);
  const headY = sy(18);
  const headTilt = dancing ? Math.sin(danceT * 0.7) * 0.08
                 : atkActive ? dir * atkHeadNod * 0.5
                 : dir * 0.24 + Math.sin(unit._zmT * 0.85 - 0.5) * 0.07; // forward hang + lag

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headTilt);

  // Head circle
  ctx.fillStyle = '#5a8c3a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9 * S;
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Head highlight
  ctx.fillStyle = 'rgba(120,180,80,0.35)';
  ctx.beginPath(); ctx.ellipse(-2.5 * S, -3.5 * S, headR * 0.5, headR * 0.4, -0.3, 0, Math.PI * 2); ctx.fill();
  // Lower face shadow
  ctx.fillStyle = 'rgba(30,50,15,0.4)';
  ctx.beginPath(); ctx.arc(0, 2.5 * S, headR * 0.8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill();
  // Trump spray-tan: lighter forehead (white-out center), orange cheeks
  ctx.fillStyle = 'rgba(255,240,190,0.18)';
  ctx.beginPath(); ctx.ellipse(0, -5.5 * S, 5.5 * S, 2.8 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200,100,15,0.22)';
  ctx.beginPath(); ctx.ellipse( dir * 4.2 * S, 2.0 * S, 3.2 * S, 2.6 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-dir * 3.8 * S, 2.2 * S, 2.6 * S, 2.2 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Trump combover ──────────────────────────────────────────
  const R = headR;
  const hBase = '#b89018';  // shadow layer
  const hMain = '#d4aa28';  // main mass (brassy gold)
  const hLigh = '#eed84a';  // highlight
  const hWisp = '#a87c10';  // comb lines

  // Layer 1: back base — thin coverage behind the swoop
  ctx.fillStyle = hBase; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo(-dir * R * 0.85, R * 0.05);
  ctx.bezierCurveTo(-dir * R * 0.95, -R * 0.55, -dir * R * 0.45, -R * 0.95, 0, -R * 0.92);
  ctx.bezierCurveTo( dir * R * 0.3,  -R * 0.88,  dir * R * 0.6,  -R * 0.65,  dir * R * 0.6, -R * 0.35);
  ctx.bezierCurveTo( dir * R * 0.3,  -R * 0.28, -dir * R * 0.25, -R * 0.32, -dir * R * 0.72, R * 0.08);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Layer 2: main combover — sweeps from back-low over the crown
  ctx.fillStyle = hMain; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.65 * S;
  ctx.beginPath();
  ctx.moveTo(-dir * R * 0.75, -R * 0.12);
  ctx.bezierCurveTo(-dir * R * 0.90, -R * 0.90, -dir * R * 0.2, -R * 1.32, dir * R * 0.18, -R * 1.32);
  ctx.bezierCurveTo( dir * R * 0.62, -R * 1.30,  dir * R * 1.0,  -R * 1.00,  dir * R * 1.05, -R * 0.62);
  ctx.bezierCurveTo( dir * R * 1.0,  -R * 0.30,  dir * R * 0.72, -R * 0.12,  dir * R * 0.52, -R * 0.08);
  ctx.bezierCurveTo( dir * R * 0.18, -R * 0.18, -dir * R * 0.22, -R * 0.30, -dir * R * 0.75, -R * 0.12);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Layer 3: front "flip" — the signature upswept curl at the front
  ctx.fillStyle = hMain; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo( dir * R * 0.68, -R * 0.55);
  ctx.bezierCurveTo( dir * R * 1.08, -R * 0.58,  dir * R * 1.20, -R * 0.28,  dir * R * 1.10, -R * 0.02);
  ctx.bezierCurveTo( dir * R * 1.02,  R * 0.10,  dir * R * 0.85,  R * 0.08,  dir * R * 0.78, -R * 0.05);
  ctx.bezierCurveTo( dir * R * 0.74, -R * 0.22,  dir * R * 0.72, -R * 0.40,  dir * R * 0.68, -R * 0.55);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Highlight streak along the top of the swoop
  ctx.fillStyle = 'rgba(255,240,130,0.52)';
  ctx.beginPath();
  ctx.moveTo(-dir * R * 0.32, -R * 1.00);
  ctx.bezierCurveTo( dir * R * 0.08, -R * 1.26,  dir * R * 0.52, -R * 1.20,  dir * R * 0.74, -R * 0.88);
  ctx.bezierCurveTo( dir * R * 0.46, -R * 0.96,  dir * R * 0.08, -R * 1.12, -dir * R * 0.32, -R * 1.00);
  ctx.closePath(); ctx.fill();

  // Comb sweep lines
  ctx.strokeStyle = hWisp; ctx.lineWidth = 0.45 * S; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-dir*R*0.55,-R*0.48); ctx.bezierCurveTo(-dir*R*0.50,-R*0.92, dir*R*0.12,-R*1.18, dir*R*0.58,-R*0.92); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-dir*R*0.38,-R*0.58); ctx.bezierCurveTo(-dir*R*0.20,-R*1.00, dir*R*0.30,-R*1.20, dir*R*0.68,-R*0.88); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-dir*R*0.18,-R*0.68); ctx.bezierCurveTo( dir*R*0.05,-R*1.08, dir*R*0.46,-R*1.18, dir*R*0.74,-R*0.72); ctx.stroke();

  // Flyaway wisps — the loose Trump strands
  ctx.strokeStyle = hLigh; ctx.lineWidth = 0.40 * S;
  ctx.beginPath(); ctx.moveTo( dir*R*0.60,-R*1.06); ctx.quadraticCurveTo( dir*R*0.85,-R*1.24, dir*R*0.72,-R*1.04); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( dir*R*0.40,-R*1.14); ctx.quadraticCurveTo( dir*R*0.66,-R*1.32, dir*R*0.56,-R*1.10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-dir*R*0.08,-R*1.18); ctx.quadraticCurveTo( dir*R*0.18,-R*1.40, dir*R*0.30,-R*1.20); ctx.stroke();

  // Sideburns (short — not Elvis, just Trump)
  ctx.fillStyle = hMain; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.4 * S;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(side * R * 0.82, R * 0.05);
    ctx.bezierCurveTo(side * R * 0.88, R * 0.12, side * R * 0.88, R * 0.24, side * R * 0.82, R * 0.28);
    ctx.lineTo(side * R * 0.68, R * 0.20);
    ctx.bezierCurveTo(side * R * 0.72, R * 0.12, side * R * 0.70, R * 0.05, side * R * 0.68, R * 0.05);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });

  // ── Eyes (sunken, yellow-green) ─────────────────────────────
  const eyeL = -4.5 * S * dir;
  const eyeR2 = 4.5 * S * dir;
  const eyeBaseY = -0.5 * S;
  // Eye sockets
  ctx.fillStyle = 'rgba(20,40,10,0.5)';
  ctx.beginPath(); ctx.ellipse(eyeL, eyeBaseY, 3.5 * S, 3 * S, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(eyeR2, eyeBaseY, 3.3 * S, 2.8 * S, 0.1, 0, Math.PI * 2); ctx.fill();
  // Irises
  ctx.fillStyle = '#aacc00'; ctx.shadowColor = '#aacc00'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(eyeL, eyeBaseY, 2.4 * S, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeR2, eyeBaseY, 2.2 * S, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Pupils
  ctx.fillStyle = '#0a1a04';
  ctx.beginPath(); ctx.arc(eyeL + dir * S, eyeBaseY, 1.2 * S, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeR2 + dir * 0.7 * S, eyeBaseY + 0.3 * S, 1 * S, 0, Math.PI * 2); ctx.fill();
  // Shine
  ctx.fillStyle = 'rgba(255,255,200,0.5)';
  ctx.beginPath(); ctx.arc(eyeL - 0.5 * S, eyeBaseY - S, 0.6 * S, 0, Math.PI * 2); ctx.fill();

  // ── Trump brows — near=raised skeptical arch, far=level/slight furrow ─
  ctx.strokeStyle = '#18260a'; ctx.lineWidth = 2.0 * S; ctx.lineCap = 'round';
  const browBaseY = eyeBaseY - 3.4 * S;
  // Near brow (eyeR2): strongly raised outer → "Can you believe this?"
  ctx.beginPath();
  ctx.moveTo(eyeR2 - dir * 2.8 * S, browBaseY + 0.8 * S);   // inner: slightly down
  ctx.quadraticCurveTo(eyeR2, browBaseY - 1.8 * S,           // peak: up high
                       eyeR2 + dir * 2.4 * S, browBaseY - 2.6 * S); // outer: very high
  ctx.stroke();
  // Far brow (eyeL): flatter, slight inner furrow
  ctx.beginPath();
  ctx.moveTo(eyeL - dir * 2.2 * S, browBaseY - 0.4 * S);    // outer: moderate height
  ctx.quadraticCurveTo(eyeL, browBaseY - 0.8 * S,            // slight arch
                       eyeL + dir * 2.8 * S, browBaseY + 1.0 * S); // inner: lower = concerned
  ctx.stroke();

  // ── Nose ────────────────────────────────────────────────────
  ctx.fillStyle = '#3a5a20';
  ctx.beginPath(); ctx.ellipse(dir * 1.5 * S, 3.5 * S, 1.5 * S, 1 * S, 0, 0, Math.PI * 2); ctx.fill();

  // ── Mouth — Trump duck lips pout ─────────────────────────────
  const mouthOpen = ap > 0 ? (ap < 0.4 ? ap / 0.4 : (ap < 0.6 ? 1 : 1 - (ap - 0.6) / 0.4))
                   : (dancing ? 0.3 + Math.sin(danceT) * 0.15 : 0);
  const mLine = 6.2 * S;                 // lip separation line Y
  const mBot  = mLine + 2.0 * S + mouthOpen * 2.5 * S; // bottom of lower lip (pout)

  // Mouth void when open
  if (mouthOpen > 0.06) {
    ctx.fillStyle = 'rgba(8, 3, 3, 0.96)';
    ctx.beginPath();
    ctx.ellipse(dir * 0.3 * S, mLine + mouthOpen * 1.2 * S,
                3.2 * S * (0.5 + mouthOpen * 0.5), 1.8 * S * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    // 3 front teeth visible in open pout
    ctx.fillStyle = '#c5b862'; ctx.strokeStyle = '#181206'; ctx.lineWidth = 0.3 * S;
    [[-1.9, 0.66, 1.2], [0.1, 0.72, 1.5], [1.8, 0.60, 1.1]].forEach(([tx, tw, th]) => {
      const fa = mouthOpen;
      ctx.beginPath();
      ctx.moveTo(tx * S - tw * S * 0.5, mLine + 0.1 * S);
      ctx.lineTo(tx * S,                mLine + 0.1 * S + th * S * fa);
      ctx.lineTo(tx * S + tw * S * 0.5, mLine + 0.1 * S);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }

  // Upper lip — Cupid's bow / M-shape (pursed pout)
  ctx.fillStyle = '#4a7228'; ctx.strokeStyle = '#0d0c04'; ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo(-3.8 * S, mLine);                                             // left corner
  ctx.bezierCurveTo(-3.2 * S, 5.0 * S, -1.8 * S, 4.6 * S, -0.8 * S, 5.2 * S); // left arch of M
  ctx.quadraticCurveTo(0, 5.6 * S, 0.8 * S, 5.2 * S);                    // M center dip
  ctx.bezierCurveTo( 1.8 * S, 4.6 * S,  3.2 * S, 5.0 * S,  3.8 * S, mLine);   // right arch
  ctx.quadraticCurveTo(0, mLine + 1.0 * S, -3.8 * S, mLine);              // bottom of upper lip
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Lower lip — fat rounded pout
  ctx.fillStyle = '#527a30';
  ctx.beginPath();
  ctx.moveTo(-3.6 * S, mLine + 0.3 * S);                                  // left edge
  ctx.bezierCurveTo(-3.6 * S, mBot, 3.6 * S, mBot, 3.6 * S, mLine + 0.3 * S); // rounded bottom
  ctx.quadraticCurveTo(0, mLine + 1.2 * S, -3.6 * S, mLine + 0.3 * S);   // close top
  ctx.closePath(); ctx.fill();
  // Lip sheen highlight on lower lip
  ctx.fillStyle = 'rgba(130,170,80,0.30)';
  ctx.beginPath(); ctx.ellipse(dir * 0.4 * S, mBot - 1.0 * S, 1.6 * S, 0.6 * S, 0, 0, Math.PI * 2); ctx.fill();

  ctx.restore(); // head transform

  ctx.restore(); // wobble transform

  // ── Branch visuals ──────────────────────────────────────────
  const _zmBranch = unit._branch || '';
  if (_zmBranch === 'A') {
    // Plague: toxic green wisps orbiting body
    const _t = _frameNow * 0.001;
    for (let i = 0; i < 5; i++) {
      const _a = _t * 1.3 + i * Math.PI * 0.4;
      const _r = s * (0.38 + (i % 3) * 0.12);
      const _wx = cx + Math.cos(_a) * _r;
      const _wy = fY - s * 0.88 + Math.sin(_a) * _r * 0.42;
      const _alpha = 0.50 + Math.sin(_t * 2.2 + i) * 0.18;
      ctx.fillStyle = `rgba(70,200,35,${_alpha})`;
      ctx.beginPath(); ctx.arc(_wx, _wy, s * 0.052, 0, Math.PI*2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(55,190,25,0.20)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.90, s*0.38, s*0.52, 0, 0, Math.PI*2); ctx.stroke();
  } else if (_zmBranch === 'B') {
    // Immortal: stitching seams across torso
    ctx.strokeStyle = 'rgba(160,200,230,0.72)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.setLineDash([3, 4]);
    for (const [ox, oy, ang] of [[0, 0.72, 0.10], [0, 0.40, -0.06], [0, 0.10, 0.08]]) {
      const _bsx = cx + ox * s, _bsy = fY - s * oy;
      ctx.save(); ctx.translate(_bsx, _bsy); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(-s*0.15, 0); ctx.lineTo(s*0.15, 0); ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);
    // Bone-white glow on arm
    ctx.save(); ctx.shadowColor = 'rgba(200,215,240,0.40)'; ctx.shadowBlur = s * 0.12;
    ctx.strokeStyle = 'rgba(215,230,255,0.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx + dir*s*0.20, fY - s*0.85, s*0.05, s*0.13, 0.20, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // main save
}

// ═══════════════════════════════════════════════════════════════════════════
//  SPIRIT — chibi ghost (level 5, ability: scare)
//  Teardrop dome + 3-scallop wavy tail, fin-arms, cute↔scary face toggle
//  Float: sine bob, tilt in move direction, tail lags
//  Attack: pull back → lunge → hollow eyes + void mouth + fangs → snap back
// ═══════════════════════════════════════════════════════════════════════════
function drawSpiritMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._spT === undefined) {
    unit._spT      = Math.random() * Math.PI * 2;
    unit._spDir    = 1;
    unit._spAtkP   = 0;
    unit._spPrevCd = unit.attackCooldown || 0;
    unit._spPrevX  = unit.x;
    unit._spLastT  = _frameNow;
  }
  const dt = Math.min((_frameNow - unit._spLastT) / 1000, 0.05);
  unit._spLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._spDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._spPrevX) > 0.2) {
    unit._spDir = unit.x > unit._spPrevX ? 1 : -1;
  }
  unit._spPrevX = unit.x;
  const dir = unit._spDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._spPrevCd || 0) + 3) unit._spAtkP = 0.01;
  unit._spPrevCd = acd;
  if (unit._spAtkP > 0) { unit._spAtkP += dt / 0.85; if (unit._spAtkP >= 1) unit._spAtkP = 0; }

  unit._spT += dt * (unit.state === 'move' ? 2.5 : 1.2);
  const ap = unit._spAtkP;
  const atkActive = ap > 0;

  // Float bob + travel tilt
  const bob  = Math.sin(unit._spT * 1.0) * s * 0.07;
  const tilt = unit.state === 'move' ? dir * 0.12 : Math.sin(unit._spT * 0.5) * 0.04;

  // Attack phases: pull back → lunge → recover
  let lungeX = 0, scareF = 0, squashX = 1, stretchY = 1;
  if (atkActive) {
    if (ap < 0.18) {
      const t = ap / 0.18, ef = t * t;
      lungeX   = -dir * ef * s * 0.10;
      scareF   = ef * 0.5;
      squashX  = 1 - ef * 0.10;
      stretchY = 1 + ef * 0.08;
    } else if (ap < 0.50) {
      const t = (ap - 0.18) / 0.32, ef = t * t;
      lungeX   = dir * ef * s * 0.26;
      scareF   = 0.5 + ef * 0.5;
      squashX  = 1 + ef * 0.14;
      stretchY = 1 - ef * 0.09;
    } else {
      const t = (ap - 0.50) / 0.50, ef = t * t * (3 - 2 * t);
      lungeX   = dir * (1 - ef) * s * 0.26;
      scareF   = 1 - ef;
      squashX  = 1 + (1 - ef) * 0.14;
      stretchY = 1 - (1 - ef) * 0.09;
    }
  }

  const bodyX = cx + lungeX;
  const bodyY = fY - s * 0.62 - bob;
  const bR    = s * 0.34 * squashX;
  const bRy   = s * 0.34 * stretchY;

  unit._hpBarY = bodyY - bRy - 12;

  ctx.save();

  // Body tilt transform
  ctx.translate(bodyX, bodyY);
  ctx.rotate(tilt);
  ctx.translate(-bodyX, -bodyY);

  // Glow
  ctx.shadowColor = atkActive && scareF > 0.3
    ? `rgba(180,210,255,${scareF * 0.85})`
    : 'rgba(180,210,255,0.45)';
  ctx.shadowBlur = atkActive && scareF > 0.3 ? 18 * scareF : 7;

  ctx.globalAlpha *= (0.80 + 0.12 * Math.sin(unit._spT * 1.3));

  // ── Ghost body (dome + 3-scallop skirt) ─────────────────────
  const bodyR = Math.round(200 + scareF * 20);
  const bodyG = Math.round(218 + scareF * 10);
  ctx.fillStyle = `rgb(${bodyR},${bodyG},255)`;

  // Scallop wave offsets (each tail moves independently)
  const tw1 = Math.sin(unit._spT * 1.3 + 1.2) * bR * 0.16;
  const tw2 = Math.sin(unit._spT * 1.1 + 2.8) * bR * 0.14;
  const tw3 = Math.sin(unit._spT * 1.5 + 0.4) * bR * 0.12;
  const tailBot = bodyY + bRy * 0.25 + bR * 1.15;
  const valH    = bR * 0.26;

  ctx.beginPath();
  ctx.arc(bodyX, bodyY, bR, Math.PI, 0); // dome: left→right
  // Right side curves down into right scallop
  ctx.bezierCurveTo(bodyX + bR,       bodyY + bRy * 0.6,
                    bodyX + bR * 0.82, tailBot - valH + tw3,
                    bodyX + bR * 0.54, tailBot + tw3);
  // Rise to valley, drop to center scallop
  ctx.quadraticCurveTo(bodyX + bR * 0.25, tailBot - valH + tw2,
                       bodyX,              tailBot + bR * 0.12 + tw2);
  // Rise to valley, drop to left scallop
  ctx.quadraticCurveTo(bodyX - bR * 0.25, tailBot - valH + tw1,
                       bodyX - bR * 0.54, tailBot + tw1);
  // Left side curves back up to body
  ctx.bezierCurveTo(bodyX - bR * 0.82, tailBot - valH + tw1,
                    bodyX - bR,        bodyY + bRy * 0.6,
                    bodyX - bR,        bodyY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Highlight (soft upper-left rim)
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(bodyX - bR * 0.22, bodyY - bRy * 0.24, bR * 0.48, bRy * 0.36, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Fin-arms ─────────────────────────────────────────────────
  const armSwing    = Math.sin(unit._spT * 1.0 + 0.6) * 0.14;
  const atkSpread   = atkActive ? scareF * dir * s * 0.10 : 0;
  ctx.strokeStyle   = 'rgba(200,220,255,0.68)';
  ctx.lineWidth     = s * 0.052;
  ctx.lineCap       = 'round';

  // Near arm (toward enemy)
  const na1x = bodyX + dir * bR * 0.80, na1y = bodyY - bRy * 0.04;
  const na2x = na1x + dir * s * 0.20 + atkSpread;
  const na2y = na1y + s * 0.10 + armSwing * s;
  ctx.beginPath();
  ctx.moveTo(na1x, na1y);
  ctx.quadraticCurveTo((na1x + na2x) / 2, na1y + s * 0.05, na2x, na2y);
  ctx.stroke();

  // Far arm
  const fa1x = bodyX - dir * bR * 0.80, fa1y = bodyY + bRy * 0.01;
  const fa2x = fa1x - dir * s * 0.18 - atkSpread * 0.5;
  const fa2y = fa1y + s * 0.12 - armSwing * s;
  ctx.beginPath();
  ctx.moveTo(fa1x, fa1y);
  ctx.quadraticCurveTo((fa1x + fa2x) / 2, fa1y + s * 0.04, fa2x, fa2y);
  ctx.stroke();

  // ── Eyes ─────────────────────────────────────────────────────
  const eyeSpX = bR * 0.30;
  const eyeY   = bodyY - bRy * 0.08;
  const eyeRx  = bR * 0.165;
  const eyeRy  = bR * 0.195;

  // Blink timer
  const bct   = (unit._spT * 0.38) % (Math.PI * 2);
  const blink = bct > Math.PI * 1.88 ? Math.sin((bct - Math.PI * 1.88) / 0.14 * Math.PI) : 0;

  [-1, 1].forEach(side => {
    const ex = bodyX + side * eyeSpX;

    if (atkActive && scareF > 0.45) {
      // Hollow black void eyes with faint glow rim
      ctx.shadowColor = `rgba(180,220,255,${scareF * 0.8})`;
      ctx.shadowBlur  = 6 * scareF;
      ctx.fillStyle   = 'rgba(10,15,40,0.96)';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeRx * (1 + scareF * 0.55), eyeRy * (1.2 + scareF * 0.65), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Tiny pale pupil dot
      ctx.fillStyle = `rgba(160,210,255,${scareF * 0.65})`;
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeRx * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // V-brow
      ctx.strokeStyle = `rgba(190,225,255,${scareF * 0.80})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(ex - eyeRx * 0.9, eyeY - eyeRy * 1.05 - 2 - side * 3 * scareF);
      ctx.lineTo(ex + eyeRx * 0.9, eyeY - eyeRy * 1.05 - 2 + side * 3 * scareF);
      ctx.stroke();
    } else {
      // Cute dark oval + white highlight
      const eh = eyeRy * Math.max(0.06, 1 - blink);
      ctx.fillStyle = 'rgba(20,28,70,0.93)';
      ctx.beginPath();
      ctx.ellipse(ex + dir * eyeRx * 0.14, eyeY, eyeRx, eh, 0, 0, Math.PI * 2);
      ctx.fill();
      if (blink < 0.75) {
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.beginPath();
        ctx.arc(ex - eyeRx * 0.25 + dir * eyeRx * 0.14, eyeY - eh * 0.28, eyeRx * 0.30, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // ── Scary mouth ───────────────────────────────────────────────
  if (atkActive && scareF > 0.50) {
    const mf     = (scareF - 0.50) / 0.50;
    const mouthY = eyeY + eyeRy * 2.6;
    const mW     = bR * 0.44 * mf;
    const mH     = bR * 0.30 * mf;
    ctx.shadowColor = 'rgba(150,200,255,0.45)';
    ctx.shadowBlur  = 5 * mf;
    ctx.fillStyle   = 'rgba(8,12,35,0.96)';
    ctx.beginPath();
    ctx.ellipse(bodyX, mouthY, mW, mH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (mf > 0.40) {
      ctx.fillStyle = 'rgba(230,240,255,0.88)';
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(bodyX + side * mW * 0.36, mouthY - mH * 0.15);
        ctx.lineTo(bodyX + side * mW * 0.50, mouthY + mH * 0.55);
        ctx.lineTo(bodyX + side * mW * 0.22, mouthY + mH * 0.55);
        ctx.closePath();
        ctx.fill();
      });
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _spBranch = unit._branch || '';
  if (_spBranch === 'A') {
    // Unquiet: chaotic red tendrils radiating from body
    const _t = _frameNow * 0.0015;
    ctx.strokeStyle = 'rgba(220,25,25,0.50)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const _a = _t * (1.4 + i * 0.35) + i * Math.PI * 0.67;
      const _r0 = bR * 0.88, _r1 = bR * (1.38 + Math.sin(_t * 2.1 + i) * 0.28);
      ctx.beginPath();
      ctx.moveTo(bodyX + Math.cos(_a) * _r0, bodyY + Math.sin(_a) * _r0 * 0.58);
      ctx.quadraticCurveTo(
        bodyX + Math.cos(_a + 0.75) * _r1 * 0.82, bodyY + Math.sin(_a + 0.75) * _r1 * 0.50,
        bodyX + Math.cos(_a + 1.45) * _r1,        bodyY + Math.sin(_a + 1.45) * _r1 * 0.58
      );
      ctx.stroke();
    }
    // Red tint on upper body
    ctx.globalAlpha = 0.18; ctx.fillStyle = '#cc0000';
    ctx.beginPath(); ctx.ellipse(bodyX, bodyY - bRy * 0.2, bR * 0.88, bRy * 0.65, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (_spBranch === 'B') {
    // Jester: rainbow orbiting particles
    const _t = _frameNow * 0.0025;
    const _cols = ['#ff4444','#ff9900','#ffee00','#44cc44','#4488ff','#aa44ff'];
    _cols.forEach((col, i) => {
      const _a = _t * 2.2 + i * Math.PI * 2 / _cols.length;
      const _px = bodyX + Math.cos(_a) * bR * 1.32;
      const _py = bodyY + Math.sin(_a) * bRy * 0.78;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(_px, _py, s * 0.040, 0, Math.PI*2); ctx.fill();
    });
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
//  BAT — vampire bat (level 6, ability: dodge)
//  Dark near-black wings, massive fangs, glowing red eyes, wing veins
//  Flight: wingbeat bob + sinusoidal weave
//  Attack: fold wings → dive swoop → bite → snap open
// ═══════════════════════════════════════════════════════════════════════════
function drawBatMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;

  // ── Per-unit anim state ─────────────────────────────────────
  if (unit._btT === undefined) {
    unit._btT      = Math.random() * Math.PI * 2;
    unit._btDir    = 1;
    unit._btAtkP   = 0;
    unit._btPrevCd = unit.attackCooldown || 0;
    unit._btPrevX  = unit.x;
    unit._btLastT  = _frameNow;
    unit._btSinOff = Math.random() * Math.PI * 2;
  }
  const dt = Math.min((_frameNow - unit._btLastT) / 1000, 0.05);
  unit._btLastT = _frameNow;

  // Direction
  if (unit.state === 'fight') {
    const h = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (h) unit._btDir = h.x > unit.x ? 1 : -1;
  } else if (Math.abs(unit.x - unit._btPrevX) > 0.2) {
    unit._btDir = unit.x > unit._btPrevX ? 1 : -1;
  }
  unit._btPrevX = unit.x;
  const dir = unit._btDir;

  // Attack detect
  const acd = unit.attackCooldown || 0;
  if (acd > (unit._btPrevCd || 0) + 3) unit._btAtkP = 0.01;
  unit._btPrevCd = acd;
  if (unit._btAtkP > 0) { unit._btAtkP += dt / 0.65; if (unit._btAtkP >= 1) unit._btAtkP = 0; }

  unit._btT += dt * (unit.state === 'move' ? 7.5 : 3.8);
  const ap       = unit._btAtkP;
  const atkActive = ap > 0;

  // Wing beat: 0=up, 1=down
  const wingPhase = (Math.sin(unit._btT) + 1) / 2;
  const bob  = -Math.sin(unit._btT) * s * 0.042;   // body rises on downstroke
  const sine = Math.sin(unit._btT * 0.35 + unit._btSinOff) * s * 0.065;

  // Dive phases: fold → swoop → recover
  let diveX = 0, diveY = 0, wingFold = 0;
  if (atkActive) {
    if (ap < 0.15) {
      const t = ap / 0.15, ef = t * t;
      wingFold = ef * 0.55;  diveX = dir * ef * s * 0.07;
    } else if (ap < 0.48) {
      const t = (ap - 0.15) / 0.33, ef = t * t;
      wingFold = 0.55 + ef * 0.35;
      diveX = dir * s * (0.07 + ef * 0.28);  diveY = ef * s * 0.16;
    } else {
      const t = (ap - 0.48) / 0.52, ef = t * t * (3 - 2 * t);
      wingFold = 0.9 * (1 - ef);
      diveX = dir * s * 0.35 * (1 - ef);  diveY = s * 0.16 * (1 - ef);
    }
  }

  const bodyX = cx + diveX;
  const bodyY = fY - s * 0.60 + bob + sine + diveY;
  const bR = s * 0.155;
  const hR = s * 0.245;

  unit._hpBarY = bodyY - hR - s * 0.55 - 8;

  const inFight = unit.state === 'fight' || atkActive;

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.beginPath(); ctx.ellipse(cx, fY, s * 0.38, s * 0.06, 0, 0, Math.PI * 2); ctx.fill();

  // Red ambient glow in fight/attack
  if (inFight) {
    ctx.shadowColor = `rgba(200,0,40,${0.18 + wingFold * 0.22})`;
    ctx.shadowBlur  = s * 0.55;
    ctx.fillStyle   = 'rgba(0,0,0,0)';
    ctx.beginPath(); ctx.arc(bodyX, bodyY, bR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur  = 0;
  }

  // ── Wing drawing ─────────────────────────────────────────────
  function drawWing(side, dim) {
    const shX = bodyX + side * bR * 0.80;
    const shY = bodyY - bR * 0.05;
    const hipX = bodyX + side * bR * 0.46;
    const hipY = bodyY + bR * 1.00;

    const beatAngle = (wingPhase - 0.5) * 1.35;
    const foldOff   = wingFold * 0.54;
    const reach     = s * (0.88 - wingFold * 0.42);  // wider wingspan

    function tip(baseA, lenF) {
      const a = beatAngle + baseA + foldOff;
      return { x: shX + side * Math.cos(a) * lenF * reach,
               y: shY + Math.sin(a) * lenF * reach };
    }

    const fA = tip(-0.30, 0.66);
    const fB = tip( 0.08, 1.00);
    const fC = tip( 0.48, 0.60);

    // Wing fill (near-black purple)
    ctx.fillStyle   = dim ? '#160820' : '#2d1245';
    ctx.strokeStyle = '#0a0412';
    ctx.lineWidth   = s * 0.040;

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(fA.x, fA.y);
    ctx.quadraticCurveTo((fA.x+fB.x)*0.5 + side*s*0.032, (fA.y+fB.y)*0.5 + s*0.024, fB.x, fB.y);
    ctx.quadraticCurveTo((fB.x+fC.x)*0.5 + side*s*0.022, (fB.y+fC.y)*0.5 + s*0.020, fC.x, fC.y);
    ctx.quadraticCurveTo((fC.x+hipX)*0.5, (fC.y+hipY)*0.5 + s*0.034, hipX, hipY);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Wing veins (visible membrane structure)
    ctx.strokeStyle = dim ? 'rgba(80,20,100,0.55)' : 'rgba(110,30,140,0.60)';
    ctx.lineWidth   = s * 0.022;
    ctx.lineCap     = 'round';
    [[shX,shY,fA.x,fA.y], [shX,shY,fB.x,fB.y], [shX,shY,fC.x,fC.y]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
    // Cross-vein
    ctx.beginPath(); ctx.moveTo(fA.x,fA.y);
    ctx.quadraticCurveTo((fA.x+fC.x)*0.5 + side*s*0.018, (fA.y+fC.y)*0.5, fC.x, fC.y);
    ctx.stroke();

    // Sharp claw at each finger tip
    ctx.strokeStyle = '#ccbbee'; ctx.lineWidth = s * 0.028;
    [[fA.x,fA.y,-0.4], [fB.x,fB.y,0], [fC.x,fC.y,0.35]].forEach(([tx,ty,ang]) => {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + side*s*0.055*Math.cos(ang), ty + s*0.055*Math.sin(ang+0.5));
      ctx.stroke();
    });
  }

  drawWing(-dir, true);

  // Body (dark, slightly elongated)
  if (inFight) { ctx.shadowColor = 'rgba(180,0,40,0.50)'; ctx.shadowBlur = s * 0.30; }
  ctx.fillStyle = '#1e0830'; ctx.strokeStyle = '#0a0412'; ctx.lineWidth = s * 0.055;
  ctx.beginPath(); ctx.ellipse(bodyX, bodyY, bR, bR * 1.18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  drawWing(dir, false);

  // ── Head ─────────────────────────────────────────────────────
  const headX = bodyX + dir * s * 0.025;
  const headY = bodyY - bR * 0.86 - hR * 0.65;

  if (inFight) { ctx.shadowColor = 'rgba(200,0,40,0.55)'; ctx.shadowBlur = s * 0.35; }
  ctx.fillStyle = '#2d1245'; ctx.strokeStyle = '#0a0412'; ctx.lineWidth = s * 0.055;
  ctx.beginPath(); ctx.arc(headX, headY, hR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Ears (tall, sharp, threatening)
  [-1, 1].forEach(side => {
    const eX  = headX + side * hR * 0.40;
    const eY  = headY - hR * 0.48;
    const etX = headX + side * hR * 0.46;
    const etY = headY - hR * 2.15;  // much taller
    ctx.fillStyle = '#2d1245'; ctx.strokeStyle = '#0a0412'; ctx.lineWidth = s * 0.045;
    ctx.beginPath();
    ctx.moveTo(eX - side * hR * 0.34, eY + hR * 0.10);
    ctx.lineTo(etX, etY);
    ctx.lineTo(eX + side * hR * 0.26, eY);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Inner ear — dark blood red
    ctx.fillStyle = '#7a1020';
    ctx.beginPath();
    ctx.moveTo(eX - side * hR * 0.16, eY + hR * 0.07);
    ctx.lineTo(etX + side * hR * 0.03, etY + hR * 0.35);
    ctx.lineTo(eX + side * hR * 0.12, eY + hR * 0.02);
    ctx.closePath(); ctx.fill();
  });

  // Angry V-brows
  ctx.strokeStyle = '#0a0412'; ctx.lineWidth = s * 0.048; ctx.lineCap = 'round';
  const browY = headY - hR * 0.40;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(headX + side * hR * 0.48, browY - hR * 0.15);  // outer: high
    ctx.lineTo(headX + side * hR * 0.08, browY + hR * 0.18);  // inner: low = V-shape
    ctx.stroke();
  });

  // Eyes — glowing red menace, slit pupils, NO cute highlights
  const eyeSp = hR * 0.27;
  const eyeY  = headY - hR * 0.04;
  const eyeRr = hR * 0.24;
  [-1, 1].forEach(side => {
    const ex = headX + side * eyeSp;
    ctx.shadowColor = '#ff0020'; ctx.shadowBlur = inFight ? s * 0.28 : s * 0.14;
    ctx.fillStyle = '#ff1030';
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Slit pupil (vertical)
    ctx.fillStyle = '#0a0008';
    ctx.beginPath(); ctx.ellipse(ex + dir * eyeRr * 0.20, eyeY, eyeRr * 0.22, eyeRr * 0.75, 0, 0, Math.PI * 2); ctx.fill();
  });

  // Nose (horseshoe bat-style, wider)
  ctx.fillStyle = '#5a1828';
  ctx.beginPath(); ctx.arc(headX - hR * 0.11, headY + hR * 0.32, hR * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(headX + hR * 0.11, headY + hR * 0.32, hR * 0.09, 0, Math.PI * 2); ctx.fill();

  // Mouth — snarling open in fight, always showing teeth
  const mF = atkActive
    ? Math.max(0, ap < 0.38 ? ap / 0.38 : ap < 0.58 ? 1 : 1 - (ap - 0.58) / 0.42)
    : (inFight ? 0.30 : 0);
  const mY = headY + hR * 0.60;

  // Mouth void
  if (mF > 0.05) {
    ctx.fillStyle = 'rgba(8,0,4,0.96)';
    ctx.beginPath();
    ctx.ellipse(headX, mY + hR * 0.10 * mF, hR * 0.38 * mF, hR * 0.22 * mF, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Lip line
  ctx.strokeStyle = '#0a0008'; ctx.lineWidth = s * 0.050; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headX - hR * 0.32, mY);
  ctx.quadraticCurveTo(headX + dir * hR * 0.05, mY + hR * 0.14 * (1 + mF), headX + hR * 0.32, mY);
  ctx.stroke();

  // MASSIVE fangs — the signature feature
  ctx.fillStyle = '#f0ecff'; ctx.strokeStyle = '#0a0008'; ctx.lineWidth = s * 0.030;
  [-1, 1].forEach(side => {
    const fx = headX + side * hR * 0.14;
    const fw = hR * 0.115;
    const fh = hR * (0.50 + mF * 0.40);  // huge fangs, grow on attack
    ctx.beginPath();
    ctx.moveTo(fx - fw, mY + hR * 0.02);
    ctx.lineTo(fx,      mY + fh);
    ctx.lineTo(fx + fw, mY + hR * 0.02);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Blood drip on attack
    if (mF > 0.55) {
      ctx.fillStyle = '#cc0022';
      const drip = (mF - 0.55) / 0.45;
      ctx.beginPath();
      ctx.arc(fx, mY + fh + drip * hR * 0.25, hR * 0.045 * drip, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0ecff';
    }
  });

  // Legs + razor claws
  ctx.lineCap = 'round';
  [-1, 1].forEach(side => {
    ctx.strokeStyle = '#2d1245'; ctx.lineWidth = s * 0.072;
    ctx.beginPath();
    ctx.moveTo(bodyX + side * bR * 0.44, bodyY + bR * 0.74);
    ctx.lineTo(bodyX + side * bR * 0.76, bodyY + bR * 1.58);
    ctx.stroke();
    // Three-claw spread
    ctx.strokeStyle = '#ccbbee'; ctx.lineWidth = s * 0.036;
    [[-0.4, 0], [0, 0.2], [0.4, 0]].forEach(([ca, cb]) => {
      ctx.beginPath();
      ctx.moveTo(bodyX + side * bR * 0.76, bodyY + bR * 1.58);
      ctx.lineTo(bodyX + side * (bR * 0.76 + s*0.06*Math.cos(ca)),
                 bodyY + bR * 1.58 + s * 0.07 * (1 + cb));
      ctx.stroke();
    });
  });

  // ── Branch visuals ──────────────────────────────────────────
  const _btBranch = unit._branch || '';
  if (_btBranch === 'A') {
    // Vampire: blood drips from fang area + deep crimson ring
    ctx.save(); ctx.shadowColor = '#aa0022'; ctx.shadowBlur = s * 0.38;
    ctx.strokeStyle = 'rgba(160,0,22,0.42)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(bodyX, bodyY, bR*1.28, bR*1.12, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
    // Blood drips below body
    ctx.fillStyle = '#cc0022'; ctx.strokeStyle = '#440010'; ctx.lineWidth = 0.9;
    [-0.22, 0.22].forEach(_dx => {
      const _fx = bodyX + _dx * bR, _fy = bodyY + bR * 0.44;
      const _dl = bR * (0.28 + Math.abs(Math.sin(_frameNow * 0.0020 + _dx * 6)) * 0.22);
      ctx.beginPath(); ctx.moveTo(_fx, _fy); ctx.lineTo(_fx, _fy + _dl); ctx.stroke();
      ctx.beginPath(); ctx.arc(_fx, _fy + _dl, bR * 0.07, 0, Math.PI*2); ctx.fill();
    });
  } else if (_btBranch === 'B') {
    // Swarm: 2 ghost-bats trailing behind
    ctx.globalAlpha = 0.28;
    [-1, 1].forEach((side, i) => {
      const _offX = -dir * s * (0.62 + i * 0.38);
      const _offY = Math.sin(_frameNow * 0.0014 + i * 1.4) * s * 0.10;
      const _mbR  = bR * 0.50;
      ctx.fillStyle = '#2d1245';
      ctx.beginPath(); ctx.ellipse(bodyX + _offX, bodyY + _offY, _mbR, _mbR*0.70, 0, 0, Math.PI*2); ctx.fill();
      [-1, 1].forEach(ws => {
        ctx.beginPath();
        ctx.ellipse(bodyX + _offX + ws * _mbR * 0.92, bodyY + _offY, _mbR*0.60, _mbR*0.28, ws*0.28, 0, Math.PI*2);
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  GOLEM — stone golem (level 7, ability: stun)
//  Inverted-triangle body (wide shoulders > hips), fists bigger than head,
//  forward-lean posture, squash on stomp, amber rune eyes, crack detail
// ═══════════════════════════════════════════════════════════════════════════
function drawGolemMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._glLastT || _frameNow)) / 1000, 0.05);
  unit._glLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._glDir === undefined) {
    unit._glDir = 1; unit._glPrevX = cx; unit._glPrevAcd = unit.attackCooldown;
    unit._glT = 0; unit._glAp = 0; unit._glRingT = 0; unit._glLegPh = 0;
  }
  if (Math.abs(cx - unit._glPrevX) > 0.2)
    unit._glDir = cx > unit._glPrevX ? 1 : -1;
  unit._glPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._glDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._glDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._glPrevAcd || 0) + 3) {
    unit._glAp = 1.0;
    if (Math.random() < 0.12) unit._glRingT = 1.0;
  }
  unit._glPrevAcd = acd;
  unit._glT += dt;

  const atkDur = Math.min(0.80, atkBase / 60 * 0.85);
  if (unit._glAp   > 0) unit._glAp   = Math.max(0, unit._glAp   - dt / atkDur);
  if (unit._glRingT > 0) unit._glRingT = Math.max(0, unit._glRingT - dt / 0.65);

  const atkActive = unit._glAp > 0;
  const ap = 1 - unit._glAp; // 0=just fired, 1=done

  const windup = unit.state === 'fight' ? 1 - Math.min(1, acd / (atkBase * 0.35)) : 0;
  const inFight = unit.state === 'fight' || atkActive;

  if (unit.state === 'move') {
    unit._glLegPh = (unit._glLegPh + dt / 0.72) % 1;
  } else {
    const frac = unit._glLegPh % 1;
    unit._glLegPh += dt * 2.0 * (frac < 0.5 ? 1 : -1);
  }

  // ── Squash on stomp ──────────────────────────────────────────────
  // Peak squash when both feet grounded (cos = 1 at ph=0,0.5)
  const sqF = unit.state === 'move'
    ? Math.max(0, Math.cos(unit._glLegPh * Math.PI * 2)) * 0.13
    : 0;
  const scX = 1 + sqF;
  const scY = 1 - sqF * 0.70;

  // ── Attack motion ────────────────────────────────────────────────
  const breathe = Math.sin(unit._glT * 0.70) * s * 0.010;
  let lurchX = 0, lurchY = 0, fistRaise = 0, fistExtend = 0;
  if (atkActive) {
    if (ap < 0.22) {                     // anticip: lean back, fist up
      const f = ap / 0.22;
      lurchX = -dir * s * 0.16 * f;  fistRaise = f;
    } else if (ap < 0.50) {             // slam: lunge hard
      const f = (ap - 0.22) / 0.28;
      lurchX = dir * s * 0.30 * f - dir * s * 0.16 * (1 - f);
      lurchY = s * 0.07 * f;
      fistRaise = 1 - f;  fistExtend = f;
    } else {                             // recovery
      const f = (ap - 0.50) / 0.50;
      lurchX = dir * s * 0.30 * (1 - f);
      lurchY = s * 0.07 * (1 - f);
    }
  } else if (windup > 0.05) {
    lurchX = -dir * s * 0.10 * windup;  fistRaise = windup * 0.80;
  }

  // ── Geometry ─────────────────────────────────────────────────────
  const bH   = s * 0.52;    // body half-height
  const legH = s * 0.36;    // leg height
  const bX   = cx + Math.sin(unit._glT * 0.50) * s * 0.006 + lurchX;
  const bY   = fY - legH - bH + breathe + lurchY;  // body CENTER above floor

  // Inverted trapezoid: wide shoulders, narrow hips
  const shW  = s * 0.72 * scX;   // shoulder half-width
  const hipW = s * 0.44 * scX;   // hip half-width
  const bodyH = bH * 2.0 * scY;
  const bodyTop = bY - bodyH * 0.50;   // top of body (shoulder level)
  const bodyBot = bY + bodyH * 0.50;   // bottom (hip level)
  const midY  = bodyTop + bodyH * 0.50;  // widest point (middle)

  // Forward lean: upper body tilts toward enemy
  const tilt = dir * s * 0.12;

  const headR = s * 0.215;
  const headY = bodyTop - headR * 1.20;

  const fR = s * 0.230;    // MASSIVE fists — bigger than head

  ctx.save();

  // ── Shadow ───────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(bX, fY + s * 0.02, shW * 1.10, s * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Legs (thick stone pillars) ────────────────────────────────────
  [-1, 1].forEach(side => {
    const liftF = Math.max(0, Math.sin((unit._glLegPh + (side === 1 ? 0 : 0.5)) * Math.PI * 2));
    const lx    = bX + side * hipW * 0.72;
    const lyTop = bodyBot - s * 0.04;
    const lyBot = fY - liftF * s * 0.14;
    const lw    = s * 0.20;

    ctx.fillStyle = '#5a4838';
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.038;
    ctx.beginPath();
    ctx.moveTo(lx - lw * 1.10, lyTop);
    ctx.lineTo(lx + lw * 1.10, lyTop);
    ctx.lineTo(lx + lw,        lyBot);
    ctx.lineTo(lx - lw,        lyBot);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Foot — flat wide block
    ctx.fillStyle = '#493828';
    ctx.beginPath();
    ctx.moveTo(lx - lw * 1.45, lyBot);
    ctx.lineTo(lx + lw * 1.45, lyBot);
    ctx.lineTo(lx + lw * 1.25, lyBot + s * 0.11);
    ctx.lineTo(lx - lw * 1.25, lyBot + s * 0.11);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Crack on leg
    ctx.strokeStyle = 'rgba(30,18,8,0.60)'; ctx.lineWidth = s * 0.016;
    ctx.beginPath();
    ctx.moveTo(lx - lw * 0.25, lyTop + (lyBot - lyTop) * 0.25);
    ctx.lineTo(lx + lw * 0.15, lyTop + (lyBot - lyTop) * 0.65);
    ctx.stroke();
  });

  // ── Far arm (behind body) ─────────────────────────────────────────
  {
    const side = -dir;
    const shX  = bX + side * shW * 0.78 + tilt * 0.25;
    const shAY = bodyTop + bodyH * 0.08;
    const elbX = shX + side * s * 0.32;
    const elbY = shAY + s * 0.35;
    const ftX  = elbX + side * s * 0.26;
    const ftY  = elbY + s * 0.30;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4a3828'; ctx.lineWidth = s * 0.30;
    ctx.beginPath(); ctx.moveTo(shX, shAY); ctx.lineTo(elbX, elbY); ctx.stroke();
    ctx.lineWidth = s * 0.26;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();

    ctx.fillStyle = '#665544'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.038;
    ctx.beginPath(); ctx.arc(ftX, ftY, fR * 0.88, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Knuckle arc
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.arc(ftX + side * fR * 0.25, ftY - fR * 0.50, fR * 0.75, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
  }

  // ── Body (inverted trapezoid) ─────────────────────────────────────
  if (inFight) { ctx.shadowColor = 'rgba(255,120,0,0.40)'; ctx.shadowBlur = s * 0.22; }

  // Dark lower half (weight / grounding)
  ctx.fillStyle = '#5a4838';
  ctx.beginPath();
  ctx.moveTo(bX - shW + tilt * 0.50, midY);
  ctx.lineTo(bX + shW + tilt * 0.50, midY);
  ctx.lineTo(bX + hipW,              bodyBot);
  ctx.lineTo(bX - hipW,              bodyBot);
  ctx.closePath(); ctx.fill();

  // Light upper half (shoulder mass)
  ctx.fillStyle = '#9a8870';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW + tilt * 0.50,  midY);
  ctx.lineTo(bX - shW + tilt * 0.50,  midY);
  ctx.closePath(); ctx.fill();

  ctx.shadowBlur = 0;

  // Outline
  ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.055; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW * 0.60 + tilt,  bodyTop);
  ctx.lineTo(bX + shW + tilt * 0.50,  midY);
  ctx.lineTo(bX + hipW,               bodyBot);
  ctx.lineTo(bX - hipW,               bodyBot);
  ctx.lineTo(bX - shW + tilt * 0.50,  midY);
  ctx.closePath(); ctx.stroke();

  // Crack — diagonal with highlight edge
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(28,16,6,0.72)'; ctx.lineWidth = s * 0.024;
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.22 + tilt * 0.7, bodyTop + bodyH * 0.18);
  ctx.lineTo(bX - shW * 0.04 + tilt * 0.5, bodyTop + bodyH * 0.58);
  ctx.lineTo(bX + shW * 0.16 + tilt * 0.3, bodyTop + bodyH * 0.82);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(180,155,120,0.28)'; ctx.lineWidth = s * 0.014;
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.20 + tilt * 0.7, bodyTop + bodyH * 0.18);
  ctx.lineTo(bX - shW * 0.02 + tilt * 0.5, bodyTop + bodyH * 0.58);
  ctx.stroke();

  // ── Chest rune crystal ────────────────────────────────────────────
  const crX = bX + tilt * 0.55;
  const crY = bodyTop + bodyH * 0.46;
  const crR = s * 0.105;
  ctx.shadowColor = atkActive ? '#ffaa00' : (windup > 0.20 ? '#ff7700' : '#ff4400');
  ctx.shadowBlur  = s * (atkActive ? 0.58 : 0.24 + windup * 0.25);
  ctx.fillStyle   = atkActive ? '#ffcc33' : '#ff6622';
  ctx.beginPath();
  ctx.moveTo(crX,       crY - crR * 1.55);
  ctx.lineTo(crX + crR, crY);
  ctx.lineTo(crX,       crY + crR * 1.55);
  ctx.lineTo(crX - crR, crY);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,240,175,0.68)';
  ctx.beginPath();
  ctx.moveTo(crX,             crY - crR * 0.82);
  ctx.lineTo(crX + crR * 0.5, crY - crR * 0.08);
  ctx.lineTo(crX,             crY + crR * 0.60);
  ctx.lineTo(crX - crR * 0.5, crY - crR * 0.08);
  ctx.closePath(); ctx.fill();

  // ── Near arm (attacking) ──────────────────────────────────────────
  {
    const side = dir;
    const shX  = bX + side * shW * 0.78 + tilt * 0.75;
    const shAY = bodyTop + bodyH * 0.05;
    const elbX = shX + side * s * 0.30 + dir * fistExtend * s * 0.10;
    const elbY = shAY + s * 0.32 * (1 - fistRaise * 0.65);
    const ftX  = elbX + side * s * 0.24 + dir * fistExtend * s * 0.44;
    const ftY  = elbY + s * 0.26 - fistRaise * s * 0.48;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#7a6858'; ctx.lineWidth = s * 0.32;
    ctx.beginPath(); ctx.moveTo(shX, shAY); ctx.lineTo(elbX, elbY); ctx.stroke();
    ctx.lineWidth = s * 0.28;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();

    if (atkActive && fistExtend > 0.25) {
      ctx.shadowColor = 'rgba(255,110,0,0.65)'; ctx.shadowBlur = s * 0.32;
    }
    ctx.fillStyle = '#aа9980'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.040;
    ctx.fillStyle = '#aa9980';
    ctx.beginPath(); ctx.arc(ftX, ftY, fR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // Knuckle arc + crack on fist
    ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.032;
    ctx.beginPath(); ctx.arc(ftX + dir * fR * 0.28, ftY - fR * 0.52, fR * 0.74, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(28,16,6,0.60)'; ctx.lineWidth = s * 0.020;
    ctx.beginPath();
    ctx.moveTo(ftX - fR * 0.30, ftY - fR * 0.25);
    ctx.lineTo(ftX + fR * 0.18, ftY + fR * 0.32);
    ctx.stroke();
  }

  // ── Neck ─────────────────────────────────────────────────────────
  const nW = headR * 0.55;
  const nTop = headY + headR * 0.85;
  ctx.fillStyle = '#7a6858'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.040;
  ctx.beginPath();
  ctx.moveTo(bX - nW + tilt * 0.55, nTop);
  ctx.lineTo(bX + nW + tilt * 0.55, nTop);
  ctx.lineTo(bX + nW * 0.85 + tilt * 0.65, bodyTop + s * 0.03);
  ctx.lineTo(bX - nW * 0.85 + tilt * 0.65, bodyTop + s * 0.03);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // ── Head (angular stone slab) ─────────────────────────────────────
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = s * 0.14;
  const hcX = bX + dir * s * 0.02 + tilt * 0.60;
  ctx.fillStyle = '#998878'; ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.048;
  ctx.beginPath();
  ctx.moveTo(hcX - headR * 1.25, headY + headR * 0.85);  // BL
  ctx.lineTo(hcX + headR * 1.25, headY + headR * 0.85);  // BR
  ctx.lineTo(hcX + headR * 1.05, headY - headR * 0.85);  // TR
  ctx.lineTo(hcX - headR * 1.05, headY - headR * 0.85);  // TL
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Head crack
  ctx.strokeStyle = 'rgba(28,16,6,0.55)'; ctx.lineWidth = s * 0.018;
  ctx.beginPath();
  ctx.moveTo(hcX + headR * 0.38, headY - headR * 0.72);
  ctx.lineTo(hcX + headR * 0.12, headY + headR * 0.42);
  ctx.stroke();

  // ── V-brow (single thick angry V) ─────────────────────────────────
  const browY = headY - headR * 0.16;
  const eyeSp = headR * 0.48;
  ctx.strokeStyle = '#3a2810'; ctx.lineWidth = s * 0.108; ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(hcX - headR * 1.08, browY - headR * 0.38);
  ctx.lineTo(hcX,                browY + headR * 0.12);
  ctx.lineTo(hcX + headR * 1.08, browY - headR * 0.38);
  ctx.stroke();
  // Brow highlight top edge
  ctx.strokeStyle = 'rgba(140,118,90,0.45)'; ctx.lineWidth = s * 0.030; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hcX - headR * 1.05, browY - headR * 0.44);
  ctx.lineTo(hcX - headR * 0.05, browY + headR * 0.06);
  ctx.stroke();

  // ── Amber glow eyes ───────────────────────────────────────────────
  const eyeY  = browY + headR * 0.52;
  const eyeRr = headR * 0.215;
  [-1, 1].forEach(side => {
    const ex = hcX + side * eyeSp;
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur  = inFight ? s * 0.40 : s * 0.20;
    ctx.fillStyle   = atkActive ? '#ffcc00' : (inFight ? '#ffaa00' : '#ff8800');
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Slit pupil (vertical rectangle)
    ctx.fillStyle = '#180a00';
    ctx.beginPath(); ctx.ellipse(ex + dir * eyeRr * 0.18, eyeY, eyeRr * 0.30, eyeRr * 0.70, 0, 0, Math.PI * 2); ctx.fill();
  });

  // ── Stun shockwave ring ───────────────────────────────────────────
  if (unit._glRingT > 0) {
    const rp  = 1 - unit._glRingT;
    const rad = s * 0.32 + rp * s * 1.40;
    const alp = unit._glRingT * 0.92;
    ctx.strokeStyle = `rgba(255,175,0,${alp})`;
    ctx.lineWidth   = s * 0.068 * unit._glRingT;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, fY - s * 0.28, rad, 0, Math.PI * 2); ctx.stroke();
    if (unit._glRingT > 0.50) {
      const rad2 = s * 0.18 + rp * s * 0.75;
      const alp2 = (unit._glRingT - 0.50) / 0.50 * 0.58;
      ctx.strokeStyle = `rgba(255,220,80,${alp2})`;
      ctx.lineWidth   = s * 0.040;
      ctx.beginPath(); ctx.arc(cx, fY - s * 0.28, rad2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  unit._hpBarY = headY - headR * 1.12;
  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════
//  MINOTAUR — рівень 8, здібність: aoe4th
//  Органічні руки й ноги — єдиний bezier-штрих без видимих суглобів.
//  Тіло 3-шарове (темні краї → середній тон → центральний відблиск).
//  Атака рогами: голова нахиляється через ctx.rotate.
// ═══════════════════════════════════════════════════════════════════════════
function drawMinotaurMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._mtLastT || _frameNow)) / 1000, 0.05);
  unit._mtLastT = _frameNow;

  // ── Per-unit state ───────────────────────────────────────────────
  if (unit._mtDir === undefined) {
    unit._mtDir = 1; unit._mtPrevX = cx; unit._mtPrevAcd = unit.attackCooldown;
    unit._mtT = 0; unit._mtAp = 0; unit._mtRingT = 0; unit._mtLegPh = 0;
    unit._mtHitN = 0; unit._mtAoeT = 0;
  }
  if (Math.abs(cx - unit._mtPrevX) > 0.2)
    unit._mtDir = cx > unit._mtPrevX ? 1 : -1;
  unit._mtPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._mtDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._mtDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._mtPrevAcd || 0) + 3) {
    unit._mtAp   = 1.0;
    unit._mtHitN = (unit._mtHitN + 1) % 4;
    if (unit._mtHitN === 0) { unit._mtAoeT = 1.0; unit._mtRingT = 1.0; }
  }
  unit._mtPrevAcd = acd;
  unit._mtT += dt;

  const atkDur = Math.min(0.75, atkBase / 60 * 0.82);
  if (unit._mtAp    > 0) unit._mtAp    = Math.max(0, unit._mtAp    - dt / atkDur);
  if (unit._mtRingT > 0) unit._mtRingT = Math.max(0, unit._mtRingT - dt / 0.58);
  if (unit._mtAoeT  > 0) unit._mtAoeT  = Math.max(0, unit._mtAoeT  - dt / 0.72);

  const atkActive = unit._mtAp > 0;
  const ap        = 1 - unit._mtAp;
  const windup    = unit.state === 'fight' ? 1 - Math.min(1, acd / (atkBase * 0.35)) : 0;
  const inFight   = unit.state === 'fight' || atkActive;

  if (unit.state === 'move') {
    unit._mtLegPh = (unit._mtLegPh + dt / 0.55) % 1;
  } else {
    const frac = unit._mtLegPh % 1;
    unit._mtLegPh += dt * 1.8 * (frac < 0.5 ? 1 : -1);
  }

  const sqF = unit.state === 'move'
    ? Math.max(0, Math.cos(unit._mtLegPh * Math.PI * 2)) * 0.07 : 0;

  // ── Horn-charge motion ───────────────────────────────────────────
  const breathe = Math.sin(unit._mtT * 0.80) * s * 0.009;
  let lurchX = 0, lurchY = 0, dipAngle = 0, armSwing = 0;

  if (atkActive) {
    if (ap < 0.18) {
      const f = ap / 0.18;
      lurchX   = -dir * s * 0.22 * f;
      dipAngle = -dir * 0.48 * f;
    } else if (ap < 0.54) {
      const f  = (ap - 0.18) / 0.36;
      const ef = f * f * (3 - 2 * f);
      lurchX   =  dir * s * 0.52 * ef - dir * s * 0.22 * (1 - ef);
      lurchY   =  s * 0.04 * Math.sin(ef * Math.PI);
      dipAngle =  dir * 0.80 * ef;
      armSwing =  ef;
    } else {
      const f  = (ap - 0.54) / 0.46;
      lurchX   =  dir * s * 0.52 * (1 - f);
      lurchY   =  s * 0.04 * (1 - f);
      dipAngle =  dir * 0.80 * (1 - f);
      armSwing =  1 - f;
    }
  } else if (windup > 0.05) {
    lurchX   = -dir * s * 0.13 * windup;
    dipAngle = -dir * 0.32 * windup;
  }

  // ── Пропорції ────────────────────────────────────────────────────
  const headR = s * 0.255;
  const bH    = s * 0.500;
  const legH  = s * 0.430;
  const neckH = s * 0.085;
  const muzzR = headR * 0.58;

  const stretchX = atkActive && ap > 0.18 && ap < 0.54
    ? (ap - 0.18) / 0.36 * 0.10 : 0;
  const scX = 1 + sqF + stretchX;
  const scY = 1 - sqF * 0.55;

  const shW  = s * 0.800 * scX;
  const hipW = s * 0.420 * scX;
  const tilt = dir * s * 0.08;

  const bX      = cx + lurchX;
  const bY      = fY - legH - bH + breathe + lurchY;
  const bodyH   = bH * 2.0 * scY;
  const bodyTop = bY - bodyH * 0.50;
  const bodyBot = bY + bodyH * 0.50;
  const neckTopY = bodyTop - neckH;
  const headY    = neckTopY - headR * 0.90;
  const hcX      = bX + dir * s * 0.020 + tilt * 0.42;

  ctx.save();

  // ── Тінь ─────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(bX, fY + s * 0.022, shW * 1.05, s * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── НОГИ — єдиний bezier-штрих, нема видимих коліна ────────────
  // Малюємо обидві ноги ДО тіла, щоб тіло перекрило верхівки
  [-1, 1].forEach(side => {
    const phase = side === 1 ? 0 : 0.5;
    const liftF = Math.max(0, Math.sin((unit._mtLegPh + phase) * Math.PI * 2));
    const hipX  = bX + side * hipW * 0.72;
    const hipY  = bodyBot - s * 0.030;
    const ankX  = hipX + side * s * 0.040;
    const ankY  = fY - liftF * s * 0.16 - s * 0.050;
    const cpLX  = hipX + side * s * 0.075;             // коліно трохи назовні
    const cpLY  = hipY + (ankY - hipY) * 0.46;

    // Основний штрих ноги (товстий, темний)
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5a2e0e'; ctx.lineWidth = s * 0.215;
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.quadraticCurveTo(cpLX, cpLY, ankX, ankY); ctx.stroke();
    // Внутрішній відблиск (вужчий, середній тон) — дає обсяг
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.110;
    ctx.beginPath(); ctx.moveTo(hipX - side * s * 0.015, hipY); ctx.quadraticCurveTo(cpLX - side * s * 0.025, cpLY, ankX - side * s * 0.012, ankY); ctx.stroke();

    // Копито
    const hoofY = fY - liftF * s * 0.16;
    ctx.fillStyle = '#130805'; ctx.strokeStyle = '#080402'; ctx.lineWidth = s * 0.022;
    ctx.beginPath();
    ctx.ellipse(ankX, hoofY + s * 0.036, s * 0.148, s * 0.058, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#060302'; ctx.lineWidth = s * 0.014;
    ctx.beginPath(); ctx.moveTo(ankX, hoofY + s * 0.003); ctx.lineTo(ankX, hoofY + s * 0.070); ctx.stroke();
  });

  // ── ДАЛЬНЯ РУКА — єдиний bezier від плеча до кулака ─────────────
  {
    const side = -dir;
    const shX = bX + side * shW * 0.78 + tilt * 0.10;
    const shY = bodyTop + s * 0.020;
    // CP = лікоть (виступає назовні)
    const cpX = shX + side * s * 0.30;
    const cpY = shY + s * 0.42;
    // Кулак (трохи ближче до тіла ніж лікоть, нижче)
    const ftX = shX + side * s * 0.22 - armSwing * dir * s * 0.28;
    const ftY = shY + s * 0.78;

    // Лікоть — явна точка для звуження
    const elbX = cpX, elbY = cpY;
    ctx.lineCap = 'round';
    // Верхня рука (товща)
    ctx.strokeStyle = '#5a2e0e'; ctx.lineWidth = s * 0.228;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(elbX, elbY); ctx.stroke();
    // Передпліччя (тонше — звуження)
    ctx.strokeStyle = '#5a2e0e'; ctx.lineWidth = s * 0.172;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();
    // Відблиски (зверху вниз)
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.110;
    ctx.beginPath(); ctx.moveTo(shX + dir*s*0.042, shY); ctx.lineTo(elbX + dir*s*0.030, elbY); ctx.stroke();
    ctx.strokeStyle = '#7a4020'; ctx.lineWidth = s * 0.078;
    ctx.beginPath(); ctx.moveTo(elbX + dir*s*0.030, elbY); ctx.lineTo(ftX + dir*s*0.018, ftY - s*0.04); ctx.stroke();
    // Кулак
    ctx.fillStyle = '#6a3c18'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.arc(ftX, ftY, s * 0.174, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ka = Math.PI * 0.5 + (i - 1) * 0.35;
      ctx.beginPath();
      ctx.moveTo(ftX + Math.cos(ka) * s * 0.090, ftY + Math.sin(ka) * s * 0.090);
      ctx.lineTo(ftX + Math.cos(ka) * s * 0.158, ftY + Math.sin(ka) * s * 0.158);
      ctx.stroke();
    }
  }

  // ── ТІЛО — 3 шари (темні краї → середній → центральний відблиск) ─
  if (inFight) { ctx.shadowColor = 'rgba(200,40,0,0.40)'; ctx.shadowBlur = s * 0.22; }

  // Шар 1: темна основа — перевернута трапеція (широкі плечі зверху)
  ctx.fillStyle = '#4e2408';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + hipW,              bodyBot);
  ctx.lineTo(bX - hipW,              bodyBot);
  ctx.closePath(); ctx.fill();

  // Шар 2: середній тон (трохи менша всередині)
  ctx.fillStyle = '#7a4020';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.74 + tilt, bodyTop + bodyH * 0.05);
  ctx.lineTo(bX + shW * 0.74 + tilt, bodyTop + bodyH * 0.05);
  ctx.lineTo(bX + hipW * 0.78,       bodyBot - bodyH * 0.04);
  ctx.lineTo(bX - hipW * 0.78,       bodyBot - bodyH * 0.04);
  ctx.closePath(); ctx.fill();

  // Шар 3: центральний відблиск (ефект 3D)
  ctx.fillStyle = '#9a5228';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.22 + tilt, bodyTop + bodyH * 0.07);
  ctx.lineTo(bX + shW * 0.22 + tilt, bodyTop + bodyH * 0.07);
  ctx.lineTo(bX + hipW * 0.34,       bodyBot - bodyH * 0.10);
  ctx.lineTo(bX - hipW * 0.34,       bodyBot - bodyH * 0.10);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;

  // Обводка тіла
  ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.050; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(bX - shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + shW * 0.90 + tilt, bodyTop);
  ctx.lineTo(bX + hipW,              bodyBot);
  ctx.lineTo(bX - hipW,              bodyBot);
  ctx.closePath(); ctx.stroke();

  // Грудні дуги + лінія живота
  ctx.strokeStyle = 'rgba(22,8,2,0.55)'; ctx.lineWidth = s * 0.026; ctx.lineCap = 'round';
  const pCX = bX + tilt * 0.55, pCY = bodyTop + bodyH * 0.24;
  [-1, 1].forEach(side => {
    ctx.beginPath(); ctx.arc(pCX + side * shW * 0.22, pCY, shW * 0.24, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(22,8,2,0.38)'; ctx.lineWidth = s * 0.018;
  ctx.beginPath(); ctx.moveTo(pCX, pCY + bodyH * 0.18); ctx.lineTo(pCX, bodyBot - bodyH * 0.14); ctx.stroke();

  // Пучки шерсті
  ctx.strokeStyle = '#2a1006'; ctx.lineWidth = s * 0.020; ctx.lineCap = 'round';
  const furCX = pCX, furCY = bodyTop + bodyH * 0.42;
  [[-0.16, 0, -0.23, -0.15], [0, 0, 0, -0.19], [0.16, 0, 0.23, -0.15],
   [-0.09, 0.16, -0.14, 0.01], [0.09, 0.16, 0.12, 0.01]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(furCX + x1*s, furCY + y1*s); ctx.lineTo(furCX + x2*s, furCY + y2*s); ctx.stroke();
  });

  // ── ШИЯ ─────────────────────────────────────────────────────────
  const neckW = s * 0.192;
  ctx.fillStyle = '#6a3818'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.034;
  ctx.beginPath();
  ctx.moveTo(bX - neckW + tilt * 0.58,        bodyTop + s * 0.014);
  ctx.lineTo(bX + neckW + tilt * 0.58,        bodyTop + s * 0.014);
  ctx.lineTo(bX + neckW * 0.76 + tilt * 0.78, neckTopY + s * 0.014);
  ctx.lineTo(bX - neckW * 0.76 + tilt * 0.78, neckTopY + s * 0.014);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Шийний м'яз
  ctx.strokeStyle = 'rgba(22,8,2,0.48)'; ctx.lineWidth = s * 0.018; ctx.lineCap = 'round';
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.moveTo(bX + side * neckW * 0.45 + tilt * 0.60, bodyTop + s * 0.020);
    ctx.lineTo(bX + side * neckW * 0.30 + tilt * 0.76, neckTopY + s * 0.014);
    ctx.stroke();
  });

  // ── БЛИЖНЯ РУКА ─────────────────────────────────────────────────
  {
    const side = dir;
    const shX = bX + side * shW * 0.78 + tilt * 0.88;
    const shY = bodyTop + s * 0.020;
    const cpX = shX + side * s * 0.30;
    const cpY = shY + s * 0.42;
    const ftX = shX + side * s * 0.22 - armSwing * dir * s * 0.28;
    const ftY = shY + s * 0.78;

    const elbX = cpX, elbY = cpY;
    ctx.lineCap = 'round';
    // Верхня рука (товща)
    ctx.strokeStyle = '#8a5028'; ctx.lineWidth = s * 0.240;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(elbX, elbY); ctx.stroke();
    // Передпліччя (тонше)
    ctx.strokeStyle = '#8a5028'; ctx.lineWidth = s * 0.182;
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(ftX, ftY); ctx.stroke();
    // Відблиски
    ctx.strokeStyle = '#aa6635'; ctx.lineWidth = s * 0.115;
    ctx.beginPath(); ctx.moveTo(shX - dir*s*0.040, shY); ctx.lineTo(elbX - dir*s*0.030, elbY); ctx.stroke();
    ctx.strokeStyle = '#aa6635'; ctx.lineWidth = s * 0.082;
    ctx.beginPath(); ctx.moveTo(elbX - dir*s*0.030, elbY); ctx.lineTo(ftX - dir*s*0.018, ftY - s*0.04); ctx.stroke();
    ctx.fillStyle = '#aa6635'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.030;
    ctx.beginPath(); ctx.arc(ftX, ftY, s * 0.174, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.016; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ka = Math.PI * 0.5 + (i - 1) * 0.35;
      ctx.beginPath();
      ctx.moveTo(ftX + Math.cos(ka) * s * 0.090, ftY + Math.sin(ka) * s * 0.090);
      ctx.lineTo(ftX + Math.cos(ka) * s * 0.158, ftY + Math.sin(ka) * s * 0.158);
      ctx.stroke();
    }
  }

  // ── ГОЛОВА (rotate для атаки рогами) ─────────────────────────────
  ctx.save();
  ctx.translate(hcX, headY);
  ctx.rotate(dipAngle);

  // Вуха
  [-1, 1].forEach(side => {
    const eX = side * headR * 0.92, eY = -headR * 0.08;
    ctx.fillStyle = '#6a3818'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.026;
    ctx.beginPath();
    ctx.moveTo(eX, eY);
    ctx.bezierCurveTo(eX + side*headR*0.52, eY - headR*0.45,
                      eX + side*headR*0.70, eY + headR*0.26,
                      eX + side*headR*0.30, eY + headR*0.40);
    ctx.quadraticCurveTo(eX, eY + headR*0.22, eX, eY);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b05538';
    ctx.beginPath();
    ctx.moveTo(eX + side*headR*0.08, eY + headR*0.07);
    ctx.bezierCurveTo(eX + side*headR*0.34, eY - headR*0.24,
                      eX + side*headR*0.46, eY + headR*0.16,
                      eX + side*headR*0.20, eY + headR*0.28);
    ctx.quadraticCurveTo(eX + side*headR*0.06, eY + headR*0.18,
                         eX + side*headR*0.08, eY + headR*0.07);
    ctx.closePath(); ctx.fill();
  });

  // Голова (основа)
  if (inFight) { ctx.shadowColor = 'rgba(160,30,0,0.32)'; ctx.shadowBlur = s * 0.16; }
  ctx.fillStyle = '#8a5025'; ctx.strokeStyle = '#2a1408'; ctx.lineWidth = s * 0.050;
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Відблиск щоки
  ctx.fillStyle = 'rgba(154,84,42,0.40)';
  ctx.beginPath(); ctx.ellipse(-dir * headR * 0.28, -headR * 0.10, headR * 0.35, headR * 0.30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── РОГИ — великі, класична бича крива ──────────────────────────
  [-1, 1].forEach(side => {
    const bx  =  side * headR * 0.75,  by  = -headR * 0.40;
    const cpx =  side * headR * 2.80,  cpy = -headR * 0.60;
    const tx  =  side * headR * 2.00,  ty  = -headR * 2.40;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4a2a06'; ctx.lineWidth = headR * 0.48;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(cpx, cpy, tx, ty); ctx.stroke();
    ctx.strokeStyle = '#c49030'; ctx.lineWidth = headR * 0.30;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(cpx, cpy, tx, ty); ctx.stroke();
    const mx = bx + (cpx - bx) * 0.50, my = by + (cpy - by) * 0.50;
    ctx.strokeStyle = '#ead87a'; ctx.lineWidth = headR * 0.100;
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(cpx, cpy, tx, ty); ctx.stroke();
  });

  // V-брова — малюємо ДО голови щоб вона виступала над очима
  const browY = -headR * 0.10;
  // Тінь брови (темна підкладка)
  ctx.strokeStyle = '#180604'; ctx.lineWidth = s * 0.130; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-headR * 1.08, browY - headR * 0.50);
  ctx.lineTo(0,              browY + headR * 0.08);
  ctx.lineTo( headR * 1.08, browY - headR * 0.50);
  ctx.stroke();
  // Основна брова
  ctx.strokeStyle = '#3a1208'; ctx.lineWidth = s * 0.095;
  ctx.beginPath();
  ctx.moveTo(-headR * 1.05, browY - headR * 0.46);
  ctx.lineTo(0,              browY + headR * 0.05);
  ctx.lineTo( headR * 1.05, browY - headR * 0.46);
  ctx.stroke();
  // Відблиск верхнього краю
  ctx.strokeStyle = 'rgba(180,130,70,0.45)'; ctx.lineWidth = s * 0.028;
  ctx.beginPath();
  ctx.moveTo(-headR * 1.02, browY - headR * 0.52);
  ctx.lineTo(-headR * 0.05, browY + headR * 0.02);
  ctx.stroke();

  // Морда — спочатку (очі малюватимуться зверху)
  // Розміщена НИЖЧЕ середини голови, не перекриває очі
  const mzY = headR * 0.52, mzX = dir * headR * 0.16;
  const mzW = muzzR * 0.95, mzH = muzzR * 0.68;
  ctx.fillStyle = '#7a4520'; ctx.strokeStyle = '#2a1008'; ctx.lineWidth = s * 0.036;
  ctx.beginPath(); ctx.ellipse(mzX, mzY, mzW, mzH, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9a5a2e';
  ctx.beginPath(); ctx.ellipse(mzX, mzY - mzH*0.10, mzW*0.72, mzH*0.60, 0, 0, Math.PI*2); ctx.fill();

  // Ніздрі
  const snortF = inFight ? (Math.sin(unit._mtT * 6.5) * 0.5 + 0.5) : 0;
  ctx.fillStyle = '#1a0806';
  [-1, 1].forEach(side => {
    const nx = mzX + side * mzW * 0.36;
    ctx.beginPath(); ctx.ellipse(nx, mzY - mzH*0.10, mzW*0.22, mzH*0.28, side*0.32, 0, Math.PI*2); ctx.fill();
    if (snortF > 0.50 && inFight) {
      const pA = (snortF - 0.50) * 0.80;
      ctx.fillStyle = `rgba(255,255,255,${pA})`;
      ctx.beginPath(); ctx.arc(nx + dir*mzW*0.26, mzY - mzH*0.58, mzW*0.19*snortF, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(nx + dir*mzW*0.44, mzY - mzH*0.80, mzW*0.12*snortF, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a0806';
    }
  });

  // Кільце в носі
  ctx.strokeStyle = '#d0d0e0'; ctx.lineWidth = s * 0.030; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.arc(mzX, mzY + mzH*0.24, mzW*0.28, Math.PI*0.10, Math.PI*0.90); ctx.stroke();

  // Очі — ПІСЛЯ морди, завжди поверх
  const eyeY = browY + headR * 0.48, eyeSpX = headR * 0.48, eyeRr = headR * 0.240;
  [-1, 1].forEach(side => {
    const ex = side * eyeSpX;
    ctx.shadowColor = '#ff2200'; ctx.shadowBlur = inFight ? s * 0.52 : s * 0.22;
    ctx.fillStyle = atkActive ? '#ff7700' : (inFight ? '#ee2200' : '#cc1800');
    ctx.beginPath(); ctx.arc(ex, eyeY, eyeRr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#060000';
    ctx.beginPath(); ctx.arc(ex + dir*eyeRr*0.32, eyeY + eyeRr*0.08, eyeRr*0.52, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,60,0.72)';
    ctx.beginPath(); ctx.arc(ex - eyeRr*0.36, eyeY - eyeRr*0.36, eyeRr*0.24, 0, Math.PI*2); ctx.fill();
  });

  ctx.restore(); // кінець блоку голови

  // ── AoE ground sweep ring ─────────────────────────────────────────
  if (unit._mtRingT > 0) {
    const rp    = 1 - unit._mtRingT;
    const isAoe = unit._mtAoeT > 0;
    const rad   = s * (isAoe ? 0.60 : 0.28) + rp * s * (isAoe ? 1.90 : 1.10);
    const alp   = unit._mtRingT * 0.95;
    ctx.strokeStyle = `rgba(${isAoe ? '255,80,0' : '210,55,0'},${alp})`;
    ctx.lineWidth   = s * (isAoe ? 0.080 : 0.052) * unit._mtRingT;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, fY - s * 0.12, rad, 0, Math.PI * 2); ctx.stroke();
    if (isAoe && unit._mtRingT > 0.42) {
      const rad2 = s * 0.28 + rp * s * 0.88;
      const alp2 = (unit._mtRingT - 0.42) / 0.58 * 0.58;
      ctx.strokeStyle = `rgba(255,145,0,${alp2})`;
      ctx.lineWidth = s * 0.044;
      ctx.beginPath(); ctx.arc(cx, fY - s * 0.12, rad2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _mtBranch = unit._branch || '';
  if (_mtBranch === 'A') {
    // Berserker: blood crack lines from feet + rage aura
    ctx.strokeStyle = 'rgba(175,18,0,0.58)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (const [x0, x1, x2] of [[-0.30, -0.55, -0.82], [0.05, 0.32, 0.60], [0.38, 0.62, 0.78]]) {
      ctx.beginPath();
      ctx.moveTo(cx + x0*s, fY - 1); ctx.lineTo(cx + x1*s, fY + 2); ctx.lineTo(cx + x2*s, fY - 1);
      ctx.stroke();
    }
    ctx.save(); ctx.shadowColor = '#ff2200'; ctx.shadowBlur = s * 0.32;
    ctx.strokeStyle = 'rgba(200,28,0,0.22)'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.58, s*0.52, s*0.72, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  } else if (_mtBranch === 'B') {
    // Defender: protective blue aura ring
    ctx.save(); ctx.shadowColor = '#4466ff'; ctx.shadowBlur = s * 0.28;
    const _rp = 0.72 + Math.sin(_frameNow * 0.0018) * 0.04;
    ctx.strokeStyle = 'rgba(55,100,225,0.38)'; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.55, s*_rp, s*_rp*0.88, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,150,255,0.16)'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.ellipse(cx, fY - s*0.55, s*_rp*1.14, s*_rp*1.02, 0, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }

  unit._hpBarY = headY - dipAngle * headR - headR * 1.85;
  ctx.restore();
}
