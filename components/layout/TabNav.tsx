"use client";
import { usePathname, useRouter } from "next/navigation";
import { useBuzz } from "./RootLayout";

const TABS = [
  {id:"home",         href:"/",             label:"Home" },
  {id:"race-sim",     href:"/race-sim",     label:"Race Sim" },
  {id:"championship", href:"/championship", label:"Championship" },
  {id:"drivers",      href:"/drivers",      label:"Drivers & Teams" },
  {id:"telemetry",    href:"/telemetry",    label:"Telemetry" },
  {id:"sentiment",    href:"/sentiment",    label:"Sentiment" },
  {id:"model-lab",    href:"/model-lab",    label:"Model Lab" },
  {id:"data-hub",     href:"/data-hub",     label:"Data Hub" },
];

export function TabNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { unread, setOpen } = useBuzz();

  return (
    <nav style={{
      background:"var(--s0)",
      borderBottom:"1px solid var(--b1)",
      display:"flex",
      alignItems:"stretch",
      overflowX:"auto",
      position:"sticky",
      top:0,
      zIndex:50,
      height:40,
    }}>
      {/* Buzz bell — always visible */}
      <button
        onClick={() => router.push("/buzz")}
        aria-label="Open Race Buzz feed"
        style={{
          flexShrink:0,
          width:40,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          cursor:"pointer",
          position:"relative",
          background:"none",
          border:"none",
          borderRight:"1px solid var(--b1)",
          transition:"background .15s",
        }}
      >
        <span style={{ fontSize:14, lineHeight:1 }}>🔔</span>
        {unread > 0 && (
          <span style={{
            position:"absolute", top:6, right:5,
            width:15, height:15,
            background:"var(--red)", borderRadius:"50%",
            fontSize:8, fontFamily:"var(--mono)", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, border:"1.5px solid var(--s0)",
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Tab buttons */}
      <div style={{ display:"flex", overflowX:"auto", flex:1 }}>
        {TABS.map(tab => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              style={{
                padding:"0 16px",
                height:"100%",
                display:"flex",
                alignItems:"center",
                fontSize:11,
                fontWeight: active ? 600 : 400,
                fontFamily:"var(--font)",
                color: active ? "var(--text)" : "var(--t3)",
                cursor:"pointer",
                background:"none",
                border:"none",
                borderBottom: active ? "2px solid var(--purple)" : "2px solid transparent",
                borderTop: "2px solid transparent",
                transition:"color .12s, border-color .12s",
                whiteSpace:"nowrap",
                flexShrink:0,
                letterSpacing:"0.01em",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
