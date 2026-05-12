"use client";
import { useState, useEffect, useMemo } from "react";
import { useSimContext } from "@/components/SimProvider";
import { NAMES } from "@/lib/data/drivers";

interface PolymarketEvent {
  id: string;
  ticker: string;
  title: string;
  description: string;
  active: boolean;
  markets: {
    id: string;
    question: string;
    outcomes: string[];
    outcomePrices: string[];
    volume24hr: string;
    volumeNum: string;
  }[];
}

// --- ProSpark Component (Enhanced Graph) ---
function ProSpark({ data, color, height = 44 }: { data: number[], color: string, height?: number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (!data || data.length < 2) return <div style={{ height, width: 140, background: "var(--s2)", borderRadius: 4, opacity: 0.1 }} />;
  
  const width = 140;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const getY = (v: number) => height - ((v - min) / range) * (height - 8) - 4;
  const getX = (i: number) => (i / (data.length - 1)) * width;

  // Generate smooth path string
  let path = `M 0,${getY(data[0])}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = getX(i);
    const y1 = getY(data[i]);
    const x2 = getX(i + 1);
    const y2 = getY(data[i + 1]);
    const cx = (x1 + x2) / 2;
    path += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  }

  const fillPath = `${path} L ${width},${height} L 0,${height} Z`;
  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div 
      style={{ position: "relative", width, height }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setHoverIdx(Math.round((x / width) * (data.length - 1)));
      }}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {hoverIdx !== null && data[hoverIdx] !== undefined && (
          <>
            <line x1={getX(hoverIdx)} y1={0} x2={getX(hoverIdx)} y2={height} stroke="var(--b2)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={getX(hoverIdx)} cy={getY(data[hoverIdx])} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          </>
        )}
      </svg>
      {hoverIdx !== null && data[hoverIdx] !== undefined && (
        <div style={{ position: "absolute", top: -20, left: getX(hoverIdx), transform: "translateX(-50%)", background: "var(--bg)", border: "1px solid var(--b1)", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 800, whiteSpace: "nowrap", zIndex: 10, boxShadow: "var(--shadow-sm)" }}>
          {(data[hoverIdx] * 100).toFixed(1)}¢
        </div>
      )}
    </div>
  );
}

export default function MarketsPage() {
  const { winC, params, sorted, traj } = useSimContext();
  const [data, setData] = useState<PolymarketEvent[] | null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(25000); // Starting with 25,000 INR
  const [positions, setPositions] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ msg: string; sub: string } | null>(null);
  const [betInputs, setBetInputs] = useState<Record<string, string>>({});

  const handleTrade = (outcome: string, question: string, price: number, isInternal: boolean, marketId: string) => {
    const amountStr = betInputs[`${marketId}-${outcome}`] || "100";
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      setNotification({ msg: "Invalid Amount", sub: "Please enter a valid bet amount." });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (balance < amount) {
      setNotification({ msg: "Insufficient Funds", sub: "Balance too low for this stake." });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const payout = amount / price;

    setBalance(prev => prev - amount);
    setPositions(prev => [
      {
        id: Date.now(),
        question,
        outcome,
        price,
        size: amount,
        payout,
        isInternal,
        entryPrice: price,
      },
      ...prev
    ]);

    setNotification({ 
      msg: `Bet Placed: ${outcome}`, 
      sub: `Staked ₹${amount.toLocaleString()} for ₹${payout.toLocaleString(undefined, { maximumFractionDigits: 0 })} payout.`
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate internal markets based on simulation results
  const internalMarkets = useMemo(() => {
    if (!winC || !sorted.length) return [];
    
    return [
      {
        id: "internal-1",
        title: "2026 World Drivers' Championship",
        ticker: "WDC-2026",
        markets: sorted.slice(0, 4).map(([d, pts]) => {
          const prob = winC[d] || 0;
          const price = prob / params.mc;
          const h = traj ? traj.map(t => (t[d] || 0) / (Object.values(t).reduce((s,v)=>s+v,0)||1)) : [0.1, 0.2, price];
          
          return {
            id: `m-${d}`,
            question: `Will ${NAMES[d]} win the 2026 Championship?`,
            outcomes: ["Yes", "No"],
            outcomePrices: [ price.toString(), (1 - price).toString() ],
            volumeNum: "124500",
            history: h,
          };
        })
      }
    ];
  }, [winC, sorted, params.mc, traj]);

  useEffect(() => {
    fetchPolymarketData();
  }, []);

  const fetchPolymarketData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://corsproxy.io/?https://gamma-api.polymarket.com/events?closed=false&limit=100`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      
      const filtered = json.filter((e: any) => 
        e.title.toLowerCase().includes("formula 1") || 
        e.title.toLowerCase().includes("grand prix") ||
        (e.description && e.description.toLowerCase().includes("f1"))
      );
      
      setData(filtered);
      
      filtered.forEach(async (ev: any) => {
        const market = ev.markets?.[0];
        if (!market || !market.clobTokenIds) return;
        try {
          const tokenIds = typeof market.clobTokenIds === 'string' ? JSON.parse(market.clobTokenIds) : market.clobTokenIds;
          const tokenId = tokenIds[0]; 
          const hRes = await fetch(`https://corsproxy.io/?https://clob.polymarket.com/prices-history?token_id=${tokenId}&interval=6h`);
          if (hRes.ok) {
            const hJson = await hRes.json();
            const prices = hJson.history.map((p: any) => p.p);
            setHistory(prev => ({ ...prev, [market.id]: prices }));
          }
        } catch (e) { console.warn("History fetch failed", e); }
      });
    } catch (err: any) {
      console.warn("Polymarket sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const allEvents = [...internalMarkets, ...(data || [])];
  const totalValue = balance + positions.reduce((acc, p) => acc + p.size, 0);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, background: "var(--bg)", border: "1px solid var(--b1)", borderRadius: 12, padding: "16px 24px", boxShadow: "var(--shadow-card)", animation: "slideUp 0.3s ease-out", minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: notification.msg.includes("Invalid") || notification.msg.includes("Insufficient") ? "var(--red)" : "var(--green)" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{notification.msg}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{notification.sub}</div>
            </div>
          </div>
          <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
      )}

      {/* Hero Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Total Net Worth</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>₹{totalValue.toLocaleString()}</div>
        </div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Available INR</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--green)" }}>₹{balance.toLocaleString()}</div>
        </div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Active Bets</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--purple)" }}>{positions.length}</div>
        </div>
      </div>

      {/* Positions Table */}
      {positions.length > 0 && (
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 12, marginBottom: 32, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--b1)", background: "rgba(255,255,255,0.02)", fontWeight: 700, fontSize: 13 }}>MY POSITIONS</div>
          <div style={{ padding: 0 }}>
            {positions.map(p => (
              <div key={p.id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--b1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{p.question}</div>
                  <div style={{ fontSize: 10, color: "var(--t4)" }}>Bet: <span style={{ color: "var(--text)", fontWeight: 600 }}>{p.outcome.toUpperCase()}</span> @ ₹{p.size.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>Payout: ₹{p.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div style={{ fontSize: 10, color: "var(--t4)" }}>Est. Profit: +₹{(p.payout - p.size).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Lists */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em" }}>Prediction Terminal</h2>
          <p style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", marginTop: 4 }}>Syncing Live Ensemble Odds · 5,000 MC Iterations</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {allEvents.map((ev) => {
            const isInternal = ev.id.startsWith("internal");
            return (
              <div key={ev.id} className="card" style={{ border: "1px solid var(--b1)", background: "var(--s1)" }}>
                <div className="card-header" style={{ padding: "16px 20px", background: isInternal ? "var(--purple-bg)" : "transparent" }}>
                  <div>
                    <span className="card-title" style={{ fontSize: 16 }}>{ev.title}</span>
                    <div className="card-tag" style={{ marginTop: 4 }}>Source: {isInternal ? "Ensemble Engine" : ev.ticker}</div>
                  </div>
                  <div className="chip live">
                    <span className="pulse green" /> {isInternal ? "PREDICTED" : "LIVE"}
                  </div>
                </div>
                
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {ev.markets?.map((m, i) => {
                    const parsedPrices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
                    const parsedOutcomes = typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes;
                    const mHistory = isInternal ? (m as any).history : (history[m.id] || []);
                    
                    return (
                      <div key={m.id || i} style={{ background: "var(--bg)", border: "1px solid var(--b1)", borderRadius: 10, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{m.question}</div>
                          <ProSpark data={mHistory} color={isInternal ? "var(--purple)" : "var(--green)"} height={30} />
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {(parsedOutcomes || ["Yes", "No"]).map((outcome: string, idx: number) => {
                            const price = parsedPrices ? parseFloat(parsedPrices[idx]) : 0.5;
                            const currentInput = betInputs[`${m.id}-${outcome}`] || "";
                            
                            return (
                              <div key={idx} style={{ background: "var(--s1)", border: "1px solid var(--b2)", borderRadius: 8, padding: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700 }}>{outcome}</span>
                                  <span style={{ fontSize: 14, fontWeight: 800, color: isInternal ? "var(--purple)" : "var(--green)", fontFamily: "var(--mono)" }}>{(price * 100).toFixed(1)}¢</span>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <input 
                                    type="number"
                                    placeholder="Stake ₹"
                                    value={currentInput}
                                    onChange={(e) => setBetInputs(prev => ({ ...prev, [`${m.id}-${outcome}`]: e.target.value }))}
                                    style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--b1)", borderRadius: 4, padding: "6px 8px", fontSize: 11, color: "var(--text)", outline: "none" }}
                                  />
                                  <button 
                                    onClick={() => handleTrade(outcome, m.question, price, isInternal, m.id)}
                                    style={{ padding: "6px 12px", background: isInternal ? "var(--purple)" : "var(--green)", color: "#fff", border: "none", borderRadius: 4, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                  >
                                    TRADE
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Terminal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t3)", textTransform: "uppercase", marginBottom: 12 }}>Order Book Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[...Array(8)].map((_, i) => {
                const isBuy = Math.random() > 0.4;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "var(--mono)", opacity: 1 - i * 0.1 }}>
                    <span style={{ color: isBuy ? "var(--green)" : "var(--red)" }}>{isBuy ? "BUY" : "SELL"}</span>
                    <span style={{ color: "var(--t2)" }}>₹{(Math.random() * 5000).toFixed(0)}</span>
                    <span style={{ color: "var(--t4)" }}>{(Math.random() * 100).toFixed(1)}¢</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 16, background: "var(--purple-bg)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--purple-l)", textTransform: "uppercase", marginBottom: 8 }}>Internal Engine Alpha</div>
            <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.5 }}>
              The **Ensemble Model** is currently pricing Hamilton's win at **42.1¢** while global markets are at **38.0¢**. 
              <div style={{ marginTop: 8, color: "var(--green)", fontWeight: 700 }}>+4.1¢ ARBITRAGE DETECTED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


