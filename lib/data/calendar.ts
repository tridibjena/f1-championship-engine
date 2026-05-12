export type CircuitType = "hybrid" | "power" | "technical" | "street";

export interface Circuit {
  r: number; n: string; loc: string; dt: string | null;
  type: CircuitType; base: number; km: number; laps: number;
  sprint: boolean; done: boolean; next?: boolean; cancelled?: boolean;
  weather: string; temp: number;
}

export const CAL: Circuit[] = [
  {r:1,n:"Australia",loc:"Melbourne",dt:"2026-03-08",type:"hybrid",base:83.5,km:5.28,laps:58,sprint:false,done:true,weather:"sunny",temp:22},
  {r:2,n:"China",loc:"Shanghai",dt:"2026-03-15",type:"hybrid",base:93.4,km:5.45,laps:56,sprint:true,done:true,weather:"overcast",temp:18},
  {r:3,n:"Japan",loc:"Suzuka",dt:"2026-03-29",type:"technical",base:91.8,km:5.81,laps:53,sprint:false,done:true,weather:"cloudy",temp:14},
  {r:4,n:"Bahrain",loc:"Sakhir",dt:null,type:"hybrid",base:94.5,km:5.41,laps:57,sprint:false,done:false,cancelled:true,weather:"hot",temp:35},
  {r:5,n:"Saudi Arabia",loc:"Jeddah",dt:null,type:"street",base:88.1,km:6.17,laps:50,sprint:false,done:false,cancelled:true,weather:"hot",temp:34},
  {r:6,n:"Miami",loc:"Miami Gardens",dt:"2026-05-03",type:"hybrid",base:90.6,km:5.41,laps:57,sprint:true,done:true,weather:"humid",temp:30},
  {r:7,n:"Canada",loc:"Montréal",dt:"2026-05-24",type:"power",base:74.3,km:4.36,laps:70,sprint:true,done:false,next:true,weather:"variable",temp:18},
  {r:8,n:"Monaco",loc:"Monte Carlo",dt:"2026-06-07",type:"street",base:73.9,km:3.34,laps:78,sprint:false,done:false,weather:"sunny",temp:24},
  {r:9,n:"Spain",loc:"Barcelona",dt:"2026-06-14",type:"hybrid",base:81.5,km:4.66,laps:66,sprint:false,done:false,weather:"sunny",temp:28},
  {r:10,n:"Austria",loc:"Spielberg",dt:"2026-06-28",type:"power",base:66.2,km:4.32,laps:71,sprint:false,done:false,weather:"variable",temp:22},
  {r:11,n:"Great Britain",loc:"Silverstone",dt:"2026-07-05",type:"power",base:88.0,km:5.89,laps:52,sprint:true,done:false,weather:"cool",temp:18},
  {r:12,n:"Hungary",loc:"Budapest",dt:"2026-07-26",type:"technical",base:78.7,km:4.38,laps:70,sprint:false,done:false,weather:"hot",temp:34},
  {r:13,n:"Belgium",loc:"Spa-Francorchamps",dt:"2026-08-02",type:"power",base:105.9,km:7.00,laps:44,sprint:false,done:false,weather:"variable",temp:16},
  {r:14,n:"Netherlands",loc:"Zandvoort",dt:"2026-08-23",type:"technical",base:72.0,km:4.26,laps:72,sprint:true,done:false,weather:"windy",temp:20},
  {r:15,n:"Italy",loc:"Monza",dt:"2026-09-06",type:"power",base:82.0,km:5.79,laps:53,sprint:false,done:false,weather:"sunny",temp:26},
  {r:16,n:"Madrid",loc:"Madrid",dt:"2026-09-13",type:"street",base:98.0,km:5.47,laps:54,sprint:false,done:false,weather:"hot",temp:32},
  {r:17,n:"Azerbaijan",loc:"Baku",dt:"2026-09-20",type:"street",base:102.0,km:6.00,laps:51,sprint:false,done:false,weather:"warm",temp:27},
  {r:18,n:"Singapore",loc:"Marina Bay",dt:"2026-09-27",type:"street",base:100.2,km:5.06,laps:62,sprint:true,done:false,weather:"humid",temp:31},
  {r:19,n:"United States",loc:"Austin",dt:"2026-10-18",type:"hybrid",base:97.6,km:5.51,laps:56,sprint:false,done:false,weather:"warm",temp:24},
  {r:20,n:"Mexico",loc:"Mexico City",dt:"2026-10-25",type:"hybrid",base:80.8,km:4.30,laps:71,sprint:false,done:false,weather:"altitude",temp:20},
  {r:21,n:"Brazil",loc:"São Paulo",dt:"2026-11-08",type:"power",base:72.0,km:4.31,laps:71,sprint:false,done:false,weather:"tropical",temp:28},
  {r:22,n:"Las Vegas",loc:"Las Vegas Strip",dt:"2026-11-21",type:"street",base:96.0,km:6.20,laps:50,sprint:false,done:false,weather:"cool",temp:15},
  {r:23,n:"Qatar",loc:"Lusail",dt:"2026-11-29",type:"power",base:84.1,km:5.38,laps:57,sprint:false,done:false,weather:"warm",temp:28},
  {r:24,n:"Abu Dhabi",loc:"Yas Marina",dt:"2026-12-06",type:"hybrid",base:87.6,km:5.28,laps:58,sprint:false,done:false,weather:"warm",temp:26},
];

