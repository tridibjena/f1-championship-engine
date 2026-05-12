"use client";
import { useState } from "react";
import { useSimContext } from "@/components/SimProvider";
import { BattleCanvas } from "@/components/shared/BattleCanvas";
import { NAMES, TEAMS, tc, DRV } from "@/lib/data/drivers";
import { CAL } from "@/lib/data/calendar";

export default function DriversPage() {
  const { stand, traj, liveResults, sorted, actPts } = useSimContext();
  const [battleHover, setBattleHover] = useState<string | null>(null);

  const topDrivers = sorted.slice(0, 8).map(x => x[0]);
  
  // Calculate Constructor Standings
  const cp: Record<string, number> = {};
  const acp: Record<string, number> = {};
  const dp: Record<string, string[]> = {};
  
  if (stand) {
    DRV.forEach(d => {
      const t = TEAMS[d];
      cp[t] = (cp[t] || 0) + (stand[d] || 0);
      acp[t] = (acp[t] || 0) + (actPts[d] || 0);
      if (!dp[t]) dp[t] = [];
      dp[t].push(d);
    });
  }
  const sortedC = Object.entries(cp).sort((a, b) => b[1] - a[1]);
  const maxC = sortedC[0]?.[1] || 1;

  return (
    <div>
      <div className="sec-hdr mb16">
        <span className="sec-title">Constructors & Drivers</span>
        <span className="sec-meta">Team standings and head-to-head position battles</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 14, marginBottom: 20 }}>
        {/* Constructors */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Constructor Championship</span>
            <span className="card-tag">Actual + Projected</span>
          </div>
          <div>
            {stand ? sortedC.map(([team, pts], i) => {
              const c = tc(team), posC = i === 0 ? "var(--gold)" : i === 1 ? "var(--silver)" : i === 2 ? "var(--bronze)" : "var(--text)";
              const atp = acp[team] || 0, ptp = Math.max(0, pts - atp);
              return (
                <div className="cstr-row" key={team}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: posC, width: 18 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ width: 2, height: 12, background: c, borderRadius: 1, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{team}</span>
                        {atp > 0 && <span style={{ fontSize: 9, color: "var(--green)", fontFamily: "var(--mono)" }}>{atp} actual</span>}
                      </div>
                      <div style={{ display: "flex", height: 2, gap: 1, borderRadius: 1, overflow: "hidden", marginBottom: 4 }}>
                        {atp > 0 && <div style={{ width: (atp / maxC * 100).toFixed(1) + "%", background: c }} />}
                        {ptp > 0 && <div style={{ width: (ptp / maxC * 100).toFixed(1) + "%", background: c + "30" }} />}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(dp[team] || []).map(d => (
                          <span key={d} style={{ fontSize: 9, fontFamily: "var(--mono)", color: c, background: c + "12", padding: "1px 5px", borderRadius: 3 }}>
                            {d} {stand[d] || 0}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: posC }}>{pts}</span>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--t4)", fontFamily: "var(--mono)", fontSize: 10 }}>Run simulation to view constructors</div>
            )}
          </div>
        </div>

        {/* Position Battle */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Position Battle</span>
            <span className="card-tag">{liveResults.length} actual + {CAL.filter(c => !c.cancelled).length - liveResults.length} projected</span>
          </div>
          {stand && traj ? (
            <>
              <BattleCanvas traj={traj} liveLen={liveResults.length} battleDrivers={topDrivers} hover={battleHover} />
              <div className="battle-legend">
                {topDrivers.map(d => (
                  <div className="bl-item" key={d} onMouseEnter={() => setBattleHover(d)} onMouseLeave={() => setBattleHover(null)}>
                    <div className="bl-dot" style={{ background: tc(TEAMS[d]) }} />
                    <span style={{ color: tc(TEAMS[d]) }}>{d}</span>
                    {(NAMES[d] || "").split(" ").pop()}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t4)", fontFamily: "var(--mono)", fontSize: 10 }}>Run simulation to view battle</div>
          )}
        </div>
      </div>
    </div>
  );
}
