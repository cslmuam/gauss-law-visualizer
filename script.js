'use strict'

// ── Physics constants ─────────────────────────────────────────────────────
const EPS0 = 8.854187817e-12   // F/m
const K    = 8.987551787e9     // N·m²/C²
const TAU  = 2 * Math.PI

// ── App state ─────────────────────────────────────────────────────────────
let sc = 'point_charge'
let p = { Q:2.0, R:1.5, rg:2.5, lam:1.0, sig:1.0, d:2.0, yoff:0.0 }
let opts = { lines:true, flux:true, graph:true, grid:false }
let isDragging = false

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let W, H, cx, cy
const SCALE = 80   // px per meter

// ── Draggable / resizable E(r) graph ─────────────────────────────────────
let _gPos  = null   // {x,y} position override; null = default bottom-right
let _gSize = null   // {w,h} size override; null = device default
let _gDrag = false, _gResize = false
let _gStart = {}    // snapshot at interaction start

function getGraphRect() {
  const mob = W < 641
  const defW = mob ? 260 : 390, defH = mob ? 175 : 260
  const GW = _gSize ? _gSize.w : defW
  const GH = _gSize ? _gSize.h : defH
  const gx = _gPos ? _gPos.x : W - GW - (mob ? 10 : 18)
  const gy = _gPos ? _gPos.y : H - GH - (mob ? 70 : 18)
  return {gx, gy, GW, GH}
}

// ── Scenario definitions ──────────────────────────────────────────────────
const S = {

  point_charge: {
    label:'Carga puntual', sym:'spherical',
    show:['Q','rg'],
    getE(r)    { return r<0.01 ? 0 : K*p.Q*1e-9/r**2 },
    getQenc(r) { return p.Q*1e-9 },
    formula() {
      const E = this.getE(p.rg)
      return [
        {t:'head', v:'Esfera gaussiana de radio r'},
        {t:'key',  v:'E · 4πr² = Q/ε₀'},
        {t:'key',  v:'→  E = kQ / r²'},
        {t:'res',  v:`E(${p.rg.toFixed(2)}m) = ${fmtE(E)}`},
        {t:'dim',  v:`Φ = Q/ε₀ = ${fmtF(p.Q*1e-9/EPS0)}`},
      ]
    },
    drawSource() {
      const q = p.Q
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, TAU)
      ctx.fillStyle = q>=0?'#ff3b6b':'#448aff'; ctx.fill()
      ctx.fillStyle='#fff'; ctx.font='bold 12px Inter'
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText(q>=0?'+':'−', cx, cy)
    }
  },

  conducting_sphere: {
    label:'Esfera conductora', sym:'spherical',
    show:['Q','R','rg'],
    getE(r)    { return r<=p.R ? 0 : K*p.Q*1e-9/r**2 },
    getQenc(r) { return r<=p.R ? 0 : p.Q*1e-9 },
    formula() {
      const inside = p.rg<=p.R, E = this.getE(p.rg)
      return [
        {t:'head', v: inside?'r < R  (interior conductor)':'r > R  (exterior)'},
        {t:'key',  v: inside?'E = 0  (carga libre → superficie)':'E = kQ / r²'},
        {t:'res',  v: inside?'Q_enc = 0':  `E(${p.rg.toFixed(2)}m) = ${fmtE(E)}`},
        {t:'dim',  v:`σ = Q/4πR² = ${fmtSig(p.Q*1e-9/(4*Math.PI*p.R**2))}`},
      ]
    },
    drawSource() {
      const R=p.R*SCALE, q=p.Q
      ctx.beginPath(); ctx.arc(cx,cy,R,0,TAU)
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R)
      g.addColorStop(0,'rgba(45,55,80,0.97)')
      g.addColorStop(0.82,'rgba(45,55,80,0.97)')
      g.addColorStop(1, q>=0?'rgba(255,59,107,0.75)':'rgba(68,138,255,0.75)')
      ctx.fillStyle=g; ctx.fill()
      ctx.strokeStyle=q>=0?'rgba(255,59,107,0.9)':'rgba(68,138,255,0.9)'
      ctx.lineWidth=2.5; ctx.stroke()
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px Inter'
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText('conductor',cx,cy)
    }
  },

  insulating_sphere: {
    label:'Esfera aislante (ρ uniforme)', sym:'spherical',
    show:['Q','R','rg'],
    getE(r) {
      const Q=p.Q*1e-9
      if(r<=0) return 0
      return r<=p.R ? K*Q*r/p.R**3 : K*Q/r**2
    },
    getQenc(r) {
      const Q=p.Q*1e-9
      return r<=p.R ? Q*(r/p.R)**3 : Q
    },
    formula() {
      const inside=p.rg<=p.R, E=this.getE(p.rg), Qe=this.getQenc(p.rg)
      return [
        {t:'head', v: inside?'r < R  (interior esfera)':'r > R  (exterior)'},
        {t:'key',  v: inside?'E = kQ·r / R³  (∝ r)':'E = kQ / r²  (∝ 1/r²)'},
        {t:'res',  v:`E(${p.rg.toFixed(2)}m) = ${fmtE(E)}`},
        {t:'dim',  v:`Q_enc = ${fmtQ(Qe)}`},
      ]
    },
    drawSource() {
      const R=p.R*SCALE, q=p.Q
      const c1=q>=0?'rgba(255,59,107,0.65)':'rgba(68,138,255,0.65)'
      const c2=q>=0?'rgba(255,59,107,0.06)':'rgba(68,138,255,0.06)'
      ctx.beginPath(); ctx.arc(cx,cy,R,0,TAU)
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R)
      g.addColorStop(0,c1); g.addColorStop(1,c2)
      ctx.fillStyle=g; ctx.fill()
      ctx.strokeStyle=q>=0?'rgba(255,59,107,0.5)':'rgba(68,138,255,0.5)'
      ctx.lineWidth=1.5; ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px Inter'
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText('ρ = cte',cx,cy)
    }
  },

  spherical_shell: {
    label:'Concha esférica', sym:'spherical',
    show:['Q','R','rg'],
    getE(r)    { return r<=p.R ? 0 : K*p.Q*1e-9/r**2 },
    getQenc(r) { return r<=p.R ? 0 : p.Q*1e-9 },
    formula() {
      const inside=p.rg<=p.R, E=this.getE(p.rg)
      return [
        {t:'head', v: inside?'r < R  (interior concha)':'r > R  (exterior)'},
        {t:'key',  v: inside?'E = 0  (toda la carga en r = R)':'E = kQ / r²'},
        {t:'res',  v: inside?'Q_enc = 0':`E(${p.rg.toFixed(2)}m) = ${fmtE(E)}`},
        {t:'dim',  v:`σ = ${fmtSig(p.Q*1e-9/(4*Math.PI*p.R**2))}`},
      ]
    },
    drawSource() {
      const R=p.R*SCALE, q=p.Q
      ctx.beginPath(); ctx.arc(cx,cy,R,0,TAU)
      ctx.strokeStyle=q>=0?'rgba(255,59,107,0.9)':'rgba(68,138,255,0.9)'
      ctx.lineWidth=5; ctx.stroke()
      const step=TAU/14
      ctx.font='bold 7px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle'
      for(let a=0;a<TAU;a+=step){
        ctx.fillStyle=q>=0?'rgba(255,100,120,0.9)':'rgba(68,138,255,0.9)'
        ctx.fillText(q>=0?'+':'−', cx+R*Math.cos(a), cy+R*Math.sin(a))
      }
    }
  },

  infinite_line: {
    label:'Línea de carga infinita', sym:'cylindrical',
    show:['lam','rg'],
    getE(r)    { return r<0.01 ? 0 : Math.abs(p.lam*1e-9)/(2*Math.PI*EPS0*r) },
    getQenc(r) { return p.lam*1e-9 },
    formula() {
      const E=this.getE(p.rg)
      return [
        {t:'head', v:'Cilindro gaussiano de radio r, largo L'},
        {t:'key',  v:'E · 2πr L = λL / ε₀'},
        {t:'key',  v:'→  E = λ / (2πε₀r)  ∝  1/r'},
        {t:'res',  v:`E(${p.rg.toFixed(2)}m) = ${fmtE(E)}`},
        {t:'dim',  v:`Φ/L = λ/ε₀ = ${fmtF(p.lam*1e-9/EPS0)}/m`},
      ]
    },
    drawSource() {
      const lam=p.lam
      ctx.beginPath(); ctx.arc(cx,cy,5,0,TAU)
      ctx.fillStyle=lam>=0?'#ff3b6b':'#448aff'; ctx.fill()
      for(let r=11;r<=20;r+=5){
        ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU)
        ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.stroke()
      }
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px Inter'
      ctx.textAlign='left'; ctx.textBaseline='middle'
      ctx.fillText('λ', cx+23, cy)
    }
  },

  infinite_plane: {
    label:'Plano infinito de carga', sym:'planar',
    show:['sig','rg'],
    getE(yDist) { return Math.abs(p.sig*1e-9)/(2*EPS0) },
    // Pillbox encloses charge only when it straddles the plane (|y₀| < h)
    getQenc(r)  { return Math.abs(p.yoff) < p.rg ? p.sig*1e-9 : 0 },
    formula() {
      const E=this.getE(p.rg)
      const straddles=Math.abs(p.yoff) < p.rg
      if(straddles) return [
        {t:'head', v:'Pillbox cruza el plano cargado'},
        {t:'key',  v:'2A·E = σA / ε₀'},
        {t:'key',  v:'→  E = σ / (2ε₀)  —  uniforme'},
        {t:'res',  v:`E = ${fmtE(E)}`},
      ]
      return [
        {t:'head', v:'Pillbox fuera del plano'},
        {t:'key',  v:'+E·A − E·A = 0'},
        {t:'key',  v:'Q_enc = 0  →  Φ_E = 0'},
        {t:'res',  v:'Flujo neto = 0'},
        {t:'dim',  v:`E = ${fmtE(E)} (campo local, uniforme)`},
      ]
    },
    drawSource() {}
  },

  capacitor: {
    label:'Condensador de placas paralelas', sym:'planar',
    show:['sig','d','rg','yoff'],
    getE(yDist) {
      return yDist < p.d/2 ? Math.abs(p.sig*1e-9)/EPS0 : 0
    },
    getQenc(r) {
      const crossTop = Math.abs(p.yoff - p.d/2) < p.rg
      const crossBot = Math.abs(p.yoff + p.d/2) < p.rg
      if(crossTop && crossBot) return 0
      if(crossTop) return  p.sig*1e-9
      if(crossBot) return -p.sig*1e-9
      return 0
    },
    formula() {
      const crossTop = Math.abs(p.yoff - p.d/2) < p.rg
      const crossBot = Math.abs(p.yoff + p.d/2) < p.rg
      const Eint = fmtE(this.getE(0))   // field inside the capacitor
      if(crossTop && crossBot) return [
        {t:'head', v:'Pillbox envuelve ambas placas'},
        {t:'key',  v:'Q_enc = +σ − σ = 0  →  Φ_E = 0'},
        {t:'res',  v:'E = 0  (campos se cancelan)'},
        {t:'dim',  v:'Los campos de ambas placas se CANCELAN'},
      ]
      if(crossTop) return [
        {t:'head', v:'Pillbox cruza la placa (+)'},
        {t:'key',  v:'Q_enc = +σ·A  →  E = σ/ε₀'},
        {t:'res',  v:`E = ${Eint}`},
        {t:'dim',  v:'Los campos de ambas placas se SUMAN'},
      ]
      if(crossBot) return [
        {t:'head', v:'Pillbox cruza la placa (−)'},
        {t:'key',  v:'Q_enc = −σ·A  →  E = −σ/ε₀'},
        {t:'res',  v:`E = −${Eint}`},
        {t:'dim',  v:'Los campos de ambas placas se SUMAN'},
      ]
      const between = Math.abs(p.yoff) < p.d/2
      return between ? [
        {t:'head', v:'Pillbox entre las placas (sin cruzar)'},
        {t:'key',  v:'+E·A − E·A = 0'},
        {t:'key',  v:'Q_enc = 0  →  Φ_E = 0'},
        {t:'res',  v:'Flujo neto = 0'},
        {t:'dim',  v:`E = ${Eint} (campo local)  —  no encerrado`},
      ] : [
        {t:'head', v:'Pillbox fuera del condensador'},
        {t:'key',  v:'Q_enc = 0,  E = 0 exterior'},
        {t:'res',  v:'Φ_E = 0'},
        {t:'dim',  v:'El campo exterior del condensador ideal es nulo'},
      ]
    },
    drawSource() {}
  },

  magnetic: {
    label:'Gauss magnético: ∮B·dA = 0', sym:'magnetic',
    show:['rg'],
    getE(r)    { return 0 },
    getQenc(r) { return 0 },
    formula() {
      return [
        {t:'head', v:'Ley de Gauss para el magnetismo'},
        {t:'key',  v:'∮ B · dA = 0  (siempre)'},
        {t:'dim',  v:'No existen monopolos magnéticos.'},
        {t:'dim',  v:'El flujo magnético neto a través de'},
        {t:'dim',  v:'cualquier sup. cerrada es siempre CERO.'},
      ]
    },
    drawSource() {}
  }
}

