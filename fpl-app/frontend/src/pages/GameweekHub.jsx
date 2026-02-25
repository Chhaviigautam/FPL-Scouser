import { useState, useEffect } from "react";
import { api } from "../api/client";

// ── Icons ──────────────────────────────────────────────────────────────────
const TrendIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const SquadIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SwapIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const BrainIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const ArrowIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const ShieldIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ZapIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const TargetIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

// ── Pipeline steps data ────────────────────────────────────────────────────
const PIPELINE = [
  {
    step: "01",
    label: "FPL API",
    detail: "817 players · 26 GWs · zero cost",
    color: "#3b82f6",
    icon: "🌐",
    desc: "Live data pulled directly from the official FPL API — player history, prices, fixtures and availability.",
  },
  {
    step: "02",
    label: "Feature Engineering",
    detail: "10 features · no data leakage",
    color: "#a855f7",
    icon: "⚙️",
    desc: "Rolling 3 & 5 GW averages blended with season-long stats. Shift(1) applied everywhere to prevent leakage.",
  },
  {
    step: "03",
    label: "LightGBM Model",
    detail: "MAE 1.021 · 34.7% better",
    color: "#f59e0b",
    icon: "🤖",
    desc: "Optuna-tuned gradient boosting model trained on 20,703 rows. Predicts each player's next GW points.",
  },
  {
    step: "04",
    label: "ILP Optimizer",
    detail: "PuLP · CBC · binary selection",
    color: "#f43f5e",
    icon: "🎯",
    desc: "Integer Linear Programming solves the knapsack problem — globally optimal squad, not a greedy guess.",
  },
  {
    step: "05",
    label: "Decision Output",
    detail: "Captain · Squad · Transfers",
    color: "#00d68f",
    icon: "✅",
    desc: "Ranked picks, optimal 15-man squad, hit-aware transfer recommendations, and captain suggestion.",
  },
];

// ── What the model sees (education) ───────────────────────────────────────
const FEATURES = [
  { icon: <ZapIcon />,    label: "Form (3GW avg)",       why: "Recent performance predicts near-term output better than season stats alone", color: "#00d68f" },
  { icon: <TargetIcon />, label: "xGI",                  why: "Expected goal involvement — measures actual attacking threat regardless of luck", color: "#3b82f6" },
  { icon: <StarIcon />,   label: "ICT Index",            why: "FPL's own influence/creativity/threat score — strong correlation with points", color: "#a855f7" },
  { icon: <ShieldIcon />, label: "Minutes Played",       why: "The strongest single predictor — a player can't score if they're not on the pitch", color: "#f59e0b" },
  { icon: <CheckIcon />,  label: "Fixture Difficulty",   why: "Forward-looking FDR averaged over next 3 GWs — context the rolling stats miss", color: "#f43f5e" },
];

// ── Nav cards ──────────────────────────────────────────────────────────────
const NAV_CARDS = [
  { id: "picks",     label: "Top Picks",      Icon: TrendIcon,  desc: "Ranked predictions for every player this GW",      color: "#00d68f", accent: "rgba(0,214,143,0.08)" },
  { id: "squad",     label: "Optimal Squad",  Icon: SquadIcon,  desc: "ILP-generated best 15 within your budget",          color: "#3b82f6", accent: "rgba(59,130,246,0.08)" },
  { id: "transfers", label: "Transfers",      Icon: SwapIcon,   desc: "Hit-aware transfer recommendations for your squad", color: "#a855f7", accent: "rgba(168,85,247,0.08)" },
  { id: "model",     label: "Model Insights", Icon: BrainIcon,  desc: "Feature importances, validation and how it works",  color: "#f59e0b", accent: "rgba(245,158,11,0.08)" },
];

