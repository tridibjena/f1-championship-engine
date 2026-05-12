"use client";
import { NAMES, tc, TEAMS } from "@/lib/data/drivers";

export default function SentimentPage() {
  const topics = [
    { name: "Car Performance", vol: 45, sent: 0.12 },
    { name: "Driver Morale", vol: 32, sent: -0.45 },
    { name: "Regulations", vol: 28, sent: -0.65 },
    { name: "Contract Drama", vol: 15, sent: 0.05 },
    { name: "Reliability", vol: 12, sent: -0.82 },
  ];

  const teamSentiment = [
    { team: "Mercedes", sent: 0.65 },
    { team: "Ferrari", sent: 0.42 },
    { team: "McLaren", sent: 0.15 },
    { team: "Red Bull", sent: -0.75 },
    { team: "Aston Martin", sent: -0.55 },
  ];

  return (
    <div>
      <div className="sec-hdr mb16">
        <span className="sec-title">Sentiment Intelligence</span>
        <span className="sec-meta">NLP pipelines analyzing Reddit + NewsAPI</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr)", gap: 14, marginBottom: 20 }}>
        {/* Topic Clusters */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Major Narratives</span>
            <span className="card-tag">Zero-shot classification</span>
          </div>
          <div style={{ padding: "16px 14px" }}>
            {topics.map(t => {
              const color = t.sent > 0.2 ? "var(--green)" : t.sent < -0.2 ? "var(--red)" : "var(--blue)";
              return (
                <div key={t.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{t.name}</span>
                    <span style={{ fontSize: 10, fontFamily: "var(--mono)", color }}>{t.sent > 0 ? "+" : ""}{t.sent}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--s3)", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                    {t.sent < 0 && <div style={{ width: "50%", display: "flex", justifyContent: "flex-end" }}><div style={{ width: `${Math.abs(t.sent) * 100}%`, background: "var(--red)" }} /></div>}
                    {t.sent >= 0 && <div style={{ width: "50%", marginLeft: "50%" }}><div style={{ width: `${t.sent * 100}%`, background: "var(--green)" }} /></div>}
                  </div>
                  <div style={{ fontSize: 8, color: "var(--t4)", marginTop: 4, fontFamily: "var(--mono)" }}>{t.vol}% Share of Voice</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Sentiment */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Team Sentiment vs Performance</span>
            <span className="card-tag">VADER compound score</span>
          </div>
          <div style={{ padding: "16px 14px" }}>
            {teamSentiment.map(t => {
              const c = tc(t.team);
              return (
                <div key={t.team} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 100, fontSize: 11, fontWeight: 500, color: c, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                    {t.team}
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 8, background: "var(--s2)", borderRadius: 4, position: "relative", border: "1px solid var(--b1)" }}>
                      <div style={{ position: "absolute", left: "50%", top: -2, bottom: -2, width: 1, background: "var(--b2)" }} />
                      {t.sent < 0 ? (
                        <div style={{ position: "absolute", right: "50%", height: "100%", width: `${Math.abs(t.sent) * 50}%`, background: "var(--red)", borderRadius: "4px 0 0 4px" }} />
                      ) : (
                        <div style={{ position: "absolute", left: "50%", height: "100%", width: `${t.sent * 50}%`, background: "var(--green)", borderRadius: "0 4px 4px 0" }} />
                      )}
                    </div>
                  </div>
                  <div style={{ width: 40, textAlign: "right", fontSize: 10, fontFamily: "var(--mono)", color: t.sent > 0 ? "var(--green)" : "var(--red)" }}>
                    {t.sent > 0 ? "+" : ""}{t.sent}
                  </div>
                </div>
              );
            })}
            
            <div style={{ marginTop: 24, padding: 12, background: "var(--s2)", borderRadius: 6, border: "1px solid var(--b1)" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Insight Engine</div>
              <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--red)" }}>High negative correlation</strong> detected between Red Bull sentiment (-0.75) and DNF rates over the last 3 races. 
                Discussion clusters heavily around "internal politics" and "technical brain drain".
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
