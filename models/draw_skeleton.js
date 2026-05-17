// draw_skeleton.js — Skeleton monster drawing (extracted from main.html)
// Globals used: ctx, ctxRoundRect, _frameNow, units

// ═══════════════════════════════════════════════════════════
//  Skeleton FK helpers + drawSkeleton
// ═══════════════════════════════════════════════════════════
const _SK = {
  outline:'#100400', bone:'#e6d8a8', boneHL:'#faf2d0',
  dim:'#8a845e', dimHL:'#aaa878', joint:'#d0c090',
  eye:'#050200', tooth:'#caba70', rag:'#1e0f38',
};

function _skBone(x1,y1,x2,y2,r,dim=false){
  const fill=dim?_SK.dim:_SK.bone, hl=dim?_SK.dimHL:_SK.boneHL;
  const a=Math.atan2(y2-y1,x2-x1), px=-Math.sin(a), py=Math.cos(a);
  ctx.beginPath(); ctx.arc(x1,y1,r,a+Math.PI/2,a-Math.PI/2); ctx.arc(x2,y2,r,a-Math.PI/2,a+Math.PI/2); ctx.closePath();
  ctx.strokeStyle=_SK.outline; ctx.lineWidth=2.8; ctx.stroke(); ctx.fillStyle=fill; ctx.fill();
  const hr=r*0.28, ox=px*r*0.40-1, oy=py*r*0.40-1;
  ctx.globalAlpha=0.50;
  ctx.beginPath(); ctx.arc(x1+ox,y1+oy,hr,a+Math.PI/2,a-Math.PI/2); ctx.arc(x2+ox,y2+oy,hr,a-Math.PI/2,a+Math.PI/2); ctx.closePath();
  ctx.fillStyle=hl; ctx.fill();
  ctx.globalAlpha=1;
}

function _skJnt(x,y,r,dim=false){
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.strokeStyle=_SK.outline; ctx.lineWidth=1.8; ctx.stroke(); ctx.fillStyle=dim?_SK.dim:_SK.joint; ctx.fill();
  ctx.globalAlpha=0.5;
  ctx.beginPath(); ctx.arc(x-r*0.3,y-r*0.35,r*0.32,0,Math.PI*2);
  ctx.fillStyle=dim?_SK.dimHL:_SK.boneHL; ctx.fill();
  ctx.globalAlpha=1;
}