// ── Format helpers ────────────────────────────────────────────────────────
function fmtE(E) {
  if(!isFinite(E)||E===0) return '0 N/C'
  const a=Math.abs(E)
  if(a>=0.01&&a<1e5) return E.toPrecision(3)+' N/C'
  return E.toExponential(2)+' N/C'
}
function fmtF(Phi) {
  if(!isFinite(Phi)||Phi===0) return '0 N·m²/C'
  const a=Math.abs(Phi)
  if(a>=0.01&&a<1e6) return Phi.toPrecision(3)+' N·m²/C'
  return Phi.toExponential(2)+' N·m²/C'
}
function fmtQ(Q) {
  const nC=Q*1e9
  if(Math.abs(nC)>=0.01) return nC.toPrecision(3)+' nC'
  return (Q*1e12).toPrecision(3)+' pC'
}
function fmtSig(sig) {
  const nCm2=sig*1e9
  return nCm2.toPrecision(3)+' nC/m²'
}

// ── Drawing primitives ────────────────────────────────────────────────────
function arrow(x,y,angle,len,color,lineW=1.5,headSz=7){
  const cos=Math.cos(angle), sin=Math.sin(angle)
  const x2=x+cos*len, y2=y+sin*len
  ctx.strokeStyle=color; ctx.lineWidth=lineW
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke()
  // head
  ctx.fillStyle=color; ctx.beginPath()
  ctx.moveTo(x2+cos*headSz, y2+sin*headSz)
  ctx.lineTo(x2+Math.cos(angle+2.4)*headSz*0.5, y2+Math.sin(angle+2.4)*headSz*0.5)
  ctx.lineTo(x2+Math.cos(angle-2.4)*headSz*0.5, y2+Math.sin(angle-2.4)*headSz*0.5)
  ctx.closePath(); ctx.fill()
}

// ── Field line density (proportional to source charge magnitude) ──────────
function numFieldLines(){
  // Radial lines: 12 per nC (or nC/m for line charge). Clamp [0, 64].
  const q = sc==='infinite_line' ? Math.abs(p.lam) : Math.abs(p.Q)
  return Math.max(0, Math.min(64, Math.round(12*q)))
}
function planarLineSpacing(){
  // Columns of vertical arrows: 24 per nC/m². Clamp [6, 48].
  const nCols = Math.max(6, Math.min(48, Math.round(24*Math.abs(p.sig))))
  return W / nCols
}

// ── Background & grid ─────────────────────────────────────────────────────
function drawBackground(){
  ctx.fillStyle='#0b0f19'; ctx.fillRect(0,0,W,H)
}
function drawGrid(){
  const step=SCALE*0.5
  ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1
  for(let x=cx%step;x<W;x+=step){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke() }
  for(let y=cy%step;y<H;y+=step){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke() }
  // axes
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1
  ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke()
}

