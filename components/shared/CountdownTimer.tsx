"use client";
import { useState, useEffect } from "react";
import type { Circuit } from "@/lib/data/calendar";

export function CountdownTimer({ nextRace }: { nextRace: Circuit }) {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0 });
  const [session, setSession] = useState("Race");
  const pad = (n: number) => String(n).padStart(2,"0");

  useEffect(() => {
    if (!nextRace.dt) return;
    
    // Calculate session targets (mocked offsets from Race day)
    const dt = new Date(nextRace.dt + "T15:00:00");
    const sessions = [
      { name: "FP1", date: new Date(dt.getTime() - 2 * 86400000 - 3600000) },
      { name: "Qualifying", date: new Date(dt.getTime() - 1 * 86400000) },
      { name: "Race", date: dt },
    ];

    const tick = () => {
      const now = Date.now();
      // Find next active session
      let target = sessions.find(s => s.date.getTime() > now);
      if (!target) target = sessions[2]; // fallback to race if all passed
      
      setSession(target.name);
      
      const diff = target.date.getTime() - now;
      if (diff <= 0) { setTime({d:0,h:0,m:0,s:0}); return; }
      setTime({
        d: Math.floor(diff/86400000),
        h: Math.floor((diff%86400000)/3600000),
        m: Math.floor((diff%3600000)/60000),
        s: Math.floor((diff%60000)/1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRace]);

  const TYPE_LABEL: Record<string,string> = {
    power:"Power", street:"Street", technical:"Technical", hybrid:"Hybrid",
  };

  return (
    <div style={{
      background:"var(--s1)", border:"1px solid var(--b1)", borderRadius:12,
      padding:"16px 20px", display:"flex", alignItems:"center", gap:20,
      flexWrap:"wrap", boxShadow: "var(--shadow-sm)"
    }}>
      {/* Race Info */}
      <div style={{ flex:1, minWidth:200 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize:10, color:"var(--t3)", letterSpacing:".04em", textTransform:"uppercase", fontWeight:600 }}>
            Round {nextRace.r}
          </span>
          {nextRace.sprint && (
            <span style={{ fontSize:9, fontFamily:"var(--mono)", color:"var(--amber)", border:"1px solid rgba(245,158,11,.3)", background:"rgba(245,158,11,.08)", padding:"2px 6px", borderRadius:4, fontWeight:600 }}>
              SPRINT
            </span>
          )}
        </div>
        <div style={{ fontSize:18, fontWeight:700, letterSpacing:"-.02em", color: "var(--text)" }}>
          {nextRace.n} Grand Prix
        </div>
        <div style={{ fontSize:11, color:"var(--t3)", marginTop:4, display:"flex", gap:8, alignItems: "center" }}>
          <span>{nextRace.loc}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--b2)" }} />
          <span>{TYPE_LABEL[nextRace.type] || nextRace.type}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--b2)" }} />
          <span>{nextRace.km}km/lap</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <a 
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=F1+${nextRace.n}+Grand+Prix`}
          target="_blank" rel="noopener noreferrer"
          style={{ 
            padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text)", 
            background: "var(--s0)", border: "1px solid var(--b2)", cursor: "pointer",
            transition: "background .15s", textDecoration: "none", display: "inline-block"
          }}
        >
          📅 Set Reminder
        </a>
        <a 
          href="https://f1tv.formula1.com/"
          target="_blank" rel="noopener noreferrer"
          style={{ 
            padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#fff", 
            background: "var(--red)", border: "none", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(255,59,92,.25)", textDecoration: "none", display: "inline-block"
          }}
        >
          ▶ Watch Live
        </a>
      </div>

      {/* Countdown */}
      {nextRace.dt ? (
        <div style={{ background: "var(--s0)", border: "1px solid var(--b1)", borderRadius: 8, padding: "8px 16px", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ paddingRight: 16, borderRight: "1px solid var(--b1)", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>Next Session</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--purple)", fontFamily: "var(--font)" }}>{session}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            {[
              { v: time.d, l:"D" },
              { v: time.h, l:"H" },
              { v: time.m, l:"M" },
              { v: time.s, l:"S" },
            ].map(({ v, l }, i) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                {i > 0 && <span style={{ fontSize:18, color:"var(--b2)", fontFamily:"var(--mono)", fontWeight:300, marginBottom:4 }}>:</span>}
                <div style={{ textAlign:"center", width: l === "D" ? "auto" : 24 }}>
                  <div className="cd-num" style={{ fontSize: 20 }}>{l==="D" ? v : pad(v)}</div>
                  <div style={{ fontSize:8, fontFamily:"var(--mono)", color:"var(--t3)", letterSpacing:".1em", textTransform:"uppercase", marginTop:2 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--mono)" }}>Date TBD</div>
      )}
    </div>
  );
}