function _skSkull(x,y,tilt,jawOpen,eyeColor='#30ff60'){
  ctx.save(); ctx.translate(x,y); ctx.rotate(tilt);

  // Cranium
  ctx.beginPath(); ctx.ellipse(0,-7,17,19,0,0,Math.PI*2);
  ctx.strokeStyle=_SK.outline; ctx.lineWidth=2.8; ctx.stroke(); ctx.fillStyle=_SK.bone; ctx.fill();

  // Brow ridge
  ctx.beginPath(); ctx.moveTo(-15,-10); ctx.lineTo(-9,-16); ctx.lineTo(9,-16); ctx.lineTo(15,-10);
  ctx.lineWidth=4; ctx.strokeStyle=_SK.outline; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
  ctx.lineWidth=2.2; ctx.strokeStyle=_SK.bone; ctx.stroke();

  // Cheekbones
  for(const sx of [-1,1]){
    ctx.beginPath(); ctx.ellipse(sx*12,-3,4.5,2.5,sx*0.35,0,Math.PI*2);
    ctx.strokeStyle=_SK.outline; ctx.lineWidth=1.8; ctx.stroke(); ctx.fillStyle=_SK.bone; ctx.fill();
  }

  // Cranium highlight + seam
  ctx.globalAlpha=0.42;
  ctx.beginPath(); ctx.ellipse(-5,-12,9,11,-0.3,0,Math.PI*2);
  ctx.fillStyle=_SK.boneHL; ctx.fill();
  ctx.globalAlpha=0.22; ctx.strokeStyle=_SK.outline; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.ellipse(0,-7,15,17,0,Math.PI*1.1,Math.PI*1.7); ctx.stroke();
  ctx.globalAlpha=1;

  // Jaw
  const jy=jawOpen*3.5;
  ctx.save(); ctx.translate(0,jy);
  ctx.beginPath(); ctx.ellipse(0,10,13,7.5,0,0.06,Math.PI-0.06);
  ctx.strokeStyle=_SK.outline; ctx.lineWidth=2.4; ctx.stroke(); ctx.fillStyle=_SK.bone; ctx.fill();
  ctx.globalAlpha=0.38;
  ctx.beginPath(); ctx.ellipse(-4,9,6,3.5,-0.2,0,Math.PI*2);
  ctx.fillStyle=_SK.boneHL; ctx.fill(); ctx.globalAlpha=1;
  // 5 teeth (middle ones longer)
  for(let i=0;i<5;i++){
    const tx=(i-2)*4.8, th=i===0||i===4?5:6;
    ctx.beginPath(); ctx.moveTo(tx-2,6); ctx.lineTo(tx+2,6);
    ctx.lineTo(tx+1.4,6+th); ctx.lineTo(tx-1.4,6+th); ctx.closePath();
    ctx.strokeStyle=_SK.outline; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle=_SK.tooth; ctx.fill();
  }
  ctx.restore();

  // Eye sockets with pulsing glow
  const _ep = 0.78 + Math.sin(_frameNow * 0.0025) * 0.22;
  for(const sx of[-6,6]){
    ctx.beginPath(); ctx.ellipse(sx,-8,5.5,4.5,sx<0?-0.15:0.15,0,Math.PI*2);
    ctx.fillStyle=_SK.eye; ctx.fill();
    ctx.globalAlpha=0.28 * _ep;
    ctx.beginPath(); ctx.ellipse(sx,-8.2,4.2,3.5,sx<0?-0.15:0.15,0,Math.PI*2);
    ctx.fillStyle=eyeColor; ctx.fill();
    ctx.globalAlpha=0.55 * _ep;
    ctx.beginPath(); ctx.ellipse(sx,-8.3,2.6,2.2,sx<0?-0.15:0.15,0,Math.PI*2);
    ctx.fillStyle=eyeColor; ctx.fill();
    ctx.globalAlpha=0.90 * _ep;
    ctx.beginPath(); ctx.arc(sx,-8.5,1.1,0,Math.PI*2);
    ctx.fillStyle='#ffffff'; ctx.fill();
    ctx.globalAlpha=1;
  }

  // Nasal cavity
  ctx.beginPath(); ctx.moveTo(0,0.5); ctx.lineTo(-3.8,7); ctx.lineTo(3.8,7);
  ctx.closePath(); ctx.fillStyle=_SK.eye; ctx.fill();

  // Cracks
  ctx.globalAlpha=0.72; ctx.strokeStyle=_SK.outline; ctx.lineWidth=1.1;
  ctx.beginPath(); ctx.moveTo(3,-24); ctx.lineTo(2,-18); ctx.lineTo(5,-13); ctx.lineTo(2,-7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-7,-20); ctx.lineTo(-5,-14); ctx.lineTo(-8,-10); ctx.stroke();
  ctx.globalAlpha=1;

  ctx.restore();
}

function _skRibcage(x,y){
  // Sternum
  _skBone(x,y,x,y+22,2.2);
  // Clavicles
  _skBone(x,y,x-14,y-10,1.8); _skBone(x,y,x+14,y-10,1.8);
  // 4 rib pairs as curved strokes
  for(const{ry,rw,rh} of [{ry:y+1,rw:15,rh:8},{ry:y+6,rw:14,rh:7},{ry:y+11,rw:12,rh:5.5},{ry:y+16,rw:9,rh:3.5}]){
    for(const s of[-1,1]){
      ctx.beginPath(); ctx.moveTo(x+s*2,ry);
      ctx.bezierCurveTo(x+s*rw*0.45,ry-3, x+s*rw,ry+rh*0.45, x+s*rw,ry+rh);
      ctx.lineWidth=3.5; ctx.strokeStyle=_SK.outline; ctx.lineCap='round'; ctx.stroke();
      ctx.lineWidth=1.8; ctx.strokeStyle=_SK.bone; ctx.stroke();
    }
  }
}

