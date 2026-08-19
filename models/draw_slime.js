// draw_slime.js — Slime monster drawing (extracted from Unit.draw())
// Globals used: ctx, _frameNow, units

function drawSlimeMonster(unit, camY) {
    const _R      = unit.size / 2;
    const _cx     = unit.x;
    const _floorY = unit.y - camY;
    ctx.save();
    // Реальний delta-time з _frameNow (мс). Раніше було 1/60 —
    // при просіданні FPS нижче 60 анімація виглядала як slow-mo.
    // Cap 0.05s щоб після паузи/фонової вкладки не було гігантського стрибка.
    const _nowT = _frameNow / 1000;
    const _DT   = (unit._sLastT === undefined) ? (1/60) : Math.min(_nowT - unit._sLastT, 0.05);
    unit._sLastT = _nowT;
    const _atkBase = unit.attackCooldownBase || 60;

    // ── Per-unit anim state init ────────────────────────────────
    if (unit._sDir === undefined) {
        unit._sDir = 1; unit._sHopPh = 0; unit._sAtkT = 0;
        unit._sPrevAtkCd = unit.attackCooldown; unit._sPrevX = unit.x;
        unit._sRingT = 0;
    }
    // Під час бою — дивимось на ворога; при ходьбі — за напрямком руху
    if (unit.state === 'fight') {
        const _hero = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
        if (_hero) unit._sDir = _hero.x > unit.x ? 1 : -1;
    } else if (Math.abs(unit.x - unit._sPrevX) > 0.2) {
        unit._sDir = unit.x > unit._sPrevX ? 1 : -1;
    }
    unit._sPrevX = unit.x;

    // Detect attack fired: cooldown jumped up → just reset after firing
    const _acd = unit.attackCooldown || 0;
    if (_acd > (unit._sPrevAtkCd || 0) + 3) {
        unit._sAtkT   = 1.0;
        unit._sRingT  = 1.0;
        unit._sAtkDir = unit._sDir;
    }
    unit._sPrevAtkCd = _acd;

    // Windup: how close to next attack (0=fresh, 1=about to fire)
    const _windup = 1 - Math.min(1, _acd / (_atkBase * 0.30));

    // Hop: walk=0.99s (patrol, no enemy), run=0.81s (enemy on floor)
    if (unit.state === 'move') {
        const _hasEnemy = units.some(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
        const _hopDur   = _hasEnemy ? 0.81 : 0.99;
        unit._sHopPh = (unit._sHopPh + _DT / _hopDur) % 1;
    } else {
        unit._sHopPh = Math.max(0, unit._sHopPh - _DT * 4);
    }

    // Advance timers
    const _atkDur = Math.min(0.55, _atkBase / 60 * 0.7);
    if (unit._sAtkT > 0) unit._sAtkT  = Math.max(0, unit._sAtkT  - _DT / _atkDur);
    if (unit._sRingT > 0) unit._sRingT = Math.max(0, unit._sRingT - _DT / 0.45);

    // Один спільний таймлайн для маси тіла й ударного виступу. Раніше тіло
    // стискалось за _sAtkT, а окрема "рука" жила за _sRingT — через різні
    // тривалості вони візуально розклеювались у два незалежні шари.
    const _strikeT = unit._sRingT > 0 ? 1 - unit._sRingT : 1;
    let _strikeReach = 0;
    if (unit._sRingT > 0) {
        if (_strikeT < 0.16) {
            _strikeReach = 0;
        } else if (_strikeT < 0.40) {
            const f = (_strikeT - 0.16) / 0.24;
            _strikeReach = 1 - Math.pow(1 - f, 3);
        } else if (_strikeT < 0.58) {
            _strikeReach = 1;
        } else if (_strikeT < 0.94) {
            const f = (_strikeT - 0.58) / 0.36;
            const r = 1 - f;
            _strikeReach = r * r * (3 - 2 * r);
        }
    }

    // ── Deformation ────────────────────────────────────────────
    let _sx = 1, _sy = 1, _yOff = 0, _xOff = 0, _blink = 0, _angry = 0;

    if (unit._sRingT > 0) {
        // Coil → release → short impact hold → damped recovery. The body now
        // loads opposite the strike instead of pancaking forward before the hit.
        const t = _strikeT;
        if (t < 0.16) {
            const f = t / 0.16;
            const e = f * f * (3 - 2 * f);
            _sx = 1 + 0.24 * e;  _sy = 1 - 0.18 * e;
            _xOff = -unit._sDir * _R * 0.16 * e;
        } else if (t < 0.40) {
            const f = (t - 0.16) / 0.24;
            const e = 1 - Math.pow(1 - f, 3);
            _sx = 1.24 - 0.18 * e;  _sy = 0.82 + 0.12 * e;
            _xOff = unit._sDir * _R * (-0.16 + 0.38 * e);
        } else if (t < 0.58) {
            _sx = 1.06; _sy = 0.94;
            _xOff = unit._sDir * _R * 0.22;
        } else {
            const f = Math.min(1, (t - 0.58) / 0.42);
            const settle = Math.sin(f * Math.PI * 3) * (1 - f) * 0.07;
            _sx = 1 + settle; _sy = 1 - settle;
            _xOff = unit._sDir * _R * 0.22 * (1 - f);
        }
        _angry = 1;
    } else if (_windup > 0.05 && unit.state === 'fight') {
        _sx = 1 + _windup * 0.18;   _sy = 1 - _windup * 0.14;
        _xOff = unit._sDir * _windup * _R * 0.25;
        _angry = _windup;
    } else if (unit.state === 'move') {
        // Стрибок у 3 фази: анітисипація (притискається до підлоги і
        // розпливається вбоки) → політ зі стретчем → сплюск на приземленні
        const ph = unit._sHopPh;
        if (ph < 0.28) {
            // Присідання перед стрибком: тисне до землі, плющиться в сторони
            const e = (ph / 0.28) * (ph / 0.28); // сильніше в кінці
            _sx = 1 + 0.38 * e;
            _sy = 1 - 0.30 * e;
            _yOff = 0;
        } else if (ph < 0.78) {
            // Політ: різкий вихід зі squash у stretch, апекс — витягнутий
            const t = (ph - 0.28) / 0.50;
            const air = Math.sin(t * Math.PI);
            const rel = Math.min(1, t * 2.5); // швидка нормалізація форми на злеті
            _sx = 1.38 - 0.48 * rel - air * 0.06;
            _sy = 0.70 + 0.42 * rel + air * 0.10;
            _yOff = air * _R * 0.85;
        } else {
            // Приземлення: пружний сплюск і повернення до форми
            const t = (ph - 0.78) / 0.22;
            const spk = Math.sin(t * Math.PI) * 0.28;
            _sx = 0.90 + 0.10 * t + spk;
            _sy = 1.12 - 0.12 * t - spk * 0.8;
            _yOff = 0;
        }
    } else {
        const w = Math.sin(_frameNow / 680) * 1.5;
        _sx = 1 + w * 0.004;  _sy = 1 - w * 0.004;
    }

    // Blink
    const _bc = (_frameNow / 1000) % 3.8;
    if (_bc > 3.5) _blink = Math.max(0, Math.sin((_bc - 3.5) / 0.14 * Math.PI));

    const _cy = _floorY - _yOff - _R * _sy;
    let _visualTop = _cy - _R * _sy;
    unit._hpBarY = _visualTop - 12;

    const _bodyCX = _cx + _xOff;
    const _bodyRX = _R * _sx;
    const _bodyRY = _R * _sy;
    const _attackDir = unit._sAtkDir || unit._sDir;
    const _attackReach = _R * 2.10 * _strikeReach;

    // Єдиний зовнішній контур. На ударі не домальовуємо руку чи кулак:
    // передня половина самого слизня витягується в широкий пружний таран.
    // При _strikeReach=0 контрольні точки точно відтворюють звичайний еліпс.
    function _traceSlimeBody() {
        const p = _strikeReach;
        const k = 0.5522847498;
        const X = x => _bodyCX + _attackDir * x;
        const mix = (a, b) => a + (b - a) * p;
        const frontX = _bodyRX + _attackReach;
        const tipY = -_bodyRY * 0.07 * p;
        // Широкий тупий край читається як важкий желейний таран, а не як
        // промінь/конус. Він округлюється тим самим контуром, без окремої кульки.
        const tipHalf = _bodyRY * (0.38 * p + 0.04 * p * p);
        const tipBulge = _R * 0.20 * p;

        ctx.beginPath();
        ctx.moveTo(X(-_bodyRX), _cy);
        ctx.bezierCurveTo(
            X(-_bodyRX), _cy - k * _bodyRY,
            X(-k * _bodyRX), _cy - _bodyRY,
            X(0), _cy - _bodyRY
        );
        ctx.bezierCurveTo(
            X(mix(k * _bodyRX, _bodyRX * 0.50)), _cy + mix(-_bodyRY, -_bodyRY * 0.92),
            X(mix(_bodyRX, _bodyRX + _attackReach * 0.48)), _cy + mix(-k * _bodyRY, tipY - tipHalf * 1.18),
            X(frontX), _cy + tipY - tipHalf
        );
        ctx.bezierCurveTo(
            X(frontX + tipBulge), _cy + tipY - tipHalf * 0.55,
            X(frontX + tipBulge), _cy + tipY + tipHalf * 0.55,
            X(frontX), _cy + tipY + tipHalf
        );
        ctx.bezierCurveTo(
            X(mix(_bodyRX, _bodyRX + _attackReach * 0.48)), _cy + mix(k * _bodyRY, tipY + tipHalf * 1.18),
            X(mix(k * _bodyRX, _bodyRX * 0.50)), _cy + mix(_bodyRY, _bodyRY * 0.92),
            X(0), _cy + _bodyRY
        );
        ctx.bezierCurveTo(
            X(-k * _bodyRX), _cy + _bodyRY,
            X(-_bodyRX), _cy + k * _bodyRY,
            X(-_bodyRX), _cy
        );
        ctx.closePath();
    }

    // ── Dust on landing ─────────────────────────────────────────
    if (unit.state === 'move' && unit._sHopPh > 0.78 && unit._sHopPh < 0.96) {
        ctx.shadowBlur = 0;
        const da = Math.sin((unit._sHopPh - 0.78) / 0.18 * Math.PI) * 0.32;
        ctx.fillStyle = `rgba(80,50,110,${da})`;
        ctx.beginPath(); ctx.ellipse(_cx + _xOff, _floorY, _R*_sx*1.15, _R*0.19, 0, 0, Math.PI*2); ctx.fill();
    }

    // ── Branch silhouette behind the body ──────────────────────
    // These roots use the same squash/stretch basis as the body, so they never
    // float above it during a hop or split away during an impact.
    if (unit._branch === 'A') {
        const ridge = [
            { x: -0.55, h: 0.28, lean: -0.05 },
            { x: -0.25, h: 0.42, lean: -0.08 },
            { x:  0.06, h: 0.48, lean: -0.10 },
            { x:  0.36, h: 0.32, lean: -0.07 },
        ];
        ctx.lineJoin = 'round';
        ridge.forEach((spike, i) => {
            const rootX = _cx + _xOff + spike.x * _R * _sx;
            const shell = Math.sqrt(Math.max(0, 1 - spike.x * spike.x));
            const rootY = _cy - shell * _R * _sy * 0.91;
            const halfW = _R * (0.12 + i * 0.008) * _sx;
            const tipX = rootX + unit._sDir * spike.lean * _R * _sx;
            const tipY = rootY - spike.h * _R * _sy;
            _visualTop = Math.min(_visualTop, tipY);
            ctx.fillStyle = '#4f7f17';
            ctx.strokeStyle = '#23370b';
            ctx.lineWidth = Math.max(1, _R * 0.075);
            ctx.beginPath();
            ctx.moveTo(rootX - halfW, rootY + _R * 0.07 * _sy);
            ctx.quadraticCurveTo(rootX - halfW * 0.22, rootY - _R * 0.12 * _sy, tipX, tipY);
            ctx.quadraticCurveTo(rootX + halfW * 0.30, rootY - _R * 0.08 * _sy, rootX + halfW, rootY + _R * 0.07 * _sy);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = 'rgba(211,255,92,0.72)';
            ctx.lineWidth = Math.max(0.7, _R * 0.028);
            ctx.beginPath();
            ctx.moveTo(rootX - halfW * 0.28, rootY - _R * 0.01 * _sy);
            ctx.quadraticCurveTo(rootX, rootY - _R * 0.13 * _sy, tipX, tipY + _R * 0.05 * _sy);
            ctx.stroke();
        });
    }

    // ── Body ────────────────────────────────────────────────────
    // Колір з unit.color (підтримуємо #rgb / #rrggbb / rgb) — за замовч. зелений slime
    const _slimeRgb = (function(){
        const col = unit.color || '#28be24';
        if (col[0] === '#') {
            let h = col.slice(1);
            if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
            return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
        }
        const m = col.match(/(\d+)\D+(\d+)\D+(\d+)/);
        return m ? [+m[1],+m[2],+m[3]] : [40,190,36];
    })();
    const _baseR = _slimeRgb[0], _baseG = _slimeRgb[1], _baseB = _slimeRgb[2];
    ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    const _angry30 = _angry * 30;
    let _bR = _angry > 0 ? Math.min(255, Math.round(_baseR + _angry30)) : _baseR;
    let _bG = _angry > 0 ? Math.max(0,   Math.round(_baseG - _angry*40)) : _baseG;
    let _bB = _angry > 0 ? Math.max(0,   Math.round(_baseB - _angry30)) : _baseB;
    const _darkR = Math.max(0, Math.round(_bR * 0.63));
    const _darkG = Math.max(0, Math.round(_bG * 0.63));
    const _darkB = Math.max(0, Math.round(_bB * 0.63));
    const _lightR = Math.min(255, _bR + 48);
    const _lightG = Math.min(255, _bG + 58);
    const _lightB = Math.min(255, _bB + 42);
    const _bodyGrad = ctx.createLinearGradient(
        _bodyCX - _attackDir * _bodyRX, _cy + _bodyRY * 0.68,
        _bodyCX + _attackDir * (_bodyRX + _attackReach), _cy - _bodyRY * 0.32
    );
    _bodyGrad.addColorStop(0, `rgba(${_darkR},${_darkG},${_darkB},0.96)`);
    _bodyGrad.addColorStop(0.35, `rgba(${_bR},${_bG},${_bB},0.96)`);
    _bodyGrad.addColorStop(0.82, `rgba(${_lightR},${_lightG},${_lightB},0.94)`);
    _bodyGrad.addColorStop(1, `rgba(${_bR},${_bG},${_bB},0.94)`);
    ctx.fillStyle = _bodyGrad;
    _traceSlimeBody(); ctx.fill();
    ctx.shadowBlur = 0;

    // Спільна верхня світлова плівка теж обрізається тим самим контуром, тому
    // матеріал без шва тягнеться від корпуса аж до ударної кромки.
    ctx.save();
    _traceSlimeBody(); ctx.clip();
    const _glaze = ctx.createLinearGradient(0, _cy - _bodyRY, 0, _cy + _bodyRY * 0.45);
    _glaze.addColorStop(0, 'rgba(255,255,255,0.30)');
    _glaze.addColorStop(0.42, 'rgba(255,255,255,0.08)');
    _glaze.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = _glaze;
    ctx.fillRect(
        _bodyCX - _bodyRX - _attackReach - _R,
        _cy - _bodyRY - _R,
        (_bodyRX + _attackReach + _R) * 2,
        _bodyRY * 2 + _R * 2
    );
    if (_strikeReach > 0.03) {
        ctx.strokeStyle = `rgba(${Math.min(255,_baseR+120)},${Math.min(255,_baseG+90)},${Math.min(255,_baseB+120)},${0.12 + _strikeReach * 0.18})`;
        ctx.lineWidth = Math.max(1, _R * 0.10);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(_bodyCX + _attackDir * _bodyRX * 0.05, _cy - _bodyRY * 0.47);
        ctx.quadraticCurveTo(
            _bodyCX + _attackDir * (_bodyRX + _attackReach * 0.48), _cy - _bodyRY * 0.34,
            _bodyCX + _attackDir * (_bodyRX + _attackReach * 0.88), _cy - _bodyRY * 0.18
        );
        ctx.stroke();
    }
    ctx.restore();

    // Локальний вологий блік на основній масі
    let _hR = Math.min(255, _baseR + 100), _hG = Math.min(255, _baseG + 65), _hB = Math.min(255, _baseB + 100);
    ctx.fillStyle = _angry > 0 ? `rgba(${_hR},${_hG},${_hB},0.42)` : `rgba(${Math.min(255,_baseR+80)},${Math.min(255,_baseG+45)},${Math.min(255,_baseB+80)},0.42)`;
    ctx.beginPath(); ctx.ellipse(_bodyCX-_R*0.22*_sx, _cy-_R*0.20*_sy, _R*0.56*_sx, _R*0.56*_sy, 0, 0, Math.PI*2); ctx.fill();

    // ── Eyes ────────────────────────────────────────────────────
    const _er       = _R * 0.21;
    const _eyeSprX  = _R * 0.37 * _sx;
    const _eyeBaseY = _cy - _R * 0.10 * _sy;
    const _blinkH   = _er * Math.max(0.04, 1 - _blink);
    const _browTilt = _angry * 0.45;
    [-1, 1].forEach(side => {
        const ex = _cx + _xOff + side * _eyeSprX + unit._sDir * _er * 0.2;
        ctx.fillStyle = _angry > 0.3 ? `rgba(255,220,180,0.95)` : '#e6ffe6';
        ctx.beginPath(); ctx.ellipse(ex, _eyeBaseY, _er, _blinkH, 0, 0, Math.PI*2); ctx.fill();
        if (_blink < 0.8) {
            ctx.fillStyle = _angry > 0.5 ? '#200000' : '#0d1a0d';
            const pupilH = _er * 0.55 * (1 - _blink*0.7) * (1 - _angry*0.35);
            ctx.beginPath(); ctx.ellipse(ex + unit._sDir*_er*0.28, _eyeBaseY, _er*0.55, pupilH, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.beginPath(); ctx.arc(ex - _er*0.2, _eyeBaseY - _blinkH*0.28, _er*0.17, 0, Math.PI*2); ctx.fill();
        }
        if (_angry > 0.1) {
            ctx.strokeStyle = `rgba(20,80,20,${_angry * 0.9})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ex - _er*0.9, _eyeBaseY - _blinkH - 2 + side*_browTilt*3);
            ctx.lineTo(ex + _er*0.9, _eyeBaseY - _blinkH - 2 - side*_browTilt*3);
            ctx.stroke();
        }
    });

    // ── Specular ────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.37)';
    ctx.beginPath(); ctx.ellipse(_cx+_xOff - _R*0.28*_sx, _cy - _R*0.33*_sy, _R*0.27*_sx, _R*0.14*_sy, -0.4, 0, Math.PI*2); ctx.fill();

    // ── Branch visuals ──────────────────────────────────────────
    if (unit._branch === 'A') {
        // ── Кислота: живий цикл крапель — наростає → відривається → падає → сплеск ──
        ctx.shadowBlur = 0;
        if (unit._sDripSeed === undefined) unit._sDripSeed = Math.random() * 10;
        const _aR = Math.min(255, _baseR + 20), _aG = Math.min(255, _baseG + 50);
        const _acidCol = a => `rgba(${_aR},${_aG},0,${a})`;
        const _drops = [
            { dx: -0.38, per: 2.6, off: 0.00 },
            { dx:  0.05, per: 3.3, off: 0.45 },
            { dx:  0.42, per: 2.2, off: 0.78 },
        ];
        _drops.forEach((D, i) => {
            const p  = ((_nowT + unit._sDripSeed) / D.per + D.off) % 1;
            const hx = _cx + _xOff + D.dx * _R * _sx;
            const hy = _cy + Math.sqrt(Math.max(0, 1 - D.dx * D.dx)) * _R * _sy * 0.86;
            if (p < 0.58) {
                // Наростання: груша тягнеться вниз, легенько гойдається
                const g    = p / 0.58;
                const len  = _R * (0.10 + g * 0.34);
                const bw   = _R * (0.05 + g * 0.10);
                const sway = Math.sin(_nowT * 3 + i * 2) * g * _R * 0.03;
                ctx.fillStyle = _acidCol(0.85);
                ctx.beginPath();
                ctx.moveTo(hx - bw * 0.35, hy);
                ctx.quadraticCurveTo(hx - bw + sway, hy + len * 0.55, hx + sway, hy + len);
                ctx.quadraticCurveTo(hx + bw + sway, hy + len * 0.55, hx + bw * 0.35, hy);
                ctx.closePath(); ctx.fill();
                // Блік на бульбі
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.beginPath(); ctx.arc(hx + sway - bw * 0.3, hy + len * 0.75, Math.max(0.5, bw * 0.25), 0, Math.PI * 2); ctx.fill();
            } else if (p < 0.86) {
                // Падіння: вільна крапля, витягується від швидкості (easeIn)
                const f  = (p - 0.58) / 0.28;
                const fy = hy + (_floorY - 2 - hy) * f * f;
                const dr = _R * 0.12;
                ctx.fillStyle = _acidCol(0.9);
                ctx.beginPath();
                ctx.ellipse(hx, fy, dr * 0.7, dr * (1 + f * 0.5), 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Сплеск: калюжка розтікається і тане + мікробризки
                const s = (p - 0.86) / 0.14;
                ctx.fillStyle = _acidCol(0.5 * (1 - s));
                ctx.beginPath();
                ctx.ellipse(hx, _floorY - 1, _R * (0.10 + s * 0.22), _R * 0.045 * (1 - s * 0.4), 0, 0, Math.PI * 2);
                ctx.fill();
                if (s < 0.5) {
                    ctx.fillStyle = _acidCol(0.6 * (1 - s * 2));
                    ctx.beginPath(); ctx.arc(hx - _R * 0.14, _floorY - 3 - s * 6, 1.1, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(hx + _R * 0.16, _floorY - 2 - s * 8, 0.9, 0, Math.PI * 2); ctx.fill();
                }
            }
        });
        // Кипіння: бульбашка спливає в тілі й лопається біля верху
        {
            const bp = ((_nowT + unit._sDripSeed) / 1.9) % 1;
            const bx = _cx + _xOff + Math.sin(unit._sDripSeed + bp * 5) * _R * _sx * 0.35;
            const by = _cy + _R * _sy * (0.55 - bp * 1.0);
            const br = _R * 0.09 * (bp < 0.85 ? 1 : (1 - (bp - 0.85) / 0.15));
            ctx.strokeStyle = 'rgba(255,255,230,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(bx, by, Math.max(0.5, br), 0, Math.PI * 2); ctx.stroke();
        }
        // М'яка кислотна аура з пульсом (замість статичного кільця)
        ctx.strokeStyle = _acidCol(0.10 + 0.06 * Math.sin(_nowT * 2.2 + unit._sDripSeed));
        ctx.lineWidth = 2;
        ctx.save();
        ctx.translate(-_attackDir * _R * 0.025, 0);
        ctx.lineWidth = Math.max(1.2, _R * 0.055);
        _traceSlimeBody(); ctx.stroke();
        ctx.restore();
    } else if (unit._branch === 'B') {
        // Крижані кристали: мерехтять по черзі, «дихають» довжиною; ореол обертається
        ctx.shadowBlur = 0;
        const _cAngles = [-Math.PI*0.72, -Math.PI*0.50, -Math.PI*0.28, -Math.PI*0.85, -Math.PI*0.15];
        _cAngles.forEach((_ang, _ci) => {
            const _tw = 0.5 + 0.5 * Math.sin(_nowT * 2.4 + _ci * 1.7);   // мерехтіння, у кожного своя фаза
            const _grow = 0.44 + 0.10 * Math.sin(_nowT * 1.1 + _ci * 2.3); // легке «дихання» довжини
            const _ca = Math.cos(_ang), _sa = Math.sin(_ang);
            const _bx = _cx + _xOff + _ca * _R * _sx * 0.92;
            const _by = _cy + _sa * _R * _sy * 0.92;
            // Normal of the current squash/stretch ellipse. Crystal roots,
            // tips and widths now share one deformed surface basis.
            let _nx = _ca / Math.max(0.01, _sx);
            let _ny = _sa / Math.max(0.01, _sy);
            const _nl = Math.hypot(_nx, _ny) || 1;
            _nx /= _nl; _ny /= _nl;
            const _tanX = -_ny, _tanY = _nx;
            const _tx = _bx + _nx * _R * _grow;
            const _ty = _by + _ny * _R * _grow;
            const _pw = _R * 0.12;
            ctx.fillStyle = `rgba(195,235,255,${0.70 + _tw * 0.25})`;
            ctx.strokeStyle = `rgba(130,200,255,${0.45 + _tw * 0.30})`; ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(_tx, _ty);
            ctx.lineTo(_bx + _tanX * _pw, _by + _tanY * _pw);
            ctx.lineTo(_bx - _tanX * _pw, _by - _tanY * _pw);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            // Іскринка на вістрі найяскравішого кристала
            if (_tw > 0.88) {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath(); ctx.arc(_tx, _ty, _R * 0.035, 0, Math.PI*2); ctx.fill();
            }
        });
        // Морозний ореол повільно обертається (біжучий пунктир)
        ctx.strokeStyle = 'rgba(160,220,255,0.26)'; ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 5]);
        ctx.lineDashOffset = -_nowT * 6;
        _traceSlimeBody(); ctx.stroke();
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }

    unit._hpBarY = Math.min(unit._hpBarY, _visualTop - 12);
    ctx.restore();
}
