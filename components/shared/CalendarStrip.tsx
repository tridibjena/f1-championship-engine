"use client";
import { CAL, type Circuit, CIRCUIT_HISTORY, TYPE_COLOR } from "@/lib/data/calendar";
import { useEffect, useRef, useState } from "react";
import { NAMES } from "@/lib/data/drivers";

interface Props {
  selectedRace: Circuit;
  onSelect: (c: Circuit) => void;
}

export function CalendarStrip({ selectedRace, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredRace, setHoveredRace] = useState<Circuit | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const nextRaceIdx = CAL.findIndex(c => !c.cancelled && !c.done);

  useEffect(() => {
    if (ref.current && nextRaceIdx > -1) {
      const el = ref.current.children[nextRaceIdx] as HTMLElement;
      if (el) {
        const parent = ref.current.parentElement;
        if (parent) parent.scrollLeft = el.offsetLeft - parent.offsetWidth / 2 + el.offsetWidth / 2;
      }
    }
  }, [nextRaceIdx]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="cal-strip" style={{ position: "relative" }}>
      {/* Circuit Info Tooltip */}
      {hoveredRace && (
        <div style={{
          position: "fixed",
          top: mousePos.y + 15,
          left: Math.min(window.innerWidth - 220, mousePos.x + 10),
          width: 200,
          background: "var(--bg-glass)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--b1)",
          borderRadius: 10,
          padding: 12,
          zIndex: 2000,
          boxShadow: "var(--shadow-card)",
          pointerEvents: "none",
          animation: "fadeIn 0.15s ease-out",
          opacity: 0.75,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: "var(--t4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Round {hoveredRace.r}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{hoveredRace.n}</div>
            </div>
            <div style={{ background: TYPE_COLOR[hoveredRace.type], color: "#fff", fontSize: 7, fontWeight: 800, padding: "2px 5px", borderRadius: 3, textTransform: "uppercase" }}>
              {hoveredRace.type}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 8, color: "var(--t4)", textTransform: "uppercase" }}>Dist</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{hoveredRace.km} KM</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "var(--t4)", textTransform: "uppercase" }}>Weather</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", textTransform: "capitalize" }}>{hoveredRace.weather}</div>
            </div>
          </div>

          {CIRCUIT_HISTORY[hoveredRace.n] && (
            <div style={{ borderTop: "1px solid var(--b2)", paddingTop: 10 }}>
              <div style={{ fontSize: 8, color: "var(--t4)", textTransform: "uppercase", marginBottom: 6 }}>
                {CIRCUIT_HISTORY[hoveredRace.n].season2026 ? "Result" : "2025 Podium"}
              </div>
              {(() => {
                const hist = CIRCUIT_HISTORY[hoveredRace.n].season2026 || CIRCUIT_HISTORY[hoveredRace.n].prev;
                if (!hist) return null;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[hist.p1, hist.p2, hist.p3].map((p, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: i === 0 ? "var(--amber)" : i === 1 ? "#cbd5e1" : "#94a3b8" }}>{i + 1}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text)" }}>{NAMES[p.d] || p.d}</span>
                        </div>
                        <span style={{ fontSize: 8, color: "var(--t4)" }}>{p.t}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
          
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}

      <div className="cal-inner" ref={ref}>
        {CAL.map((c, i) => {
          const isNext = i === nextRaceIdx;
          const isSelected = c.r === selectedRace.r;
          
          return (
            <div
              key={c.r}
              onClick={() => { if (!c.cancelled) onSelect(c); }}
              onMouseEnter={() => setHoveredRace(c)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredRace(null)}
              className={`cal-card ${c.done ? "done" : ""} ${isNext ? "next" : ""} ${c.cancelled ? "cancelled" : ""} ${isSelected ? "selected" : ""}`}
              style={{
                borderColor: isSelected ? "var(--text)" : undefined,
                background: isSelected ? "var(--text)" : undefined,
                color: isSelected ? "var(--bg)" : undefined,
                transform: isSelected ? "translateY(-2px)" : undefined,
                boxShadow: isSelected ? "0 6px 16px rgba(0,0,0,.15)" : undefined,
              }}
            >
              <div style={{ background: isSelected ? "rgba(255,255,255,.15)" : "var(--b1)", height: 26, padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 600, color: isSelected ? "inherit" : "var(--t3)" }}>R{c.r}</span>
                <span style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 600, color: isNext ? "var(--purple)" : isSelected ? "inherit" : "var(--t4)" }}>
                  {c.cancelled ? "CXL" : c.done ? "DONE" : isNext ? "NEXT" : "UPC"}
                </span>
              </div>
              <div style={{ padding: "8px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.n}</div>
                <div style={{ fontSize: 9, color: isSelected ? "inherit" : "var(--t3)", opacity: isSelected ? 0.8 : 1 }}>{c.loc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