// ── Spherical / Cylindrical rendering ─────────────────────────────────────
function drawRadialFieldLines(){
  const scen=S[sc]
  const isNeg = sc==='infinite_line' ? p.lam<0 : p.Q<0
  const lineCol=isNeg?'rgba(68,138,255,0.22)':'rgba(255,80,100,0.22)'
  const arrCol =isNeg?'rgba(68,138,255,0.7)' :'rgba(255,80,100,0.7)'

  const hasInternalZero=['conducting_sphere','spherical_shell'].includes(sc)
  const rStart_px = hasInternalZero ? p.R*SCALE+3 : 14

  const nLines=numFieldLines()
  if(nLines===0) return
  const D=Math.hypot(W,H)

  // Reference E for arrow-size normalization: E at the Gaussian surface
  const E_ref = scen.getE(p.rg)
  // Spacing between arrowheads along each ray — tighter when more lines
  const arrowSpacing = Math.max(50, Math.round(1100/nLines))

  for(let i=0;i<nLines;i++){
    const ang=(i/nLines)*TAU
    const cos=Math.cos(ang), sin=Math.sin(ang)

    const x0=cx+rStart_px*cos, y0=cy+rStart_px*sin
    const x1=cx+D*cos, y1=cy+D*sin

    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1)
    ctx.strokeStyle=lineCol; ctx.lineWidth=1; ctx.stroke()

    const dir = isNeg ? ang+Math.PI : ang
    let dist=rStart_px+arrowSpacing*0.55
    while(dist<D){
      const ax=cx+dist*cos, ay=cy+dist*sin
      if(ax<-20||ax>W+20||ay<-20||ay>H+20) break

      // Scale arrow by local E(r) relative to E at Gaussian surface
      const E_at = scen.getE(dist/SCALE)
      const scale = (E_ref>0 && isFinite(E_at))
        ? Math.min(2.8, Math.max(0.18, E_at/E_ref))
        : 1.0
      if(scale>0.2){
        const aLen = Math.max(4, Math.round(11*scale))
        const hSz  = Math.max(3, Math.round(6*scale))
        arrow(ax-Math.cos(dir)*aLen*0.5, ay-Math.sin(dir)*aLen*0.5, dir, aLen, arrCol, 0, hSz)
      }
      dist+=arrowSpacing
    }
  }
}

function drawSphericalGaussian(){
  const scen=S[sc]
  const r_px=p.rg*SCALE
  const Qenc=scen.getQenc(p.rg)
  const flux=Qenc/EPS0

  const fluxSign=Math.sign(flux)
  const baseColor=fluxSign>0?'0,229,255':fluxSign<0?'255,59,107':'200,200,200'

  // Outer glow
  if(Math.abs(Qenc)>1e-20){
    ctx.beginPath(); ctx.arc(cx,cy,r_px+10,0,TAU)
    ctx.strokeStyle=`rgba(${baseColor},0.12)`; ctx.lineWidth=20; ctx.stroke()
  }

  // Dashed circle
  ctx.beginPath(); ctx.arc(cx,cy,r_px,0,TAU)
  ctx.strokeStyle=`rgba(${baseColor},0.9)`; ctx.lineWidth=1.8
  ctx.setLineDash([10,6]); ctx.stroke(); ctx.setLineDash([])

  // Radius label
  const ang=Math.PI/4
  const lx=cx+r_px*Math.cos(ang)+6, ly=cy+r_px*Math.sin(ang)-8
  ctx.fillStyle=`rgba(${baseColor},0.75)`;ctx.font='11px Inter'
  ctx.textAlign='left';ctx.textBaseline='middle'
  ctx.fillText(`r = ${p.rg.toFixed(2)} m`,lx,ly)
}

function drawFluxArrowsSph(){
  const scen=S[sc]
  const r_px=p.rg*SCALE
  const E=scen.getE(p.rg)
  const Qenc=scen.getQenc(p.rg)
  if(E<1e-12) return

  const outward=Qenc>=0
  const col=outward?'rgba(0,229,255,0.85)':'rgba(255,59,107,0.85)'
  const nA=12, arrLen=14

  for(let i=0;i<nA;i++){
    const ang=(i/nA)*TAU
    const cos=Math.cos(ang), sin=Math.sin(ang)
    const bx=cx+r_px*cos, by=cy+r_px*sin
    const dir=outward?ang:ang+Math.PI
    arrow(bx-Math.cos(dir)*6, by-Math.sin(dir)*6, dir, arrLen, col, 1.5, 6)
  }
}

// ── Planar rendering ──────────────────────────────────────────────────────
function drawInfinitePlaneVis(){
  const sig=p.sig
  // Plane at cy
  ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy)
  ctx.strokeStyle=sig>=0?'rgba(255,59,107,0.85)':'rgba(68,138,255,0.85)'
  ctx.lineWidth=3; ctx.stroke()
  // Charge symbols
  ctx.font='bold 10px Inter';ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.fillStyle=sig>=0?'rgba(255,80,100,0.8)':'rgba(68,138,255,0.8)'
  for(let x=35;x<W;x+=48) ctx.fillText(sig>=0?'+':'−',x,cy)
}

function drawCapacitorVis(){
  const sig=p.sig
  const halfD=p.d/2*SCALE
  const posSign=sig>=0
  const colPos='rgba(255,59,107,0.85)', colNeg='rgba(68,138,255,0.85)'

  const drawPlate=(yc,sign)=>{
    ctx.beginPath();ctx.moveTo(0,yc);ctx.lineTo(W,yc)
    ctx.strokeStyle=sign?colPos:colNeg; ctx.lineWidth=3; ctx.stroke()
    ctx.font='bold 10px Inter';ctx.textAlign='center';ctx.textBaseline='middle'
    ctx.fillStyle=sign?'rgba(255,80,100,0.8)':'rgba(68,138,255,0.8)'
    for(let x=35;x<W;x+=48) ctx.fillText(sign?'+':'−',x,yc)
  }
  drawPlate(cy-halfD, posSign)     // top plate
  drawPlate(cy+halfD, !posSign)    // bottom plate
}

function drawPlanarFieldLines(){
  const sig=p.sig
  if(sig===0) return
  const xStep=planarLineSpacing()
  const E_dir = sig>=0 ? 1 : -1    // 1 → downward (canvas), -1 → upward

  if(sc==='infinite_plane'){
    const col='rgba(255,255,255,0.22)', arrCol='rgba(255,255,255,0.7)'
    for(let x=xStep/2;x<W;x+=xStep){
      // Below plane: away from plane
      for(let y=cy+30;y<H;y+=80) arrow(x,y-8, E_dir>0?Math.PI/2:-Math.PI/2, 14, arrCol, 1.2, 6)
      // Above plane: away from plane (opposite direction)
      for(let y=cy-30;y>0;y-=80) arrow(x,y+8, E_dir>0?-Math.PI/2:Math.PI/2, 14, arrCol, 1.2, 6)
      // thin lines
      ctx.strokeStyle=col;ctx.lineWidth=1
      ctx.setLineDash([3,5])
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,cy-4); ctx.stroke()
      ctx.beginPath();ctx.moveTo(x,cy+4);ctx.lineTo(x,H); ctx.stroke()
      ctx.setLineDash([])
    }
  } else {
    // Capacitor: field only between plates
    const halfD=p.d/2*SCALE
    const topY=cy-halfD, botY=cy+halfD
    const col='rgba(255,255,255,0.22)', arrCol='rgba(255,255,255,0.7)'
    for(let x=xStep/2;x<W;x+=xStep){
      ctx.strokeStyle=col;ctx.lineWidth=1
      ctx.beginPath();ctx.moveTo(x,topY+2);ctx.lineTo(x,botY-2); ctx.stroke()
      const dir=E_dir>0 ? Math.PI/2 : -Math.PI/2
      for(let y=topY+30;y<botY;y+=80) arrow(x,y-8, dir, 14, arrCol, 1.2, 6)
    }
  }
}