// ── Main component ─────────────────────────────────────────────────────────
export default function GameweekHub({ onNavigate }) {
  const [topPlayer,   setTopPlayer]   = useState(null);
  const [insights,    setInsights]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [activeStep,  setActiveStep]  = useState(null);

  useEffect(() => {
    Promise.all([
      api.getPlayers({ only_available: true, limit: 1 }),
      api.getModelInsights(),
    ]).then(([players, ins]) => {
      setTopPlayer(players[0] || null);
      setInsights(ins);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0d1117 0%, #0f1e14 50%, #0d1117 100%)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "40px 40px 36px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid pattern bg */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 300, height: 300,
          background: "radial-gradient(circle, rgba(0,214,143,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{
              background: "var(--accent-g)", border: "1px solid rgba(0,214,143,0.25)",
              borderRadius: 20, padding: "3px 10px",
              fontSize: 10.5, color: "var(--accent)", fontFamily: "'Geist Mono', monospace",
              letterSpacing: "0.08em",
            }}>DECISION INTELLIGENCE ENGINE</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 800, color: "var(--text)", lineHeight: 1.1,
            letterSpacing: "-0.02em", marginBottom: 12,
          }}>
            Stop guessing.<br />
            <span style={{ color: "var(--accent)" }}>Start deciding with data.</span>
          </h1>

          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>
            Offside XI combines a trained LightGBM model with Integer Linear Programming
            to turn 817 players and £100m into a mathematically optimal decision — every gameweek.
          </p>

          {/* Live headline stats */}
          {!loading && topPlayer && insights && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Top Pick This GW", value: topPlayer.web_name, sub: `${topPlayer.predicted_pts} predicted pts`, color: "var(--accent)" },
                { label: "Model MAE", value: insights.mae, sub: `${insights.improvement_pct}% better than baseline`, color: "var(--amber)" },
                { label: "Players Analysed", value: "817", sub: "every active FPL player", color: "var(--blue)" },
                { label: "Training Rows", value: insights.training_rows.toLocaleString(), sub: "26 GWs of history", color: "var(--purple)" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px 18px", minWidth: 140,
                }}>
                  <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Geist Mono', monospace", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          )}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text3)", fontSize: 12 }}>
              <div className="spinner" style={{width:14,height:14}} />Loading live GW data…
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation cards ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {NAV_CARDS.map(({ id, label, Icon, desc, color, accent }) => (
          <button key={id} onClick={() => onNavigate(id)} style={{
            background: accent, border: `1px solid ${color}30`,
            borderRadius: 12, padding: "18px 16px",
            cursor: "pointer", textAlign: "left",
            transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 10,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = color + "60"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = color + "30"; }}
          >
            <div style={{ color, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Icon />
              <span style={{ color: "var(--text3)", opacity: 0.6 }}><ArrowIcon /></span>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 11.5, color: "var(--text3)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Pipeline ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>How it works</div>
          <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'Geist Mono', monospace" }}>Data → Prediction → Optimisation → Decision</div>
        </div>

        {/* Pipeline flow */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {PIPELINE.map((step, i) => (
            <div key={step.step} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <div
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                style={{
                  background: activeStep === i ? `${step.color}12` : "var(--bg2)",
                  border: `1px solid ${activeStep === i ? step.color + "50" : "var(--border)"}`,
                  borderRadius: 10, padding: "16px 14px",
                  cursor: "pointer", flex: 1,
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (activeStep !== i) e.currentTarget.style.borderColor = step.color + "40"; }}
                onMouseLeave={(e) => { if (activeStep !== i) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{ fontSize: 9, fontFamily: "'Geist Mono', monospace", color: step.color, letterSpacing: "0.1em", marginBottom: 8 }}>STEP {step.step}</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{step.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--text3)", fontFamily: "'Geist Mono', monospace", lineHeight: 1.5 }}>{step.detail}</div>

                {/* Active indicator dot */}
                {activeStep === i && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: "50%", background: step.color }} />
                )}
              </div>

              {/* Arrow connector */}
              {i < PIPELINE.length - 1 && (
                <div style={{ padding: "0 6px", color: "var(--border2)", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Expanded step detail */}
        {activeStep !== null && (
          <div style={{
            marginTop: 12,
            background: `${PIPELINE[activeStep].color}08`,
            border: `1px solid ${PIPELINE[activeStep].color}30`,
            borderRadius: 10, padding: "14px 18px",
            display: "flex", alignItems: "flex-start", gap: 12,
            animation: "fadeUp 0.2s ease",
          }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{PIPELINE[activeStep].icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: PIPELINE[activeStep].color, marginBottom: 4 }}>
                {PIPELINE[activeStep].label}
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{PIPELINE[activeStep].desc}</div>
            </div>
          </div>
        )}
        {activeStep === null && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)", fontFamily: "'Geist Mono', monospace" }}>
            ↑ Click any step to learn more
          </div>
        )}
      </div>

      {/* ── What the model sees ──────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>What the model sees</div>
          <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'Geist Mono', monospace" }}>The 5 signals that drive every prediction</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "16px 14px",
              borderTop: `2px solid ${f.color}`,
            }}>
              <div style={{ color: f.color, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}>{f.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--text3)", lineHeight: 1.6 }}>{f.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why this is different ────────────────────────────────────── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "24px 28px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32,
      }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            Typical FPL tools
          </div>
          {[
            "Display stats — you make the decision",
            "Manual team selection based on gut feel",
            "No budget optimisation",
            "Ignore fixture difficulty in picks",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ color: "var(--red)", marginTop: 1, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </span>
              <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--accent)", marginBottom: 16 }}>
            Offside XI
          </div>
          {[
            "Makes the decision — you review and confirm",
            "ILP guarantees globally optimal selection",
            "Mathematically maximises pts under £100m",
            "FDR baked into ML model as a predictive feature",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }}><CheckIcon /></span>
              <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
