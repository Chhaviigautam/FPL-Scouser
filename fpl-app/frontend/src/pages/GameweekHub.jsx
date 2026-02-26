import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useGameweek } from "../hooks/useGameweek";

const TrendIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const SquadIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SwapIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const BrainIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const ArrowIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CrossIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const PIPELINE = [
  { step:"01", label:"FPL API",             detail:"817 players · 26 GWs",        color:"#3b82f6", icon:"🌐", desc:"Live data pulled directly from the official FPL API — player history, prices, fixtures and availability." },
  { step:"02", label:"Feature Engineering", detail:"10 features · no leakage",    color:"#a855f7", icon:"⚙️", desc:"Rolling 3 & 5 GW averages blended with season-long stats. Shift(1) applied everywhere to prevent data leakage." },
  { step:"03", label:"LightGBM Model",      detail:"MAE 1.021 · 34.7% better",    color:"#f59e0b", icon:"🤖", desc:"Optuna-tuned gradient boosting trained on 20,703 rows. Predicts each player's next GW points." },
  { step:"04", label:"ILP Optimizer",       detail:"PuLP · CBC · binary vars",    color:"#f43f5e", icon:"🎯", desc:"Integer Linear Programming solves the knapsack problem — globally optimal squad, not a greedy guess." },
  { step:"05", label:"Decision Output",     detail:"Captain · Squad · Transfers", color:"#00ff87", icon:"✅", desc:"Ranked picks, optimal 15-man squad, hit-aware transfer recommendations, and captain suggestion." },
];

const FEATURES = [
  { label:"Recent Form",        why:"3GW rolling average — near-term output beats season stats",   color:"#00ff87" },
  { label:"xGI",                why:"Expected goal involvement — attacking threat beyond luck",     color:"#05f0ff" },
  { label:"ICT Index",          why:"FPL's influence/creativity/threat score",                      color:"#a855f7" },
  { label:"Minutes Played",     why:"Strongest single predictor — can't score from the bench",     color:"#f59e0b" },
  { label:"Fixture Difficulty", why:"Forward FDR over next 3 GWs baked into predictions",          color:"#f43f5e" },
];

const NAV_CARDS = [
  { id:"picks",     label:"Top Picks",      Icon:TrendIcon,  desc:"Ranked ML predictions for every player this GW",     color:"#00ff87", glow:"rgba(0,255,135,0.06)"  },
  { id:"optimal",   label:"Optimal Squad",  Icon:SquadIcon,  desc:"ILP-generated best 15 within your budget",           color:"#05f0ff", glow:"rgba(5,240,255,0.06)"  },
  { id:"transfers", label:"Transfers",      Icon:SwapIcon,   desc:"Hit-aware transfer recommendations for your squad",  color:"#a855f7", glow:"rgba(168,85,247,0.06)" },
  { id:"insights",  label:"Model Insights", Icon:BrainIcon,  desc:"Feature importances, validation and how it works",   color:"#f59e0b", glow:"rgba(245,158,11,0.06)" },
];

