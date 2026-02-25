import { useState } from "react";

// ─── KIT COLORS ───────────────────────────────────────────────────────────────
const KITS = {
  ARS:{ p:"#EF0107",s:"#063672" }, AVL:{ p:"#670E36",s:"#95BFE5" },
  BHA:{ p:"#0057B8",s:"#FFCD00" }, BOU:{ p:"#DA291C",s:"#000000" },
  BRE:{ p:"#E30613",s:"#FFFFFF" }, CHE:{ p:"#034694",s:"#034694" },
  CRY:{ p:"#1B458F",s:"#C4122E" }, EVE:{ p:"#003399",s:"#FFFFFF" },
  FUL:{ p:"#FFFFFF",s:"#CC0000" }, IPS:{ p:"#0044A9",s:"#FFFFFF" },
  LEI:{ p:"#003090",s:"#FDBE11" }, LIV:{ p:"#C8102E",s:"#00B2A9" },
  MCI:{ p:"#6CABDD",s:"#1C2C5B" }, MUN:{ p:"#DA291C",s:"#FBE122" },
  NEW:{ p:"#101010",s:"#FFFFFF" }, NFO:{ p:"#DD0000",s:"#FFFFFF" },
  SOU:{ p:"#D71920",s:"#130C0E" }, TOT:{ p:"#EFEFEF",s:"#132257" },
  WHU:{ p:"#7A263A",s:"#1BB1E7" }, WOL:{ p:"#FDB913",s:"#231F20" },
};

// Only Premier League data is available in this app.
// The other competitions are greyed out / coming soon.
const LEAGUES = [
  { id:"pl",     name:"Premier League",   country:"England", accent:"#38003c", text:"#00ff85", active:true  },
  { id:"ucl",    name:"Champions League", country:"Europe",  accent:"#2a2a3a", text:"#555577", active:false },
  { id:"laliga", name:"La Liga",          country:"Spain",   accent:"#3a2a10", text:"#664400", active:false },
  { id:"bl",     name:"Bundesliga",       country:"Germany", accent:"#3a1010", text:"#663333", active:false },
  { id:"sa",     name:"Serie A",          country:"Italy",   accent:"#101030", text:"#333366", active:false },
  { id:"el",     name:"Europa League",    country:"Europe",  accent:"#2a2010", text:"#554400", active:false },
];

const PL_TEAMS = [
  { id:1,  name:"Arsenal",        abbr:"ARS", kit:"ARS", pos:1,  pts:82 },
  { id:2,  name:"Liverpool",      abbr:"LIV", kit:"LIV", pos:2,  pts:79 },
  { id:3,  name:"Man City",       abbr:"MCI", kit:"MCI", pos:3,  pts:74 },
  { id:4,  name:"Chelsea",        abbr:"CHE", kit:"CHE", pos:4,  pts:67 },
  { id:5,  name:"Aston Villa",    abbr:"AVL", kit:"AVL", pos:5,  pts:65 },
  { id:6,  name:"Tottenham",      abbr:"TOT", kit:"TOT", pos:6,  pts:60 },
  { id:7,  name:"Newcastle",      abbr:"NEW", kit:"NEW", pos:7,  pts:57 },
  { id:8,  name:"Brighton",       abbr:"BHA", kit:"BHA", pos:8,  pts:51 },
  { id:9,  name:"Brentford",      abbr:"BRE", kit:"BRE", pos:9,  pts:48 },
  { id:10, name:"Fulham",         abbr:"FUL", kit:"FUL", pos:10, pts:46 },
  { id:11, name:"Man United",     abbr:"MUN", kit:"MUN", pos:11, pts:42 },
  { id:12, name:"Wolves",         abbr:"WOL", kit:"WOL", pos:12, pts:44 },
  { id:13, name:"West Ham",       abbr:"WHU", kit:"WHU", pos:13, pts:38 },
  { id:14, name:"Everton",        abbr:"EVE", kit:"EVE", pos:14, pts:37 },
  { id:15, name:"Crystal Palace", abbr:"CRY", kit:"CRY", pos:15, pts:36 },
  { id:16, name:"Nottm Forest",   abbr:"NFO", kit:"NFO", pos:16, pts:35 },
  { id:17, name:"Bournemouth",    abbr:"BOU", kit:"BOU", pos:17, pts:33 },
  { id:18, name:"Leicester",      abbr:"LEI", kit:"LEI", pos:18, pts:28 },
  { id:19, name:"Ipswich",        abbr:"IPS", kit:"IPS", pos:19, pts:22 },
  { id:20, name:"Southampton",    abbr:"SOU", kit:"SOU", pos:20, pts:13 },
];

