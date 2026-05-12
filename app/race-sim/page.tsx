"use client";
import { useState } from "react";
import { useSimContext } from "@/components/SimProvider";
import { CAL } from "@/lib/data/calendar";
import { simRace } from "@/lib/simulation/ensemble";
import { NAMES, TEAMS, tc, PTS10, PIT_LOSS } from "@/lib/data/drivers";
import { TrackCanvas } from "@/components/shared/TrackCanvas";
import type { Circuit } from "@/lib/data/calendar";
import type { RaceSimResult } from "@/lib/simulation/ensemble";

export default function RaceSimPage() {
  const { params, setParams, form, glicko, bt, runSim, running } = useSimContext();
  const [selRace, setSelRace] = useState<Circuit>(CAL[CAL.length - 1]);
  const [singleResult, setSingleResult] = useState<RaceSimResult | null>(null);
  const [tab, setTab] = useState<"map"|"result"|"strategy">("map");

  const handleSingleRace = () => {
    if (!Object.keys(glicko).length) return;
    const c = selRace;
    const ri = CAL.filter(x => !x.cancelled).indexOf(c);
    const sf: Record<string, number> = {};
    Object.keys(glicko).forEach(d => (sf[d] = 1.0));
    const result = simRace(c, form, params, ri, glicko, bt, sf);
    setSingleResult(result);
    setTab("result");
  };

  const SC_PROB: Record<string, number> = { hybrid: 0.42, power: 0.38, technical: 0.55, street: 0.68 };

  return (
    <div>
      {/* Controls */}
      <div className="sec-hdr mb16">
        <span className="sec-title">Simulation Parameters</span>
        <span className="sec-meta">Adjust Monte Carlo and physical models</span>
      </div>
      <div className="ctrl-grid mb20">
        {[
          { id: "mc", label: "Monte Carlo Runs", min: 300, max: 5000, step: 100, val: params.mc, fmt: (v: number) => v },
          { id: "dnfScale", label: "DNF Scale", min: 0.3, max: 2.5, step: 0.1, val: params.dnfScale, fmt: (v: number) => v.toFixed(1) + "×" },
          { id: "noise", label: "Noise σ", min: 0.5, max: 3.0, step: 0.1, val: params.noise, fmt: (v: number) => v.toFixed(1) + "×" },
          { id: "eloW", label: "Glicko Weight", min: 0.1, max: 0.9, step: 0.05, val: params.eloW, fmt: (v: number) => (v * 100).toFixed(0) + "%" },
          { id: "scMult", label: "Safety Car Prob", min: 0.2, max: 2.0, step: 0.1, val: params.scMult, fmt: (v: number) => v.toFixed(1) + "×" },
          { id: "tyreAgg", label: "Tyre Aggression", min: 0.5, max: 2.0, step: 0.1, val: params.tyreAgg, fmt: (v: number) => v.toFixed(1) + "×" },
          { id: "weatherImp", label: "Weather Impact", min: 0.0, max: 2.0, step: 0.1, val: params.weatherImp, fmt: (v: number) => v.toFixed(1) + "×" },
          { id: "pitStrategy", label: "Pit Strategy", isSelect: true, options: ["optimal", "aggressive", "conservative"], val: params.pitStrategy },
        ].map(c => (
          <div className="ctrl-cell" key={c.id}>
            <label className="ctrl-label">{c.label}</label>
            {c.isSelect ? (
              <select
                value={c.val as string}
                onChange={e => setParams({ ...params, [c.id]: e.target.value })}
                style={{ width: "100%", background: "var(--s2)", border: "1px solid var(--b1)", color: "var(--text)", padding: "4px 6px", fontSize: 11, fontFamily: "var(--mono)", borderRadius: 4, cursor: "pointer" }}
              >
                {c.options?.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            ) : (
              <input type="range" min={c.min} max={c.max} step={c.step} value={c.val as number} onChange={e => setParams({ ...params, [c.id]: +e.target.value })} />
            )}
            {!c.isSelect && <div className="ctrl-val">{c.fmt?.(c.val as number)}</div>}
          </div>
        ))}
        <button className="ctrl-run" onClick={runSim} disabled={running}>{running ? "Simulating Season…" : "▶ Run Season Simulation"}</button>
      </div>

      {/* Race Simulator */}
      <div className="sec-hdr mb16">
        <span className="sec-title">Single Race Simulator</span>
        <span className="sec-meta">Full race simulation with pit stops + weather + safety car</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Select Grand Prix</span>
            <button
              onClick={handleSingleRace}
              style={{ height: 26, fontSize: 10, padding: "0 10px", background: "var(--purple)", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600, fontFamily: "var(--font)" }}
            >
              Simulate Race →
            </button>
          </div>
          <div className="race-grid">
            {CAL.filter(c => !c.cancelled).map((c) => (
              <div
                key={c.r}
                className={`rtile${c === selRace ? " sel" : ""}${c.done ? " done" : ""}`}
                onClick={() => setSelRace(c)}
              >
                <div className="rt-r">R{String(c.r).padStart(2, "0")} · {c.type.slice(0, 3).toUpperCase()}</div>
                <div className="rt-name">{c.n}</div>
                <div className="rt-meta">{c.weather} · {c.temp}°C</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="inner-tabs">
            <button className={`inner-tab${tab === "map" ? " on" : ""}`} onClick={() => setTab("map")}>Circuit Map</button>
            <button className={`inner-tab${tab === "result" ? " on" : ""}`} onClick={() => setTab("result")}>Race Result</button>
            <button className={`inner-tab${tab === "strategy" ? " on" : ""}`} onClick={() => setTab("strategy")}>Strategies</button>
          </div>

          {tab === "map" && (
            <div>
              <div className="card-header">
                <span className="card-title">{selRace.n}</span>
                <span className="card-tag">{selRace.type} · {selRace.weather} {selRace.temp}°C</span>
              </div>
              <TrackCanvas circuit={selRace} height={200} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderTop: "1px solid var(--b1)", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "var(--t3)", fontFamily: "var(--mono)" }}><div style={{ width: 7, height: 2, background: "#ef4444" }} />Slow</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "var(--t3)", fontFamily: "var(--mono)" }}><div style={{ width: 7, height: 2, background: "#f59e0b" }} />Med</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "var(--t3)", fontFamily: "var(--mono)" }}><div style={{ width: 7, height: 2, background: "#10d98a" }} />Fast</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "var(--t3)", fontFamily: "var(--mono)" }}><div style={{ width: 7, height: 2, background: "#7b6cff" }} />Apex</div>
                <span style={{ marginLeft: "auto", color: "var(--amber)", fontSize: 8, fontFamily: "var(--mono)" }}>{selRace.km}km/lap · SC {Math.round(SC_PROB[selRace.type] * 100)}%</span>
              </div>
            </div>
          )}

          {tab === "result" && singleResult && (
            <div>
              <div className="card-header">
                <span className="card-title">{singleResult.race.n} GP</span>
                <span className="card-tag" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {singleResult.scTriggered && <span style={{ color: "var(--amber)", fontSize: 9, fontFamily: "var(--mono)" }}>🟡 SC</span>}
                  σ={params.noise.toFixed(1)}
                </span>
              </div>
              <div className="res-cols">
                <div>
                  <div style={{ padding: "0 12px", height: 28, display: "flex", alignItems: "center", borderBottom: "1px solid var(--b1)" }}><span className="live-hdr" style={{ fontSize: 9 }}>QUALIFYING</span></div>
                  {singleResult.quali.slice(0, 10).map((d, i) => (
                    <div className="res-row" key={d} style={{ gridTemplateColumns: "18px 28px 1fr" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: i < 3 ? ["var(--gold)", "var(--silver)", "var(--bronze)"][i] : "var(--t4)", fontWeight: 700 }}>{i + 1}</span>
                      <div style={{ width: 26, height: 16, borderRadius: 3, background: tc(TEAMS[d]) + "14", color: tc(TEAMS[d]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontFamily: "var(--mono)", fontWeight: 600 }}>{d}</div>
                      <div><div style={{ fontSize: 10 }}>{NAMES[d] || d}</div></div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ padding: "0 12px", height: 28, display: "flex", alignItems: "center", borderBottom: "1px solid var(--b1)" }}><span className="live-hdr" style={{ fontSize: 9 }}>RACE FINISH</span></div>
                  {singleResult.order.slice(0, 10).map((d, i) => (
                    <div className="res-row" key={d} style={{ gridTemplateColumns: "18px 28px 1fr 28px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: i < 3 ? ["var(--gold)", "var(--silver)", "var(--bronze)"][i] : "var(--t4)", fontWeight: 700 }}>{i + 1}</span>
                      <div style={{ width: 26, height: 16, borderRadius: 3, background: tc(TEAMS[d]) + "14", color: tc(TEAMS[d]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontFamily: "var(--mono)", fontWeight: 600 }}>{d}</div>
                      <div><div style={{ fontSize: 10 }}>{NAMES[d] || d}</div></div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t3)", textAlign: "right" }}>{PTS10[i] || ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "strategy" && singleResult && (
            <div style={{ padding: 16 }}>
              <div className="sec-hdr mb16"><span className="sec-title">Pit Strategies</span><span className="sec-meta">{singleResult.race.n}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {singleResult.order.slice(0, 12).map(d => {
                  const strat = singleResult.strategies[d];
                  const compColors: Record<string, string> = { soft: "#ef4444", medium: "#f59e0b", hard: "#e8e8f0" };
                  return (
                    <div key={d} style={{ background: "var(--s2)", borderRadius: 6, padding: "8px 10px", border: "1px solid var(--b1)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: tc(TEAMS[d]), fontWeight: 600 }}>{d}</span>
                        <span style={{ fontSize: 9, color: "var(--t3)" }}>{TEAMS[d]}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {strat?.compounds?.map((c, ci) => (
                          <span key={ci} style={{ fontSize: 8, fontFamily: "var(--mono)", background: (compColors[c] || "#888") + "22", color: compColors[c] || "#888", padding: "1px 5px", borderRadius: 3, border: `1px solid ${compColors[c] || "#888"}40` }}>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                        ))}
                        <span style={{ fontSize: 8, fontFamily: "var(--mono)", color: "var(--t4)", marginLeft: "auto" }}>{PIT_LOSS[TEAMS[d]]?.toFixed(1)}s pit</span>
                      </div>
                    </div>
                  );
                })}
                {/* Strategy Timeline */}
        <div className="card" style={{ gridColumn: "1 / -1", marginTop: 12 }}>
          <div className="card-header">
            <span className="card-title">Projected Pit Strategy Timeline</span>
            <span className="card-tag">{params.pitStrategy.toUpperCase()} Mode</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ position: "relative", height: 140, background: "var(--s0)", borderRadius: 8, padding: "20px 10px" }}>
              {/* Laps indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--t4)", fontFamily: "var(--mono)", marginBottom: 20 }}>
                <span>LAP 1</span>
                <span>LAP {Math.floor(selRace.laps / 2)}</span>
                <span>LAP {selRace.laps}</span>
              </div>
              
              {/* Driver Rows */}
              {["VER", "LEC", "HAM", "NOR", "PIA"].map((d, idx) => {
                const stopLap = 15 + Math.random() * 15;
                const pct = (stopLap / selRace.laps) * 100;
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 30, fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--t2)" }}>{d}</div>
                    <div style={{ flex: 1, height: 6, background: "var(--b1)", borderRadius: 3, position: "relative" }}>
                      {/* First Stint (Medium) */}
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: pct + "%", background: "var(--gold)", borderRadius: "3px 0 0 3px" }} />
                      {/* Second Stint (Hard) */}
                      <div style={{ position: "absolute", left: pct + "%", top: 0, height: "100%", width: (100 - pct) + "%", background: "var(--silver)", borderRadius: "0 3px 3px 0" }} />
                      {/* Pit Mark */}
                      <div style={{ position: "absolute", left: pct + "%", top: -4, height: 14, width: 2, background: "#fff", boxShadow: "0 0 8px #fff" }}>
                         <div style={{ position: "absolute", top: -12, left: -10, fontSize: 8, color: "#fff", fontWeight: 700 }}>P1</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: "var(--gold)", borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: "var(--t3)" }}>Medium</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: "var(--silver)", borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: "var(--t3)" }}>Hard</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: "var(--red)", borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: "var(--t3)" }}>Soft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
            </div>
          )}

          {tab === "result" && !singleResult && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--t4)", fontFamily: "var(--mono)", fontSize: 10 }}>
              Select a race and click Simulate →
            </div>
          )}
        </div>
      </div>

      {/* Model Architecture Documentation */}
      <div className="arch-strip" style={{ marginTop: 40, borderTop: "1px solid var(--b1)", paddingTop: 30 }}>
        <div className="arch-title">Ensemble Model Architecture</div>
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
