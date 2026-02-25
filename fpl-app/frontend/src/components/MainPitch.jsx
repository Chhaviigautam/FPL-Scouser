import { useState } from "react";
import { useGameweek } from "../hooks/useGameweek";

// ─── TEAM KIT COLORS ──────────────────────────────────────────────────────────
const KITS = {
  LIV: { p: "#C8102E", s: "#00B2A9" },
  ARS: { p: "#EF0107", s: "#063672" },
  MCI: { p: "#6CABDD", s: "#1C2C5B" },
  CHE: { p: "#034694", s: "#034694" },
  TOT: { p: "#EFEFEF", s: "#132257" },
  AVL: { p: "#670E36", s: "#95BFE5" },
  NEW: { p: "#101010", s: "#FFFFFF" },
  BRE: { p: "#E30613", s: "#FFFFFF" },
  EVE: { p: "#003399", s: "#FFFFFF" },
  CRY: { p: "#1B458F", s: "#C4122E" },
  FUL: { p: "#FFFFFF", s: "#CC0000" },
  MUN: { p: "#DA291C", s: "#FBE122" },
  BHA: { p: "#0057B8", s: "#FFCD00" },
  SOU: { p: "#D71920", s: "#130C0E" },
};

// ─── FPL-ACCURATE SHIRT SVG ───────────────────────────────────────────────────
function Shirt({ team, size = 52, captain = false, vice = false }) {
  const k = KITS[team] || { p: "#555", s: "#333" };
  const w = size;
  const h = size * 1.12;

  return (
    <svg width={w} height={h} viewBox="0 0 100 112" fill="none"
      style={{ filter: "drop-shadow(0px 5px 10px rgba(0,0,0,0.55))", overflow: "visible" }}>

      {/* Left sleeve */}
      <path d="M8 28 L26 16 L38 42 L20 50 Z" fill={k.s} stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"/>
      {/* Right sleeve */}
      <path d="M92 28 L74 16 L62 42 L80 50 Z" fill={k.s} stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"/>
      {/* Main body */}
      <path d="M26 16 L38 8 Q48 3 50 3 Q52 3 62 8 L74 16 L80 50 L76 108 L24 108 L20 50 Z"
        fill={k.p} stroke="rgba(0,0,0,0.15)" strokeWidth="0.7"/>
      {/* Collar */}
      <path d="M40 9 Q46 2 50 1 Q54 2 60 9 Q56 17 50 17 Q44 17 40 9 Z"
        fill={k.s} stroke="rgba(0,0,0,0.2)" strokeWidth="0.6"/>
      {/* Gloss */}
      <path d="M38 24 Q50 18 60 24 L62 68 Q50 73 38 68 Z" fill="rgba(255,255,255,0.06)"/>
      {/* Side seams */}
      <path d="M24 50 L28 108 L24 108 L20 50Z" fill="rgba(0,0,0,0.08)"/>
      <path d="M76 50 L72 108 L76 108 L80 50Z" fill="rgba(0,0,0,0.08)"/>

      {/* Captain / Vice badge */}
      {(captain || vice) && (
        <>
          <circle cx="50" cy="42" r="11"
            fill={captain ? "#F5C518" : "rgba(255,255,255,0.88)"}
            stroke="rgba(0,0,0,0.15)" strokeWidth="0.8"/>
          <text x="50" y="46.5" textAnchor="middle" fontSize="12" fontWeight="900"
            fill={captain ? "#1a0a00" : "#1a1a1a"} fontFamily="Arial Black, sans-serif">
            {captain ? "C" : "V"}
          </text>
        </>
      )}
    </svg>
  );
}

