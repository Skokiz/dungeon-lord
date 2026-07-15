// hero_flat.js — Hero drawing functions for Dungeon Lord
// Provides: drawHeroFlat (recruit), drawHeroRecruit2, drawHeroSoldier
//
// Each function signature: fn(ctx, p) → hpBarY
// p = { CX, shdY, hipY, hdCY, hdR, CY0, H,
//        roD, roT, ap, wdup, strk, recv, wc, state, bodyCol, helmetCol }

// ── Module-level drawing context (set on each call) ──────────────────────
var _hCtx, _hOL;

function _hRr(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  _hCtx.beginPath();
  _hCtx.moveTo(x+r,y); _hCtx.lineTo(x+w-r,y); _hCtx.arcTo(x+w,y,x+w,y+r,r);
  _hCtx.lineTo(x+w,y+h-r); _hCtx.arcTo(x+w,y+h,x+w-r,y+h,r);
  _hCtx.lineTo(x+r,y+h); _hCtx.arcTo(x,y+h,x,y+h-r,r);
  _hCtx.lineTo(x,y+r); _hCtx.arcTo(x,y,x+r,y,r);
  _hCtx.closePath();
}

function _hBox(x,y,w,h,r,fill,stroke,lw){
  _hRr(x,y,w,h,r); _hCtx.fillStyle=fill; _hCtx.fill();
  if(stroke){_hCtx.strokeStyle=stroke;_hCtx.lineWidth=lw||_hOL;_hCtx.stroke();}
}

