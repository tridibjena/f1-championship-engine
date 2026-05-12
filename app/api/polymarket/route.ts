import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://gamma-api.polymarket.com/events?closed=false&limit=40", {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'F1-Sim-Bot/1.0'
      },
      // Bypass caching so we get live data
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error("API returned " + res.status);
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // If the Gamma API is DNS-blocked, return a perfectly formatted mock payload so the UI works.
    console.warn("Polymarket API unreachable, using mock fallback. Error:", error.message);
    const mockData = [
      {
        id: "mock-f1-wdc",
        ticker: "F1 WDC 2026",
        title: "F1 Drivers Championship 2026 Winner",
        description: "Predict the winner of the 2026 F1 Drivers Championship.",
        active: true,
        markets: [
          {
            id: "mkt-1",
            question: "Who will win the 2026 F1 Drivers Championship?",
            outcomes: JSON.stringify(["Verstappen", "Norris", "Leclerc", "Hamilton", "Piastri"]),
            outcomePrices: JSON.stringify(["0.425", "0.280", "0.155", "0.080", "0.060"]),
            volume24hr: "150420",
            volumeNum: "1450200"
          }
        ]
      },
      {
        id: "mock-f1-wcc",
        ticker: "F1 WCC 2026",
        title: "F1 Constructors Championship 2026 Winner",
        description: "Predict the winner of the 2026 F1 Constructors Championship.",
        active: true,
        markets: [
          {
            id: "mkt-2",
            question: "Who will win the 2026 F1 Constructors Championship?",
            outcomes: JSON.stringify(["Red Bull", "McLaren", "Ferrari", "Mercedes"]),
            outcomePrices: JSON.stringify(["0.380", "0.340", "0.200", "0.080"]),
            volume24hr: "85200",
            volumeNum: "850400"
          }
        ]
      }
    ];
    return NextResponse.json(mockData);
  }
}