function _skLeg(hx,hy,thighA,kneeBend,dim){
  const THIGH=26,SHIN=24;
  const kx=hx+Math.sin(thighA)*THIGH, ky=hy+Math.cos(thighA)*THIGH;
  const shinA=thighA-kneeBend, ax=kx+Math.sin(shinA)*SHIN, ay=ky+Math.cos(shinA)*SHIN;
  _skBone(hx,hy,kx,ky,5,dim); _skJnt(kx,ky,4,dim); _skBone(kx,ky,ax,ay,4,dim); _skJnt(ax,ay,3.2,dim);
  const footA=shinA*0.4, fx=ax+Math.cos(footA)*12, fy=ay+Math.abs(Math.sin(footA))*2+2;
  _skBone(ax,ay,fx,fy,3.2,dim); _skBone(fx,fy,fx+5,fy+1,1.8,dim);
}

function _skArm(sx,sy,upperA,elbowBend,dim){
  const UA=20,FA=17;
  const ex=sx+Math.sin(upperA)*UA, ey=sy+Math.cos(upperA)*UA;
  const elbA=upperA+elbowBend, wx=ex+Math.sin(elbA)*FA, wy=ey+Math.cos(elbA)*FA;
  _skBone(sx,sy,ex,ey,3.5,dim); _skJnt(ex,ey,2.8,dim); _skBone(ex,ey,wx,wy,2.8,dim);
  for(const[da,len] of[[-0.32,6.5],[0,7.5],[0.32,6.5]]){
    const fa=elbA+da; _skBone(wx,wy,wx+Math.sin(fa)*len,wy+Math.cos(fa)*len,1.4,dim);
  }
}

const _skE = p => p*p*(3-2*p);

