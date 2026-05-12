"use client";
import { BUZZ } from "@/lib/data/buzz";

export default function BuzzPage() {
  const platformColors: Record<string, string> = {
    reddit: "#ff6314", x: "#aaaaaa", planet: "#00d084", news: "#38bdf8",
  };
  const platformLabel: Record<string, string> = {
    reddit: "Reddit", x: "X / Twitter", planet: "PlanetF1", news: "News",
  };
  const tagColor: Record<string, string> = {
    hot: "var(--red)", spicy: "var(--amber)", news: "var(--blue)",
  };

  return (
    <div>
      <div className="sec-hdr mb16">
        <span className="sec-title">Race Buzz</span>
        <span className="sec-meta">Community · News · Analysis</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16
      }}>
        {BUZZ.map((b, i) => (
          <div key={i} className={`card`} style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header" style={{ borderBottom: "none", paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                <span style={{
                  fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600,
                  color: platformColors[b.platform] || "var(--t3)",
                  background: (platformColors[b.platform] || "var(--t3)") + "15",
                  padding: "2px 6px", borderRadius: 4
                }}>
                  {platformLabel[b.platform] || b.platform}
                </span>
                <span style={{ fontSize: 9, color: "var(--t4)", fontFamily: "var(--mono)" }}>{b.sub}</span>
                <span style={{
                  marginLeft: "auto", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600,
                  color: tagColor[b.type] || "var(--t3)",
                  display: "flex", alignItems: "center", gap: 4
                }}>
                  {b.type === "hot" ? "🔥" : b.type === "spicy" ? "🌶️" : "📰"} {b.tag}
                </span>
              </div>
            </div>
            <div style={{ padding: "0 16px 16px", flex: 1, fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}
              dangerouslySetInnerHTML={{ __html: b.text }}
            />
            <div style={{
              padding: "12px 16px", borderTop: "1px solid var(--b1)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--s0)"
            }}>
              <span style={{ fontSize: 11, color: tagColor[b.type] || "var(--blue)", fontWeight: 600, fontFamily: "var(--mono)" }}>
                {b.votes} {b.platform === "x" ? "" : "upvotes"}
              </span>
              <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>
                {b.time} ago
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
