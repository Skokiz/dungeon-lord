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
  const fightReady = unit.state === 'fight' && !atkActive ? 0.42 : 0;
  const atkFangOpen = fightReady                            // persistent threat pose between bites
                    + windUpE * 1.25                        // wide spread on wind-up
                    - strikeE * 0.45                         // snap closed
                    + impactE * 0.15;                        // slight reopen
  // Shake vibration during impact (the spider struck!)
  const impactShake = impactE * (Math.sin(bTime * 85) * s * 0.006);

  // ── Walk cycle ───────────────────────────────────────────────────
  const isWalking = unit.state === 'move';
  const walkFreq  = 2.10;
  const walkPhase = isWalking ? ((bTime * walkFreq) % 1) : 0;
  // Амплітуди підняті ~×4: попередні значення (0.006-0.010s) при ігровому s=34 давали
  // 0.2-1.5px — тобто idle був візуально мертвий, а move не відрізнявся від idle.
  const walkBob   = isWalking ? (1 - Math.abs(Math.sin(walkPhase * Math.PI * 2))) * s * 0.032 : 0;
  const walkSway  = isWalking ? Math.sin(walkPhase * Math.PI * 2) * s * 0.020 : 0;

  const breatheY = Math.sin(bTime * 0.9) * s * 0.022;
  const idleSway = Math.sin(bTime * 0.55) * s * 0.016;

  // ── Proportions — classic tarantula silhouette ───────────────────
  // Abdomen sits clearly HIGHER than cephalothorax (bulbous hump in rear)
  // Габарит павука тримають НОГИ, а не тіло. Роздуте черевце (0.47s) ковтало ноги —
  // силует читався як гарбуз із паличками. Тіло компактне, тулуб піднятий над підлогою,
  // ноги широко розкинуті (див. footSpread) з високими колінами = впізнаваний павук.
  const _arVisualBranch = unit._branch || '';
  const absR     = s * (_arVisualBranch === 'B' ? 0.365 : 0.325);
  const cephR    = s * (_arVisualBranch === 'A' ? 0.200 : (_arVisualBranch === 'B' ? 0.205 : 0.185));
  // Тулуб піднято вище (0.400 → 0.560): павук стоїть НА ногах, а не лежить між ними.
  // Дає вертикальну масу — раніше при s=52 висота була 42px проти 51-98 в решти моделей.
  const bodyLineY = fY - s * 0.560 + breatheY + walkBob;

  const bX = cx + walkSway + idleSway + atkBodyShiftX + impactShake;
  const bY = bodyLineY + atkBodyShiftY;
  // Abdomen: higher and behind — creates the distinctive tarantula hump
  const absCX  = bX - dir * s * 0.15;
  const absCY  = bY - s * 0.045;          // raised above body line
  // Cephalothorax: lower and forward, flatter
  // The head must lead the bite rather than ride passively with the abdomen.
  // A small permanent threat lean keeps fight readable between cooldown pulses;
  // the strike adds a sharp head-only jab on top of the whole-body lunge.
  const fightHeadLean = inFight ? dir * s * 0.025 : 0;
  const attackHeadReach = dir * s * (-windUpE * 0.035 + strikeE * 0.075 + impactE * 0.025);
  const cephCX = bX + dir * s * 0.20 + fightHeadLean + attackHeadReach;
  const cephCY = bY + s * 0.020;

  // ── TARANTULA COLOR PALETTE (dark brown + orange accents) ────────
  // Тони підняті: на темній підлозі павучиха читалась як бура грудка, а ноги зникали.
  // Зберігаємо «мексиканську червоноколінку», але з робочим контрастом до фону.
  let DARK_BROWN    = '#2e1a0e';
  let MID_BROWN     = '#5c2f16';
  let WARM_BROWN    = '#834526';
  let LIGHT_BROWN   = '#a86034';
  let ORANGE_ACCENT = '#d2661f';   // red-knee orange
  let BRIGHT_ORANGE = '#ef7f22';
  let YELLOW_ORANGE = '#ffa23c';
  let HAIR_DARK     = 'rgba(20,10,4,0.85)';
  let HAIR_MID      = 'rgba(58,32,14,0.75)';
  let HAIR_LIGHT    = 'rgba(140,76,34,0.65)';

  // ── ГІЛКОВІ ПАЛІТРИ ──────────────────────────────────────────────
  // Раніше гілки додавали лише свічення поверх однакового тіла, тож у бою були
  // нерозрізнимі. Тепер гілка перефарбовує САМЕ ТІЛО (як каже дерево еволюцій):
  // A «Отруйна» — трупно-зелений хітин; B «Велетенська» — темний вугільний панцир.
  if (unit._branch === 'A') {
    DARK_BROWN    = '#15250c';
    MID_BROWN     = '#2f5417';
    WARM_BROWN    = '#498020';
    LIGHT_BROWN   = '#66a62c';
    ORANGE_ACCENT = '#8fd12a';       // отруйно-салатовий замість помаранчевого
    BRIGHT_ORANGE = '#aee63a';
    YELLOW_ORANGE = '#d6ff5e';
    HAIR_DARK     = 'rgba(8,20,4,0.85)';
    HAIR_MID      = 'rgba(30,58,14,0.75)';
    HAIR_LIGHT    = 'rgba(96,150,40,0.65)';
  } else if (unit._branch === 'B') {
    DARK_BROWN    = '#14131c';
    MID_BROWN     = '#2b2a3a';
    WARM_BROWN    = '#454458';
    LIGHT_BROWN   = '#5f5e76';
    ORANGE_ACCENT = '#8c6bd8';       // холодний аметистовий акцент на «колінах»
    BRIGHT_ORANGE = '#a684ef';
    YELLOW_ORANGE = '#c7aaff';
    HAIR_DARK     = 'rgba(6,6,12,0.85)';
    HAIR_MID      = 'rgba(30,28,44,0.75)';
    HAIR_LIGHT    = 'rgba(96,92,126,0.65)';
  }

  // Карапакс (головогруди) — СВІТЛІШИЙ за черевце. Раніше обидві маси малювались одним
  // градієнтом, тож павук читався як одна бура грудка без голови. У тарантулів карапакс
  // і справді світліший — це і анатомічно, і композиційно правильно.
  const CARA_LIT = unit._branch === 'A' ? '#9fdc4a'
                 : unit._branch === 'B' ? '#8a88a6'
                 : '#d18a4e';
  const CARA_MID = unit._branch === 'A' ? '#6aa82c'
                 : unit._branch === 'B' ? '#5c5a74'
                 : '#a25b2c';
  // Ці відтінки раніше були захардкоджені теплими й ПЕРЕЖИВАЛИ перефарбування гілки —
  // на зеленому й сірому тілі лишались помаранчеві шпичаки та бурі плями.
  const TINT_SOFT = unit._branch === 'A' ? 'rgba(96,150,40,0.35)'
                  : unit._branch === 'B' ? 'rgba(92,90,124,0.35)'
                  : 'rgba(140,80,40,0.35)';
  const TINT_LINE = unit._branch === 'A' ? 'rgba(120,190,45,0.70)'
                  : unit._branch === 'B' ? 'rgba(120,112,160,0.70)'
                  : 'rgba(150,65,25,0.70)';
  const TINT_EDGE = unit._branch === 'A' ? 'rgba(150,225,60,0.85)'
                  : unit._branch === 'B' ? 'rgba(150,138,205,0.85)'
                  : 'rgba(180,90,40,0.85)';
  const FANG_DARK = unit._branch === 'A' ? '#1d3a10'
                  : unit._branch === 'B' ? '#20202e'
                  : '#5a2818';
  const FANG_LIT  = unit._branch === 'A' ? '#d8f0a0'
                  : unit._branch === 'B' ? '#cfcbe4'
                  : '#c8a890';

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
      // Крок і підйом лапи підняті ~×3: було ±1.5px і 0.8px при ігровому s=34 — хода
      // візуально не існувала. Тепер видно, що павук переставляє ноги.
      if (legPhase < 0.5) {
        const t = legPhase / 0.5;
        stepFwd = (0.5 - t) * s * 0.28 * dir;
        kneeBendY = Math.sin(t * Math.PI) * s * 0.010;
      } else {
        const t = (legPhase - 0.5) / 0.5;
        stepFwd = (-0.5 + t) * s * 0.28 * dir;
        legLift = Math.sin(t * Math.PI) * s * 0.105;
        kneeBendY = Math.sin(t * Math.PI) * s * 0.055;
      }
    }
    // Hip attaches to small cephalothorax, clustered
    const hipLocalX = 0.72 - idx * 0.38;
    const hipX = cephCX + dir * cephR * hipLocalX;
    const hipY = cephCY + (near ? s * 0.008 : -s * 0.012);
    // Feet spread WIDE around whole body (past abdomen rear, past head front)
    // Using absolute s units, not cephR — legs spread based on body size, not ceph
    // Розмах ніг — головна впізнавана риса павука. Розширено майже вдвічі:
    // ступні виходять далеко за габарит тіла в обидва боки.
    const footSpread = [
      dir * s * 0.95,            // leg 0: far forward (past head)
      dir * s * 0.45,            // leg 1: mid-forward
      -dir * s * 0.40,           // leg 2: mid-backward
      -dir * s * 0.88            // leg 3: far back (past abdomen)
    ][idx];
    const footBaseX = bX + footSpread;
    const footX = footBaseX + stepFwd;
    const footY = fY - s * 0.008 - legLift;
    // Коліна мають бути ВИЩЕ за верх черевця (bY - absR ≈ bY - 0.325s), інакше стегна
    // задніх ніг малюються НАСКРІЗЬ через черевце і павук читається як куля з палицями.
    const kneeBaseY = bY - s * (0.58 - Math.abs(idx - 1.5) * 0.045);
    const kneeY = kneeBaseY - kneeBendY;
    // Коліно винесене НАЗОВНІ (ближче до ступні), щоб дуга ноги обходила тіло збоку,
    // а не перетинала його. Далекі ноги ще й зсунуті по X — тоді читається 8 ніг, не 4.
    const kneeX = (hipX * 0.20 + footX * 0.80) + (near ? dir * s * 0.02 : -dir * s * 0.05);

    // DRAMATIC threat display: front legs raise HIGH during wind-up,
    // slam forward with strike, settle on recover
    let attackLegLift = 0;
    let attackLegFwd = 0;
    if (atkActive) {
      if (idx === 0) {
        // Front leg: rears up high, then lunges
        attackLegLift = windUpE * s * 0.150 - strikeE * s * 0.020;
        attackLegFwd  = -windUpE * s * 0.045 * dir + strikeE * s * 0.145 * dir + impactE * s * 0.055 * dir;
      } else if (idx === 1) {
        attackLegLift = windUpE * s * 0.085 - strikeE * s * 0.010;
        attackLegFwd  = -windUpE * s * 0.030 * dir + strikeE * s * 0.105 * dir + impactE * s * 0.040 * dir;
      }
    }
    // Even between cooldown pulses the combat stance must not collapse back to idle:
    // the foremost pair frames the mouth and makes the bite direction readable.
    if (fightReady > 0) {
      if (idx === 0) {
        attackLegLift += fightReady * s * 0.115;
        attackLegFwd  += fightReady * s * 0.155 * dir;
      } else if (idx === 1) {
        attackLegLift += fightReady * s * 0.060;
        attackLegFwd  += fightReady * s * 0.105 * dir;
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

    // Helper: draw fuzz bristles along a segment.
    // На ігровому розмірі щетина невидима, а на макро її рівномірні насічки читались як
    // «вузли бамбука». Тому: малюємо лише при s>=60 і з нерівномірним кроком.
    const drawBristles = (x1, y1, x2, y2, count, maxLen, densityAng) => {
      if (s < 120) return;   // поріг піднято: на середніх розмірах насічки читались як «зарубки»
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len, ny = dx / len;
      ctx.strokeStyle = HAIR_DARK;
      ctx.lineWidth = s * 0.004 * scaleW;
      for (let bi = 1; bi <= count; bi++) {
        // нерівномірний крок — щетина не вишиковується в регулярні «вузли»
        const t = (bi + 0.35 * Math.sin(bi * 1.7 + unit._arSeed)) / (count + 1);
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

    // SEGMENT 1: Femur — КОНУСОМ (товсте біля тіла → тонше до коліна).
    // Рівні по всій довжині сегменти читались як бамбукові жердини; конус дає органіку.
    // Малюємо заливкою-трапецією замість stroke, щоб ширина спадала вздовж кістки.
    {
      const _fdx = effKneeX - hipX, _fdy = effKneeY - hipY;
      const _fl = Math.hypot(_fdx, _fdy) || 1;
      const _fnx = -_fdy / _fl, _fny = _fdx / _fl;
      const _w0 = s * 0.070 * scaleW, _w1 = s * 0.040 * scaleW;   // база → коліно
      ctx.fillStyle = DARK_BROWN;
      ctx.beginPath();
      ctx.moveTo(hipX + _fnx * _w0 * 0.5, hipY + _fny * _w0 * 0.5);
      ctx.lineTo(effKneeX + _fnx * _w1 * 0.5, effKneeY + _fny * _w1 * 0.5);
      ctx.lineTo(effKneeX - _fnx * _w1 * 0.5, effKneeY - _fny * _w1 * 0.5);
      ctx.lineTo(hipX - _fnx * _w0 * 0.5, hipY - _fny * _w0 * 0.5);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = MID_BROWN;
    ctx.lineWidth = s * 0.042 * scaleW;
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
    ctx.strokeStyle = TINT_LINE;
    ctx.lineWidth = s * 0.003 * scaleW;
    for (let ki = 0; ki < 6; ki++) {
      const ka = (ki / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(effKneeX + Math.cos(ka) * s * 0.024, effKneeY + Math.sin(ka) * s * 0.024);
      ctx.lineTo(effKneeX + Math.cos(ka) * s * 0.038, effKneeY + Math.sin(ka) * s * 0.038);
      ctx.stroke();
    }

    // SEGMENT 2: Tibia — теж КОНУСОМ, від коліна до пазура (0.040 → 0.018s).
    // Разом зі стегном дає безперервне звуження ноги від тіла до кінчика.
    {
      const _tdx = effFootX - effKneeX, _tdy = effFootY - effKneeY;
      const _tl = Math.hypot(_tdx, _tdy) || 1;
      const _tnx = -_tdy / _tl, _tny = _tdx / _tl;
      const _t0 = s * 0.040 * scaleW, _t1 = s * 0.018 * scaleW;
      ctx.fillStyle = DARK_BROWN;
      ctx.beginPath();
      ctx.moveTo(effKneeX + _tnx * _t0 * 0.5, effKneeY + _tny * _t0 * 0.5);
      ctx.lineTo(effFootX + _tnx * _t1 * 0.5, effFootY + _tny * _t1 * 0.5);
      ctx.lineTo(effFootX - _tnx * _t1 * 0.5, effFootY - _tny * _t1 * 0.5);
      ctx.lineTo(effKneeX - _tnx * _t0 * 0.5, effKneeY - _tny * _t0 * 0.5);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = MID_BROWN;
    ctx.lineWidth = s * 0.026 * scaleW;
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
  // ЗАДНІ ближні ноги (idx 2,3) малюємо ТУТ — тобто ПЕРЕД черевцем, щоб воно їх
  // перекривало. Їхні стегна йдуть від кластера біля голови назад і різали черевце
  // діагональними трубами через усю кулю. Z-order прибирає це без зміни геометрії.
  drawSpiderLeg(2, 1, true);
  drawSpiderLeg(3, 1, true);

  // Branch B: a real jointed knockback tail, rooted behind the abdomen.
  // The evolution tree explicitly grants a tail strike; showing the weapon in the
  // silhouette makes the branch readable before any VFX or colour is noticed.
  if (_arVisualBranch === 'B') {
    const tailRootX = absCX - dir * absR * 0.58;
    const tailRootY = absCY - absR * 0.05;
    const tailMidX  = tailRootX - dir * s * 0.38;
    const tailMidY  = tailRootY - s * 0.59 - Math.sin(bTime * 1.4) * s * 0.018;
    const tailTipX  = tailRootX + dir * s * (0.08 + (inFight ? 0.14 : 0));
    const tailTipY  = tailRootY - s * (0.43 + (inFight ? 0.04 : 0));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0b0912'; ctx.lineWidth = s * 0.115;
    ctx.beginPath(); ctx.moveTo(tailRootX,tailRootY);
    ctx.quadraticCurveTo(tailMidX,tailMidY,tailTipX,tailTipY); ctx.stroke();
    ctx.strokeStyle = '#4b4663'; ctx.lineWidth = s * 0.078;
    ctx.beginPath(); ctx.moveTo(tailRootX,tailRootY);
    ctx.quadraticCurveTo(tailMidX,tailMidY,tailTipX,tailTipY); ctx.stroke();
    ctx.strokeStyle = 'rgba(196,170,255,0.62)'; ctx.lineWidth = s * 0.020;
    ctx.beginPath(); ctx.moveTo(tailRootX - dir*s*0.01,tailRootY-s*0.018);
    ctx.quadraticCurveTo(tailMidX,tailMidY-s*0.02,tailTipX,tailTipY); ctx.stroke();
    ctx.fillStyle = '#171321';
    ctx.beginPath();
    ctx.moveTo(tailTipX,tailTipY-s*0.13);
    ctx.lineTo(tailTipX-dir*s*0.095,tailTipY+s*0.035);
    ctx.lineTo(tailTipX+dir*s*0.075,tailTipY+s*0.045);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(210,188,255,0.70)'; ctx.lineWidth=s*0.012; ctx.stroke();
  }

  // ═══════════════════════════════════════════════════════════════
  //  ABDOMEN (opisthosoma) — chunky, very hairy tarantula style
  // ═══════════════════════════════════════════════════════════════
  // NB: тінь-німб НЕ вішаємо на заливку черевця — вона обводила світлом усе тіло,
  // і при ігровому розмірі павук перетворювався на світлу пляму. Свічення web-прока
  // тепер живе тільки на самих нитках шовку (нижче, у блоці webShot).
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
  ctx.fillStyle = TINT_SOFT;
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
  // Orange accent patches across upper abdomen (Mexican red-knee pattern).
  // Була симетрична ПАРА овалів — читалась як друга пара очей / обличчя на спині.
  // Тепер це асиметричний ряд із 3 плям різного розміру = візерунок, а не «морда».
  ctx.fillStyle = ORANGE_ACCENT;
  [[-0.38, -0.14, 0.075], [0.02, -0.05, 0.055], [0.40, -0.18, 0.065]].forEach(([px, py, pr]) => {
    ctx.beginPath();
    ctx.ellipse(px * absR, py * absR, absR * pr, absR * (pr * 1.15), 0, 0, Math.PI * 2); ctx.fill();
  });
  // Bottom shadow (roundness)
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.beginPath();
  ctx.ellipse(0, absR * 0.40, absR * 0.70, absR * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.shadowBlur = 0;

  // Branch A: three rooted venom barbs alter the dorsal silhouette. They grow out
  // of the chitin and share its value ramp, so this reads as a mutation, not VFX.
  if (_arVisualBranch === 'A') {
    const barbData = [[-0.52,0.17],[-0.05,0.24],[0.38,0.15]];
    barbData.forEach(([ox,bh], i) => {
      const bx = absCX + dir * absR * ox;
      const by = absCY - Math.sqrt(Math.max(0,absR*absR-(bx-absCX)*(bx-absCX))) * 0.90;
      ctx.fillStyle = i === 1 ? '#aee63a' : '#5f9d22';
      ctx.beginPath();
      ctx.moveTo(bx-s*0.045,by+s*0.020);
      ctx.quadraticCurveTo(bx-s*0.010,by-s*bh*0.55,bx+dir*s*0.030,by-s*bh);
      ctx.quadraticCurveTo(bx+s*0.035,by-s*bh*0.38,bx+s*0.048,by+s*0.020);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(210,255,110,0.62)'; ctx.lineWidth=s*0.008; ctx.stroke();
    });
  }

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
  ctx.strokeStyle = TINT_EDGE;
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
    // Шовк ПЕРЕКИДАЄТЬСЯ через павука і летить ДАЛЕКО ВПЕРЕД, до цілі.
    // Раніше нитки стартували ззаду черевця з довжиною ≤1.05s і закінчувались білими
    // крапками ПРЯМО НА ТІЛІ — читалось як подряпини по кулі, а не як постріл павутиною.
    // Тепер: старт зі спінеретів, висока дуга над тілом, кінець за габаритом (≥1.7s),
    // товщина збільшена — щоб прок було видно й на ігровому розмірі s≈34.
    const wt = unit._arWebShotT;
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = s * wt * 0.30;
    const _reach = s * (1.05 + (1 - wt) * 0.85);          // летить далі з часом
    for (let si = 0; si < 4; si++) {
      const _spread = (si - 1.5) * s * 0.075;
      const _eX = bX + dir * _reach;
      const _eY = bY + s * 0.10 + _spread * 0.8;
      const _mX = bX + dir * _reach * 0.42;
      const _mY = bY - s * 0.62 + _spread;                // дуга ВИСОКО над тілом
      ctx.strokeStyle = `rgba(230,235,255,${wt * 0.80})`;
      ctx.lineWidth = s * 0.018;                          // товще → видно на s=34
      ctx.lineCap = 'round';
      // Починаємо дугу не від самих спінеретів, а на ~30% шляху до вершини — інакше
      // хвіст нитки лягає яскравим штрихом ПОВЕРХ черевця.
      const _sX = spinX + (_mX - spinX) * 0.30;
      const _sY = spinY + (_mY - spinY) * 0.30;
      ctx.beginPath();
      ctx.moveTo(_sX, _sY);
      ctx.quadraticCurveTo(_mX, _mY, _eX, _eY);
      ctx.stroke();
      ctx.fillStyle = `rgba(250,250,255,${wt * 0.85})`;
      ctx.beginPath(); ctx.arc(_eX, _eY, s * 0.026 * wt, 0, Math.PI * 2); ctx.fill();
    }
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
  cephG.addColorStop(0, CARA_LIT);
  cephG.addColorStop(0.45, CARA_MID);
  cephG.addColorStop(1, MID_BROWN);
  ctx.fillStyle = cephG;
  ctx.beginPath();
  ctx.ellipse(cephCX - dir * cephR * 0.05, cephCY - cephR * 0.10, cephR * 0.94, cephR * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  // Темна межа навколо карапакса — відрізає голову від черевця, щоб дві маси не зливались
  ctx.strokeStyle = 'rgba(6,3,0,0.75)';
  ctx.lineWidth = s * 0.014;
  ctx.beginPath();
  ctx.ellipse(cephCX, cephCY, cephR * 1.08, cephR * 0.90, 0, 0, Math.PI * 2); ctx.stroke();
  // Carapace central groove (fovea) — ЗАЛИВКА, не обведення. Обведений еліпс на чистій
  // голові читався буквально як цифра «0» / замкова щілина посеред карапакса.
  ctx.fillStyle = 'rgba(5,2,0,0.62)';
  ctx.beginPath();
  ctx.ellipse(cephCX - dir * cephR * 0.30, cephCY, cephR * 0.045, cephR * 0.13, 0, 0, Math.PI * 2); ctx.fill();
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
  // Лише ПЕРЕДНІ (0,1): задні вже намальовані до черевця (див. вище, z-order).
  drawSpiderLeg(0, 1, true);
  drawSpiderLeg(1, 1, true);

  // ═══════════════════════════════════════════════════════════════
  //  CHELICERAE (fangs) — large tarantula-style
  // ═══════════════════════════════════════════════════════════════
  const cheliBaseX = cephCX + dir * cephR * 0.78;
  const cheliBaseY = cephCY + cephR * 0.28;
  const fangGeom = side => {
    const cheliSpread = atkFangOpen;
    const fBaseX = cheliBaseX + side * cephR * 0.22 * (1 + cheliSpread * 0.34);
    const fBaseY = cheliBaseY;
    return {
      cheliSpread, fBaseX, fBaseY,
      fTipX: fBaseX + dir * s * (0.040 + strikeE * 0.030 + impactE * 0.010)
                   + side * s * (0.040 + cheliSpread * 0.030 + (inFight ? 0.008 : 0)),
      fTipY: fBaseY + s * (0.145 + cheliSpread * 0.062 + (inFight ? 0.016 : 0))
    };
  };
  if (inFight) {
    // One dark mouth cavity unifies both fangs into a single biting jaw gesture.
    const mouthX = cheliBaseX + dir * s * 0.045;
    const mouthY = cheliBaseY + s * 0.090;
    ctx.save();
    ctx.shadowColor = _arVisualBranch === 'A' ? '#82ff3d'
                    : _arVisualBranch === 'B' ? '#ad88ff' : '#ff5a22';
    ctx.shadowBlur = s * 0.11;
    ctx.fillStyle = 'rgba(6,2,1,0.92)';
    ctx.beginPath(); ctx.ellipse(mouthX,mouthY,s*0.105,s*0.095,dir*0.18,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  [-1, 1].forEach(side => {
    const { cheliSpread, fBaseX, fBaseY, fTipX, fTipY } = fangGeom(side);
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
    ctx.strokeStyle = FANG_DARK;
    ctx.lineWidth = s * 0.004; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fBaseX + s * 0.010, fBaseY + s * 0.028);
    ctx.quadraticCurveTo(fBaseX + dir * s * 0.012, fBaseY + s * 0.058, fTipX - s * 0.004, fTipY - s * 0.012);
    ctx.stroke();
    // Wet sharp tip
    ctx.fillStyle = FANG_LIT;
    ctx.beginPath(); ctx.arc(fTipX, fTipY, s * (inFight ? 0.013 : 0.009), 0, Math.PI * 2); ctx.fill();
    if (inFight) {
      ctx.save();
      ctx.shadowColor = unit._branch === 'A' ? '#8cff44'
                      : unit._branch === 'B' ? '#c5adff' : '#ff5a22';
      ctx.shadowBlur = s * 0.16;
      ctx.strokeStyle = unit._branch === 'A' ? 'rgba(160,255,105,0.82)'
                      : unit._branch === 'B' ? 'rgba(214,194,255,0.78)'
                      : 'rgba(255,120,60,0.72)';
      ctx.lineWidth = s * 0.008;
      ctx.beginPath(); ctx.arc(fTipX,fTipY,s*0.028,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
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
    const _impL = fangGeom(-1), _impR = fangGeom(1);
    const impX = (_impL.fTipX + _impR.fTipX) * 0.5;
    const impY = (_impL.fTipY + _impR.fTipY) * 0.5;
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
      const { fBaseX: _fBX, fBaseY: _fBY, fTipX: _fTipX, fTipY: _fTipY } = fangGeom(side);
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
    // GIANT (Велетенська) — вага і панцир, БЕЗ павутини. Раніше тут малювалась
    // «павутинна територія» (нитки/купол/спиці): вона (1) не за брифом — дерево каже
    // «×1.5 розміру, темна модель», павутина належить базі й гілці A, і (2) читалась
    // як світлий шум, що перебивав силует. Тепер гілка каже «важкий»: тріщини під
    // ногами, аметистовий блиск на хітині та потовщений панцир черевця.
    const _t = unit._arT;

    // Тріщини в підлозі під вагою велетня (розходяться від центру)
    ctx.strokeStyle = 'rgba(150,120,220,0.30)';
    ctx.lineWidth = s * 0.010;
    ctx.lineCap = 'round';
    for (let ci = 0; ci < 5; ci++) {
      const _cA = Math.PI * 0.12 + (ci / 4) * Math.PI * 0.76;
      const _cL = s * (0.30 + (ci % 2) * 0.14);
      const _x0 = cx + Math.cos(_cA) * s * 0.10;
      const _y0 = fY + s * 0.006 + Math.sin(_cA) * s * 0.012;
      const _x1 = cx + Math.cos(_cA) * _cL;
      const _y1 = fY + s * 0.008 + Math.sin(_cA) * s * 0.030;
      ctx.beginPath();
      ctx.moveTo(_x0, _y0);
      ctx.quadraticCurveTo((_x0 + _x1) / 2, _y0 + s * 0.010, _x1, _y1);
      ctx.stroke();
    }
    // Пилова хмарка від ваги (низька, широка)
    const _dustA = 0.20 + Math.sin(_t * 1.4) * 0.06;
    ctx.fillStyle = `rgba(120,100,170,${_dustA})`;
    ctx.beginPath(); ctx.ellipse(cx, fY + s * 0.008, s * 0.46, s * 0.038, 0, 0, Math.PI * 2); ctx.fill();

    // Потовщені пластини панцира на черевці — 3 дуги-«скиби» хітину
    ctx.strokeStyle = 'rgba(190,170,240,0.32)';
    ctx.lineWidth = s * 0.016;
    for (let pi = 0; pi < 3; pi++) {
      const _pR = absR * (0.86 - pi * 0.19);
      ctx.beginPath();
      ctx.ellipse(absCX, absCY + absR * 0.05, _pR, _pR * 0.72, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    }
    // Холодний аметистовий блиск по верхньому краю панцира (rim light = маса й обʼєм)
    ctx.strokeStyle = `rgba(200,175,255,${0.34 + Math.sin(_t * 1.8) * 0.08})`;
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.ellipse(absCX, absCY, absR * 0.98, absR * 0.90, 0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.strokeStyle = `rgba(215,198,255,${0.42 + Math.sin(_t * 1.8 + 1) * 0.08})`;
    ctx.lineWidth = s * 0.015;
    ctx.beginPath(); ctx.ellipse(cephCX,cephCY,cephR*1.02,cephR*0.92,0,Math.PI*1.12,Math.PI*1.88); ctx.stroke();
  }

  ctx.restore();
  unit._hpBarY = _arVisualBranch === 'B'
    ? Math.min(absCY - absR * 1.05, absCY - s * 0.70) - s * 0.05
    : absCY - absR * 1.05 - s * 0.05;
}
