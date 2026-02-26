import { useState } from "react";
import { useGameweek } from "./hooks/useGameweek";

// ─── REAL COMPONENT IMPORTS ───────────────────────────────────────────────────
import SidebarLeft     from "./components/SidebarLeft";
import SidebarRight    from "./components/SidebarRight";
import MainPitch       from "./components/MainPitch";
import TopPicks        from "./pages/TopPicks";
import OptimalSquad    from "./pages/OptimalSquad";
import TransferPlanner from "./pages/TransferPlanner";
import ModelInsights   from "./pages/ModelInsights";

import GameweekHub    from "./pages/GameweekHub";

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
<<<<<<< HEAD
  { id:"home",      label:"Home",        icon:"⌂", component:null            },  // rendered specially with onNavigate
  { id:"squad",     label:"My Squad",    icon:"◈", component:MainPitch       },
  { id:"picks",     label:"Top Picks",   icon:"◉", component:TopPicks        },
  { id:"optimal",   label:"Optimal XI",  icon:"◫", component:OptimalSquad    },
  { id:"transfers", label:"Transfers",   icon:"⇄", component:TransferPlanner },
  { id:"insights",  label:"Insights",    icon:"◎", component:ModelInsights   },
=======
  { id:"squad",     label:"My Squad",   icon:"◈", component:MainPitch       },
  { id:"picks",     label:"Top Picks",  icon:"◉", component:TopPicks        },
  { id:"optimal",   label:"Optimal XI", icon:"◫", component:OptimalSquad    },
  { id:"transfers", label:"Transfers",  icon:"⇄", component:TransferPlanner },
  { id:"insights",  label:"Insights",   icon:"◎", component:ModelInsights   },
  { id:"india", label:"India FC", icon:"◉", component:IndianFootballCommunity },
>>>>>>> f1b71f8 (Frontend updates)
];

