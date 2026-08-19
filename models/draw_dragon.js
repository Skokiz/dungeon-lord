// ═══════════════════════════════════════════════════════════════════════════
//  DRAGON — рівень 20 (бос), здібність: breath (вогняне дихання)
//  Західний квадрупед. Дизайн-стандарт: читабельний силует, анатомічно зігнуті
//  лапи з пазурами, структура значень (occlusion → mid → lit) + ТЕПЛЕ КОНТРОВЕ
//  світло по верхньому контуру для відділення від темного фону, крила зі
//  структурою пальців і напівпрозорою підсвіченою мембраною.
//  Анімація: діагональний хід на 4 лапах; атака: вдих (шия дугою назад) →
//  ривок голови вперед → конус полум'я з іскрами → відновлення.
//  Гілки: A — пекло (іскри зі спини, гаряче серце); B — лід (крижані шипи +
//  крижане дихання поверх вогняного).
// ═══════════════════════════════════════════════════════════════════════════
function drawDragonMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._drLastT || _frameNow)) / 1000, 0.05);
  unit._drLastT = _frameNow;

  if (unit._drDir === undefined) {
    unit._drDir = 1; unit._drPrevX = cx;
    unit._drPrevAcd = unit.attackCooldown;
    unit._drT = 0; unit._drAp = 0;
    unit._drEmbers = Array.from({length: 14}, () => ({ life: Math.random() }));
  }
  if (Math.abs(cx - unit._drPrevX) > 0.2)
    unit._drDir = cx > unit._drPrevX ? 1 : -1;
  unit._drPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._drDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._drDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._drPrevAcd || 0) + 3) unit._drAp = 1.0;
  unit._drPrevAcd = acd;
  unit._drT += dt;

  const atkDur = Math.min(0.85, atkBase / 60 * 0.95);
  if (unit._drAp > 0) unit._drAp = Math.max(0, unit._drAp - dt / atkDur);

  const atkActive = unit._drAp > 0;
  const ap        = 1 - unit._drAp;
  const inFight   = unit.state === 'fight' || atkActive;
  const bTime = unit._drT;

  // ── Attack phases with easing ────────────────────────────────────
  const AP_INHALE = 0.28;
  const AP_THRUST = 0.38;
  const AP_BREATHE = 0.76;
  let inhaleE = 0, thrustE = 0, breatheE = 0, recoverE = 0;
  if (atkActive) {
    if (ap < AP_INHALE) {
      const t = ap / AP_INHALE;
      inhaleE = 1 - Math.pow(1 - t, 2.2);
    } else if (ap < AP_THRUST) {
      const t = (ap - AP_INHALE) / (AP_THRUST - AP_INHALE);
      thrustE = Math.pow(t, 1.8);
      inhaleE = 1;
    } else if (ap < AP_BREATHE) {
      breatheE = 1;
      thrustE = 1;
    } else {
      const t = (ap - AP_BREATHE) / (1 - AP_BREATHE);
      recoverE = 1 - Math.pow(1 - t, 2);
      breatheE = 1 - recoverE;
      thrustE = 1 - recoverE;
    }
  }

  const breathCD    = unit.breathCooldown || 480;
  const breathReady = breathCD < 16 || breathCD >= 470;

  // ── Walk cycle (diagonal gait, 4-legged) ─────────────────────────
  const isWalking = unit.state === 'move';
  const walkFreq  = 1.30;
  const walkPhase = isWalking ? ((bTime * walkFreq) % 1) : 0;
  const walkBob = isWalking
    ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.020
    : 0;
  const walkSway = isWalking
    ? Math.sin(walkPhase * Math.PI * 2) * s * 0.008
    : 0;

  const breatheY = Math.sin(bTime * 0.85) * s * 0.008;
  const idleHeadBob = Math.sin(bTime * 0.60) * s * 0.014;

  // ── Proportions (powerful quadruped boss) ────────────────────────
  // Smaller head on a longer, graceful S-neck; heavier body; the whole
  // creature reads muscular rather than spiky.
  const bodyH   = s * 0.36;
  const bodyLen = s * 0.98;
  const neckLen = s * 0.74;
  const tailLen = s * 1.20;
  const legH    = s * 0.37;
  const headW   = s * 0.215;
  const headH   = s * 0.200;

  // ── Positions ────────────────────────────────────────────────────
  const bX = cx + walkSway;
  const bodyCenterY = fY - legH - bodyH * 0.35 + walkBob + breatheY;
  const bodyTopY    = bodyCenterY - bodyH * 0.50;
  const bodyBotY    = bodyCenterY + bodyH * 0.50;

  const frontHipX = bX + dir * bodyLen * 0.36;   // shoulder socket
  const backHipX  = bX - dir * bodyLen * 0.36;   // hip socket

  const neckBaseX = bX + dir * bodyLen * 0.46;
  const neckBaseY = bodyTopY + s * 0.015;

  const neckEndDX = dir * neckLen * (0.55 - inhaleE * 0.25 + thrustE * 0.30);
  const neckEndDY = -neckLen * (0.80 + inhaleE * 0.12 - thrustE * 0.20);
  const headBaseX = neckBaseX + neckEndDX;
  const headBaseY = neckBaseY + neckEndDY;

  const headCX = headBaseX + dir * headW * 0.30 + (idleHeadBob * 0.8) * (1 - inhaleE - thrustE - recoverE);
  const headCY = headBaseY + idleHeadBob * 0.2;
  const headRot = -inhaleE * 0.40 + thrustE * 0.28 - recoverE * 0.05;
  const jawOpen = inhaleE * s * 0.012 + thrustE * s * 0.045 + breatheE * s * 0.055;
  const throatGlow = inhaleE * 0.50 + thrustE * 0.80 + breatheE * (0.80 + Math.sin(bTime * 18) * 0.12);

  // Tail root sits high & inside the rump so it flows off the spine,
  // not pinned to the belly. Body (drawn on top) covers the actual seam.
  const tailBaseX = bX - dir * bodyLen * 0.42;
  const tailBaseY = bodyCenterY + bodyH * 0.02;

  // ── Palette: warm fire scales by default; a full ICE remap for the Frost branch
  //    ("Синя модель") so the whole dragon reads as an ice dragon, not a red one. ──
  const _isFrost = (unit._branch === 'B');
  const _isInferno = (unit._branch === 'A');
  const C = _isFrost ? {
    edge:   '#05111d',   // near-black cold
    occ:    '#0a2138',   // deep blue occlusion
    cool:   '#122a4e',   // indigo deepest shadow
    shadow: '#17456e',
    mid:    '#2f6f9e',
    midHi:  '#4a92c4',
    lit:    '#6fb4de',
    litHi:  '#a6d9f2',
    rim:    '#c8f0ff',   // cold cyan-white rim light
    rimHot: '#ecfbff',
    belly:  '#aacfe6',   // pale frosted belly
    bellyHi:'#d8eef8',
    bone:   '#e6f2fb',   // ice-white horns/claws
    boneSh: '#a8c1d3',
    ember:  '#daf6ff',   // frost sparkle
  } : _isInferno ? {
    edge:   '#170203', occ:'#360305', cool:'#280718', shadow:'#650808',
    mid:    '#a91c09', midHi:'#dc3a0d', lit:'#f56a18', litHi:'#ffad38',
    rim:    '#ffc044', rimHot:'#fff08a', belly:'#d06e1b', bellyHi:'#ffb84a',
    bone:   '#f4dfb2', boneSh:'#c69b55', ember:'#fff2a0',
  } : {
    edge:   '#150409',
    occ:    '#2c0810',
    cool:   '#241033',   // desaturated plum for deepest occlusion (kills the mud)
    shadow: '#4a0d12',
    mid:    '#7c1712',
    midHi:  '#a5301b',
    lit:    '#cf5326',
    litHi:  '#eb7c39',
    rim:    '#ff9a4a',   // warm back/rim light
    rimHot: '#ffc673',
    belly:  '#b8642f',
    bellyHi:'#dd9256',
    bone:   '#ece0c4',
    boneSh: '#b6a480',
    ember:  '#ffdd88',
  };
  // Frost-aware accents for warm bits that the C palette doesn't cover
  // (wing membranes, horns, inner furnace/throat glow).
  const _wingMem  = _isFrost ? '#173a5c' : _isInferno ? '#66120d' : '#4a1016';
  const _wingFar  = _isFrost ? '#0d2038' : _isInferno ? '#350707' : '#26090f';
  const _hornCol  = _isFrost ? '#5f93b8' : '#5a2410';         // horn body
  const _hornBoss = _isFrost ? 'rgba(38,74,104,0.85)' : 'rgba(74,34,18,0.85)';
  const _gloShad  = _isFrost ? '#8ad6ff' : '#ff8a1e';         // inner-glow bloom colour
  const _gloCore  = _isFrost ? '215,248,255' : '255,238,150'; // glow hot core rgb
  const _gloMid   = _isFrost ? '95,190,255'  : '255,110,10';  // glow mid rgb
  const _gloEdge  = _isFrost ? '30,110,220'  : '200,20,0';    // glow fade rgb
  const _rimRGB   = _isFrost ? '190,235,255' : '255,150,74';  // rim/edge light rgb
  const _warmRGB  = _isFrost ? '90,160,210'  : '207,83,38';   // muscle/scale warm sheen rgb

  // Tapered ribbon through a centerline of {x,y,w} points (for neck/tail/legs)
  const ribbon = (pts, fill) => {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b.x - a.x, dy = b.y - a.y; const dl = Math.hypot(dx, dy) || 1;
      pts[i]._px = -dy / dl; pts[i]._py = dx / dl;
    }
    ctx.fillStyle = fill; ctx.beginPath();
    for (let i = 0; i < n; i++) { const p = pts[i]; const X = p.x + p._px * p.w, Y = p.y + p._py * p.w; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    for (let i = n - 1; i >= 0; i--) { const p = pts[i]; ctx.lineTo(p.x - p._px * p.w, p.y - p._py * p.w); }
    ctx.closePath(); ctx.fill();
  };
  // Stroke one edge of a ribbon (top = +normal side) — for rim light on limbs
  const ribbonEdge = (pts, off, col, w) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) { const p = pts[i]; const X = p.x + p._px * (p.w * off), Y = p.y + p._py * (p.w * off); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke();
  };

  ctx.save();

  // ═══════════════════════════════════════════════════════════════
  // RENDER (back→front): shadow → far wing → far legs → tail → body
  //   → near legs → neck → head → near wing → breath → branch fx
  // ═══════════════════════════════════════════════════════════════

  // ── 1. Ground shadow (soft, darker contact core) ─────────────────
  const shg = ctx.createRadialGradient(cx, fY + s * 0.02, s * 0.05, cx, fY + s * 0.02, bodyLen * 0.95);
  shg.addColorStop(0, 'rgba(10,0,4,0.55)');
  shg.addColorStop(0.6, 'rgba(10,0,4,0.32)');
  shg.addColorStop(1, 'rgba(10,0,4,0)');
  ctx.fillStyle = shg;
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.02, bodyLen * 0.95, s * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── 2. FAR WING (folded behind, dark & desaturated for depth) ────
  const wingBeat = isWalking ? Math.sin(walkPhase * Math.PI * 2) * 0.10 : Math.sin(bTime * 0.70) * 0.05;
  {
    // far wing: kept lower & tucked so it stays behind the near wing and
    // doesn't tangle with the elbow + back spikes at the shoulder
    const shX = bX - dir * bodyLen * 0.04, shY = bodyTopY + s * 0.01;
    const elbX = shX - dir * s * 0.24, elbY = shY - s * (0.25 + wingBeat * 0.05);
    const tips = [
      { x: shX - dir * s * 0.44, y: shY - s * (0.34 + wingBeat * 0.07) },
      { x: shX - dir * s * 0.33, y: shY - s * (0.12 + wingBeat * 0.03) },
      { x: shX - dir * s * 0.18, y: shY + s * 0.11 },
    ];
    // far wing: darker & desaturated so the pair reads as depth, not two stickers
    ctx.fillStyle = _wingFar;
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.quadraticCurveTo(elbX - dir * s * 0.02, elbY - s * 0.04, tips[0].x, tips[0].y);
    for (let i = 0; i < tips.length - 1; i++) {
      const a = tips[i], b = tips[i + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.quadraticCurveTo(mx + (elbX - mx) * 0.50, my + (elbY - my) * 0.50, b.x, b.y);   // concave scallop
    }
    ctx.quadraticCurveTo(shX - dir * s * 0.06, shY + s * 0.08, shX, shY);
    ctx.closePath(); ctx.fill();
    // thin near-black struts
    ctx.strokeStyle = '#180509'; ctx.lineWidth = s * 0.013; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo(elbX, elbY, tips[0].x, tips[0].y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(tips[1].x, tips[1].y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.lineTo(tips[2].x, tips[2].y); ctx.stroke();
  }

  // ── Leg builder: anatomically bent, tapered, clawed ──────────────
  const legState = (phaseOffset) => {
    if (!isWalking) return { liftY: 0, fwdX: 0, kneeX: 0 };
    const p = (walkPhase + phaseOffset) % 1;
    if (p < 0.5) { const t = p / 0.5; return { liftY: 0, fwdX: (0.5 - t) * 0.14 * s * dir, kneeX: 0 }; }
    const t = (p - 0.5) / 0.5;
    return { liftY: Math.sin(t * Math.PI) * s * 0.055, fwdX: (-0.5 + t) * 0.14 * s * dir, kneeX: dir * Math.sin(t * Math.PI) * s * 0.02 };
  };
  const drawLeg = (hipX, hipY, opt) => {
    const { hind, far, scale } = opt;
    const ls = legState(opt.phase);
    const sc = scale;
    const g = fY - s * 0.004 - ls.liftY;                       // foot contact Y
    // joint chain (digitigrade: thigh down-fwd, shin down-back, foot fwd to toes)
    const kx = hipX + dir * legH * (hind ? 0.34 : 0.20) * sc + ls.kneeX;
    const ky = hipY + legH * 0.44 * sc;
    const ax = hipX + dir * legH * (hind ? 0.06 : 0.24) * sc + ls.fwdX * 0.35;   // ankle/hock
    const ay = g - legH * (hind ? 0.30 : 0.22) * sc;
    const tx = ax + dir * legH * (hind ? 0.40 : 0.30) * sc + ls.fwdX;            // toe base
    const ty = g;
    const w0 = legH * (hind ? 0.34 : 0.26) * sc;               // thigh width (beefier)
    // ── haunch / shoulder muscle mass — the limb grows OUT of this ──
    const mR = w0 * (hind ? 1.55 : 1.30);
    ctx.fillStyle = far ? C.occ : C.shadow;
    ctx.beginPath();
    ctx.ellipse(hipX - dir * w0 * 0.15, hipY - legH * 0.12 * sc, mR * 0.92, mR * 1.18, dir * (hind ? 0.20 : -0.16), 0, Math.PI * 2);
    ctx.fill();
    if (!far) {
      ctx.fillStyle = C.mid;
      ctx.beginPath();
      ctx.ellipse(hipX + dir * w0 * 0.06, hipY - legH * 0.16 * sc, mR * 0.56, mR * 0.82, dir * (hind ? 0.20 : -0.16), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${_warmRGB},0.45)`;
      ctx.beginPath();
      ctx.ellipse(hipX + dir * w0 * 0.18, hipY - legH * 0.22 * sc, mR * 0.30, mR * 0.50, dir * (hind ? 0.20 : -0.16), 0, Math.PI * 2);
      ctx.fill();
    }
    // joint chain (digitigrade)
    const chain = [
      { x: hipX, y: hipY, w: w0 },
      { x: kx,   y: ky,   w: w0 * 0.68 },
      { x: ax,   y: ay,   w: w0 * 0.42 },
      { x: tx,   y: ty,   w: w0 * 0.32 },
    ];
    const baseCol = far ? C.occ : C.shadow;
    ribbon(chain, baseCol);
    // lit front plane
    if (!far) {
      ctx.save(); ctx.globalAlpha = 0.9;
      const lit = chain.map(p => ({ x: p.x + dir * p.w * 0.28, y: p.y, w: p.w * 0.42 }));
      ribbon(lit, C.mid);
      ctx.restore();
      ribbonEdge(chain, 0.98, `rgba(${_rimRGB},0.30)`, s * 0.010);
    }
    // knee joint (small & mid-toned so it doesn't read as a segment divider)
    ctx.fillStyle = far ? '#2a0810' : C.shadow;
    ctx.beginPath(); ctx.arc(kx, ky, w0 * 0.38, 0, Math.PI * 2); ctx.fill();
    // ── foot: metatarsal wedge + splayed toes with warm claws ──
    ctx.fillStyle = far ? C.edge : C.occ;
    // ankle → toe mass so the foot has bulk, not a pinned pad
    ctx.beginPath();
    ctx.moveTo(ax + dir * w0 * 0.2, ay);
    ctx.lineTo(tx + dir * legH * 0.16 * sc, ty + s * 0.004);
    ctx.lineTo(tx - dir * legH * 0.08 * sc, ty + s * 0.006);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(tx + dir * legH * 0.06 * sc, ty - s * 0.004, w0 * 1.02, w0 * 0.46, 0, 0, Math.PI * 2); ctx.fill();
    for (let ci = -1; ci <= 1; ci++) {
      const toeX = tx + dir * legH * 0.11 * sc + ci * w0 * 0.56;
      ctx.strokeStyle = far ? '#3a0a10' : C.occ; ctx.lineWidth = w0 * 0.42; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty - s * 0.008); ctx.lineTo(toeX, ty + s * 0.006); ctx.stroke();
      // warm claw (not pure white)
      ctx.strokeStyle = far ? '#4a3018' : C.boneSh; ctx.lineWidth = s * 0.012 * sc;
      ctx.beginPath();
      ctx.moveTo(toeX, ty + s * 0.006);
      ctx.quadraticCurveTo(toeX + dir * s * 0.013 * sc, ty + s * 0.024 * sc, toeX + dir * s * 0.026 * sc, ty + s * 0.036 * sc);
      ctx.stroke();
    }
  };

  // ── 3. FAR LEGS (behind body) ────────────────────────────────────
  drawLeg(backHipX  - dir * s * 0.03, bodyBotY - s * 0.02, { hind: true,  far: true, scale: 0.90, phase: 0.00 });
  drawLeg(frontHipX - dir * s * 0.03, bodyBotY - s * 0.02, { hind: false, far: true, scale: 0.90, phase: 0.50 });

  // ── 4. TAIL (thick base → bladed tip, dorsal ridge, top rim) ─────
  const tailSegs = 14;
  const tailPts = [];
  for (let ti = 0; ti <= tailSegs; ti++) {
    const t = ti / tailSegs;
    const x = tailBaseX - dir * tailLen * (t * 0.80 + Math.sin(t * Math.PI * 0.5) * 0.20);
    const droop = Math.sin(t * Math.PI * 0.62) * s * 0.115;
    const lift  = Math.pow(t, 1.7) * s * 0.34;                        // tip sweeps up like the ref
    const wave  = Math.sin(t * Math.PI * 2.0 + bTime * 1.3 + (isWalking ? walkPhase * Math.PI * 2 : 0)) * s * 0.05 * t;
    const y = tailBaseY + droop - lift + wave;
    // very thick muscular root (carries the haunch mass), long taper to a blade
    const w = s * 0.250 * Math.pow(1 - t, 0.92) + s * 0.014;
    tailPts.push({ x, y, w });
  }
  ribbon(tailPts, C.occ);
  // lit dorsal band
  const tailLit = tailPts.map(p => ({ x: p.x, y: p.y - p.w * 0.42, w: p.w * 0.5 }));
  ribbon(tailLit, C.shadow);
  // belly band (warmer underside)
  const tailBelly = tailPts.map(p => ({ x: p.x, y: p.y + p.w * 0.5, w: p.w * 0.34 }));
  ribbon(tailBelly, C.mid);
  // dorsal spikes along tail — run unbroken from the very root so the ridge
  // is continuous with the back spikes (no gap at the hip)
  ctx.fillStyle = C.edge;
  for (let ti = 1; ti < tailSegs; ti += 1) {
    const p = tailPts[ti]; const spikeH = (p.w * 0.8 + s * 0.016);
    ctx.beginPath();
    ctx.moveTo(p.x - s * 0.014, p.y - p.w * 0.9);
    ctx.lineTo(p.x + (ti % 2 ? -1 : 1) * dir * s * 0.006, p.y - p.w * 0.9 - spikeH);
    ctx.lineTo(p.x + s * 0.014, p.y - p.w * 0.9);
    ctx.closePath(); ctx.fill();
  }
  // bladed arrowhead at tip
  {
    const p = tailPts[tailSegs], q = tailPts[tailSegs - 1];
    let dx = p.x - q.x, dy = p.y - q.y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const px = -dy, py = dx;
    ctx.fillStyle = C.occ;
    ctx.beginPath();
    ctx.moveTo(p.x + px * s * 0.075, p.y + py * s * 0.075);
    ctx.lineTo(p.x + dx * s * 0.16, p.y + dy * s * 0.16);
    ctx.lineTo(p.x - px * s * 0.075, p.y - py * s * 0.075);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(${_rimRGB},0.35)`; ctx.lineWidth = s * 0.01;
    ctx.beginPath(); ctx.moveTo(p.x + px * s * 0.075, p.y + py * s * 0.075); ctx.lineTo(p.x + dx * s * 0.16, p.y + dy * s * 0.16); ctx.stroke();
  }
  // top rim light on tail
  ribbonEdge(tailPts, 1.0, `rgba(${_rimRGB},0.5)`, s * 0.012);

  // ═══ 5. BODY ═════════════════════════════════════════════════════
  // Silhouette contour points
  const P = {
    neck:   { x: neckBaseX,                      y: neckBaseY },
    shldr:  { x: bX + dir * bodyLen * 0.28,      y: bodyTopY - s * 0.05 },
    back:   { x: bX - dir * bodyLen * 0.04,      y: bodyTopY - s * 0.015 },
    haunch: { x: backHipX + dir * bodyLen * 0.08, y: bodyTopY - s * 0.075 },
    rump:   { x: tailBaseX - dir * s * 0.01,     y: bodyCenterY - s * 0.13 },
    tailj:  { x: tailBaseX - dir * s * 0.04,     y: tailBaseY + s * 0.03 },
    bBack:  { x: bX - dir * bodyLen * 0.16,      y: bodyBotY + s * 0.02 },
    bLow:   { x: bX + dir * bodyLen * 0.08,      y: bodyBotY + s * 0.04 },
    chest:  { x: neckBaseX - dir * s * 0.04,     y: bodyBotY - bodyH * 0.05 },
  };
  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(P.neck.x, P.neck.y);
    ctx.bezierCurveTo(P.neck.x - dir * s * 0.02, P.shldr.y - s * 0.02, P.shldr.x + dir * s * 0.05, P.shldr.y, P.shldr.x, P.shldr.y);
    ctx.bezierCurveTo(P.shldr.x - dir * bodyLen * 0.12, P.back.y - s * 0.02, P.back.x + dir * bodyLen * 0.06, P.back.y, P.back.x, P.back.y);
    ctx.bezierCurveTo(P.back.x - dir * bodyLen * 0.12, P.haunch.y - s * 0.02, P.haunch.x + dir * bodyLen * 0.04, P.haunch.y, P.haunch.x, P.haunch.y);
    ctx.quadraticCurveTo(P.rump.x + dir * s * 0.05, P.rump.y - s * 0.01, P.rump.x, P.rump.y);
    ctx.quadraticCurveTo(P.tailj.x + dir * s * 0.05, (P.rump.y + P.tailj.y) / 2, P.tailj.x, P.tailj.y);
    ctx.quadraticCurveTo(P.bBack.x + dir * s * 0.02, P.bBack.y + s * 0.02, P.bBack.x, P.bBack.y);
    ctx.bezierCurveTo(P.bBack.x + dir * bodyLen * 0.14, P.bLow.y + s * 0.02, P.bLow.x - dir * bodyLen * 0.06, P.bLow.y + s * 0.02, P.bLow.x, P.bLow.y);
    ctx.quadraticCurveTo(P.chest.x + dir * bodyLen * 0.06, P.bLow.y, P.chest.x, P.chest.y);
    ctx.quadraticCurveTo(P.neck.x + dir * s * 0.04, P.chest.y - bodyH * 0.5, P.neck.x, P.neck.y);
    ctx.closePath();
  };

  // chest furnace glow behind body
  if (inhaleE > 0 || breatheE > 0 || breathReady) {
    const cg = Math.max(inhaleE * 0.5, breatheE, breathReady ? 0.32 : 0);
    ctx.shadowColor = _gloShad; ctx.shadowBlur = s * cg * 0.35;
  }
  // occlusion base (whole silhouette)
  ctx.fillStyle = C.occ; bodyPath(); ctx.fill();
  ctx.shadowBlur = 0;
  // cool-plum deep shadow at belly (kills monochrome mud)
  ctx.save(); bodyPath(); ctx.clip();
  const coolG = ctx.createLinearGradient(0, bodyTopY, 0, bodyBotY + s * 0.05);
  coolG.addColorStop(0,   _isFrost ? 'rgba(14,26,50,0)'    : 'rgba(32,14,40,0)');
  coolG.addColorStop(0.7, _isFrost ? 'rgba(14,26,50,0.12)' : 'rgba(32,14,40,0.12)');
  coolG.addColorStop(1,   _isFrost ? 'rgba(12,24,46,0.40)' : 'rgba(30,13,34,0.40)');
  ctx.fillStyle = coolG; bodyPath(); ctx.fill();
  ctx.restore();
  // mid crimson (inset from top so occ reads as underside shadow)
  ctx.save(); bodyPath(); ctx.clip();
  ctx.fillStyle = C.mid;
  ctx.beginPath();
  ctx.moveTo(P.neck.x, P.neck.y + s * 0.02);
  ctx.bezierCurveTo(P.shldr.x, P.shldr.y + s * 0.02, P.back.x, P.back.y + s * 0.02, P.haunch.x, P.haunch.y + s * 0.03);
  ctx.quadraticCurveTo(P.rump.x, P.rump.y + s * 0.03, P.tailj.x, P.tailj.y);
  ctx.lineTo(bX, bodyCenterY + bodyH * 0.18);
  ctx.lineTo(P.neck.x, bodyCenterY);
  ctx.closePath(); ctx.fill();
  // lit upper plane (top-front lit)
  const litG = ctx.createLinearGradient(0, bodyTopY - s * 0.06, 0, bodyCenterY + s * 0.02);
  litG.addColorStop(0, C.litHi);
  litG.addColorStop(0.55, C.lit);
  litG.addColorStop(1, 'rgba(207,83,38,0)');
  ctx.fillStyle = litG;
  ctx.beginPath();
  ctx.moveTo(P.shldr.x + dir * s * 0.04, P.shldr.y + s * 0.015);
  ctx.bezierCurveTo(P.shldr.x - dir * bodyLen * 0.12, P.back.y, P.back.x + dir * bodyLen * 0.06, P.back.y + s * 0.01, P.haunch.x, P.haunch.y + s * 0.02);
  ctx.quadraticCurveTo(bX - dir * bodyLen * 0.1, bodyCenterY - s * 0.02, bX + dir * bodyLen * 0.1, bodyCenterY - s * 0.01);
  ctx.quadraticCurveTo(P.shldr.x, bodyCenterY - s * 0.02, P.shldr.x + dir * s * 0.04, P.shldr.y + s * 0.015);
  ctx.closePath(); ctx.fill();
  // belly scutes — warm plated underside (ties with the throat plates)
  const bellyGlow = breatheE > 0 || inhaleE > 0;
  const bTop = bodyBotY - bodyH * 0.30;
  const bellyShape = () => {
    ctx.beginPath();
    ctx.moveTo(P.chest.x - dir * s * 0.01, bTop);
    ctx.quadraticCurveTo(bX, bodyBotY - bodyH * 0.06, P.bBack.x + dir * s * 0.05, bTop + bodyH * 0.05);
    ctx.lineTo(P.bBack.x + dir * s * 0.05, bodyBotY - bodyH * 0.02);
    ctx.quadraticCurveTo(bX, bodyBotY + s * 0.03, P.chest.x - dir * s * 0.01, bodyBotY - bodyH * 0.06);
    ctx.closePath();
  };
  ctx.fillStyle = bellyGlow
    ? (_isFrost ? `rgba(${150 + breatheE * 45},${214 + breatheE * 30},255,0.95)` : `rgba(${228 + breatheE * 27},${132 + breatheE * 60},${66},0.95)`)
    : C.belly;
  bellyShape(); ctx.fill();
  // soft upper edge so the plates melt into the flank (no hard bar)
  const belEdge = ctx.createLinearGradient(0, bTop - s * 0.03, 0, bTop + bodyH * 0.20);
  belEdge.addColorStop(0, C.mid); belEdge.addColorStop(1, 'rgba(124,23,18,0)');
  ctx.save(); bellyShape(); ctx.clip();
  ctx.fillStyle = belEdge; ctx.fillRect(P.bBack.x - s * 0.1, bTop - s * 0.05, bodyLen * 1.4, bodyH * 0.5);
  ctx.restore();
  // highlight ridge along the top of the belly plates
  ctx.strokeStyle = `rgba(${_rimRGB},0.5)`; ctx.lineWidth = s * 0.007; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(P.chest.x - dir * s * 0.01, bTop);
  ctx.quadraticCurveTo(bX, bodyBotY - bodyH * 0.06, P.bBack.x + dir * s * 0.05, bTop + bodyH * 0.05);
  ctx.stroke();
  // plate divisions — uneven spacing + a bow that wraps the barrel of the belly
  ctx.strokeStyle = 'rgba(90,42,22,0.55)'; ctx.lineWidth = s * 0.008; ctx.lineCap = 'round';
  const bandT = [0.10, 0.27, 0.45, 0.62, 0.78, 0.91];
  for (let bi = 0; bi < bandT.length; bi++) {
    const t = bandT[bi];
    const bx = P.bBack.x + dir * (0.10 + t * 0.86) * (P.chest.x - P.bBack.x);
    const bow = (0.5 + Math.sin(t * Math.PI) * 0.9) * s * 0.03;   // fullest at the belly's middle
    ctx.beginPath();
    ctx.moveTo(bx - dir * bow * 0.4, bTop + bodyH * 0.02);
    ctx.quadraticCurveTo(bx + dir * bow, bodyBotY - bodyH * 0.05, bx - dir * bow * 0.3, bodyBotY + bodyH * 0.02);
    ctx.stroke();
  }
  // scale texture on flank (2 sparse rows of small arcs)
  ctx.strokeStyle = 'rgba(40,10,8,0.55)'; ctx.lineWidth = s * 0.006;
  for (let rowI = 0; rowI < 2; rowI++) {
    const ry = bodyTopY + bodyH * (0.30 + rowI * 0.26);
    for (let ci = 0; ci < 7; ci++) {
      const rx = tailBaseX + dir * (ci + 0.6 + (rowI % 2) * 0.5) * bodyLen * 0.14;
      if (Math.abs(rx - bX) > bodyLen * 0.42) continue;
      ctx.beginPath(); ctx.arc(rx, ry, s * 0.03, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    }
  }
  ctx.restore(); // unclip body

  // dorsal spine ridge (spikes along back, tallest at shoulders)
  ctx.fillStyle = C.edge;
  const spineSegs = 9;
  const spinePts = [];
  for (let si = 0; si < spineSegs; si++) {
    const t = si / (spineSegs - 1);
    const sx = P.tailj.x + dir * t * (P.neck.x - P.tailj.x);
    // sample body top height by lerping contour points
    let sy;
    if (t < 0.33) sy = P.haunch.y + (P.rump.y - P.haunch.y) * 0; // near haunch/back region
    sy = bodyTopY - s * 0.02 - Math.max(0, 1 - Math.abs(t - 0.62) * 2.4) * s * 0.05;
    const sh = s * (0.05 + (si % 2) * 0.016) * (0.7 + Math.max(0, 1 - Math.abs(t - 0.62) * 2) * 0.6);
    spinePts.push({ x: sx, y: sy, h: sh });
    ctx.beginPath();
    ctx.moveTo(sx - s * 0.018, sy + s * 0.008);
    ctx.lineTo(sx + (si % 2 ? -1 : 1) * dir * s * 0.005, sy - sh);
    ctx.lineTo(sx + s * 0.018, sy + s * 0.008);
    ctx.closePath(); ctx.fill();
  }
  // rim light on back contour (the key "lit against darkness" cue)
  ctx.strokeStyle = C.rim; ctx.lineWidth = s * 0.014; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = `rgba(${_rimRGB},0.5)`; ctx.shadowBlur = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(P.haunch.x, P.haunch.y);
  ctx.bezierCurveTo(P.back.x - dir * bodyLen * 0.06, P.back.y - s * 0.005, P.shldr.x - dir * bodyLen * 0.1, P.back.y, P.shldr.x, P.shldr.y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // chest furnace (heart glow — inner fire)
  const heartX = bX + dir * bodyLen * 0.20;
  const heartY = bodyCenterY + bodyH * 0.12;
  // faint ember at idle; only the attack really lights the furnace
  const heartGlow = 0.14 + Math.sin(bTime * 2.0) * 0.06 + inhaleE * 0.7 + breatheE * 0.6;
  ctx.shadowColor = _gloShad; ctx.shadowBlur = s * heartGlow * 0.5;
  const hg = ctx.createRadialGradient(heartX, heartY, 0, heartX, heartY, s * 0.12);
  hg.addColorStop(0, `rgba(${_gloCore},${heartGlow * 0.85})`);
  hg.addColorStop(0.5, `rgba(${_gloMid},${heartGlow * 0.7})`);
  hg.addColorStop(1, `rgba(${_gloEdge},0)`);
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(heartX, heartY, s * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── 6. NEAR LEGS (full, bent, planted) ───────────────────────────
  drawLeg(backHipX,  bodyBotY - s * 0.005, { hind: true,  far: false, scale: 1.0, phase: 0.50 });
  drawLeg(frontHipX, bodyBotY - s * 0.005, { hind: false, far: false, scale: 1.0, phase: 0.00 });

  // ── 7. NECK (S-curve, throat scutes, dorsal spikes, rim) ─────────
  // Gentle S: the nape rises back before the head reaches forward.
  const neckMidX = neckBaseX + dir * neckLen * (0.16 + thrustE * 0.10 - inhaleE * 0.10);
  const neckMidY = neckBaseY - neckLen * (0.46 + inhaleE * 0.14 - thrustE * 0.06);
  const neckSegs = 10;
  const neckPts = [];
  for (let ni = 0; ni <= neckSegs; ni++) {
    const t = ni / neckSegs, omt = 1 - t;
    const nx = omt * omt * neckBaseX + 2 * omt * t * neckMidX + t * t * headBaseX;
    const ny = omt * omt * neckBaseY + 2 * omt * t * neckMidY + t * t * headBaseY;
    // strong taper: thick brisket base → narrow behind the skull (kills the
    // uniform "extruded pipe" read). Slight bulge near the base for muscle.
    const nw = s * (0.185 - t * 0.135) * (1 + Math.max(0, 0.18 - t) * 0.6);
    neckPts.push({ x: nx, y: ny, w: nw });
  }
  // Brisket / trapezius: a muscle mass that flares the neck root into the
  // chest and shoulder so the neck grows out of the body (kills the seam).
  ctx.save();
  ctx.translate(neckBaseX - dir * s * 0.015, neckBaseY + bodyH * 0.30);
  ctx.rotate(dir * 0.62);
  ctx.fillStyle = C.shadow;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.175, bodyH * 0.66, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.mid;
  ctx.beginPath(); ctx.ellipse(dir * s * 0.03, -s * 0.015, s * 0.115, bodyH * 0.46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ribbon(neckPts, C.occ);                                              // dark far side
  // rounded muscle: mid core offset toward the dorsal (lit) side → volume
  ribbon(neckPts.map(p => ({ x: p.x + p._px * p.w * 0.26, y: p.y + p._py * p.w * 0.26, w: p.w * 0.62 })), C.mid);
  ribbonEdge(neckPts, 0.60, C.lit, s * 0.016);                         // lit crest muscle
  ribbonEdge(neckPts, 0.14, C.litHi, s * 0.007);                       // core sheen
  // throat scutes: warm belly plates down the underside
  const throat = neckPts.map(p => ({ x: p.x - p._px * p.w * 0.48, y: p.y - p._py * p.w * 0.48, w: p.w * 0.40 }));
  ribbon(throat, C.belly);
  ctx.strokeStyle = 'rgba(90,42,22,0.5)'; ctx.lineWidth = s * 0.006; ctx.lineCap = 'round';
  for (let ni = 1; ni < neckSegs; ni++) {
    const p = throat[ni];
    ctx.beginPath();
    ctx.moveTo(p.x - p._px * p.w, p.y - p._py * p.w);
    ctx.lineTo(p.x + p._px * p.w, p.y + p._py * p.w);
    ctx.stroke();
  }
  // underside tendon/fold overlaps — break the smooth extruded curve so the
  // neck reads as stacked muscle, not a bent pipe.
  ctx.fillStyle = 'rgba(20,6,10,0.32)';
  [4, 7].forEach(ni => {
    const p = neckPts[ni];
    ctx.save();
    ctx.translate(p.x - p._px * p.w * 0.42, p.y - p._py * p.w * 0.42);
    ctx.rotate(Math.atan2(p._py, p._px));
    ctx.beginPath(); ctx.ellipse(0, 0, p.w * 0.75, p.w * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  // dorsal spikes along neck (shrink toward the head)
  ctx.fillStyle = C.edge;
  for (let ni = 1; ni < neckSegs; ni++) {
    const p = neckPts[ni]; const sH = s * 0.036 * (1 - ni / neckSegs * 0.55);
    ctx.beginPath();
    ctx.moveTo(p.x + p._px * p.w, p.y + p._py * p.w);
    ctx.lineTo(p.x + p._px * (p.w + sH) + (ni % 2 ? 1 : -1) * dir * s * 0.004, p.y + p._py * (p.w + sH));
    ctx.lineTo(p.x + p._px * p.w * 0.5 + (p.x - neckPts[ni - 1].x) * 0.5, p.y + p._py * p.w * 0.5);
    ctx.closePath(); ctx.fill();
  }
  // rim light on neck top edge
  ribbonEdge(neckPts, 1.0, `rgba(${_rimRGB},0.5)`, s * 0.011);

  // ── 8. HEAD (rotated; brow, snout, jaw, horns, eye) ──────────────
  ctx.save();
  ctx.translate(headCX, headCY);
  ctx.rotate(headRot * dir);
  const D = dir; const hw = headW, hh = headH;
  if (inFight) { ctx.shadowColor = _isFrost ? (breatheE > 0 ? '#8ad6ff' : '#2a6aa8') : (breatheE > 0 ? '#ffaa00' : '#cc2200'); ctx.shadowBlur = s * (breatheE > 0 ? 0.5 : 0.2); }

  // Horns first (behind skull) — 2 thick backswept horns, tapered & ridged
  const drawHorn = (bx0, by0, len, spread, wBase) => {
    const bx = D * hw * bx0, by = hh * by0;
    const mx = bx - D * s * len * 0.42, my = by - s * len * 0.10;
    const ex = bx - D * s * len * 0.92, ey = by - s * len * (0.42 + spread);
    // bony base boss where the horn erupts from the skull
    ctx.fillStyle = _hornBoss;
    ctx.beginPath(); ctx.ellipse(bx, by, s * wBase * 1.25, s * wBase * 0.95, dir * -0.3, 0, Math.PI * 2); ctx.fill();
    ribbon([
      { x: bx, y: by, w: s * wBase },
      { x: mx, y: my, w: s * wBase * 0.6 },
      { x: ex, y: ey, w: s * wBase * 0.16 },
    ], C.edge);
    ctx.strokeStyle = _hornCol; ctx.lineWidth = s * wBase * 0.55; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
    ctx.strokeStyle = `rgba(${_rimRGB},0.4)`; ctx.lineWidth = s * wBase * 0.2;
    ctx.beginPath(); ctx.moveTo(bx, by - s * wBase * 0.3); ctx.quadraticCurveTo(mx, my - s * wBase * 0.3, ex, ey); ctx.stroke();
  };
  // (horns drawn after the skull below, so their thick bases read as attached)
  // cheek frill — swept-back scalloped fin ROOTED at the jaw/skull (the skull
  // is painted next and overlaps its front edge, so it reads attached).
  ctx.fillStyle = '#3a1008';
  ctx.beginPath();
  ctx.moveTo(-D * hw * 0.08, -hh * 0.36);
  ctx.quadraticCurveTo(-D * hw * 0.64, -hh * 0.36, -D * hw * 0.72, hh * 0.04);
  ctx.quadraticCurveTo(-D * hw * 0.54, hh * 0.00, -D * hw * 0.44, hh * 0.26);
  ctx.quadraticCurveTo(-D * hw * 0.30, hh * 0.06, -D * hw * 0.04, hh * 0.14);
  ctx.closePath(); ctx.fill();

  ctx.shadowBlur = inFight ? ctx.shadowBlur : 0;
  // Lower jaw (opens with jawOpen)
  ctx.fillStyle = C.occ;
  ctx.beginPath();
  ctx.moveTo(-D * hw * 0.30, hh * 0.10);
  ctx.quadraticCurveTo(D * hw * 0.30, hh * 0.42 + jawOpen, D * hw * 1.02, hh * 0.30 + jawOpen);
  ctx.lineTo(D * hw * 1.18, hh * 0.26 + jawOpen);
  ctx.lineTo(D * hw * 1.14, hh * 0.14 + jawOpen * 0.4);
  ctx.quadraticCurveTo(D * hw * 0.45, hh * 0.24, -D * hw * 0.30, hh * 0.02);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.belly;
  ctx.beginPath(); ctx.ellipse(D * hw * 0.42, hh * 0.34 + jawOpen * 0.7, hw * 0.46, hh * 0.10, 0, 0, Math.PI * 2); ctx.fill();

  // Upper skull — dark base
  ctx.fillStyle = C.occ;
  ctx.beginPath();
  ctx.moveTo(-D * hw * 0.55, hh * 0.16);
  ctx.quadraticCurveTo(-D * hw * 0.72, -hh * 0.55, -D * hw * 0.05, -hh * 0.82);   // back of skull
  ctx.quadraticCurveTo(D * hw * 0.45, -hh * 0.86, D * hw * 0.72, -hh * 0.42);      // brow → snout ridge
  ctx.quadraticCurveTo(D * hw * 1.05, -hh * 0.16, D * hw * 1.24, hh * 0.14);       // snout top → nose
  ctx.lineTo(D * hw * 1.18, hh * 0.26);                                            // nostril front
  ctx.quadraticCurveTo(D * hw * 0.55, hh * 0.30, -D * hw * 0.28, hh * 0.18);       // upper lip
  ctx.closePath(); ctx.fill();
  // Upper skull — lit top plane
  const headLit = ctx.createLinearGradient(0, -hh * 0.85, 0, hh * 0.1);
  headLit.addColorStop(0, C.litHi); headLit.addColorStop(0.7, C.mid); headLit.addColorStop(1, 'rgba(124,23,18,0)');
  ctx.fillStyle = headLit;
  ctx.beginPath();
  ctx.moveTo(-D * hw * 0.40, -hh * 0.05);
  ctx.quadraticCurveTo(-D * hw * 0.55, -hh * 0.50, -D * hw * 0.02, -hh * 0.72);
  ctx.quadraticCurveTo(D * hw * 0.42, -hh * 0.74, D * hw * 0.66, -hh * 0.36);
  ctx.quadraticCurveTo(D * hw * 0.95, -hh * 0.12, D * hw * 1.12, hh * 0.10);
  ctx.lineTo(D * hw * 0.6, hh * 0.02);
  ctx.lineTo(-D * hw * 0.30, -hh * 0.02);
  ctx.closePath(); ctx.fill();
  // snout rim light
  ctx.strokeStyle = C.rim; ctx.lineWidth = s * 0.011; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-D * hw * 0.05, -hh * 0.80);
  ctx.quadraticCurveTo(D * hw * 0.45, -hh * 0.84, D * hw * 0.72, -hh * 0.42);
  ctx.quadraticCurveTo(D * hw * 1.03, -hh * 0.16, D * hw * 1.22, hh * 0.13);
  ctx.stroke();

  // Horns — thick, backswept, attached at the back-top of the skull
  drawHorn(-0.12, -0.56, 0.64, 0.16, 0.10);
  drawHorn(-0.32, -0.38, 0.48, 0.06, 0.075);

  // Teeth — upper row, varied sizes with prominent canines
  ctx.fillStyle = C.bone;
  const upperT = [0.02, 0.22, 0.44, 0.66, 0.90];
  const upperH = [0.030, 0.052, 0.032, 0.046, 0.064];
  const upperW = [0.012, 0.016, 0.011, 0.014, 0.018];
  for (let ti = 0; ti < upperT.length; ti++) {
    const tx = D * hw * upperT[ti];
    ctx.beginPath();
    ctx.moveTo(tx - s * upperW[ti], hh * 0.20);
    ctx.lineTo(tx + D * s * 0.004, hh * 0.20 + s * upperH[ti]);
    ctx.lineTo(tx + s * upperW[ti], hh * 0.20);
    ctx.closePath(); ctx.fill();
  }
  // Lower teeth (when open)
  if (jawOpen > s * 0.01) {
    ctx.fillStyle = C.boneSh;
    for (let ti = 0; ti < 5; ti++) {
      const tx = D * hw * (0.05 + ti * 0.24);
      ctx.beginPath(); ctx.moveTo(tx - s * 0.01, hh * 0.30 + jawOpen); ctx.lineTo(tx, hh * 0.30 + jawOpen - s * 0.03); ctx.lineTo(tx + s * 0.01, hh * 0.30 + jawOpen); ctx.closePath(); ctx.fill();
    }
  }
  // Throat glow inside mouth
  if (throatGlow > 0.05) {
    const tgX = D * hw * 0.55, tgY = hh * 0.26 + jawOpen * 0.4;
    ctx.shadowColor = _gloShad; ctx.shadowBlur = s * throatGlow * 0.5;
    const tg = ctx.createRadialGradient(tgX, tgY, 0, tgX, tgY, s * 0.08);
    tg.addColorStop(0, `rgba(${_gloCore},${throatGlow * 0.95})`);
    tg.addColorStop(0.5, `rgba(${_gloMid},${throatGlow * 0.85})`);
    tg.addColorStop(1, `rgba(${_gloEdge},0)`);
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.ellipse(tgX, tgY, s * 0.08, s * 0.036 + jawOpen * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  // Brow ridge (furious overhang)
  ctx.fillStyle = '#3a0c08';
  ctx.beginPath();
  ctx.moveTo(-D * hw * 0.10, -hh * 0.30);
  ctx.quadraticCurveTo(D * hw * 0.30, -hh * 0.50, D * hw * 0.58, -hh * 0.34);
  ctx.quadraticCurveTo(D * hw * 0.34, -hh * 0.22, -D * hw * 0.02, -hh * 0.18);
  ctx.closePath(); ctx.fill();
  // Eye (glowing, slit pupil, under brow)
  const eyeCX = D * hw * 0.26, eyeCY = -hh * 0.20, eyeR = hh * 0.13;
  ctx.shadowColor = _isFrost ? (breatheE > 0 ? '#aef0ff' : '#66c8ff') : (breatheE > 0 ? '#ffcc00' : '#ff4400'); ctx.shadowBlur = s * (breatheE > 0 ? 0.42 : inFight ? 0.26 : 0.14);
  ctx.fillStyle = _isFrost ? '#02080e' : '#0a0200'; ctx.beginPath(); ctx.ellipse(eyeCX, eyeCY, eyeR * 1.3, eyeR * 1.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = _isFrost ? (breatheE > 0 ? '#e0f7ff' : (inFight ? '#79d4f6' : '#9cc9e0')) : (breatheE > 0 ? '#ffe066' : (inFight ? '#ff9922' : '#e6b23a'));
  ctx.beginPath(); ctx.ellipse(eyeCX, eyeCY, eyeR, eyeR * 0.82, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#00060a';
  ctx.beginPath(); ctx.ellipse(eyeCX + D * eyeR * 0.15, eyeCY, eyeR * 0.22, eyeR * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = _isFrost ? 'rgba(232,250,255,0.75)' : 'rgba(255,245,200,0.7)';
  ctx.beginPath(); ctx.arc(eyeCX - D * eyeR * 0.3, eyeCY - eyeR * 0.3, eyeR * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Nostril + smoke
  ctx.fillStyle = '#120200';
  ctx.beginPath(); ctx.ellipse(D * hw * 1.06, hh * 0.02, hw * 0.05, hh * 0.045, -0.4 * D, 0, Math.PI * 2); ctx.fill();
  if (breathReady || inhaleE > 0.2) {
    const puff = inhaleE > 0 ? inhaleE : 0.3;
    ctx.fillStyle = _isFrost ? `rgba(190,225,245,${puff * 0.4})` : `rgba(200,150,120,${puff * 0.4})`;
    ctx.beginPath();
    ctx.arc(D * hw * (1.15 + (1 - (bTime % 1)) * 0.3), hh * 0.0 - (1 - (bTime % 1)) * s * 0.05, s * 0.024, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore(); // head

  // ── 9. NEAR WING (large raised, finger struts, backlit membrane) ─
  {
    const shX = neckBaseX - dir * bodyLen * 0.10, shY = bodyTopY - s * 0.02;
    const beat = isWalking ? Math.sin(walkPhase * Math.PI * 2) * 0.12 : Math.sin(bTime * 0.7 + 0.4) * 0.06;
    const elbX = shX - dir * s * 0.34, elbY = shY - s * (0.48 + beat * 0.07);
    const tips = [
      { x: shX - dir * s * 0.70, y: shY - s * (0.60 + beat * 0.13) },   // leading finger
      { x: shX - dir * s * 0.60, y: shY - s * (0.30 + beat * 0.05) },
      { x: shX - dir * s * 0.40, y: shY + s * 0.02 },
    ];
    const atX = shX + dir * s * 0.08, atY = shY + s * 0.18;             // body attach (low on flank)
    // Leathery membrane: leading edge sh→elb→tip0, then CONCAVE scallops
    // between the fingers, curving in toward the elbow.
    const wingPath = () => {
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.quadraticCurveTo(elbX - dir * s * 0.02, elbY - s * 0.05, tips[0].x, tips[0].y);
      for (let i = 0; i < tips.length - 1; i++) {
        const a = tips[i], b = tips[i + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        ctx.quadraticCurveTo(mx + (elbX - mx) * 0.54, my + (elbY - my) * 0.54, b.x, b.y);  // deep sag
      }
      const a = tips[tips.length - 1], mx = (a.x + atX) / 2, my = (a.y + atY) / 2;
      ctx.quadraticCurveTo(mx + (elbX - mx) * 0.36, my + (elbY - my) * 0.36, atX, atY);
      ctx.quadraticCurveTo(shX + dir * s * 0.02, atY - s * 0.06, shX, shY);
      ctx.closePath();
    };
    // wing shoulder knuckle (deltoid) — the wing arm grows from a muscle
    ctx.fillStyle = C.shadow;
    ctx.beginPath(); ctx.ellipse(shX, shY + s * 0.02, s * 0.080, s * 0.095, dir * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.mid;
    ctx.beginPath(); ctx.ellipse(shX + dir * s * 0.012, shY - s * 0.004, s * 0.048, s * 0.062, dir * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = _wingMem; wingPath(); ctx.fill();
    // backlit translucency near the upper membrane
    ctx.save(); wingPath(); ctx.clip();
    const memG = ctx.createLinearGradient(elbX, elbY, tips[2].x, tips[2].y + s * 0.1);
    memG.addColorStop(0,   _isFrost ? 'rgba(95,175,235,0.34)'  : 'rgba(190,70,26,0.5)');
    memG.addColorStop(0.6, _isFrost ? 'rgba(55,120,205,0.16)'  : 'rgba(120,34,16,0.22)');
    memG.addColorStop(1,   _isFrost ? 'rgba(30,80,160,0)'      : 'rgba(60,15,10,0)');
    ctx.fillStyle = memG; ctx.fillRect(tips[0].x - s * 0.2, tips[0].y - s * 0.2, s * 1.6, s * 1.6);
    ctx.restore();
    // internal value variation so the membrane isn't one flat plane
    ctx.save(); wingPath(); ctx.clip();
    // trailing/lower edge recedes into shadow
    const memShade = ctx.createLinearGradient(elbX, elbY, (tips[1].x + atX) / 2, atY + s * 0.06);
    memShade.addColorStop(0, 'rgba(18,5,10,0)');
    memShade.addColorStop(0.55, 'rgba(20,6,11,0.14)');
    memShade.addColorStop(1, 'rgba(14,4,9,0.58)');
    ctx.fillStyle = memShade; ctx.fillRect(tips[2].x - s * 0.2, elbY - s * 0.1, s * 1.7, s * 1.7);
    // veins radiating from the elbow toward the scallop valleys between fingers
    ctx.strokeStyle = 'rgba(28,8,12,0.5)'; ctx.lineWidth = s * 0.008; ctx.lineCap = 'round';
    const valleys = [
      { x: (tips[0].x + tips[1].x) / 2, y: (tips[0].y + tips[1].y) / 2 },
      { x: (tips[1].x + tips[2].x) / 2, y: (tips[1].y + tips[2].y) / 2 },
      { x: (tips[2].x + atX) / 2,       y: (tips[2].y + atY) / 2 },
    ];
    valleys.forEach(v => {
      const mx2 = (elbX + v.x) / 2, my2 = (elbY + v.y) / 2;
      ctx.beginPath(); ctx.moveTo(elbX, elbY);
      ctx.quadraticCurveTo(mx2 + (elbX - mx2) * 0.30, my2 + (elbY - my2) * 0.30, v.x + (elbX - v.x) * 0.14, v.y + (elbY - v.y) * 0.14);
      ctx.stroke();
    });
    ctx.restore();
    // thick humerus (wing arm), then thinner finger struts
    ctx.strokeStyle = '#2a0a10'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = s * 0.030;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo(elbX - s * 0.02, elbY, elbX, elbY); ctx.stroke();
    ctx.lineWidth = s * 0.017;
    tips.forEach(tp => { ctx.beginPath(); ctx.moveTo(elbX, elbY); ctx.quadraticCurveTo((elbX + tp.x) / 2, (elbY + tp.y) / 2 - s * 0.022, tp.x, tp.y); ctx.stroke(); });
    // leading-edge rim light
    ctx.strokeStyle = `rgba(${_rimRGB},0.45)`; ctx.lineWidth = s * 0.010;
    ctx.beginPath(); ctx.moveTo(shX, shY - s * 0.006); ctx.quadraticCurveTo(elbX, elbY - s * 0.01, tips[0].x + dir * s * 0.006, tips[0].y + s * 0.006); ctx.stroke();
    // little curved claws at the two leading finger tips
    ctx.strokeStyle = C.boneSh; ctx.lineWidth = s * 0.013; ctx.lineCap = 'round';
    [tips[0], tips[1]].forEach(tp => { ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.quadraticCurveTo(tp.x - dir * s * 0.018, tp.y - s * 0.004, tp.x - dir * s * 0.028, tp.y + s * 0.012); ctx.stroke(); });
  }

  // ── 10. FIRE BREATH (cone from mouth during thrust/breathe) ──────
  const mouthLocalX = dir * headW * 1.22;
  const mouthLocalY = headH * 0.26 + jawOpen * 0.5;
  const mouthAngle = headRot * dir;
  const mcos = Math.cos(mouthAngle), msin = Math.sin(mouthAngle);
  const mouthX = headCX + mouthLocalX * mcos - mouthLocalY * msin;
  const mouthY = headCY + mouthLocalX * msin + mouthLocalY * mcos;
  const fwdX = mcos * dir, fwdY = msin * dir;
  const perpX = -fwdY, perpY = fwdX;

  if ((thrustE > 0 || breatheE > 0) && unit._branch !== 'B') {
    const bAlpha = breatheE > 0 ? 1 : thrustE * 0.6;
    if (bAlpha > 0) {
      const breathLen = s * (1.2 + breatheE * 1.6);
      const breathWide = s * (0.2 + breatheE * 0.35);
      const e1x = mouthX + fwdX * breathLen, e1y = mouthY + fwdY * breathLen;
      // outer
      ctx.fillStyle = `rgba(180,50,0,${bAlpha * 0.5})`;
      ctx.beginPath(); ctx.moveTo(mouthX, mouthY);
      ctx.quadraticCurveTo(mouthX + fwdX * breathLen * 0.5 + perpX * breathWide * 0.9, mouthY + fwdY * breathLen * 0.5 + perpY * breathWide * 0.9, e1x + perpX * breathWide * 0.3, e1y + perpY * breathWide * 0.3);
      ctx.lineTo(e1x - perpX * breathWide * 0.3, e1y - perpY * breathWide * 0.3);
      ctx.quadraticCurveTo(mouthX + fwdX * breathLen * 0.5 - perpX * breathWide * 0.9, mouthY + fwdY * breathLen * 0.5 - perpY * breathWide * 0.9, mouthX, mouthY);
      ctx.closePath(); ctx.fill();
      // mid
      ctx.fillStyle = `rgba(255,100,0,${bAlpha * 0.76})`;
      ctx.beginPath(); ctx.moveTo(mouthX, mouthY);
      ctx.quadraticCurveTo(mouthX + fwdX * breathLen * 0.5 + perpX * breathWide * 0.55, mouthY + fwdY * breathLen * 0.5 + perpY * breathWide * 0.55, e1x + perpX * breathWide * 0.15, e1y + perpY * breathWide * 0.15);
      ctx.lineTo(e1x - perpX * breathWide * 0.15, e1y - perpY * breathWide * 0.15);
      ctx.quadraticCurveTo(mouthX + fwdX * breathLen * 0.5 - perpX * breathWide * 0.55, mouthY + fwdY * breathLen * 0.5 - perpY * breathWide * 0.55, mouthX, mouthY);
      ctx.closePath(); ctx.fill();
      // core jet
      ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = s * 0.42 * bAlpha;
      const jg = ctx.createLinearGradient(mouthX, mouthY, e1x, e1y);
      jg.addColorStop(0, `rgba(255,240,120,${bAlpha * 0.96})`);
      jg.addColorStop(0.5, `rgba(255,140,0,${bAlpha * 0.82})`);
      jg.addColorStop(1, 'rgba(200,60,0,0)');
      ctx.strokeStyle = jg; ctx.lineWidth = s * 0.068; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mouthX, mouthY); ctx.lineTo(e1x, e1y); ctx.stroke();
      ctx.shadowBlur = 0;
      // embers
      unit._drEmbers.forEach((em, ei) => {
        const eT = ((unit._drT * 3 + ei * 0.17) % 1);
        const eX = mouthX + fwdX * eT * breathLen, eY = mouthY + fwdY * eT * breathLen;
        const eSpread = Math.sin(ei + bTime * 5) * breathWide * eT * 0.7;
        const eSize = s * 0.018 * (1 - eT * 0.7), eAlpha = (1 - eT) * bAlpha * 0.9;
        ctx.fillStyle = `rgba(255,${Math.floor(200 + eT * 55)},${Math.floor(40 + eT * 120)},${eAlpha})`;
        ctx.beginPath(); ctx.arc(eX + perpX * eSpread, eY + perpY * eSpread, eSize, 0, Math.PI * 2); ctx.fill();
      });
    }
  }

  // ── Branch visuals ──────────────────────────────────────────
  const _drBranch = unit._branch || '';
  if (_drBranch === 'A') {
    // Inferno: a single continuous living fire-crest changes the silhouette;
    // hotter body values and the crest keep A from reading as base+particles.
    ctx.save();
    const crestBackX = bX - dir * bodyLen * 0.38;
    const crestFrontX = bX + dir * bodyLen * 0.34;
    const crestG = ctx.createLinearGradient(0, bodyTopY-s*0.34, 0, bodyTopY+s*0.04);
    crestG.addColorStop(0,'rgba(255,246,150,0.95)');
    crestG.addColorStop(0.42,'rgba(255,130,18,0.94)');
    crestG.addColorStop(1,'rgba(170,20,0,0.55)');
    ctx.fillStyle=crestG; ctx.shadowColor='#ff6a00'; ctx.shadowBlur=s*0.22;
    ctx.beginPath(); ctx.moveTo(crestBackX, bodyTopY+s*0.035);
    for(let i=0;i<=7;i++){
      const tt=i/7, x=crestBackX+(crestFrontX-crestBackX)*tt;
      const baseY=bodyTopY+s*(0.025-Math.sin(tt*Math.PI)*0.055);
      const h=s*(0.13+Math.sin(tt*Math.PI)*0.13+(i%2)*0.035);
      ctx.lineTo(x,baseY); ctx.lineTo(x+dir*s*0.026,baseY-h);
    }
    ctx.lineTo(crestFrontX+dir*s*0.045,bodyTopY+s*0.045);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(255,238,120,0.72)'; ctx.lineWidth=s*0.012;
    ctx.stroke(); ctx.shadowBlur=0;

    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = s * 0.18;
    for (let i = 0; i < 6; i++) {
      const _ep = ((_frameNow * 0.0007 + i * 0.17) % 1.0);
      const _ex = bX - dir * bodyLen * (0.30 - i * 0.10) + Math.sin(_frameNow * 0.0012 + i * 1.2) * s * 0.04;
      const _ey = bodyTopY - _ep * s * 0.55;
      const _ea = (1 - _ep) * 0.55, _er = s * (0.022 - _ep * 0.016);
      if (_er > 0) { ctx.fillStyle = `rgba(255,${Math.floor(100 + _ep * 120)},0,${_ea})`; ctx.beginPath(); ctx.arc(_ex, _ey, _er, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.shadowColor = '#ff4400'; ctx.shadowBlur = s * 0.45;
    const _hg2 = ctx.createRadialGradient(heartX, heartY, 0, heartX, heartY, s * 0.22);
    _hg2.addColorStop(0, 'rgba(255,255,140,0.55)'); _hg2.addColorStop(0.5, 'rgba(255,80,0,0.32)'); _hg2.addColorStop(1, 'rgba(200,20,0,0)');
    ctx.fillStyle = _hg2; ctx.beginPath(); ctx.arc(heartX, heartY, s * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,120,0,0.2)'; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bX - dir * bodyLen * 0.38, bodyCenterY - bodyH * 0.15); ctx.lineTo(bX + dir * bodyLen * 0.28, bodyTopY + s * 0.04); ctx.stroke();
    ctx.restore();

  } else if (_drBranch === 'B') {
    // Frost: ice crystal spines + idle cloud + ICE BREATH over the fire cone
    ctx.save();
    ctx.shadowColor = '#88ddff'; ctx.shadowBlur = s * 0.15;
    for (let i = 0; i < 6; i++) {
      const _ix = bX - dir * bodyLen * (0.35 - i * 0.12);
      const _iy = bodyTopY - s * 0.02;
      const _ih = s * (0.095 + Math.abs(Math.sin(i * 1.4 + 0.3)) * 0.065);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(200,238,255,0.78)' : 'rgba(140,210,255,0.6)';
      ctx.strokeStyle = 'rgba(100,180,255,0.55)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(_ix, _iy - _ih); ctx.lineTo(_ix - s * 0.018, _iy + s * 0.01); ctx.lineTo(_ix + s * 0.018, _iy + s * 0.01); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(180,230,255,0.4)';
        ctx.beginPath(); ctx.moveTo(_ix + dir * s * 0.025, _iy - _ih * 0.6); ctx.lineTo(_ix + dir * s * 0.013, _iy + s * 0.006); ctx.lineTo(_ix + dir * s * 0.037, _iy + s * 0.006); ctx.closePath(); ctx.fill();
      }
    }
    // cold breath-mist curling from the maw — soft puffs drift out, rise & melt
    if (breatheE < 0.15) {
      const _mt = _frameNow * 0.001;
      for (let i = 0; i < 5; i++) {
        const _pp = ((_mt * 0.45 + i * 0.2) % 1);                       // 0→1 life
        const _drift = _pp * s * 0.42;
        const _px = mouthX + fwdX * _drift + Math.sin(_mt * 1.6 + i * 2.1) * s * 0.028;
        const _py = mouthY + fwdY * _drift - _pp * s * 0.14;            // rises as it drifts
        const _pr = s * (0.028 + _pp * 0.075);                          // grows
        const _pa = Math.sin(_pp * Math.PI) * 0.4;                      // fade in → out
        if (_pa > 0.01) { ctx.fillStyle = `rgba(202,236,255,${_pa.toFixed(3)})`; ctx.beginPath(); ctx.arc(_px, _py, _pr, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    ctx.shadowBlur = 0;

    if (thrustE > 0 || breatheE > 0) {
      const _bAlpha = breatheE > 0 ? 1 : thrustE * 0.6;
      if (_bAlpha > 0) {
        const _bLen = s * (1.2 + breatheE * 1.6), _bWide = s * (0.2 + breatheE * 0.35);
        const _e1x = mouthX + fwdX * _bLen, _e1y = mouthY + fwdY * _bLen;
        ctx.fillStyle = `rgba(20,80,200,${_bAlpha * 0.7})`;
        ctx.beginPath(); ctx.moveTo(mouthX, mouthY);
        ctx.quadraticCurveTo(mouthX + fwdX * _bLen * 0.5 + perpX * _bWide * 0.9, mouthY + fwdY * _bLen * 0.5 + perpY * _bWide * 0.9, _e1x + perpX * _bWide * 0.3, _e1y + perpY * _bWide * 0.3);
        ctx.lineTo(_e1x - perpX * _bWide * 0.3, _e1y - perpY * _bWide * 0.3);
        ctx.quadraticCurveTo(mouthX + fwdX * _bLen * 0.5 - perpX * _bWide * 0.9, mouthY + fwdY * _bLen * 0.5 - perpY * _bWide * 0.9, mouthX, mouthY);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(140,215,255,${_bAlpha * 0.82})`;
        ctx.beginPath(); ctx.moveTo(mouthX, mouthY);
        ctx.quadraticCurveTo(mouthX + fwdX * _bLen * 0.5 + perpX * _bWide * 0.55, mouthY + fwdY * _bLen * 0.5 + perpY * _bWide * 0.55, _e1x + perpX * _bWide * 0.15, _e1y + perpY * _bWide * 0.15);
        ctx.lineTo(_e1x - perpX * _bWide * 0.15, _e1y - perpY * _bWide * 0.15);
        ctx.quadraticCurveTo(mouthX + fwdX * _bLen * 0.5 - perpX * _bWide * 0.55, mouthY + fwdY * _bLen * 0.5 - perpY * _bWide * 0.55, mouthX, mouthY);
        ctx.closePath(); ctx.fill();
        ctx.shadowColor = '#ccf0ff'; ctx.shadowBlur = s * 0.42 * _bAlpha;
        const _ijg = ctx.createLinearGradient(mouthX, mouthY, _e1x, _e1y);
        _ijg.addColorStop(0, `rgba(245,252,255,${_bAlpha * 0.96})`); _ijg.addColorStop(0.5, `rgba(180,235,255,${_bAlpha * 0.84})`); _ijg.addColorStop(1, 'rgba(80,160,255,0)');
        ctx.strokeStyle = _ijg; ctx.lineWidth = s * 0.068; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(mouthX, mouthY); ctx.lineTo(_e1x, _e1y); ctx.stroke();
        ctx.shadowBlur = 0;
        for (let ii = 0; ii < 10; ii++) {
          const _iT = ((_frameNow * 0.003 + ii * 0.10) % 1.0);
          const _iX = mouthX + fwdX * _iT * _bLen, _iY = mouthY + fwdY * _iT * _bLen;
          const _iSpr = Math.sin(ii * 1.7 + bTime * 3) * _bWide * _iT * 0.65;
          const _iSz = s * 0.015 * (1 - _iT * 0.65), _iAlp = (1 - _iT) * _bAlpha * 0.9;
          ctx.fillStyle = `rgba(${Math.floor(200 + _iT * 55)},${Math.floor(228 + _iT * 27)},255,${_iAlp})`;
          ctx.beginPath(); ctx.arc(_iX + perpX * _iSpr, _iY + perpY * _iSpr, _iSz, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  ctx.restore();
  unit._hpBarY = headBaseY - s * 0.30;
}
