"use client";
import { useMemo } from "react";
import type { Circuit } from "@/lib/data/calendar";

export function TrackCanvas({ circuit, height = 240 }: { circuit: Circuit; height?: number }) {
  const { path, mapped, brakePoints, drsZones, viewBox, meta } = useMemo(() => {
    const W = 600;
    const H = height;
    
    const seed = circuit.n.split("").reduce((s,c) => s+c.charCodeAt(0),0);
    const rng  = (i: number) => Math.sin(seed*i*0.139+i*2.71)*0.5+0.5;
    const tw   = ({power:0.82,street:0.60,technical:0.52,hybrid:0.70} as Record<string,number>)[circuit.type]||0.70;
    
    const N = 180; 
    const pts: {x:number;y:number;spd:number}[] = [];

    for(let i=0;i<N;i++){
      const t=i/N*Math.PI*2;
      let x=Math.cos(t)*195*tw+Math.sin(2*t)*56+Math.cos(3.7*t)*20+rng(i)*14-7;
      let y=Math.sin(t)*125*(1-tw*0.28)+Math.cos(2.2*t)*44+Math.sin(4.8*t)*14+rng(i+6)*13-6;
      if(circuit.type==="street"){x+=Math.sin(6.5*t)*24*Math.round(rng(i+4));y+=Math.cos(4.8*t)*19*Math.round(rng(i+7));}
      const cv2=Math.abs(Math.cos(t*2.5+seed*0.01));
      let spd=0.40+rng(i)*0.50;
      if(circuit.type==="power")spd=Math.min(1,spd+0.15);
      if(circuit.type==="street")spd=Math.max(0.06,spd-0.18);
      if(cv2<0.10)spd=Math.max(0.05,spd-0.54);
      pts.push({x,y,spd:Math.max(0.05,Math.min(1,spd))});
    }

    // Smooth speed and coordinates to eliminate wobbliness
    for(let k=0;k<6;k++) {
      for(let i=0;i<N;i++) {
        const p=pts, pp=p[(i-1+N)%N], pn=p[(i+1)%N];
        p[i].spd=(p[i].spd*2+pp.spd+pn.spd)/4;
        p[i].x=(p[i].x*2+pp.x+pn.x)/4;
        p[i].y=(p[i].y*2+pp.y+pn.y)/4;
      }
    }

    const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
    const mix = Math.min(...xs), mxx = Math.max(...xs), miy = Math.min(...ys), may = Math.max(...ys);
    const sc = Math.min((W-80)/(mxx-mix), (H-60)/(may-miy)) * 0.9;
    const ox = (W-(mxx-mix)*sc)/2 - mix*sc;
    const oy = (H-(may-miy)*sc)/2 - miy*sc;
    
    const mapped = pts.map(p => ({ x: p.x*sc+ox, y: p.y*sc+oy, spd: p.spd }));
    const d = `M ${mapped[0].x},${mapped[0].y} ` + mapped.slice(1).map(p => `L ${p.x},${p.y}`).join(" ") + " Z";

    // Dynamically calculate braking zones by finding areas of heavy deceleration
    const brakePoints = mapped.filter((p, i) => {
      const prev = mapped[(i - 4 + N) % N].spd;
      return prev - p.spd > 0.08 && p.spd < 0.35; // Significant drop in speed + slow corner
    });
    
    // Dynamically calculate DRS zones by finding areas of sustained high speed
    const drsZones = mapped.filter((p, i) => {
      const prev = mapped[(i - 6 + N) % N].spd;
      return p.spd > 0.70 && p.spd - prev > 0.05; // High speed + accelerating
    });

    return { 
      path: d, 
      mapped,
      brakePoints, 
      drsZones,
      viewBox: `0 0 ${W} ${H}`,
      meta: { W, H, start: mapped[0] }
    };
  }, [circuit, height]);

  return (
    <div style={{ position: "relative", width: "100%", height, background: "var(--s0)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--b1)" }}>
      {/* Title block inside map */}
      <div style={{ position: "absolute", top: 16, left: 20, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-.02em" }}>{circuit.n} Circuit</div>
        <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{circuit.loc}</span>
          <span style={{ width: 4, height: 4, background: "var(--b2)", borderRadius: "50%" }} />
          <span>{circuit.km}km/lap</span>
        </div>
      </div>

      {/* Map Legend */}
      <div style={{ position: "absolute", bottom: 16, left: 20, zIndex: 10, display: "flex", gap: 12, fontSize: 10, fontFamily: "var(--mono)", color: "var(--t3)", fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} /> BRAKING</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 3, background: "var(--green)" }} /> DRS ZONE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text)" }} /> START/FINISH</div>
      </div>

      <svg viewBox={viewBox} style={{ width: "100%", height: "100%" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outline track layer for depth */}
        <path d={path} fill="none" stroke="var(--b1)" strokeWidth="22" strokeLinejoin="round" opacity="0.3" />
        <path d={path} fill="none" stroke="var(--bg)" strokeWidth="18" strokeLinejoin="round" />
        
        {/* Heatmap Segmented Track */}
        {mapped.map((p, i) => {
          const next = mapped[(i + 1) % mapped.length];
          // Color mapping: 0 (Red) -> 0.5 (Yellow) -> 1.0 (Green)
          const s = p.spd;
          const r = s < 0.5 ? 255 : Math.round(255 * (1 - (s - 0.5) * 2));
          const g = s > 0.5 ? 255 : Math.round(255 * (s * 2));
          const col = `rgb(${r},${g},0)`;
          
          return (
            <line 
              key={`seg-${i}`}
              x1={p.x} y1={p.y} x2={next.x} y2={next.y}
              stroke={col}
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}

        {/* DRS Zones - Glowing translucent overlays */}
        {drsZones.map((p, i) => (
          <circle key={`drs-${i}`} cx={p.x} cy={p.y} r="8" fill="var(--green)" filter="url(#glow)" opacity="0.3" />
        ))}

        {/* Braking points - High visibility pulsing apex markers */}
        {brakePoints.map((p, i) => (
          <g key={`brk-${i}`}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--red)">
              <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Start/Finish line */}
        <g transform={`translate(${meta.start.x},${meta.start.y})`}>
          <rect x="-1" y="-12" width="2" height="24" fill="var(--text)" />
          <circle r="4" fill="var(--text)" stroke="var(--bg)" strokeWidth="1.5" />
        </g>

        {/* Animated telemetry tracker */}
        <circle r="5" fill="var(--purple)" filter="url(#glow)">
          <animateMotion dur="15s" repeatCount="indefinite" path={path} />
        </circle>
      </svg>
    </div>
  );
}
