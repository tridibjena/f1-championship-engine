"use client";
import { useRef, useEffect } from "react";
import { tc, TEAMS } from "@/lib/data/drivers";

export function WinProbCanvas({ winC, mc }: { winC: Record<string,number>; mc: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current || !winC || !mc) return;
    const cv = ref.current;
    cv.width = (cv.parentElement?.offsetWidth || 400) - 24;
    const ctx = cv.getContext("2d")!, W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H);
    const sorted = Object.entries(winC).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,10);
    if (!sorted.length) return;
    const pad={t:8,r:56,b:8,l:46};
    const bH = Math.floor((H-pad.t-pad.b)/sorted.length)-3;
    const maxP = sorted[0][1]/mc, cW = W-pad.l-pad.r;
    sorted.forEach(([d,cnt],i) => {
      const p=cnt/mc, y=pad.t+i*(bH+3), bW=Math.max(2,(p/maxP)*cW), c=tc(TEAMS[d]);
      ctx.fillStyle="rgba(255,255,255,.02)";ctx.fillRect(pad.l,y,cW,bH);
      const gr=ctx.createLinearGradient(pad.l,0,pad.l+bW,0);
      gr.addColorStop(0,c+"ee");gr.addColorStop(1,c+"22");
      ctx.fillStyle=gr;ctx.fillRect(pad.l,y,bW,bH);
      ctx.fillStyle=c;ctx.fillRect(pad.l,y+bH-1,bW,1);
      ctx.fillStyle=i===0?c:"#484860";ctx.font="bold 9px DM Mono";
      ctx.textAlign="right";ctx.fillText(d,pad.l-4,y+bH*.72);ctx.textAlign="left";
      ctx.fillStyle=i===0?c:"#333350";ctx.font="9px DM Mono";
      ctx.fillText((p*100).toFixed(1)+"%",pad.l+bW+4,y+bH*.72);
    });
  }, [winC, mc]);
  return <canvas ref={ref} height={256} style={{ padding:"10px 12px",display:"block",width:"100%" }} />;
}
