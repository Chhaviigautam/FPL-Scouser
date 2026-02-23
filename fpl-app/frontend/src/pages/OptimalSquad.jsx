import { useState } from "react";
import { api } from "../api/client";

const POS_ORDER = ["GK", "DEF", "MID", "FWD"];

export default function OptimalSquad() {
  const [budget,  setBudget]  = useState(100);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try { setResult(await api.optimizeSquad(budget)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const starters = result ? POS_ORDER.flatMap((p) => result.starters.filter((pl) => pl.position === p)) : [];
  const bench    = result?.bench ?? [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Optimal Squad</div>
          <div className="page-subtitle">ILP · 2-phase · 15-man squad → best starting 11</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="input-group" style={{ minWidth: 220 }}>
            <label className="input-label">Budget</label>
            <div className="range-wrap" style={{ marginTop: 4 }}>
              <input type="range" min={80} max={100} step={0.5} value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value))} style={{ flex: 1 }} />
              <span className="range-val" style={{ color: "var(--accent)", fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>£{budget}m</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={run} disabled={loading} style={{ minWidth: 150 }}>
            {loading ? <><div className="spinner" style={{width:14,height:14}} />Optimising…</> : "Generate Squad"}
          </button>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginLeft: "auto" }}>
            {["2 GK · 5 DEF · 5 MID · 3 FWD", "Max 3 per club", "Backup GK ≤ £4m"].map((c) => (
              <span key={c} style={{ fontSize: 11.5, color: "var(--text3)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "var(--accent)", fontSize: 10 }}>✓</span>{c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error   && <div className="error-box">{error}</div>}
      {loading && <div className="loading"><div className="spinner" /><span>Running ILP optimizer…</span></div>}

      {result && !loading && (
        <div className="fade-in">
          <div className="stats-row">
            <div className="stat-card"><div className="stat-label">Total Cost</div><div className="stat-value amber">£{result.total_cost}m</div></div>
            <div className="stat-card"><div className="stat-label">Remaining</div><div className="stat-value">£{result.budget_remaining}m</div></div>
            <div className="stat-card"><div className="stat-label">XI Pred Pts</div><div className="stat-value green">{result.predicted_points}</div></div>
            <div className="stat-card">
              <div className="stat-label">Captain</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                <span className="cap-c">C</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{result.captain}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Vice Captain</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                <span className="cap-v">V</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{result.vice_captain}</span>
              </div>
            </div>
          </div>

          <div className="two-col" style={{ marginBottom: 16 }}>
            <div className="card">
              <div className="card-title">Starting XI</div>
              <div className="squad-list">
                {POS_ORDER.map((pos) => {
                  const group = starters.filter((p) => p.position === pos);
                  if (!group.length) return null;
                  return group.map((p) => (
                    <div key={p.web_name} className="player-row">
                      <span className={`pos pos-${p.position}`}>{p.position}</span>
                      <span className="player-name">
                        {p.web_name}
                        {p.web_name === result.captain      && <span className="cap-c" style={{marginLeft:7}}>C</span>}
                        {p.web_name === result.vice_captain && <span className="cap-v" style={{marginLeft:7}}>V</span>}
                      </span>
                      <span className="player-team">{p.team_name}</span>
                      <span className="price">£{p.price?.toFixed(1)}m</span>
                      <span className="player-pts">{p.predicted_pts}</span>
                    </div>
                  ));
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Bench</div>
              <div className="squad-list">
                {bench.map((p) => (
                  <div key={p.web_name} className="player-row" style={{ opacity: 0.65 }}>
                    <span className={`pos pos-${p.position}`}>{p.position}</span>
                    <span className="player-name">{p.web_name}</span>
                    <span className="player-team">{p.team_name}</span>
                    <span className="price">£{p.price?.toFixed(1)}m</span>
                    <span className="player-pts">{p.predicted_pts}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", fontSize: 11.5, color: "var(--text3)", lineHeight: 1.7 }}>
                Captain selected by highest predicted pts in starting XI. Vice captain is second highest.
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="empty"><div className="empty-icon">◎</div><div className="empty-msg">Set a budget and click Generate Squad</div></div>
      )}
    </div>
  );
}
