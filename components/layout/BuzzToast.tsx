"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BUZZ } from "@/lib/data/buzz";
import type { BuzzItem } from "@/lib/data/buzz";

const TAG_COLOR: Record<string, string> = {
  hot: "var(--red)", spicy: "var(--amber)", news: "var(--blue)",
};

export function BuzzToast() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [item, setItem] = useState<BuzzItem>(BUZZ[0]);
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Show a new notification every 18 seconds
  useEffect(() => {
    // First one after 3s
    const first = setTimeout(() => show(0), 3000);
    return () => clearTimeout(first);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function show(i: number) {
    const next = BUZZ[i % BUZZ.length];
    setItem(next);
    setIdx(i);
    setExiting(false);
    setVisible(true);

    // Auto-dismiss after 7s
    const dismiss = setTimeout(() => exit(i), 7000);
    return () => clearTimeout(dismiss);
  }

  function exit(i: number) {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      // Queue next after 18s
      setTimeout(() => show(i + 1), 18000);
    }, 350);
  }

  function handleClick() {
    setVisible(false);
    router.push("/buzz");
  }

  if (!visible) return null;

  const tagColor = TAG_COLOR[item.type] || "var(--blue)";
  const platformLabel: Record<string, string> = {
    reddit: "Reddit", x: "X", planet: "PlanetF1", news: "News",
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 64,
        right: 20,
        zIndex: 999,
        width: 280,
        background: "var(--bg-glass)",
        border: "1px solid var(--b2)",
        borderLeft: `4px solid ${tagColor}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        boxShadow: "var(--shadow-card)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        transform: exiting ? "translateX(400px)" : "translateX(0)",
        opacity: exiting ? 0 : 0.7,
        transition: "transform .45s cubic-bezier(.4,0,.2,1), opacity .3s ease",
        animation: !exiting ? "slideIn .4s cubic-bezier(.4,0,.2,1)" : undefined,
      }}
    >
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: tagColor + "18",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: 12, flexShrink: 0,
        }}>
          {item.type === "hot" ? "🔥" : item.type === "spicy" ? "🌶️" : "📰"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:9, fontWeight:700, color: tagColor, textTransform: "uppercase" }}>{item.tag}</div>
          <div style={{ fontSize:8, color:"var(--t3)", fontFamily:"var(--mono)" }}>
            {platformLabel[item.platform] || item.platform} · {item.sub}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); exit(idx); }}
          style={{
            width:16, height:16, borderRadius:4, border:"none", background:"none",
            color:"var(--t3)", cursor:"pointer", fontSize:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
          }}
        >✕</button>
      </div>

      {/* Text */}
      <div
        style={{
          fontSize:10, lineHeight:1.5, color:"var(--text)", marginBottom:6,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
          overflow:"hidden",
        }}
        dangerouslySetInnerHTML={{ __html: item.text }}
      />

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:9, color: tagColor, fontFamily:"var(--mono)", fontWeight:700 }}>
          {item.votes}
        </span>
        <span style={{ fontSize:9, color:"var(--purple-l)", fontWeight:600 }}>
          Gossip Feed →
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:2,
        background:"var(--b1)", borderRadius:"0 0 12px 12px", overflow:"hidden",
      }}>
        <div style={{
          height:"100%", background: tagColor, borderRadius:"0 0 12px 12px",
          animation: "shrink 7s linear forwards",
        }} />
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(360px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
