import { useState, useEffect } from "react";
import { useGameweek } from "../hooks/useGameweek";
import { api } from "../api/client";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SCORES = [
  { id:1, h:"Arsenal",   hs:"ARS", hc:"#EF0107", hg:3, a:"Spurs",    as_:"TOT", ac:"#132257", ag:1, min:"67'",  live:true,  upcoming:false },
  { id:2, h:"Liverpool", hs:"LIV", hc:"#C8102E", hg:2, a:"Man City", as_:"MCI", ac:"#6CABDD", ag:2, min:"45'",  live:true,  upcoming:false },
  { id:3, h:"Chelsea",   hs:"CHE", hc:"#034694", hg:1, a:"Newcastle",as_:"NEW", ac:"#101010", ag:0, min:"FT",   live:false, upcoming:false },
  { id:4, h:"Man Utd",   hs:"MUN", hc:"#DA291C", hg:0, a:"Everton",  as_:"EVE", ac:"#003399", ag:0, min:"19:00",live:false, upcoming:true  },
  { id:5, h:"Wolves",    hs:"WOL", hc:"#FDB913", hg:0, a:"Brentford",as_:"BRE", ac:"#E30613", ag:0, min:"21:00",live:false, upcoming:true  },
];

const NEWS = [
  { id:1, cat:"FPL",      hot:true,  icon:"🔥", headline:"Palmer overtakes Haaland as highest-owned premium this GW", time:"12 min ago" },
  { id:2, cat:"INJURY",   hot:false, icon:"🩹", headline:"Haaland doubtful after ankle knock in training", time:"34 min ago" },
  { id:3, cat:"FORM",     hot:false, icon:"📊", headline:"Isak's xG run rate is now the best in the Premier League", time:"1 hr ago"  },
  { id:4, cat:"FPL",      hot:false, icon:"👑", headline:"3.1m managers captained Salah — 13 pts returned vs Bournemouth", time:"2 hr ago" },
  { id:5, cat:"TRANSFER", hot:false, icon:"🚀", headline:"Watkins surges to 20 league goals — FPL price rockets", time:"3 hr ago"  },
  { id:6, cat:"FPL",      hot:false, icon:"🎯", headline:"Differentials to consider for the final 3 Gameweeks", time:"4 hr ago"  },
  { id:7, cat:"INJURY",   hot:false, icon:"🩹", headline:"Saka faces late fitness test ahead of Manchester City clash", time:"5 hr ago"  },
];

const CAT = {
  FPL:      { bg:"rgba(0,255,135,0.1)",  text:"#00ff87", border:"rgba(0,255,135,0.2)"  },
  INJURY:   { bg:"rgba(255,77,77,0.1)",  text:"#ff4d4d", border:"rgba(255,77,77,0.2)"  },
  FORM:     { bg:"rgba(5,240,255,0.1)",  text:"#05f0ff", border:"rgba(5,240,255,0.2)"  },
  TRANSFER: { bg:"rgba(235,255,0,0.1)",  text:"#ebff00", border:"rgba(235,255,0,0.2)"  },
};

// ─── MINI SCORE CARD ──────────────────────────────────────────────────────────
function ScoreCard({ m }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:6,
        padding:"7px 10px",
        background: hov ? "rgba(5,240,255,0.06)" : m.live ? "rgba(5,240,255,0.03)" : "rgba(255,255,255,0.025)",
        borderRadius:7,
        border: m.live ? "1px solid rgba(5,240,255,0.12)" : "1px solid rgba(255,255,255,0.05)",
        cursor:"pointer", transition:"all 0.14s",
        position:"relative", overflow:"hidden",
      }}
    >
      {/* Home */}
      <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:0}}>
        <div style={{
          width:16,height:16,borderRadius:"50%", background:m.hc, flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:6.5,fontWeight:900,color:"#fff",
          fontFamily:"'Barlow Condensed',monospace",
          border:"1px solid rgba(255,255,255,0.15)",
        }}>{m.hs.slice(0,2)}</div>
        <span style={{
          fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.8)",
          fontFamily:"'Barlow Condensed',sans-serif",
          textTransform:"uppercase",letterSpacing:"0.03em",
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
        }}>{m.h}</span>
      </div>

      {/* Score */}
      <div style={{
        display:"flex",alignItems:"center",gap:4,flexShrink:0,
        padding:"2px 6px",
        background: m.live ? "rgba(5,240,255,0.08)" : m.upcoming ? "rgba(235,255,0,0.06)" : "rgba(255,255,255,0.05)",
        borderRadius:4,
      }}>
        {m.upcoming ? (
          <span style={{fontSize:9.5,fontWeight:800,color:"rgba(255,255,255,0.4)",fontFamily:"'Barlow Condensed',monospace"}}>{m.min}</span>
        ) : (
          <>
            <span style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',monospace",minWidth:8,textAlign:"right"}}>{m.hg}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>–</span>
            <span style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',monospace",minWidth:8,textAlign:"left"}}>{m.ag}</span>
          </>
        )}
      </div>

      {/* Away */}
      <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:0,justifyContent:"flex-end"}}>
        <span style={{
          fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.8)",
          fontFamily:"'Barlow Condensed',sans-serif",
          textTransform:"uppercase",letterSpacing:"0.03em",
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"right",
        }}>{m.a}</span>
        <div style={{
          width:16,height:16,borderRadius:"50%", background:m.ac, flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:6.5,fontWeight:900,color:"#fff",
          fontFamily:"'Barlow Condensed',monospace",
          border:"1px solid rgba(255,255,255,0.15)",
        }}>{m.as_.slice(0,2)}</div>
      </div>

      {/* Live dot */}
      {m.live && (
        <div style={{position:"absolute",top:4,right:5,display:"flex",alignItems:"center",gap:3}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"#05f0ff",boxShadow:"0 0 6px #05f0ff",animation:"livePulse 1.3s ease-in-out infinite"}}/>
          <span style={{fontSize:7.5,fontWeight:900,color:"#05f0ff",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.1em"}}>{m.min}</span>
        </div>
      )}
      {!m.live && !m.upcoming && (
        <div style={{position:"absolute",top:4,right:6,fontSize:7.5,fontWeight:800,color:"rgba(255,255,255,0.2)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.08em"}}>FT</div>
      )}
    </div>
  );
}

