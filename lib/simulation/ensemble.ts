import { DRV, TEAMS, GP0, TEAM_PACE, DNF_BASE, PIT_LOSS, PTS10 } from "@/lib/data/drivers";
import type { GlickoRatings } from "./glicko";
import { buildActualPts } from "./glicko";
import type { RaceData } from "@/lib/data/drivers";
import { CAL, type Circuit } from "@/lib/data/calendar";

// Safety car probability per circuit type
export const SC_PROB: Record<string, number> = {
  hybrid: 0.42, power: 0.38, technical: 0.55, street: 0.68,
};

// Weather multiplier on lap time
export const WEATHER_MULT: Record<string, number> = {
  sunny:1.000,overcast:1.000,cloudy:1.001,variable:1.003,cool:1.001,
  warm:1.000,hot:1.000,humid:1.002,windy:1.004,tropical:1.003,altitude:0.999,
};

// Tyre degradation rates per compound per circuit type
export const TYRE_DEG: Record<string, Record<string, number>> = {
  soft:  {hybrid:0.065,power:0.045,technical:0.080,street:0.090},
  medium:{hybrid:0.038,power:0.028,technical:0.045,street:0.052},
  hard:  {hybrid:0.022,power:0.016,technical:0.026,street:0.030},
};

export interface SimParams {
  mc: number;
  dnfScale: number;
  noise: number;
  eloW: number;
  scMult: number;
  tyreAgg: number;
  weatherImp: number;
  pitStrategy: "optimal" | "aggressive" | "conservative";
}

export const DEFAULT_PARAMS: SimParams = {
  mc: 2000, dnfScale: 1.0, noise: 1.0, eloW: 0.55,
  scMult: 1.0, tyreAgg: 1.0, weatherImp: 1.0, pitStrategy: "optimal",
};

export interface Strategy {
  stops: number;
  compounds: string[];
  windowLap: number;
}

export interface RaceSimResult {
  quali: string[];
  order: string[];
  scTriggered: boolean;
  strategies: Record<string, Strategy>;
  race: Circuit;
}