// ─── SQUAD DATA ───────────────────────────────────────────────────────────────
const SQUAD = {
  GK: [
    { id:1,  name:"Flekken",    web:"FLEKKEN",    team:"BRE", pos:"GK",  price:4.5,  gwPts:6,  pts:42,  goals:0,  assists:0,  captain:false, vice:false, injured:false },
  ],
  DEF: [
    { id:2,  name:"T-Arnold",   web:"T-ARNOLD",   team:"LIV", pos:"DEF", price:7.2,  gwPts:9,  pts:118, goals:3,  assists:9,  captain:false, vice:false, injured:false },
    { id:3,  name:"Saliba",     web:"SALIBA",     team:"ARS", pos:"DEF", price:5.9,  gwPts:6,  pts:96,  goals:2,  assists:1,  captain:false, vice:false, injured:false },
    { id:4,  name:"P.Porro",    web:"P.PORRO",    team:"TOT", pos:"DEF", price:5.8,  gwPts:8,  pts:89,  goals:2,  assists:5,  captain:false, vice:false, injured:false },
    { id:5,  name:"Mykolenko",  web:"MYKOLENKO",  team:"EVE", pos:"DEF", price:4.5,  gwPts:2,  pts:54,  goals:1,  assists:2,  captain:false, vice:false, injured:true  },
  ],
  MID: [
    { id:6,  name:"Salah",      web:"SALAH",      team:"LIV", pos:"MID", price:13.2, gwPts:13, pts:242, goals:18, assists:11, captain:true,  vice:false, injured:false },
    { id:7,  name:"Palmer",     web:"PALMER",     team:"CHE", pos:"MID", price:11.0, gwPts:8,  pts:244, goals:22, assists:11, captain:false, vice:true,  injured:false },
    { id:8,  name:"Mbeumo",     web:"MBEUMO",     team:"BRE", pos:"MID", price:7.8,  gwPts:5,  pts:152, goals:13, assists:5,  captain:false, vice:false, injured:false },
  ],
  FWD: [
    { id:9,  name:"Haaland",    web:"HAALAND",    team:"MCI", pos:"FWD", price:14.5, gwPts:12, pts:231, goals:27, assists:5,  captain:false, vice:false, injured:false },
    { id:10, name:"Watkins",    web:"WATKINS",    team:"AVL", pos:"FWD", price:9.0,  gwPts:6,  pts:195, goals:19, assists:12, captain:false, vice:false, injured:false },
    { id:11, name:"Isak",       web:"ISAK",       team:"NEW", pos:"FWD", price:8.8,  gwPts:15, pts:182, goals:21, assists:5,  captain:false, vice:false, injured:false },
  ],
  bench: [
    { id:12, name:"Flaherty",   web:"FLAHERTY",   team:"CRY", pos:"GK",  price:4.0,  gwPts:2,  pts:21,  goals:0,  assists:0,  captain:false, vice:false, injured:false },
    { id:13, name:"Myko B",     web:"MYKO-B",     team:"EVE", pos:"DEF", price:4.3,  gwPts:0,  pts:32,  goals:0,  assists:1,  captain:false, vice:false, injured:false },
    { id:14, name:"Andreas",    web:"ANDREAS",    team:"FUL", pos:"MID", price:5.5,  gwPts:6,  pts:88,  goals:3,  assists:7,  captain:false, vice:false, injured:false },
    { id:15, name:"Wissa",      web:"WISSA",      team:"BRE", pos:"FWD", price:6.2,  gwPts:3,  pts:94,  goals:8,  assists:4,  captain:false, vice:false, injured:false },
  ],
};

const POS_BG = { GK:"#EBFF00", DEF:"#00FF87", MID:"#05F0FF", FWD:"#FF4D4D" };
const POS_TX = { GK:"#1a1a00", DEF:"#001a0e", MID:"#001a1a", FWD:"#1a0000" };

