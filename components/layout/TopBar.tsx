"use client";
import { useTheme } from "./RootLayout";
import { useSimContext } from "@/components/SimProvider";

export function TopBar() {
  const { theme, toggle } = useTheme();
  const { dataSource, liveResults, running, runSim } = useSimContext();

  const statusColor = dataSource === "live" ? "var(--green)" : dataSource === "fallback" ? "var(--amber)" : "var(--t3)";
  const statusLabel = dataSource === "live" ? "Live" : dataSource === "fallback" ? "Seed" : "Loading";

  return (
    <header style={{
      height: 48,
      background: "var(--s0)",
      borderBottom: "1px solid var(--b1)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 10,
      position: "sticky",
      top: 0,
      zIndex: 60,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{
          width:28, height:28, background:"var(--purple)", borderRadius:8,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, flexShrink:0,
        }}>⚡</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, letterSpacing:"-.02em", lineHeight:1.2 }}>F1 Engine</div>
          <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--mono)", letterSpacing:".02em" }}>2026 CHAMPIONSHIP</div>
        </div>
      </div>

      <div style={{ flex:1 }} />

      {/* Data status */}
      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"var(--t3)" }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:statusColor, display:"inline-block",
          boxShadow: dataSource === "live" ? `0 0 6px ${statusColor}` : "none" }} />
        <span style={{ fontFamily:"var(--mono)" }}>{statusLabel} · {liveResults.length}/22</span>
      </div>

      <div style={{ width:1, height:16, background:"var(--b1)" }} />

      {/* Run button */}
      <button
        onClick={runSim}
        disabled={running}
        style={{
          height:30, padding:"0 14px", borderRadius:8, fontSize:11, fontWeight:600,
          cursor: running ? "not-allowed" : "pointer",
          background: running ? "var(--s2)" : "var(--purple)",
          color: running ? "var(--t3)" : "#fff",
          border: running ? "1px solid var(--b1)" : "none",
          transition:"background .15s, opacity .15s",
          display:"flex", alignItems:"center", gap:5,
        }}>
        {running ? (
          <>
            <span style={{ width:10, height:10, borderRadius:"50%", border:"2px solid var(--t4)", borderTopColor:"var(--t3)", animation:"spin .7s linear infinite", display:"inline-block" }} />
            Simulating…
          </>
        ) : "▶ Run Sim"}
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        style={{
          height:30, width:30, borderRadius:8, fontSize:14, cursor:"pointer",
          background:"var(--s2)", border:"1px solid var(--b1)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background .15s",
        }}>
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