function drawPlanarGaussian(){
  const pillW=Math.min(W*0.38, 200)
  const halfPillW=pillW/2
  const pillH_px=p.rg*SCALE

  let centerY   // y-canvas of the plane the pillbox straddles
  let Qenc=S[sc].getQenc(p.rg)
  let fluxSign=Math.sign(Qenc)
  const baseColor=fluxSign>0?'0,229,255':fluxSign<0?'255,59,107':'200,200,200'

  centerY = cy - p.yoff*SCALE   // physics y+ is up → canvas y- is up

  const left=cx-halfPillW, right=cx+halfPillW
  const top=centerY-pillH_px, bot=centerY+pillH_px

  // Glow on top & bottom faces
  if(Math.abs(Qenc)>1e-20){
    ctx.fillStyle=`rgba(${baseColor},0.08)`
    ctx.fillRect(left, top-6, pillW, 12)
    ctx.fillRect(left, bot-6, pillW, 12)
  }

  // Dashed rectangle
  ctx.strokeStyle=`rgba(${baseColor},0.88)`;ctx.lineWidth=1.8
  ctx.setLineDash([8,5])
  ctx.strokeRect(left, top, pillW, pillH_px*2)
  ctx.setLineDash([])

  // Labels on faces
  ctx.font='10px Inter';ctx.fillStyle=`rgba(${baseColor},0.75)`;ctx.textAlign='center'
  ctx.fillText('dA ↑',cx,top-8)
  ctx.fillText('dA ↓',cx,bot+12)
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.textAlign='left'
  ctx.fillText('pillbox',right+6,(top+bot)/2)

  // Pillbox height label
  ctx.font='10px Inter';ctx.fillStyle=`rgba(${baseColor},0.65)`;ctx.textAlign='right'
  ctx.fillText(`h = ${p.rg.toFixed(2)} m`,left-4,(top+centerY)/2)
}

function drawFluxArrowsPlanar(){
  const scen=S[sc]
  const Qenc=scen.getQenc(p.rg)

  const pillW=Math.min(W*0.38,200)
  const pillH_px=p.rg*SCALE
  const outward=Qenc>0
  let centerY=cy-p.yoff*SCALE
  const top=centerY-pillH_px, bot=centerY+pillH_px

  const col='rgba(0,229,255,0.85)'
  const left=cx-pillW/2, right=cx+pillW/2

  if(Math.abs(Qenc)<1e-20){
    // Q_enc = 0: E exists but enters one face and exits the other → net flux = 0.
    // Show dim arrows only when field is non-zero at the pillbox location.
    let hasField = false, Edir = Math.PI/2
    if(sc==='infinite_plane'){
      hasField = true
      const aboveCenter=p.yoff>0
      Edir=(p.sig>=0 ? 1 : -1)*(aboveCenter ? -1 : 1)*Math.PI/2
    } else if(sc==='capacitor'){
      const between = Math.abs(p.yoff) < p.d/2
      // Spanning both plates also gives Q_enc=0 but field cancels — skip arrows there.
      const crossTop=Math.abs(p.yoff-p.d/2)<p.rg, crossBot=Math.abs(p.yoff+p.d/2)<p.rg
      if(between && !crossTop && !crossBot){
        hasField = true
        Edir = p.sig>=0 ? Math.PI/2 : -Math.PI/2   // field points from + to − (canvas down for σ>0)
      }
    }
    if(hasField){
      const dim='rgba(150,210,230,0.38)'
      for(let x=left+20;x<right;x+=35){
        arrow(x, top+6, Edir, 12, dim, 1.2, 5)
        arrow(x, bot-6, Edir, 12, dim, 1.2, 5)
      }
    }
    return
  }

  // Arrows on top face (pointing up = outward)
  for(let x=left+20;x<right;x+=35)
    arrow(x, top+6, outward?-Math.PI/2:Math.PI/2, 14, col, 1.4, 6)
  // Arrows on bottom face (pointing down = outward)
  for(let x=left+20;x<right;x+=35)
    arrow(x, bot-6, outward?Math.PI/2:-Math.PI/2, 14, col, 1.4, 6)
}

// ── Magnetic dipole rendering ─────────────────────────────────────────────
function drawMagneticField(){
  const families=[0.7,1.2,1.9,2.8,4.0]
  const col='rgba(120,180,255,0.32)'

  for(const C of families){
    // Right side: theta 0→π (from north to south, x>0)
    ctx.beginPath(); let first=true
    for(let j=0;j<=80;j++){
      const theta=(j/80)*Math.PI
      const r=C*Math.sin(theta)**2
      const xm=r*Math.sin(theta), ym=r*Math.cos(theta)  // physics y up
      const xpx=cx+xm*SCALE, ypx=cy-ym*SCALE
      first?(ctx.moveTo(xpx,ypx),first=false):ctx.lineTo(xpx,ypx)
    }
    // Continue left side back: theta π→0 but mirror x
    for(let j=80;j>=0;j--){
      const theta=(j/80)*Math.PI
      const r=C*Math.sin(theta)**2
      const xm=-r*Math.sin(theta), ym=r*Math.cos(theta)
      ctx.lineTo(cx+xm*SCALE, cy-ym*SCALE)
    }
    ctx.closePath()
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke()
  }

  // Direction arrows on largest family
  const C=families[families.length-2]
  for(let j=10;j<=70;j+=20){
    const theta=(j/80)*Math.PI
    const r=C*Math.sin(theta)**2
    const xm=r*Math.sin(theta), ym=r*Math.cos(theta)
    const ax=cx+xm*SCALE, ay=cy-ym*SCALE
    // tangent direction: dr/dtheta direction
    const dxm=C*(2*Math.sin(theta)*Math.cos(theta)*Math.sin(theta)+Math.sin(theta)**2*Math.cos(theta))
    const dym=C*2*Math.sin(theta)*Math.cos(theta)*Math.cos(theta)-C*Math.sin(theta)**2*Math.sin(theta)
    const ang=Math.atan2(-dym*SCALE, dxm*SCALE)  // canvas angle
    arrow(ax-Math.cos(ang)*5, ay-Math.sin(ang)*5, ang, 10, 'rgba(100,200,255,0.7)', 0, 6)
  }

  // Dipole indicator at center
  ctx.beginPath();ctx.moveTo(cx,cy+16);ctx.lineTo(cx,cy-16)
  ctx.strokeStyle='rgba(255,200,40,0.7)';ctx.lineWidth=2;ctx.stroke()
  ctx.beginPath();ctx.moveTo(cx-5,cy-10);ctx.lineTo(cx,cy-18);ctx.lineTo(cx+5,cy-10)
  ctx.fillStyle='rgba(255,200,40,0.7)';ctx.fill()
  ctx.fillStyle='rgba(255,200,40,0.6)';ctx.font='bold 9px Inter'
  ctx.textAlign='left';ctx.textBaseline='middle'
  ctx.fillText('m',cx+6,cy-18)

  // Gaussian sphere
  drawSphericalGaussian()

  // Arrows on Gaussian sphere: upper hemisphere exits (B_r > 0), lower enters (B_r < 0)
  // For dipole m along +y_physics: B_r ∝ cosθ = y_phys/r; y_phys = -sin(ang_canvas)*r
  // → outward when sin(ang_canvas) < 0  (upper half of canvas = physics north hemisphere)
  const r_px=p.rg*SCALE
  const nA=12
  for(let i=0;i<nA;i++){
    const ang=(i/nA)*TAU
    const cos=Math.cos(ang), sinA=Math.sin(ang)
    const outward=sinA<0    // upper canvas = physics y > 0 → B_r > 0 → outward
    const col=outward?'rgba(0,229,255,0.7)':'rgba(255,80,100,0.7)'
    const bx=cx+r_px*cos, by=cy+r_px*sinA
    const dir=outward?ang:ang+Math.PI
    arrow(bx-Math.cos(dir)*5,by-Math.sin(dir)*5,dir,11,col,1.4,5)
  }
}

