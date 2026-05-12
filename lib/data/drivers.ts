// ═══════════════════════════════════════════════════════════
// DATA LAYER — 2026 verified data (ported verbatim from original)
// ═══════════════════════════════════════════════════════════

export const TEAMS: Record<string, string> = {
  RUS:"Mercedes",ANT:"Mercedes",LEC:"Ferrari",HAM:"Ferrari",
  NOR:"McLaren",PIA:"McLaren",VER:"Red Bull",HAD:"Red Bull",
  LAW:"Racing Bulls",LIN:"Racing Bulls",ALO:"Aston Martin",STR:"Aston Martin",
  SAI:"Williams",ALB:"Williams",OCO:"Haas",BEA:"Haas",
  GAS:"Alpine",COL:"Alpine",HUL:"Audi",BOR:"Audi",
  PER:"Cadillac",BOT:"Cadillac",
};

export const NAMES: Record<string, string> = {
  RUS:"George Russell",ANT:"Kimi Antonelli",LEC:"Charles Leclerc",HAM:"Lewis Hamilton",
  NOR:"Lando Norris",PIA:"Oscar Piastri",VER:"Max Verstappen",HAD:"Isack Hadjar",
  LAW:"Liam Lawson",LIN:"Arvid Lindblad",ALO:"Fernando Alonso",STR:"Lance Stroll",
  SAI:"Carlos Sainz",ALB:"Alex Albon",OCO:"Esteban Ocon",BEA:"Oliver Bearman",
  GAS:"Pierre Gasly",COL:"Franco Colapinto",HUL:"Nico Hülkenberg",BOR:"Gabriel Bortoleto",
  PER:"Sergio Pérez",BOT:"Valtteri Bottas",
};

export const NUMS: Record<string, number> = {
  RUS:63,ANT:12,LEC:16,HAM:44,NOR:1,PIA:81,VER:3,HAD:6,
  LAW:30,LIN:41,ALO:14,STR:18,SAI:55,ALB:23,OCO:31,BEA:87,
  GAS:10,COL:43,HUL:27,BOR:5,PER:11,BOT:77,
};

export const TEAM_COLORS: Record<string, string> = {
  "Mercedes":"#27F4D2","Ferrari":"#E8002D","McLaren":"#FF8000","Red Bull":"#3671C6",
  "Racing Bulls":"#6692FF","Aston Martin":"#229971","Williams":"#005AFF","Haas":"#B6BABD",
  "Alpine":"#FF87BC","Audi":"#00D2BE","Cadillac":"#94a3b8",
};

export const tc = (team: string) => TEAM_COLORS[team] || "#888";

export const getDriverURL = (id: string) => {
  const name = NAMES[id] || id;
  let slug = name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-");
  
  // Special overrides for F1.com slugs
  if (id === "ANT") slug = "andrea-kimi-antonelli";
  if (id === "BEA") slug = "oliver-bearman";
  if (id === "HAD") slug = "isack-hadjar";
  if (id === "LIN") slug = "arvid-lindblad";
  if (id === "BOR") slug = "gabriel-bortoleto";
  
  return `https://www.formula1.com/en/drivers/${slug}.html`;
};

export const DRV = Object.keys(TEAMS);

// Glicko-2 priors
export const G0: Record<string, { r: number; rd: number }> = {
  RUS:{r:1818,rd:72},ANT:{r:1722,rd:155},LEC:{r:1802,rd:68},HAM:{r:1845,rd:58},
  NOR:{r:1838,rd:65},PIA:{r:1771,rd:82},VER:{r:1882,rd:55},HAD:{r:1678,rd:148},
  LAW:{r:1652,rd:128},LIN:{r:1548,rd:195},ALO:{r:1778,rd:72},STR:{r:1542,rd:108},
  SAI:{r:1752,rd:68},ALB:{r:1681,rd:98},OCO:{r:1658,rd:92},BEA:{r:1578,rd:142},
  GAS:{r:1664,rd:88},COL:{r:1542,rd:162},HUL:{r:1702,rd:85},BOR:{r:1542,rd:168},
  PER:{r:1648,rd:98},BOT:{r:1622,rd:112},
};

