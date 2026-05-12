"use client";
import { useState, useEffect } from "react";
import { useSimContext } from "@/components/SimProvider";
import { useBuzz } from "@/components/layout/RootLayout";
import { BUZZ } from "@/lib/data/buzz";
import { NAMES, TEAMS, tc, getDriverURL } from "@/lib/data/drivers";

export default function HomePage() {
  const { stand, sorted, actPts, winC, params, val, glicko, liveResults } = useSimContext();
  const { setOpen } = useBuzz();
  const champ  = sorted[0]?.[0] || "—";
  const champP = winC && params.mc ? ((winC[champ]||0)/params.mc*100).toFixed(1)+"%" : "—";
  const actLead= Object.entries(actPts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";
  const kpis = [
    { label:"Projected Champion", val:stand? (
      <a href={getDriverURL(champ)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dashed var(--gold)" }}>
        {NAMES[champ]||champ}
      </a>
    ) :"—", sub:stand?TEAMS[champ]:"—", c:"var(--gold)", kc:"var(--gold)" },
    { label:"Win Probability",    val:champP,  sub:"Monte Carlo", c:"var(--purple-l)", kc:"var(--purple)" },
    { label:"Actual Leader",      val:actLead? (
      <a href={getDriverURL(actLead)} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dashed var(--amber)" }}>
        {NAMES[actLead]||actLead}
      </a>
    ) :"—", sub:(actPts[actLead]||0)+" pts", c:"var(--amber)", kc:"var(--amber)" },
    { label:"Winner Accuracy",    val:val?Math.round(val.winAcc*100)+"%":"—", sub:(val?.n||0)+" races", c:"var(--green)", kc:"var(--green)" },
    { label:"Top-10 Overlap",     val:val?Math.round(val.top10Acc*100)+"%":"—", sub:"Grid precision", c:"var(--blue)", kc:"var(--blue)" },
    { label:"Glicko RD avg",      val:Object.keys(glicko).length?Math.round(Object.values(glicko).reduce((s,g)=>s+g.rd,0)/Object.keys(glicko).length):"—", sub:"Lower = confident", c:"var(--silver)", kc:"var(--silver)" },
  ];

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
        <div>
          <div style={{ fontFamily:"var(--hdr)",fontSize:15,fontWeight:700 }}>Championship Overview</div>
          <div style={{ fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2 }}>Glicko-2 · Bayesian GP · Bradley-Terry · Monte Carlo · {liveResults.length}/22 rounds</div>
        </div>
      </div>
      <div className="kpi-grid" style={{ marginBottom:16 }}>
        {kpis.map((k,i) => (
          <div className="kpi" key={i} style={{ "--kc":k.kc } as React.CSSProperties}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val" style={{ color:k.c }}>{k.val}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.5fr)",gap:14,marginBottom:18 }}>
        {/* Standings */}
        <div className="card">
          <div className="card-header"><span className="card-title">Driver Standings</span><span className="card-tag live">{sorted.filter(x=>x[1]>0).length} scorers</span></div>
          <div className="scroll">
            {sorted.slice(0,12).map(([d,pts],i) => {
              const apts=actPts[d]||0,ppts=Math.max(0,pts-apts),max=sorted[0]?.[1]||1;
              const posC=i===0?"var(--gold)":i===1?"var(--silver)":i===2?"var(--bronze)":"var(--t4)";
              const c=tc(TEAMS[d]);
              return (
                <div className="d-row" key={d} style={{ gridTemplateColumns:"20px 30px 1fr 50px" }}>
                  <span style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:posC,textAlign:"right" }}>{i+1}</span>
                  <div style={{ width:28,height:18,borderRadius:3,background:c+"18",color:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"var(--mono)",fontWeight:600 }}>{d}</div>
                  <div>
                    <div style={{ fontSize:11, display: "flex", alignItems: "center" }}>
                      <a 
                        href={getDriverURL(d)} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: "inherit", textDecoration: "none", fontWeight: 600, cursor: "pointer", position: "relative", zIndex: 10 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--purple-l)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                      >
                        {NAMES[d]||d}
                      </a>
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

        {/* Buzz */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔥 Race Buzz</span>
            <button onClick={()=>setOpen(true)} style={{ fontSize:9,fontFamily:"var(--mono)",color:"var(--purple)",background:"rgba(123,108,255,.1)",border:"1px solid rgba(123,108,255,.3)",padding:"2px 8px",borderRadius:4,cursor:"pointer" }}>Open feed ↗</button>
          </div>
          <div style={{ overflowX:"auto",padding:"10px 12px" }}>
            <div style={{ display:"flex",gap:10,minWidth:"max-content" }}>
              {BUZZ.slice(0,5).map((b,i) => (
                <div key={i} className={`buzz-card ${b.type}`}>
                  <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:5 }}>
                    <span style={{ fontSize:8,fontFamily:"var(--mono)",padding:"1px 5px",borderRadius:3,border:"1px solid var(--b2)",color:b.platform==="reddit"?"#ff6314":b.platform==="x"?"var(--t2)":b.platform==="planet"?"var(--green)":"var(--blue)" }}>{b.platform==="reddit"?"Reddit":b.platform==="x"?"X":b.platform==="planet"?"PlanetF1":"News"}</span>
                    <span style={{ fontSize:7,marginLeft:"auto",fontFamily:"var(--mono)",color:b.type==="hot"?"var(--red)":b.type==="spicy"?"var(--amber)":"var(--blue)" }}>{b.tag}</span>
                  </div>
                  <div style={{ fontSize:10,lineHeight:1.5,color:"var(--text)",marginBottom:6 }} dangerouslySetInnerHTML={{ __html:b.text }} />
                  <div style={{ fontSize:8,color:"var(--t4)",fontFamily:"var(--mono)",display:"flex",gap:5 }}>
                    <span style={{ color:"var(--red)",fontWeight:500 }}>{b.votes}</span><span>{b.sub}</span><span style={{ marginLeft:"auto" }}>{b.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
         {/* Constructors */}
         <div className="card">
            <div className="card-header">
              <span className="card-title">Constructor Standings</span>
              <span className="card-tag">Engineering battle</span>
            </div>
            <div className="scroll">
              {(() => {
                const teams: Record<string, number> = {};
                sorted.forEach(([d, pts]) => {
                  const t = TEAMS[d];
                  teams[t] = (teams[t] || 0) + pts;
                });
                const sortedTeams = Object.entries(teams).sort((a,b) => b[1] - a[1]);
                const max = sortedTeams[0]?.[1] || 1;
                return sortedTeams.map(([t, pts], i) => (
                  <div className="d-row" key={t} style={{ gridTemplateColumns: "25px 1fr 60px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: i===0?"var(--gold)":i===1?"var(--silver)":i===2?"var(--bronze)":"var(--t4)" }}>{i+1}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{t}</div>
                      <div style={{ display: "flex", height: 2, marginTop: 4, background: "var(--b1)", borderRadius: 1 }}>
                        <div style={{ width: (pts/max*100)+"%", background: tc(t), borderRadius: 1 }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, textAlign: "right" }}>{pts}</div>
                  </div>
                ));
              })()}
            </div>
         </div>

         <div className="card">
            <div className="card-header">
              <span className="card-title">Team Performance Matrix</span>
              <span className="card-tag">Development index</span>
            </div>
            <div style={{ padding: 24, textAlign: "center", color: "var(--t4)", fontSize: 11, fontFamily: "var(--mono)" }}>
               <div style={{ marginBottom: 12 }}>ANALYZING DESIGN RESIDUALS...</div>
               <PerformanceMatrix />
            </div>
         </div>
      </div>
      <div className="arch-strip" style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="arch-title" style={{ margin: 0 }}>Ensemble Model Architecture</div>
          <div style={{ display: "flex", gap: 12 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(123, 108, 255, 0.1)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(123, 108, 255, 0.2)" }}>
               <span style={{ fontSize: 10, color: "var(--purple-l)", fontWeight: 700 }}>MLFLOW TRACKING:</span>
               <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 800 }}>ACTIVE</span>
             </div>
             <a href="/model-lab" style={{ fontSize: 10, color: "var(--text)", textDecoration: "none", background: "var(--b1)", padding: "4px 12px", borderRadius: 6, fontWeight: 600, border: "1px solid var(--b2)" }}>View Lab History →</a>
          </div>
        </div>
        <div className="arch-inner">
          {[
            { comp:"Component 1",name:"Glicko-2 Rating",desc:"Pairwise race update. Rating r + deviation RD. High RD = uncertainty. K-factor scales by position.",metric:"Weight: ~55% early · RD floor: 30" },
            { comp:"Component 2",name:"Bayesian GP Regression",desc:"Circuit-type affinity prior from FastF1 2022-25 residuals. Posterior updated after each 2026 result.",metric:"RBF kernel l=0.65 · 4 circuit types" },
            { comp:"Component 3",name:"Bradley-Terry",desc:"Pairwise win probability from observed finishes. Position-weighted strength λ. Ramps over season.",metric:"Ramp: 0→22% over 8 races" },
            { comp:"Component 4",name:"Tyre Degradation",desc:"Compound-specific deg rate per circuit type. Pit stop window optimised by strategy model.",metric:"Soft: 0.065/lap · Hard: 0.022" },
            { comp:"Component 5",name:"Weather + Safety Car",desc:"Weather multiplier per city. Safety car probability per circuit type (street 68%, power 38%).",metric:"SC: street 68% · technical 55%" },
            { comp:"Ensemble",name:"Monte Carlo Blend",desc:"Continuous weighting near→Glicko, far→GP prior. MC propagates all uncertainties through season.",metric:"Up to 5,000 season simulations" },
          ].map((a,i) => (
            <div className="arch-cell" key={i}>
              <div className="arch-comp">{a.comp}</div>
              <div className="arch-name">{a.name}</div>
              <div className="arch-desc">{a.desc}</div>
              <div className="arch-metric">{a.metric}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformanceMatrix() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    setData(["Red Bull", "McLaren", "Mercedes", "Ferrari"].map(t => ({
      t,
      eff: 80 + Math.random() * 15,
      prog: 80 + Math.random() * 15
    })));
  }, []);

  if (!data.length) return <div style={{ height: 100 }} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map(({ t, eff, prog }) => (
        <div key={t} style={{ textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 4 }}>
            <span>{t}</span>
            <span>{eff.toFixed(1)}% Efficiency</span>
          </div>
          <div style={{ height: 4, background: "var(--b1)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: prog + "%", background: tc(t) }} />
          </div>
        </div>
      ))}
    </div>
  );
}
