// draw_lord_evolutions.js — Рівні еволюції лорда 1, 2, 3 і 5
// Evo 4 = drawLordStudio (hero_flat.js). Evo 5 = wings + drawLordStudio.
// Контракт: drawLordEvoN(ctx, p) → hpBarY
// p: { CX, CY0, H, roD, roT, ap, atkVar, unit }

// ── Спільна утиліта: рахує кут посоха по ap ─────────────────────
function _evoStaffSwing(ap, dir) {
  if (!ap || ap <= 0) return 0;
  if (ap < 0.35) return -dir * 0.32 * (ap / 0.35);            // замах назад
  if (ap < 0.52) return  dir * 0.55 * ((ap - 0.35) / 0.17);  // удар вперед
  return dir * 0.55 * (1 - (ap - 0.52) / 0.48);               // повернення
}

// ═══════════════════════════════════════════════════════════════════
// EVO 1 — Учень. Ovoid-мантія, паличка-посох, attack swing + orb flash.
// ═══════════════════════════════════════════════════════════════════
function drawLordEvo1(ctx, p) {
  const {CX, CY0, H, roD: dir, roT} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);
  const ap    = p.ap || 0;
  const pulse = 0.5 + 0.5 * Math.sin(roT * 0.45);
  const bobY  = Math.sin(roT * 0.35) * 0.8;

  // Strike flash intensity
  const strikeT = (ap > 0.32 && ap < 0.62) ? Math.sin((ap - 0.32) / 0.30 * Math.PI) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(94), 15*S, 1.6*S, 0, 0, Math.PI*2); ctx.fill();

  // Aura brightens during attack
  if (ap > 0.1) {
    const ag = ctx.createRadialGradient(sx(50), sy(60), 2*S, sx(50), sy(60), 30*S);
    ag.addColorStop(0, `rgba(160,40,255,${0.22 * strikeT})`);
    ag.addColorStop(1, 'rgba(80,0,160,0)');
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(sx(50), sy(60), 30*S, 0, Math.PI*2); ctx.fill();
  }

  ctx.save();
  ctx.translate(0, bobY * S);

  // Body — ovoid dark robe blob, leans forward on strike
  const leanX = strikeT * dir * 2.5 * S;
  ctx.save();
  ctx.translate(sx(50) + leanX, sy(76));
  const bodyGrad = ctx.createLinearGradient(0, -18*S, 0, 18*S);
  bodyGrad.addColorStop(0, '#3e1068');
  bodyGrad.addColorStop(1, '#160328');
  ctx.fillStyle = bodyGrad; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9*S;
  ctx.beginPath(); ctx.ellipse(0, 0, 14*S, 18*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();

  // Two tiny feet
  [-1, 1].forEach(side => {
    ctx.fillStyle = '#0e0120'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.6*S;
    ctx.beginPath(); ctx.ellipse(sx(50) + side*5*S + leanX, sy(93), 5*S, 2.4*S, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
  });

  // Gold hem
  ctx.strokeStyle = '#a07820'; ctx.lineWidth = 0.9*S;
  ctx.beginPath();
  ctx.moveTo(sx(37) + leanX, sy(92));
  ctx.bezierCurveTo(sx(43) + leanX, sy(94), sx(57) + leanX, sy(94), sx(63) + leanX, sy(92));
  ctx.stroke();

  // Head with lean
  const hX = sx(50) + leanX * 0.6;
  const hY = sy(54);
  ctx.fillStyle = '#5a2880'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.8*S;
  ctx.beginPath(); ctx.ellipse(hX, hY, 9*S, 10*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  // Hood bump
  ctx.fillStyle = '#2a0840'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.6*S;
  ctx.beginPath();
  ctx.moveTo(hX - 8*S, hY - 7*S);
  ctx.quadraticCurveTo(hX, hY - 17*S, hX + 8*S, hY - 7*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Eyes — glow intensity scales with strike
  const eyeGlow = (0.55 + 0.35*pulse + strikeT * 0.8);
  ctx.fillStyle = `rgba(180,60,255,${eyeGlow})`; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = (5 + strikeT*10)*S;
  ctx.beginPath(); ctx.arc(hX - 3.5*S, hY - 1.5*S, (1.3 + strikeT*0.4)*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hX + 3.5*S, hY - 1.5*S, (1.3 + strikeT*0.4)*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore(); // end bob translate

  // ── Staff with attack swing ──────────────────────────────────────
  const staffSwing = _evoStaffSwing(ap, dir);
  const stBaseX = sx(50) + 19*S*dir;
  const stBaseY = sy(93);

  ctx.save();
  ctx.translate(stBaseX + leanX, stBaseY + bobY*S);
  ctx.rotate(staffSwing);
  ctx.translate(-stBaseX, -stBaseY);

  // Shaft
  const stTipX = stBaseX + dir*2*S;
  const stTipY = sy(28);
  ctx.strokeStyle = '#3a2510'; ctx.lineWidth = 1.6*S; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(stBaseX, stBaseY); ctx.lineTo(stTipX, stTipY); ctx.stroke();

  // Orb — glows on strike
  const orbR = (2.8 + strikeT * 1.2) * S;
  ctx.fillStyle = '#7700bb'; ctx.shadowColor = '#aa44ff'; ctx.shadowBlur = (4 + strikeT*14)*S;
  ctx.beginPath(); ctx.arc(stTipX, stTipY, orbR, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // Orb highlight
  ctx.fillStyle = `rgba(220,150,255,${0.55 + strikeT*0.35})`;
  ctx.beginPath(); ctx.arc(stTipX - 0.7*S, stTipY - 0.7*S, orbR*0.45, 0, Math.PI*2); ctx.fill();

  // Impact spark at tip on strike peak
  if (strikeT > 0.5) {
    const sp = (strikeT - 0.5) * 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const r = sp * 9 * S;
      ctx.fillStyle = `rgba(220,140,255,${sp * 0.7})`;
      ctx.beginPath(); ctx.arc(stTipX + Math.cos(a)*r, stTipY + Math.sin(a)*r, 1.0*S, 0, Math.PI*2); ctx.fill();
    }
  }

  ctx.restore(); // end staff swing

  return sy(0) + bobY*S - 8;
}

// ═══════════════════════════════════════════════════════════════════
// EVO 2 — Підмайстер. Проста мантія, 3-спайки, кругла сфера на посоху.
// ═══════════════════════════════════════════════════════════════════
function drawLordEvo2(ctx, p) {
  const {CX, CY0, H, roD: dir, roT} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);
  const ap     = p.ap || 0;
  const pulse  = 0.5 + 0.5 * Math.sin(roT * 0.45);
  const breathe= Math.sin(roT * 0.5);
  const bobY   = Math.sin(roT * 0.35) * 0.8;
  const strikeT = (ap > 0.32 && ap < 0.62) ? Math.sin((ap - 0.32) / 0.30 * Math.PI) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(94), 22*S, 2.1*S, 0, 0, Math.PI*2); ctx.fill();

  // Aura
  const aura = ctx.createRadialGradient(sx(50), sy(55), 2*S, sx(50), sy(55), 40*S);
  aura.addColorStop(0, `rgba(130,25,210,${0.10 + 0.06*pulse + strikeT*0.12})`);
  aura.addColorStop(1, 'rgba(50,0,110,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(sx(50), sy(55), 40*S, 0, Math.PI*2); ctx.fill();

  const leanX = strikeT * dir * 3 * S;

  ctx.save();
  ctx.translate(0, bobY * S);

  // Robe trapezoid with lean
  ctx.save();
  ctx.translate(leanX, 0);
  const rg = ctx.createLinearGradient(0, sy(44), 0, sy(93));
  rg.addColorStop(0, '#4a1480'); rg.addColorStop(1, '#18042a');
  ctx.fillStyle = rg; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.0*S;
  ctx.beginPath();
  ctx.moveTo(sx(40), sy(46));
  ctx.bezierCurveTo(sx(36), sy(56), sx(27), sy(74), sx(25), sy(93));
  ctx.bezierCurveTo(sx(38), sy(95), sx(62), sy(95), sx(75), sy(93));
  ctx.bezierCurveTo(sx(73), sy(74), sx(64), sy(56), sx(60), sy(46));
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Hem trim
  ctx.strokeStyle = '#b08828'; ctx.lineWidth = 0.9*S;
  ctx.beginPath(); ctx.moveTo(sx(25), sy(93));
  ctx.bezierCurveTo(sx(38), sy(95.5), sx(62), sy(95.5), sx(75), sy(93));
  ctx.stroke();
  ctx.restore(); // lean

  // Collar (no lean — stays around neck)
  ctx.fillStyle = '#16032a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.8*S;
  ctx.beginPath();
  ctx.moveTo(sx(40)+leanX, sy(46));
  ctx.bezierCurveTo(sx(38)+leanX, sy(41), sx(42)+leanX, sy(35), sx(46)+leanX, sy(35));
  ctx.lineTo(sx(54)+leanX, sy(35));
  ctx.bezierCurveTo(sx(58)+leanX, sy(35), sx(62)+leanX, sy(41), sx(60)+leanX, sy(46));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#b08828'; ctx.lineWidth = 0.6*S;
  ctx.beginPath();
  ctx.moveTo(sx(40)+leanX, sy(45.5));
  ctx.bezierCurveTo(sx(38.5)+leanX, sy(41.5), sx(42.5)+leanX, sy(36), sx(46)+leanX, sy(36));
  ctx.lineTo(sx(54)+leanX, sy(36));
  ctx.bezierCurveTo(sx(57.5)+leanX, sy(36), sx(61.5)+leanX, sy(41.5), sx(60)+leanX, sy(45.5));
  ctx.stroke();

  // Neck
  const nLX = leanX * 0.7;
  ctx.fillStyle = '#5a2880'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.6*S;
  ctx.beginPath(); ctx.moveTo(sx(47)+nLX, sy(36)); ctx.lineTo(sx(47)+nLX, sy(32));
  ctx.lineTo(sx(53)+nLX, sy(32)); ctx.lineTo(sx(53)+nLX, sy(36)); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Head
  const hX = sx(50) + leanX*0.5, hY = sy(23);
  ctx.fillStyle = '#632e8a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9*S;
  ctx.beginPath(); ctx.ellipse(hX, hY, 10*S, 11*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(28,0,55,0.28)';
  ctx.beginPath(); ctx.ellipse(hX - 3*S*dir, hY+1*S, 5.5*S, 10*S, 0, 0, Math.PI*2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#ece4f4';
  ctx.beginPath(); ctx.ellipse(hX-4*S, hY-1.5*S, 2.0*S, 1.3*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hX+4*S, hY-1.5*S, 2.0*S, 1.3*S, 0, 0, Math.PI*2); ctx.fill();
  const eyeG = 0.55 + 0.3*pulse + strikeT*0.7;
  ctx.fillStyle = `rgba(190,60,255,${eyeG})`; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = (5+strikeT*10)*S;
  ctx.beginPath(); ctx.arc(hX-4*S, hY-1.5*S, (1.0+strikeT*0.3)*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hX+4*S, hY-1.5*S, (1.0+strikeT*0.3)*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // 3-spike crown
  const crCX = hX;
  ctx.fillStyle = '#c8a030'; ctx.strokeStyle = '#4a3810'; ctx.lineWidth = 0.6*S;
  ctx.beginPath();
  ctx.moveTo(crCX-10*S, sy(14)); ctx.lineTo(crCX+10*S, sy(14));
  ctx.lineTo(crCX+9*S, sy(11)); ctx.lineTo(crCX-9*S, sy(11));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  [[-6,5,'#44aaff'],[0,8,'#ff2244'],[6,5,'#44aaff']].forEach(([ox,h,gem]) => {
    ctx.fillStyle = '#c8a030';
    ctx.beginPath(); ctx.moveTo(crCX+ox*S-1.4*S, sy(11));
    ctx.lineTo(crCX+ox*S, sy(11-h)); ctx.lineTo(crCX+ox*S+1.4*S, sy(11));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = gem; ctx.shadowColor = gem; ctx.shadowBlur = (2+strikeT*4)*S;
    ctx.beginPath(); ctx.arc(crCX+ox*S, sy(11-h)-0.3*S, 1.0*S, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.restore(); // bob

  // ── Staff with swing + orb ───────────────────────────────────────
  const staffSwing = _evoStaffSwing(ap, dir);
  const stBaseX = sx(50) + 23*S*dir;
  const stTopX  = sx(50) + 26*S*dir;
  const stBaseY = sy(93);

  ctx.save();
  ctx.translate(stBaseX + leanX, stBaseY + bobY*S);
  ctx.rotate(staffSwing);
  ctx.translate(-stBaseX, -stBaseY);

  // Shaft (quadratic curve)
  ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2.0*S; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(stBaseX, stBaseY);
  ctx.quadraticCurveTo(stBaseX + dir*2*S, sy(55), stTopX, sy(12));
  ctx.stroke();
  // Gold band
  ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 1.4*S;
  ctx.beginPath(); ctx.moveTo(stTopX-1.5*S, sy(21)); ctx.lineTo(stTopX+1.5*S, sy(21)); ctx.stroke();
  // Orb
  const orbR = (5 + strikeT*1.5) * S;
  ctx.fillStyle = '#8800cc'; ctx.strokeStyle = '#2a0045'; ctx.lineWidth = 0.6*S;
  ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = (7+strikeT*18)*S;
  ctx.beginPath(); ctx.arc(stTopX, sy(10), orbR, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  // Orb highlight
  ctx.fillStyle = `rgba(195,115,255,${0.52+0.2*pulse+strikeT*0.3})`;
  ctx.beginPath(); ctx.arc(stTopX-1.2*S, sy(9), orbR*0.36, 0, Math.PI*2); ctx.fill();

  // Impact sparks
  if (strikeT > 0.45) {
    const sp = (strikeT - 0.45) / 0.55;
    for (let i = 0; i < 5; i++) {
      const a = (i/5)*Math.PI*2 + roT*2;
      ctx.fillStyle = `rgba(220,140,255,${sp*0.65})`;
      ctx.beginPath(); ctx.arc(stTopX + Math.cos(a)*sp*10*S, sy(10)+Math.sin(a)*sp*10*S, 1.1*S, 0, Math.PI*2); ctx.fill();
    }
  }

  ctx.restore(); // staff swing

  return sy(0) + bobY*S - 10;
}

// ═══════════════════════════════════════════════════════════════════
// EVO 3 — Маг. Повна мантія, 4-спайки, кристал. Attack: crystal flash + beam spark.
// ═══════════════════════════════════════════════════════════════════
function drawLordEvo3(ctx, p) {
  const {CX, CY0, H, roD: dir, roT} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);
  const ap     = p.ap || 0;
  const pulse  = 0.5 + 0.5 * Math.sin(roT * 0.45);
  const hemWob = Math.sin(roT * 0.8);
  const bobY   = Math.sin(roT * 0.35) * 0.8;
  const strikeT = (ap > 0.32 && ap < 0.62) ? Math.sin((ap - 0.32) / 0.30 * Math.PI) : 0;
  const windupT = (ap > 0 && ap < 0.35) ? ap/0.35 : 0;
  const leanX = strikeT * dir * 3.5 * S;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(94), 29*S, 2.8*S, 0, 0, Math.PI*2); ctx.fill();

  // Aura
  const aura = ctx.createRadialGradient(sx(50), sy(50), 3*S, sx(50), sy(50), 50*S);
  aura.addColorStop(0, `rgba(145,28,235,${0.14+0.07*pulse+strikeT*0.14})`);
  aura.addColorStop(1, 'rgba(65,0,135,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(sx(50), sy(50), 50*S, 0, Math.PI*2); ctx.fill();

  ctx.save();
  ctx.translate(0, bobY * S);

  // Robe with lean
  ctx.save();
  ctx.translate(leanX, 0);
  const hemL = sx(22) + hemWob*0.6*S;
  const hemR = sx(78) - hemWob*0.6*S;
  const rg = ctx.createLinearGradient(0, sy(40), 0, sy(93));
  rg.addColorStop(0, '#501888'); rg.addColorStop(0.55, '#360c62'); rg.addColorStop(1, '#190430');
  ctx.fillStyle = rg; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.1*S;
  ctx.beginPath();
  ctx.moveTo(sx(38), sy(42));
  ctx.bezierCurveTo(sx(34), sy(52), sx(29), sy(68), hemL, sy(93));
  ctx.bezierCurveTo(sx(36), sy(96+hemWob*0.3), sx(64), sy(96-hemWob*0.3), hemR, sy(93));
  ctx.bezierCurveTo(sx(71), sy(68), sx(66), sy(52), sx(62), sy(42));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Fold
  ctx.strokeStyle = 'rgba(15,0,35,0.42)'; ctx.lineWidth = 1.3*S;
  ctx.beginPath(); ctx.moveTo(sx(50), sy(60));
  ctx.bezierCurveTo(sx(49), sy(78), sx(49), sy(88), sx(48), sy(94)); ctx.stroke();
  // Hem trim + rune dots
  ctx.strokeStyle = '#d0a835'; ctx.lineWidth = 1.0*S;
  ctx.beginPath(); ctx.moveTo(hemL, sy(93));
  ctx.bezierCurveTo(sx(36), sy(96+hemWob*0.3), sx(64), sy(96-hemWob*0.3), hemR, sy(93));
  ctx.stroke();
  ctx.fillStyle = '#ffcc4a';
  [30,42,50,58,70].forEach(x => {
    ctx.beginPath(); ctx.arc(sx(x), sy(92+Math.sin(x)*0.3), 0.6*S, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore(); // lean

  // Collar
  const cLX = leanX * 0.8;
  ctx.fillStyle = '#160328'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9*S;
  ctx.beginPath();
  ctx.moveTo(sx(38)+cLX, sy(42)); ctx.bezierCurveTo(sx(36)+cLX, sy(37), sx(40)+cLX, sy(31), sx(45)+cLX, sy(31));
  ctx.lineTo(sx(55)+cLX, sy(31)); ctx.bezierCurveTo(sx(60)+cLX, sy(31), sx(64)+cLX, sy(37), sx(62)+cLX, sy(42));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d0a835'; ctx.lineWidth = 0.7*S;
  ctx.beginPath();
  ctx.moveTo(sx(38)+cLX, sy(41.5)); ctx.bezierCurveTo(sx(36.5)+cLX, sy(37.5), sx(40.5)+cLX, sy(32), sx(45)+cLX, sy(32));
  ctx.lineTo(sx(55)+cLX, sy(32)); ctx.bezierCurveTo(sx(59.5)+cLX, sy(32), sx(63.5)+cLX, sy(37.5), sx(62)+cLX, sy(41.5));
  ctx.stroke();

  // Amulet
  const amX = sx(50)+cLX*0.5, amY = sy(52);
  ctx.fillStyle = '#d0a835'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5*S;
  ctx.beginPath(); ctx.arc(amX, amY, 3.5*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9900ee'; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = (5+strikeT*8)*S;
  ctx.beginPath(); ctx.arc(amX, amY, 2.2*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,200,255,0.70)';
  ctx.beginPath(); ctx.arc(amX-0.6*S, amY-0.6*S, 0.8*S, 0, Math.PI*2); ctx.fill();

  // Neck
  const nX = sx(50)+cLX*0.3;
  ctx.fillStyle = '#5a2880'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.7*S;
  ctx.beginPath(); ctx.moveTo(nX-4*S, sy(33)); ctx.lineTo(nX-4*S, sy(29));
  ctx.lineTo(nX+4*S, sy(29)); ctx.lineTo(nX+4*S, sy(33)); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Head
  const hX = sx(50)+leanX*0.4, hY = sy(22);
  ctx.fillStyle = '#6e2e9e'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9*S;
  ctx.beginPath(); ctx.ellipse(hX, hY, 11*S, 12*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(28,0,58,0.28)';
  ctx.beginPath(); ctx.ellipse(hX-3*S*dir, hY+1*S, 6*S, 11*S, 0, 0, Math.PI*2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#ede6f5';
  ctx.beginPath(); ctx.ellipse(hX-4*S, hY-1.5*S, 2.2*S, 1.4*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hX+4*S, hY-1.5*S, 2.2*S, 1.4*S, 0, 0, Math.PI*2); ctx.fill();
  const eyeI = 0.55+0.3*pulse + (windupT+strikeT)*0.65;
  ctx.fillStyle = `rgba(200,60,255,${Math.min(1,eyeI)})`; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = (5+strikeT*12)*S;
  ctx.beginPath(); ctx.arc(hX-4*S, hY-1.5*S, (1.1+strikeT*0.35)*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hX+4*S, hY-1.5*S, (1.1+strikeT*0.35)*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe0ff';
  ctx.beginPath(); ctx.arc(hX-4*S, hY-1.5*S, 0.45*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hX+4*S, hY-1.5*S, 0.45*S, 0, Math.PI*2); ctx.fill();
  // Brows
  ctx.strokeStyle = '#d8d0e8'; ctx.lineWidth = 1.2*S; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hX-7*S, hY-4*S); ctx.lineTo(hX-2*S, hY-3*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hX+7*S, hY-4*S); ctx.lineTo(hX+2*S, hY-3*S); ctx.stroke();
  // Goatee
  ctx.fillStyle = '#d8d0e0'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.4*S;
  ctx.beginPath();
  ctx.moveTo(hX-2*S, hY+5*S);
  ctx.bezierCurveTo(hX-1.5*S, hY+8*S, hX, hY+10*S, hX, hY+11*S);
  ctx.bezierCurveTo(hX, hY+10*S, hX+1.5*S, hY+8*S, hX+2*S, hY+5*S);
  ctx.bezierCurveTo(hX+1*S, hY+5.2*S, hX-1*S, hY+5.2*S, hX-2*S, hY+5*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // 4-spike crown
  const crCX = hX;
  const bg = ctx.createLinearGradient(0, sy(9), 0, sy(15));
  bg.addColorStop(0, '#ffcc60'); bg.addColorStop(0.5, '#d8a838'); bg.addColorStop(1, '#7a5a0a');
  ctx.fillStyle = bg; ctx.strokeStyle = '#4a3810'; ctx.lineWidth = 0.6*S;
  ctx.beginPath();
  ctx.moveTo(crCX-12*S, sy(15)); ctx.lineTo(crCX+12*S, sy(15));
  ctx.lineTo(crCX+11*S, sy(12)); ctx.lineTo(crCX-11*S, sy(12));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  [[-8,6,'#44aaff'],[-2.5,9,'#ff2244'],[2.5,9,'#22dd55'],[8,6,'#44aaff']].forEach(([ox,h,gem]) => {
    ctx.fillStyle = '#d8a838';
    ctx.beginPath(); ctx.moveTo(crCX+ox*S-1.4*S, sy(12));
    ctx.lineTo(crCX+ox*S, sy(12-h)); ctx.lineTo(crCX+ox*S+1.4*S, sy(12));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = gem; ctx.shadowColor = gem; ctx.shadowBlur = (2.5+strikeT*5)*S;
    ctx.beginPath(); ctx.arc(crCX+ox*S, sy(12-h)-0.3*S, 1.1*S, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.restore(); // bob

  // ── Staff with swing + diamond crystal ──────────────────────────
  const staffSwing = _evoStaffSwing(ap, dir);
  // Windup: staff tilts back
  const windupLift = windupT * (-4 * S);
  const stBaseX = sx(50) + 25*S*dir;
  const stTopX  = sx(50) + 28*S*dir;
  const stM1X = sx(50)+23*S*dir, stM1Y = sy(62);
  const stM2X = sx(50)+30*S*dir, stM2Y = sy(38);
  const stBaseY = sy(93);

  ctx.save();
  ctx.translate(stBaseX + leanX, stBaseY + bobY*S + windupLift);
  ctx.rotate(staffSwing);
  ctx.translate(-stBaseX, -stBaseY);

  // Shaft
  ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2.1*S; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(stBaseX, stBaseY);
  ctx.bezierCurveTo(stM1X, stM1Y, stM2X, stM2Y, stTopX, sy(13));
  ctx.stroke();
  ctx.strokeStyle = '#5a3818'; ctx.lineWidth = 0.65*S;
  ctx.beginPath(); ctx.moveTo(stBaseX-0.7*S*dir, stBaseY);
  ctx.bezierCurveTo(stM1X-0.7*S*dir, stM1Y, stM2X-0.7*S*dir, stM2Y, stTopX-0.7*S*dir, sy(13));
  ctx.stroke();
  // Gold band
  ctx.strokeStyle = '#d0a835'; ctx.lineWidth = 1.5*S;
  ctx.beginPath(); ctx.moveTo(stTopX-2*S, sy(21)); ctx.lineTo(stTopX+2*S, sy(21)); ctx.stroke();

  // Crystal
  const cX = stTopX, cY = sy(9);
  const cH = (7 + strikeT*2)*S, cW = (3 + strikeT*0.8)*S;
  const cg = ctx.createRadialGradient(cX, cY-cH*0.4, 0.4*S, cX, cY-cH*0.4, cH*2.2);
  cg.addColorStop(0, `rgba(195,115,255,${0.60+0.3*pulse+strikeT*0.5})`);
  cg.addColorStop(1, 'rgba(80,0,160,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cX, cY-cH*0.4, cH*2.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `rgb(${Math.round(188+strikeT*67)},${Math.round(60+strikeT*90)},255)`;
  ctx.strokeStyle = '#2a0045'; ctx.lineWidth = 0.6*S;
  ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = (4+strikeT*16)*S;
  ctx.beginPath();
  ctx.moveTo(cX, cY-cH); ctx.lineTo(cX+cW, cY-cH*0.5);
  ctx.lineTo(cX+cW*0.6, cY); ctx.lineTo(cX, cY+1.8*S);
  ctx.lineTo(cX-cW*0.6, cY); ctx.lineTo(cX-cW, cY-cH*0.5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(255,200,255,${0.50+0.20*pulse+strikeT*0.35})`;
  ctx.beginPath(); ctx.moveTo(cX, cY-cH*0.92);
  ctx.lineTo(cX-cW*0.7, cY-cH*0.5); ctx.lineTo(cX-0.3*S, cY-cH*0.28); ctx.closePath(); ctx.fill();

  // Strike sparks around crystal
  if (strikeT > 0.3) {
    const sp = (strikeT - 0.3) / 0.7;
    for (let i = 0; i < 6; i++) {
      const a = (i/6)*Math.PI*2 + roT*3;
      const r = sp * 12 * S;
      ctx.fillStyle = `rgba(220,140,255,${sp*0.60})`;
      ctx.beginPath(); ctx.arc(cX+Math.cos(a)*r, cY-cH*0.4+Math.sin(a)*r, 0.9*S, 0, Math.PI*2); ctx.fill();
    }
  }

  ctx.restore(); // staff

  return sy(0) + bobY*S - 12;
}

// ═══════════════════════════════════════════════════════════════════
// EVO 5 — Повелитель. Примарні крила + drawLordStudio.
// ═══════════════════════════════════════════════════════════════════
function drawLordEvo5(ctx, p) {
  const {CX, CY0, H, roD: dir, roT} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);
  const pulse = 0.5 + 0.5 * Math.sin(roT * 0.45);
  const t = _frameNow / 1000;
  const ap = p.ap || 0;
  const strikeT = (ap > 0.32 && ap < 0.72) ? Math.sin((ap - 0.32) / 0.40 * Math.PI) : 0;

  ctx.save();
  const wingRootX = sx(50);
  const wingRootY = sy(44);
  const wSway = Math.sin(t * 1.1) * 2.5 * S;
  // Wings spread wider during attack
  const wSpread = 1 + strikeT * 0.35;

  [-1, 1].forEach(side => {
    const spread = side * dir;
    const wTipX  = wingRootX + spread * 50*S*wSpread;
    const wTipY  = wingRootY - 34*S + wSway * side;
    const wCtrl1X = wingRootX + spread * 18*S;
    const wCtrl1Y = wingRootY - 8*S;
    const wCtrl2X = wTipX - spread * 4*S;
    const wCtrl2Y = wTipY + 4*S;
    const wBaseX  = wingRootX + spread * 18*S;
    const wBaseY  = wingRootY + 26*S;

    const wg = ctx.createLinearGradient(wingRootX, wingRootY, wTipX, wTipY);
    wg.addColorStop(0, `rgba(70,0,150,${0.72+0.15*pulse+strikeT*0.18})`);
    wg.addColorStop(0.5, `rgba(35,0,80,0.50)`);
    wg.addColorStop(1, 'rgba(15,0,40,0.12)');
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(wingRootX, wingRootY);
    ctx.bezierCurveTo(wCtrl1X, wCtrl1Y, wCtrl2X, wCtrl2Y, wTipX, wTipY);
    ctx.bezierCurveTo(wTipX - spread*2*S, wTipY+20*S, wBaseX, wBaseY, wingRootX, wingRootY);
    ctx.fill();
    // Wing edge
    ctx.strokeStyle = `rgba(130,30,220,${0.38+0.18*pulse+strikeT*0.3})`;
    ctx.lineWidth = 0.7*S;
    ctx.beginPath();
    ctx.moveTo(wingRootX, wingRootY);
    ctx.bezierCurveTo(wCtrl1X, wCtrl1Y, wCtrl2X, wCtrl2Y, wTipX, wTipY);
    ctx.stroke();
    // Ribs
    ctx.strokeStyle = `rgba(100,20,190,0.32)`; ctx.lineWidth = 0.45*S;
    [0.30, 0.55, 0.80].forEach(ft => {
      const rx = wingRootX + spread * ft * 50*S*wSpread;
      const ry = wingRootY - ft * 30*S + wSway * side * ft;
      ctx.beginPath(); ctx.moveTo(wingRootX+spread*2*S, wingRootY+8*S);
      ctx.lineTo(rx, ry); ctx.stroke();
    });
  });

  // Death wisps at feet (spin faster during attack)
  const wispSpeed = 1.4 + strikeT * 2.0;
  for (let i = 0; i < 6; i++) {
    const a = t * wispSpeed + i * Math.PI * 2 / 6;
    const r = 19*S + Math.sin(t*2.2+i)*3.5*S;
    const wx = sx(50) + Math.cos(a)*r;
    const wy = sy(93) + Math.sin(a)*r*0.22;
    ctx.globalAlpha = (0.25+0.18*pulse+strikeT*0.2) * (0.7+0.3*Math.cos(a));
    ctx.fillStyle = '#5500aa';
    ctx.beginPath(); ctx.arc(wx, wy, (1.3+Math.sin(t*3+i)*0.5)*S, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  return drawLordStudio(ctx, p);
}