// ── E(r) graph ────────────────────────────────────────────────────────────
function drawEGraph(){
  const mob=W<641
  const {gx,gy,GW,GH}=getGraphRect()
  const PAD=mob?{t:14,r:10,b:30,l:44}:{t:20,r:16,b:38,l:58}
  const pw=GW-PAD.l-PAD.r, ph=GH-PAD.t-PAD.b
  const px=gx+PAD.l, py=gy+PAD.t
  const fsAxis=mob?'9px Inter':'11px Inter'
  const fsTick=mob?'8px Inter':'10px Inter'
  const fsTitle=mob?'bold 9px Inter':'bold 11px Inter'

  ctx.fillStyle='rgba(8,11,20,0.94)'
  ctx.beginPath();ctx.roundRect(gx,gy,GW,GH,10);ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.11)';ctx.lineWidth=1;ctx.stroke()

  // Drag handle: shaded header bar
  ctx.fillStyle='rgba(255,255,255,0.04)'
  ctx.beginPath();ctx.roundRect(gx,gy,GW,22,{upperLeft:10,upperRight:10,lowerLeft:0,lowerRight:0});ctx.fill()
  // Resize grip: diagonal lines at bottom-right corner
  const gs=mob?20:16
  for(let i=4;i<gs;i+=4){
    ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=1
    ctx.beginPath();ctx.moveTo(gx+GW-i,gy+GH-2);ctx.lineTo(gx+GW-2,gy+GH-i);ctx.stroke()
  }

  const rMax=5.0, N=300
  const scen=S[sc]
  // Anchor y-scale to current operating point to avoid singularity domination.
  // Use |E|: getE() is signed for negative charges but the graph plots magnitude.
  const E_rg=Math.abs(scen.getE(p.rg))
  const E_R =(['conducting_sphere','insulating_sphere','spherical_shell'].includes(sc)&&p.R<rMax)
              ? Math.abs(scen.getE(p.R+0.01)) : 0
  let eMax=Math.max(isFinite(E_rg)?E_rg:0, isFinite(E_R)?E_R:0)
  if(eMax===0) eMax=Math.abs(scen.getE(1.0))   // fallback: |E| at 1 m
  eMax=isFinite(eMax)&&eMax>0 ? eMax*2.2 : 1
  const pts=[]
  for(let i=0;i<=N;i++){
    const r=(i/N)*rMax
    const e=Math.abs(scen.getE(r))
    pts.push({r,e:isFinite(e)?e:0})
  }
  if(eMax===0){
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=fsAxis;ctx.textAlign='center'
    ctx.fillText('E = 0',gx+GW/2,gy+GH/2);return
  }

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1
  ctx.beginPath();ctx.moveTo(px,py+ph);ctx.lineTo(px+pw,py+ph);ctx.stroke()
  ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+ph);ctx.stroke()

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font=fsAxis
  ctx.textAlign='center';ctx.fillText('r (m)',px+pw/2,gy+GH-6)
  ctx.save();ctx.translate(gx+(mob?10:14),py+ph/2);ctx.rotate(-Math.PI/2)
  ctx.fillText('|E| (N/C)',0,0);ctx.restore()

  // x ticks
  for(let r=0;r<=rMax;r++){
    const xp=px+(r/rMax)*pw
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font=fsTick;ctx.textAlign='center'
    ctx.fillText(r,xp,py+ph+12)
    if(r>0){
      ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=0.5
      ctx.beginPath();ctx.moveTo(xp,py);ctx.lineTo(xp,py+ph);ctx.stroke()
    }
  }

  // y ticks — 4 labeled gridlines showing actual field magnitude
  const _fmtY=v=>{
    const a=Math.abs(v)
    if(a>=1000) return v.toExponential(1).replace('+','')
    if(a>=10)   return Math.round(v)+''
    if(a>=1)    return v.toFixed(1)
    if(a>=0.01) return v.toFixed(2)
    return v.toExponential(1).replace('+','')
  }
  for(let i=1;i<=4;i++){
    const Eval=(i/4)*eMax
    const ytp=py+ph*(1-i/4)
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=0.5
    ctx.beginPath();ctx.moveTo(px,ytp);ctx.lineTo(px+pw,ytp);ctx.stroke()
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=fsTick;ctx.textAlign='right'
    ctx.fillText(_fmtY(Eval),px-4,ytp+3.5)
  }

  // R marker
  if(['conducting_sphere','insulating_sphere','spherical_shell'].includes(sc)){
    const Rpx=px+(p.R/rMax)*pw
    ctx.strokeStyle='rgba(255,202,40,0.7)';ctx.lineWidth=1.5;ctx.setLineDash([4,3])
    ctx.beginPath();ctx.moveTo(Rpx,py);ctx.lineTo(Rpx,py+ph);ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle='rgba(255,202,40,0.8)';ctx.font=fsTick;ctx.textAlign='center'
    ctx.fillText('R',Rpx,py-4)
  }

  // r_gauss marker
  const rgPx=px+Math.min(p.rg/rMax,1)*pw
  ctx.strokeStyle='rgba(0,229,255,0.6)';ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(rgPx,py);ctx.lineTo(rgPx,py+ph);ctx.stroke()

  // E(r) curve — break at internal-zero regions
  const hasZeroInside=['conducting_sphere','spherical_shell'].includes(sc)
  ctx.beginPath();ctx.strokeStyle='#7ec8e3';ctx.lineWidth=2.5
  let first=true
  for(const {r,e} of pts){
    if(e>eMax||!isFinite(e)){first=true;continue}
    const xp=px+(r/rMax)*pw, yp=py+ph-(e/eMax)*ph
    if(first){ctx.moveTo(xp,yp);first=false}else ctx.lineTo(xp,yp)
  }
  ctx.stroke()

  // For conductors/shells: flat zero inside
  if(hasZeroInside){
    ctx.strokeStyle='rgba(68,138,255,0.7)';ctx.lineWidth=2.5
    ctx.beginPath()
    ctx.moveTo(px,py+ph)
    ctx.lineTo(px+Math.min(p.R/rMax,1)*pw,py+ph)
    ctx.stroke()
  }

  // Dot at (rg, |E|)
  const Ec=Math.abs(scen.getE(p.rg))
  if(isFinite(Ec)&&Ec<=eMax&&p.rg<=rMax){
    const dx=px+(p.rg/rMax)*pw, dy=py+ph-(Ec/eMax)*ph
    ctx.beginPath();ctx.arc(dx,dy,5,0,TAU)
    ctx.fillStyle='#00e5ff';ctx.fill()
    ctx.strokeStyle='rgba(0,0,0,0.6)';ctx.lineWidth=1.5;ctx.stroke()
  }

  // Graph title
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=fsTitle;ctx.textAlign='left'
  ctx.fillText('E vs r',gx+PAD.l,gy+(mob?10:13))
}

// ── UI update ─────────────────────────────────────────────────────────────
function updateReadout(){
  const scen=S[sc]
  const Qenc=scen.getQenc(p.rg)
  const E=scen.getE(p.rg)
  const flux=Qenc/EPS0

  const sym=scen.sym
  let QencTxt, fluxTxt
  if(sym==='cylindrical'){
    QencTxt=fmtQ(Qenc)+'/m'
    fluxTxt=fmtF(Qenc/EPS0)+'/m'
  } else if(sym==='planar'){
    QencTxt=fmtSig(Qenc)
    fluxTxt=fmtF(Qenc/EPS0)+'/m²'
  } else if(sym==='magnetic'){
    QencTxt='0 (magnético)'; fluxTxt='0'
  } else {
    QencTxt=fmtQ(Qenc); fluxTxt=fmtF(flux)
  }

  document.getElementById('ro-Qenc').textContent=QencTxt
  document.getElementById('ro-flux').textContent=fluxTxt
  document.getElementById('ro-E').textContent=sym==='magnetic'?'— (dipolo)':fmtE(E)
}

function updateFormula(){
  const lines=S[sc].formula()
  const el=document.getElementById('formulaBody')
  el.innerHTML=lines.map(l=>{
    if(l.t==='head') return `<div class="f-head">${l.v}</div>`
    if(l.t==='key')  return `<div class="f-key">${l.v}</div>`
    if(l.t==='res')  return `<div class="f-result">${l.v}</div>`
    return `<div class="f-dim">${l.v}</div>`
  }).join('')
}

