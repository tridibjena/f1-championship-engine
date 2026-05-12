"use client";
import { useBuzz } from "./RootLayout";
import { BUZZ } from "@/lib/data/buzz";

const platformColors: Record<string, string> = {
  reddit: "#ff6314", x: "#aaaaaa", planet: "#00d084", news: "#38bdf8",
};
const platformLabel: Record<string, string> = {
  reddit: "Reddit", x: "X / Twitter", planet: "PlanetF1", news: "News",
};
const tagColor: Record<string, string> = {
  hot: "var(--red)", spicy: "var(--amber)", news: "var(--blue)",
};

export function BuzzDrawer() {
  const { open, setOpen } = useBuzz();

  return (
    <aside className={`buzz-drawer ${open ? "open" : ""}`}>
      {/* Header */}
      <div style={{
        padding:"14px 18px",
        borderBottom:"1px solid var(--b1)",
        display:"flex", alignItems:"center", gap:10,
        flexShrink:0, background:"var(--s0)",
        position:"sticky", top:0, zIndex:1,
      }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-.02em" }}>Race Buzz</div>
          <div style={{ fontSize:10, color:"var(--t3)", marginTop:1 }}>Community · News · Analysis</div>
        </div>
        <span className="chip live" style={{ fontSize:9 }}>● Live</span>
        <button
          onClick={() => setOpen(false)}
          style={{
            width:28, height:28, borderRadius:7, display:"flex", alignItems:"center",
            justifyContent:"center", background:"var(--s2)", border:"1px solid var(--b1)",
            cursor:"pointer", fontSize:14, color:"var(--t2)", lineHeight:1,
          }}>
          ✕
        </button>
      </div>

      {/* Feed */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:8 }}>
        {BUZZ.map((b, i) => (
          <div key={i} className={`buzz-card ${b.type}`}>
            {/* Meta row */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <span style={{
                fontSize:9, fontFamily:"var(--mono)", fontWeight:600,
                color: platformColors[b.platform] || "var(--t3)",
              }}>
                {platformLabel[b.platform] || b.platform}
              </span>
              <span style={{ fontSize:9, color:"var(--t4)", fontFamily:"var(--mono)" }}>{b.sub}</span>
              <span style={{
                marginLeft:"auto", fontSize:9, fontFamily:"var(--mono)", fontWeight:600,
                color: tagColor[b.type] || "var(--t3)",
              }}>
                {b.tag}
              </span>
            </div>

            {/* Text */}
            <div
              style={{ fontSize:11, lineHeight:1.6, color:"var(--text)", marginBottom:8 }}
              dangerouslySetInnerHTML={{ __html: b.text }}
            />

            {/* Footer */}
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)" }}>
              <span style={{ color: b.type === "hot" ? "var(--red)" : b.type === "spicy" ? "var(--amber)" : "var(--blue)", fontWeight:600 }}>
                {b.votes}
              </span>
              <span style={{ marginLeft:"auto" }}>{b.time} ago</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:"10px 18px", borderTop:"1px solid var(--b1)", fontSize:9, fontFamily:"var(--mono)", color:"var(--t4)", textAlign:"center" }}>
        r/formula1 · PlanetF1 · ESPN · Sky Sports · Updated hourly
      </div>
    </aside>
  );
}