// ─── PLAYER CARD ─────────────────────────────────────────────────────────────
function Card({ p, small = false }) {
  const [hover, setHover] = useState(false);
  const sz = small ? 44 : 54;
  const w  = small ? 70 : 82;

  const ptsBg =
    p.gwPts >= 12 ? "#ebff00"
    : p.gwPts >= 9  ? "#39ff14"
    : p.gwPts >= 6  ? "rgba(255,255,255,0.22)"
    : "rgba(255,255,255,0.09)";
  const ptsTx = p.gwPts >= 6 ? "#0a1a00" : "rgba(255,255,255,0.65)";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        width: w, cursor: "pointer", position: "relative",
        transform: hover ? "translateY(-6px) scale(1.05)" : "none",
        transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: hover ? 30 : 1,
      }}
    >
      <div style={{ position: "relative" }}>
        <Shirt team={p.team} size={sz} captain={p.captain} vice={p.vice} />
        {p.injured && (
          <div style={{
            position:"absolute", bottom:4, right:0,
            width:12, height:12, borderRadius:"50%",
            background:"#FF4444", border:"2px solid #fff",
            boxShadow:"0 0 6px rgba(255,68,68,0.8)",
          }}/>
        )}
      </div>

      {/* Name badge */}
      <div style={{
        marginTop: 4,
        background: "rgba(255,255,255,0.93)",
        borderRadius: 3,
        padding: small ? "2px 4px" : "2px 6px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
      }}>
        <div style={{
          fontSize: small ? 9 : 10.5,
          fontWeight: 800,
          color: "#1a1e2e",
          letterSpacing: "0.01em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif",
          textTransform: "uppercase",
        }}>
          {p.web}
        </div>
      </div>

      {/* Points badge */}
      <div style={{
        marginTop: 2,
        background: ptsBg,
        borderRadius: 3,
        padding: small ? "1px 4px" : "1px 6px",
        width: "100%",
        textAlign: "center",
        transition: "background 0.2s",
      }}>
        <div style={{
          fontSize: small ? 9 : 10.5,
          fontWeight: 900,
          color: ptsTx,
          fontFamily: "'Barlow Condensed', 'Arial Narrow', monospace",
          letterSpacing: "0.02em",
        }}>
          {small ? p.gwPts : `${p.gwPts} pts`}
        </div>
      </div>

      {/* Tooltip */}
      {hover && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 12px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#111827",
          border: "1px solid rgba(5,240,255,0.18)",
          borderRadius: 10,
          padding: "10px 12px",
          whiteSpace: "nowrap",
          zIndex: 999,
          boxShadow: "0 12px 36px rgba(0,0,0,0.8)",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 900, color: "#fff",
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: "uppercase", letterSpacing: "0.06em",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: 5, marginBottom: 7,
          }}>
            {p.name}
            <span style={{
              marginLeft: 7, fontSize: 9,
              background: POS_BG[p.pos], color: POS_TX[p.pos],
              borderRadius: 3, padding: "1px 5px", fontWeight: 800,
            }}>
              {p.pos}
            </span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px 14px" }}>
            {[["⚽","Goals",p.goals],["🎯","Assists",p.assists],["£","Price",`${p.price}m`],["★","Season",`${p.pts}pts`]].map(([ico,lbl,val])=>(
              <div key={lbl}>
                <div style={{fontSize:8.5,color:"rgba(255,255,255,0.3)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>{ico} {lbl}</div>
                <div style={{fontSize:13,fontWeight:800,color:"#05f0ff",fontFamily:"monospace"}}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{
            position:"absolute",bottom:-5,left:"50%",
            transform:"translateX(-50%) rotate(45deg)",
            width:8,height:8,background:"#111827",
            borderRight:"1px solid rgba(5,240,255,0.18)",
            borderBottom:"1px solid rgba(5,240,255,0.18)",
          }}/>
        </div>
      )}
    </div>
  );
}

// ─── ROW OF PLAYERS ───────────────────────────────────────────────────────────
function Row({ players }) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-evenly",
      alignItems:"flex-start", width:"100%",
      padding:"16px 20px 6px",
    }}>
      {players.map(p => <Card key={p.id} p={p}/>)}
    </div>
  );
}