function _hCapsule(x1,y1,x2,y2,r,fill,stroke){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1;
  const nx=-dy/L,ny=dx/L,a=Math.atan2(dy,dx);
  _hCtx.fillStyle=fill;
  _hCtx.beginPath();
  _hCtx.moveTo(x1+nx*r,y1+ny*r); _hCtx.lineTo(x2+nx*r,y2+ny*r);
  _hCtx.lineTo(x2-nx*r,y2-ny*r); _hCtx.lineTo(x1-nx*r,y1-ny*r);
  _hCtx.closePath(); _hCtx.fill();
  _hCtx.beginPath(); _hCtx.arc(x1,y1,r,0,Math.PI*2); _hCtx.fill();
  _hCtx.beginPath(); _hCtx.arc(x2,y2,r,0,Math.PI*2); _hCtx.fill();
  if(stroke){
    _hCtx.strokeStyle=stroke; _hCtx.lineWidth=_hOL; _hCtx.lineCap='round';
    _hCtx.beginPath(); _hCtx.arc(x1,y1,r,a+Math.PI/2,a+Math.PI*1.5,false); _hCtx.stroke();
    _hCtx.beginPath(); _hCtx.arc(x2,y2,r,a-Math.PI/2,a+Math.PI/2,false); _hCtx.stroke();
    _hCtx.beginPath();
    _hCtx.moveTo(x1+nx*r,y1+ny*r); _hCtx.lineTo(x2+nx*r,y2+ny*r);
    _hCtx.moveTo(x1-nx*r,y1-ny*r); _hCtx.lineTo(x2-nx*r,y2-ny*r);
    _hCtx.stroke();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  drawHeroFlat — Recruit I (default animated hero)
// ═══════════════════════════════════════════════════════════════════════════
function drawHeroFlat(ctx, p) {
  _hCtx = ctx;
  const {CX, CY0, H, roD: dir, roT, ap, wdup: wd, strk: sk, recv: rv, wc, state: st} = p;

  const S = H * 0.97;
  _hOL = S * 0.038;
  const BY = CY0;

  const BW = S*0.36, BH = S*0.56, R = S*0.24, LW = S*0.12, LH = S*0.17;
  const bodyBot = BY, bodyTop = BY - BH, legTop = BY - LH;
  const hdCY = bodyTop - R*0.90;

  const BK='#000000',WH='#ffffff';
  const SKIN='#ffddb8';
  const RED='#ee4433',REDHI='rgba(255,110,70,0.32)';
  const PLATE='#dde4ee',PLATEH='rgba(245,255,255,0.65)';
  const HELM='#d0d8e4',HELMDK='#5a7088';
  const LTHR='#7a5530',BOOT='#3a2210';
  const BELT='#422a10',GOLD='#ffd030';

  // ── LEGS ────────────────────────────────────────────────────────────────
  const legSwing = st==='move'? wc*0.32 : st==='idle'? Math.sin(roT*0.5)*0.04 : 0;

  ctx.save();
  ctx.translate(CX - dir*LW*0.72, legTop);
  ctx.rotate(-legSwing*dir);
  _hBox(-LW, 0, LW*2, LH*0.58, LW*0.5, '#3a2412', BK, _hOL*0.80);
  _hBox(-LW*1.2, LH*0.50, LW*2.4, LH*0.50, LW*0.48, '#201208', BK, _hOL*0.75);
  ctx.restore();

  ctx.save();
  ctx.translate(CX + dir*LW*0.72, legTop);
  ctx.rotate(legSwing*dir);
  _hBox(-LW, 0, LW*2, LH*0.58, LW*0.5, LTHR, BK, _hOL*0.80);
  _hBox(-LW*1.2, LH*0.50, LW*2.4, LH*0.50, LW*0.48, BOOT, BK, _hOL*0.75);
  ctx.restore();

  // ── BODY ────────────────────────────────────────────────────────────────
  _hBox(CX-BW, bodyTop, BW*2, BH, BW*0.20, RED, BK);
  _hRr(CX-BW+_hOL, bodyTop+_hOL, BW*0.42, BH-_hOL*2, BW*0.16);
  ctx.fillStyle=REDHI; ctx.fill();

  const ptT=bodyTop+BH*0.04, ptW=BW*0.80, ptH=BH*0.48;
  _hBox(CX-ptW, ptT, ptW*2, ptH, ptW*0.15, PLATE, BK, _hOL*0.88);
  _hRr(CX-ptW+_hOL, ptT+_hOL, ptW*0.55, ptH*0.42, ptW*0.10);
  ctx.fillStyle=PLATEH; ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.13)'; ctx.lineWidth=_hOL*0.42; ctx.lineCap='butt';
  ctx.beginPath(); ctx.moveTo(CX, ptT+ptH*0.09); ctx.lineTo(CX, ptT+ptH*0.88); ctx.stroke();

  [-1,1].forEach(sd=>{
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(CX+sd*BW*0.96, bodyTop+BH*0.12, BW*0.20, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.82; ctx.stroke();
    _hRr(CX+sd*BW*(0.96-0.10)-BW*0.09, bodyTop+BH*0.06, BW*0.18, BH*0.06, BW*0.06);
    ctx.fillStyle=PLATEH; ctx.fill();
  });

  const beltY=bodyTop+BH*0.72;
  _hBox(CX-BW*1.06, beltY, BW*2.12, BH*0.14, BH*0.022, BELT, BK, _hOL*0.78);
  const bkW=BW*0.20;
  _hBox(CX-bkW*0.5, beltY+BH*0.012, bkW, BH*0.115, BH*0.020, GOLD, BK, _hOL*0.68);
  _hRr(CX-bkW*0.28, beltY+BH*0.034, bkW*0.56, BH*0.060, BH*0.012);
  ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fill();

  // ── HEAD ────────────────────────────────────────────────────────────────
  ctx.fillStyle=SKIN; ctx.beginPath(); ctx.arc(CX,hdCY,R,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL; ctx.stroke();

  const eyY=hdCY-R*0.08;
  [-1,1].forEach(sd=>{
    const ex=CX+sd*R*0.30;
    ctx.fillStyle='rgba(40,18,6,0.13)';
    ctx.beginPath(); ctx.ellipse(ex,eyY,R*0.220,R*0.170,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=WH;
    ctx.beginPath(); ctx.ellipse(ex,eyY,R*0.182,R*0.135,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.55; ctx.stroke();
    ctx.fillStyle='#2c1a06';
    ctx.beginPath(); ctx.arc(ex,eyY,R*0.090,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=BK;
    ctx.beginPath(); ctx.arc(ex,eyY,R*0.048,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=WH;
    ctx.beginPath(); ctx.arc(ex+R*0.038,eyY-R*0.038,R*0.026,0,Math.PI*2); ctx.fill();
  });
  ctx.strokeStyle='#6a4818'; ctx.lineWidth=_hOL*0.72; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(CX-R*0.46,eyY-R*0.30); ctx.lineTo(CX-R*0.13,eyY-R*0.36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX+R*0.13,eyY-R*0.36); ctx.lineTo(CX+R*0.46,eyY-R*0.30); ctx.stroke();
  ctx.fillStyle='rgba(175,95,45,0.35)';
  ctx.beginPath(); ctx.arc(CX+R*0.06,hdCY+R*0.21,R*0.078,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#7a4020'; ctx.lineWidth=_hOL*0.68; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(CX-R*0.21,hdCY+R*0.44);
  ctx.quadraticCurveTo(CX,hdCY+R*0.63,CX+R*0.21,hdCY+R*0.44);
  ctx.stroke();

  // ── HELMET ──────────────────────────────────────────────────────────────
  const fhY=hdCY-R*0.42;
  ctx.fillStyle='#404852';
  ctx.beginPath(); ctx.arc(CX,hdCY,R*1.04,Math.PI*0.20,Math.PI*0.80); ctx.fill();
  ctx.beginPath(); ctx.arc(CX,hdCY,R*1.04,-Math.PI*0.82,-Math.PI*0.18); ctx.fill();
  ctx.fillStyle=HELM;
  ctx.beginPath(); ctx.arc(CX,hdCY-R*0.04,R*1.03,Math.PI,Math.PI*2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL; ctx.stroke();
  ctx.fillStyle=WH; ctx.globalAlpha=0.46;
  ctx.beginPath(); ctx.ellipse(CX-R*0.26,hdCY-R*0.68,R*0.24,R*0.10,-0.38,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  _hBox(CX-R*1.09,fhY-R*0.09,R*2.18,R*0.16,R*0.042,HELMDK,BK,_hOL*0.90);
  [-1,1].forEach(sd=>{
    ctx.fillStyle=HELMDK;
    ctx.beginPath();
    ctx.moveTo(CX+sd*R*0.92,fhY-R*0.09); ctx.lineTo(CX+sd*R*1.14,fhY-R*0.09);
    ctx.lineTo(CX+sd*R*1.14,fhY+R*0.37); ctx.lineTo(CX+sd*R*0.92,fhY+R*0.29);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.74; ctx.stroke();
  });
  _hRr(CX-R*0.065,fhY-R*0.03,R*0.130,hdCY+R*0.38-fhY+R*0.04,R*0.040);
  ctx.fillStyle=HELMDK; ctx.fill(); ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.74; ctx.stroke();
  ctx.fillStyle=WH; ctx.globalAlpha=0.26;
  ctx.fillRect(CX-R*0.016,fhY,R*0.032,hdCY+R*0.36-fhY); ctx.globalAlpha=1;

  // ── FLOATING OFF-ARM (shield side) ──────────────────────────────────────
  {
    const na=-dir*0.20, wa=-dir*0.35, sa=dir*0.22;
    const oa=na+(wa-na)*wd+(sa-na)*sk-(sa-na)*rv*0.4+(st==='move'?dir*wc*0.20:0);
    const hx=Math.cos(roT*0.90)*S*0.008, hy=Math.sin(roT*1.10)*S*0.007;
    const ox=CX-dir*BW*1.02+hx, oy=bodyTop+BH*0.20+hy;
    const el=S*0.32;
    const ex=ox+Math.sin(oa)*el, ey=oy+Math.cos(oa)*el;
    const foa=oa+dir*0.20;
    const hndX2=ex+Math.sin(foa)*el*0.60, hndY2=ey+Math.cos(foa)*el*0.60;
    ctx.fillStyle='rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(ox,oy+S*0.012,S*0.072,S*0.018,0,0,Math.PI*2); ctx.fill();
    _hCapsule(ox,oy,ex,ey,S*0.055,PLATE,BK);
    _hCapsule(ex,ey,hndX2,hndY2,S*0.044,SKIN,BK);
    ctx.fillStyle=SKIN; ctx.beginPath(); ctx.arc(hndX2,hndY2,S*0.044,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.75; ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(ox,oy+S*0.014,S*0.064,S*0.016,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.058,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.85; ctx.stroke();
    ctx.fillStyle=PLATEH;
    ctx.beginPath(); ctx.arc(ox-S*0.018,oy-S*0.018,S*0.022,0,Math.PI*2); ctx.fill();
  }

  // ── FLOATING SWORD ARM (weapon side) ────────────────────────────────────
  {
    const aN=dir*0.32, aW=dir*(-0.80), aS=dir*1.42;
    let armA;
    if(ap>0){
      armA=aN+(aW-aN)*wd+(aS-aN)*sk-(aS-aN)*rv*0.40;
    } else if(st==='fight'){
      armA=dir*(-0.06)+Math.sin(roT*1.8)*0.06;
    } else if(st==='move'){
      armA=aN-dir*wc*0.26;
    } else {
      armA=aN+Math.sin(roT*0.85)*0.07;
    }

    const hx=Math.cos(roT*1.0)*S*0.010, hy=Math.sin(roT*1.3)*S*0.009;
    const ox=CX+dir*BW*1.02+hx, oy=bodyTop+BH*0.18+hy;
    const el=S*0.34;
    const ex=ox+Math.sin(armA)*el, ey=oy+Math.cos(armA)*el;
    const fgA=armA+dir*0.15;
    const hndX=ex+Math.sin(fgA)*el*0.62, hndY=ey+Math.cos(fgA)*el*0.62;
    const sL=S*0.62;
    const tipX=hndX+Math.sin(fgA)*sL, tipY=hndY+Math.cos(fgA)*sL;

    if(sk>0.06&&sk<0.94){
      const ta=sk*(1-sk)*4;
      ctx.save(); ctx.globalAlpha=ta*0.18;
      ctx.strokeStyle='#8090b0'; ctx.lineWidth=S*0.022; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(ox,oy,el+el*0.62+sL*0.50,dir>0?-Math.PI*0.76:-Math.PI*0.24,dir>0?-Math.PI*0.24:-Math.PI*0.76);
      ctx.stroke(); ctx.restore();
    }

    ctx.strokeStyle='#d0e0f0'; ctx.lineWidth=S*0.022; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(hndX,hndY); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.012; ctx.lineCap='butt';
    ctx.beginPath(); ctx.moveTo(hndX,hndY); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.50)'; ctx.lineWidth=S*0.006;
    ctx.beginPath(); ctx.moveTo(hndX+Math.cos(fgA)*dir*2,hndY+Math.sin(fgA)*dir*2); ctx.lineTo(tipX+Math.cos(fgA)*dir*2,tipY+Math.sin(fgA)*dir*2); ctx.stroke();
    const dl=Math.hypot(tipX-hndX,tipY-hndY)||1;
    const gx=hndX+(tipX-hndX)*0.14,gy=hndY+(tipY-hndY)*0.14;
    const px=-(tipY-hndY)/dl,py=(tipX-hndX)/dl;
    ctx.strokeStyle='#888878'; ctx.lineWidth=S*0.030; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(gx-px*S*0.12,gy-py*S*0.12); ctx.lineTo(gx+px*S*0.12,gy+py*S*0.12); ctx.stroke();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.022;
    ctx.beginPath(); ctx.moveTo(gx-px*S*0.12,gy-py*S*0.12); ctx.lineTo(gx+px*S*0.12,gy+py*S*0.12); ctx.stroke();
    ctx.fillStyle='#909080'; ctx.beginPath(); ctx.arc(hndX-Math.sin(fgA)*S*0.055,hndY-Math.cos(fgA)*S*0.055,S*0.026,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.014; ctx.stroke();

    _hCapsule(ox,oy,ex,ey,S*0.056,PLATE,BK);
    _hCapsule(ex,ey,hndX,hndY,S*0.046,SKIN,BK);
    ctx.fillStyle=SKIN; ctx.beginPath(); ctx.arc(hndX,hndY,S*0.046,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.76; ctx.stroke();

    ctx.fillStyle='rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(ox,oy+S*0.014,S*0.066,S*0.016,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.060,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.88; ctx.stroke();
    ctx.fillStyle=PLATEH;
    ctx.beginPath(); ctx.arc(ox-S*0.018,oy-S*0.018,S*0.024,0,Math.PI*2); ctx.fill();
  }

  return hdCY - R*1.10 - 12;
}

// ═══════════════════════════════════════════════════════════════════════════
//  drawHeroRecruit2 — Recruit II (Tier 2, gold accents, scar, longer sword)
// ═══════════════════════════════════════════════════════════════════════════
function drawHeroRecruit2(ctx, p) {
  _hCtx = ctx;
  const {CX, CY0, H, roD: dir, roT, ap, wdup: wd, strk: sk, recv: rv, wc, state: st} = p;

  const S = H * 0.97;
  _hOL = S * 0.038;
  const BY = CY0;

  const BW = S*0.36, BH = S*0.56, R = S*0.24, LW = S*0.12, LH = S*0.17;
  const bodyBot = BY, bodyTop = BY - BH, legTop = BY - LH;
  const hdCY = bodyTop - R*0.90;

  const BK='#000000',WH='#ffffff';
  const SKIN='#ffddb8';
  const RED='#ff4455',REDHI='rgba(255,130,90,0.35)';
  const REDDK='#bb2233';
  const PLATE='#e4eaf2',PLATEH='rgba(248,255,255,0.68)';
  const HELM='#d4dce8',HELMDK='#5a6878';
  const HELMGOLD='#e0aa22';
  const LTHR='#7a5530',BOOT='#3a2210';
  const BELT='#422a10',GOLD='#ffd030';
  const RANK='#e0aa22';

  // ── LEGS ────────────────────────────────────────────────────────────────
  const legSwing = st==='move'? wc*0.32 : st==='idle'? Math.sin(roT*0.5)*0.04 : 0;

  ctx.save();
  ctx.translate(CX - dir*LW*0.72, legTop);
  ctx.rotate(-legSwing*dir);
  _hBox(-LW, 0, LW*2, LH*0.58, LW*0.5, '#3a2412', BK, _hOL*0.80);
  _hBox(-LW*1.2, LH*0.50, LW*2.4, LH*0.50, LW*0.48, '#201208', BK, _hOL*0.75);
  ctx.restore();

  ctx.save();
  ctx.translate(CX + dir*LW*0.72, legTop);
  ctx.rotate(legSwing*dir);
  _hBox(-LW, 0, LW*2, LH*0.58, LW*0.5, LTHR, BK, _hOL*0.80);
  _hBox(-LW*1.2, LH*0.50, LW*2.4, LH*0.50, LW*0.48, BOOT, BK, _hOL*0.75);
  ctx.restore();

  // ── BODY ────────────────────────────────────────────────────────────────
  _hBox(CX-BW, bodyTop, BW*2, BH, BW*0.20, RED, BK);
  _hRr(CX-BW+_hOL, bodyTop+_hOL, BW*0.42, BH-_hOL*2, BW*0.16);
  ctx.fillStyle=REDHI; ctx.fill();
  // gold vertical stripe
  ctx.fillStyle=RANK; ctx.globalAlpha=0.50;
  ctx.fillRect(CX-S*0.018, bodyTop+BH*0.08, S*0.036, BH*0.60);
  ctx.globalAlpha=1;
  // horizontal rank notches
  ctx.strokeStyle='rgba(200,148,26,0.35)'; ctx.lineWidth=_hOL*0.45;
  [0.22, 0.42, 0.60].forEach(f=>{
    ctx.beginPath();
    ctx.moveTo(CX-BW*0.55, bodyTop+BH*f);
    ctx.lineTo(CX-S*0.025, bodyTop+BH*f);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX+S*0.025, bodyTop+BH*f);
    ctx.lineTo(CX+BW*0.55, bodyTop+BH*f);
    ctx.stroke();
  });

  const ptT=bodyTop+BH*0.04, ptW=BW*0.84, ptH=BH*0.50;
  _hBox(CX-ptW, ptT, ptW*2, ptH, ptW*0.15, PLATE, BK, _hOL*0.88);
  _hRr(CX-ptW+_hOL, ptT+_hOL, ptW*0.55, ptH*0.42, ptW*0.10);
  ctx.fillStyle=PLATEH; ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.13)'; ctx.lineWidth=_hOL*0.42; ctx.lineCap='butt';
  ctx.beginPath(); ctx.moveTo(CX, ptT+ptH*0.09); ctx.lineTo(CX, ptT+ptH*0.88); ctx.stroke();
  // rank button "II"
  ctx.fillStyle=RANK;
  ctx.beginPath(); ctx.arc(CX, ptT+ptH*0.30, S*0.028, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.55; ctx.stroke();
  ctx.fillStyle='rgba(255,255,200,0.70)';
  ctx.beginPath(); ctx.arc(CX-S*0.009, ptT+ptH*0.28, S*0.010, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=BK; ctx.font=`bold ${S*0.030}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('II', CX, ptT+ptH*0.30);

  [-1,1].forEach(sd=>{
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(CX+sd*BW*0.98, bodyTop+BH*0.12, BW*0.22, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.82; ctx.stroke();
    ctx.strokeStyle=RANK; ctx.lineWidth=_hOL*0.50; ctx.globalAlpha=0.70;
    ctx.beginPath(); ctx.arc(CX+sd*BW*0.98, bodyTop+BH*0.12, BW*0.22, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
    _hRr(CX+sd*BW*(0.98-0.10)-BW*0.09, bodyTop+BH*0.06, BW*0.18, BH*0.06, BW*0.06);
    ctx.fillStyle=PLATEH; ctx.fill();
  });

  const beltY=bodyTop+BH*0.72;
  _hBox(CX-BW*1.06, beltY, BW*2.12, BH*0.14, BH*0.022, BELT, BK, _hOL*0.78);
  const bkW=BW*0.20;
  _hBox(CX-bkW*0.5, beltY+BH*0.012, bkW, BH*0.115, BH*0.020, GOLD, BK, _hOL*0.68);
  _hRr(CX-bkW*0.28, beltY+BH*0.034, bkW*0.56, BH*0.060, BH*0.012);
  ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fill();

  // ── HEAD ────────────────────────────────────────────────────────────────
  ctx.fillStyle=SKIN; ctx.beginPath(); ctx.arc(CX,hdCY,R,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL; ctx.stroke();

  const eyY=hdCY-R*0.08;
  [-1,1].forEach(sd=>{
    const ex=CX+sd*R*0.30;
    ctx.fillStyle='rgba(40,18,6,0.13)';
    ctx.beginPath(); ctx.ellipse(ex,eyY,R*0.220,R*0.170,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=WH;
    ctx.beginPath(); ctx.ellipse(ex,eyY,R*0.182,R*0.135,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.55; ctx.stroke();
    ctx.fillStyle='#2c1a06';
    ctx.beginPath(); ctx.arc(ex,eyY,R*0.090,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=BK;
    ctx.beginPath(); ctx.arc(ex,eyY,R*0.048,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=WH;
    ctx.beginPath(); ctx.arc(ex+R*0.038,eyY-R*0.038,R*0.026,0,Math.PI*2); ctx.fill();
  });
  // brows (more stern)
  ctx.strokeStyle='#5a3c12'; ctx.lineWidth=_hOL*0.85; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(CX-R*0.50,eyY-R*0.28); ctx.lineTo(CX-R*0.11,eyY-R*0.42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX+R*0.11,eyY-R*0.42); ctx.lineTo(CX+R*0.50,eyY-R*0.28); ctx.stroke();
  // scar
  ctx.strokeStyle='rgba(160,80,40,0.55)'; ctx.lineWidth=_hOL*0.45; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(CX+R*0.38, hdCY-R*0.05);
  ctx.lineTo(CX+R*0.58, hdCY+R*0.18);
  ctx.stroke();
  // nose
  ctx.fillStyle='rgba(175,95,45,0.35)';
  ctx.beginPath(); ctx.arc(CX+R*0.06,hdCY+R*0.21,R*0.078,0,Math.PI*2); ctx.fill();
  // mouth (straight line — resolute)
  ctx.strokeStyle='#7a4020'; ctx.lineWidth=_hOL*0.68; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(CX-R*0.22,hdCY+R*0.44);
  ctx.lineTo(CX+R*0.22,hdCY+R*0.44);
  ctx.stroke();

  // ── HELMET (Tier II: gold band) ─────────────────────────────────────────
  const fhY=hdCY-R*0.42;
  ctx.fillStyle='#404852';
  ctx.beginPath(); ctx.arc(CX,hdCY,R*1.04,Math.PI*0.20,Math.PI*0.80); ctx.fill();
  ctx.beginPath(); ctx.arc(CX,hdCY,R*1.04,-Math.PI*0.82,-Math.PI*0.18); ctx.fill();
  ctx.fillStyle=HELM;
  ctx.beginPath(); ctx.arc(CX,hdCY-R*0.04,R*1.03,Math.PI,Math.PI*2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL; ctx.stroke();
  ctx.fillStyle=WH; ctx.globalAlpha=0.46;
  ctx.beginPath(); ctx.ellipse(CX-R*0.26,hdCY-R*0.68,R*0.24,R*0.10,-0.38,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  _hBox(CX-R*1.09,fhY-R*0.09,R*2.18,R*0.16,R*0.042,HELMDK,BK,_hOL*0.90);
  // gold band on visor
  ctx.fillStyle=HELMGOLD;
  ctx.fillRect(CX-R*1.05, fhY-R*0.04, R*2.10, R*0.06);
  ctx.strokeStyle='rgba(255,220,100,0.60)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(CX-R*1.05, fhY-R*0.04); ctx.lineTo(CX+R*1.05, fhY-R*0.04); ctx.stroke();
  // ear plates
  [-1,1].forEach(sd=>{
    ctx.fillStyle=HELMDK;
    ctx.beginPath();
    ctx.moveTo(CX+sd*R*0.92,fhY-R*0.09); ctx.lineTo(CX+sd*R*1.14,fhY-R*0.09);
    ctx.lineTo(CX+sd*R*1.14,fhY+R*0.37); ctx.lineTo(CX+sd*R*0.92,fhY+R*0.29);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.74; ctx.stroke();
    ctx.fillStyle=HELMGOLD;
    ctx.beginPath(); ctx.arc(CX+sd*R*1.03, fhY+R*0.10, R*0.055, 0, Math.PI*2); ctx.fill();
  });
  _hRr(CX-R*0.065,fhY-R*0.03,R*0.130,hdCY+R*0.38-fhY+R*0.04,R*0.040);
  ctx.fillStyle=HELMDK; ctx.fill(); ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.74; ctx.stroke();
  ctx.fillStyle=WH; ctx.globalAlpha=0.26;
  ctx.fillRect(CX-R*0.016,fhY,R*0.032,hdCY+R*0.36-fhY); ctx.globalAlpha=1;

  // ── FLOATING OFF-ARM (shield side) ──────────────────────────────────────
  {
    const na=-dir*0.20, wa=-dir*0.35, sa=dir*0.22;
    const oa=na+(wa-na)*wd+(sa-na)*sk-(sa-na)*rv*0.4+(st==='move'?dir*wc*0.20:0);
    const hx=Math.cos(roT*0.90)*S*0.008, hy=Math.sin(roT*1.10)*S*0.007;
    const ox=CX-dir*BW*1.02+hx, oy=bodyTop+BH*0.20+hy;
    const el=S*0.32;
    const ex=ox+Math.sin(oa)*el, ey=oy+Math.cos(oa)*el;
    const foa=oa+dir*0.20;
    const hndX2=ex+Math.sin(foa)*el*0.60, hndY2=ey+Math.cos(foa)*el*0.60;
    ctx.fillStyle='rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(ox,oy+S*0.012,S*0.072,S*0.018,0,0,Math.PI*2); ctx.fill();
    _hCapsule(ox,oy,ex,ey,S*0.058,PLATE,BK);
    _hCapsule(ex,ey,hndX2,hndY2,S*0.046,SKIN,BK);
    ctx.fillStyle=SKIN; ctx.beginPath(); ctx.arc(hndX2,hndY2,S*0.046,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.75; ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(ox,oy+S*0.014,S*0.064,S*0.016,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.062,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.85; ctx.stroke();
    ctx.strokeStyle=RANK; ctx.lineWidth=_hOL*0.45; ctx.globalAlpha=0.65;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.062,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
    ctx.fillStyle=PLATEH;
    ctx.beginPath(); ctx.arc(ox-S*0.018,oy-S*0.018,S*0.022,0,Math.PI*2); ctx.fill();
  }

  // ── FLOATING SWORD ARM (weapon side) ────────────────────────────────────
  {
    const aN=dir*0.32, aW=dir*(-0.80), aS=dir*1.42;
    let armA;
    if(ap>0){
      armA=aN+(aW-aN)*wd+(aS-aN)*sk-(aS-aN)*rv*0.40;
    } else if(st==='fight'){
      armA=dir*(-0.06)+Math.sin(roT*1.8)*0.06;
    } else if(st==='move'){
      armA=aN-dir*wc*0.26;
    } else {
      armA=aN+Math.sin(roT*0.85)*0.07;
    }

    const hx=Math.cos(roT*1.0)*S*0.010, hy=Math.sin(roT*1.3)*S*0.009;
    const ox=CX+dir*BW*1.02+hx, oy=bodyTop+BH*0.18+hy;
    const el=S*0.34;
    const ex=ox+Math.sin(armA)*el, ey=oy+Math.cos(armA)*el;
    const fgA=armA+dir*0.15;
    const hndX=ex+Math.sin(fgA)*el*0.62, hndY=ey+Math.cos(fgA)*el*0.62;
    const sL=S*0.70;
    const tipX=hndX+Math.sin(fgA)*sL, tipY=hndY+Math.cos(fgA)*sL;

    if(sk>0.06&&sk<0.94){
      const ta=sk*(1-sk)*4;
      ctx.save(); ctx.globalAlpha=ta*0.22;
      ctx.strokeStyle='#90a8cc'; ctx.lineWidth=S*0.026; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(ox,oy,el+el*0.62+sL*0.50,dir>0?-Math.PI*0.76:-Math.PI*0.24,dir>0?-Math.PI*0.24:-Math.PI*0.76);
      ctx.stroke(); ctx.restore();
    }

    ctx.strokeStyle='#c8ddf8'; ctx.lineWidth=S*0.026; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(hndX,hndY); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.013; ctx.lineCap='butt';
    ctx.beginPath(); ctx.moveTo(hndX,hndY); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.65)'; ctx.lineWidth=S*0.007;
    ctx.beginPath(); ctx.moveTo(hndX+Math.cos(fgA)*dir*2,hndY+Math.sin(fgA)*dir*2); ctx.lineTo(tipX+Math.cos(fgA)*dir*2,tipY+Math.sin(fgA)*dir*2); ctx.stroke();
    const dl=Math.hypot(tipX-hndX,tipY-hndY)||1;
    const gx=hndX+(tipX-hndX)*0.14,gy=hndY+(tipY-hndY)*0.14;
    const px=-(tipY-hndY)/dl,py=(tipX-hndX)/dl;
    ctx.strokeStyle=GOLD; ctx.lineWidth=S*0.033; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(gx-px*S*0.135,gy-py*S*0.135); ctx.lineTo(gx+px*S*0.135,gy+py*S*0.135); ctx.stroke();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.022;
    ctx.beginPath(); ctx.moveTo(gx-px*S*0.135,gy-py*S*0.135); ctx.lineTo(gx+px*S*0.135,gy+py*S*0.135); ctx.stroke();
    ctx.fillStyle=GOLD; ctx.beginPath(); ctx.arc(hndX-Math.sin(fgA)*S*0.058,hndY-Math.cos(fgA)*S*0.058,S*0.030,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.015; ctx.stroke();

    _hCapsule(ox,oy,ex,ey,S*0.058,PLATE,BK);
    _hCapsule(ex,ey,hndX,hndY,S*0.048,SKIN,BK);
    ctx.fillStyle=SKIN; ctx.beginPath(); ctx.arc(hndX,hndY,S*0.048,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.76; ctx.stroke();

    ctx.fillStyle='rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(ox,oy+S*0.014,S*0.068,S*0.016,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.063,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.88; ctx.stroke();
    ctx.strokeStyle=RANK; ctx.lineWidth=_hOL*0.45; ctx.globalAlpha=0.65;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.063,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
    ctx.fillStyle=PLATEH;
    ctx.beginPath(); ctx.arc(ox-S*0.018,oy-S*0.018,S*0.024,0,Math.PI*2); ctx.fill();
  }

  return hdCY - R*1.10 - 12;
}

// ── Scribble primitives (module-level, use _hCtx) ──────────────────────
var _scrRoT = 0, _scrSd = 42;
function _scrNoiseSeed(s){ _scrSd = s; }
function _scrNoise01(){
  _scrSd = (_scrSd * 16807) % 2147483647;
  return (_scrSd & 0x7fffffff) / 2147483647;
}
function _scrOval(cx,cy,rx,ry,j,so){
  j=j||2.0; _scrNoiseSeed(Math.floor(_scrRoT*0.3)*97+(so||0));
  var N=40; _hCtx.beginPath();
  for(var i=0;i<=N;i++){
    var a=(i/N)*Math.PI*2,jx=(_scrNoise01()-0.5)*j*2,jy=(_scrNoise01()-0.5)*j*2;
    var px=cx+Math.cos(a)*rx+jx,py=cy+Math.sin(a)*ry+jy;
    if(i===0)_hCtx.moveTo(px,py);else _hCtx.lineTo(px,py);
  } _hCtx.closePath();
}
function _scrCircle(cx,cy,r,j,so){ _scrOval(cx,cy,r,r,j,so); }
function _scrSeg(x1,y1,x2,y2,j,so){
  j=j||1.5; _scrNoiseSeed(Math.floor(_scrRoT*0.3)*71+(so||0));
  var N=10; _hCtx.beginPath();
  for(var i=0;i<=N;i++){
    var t=i/N,px=x1+(x2-x1)*t+(i>0&&i<N?(_scrNoise01()-0.5)*j*2:0);
    var py=y1+(y2-y1)*t+(i>0&&i<N?(_scrNoise01()-0.5)*j*2:0);
    if(i===0)_hCtx.moveTo(px,py);else _hCtx.lineTo(px,py);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  drawHeroScribble — Scribble-style humanoid recruit (tabard, plate, helmet)
// ═══════════════════════════════════════════════════════════════════════════
function drawHeroScribble(ctx, p) {
  _hCtx = ctx;
  var CX=p.CX, CY0=p.CY0, H=p.H, dir=p.roD, roT=p.roT, ap=p.ap;
  var wc=p.wc, st=p.state;
  _scrRoT = roT;

  var TAU=Math.PI*2, S=H*0.90, OL=S*0.026, J=S*0.012;
  _hOL = OL;
  function _lerp(a,b,t){ return a+(b-a)*t; }
  function _eIQ(t){ return t*t; }
  function _eOQ(t){ return 1-(1-t)*(1-t); }
  function _eIOC(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
  function _eOB(t){ var c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); }
  function _eOE(t){ if(t===0||t===1)return t; return Math.pow(2,-10*t)*Math.sin((t*10-0.75)*TAU/3)+1; }

  // Palette
  var OUTL='#000000', EYE_COL='#1a1410';
  var SKIN='#ffddb8', SKIN_DK='#e0b078';
  var TABARD='#ee4040', TABARD_DK='#bb3333';
  var PLATE='#c8d4e0', PLATE_DK='#a0b0c0';
  var HELM='#b8c8d4', HELM_DK='#708898';
  var BOOT='#4a3820', BOOT_DK='#2c1c0e';
  var BELT_C='#4a2a14', GOLD_C='#ffc030';
  var BLADE='#c0d0e0';

  var ATK_WD=0.22, ATK_SK=0.35;
  var flY=CY0, t_stride=((roT%TAU)/TAU);

  // body bob
  var bodyBobY=0;
  if(st==='move'){
    var rawBob=Math.cos(t_stride*TAU*2);
    bodyBobY=-(rawBob>0?_eOQ(rawBob):-_eIQ(-rawBob))*S*0.038;
  } else if(st==='idle') bodyBobY=Math.sin(roT*0.6)*S*0.006;
  else if(st==='fight') bodyBobY=Math.sin(roT*1.2)*S*0.008;

  var latSway=st==='move'?Math.sin(t_stride*TAU)*S*0.018:0;
  var hipTw=st==='move'?dir*Math.sin(t_stride*TAU)*0.10:0;

  // attack dynamics
  var atkLean=0,atkSqX=1,atkSqY=1,atkShX=0;
  if(ap>0){
    if(ap<ATK_WD){
      var pw=_eOQ(ap/ATK_WD);
      atkLean=-dir*pw*0.26; atkSqY=1-pw*0.04; atkSqX=1/atkSqY; atkShX=-dir*pw*S*0.04;
    } else if(ap<ATK_SK){
      var ps=(ap-ATK_WD)/(ATK_SK-ATK_WD);
      atkLean=dir*_lerp(-0.26,0.38,ps); atkSqY=_lerp(0.96,0.90,ps); atkSqX=1/atkSqY; atkShX=dir*_lerp(-S*0.04,S*0.05,ps);
    } else {
      var pr=(ap-ATK_SK)/(1-ATK_SK),prB=_eOB(pr);
      atkLean=dir*_lerp(0.38,0,prB); atkSqY=_lerp(0.90,1,_eOE(pr)); atkSqX=1/atkSqY; atkShX=dir*_lerp(S*0.05,0,prB);
    }
  }

  var cX=CX+latSway+atkShX, BY=flY-S*0.30+bodyBobY;
  var BRX=S*0.19, BRY=S*0.26, bodyCY=BY-BRY;
  var headR=S*0.12;
  var bodyAng=hipTw+atkLean;

  // ── LEGS (with boots) ──
  var legLen=S*0.34,footR=S*0.046,legTh=S*0.026,legSpr=S*0.30,footArc=legLen*0.55;

  function drawLeg(phase,sb,isDk){
    var fX,fY;
    if(st==='move'){
      if(phase<0.62){
        var sp=_eIOC(phase/0.62); fX=cX+dir*_lerp(legSpr*0.5,-legSpr*0.5,sp); fY=flY;
      } else {
        var swP=(phase-0.62)/0.38;
        fX=cX+dir*_lerp(-legSpr*0.5,legSpr*0.5,_eIOC(swP)); fY=flY-footArc*Math.sin(swP*Math.PI);
      }
    } else if(st==='idle'){
      var sd=(sb===100)?-1:1; fX=cX+sd*S*0.06+Math.sin(roT*0.4+sb)*S*0.003; fY=flY;
    } else {
      var sd2=(sb===100)?-1:1; fX=cX+sd2*S*0.09+Math.sin(roT*0.8+sb)*S*0.004; fY=flY;
    }
    // Hip attachment follows body rotation
    var ls=(sb===100)?-1:1;
    var hlx=ls*BRX*0.25,hly=BRY*0.92,hsx=hlx*atkSqX,hsy=hly*atkSqY;
    var lx=cX+Math.cos(bodyAng)*hsx-Math.sin(bodyAng)*hsy;
    var ly=bodyCY+Math.sin(bodyAng)*hsx+Math.cos(bodyAng)*hsy;
    var uL=legLen*0.50,lL=legLen*0.54,dx=fX-lx,dy=fY-ly,dist=Math.hypot(dx,dy),mR=uL+lL-2;
    var kX,kY;
    if(dist>=mR){kX=lx+dx*0.5;kY=ly+dy*0.5;}
    else{var cc=Math.max(-1,Math.min(1,(uL*uL+dist*dist-lL*lL)/(2*uL*dist)));
      var aa=Math.acos(cc),ba=Math.atan2(dy,dx);
      kX=lx+Math.cos(ba-aa*dir)*uL;kY=ly+Math.sin(ba-aa*dir)*uL;}
    // Upper leg
    ctx.strokeStyle=OUTL;ctx.lineWidth=legTh*1.15;ctx.lineCap='round';
    _scrSeg(lx,ly,kX,kY,J,sb);ctx.stroke();
    // Lower leg (boot shaft)
    ctx.lineWidth=legTh*1.1;
    _scrSeg(kX,kY,fX,fY,J,sb+1);ctx.stroke();
    // Boot foot
    _scrCircle(fX,fY,footR,J*0.6,sb+2);
    ctx.fillStyle=isDk?BOOT_DK:BOOT;ctx.fill();
    ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.8;ctx.stroke();
    // Boot top band
    var btX=kX+(fX-kX)*0.15, btY=kY+(fY-kY)*0.15;
    _scrCircle(btX,btY,footR*0.6,J*0.3,sb+3);
    ctx.fillStyle=isDk?'#201008':'#2a1810';ctx.fill();
    ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.4;ctx.stroke();
  }
  drawLeg(t_stride,100,true);
  drawLeg((t_stride+0.5)%1,110,false);

  // shadow
  var sg=ctx.createRadialGradient(cX,flY+3,2,cX,flY+3,BRX*2.0);
  sg.addColorStop(0,'rgba(0,0,0,0.18)');sg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sg;ctx.fillRect(cX-BRX*2.5,flY-2,BRX*5,20);

  // ── ARMS ──
  var armL=S*0.26,foreL=S*0.20,handR=S*0.038,armTh=S*0.022,armLag=0.10;
  var eyeSq=(ap>=ATK_WD&&ap<ATK_SK+0.08)?0.6:1.0;

  function compSwing(lp,isW){
    var ap2=((lp+armLag)%1);
    if(st==='move')return-dir*Math.sin(ap2*TAU)*0.45;
    if(st==='idle')return dir*0.25+Math.sin(roT*0.7+(isW?0:2))*0.06;
    return dir*(isW?0.10:0.20)+Math.sin(roT*1.2+(isW?0:1.5))*0.08;
  }

  var wAA=null,wFA=null;
  if(ap>0){
    var rest=dir*0.25;
    if(ap<ATK_WD){var pw2=_eOQ(ap/ATK_WD);wAA=_lerp(rest,-dir*1.30,pw2);wFA=_lerp(0,-dir*0.45,pw2);}
    else if(ap<ATK_SK){var ps2=(ap-ATK_WD)/(ATK_SK-ATK_WD);wAA=_lerp(-dir*1.30,dir*1.80,ps2);wFA=_lerp(-dir*0.45,dir*0.55,ps2);}
    else{var pr2=(ap-ATK_SK)/(1-ATK_SK),prB2=_eOB(pr2);wAA=_lerp(dir*1.80,dir*0.25,prB2);wFA=_lerp(dir*0.55,0,_eIOC(pr2));}
  }

  function drawArm(isW,lp,sb){
    var as=isW?1:-1;
    var oX=cX+dir*as*BRX*0.92, oY=bodyCY-BRY*0.38;
    var uA; if(isW&&wAA!==null)uA=wAA;else uA=compSwing(lp,isW);
    var eX=oX+Math.sin(uA)*armL,eY=oY+Math.cos(uA)*armL;
    var fA;
    if(isW&&wFA!==null)fA=uA+wFA;
    else{var dp=((lp+armLag+0.05)%1);fA=st==='move'?uA+(-Math.sin(dp*TAU))*0.20:uA+0.15;}
    var hX=eX+Math.sin(fA)*foreL,hY=eY+Math.cos(fA)*foreL;

    // Sword
    if(isW){
      var sL=S*0.38,tpX=hX+Math.sin(fA)*sL,tpY=hY+Math.cos(fA)*sL;
      // Slash trail during strike
      if(ap>=ATK_WD&&ap<ATK_SK){
        var pt=(ap-ATK_WD)/(ATK_SK-ATK_WD);
        if(pt>0.1){ctx.save();ctx.globalAlpha=(1-pt)*0.22;
          ctx.strokeStyle='#8090b0';ctx.lineWidth=S*0.018;ctx.lineCap='round';
          ctx.beginPath();ctx.arc(oX,oY,armL+foreL+sL*0.6,
            Math.atan2(Math.sin(wAA-dir*0.5),Math.cos(wAA-dir*0.5))+Math.PI/2,
            Math.atan2(Math.sin(wAA),Math.cos(wAA))+Math.PI/2);
          ctx.stroke();ctx.restore();}
      }
      // Blade body
      _scrSeg(hX,hY,tpX,tpY,J*0.4,sb+5);ctx.strokeStyle=BLADE;ctx.lineWidth=S*0.018;ctx.lineCap='round';ctx.stroke();
      // Edge highlight
      var nx=Math.cos(fA)*dir,ny=-Math.sin(fA)*dir;
      _scrSeg(hX+nx*2,hY+ny*2,tpX+nx*2,tpY+ny*2,J*0.3,sb+6);ctx.strokeStyle='rgba(255,255,255,0.45)';ctx.lineWidth=S*0.005;ctx.stroke();
      // Blade outline
      _scrSeg(hX,hY,tpX,tpY,J*0.4,sb+7);ctx.strokeStyle=OUTL;ctx.lineWidth=S*0.005;ctx.stroke();
      // Crossguard
      var gD=sL*0.06,gx=hX+Math.sin(fA)*gD,gy=hY+Math.cos(fA)*gD;
      var gpx=Math.cos(fA),gpy=-Math.sin(fA),gw=S*0.055;
      _scrSeg(gx-gpx*gw,gy-gpy*gw,gx+gpx*gw,gy+gpy*gw,J*0.3,sb+8);
      ctx.strokeStyle='#8a7a60';ctx.lineWidth=S*0.018;ctx.lineCap='round';ctx.stroke();
      _scrSeg(gx-gpx*gw,gy-gpy*gw,gx+gpx*gw,gy+gpy*gw,J*0.3,sb+9);
      ctx.strokeStyle=OUTL;ctx.lineWidth=S*0.008;ctx.stroke();
      // Pommel
      var pmX=hX-Math.sin(fA)*S*0.04,pmY=hY-Math.cos(fA)*S*0.04;
      _scrCircle(pmX,pmY,S*0.016,J*0.2,sb+10);ctx.fillStyle='#908060';ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.4;ctx.stroke();
    }

    // Upper arm
    ctx.strokeStyle=OUTL;ctx.lineWidth=armTh;ctx.lineCap='round';
    _scrSeg(oX,oY,eX,eY,J,sb);ctx.stroke();
    // Forearm
    _scrSeg(eX,eY,hX,hY,J,sb+1);ctx.stroke();
    // Hand (skin-colored)
    _scrCircle(hX,hY,handR,J*0.5,sb+2);
    ctx.fillStyle=SKIN;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.7;ctx.stroke();
    // Shoulder pauldron
    _scrCircle(oX,oY,S*0.032,J*0.4,sb+3);
    ctx.fillStyle=PLATE;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.6;ctx.stroke();
    ctx.beginPath();ctx.arc(oX-S*0.008,oY-S*0.010,S*0.012,0,TAU);
    ctx.fillStyle='rgba(255,255,255,0.30)';ctx.fill();

    // Buckler (off-hand)
    if(!isW){
      var shR=S*0.048,shX=hX-dir*shR*0.3,shY=hY;
      _scrCircle(shX,shY,shR,J*0.4,sb+11);ctx.fillStyle='#8a7050';ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.7;ctx.stroke();
      _scrCircle(shX,shY,shR*0.35,J*0.2,sb+12);ctx.fillStyle='#a89060';ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.4;ctx.stroke();
    }
  }

  // Back arm (shield hand)
  drawArm(false,t_stride,200);

  // ── BODY — tabard + chest plate ──
  ctx.save();ctx.translate(cX,bodyCY);ctx.rotate(bodyAng);ctx.scale(atkSqX,atkSqY);
  // Tabard base (red)
  _scrOval(0,0,BRX,BRY,J,300);ctx.fillStyle=TABARD;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*1.2;ctx.stroke();
  // Tabard bottom trim (darker)
  _scrOval(0,BRY*0.65,BRX*0.95,BRY*0.25,J*0.6,301);ctx.fillStyle=TABARD_DK;ctx.fill();
  // Chest plate (silver)
  _scrOval(0,-BRY*0.15,BRX*0.78,BRY*0.38,J*0.7,302);ctx.fillStyle=PLATE;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.7;ctx.stroke();
  // Plate highlight
  _scrOval(-BRX*0.18,-BRY*0.28,BRX*0.20,BRY*0.12,J*0.3,303);ctx.fillStyle='rgba(255,255,255,0.32)';ctx.fill();
  // Center ridge
  _scrSeg(0,-BRY*0.45,0,BRY*0.15,J*0.3,304);ctx.strokeStyle='rgba(0,0,0,0.10)';ctx.lineWidth=OL*0.4;ctx.lineCap='butt';ctx.stroke();
  // Belt
  var bltY=BRY*0.52;
  _scrSeg(-BRX*1.04,bltY-S*0.010,BRX*1.04,bltY-S*0.010,J*0.4,305);ctx.strokeStyle=BELT_C;ctx.lineWidth=S*0.028;ctx.lineCap='round';ctx.stroke();
  // Gold buckle
  _scrOval(0,bltY-S*0.008,S*0.020,S*0.016,J*0.2,306);ctx.fillStyle=GOLD_C;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.4;ctx.stroke();
  ctx.beginPath();ctx.arc(0,bltY-S*0.008,S*0.008,0,TAU);ctx.fillStyle='rgba(0,0,0,0.20)';ctx.fill();
  ctx.restore();

  // ── HEAD — face + helmet ──
  var headAng=bodyAng*0.45;
  var headDist=BRY+headR*0.55;
  var hx=cX+Math.sin(bodyAng)*headDist*atkSqX;
  var hy=bodyCY+(-Math.cos(bodyAng)*headDist)*atkSqY;

  ctx.save();ctx.translate(hx,hy);ctx.rotate(headAng);
  // Face (skin circle)
  _scrCircle(0,0,headR,J,400);ctx.fillStyle=SKIN;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL;ctx.stroke();
  // Skin highlight
  _scrOval(-headR*0.20,-headR*0.10,headR*0.18,headR*0.14,J*0.2,401);ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fill();

  // Eyes
  var eyeSp=headR*0.36, eyeRad=headR*0.20, eyeY=headR*0.06;
  [-1,1].forEach(function(sd,i){
    var ex=sd*eyeSp;
    _scrOval(ex,eyeY,eyeRad*1.25,eyeRad*1.25*eyeSq,J*0.2,410+i);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.5;ctx.stroke();
    var lkX=dir*eyeRad*0.20;
    ctx.beginPath();ctx.arc(ex+lkX,eyeY,eyeRad*0.55*eyeSq,0,TAU);ctx.fillStyle='#2c1a06';ctx.fill();
    ctx.beginPath();ctx.arc(ex+lkX,eyeY,eyeRad*0.30*eyeSq,0,TAU);ctx.fillStyle=EYE_COL;ctx.fill();
    ctx.beginPath();ctx.arc(ex+lkX+eyeRad*0.18,eyeY-eyeRad*0.18,eyeRad*0.12,0,TAU);ctx.fillStyle='#fff';ctx.fill();
  });

  // Eyebrows (stern look)
  ctx.strokeStyle='#6a4818';ctx.lineWidth=OL*0.75;ctx.lineCap='round';
  _scrNoiseSeed(Math.floor(roT*0.3)*53+415);
  var browA=(ap>=ATK_WD&&ap<ATK_SK+0.1)?0.08:0;
  ctx.beginPath();
  ctx.moveTo(-eyeSp-eyeRad*0.6,eyeY-headR*0.26+browA+(_scrNoise01()-0.5)*J);
  ctx.lineTo(-eyeSp+eyeRad*0.3,eyeY-headR*0.30-browA+(_scrNoise01()-0.5)*J);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(eyeSp-eyeRad*0.3,eyeY-headR*0.30-browA+(_scrNoise01()-0.5)*J);
  ctx.lineTo(eyeSp+eyeRad*0.6,eyeY-headR*0.26+browA+(_scrNoise01()-0.5)*J);
  ctx.stroke();

  // Nose
  ctx.fillStyle='rgba(180,100,50,0.22)';
  ctx.beginPath();ctx.arc(headR*0.04,headR*0.24,headR*0.065,0,TAU);ctx.fill();

  // Mouth
  var mthY=headR*0.46,mthW=headR*0.26;
  if(ap>=ATK_WD&&ap<ATK_SK+0.05){
    _scrOval(0,mthY,mthW*0.5,headR*0.10,J*0.2,420);ctx.fillStyle='#1a1410';ctx.fill();
  } else {
    _scrNoiseSeed(Math.floor(roT*0.3)*53+420);
    ctx.strokeStyle='#7a4020';ctx.lineWidth=OL*0.65;ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(-mthW,mthY+(_scrNoise01()-0.5)*J);
    ctx.quadraticCurveTo(0,mthY+headR*0.08+(_scrNoise01()-0.5)*J,mthW,mthY+(_scrNoise01()-0.5)*J);
    ctx.stroke();
  }

  // Helmet (covers upper half of head)
  ctx.save();
  ctx.beginPath();ctx.rect(-headR*1.5,-headR*1.5,headR*3,headR*1.58);ctx.clip();
  _scrOval(0,-headR*0.06,headR*1.06,headR*0.90,J,430);ctx.fillStyle=HELM;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.9;ctx.stroke();
  _scrOval(-headR*0.22,-headR*0.48,headR*0.18,headR*0.10,J*0.2,431);ctx.fillStyle='rgba(255,255,255,0.28)';ctx.fill();
  ctx.restore();
  // Brim band
  _scrSeg(-headR*1.08,headR*0.05,headR*1.08,headR*0.05,J*0.4,432);ctx.strokeStyle=HELM_DK;ctx.lineWidth=S*0.018;ctx.lineCap='round';ctx.stroke();
  _scrSeg(-headR*1.08,headR*0.05,headR*1.08,headR*0.05,J*0.4,433);ctx.strokeStyle=OUTL;ctx.lineWidth=S*0.006;ctx.stroke();
  // Nose guard
  _scrSeg(0,-headR*0.62,0,headR*0.18,J*0.2,434);ctx.strokeStyle=HELM_DK;ctx.lineWidth=S*0.012;ctx.lineCap='round';ctx.stroke();
  _scrSeg(0,-headR*0.62,0,headR*0.18,J*0.2,435);ctx.strokeStyle=OUTL;ctx.lineWidth=S*0.004;ctx.stroke();
  // Top knob
  _scrCircle(0,-headR*0.78,S*0.014,J*0.2,436);ctx.fillStyle=HELM_DK;ctx.fill();ctx.strokeStyle=OUTL;ctx.lineWidth=OL*0.4;ctx.stroke();

  ctx.restore(); // end head transform

  // Front arm (sword hand)
  drawArm(true,(t_stride+0.5)%1,220);

  return hy - headR*1.10 - 12;
}

// ═══════════════════════════════════════════════════════════════════════════
//  drawHeroSoldier — fallback to drawHeroFlat until soldier model is extracted
// ═══════════════════════════════════════════════════════════════════════════
var drawHeroSoldier = drawHeroFlat;

// ═══════════════════════════════════════════════════════════════════════════
//  Studio-style hero helpers (egg-body chibi from unit_studio.html)
//  Maps SVG viewBox (0..100) coords into canvas px at character position.
// ═══════════════════════════════════════════════════════════════════════════
function _heroEggBob(roT, st) {
  if (st==='move') return Math.abs(Math.sin(roT*3))*2;
  if (st==='idle') return Math.sin(roT*0.5)*0.8;
  return Math.sin(roT*1.5)*0.4;
}
// Studio attack swing angle (deg) mapped from attack phases
// wd=windup(back), sk=strike(forward), rv=recovery
function _heroSwordSwing(wd, sk, rv) {
  return wd*(-35) + sk*(75) - rv*(40);
}
// Walk cycle offsets (in studio px for positions, degrees for rotations).
// Returns sinusoidal approximation of studio CSS keyframes.
// For 'run' variant (fast-movers), amplitudes are scaled up.
// Walk cycle phases (animation research: Slynyrd pixelblog, chibi troop cycle):
//   φ=0      right foot CONTACT (just planted forward), left foot at back (-X, 0)
//   φ=π/2   PASSING pose (body peaks UP, left foot mid-swing lifted at 0, -Y)
//   φ=π      left foot CONTACT (planted forward), right foot at back
//   φ=3π/2   PASSING pose (body peaks UP, right foot mid-swing lifted at 0, -Y)
// Critical: body is LOW (compressed) at contact, HIGH at passing — OUT of phase with foot lift.
// Body leans TOWARD the planted foot. Arm swings OPPOSITE to leading (swinging) leg.
function _heroWalkCycle(roT, st, fast) {
  if (st !== 'move') return {mul:0, bobY:0, torsoRot:0, lfDx:0, lfDy:0, rfDx:0, rfDy:0, swArmRot:0, shArmRot:0, idleBob:(st==='idle'? Math.sin(roT*0.5)*0.4 : 0)};
  const walkPhase = roT * 2;
  const sin1 = Math.sin(walkPhase);
  const cos1 = Math.cos(walkPhase);
  const cos2 = Math.cos(walkPhase * 2);
  const amp = fast ? 1.4 : 1.0;
  return {
    mul: 1,
    // Body dips at contact, rises at passing. Positive=down in canvas.
    bobY:      1.8 * cos2 * amp,
    // Lean toward planted foot (π/2: right planted → +rotation/right lean)
    torsoRot:  2.0 * sin1 * amp,
    // Feet stride: -X to +X to -X using cos curve (not sin spread)
    lfDx:     -5.0 * cos1 * amp,
    lfDy:     -3.0 * Math.max(0, sin1) * amp,
    rfDx:      5.0 * cos1 * amp,
    rfDy:     -3.0 * Math.max(0, -sin1) * amp,
    // Arm counterbalance (opposite to leading leg)
    swArmRot: -10 * sin1 * amp,
    shArmRot:   8 * sin1 * amp,
    idleBob: 0,
  };
}
// Studio-coord mappers. Returns {sx, sy, S} where sx(x) flips by dir around CX.
function _heroStudio(CX, CY0, H, dir) {
  const S = H / 87;                         // studio px → canvas px
  return {
    S,
    sx: x => CX + (x - 50) * S * dir,
    sy: y => CY0 + (y - 93) * S,
  };
}

// Draw circular wooden shield (recruit I)
function _drawShieldWood(ctx, sx, sy, S, dir) {
  const cx = sx(17), cy = sy(58);
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(cx+6*S*dir, cy, 3*S, 11*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#8a5a30'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.9*S;
  ctx.beginPath(); ctx.arc(cx, cy, 11*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(58,30,8,0.75)'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.moveTo(cx-10*S, cy-3*S); ctx.lineTo(cx+10*S, cy-3*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-10*S, cy+3*S); ctx.lineTo(cx+10*S, cy+3*S); ctx.stroke();
  ctx.strokeStyle='#9aa0ac'; ctx.lineWidth=1.2*S;
  ctx.beginPath(); ctx.arc(cx, cy, 10.6*S, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle='#c8ccd6';
  [[0,-9.8,0.7],[9.8,0,0.7],[0,9.8,0.7],[-9.8,0,0.7],[6.9,-6.9,0.6],[6.9,6.9,0.6],[-6.9,-6.9,0.6],[-6.9,6.9,0.6]].forEach(([ox,oy,r])=>{
    ctx.beginPath(); ctx.arc(cx+ox*S*dir, cy+oy*S, r*S, 0, Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='#8a8e98'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.arc(cx, cy, 2.8*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#d8dce6';
  ctx.beginPath(); ctx.arc(cx-0.8*S*dir, cy-0.8*S, 1*S, 0, Math.PI*2); ctx.fill();
}

// Draw basic sword in rotated arm frame (local coords, caller handles transform)
function _drawBladeBasic(ctx, S, pommelCol) {
  // blade
  ctx.fillStyle='#c8cdd8'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(-1.8*S, -22*S); ctx.lineTo(1.8*S, -22*S);
  ctx.lineTo(1.8*S, 11*S); ctx.lineTo(0, 14*S); ctx.lineTo(-1.8*S, 11*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // shine
  ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=0.3*S;
  ctx.beginPath(); ctx.moveTo(-0.9*S, -19*S); ctx.lineTo(-0.9*S, 8*S); ctx.stroke();
  // guard (brown)
  ctx.fillStyle='#5a3a1a'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-5.5*S, 11*S, 11*S, 2.6*S, 0.6*S); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#9a6a3a';
  ctx.fillRect(-5.5*S, 11*S, 11*S, 0.9*S);
  // grip
  ctx.fillStyle='#3a2510'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.3*S;
  ctx.fillRect(-1.4*S, 13.6*S, 2.8*S, 6.5*S); ctx.strokeRect(-1.4*S, 13.6*S, 2.8*S, 6.5*S);
  // pommel
  ctx.fillStyle=pommelCol||'#c08030'; ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.arc(0, 21.2*S, 1.9*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#f0c870';
  ctx.beginPath(); ctx.arc(-0.6*S, 20.6*S, 0.7*S, 0, Math.PI*2); ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════════════
//  drawHeroRecruit — Recruit I (studio egg-body style: purple body, wood
//  shield with studs, basic sword, conical helm with spike, glowing eyes)
// ═══════════════════════════════════════════════════════════════════════════
function drawHeroRecruit(ctx, p) {
  _hCtx = ctx;
  const {CX, CY0, H, roD: dir, roT, wdup: wd, strk: sk, recv: rv, state: st} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);

  const wk = _heroWalkCycle(roT, st, false);

  // ground shadow (static — stays at floor regardless of bob)
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(93), 26*S, 2.2*S, 0, 0, Math.PI*2); ctx.fill();

  // feet (left + right, each animated independently)
  const drawFoot = (fx, dx, dy) => {
    const fxPx = sx(fx) + dx*S*dir;
    const fyPx = sy(90) + dy*S;
    ctx.fillStyle='#8a5a30'; ctx.strokeStyle='#000'; ctx.lineWidth=0.6*S;
    ctx.beginPath(); ctx.ellipse(fxPx, fyPx, 6.5*S, 3.8*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(232,112,128,0.75)';
    ctx.beginPath(); ctx.ellipse(fxPx - 1.5*S*dir, fyPx - 1.2*S, 3.8*S, 2*S, 0, 0, Math.PI*2); ctx.fill();
  };
  drawFoot(40, wk.lfDx, wk.lfDy);
  drawFoot(60, wk.rfDx, wk.rfDy);

  // ── TORSO GROUP (body + arms + helmet + heart) — rotates around (50, 88) ──
  ctx.save();
  // pivot: studio (50, 88) → canvas (sx(50), sy(88))
  const pivX = sx(50), pivY = sy(88);
  ctx.translate(pivX, pivY);
  ctx.rotate(wk.torsoRot * Math.PI/180 * dir);
  ctx.translate(-pivX, -pivY);
  ctx.translate(0, (wk.bobY + wk.idleBob) * S);

  // body (egg silhouette, purple)
  ctx.fillStyle='#4a2a80'; ctx.strokeStyle='#000'; ctx.lineWidth=1.1*S;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(14));
  ctx.bezierCurveTo(sx(74), sy(14), sx(82), sy(30), sx(79), sy(56));
  ctx.bezierCurveTo(sx(77), sy(80), sx(65), sy(89), sx(50), sy(89));
  ctx.bezierCurveTo(sx(35), sy(89), sx(23), sy(80), sx(21), sy(56));
  ctx.bezierCurveTo(sx(18), sy(30), sx(26), sy(14), sx(50), sy(14));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // cloak highlight (lighter purple top)
  ctx.fillStyle='rgba(90,60,130,0.55)';
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(17));
  ctx.bezierCurveTo(sx(66), sy(17), sx(73), sy(25), sx(74), sy(34));
  ctx.bezierCurveTo(sx(66), sy(31), sx(58), sy(30), sx(50), sy(30));
  ctx.bezierCurveTo(sx(42), sy(30), sx(34), sy(31), sx(26), sy(34));
  ctx.bezierCurveTo(sx(27), sy(25), sx(34), sy(17), sx(50), sy(17));
  ctx.closePath(); ctx.fill();
  // waist dark shadow
  ctx.fillStyle='rgba(11,6,18,0.6)';
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(78));
  ctx.bezierCurveTo(sx(38), sy(85), sx(62), sy(85), sx(70), sy(78));
  ctx.bezierCurveTo(sx(65), sy(82), sx(35), sy(82), sx(30), sy(78));
  ctx.closePath(); ctx.fill();

  // shield arm (wooden shield on back side, pivots around (22, 55) with walk sway)
  ctx.save();
  const shPivX = sx(22), shPivY = sy(55);
  ctx.translate(shPivX, shPivY);
  ctx.rotate(wk.shArmRot * Math.PI/180 * dir);
  ctx.translate(-shPivX, -shPivY);
  _drawShieldWood(ctx, sx, sy, S, dir);
  ctx.restore();

  // sword arm (front side, rotate 18° + walk sway + attack swing)
  const swing = _heroSwordSwing(wd, sk, rv);
  ctx.save();
  // pivot at shoulder (78, 55), then translate to anchor (85, 48), then rotate blade angle
  const swPivX = sx(78), swPivY = sy(55);
  ctx.translate(swPivX, swPivY);
  ctx.rotate(wk.swArmRot * Math.PI/180 * dir);
  ctx.translate(-swPivX, -swPivY);
  ctx.translate(sx(85), sy(48));
  ctx.rotate((18 + swing) * Math.PI / 180 * dir);
  _drawBladeBasic(ctx, S, '#c08030');
  // attack trail
  if (sk>0.06 && sk<0.94) {
    const ta = sk*(1-sk)*4;
    ctx.globalAlpha = ta*0.22;
    ctx.strokeStyle='#d0d8e8'; ctx.lineWidth=1.2*S; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(0, -6*S, 22*S, -Math.PI*0.7, -Math.PI*0.15); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // helmet (conical with brim + spike + visor slot + glowing eyes)
  // brim
  ctx.fillStyle='#c8ccd4'; ctx.strokeStyle='#000'; ctx.lineWidth=0.8*S;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(41), 30*S, 4.2*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#9aa0ac';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(39.8), 30*S, 3.2*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(43.6), 28*S, 2*S, 0, 0, Math.PI*2); ctx.fill();
  // dome
  ctx.fillStyle='#b0b6c2'; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(22), sy(41));
  ctx.bezierCurveTo(sx(22), sy(18), sx(34), sy(10), sx(50), sy(10));
  ctx.bezierCurveTo(sx(66), sy(10), sx(78), sy(18), sx(78), sy(41));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // highlight
  ctx.fillStyle='rgba(232,236,244,0.35)';
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(39));
  ctx.bezierCurveTo(sx(30), sy(22), sx(37), sy(15), sx(46), sy(12));
  ctx.bezierCurveTo(sx(40), sy(16), sx(35), sy(24), sx(35), sy(39));
  ctx.closePath(); ctx.fill();
  // center ridge
  ctx.strokeStyle='rgba(42,46,56,0.7)'; ctx.lineWidth=0.35*S;
  ctx.beginPath(); ctx.moveTo(sx(50), sy(11)); ctx.lineTo(sx(50), sy(41)); ctx.stroke();
  // spike on top
  ctx.fillStyle='#2a2e38';
  ctx.beginPath(); ctx.arc(sx(50), sy(10.5), 1.6*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#8a8e98'; ctx.strokeStyle='#2a2e38'; ctx.lineWidth=0.3*S;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(6)); ctx.lineTo(sx(48.7), sy(10.5)); ctx.lineTo(sx(51.3), sy(10.5));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // rivets along brim
  ctx.fillStyle='#2a2e38';
  [[26,40,0.9],[38,41.2,0.9],[50,41.4,0.9],[62,41.2,0.9],[74,40,0.9]].forEach(([x,y,r])=>{
    ctx.beginPath(); ctx.arc(sx(x), sy(y), r*S, 0, Math.PI*2); ctx.fill();
  });
  // visor slot (symmetric — draw from center)
  ctx.fillStyle='#0b0612';
  _hRr(sx(50)-24*S, sy(33.5), 48*S, 5.2*S, 1.2*S); ctx.fill();
  // glowing eyes
  ctx.fillStyle='#66ccff';
  ctx.beginPath(); ctx.ellipse(sx(40), sy(36.2), 3.1*S, 1.8*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx(60), sy(36.2), 3.1*S, 1.8*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#0b0612';
  ctx.beginPath(); ctx.arc(sx(40), sy(36.2), 1.35*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(60), sy(36.2), 1.35*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffffff';
  ctx.beginPath(); ctx.arc(sx(40.5), sy(35.7), 0.55*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(60.5), sy(35.7), 0.55*S, 0, Math.PI*2); ctx.fill();
  // chin strap
  ctx.strokeStyle='#3a2510'; ctx.lineWidth=1.1*S; ctx.lineCap='butt';
  ctx.beginPath();
  ctx.moveTo(sx(24), sy(42));
  ctx.bezierCurveTo(sx(28), sy(52), sx(40), sy(58), sx(50), sy(58));
  ctx.bezierCurveTo(sx(60), sy(58), sx(72), sy(52), sx(76), sy(42));
  ctx.stroke();
  ctx.fillStyle='#c08030';
  ctx.beginPath(); ctx.arc(sx(24), sy(42), 0.9*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(76), sy(42), 0.9*S, 0, Math.PI*2); ctx.fill();

  // heart emblem at waist
  const hx=sx(50), hy=sy(70);
  ctx.fillStyle='#c14a5e'; ctx.strokeStyle='#3a0c14'; ctx.lineWidth=0.4*S;
  ctx.beginPath();
  ctx.moveTo(hx-6*S, hy-2*S);
  ctx.lineTo(hx, hy+3*S);
  ctx.lineTo(hx+6*S, hy-2*S);
  ctx.lineTo(hx+6*S, hy);
  ctx.lineTo(hx, hy+5*S);
  ctx.lineTo(hx-6*S, hy);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.restore();
  return sy(6) + wk.bobY*S - 12;
}

// ═══════════════════════════════════════════════════════════════════════════
//  drawHeroKnight — Knight I (blue steel, kite shield, cross, crested helm)
// ═══════════════════════════════════════════════════════════════════════════
function drawHeroKnight(ctx, p) {
  _hCtx = ctx;
  const {CX, CY0, H, roD: dir, roT, ap, wdup: wd, strk: sk, recv: rv, wc, state: st} = p;

  const S = H * 0.97;
  _hOL = S * 0.038;
  const BY = CY0;

  const BW = S*0.38, BH = S*0.58, R = S*0.25, LW = S*0.13, LH = S*0.18;
  const bodyTop = BY - BH, legTop = BY - LH;
  const hdCY = bodyTop - R*0.85;

  const BK='#000000', WH='#ffffff';
  const BODY='#2a3a6a', BODYHI='rgba(80,110,180,0.32)';
  const PLATE='#8090b8', PLATEHI='rgba(210,225,255,0.55)', PLATEDK='#0a1230';
  const CROSS='#3050a0';
  const GOLD='#e0b840', GOLDHI='#fff0a0';
  const PLUME='#3666cc', PLUMEHI='#6a99ee';
  const EYEGLOW='#66ccff';

  // ── LEGS (plate boots) ──────────────────────────────────────────────────
  const legSwing = st==='move'? wc*0.30 : st==='idle'? Math.sin(roT*0.5)*0.04 : 0;

  ctx.save();
  ctx.translate(CX - dir*LW*0.72, legTop);
  ctx.rotate(-legSwing*dir);
  _hBox(-LW, 0, LW*2, LH*0.56, LW*0.45, PLATE, BK, _hOL*0.80);
  _hBox(-LW*1.2, LH*0.48, LW*2.4, LH*0.52, LW*0.48, PLATEDK, BK, _hOL*0.75);
  ctx.restore();

  ctx.save();
  ctx.translate(CX + dir*LW*0.72, legTop);
  ctx.rotate(legSwing*dir);
  _hBox(-LW, 0, LW*2, LH*0.56, LW*0.45, PLATE, BK, _hOL*0.80);
  _hBox(-LW*1.2, LH*0.48, LW*2.4, LH*0.52, LW*0.48, PLATEDK, BK, _hOL*0.75);
  ctx.restore();

  // ── BODY (dark blue silhouette under plate) ─────────────────────────────
  _hBox(CX-BW, bodyTop, BW*2, BH, BW*0.22, BODY, BK);
  _hRr(CX-BW+_hOL, bodyTop+_hOL, BW*0.42, BH-_hOL*2, BW*0.16);
  ctx.fillStyle=BODYHI; ctx.fill();

  // ── CHESTPLATE with horizontal bands ────────────────────────────────────
  const ptT=bodyTop+BH*0.08, ptW=BW*0.90, ptH=BH*0.60;
  _hBox(CX-ptW, ptT, ptW*2, ptH, ptW*0.10, PLATE, BK, _hOL*0.90);
  _hRr(CX-ptW+_hOL, ptT+_hOL, ptW*0.50, ptH*0.38, ptW*0.08);
  ctx.fillStyle=PLATEHI; ctx.fill();
  // 3 horizontal bands
  ctx.strokeStyle=PLATEDK; ctx.lineWidth=_hOL*0.55; ctx.lineCap='butt';
  [0.28, 0.55, 0.82].forEach(f=>{
    ctx.beginPath();
    ctx.moveTo(CX-ptW*0.95, ptT+ptH*f);
    ctx.lineTo(CX+ptW*0.95, ptT+ptH*f);
    ctx.stroke();
  });
  // blue cross emblem
  ctx.fillStyle=CROSS;
  ctx.fillRect(CX-S*0.024, ptT+ptH*0.20, S*0.048, ptH*0.52);
  ctx.fillRect(CX-S*0.10, ptT+ptH*0.38, S*0.20, S*0.048);
  ctx.strokeStyle=PLATEDK; ctx.lineWidth=_hOL*0.42;
  ctx.strokeRect(CX-S*0.024, ptT+ptH*0.20, S*0.048, ptH*0.52);
  ctx.strokeRect(CX-S*0.10, ptT+ptH*0.38, S*0.20, S*0.048);

  // pauldrons
  [-1,1].forEach(sd=>{
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(CX+sd*BW*0.98, bodyTop+BH*0.14, BW*0.22, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.82; ctx.stroke();
    ctx.fillStyle=PLATEHI; ctx.globalAlpha=0.5;
    ctx.beginPath(); ctx.arc(CX+sd*BW*0.98-BW*0.08, bodyTop+BH*0.08, BW*0.10, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  });

  // ── KITE SHIELD (left arm, front/back based on facing) ──────────────────
  // shield sits on the back-side arm (opposite of weapon) — at body left when dir=1
  const shX = CX - dir*BW*1.02, shY = bodyTop+BH*0.42;
  ctx.save();
  ctx.translate(shX, shY);
  // shadow strip behind
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(S*0.02, 0, S*0.04, S*0.22, 0, 0, Math.PI*2); ctx.fill();
  // shield body (kite)
  ctx.fillStyle=PLATE;
  ctx.beginPath();
  ctx.moveTo(-S*0.18,-S*0.22); ctx.lineTo(S*0.18,-S*0.22);
  ctx.lineTo(S*0.20, S*0.12); ctx.lineTo(0, S*0.26); ctx.lineTo(-S*0.20, S*0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle=PLATEDK; ctx.lineWidth=_hOL*0.95; ctx.stroke();
  // inner trim
  ctx.fillStyle=PLATEHI; ctx.globalAlpha=0.55;
  ctx.beginPath();
  ctx.moveTo(-S*0.14,-S*0.18); ctx.lineTo(S*0.02,-S*0.18);
  ctx.lineTo(S*0.04, 0); ctx.lineTo(-S*0.04, S*0.08); ctx.lineTo(-S*0.15, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha=1;
  // cross on shield
  ctx.fillStyle=CROSS;
  ctx.fillRect(-S*0.022,-S*0.20, S*0.044, S*0.44);
  ctx.fillRect(-S*0.14, -S*0.032, S*0.28, S*0.046);
  // boss (gold center)
  ctx.fillStyle=GOLD;
  ctx.beginPath(); ctx.arc(0, 0, S*0.045, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='#3a2510'; ctx.lineWidth=_hOL*0.50; ctx.stroke();
  ctx.fillStyle=GOLDHI;
  ctx.beginPath(); ctx.arc(-S*0.014,-S*0.014, S*0.018, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // ── SWORD ARM (weapon-side) ─────────────────────────────────────────────
  {
    const aN = 0.60;
    let armA;
    if(st==='attack' || ap>0){
      const sw = wd*(-0.20) + sk*(1.20) - rv*0.45;
      armA = aN + sw*1.1;
    } else if(st==='fight'){
      armA = aN + Math.sin(roT*1.8)*0.08;
    } else if(st==='move'){
      armA = aN - dir*wc*0.24;
    } else {
      armA = aN + Math.sin(roT*0.85)*0.06;
    }

    const ox=CX+dir*BW*1.02, oy=bodyTop+BH*0.20;
    const el=S*0.36;
    const ex=ox+Math.sin(armA)*dir*el, ey=oy+Math.cos(armA)*el;
    const fgA=armA+dir*0.10;
    const hndX=ex+Math.sin(fgA)*dir*el*0.55, hndY=ey+Math.cos(fgA)*el*0.55;
    const sL=S*0.78; // long sword
    const tipX=hndX+Math.sin(fgA)*dir*sL, tipY=hndY+Math.cos(fgA)*sL;

    // swing trail
    if(sk>0.06 && sk<0.94){
      const ta=sk*(1-sk)*4;
      ctx.save(); ctx.globalAlpha=ta*0.22;
      ctx.strokeStyle='#a0c0ff'; ctx.lineWidth=S*0.026; ctx.lineCap='round';
      ctx.beginPath();
      ctx.arc(ox,oy,el+el*0.55+sL*0.45, dir>0?-Math.PI*0.80:-Math.PI*0.20, dir>0?-Math.PI*0.20:-Math.PI*0.80);
      ctx.stroke(); ctx.restore();
    }

    // blade (steel with highlight)
    ctx.strokeStyle='#d8e4f4'; ctx.lineWidth=S*0.026; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(hndX,hndY); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.012;
    ctx.beginPath(); ctx.moveTo(hndX,hndY); ctx.lineTo(tipX,tipY); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=S*0.006;
    ctx.beginPath(); ctx.moveTo(hndX+Math.cos(fgA)*dir*2,hndY+Math.sin(fgA)*2);
    ctx.lineTo(tipX+Math.cos(fgA)*dir*2,tipY+Math.sin(fgA)*2); ctx.stroke();

    // gold crossguard
    const dl=Math.hypot(tipX-hndX,tipY-hndY)||1;
    const gx=hndX+(tipX-hndX)*0.08, gy=hndY+(tipY-hndY)*0.08;
    const px=-(tipY-hndY)/dl, py=(tipX-hndX)/dl;
    ctx.strokeStyle=GOLD; ctx.lineWidth=S*0.040; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(gx-px*S*0.14,gy-py*S*0.14); ctx.lineTo(gx+px*S*0.14,gy+py*S*0.14); ctx.stroke();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.022;
    ctx.beginPath(); ctx.moveTo(gx-px*S*0.14,gy-py*S*0.14); ctx.lineTo(gx+px*S*0.14,gy+py*S*0.14); ctx.stroke();
    // pommel
    ctx.fillStyle=GOLD;
    ctx.beginPath(); ctx.arc(hndX-Math.sin(fgA)*dir*S*0.055, hndY-Math.cos(fgA)*S*0.055, S*0.030, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=S*0.014; ctx.stroke();

    // arm (plate + gauntlet)
    _hCapsule(ox,oy,ex,ey,S*0.058,PLATE,BK);
    _hCapsule(ex,ey,hndX,hndY,S*0.048,PLATE,BK);

    // shoulder cap
    ctx.fillStyle=PLATE;
    ctx.beginPath(); ctx.arc(ox,oy,S*0.065,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.88; ctx.stroke();
    ctx.fillStyle=PLATEHI;
    ctx.beginPath(); ctx.arc(ox-S*0.020,oy-S*0.020,S*0.026,0,Math.PI*2); ctx.fill();
  }

  // ── HELMET (rounded bucket + plume) ─────────────────────────────────────
  const helmBot = hdCY + R*0.48;
  // brim
  ctx.fillStyle=PLATEDK;
  ctx.beginPath(); ctx.ellipse(CX, helmBot, R*1.15, R*0.16, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL*0.85; ctx.stroke();
  // helmet dome
  ctx.fillStyle=PLATE;
  ctx.beginPath();
  ctx.moveTo(CX-R*1.10, helmBot);
  ctx.bezierCurveTo(CX-R*1.10, hdCY-R*0.70, CX-R*0.70, hdCY-R*1.15, CX, hdCY-R*1.15);
  ctx.bezierCurveTo(CX+R*0.70, hdCY-R*1.15, CX+R*1.10, hdCY-R*0.70, CX+R*1.10, helmBot);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle=BK; ctx.lineWidth=_hOL; ctx.stroke();
  // central ridge
  ctx.strokeStyle=PLATEDK; ctx.lineWidth=_hOL*0.45;
  ctx.beginPath(); ctx.moveTo(CX, hdCY-R*1.13); ctx.lineTo(CX, helmBot-R*0.04); ctx.stroke();
  // highlight
  ctx.fillStyle=WH; ctx.globalAlpha=0.42;
  ctx.beginPath(); ctx.ellipse(CX-R*0.36, hdCY-R*0.70, R*0.24, R*0.12, -0.38, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;

  // plume (blue wings on sides of crest)
  ctx.fillStyle=PLUME;
  ctx.beginPath();
  ctx.moveTo(CX-R*0.08, hdCY-R*1.14);
  ctx.quadraticCurveTo(CX-R*0.52, hdCY-R*1.45, CX-R*0.82, hdCY-R*1.20);
  ctx.quadraticCurveTo(CX-R*0.52, hdCY-R*1.10, CX-R*0.18, hdCY-R*0.98);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle=PLATEDK; ctx.lineWidth=_hOL*0.50; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CX+R*0.08, hdCY-R*1.14);
  ctx.quadraticCurveTo(CX+R*0.52, hdCY-R*1.45, CX+R*0.82, hdCY-R*1.20);
  ctx.quadraticCurveTo(CX+R*0.52, hdCY-R*1.10, CX+R*0.18, hdCY-R*0.98);
  ctx.closePath(); ctx.fill();
  ctx.stroke();
  // plume highlight
  ctx.fillStyle=PLUMEHI; ctx.globalAlpha=0.5;
  ctx.beginPath();
  ctx.moveTo(CX-R*0.30, hdCY-R*1.18);
  ctx.quadraticCurveTo(CX-R*0.55, hdCY-R*1.30, CX-R*0.70, hdCY-R*1.22);
  ctx.quadraticCurveTo(CX-R*0.50, hdCY-R*1.15, CX-R*0.32, hdCY-R*1.10);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha=1;
  // gold crest tip
  ctx.fillStyle=GOLD;
  ctx.beginPath();
  ctx.moveTo(CX, hdCY-R*1.25);
  ctx.lineTo(CX-R*0.08, hdCY-R*1.13);
  ctx.lineTo(CX+R*0.08, hdCY-R*1.13);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#3a2510'; ctx.lineWidth=_hOL*0.40; ctx.stroke();

  // visor slot with glowing eyes
  _hBox(CX-R*0.95, hdCY-R*0.10, R*1.90, R*0.22, R*0.05, PLATEDK, BK, _hOL*0.70);
  [-1,1].forEach(sd=>{
    const ex=CX+sd*R*0.38, ey=hdCY+R*0.01;
    ctx.fillStyle=EYEGLOW;
    ctx.beginPath(); ctx.ellipse(ex, ey, R*0.12, R*0.05, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle=PLATEDK;
    ctx.beginPath(); ctx.arc(ex, ey, R*0.045, 0, Math.PI*2); ctx.fill();
  });

  // ground shadow
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(CX, BY+_hOL*0.5, S*0.28, S*0.04, 0, 0, Math.PI*2); ctx.fill();

  return hdCY - R*1.55 - 12;
}

// ═══════════════════════════════════════════════════════════════════════════
//  STUDIO HERO SYSTEM — parameterized egg-body for all 20 adventurers
//  Universal drawHeroEgg(ctx, p, cfg) with variations for head/weapon/shield.
// ═══════════════════════════════════════════════════════════════════════════

// ── Ground shadow ──────────────────────────────────────────────────────────
function _sShadow(ctx, sx, sy, S) {
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(93), 26*S, 2.2*S, 0, 0, Math.PI*2); ctx.fill();
}

// ── Egg body silhouette ────────────────────────────────────────────────────
function _sBody(ctx, sx, sy, S, bodyCol, hiCol) {
  ctx.fillStyle=bodyCol; ctx.strokeStyle='#000'; ctx.lineWidth=1.1*S;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(14));
  ctx.bezierCurveTo(sx(74), sy(14), sx(82), sy(30), sx(79), sy(56));
  ctx.bezierCurveTo(sx(77), sy(80), sx(65), sy(89), sx(50), sy(89));
  ctx.bezierCurveTo(sx(35), sy(89), sx(23), sy(80), sx(21), sy(56));
  ctx.bezierCurveTo(sx(18), sy(30), sx(26), sy(14), sx(50), sy(14));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // upper highlight
  ctx.fillStyle=hiCol;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(17));
  ctx.bezierCurveTo(sx(66), sy(17), sx(73), sy(25), sx(74), sy(34));
  ctx.bezierCurveTo(sx(66), sy(31), sx(58), sy(30), sx(50), sy(30));
  ctx.bezierCurveTo(sx(42), sy(30), sx(34), sy(31), sx(26), sy(34));
  ctx.bezierCurveTo(sx(27), sy(25), sx(34), sy(17), sx(50), sy(17));
  ctx.closePath(); ctx.fill();
  // waist shadow
  ctx.fillStyle='rgba(11,6,18,0.5)';
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(78));
  ctx.bezierCurveTo(sx(38), sy(85), sx(62), sy(85), sx(70), sy(78));
  ctx.bezierCurveTo(sx(65), sy(82), sx(35), sy(82), sx(30), sy(78));
  ctx.closePath(); ctx.fill();
}

// ── Feet (with per-foot animation) ─────────────────────────────────────────
function _sFeet(ctx, sx, sy, S, dir, wk, bootCol) {
  const col = bootCol || '#8a5a30';
  const drawFoot = (fx, dx, dy) => {
    const fxPx = sx(fx) + dx*S*dir;
    const fyPx = sy(90) + dy*S;
    ctx.fillStyle=col; ctx.strokeStyle='#000'; ctx.lineWidth=0.6*S;
    ctx.beginPath(); ctx.ellipse(fxPx, fyPx, 6.5*S, 3.8*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(fxPx - 1.5*S*dir, fyPx - 1.2*S, 3.8*S, 2*S, 0, 0, Math.PI*2); ctx.fill();
  };
  drawFoot(40, wk.lfDx, wk.lfDy);
  drawFoot(60, wk.rfDx, wk.rfDy);
}

// ═══════════════════════════════════════════════════════════════════════════
//  HEAD VARIATIONS
// ═══════════════════════════════════════════════════════════════════════════
function _sHeadSpikeHelm(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#b0b6c2', hcDk='#9aa0ac', acc = cfg.headAcc || '#2a2e38', eye = cfg.eye || '#66ccff';
  // brim
  ctx.fillStyle='#c8ccd4'; ctx.strokeStyle='#000'; ctx.lineWidth=0.8*S;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(41), 30*S, 4.2*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle=hcDk;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(39.8), 30*S, 3.2*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(43.6), 28*S, 2*S, 0, 0, Math.PI*2); ctx.fill();
  // dome
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(22), sy(41));
  ctx.bezierCurveTo(sx(22), sy(18), sx(34), sy(10), sx(50), sy(10));
  ctx.bezierCurveTo(sx(66), sy(10), sx(78), sy(18), sx(78), sy(41));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // highlight
  ctx.fillStyle='rgba(232,236,244,0.35)';
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(39));
  ctx.bezierCurveTo(sx(30), sy(22), sx(37), sy(15), sx(46), sy(12));
  ctx.bezierCurveTo(sx(40), sy(16), sx(35), sy(24), sx(35), sy(39));
  ctx.closePath(); ctx.fill();
  // spike
  ctx.fillStyle=acc;
  ctx.beginPath(); ctx.arc(sx(50), sy(10.5), 1.6*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#8a8e98'; ctx.strokeStyle=acc; ctx.lineWidth=0.3*S;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(6)); ctx.lineTo(sx(48.7), sy(10.5)); ctx.lineTo(sx(51.3), sy(10.5));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // gold band (tier 2)
  if (cfg.tier===2) {
    ctx.fillStyle=cfg.headAcc||'#e0b840';
    _hRr(sx(50)-26*S, sy(37), 52*S, 1.8*S, 0.5*S); ctx.fill();
  }
  // rivets
  ctx.fillStyle='#2a2e38';
  [[26,40],[38,41.2],[50,41.4],[62,41.2],[74,40]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(sx(x), sy(y), 0.9*S, 0, Math.PI*2); ctx.fill();
  });
  // visor slot + eyes
  ctx.fillStyle='#0b0612';
  _hRr(sx(50)-24*S, sy(33.5), 48*S, 5.2*S, 1.2*S); ctx.fill();
  _sEyes(ctx, sx, sy, S, eye, 36.2);
  // chin strap
  ctx.strokeStyle='#3a2510'; ctx.lineWidth=1.1*S; ctx.lineCap='butt';
  ctx.beginPath();
  ctx.moveTo(sx(24), sy(42));
  ctx.bezierCurveTo(sx(28), sy(52), sx(40), sy(58), sx(50), sy(58));
  ctx.bezierCurveTo(sx(60), sy(58), sx(72), sy(52), sx(76), sy(42));
  ctx.stroke();
}

function _sHeadFlatHelm(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#a0a8b4', acc = cfg.headAcc || '#e0b840', eye = cfg.eye || '#ffcc44';
  // brim
  ctx.fillStyle='#80889a'; ctx.strokeStyle='#000'; ctx.lineWidth=0.8*S;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(42), 28*S, 3.8*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // flat dome (rounded-square top)
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(23), sy(42));
  ctx.bezierCurveTo(sx(23), sy(20), sx(30), sy(12), sx(50), sy(12));
  ctx.bezierCurveTo(sx(70), sy(12), sx(77), sy(20), sx(77), sy(42));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // flat top
  ctx.fillStyle='rgba(230,235,245,0.35)';
  ctx.beginPath();
  ctx.ellipse(sx(50), sy(14), 20*S, 2.5*S, 0, 0, Math.PI*2); ctx.fill();
  // side flanges
  ctx.fillStyle='#70788a';
  ctx.fillRect(sx(23)-1.5*S, sy(28), 3*S, 10*S);
  ctx.fillRect(sx(77)-1.5*S, sy(28), 3*S, 10*S);
  // crest ridge or gold band (tier 2)
  if (cfg.tier===2) {
    ctx.fillStyle=acc;
    _hRr(sx(50)-22*S, sy(22), 44*S, 2.2*S, 0.6*S); ctx.fill();
    // visor slit narrower
    ctx.fillStyle='#0b0612';
    _hRr(sx(50)-22*S, sy(34), 44*S, 4.2*S, 0.8*S); ctx.fill();
  } else {
    ctx.fillStyle='#0b0612';
    _hRr(sx(50)-22*S, sy(33.5), 44*S, 5*S, 1*S); ctx.fill();
  }
  _sEyes(ctx, sx, sy, S, eye, 36);
  // rivets
  ctx.fillStyle='#2a2e38';
  [[28,41],[50,42.2],[72,41]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(sx(x), sy(y), 1*S, 0, Math.PI*2); ctx.fill();
  });
}

function _sHeadBucketHelm(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#b0b8c8', acc = cfg.headAcc || '#3050a0', eye = cfg.eye || '#66ccff';
  // dome (tall rounded)
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(22), sy(44));
  ctx.bezierCurveTo(sx(22), sy(16), sx(32), sy(8), sx(50), sy(8));
  ctx.bezierCurveTo(sx(68), sy(8), sx(78), sy(16), sx(78), sy(44));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // ridge
  ctx.strokeStyle='rgba(30,40,60,0.7)'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.moveTo(sx(50), sy(9)); ctx.lineTo(sx(50), sy(44)); ctx.stroke();
  // highlight
  ctx.fillStyle='rgba(232,240,250,0.4)';
  ctx.beginPath();
  ctx.moveTo(sx(28), sy(40));
  ctx.bezierCurveTo(sx(28), sy(20), sx(36), sy(13), sx(44), sy(10));
  ctx.bezierCurveTo(sx(38), sy(16), sx(33), sy(24), sx(33), sy(40));
  ctx.closePath(); ctx.fill();
  // horizontal slit (wider for bucket helm)
  ctx.fillStyle='#0b0612';
  _hRr(sx(50)-22*S, sy(29), 44*S, 4*S, 0.6*S); ctx.fill();
  _sEyes(ctx, sx, sy, S, eye, 31);
  // crest plume
  ctx.fillStyle=acc;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(7));
  ctx.bezierCurveTo(sx(44), sy(2), sx(38), sy(-2), sx(30), sy(0));
  ctx.bezierCurveTo(sx(36), sy(3), sx(42), sy(5), sx(50), sy(7));
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(7));
  ctx.bezierCurveTo(sx(56), sy(2), sx(62), sy(-2), sx(70), sy(0));
  ctx.bezierCurveTo(sx(64), sy(3), sx(58), sy(5), sx(50), sy(7));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#000'; ctx.lineWidth=0.5*S; ctx.stroke();
  // gold trim tier 2
  if (cfg.tier===2) {
    ctx.fillStyle='#e0b840';
    _hRr(sx(50)-22*S, sy(34), 44*S, 1.6*S, 0.5*S); ctx.fill();
  }
}

function _sHeadHood(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#3a5020', acc = cfg.headAcc || '#ddcc44', eye = cfg.eye || '#88ff66';
  // hood drape (hangs from top, wider at bottom)
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(20), sy(46));
  ctx.bezierCurveTo(sx(18), sy(22), sx(30), sy(8), sx(50), sy(8));
  ctx.bezierCurveTo(sx(70), sy(8), sx(82), sy(22), sx(80), sy(46));
  ctx.bezierCurveTo(sx(74), sy(40), sx(60), sy(38), sx(50), sy(38));
  ctx.bezierCurveTo(sx(40), sy(38), sx(26), sy(40), sx(20), sy(46));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // inner shadow (face)
  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.moveTo(sx(28), sy(44));
  ctx.bezierCurveTo(sx(28), sy(24), sx(36), sy(16), sx(50), sy(16));
  ctx.bezierCurveTo(sx(64), sy(16), sx(72), sy(24), sx(72), sy(44));
  ctx.bezierCurveTo(sx(64), sy(40), sx(58), sy(39), sx(50), sy(39));
  ctx.bezierCurveTo(sx(42), sy(39), sx(36), sy(40), sx(28), sy(44));
  ctx.closePath(); ctx.fill();
  // glowing eyes in shadow
  _sEyes(ctx, sx, sy, S, eye, 32);
  // feather (tier 2)
  if (cfg.tier===2) {
    ctx.fillStyle=acc; ctx.strokeStyle='#000'; ctx.lineWidth=0.4*S;
    ctx.beginPath();
    ctx.moveTo(sx(30), sy(12));
    ctx.bezierCurveTo(sx(16), sy(8), sx(6), sy(-2), sx(10), sy(-6));
    ctx.bezierCurveTo(sx(20), sy(-2), sx(28), sy(6), sx(32), sy(14));
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // highlight
  ctx.fillStyle='rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(40));
  ctx.bezierCurveTo(sx(26), sy(22), sx(34), sy(10), sx(44), sy(10));
  ctx.bezierCurveTo(sx(38), sy(14), sx(32), sy(22), sx(32), sy(40));
  ctx.closePath(); ctx.fill();
}

function _sHeadWizardHat(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#2a0a5a', acc = cfg.headAcc || '#ffdd44', eye = cfg.eye || '#cc88ff';
  // face/head patch under hat
  ctx.fillStyle='#f0d4a8'; ctx.strokeStyle='#000'; ctx.lineWidth=0.7*S;
  ctx.beginPath();
  ctx.ellipse(sx(50), sy(34), 14*S, 10*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // hat brim
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=0.9*S;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(28), 32*S, 4.5*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // hat cone (tall, slight lean)
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(32), sy(28));
  ctx.bezierCurveTo(sx(40), sy(0), sx(55), sy(-14), sx(62), sy(-8));
  ctx.bezierCurveTo(sx(60), sy(8), sx(60), sy(24), sx(68), sy(28));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // hat highlight
  ctx.fillStyle='rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(sx(38), sy(26));
  ctx.bezierCurveTo(sx(42), sy(10), sx(52), sy(-4), sx(56), sy(-8));
  ctx.bezierCurveTo(sx(50), sy(4), sx(44), sy(18), sx(42), sy(26));
  ctx.closePath(); ctx.fill();
  // gold band
  ctx.fillStyle=acc;
  _hRr(sx(50)-14*S, sy(26.5), 28*S, 2*S, 0.5*S); ctx.fill();
  ctx.strokeStyle='#000'; ctx.lineWidth=0.3*S; ctx.stroke();
  // star on hat (tier 2 = bigger/rune)
  ctx.fillStyle=acc;
  const sxc=sx(52), syc=sy(12), sr=cfg.tier===2 ? 2.2*S : 1.6*S;
  _sStarShape(ctx, sxc, syc, sr, 5);
  ctx.fill();
  // eyes
  ctx.fillStyle='#0b0612';
  ctx.beginPath(); ctx.arc(sx(44), sy(34), 1.8*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(56), sy(34), 1.8*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=eye;
  ctx.beginPath(); ctx.arc(sx(44), sy(34), 1*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(56), sy(34), 1*S, 0, Math.PI*2); ctx.fill();
  // beard (small)
  ctx.fillStyle='#e0e0e8';
  ctx.beginPath();
  ctx.moveTo(sx(42), sy(40));
  ctx.bezierCurveTo(sx(44), sy(46), sx(56), sy(46), sx(58), sy(40));
  ctx.bezierCurveTo(sx(56), sy(43), sx(44), sy(43), sx(42), sy(40));
  ctx.closePath(); ctx.fill();
}

function _sHeadSkullMask(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#d0c8b0', acc = cfg.headAcc || '#cc44ff', eye = cfg.eye || '#cc44ff';
  // hood backdrop
  ctx.fillStyle='rgba(10,10,20,0.85)';
  ctx.beginPath();
  ctx.moveTo(sx(20), sy(44));
  ctx.bezierCurveTo(sx(18), sy(18), sx(30), sy(6), sx(50), sy(6));
  ctx.bezierCurveTo(sx(70), sy(6), sx(82), sy(18), sx(80), sy(44));
  ctx.bezierCurveTo(sx(74), sy(40), sx(58), sy(38), sx(50), sy(38));
  ctx.bezierCurveTo(sx(42), sy(38), sx(26), sy(40), sx(20), sy(44));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#000'; ctx.lineWidth=0.9*S; ctx.stroke();
  // skull
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=0.9*S;
  ctx.beginPath();
  ctx.moveTo(sx(32), sy(38));
  ctx.bezierCurveTo(sx(28), sy(20), sx(38), sy(12), sx(50), sy(12));
  ctx.bezierCurveTo(sx(62), sy(12), sx(72), sy(20), sx(68), sy(38));
  ctx.bezierCurveTo(sx(64), sy(40), sx(58), sy(40), sx(50), sy(40));
  ctx.bezierCurveTo(sx(42), sy(40), sx(36), sy(40), sx(32), sy(38));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // eye sockets (glowing)
  ctx.fillStyle='#0b0612';
  ctx.beginPath(); ctx.arc(sx(42), sy(26), 3.5*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(58), sy(26), 3.5*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=eye;
  ctx.beginPath(); ctx.arc(sx(42), sy(26), 1.7*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(58), sy(26), 1.7*S, 0, Math.PI*2); ctx.fill();
  // nasal cavity
  ctx.fillStyle='#0b0612';
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(30));
  ctx.lineTo(sx(48), sy(34));
  ctx.lineTo(sx(52), sy(34));
  ctx.closePath(); ctx.fill();
  // teeth line
  ctx.strokeStyle='#0b0612'; ctx.lineWidth=0.4*S;
  ctx.beginPath();
  ctx.moveTo(sx(40), sy(38)); ctx.lineTo(sx(60), sy(38));
  ctx.stroke();
  [44,48,52,56].forEach(x=>{
    ctx.beginPath(); ctx.moveTo(sx(x), sy(38)); ctx.lineTo(sx(x), sy(40)); ctx.stroke();
  });
  // crown (tier 2)
  if (cfg.tier===2) {
    ctx.fillStyle=acc;
    [42,46,50,54,58].forEach((x,i)=>{
      const h = i===2 ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(sx(x)-1.2*S, sy(14));
      ctx.lineTo(sx(x), sy(14-h));
      ctx.lineTo(sx(x)+1.2*S, sy(14));
      ctx.closePath(); ctx.fill();
    });
    ctx.strokeStyle='#000'; ctx.lineWidth=0.3*S; ctx.stroke();
  }
}

function _sHeadCrownHelm(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#e0e8f0', acc = cfg.headAcc || '#e0b840', eye = cfg.eye || '#ffeeaa';
  // brim
  ctx.fillStyle='#c0c8d0'; ctx.strokeStyle='#000'; ctx.lineWidth=0.8*S;
  ctx.beginPath(); ctx.ellipse(sx(50), sy(41), 30*S, 4*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // dome
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(sx(22), sy(41));
  ctx.bezierCurveTo(sx(22), sy(18), sx(34), sy(10), sx(50), sy(10));
  ctx.bezierCurveTo(sx(66), sy(10), sx(78), sy(18), sx(78), sy(41));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // highlight
  ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(39));
  ctx.bezierCurveTo(sx(30), sy(22), sx(37), sy(15), sx(46), sy(12));
  ctx.bezierCurveTo(sx(40), sy(16), sx(35), sy(24), sx(35), sy(39));
  ctx.closePath(); ctx.fill();
  // crown circlet
  ctx.fillStyle=acc; ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.5*S;
  _hRr(sx(50)-22*S, sy(22), 44*S, 3*S, 0.5*S); ctx.fill(); ctx.stroke();
  // crown points
  ctx.fillStyle=acc;
  [30,40,50,60,70].forEach(x=>{
    ctx.beginPath();
    ctx.moveTo(sx(x)-1.8*S, sy(22));
    ctx.lineTo(sx(x), sy(17));
    ctx.lineTo(sx(x)+1.8*S, sy(22));
    ctx.closePath(); ctx.fill();
  });
  ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.3*S;
  [30,40,50,60,70].forEach(x=>{
    ctx.beginPath();
    ctx.moveTo(sx(x)-1.8*S, sy(22));
    ctx.lineTo(sx(x), sy(17));
    ctx.lineTo(sx(x)+1.8*S, sy(22));
    ctx.closePath(); ctx.stroke();
  });
  // gem on center point (tier 2)
  if (cfg.tier===2) {
    ctx.fillStyle='#ff4466';
    ctx.beginPath(); ctx.arc(sx(50), sy(19), 1*S, 0, Math.PI*2); ctx.fill();
    // halo glow
    ctx.strokeStyle='rgba(255,238,170,0.6)'; ctx.lineWidth=1.2*S;
    ctx.beginPath(); ctx.arc(sx(50), sy(10), 20*S, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
  }
  // visor slot
  ctx.fillStyle='#0b0612';
  _hRr(sx(50)-22*S, sy(33), 44*S, 4.8*S, 1*S); ctx.fill();
  _sEyes(ctx, sx, sy, S, eye, 35.4);
}

function _sHeadSkullHorn(ctx, sx, sy, S, dir, cfg) {
  const hc = cfg.headCol || '#d0c8b0', eye = cfg.eye || '#ff4444';
  // face/skin under
  ctx.fillStyle='#d8a080'; ctx.strokeStyle='#000'; ctx.lineWidth=0.8*S;
  ctx.beginPath();
  ctx.ellipse(sx(50), sy(36), 16*S, 12*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // beard/war paint
  ctx.fillStyle='#1a0c08';
  ctx.beginPath();
  ctx.moveTo(sx(40), sy(40));
  ctx.bezierCurveTo(sx(44), sy(48), sx(56), sy(48), sx(60), sy(40));
  ctx.bezierCurveTo(sx(56), sy(44), sx(44), sy(44), sx(40), sy(40));
  ctx.closePath(); ctx.fill();
  // red war stripes across eyes
  ctx.fillStyle='#cc1818';
  _hRr(sx(50)-14*S, sy(30), 28*S, 3*S, 0.4*S); ctx.fill();
  // eyes glowing
  ctx.fillStyle='#0b0612';
  ctx.beginPath(); ctx.arc(sx(43), sy(31.5), 1.7*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(57), sy(31.5), 1.7*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=eye;
  ctx.beginPath(); ctx.arc(sx(43), sy(31.5), 0.9*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(57), sy(31.5), 0.9*S, 0, Math.PI*2); ctx.fill();
  // skull headdress (animal skull on top)
  ctx.fillStyle=hc; ctx.strokeStyle='#000'; ctx.lineWidth=0.9*S;
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(26));
  ctx.bezierCurveTo(sx(26), sy(10), sx(38), sy(0), sx(50), sy(0));
  ctx.bezierCurveTo(sx(62), sy(0), sx(74), sy(10), sx(70), sy(26));
  ctx.bezierCurveTo(sx(62), sy(22), sx(38), sy(22), sx(30), sy(26));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // skull eye holes
  ctx.fillStyle='#0b0612';
  ctx.beginPath(); ctx.arc(sx(42), sy(14), 2.2*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(58), sy(14), 2.2*S, 0, Math.PI*2); ctx.fill();
  // horns
  const hornSize = cfg.tier===2 ? 1.3 : 1;
  ctx.fillStyle='#4a3018'; ctx.strokeStyle='#000'; ctx.lineWidth=0.6*S;
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(8));
  ctx.bezierCurveTo(sx(20), sy(2), sx(10), sy(-6*hornSize), sx(14), sy(-10*hornSize));
  ctx.bezierCurveTo(sx(22), sy(-4*hornSize), sx(28), sy(4), sx(32), sy(10));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx(70), sy(8));
  ctx.bezierCurveTo(sx(80), sy(2), sx(90), sy(-6*hornSize), sx(86), sy(-10*hornSize));
  ctx.bezierCurveTo(sx(78), sy(-4*hornSize), sx(72), sy(4), sx(68), sy(10));
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

function _sEyes(ctx, sx, sy, S, eye, y) {
  ctx.fillStyle=eye;
  ctx.beginPath(); ctx.ellipse(sx(40), sy(y), 3.1*S, 1.8*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx(60), sy(y), 3.1*S, 1.8*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#0b0612';
  ctx.beginPath(); ctx.arc(sx(40), sy(y), 1.35*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(60), sy(y), 1.35*S, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffffff';
  ctx.beginPath(); ctx.arc(sx(40.5), sy(y-0.5), 0.55*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx(60.5), sy(y-0.5), 0.55*S, 0, Math.PI*2); ctx.fill();
}

function _sStarShape(ctx, cx, cy, r, n) {
  ctx.beginPath();
  for(let i=0;i<n*2;i++){
    const a = -Math.PI/2 + i*Math.PI/n;
    const rr = i%2===0 ? r : r*0.45;
    const px = cx + Math.cos(a)*rr, py = cy + Math.sin(a)*rr;
    if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
}

function _sDrawHead(ctx, sx, sy, S, dir, cfg) {
  switch(cfg.head) {
    case 'spike-helm':  return _sHeadSpikeHelm(ctx, sx, sy, S, dir, cfg);
    case 'flat-helm':   return _sHeadFlatHelm(ctx, sx, sy, S, dir, cfg);
    case 'bucket-helm': return _sHeadBucketHelm(ctx, sx, sy, S, dir, cfg);
    case 'hood':        return _sHeadHood(ctx, sx, sy, S, dir, cfg);
    case 'wizard-hat':  return _sHeadWizardHat(ctx, sx, sy, S, dir, cfg);
    case 'skull-mask':  return _sHeadSkullMask(ctx, sx, sy, S, dir, cfg);
    case 'crown-helm':  return _sHeadCrownHelm(ctx, sx, sy, S, dir, cfg);
    case 'skull-horn':  return _sHeadSkullHorn(ctx, sx, sy, S, dir, cfg);
    default:            return _sHeadSpikeHelm(ctx, sx, sy, S, dir, cfg);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  WEAPON VARIATIONS (drawn in local transformed frame; handle points DOWN)
// ═══════════════════════════════════════════════════════════════════════════
function _sWpnSword(ctx, S, cfg) {
  const pommel = cfg.pommelCol || '#c08030';
  ctx.fillStyle='#c8cdd8'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(-1.8*S, -22*S); ctx.lineTo(1.8*S, -22*S);
  ctx.lineTo(1.8*S, 11*S); ctx.lineTo(0, 14*S); ctx.lineTo(-1.8*S, 11*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=0.3*S;
  ctx.beginPath(); ctx.moveTo(-0.9*S, -19*S); ctx.lineTo(-0.9*S, 8*S); ctx.stroke();
  ctx.fillStyle='#5a3a1a'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-5.5*S, 11*S, 11*S, 2.6*S, 0.6*S); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#9a6a3a';
  ctx.fillRect(-5.5*S, 11*S, 11*S, 0.9*S);
  ctx.fillStyle='#3a2510'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.3*S;
  ctx.fillRect(-1.4*S, 13.6*S, 2.8*S, 6.5*S); ctx.strokeRect(-1.4*S, 13.6*S, 2.8*S, 6.5*S);
  ctx.fillStyle=pommel; ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.arc(0, 21.2*S, 1.9*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#f0c870';
  ctx.beginPath(); ctx.arc(-0.6*S, 20.6*S, 0.7*S, 0, Math.PI*2); ctx.fill();
}

function _sWpnSpear(ctx, S, cfg) {
  // shaft
  ctx.fillStyle='#6a4418'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-0.8*S, -28*S, 1.6*S, 46*S, 0.3*S); ctx.fill(); ctx.stroke();
  // leaf-blade
  ctx.fillStyle='#c8d0dc'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(0, -38*S);
  ctx.bezierCurveTo(3*S, -34*S, 3.5*S, -30*S, 0, -26*S);
  ctx.bezierCurveTo(-3.5*S, -30*S, -3*S, -34*S, 0, -38*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // shine
  ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=0.3*S;
  ctx.beginPath(); ctx.moveTo(-1*S, -36*S); ctx.lineTo(-1*S, -28*S); ctx.stroke();
  // binding
  ctx.fillStyle='#3a2510';
  _hRr(-1.4*S, -27*S, 2.8*S, 1.4*S, 0.2*S); ctx.fill();
  // pommel
  ctx.fillStyle='#8a6a3a';
  ctx.beginPath(); ctx.arc(0, 18.5*S, 1.4*S, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.3*S; ctx.stroke();
}

function _sWpnDagger(ctx, S, cfg) {
  ctx.fillStyle='#c8cdd8'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(-1.5*S, -14*S); ctx.lineTo(1.5*S, -14*S);
  ctx.lineTo(1.5*S, 8*S); ctx.lineTo(0, 11*S); ctx.lineTo(-1.5*S, 8*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=0.3*S;
  ctx.beginPath(); ctx.moveTo(-0.7*S, -12*S); ctx.lineTo(-0.7*S, 6*S); ctx.stroke();
  // crossguard (small)
  ctx.fillStyle='#5a3a1a';
  _hRr(-3.5*S, 8*S, 7*S, 1.8*S, 0.4*S); ctx.fill(); ctx.stroke();
  // grip
  ctx.fillStyle='#3a2510';
  ctx.fillRect(-1.2*S, 10*S, 2.4*S, 5*S); ctx.strokeRect(-1.2*S, 10*S, 2.4*S, 5*S);
  // pommel
  ctx.fillStyle='#9a6a3a';
  ctx.beginPath(); ctx.arc(0, 16*S, 1.4*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}

function _sWpnAxe(ctx, S, cfg) {
  // shaft
  ctx.fillStyle='#5a3a1a'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-1*S, -20*S, 2*S, 38*S, 0.3*S); ctx.fill(); ctx.stroke();
  // axe head (crescent)
  ctx.fillStyle='#8a9098'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(0, -22*S);
  ctx.bezierCurveTo(10*S, -24*S, 13*S, -18*S, 11*S, -12*S);
  ctx.bezierCurveTo(9*S, -10*S, 4*S, -14*S, 0, -14*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // second blade (double axe for tier 2)
  if (cfg.weapon==='axe-double') {
    ctx.beginPath();
    ctx.moveTo(0, -22*S);
    ctx.bezierCurveTo(-10*S, -24*S, -13*S, -18*S, -11*S, -12*S);
    ctx.bezierCurveTo(-9*S, -10*S, -4*S, -14*S, 0, -14*S);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // edge highlight
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=0.3*S;
  ctx.beginPath();
  ctx.moveTo(2*S, -22*S);
  ctx.bezierCurveTo(8*S, -23*S, 11*S, -19*S, 10*S, -14*S);
  ctx.stroke();
  // binding on shaft
  ctx.fillStyle='#3a1a08';
  _hRr(-1.4*S, -14*S, 2.8*S, 2*S, 0.3*S); ctx.fill();
  // pommel cap
  ctx.fillStyle='#8a6a3a';
  ctx.beginPath(); ctx.arc(0, 18*S, 1.5*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}

function _sWpnStaffOrb(ctx, S, cfg) {
  const orbCol = cfg.weaponCol || '#aa88ff';
  ctx.fillStyle='#4a2a10'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-1*S, -22*S, 2*S, 44*S, 0.3*S); ctx.fill(); ctx.stroke();
  // wrap at top
  ctx.fillStyle='#6a4420';
  _hRr(-1.5*S, -20*S, 3*S, 3*S, 0.4*S); ctx.fill();
  // glowing orb
  ctx.shadowColor = orbCol; ctx.shadowBlur = 10;
  ctx.fillStyle=orbCol;
  ctx.beginPath(); ctx.arc(0, -26*S, 4.5*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle='#000'; ctx.lineWidth=0.4*S; ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.arc(-1.5*S, -27.5*S, 1.6*S, 0, Math.PI*2); ctx.fill();
  // orb cradle (claw fingers)
  ctx.strokeStyle='#2a1808'; ctx.lineWidth=0.8*S; ctx.lineCap='round';
  for (let a of [-0.6, 0, 0.6]) {
    ctx.beginPath();
    ctx.moveTo(Math.sin(a)*4*S, -22*S);
    ctx.quadraticCurveTo(Math.sin(a)*6*S, -26*S, Math.sin(a)*3.5*S, -28*S);
    ctx.stroke();
  }
}

function _sWpnStaffSkull(ctx, S, cfg) {
  const col = cfg.weaponCol || '#d0c8b0';
  ctx.fillStyle='#2a1a0a'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-1*S, -22*S, 2*S, 44*S, 0.3*S); ctx.fill(); ctx.stroke();
  // skull at top
  ctx.fillStyle=col; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.arc(0, -26*S, 4*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // jaw
  ctx.beginPath();
  ctx.moveTo(-3*S, -24*S);
  ctx.lineTo(3*S, -24*S);
  ctx.lineTo(2*S, -21*S);
  ctx.lineTo(-2*S, -21*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // eye sockets glowing
  ctx.fillStyle='#cc44ff';
  ctx.beginPath(); ctx.arc(-1.4*S, -27*S, 0.9*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.4*S, -27*S, 0.9*S, 0, Math.PI*2); ctx.fill();
  // purple glow aura
  ctx.shadowColor='#cc44ff'; ctx.shadowBlur=6;
  ctx.strokeStyle='rgba(204,68,255,0.5)'; ctx.lineWidth=0.4*S;
  ctx.beginPath(); ctx.arc(0, -26*S, 5.5*S, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur=0;
}

function _sWpnBow(ctx, S, cfg) {
  // bow arc
  ctx.strokeStyle='#6a4420'; ctx.lineWidth=1.4*S; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-10*S, -22*S);
  ctx.quadraticCurveTo(10*S, 0, -10*S, 22*S);
  ctx.stroke();
  // bow highlight
  ctx.strokeStyle='#9a7040'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(-8*S, -20*S);
  ctx.quadraticCurveTo(8*S, 0, -8*S, 20*S);
  ctx.stroke();
  // string
  ctx.strokeStyle='#e0e0e0'; ctx.lineWidth=0.3*S;
  ctx.beginPath();
  ctx.moveTo(-10*S, -22*S);
  ctx.lineTo(-10*S, 22*S);
  ctx.stroke();
  // arrow nocked
  ctx.strokeStyle='#4a2a10'; ctx.lineWidth=0.6*S;
  ctx.beginPath();
  ctx.moveTo(-12*S, 0); ctx.lineTo(6*S, 0);
  ctx.stroke();
  // arrow tip
  ctx.fillStyle='#a0a8b4'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.3*S;
  ctx.beginPath();
  ctx.moveTo(6*S, 0); ctx.lineTo(3*S, -1.4*S); ctx.lineTo(3*S, 1.4*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // fletching
  ctx.fillStyle = cfg.tier===2 ? '#e0b840' : '#cc4444';
  ctx.beginPath();
  ctx.moveTo(-12*S, 0); ctx.lineTo(-14*S, -1.5*S); ctx.lineTo(-10*S, 0); ctx.lineTo(-14*S, 1.5*S);
  ctx.closePath(); ctx.fill();
}

function _sWpnHammer(ctx, S, cfg) {
  // shaft
  ctx.fillStyle='#5a3a1a'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.4*S;
  _hRr(-1.1*S, -18*S, 2.2*S, 36*S, 0.3*S); ctx.fill(); ctx.stroke();
  // hammer head (rectangular block)
  ctx.fillStyle='#9098a4'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.6*S;
  _hRr(-7*S, -24*S, 14*S, 8*S, 1*S); ctx.fill(); ctx.stroke();
  // head highlight
  ctx.fillStyle='rgba(255,255,255,0.35)';
  _hRr(-6*S, -23*S, 12*S, 1.5*S, 0.5*S); ctx.fill();
  // face accents
  ctx.strokeStyle='#2a3040'; ctx.lineWidth=0.4*S;
  ctx.beginPath(); ctx.moveTo(-6.5*S, -21*S); ctx.lineTo(-6.5*S, -19*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6.5*S, -21*S); ctx.lineTo(6.5*S, -19*S); ctx.stroke();
  // gold trim (tier 2)
  if (cfg.tier===2) {
    ctx.fillStyle='#e0b840';
    _hRr(-7*S, -16.8*S, 14*S, 1*S, 0.3*S); ctx.fill();
  }
  // binding
  ctx.fillStyle='#3a1a08';
  _hRr(-1.5*S, -14*S, 3*S, 2*S, 0.3*S); ctx.fill();
  // pommel cap
  ctx.fillStyle='#8a6a3a';
  ctx.beginPath(); ctx.arc(0, 17*S, 1.4*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}

function _sWpnGreatsword(ctx, S, cfg) {
  const glow = cfg.weapon === 'greatsword-glow';
  if (glow) { ctx.shadowColor='#ffeeaa'; ctx.shadowBlur=8; }
  // long blade
  ctx.fillStyle='#d8dce4'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath();
  ctx.moveTo(-2.2*S, -30*S); ctx.lineTo(2.2*S, -30*S);
  ctx.lineTo(2.2*S, 10*S); ctx.lineTo(0, 14*S); ctx.lineTo(-2.2*S, 10*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (glow) ctx.shadowBlur=0;
  // blade shine
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=0.4*S;
  ctx.beginPath(); ctx.moveTo(-1.1*S, -27*S); ctx.lineTo(-1.1*S, 7*S); ctx.stroke();
  // wide crossguard
  ctx.fillStyle='#e0b840'; ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.5*S;
  _hRr(-8*S, 10*S, 16*S, 3*S, 0.8*S); ctx.fill(); ctx.stroke();
  // guard pommels
  ctx.fillStyle='#f0d060';
  ctx.beginPath(); ctx.arc(-8*S, 11.5*S, 1.2*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(8*S, 11.5*S, 1.2*S, 0, Math.PI*2); ctx.fill();
  // two-hand grip
  ctx.fillStyle='#3a2510'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.3*S;
  ctx.fillRect(-1.6*S, 13*S, 3.2*S, 9*S); ctx.strokeRect(-1.6*S, 13*S, 3.2*S, 9*S);
  // pommel
  ctx.fillStyle='#e0b840'; ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.arc(0, 23*S, 2.2*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}

function _sDrawWeapon(ctx, S, cfg) {
  switch(cfg.weapon) {
    case 'sword':           return _sWpnSword(ctx, S, cfg);
    case 'spear':           return _sWpnSpear(ctx, S, cfg);
    case 'dagger':          return _sWpnDagger(ctx, S, cfg);
    case 'axe': case 'axe-double': return _sWpnAxe(ctx, S, cfg);
    case 'staff-orb':       return _sWpnStaffOrb(ctx, S, cfg);
    case 'staff-skull':     return _sWpnStaffSkull(ctx, S, cfg);
    case 'bow':             return _sWpnBow(ctx, S, cfg);
    case 'hammer':          return _sWpnHammer(ctx, S, cfg);
    case 'greatsword': case 'greatsword-glow': return _sWpnGreatsword(ctx, S, cfg);
    default:                return _sWpnSword(ctx, S, cfg);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  SHIELD VARIATIONS
// ═══════════════════════════════════════════════════════════════════════════
function _sShieldRoundWood(ctx, sx, sy, S, dir, cfg) {
  const cx = sx(17), cy = sy(58);
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(cx+6*S*dir, cy, 3*S, 11*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=cfg.shieldCol||'#8a5a30'; ctx.strokeStyle='#1a0c04'; ctx.lineWidth=0.9*S;
  ctx.beginPath(); ctx.arc(cx, cy, 11*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='rgba(58,30,8,0.75)'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.moveTo(cx-10*S, cy-3*S); ctx.lineTo(cx+10*S, cy-3*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-10*S, cy+3*S); ctx.lineTo(cx+10*S, cy+3*S); ctx.stroke();
  ctx.strokeStyle='#9aa0ac'; ctx.lineWidth=1.2*S;
  ctx.beginPath(); ctx.arc(cx, cy, 10.6*S, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle='#c8ccd6';
  [[0,-9.8],[9.8,0],[0,9.8],[-9.8,0],[6.9,-6.9],[6.9,6.9],[-6.9,-6.9],[-6.9,6.9]].forEach(([ox,oy])=>{
    ctx.beginPath(); ctx.arc(cx+ox*S*dir, cy+oy*S, 0.7*S, 0, Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='#8a8e98'; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=0.5*S;
  ctx.beginPath(); ctx.arc(cx, cy, 2.8*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}

function _sShieldKite(ctx, sx, sy, S, dir, cfg) {
  const cx = sx(17), cy = sy(58);
  const col = cfg.shieldCol || '#c8d0e0';
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(cx+6*S*dir, cy, 3*S, 13*S, 0, 0, Math.PI*2); ctx.fill();
  // kite body (teardrop)
  ctx.fillStyle=col; ctx.strokeStyle='#1a1e28'; ctx.lineWidth=1*S;
  ctx.beginPath();
  ctx.moveTo(cx-8*S*dir, cy-13*S);
  ctx.lineTo(cx+8*S*dir, cy-13*S);
  ctx.lineTo(cx+9*S*dir, cy+4*S);
  ctx.lineTo(cx, cy+14*S);
  ctx.lineTo(cx-9*S*dir, cy+4*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // highlight
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(cx-6*S*dir, cy-11*S);
  ctx.lineTo(cx+1*S*dir, cy-11*S);
  ctx.lineTo(cx+2*S*dir, cy);
  ctx.lineTo(cx-1*S*dir, cy+6*S);
  ctx.lineTo(cx-7*S*dir, cy);
  ctx.closePath(); ctx.fill();
  // cross emblem
  ctx.fillStyle = cfg.emblemCol || '#3050a0';
  ctx.fillRect(cx-1.2*S*dir-Math.abs(dir)*0, cy-10*S, 2.4*S, 20*S);
  ctx.fillRect(cx-7*S, cy-1.3*S, 14*S, 2.6*S);
  // gold boss
  ctx.fillStyle = cfg.tier===2 ? '#ffdd60' : '#e0b840';
  ctx.beginPath(); ctx.arc(cx, cy, 2.2*S, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='#3a2510'; ctx.lineWidth=0.4*S; ctx.stroke();
}

function _sDrawShield(ctx, sx, sy, S, dir, cfg) {
  switch(cfg.shield) {
    case 'round-wood': return _sShieldRoundWood(ctx, sx, sy, S, dir, cfg);
    case 'kite':       return _sShieldKite(ctx, sx, sy, S, dir, cfg);
    default: return;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  EMBLEM VARIATIONS (drawn at waist, center x,y)
// ═══════════════════════════════════════════════════════════════════════════
function _sDrawEmblem(ctx, x, y, S, type, col) {
  ctx.strokeStyle='rgba(0,0,0,0.6)'; ctx.lineWidth=0.4*S;
  ctx.fillStyle=col || '#c14a5e';
  switch(type) {
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(x-6*S, y-2*S); ctx.lineTo(x, y+3*S); ctx.lineTo(x+6*S, y-2*S);
      ctx.lineTo(x+6*S, y); ctx.lineTo(x, y+5*S); ctx.lineTo(x-6*S, y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'cross':
      ctx.fillRect(x-1.4*S, y-5*S, 2.8*S, 10*S);
      ctx.fillRect(x-5*S, y-1.4*S, 10*S, 2.8*S);
      ctx.strokeRect(x-1.4*S, y-5*S, 2.8*S, 10*S);
      ctx.strokeRect(x-5*S, y-1.4*S, 10*S, 2.8*S);
      break;
    case 'star':
      _sStarShape(ctx, x, y, 5*S, 5); ctx.fill(); ctx.stroke();
      break;
    case 'skull':
      ctx.beginPath(); ctx.arc(x, y-1*S, 4*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#0b0612';
      ctx.beginPath(); ctx.arc(x-1.5*S, y-1.5*S, 1*S, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+1.5*S, y-1.5*S, 1*S, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle=col; ctx.fillRect(x-2.5*S, y+2*S, 5*S, 1.5*S); ctx.strokeRect(x-2.5*S, y+2*S, 5*S, 1.5*S);
      break;
    case 'flame':
      ctx.beginPath();
      ctx.moveTo(x, y-6*S);
      ctx.bezierCurveTo(x+4*S, y-3*S, x+4*S, y+2*S, x, y+5*S);
      ctx.bezierCurveTo(x-4*S, y+2*S, x-4*S, y-3*S, x, y-6*S);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(x-1*S, y, 1.4*S, 2.5*S, 0, 0, Math.PI*2); ctx.fill();
      break;
    case 'sun':
      ctx.beginPath(); ctx.arc(x, y, 3.5*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        const x1=x+Math.cos(a)*4.5*S, y1=y+Math.sin(a)*4.5*S;
        const x2=x+Math.cos(a)*6.5*S, y2=y+Math.sin(a)*6.5*S;
        ctx.strokeStyle=col; ctx.lineWidth=0.8*S;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }
      break;
    case 'eye':
      ctx.beginPath(); ctx.ellipse(x, y, 5*S, 2.5*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#0b0612';
      ctx.beginPath(); ctx.arc(x, y, 1.8*S, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffffff';
      ctx.beginPath(); ctx.arc(x+0.6*S, y-0.6*S, 0.7*S, 0, Math.PI*2); ctx.fill();
      break;
    case 'arrow':
      ctx.strokeStyle=col; ctx.lineWidth=1.2*S; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x-5*S, y+2*S); ctx.lineTo(x+4*S, y-3*S); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x+5*S, y-4*S); ctx.lineTo(x+2*S, y-4*S); ctx.lineTo(x+2*S, y-1*S);
      ctx.closePath(); ctx.fillStyle=col; ctx.fill();
      break;
    case 'claw':
      ctx.strokeStyle=col; ctx.lineWidth=1.2*S; ctx.lineCap='round';
      [-3,0,3].forEach(d=>{
        ctx.beginPath(); ctx.moveTo(x+d*S, y-4*S); ctx.lineTo(x+d*S+2*S, y+4*S); ctx.stroke();
      });
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  CHEST PLATE — tier 2 metal/leather chest armor overlay
// ═══════════════════════════════════════════════════════════════════════════
function _sChestPlate(ctx, sx, sy, S, cfg) {
  const main = cfg.chestCol || '#a8acb8';
  const dark = cfg.chestDark || '#0a0c14';
  const hi   = cfg.chestHi   || 'rgba(200,204,214,0.45)';
  // Trapezoidal plate
  ctx.fillStyle = main; ctx.strokeStyle = dark; ctx.lineWidth = 0.7*S;
  ctx.beginPath();
  ctx.moveTo(sx(30), sy(44));
  ctx.bezierCurveTo(sx(32), sy(42), sx(68), sy(42), sx(70), sy(44));
  ctx.lineTo(sx(73), sy(70));
  ctx.bezierCurveTo(sx(68), sy(74), sx(32), sy(74), sx(27), sy(70));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Top highlight
  ctx.fillStyle = hi;
  ctx.beginPath();
  ctx.moveTo(sx(32), sy(45));
  ctx.bezierCurveTo(sx(40), sy(44), sx(60), sy(44), sx(68), sy(45));
  ctx.lineTo(sx(66), sy(50));
  ctx.bezierCurveTo(sx(58), sy(49), sx(42), sy(49), sx(34), sy(50));
  ctx.closePath(); ctx.fill();
  // Center seam
  ctx.strokeStyle = 'rgba(20,30,40,0.7)'; ctx.lineWidth = 0.4*S;
  ctx.beginPath(); ctx.moveTo(sx(50), sy(44)); ctx.lineTo(sx(50), sy(73)); ctx.stroke();
  // Side seams
  ctx.lineWidth = 0.3*S; ctx.strokeStyle = 'rgba(20,30,40,0.55)';
  ctx.beginPath(); ctx.moveTo(sx(37), sy(45)); ctx.lineTo(sx(34), sy(72));
  ctx.moveTo(sx(63), sy(45)); ctx.lineTo(sx(66), sy(72)); ctx.stroke();
  // Top rivets
  ctx.fillStyle = '#c8ccd6';
  [[34,45.5],[42,44.5],[50,44.2],[58,44.5],[66,45.5]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(sx(x), sy(y), 0.55*S, 0, Math.PI*2); ctx.fill();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  MASTER: drawHeroEgg
// ═══════════════════════════════════════════════════════════════════════════
function drawHeroEgg(ctx, p, cfg) {
  _hCtx = ctx;
  const {CX, CY0, H, roD: dir, roT, wdup: wd, strk: sk, recv: rv, state: st} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);
  const wk = _heroWalkCycle(roT, st, !!cfg.fast);

  _sShadow(ctx, sx, sy, S);
  _sFeet(ctx, sx, sy, S, dir, wk, cfg.bootCol);

  ctx.save();
  // bob + torso lean
  const pivX = sx(50), pivY = sy(88);
  ctx.translate(pivX, pivY);
  ctx.rotate(wk.torsoRot * Math.PI/180 * dir);
  ctx.translate(-pivX, -pivY);
  ctx.translate(0, (wk.bobY + wk.idleBob) * S);

  // body
  _sBody(ctx, sx, sy, S, cfg.body, cfg.bodyHi);

  // tier-2 chest plate (heavy-armor heroes)
  if (cfg.chest === 'plate') _sChestPlate(ctx, sx, sy, S, cfg);

  // back-arm (shield or off-hand)
  if (cfg.shield) {
    ctx.save();
    const shPivX = sx(22), shPivY = sy(55);
    ctx.translate(shPivX, shPivY);
    ctx.rotate(wk.shArmRot * Math.PI/180 * dir);
    ctx.translate(-shPivX, -shPivY);
    _sDrawShield(ctx, sx, sy, S, dir, cfg);
    ctx.restore();
  }

  // front arm (weapon)
  const swing = _heroSwordSwing(wd, sk, rv);
  ctx.save();
  const swPivX = sx(78), swPivY = sy(55);
  ctx.translate(swPivX, swPivY);
  ctx.rotate(wk.swArmRot * Math.PI/180 * dir);
  ctx.translate(-swPivX, -swPivY);
  const wpnAnchorX = cfg.weapon==='bow' ? sx(82) : sx(85);
  const wpnAnchorY = cfg.weapon==='bow' ? sy(52) : sy(48);
  ctx.translate(wpnAnchorX, wpnAnchorY);
  const baseAng = cfg.weaponAngle != null ? cfg.weaponAngle : (cfg.weapon==='bow' ? -5 : 18);
  ctx.rotate((baseAng + swing) * Math.PI / 180 * dir);
  _sDrawWeapon(ctx, S, cfg);
  // attack trail
  if (sk>0.06 && sk<0.94) {
    const ta = sk*(1-sk)*4;
    ctx.globalAlpha = ta*0.22;
    ctx.strokeStyle = cfg.trailCol || '#d0d8e8'; ctx.lineWidth=1.2*S; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(0, -6*S, 22*S, -Math.PI*0.7, -Math.PI*0.15); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // head / helmet
  _sDrawHead(ctx, sx, sy, S, dir, cfg);

  // emblem at waist
  if (cfg.emblem) _sDrawEmblem(ctx, sx(50), sy(70), S, cfg.emblem, cfg.emblemCol);

  ctx.restore();
  return sy(6) + wk.bobY*S - 12;
}

// ═══════════════════════════════════════════════════════════════════════════
//  HERO CONFIGS (all 20 types)
// ═══════════════════════════════════════════════════════════════════════════
const STUDIO_HEROES = {
  recruit:   { body:'#4a2a80', bodyHi:'rgba(90,60,130,0.55)', head:'spike-helm', headCol:'#b0b6c2', weapon:'sword', shield:'round-wood', shieldCol:'#8a5a30', emblem:'heart', emblemCol:'#c14a5e', eye:'#66ccff', tier:1 },
  recruit2:  { body:'#5a2a90', bodyHi:'rgba(120,80,180,0.6)', head:'spike-helm', headCol:'#c0c6d2', headAcc:'#e0b840', weapon:'sword', pommelCol:'#e0b840', shield:'round-wood', shieldCol:'#9a6a40', emblem:'heart', emblemCol:'#e05a6e', eye:'#66ccff', tier:2, chest:'plate', chestCol:'#a8acb8' },

  soldier:   { body:'#c06a20', bodyHi:'rgba(230,130,60,0.55)', head:'flat-helm', headCol:'#a0a8b4', weapon:'sword', shield:null, emblem:'flame', emblemCol:'#ff8800', eye:'#ffcc44', tier:1 },
  soldier2:  { body:'#d07a30', bodyHi:'rgba(240,150,80,0.6)', head:'flat-helm', headCol:'#b0b8c4', headAcc:'#e0b840', weapon:'spear', shield:'round-wood', shieldCol:'#9a6a40', emblem:'flame', emblemCol:'#ffaa22', eye:'#ffdd66', tier:2, chest:'plate', chestCol:'#b09060' },

  scout:     { body:'#3a7a28', bodyHi:'rgba(85,176,51,0.55)', head:'hood', headCol:'#2a4018', weapon:'dagger', shield:null, emblem:'arrow', emblemCol:'#aa7744', eye:'#88ff66', tier:1, fast:true },
  scout2:    { body:'#3a7a28', bodyHi:'rgba(102,200,68,0.6)', head:'hood', headCol:'#2a4018', headAcc:'#ddcc44', weapon:'dagger', shield:null, emblem:'eye', emblemCol:'#ccff66', eye:'#aaff88', tier:2, fast:true },

  archer:    { body:'#446628', bodyHi:'rgba(102,136,68,0.55)', head:'hood', headCol:'#2a3a14', weapon:'bow', shield:null, emblem:'arrow', emblemCol:'#ccaa66', eye:'#aaffaa', tier:1 },
  archer2:   { body:'#446628', bodyHi:'rgba(119,160,85,0.6)', head:'hood', headCol:'#2a3a14', headAcc:'#cc8844', weapon:'bow', shield:null, emblem:'arrow', emblemCol:'#e0b840', eye:'#ccffcc', tier:2 },

  knight:    { body:'#2a3a6a', bodyHi:'rgba(80,110,180,0.45)', head:'bucket-helm', headCol:'#b0b8c8', headAcc:'#3050a0', weapon:'sword', shield:'kite', shieldCol:'#c0c8d8', emblemCol:'#3050a0', eye:'#66ccff', tier:1 },
  knight2:   { body:'#2a3a6a', bodyHi:'rgba(100,130,200,0.55)', head:'bucket-helm', headCol:'#c0c8d8', headAcc:'#e0b840', weapon:'sword', pommelCol:'#e0b840', shield:'kite', shieldCol:'#d0d8e8', emblemCol:'#e0b840', eye:'#88ddff', tier:2, chest:'plate', chestCol:'#c0c8d8' },

  mage:      { body:'#3a1a6a', bodyHi:'rgba(130,80,200,0.55)', head:'wizard-hat', headCol:'#2a0a5a', headAcc:'#ffdd44', weapon:'staff-orb', weaponCol:'#aa88ff', shield:null, emblem:'star', emblemCol:'#ffdd44', eye:'#cc88ff', tier:1, trailCol:'#cc88ff' },
  mage2:     { body:'#3a1a6a', bodyHi:'rgba(160,100,230,0.6)', head:'wizard-hat', headCol:'#1a0544', headAcc:'#ffee66', weapon:'staff-orb', weaponCol:'#ddaaff', shield:null, emblem:'star', emblemCol:'#ffee66', eye:'#eeaaff', tier:2, trailCol:'#eeaaff' },

  paladin:   { body:'#b08010', bodyHi:'rgba(255,200,80,0.5)', head:'crown-helm', headCol:'#e0e8f0', headAcc:'#e0b840', weapon:'hammer', shield:'kite', shieldCol:'#f0e8d0', emblemCol:'#e0b840', emblem:'sun', eye:'#ffeeaa', tier:1 },
  paladin2:  { body:'#c08810', bodyHi:'rgba(255,220,100,0.55)', head:'crown-helm', headCol:'#f0e8d0', headAcc:'#ffdd44', weapon:'hammer', shield:'kite', shieldCol:'#ffeec0', emblemCol:'#ffdd44', emblem:'sun', eye:'#ffffdd', tier:2, trailCol:'#ffeeaa', chest:'plate', chestCol:'#e0c860' },

  berserker: { body:'#7a1a1a', bodyHi:'rgba(192,58,58,0.55)', head:'skull-horn', headCol:'#d0c8b0', weapon:'axe', shield:null, emblem:'claw', emblemCol:'#ffee44', eye:'#ff4444', tier:1, trailCol:'#ff6666' },
  berserker2:{ body:'#7a1a1a', bodyHi:'rgba(224,74,74,0.6)', head:'skull-horn', headCol:'#e0d8c0', weapon:'axe-double', shield:null, emblem:'claw', emblemCol:'#ff2222', eye:'#ff2222', tier:2, trailCol:'#ff2222' },

  assassin:  { body:'#222233', bodyHi:'rgba(68,85,102,0.5)', head:'hood', headCol:'#1a1a28', weapon:'dagger', shield:null, emblem:'eye', emblemCol:'#33aa77', eye:'#66ffaa', tier:1, fast:true },
  assassin2: { body:'#222233', bodyHi:'rgba(85,102,119,0.55)', head:'hood', headCol:'#1a1a28', headAcc:'#44bb88', weapon:'dagger', shield:null, emblem:'eye', emblemCol:'#55ddaa', eye:'#88ffcc', tier:2, fast:true },

  necro:     { body:'#1a1a2a', bodyHi:'rgba(58,58,74,0.55)', head:'skull-mask', headCol:'#d0c8b0', weapon:'staff-skull', weaponCol:'#d0c8b0', shield:null, emblem:'skull', emblemCol:'#8844aa', eye:'#cc44ff', tier:1, trailCol:'#cc44ff' },
  necro2:    { body:'#0a0a1a', bodyHi:'rgba(74,58,106,0.6)', head:'skull-mask', headCol:'#e0d8c0', headAcc:'#cc44ff', weapon:'staff-skull', weaponCol:'#e8e0c0', shield:null, emblem:'skull', emblemCol:'#aa44ee', eye:'#ee66ff', tier:2, trailCol:'#ee66ff' },

  warlord:   { body:'#774400', bodyHi:'rgba(204,102,0,0.55)', head:'crown-helm', headCol:'#c0a060', headAcc:'#e0b840', weapon:'sword', pommelCol:'#e0b840', shield:'kite', shieldCol:'#c0a060', emblemCol:'#ffcc44', emblem:'sun', eye:'#ffcc44', tier:1 },
  warlord2:  { body:'#885500', bodyHi:'rgba(221,119,0,0.6)', head:'crown-helm', headCol:'#d0b070', headAcc:'#ffdd44', weapon:'sword', pommelCol:'#ffdd44', shield:'kite', shieldCol:'#d0b070', emblemCol:'#ffdd44', emblem:'sun', eye:'#ffee66', tier:2 },

  champion:  { body:'#8a2a8a', bodyHi:'rgba(192,68,192,0.55)', head:'crown-helm', headCol:'#e0b840', headAcc:'#ffdd44', weapon:'greatsword', shield:null, emblem:'star', emblemCol:'#ffdd44', eye:'#ffaaff', tier:1, trailCol:'#ffcc88' },
  champion2: { body:'#8a2a8a', bodyHi:'rgba(224,102,224,0.6)', head:'crown-helm', headCol:'#ffdd44', headAcc:'#ffffaa', weapon:'greatsword-glow', shield:null, emblem:'star', emblemCol:'#ffeeaa', eye:'#ffccff', tier:2, trailCol:'#ffeeaa' },
};

// ═══════════════════════════════════════════════════════════════════════════
//  DUNGEON LORD — egg-body chibi style, but unique (cape, crown, beard, staff)
// ═══════════════════════════════════════════════════════════════════════════
function drawLordStudio(ctx, p) {
  _hCtx = ctx;
  const {CX, CY0, H, roD: dir, roT} = p;
  const {S, sx, sy} = _heroStudio(CX, CY0, H, dir);

  // ── ATTACK PHASE — асиметричне таймінгування з overshoot ───────────────
  // Використовуємо сирий прогрес атаки (ap, 0..1) і рахуємо всі параметри
  // через нелінійні криві. Це дає правильний "живий" рух: повільний замах,
  // різкий удар з перелітанням, пружний retreat.
  const ap = p.ap || 0;
  const atkVar = p.atkVar || 0;        // 0 = beam blast, 1 = ground slam
  const atkActive = ap > 0;

  let staffAng = 0, staffYOff = 0, atkLeanX = 0, atkLeanY = 0, atkScaleY = 1;
  let atkCrystGlow = 0, windupAura = 0, beamFire = 0, slamFire = 0;

  if (atkActive) {
    if (atkVar === 0) {
      // ═════════════════════════════════════════════════════════════════
      // VARIANT 0 — BEAM BLAST (підняття і випромінювання)
      // Лорд піднімає посох уверх під час замаху (як справжній маг),
      // потім ЛЕГКО нахиляє вперед і кристал стріляє променем.
      // Посох залишається майже вертикальним — чари йдуть з кристала,
      // а не "кидаються посохом в ворога".
      // ═════════════════════════════════════════════════════════════════
      if (ap < 0.40) {
        const t = ap / 0.40;
        const ei = t * t;
        staffAng     = -dir * 0.18 * ei;             // легкий відхил назад (~10°)
        staffYOff    = -6 * ei * S;                  // посох піднімається
        atkLeanX     = -dir * 2 * ei * S;
        atkLeanY     = -2 * ei * S;
        windupAura   = ei;
        atkCrystGlow = ei * 0.90;
      } else if (ap < 0.55) {
        const t = (ap - 0.40) / 0.15;
        const c1 = 2.2, c3 = c1 + 1;
        const eob = 1 + c3 * Math.pow(t-1, 3) + c1 * Math.pow(t-1, 2);
        // Легкий ривок вперед: з -10° у +25-30° (залишається майже вертикальним)
        staffAng     = -dir * 0.18 + dir * 0.63 * eob;
        staffYOff    = -6 * S + 2 * S * t;
        atkLeanX     = -dir * 2 * S + dir * 6 * S * (t*t);
        atkLeanY     = -2*S + 3*S * t;
        atkCrystGlow = 0.90 + t * 0.50;
        beamFire     = t * 0.85;
      } else if (ap < 0.80) {
        const t = (ap - 0.55) / 0.25;
        const tremor = Math.sin(t * 30) * (1 - t) * 0.03;
        staffAng     = dir * (0.42 + tremor);         // утримання нахилу ~24°
        staffYOff    = -4 * S * (1 - t*0.5);
        atkLeanX     = dir * 4 * S * (1 - t*0.3);
        atkLeanY     = 1 * S * (1 - t*0.5);
        atkCrystGlow = 1.40 - t * 0.90;
        beamFire     = 0.85 + 0.15 * Math.sin(t * Math.PI);
      } else {
        const t = (ap - 0.80) / 0.20;
        const osc = Math.sin(t * 9) * Math.pow(1 - t, 2) * 0.08;
        const eo  = 1 - Math.pow(1 - t, 2.5);
        staffAng     = dir * 0.42 * (1 - eo) + osc;
        staffYOff    = -2 * S * (1 - eo);
        atkLeanX     = dir * 3 * S * (1 - eo);
        atkLeanY     = 0;
        atkCrystGlow = 0.3 * (1 - t);
      }

    } else {
      // ═════════════════════════════════════════════════════════════════
      // VARIANT 1 — GROUND SLAM (підняття над головою + плант)
      // Лорд ВИСОКО піднімає посох над головою, затримує момент, потім
      // різко опускає - посох ЛЕГКО нахиляється вперед і "б'є" по землі
      // перед ним. Головний рух — вертикальний (підйом і опускання),
      // не обертання. Не "кидається" а БЕТОНУЄ удар.
      // ═════════════════════════════════════════════════════════════════
      if (ap < 0.50) {
        const t = ap / 0.50;
        const eio = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2) / 2;
        staffAng     = -dir * 0.35 * eio;            // легкий нахил назад (~20°)
        staffYOff    = -14 * eio * S;                // ПОСОХ ВИСОКО ЗДІЙМАЄТЬСЯ
        atkLeanX     = -dir * 3 * eio * S;
        atkLeanY     = -4 * eio * S;                 // лорд тягнеться вгору
        atkScaleY    = 1 + 0.06 * eio;
        windupAura   = eio * 0.9;
        atkCrystGlow = eio * 0.75;
      } else if (ap < 0.62) {
        const t = (ap - 0.50) / 0.12;
        const eo2 = 1 - Math.pow(1 - t, 2);
        // Швидко: -20° → +35° нахил + посох ЗБИВАЄ ВНИЗ
        staffAng     = -dir * 0.35 + dir * 0.95 * eo2;
        staffYOff    = -14 * S + 16 * S * eo2;       // різко ОПУСКАЄТЬСЯ
        atkLeanX     = -dir * 3 * S + dir * 9 * S * eo2;
        atkLeanY     = -4 * S + 7 * S * eo2;         // присідає
        atkScaleY    = 1.06 - 0.14 * eo2;
        atkCrystGlow = 0.75 - 0.40 * eo2;
        slamFire     = eo2 * 0.4;
      } else if (ap < 0.85) {
        const t = (ap - 0.62) / 0.23;
        const tremor = Math.sin(t * 45) * Math.pow(1-t, 2) * 0.04;
        staffAng     = dir * (0.60 + tremor);        // утримання ~34° вперед
        staffYOff    = 2 * S * (1 - t*0.6);
        atkLeanX     = dir * 6 * S * (1 - t*0.4);
        atkLeanY     = 3 * S * (1 - t*0.6);
        atkScaleY    = 0.92 + 0.06 * t;
        atkCrystGlow = 0.30 * (1 - t);
        slamFire     = 0.4 + 0.6 * Math.sin(t * Math.PI);
      } else {
        const t = (ap - 0.85) / 0.15;
        const eio = t*t*(3-2*t);
        staffAng     = dir * 0.60 * (1 - eio);
        staffYOff    = 1 * S * (1 - eio);
        atkLeanX     = dir * 4 * S * (1 - eio);
        atkLeanY     = 1.2 * S * (1 - eio);
        atkScaleY    = 0.98 + 0.02 * (1 - eio);
        atkCrystGlow = 0;
      }
    }
  }

  // Shared pulse drives both staff orb and eyes (sync)
  const pulse = 0.5 + 0.5*Math.sin(roT * 0.45);
  // Breathing — subtle hem sway + chest rise
  const breathe = Math.sin(roT * 0.5);
  const hemWob = Math.sin(roT * 0.8);
  // Slow head-turn idle (every ~6s head rotates slightly)
  const headTurn = Math.sin(roT * 0.18) * 0.10;
  // Light vertical bob
  const bobY = Math.sin(roT * 0.35) * 0.8;

  // ── FLOOR SHADOW (under trapezoid base) ─────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(sx(50), sy(94), 33*S, 3.2*S, 0, 0, Math.PI*2); ctx.fill();

  // ── AURA (purple radial glow behind) ────────────────────────────────────
  const aura = ctx.createRadialGradient(sx(50), sy(50), 4*S, sx(50), sy(50), 56*S);
  aura.addColorStop(0, `rgba(170,40,255,${0.18 + 0.08*pulse})`);
  aura.addColorStop(1, 'rgba(80,0,160,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(sx(50), sy(50), 56*S, 0, Math.PI*2); ctx.fill();

  ctx.save();
  // Якірна точка для розтягу — підошва лорда. Ноги стоять на місці,
  // голова/тіло розтягуються/стискаються відносно них.
  const _anchorX = sx(50), _anchorY = sy(94);
  ctx.translate(_anchorX + atkLeanX, _anchorY + atkLeanY + bobY * S);
  if (atkScaleY !== 1) ctx.scale(1, atkScaleY);
  ctx.translate(-_anchorX, -_anchorY);

  // ═══════════════════════════════════════════════════════════════════════
  //  ROBE — trapezoidal silhouette with gradient and vertical folds
  // ═══════════════════════════════════════════════════════════════════════
  // hem points sway slightly (breathing illusion)
  const hemL = sx(20) + hemWob * 0.8 * S;
  const hemR = sx(80) - hemWob * 0.8 * S;

  // Robe gradient: darker at bottom, lighter near shoulders
  const robeGrad = ctx.createLinearGradient(0, sy(38), 0, sy(94));
  robeGrad.addColorStop(0, '#5a1a95');
  robeGrad.addColorStop(0.55, '#3d0d66');
  robeGrad.addColorStop(1, '#1f0433');

  // Main robe trapezoid body
  ctx.fillStyle = robeGrad;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.1*S;
  ctx.beginPath();
  ctx.moveTo(sx(36), sy(40));
  // shoulder curve
  ctx.bezierCurveTo(sx(34), sy(42), sx(30), sy(50), sx(28), sy(60));
  // left side flare
  ctx.bezierCurveTo(sx(25), sy(72), sx(22), sy(84), hemL, sy(93));
  // bottom hem (slightly curved, with sway)
  ctx.bezierCurveTo(sx(35), sy(96 + hemWob*0.4), sx(65), sy(96 - hemWob*0.4), hemR, sy(93));
  // right side
  ctx.bezierCurveTo(sx(78), sy(84), sx(75), sy(72), sx(72), sy(60));
  ctx.bezierCurveTo(sx(70), sy(50), sx(66), sy(42), sx(64), sy(40));
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // ── Vertical fold shadows (3 lines) ─────────────────────────────────────
  ctx.strokeStyle = 'rgba(15,0,35,0.55)';
  ctx.lineWidth = 1.8*S; ctx.lineCap = 'round';
  // left fold
  ctx.beginPath();
  ctx.moveTo(sx(36), sy(44));
  ctx.bezierCurveTo(sx(33), sy(60), sx(30), sy(78), sx(30), sy(91));
  ctx.stroke();
  // center fold
  ctx.strokeStyle = 'rgba(15,0,35,0.4)';
  ctx.lineWidth = 1.4*S;
  ctx.beginPath();
  ctx.moveTo(sx(50), sy(62));
  ctx.bezierCurveTo(sx(49), sy(76), sx(49), sy(86), sx(48), sy(94));
  ctx.stroke();
  // right fold
  ctx.strokeStyle = 'rgba(15,0,35,0.55)';
  ctx.lineWidth = 1.8*S;
  ctx.beginPath();
  ctx.moveTo(sx(64), sy(44));
  ctx.bezierCurveTo(sx(67), sy(60), sx(70), sy(78), sx(70), sy(91));
  ctx.stroke();

  // ── Highlight on robe (lifted by breath) ────────────────────────────────
  ctx.fillStyle = `rgba(200,120,255,${0.18 + breathe*0.04})`;
  ctx.beginPath();
  ctx.moveTo(sx(42), sy(44));
  ctx.bezierCurveTo(sx(40), sy(56), sx(42), sy(72), sx(44), sy(84));
  ctx.lineTo(sx(47), sy(84));
  ctx.bezierCurveTo(sx(45), sy(72), sx(44), sy(58), sx(46), sy(46));
  ctx.closePath(); ctx.fill();

  // ── Gold hem trim at bottom ─────────────────────────────────────────────
  ctx.strokeStyle = '#e0b840'; ctx.lineWidth = 1.1*S;
  ctx.beginPath();
  ctx.moveTo(hemL, sy(93));
  ctx.bezierCurveTo(sx(35), sy(96 + hemWob*0.4), sx(65), sy(96 - hemWob*0.4), hemR, sy(93));
  ctx.stroke();
  // small gold runes on hem
  ctx.fillStyle = '#ffd060';
  [30, 40, 50, 60, 70].forEach(x => {
    ctx.beginPath(); ctx.arc(sx(x), sy(92 + Math.sin(x)*0.3), 0.7*S, 0, Math.PI*2); ctx.fill();
  });

  // ═══════════════════════════════════════════════════════════════════════
  //  CLOAK OPENING — мантія розходиться, з темряви виходить монстр
  //  unit._cloakT: 1 → 0 (декей у грі). Крива: швидко відкрив, плавно закрив.
  // ═══════════════════════════════════════════════════════════════════════
  {
    const _ct = p.unit && p.unit._cloakT ? p.unit._cloakT : 0;
    if (_ct > 0.02) {
      const _prog = 1 - _ct;                              // 0 → 1
      const _open = _prog < 0.3 ? _prog / 0.3              // різке відкриття
                  : _prog < 0.6 ? 1                        // тримає
                  : 1 - (_prog - 0.6) / 0.4;               // плавно стуляється
      const _w = 15 * _open;                               // півширина прорізу на подолі
      if (_w > 0.5) {
        // Темний проріз від пояса до подолу
        const slit = ctx.createLinearGradient(0, sy(60), 0, sy(94));
        slit.addColorStop(0, 'rgba(6,0,14,0)');
        slit.addColorStop(0.35, 'rgba(6,0,14,0.92)');
        slit.addColorStop(1, 'rgba(10,2,22,0.96)');
        ctx.fillStyle = slit;
        ctx.beginPath();
        ctx.moveTo(sx(50), sy(58));
        ctx.bezierCurveTo(sx(50 - _w*0.35), sy(72), sx(50 - _w), sy(86), sx(50 - _w), sy(94));
        ctx.lineTo(sx(50 + _w), sy(94));
        ctx.bezierCurveTo(sx(50 + _w), sy(86), sx(50 + _w*0.35), sy(72), sx(50), sy(58));
        ctx.closePath(); ctx.fill();
        // Фіолетове світіння порталу зсередини
        const pg = ctx.createRadialGradient(sx(50), sy(88), 1*S, sx(50), sy(88), 14*_open*S);
        pg.addColorStop(0, `rgba(170,80,255,${0.55 * _open})`);
        pg.addColorStop(1, 'rgba(90,20,180,0)');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(sx(50), sy(88), 14*_open*S, 0, Math.PI*2); ctx.fill();
        // Світла кромка відворотів (мантія відгорнулась)
        ctx.strokeStyle = `rgba(210,140,255,${0.5 * _open})`;
        ctx.lineWidth = 1.2*S;
        ctx.beginPath();
        ctx.moveTo(sx(50), sy(58));
        ctx.bezierCurveTo(sx(50 - _w*0.35), sy(72), sx(50 - _w), sy(86), sx(50 - _w), sy(94));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx(50), sy(58));
        ctx.bezierCurveTo(sx(50 + _w*0.35), sy(72), sx(50 + _w), sy(86), sx(50 + _w), sy(94));
        ctx.stroke();
        // Душі-пасма вилітають з прорізу
        for (let _wi = 0; _wi < 3; _wi++) {
          const _ph = (_prog * 1.6 + _wi * 0.33) % 1;
          const _wxp = sx(50) + Math.sin(_prog * 9 + _wi * 2.2) * 4 * S;
          const _wyp = sy(88) - _ph * 26 * S;
          ctx.globalAlpha = (1 - _ph) * 0.5 * _open;
          ctx.fillStyle = '#c090ff';
          ctx.beginPath(); ctx.arc(_wxp, _wyp, (0.9 + (1 - _ph) * 1.3) * S, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  COLLAR — standing fur-trimmed collar behind neck
  // ═══════════════════════════════════════════════════════════════════════
  // dark collar back plate
  ctx.fillStyle = '#1a0428'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9*S;
  ctx.beginPath();
  ctx.moveTo(sx(36), sy(41));
  ctx.bezierCurveTo(sx(34), sy(36), sx(38), sy(30), sx(44), sy(30));
  ctx.lineTo(sx(56), sy(30));
  ctx.bezierCurveTo(sx(62), sy(30), sx(66), sy(36), sx(64), sy(41));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // gold edging on collar
  ctx.strokeStyle = '#e0b840'; ctx.lineWidth = 0.7*S;
  ctx.beginPath();
  ctx.moveTo(sx(36), sy(40.5));
  ctx.bezierCurveTo(sx(34.5), sy(36.5), sx(38.5), sy(31), sx(44), sy(31));
  ctx.lineTo(sx(56), sy(31));
  ctx.bezierCurveTo(sx(61.5), sy(31), sx(65.5), sy(36.5), sx(64), sy(40.5));
  ctx.stroke();

  // ═══════════════════════════════════════════════════════════════════════
  //  AMULET — glowing medallion on chest
  // ═══════════════════════════════════════════════════════════════════════
  const amX = sx(50), amY = sy(50);
  // chain suggestion
  ctx.strokeStyle = '#c09038'; ctx.lineWidth = 0.5*S;
  ctx.beginPath(); ctx.moveTo(sx(42), sy(40)); ctx.lineTo(amX - 3*S, amY - 4*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx(58), sy(40)); ctx.lineTo(amX + 3*S, amY - 4*S); ctx.stroke();
  // amulet glow
  const amGlow = ctx.createRadialGradient(amX, amY, 1*S, amX, amY, 10*S);
  amGlow.addColorStop(0, `rgba(220,140,255,${0.55 + 0.3*pulse})`);
  amGlow.addColorStop(1, 'rgba(170,40,255,0)');
  ctx.fillStyle = amGlow;
  ctx.beginPath(); ctx.arc(amX, amY, 10*S, 0, Math.PI*2); ctx.fill();
  // gold ring
  ctx.fillStyle = '#e0b840'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5*S;
  ctx.beginPath(); ctx.arc(amX, amY, 4.2*S, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // inner gem
  ctx.fillStyle = '#aa00ff'; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 6*pulse;
  ctx.beginPath(); ctx.arc(amX, amY, 2.6*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // gem highlight
  ctx.fillStyle = 'rgba(255,220,255,0.75)';
  ctx.beginPath(); ctx.arc(amX - 0.8*S, amY - 0.8*S, 0.9*S, 0, Math.PI*2); ctx.fill();

  // ═══════════════════════════════════════════════════════════════════════
  //  NECK — visible between collar and head
  // ═══════════════════════════════════════════════════════════════════════
  ctx.fillStyle = '#5a2880'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.7*S;
  ctx.beginPath();
  ctx.moveTo(sx(46), sy(32));
  ctx.lineTo(sx(46), sy(28));
  ctx.lineTo(sx(54), sy(28));
  ctx.lineTo(sx(54), sy(32));
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // ═══════════════════════════════════════════════════════════════════════
  //  HEAD — separate sphere, with head-turn idle
  // ═══════════════════════════════════════════════════════════════════════
  const headCX = sx(50) + headTurn * 1.2 * S * dir;
  const headCY = sy(22);

  // Head shape — slightly oval (a bit taller than wide)
  ctx.save();
  ctx.translate(headCX, headCY);
  // head shadow side (opposite to turn)
  ctx.fillStyle = '#7a3aa0'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.9*S;
  ctx.beginPath(); ctx.ellipse(0, 0, 11*S, 12*S, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // shadow side
  ctx.fillStyle = 'rgba(30,0,60,0.35)';
  ctx.beginPath();
  ctx.ellipse(-headTurn*6*S*dir, 1*S, 6*S, 11*S, 0, 0, Math.PI*2); ctx.fill();
  // cheek highlight
  ctx.fillStyle = 'rgba(200,120,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(headTurn*5*S*dir, 3*S, 4*S, 3*S, 0, 0, Math.PI*2); ctx.fill();

  // ── EYES — almond shaped with glowing irises ──────────────────────────
  const eyeOff = headTurn * 1.5 * dir;
  // Eye whites (almond)
  ctx.fillStyle = '#f0e8f5';
  ctx.beginPath(); ctx.ellipse(-4*S + eyeOff*S, -1.5*S, 2.4*S, 1.5*S, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4*S + eyeOff*S, -1.5*S, 2.4*S, 1.5*S, 0, 0, Math.PI*2); ctx.fill();
  // Eye outline
  ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5*S;
  ctx.beginPath(); ctx.ellipse(-4*S + eyeOff*S, -1.5*S, 2.4*S, 1.5*S, 0, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4*S + eyeOff*S, -1.5*S, 2.4*S, 1.5*S, 0, 0, Math.PI*2); ctx.stroke();
  // Glowing irises (sync with staff orb pulse)
  ctx.fillStyle = '#cc44ff';
  ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 6*pulse;
  ctx.beginPath(); ctx.arc(-4*S + eyeOff*S, -1.5*S, 1.2*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4*S + eyeOff*S, -1.5*S, 1.2*S, 0, Math.PI*2); ctx.fill();
  // Bright pupil
  ctx.fillStyle = '#ffe0ff'; ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(-4*S + eyeOff*S, -1.5*S, 0.5*S, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4*S + eyeOff*S, -1.5*S, 0.5*S, 0, Math.PI*2); ctx.fill();

  // ── BROWS (angled, regal/menacing) ────────────────────────────────────
  ctx.strokeStyle = '#d8d0e8'; ctx.lineWidth = 1.3*S; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-7*S, -4*S); ctx.lineTo(-2*S, -3*S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(7*S, -4*S); ctx.lineTo(2*S, -3*S);
  ctx.stroke();

  // ── NOSE (subtle) ─────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(40,0,70,0.6)'; ctx.lineWidth = 0.5*S;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.bezierCurveTo(-0.8*S, 1.5*S, -0.5*S, 2.8*S, 0.5*S, 3*S);
  ctx.stroke();

  // ── MUSTACHE (thin, angled down) ──────────────────────────────────────
  ctx.strokeStyle = '#d8d0e0'; ctx.lineWidth = 1.0*S; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-0.5*S, 3.5*S);
  ctx.bezierCurveTo(-3*S, 3.8*S, -5*S, 4.2*S, -6*S, 5.2*S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.5*S, 3.5*S);
  ctx.bezierCurveTo(3*S, 3.8*S, 5*S, 4.2*S, 6*S, 5.2*S);
  ctx.stroke();

  // ── GOATEE / ESPAÑOLA (short beard under chin) ─────────────────────────
  ctx.fillStyle = '#d8d0e0'; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5*S;
  ctx.beginPath();
  ctx.moveTo(-2.5*S, 5*S);
  ctx.bezierCurveTo(-2*S, 8*S, -1*S, 10*S, 0, 11*S);
  ctx.bezierCurveTo(1*S, 10*S, 2*S, 8*S, 2.5*S, 5*S);
  ctx.bezierCurveTo(1.5*S, 5.3*S, -1.5*S, 5.3*S, -2.5*S, 5*S);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // goatee strand lines
  ctx.strokeStyle = '#a8a0b8'; ctx.lineWidth = 0.3*S;
  ctx.beginPath(); ctx.moveTo(-1*S, 6*S); ctx.lineTo(-0.5*S, 10*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1*S, 6*S); ctx.lineTo(0.5*S, 10*S); ctx.stroke();

  ctx.restore(); // end head translate

  // ═══════════════════════════════════════════════════════════════════════
  //  CROWN — 3D gold band with gems on each spike
  // ═══════════════════════════════════════════════════════════════════════
  const crCX = sx(50) + headTurn * 1.2 * S * dir;
  const crCY = sy(11);
  // band gradient (darker gold at bottom for depth)
  const bandGrad = ctx.createLinearGradient(0, sy(8), 0, sy(15));
  bandGrad.addColorStop(0, '#ffdd70');
  bandGrad.addColorStop(0.5, '#e0b840');
  bandGrad.addColorStop(1, '#8a6a10');
  ctx.fillStyle = bandGrad; ctx.strokeStyle = '#4a3810'; ctx.lineWidth = 0.7*S;
  // band trapezoid (slight perspective — narrower at top)
  ctx.beginPath();
  ctx.moveTo(crCX - 13*S, sy(15));
  ctx.lineTo(crCX + 13*S, sy(15));
  ctx.lineTo(crCX + 12*S, sy(11));
  ctx.lineTo(crCX - 12*S, sy(11));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // top rim highlight
  ctx.strokeStyle = '#fff2a0'; ctx.lineWidth = 0.5*S;
  ctx.beginPath();
  ctx.moveTo(crCX - 11.5*S, sy(11.4)); ctx.lineTo(crCX + 11.5*S, sy(11.4));
  ctx.stroke();

  // spikes — 5 spikes with gems
  const spikes = [
    {x: -10, h: 5, gem: '#44aaff'},
    {x: -5,  h: 8, gem: '#22dd55'},
    {x:  0,  h: 10, gem: '#ff2244'}, // center tallest
    {x:  5,  h: 8, gem: '#22dd55'},
    {x: 10,  h: 5, gem: '#44aaff'},
  ];
  spikes.forEach(sp => {
    const baseX = crCX + sp.x*S;
    const tipY = sy(11 - sp.h);
    // spike body (gradient)
    const sg = ctx.createLinearGradient(0, sy(11), 0, tipY);
    sg.addColorStop(0, '#e0b840');
    sg.addColorStop(1, '#ffdd70');
    ctx.fillStyle = sg; ctx.strokeStyle = '#4a3810'; ctx.lineWidth = 0.6*S;
    ctx.beginPath();
    ctx.moveTo(baseX - 1.6*S, sy(11));
    ctx.lineTo(baseX, tipY);
    ctx.lineTo(baseX + 1.6*S, sy(11));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // gem on tip
    ctx.fillStyle = sp.gem; ctx.shadowColor = sp.gem; ctx.shadowBlur = 3*pulse;
    ctx.beginPath(); ctx.arc(baseX, tipY - 0.3*S, 1.2*S, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // gem highlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(baseX - 0.3*S, tipY - 0.6*S, 0.4*S, 0, Math.PI*2); ctx.fill();
  });

  // Central forehead gem on band
  ctx.fillStyle = '#ee88ff'; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 4*pulse;
  ctx.beginPath(); ctx.arc(crCX, sy(13.5), 1.5*S, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,220,255,0.8)';
  ctx.beginPath(); ctx.arc(crCX - 0.4*S, sy(13.3), 0.5*S, 0, Math.PI*2); ctx.fill();

  ctx.restore(); // end body bob

  // ═══════════════════════════════════════════════════════════════════════
  //  STAFF — curved shaft, crystal at top, drifting particles
  //  Під час атаки посох обертається навколо основи (руки лорда).
  // ═══════════════════════════════════════════════════════════════════════
  const staffSide = dir;
  const staffBaseX = sx(50) + 27*S*staffSide;
  const staffBaseY = sy(94);
  const staffTopX  = sx(50) + 30*S*staffSide;
  const staffTopY  = sy(14);
  const staffMidX1 = sx(50) + 25*S*staffSide;
  const staffMidY1 = sy(62);
  const staffMidX2 = sx(50) + 32*S*staffSide;
  const staffMidY2 = sy(38);

  // (staffAng вже обчислено вгорі функції як частина attack-phase блоку)

  // Для ефектів (промінь/ударна хвиля) нам потрібна позиція кінчика
  // кристала у світових координатах ПІСЛЯ обертання посоха.
  const _sCos = Math.cos(staffAng), _sSin = Math.sin(staffAng);
  const _tipDX = staffTopX - staffBaseX;
  const _tipDY = staffTopY - staffBaseY;
  const tipWX = staffBaseX + _tipDX*_sCos - _tipDY*_sSin + atkLeanX;
  const tipWY = staffBaseY + _tipDX*_sSin + _tipDY*_sCos + bobY*S + atkLeanY + staffYOff;

  // ── Малюємо посох у обертальному контексті ──────────────────────────────
  ctx.save();
  // Обертаємо навколо основи посоха (руки лорда). Також враховуємо bobY/lean/lift.
  ctx.translate(staffBaseX + atkLeanX, staffBaseY + bobY*S + atkLeanY + staffYOff);
  ctx.rotate(staffAng);
  ctx.translate(-staffBaseX, -staffBaseY);

  // Shaft (curved bezier)
  ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2.4*S; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(staffBaseX, staffBaseY);
  ctx.bezierCurveTo(staffMidX1, staffMidY1, staffMidX2, staffMidY2, staffTopX, staffTopY);
  ctx.stroke();
  // Highlight on shaft (thinner line offset)
  ctx.strokeStyle = '#6a4820'; ctx.lineWidth = 0.8*S;
  ctx.beginPath();
  ctx.moveTo(staffBaseX - 0.7*S*staffSide, staffBaseY - 2);
  ctx.bezierCurveTo(staffMidX1 - 0.7*S*staffSide, staffMidY1, staffMidX2 - 0.7*S*staffSide, staffMidY2, staffTopX - 0.7*S*staffSide, staffTopY + 2);
  ctx.stroke();

  // Gold bands on shaft
  ctx.strokeStyle = '#e0b840'; ctx.lineWidth = 1.8*S;
  [0.35, 0.7].forEach(t => {
    const mt = 1 - t;
    const bx = mt*mt*mt*staffBaseX + 3*mt*mt*t*staffMidX1 + 3*mt*t*t*staffMidX2 + t*t*t*staffTopX;
    const by = mt*mt*mt*staffBaseY + 3*mt*mt*t*staffMidY1 + 3*mt*t*t*staffMidY2 + t*t*t*staffTopY;
    ctx.beginPath();
    ctx.moveTo(bx - 2*S, by); ctx.lineTo(bx + 2*S, by);
    ctx.stroke();
  });

  // Crystal holder — 4 curved claws
  const cx = staffTopX, cy = staffTopY;
  ctx.strokeStyle = '#3a2510'; ctx.lineWidth = 1.3*S; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const ang = -Math.PI/2 + (i - 1.5) * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 2*S);
    ctx.quadraticCurveTo(
      cx + Math.cos(ang)*3*S, cy + Math.sin(ang)*4*S - 1*S,
      cx + Math.cos(ang)*5*S, cy + Math.sin(ang)*3*S - 4*S
    );
    ctx.stroke();
  }

  // Crystal (pointed diamond) — сяйво посилюється під час атаки
  const crystH = 9*S;
  const crystW = 4*S;
  const crystAlpha = 0.7 + 0.3*pulse + atkCrystGlow * 0.8;
  const crystGlow = ctx.createRadialGradient(cx, cy - crystH*0.4, 1*S, cx, cy - crystH*0.4, crystH*(2.2 + atkCrystGlow*1.5));
  crystGlow.addColorStop(0, `rgba(220,140,255,${Math.min(1, crystAlpha)})`);
  crystGlow.addColorStop(0.5, `rgba(170,40,255,${0.3 + atkCrystGlow*0.3})`);
  crystGlow.addColorStop(1, 'rgba(80,0,160,0)');
  ctx.fillStyle = crystGlow;
  ctx.beginPath(); ctx.arc(cx, cy - crystH*0.4, crystH*(2.2 + atkCrystGlow*1.5), 0, Math.PI*2); ctx.fill();

  // crystal body — diamond shape (колір яскравіший під час атаки)
  const crystR = atkCrystGlow > 0 ? Math.round(204 + atkCrystGlow * 51) : 204;  // cc→ff
  const crystG = atkCrystGlow > 0 ? Math.round(68 + atkCrystGlow * 80)  : 68;
  const crystB = atkCrystGlow > 0 ? Math.round(255)                     : 255;
  ctx.fillStyle = `rgb(${crystR},${crystG},${crystB})`;
  ctx.strokeStyle = '#2a0045'; ctx.lineWidth = 0.7*S;
  ctx.beginPath();
  ctx.moveTo(cx, cy - crystH);
  ctx.lineTo(cx + crystW, cy - crystH*0.55);
  ctx.lineTo(cx + crystW*0.6, cy);
  ctx.lineTo(cx, cy + 2*S);
  ctx.lineTo(cx - crystW*0.6, cy);
  ctx.lineTo(cx - crystW, cy - crystH*0.55);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.strokeStyle = 'rgba(30,0,60,0.5)'; ctx.lineWidth = 0.4*S;
  ctx.beginPath(); ctx.moveTo(cx, cy - crystH); ctx.lineTo(cx, cy + 2*S); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - crystW, cy - crystH*0.55); ctx.lineTo(cx + crystW, cy - crystH*0.55); ctx.stroke();

  ctx.fillStyle = `rgba(255,220,255,${0.55 + 0.25*pulse + atkCrystGlow*0.3})`;
  ctx.beginPath();
  ctx.moveTo(cx, cy - crystH*0.95);
  ctx.lineTo(cx - crystW*0.75, cy - crystH*0.55);
  ctx.lineTo(cx - crystW*0.3, cy - crystH*0.55);
  ctx.lineTo(cx - 0.3*S, cy - crystH*0.3);
  ctx.closePath(); ctx.fill();

  // ── Drifting particles (у локальному фреймі посоха) ──────────────────
  // Частинки і стан dt зберігаємо на одиниці (unit), бо p створюється
  // заново кожен кадр у main.html.
  const pstate = p.unit || p;
  if (!pstate._lordParticles) pstate._lordParticles = [];
  if (Math.random() < 0.12 && pstate._lordParticles.length < 8) {
    pstate._lordParticles.push({
      ox: (Math.random() - 0.5) * 4,
      oy: 0,
      life: 0,
      maxLife: 1.2 + Math.random()*0.8,
      size: 0.6 + Math.random()*0.5,
    });
  }
  const _ptNow = _frameNow / 1000;
  const dt = (pstate._lpLastT === undefined) ? (1/60) : Math.min(_ptNow - pstate._lpLastT, 0.05);
  pstate._lpLastT = _ptNow;
  for (let i = pstate._lordParticles.length - 1; i >= 0; i--) {
    const pt = pstate._lordParticles[i];
    pt.life += dt;
    pt.oy -= 14 * dt;
    pt.ox += Math.sin(pt.life * 3) * 0.3 * dt;
    const a = 1 - pt.life / pt.maxLife;
    if (a <= 0) { pstate._lordParticles.splice(i, 1); continue; }
    ctx.fillStyle = `rgba(220,140,255,${a * 0.75})`;
    ctx.beginPath();
    ctx.arc(cx + pt.ox*S, cy - crystH*0.7 + pt.oy*S, pt.size * S, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore(); // ← кінець обертання посоха

  // ═══════════════════════════════════════════════════════════════════════
  //  АТАКА: ефекти у світових координатах (поза обертанням)
  // ═══════════════════════════════════════════════════════════════════════
  if (atkActive) {
    // ── ЗАМАХ: енергія збирається навколо кристала ────────────────────
    if (windupAura > 0.15) {
      for (let i = 0; i < 5; i++) {
        const ang = roT * 2 + i * Math.PI * 2 / 5 + windupAura * 4;
        const rr  = (7 - windupAura * 5) * S;
        const px  = tipWX + Math.cos(ang) * rr;
        const py  = tipWY + Math.sin(ang) * rr - 4*S;
        ctx.fillStyle = `rgba(220,140,255,${windupAura * 0.75})`;
        ctx.beginPath(); ctx.arc(px, py, (1.2 + windupAura) * S, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ── Слід від кристала — рух-блюр під час швидкого руху посоха ────
    const pstateTr = p.unit || p;
    if (!pstateTr._lordTrail) pstateTr._lordTrail = [];
    if (beamFire > 0 || slamFire > 0 || (atkVar === 1 && ap > 0.50 && ap < 0.65)) {
      pstateTr._lordTrail.push({ x: tipWX, y: tipWY, life: 1 });
    }
    for (let i = pstateTr._lordTrail.length - 1; i >= 0; i--) {
      const t = pstateTr._lordTrail[i];
      t.life -= 0.08;
      if (t.life <= 0) { pstateTr._lordTrail.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(220,140,255,${t.life * 0.55})`;
      ctx.beginPath(); ctx.arc(t.x, t.y, (1.2 + t.life*2) * S, 0, Math.PI*2); ctx.fill();
    }
    if (pstateTr._lordTrail.length > 12) pstateTr._lordTrail.length = 12;

    if (atkVar === 0 && beamFire > 0) {
      // ═════════════════════════════════════════════════════════════════
      // ВАРІАНТ 0 — ПРОМІНЬ З КРИСТАЛА
      // Промінь націлюється на центр моделі героя-цілі. Якщо цілі нема
      // (напр. помер в процесі) — летить горизонтально в сторону dir.
      // ═════════════════════════════════════════════════════════════════
      let nxB, nyB, curLen;
      if (p.tgtX !== null && p.tgtX !== undefined) {
        // Націлюємось на центр тіла героя
        const toX = p.tgtX - tipWX;
        const toY = p.tgtY - tipWY;
        const toL = Math.hypot(toX, toY) || 1;
        nxB = toX / toL;
        nyB = toY / toL;
        // Довжина = фактична відстань до цілі, масштабована фазою пострілу
        curLen = toL * Math.min(1, beamFire * 1.15);
      } else {
        const beamLen = 180 * S;
        nxB = dir; nyB = 0;
        curLen = beamLen * Math.min(1, beamFire * 1.15);
      }
      const endX = tipWX + nxB * curLen;
      const endY = tipWY + nyB * curLen;

      // Зовнішнє світіння
      const beamGrad = ctx.createLinearGradient(tipWX, tipWY, endX, endY);
      beamGrad.addColorStop(0, `rgba(220,140,255,${0.90 * beamFire})`);
      beamGrad.addColorStop(1, 'rgba(170,40,255,0)');
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 10 * S * beamFire;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tipWX, tipWY); ctx.lineTo(endX, endY); ctx.stroke();

      // Яскраве ядро
      const coreGrad = ctx.createLinearGradient(tipWX, tipWY, endX, endY);
      coreGrad.addColorStop(0, `rgba(255,240,255,${beamFire})`);
      coreGrad.addColorStop(1, 'rgba(255,200,255,0)');
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth = 3 * S * beamFire;
      ctx.beginPath(); ctx.moveTo(tipWX, tipWY); ctx.lineTo(endX, endY); ctx.stroke();

      // Іскри вздовж променя
      ctx.fillStyle = `rgba(255,220,255,${beamFire * 0.9})`;
      for (let i = 0; i < 8; i++) {
        const t = Math.random();
        const sx0 = tipWX + (endX - tipWX) * t + (Math.random()-0.5) * 6*S;
        const sy0 = tipWY + (endY - tipWY) * t + (Math.random()-0.5) * 6*S;
        ctx.beginPath(); ctx.arc(sx0, sy0, (0.7 + Math.random()*0.9) * S, 0, Math.PI*2); ctx.fill();
      }

      // Сильний спалах-дуло у точці вильоту
      const muzzleR = 9 * S * beamFire;
      const mGrad = ctx.createRadialGradient(tipWX, tipWY, 0, tipWX, tipWY, muzzleR);
      mGrad.addColorStop(0, `rgba(255,240,255,${beamFire})`);
      mGrad.addColorStop(1, 'rgba(170,40,255,0)');
      ctx.fillStyle = mGrad;
      ctx.beginPath(); ctx.arc(tipWX, tipWY, muzzleR, 0, Math.PI * 2); ctx.fill();

    } else if (atkVar === 1 && slamFire > 0) {
      // ═════════════════════════════════════════════════════════════════
      // ВАРІАНТ 1 — УДАР У ЗЕМЛЮ (Ground Slam / Shockwave)
      // ═════════════════════════════════════════════════════════════════
      const groundY = sy(94) + bobY*S;
      const slamX = sx(50) + atkLeanX + dir * 25 * S;

      // Прогрес хвилі 0→1 за всю фазу удару+утримання
      const waveT = Math.min(1, slamFire * 1.3);

      // Кільце ударної хвилі розширюється від точки удару
      const ringR = 60 * S * waveT;
      ctx.strokeStyle = `rgba(200,100,255,${0.9 * (1 - waveT*0.4)})`;
      ctx.lineWidth = Math.max(0.8, 3.5 * S * (1 - waveT*0.5));
      ctx.beginPath();
      ctx.ellipse(slamX, groundY, ringR, ringR*0.3, 0, 0, Math.PI*2);
      ctx.stroke();

      // Друге, внутрішнє кільце
      if (waveT > 0.25) {
        const innerR = 60 * S * (waveT - 0.25) / 0.75;
        ctx.strokeStyle = `rgba(255,200,255,${0.75 * (1 - waveT*0.6)})`;
        ctx.lineWidth = 1.6 * S;
        ctx.beginPath();
        ctx.ellipse(slamX, groundY, innerR, innerR*0.3, 0, 0, Math.PI*2);
        ctx.stroke();
      }

      // Спалах у точці удару — яскравий на момент контакту
      if (waveT < 0.55) {
        const flashR = 14 * S * (1 - waveT*1.8);
        const fGrad = ctx.createRadialGradient(slamX, groundY, 0, slamX, groundY, flashR);
        fGrad.addColorStop(0, `rgba(255,240,255,${Math.max(0, 1 - waveT*1.8)})`);
        fGrad.addColorStop(1, 'rgba(200,100,255,0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath(); ctx.arc(slamX, groundY, flashR, 0, Math.PI*2); ctx.fill();
      }

      // Пил/уламки злітають від удару
      ctx.fillStyle = `rgba(200,100,255,${0.8 * (1 - waveT)})`;
      for (let i = 0; i < 5; i++) {
        const a2 = (Math.random() * 0.6 - 0.3) + (Math.random() < 0.5 ? 0 : Math.PI);
        const d  = ringR * (0.3 + Math.random()*0.7);
        const px = slamX + Math.cos(a2) * d;
        const py = groundY - Math.abs(Math.sin(a2)) * 12*S * (1-waveT);
        ctx.beginPath();
        ctx.arc(px, py, (0.8 + Math.random()*0.9) * S, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  return sy(0) + bobY*S - 16;
}

// Wrapper: draws by heroType. If p.rank is set (elite/boss), tint body + eye.
function drawHeroStudio(ctx, p, heroType) {
  const base = STUDIO_HEROES[heroType] || STUDIO_HEROES.recruit;
  let cfg = base;
  if (p && p.rank && p.rank !== 'normal') {
    cfg = Object.assign({}, base);
    if (p.rank === 'elite_hp')  { cfg.body='#118844'; cfg.bodyHi='rgba(51,221,119,0.55)'; cfg.eye='#66ffaa'; }
    if (p.rank === 'elite_atk') { cfg.body='#bb4400'; cfg.bodyHi='rgba(255,119,17,0.55)'; cfg.eye='#ffcc44'; cfg.trailCol='#ffaa44'; }
    if (p.rank === 'boss')      { cfg.body='#7700aa'; cfg.bodyHi='rgba(204,34,255,0.6)'; cfg.eye='#eeaaff'; cfg.trailCol='#ee88ff'; }
  }
  return drawHeroEgg(ctx, p, cfg);
}