// ── Param controls visibility ─────────────────────────────────────────────
const PARAM_MAP = {
  point_charge:      ['Q','rg'],
  conducting_sphere: ['Q','R','rg'],
  insulating_sphere: ['Q','R','rg'],
  spherical_shell:   ['Q','R','rg'],
  infinite_line:     ['lam','rg'],
  infinite_plane:    ['sig','rg','yoff'],
  capacitor:         ['sig','d','rg','yoff'],
  magnetic:          ['rg'],
}
function syncParamVisibility(){
  const show=PARAM_MAP[sc]
  const all=['Q','R','rg','lam','sig','d','yoff']
  all.forEach(k=>{
    const el=document.getElementById(`pg-${k}`)
    if(el) el.style.display=show.includes(k)?'':'none'
  })
  // Update rg label for planar
  const rgLabel=document.querySelector('#pg-rg label')
  if(rgLabel){
    const scen=S[sc]
    if(scen.sym==='planar')
      rgLabel.childNodes[0].textContent='Altura pillbox h '
    else
      rgLabel.childNodes[0].textContent='Radio gaussiano r '
  }
}

// ── Main render ───────────────────────────────────────────────────────────
function render(){
  drawBackground()
  if(opts.grid) drawGrid()

  const scen=S[sc]
  const sym=scen.sym

  if(sym==='magnetic'){
    drawMagneticField()
  } else if(sym==='spherical'||sym==='cylindrical'){
    if(opts.lines) drawRadialFieldLines()
    scen.drawSource()
    drawSphericalGaussian()
    if(opts.flux) drawFluxArrowsSph()
    if(opts.graph) drawEGraph()
  } else if(sym==='planar'){
    if(opts.lines) drawPlanarFieldLines()
    sc==='capacitor'?drawCapacitorVis():drawInfinitePlaneVis()
    drawPlanarGaussian()
    if(opts.flux) drawFluxArrowsPlanar()
    if(opts.graph) drawEGraphPlanar()
  }

  updateReadout()
  updateFormula()
}

// ── Planar E graph (E vs y) ───────────────────────────────────────────────
function drawEGraphPlanar(){
  const mob=W<641
  const {gx,gy,GW,GH}=getGraphRect()
  const PAD=mob?{t:14,r:10,b:30,l:44}:{t:20,r:16,b:38,l:58}
  const pw=GW-PAD.l-PAD.r, ph=GH-PAD.t-PAD.b
  const px=gx+PAD.l, py=gy+PAD.t
  const fsAxis=mob?'9px Inter':'11px Inter'
  const fsTick=mob?'8px Inter':'10px Inter'
  const fsTitle=mob?'bold 9px Inter':'bold 11px Inter'

  ctx.fillStyle='rgba(8,11,20,0.94)'
  ctx.beginPath();ctx.roundRect(gx,gy,GW,GH,10);ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.11)';ctx.lineWidth=1;ctx.stroke()

  // Drag handle header + resize grip (shared with drawEGraph)
  ctx.fillStyle='rgba(255,255,255,0.04)'
  ctx.beginPath();ctx.roundRect(gx,gy,GW,22,{upperLeft:10,upperRight:10,lowerLeft:0,lowerRight:0});ctx.fill()
  const gs=mob?20:16
  for(let i=4;i<gs;i+=4){
    ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=1
    ctx.beginPath();ctx.moveTo(gx+GW-i,gy+GH-2);ctx.lineTo(gx+GW-2,gy+GH-i);ctx.stroke()
  }

  const yRange=5.0   // meters, symmetric
  const N=300, scen=S[sc]
  let eMax=0
  const pts=[]
  for(let i=0;i<=N;i++){
    const y=(i/N)*yRange*2-yRange
    const e=scen.getE(Math.abs(y))
    pts.push({y,e})
    eMax=Math.max(eMax,e)
  }
  eMax=Math.max(eMax*1.15, 1)

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1
  ctx.beginPath();ctx.moveTo(px,py+ph);ctx.lineTo(px+pw,py+ph);ctx.stroke()
  ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+ph);ctx.stroke()
  // center horizontal axis (y=0)
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=0.7
  const yCenterPx=py+ph/2
  ctx.beginPath();ctx.moveTo(px,yCenterPx);ctx.lineTo(px+pw,yCenterPx);ctx.stroke()

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font=fsAxis
  ctx.textAlign='center';ctx.fillText('y (m)',px+pw/2,gy+GH-6)
  ctx.save();ctx.translate(gx+(mob?10:14),py+ph/2);ctx.rotate(-Math.PI/2)
  ctx.fillText('|E| (N/C)',0,0);ctx.restore()

  // y ticks
  const _fmtY=v=>{
    const a=Math.abs(v)
    if(a>=1000) return v.toExponential(1).replace('+','')
    if(a>=10)   return Math.round(v)+''
    if(a>=1)    return v.toFixed(1)
    if(a>=0.01) return v.toFixed(2)
    return v.toExponential(1).replace('+','')
  }
  for(let i=1;i<=4;i++){
    const Eval=(i/4)*eMax
    const ytp=py+ph*(1-i/4)
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=0.5
    ctx.beginPath();ctx.moveTo(px,ytp);ctx.lineTo(px+pw,ytp);ctx.stroke()
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=fsTick;ctx.textAlign='right'
    ctx.fillText(_fmtY(Eval),px-4,ytp+3.5)
  }

  // Plate markers for capacitor
  if(sc==='capacitor'){
    for(const yPlate of[-p.d/2, p.d/2]){
      const xp=px+(yPlate+yRange)/(2*yRange)*pw
      ctx.strokeStyle='rgba(255,202,40,0.7)';ctx.lineWidth=1.5;ctx.setLineDash([4,3])
      ctx.beginPath();ctx.moveTo(xp,py);ctx.lineTo(xp,py+ph);ctx.stroke()
      ctx.setLineDash([])
    }
  }

  // E(y) curve
  ctx.beginPath();ctx.strokeStyle='#7ec8e3';ctx.lineWidth=2.5
  let first=true
  for(const {y,e} of pts){
    const xp=px+(y+yRange)/(2*yRange)*pw
    const yp=py+ph-(e/eMax)*ph
    first?(ctx.moveTo(xp,yp),first=false):ctx.lineTo(xp,yp)
  }
  ctx.stroke()

  // Pillbox extent: shaded band from (center-rg) to (center+rg) on x-axis
  const pillCenter = p.yoff
  const pL = Math.max(-yRange, pillCenter - p.rg)
  const pR = Math.min( yRange, pillCenter + p.rg)
  const xL = px+(pL+yRange)/(2*yRange)*pw
  const xR = px+(pR+yRange)/(2*yRange)*pw
  ctx.fillStyle='rgba(0,229,255,0.07)'
  ctx.fillRect(xL, py, xR-xL, ph)
  ctx.strokeStyle='rgba(0,229,255,0.55)';ctx.lineWidth=1.2;ctx.setLineDash([4,3])
  ctx.beginPath();ctx.moveTo(xL,py);ctx.lineTo(xL,py+ph);ctx.stroke()
  ctx.beginPath();ctx.moveTo(xR,py);ctx.lineTo(xR,py+ph);ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font=fsTitle;ctx.textAlign='left'
  ctx.fillText('E vs y',gx+PAD.l,gy+(mob?10:13))
}

// ── Resize ────────────────────────────────────────────────────────────────
function resize(){
  W=canvas.width=canvas.offsetWidth
  H=canvas.height=canvas.offsetHeight
  cx=W/2; cy=H/2
  _gPos=null; _gSize=null   // snap graph back to default on window resize
  render()
}

// ── Mouse / Touch interaction ─────────────────────────────────────────────
function getPos(e){
  const r=canvas.getBoundingClientRect()
  const src=e.touches?e.touches[0]:e
  return {mx:src.clientX-r.left, my:src.clientY-r.top}
}

