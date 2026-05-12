import { DRV, G0 } from "@/lib/data/drivers";
import type { RaceData } from "@/lib/data/drivers";

export type GlickoRatings = Record<string, { r: number; rd: number }>;

export function glickoUpdate(ratings: GlickoRatings, finishers: string[]): void {
  const Q = Math.log(10) / 400;
  const g = (rd: number) => 1 / Math.sqrt(1 + 3 * Q * Q * rd * rd / (Math.PI * Math.PI));
  const e = (r: number, rj: number, rdj: number) => 1 / (1 + Math.pow(10, -(g(rdj) * (r - rj)) / 400));

  finishers.forEach((dA, i) => {
    if (!ratings[dA]) return;
    let vInv = 0, delta = 0;
    finishers.forEach((dB, j) => {
      if (i === j || !ratings[dB]) return;
      const gB  = g(ratings[dB].rd);
      const eAB = e(ratings[dA].r, ratings[dB].r, ratings[dB].rd);
      const score = j > i ? 1 : 0;
      vInv += gB * gB * eAB * (1 - eAB);
      delta += gB * (score - eAB);
    });
    if (vInv === 0) return;
    const v    = 1 / vInv;
    const μ    = (ratings[dA].r  - 1500) / 173.72;
    const φ    = ratings[dA].rd / 173.72;
    const φStar = Math.sqrt(φ * φ + 0.003);
    const φNew  = Math.max(30 / 173.72, 1 / Math.sqrt(1 / (φStar * φStar) + 1 / v));
    const μNew  = μ + φNew * φNew * delta;
    ratings[dA] = {
      r:  Math.min(2200, Math.max(1200, μNew * 173.72 + 1500)),
      rd: Math.max(30,   Math.min(250,  φNew * 173.72)),
    };
  });
}

export function computeGlicko(liveResults: RaceData[]): GlickoRatings {
  const r: GlickoRatings = {};
  DRV.forEach(d => (r[d] = { r: G0[d].r, rd: G0[d].rd }));
  for (const race of liveResults) {
    const fin = race.results.map(x => x.driverCode).filter(d => DRV.includes(d));
    glickoUpdate(r, fin);
  }
  return r;
}

export function computeBT(liveResults: RaceData[]): Record<string, number> {
  const pts: Record<string, number> = {};
  DRV.forEach(d => (pts[d] = 0));
  for (const r of liveResults)
    r.results.forEach(({ driverCode: d, pos: p }) => {
      if (pts[d] !== undefined) pts[d] += Math.max(0, 11 - p);
    });
  const tot = Object.values(pts).reduce((s, v) => s + v, 0) || 1;
  const str: Record<string, number> = {};
  DRV.forEach(d => (str[d] = (pts[d] || 0) / tot));
  return str;
}

export function computeForm(liveResults: RaceData[]): Record<string, number> {
  const f: Record<string, number[]> = {};
  DRV.forEach(d => (f[d] = []));
  for (const race of liveResults.slice(-4)) {
    const fin = race.results.map(r => r.driverCode);
    DRV.forEach(d => {
      const pos = fin.indexOf(d);
      f[d].push(pos >= 0 ? pos + 1 : 13);
    });
  }
  const form: Record<string, number> = {};
  DRV.forEach(d => {
    if (!f[d].length) { form[d] = 1.0; return; }
    const avg = f[d].reduce((s, v) => s + v, 0) / f[d].length;
    form[d] = 0.990 + (avg - 1) * 0.0016;
  });
  return form;
}

export function buildActualPts(liveResults: RaceData[]): Record<string, number> {
  const PTS10 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const pts: Record<string, number> = {};
  DRV.forEach(d => (pts[d] = 0));
  for (const race of liveResults)
    race.results.forEach(({ driverCode: d, pos: p }) => {
      if (pts[d] !== undefined && p >= 1 && p <= 10) pts[d] += PTS10[p - 1];
    });
  return pts;
}
