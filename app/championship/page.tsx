"use client";
import { useSimContext } from "@/components/SimProvider";
import { TrajCanvas } from "@/components/shared/TrajCanvas";
import { WinProbCanvas } from "@/components/shared/WinProbCanvas";
import { NAMES, TEAMS, tc } from "@/lib/data/drivers";

export default function ChampionshipPage() {
  const { stand, traj, liveResults, winC, params, sorted, actPts } = useSimContext();
  const topDrivers = sorted.slice(0, 8).map(x => x[0]);

  return (
    <div>
      <div className="sec-hdr mb16">
        <span className="sec-title">Championship Simulator</span>
        <span className="sec-meta">Projected trajectory and title probabilities</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)", gap:14, marginBottom:20 }}>
        {/* Trajectory */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Points Trajectory</span>
            <span className="card-tag">Top 8 · Actual + Projected</span>
          </div>
          <div style={{ padding:"12px 14px 8px" }}>
            {stand && traj ? (
              <TrajCanvas stand={stand} traj={traj} liveLen={traj.filter((_,i)=>i<liveResults.length).length} drivers={topDrivers} />
            ) : (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t4)", fontFamily: "var(--mono)", fontSize: 10 }}>
                Run simulation to view trajectory
              </div>
            )}
          </div>
        </div>

        {/* Win Probability */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Title Probability</span>
            <span className="card-tag">Monte Carlo {params.mc} runs</span>
          </div>
          {winC ? (
            <WinProbCanvas winC={winC} mc={params.mc} />
          ) : (
            <div style={{ height: 256, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t4)", fontFamily: "var(--mono)", fontSize: 10 }}>
              Run simulation to view probability
            </div>
          )}
        </div>
      </div>

      <div className="sec-hdr mb16">
        <span className="sec-title">Season Projection</span>
      </div>

      {/* Standings Projections */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Predicted Final Standings</span>
        </div>
        <div className="scroll">
            {sorted.map(([d,pts],i) => {
              const apts=actPts[d]||0, ppts=Math.max(0,pts-apts), max=sorted[0]?.[1]||1;
              const posC=i===0?"var(--gold)":i===1?"var(--silver)":i===2?"var(--bronze)":"var(--t4)";
              const c=tc(TEAMS[d]);
              return (
                <div className="d-row" key={d} style={{ gridTemplateColumns:"20px 30px 1fr 50px" }}>
                  <span style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:posC,textAlign:"right" }}>{i+1}</span>
                  <div style={{ width:28,height:18,borderRadius:3,background:c+"18",color:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"var(--mono)",fontWeight:600,border:`1px solid ${c}28` }}>{d}</div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:400 }}>{NAMES[d]||d}
                      {apts>0&&<span style={{ fontSize:9,color:"var(--green)",fontFamily:"var(--mono)",marginLeft:5 }}>{apts}pt</span>}
                    </div>
                    <div style={{ display:"flex",height:2,marginTop:4,gap:1 }}>
                      {apts>0&&<div style={{ width:(apts/max*100).toFixed(1)+"%",background:c,borderRadius:1,flexShrink:0 }}/>}
                      {ppts>0&&<div style={{ width:(ppts/max*100).toFixed(1)+"%",background:c+"30",borderRadius:1,flexShrink:0 }}/>}
                    </div>
                  </div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:16,fontWeight:700,textAlign:"right",color:posC }}>{pts}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
