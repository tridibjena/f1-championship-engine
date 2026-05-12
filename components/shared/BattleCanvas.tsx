"use client";
import { useRef, useEffect } from "react";
import { tc, TEAMS, DRV } from "@/lib/data/drivers";

export function BattleCanvas({ traj, liveLen, battleDrivers, hover }: {
  traj: Record<string,number>[]; liveLen: number; battleDrivers: string[]; hover: string | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !traj || !battleDrivers.length) return;
    const cv = ref.current;
    cv.width = cv.parentElement?.offsetWidth || 600;
    const ctx = cv.getContext("2d")!, W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H);
    const N = battleDrivers.length, races = traj.length;
    if (races < 2) return;
    const pad = { t:12, r:48, b:22, l:30 };
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
    const yP = (pos: number) => pad.t + ((pos - 1) / (N - 1)) * cH;
    const xR = (ri: number) => pad.l + (ri / (races - 1)) * cW;

    const positions = traj.map(rData => {
      const pts: Record<string,number> = {};
      DRV.forEach(d => (pts[d] = rData[d] || 0));
      const ranked = Object.entries(pts).sort((a,b) => b[1] - a[1]);
      const pm: Record<string,number> = {};
      ranked.forEach(([d],j) => (pm[d] = j + 1));
      return pm;
    });

    if (liveLen > 0) {
      const dx = xR(liveLen - 1);
      ctx.fillStyle = "rgba(16,217,138,.015)"; ctx.fillRect(pad.l,pad.t,dx-pad.l,cH);
      ctx.strokeStyle = "rgba(16,217,138,.12)"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(dx,pad.t); ctx.lineTo(dx,pad.t+cH); ctx.stroke(); ctx.setLineDash([]);
    }

    for (let rank = 1; rank <= N; rank++) {
      const y = yP(rank);
      ctx.strokeStyle = "#16162a"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
      ctx.fillStyle = "#28283c"; ctx.font = "8px DM Sans"; ctx.textAlign = "right";
      ctx.fillText("P"+rank, pad.l-4, y+3);
    }
    ctx.textAlign = "left";

    for (let ri = 0; ri < races; ri += 3) {
      const x = xR(ri);
      ctx.strokeStyle = "#12122a"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x,pad.t); ctx.lineTo(x,pad.t+cH); ctx.stroke();
    }

    battleDrivers.forEach(d => {
      const c = tc(TEAMS[d]), h = hover === d, anyH = hover !== null;
      ctx.strokeStyle = c; ctx.lineWidth = h ? 2.5 : 1.5;
      ctx.globalAlpha = h ? 1 : anyH ? .12 : .75;
      ctx.beginPath(); let s = false;
      for (let ri = 0; ri < races; ri++) {
        const pos = positions[ri]?.[d];
        if (!pos || pos > N) continue;
        const x = xR(ri), y = yP(pos);
        s ? ctx.lineTo(x,y) : (ctx.moveTo(x,y), s = true);
        if (ri < liveLen) {
          ctx.save(); ctx.globalAlpha = h ? 1 : anyH ? .12 : .85; ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(x,y,h ? 3.5 : 2.5,0,Math.PI*2); ctx.fill(); ctx.restore();
        }
      }
      ctx.stroke(); ctx.globalAlpha = 1;
      const lPos = positions[races-1]?.[d];
      if (lPos && lPos <= N) {
        ctx.fillStyle = h ? c : anyH ? "#252535" : c; ctx.globalAlpha = h ? 1 : anyH ? .18 : .85;
        ctx.font = "bold 9px DM Mono"; ctx.fillText(d, xR(races-1)+4, yP(lPos)+3); ctx.globalAlpha = 1;
      }
    });
  }, [traj, liveLen, battleDrivers, hover]);

  return <canvas ref={ref} height={260} style={{ display:"block",width:"100%" }} />;
}