export default function GameweekHub({ onNavigate }) {
  const [topPlayer,  setTopPlayer]  = useState(null);
  const [insights,   setInsights]   = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const { gw } = useGameweek();
  const gwLabel = gw ? `Gameweek ${gw}` : "Premier League";

  useEffect(() => {
    Promise.all([
      api.getPlayers({ only_available: true, limit: 1 }),
      api.getModelInsights(),
    ]).then(([players, ins]) => {
      setTopPlayer(players[0] || null);
      setInsights(ins);
      setDataLoaded(true);
    }).catch(() => setDataLoaded(true));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* ── HERO ── */}
      <div style={{
        background:"linear-gradient(135deg,#06101c 0%,#0a1e14 50%,#06101c 100%)",
        border:"1px solid rgba(5,240,255,0.12)",
        borderRadius:22, padding:"56px 56px 50px",
        marginBottom:28, position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute",inset:0,opacity:0.035, backgroundImage:"linear-gradient(rgba(5,240,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(5,240,255,1) 1px,transparent 1px)", backgroundSize:"44px 44px" }}/>
        <div style={{ position:"absolute",top:-80,right:-80,width:380,height:380, background:"radial-gradient(circle,rgba(0,255,135,0.07) 0%,transparent 65%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute",bottom:-60,left:-40,width:280,height:280, background:"radial-gradient(circle,rgba(5,240,255,0.04) 0%,transparent 65%)", pointerEvents:"none" }}/>

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:22 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8, background:"rgba(0,255,135,0.1)",border:"1px solid rgba(0,255,135,0.3)",borderRadius:24,padding:"6px 16px" }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#00ff87",boxShadow:"0 0 8px #00ff87",animation:"topPulse 1.5s ease-in-out infinite" }}/>
              <span style={{ fontSize:13,fontWeight:900,color:"#00ff87",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.18em",textTransform:"uppercase" }}>LIVE · {gwLabel}</span>
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.3)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.12em",textTransform:"uppercase" }}>Decision Intelligence Engine</span>
          </div>

          <div style={{ fontSize:"clamp(32px,4vw,52px)",fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#fff",lineHeight:1.1,letterSpacing:"-0.01em",marginBottom:18,textTransform:"uppercase" }}>
            Stop guessing.<br/>
            <span style={{ color:"#05f0ff" }}>Start deciding with data.</span>
          </div>

          <p style={{ fontSize:16,color:"rgba(255,255,255,0.65)",lineHeight:1.9,maxWidth:640,marginBottom:34,fontFamily:"'Barlow Condensed',sans-serif" }}>
            Offside XI combines a trained LightGBM model with Integer Linear Programming
            to turn 817 players and £100m into a mathematically optimal decision — every gameweek.
          </p>

          <div style={{ display:"flex",gap:14,flexWrap:"wrap" }}>
            {dataLoaded && topPlayer && insights ? (
              [
                { label:"Top Pick This GW",  value:topPlayer.web_name,                       sub:`${parseFloat(topPlayer.predicted_pts).toFixed(2)} predicted pts`, color:"#00ff87" },
                { label:"Model MAE",         value:insights.mae,                             sub:`${insights.improvement_pct}% better than baseline`,              color:"#f59e0b" },
                { label:"Players Analysed",  value:"817",                                    sub:"every active FPL player",                                         color:"#05f0ff" },
                { label:"Training Rows",     value:insights.training_rows?.toLocaleString(), sub:"26 GWs of history",                                               color:"#a855f7" },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,padding:"16px 22px",minWidth:160 }}>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"'Barlow Condensed',monospace",marginBottom:7 }}>{s.label}</div>
                  <div style={{ fontSize:28,fontWeight:900,color:s.color,lineHeight:1,fontFamily:"'Barlow Condensed',sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:6,fontFamily:"'Barlow Condensed',monospace" }}>{s.sub}</div>
                </div>
              ))
            ) : (
              <div style={{ display:"flex",alignItems:"center",gap:10,color:"rgba(255,255,255,0.3)",fontSize:13,fontFamily:"'Barlow Condensed',monospace" }}>
                <div className="spinner" style={{width:12,height:12}}/> Loading live GW data…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NAV CARDS ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
        {NAV_CARDS.map(({ id, label, Icon, desc, color, glow }) => (
          <button key={id} onClick={() => onNavigate(id)}
            style={{ background:glow,border:`1px solid ${color}3a`,borderRadius:16,padding:"22px 20px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",display:"flex",flexDirection:"column",gap:12 }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor=color+"55"; e.currentTarget.style.background=color+"12"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.borderColor=color+"28"; e.currentTarget.style.background=glow; }}
          >
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ color }}><Icon/></span>
              <span style={{ color:"rgba(255,255,255,0.2)" }}><ArrowIcon/></span>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:13.5,color:"rgba(255,255,255,0.4)",lineHeight:1.6,fontFamily:"'Barlow Condensed',sans-serif" }}>{desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── PIPELINE ── */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-title">How It Works</div>
        <div style={{ fontSize:12,color:"rgba(5,240,255,0.4)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16 }}>Data → Prediction → Optimisation → Decision</div>

        <div style={{ display:"flex",alignItems:"stretch",gap:0,overflowX:"auto",paddingBottom:6 }}>
          {PIPELINE.map((step, i) => (
            <div key={step.step} style={{ display:"flex",alignItems:"center",flex:1,minWidth:0 }}>
              <div
                onClick={() => setActiveStep(activeStep===i ? null : i)}
                style={{ background:activeStep===i?`${step.color}12`:"rgba(255,255,255,0.03)",border:`1px solid ${activeStep===i?step.color+"55":"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"18px 16px",cursor:"pointer",flex:1,transition:"all 0.15s",position:"relative" }}
                onMouseEnter={e=>{ if(activeStep!==i){ e.currentTarget.style.borderColor=step.color+"35"; e.currentTarget.style.background=`${step.color}08`; }}}
                onMouseLeave={e=>{ if(activeStep!==i){ e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}}
              >
                <div style={{ fontSize:11,fontFamily:"'Barlow Condensed',monospace",color:step.color,letterSpacing:"0.14em",marginBottom:10,textTransform:"uppercase" }}>STEP {step.step}</div>
                <div style={{ fontSize:20,marginBottom:10 }}>{step.icon}</div>
                <div style={{ fontSize:14.5,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4,lineHeight:1.3 }}>{step.label}</div>
                <div style={{ fontSize:11.5,color:"rgba(255,255,255,0.35)",fontFamily:"'Barlow Condensed',monospace",lineHeight:1.6 }}>{step.detail}</div>
                {activeStep===i && <div style={{ position:"absolute",top:10,right:10,width:7,height:7,borderRadius:"50%",background:step.color,boxShadow:`0 0 8px ${step.color}` }}/>}
              </div>
              {i < PIPELINE.length-1 && (
                <div style={{ padding:"0 7px",color:"rgba(5,240,255,0.25)",flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {activeStep !== null ? (
          <div style={{ marginTop:14,background:`${PIPELINE[activeStep].color}10`,border:`1px solid ${PIPELINE[activeStep].color}30`,borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"flex-start",gap:14 }}>
            <div style={{ fontSize:24,flexShrink:0 }}>{PIPELINE[activeStep].icon}</div>
            <div>
              <div style={{ fontSize:14,fontWeight:900,color:PIPELINE[activeStep].color,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6 }}>{PIPELINE[activeStep].label}</div>
              <div style={{ fontSize:13.5,color:"rgba(255,255,255,0.7)",lineHeight:1.8,fontFamily:"'Barlow Condensed',sans-serif" }}>{PIPELINE[activeStep].desc}</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop:10,fontSize:12,color:"rgba(255,255,255,0.26)",fontFamily:"'Barlow Condensed',monospace",letterSpacing:"0.1em" }}>↑ Click any step to learn more</div>
        )}
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

        {/* Features */}
        <div className="card">
          <div className="card-title">What the model sees</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {FEATURES.map((f,i) => (
              <div key={f.label} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:9,borderLeft:`3px solid ${f.color}` }}>
                <div style={{ width:26,height:26,borderRadius:"50%",flexShrink:0,background:`${f.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:f.color,fontFamily:"'Barlow Condensed',monospace" }}>{i+1}</div>
                <div>
                  <div style={{ fontSize:14,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:13.5,color:"rgba(255,255,255,0.42)",lineHeight:1.65,fontFamily:"'Barlow Condensed',sans-serif" }}>{f.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="card">
          <div className="card-title">Why Offside XI is different</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
            <div>
              <div style={{ fontSize:12,fontWeight:900,color:"rgba(255,77,77,0.8)",fontFamily:"'Barlow Condensed',monospace",textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,paddingBottom:8,borderBottom:"1px solid rgba(255,77,77,0.16)" }}>Typical tools</div>
              {["You make the final call","Manual team selection","No budget optimisation","Fixtures ignored in picks"].map(t => (
                <div key={t} style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:10 }}>
                  <span style={{ color:"#ff4d4d",flexShrink:0,marginTop:3 }}><CrossIcon/></span>
                  <span style={{ fontSize:13.5,color:"rgba(255,255,255,0.38)",lineHeight:1.6,fontFamily:"'Barlow Condensed',sans-serif" }}>{t}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:12,fontWeight:900,color:"rgba(0,255,135,0.8)",fontFamily:"'Barlow Condensed',monospace",textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,paddingBottom:8,borderBottom:"1px solid rgba(0,255,135,0.16)" }}>Offside XI</div>
              {["Decision made — you review","ILP guarantees global optimum","Maximises pts under £100m","FDR baked into predictions"].map(t => (
                <div key={t} style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:10 }}>
                  <span style={{ color:"#00ff87",flexShrink:0,marginTop:3 }}><CheckIcon/></span>
                  <span style={{ fontSize:13.5,color:"rgba(255,255,255,0.72)",lineHeight:1.6,fontFamily:"'Barlow Condensed',sans-serif" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