function onDown(e){
  const {mx,my}=getPos(e)

  // Graph drag / resize takes priority when graph is visible
  if(opts.graph){
    const {gx,gy,GW,GH}=getGraphRect()
    const mob=W<641
    const gripSz=mob?22:18
    if(mx>=gx&&mx<=gx+GW&&my>=gy&&my<=gy+GH){
      if(mx>=gx+GW-gripSz&&my>=gy+GH-gripSz){
        _gResize=true
        if(!_gPos) _gPos={x:gx,y:gy}
        if(!_gSize) _gSize={w:GW,h:GH}
        _gStart={mx,my,w:_gSize.w,h:_gSize.h}
        e.preventDefault?.(); return
      }
      if(my<=gy+22){
        _gDrag=true
        if(!_gPos) _gPos={x:gx,y:gy}
        _gStart={mx,my,gx:_gPos.x,gy:_gPos.y}
        e.preventDefault?.(); return
      }
    }
  }

  const sym=S[sc].sym

  if(sym==='spherical'||sym==='cylindrical'||sym==='magnetic'){
    const dist=Math.hypot(mx-cx,my-cy)
    const rg_px=p.rg*SCALE
    if(Math.abs(dist-rg_px)<14){
      isDragging=true; canvas.classList.add('dragging')
      e.preventDefault()
    }
  } else if(sym==='planar'){
    let centerY=cy-p.yoff*SCALE
    const pillTop=centerY-p.rg*SCALE
    const pillBot=centerY+p.rg*SCALE
    if(Math.abs(my-pillTop)<14||Math.abs(my-pillBot)<14){
      isDragging=true; canvas.classList.add('dragging')
      e.preventDefault()
    }
  }
}

function onMove(e){
  const {mx,my}=getPos(e)

  // Graph drag
  if(_gDrag){
    e.preventDefault?.()
    const GW=_gSize?.w??390, GH=_gSize?.h??260
    _gPos.x=Math.max(0,Math.min(W-GW,  _gStart.gx+mx-_gStart.mx))
    _gPos.y=Math.max(0,Math.min(H-GH,  _gStart.gy+my-_gStart.my))
    render(); return
  }
  // Graph resize
  if(_gResize){
    e.preventDefault?.()
    const mob=W<641, minW=mob?180:220, minH=mob?130:160
    _gSize.w=Math.max(minW,Math.min(W-_gPos.x-10, _gStart.w+mx-_gStart.mx))
    _gSize.h=Math.max(minH,Math.min(H-_gPos.y-10, _gStart.h+my-_gStart.my))
    render(); return
  }

  // Cursor update when hovering graph
  if(opts.graph&&!isDragging){
    const {gx,gy,GW,GH}=getGraphRect()
    const mob=W<641, gripSz=mob?22:18
    if(mx>=gx&&mx<=gx+GW&&my>=gy&&my<=gy+GH){
      canvas.style.cursor=mx>=gx+GW-gripSz&&my>=gy+GH-gripSz?'nwse-resize':'move'
      return
    }
  }

  if(!isDragging) return
  e.preventDefault()
  const sym=S[sc].sym

  if(sym==='spherical'||sym==='cylindrical'||sym==='magnetic'){
    const dist=Math.hypot(mx-cx,my-cy)
    p.rg=Math.max(0.1,Math.min(5.0,dist/SCALE))
    setSlider('rg',p.rg)
  } else if(sym==='planar'){
    let centerY=cy-p.yoff*SCALE
    p.rg=Math.max(0.1,Math.min(5.0,Math.abs(my-centerY)/SCALE))
    setSlider('rg',p.rg)
  }
  render()
}

function onUp(){ _gDrag=false; _gResize=false; isDragging=false; canvas.classList.remove('dragging') }

function setSlider(key,val){
  const el=document.getElementById(`ps-${key}`)
  if(el) el.value=val
  updateSliderLabel(key,val)
}

function updateSliderLabel(key,val){
  const el=document.getElementById(`pv-${key}`)
  if(!el) return
  const fmts={
    Q:   v=>`${(+v).toFixed(1)} nC`,
    R:   v=>`${(+v).toFixed(1)} m`,
    rg:  v=>`${(+v).toFixed(2)} m`,
    lam: v=>`${(+v).toFixed(1)} nC/m`,
    sig: v=>`${(+v).toFixed(1)} nC/m²`,
    d:   v=>`${(+v).toFixed(2)} m`,
    yoff:v=>`${(+v >= 0 ? '+' : '')}${(+v).toFixed(2)} m`,
  }
  el.textContent=(fmts[key]||String)(val)
}

// ── Event listeners ───────────────────────────────────────────────────────
function initEvents(){
  canvas.addEventListener('mousedown', onDown)
  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseup',   onUp)
  canvas.addEventListener('mouseleave',onUp)
  canvas.addEventListener('touchstart',onDown,{passive:false})
  canvas.addEventListener('touchmove', onMove,{passive:false})
  canvas.addEventListener('touchend',  onUp)

  document.getElementById('scenarioSelect').addEventListener('change',e=>{
    sc=e.target.value
    syncParamVisibility()
    render()
  })

  ;['Q','R','rg','lam','sig','d','yoff'].forEach(key=>{
    const el=document.getElementById(`ps-${key}`)
    if(!el) return
    el.addEventListener('input',()=>{
      p[key]=parseFloat(el.value)
      updateSliderLabel(key,el.value)
      render()
    })
  })

  document.getElementById('optLines').addEventListener('change',e=>{ opts.lines=e.target.checked; render() })
  document.getElementById('optFlux').addEventListener('change',e=>{ opts.flux=e.target.checked; render() })
  document.getElementById('optGraph').addEventListener('change',e=>{ opts.graph=e.target.checked; render() })
  document.getElementById('optGrid').addEventListener('change',e=>{ opts.grid=e.target.checked; render() })

  window.addEventListener('resize',resize)

  // Mobile: tap handle pill to toggle panel
  const mobileHandle=document.getElementById('mobileHandle')
  if(mobileHandle){
    mobileHandle.addEventListener('click',()=>{
      document.getElementById('panel').classList.toggle('open')
    })
  }

  // Mobile: close panel when scenario changes (keeps canvas visible)
  document.getElementById('scenarioSelect').addEventListener('change',()=>{
    if(window.innerWidth<=640)
      document.getElementById('panel').classList.remove('open')
  })
}

// ── Lesson system ─────────────────────────────────────────────────────────
let activeLesson = null
let activeLessonIdx = -1
let challengeActive = false
let hintIdx = 0

function initLessons(){
  if(typeof window.GAUSS_LESSONS === 'undefined') return
  const list = document.getElementById('lessonList')
  list.innerHTML = ''
  window.GAUSS_LESSONS.forEach((lesson, i) => {
    const stars = '★'.repeat(lesson.difficulty) + '☆'.repeat(4-lesson.difficulty)
    const div = document.createElement('div')
    div.className = 'lesson-item'
    div.innerHTML = `
      <span class="lesson-item-id">${lesson.id}</span>
      <span class="lesson-item-title">${lesson.title}</span>
      <span class="lesson-difficulty">${stars}</span>`
    div.addEventListener('click', () => selectLesson(i))
    list.appendChild(div)
  })
}

function selectLesson(idx){
  activeLessonIdx = idx
  activeLesson = window.GAUSS_LESSONS[idx]

  // Mark active item
  document.querySelectorAll('.lesson-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx)
  })

  loadLesson(activeLesson)
  showLessonDetail(activeLesson)
}

function loadLesson(lesson){
  // Set scenario
  sc = lesson.scenario
  document.getElementById('scenarioSelect').value = sc

  // Merge lesson params into p
  Object.assign(p, lesson.params)

  // Sync sliders + labels
  Object.entries(lesson.params).forEach(([k,v]) => {
    setSlider(k, v)
  })

  syncParamVisibility()
  render()
}

