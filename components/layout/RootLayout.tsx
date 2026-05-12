"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { TopBar }    from "./TopBar";
import { TabNav }    from "./TabNav";
import { BuzzToast } from "./BuzzToast";
import { CalendarStrip } from "@/components/shared/CalendarStrip";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { SimProvider } from "@/components/SimProvider";
import { CAL } from "@/lib/data/calendar";

export type Theme = "dark" | "light";
export const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export const BuzzCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void; unread: number }>({
  open: false, setOpen: () => {}, unread: 0,
});
export const useBuzz = () => useContext(BuzzCtx);

export function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [buzzOpen, setBuzzOpen] = useState(false);
  const [unread]  = useState(3);
  
  const upcomingRace = CAL.find(c => !c.cancelled && !c.done) || CAL[CAL.length - 1];
  const [selectedRace, setSelectedRace] = useState(upcomingRace);

  useEffect(() => {
    const saved = localStorage.getItem("f1-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("f1-theme", next);
      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle: toggleTheme }}>
      <BuzzCtx.Provider value={{ open: buzzOpen, setOpen: setBuzzOpen, unread }}>
        <div className={theme} style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font)" }}>
          <BuzzToast />
          <SimProvider>
            <TopBar />
            <div style={{ background:"var(--s0)",borderBottom:"1px solid var(--b1)",padding:"12px 20px 10px" }}>
              <CalendarStrip selectedRace={selectedRace} onSelect={setSelectedRace} />
              <div style={{ marginTop:10 }}><CountdownTimer nextRace={selectedRace} /></div>
            </div>
            <TabNav />
            <main style={{ padding:"20px",minHeight:"calc(100vh - 180px)" }}>{children}</main>
          </SimProvider>
        </div>
      </BuzzCtx.Provider>
    </ThemeCtx.Provider>
  );
}