// ─── FPL-STYLE TOPBAR ─────────────────────────────────────────────────────────
function Topbar({ active, setActive }) {
  const { gw, loading } = useGameweek();
  const gwLabel = loading ? "···" : gw ? `Gameweek ${gw}` : "Premier League";
  return (
    <header style={{
      height:52, flexShrink:0,
      background:"linear-gradient(135deg,#04090f 0%,#08121e 100%)",
      borderBottom:"1px solid rgba(5,240,255,0.1)",
      display:"flex", alignItems:"center",
      padding:"0 18px", gap:0,
      position:"sticky", top:0, zIndex:100,
    }}>

      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginRight:28,flexShrink:0}}>
        <div style={{
          background:"linear-gradient(135deg,#05f0ff,#0090ff)",
          borderRadius:6,
          padding:"3px 9px",
          fontSize:11,fontWeight:900,
          color:"#001a2e",
          fontFamily:"'Barlow Condensed',sans-serif",
          letterSpacing:"0.04em",
          boxShadow:"0 0 14px rgba(5,240,255,0.3)",
        }}>
          Fantasy
        </div>
        <div>
          <div style={{
            fontSize:11.5,fontWeight:900,
            color:"rgba(255,255,255,0.9)",
            fontFamily:"'Barlow Condensed',sans-serif",
            letterSpacing:"0.1em",textTransform:"uppercase",lineHeight:1.1,
          }}>
            Premier League
          </div>
          <div style={{
            fontSize:8.5,color:"rgba(5,240,255,0.5)",
            fontFamily:"'Barlow Condensed',monospace",
            letterSpacing:"0.16em",textTransform:"uppercase",
          }}>
            MANAGER HUB
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <nav style={{display:"flex",alignItems:"center",gap:2,flex:1}}>
        {NAV.map(item=>{
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{
                display:"flex",alignItems:"center",gap:5,
                padding:"6px 13px",
                borderRadius:6,
                background: isActive ? "rgba(5,240,255,0.1)" : "transparent",
                border: isActive ? "1px solid rgba(5,240,255,0.2)" : "1px solid transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.38)",
                fontSize:11.5,fontWeight:isActive?800:600,
                fontFamily:"'Barlow Condensed',sans-serif",
                letterSpacing:"0.05em",textTransform:"uppercase",
                cursor:"pointer",transition:"all 0.14s",whiteSpace:"nowrap",
              }}
              onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.color="rgba(255,255,255,0.68)"; }}
              onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.color="rgba(255,255,255,0.38)"; }}
            >
              <span style={{ fontSize:10, color: isActive ? "#05f0ff" : "rgba(255,255,255,0.3)" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right: GW info */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginLeft:"auto",flexShrink:0}}>
        {/* Overall rank */}
        <div style={{textAlign:"right"}}>
          <div style={{
            fontSize:10,fontWeight:900,color:"rgba(255,255,255,0.8)",
            fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.04em",lineHeight:1,
          }}>
            124k
          </div>
          <div style={{
            fontSize:7.5,color:"rgba(255,255,255,0.28)",
            fontFamily:"'Barlow Condensed',monospace",
            textTransform:"uppercase",letterSpacing:"0.12em",marginTop:1,
          }}>
            O/all rank
          </div>
        </div>

        <div style={{width:1,height:22,background:"rgba(5,240,255,0.12)"}}/>

        {/* GW live badge */}
        <div style={{
          display:"flex",alignItems:"center",gap:7,
          background:"rgba(255,255,255,0.92)",
          borderRadius:5,
          padding:"4px 10px",
          boxShadow:"0 2px 8px rgba(0,0,0,0.35)",
        }}>
          <div style={{
            width:6,height:6,borderRadius:"50%",
            background:"#00ff87",boxShadow:"0 0 6px #00ff87",
            animation:"topPulse 1.5s ease-in-out infinite",
            flexShrink:0,
          }}/>
          <div>
            <div style={{
              fontSize:11,fontWeight:900,color:"#06101c",
              fontFamily:"'Barlow Condensed',sans-serif",
              letterSpacing:"0.06em",textTransform:"uppercase",lineHeight:1,
            }}>
              {gwLabel}
            </div>
            <div style={{
              fontSize:7.5,color:"rgba(0,0,0,0.4)",
              fontFamily:"'Barlow Condensed',monospace",
              textTransform:"uppercase",letterSpacing:"0.1em",marginTop:1,
            }}>
              LIVE
            </div>
          </div>
        </div>

        {/* Budget */}
        <div style={{textAlign:"right"}}>
          <div style={{
            fontSize:13,fontWeight:900,
            color:"#ebff00",
            fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.02em",lineHeight:1,
          }}>
            £0.2m
          </div>
          <div style={{
            fontSize:7.5,color:"rgba(255,255,255,0.28)",
            fontFamily:"'Barlow Condensed',monospace",
            textTransform:"uppercase",letterSpacing:"0.12em",marginTop:1,
          }}>
            Budget
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── APP LAYOUT ───────────────────────────────────────────────────────────────
export default function AppLayout() {
  const [activePage, setActivePage] = useState("home");
  const [activeTeam, setActiveTeam] = useState(null);

  const ActivePage = NAV.find(n=>n.id===activePage)?.component || null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; }
        body {
          background:#050d14;
          color:#fff;
          font-family:'Barlow Condensed',sans-serif;
          -webkit-font-smoothing:antialiased;
          overflow:hidden;
        }
        ::-webkit-scrollbar { width:0; height:0; }

        @keyframes topPulse {
          0%,100% { opacity:1; }
          50% { opacity:0.25; }
        }
        @keyframes pageIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .page-in { animation:pageIn 0.22s ease; }

        :root {
          --bg:     #050d14;
          --bg2:    #06101c;
          --bg3:    #0a1a2e;
          --bg4:    #0e2040;

          --border:  rgba(5,240,255,0.08);
          --border2: rgba(5,240,255,0.15);

          --text:  #ffffff;
          --text2: rgba(255,255,255,0.72);
          --text3: rgba(255,255,255,0.38);
          --text4: rgba(255,255,255,0.18);

          --cyan:   #05f0ff;
          --green:  #00ff87;
          --yellow: #ebff00;
          --red:    #ff4d4d;
          --amber:  #f5c518;
          --blue:   #2196f3;

          --font: 'Barlow Condensed', 'Arial Narrow', sans-serif;
          --mono: 'Barlow Condensed', monospace;

          --radius:    10px;
          --radius-sm: 6px;
          --radius-lg: 14px;
        }

        .card {
          background:var(--bg2);
          border:1px solid var(--border);
          border-radius:var(--radius-lg);
          padding:18px;
        }
        .card-title {
          font-size:9px; font-weight:900;
          color:rgba(5,240,255,0.5);
          text-transform:uppercase; letter-spacing:0.18em;
          font-family:var(--mono);
          margin-bottom:14px;
        }
        .card-title::before { content:"✦ "; }

        .page-header {
          display:flex; align-items:flex-start;
          justify-content:space-between;
          margin-bottom:20px;
          padding-bottom:16px;
          border-bottom:1px solid var(--border);
        }
        .page-title {
          font-size:22px; font-weight:900; color:var(--text);
          font-family:var(--font); letter-spacing:0.04em;
          text-transform:uppercase;
        }
        .page-subtitle {
          font-size:10px; color:rgba(5,240,255,0.5);
          font-family:var(--mono); margin-top:3px;
          letter-spacing:0.1em; text-transform:uppercase;
        }
        .page-subtitle::before { content:"✦ "; }

        .stats-row {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(110px,1fr));
          gap:10px; margin-bottom:20px;
        }
        .stat-card {
          background:var(--bg2);
          border:1px solid var(--border);
          border-radius:var(--radius);
          padding:12px 14px;
        }
        .stat-label {
          font-size:8.5px; font-weight:900; color:rgba(5,240,255,0.45);
          text-transform:uppercase; letter-spacing:0.15em;
          font-family:var(--mono);
        }
        .stat-value {
          font-size:24px; font-weight:900; color:var(--text);
          font-family:var(--mono); margin-top:4px; line-height:1;
          letter-spacing:0.02em;
        }
        .stat-value.green  { color:var(--green);  }
        .stat-value.red    { color:var(--red);     }
        .stat-value.blue   { color:var(--blue);    }
        .stat-value.amber  { color:var(--amber);   }
        .stat-value.cyan   { color:var(--cyan);    }
        .stat-value.yellow { color:var(--yellow);  }

        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

        .table-wrap {
          border-radius:var(--radius-lg); overflow:hidden;
          border:1px solid var(--border);
        }
        .table-wrap table { width:100%; border-collapse:collapse; }
        .table-wrap thead tr { background:rgba(5,240,255,0.05); }
        .table-wrap th {
          padding:9px 14px; text-align:left;
          font-size:8.5px; font-weight:900; color:rgba(5,240,255,0.45);
          text-transform:uppercase; letter-spacing:0.14em;
          font-family:var(--mono);
          border-bottom:1px solid var(--border);
          white-space:nowrap;
        }
        .table-wrap td {
          padding:8px 14px;
          border-bottom:1px solid rgba(255,255,255,0.03);
          color:var(--text2);
          font-family:var(--font); font-size:12px; font-weight:600;
        }
        .table-wrap tbody tr:hover { background:rgba(5,240,255,0.02); }

        .pos {
          display:inline-block; font-size:9px; font-weight:900;
          padding:2px 6px; border-radius:3px;
          font-family:var(--mono); letter-spacing:0.06em;
          text-transform:uppercase;
        }
        .pos-GK  { background:rgba(235,255,0,0.15);  color:#ebff00; }
        .pos-DEF { background:rgba(0,255,135,0.14);  color:#00ff87; }
        .pos-MID { background:rgba(5,240,255,0.14);  color:#05f0ff; }
        .pos-FWD { background:rgba(255,77,77,0.14);  color:#ff4d4d; }

        .squad-list { display:flex; flex-direction:column; gap:2px; }
        .player-row {
          display:flex; align-items:center; gap:10px;
          padding:6px 10px; border-radius:6px;
          transition:background 0.12s;
          border-left:2.5px solid transparent;
        }
        .player-row:hover, .player-row.clickable:hover {
          background:rgba(5,240,255,0.04); cursor:pointer;
        }
        .player-row.locked { background:rgba(5,240,255,0.06); border-left-color:var(--cyan); }
        .player-row.is-out { border-left-color:var(--red);   background:rgba(255,77,77,0.04); }
        .player-row.is-new { border-left-color:var(--green); background:rgba(0,255,135,0.04); }
        .player-name {
          flex:1; font-size:12.5px; font-weight:700;
          color:var(--text); font-family:var(--font);
          text-transform:uppercase; letter-spacing:0.03em;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .player-team { font-size:10.5px; color:var(--text3); font-family:var(--mono); }
        .player-pts {
          background:rgba(0,255,135,0.12);
          border:1px solid rgba(0,255,135,0.2);
          color:var(--green);
          font-family:var(--mono); font-size:11px; font-weight:900;
          padding:1px 7px; border-radius:3px; letter-spacing:0.04em;
        }
        .price {
          background:rgba(235,255,0,0.1);
          color:var(--yellow);
          font-family:var(--mono); font-size:10.5px; font-weight:900;
          padding:1px 6px; border-radius:3px; letter-spacing:0.03em;
        }
        .rank { color:var(--text3); font-family:var(--mono); font-size:10.5px; }

        .pts-cell { display:flex; align-items:center; gap:8px; }
        .pts-bar-bg {
          flex:1; height:4px;
          background:rgba(255,255,255,0.06);
          border-radius:2px; overflow:hidden;
        }
        .pts-bar { height:100%; background:var(--cyan); border-radius:2px; }
        .pts-num {
          font-family:var(--mono); font-weight:900; font-size:12px;
          color:var(--text); letter-spacing:0.03em;
        }

        .cap-c {
          display:inline-flex; align-items:center; justify-content:center;
          width:18px; height:18px; border-radius:50%;
          background:#F5C518; color:#1a0a00;
          font-size:9px; font-weight:900; font-family:var(--mono);
        }
        .cap-v {
          display:inline-flex; align-items:center; justify-content:center;
          width:18px; height:18px; border-radius:50%;
          background:rgba(255,255,255,0.15); color:var(--text);
          font-size:9px; font-weight:900; font-family:var(--mono);
        }

        .feat-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .feat-label { font-size:11.5px; color:var(--text2); width:160px; flex-shrink:0; font-family:var(--font); }
        .feat-track { flex:1; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
        .feat-fill  { height:100%; background:var(--cyan); border-radius:3px; }
        .feat-val   { font-family:var(--mono); font-size:10.5px; color:var(--text3); width:50px; text-align:right; }

        .info-row {
          display:flex; gap:12px; padding:8px 0;
          border-bottom:1px solid var(--border);
        }
        .info-row:last-child { border-bottom:none; }
        .info-key {
          font-size:10px; font-weight:900; color:rgba(5,240,255,0.5);
          text-transform:uppercase; letter-spacing:0.1em;
          font-family:var(--mono); width:80px; flex-shrink:0; padding-top:1px;
        }
        .info-val { font-size:11.5px; color:var(--text2); line-height:1.6; font-family:var(--font); }

        .model-row {
          display:flex; align-items:center;
          padding:8px 0;
          border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .model-row.best {
          background:rgba(5,240,255,0.05);
          padding:8px 10px; border-radius:6px;
          border-left:2.5px solid var(--cyan);
        }
        .model-name { flex:1; font-size:12.5px; font-weight:600; color:var(--text2); font-family:var(--font); text-transform:uppercase; }
        .model-mae  { font-family:var(--mono); font-size:12px; color:var(--text); font-weight:700; width:55px; }
        .model-imp  { font-family:var(--mono); font-size:11px; color:var(--green); width:70px; text-align:right; }

        .tag { font-size:8.5px; font-weight:900; padding:1px 6px; border-radius:3px; font-family:var(--mono); letter-spacing:0.08em; text-transform:uppercase; }
        .tag-kept { background:rgba(255,255,255,0.07); color:var(--text3); }
        .tag-new  { background:rgba(0,255,135,0.12); border:1px solid rgba(0,255,135,0.2); color:var(--green); }

        .filters { display:flex; align-items:center; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
        .filter-pill {
          padding:4px 12px; border-radius:20px;
          border:1px solid rgba(5,240,255,0.15);
          background:transparent;
          color:rgba(255,255,255,0.4);
          font-size:10.5px; font-weight:800; cursor:pointer;
          font-family:var(--mono); letter-spacing:0.08em; text-transform:uppercase;
          transition:all 0.12s;
        }
        .filter-pill:hover { border-color:rgba(5,240,255,0.3); color:rgba(255,255,255,0.7); }
        .filter-pill.active {
          background:rgba(5,240,255,0.1);
          border-color:rgba(5,240,255,0.35);
          color:var(--cyan);
        }
        .filter-sep { width:1px; height:20px; background:rgba(5,240,255,0.1); }
        .range-wrap { display:flex; align-items:center; gap:10px; }
        .range-wrap > span { font-size:10.5px; color:var(--text3); font-family:var(--mono); }
        .range-val { color:var(--cyan) !important; font-weight:900; }
        input[type=range] { accent-color:var(--cyan); }

        .btn {
          display:inline-flex; align-items:center; justify-content:center;
          gap:6px; padding:8px 20px;
          border-radius:var(--radius-sm); border:none;
          font-size:11.5px; font-weight:900; cursor:pointer;
          font-family:var(--font); letter-spacing:0.08em;
          text-transform:uppercase; transition:all 0.14s;
        }
        .btn:disabled { opacity:0.38; cursor:not-allowed; }
        .btn-primary {
          background:linear-gradient(135deg,#05f0ff,#0090ff);
          color:#001a2e;
          box-shadow:0 2px 12px rgba(5,240,255,0.25);
        }
        .btn-primary:hover:not(:disabled) {
          box-shadow:0 0 20px rgba(5,240,255,0.4);
          transform:translateY(-1px);
        }

        .input {
          background:rgba(5,240,255,0.04);
          border:1px solid rgba(5,240,255,0.15);
          border-radius:var(--radius-sm);
          padding:8px 12px; color:var(--text);
          font-size:12.5px; outline:none;
          font-family:var(--mono); transition:border-color 0.14s;
        }
        .input:focus { border-color:rgba(5,240,255,0.4); }
        .input::placeholder { color:var(--text4); }
        .input-label {
          font-size:8.5px; font-weight:900; color:rgba(5,240,255,0.45);
          text-transform:uppercase; letter-spacing:0.15em; font-family:var(--mono);
        }
        .input-group { display:flex; flex-direction:column; gap:6px; }

        .loading {
          display:flex; align-items:center; gap:10px;
          padding:32px; justify-content:center;
          color:var(--text3); font-family:var(--mono); font-size:11px;
          letter-spacing:0.1em; text-transform:uppercase;
        }
        .spinner {
          width:16px; height:16px;
          border:2px solid rgba(5,240,255,0.12);
          border-top-color:var(--cyan);
          border-radius:50%;
          animation:spin 0.65s linear infinite; flex-shrink:0;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .error-box {
          background:rgba(255,77,77,0.08);
          border:1px solid rgba(255,77,77,0.2);
          border-radius:var(--radius-sm);
          padding:11px 14px; color:var(--red);
          font-size:11px; margin-bottom:16px;
          font-family:var(--mono); letter-spacing:0.04em;
        }
        .success-box {
          background:rgba(0,255,135,0.07);
          border:1px solid rgba(0,255,135,0.2);
          border-radius:var(--radius-sm);
          padding:11px 14px; color:var(--green);
          font-size:11px; margin-bottom:16px;
          font-family:var(--mono); letter-spacing:0.04em;
        }
        .empty {
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:10px; padding:60px 20px;
        }
        .empty-icon { font-size:28px; color:rgba(5,240,255,0.15); }
        .empty-msg  { font-size:11px; color:var(--text3); font-family:var(--mono); letter-spacing:0.1em; text-transform:uppercase; }

        /* FIX: step-num border-radius was a JS string typo in original — corrected here */
        .step-num {
          display:flex; align-items:center; justify-content:center;
          width:22px; height:22px; border-radius:50%;
          background:rgba(5,240,255,0.12);
          color:var(--cyan); font-size:11px; font-weight:900;
          font-family:var(--mono); flex-shrink:0;
          border:1px solid rgba(5,240,255,0.2);
        }
        .step-title { font-size:14px; font-weight:900; color:var(--text); font-family:var(--font); text-transform:uppercase; letter-spacing:0.06em; }

        .transfer-cols { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .transfer-col-label {
          display:flex; align-items:center; gap:6px;
          font-size:9px; font-weight:900; text-transform:uppercase;
          letter-spacing:0.14em; font-family:var(--mono); margin-bottom:8px;
        }
        .transfer-col-label.out { color:var(--red); }
        .transfer-col-label.in  { color:var(--green); }

        .locked-list  { display:flex; flex-wrap:wrap; gap:6px; }
        .locked-chip  {
          display:flex; align-items:center; gap:5px;
          padding:3px 8px;
          background:rgba(5,240,255,0.08);
          border:1px solid rgba(5,240,255,0.2);
          border-radius:4px; font-size:10.5px;
          color:var(--cyan); cursor:pointer; font-family:var(--mono);
          letter-spacing:0.06em; text-transform:uppercase;
        }
        .locked-chip svg { width:10px; height:10px; }

        .fade-in { animation:pageIn 0.24s ease; }
      `}</style>

      <div style={{
        display:"flex", flexDirection:"column",
        height:"100vh", overflow:"hidden",
        background:"#050d14",
      }}>
        <Topbar active={activePage} setActive={setActivePage}/>

        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          <SidebarLeft activeTeam={activeTeam} setActiveTeam={setActiveTeam}/>

          <main style={{
            flex:1,
            overflowY:"auto",
            padding:"22px 26px",
            scrollbarWidth:"none",
            background:"#050d14",
          }}>
            <div className="page-in">
              {activePage === "home"
                ? <GameweekHub onNavigate={setActivePage} />
                : ActivePage ? <ActivePage /> : null
              }
            </div>
          </main>

          <SidebarRight/>
        </div>
      </div>
    </>
  );
}
