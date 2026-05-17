// draw_slime.js — Slime monster drawing (extracted from Unit.draw())
// Globals used: ctx, _frameNow, units

function drawSlimeMonster(unit, camY) {
    const _R      = unit.size / 2;
    const _cx     = unit.x;
    const _floorY = unit.y - camY;
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

    // ── Deformation ────────────────────────────────────────────
    let _sx = 1, _sy = 1, _yOff = 0, _xOff = 0, _blink = 0, _angry = 0;

    if (unit._sAtkT > 0) {
        // Impact animation
        const t = 1 - unit._sAtkT;
        if (t < 0.10) {
            const f = t / 0.10;
            _sx = 1 + 0.70 * f;  _sy = 1 - 0.45 * f;
            _xOff = unit._sDir * _R * 1.0 * f;
        } else if (t < 0.25) {
            const f = (t - 0.10) / 0.15;
            _sx = 1.70 - 0.85 * f;  _sy = 0.55 + 0.55 * f;
            _xOff = unit._sDir * _R * 1.0 * (1 - f);
        } else {
            const f = (t - 0.25) / 0.75;
            const sp = Math.exp(-f * 6) * Math.cos(f * 20) * 0.13;
            _sx = 1 + sp;  _sy = 1 - sp;
        }
        _angry = 1;
    } else if (_windup > 0.05 && unit.state === 'fight') {
        _sx = 1 + _windup * 0.18;   _sy = 1 - _windup * 0.14;
        _xOff = unit._sDir * _windup * _R * 0.25;
        _angry = _windup;
    } else if (unit.state === 'move') {
        const air = Math.max(0, Math.sin(unit._sHopPh * Math.PI));
        _sx = 1 + (1 - air) * 0.24 - air * 0.12;
        _sy = 1 - (1 - air) * 0.18 + air * 0.18;
        if (unit._sHopPh > 0.82) {
            const spk = Math.sin((unit._sHopPh - 0.82) / 0.18 * Math.PI) * 0.14;
            _sx += spk;  _sy -= spk * 0.7;
        }
        _yOff = air * _R * 0.75;
    } else {
        const w = Math.sin(_frameNow / 680) * 1.5;
        _sx = 1 + w * 0.004;  _sy = 1 - w * 0.004;
    }

    // Blink
    const _bc = (_frameNow / 1000) % 3.8;
    if (_bc > 3.5) _blink = Math.max(0, Math.sin((_bc - 3.5) / 0.14 * Math.PI));

    const _cy = _floorY - _yOff - _R * _sy;
    unit._hpBarY = _cy - _R * _sy - 12;

    // ── Dust on landing ─────────────────────────────────────────
    if (unit.state === 'move' && unit._sHopPh > 0.82 && unit._sHopPh < 0.98) {
        ctx.shadowBlur = 0;
        const da = Math.sin((unit._sHopPh - 0.82) / 0.16 * Math.PI) * 0.32;
        ctx.fillStyle = `rgba(80,50,110,${da})`;
        ctx.beginPath(); ctx.ellipse(_cx + _xOff, _floorY, _R*_sx*1.15, _R*0.19, 0, 0, Math.PI*2); ctx.fill();
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
    ctx.shadowColor = '#000'; ctx.shadowBlur = 7;
    const _angry30 = _angry * 30;
    let _bR = _angry > 0 ? Math.min(255, Math.round(_baseR + _angry30)) : _baseR;
    let _bG = _angry > 0 ? Math.max(0,   Math.round(_baseG - _angry*40)) : _baseG;
    let _bB = _angry > 0 ? Math.max(0,   Math.round(_baseB - _angry30)) : _baseB;
    ctx.fillStyle = `rgba(${_bR},${_bG},${_bB},0.92)`;
    ctx.beginPath(); ctx.ellipse(_cx+_xOff, _cy, _R*_sx, _R*_sy, 0, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Світлий блік — освітлений варіант основного кольору
    let _hR = Math.min(255, _baseR + 100), _hG = Math.min(255, _baseG + 65), _hB = Math.min(255, _baseB + 100);
    ctx.fillStyle = _angry > 0 ? `rgba(${_hR},${_hG},${_hB},0.42)` : `rgba(${Math.min(255,_baseR+80)},${Math.min(255,_baseG+45)},${Math.min(255,_baseB+80)},0.42)`;
    ctx.beginPath(); ctx.ellipse(_cx+_xOff-_R*0.22*_sx, _cy-_R*0.20*_sy, _R*0.56*_sx, _R*0.56*_sy, 0, 0, Math.PI*2); ctx.fill();

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
        // Acid drips hanging from bottom of body
        ctx.shadowBlur = 0;
        const _aR = Math.min(255, _baseR + 20), _aG = Math.min(255, _baseG + 50), _aB = 0;
        const _drips = [-0.40, -0.12, 0.12, 0.40];
        _drips.forEach((_dx, _i) => {
            const _drx = _cx + _xOff + _dx * _R * _sx;
            const _dry = _cy + Math.sqrt(Math.max(0, 1 - _dx*_dx)) * _R * _sy * 0.88;
            const _dlen = _R * (0.30 + (_i % 2) * 0.18);
            ctx.strokeStyle = `rgba(${_aR},${_aG},${_aB},0.82)`;
            ctx.lineWidth = _R * 0.16; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(_drx, _dry); ctx.lineTo(_drx, _dry + _dlen); ctx.stroke();
            ctx.fillStyle = `rgba(${_aR},${_aG},${_aB},0.88)`;
            ctx.beginPath(); ctx.arc(_drx, _dry + _dlen, _R * 0.11, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = `rgba(${_aR},${_aG},${_aB},0.20)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(_cx+_xOff, _cy, _R*_sx*1.22, _R*_sy*1.22, 0, 0, Math.PI*2); ctx.stroke();
    } else if (unit._branch === 'B') {
        // Ice crystals radiating from top of slime
        ctx.shadowBlur = 0;
        const _cAngles = [-Math.PI*0.72, -Math.PI*0.50, -Math.PI*0.28, -Math.PI*0.85, -Math.PI*0.15];
        _cAngles.forEach(_ang => {
            const _bx = _cx + _xOff + Math.cos(_ang) * _R * _sx * 0.92;
            const _by = _cy + Math.sin(_ang) * _R * _sy * 0.92;
            const _tx = _bx + Math.cos(_ang) * _R * 0.50;
            const _ty = _by + Math.sin(_ang) * _R * 0.50;
            const _pw = _R * 0.12;
            ctx.fillStyle = 'rgba(195,235,255,0.88)';
            ctx.strokeStyle = 'rgba(130,200,255,0.60)'; ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(_tx, _ty);
            ctx.lineTo(_bx - Math.sin(_ang)*_pw, _by + Math.cos(_ang)*_pw);
            ctx.lineTo(_bx + Math.sin(_ang)*_pw, _by - Math.cos(_ang)*_pw);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        });
        ctx.strokeStyle = 'rgba(160,220,255,0.26)'; ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.ellipse(_cx+_xOff, _cy, _R*_sx*1.25, _R*_sy*1.25, 0, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
    }

    // ── Кулак-псевдопод виростає з боку слизня ──────────────────
    if (unit._sRingT > 0) {
        const _ad  = unit._sAtkDir || unit._sDir;
        const rp   = 1 - unit._sRingT;
        const alp  = unit._sRingT * 0.95;

        const fistP = rp < 0.50 ? rp / 0.50 : (1 - rp) / 0.50;
        const ease  = fistP * fistP * (3 - 2 * fistP);

        const ext   = _R * 2.0 * ease;
        const fR    = _R * 0.48 * ease;
        const armW  = _R * 0.30 * (0.4 + 0.6 * ease);

        const baseX = _cx + _xOff + _ad * _R * _sx * 0.88;
        const fistX = baseX + _ad * ext;
        const baseY = _cy;

        // Кулак — той самий колір тіла
        const _fR = _angry > 0 ? Math.min(255, Math.round(_baseR + _angry*30)) : _baseR;
        const _fG = _angry > 0 ? Math.max(0,   Math.round(_baseG - _angry*40)) : _baseG;
        const _fB = _angry > 0 ? Math.max(0,   Math.round(_baseB - _angry*30)) : _baseB;
        const bodyCol = `rgba(${_fR},${_fG},${_fB},${alp})`;

        ctx.shadowBlur = 0;

        if (ext > 0.5) {
            ctx.fillStyle = bodyCol;
            ctx.beginPath();
            ctx.moveTo(baseX,              baseY - armW);
            ctx.lineTo(fistX - _ad * fR * 0.6, baseY - armW * 0.65);
            ctx.lineTo(fistX - _ad * fR * 0.6, baseY + armW * 0.65);
            ctx.lineTo(baseX,              baseY + armW);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = bodyCol;
            ctx.beginPath(); ctx.arc(fistX, baseY, fR, 0, Math.PI * 2); ctx.fill();

            ctx.strokeStyle = `rgba(20,120,10,${alp * 0.6})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.arc(fistX, baseY, fR, 0, Math.PI * 2); ctx.stroke();

            ctx.fillStyle = `rgba(180,255,140,${alp * 0.42})`;
            ctx.beginPath();
            ctx.arc(fistX - _ad * fR * 0.28, baseY - fR * 0.32, fR * 0.36, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}