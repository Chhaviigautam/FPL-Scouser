import { useState, useEffect } from "react";
import { api } from "../api/client";

const FEATURE_LABELS = {
  avg_pts_last3:          "Avg Pts (3GW)",
  avg_pts_last5:          "Avg Pts (5GW)",
  form_trend:             "Form Trend",
  avg_minutes_last3:      "Avg Minutes (3GW)",
  avg_xgi_last3:          "Avg xGI (3GW)",
  avg_ict_last3:          "Avg ICT (3GW)",
  avg_bps_last3:          "Avg BPS (3GW)",
  is_home:                "Home Fixture",
  value:                  "Player Price",
  avg_fixture_difficulty: "Fixture Difficulty",
};

export default function ModelInsights() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.getModelInsights().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading insights…</span></div>;
  if (error)   return <div className="error-box">{error}</div>;

  const maxImp = Math.max(...Object.values(data.feature_importances));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Model Insights</div>
          <div className="page-subtitle">LightGBM · Optuna-tuned · feature importances</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Algorithm</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginTop: 6 }}>LightGBM</div>
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
        <div className="stat-card">
          <div className="stat-label">Features</div>
          <div className="stat-value">{Object.keys(data.feature_importances).length}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Feature Importance</div>
          {Object.entries(data.feature_importances).map(([feat, val], i) => (
            <div key={feat} className="feat-row">
              <div className="feat-label">{FEATURE_LABELS[feat] || feat}</div>
              <div className="feat-track">
                <div className="feat-fill" style={{ width: `${(val / maxImp) * 100}%`, opacity: i === 0 ? 1 : 0.6 + (1 - i / 10) * 0.4 }} />
              </div>
              <div className="feat-val">{val.toLocaleString()}</div>
            </div>
          ))}
          <div style={{ marginTop: 18, padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--accent)" }}>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--text)" }}>Key insight:</strong> Minutes played dominates — player availability matters more than raw talent. Fixture difficulty adds forward-looking context the rolling averages alone cannot capture.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-title">Model Comparison</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 8px", borderBottom: "1px solid var(--border)", fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Geist Mono', monospace" }}>
              <span>Model</span><span>MAE</span><span>vs Baseline</span>
            </div>
            {data.model_comparison.map((m, i) => (
              <div key={m.model} className={`model-row ${i === data.model_comparison.length - 1 ? "best" : ""}`}>
                <div className="model-name">{m.model}</div>
                <div className="model-mae">{m.mae}</div>
                <div className="model-imp">{m.improvement}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Pipeline</div>
            {[
              ["Data",      "817 players · GW history from FPL API · 20,703 rows"],
              ["Features",  "3/5-GW rolling averages blended 70% form + 30% season"],
              ["Training",  "80/20 split · Optuna hyperparameter search · 50 trials"],
              ["Inference", "Latest GW features → predicted pts for next GW"],
              ["Optimizer", "ILP (PuLP/CBC) · 2-phase: squad selection → starting XI"],
            ].map(([key, val]) => (
              <div key={key} className="info-row">
                <div className="info-key">{key}</div>
                <div className="info-val">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