// ─── MINI SHIRT BADGE ─────────────────────────────────────────────────────────
function MiniShirt({ kit, size = 26 }) {
  const k = KITS[kit] || { p:"#555", s:"#333" };
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 100 105" fill="none"
      style={{ flexShrink:0, filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
      <path d="M8 28 L26 16 L35 36 L18 44 Z"        fill={k.s} stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
      <path d="M92 28 L74 16 L65 36 L82 44 Z"       fill={k.s} stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
      <path d="M26 16 L38 8 Q50 3 62 8 L74 16 L80 48 L76 102 L24 102 L20 48 Z"
        fill={k.p} stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
      <path d="M40 9 Q50 1 60 9 Q56 17 50 17 Q44 17 40 9 Z" fill={k.s}/>
    </svg>
  );
}

// ─── LEAGUE ICON ─────────────────────────────────────────────────────────────
function LeagueIcon({ lg, size = 28 }) {
  const label = { pl:"PL", ucl:"UCL", laliga:"LL", bl:"BL", sa:"SA", el:"EL" }[lg.id] || lg.id.toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink:0,
      background: lg.accent,
      display:"flex", alignItems:"center", justifyContent:"center",
      border:"1px solid rgba(255,255,255,0.1)",
      boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
    }}>
      <span style={{
        fontSize: 8, fontWeight:900, color: lg.text,
        fontFamily:"'Barlow Condensed',sans-serif",
        letterSpacing:"0.04em", textTransform:"uppercase",
        lineHeight:1, textAlign:"center", padding:"0 2px",
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// Props: activeTeam (number|null), setActiveTeam (function)
export default function SidebarLeft({ activeTeam, setActiveTeam }) {
  const [activeLeague, setActiveLeague] = useState("pl");
  const [viewMode,     setViewMode]     = useState("list");

  return (
    <aside style={{
      width: 230,
      height:"100vh",
      background:"linear-gradient(180deg,#06101c 0%,#080f1a 100%)",
      borderRight:"1px solid rgba(5,240,255,0.08)",
      display:"flex", flexDirection:"column",
      position:"sticky", top:0,
      overflowY:"auto", overflowX:"hidden",
      scrollbarWidth:"none",
      flexShrink:0,
    }}>

      {/* Competitions header */}
      <div style={{
        padding:"14px 14px 8px",
        background:"linear-gradient(135deg,#06101c,#0a1a2e)",
        borderBottom:"1px solid rgba(5,240,255,0.07)",
        flexShrink:0,
      }}>
        <div style={{
          fontSize:9, fontWeight:900, letterSpacing:"0.18em",
          color:"rgba(5,240,255,0.5)", textTransform:"uppercase",
          fontFamily:"'Barlow Condensed',monospace",
          marginBottom:8,
        }}>
          ✦ Competitions
        </div>

        {LEAGUES.map(lg => {
          const active   = activeLeague === lg.id;
          const enabled  = lg.active;
          return (
            <button key={lg.id}
              onClick={() => enabled && setActiveLeague(lg.id)}
              title={enabled ? lg.name : "Coming soon"}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"8px 10px", marginBottom:2,
                background: active ? "rgba(5,240,255,0.07)" : "transparent",
                border:"none",
                borderLeft: active ? "2.5px solid #05f0ff" : "2.5px solid transparent",
                borderRadius:"0 6px 6px 0",
                cursor: enabled ? "pointer" : "not-allowed",
                opacity: enabled ? 1 : 0.32,
                transition:"all 0.14s ease",
              }}
              onMouseEnter={e=>{ if(enabled && !active) e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
              onMouseLeave={e=>{ if(enabled && !active) e.currentTarget.style.background="transparent"; }}
            >
              <LeagueIcon lg={lg} />
              <div style={{ textAlign:"left", flex:1, minWidth:0 }}>
                <div style={{
                  fontSize:12, fontWeight: active ? 800 : 600,
                  color: active ? "#fff" : enabled ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)",
                  fontFamily:"'Barlow Condensed',sans-serif",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  transition:"color 0.14s",
                }}>
                  {lg.name}
                </div>
                <div style={{fontSize:9.5, color: enabled ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.15)", fontFamily:"monospace", marginTop:1}}>
                  {enabled ? lg.country : "Coming soon"}
                </div>
              </div>
              {active && (
                <div style={{
                  width:5, height:5, borderRadius:"50%",
                  background:"#05f0ff", boxShadow:"0 0 6px #05f0ff",
                  flexShrink:0,
                }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Teams section */}
      <div style={{ flex:1, padding:"10px 0 16px" }}>
        {/* Section header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 14px", marginBottom:6,
        }}>
          <div style={{
            fontSize:9, fontWeight:900, letterSpacing:"0.18em",
            color:"rgba(5,240,255,0.5)", textTransform:"uppercase",
            fontFamily:"'Barlow Condensed',monospace",
          }}>
            ✦ PL Teams
          </div>
          {/* List / Table toggle */}
          <div style={{
            display:"flex", borderRadius:5, overflow:"hidden",
            border:"1px solid rgba(5,240,255,0.15)",
          }}>
            {["list","table"].map(m=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{
                padding:"2px 8px",
                background: viewMode===m ? "rgba(5,240,255,0.15)" : "transparent",
                border:"none", cursor:"pointer",
                fontSize:8.5, fontWeight:800,
                color: viewMode===m ? "#05f0ff" : "rgba(255,255,255,0.3)",
                fontFamily:"'Barlow Condensed',monospace",
                textTransform:"uppercase", letterSpacing:"0.08em",
                transition:"all 0.12s",
              }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Table view */}
        {viewMode === "table" && (
          <div style={{ margin:"0 10px 4px", borderRadius:8, overflow:"hidden", border:"1px solid rgba(5,240,255,0.1)" }}>
            <div style={{
              display:"grid", gridTemplateColumns:"20px 1fr 32px",
              gap:"0 8px", padding:"5px 10px",
              background:"rgba(5,240,255,0.06)",
              borderBottom:"1px solid rgba(5,240,255,0.08)",
            }}>
              {["#","Club","Pts"].map((h,i)=>(
                <div key={h} style={{
                  fontSize:8.5, fontWeight:900, color:"rgba(5,240,255,0.5)",
                  letterSpacing:"0.12em", textTransform:"uppercase",
                  fontFamily:"'Barlow Condensed',monospace",
                  textAlign: i===2 ? "right" : "left",
                }}>
                  {h}
                </div>
              ))}
            </div>
            {PL_TEAMS.map(team=>{
              const active = activeTeam===team.id;
              const posColor = team.pos<=4 ? "#00ff87" : team.pos>=18 ? "#ff4d4d" : "rgba(255,255,255,0.3)";
              return (
                <button key={team.id} onClick={()=>setActiveTeam(active ? null : team.id)}
                  style={{
                    width:"100%",
                    display:"grid", gridTemplateColumns:"20px 1fr 32px",
                    gap:"0 8px", padding:"5px 10px",
                    background: active ? "rgba(5,240,255,0.07)" : "transparent",
                    border:"none",
                    borderLeft: active ? "2px solid #05f0ff" : "2px solid transparent",
                    cursor:"pointer", transition:"background 0.1s",
                    alignItems:"center",
                  }}
                >
                  <span style={{fontSize:9.5,fontWeight:800,color:posColor,fontFamily:"'Barlow Condensed',monospace",textAlign:"right"}}>
                    {team.pos}
                  </span>
                  <span style={{
                    fontSize:11.5, fontWeight:active?800:600,
                    color: active?"#fff":"rgba(255,255,255,0.65)",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    textAlign:"left", overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap",
                    textTransform:"uppercase", letterSpacing:"0.03em",
                  }}>
                    {team.name}
                  </span>
                  <span style={{
                    fontSize:11, fontWeight:700,
                    color:"rgba(255,255,255,0.75)",
                    fontFamily:"'Barlow Condensed',monospace",
                    textAlign:"right",
                  }}>
                    {team.pts}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && PL_TEAMS.map(team=>{
          const active = activeTeam===team.id;
          const posColor = team.pos<=4 ? "#00ff87" : team.pos>=18 ? "#ff4d4d" : "rgba(255,255,255,0.28)";
          return (
            <button key={team.id} onClick={()=>setActiveTeam(active ? null : team.id)}
              style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:9, padding:"6px 14px",
                background: active ? "rgba(5,240,255,0.07)" : "transparent",
                border:"none",
                borderLeft: active ? "2.5px solid #05f0ff" : "2.5px solid transparent",
                cursor:"pointer", transition:"all 0.12s",
              }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{
                fontSize:9, fontWeight:900, color:posColor,
                fontFamily:"'Barlow Condensed',monospace",
                width:13, textAlign:"right", flexShrink:0,
              }}>
                {team.pos}
              </span>
              <MiniShirt kit={team.kit} size={24}/>
              <span style={{
                fontSize:12, fontWeight: active?800:600,
                color: active?"#fff":"rgba(255,255,255,0.62)",
                fontFamily:"'Barlow Condensed',sans-serif",
                flex:1, overflow:"hidden", textOverflow:"ellipsis",
                whiteSpace:"nowrap", textTransform:"uppercase",
                letterSpacing:"0.03em", transition:"color 0.12s",
              }}>
                {team.name}
              </span>
              <span style={{
                fontSize:10.5, fontWeight:700,
                color: active?"rgba(5,240,255,0.8)":"rgba(255,255,255,0.3)",
                fontFamily:"'Barlow Condensed',monospace", flexShrink:0,
              }}>
                {team.pts}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&display=swap');
      `}</style>
    </aside>
  );
}