function showLessonDetail(lesson){
  document.getElementById('lessonList').style.display = 'none'
  const detail = document.getElementById('lessonDetail')
  detail.classList.remove('hidden')

  document.getElementById('lessonDetailId').textContent = lesson.id
  document.getElementById('lessonDetailTitle').textContent = lesson.title
  document.getElementById('lessonDetailObjective').textContent = lesson.objective
  document.getElementById('lessonDetailTheory').textContent = lesson.theory

  // Hints
  hintIdx = 0
  const hintsUl = document.getElementById('lessonDetailHints')
  hintsUl.innerHTML = ''
  const hintBtn = document.getElementById('btnNextHint')
  const hintsSection = document.getElementById('hintsSection')
  if(lesson.hints && lesson.hints.length > 0){
    hintsSection.style.display = ''
    lesson.hints.forEach(h => {
      const li = document.createElement('li'); li.textContent = h
      hintsUl.appendChild(li)
    })
    hintBtn.disabled = false
  } else {
    hintsSection.style.display = 'none'
  }

  // Questions
  const qList = document.getElementById('lessonDetailQuestions')
  qList.innerHTML = ''
  lesson.questions.forEach(q => {
    const li = document.createElement('li'); li.textContent = q
    qList.appendChild(li)
  })

  // Nav buttons
  document.getElementById('btnPrevLesson').disabled = activeLessonIdx <= 0
  document.getElementById('btnNextLesson').disabled = activeLessonIdx >= window.GAUSS_LESSONS.length - 1

  // Challenge button
  const chSection = document.getElementById('challengeSection')
  chSection.classList.toggle('hidden', !lesson.challenge)

  // Collapse all sections
  document.querySelectorAll('.collapsible-body').forEach(el => el.classList.add('hidden'))
}

function startChallenge(lesson){
  challengeActive = true
  const ch = lesson.challenge
  document.getElementById('challengeDesc').textContent = ch.description

  // Show target readout chips
  const r = ch.target_readout
  document.getElementById('tgt-Qenc').textContent = r.Qenc_nC.toFixed(2) + ' nC'
  document.getElementById('tgt-flux').textContent = r.flux_Nm2C.toFixed(1) + ' N·m²/C'
  document.getElementById('tgt-E').textContent = r.E_NC.toFixed(2) + ' N/C'

  document.getElementById('challengeBar').classList.remove('hidden')
  document.getElementById('scoreDisplay').classList.add('hidden')
  render()
}

function exitChallenge(){
  challengeActive = false
  document.getElementById('challengeBar').classList.add('hidden')
  document.getElementById('scoreDisplay').classList.add('hidden')
  render()
}

function evaluateChallenge(){
  if(!activeLesson || !activeLesson.challenge) return
  const ch = activeLesson.challenge
  const tgt = ch.target_readout
  const tol = ch.tolerance || 0.08
  const scen = S[sc]

  const Qenc_s = Math.abs(scen.getQenc(p.rg))
  const E_s    = scen.getE(p.rg)
  const Flux_s = Math.abs(Qenc_s / EPS0)

  const Qenc_t = Math.abs(tgt.Qenc_nC) * 1e-9
  const E_t    = Math.abs(tgt.E_NC)
  const Flux_t = Math.abs(tgt.flux_Nm2C)

  let score = 100

  if(Qenc_t > 1e-20){
    const dQ = Math.abs(Qenc_s - Qenc_t) / Qenc_t
    score -= Math.round(40 * Math.min(1, dQ / tol))
  }
  if(E_t > 0.01){
    const dE = Math.abs(E_s - E_t) / E_t
    score -= Math.round(40 * Math.min(1, dE / tol))
  }
  if(Flux_t > 0.1){
    const dF = Math.abs(Flux_s - Flux_t) / Flux_t
    score -= Math.round(20 * Math.min(1, dF / tol))
  }

  score = Math.max(0, score)

  const el = document.getElementById('scoreDisplay')
  const sv = document.getElementById('scoreValue')
  el.classList.remove('hidden','good','ok','poor')
  sv.textContent = score
  if(score >= 85) el.classList.add('good')
  else if(score >= 60) el.classList.add('ok')
  else el.classList.add('poor')
}

// Draw ghost Gaussian surface during challenge mode
function drawChallengeGhost(){
  if(!challengeActive || !activeLesson || !activeLesson.challenge) return
  const ch = activeLesson.challenge
  const rg_t = ch.target_rg
  if(!rg_t) return

  const scen = S[sc]
  const sym = scen.sym
  if(sym==='spherical'||sym==='cylindrical'||sym==='magnetic'){
    const r_px = rg_t * SCALE
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, TAU)
    ctx.strokeStyle = 'rgba(255,152,0,0.7)'; ctx.lineWidth = 1.5
    ctx.setLineDash([6,8]); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,152,0,0.6)'; ctx.font = '10px Inter'
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`objetivo: ${rg_t.toFixed(1)} m`, cx + r_px * 0.7, cy + r_px * 0.7 + 10)
  } else if(sym==='planar'){
    const pillW = Math.min(W*0.38, 200)
    const pillH_px = rg_t * SCALE
    let centerY = sc==='capacitor' ? cy - p.d/2*SCALE : cy
    const left = cx - pillW/2, top = centerY - pillH_px, bot = centerY + pillH_px
    ctx.strokeStyle = 'rgba(255,152,0,0.7)'; ctx.lineWidth = 1.5
    ctx.setLineDash([6,8]); ctx.strokeRect(left, top, pillW, pillH_px*2); ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,152,0,0.6)'; ctx.font = '10px Inter'
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`objetivo h: ${rg_t.toFixed(1)} m`, left + pillW + 6, (top+bot)/2)
  }
}

// ── Lesson event listeners ────────────────────────────────────────────────
function initLessonEvents(){
  if(typeof window.GAUSS_LESSONS === 'undefined') return

  document.getElementById('btnToggleLessons').addEventListener('click', () => {
    const panel = document.getElementById('lessonPanel')
    const btn   = document.getElementById('btnToggleLessons')
    const open  = panel.classList.contains('hidden')
    panel.classList.toggle('hidden', !open)
    btn.classList.toggle('hidden', open)
  })
  document.getElementById('btnCloseLessons').addEventListener('click', () => {
    document.getElementById('lessonPanel').classList.add('hidden')
    document.getElementById('btnToggleLessons').classList.remove('hidden')
  })
  document.getElementById('btnCloseLesson').addEventListener('click', () => {
    document.getElementById('lessonDetail').classList.add('hidden')
    document.getElementById('lessonList').style.display = ''
  })
  document.getElementById('btnPrevLesson').addEventListener('click', () => {
    if(activeLessonIdx > 0) selectLesson(activeLessonIdx - 1)
  })
  document.getElementById('btnNextLesson').addEventListener('click', () => {
    if(activeLessonIdx < window.GAUSS_LESSONS.length - 1) selectLesson(activeLessonIdx + 1)
  })
  document.getElementById('btnNextHint').addEventListener('click', () => {
    const items = document.querySelectorAll('#lessonDetailHints li')
    if(hintIdx < items.length){
      items[hintIdx].classList.add('revealed')
      hintIdx++
      if(hintIdx >= items.length) document.getElementById('btnNextHint').disabled = true
    }
  })
  document.getElementById('btnStartChallenge').addEventListener('click', () => {
    if(activeLesson && activeLesson.challenge) startChallenge(activeLesson)
  })
  document.getElementById('btnEvaluate').addEventListener('click', evaluateChallenge)
  document.getElementById('btnExitChallenge').addEventListener('click', exitChallenge)

  document.querySelectorAll('.collapsible-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target)
      if(target) target.classList.toggle('hidden')
    })
  })
}

// ── Patch render to include ghost + init lessons ──────────────────────────
const _renderOrig = render
window._renderOrig = _renderOrig
render = function(){
  _renderOrig()
  if(challengeActive) drawChallengeGhost()
}

// ── Init ──────────────────────────────────────────────────────────────────
function init(){
  syncParamVisibility()
  Object.entries({Q:p.Q,R:p.R,rg:p.rg,lam:p.lam,sig:p.sig,d:p.d,yoff:p.yoff})
    .forEach(([k,v])=>updateSliderLabel(k,v))
  initEvents()
  initLessons()
  initLessonEvents()
  resize()
}

init()
