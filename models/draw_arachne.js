// ═══════════════════════════════════════════════════════════════════════════
//  ARACHNE — рівень 7, здібність: web (5% шанс павутини на удар)
//  Великий тарантул (Mexican red-knee style):
//    • Темно-коричневе волохате тіло з помаранчевими акцентами на колінах
//    • Дуже ГУСТА ШЕРСТЬ (setae) по всьому тілу і ногах
//    • Компактний округлий абдомен з urticating hairs
//    • Carapace з радіальним "starburst" шерсті
//    • Товсті тричленні ноги (femur→patella→tibia→tarsus)
//    • 8 очей у щільному кластері спереду carapace (tarantula-style)
//    • Великі хеліцери з видимими іклами
//    • Хода: alternating tetrapod (діаг. пара 1-3 ↔ 2-4)
//    • Атака: rear-back → вибуховий forward lunge → fang snap
//    • Web-прок: silk-streams зі spinnerets у бік ворога
// ═══════════════════════════════════════════════════════════════════════════
function drawArachneMonster(unit, camY) {
  const s  = unit.size;
  const cx = unit.x;
  const fY = unit.y - camY;
  const dt = Math.min((_frameNow - (unit._arLastT || _frameNow)) / 1000, 0.05);
  unit._arLastT = _frameNow;

  if (unit._arDir === undefined) {
    unit._arDir = 1; unit._arPrevX = cx;
    unit._arPrevAcd = unit.attackCooldown;
    unit._arT = 0; unit._arAp = 0;
    unit._arWebShotT = 0;
    unit._arSeed = Math.random() * 100;
    unit._arWisps = Array.from({length: 2}, () => ({
      off: (Math.random() - 0.5) * 0.8,
      len: 0.5 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2
    }));
  }
  if (Math.abs(cx - unit._arPrevX) > 0.2)
    unit._arDir = cx > unit._arPrevX ? 1 : -1;
  unit._arPrevX = cx;
  if (unit.state === 'fight') {
    const hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
    if (hero) unit._arDir = hero.x > cx ? 1 : -1;
  }
  const dir = unit._arDir;

  const atkBase = unit.attackCooldownBase || 60;
  const acd     = unit.attackCooldown || 0;
  if (acd > (unit._arPrevAcd || 0) + 3) unit._arAp = 1.0;
  unit._arPrevAcd = acd;
  if (unit.webShotActive) { unit._arWebShotT = 1.0; unit.webShotActive = false; }
  unit._arT += dt;

  const atkDur = Math.min(0.58, atkBase / 60 * 0.75);
  if (unit._arAp > 0)      unit._arAp      = Math.max(0, unit._arAp      - dt / atkDur);
  if (unit._arWebShotT > 0) unit._arWebShotT = Math.max(0, unit._arWebShotT - dt * 1.15);

  const atkActive = unit._arAp > 0;
  const ap        = 1 - unit._arAp;
  const inFight   = unit.state === 'fight' || atkActive;
  const webShot   = unit._arWebShotT > 0;

  const bTime = unit._arT;

  // ── Attack phases (more dramatic: wider wind-up, sharper strike) ──
  const AP_WINDUP = 0.38;          // longer anticipation
  const AP_STRIKE = 0.48;          // quick snap (10% of duration)
  const AP_IMPACT = 0.54;          // brief hold at impact
  let windUpE = 0, strikeE = 0, impactE = 0, recoverE = 0;
  if (atkActive) {
    if (ap < AP_WINDUP) {
      const t = ap / AP_WINDUP;
      windUpE = 1 - Math.pow(1 - t, 2.4);
    } else if (ap < AP_STRIKE) {
      const t = (ap - AP_WINDUP) / (AP_STRIKE - AP_WINDUP);
      strikeE = Math.pow(t, 2.2);
      windUpE = 1 - strikeE;
    } else if (ap < AP_IMPACT) {
      impactE = 1;
      strikeE = 1;
    } else {
      const t = (ap - AP_IMPACT) / (1 - AP_IMPACT);
      recoverE = 1 - Math.pow(1 - t, 2);
      strikeE = 1 - recoverE;
    }
  }
  // BIG body motion: rear back hard during wind-up, explosive forward lunge
  const atkBodyShiftX = -dir * windUpE * s * 0.135          // deep rear-back
                      +  dir * strikeE * s * 0.180          // explosive forward
                      +  dir * impactE * s * 0.180;
  // Crouch down during wind-up (body lowers), rise slightly on strike
  const atkBodyShiftY =  windUpE * s * 0.028
                      -  strikeE * s * 0.012
                      +  impactE * s * 0.010;
  // Body tilts forward into the strike (whole silhouette rotates slightly)
  const atkBodyTilt = -windUpE * 0.08 * dir + strikeE * 0.14 * dir;
  // Fangs SPREAD wide during wind-up, SNAP closed on strike, brief open at impact
  const atkFangOpen = windUpE * 1.25                        // wide spread on wind-up
                    - strikeE * 0.45                         // snap closed
                    + impactE * 0.15;                        // slight reopen
  // Shake vibration during impact (the spider struck!)
  const impactShake = impactE * (Math.sin(bTime * 85) * s * 0.006);

  // ── Walk cycle ───────────────────────────────────────────────────
  const isWalking = unit.state === 'move';
  const walkFreq  = 2.10;
  const walkPhase = isWalking ? ((bTime * walkFreq) % 1) : 0;
  const walkBob   = isWalking ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.010 : 0;
  const walkSway  = isWalking ? Math.sin(walkPhase * Math.PI * 2) * s * 0.005 : 0;

  const breatheY = Math.sin(bTime * 0.9) * s * 0.006;
  const idleSway = Math.sin(bTime * 0.55) * s * 0.005;

  // ── Proportions — classic tarantula silhouette ───────────────────
  // Abdomen sits clearly HIGHER than cephalothorax (bulbous hump in rear)
  const absR     = s * 0.335;         // big round abdomen
  const cephR    = s * 0.175;         // smaller cephalothorax (flatter profile)
  const bodyLineY = fY - s * 0.220 + breatheY + walkBob;

  const bX = cx + walkSway + idleSway + atkBodyShiftX + impactShake;
  const bY = bodyLineY + atkBodyShiftY;
  // Abdomen: higher and behind — creates the distinctive tarantula hump
  const absCX  = bX - dir * s * 0.15;
  const absCY  = bY - s * 0.045;          // raised above body line
  // Cephalothorax: lower and forward, flatter
  const cephCX = bX + dir * s * 0.20;
  const cephCY = bY + s * 0.020;

  // ── TARANTULA COLOR PALETTE (dark brown + orange accents) ────────
  const DARK_BROWN    = '#1a0e06';
  const MID_BROWN     = '#3a1d0c';
  const WARM_BROWN    = '#5a2e14';
  const LIGHT_BROWN   = '#7a4220';
  const ORANGE_ACCENT = '#b85420';   // red-knee orange
  const BRIGHT_ORANGE = '#d86820';
  const YELLOW_ORANGE = '#e88a30';
  const HAIR_DARK     = 'rgba(8,4,2,0.85)';
  const HAIR_MID      = 'rgba(30,16,6,0.75)';
  const HAIR_LIGHT    = 'rgba(100,50,20,0.65)';

  ctx.save();

  // ── Floating silk wisps ──────────────────────────────────────────
  if (!webShot) {
    unit._arWisps.forEach(w => {
      const wx = cx + w.off * s * 0.4 + Math.sin(bTime * 0.5 + w.sway) * s * 0.02;
      const wy = fY - s * 0.35 - w.len * s * 0.3;
      const wyEnd = wy + s * w.len * 0.7;
      ctx.strokeStyle = `rgba(240,240,255,${0.15 + Math.sin(bTime + w.sway) * 0.06})`;
      ctx.lineWidth = s * 0.004;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + Math.sin(bTime * 1.3 + w.sway) * s * 0.025, (wy + wyEnd) / 2, wx, wyEnd);
      ctx.stroke();
    });
  }

  // ── Ground shadow ────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(10,5,0,0.58)';
  ctx.beginPath();
  ctx.ellipse(cx, fY + s * 0.014, s * 0.70, s * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();

  // ═══════════════════════════════════════════════════════════════
  //  LEG DRAWING — thick furry tarantula leg with orange knee patch
  // ═══════════════════════════════════════════════════════════════
  function drawSpiderLeg(idx, side, near) {
    const pairA = (idx % 2) === 0;
    const basePhase = pairA ? 0 : 0.5;
    const legPhase = isWalking ? ((walkPhase + basePhase + (near ? 0 : 0.5)) % 1) : 0;
    let stepFwd = 0, legLift = 0, kneeBendY = 0;
    if (isWalking) {
      if (legPhase < 0.5) {
        const t = legPhase / 0.5;
        stepFwd = (0.5 - t) * s * 0.09 * dir;
        kneeBendY = Math.sin(t * Math.PI) * s * 0.003;
      } else {
        const t = (legPhase - 0.5) / 0.5;
        stepFwd = (-0.5 + t) * s * 0.09 * dir;
        legLift = Math.sin(t * Math.PI) * s * 0.024;
        kneeBendY = Math.sin(t * Math.PI) * s * 0.018;
      }
    }
    // Hip attaches to small cephalothorax, clustered
    const hipLocalX = 0.72 - idx * 0.38;
    const hipX = cephCX + dir * cephR * hipLocalX;
    const hipY = cephCY + (near ? s * 0.008 : -s * 0.012);
    // Feet spread WIDE around whole body (past abdomen rear, past head front)
    // Using absolute s units, not cephR — legs spread based on body size, not ceph
    const footSpread = [
      dir * s * 0.58,            // leg 0: far forward (past head)
      dir * s * 0.22,            // leg 1: mid-forward
      -dir * s * 0.20,           // leg 2: mid-backward
      -dir * s * 0.52            // leg 3: far back (past abdomen)
    ][idx];
    const footBaseX = bX + footSpread;
    const footX = footBaseX + stepFwd;
    const footY = fY - s * 0.008 - legLift;
    // Knees high above body (classic spider silhouette)
    const kneeBaseY = bY - s * (0.22 - Math.abs(idx - 1.5) * 0.022);
    const kneeY = kneeBaseY - kneeBendY;
    // Knee X: slightly outward from midpoint
    const kneeX = (hipX * 0.45 + footX * 0.55);

    // DRAMATIC threat display: front legs raise HIGH during wind-up,
    // slam forward with strike, settle on recover
    let attackLegLift = 0;
    let attackLegFwd = 0;
    if (atkActive) {
      if (idx === 0) {
        // Front leg: rears up high, then lunges
        attackLegLift = windUpE * s * 0.150 - strikeE * s * 0.020;
        attackLegFwd  = -windUpE * s * 0.030 * dir + strikeE * s * 0.080 * dir + impactE * s * 0.080 * dir;
      } else if (idx === 1) {
        attackLegLift = windUpE * s * 0.085 - strikeE * s * 0.010;
        attackLegFwd  = -windUpE * s * 0.015 * dir + strikeE * s * 0.045 * dir + impactE * s * 0.045 * dir;
      }
    }
    const effFootX = footX + attackLegFwd;
    const effFootY = footY - attackLegLift;
    const effKneeY = kneeY - attackLegLift * 0.55;
    const effKneeX = kneeX + attackLegFwd * 0.4;

    const alpha = near ? 1.0 : 0.55;
    const scaleW = near ? 1.0 : 0.85;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';

    // Helper: draw fuzz bristles along a segment
    const drawBristles = (x1, y1, x2, y2, count, maxLen, densityAng) => {
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len, ny = dx / len;
      ctx.strokeStyle = HAIR_DARK;
      ctx.lineWidth = s * 0.004 * scaleW;
      for (let bi = 1; bi <= count; bi++) {
        const t = bi / (count + 1);
        const bx = x1 + dx * t;
        const by = y1 + dy * t;
        // Two sets of bristles on both sides of the segment
        const hlen = maxLen * (0.7 + 0.3 * Math.sin(bi * 2.3 + unit._arSeed));
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + nx * hlen + dx / len * 0.15 * hlen, by + ny * hlen + dy / len * 0.15 * hlen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - nx * hlen * 0.7 + dx / len * 0.15 * hlen, by - ny * hlen * 0.7 + dy / len * 0.15 * hlen);
        ctx.stroke();
      }
    };

    // SEGMENT 1: Femur (thick)
    ctx.strokeStyle = DARK_BROWN;
    ctx.lineWidth = s * 0.048 * scaleW;
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(effKneeX, effKneeY); ctx.stroke();
    ctx.strokeStyle = MID_BROWN;
    ctx.lineWidth = s * 0.030 * scaleW;
    ctx.beginPath(); ctx.moveTo(hipX - s * 0.004, hipY - s * 0.004); ctx.lineTo(effKneeX - s * 0.004, effKneeY - s * 0.004); ctx.stroke();
    ctx.strokeStyle = WARM_BROWN;
    ctx.lineWidth = s * 0.012 * scaleW;
    ctx.beginPath(); ctx.moveTo(hipX - s * 0.008, hipY - s * 0.008); ctx.lineTo(effKneeX - s * 0.008, effKneeY - s * 0.008); ctx.stroke();
    // Dense bristles on femur
    drawBristles(hipX, hipY, effKneeX, effKneeY, 5, s * 0.022);

    // ORANGE KNEE PATCH (Mexican red-knee signature — small, no magical glow)
    ctx.fillStyle = ORANGE_ACCENT;
    ctx.beginPath(); ctx.arc(effKneeX, effKneeY, s * 0.030 * scaleW, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = BRIGHT_ORANGE;
    ctx.beginPath(); ctx.arc(effKneeX - s * 0.004, effKneeY - s * 0.004, s * 0.018 * scaleW, 0, Math.PI * 2); ctx.fill();
    // Subtle fuzz around knee patch (shorter hairs)
    ctx.strokeStyle = 'rgba(150,65,25,0.70)';
    ctx.lineWidth = s * 0.003 * scaleW;
    for (let ki = 0; ki < 6; ki++) {
      const ka = (ki / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(effKneeX + Math.cos(ka) * s * 0.024, effKneeY + Math.sin(ka) * s * 0.024);
      ctx.lineTo(effKneeX + Math.cos(ka) * s * 0.038, effKneeY + Math.sin(ka) * s * 0.038);
      ctx.stroke();
    }

    // SEGMENT 2: Tibia
    ctx.strokeStyle = DARK_BROWN;
    ctx.lineWidth = s * 0.040 * scaleW;
    ctx.beginPath(); ctx.moveTo(effKneeX, effKneeY); ctx.lineTo(effFootX, effFootY); ctx.stroke();
    ctx.strokeStyle = MID_BROWN;
    ctx.lineWidth = s * 0.024 * scaleW;
    ctx.beginPath(); ctx.moveTo(effKneeX - s * 0.003, effKneeY); ctx.lineTo(effFootX - s * 0.003, effFootY); ctx.stroke();
    ctx.strokeStyle = WARM_BROWN;
    ctx.lineWidth = s * 0.010 * scaleW;
    ctx.beginPath(); ctx.moveTo(effKneeX - s * 0.006, effKneeY); ctx.lineTo(effFootX - s * 0.006, effFootY); ctx.stroke();
    // Dense bristles on tibia
    drawBristles(effKneeX, effKneeY, effFootX, effFootY, 4, s * 0.020);

    // SEGMENT 3: Tarsus (foot claw) — small dark tip with tufts
    ctx.fillStyle = DARK_BROWN;
    ctx.beginPath();
    ctx.ellipse(effFootX, effFootY, s * 0.016 * scaleW, s * 0.010 * scaleW, 0, 0, Math.PI * 2); ctx.fill();
    // Claw bristles
    ctx.strokeStyle = HAIR_DARK;
    ctx.lineWidth = s * 0.004 * scaleW;
    for (let ci = 0; ci < 3; ci++) {
      const ca = Math.PI * 0.5 + (ci - 1) * 0.2;
      ctx.beginPath();
      ctx.moveTo(effFootX, effFootY);
      ctx.lineTo(effFootX + Math.cos(ca) * s * 0.016, effFootY + Math.sin(ca) * s * 0.016);
      ctx.stroke();
    }

    // Hip coxa — bulge with fur
    ctx.fillStyle = DARK_BROWN;
    ctx.beginPath(); ctx.arc(hipX, hipY, s * 0.028 * scaleW, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = MID_BROWN;
    ctx.beginPath(); ctx.arc(hipX - s * 0.005, hipY - s * 0.005, s * 0.018 * scaleW, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // ── Far legs (behind body) ───────────────────────────────────────
  for (let i = 0; i < 4; i++) drawSpiderLeg(i, -1, false);

  // ═══════════════════════════════════════════════════════════════
  //  ABDOMEN (opisthosoma) — chunky, very hairy tarantula style
  // ═══════════════════════════════════════════════════════════════
  if (webShot) {
    ctx.shadowColor = '#e0e0ff'; ctx.shadowBlur = s * unit._arWebShotT * 0.35;
  }
  // Outer dark base — NEAR-PERFECT SPHERE (tarantula hallmark)
  ctx.fillStyle = DARK_BROWN;
  ctx.beginPath();
  ctx.arc(absCX, absCY, absR * 1.04, 0, Math.PI * 2); ctx.fill();
  // Mid tone sphere shading (light from above-front)
  const absG = ctx.createRadialGradient(
    absCX - dir * absR * 0.20, absCY - absR * 0.45, 0,
    absCX + dir * absR * 0.10, absCY + absR * 0.20, absR * 1.15
  );
  absG.addColorStop(0, LIGHT_BROWN);
  absG.addColorStop(0.35, WARM_BROWN);
  absG.addColorStop(0.75, MID_BROWN);
  absG.addColorStop(1, DARK_BROWN);
  ctx.fillStyle = absG;
  ctx.beginPath();
  ctx.arc(absCX, absCY, absR * 0.97, 0, Math.PI * 2); ctx.fill();
  // Top highlight (sphere illumination)
  ctx.fillStyle = 'rgba(140,80,40,0.35)';
  ctx.beginPath();
  ctx.ellipse(absCX - dir * absR * 0.18, absCY - absR * 0.42, absR * 0.45, absR * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  // Subtle orange banding around upper abdomen
  ctx.save();
  ctx.translate(absCX, absCY);
  ctx.strokeStyle = 'rgba(8,3,0,0.50)';
  ctx.lineWidth = s * 0.014;
  for (let bi = 0; bi < 2; bi++) {
    ctx.beginPath();
    ctx.ellipse(0, -absR * 0.20 + bi * absR * 0.20, absR * 0.72, absR * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Orange accent patches across upper abdomen (Mexican red-knee pattern)
  ctx.fillStyle = ORANGE_ACCENT;
  [-1, 1].forEach(sd => {
    ctx.beginPath();
    ctx.ellipse(sd * absR * 0.30, -absR * 0.08, absR * 0.08, absR * 0.10, 0, 0, Math.PI * 2); ctx.fill();
  });
  // Bottom shadow (roundness)
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.beginPath();
  ctx.ellipse(0, absR * 0.40, absR * 0.70, absR * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.shadowBlur = 0;

  // DENSE HAIR COAT — radiates uniformly from spherical abdomen
  const hairLayers = [
    { count: 36, rFactor: 1.00, lenMin: 0.024, lenMax: 0.040, color: HAIR_DARK, width: 0.006 },
    { count: 26, rFactor: 0.85, lenMin: 0.020, lenMax: 0.032, color: HAIR_MID, width: 0.005 },
    { count: 18, rFactor: 0.65, lenMin: 0.014, lenMax: 0.022, color: HAIR_LIGHT, width: 0.004 }
  ];
  hairLayers.forEach((layer, li) => {
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = s * layer.width;
    ctx.lineCap = 'round';
    const phaseOffset = li * 0.3;
    for (let hi = 0; hi < layer.count; hi++) {
      const ha = (hi / layer.count) * Math.PI * 2 + phaseOffset;
      const rx = absCX + Math.cos(ha) * absR * layer.rFactor;
      const ry = absCY + Math.sin(ha) * absR * layer.rFactor;
      const hlen = s * (layer.lenMin + (layer.lenMax - layer.lenMin) * ((hi * 17) % 100) / 100);
      const angVar = Math.sin(hi * 3.7 + unit._arSeed) * 0.22;
      const hAng = ha + angVar;
      const h2x = rx + Math.cos(hAng) * hlen + Math.sin(bTime * 0.3 + hi) * s * 0.003;
      const h2y = ry + Math.sin(hAng) * hlen;
      ctx.beginPath();
      ctx.moveTo(rx, ry); ctx.lineTo(h2x, h2y);
      ctx.stroke();
    }
  });

  // Urticating hairs (fuzzy tuft on top of abdomen sphere)
  ctx.strokeStyle = 'rgba(180,90,40,0.85)';
  ctx.lineWidth = s * 0.005;
  for (let ui = 0; ui < 14; ui++) {
    const ux = absCX + (ui - 6.5) * s * 0.010;
    const uy = absCY - absR * 0.90 - Math.sin(ui * 1.3) * s * 0.008;
    const u2x = ux + Math.sin(ui + bTime * 0.5) * s * 0.005;
    const u2y = uy - s * (0.024 + ((ui * 13) % 5) * 0.005);
    ctx.beginPath();
    ctx.moveTo(ux, uy); ctx.lineTo(u2x, u2y);
    ctx.stroke();
  }

  // ── Spinnerets (back-bottom of sphere) ───────────────────────────
  const spinX = absCX - dir * absR * 0.82;
  const spinY = absCY + absR * 0.50;
  ctx.fillStyle = DARK_BROWN;
  ctx.beginPath();
  ctx.ellipse(spinX, spinY, absR * 0.18, absR * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = MID_BROWN;
  ctx.beginPath();
  ctx.ellipse(spinX + dir * s * 0.004, spinY - s * 0.004, absR * 0.12, absR * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  for (let si = 0; si < 4; si++) {
    const sOff = (si - 1.5) * absR * 0.07;
    const sx = spinX + sOff * 0.3;
    const sy = spinY + Math.abs(sOff) * 0.5 + absR * 0.05;
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.moveTo(sx - absR * 0.022, sy - absR * 0.018);
    ctx.lineTo(sx - dir * absR * 0.048, sy + absR * 0.018);
    ctx.lineTo(sx + absR * 0.022, sy - absR * 0.018);
    ctx.closePath(); ctx.fill();
  }
  // Hairs around spinnerets too
  ctx.strokeStyle = HAIR_DARK;
  ctx.lineWidth = s * 0.004;
  for (let si = 0; si < 8; si++) {
    const sa = Math.PI + (si / 7) * Math.PI;
    const sx = spinX + Math.cos(sa) * absR * 0.20;
    const sy = spinY + Math.sin(sa) * absR * 0.16;
    const s2x = sx + Math.cos(sa) * s * 0.014;
    const s2y = sy + Math.sin(sa) * s * 0.014;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(s2x, s2y); ctx.stroke();
  }

  // Idle silk thread
  if (!webShot) {
    const silkAge = (bTime * 0.3) % 1;
    if (silkAge > 0.1) {
      const silkLen = s * (0.25 + silkAge * 0.15);
      const silkEndX = spinX - dir * s * 0.02 + Math.sin(bTime * 0.8) * s * 0.015;
      const silkEndY = spinY + silkLen;
      ctx.strokeStyle = `rgba(235,235,255,${(1 - silkAge) * 0.45})`;
      ctx.lineWidth = s * 0.004;
      ctx.beginPath();
      ctx.moveTo(spinX, spinY + absR * 0.05);
      ctx.quadraticCurveTo(spinX + Math.sin(bTime * 1.5) * s * 0.01, (spinY + silkEndY) / 2, silkEndX, silkEndY);
      ctx.stroke();
    }
  }

  // Silk burst during webShot
  if (webShot) {
    const wt = unit._arWebShotT;
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * wt * 0.40;
    for (let si = 0; si < 5; si++) {
      const sa = -Math.PI * 0.35 + (si - 2) * 0.12;
      const slen = s * (0.4 + (1 - wt) * 0.65);
      const sEndX = spinX + Math.cos(sa) * slen * dir;
      const sEndY = spinY + Math.sin(sa) * slen * 0.75;
      const sMidX = (spinX + sEndX) / 2 + dir * s * 0.05;
      const sMidY = (spinY + sEndY) / 2 - s * 0.15;
      ctx.strokeStyle = `rgba(230,235,255,${wt * 0.82})`;
      ctx.lineWidth = s * 0.008;
      ctx.beginPath();
      ctx.moveTo(spinX, spinY);
      ctx.quadraticCurveTo(sMidX, sMidY, sEndX, sEndY);
      ctx.stroke();
      ctx.fillStyle = `rgba(250,250,255,${wt * 0.90})`;
      ctx.beginPath(); ctx.arc(sEndX, sEndY, s * 0.012 * wt, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = `rgba(250,250,255,${wt * 0.75})`;
    ctx.beginPath(); ctx.arc(spinX, spinY, absR * 0.14 * wt, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Pedicel (thin waist) — mostly hidden by fur ──────────────────
  ctx.fillStyle = DARK_BROWN;
  ctx.beginPath();
  ctx.ellipse((absCX + cephCX) / 2, (absCY + cephCY) / 2 + s * 0.005,
              s * 0.060, s * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();

  // ═══════════════════════════════════════════════════════════════
  //  CEPHALOTHORAX (prosoma) — hairy carapace with starburst pattern
  // ═══════════════════════════════════════════════════════════════
  // Dark base
  ctx.fillStyle = DARK_BROWN;
  ctx.beginPath();
  ctx.ellipse(cephCX, cephCY, cephR * 1.10, cephR * 0.92, 0, 0, Math.PI * 2); ctx.fill();
  // Mid gradient
  const cephG = ctx.createRadialGradient(cephCX - dir * cephR * 0.30, cephCY - cephR * 0.40, 0,
                                          cephCX, cephCY, cephR);
  cephG.addColorStop(0, LIGHT_BROWN);
  cephG.addColorStop(0.45, WARM_BROWN);
  cephG.addColorStop(1, DARK_BROWN);
  ctx.fillStyle = cephG;
  ctx.beginPath();
  ctx.ellipse(cephCX - dir * cephR * 0.05, cephCY - cephR * 0.10, cephR * 0.94, cephR * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  // Carapace central groove (fovea)
  ctx.strokeStyle = 'rgba(5,2,0,0.70)';
  ctx.lineWidth = s * 0.008;
  ctx.beginPath();
  ctx.ellipse(cephCX - dir * cephR * 0.30, cephCY, cephR * 0.05, cephR * 0.10, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;

  // Starburst of hairs radiating outward from center (classic tarantula)
  // Multiple layers of bristles
  const cephHairLayers = [
    { count: 16, rFactor: 1.02, lenMin: 0.018, lenMax: 0.028, color: HAIR_DARK, width: 0.005 },
    { count: 12, rFactor: 0.85, lenMin: 0.014, lenMax: 0.024, color: HAIR_MID, width: 0.004 }
  ];
  cephHairLayers.forEach((layer, li) => {
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = s * layer.width;
    ctx.lineCap = 'round';
    const phaseOffset = li * 0.25;
    for (let hi = 0; hi < layer.count; hi++) {
      const ha = (hi / layer.count) * Math.PI * 2 + phaseOffset;
      // Avoid drawing hairs over the eye cluster (front of carapace)
      const cosHa = Math.cos(ha);
      const isEyeZone = (dir > 0 ? cosHa > 0.5 : cosHa < -0.5) && Math.abs(Math.sin(ha)) < 0.6;
      if (isEyeZone) continue;
      const rx = cephCX + cosHa * cephR * layer.rFactor;
      const ry = cephCY + Math.sin(ha) * cephR * layer.rFactor * 0.85;
      const hlen = s * (layer.lenMin + (layer.lenMax - layer.lenMin) * ((hi * 19) % 100) / 100);
      const angVar = Math.sin(hi * 2.7 + unit._arSeed) * 0.2;
      const hAng = ha + angVar;
      const h2x = rx + Math.cos(hAng) * hlen;
      const h2y = ry + Math.sin(hAng) * hlen * 0.90;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(h2x, h2y);
      ctx.stroke();
    }
  });

  // ── Near legs (in front of body) ─────────────────────────────────
  for (let i = 0; i < 4; i++) drawSpiderLeg(i, 1, true);

  // ═══════════════════════════════════════════════════════════════
  //  CHELICERAE (fangs) — large tarantula-style
  // ═══════════════════════════════════════════════════════════════
  const cheliBaseX = cephCX + dir * cephR * 0.78;
  const cheliBaseY = cephCY + cephR * 0.28;
  [-1, 1].forEach(side => {
    const cheliSpread = atkFangOpen;
    const fBaseX = cheliBaseX + side * cephR * 0.16 * (1 + cheliSpread * 0.3);
    const fBaseY = cheliBaseY;
    const fTipX = fBaseX + dir * s * 0.025 + side * s * (0.030 + cheliSpread * 0.020);
    const fTipY = fBaseY + s * (0.100 + cheliSpread * 0.020);
    // Basal chelicera (bulbous, hairy)
    ctx.fillStyle = DARK_BROWN;
    ctx.beginPath();
    ctx.ellipse(fBaseX, fBaseY + s * 0.015, s * 0.028, s * 0.040, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = MID_BROWN;
    ctx.beginPath();
    ctx.ellipse(fBaseX - dir * s * 0.003, fBaseY + s * 0.010, s * 0.018, s * 0.028, 0, 0, Math.PI * 2); ctx.fill();
    // Bristles on chelicera
    ctx.strokeStyle = HAIR_DARK;
    ctx.lineWidth = s * 0.004;
    for (let bi = 0; bi < 5; bi++) {
      const ba = -Math.PI * 0.5 + (bi - 2) * 0.4;
      const bx = fBaseX + Math.cos(ba) * s * 0.025;
      const by = fBaseY + s * 0.015 + Math.sin(ba) * s * 0.035;
      const b2x = bx + Math.cos(ba) * s * 0.012;
      const b2y = by + Math.sin(ba) * s * 0.012;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(b2x, b2y); ctx.stroke();
    }
    // Fang blade (sharp, dark shiny)
    ctx.fillStyle = '#0a0300';
    ctx.beginPath();
    ctx.moveTo(fBaseX - s * 0.016, fBaseY + s * 0.025);
    ctx.quadraticCurveTo(fBaseX + dir * s * 0.005, fBaseY + s * 0.065, fTipX, fTipY);
    ctx.quadraticCurveTo(fBaseX + dir * s * 0.018, fBaseY + s * 0.055, fBaseX + s * 0.016, fBaseY + s * 0.025);
    ctx.closePath(); ctx.fill();
    // Fang highlight (chitin shine)
    ctx.strokeStyle = '#5a2818';
    ctx.lineWidth = s * 0.004; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fBaseX + s * 0.010, fBaseY + s * 0.028);
    ctx.quadraticCurveTo(fBaseX + dir * s * 0.012, fBaseY + s * 0.058, fTipX - s * 0.004, fTipY - s * 0.012);
    ctx.stroke();
    // Wet sharp tip
    ctx.fillStyle = '#c8a890';
    ctx.beginPath(); ctx.arc(fTipX, fTipY, s * 0.009, 0, Math.PI * 2); ctx.fill();
    // Venom drip during wind-up
    if (windUpE > 0.3) {
      ctx.shadowColor = '#88ff44'; ctx.shadowBlur = s * windUpE * 0.22;
      ctx.fillStyle = `rgba(150,255,100,${windUpE * 0.85})`;
      ctx.beginPath();
      ctx.arc(fTipX, fTipY + s * (0.022 * windUpE), s * 0.010, 0, Math.PI * 2); ctx.fill();
      if (windUpE > 0.6) {
        ctx.fillStyle = `rgba(150,255,100,${(windUpE - 0.6) * 2 * 0.55})`;
        ctx.beginPath();
        ctx.arc(fTipX + side * s * 0.004, fTipY + s * 0.045 * windUpE, s * 0.006, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  });

  // ── IMPACT BURST (when bite lands — flash + sparks + blood droplets) ─
  if (impactE > 0 || (recoverE > 0 && recoverE < 0.25)) {
    const impT = impactE > 0 ? 1 : 1 - recoverE / 0.25;
    // Target: center point between fang tips
    const impX = cheliBaseX + dir * s * 0.025;
    const impY = cheliBaseY + s * 0.110;
    // Flash
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = s * impT * 0.42;
    const fg = ctx.createRadialGradient(impX, impY, 0, impX, impY, s * 0.085);
    fg.addColorStop(0, `rgba(255,230,160,${impT * 0.85})`);
    fg.addColorStop(0.5, `rgba(255,100,30,${impT * 0.55})`);
    fg.addColorStop(1, 'rgba(150,20,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(impX, impY, s * 0.085, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Sparks radiating from bite point
    ctx.strokeStyle = `rgba(255,180,80,${impT * 0.80})`;
    ctx.lineWidth = s * 0.007;
    ctx.lineCap = 'round';
    for (let ri = 0; ri < 8; ri++) {
      const ra = (ri / 8) * Math.PI * 2;
      const r1 = s * (0.035 + (1 - impT) * 0.040);
      const r2 = s * (0.080 + (1 - impT) * 0.080);
      ctx.beginPath();
      ctx.moveTo(impX + Math.cos(ra) * r1, impY + Math.sin(ra) * r1);
      ctx.lineTo(impX + Math.cos(ra) * r2, impY + Math.sin(ra) * r2);
      ctx.stroke();
    }
    // Venom/blood droplets splashing outward
    ctx.fillStyle = `rgba(130,220,80,${impT * 0.82})`;
    for (let pi = 0; pi < 5; pi++) {
      const pa = -Math.PI * 0.75 + (pi / 4) * Math.PI * 0.50;
      const pd = s * (0.070 + (1 - impT) * 0.080);
      const px = impX + Math.cos(pa) * pd;
      const py = impY + Math.sin(pa) * pd + (1 - impT) * s * 0.05;  // gravity
      ctx.beginPath();
      ctx.ellipse(px, py, s * 0.010 * impT, s * 0.015 * impT, pa, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Pedipalps (sensory arms) ─────────────────────────────────────
  [-1, 1].forEach(side => {
    const pBaseX = cephCX + dir * cephR * 0.62;
    const pBaseY = cephCY + cephR * 0.32;
    const twitch = atkActive ? 0 : Math.sin(bTime * 3.5 + side) * s * 0.008;
    const pMidX = pBaseX + dir * s * 0.035 + side * s * 0.005;
    const pMidY = pBaseY - s * 0.008 + twitch;
    const pEndX = pMidX + dir * s * 0.035 + side * s * 0.010;
    const pEndY = pMidY + s * 0.042;
    ctx.strokeStyle = DARK_BROWN; ctx.lineWidth = s * 0.024; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pBaseX, pBaseY); ctx.lineTo(pMidX, pMidY); ctx.lineTo(pEndX, pEndY); ctx.stroke();
    ctx.strokeStyle = WARM_BROWN; ctx.lineWidth = s * 0.012;
    ctx.beginPath(); ctx.moveTo(pBaseX, pBaseY); ctx.lineTo(pMidX, pMidY); ctx.lineTo(pEndX, pEndY); ctx.stroke();
    // Hairs on pedipalps
    ctx.strokeStyle = HAIR_DARK; ctx.lineWidth = s * 0.003;
    for (let pi = 0; pi < 3; pi++) {
      const t = (pi + 1) / 4;
      const px = pBaseX * (1 - t) + pEndX * t;
      const py = pBaseY * (1 - t) + pEndY * t;
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(px + side * s * 0.010, py + s * 0.008);
      ctx.stroke();
    }
    // Pedipalp club tip (palpal organ)
    ctx.fillStyle = '#1a0a02';
    ctx.beginPath(); ctx.arc(pEndX, pEndY, s * 0.014, 0, Math.PI * 2); ctx.fill();
  });

  // ═══════════════════════════════════════════════════════════════
  //  EYES — 8 eyes in TIGHT cluster at front of carapace (tarantula)
  // ═══════════════════════════════════════════════════════════════
  // Tarantulas have small, tightly clustered eyes (mostly for light sensing)
  const eyeGlow = inFight ? 0.95 : 0.60 + Math.sin(bTime * 2.0) * 0.22;
  ctx.shadowColor = '#ff3300'; ctx.shadowBlur = s * eyeGlow * 0.20;

  // All eyes clustered in a small area at very front-top of carapace
  const eyeClusterX = cephCX + dir * cephR * 0.75;
  const eyeClusterY = cephCY - cephR * 0.25;
  // 8 eyes in 2 tight rows, much smaller than before
  const eyes = [
    // Anterior row (4 eyes: AMEs in middle bigger, ALEs on sides)
    { dx: -0.12, dy:  0.00, r: 0.055, primary: true },   // AME left
    { dx:  0.04, dy:  0.00, r: 0.055, primary: true },   // AME right
    { dx: -0.22, dy:  0.02, r: 0.040 },                  // ALE left
    { dx:  0.14, dy:  0.02, r: 0.040 },                  // ALE right
    // Posterior row (4 smaller)
    { dx: -0.14, dy: -0.07, r: 0.035 },                  // PME left
    { dx:  0.06, dy: -0.07, r: 0.035 },                  // PME right
    { dx: -0.22, dy: -0.06, r: 0.030 },                  // PLE left
    { dx:  0.14, dy: -0.06, r: 0.030 }                   // PLE right
  ];
  eyes.forEach(ed => {
    const ex = eyeClusterX + dir * cephR * ed.dx;
    const ey = eyeClusterY + cephR * ed.dy;
    const er = cephR * ed.r;
    // Socket (very dark)
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(ex, ey, er * 1.25, 0, Math.PI * 2); ctx.fill();
    // Iris — bright red/orange glow
    ctx.fillStyle = inFight ? '#ee3300' : '#991200';
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
    // Shine
    if (ed.primary) {
      ctx.fillStyle = `rgba(255,200,140,${0.80 + eyeGlow * 0.15})`;
      ctx.beginPath();
      ctx.arc(ex - er * 0.28, ey - er * 0.28, er * 0.35, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = `rgba(255,180,120,${0.60 + eyeGlow * 0.20})`;
      ctx.beginPath();
      ctx.arc(ex - er * 0.25, ey - er * 0.25, er * 0.28, 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.shadowBlur = 0;

  // ── Branch visuals ────────────────────────────────────────────────
  const _arBranch = unit._branch || '';
  if (_arBranch === 'A') {
    // Poison: green-coated fangs + toxic cloud + venom drips + ground puddle
    const _t = unit._arT;

    // Toxic mist cloud around body
    ctx.shadowColor = '#44ff22'; ctx.shadowBlur = s * 0.18;
    ctx.fillStyle = `rgba(40,160,20,${0.10 + Math.sin(_t * 1.5) * 0.04})`;
    ctx.beginPath(); ctx.ellipse(bX, bY, absR * 1.48, absR * 1.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Green venom coating on fangs (drawn over the base fang geometry)
    [-1, 1].forEach((side, fi) => {
      const _chBX  = cephCX + dir * cephR * 0.78;
      const _chBY  = cephCY + cephR * 0.28;
      const _fBX   = _chBX + side * cephR * 0.16;
      const _fBY   = _chBY;
      const _fTipX = _fBX + dir * s * 0.025 + side * s * 0.030;
      const _fTipY = _fBY + s * 0.100;
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.shadowColor = '#88ff44'; ctx.shadowBlur = s * 0.08;
      ctx.fillStyle = '#44ff22';
      ctx.beginPath();
      ctx.moveTo(_fBX - s*0.016, _fBY + s*0.025);
      ctx.quadraticCurveTo(_fBX + dir*s*0.005, _fBY + s*0.065, _fTipX, _fTipY);
      ctx.quadraticCurveTo(_fBX + dir*s*0.018, _fBY + s*0.055, _fBX + s*0.016, _fBY + s*0.025);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.restore();

      // Persistent venom drips from tip (3 drops per fang, staggered)
      for (let di = 0; di < 3; di++) {
        const _dPhase = (_t * 0.65 + di * 0.33 + fi * 0.17) % 1.0;
        const _dAlpha = Math.sin(_dPhase * Math.PI) * 0.85;
        const _dR     = s * (0.008 + _dPhase * 0.006);
        ctx.shadowColor = '#88ff44'; ctx.shadowBlur = s * 0.10;
        ctx.fillStyle = `rgba(90,225,55,${_dAlpha})`;
        ctx.beginPath();
        ctx.arc(_fTipX, _fTipY + _dPhase * s * 0.14, _dR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    // Ground venom puddle
    const _pu2 = 0.38 + Math.sin(_t * 2.1) * 0.12;
    ctx.fillStyle = `rgba(50,180,30,${_pu2 * 0.32})`;
    ctx.beginPath(); ctx.ellipse(cx, fY + s * 0.006, s * 0.34, s * 0.056, 0, 0, Math.PI * 2); ctx.fill();

  } else if (_arBranch === 'B') {
    // Giant: web territory — strands + dome + radial threads + spokes
    const _t = unit._arT;

    // 4 web strands from spinnerets anchoring outward
    ctx.lineWidth = s * 0.007;
    for (let wi = 0; wi < 4; wi++) {
      const _wFrac = wi / 3;
      const _wAng  = Math.PI * 0.32 + _wFrac * Math.PI * 0.58;
      const _wLen  = s * (0.48 + wi * 0.08);
      const _wEndX = spinX - dir * Math.cos(_wAng) * _wLen;
      const _wEndY = spinY + Math.sin(_wAng) * _wLen;
      const _wMidX = (spinX + _wEndX) / 2 + dir * s * 0.04 + Math.sin(_t * 0.5 + wi) * s * 0.015;
      const _wMidY = (spinY + _wEndY) / 2 + s * 0.04;
      ctx.strokeStyle = `rgba(220,225,255,${0.28 + _wFrac * 0.08})`;
      ctx.beginPath(); ctx.moveTo(spinX, spinY); ctx.quadraticCurveTo(_wMidX, _wMidY, _wEndX, _wEndY); ctx.stroke();
      ctx.fillStyle = 'rgba(200,210,255,0.45)';
      ctx.beginPath(); ctx.arc(_wEndX, _wEndY, s * 0.012, 0, Math.PI * 2); ctx.fill();
    }
    // Web dome (upper half)
    ctx.setLineDash([s * 0.022, s * 0.026]);
    ctx.strokeStyle = `rgba(215,220,255,${0.26 + Math.sin(_t * 1.2) * 0.07})`;
    ctx.lineWidth = s * 0.005;
    ctx.beginPath(); ctx.ellipse(bX, bY - absR * 0.28, absR * 1.55, absR * 0.62, 0, Math.PI, Math.PI * 2); ctx.stroke();
    // Horizontal cross-threads inside dome
    ctx.strokeStyle = 'rgba(205,212,255,0.20)';
    ctx.lineWidth = s * 0.004;
    for (let ti = 0; ti < 4; ti++) {
      const _tY = bY - absR * (0.06 + ti * 0.23);
      const _tW = absR * (1.45 - ti * 0.20);
      ctx.beginPath(); ctx.moveTo(bX - _tW, _tY); ctx.lineTo(bX + _tW, _tY); ctx.stroke();
    }
    // Radial spokes from dome apex
    for (let ri = 0; ri < 5; ri++) {
      const _rA = Math.PI * 1.05 + (ri / 4) * Math.PI * 0.90;
      ctx.beginPath();
      ctx.moveTo(bX, bY - absR * 0.28);
      ctx.lineTo(bX + Math.cos(_rA) * absR * 1.52, bY - absR * 0.28 + Math.sin(_rA) * absR * 0.62);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  ctx.restore();
  unit._hpBarY = absCY - absR * 1.05 - s * 0.05;
}
