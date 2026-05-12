"use client";
import { useRef, useEffect } from "react";
import { tc, TEAMS } from "@/lib/data/drivers";

export function TrajCanvas({ stand, traj, liveLen, drivers }: {
  stand: Record<string,number>; traj: Record<string,number>[];
  liveLen: number; drivers: string[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !traj || !drivers) return;
    const cv = ref.current;
    cv.width = (cv.parentElement?.offsetWidth || 600) - 28;
    const ctx = cv.getContext("2d")!, W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H);
    const races=traj.length, pad={t:10,r:65,b:28,l:32};
    const cW=W-pad.l-pad.r, cH=H-pad.t-pad.b;
    const maxP=Math.max(...drivers.map(d=>traj[races-1]?.[d]||0))||1;

    if(liveLen>0){
      const dx=pad.l+(liveLen/races)*cW;
      ctx.fillStyle="rgba(16,217,138,.018)";ctx.fillRect(pad.l,pad.t,dx-pad.l,cH);
      ctx.strokeStyle="rgba(16,217,138,.18)";ctx.lineWidth=1;ctx.setLineDash([3,4]);
      ctx.beginPath();ctx.moveTo(dx,pad.t);ctx.lineTo(dx,pad.t+cH);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle="rgba(16,217,138,.5)";ctx.font="9px DM Sans";ctx.fillText("Actual",pad.l+4,pad.t+10);
      ctx.fillStyle="rgba(255,255,255,.15)";ctx.fillText("Projected",dx+4,pad.t+10);
    }
    for(let g=0;g<=5;g++){
      const y=pad.t+cH*(1-g/5);
      ctx.strokeStyle="#1a1a22";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cW,y);ctx.stroke();
      ctx.fillStyle="#2a2a38";ctx.font="8px DM Mono";ctx.textAlign="right";ctx.fillText(String(Math.round(g/5*maxP)),pad.l-4,y+3);
    }
    ctx.textAlign="left";
    const draw=(dList:string[],alpha:number)=>dList.forEach(d=>{
      const di=drivers.indexOf(d),c=tc(TEAMS[d]);
      ctx.strokeStyle=c;ctx.lineWidth=di<3?2.2:1.3;ctx.globalAlpha=alpha;
      ctx.beginPath();let s=false;
      for(let ri=0;ri<races;ri++){
        const p=traj[ri]?.[d]||0,x=pad.l+(ri/(races-1))*cW,y=pad.t+cH-(p/maxP)*cH;
        s?ctx.lineTo(x,y):(ctx.moveTo(x,y),s=true);
      }
      ctx.stroke();ctx.globalAlpha=1;
    });
    draw(drivers.slice(3),.3);draw(drivers.slice(0,3),1);
    if(liveLen>0)drivers.forEach((d,di)=>{
      const c=tc(TEAMS[d]);ctx.globalAlpha=di<3?.9:.3;
      for(let ri=0;ri<Math.min(liveLen,races);ri++){
        const p=traj[ri]?.[d]||0,x=pad.l+(ri/(races-1))*cW,y=pad.t+cH-(p/maxP)*cH;
        ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,di<3?3:2,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    });
    drivers.forEach((d,di)=>{
      const c=tc(TEAMS[d]),lp=traj[races-1]?.[d]||0,y=pad.t+cH-(lp/maxP)*cH;
      ctx.globalAlpha=di<3?1:.5;ctx.fillStyle=c;ctx.font="bold 9px DM Mono";
      ctx.fillText(d,pad.l+cW+4,y+3);ctx.globalAlpha=1;
    });
  }, [stand, traj, liveLen, drivers]);

  return <canvas ref={ref} height={300} style={{ display:"block",width:"100%" }} />;
}
