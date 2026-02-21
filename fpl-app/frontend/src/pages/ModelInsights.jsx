import { useState, useEffect } from "react";
import { api } from "../api/client";

const FEATURE_LABELS = {
  avg_pts_last3:         "Avg Pts (last 3 GWs)",
  avg_pts_last5:         "Avg Pts (last 5 GWs)",
  form_trend:            "Form Trend",
  avg_minutes_last3:     "Avg Minutes (last 3)",
  avg_xgi_last3:         "Avg xGI (last 3)",
  avg_ict_last3:         "Avg ICT (last 3)",
  avg_bps_last3:         "Avg BPS (last 3)",
  is_home:               "Home Fixture",
  value:                 "Player Price",
  avg_fixture_difficulty:"Fixture Difficulty",
};

export default function ModelInsights() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.getModelInsights()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading insights…</span></div>;
  if (error)   return <div className="error-box">{error}</div>;

  const maxImp = Math.max(...Object.values(data.feature_importances));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📊 Model Insights</div>
        <div className="page-subtitle">LightGBM (Optuna-tuned) · Feature importances and model comparison</div>
      </div>

      {/* Key metrics */}
      <div className="stats-row" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Model</div>
          <div style={{ fontFamily: "Rajdhani", fontSize: 18, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>LightGBM</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Model MAE</div>
          <div className="stat-value green">{data.mae}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Baseline MAE</div>
          <div className="stat-value red">{data.baseline_mae}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Improvement</div>
          <div className="stat-value green">+{data.improvement_pct}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Training Rows</div>
          <div className="stat-value blue">{data.training_rows.toLocaleString()}</div>
        </div>
      </div>

      <div className="two-col">
        {/* Feature importance */}
        <div className="card">
          <div style={{ fontFamily: "Rajdhani", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Feature Importance</div>
          {Object.entries(data.feature_importances).map(([feat, val]) => (
            <div key={feat} className="insight-bar-row">
              <div className="insight-label">{FEATURE_LABELS[feat] || feat}</div>
              <div className="insight-track">
                <div className="insight-fill" style={{ width: `${(val / maxImp) * 100}%` }} />
              </div>
              <div className="insight-val">{val.toLocaleString()}</div>
            </div>
          ))}
          <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(0,229,160,0.06)", borderRadius: 8, border: "1px solid rgba(0,229,160,0.15)", fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
            💡 <strong style={{ color: "var(--text)" }}>Key insight:</strong> Minutes played is the strongest predictor — availability matters more than raw talent. Fixture difficulty is a forward-looking feature that captures upcoming schedule strength.
          </div>
        </div>

        {/* Model comparison */}
        <div className="card">
          <div style={{ fontFamily: "Rajdhani", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Model Comparison</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            <span>Model</span><span>MAE</span><span>vs Baseline</span>
          </div>
          {data.model_comparison.map((m, i) => (
            <div key={m.model} className={`model-row ${i === data.model_comparison.length - 1 ? "best" : ""}`}>
              <div className="model-name">{m.model}</div>
              <div className="model-mae">{m.mae}</div>
              <div className="model-imp">{m.improvement}</div>
            </div>
          ))}

          <hr className="divider" />

          <div style={{ fontFamily: "Rajdhani", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>How It Works</div>
          {[
            ["Data", "817 players · GW-by-GW history from FPL API · 20,703 rows"],
            ["Features", "Rolling 3/5-GW averages blended 70% form + 30% season avg to protect premiums"],
            ["Training", "80/20 train/test split · Optuna hyperparameter search (50 trials)"],
            ["Prediction", "Latest GW's features → predicted points for next GW"],
            ["Optimization", "ILP (PuLP/CBC) · 2-phase: squad selection then starting 11"],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, minWidth: 80, paddingTop: 1 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