function drawSkeleton(ctx_,x,y,t,dir=1,sc=0.38,atk=0,branch=''){
  const _lp = (a,b,f) => a+(b-a)*f;
  const spd=2.2, wc=Math.sin(t*spd), wc_c=Math.cos(t*spd);
  const bob=(1-Math.abs(wc))*3.5, hipT=wc_c*0.035;
  const legA_F=wc*0.52, legA_B=-legA_F;
  const knee_F=0.08+Math.max(0,wc_c)*0.85, knee_B=0.08+Math.max(0,-wc_c)*0.85;
  let armA_B=-wc*0.40, elbow_B=0.20+Math.max(0,wc_c)*0.40;

  let armA_F, elbow_F, jawOpen=Math.abs(Math.sin(t*1.1))*0.28, atkTilt=0;
  const ap = atk || 0;
  if (ap > 0) {
    if      (ap < 0.22) { const f=_skE(ap/0.22);
      armA_F=_lp(-wc*0.40,-1.10,f); elbow_F=_lp(0.20,-0.45,f); atkTilt=_lp(0,-0.18,f); jawOpen=0;
    } else if (ap < 0.42) { const f=_skE((ap-0.22)/0.20);
      armA_F=_lp(-1.10,1.35,f); elbow_F=_lp(-0.45,0.95,f); atkTilt=_lp(-0.18,0.28,f);
      jawOpen=Math.sin(f*Math.PI)*0.90;
    } else if (ap < 0.60) { const f=_skE((ap-0.42)/0.18);
      armA_F=_lp(1.35,0.95,f); elbow_F=_lp(0.95,0.55,f); atkTilt=_lp(0.28,0.10,f); jawOpen=_lp(0.90,0,f);
    } else { const f=_skE((ap-0.60)/0.40);
      armA_F=_lp(0.95,-wc*0.40,f); elbow_F=_lp(0.55,0.20,f); atkTilt=_lp(0.10,0,f);
    }
  } else {
    armA_F=-wc*0.40; elbow_F=0.20+Math.max(0,-wc_c)*0.40;
  }

  // Branch-specific back arm pose (must follow armA_F/elbow_F assignment)
  if (branch === 'A') {
    armA_B = wc * 0.08 - 0.50;   // arm extends outward-left, then wrist bends forward
    elbow_B = 1.20;               // sharp elbow bend → wrist lands left of body, shield faces forward
  } else if (branch === 'B') {
    armA_B = armA_F - 0.22;
    elbow_B = Math.max(0.05, elbow_F * 0.75 + 0.08);
  }
  // Back wrist anchor (for shield / 2H pommel)
  const _belbA = armA_B + elbow_B;
  const _bex = -13 + Math.sin(armA_B)*20, _bey = -40 + Math.cos(armA_B)*20;
  const _bwx = _bex + Math.sin(_belbA)*17, _bwy = _bey + Math.cos(_belbA)*17;

  const HX=0,HY=0,SPINE_TOP=-44,RIB_Y=SPINE_TOP-2,SHL_Y=SPINE_TOP+4,SHL_X=13,NECK_Y=SPINE_TOP-10,HEAD_Y=NECK_Y-20;
  ctx_.save(); ctx_.translate(x,y-bob*sc); ctx_.rotate(0.05+hipT+atkTilt); ctx_.scale(dir*sc,sc);

  // Back leg + arm
  _skLeg(4,HY,legA_B,knee_B,true); _skArm(-SHL_X,SHL_Y,armA_B,elbow_B,true);

  // Pelvis bone
  _skBone(-10,HY-2,10,HY-2,5.5);

  // ── Cloth rags hanging from hip ─────────────────────────────
  const _rSway = Math.sin(_frameNow * 0.0015) * 3;
  ctx_.fillStyle=_SK.rag; ctx_.strokeStyle='#120820'; ctx_.lineWidth=0.8;
  for(const[rx,rlen,rs] of [[-9,16,-0.8],[0,21,0.5],[9,15,0.8]]){
    const rt=rx+_rSway*rs;
    ctx_.beginPath();
    ctx_.moveTo(rx-3.5,HY-2); ctx_.lineTo(rx+3.5,HY-2);
    ctx_.lineTo(rt+2,HY-2+rlen); ctx_.lineTo(rt-2,HY-2+rlen);
    ctx_.closePath(); ctx_.fill(); ctx_.stroke();
  }

  // Spine
  const smid=SPINE_TOP*0.5; _skBone(HX,HY-3,HX+1,smid,3.2); _skBone(HX+1,smid,HX,SPINE_TOP,3.0);
  _skRibcage(HX,RIB_Y);

  // ── Shield (Branch A) — прив'язаний до зап'ястя лівої руки ──
  if (branch === 'A') {
    const _shW = 16, _shH = 22;
    const _shAng = _belbA * 0.35 - 0.10;
    ctx_.save(); ctx_.translate(_bwx, _bwy); ctx_.rotate(_shAng);
    ctx_.fillStyle='#5a5a99'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=2;
    ctx_.beginPath();
    ctx_.moveTo(0,          -_shH*0.40);
    ctx_.lineTo( _shW/2,   -_shH*0.40 + 4);
    ctx_.lineTo( _shW/2,    _shH*0.15);
    ctx_.lineTo(0,           _shH*0.50);
    ctx_.lineTo(-_shW/2,    _shH*0.15);
    ctx_.lineTo(-_shW/2,   -_shH*0.40 + 4);
    ctx_.closePath(); ctx_.fill(); ctx_.stroke();
    // Підсвітка
    ctx_.fillStyle='#8888cc';
    ctx_.beginPath();
    ctx_.moveTo(0,          -_shH*0.40 + 1);
    ctx_.lineTo(_shW/2 - 2, -_shH*0.40 + 5);
    ctx_.lineTo(_shW/2 - 2, -2);
    ctx_.lineTo(0,          -4);
    ctx_.closePath(); ctx_.fill();
    // Хрест
    ctx_.strokeStyle='#aaaadd'; ctx_.lineWidth=1.5;
    ctx_.beginPath();
    ctx_.moveTo(-_shW*0.35, -4); ctx_.lineTo(_shW*0.35, -4);
    ctx_.moveTo(0, -_shH*0.40);  ctx_.lineTo(0, _shH*0.30);
    ctx_.stroke();
    // Умбон
    ctx_.fillStyle='#ccccee'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1;
    ctx_.beginPath(); ctx_.arc(0, -4, 3.5, 0, Math.PI*2); ctx_.fill(); ctx_.stroke();
    // Синє сяйво
    ctx_.strokeStyle='rgba(100,130,255,0.35)'; ctx_.lineWidth=3.5;
    ctx_.beginPath();
    ctx_.moveTo(0,         -_shH*0.40);
    ctx_.lineTo( _shW/2,  -_shH*0.40 + 4);
    ctx_.lineTo( _shW/2,   _shH*0.15);
    ctx_.lineTo(0,          _shH*0.50);
    ctx_.lineTo(-_shW/2,   _shH*0.15);
    ctx_.lineTo(-_shW/2,  -_shH*0.40 + 4);
    ctx_.closePath(); ctx_.stroke();
    ctx_.restore();
  }

  _skArm(SHL_X,SHL_Y,armA_F,elbow_F,false); _skLeg(-4,HY,legA_F,knee_F,false);

  // ── Sword ──────────────────────────────────────────────────
  { const UA=20, FA=17;
    const _fex=SHL_X+Math.sin(armA_F)*UA, _fey=SHL_Y+Math.cos(armA_F)*UA;
    const _felbA=armA_F+elbow_F;
    const _fwx=_fex+Math.sin(_felbA)*FA, _fwy=_fey+Math.cos(_felbA)*FA;
    const swa=_felbA+(ap>0.22&&ap<0.55?0.28:0);

    if (branch === 'B') {
      // 2H: pommel at back wrist, crossguard at front wrist
      const _2hA = Math.atan2(_fwx - _bwx, _fwy - _bwy);
      const _bladeLen=78, _bladeW=5;
      const bEndX=_fwx+Math.sin(_2hA)*_bladeLen, bEndY=_fwy+Math.cos(_2hA)*_bladeLen;
      // Grip
      ctx_.strokeStyle='#2e1c0c'; ctx_.lineWidth=8; ctx_.lineCap='round';
      ctx_.beginPath(); ctx_.moveTo(_bwx,_bwy); ctx_.lineTo(_fwx,_fwy); ctx_.stroke();
      // Leather strips
      ctx_.strokeStyle='rgba(140,90,30,0.55)'; ctx_.lineWidth=1;
      for(let gi=1;gi<4;gi++){
        const gf=gi/4;
        const gpx=_bwx+(_fwx-_bwx)*gf, gpy=_bwy+(_fwy-_bwy)*gf;
        ctx_.beginPath();
        ctx_.moveTo(gpx-Math.cos(_2hA)*3.5,gpy+Math.sin(_2hA)*3.5);
        ctx_.lineTo(gpx+Math.cos(_2hA)*3.5,gpy-Math.sin(_2hA)*3.5);
        ctx_.stroke();
      }
      // Pommel at back wrist
      ctx_.fillStyle='#6a5020'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1.5;
      ctx_.beginPath(); ctx_.arc(_bwx,_bwy,5.5,0,Math.PI*2); ctx_.fill(); ctx_.stroke();
      // Crossguard at front wrist
      ctx_.save(); ctx_.translate(_fwx,_fwy); ctx_.rotate(_2hA);
      ctx_.fillStyle='#6a5820'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1.5;
      ctx_.beginPath(); ctx_.rect(-17,-2.5,34,5); ctx_.fill(); ctx_.stroke();
      ctx_.restore();
      // Blade
      const bpx=Math.cos(_2hA), bpy=-Math.sin(_2hA);
      ctx_.fillStyle='#9898bc'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1.2;
      ctx_.beginPath();
      ctx_.moveTo(_fwx-bpx*_bladeW,_fwy-bpy*_bladeW);
      ctx_.lineTo(_fwx+bpx*_bladeW,_fwy+bpy*_bladeW);
      ctx_.lineTo(bEndX,bEndY); ctx_.closePath(); ctx_.fill(); ctx_.stroke();
      ctx_.strokeStyle='rgba(200,200,230,0.42)'; ctx_.lineWidth=1.2;
      ctx_.beginPath(); ctx_.moveTo(_fwx,_fwy); ctx_.lineTo(_fwx+Math.sin(_2hA)*_bladeLen*0.85,_fwy+Math.cos(_2hA)*_bladeLen*0.85); ctx_.stroke();

    } else {
      // 1H: grip extends from front wrist
      const _gripLen=13, _bladeLen=58, _bladeW=3.5;
      const gx=_fwx+Math.sin(swa)*_gripLen, gy=_fwy+Math.cos(swa)*_gripLen;
      const bEndX=gx+Math.sin(swa)*_bladeLen, bEndY=gy+Math.cos(swa)*_bladeLen;
      // Grip
      ctx_.strokeStyle='#5a3818'; ctx_.lineWidth=6; ctx_.lineCap='round';
      ctx_.beginPath(); ctx_.moveTo(_fwx,_fwy); ctx_.lineTo(gx,gy); ctx_.stroke();
      // Leather strips
      ctx_.strokeStyle='rgba(140,90,30,0.55)'; ctx_.lineWidth=1;
      for(let gi=1;gi<3;gi++){
        const gf=gi/3;
        const gpx=_fwx+Math.sin(swa)*_gripLen*gf, gpy=_fwy+Math.cos(swa)*_gripLen*gf;
        ctx_.beginPath();
        ctx_.moveTo(gpx-Math.cos(swa)*3.5,gpy+Math.sin(swa)*3.5);
        ctx_.lineTo(gpx+Math.cos(swa)*3.5,gpy-Math.sin(swa)*3.5);
        ctx_.stroke();
      }
      // Pommel
      ctx_.fillStyle='#8a6828'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1.5;
      ctx_.beginPath(); ctx_.arc(_fwx,_fwy,4,0,Math.PI*2); ctx_.fill(); ctx_.stroke();
      // Crossguard
      ctx_.save(); ctx_.translate(gx,gy); ctx_.rotate(swa);
      ctx_.fillStyle='#8a7030'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1.5;
      ctx_.beginPath(); ctx_.rect(-11,-2,22,4); ctx_.fill(); ctx_.stroke();
      ctx_.restore();
      // Blade
      const bpx=Math.cos(swa), bpy=-Math.sin(swa);
      ctx_.fillStyle='#b8b8d0'; ctx_.strokeStyle=_SK.outline; ctx_.lineWidth=1.2;
      ctx_.beginPath();
      ctx_.moveTo(gx-bpx*_bladeW,gy-bpy*_bladeW);
      ctx_.lineTo(gx+bpx*_bladeW,gy+bpy*_bladeW);
      ctx_.lineTo(bEndX,bEndY); ctx_.closePath(); ctx_.fill(); ctx_.stroke();
      ctx_.strokeStyle='rgba(200,200,230,0.42)'; ctx_.lineWidth=1.2;
      ctx_.beginPath(); ctx_.moveTo(gx,gy); ctx_.lineTo(gx+Math.sin(swa)*_bladeLen*0.85,gy+Math.cos(swa)*_bladeLen*0.85); ctx_.stroke();
    }
  }

  // Neck + skull (eye colour reflects branch)
  const _eyeCol = branch==='A' ? '#4488ff' : branch==='B' ? '#ff3300' : '#30ff60';
  _skBone(HX,SPINE_TOP,HX,NECK_Y,2.8);
  _skSkull(HX,HEAD_Y,wc*0.06,jawOpen,_eyeCol);
  ctx_.restore();
}

