export interface BuzzItem {
  platform: "reddit" | "x" | "news" | "planet";
  type: "hot" | "spicy" | "news";
  tag: string;
  text: string;
  votes: string;
  time: string;
  sub: string;
}

export const BUZZ: BuzzItem[] = [
  {platform:"reddit",type:"hot",tag:"🔥 HOT",text:"VER says the 2026 regs are <b>'fundamentally broken'</b> and hinting at retirement. This is not a drill. He literally said it feels like Mario Kart on steroids.",votes:"14.2k",time:"2h",sub:"r/formula1"},
  {platform:"x",type:"spicy",tag:"🌶️ SPICY",text:"Lambiase (VER's race engineer for 10 years) is joining McLaren. VER just lost his right hand man. Red Bull is in full meltdown mode.",votes:"8.9k RT",time:"4h",sub:"@f1reportinguk"},
  {platform:"reddit",type:"hot",tag:"🔥 HOT",text:"Hamilton says the 2026 cars are the <b>'purest wheel-to-wheel racing'</b> he's ever done. Meanwhile Verstappen: these cars are anti-racing. Never change F1.",votes:"11.3k",time:"5h",sub:"r/formula1"},
  {platform:"news",type:"news",tag:"📰 NEWS",text:"FIA confirms regulation tweaks for <b>Miami GP</b> — max recharge reduced from 8MJ to 7MJ, superclip power up to 350kW. Effective from R6.",votes:"ESPN",time:"Today",sub:"ESPN F1"},
  {platform:"reddit",type:"spicy",tag:"🌶️ SPICY",text:"Bearman P5 in China and P7 in Australia. Kid is massively overdelivering in what is clearly a midfield car. Haas found a gem.",votes:"7.4k",time:"3d",sub:"r/formula1"},
  {platform:"x",type:"hot",tag:"🔥 HOT",text:"Antonelli is <b>19 years old</b> and leading the F1 championship with 2 wins in 3 races. Youngest championship leader in history. This kid is different.",votes:"22.1k RT",time:"3w",sub:"@MercedesAMGF1"},
  {platform:"planet",type:"news",tag:"📰 NEWS",text:"Wolff responds to Verstappen retirement rumours: <b>'Max loves racing too much to walk away'</b>. But sources say Red Bull are already considering who to call.",votes:"PlanetF1",time:"1d",sub:"PlanetF1"},
  {platform:"reddit",type:"spicy",tag:"🌶️ SPICY",text:"Aston Martin: 0 points from 3 races. Adrian Newey's first season as TP and they're absolute backmarkers. Has anyone checked on him.",votes:"9.8k",time:"3w",sub:"r/formula1"},
  {platform:"x",type:"hot",tag:"🔥 HOT",text:"Red Bull's new TP Laurent Mekies reworked the entire technical structure. That car is fundamentally flawed for the new regs and everyone knows it.",votes:"6.2k RT",time:"2d",sub:"@andybullf1"},
  {platform:"news",type:"news",tag:"📰 NEWS",text:"Miami GP: FIA to <b>test revised race start procedure</b> — safety car deployment probability also increased to reduce closing speed accidents.",votes:"Sky F1",time:"Today",sub:"Sky Sports F1"},
  {platform:"reddit",type:"spicy",tag:"🌶️ SPICY",text:"PSA: The Iran war cancelled 2 F1 races and Bahrain held <b>pre-season testing</b> but no race. The geopolitical impact on sports is insane in 2026.",votes:"5.1k",time:"5w",sub:"r/formula1"},
  {platform:"planet",type:"hot",tag:"🔥 HOT",text:"Sainz just got on the podium at Imola driving a <b>Williams</b>. Let that sink in. He chose the right team at exactly the right time.",votes:"3.4k",time:"prev",sub:"PlanetF1"},
];