function randn(): number {
  let u: number, v: number;
  do { u = Math.random(); } while (!u);
  do { v = Math.random(); } while (!v);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function selectStrategy(circuit: Circuit): Strategy {
  if (circuit.type === "power" || circuit.type === "hybrid") {
    return { stops: 1, compounds: ["medium", "hard"], windowLap: Math.floor(20 + Math.random() * 8) };
  } else if (circuit.type === "street") {
    return { stops: 1, compounds: ["medium", "hard"], windowLap: Math.floor(25 + Math.random() * 10) };
  } else {
    return { stops: 2, compounds: ["soft", "medium", "hard"], windowLap: Math.floor(15 + Math.random() * 6) };
  }
}

function driverSigma(drv: string, glicko: GlickoRatings, noise: number): number {
  const rd = (glicko[drv] || { rd: 150 }).rd;
  const rdF = 0.8 + rd / 400;
  return Math.min(0.025, (DNF_BASE[drv] || 0.035) * 0.36 * rdF) * noise;
}

function ensemblePace(
  drv: string, circuit: Circuit, eloW: number, ri: number,
  glicko: GlickoRatings, bt: Record<string, number>,
  form: Record<string, number>, params: SimParams
): number {
  const g     = glicko[drv] || { r: 1600, rd: 150 };
  const rdP   = Math.max(0, 1 - g.rd / 300);
  const eloN  = Math.max(0, Math.min(1, (g.r - 1400) / 550)) * rdP;
  const aff   = (GP0[drv] || {})[circuit.type] || 1.0;
  const teamBase = TEAM_PACE[TEAMS[drv]] || 0.91;
  const gpScore  = teamBase * (1 + (aff - 1) * 0.65);
  const gpN      = Math.max(0, Math.min(1, (gpScore - 0.88) / 0.09));
  const btN      = Math.min(1, (bt[drv] || 0) * DRV.length);
  const dataW    = Math.min(1, ri / 8);
  const racesAhead = Math.max(0, ri - 3);
  const gpBoost  = Math.min(0.25, racesAhead * 0.012);
  const adjEloW  = Math.max(0.1, eloW - gpBoost);
  const btW      = dataW * 0.22;
  const eW       = adjEloW * (1 - btW);
  const gW       = Math.max(0.05, 1 - eW - btW);
  const baseScore = eW * eloN + btW * btN + gW * gpN;
  let pace = 1.038 - baseScore * 0.070;
  pace *= WEATHER_MULT[circuit.weather || "sunny"];
  pace *= 1 + randn() * driverSigma(drv, glicko, params.noise);
  return pace;
}

export function simRace(
  circuit: Circuit, form: Record<string, number>, params: SimParams,
  ri: number, glicko: GlickoRatings, bt: Record<string, number>,
  simForm: Record<string, number>
): RaceSimResult {
  const quali = DRV
    .map(d => [d, circuit.base * ensemblePace(d, circuit, params.eloW, ri, glicko, bt, form, params) * (1 + randn() * 0.0036)] as [string, number])
    .sort((a, b) => a[1] - b[1])
    .map(x => x[0]);
  const grid: Record<string, number> = {};
  quali.forEach((d, i) => (grid[d] = i + 1));

  const strategy: Record<string, Strategy> = {};
  DRV.forEach(d => { strategy[d] = selectStrategy(circuit); });

  const scTriggered = Math.random() < (SC_PROB[circuit.type] || 0.45) * params.scMult;

  const res: [string, number][] = [];
  for (const d of DRV) {
    let t = circuit.base * ensemblePace(d, circuit, params.eloW, ri, glicko, bt, form, params);
    t *= 1 + (grid[d] - 1) * 0.00006;
    t *= simForm[d] || 1.0;
    t *= form[d] || 1.0;
    const strat = strategy[d];
    const pitLoss = PIT_LOSS[TEAMS[d]] || 24;
    t += strat.stops * (pitLoss / 53);
    if (scTriggered && grid[d] > 12) t *= 0.996;
    const adjDNF = (DNF_BASE[d] || 0.035) * params.dnfScale;
    if (Math.random() < Math.min(adjDNF, 0.28)) t = Infinity;
    res.push([d, t]);
  }
  const order = res.sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const n = order.length;
  order.forEach((d, i) => {
    const tgt = i < n / 2 ? 0.996 : 1.003;
    simForm[d] = 0.93 * (simForm[d] || 1) + 0.07 * tgt;
  });
  return { quali, order, scTriggered, strategies: strategy, race: circuit };
}

export function matchRace(calName: string, apiName: string): boolean {
  const c = calName.toLowerCase().trim();
  const a = apiName.toLowerCase().replace(/ grand prix/i, "").trim();
  return c.includes(a) || a.includes(c) || c.split(" ")[0] === a.split(" ")[0];
}

export function runSeason(
  params: SimParams, liveResults: RaceData[],
  glicko: GlickoRatings, bt: Record<string, number>, form: Record<string, number>
): { rp: Record<string, number>; traj: Record<string, number>[] } {
  const actPts    = buildActualPts(liveResults);
  const compRounds = new Set(liveResults.map(r => r.round));
  const rp: Record<string, number> = {};
  DRV.forEach(d => (rp[d] = actPts[d] || 0));
  const nextR = compRounds.size > 0 ? Math.max(...compRounds) + 1 : 1;
  const simForm: Record<string, number> = {};
  DRV.forEach(d => (simForm[d] = 1.0));
  const traj: Record<string, number>[] = CAL.filter(c => !c.cancelled).map(() => ({}));
  const cumPts: Record<string, number> = {};
  DRV.forEach(d => (cumPts[d] = actPts[d] || 0));
  let trajI = 0;
  for (let ci = 0; ci < CAL.length; ci++) {
    const c = CAL[ci];
    if (c.cancelled) continue;
    if (c.r < nextR) { DRV.forEach(d => (traj[trajI][d] = cumPts[d])); trajI++; continue; }
    const ri = trajI;
    const { order } = simRace(c, form, params, ri, glicko, bt, simForm);
    order.slice(0, 10).forEach((d, i) => { if (rp[d] !== undefined) rp[d] += PTS10[i]; });
    DRV.forEach(d => { cumPts[d] = rp[d]; traj[ri][d] = rp[d]; });
    trajI++;
  }
  return { rp, traj };
}

export function validate(
  params: SimParams, liveResults: RaceData[],
  glicko: GlickoRatings, bt: Record<string, number>, form: Record<string, number>
): { winAcc: number; podAcc: number; top5Acc: number; top10Acc: number; n: number } {
  let wH = 0, pS = 0, t5S = 0, t10S = 0, n = 0;
  for (const res of liveResults) {
    const c = CAL.find(x => !x.cancelled && matchRace(x.n, res.raceName));
    if (!c) continue;
    const ri = CAL.filter(x => !x.cancelled).indexOf(c);
    const sf: Record<string, number> = {};
    DRV.forEach(d => (sf[d] = 1.0));
    const { order } = simRace(c, form, { ...params, noise: 0.8 }, ri, glicko, bt, sf);
    const act = res.results.map(r => r.driverCode);
    if (order[0] === act[0]) wH++;
    pS  += order.slice(0, 3).filter(d => act.slice(0, 3).includes(d)).length / 3;
    t5S += order.slice(0, 5).filter(d => act.slice(0, 5).includes(d)).length / 5;
    t10S+= order.slice(0, 10).filter(d => act.slice(0, 10).includes(d)).length / 10;
    n++;
  }
  return { winAcc: n ? wH / n : 0, podAcc: n ? pS / n : 0, top5Acc: n ? t5S / n : 0, top10Acc: n ? t10S / n : 0, n };
}