// ─── MAIN PITCH COMPONENT ─────────────────────────────────────────────────────
export default function MainPitch() {
  const xiPlayers      = [...SQUAD.GK,...SQUAD.DEF,...SQUAD.MID,...SQUAD.FWD];
  const gwTotal        = xiPlayers.reduce((a,p) => a + (p.captain ? p.gwPts * 2 : p.gwPts), 0);
  const { gw, loading} = useGameweek();
  const gwLabel        = loading ? "···" : gw ? `GAMEWEEK ${gw}` : "PREMIER LEAGUE";

  return (
    <div style={{ width:"100%", maxWidth:660, margin:"0 auto", fontFamily:"'Barlow Condensed',sans-serif" }}>

      {/* Header bar */}
      <div style={{
        background:"linear-gradient(135deg,#06101c,#0e1d30)",
        borderRadius:"14px 14px 0 0",
        padding:"10px 18px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            background:"linear-gradient(135deg,#05f0ff,#0090ff)",
            borderRadius:7, padding:"4px 10px",
            fontSize:12, fontWeight:900, color:"#001a2e", letterSpacing:"0.04em",
          }}>
            Fantasy
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,0.9)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Premier League</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.35)",fontFamily:"monospace",letterSpacing:"0.1em"}}>{gwLabel}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:28,fontWeight:900,color:"#05f0ff",lineHeight:1}}>{gwTotal}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>GW POINTS</div>
        </div>
      </div>

      {/* Pitch */}
      <div style={{ position:"relative", overflow:"hidden" }}>
        {/* Striped grass */}
        <div style={{
          position:"absolute",inset:0,
          backgroundImage:`repeating-linear-gradient(180deg,#1b6b1b 0px,#1b6b1b 40px,#1e7520 40px,#1e7520 80px)`,
        }}/>

        {/* Pitch markings */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}
          viewBox="0 0 660 490" preserveAspectRatio="xMidYMid slice">
          <rect x="16" y="8" width="628" height="474" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
          <line x1="16" y1="245" x2="644" y2="245" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <circle cx="330" cy="245" r="64" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <circle cx="330" cy="245" r="2.5" fill="rgba(255,255,255,0.3)"/>
          <rect x="178" y="8" width="304" height="96" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <rect x="254" y="8" width="152" height="40" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1"/>
          <circle cx="330" cy="76" r="2" fill="rgba(255,255,255,0.25)"/>
          <path d="M282 104 Q330 136 378 104" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <rect x="178" y="386" width="304" height="96" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <rect x="254" y="442" width="152" height="40" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1"/>
          <circle cx="330" cy="414" r="2" fill="rgba(255,255,255,0.25)"/>
          <path d="M282 386 Q330 354 378 386" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          {[[16,8],[644,8],[16,482],[644,482]].map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          ))}
        </svg>

        {/* Players — FWD at top, GK at bottom */}
        <div style={{ position:"relative", zIndex:2, paddingTop:4, paddingBottom:4 }}>
          <Row players={SQUAD.FWD}/>
          <Row players={SQUAD.MID}/>
          <Row players={SQUAD.DEF}/>
          <Row players={SQUAD.GK} />
        </div>
      </div>

      {/* Bench */}
      <div style={{
        background:"linear-gradient(180deg,#0c1520,#0a1118)",
        borderRadius:"0 0 14px 14px",
        padding:"10px 16px 16px",
        border:"1px solid rgba(255,255,255,0.06)",
        borderTop:"none",
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
          <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.08)"}}/>
          <span style={{
            fontSize:9.5,fontWeight:800,color:"rgba(255,255,255,0.3)",
            textTransform:"uppercase",letterSpacing:"0.2em",fontFamily:"monospace",
          }}>Bench</span>
          <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.08)"}}/>
        </div>
        <div style={{
          display:"flex", justifyContent:"space-evenly", alignItems:"flex-start",
          background:"rgba(255,255,255,0.025)",
          borderRadius:10,
          border:"1px dashed rgba(255,255,255,0.09)",
          padding:"12px 8px 10px",
        }}>
          {SQUAD.bench.map((p, i) => (
            <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{
                width:18,height:18,borderRadius:"50%",
                background:"rgba(255,255,255,0.1)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.4)",
                fontFamily:"monospace",
              }}>
                {i+1}
              </div>
              <Card p={p} small/>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}