// ═══════════════════════════════════════════════════════════
//  drawSkeletonMonster — animation state + drawSkeleton call
//  (glue code extracted from Unit.draw())
// ═══════════════════════════════════════════════════════════
function drawSkeletonMonster(unit, camY) {
    if (unit._skT === undefined) {
        unit._skT         = Math.random() * Math.PI * 2;
        unit._skDir       = 1;
        unit._skAtkP      = 0;
        unit._skPrevAtkCd = unit.attackCooldown || 0;
        unit._skPrevX     = unit.x;
        unit._skLastT     = _frameNow;
    }
    const _skDt  = Math.min((_frameNow - unit._skLastT) / 1000, 0.05);
    unit._skLastT = _frameNow;

    if (unit.state === 'fight') {
        const _skH = units.find(u => u.type === 'hero' && u.floorIdx === unit.floorIdx && u.hp > 0);
        if (_skH) unit._skDir = _skH.x > unit.x ? 1 : -1;
    } else if (Math.abs(unit.x - unit._skPrevX) > 0.2) {
        unit._skDir = unit.x > unit._skPrevX ? 1 : -1;
    }
    unit._skPrevX = unit.x;

    const _skAcd = unit.attackCooldown || 0;
    if (_skAcd > (unit._skPrevAktCd || 0) + 3) { unit._skAtkP = 0.01; }
    unit._skPrevAktCd = _skAcd;

    if (unit._skAtkP > 0) {
        unit._skAtkP += _skDt / 1.1;
        if (unit._skAtkP >= 1) unit._skAtkP = 0;
    }

    unit._skT += _skDt * (unit.state === 'idle' ? 0.8 : 2.2);

    const _skSc   = unit.size * 0.015;
    const _skHipY = (unit.y - camY) - 50 * _skSc;
    drawSkeleton(ctx, unit.x, _skHipY, unit._skT, unit._skDir, _skSc, unit._skAtkP || 0, unit._branch || '');
    unit._hpBarY = _skHipY - 80 * _skSc - 22;
}