// ─── NEWS CARD ────────────────────────────────────────────────────────────────
function NewsCard({ item }) {
  const [hov, setHov] = useState(false);
  const c = CAT[item.cat] || CAT.FPL;
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex",gap:10, padding:"9px 0",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        cursor:"pointer", opacity: hov ? 0.82 : 1, transition:"opacity 0.14s",
      }}
    >
      <div style={{
        width:38,height:38,borderRadius:7,flexShrink:0,
        background:c.bg, border:`1px solid ${c.border}`,
        display:"flex",alignItems:"center",justifyContent:"center", fontSize:17,
      }}>{item.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
          <span style={{fontSize:8.5,fontWeight:900,color:c.text,fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.12em",textTransform:"uppercase"}}>{item.cat}</span>
          {item.hot && (
            <span style={{fontSize:7.5,fontWeight:900,color:"#ff4d4d",background:"rgba(255,77,77,0.12)",border:"1px solid rgba(255,77,77,0.2)",padding:"0px 4px",borderRadius:3,fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.1em"}}>HOT</span>
          )}
        </div>
        <div style={{fontSize:11.5,fontWeight:700,color:"rgba(255,255,255,0.88)",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1.38,letterSpacing:"0.02em",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",marginBottom:3}}>{item.headline}</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.22)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.08em"}}>{item.time}</div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SidebarRight() {
  const [tab, setTab]       = useState("news");
  const [scores, setScores] = useState(SCORES);
  const [news, setNews]     = useState(NEWS);
  const { gw, loading }     = useGameweek();
  const gwLabel             = loading ? "···" : gw ? `Gameweek ${gw}` : "Premier League";
  const gwShort             = loading ? "···" : gw ? `GW${gw}` : "GW";
  const liveLbl             = loading ? "···" : gw ? `Live fixtures · ${gwShort}` : "Live fixtures";

  useEffect(() => {
    // Fetch live fixtures for the current GW
    api.getFplFixtures(gw)
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setScores(data);
        }
      })
      .catch(() => {
        // fall back to static SCORES
      });

    // Fetch latest player-related FPL news
    api.getFplNews()
      .then((items) => {
        if (Array.isArray(items) && items.length) {
          setNews(items);
        }
      })
      .catch(() => {
        // fall back to static NEWS
      });
  }, [gw]);

  return (
      <aside style={{
      width:300, height:"100vh",
      background:"linear-gradient(180deg,#06101c 0%,#080f1a 100%)",
      borderLeft:"1px solid rgba(5,240,255,0.08)",
      display:"flex",flexDirection:"column",
      position:"sticky",top:0,
      overflowY:"auto",overflowX:"hidden",
      scrollbarWidth:"none", flexShrink:0,
    }}>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(5,240,255,0.07)",background:"linear-gradient(135deg,#06101c,#0a1a2e)",flexShrink:0}}>
        {[{id:"news",label:"News"},{id:"scores",label:"GW Scores"}].map(t=>{
          const active = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, padding:"16px 0", background:"none", border:"none",
              borderBottom: active ? "3px solid #05f0ff" : "3px solid transparent",
              fontSize:13,fontWeight:900,
              color: active ? "#fff" : "rgba(255,255,255,0.3)",
              fontFamily:"'Barlow Condensed',monospace",
              textTransform:"uppercase",letterSpacing:"0.12em",
              cursor:"pointer",transition:"all 0.14s", marginBottom:-1,
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* GW Scores tab */}
      {tab==="scores" && (
        <div style={{ padding:"16px", flex:1 }}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:"0.18em",color:"rgba(5,240,255,0.6)",textTransform:"uppercase",fontFamily:"'Barlow Condensed',monospace",marginBottom:12}}>
            ✦ {gwLabel} — Fixtures
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {scores.map(m=><ScoreCard key={m.id} m={m}/>)}
          </div>
          <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:"rgba(5,240,255,0.04)",border:"1px solid rgba(5,240,255,0.08)",borderRadius:8}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#05f0ff",boxShadow:"0 0 5px #05f0ff",animation:"livePulse 1.3s ease-in-out infinite"}}/>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.06em"}}>{liveLbl}</span>
          </div>
        </div>
      )}

      {/* News tab */}
      {tab==="news" && (
        <div style={{ padding:"16px", flex:1 }}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:"0.18em",color:"rgba(5,240,255,0.6)",textTransform:"uppercase",fontFamily:"'Barlow Condensed',monospace",marginBottom:6}}>
            ✦ Premier League News
          </div>
          {news.map(item=><NewsCard key={item.id} item={item}/>)}
          <div style={{marginTop:12,textAlign:"center",padding:"10px 0",fontSize:11,color:"rgba(255,255,255,0.18)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.2em"}}>· · ·</div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&display=swap');
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.3;transform:scale(0.8);} }
      `}</style>
    </aside>
  );
}