import { SEED_RESULTS } from "@/lib/data/drivers";
import type { RaceData } from "@/lib/data/drivers";

const EMAP: Record<string, string> = {
  russell:"RUS",antonelli:"ANT",leclerc:"LEC",hamilton:"HAM",norris:"NOR",
  piastri:"PIA",verstappen:"VER",hadjar:"HAD",lawson:"LAW",lindblad:"LIN",
  alonso:"ALO",stroll:"STR",sainz:"SAI",albon:"ALB",ocon:"OCO",bearman:"BEA",
  gasly:"GAS",colapinto:"COL",hulkenberg:"HUL",bortoleto:"BOR",perez:"PER",bottas:"BOT",
};

export type DataSource = "live" | "fallback" | "loading";

const API_BASE = "http://localhost:8000";

export async function fetchLiveResults(): Promise<{ data: RaceData[]; source: DataSource }> {
  // Try to load from session cache first
  try {
    const cached = sessionStorage.getItem("f1_results_cache");
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - timestamp < 300_000) {
        return { data, source: "live" };
      }
    }
  } catch (e) { /* ignore cache errors */ }

  const season = new Date().getFullYear();
  
  try {
    // Attempt to fetch all rounds in parallel (max 24)
    // We fetch them all and then filter out the ones that haven't happened yet
    const rounds = Array.from({ length: 24 }, (_, i) => i + 1);
    const fetchRound = async (r: number) => {
      const res = await fetch(`${API_BASE}/data/results/${season}/${r}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json || !json.results) return null;
      return {
        round: json.round,
        raceName: json.raceName,
        date: json.date,
        results: json.results.map((r: any) => ({
          driverCode: r.driverCode,
          pos: r.pos
        }))
      };
    };

    const allResults = await Promise.all(rounds.map(fetchRound));
    const validResults = allResults.filter((r): r is RaceData => r !== null);

    if (validResults.length === 0) throw new Error("No live rounds found");

    // Update cache
    try {
      sessionStorage.setItem("f1_results_cache", JSON.stringify({
        timestamp: Date.now(),
        data: validResults
      }));
    } catch (e) { /* ignore storage errors */ }

    return { data: validResults, source: "live" };
  } catch (err) {
    console.warn("API Fetch inactive or failed, using seed fallback.");
    return { data: SEED_RESULTS as RaceData[], source: "fallback" };
  }
}