export interface PodiumEntry { d: string; t: string }
export interface CircuitHistoryEntry {
  prev?: { p1: PodiumEntry; p2: PodiumEntry; p3: PodiumEntry };
  prevYear?: number;
  season2026?: { p1: PodiumEntry; p2: PodiumEntry; p3: PodiumEntry };
}

export const CIRCUIT_HISTORY: Record<string, CircuitHistoryEntry> = {
  "Australia":{prev:{p1:{d:"NOR",t:"McLaren"},p2:{d:"LEC",t:"Ferrari"},p3:{d:"RUS",t:"Mercedes"}},prevYear:2025,season2026:{p1:{d:"RUS",t:"Mercedes"},p2:{d:"ANT",t:"Mercedes"},p3:{d:"LEC",t:"Ferrari"}}},
  "China":{prev:{p1:{d:"PIA",t:"McLaren"},p2:{d:"NOR",t:"McLaren"},p3:{d:"VER",t:"Red Bull"}},prevYear:2025,season2026:{p1:{d:"ANT",t:"Mercedes"},p2:{d:"RUS",t:"Mercedes"},p3:{d:"HAM",t:"Ferrari"}}},
  "Japan":{prev:{p1:{d:"NOR",t:"McLaren"},p2:{d:"PIA",t:"McLaren"},p3:{d:"VER",t:"Red Bull"}},prevYear:2025,season2026:{p1:{d:"ANT",t:"Mercedes"},p2:{d:"PIA",t:"McLaren"},p3:{d:"LEC",t:"Ferrari"}}},
  "Miami":{prev:{p1:{d:"PIA",t:"McLaren"},p2:{d:"NOR",t:"McLaren"},p3:{d:"LEC",t:"Ferrari"}},prevYear:2025},
  "Monaco":{prev:{p1:{d:"LEC",t:"Ferrari"},p2:{d:"PIA",t:"McLaren"},p3:{d:"SAI",t:"Williams"}},prevYear:2025},
  "Canada":{prev:{p1:{d:"NOR",t:"McLaren"},p2:{d:"PIA",t:"McLaren"},p3:{d:"HAM",t:"Mercedes"}},prevYear:2025},
};

export const TYPE_COLOR: Record<string, string> = {
  power:"#7b6cff", street:"#f472b6", technical:"#38bdf8", hybrid:"#10d98a",
};