// Bayesian GP affinity priors (circuit type × driver)
export const GP0: Record<string, Record<string, number>> = {
  RUS:{hybrid:1.008,power:1.010,technical:1.008,street:0.996},
  ANT:{hybrid:1.002,power:1.002,technical:1.004,street:1.008},
  LEC:{hybrid:1.002,power:0.994,technical:1.010,street:1.040},
  HAM:{hybrid:1.010,power:1.002,technical:1.018,street:0.994},
  NOR:{hybrid:1.010,power:1.008,technical:1.016,street:1.002},
  PIA:{hybrid:1.004,power:1.002,technical:1.004,street:1.002},
  VER:{hybrid:1.008,power:1.018,technical:1.010,street:0.984},
  HAD:{hybrid:1.002,power:1.004,technical:1.004,street:0.998},
  LAW:{hybrid:1.002,power:1.002,technical:1.006,street:0.992},
  LIN:{hybrid:1.0,power:1.0,technical:1.0,street:1.0},
  ALO:{hybrid:1.004,power:0.994,technical:1.016,street:1.010},
  STR:{hybrid:0.998,power:0.996,technical:0.998,street:0.998},
  SAI:{hybrid:1.002,power:1.000,technical:1.008,street:1.010},
  ALB:{hybrid:1.000,power:0.998,technical:1.000,street:1.006},
  OCO:{hybrid:0.998,power:0.994,technical:0.998,street:1.008},
  BEA:{hybrid:1.002,power:1.002,technical:1.002,street:1.002},
  GAS:{hybrid:1.000,power:0.996,technical:1.000,street:1.010},
  COL:{hybrid:0.998,power:0.996,technical:0.998,street:1.000},
  HUL:{hybrid:1.000,power:1.010,technical:1.002,street:0.994},
  BOR:{hybrid:1.0,power:1.0,technical:1.0,street:1.0},
  PER:{hybrid:0.998,power:0.998,technical:0.994,street:0.996},
  BOT:{hybrid:0.996,power:0.994,technical:0.994,street:0.994},
};

export const TEAM_PACE: Record<string, number> = {
  "Mercedes":0.968,"Ferrari":0.960,"McLaren":0.956,"Red Bull":0.940,
  "Haas":0.934,"Alpine":0.930,"Racing Bulls":0.932,"Williams":0.926,
  "Audi":0.920,"Cadillac":0.900,"Aston Martin":0.918,
};

export const DNF_BASE: Record<string, number> = {
  RUS:0.020,ANT:0.048,LEC:0.034,HAM:0.020,NOR:0.026,PIA:0.030,
  VER:0.024,HAD:0.044,LAW:0.038,LIN:0.050,ALO:0.028,STR:0.040,
  SAI:0.026,ALB:0.030,OCO:0.030,BEA:0.048,GAS:0.032,COL:0.048,
  HUL:0.030,BOR:0.050,PER:0.032,BOT:0.034,
};

export const PIT_LOSS: Record<string, number> = {
  "Mercedes":22.4,"Ferrari":22.8,"McLaren":22.6,"Red Bull":23.1,
  "Racing Bulls":23.4,"Aston Martin":24.2,"Williams":24.0,"Haas":24.5,
  "Alpine":24.1,"Audi":25.2,"Cadillac":26.0,
};

export const PTS10 = [25,18,15,12,10,8,6,4,2,1];
export const PTS3  = [3,2,1];

// Seed race results (fallback if Ergast API unavailable)
export const SEED_RESULTS = [
  {round:1,raceName:"Australian Grand Prix",date:"2026-03-08",results:[
    {driverCode:"RUS",pos:1},{driverCode:"ANT",pos:2},{driverCode:"LEC",pos:3},
    {driverCode:"HAM",pos:4},{driverCode:"NOR",pos:5},{driverCode:"VER",pos:6},
    {driverCode:"BEA",pos:7},{driverCode:"LIN",pos:8},{driverCode:"BOR",pos:9},{driverCode:"GAS",pos:10},
  ]},
  {round:2,raceName:"Chinese Grand Prix",date:"2026-03-15",results:[
    {driverCode:"ANT",pos:1},{driverCode:"RUS",pos:2},{driverCode:"HAM",pos:3},
    {driverCode:"LEC",pos:4},{driverCode:"BEA",pos:5},{driverCode:"GAS",pos:6},
    {driverCode:"LAW",pos:7},{driverCode:"HAD",pos:8},{driverCode:"SAI",pos:9},{driverCode:"COL",pos:10},
  ]},
  {round:3,raceName:"Japanese Grand Prix",date:"2026-03-29",results:[
    {driverCode:"ANT",pos:1},{driverCode:"PIA",pos:2},{driverCode:"LEC",pos:3},
    {driverCode:"RUS",pos:4},{driverCode:"NOR",pos:5},{driverCode:"HAM",pos:6},
    {driverCode:"GAS",pos:7},{driverCode:"VER",pos:8},{driverCode:"LAW",pos:9},{driverCode:"OCO",pos:10},
  ]},
  {round:6,raceName:"Miami Grand Prix",date:"2026-05-03",results:[
    {driverCode:"NOR",pos:1},{driverCode:"PIA",pos:2},{driverCode:"LEC",pos:3},
    {driverCode:"VER",pos:4},{driverCode:"HAM",pos:5},{driverCode:"RUS",pos:6},
    {driverCode:"ANT",pos:7},{driverCode:"SAI",pos:8},{driverCode:"ALB",pos:9},{driverCode:"ALO",pos:10},
  ]},
];

export type RaceResult = { driverCode: string; pos: number };
export type RaceData   = { round: number; raceName: string; date: string; results: RaceResult[] };
