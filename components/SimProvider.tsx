"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { fetchLiveResults, type DataSource } from "@/lib/api";
import type { RaceData } from "@/lib/data/drivers";
import { DRV } from "@/lib/data/drivers";
import { computeGlicko, computeBT, computeForm, buildActualPts, type GlickoRatings } from "@/lib/simulation/glicko";
import { runSeason, validate, DEFAULT_PARAMS, type SimParams } from "@/lib/simulation/ensemble";

interface SimContextValue {
  liveResults: RaceData[];
  dataSource: DataSource;
  params: SimParams;
  setParams: (p: SimParams) => void;
  glicko: GlickoRatings;
  bt: Record<string, number>;
  form: Record<string, number>;
  stand: Record<string, number> | null;
  traj: Record<string, number>[] | null;
  winC: Record<string, number> | null;
  val: ReturnType<typeof validate> | null;
  running: boolean;
  runSim: () => void;
  actPts: Record<string, number>;
  sorted: [string, number][];
}

const SimContext = createContext<SimContextValue | null>(null);
export const useSimContext = () => {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimContext outside SimProvider");
  return ctx;
};

export function SimProvider({ children }: { children: React.ReactNode }) {
  const [liveResults, setLiveResults] = useState<RaceData[]>([]);
  const [dataSource,  setDataSource]  = useState<DataSource>("loading");
  const [params,      setParams]      = useState<SimParams>(DEFAULT_PARAMS);
  const [glicko, setGlicko] = useState<GlickoRatings>({});
  const [bt,     setBT]     = useState<Record<string, number>>({});
  const [form,   setForm]   = useState<Record<string, number>>({});
  const [stand,  setStand]  = useState<Record<string, number> | null>(null);
  const [traj,   setTraj]   = useState<Record<string, number>[] | null>(null);
  const [winC,   setWinC]   = useState<Record<string, number> | null>(null);
  const [val,    setVal]    = useState<ReturnType<typeof validate> | null>(null);
  const [running, setRunning] = useState(false);

  // Load live data and refresh it every minute
  useEffect(() => {
    const load = () => {
      fetchLiveResults().then(({ data, source }) => {
        setLiveResults(data);
        setDataSource(source);
      });
    };
    load();
    const interval = setInterval(load, 300_000); // 5 min refresh (lighter load)
    return () => clearInterval(interval);
  }, []);

  // Compute models when data arrives
  useEffect(() => {
    if (!liveResults.length && dataSource === "loading") return;
    setGlicko(computeGlicko(liveResults));
    setBT(computeBT(liveResults));
    setForm(computeForm(liveResults));
  }, [liveResults, dataSource]);

  // Auto-run simulation once models ready
  useEffect(() => {
    if (Object.keys(glicko).length > 0) runSimInternal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glicko]);

  const runSimInternal = useCallback(() => {
    if (!Object.keys(glicko).length) return;
    setRunning(true);
    setTimeout(() => {
      const main = runSeason(params, liveResults, glicko, bt, form);
      setStand(main.rp);
      setTraj(main.traj);
      const wc: Record<string, number> = {};
      DRV.forEach(d => (wc[d] = 0));
      let done = 0;
      const step = () => {
        const end = Math.min(done + 300, params.mc);
        for (let i = done; i < end; i++) {
          const s = runSeason(params, liveResults, glicko, bt, form);
          const ch = Object.entries(s.rp).sort((a, b) => b[1] - a[1])[0][0];
          wc[ch]++;
        }
        done = end;
        if (done < params.mc) { setTimeout(step, 0); }
        else {
          setWinC({ ...wc });
          const validation = validate(params, liveResults, glicko, bt, form);
          setVal(validation);
          setRunning(false);

          // Track to MLflow
          const topDrivers = Object.entries(wc)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([d, count]) => ({ code: d, prob: count / params.mc }));

          console.log("Reporting simulation to MLflow Tracking Server...");
          fetch("http://localhost:8000/track/sim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              params: { ...params },
              metrics: {
                win_accuracy: validation.winAcc,
                top_10_accuracy: validation.top10Acc,
                mc_runs: params.mc,
                champ_prob: topDrivers[0]?.prob || 0
              },
              top_drivers: topDrivers,
              timestamp: Date.now() / 1000
            })
          })
          .then(res => res.json())
          .then(res => console.log("MLflow Tracking Success. Run ID:", res.run_id))
          .catch(err => console.error("MLflow Tracking Error:", err));
        }
      };
      step();
    }, 20);
  }, [params, liveResults, glicko, bt, form]);

  const actPts = useMemo(() => buildActualPts(liveResults), [liveResults]);
  const sorted = useMemo(() =>
    stand ? Object.entries(stand).sort((a, b) => b[1] - a[1]) : [],
    [stand]
  );

  return (
    <SimContext.Provider value={{
      liveResults, dataSource, params, setParams,
      glicko, bt, form, stand, traj, winC, val,
      running, runSim: runSimInternal, actPts, sorted,
    }}>
      {children}
    </SimContext.Provider>
  );
}
