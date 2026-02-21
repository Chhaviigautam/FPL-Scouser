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
    try {
      setResult(await api.optimizeSquad(budget));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const starters = result ? POS_ORDER.flatMap((p) =>
    result.starters.filter((pl) => pl.position === p)) : [];
  const bench = result?.bench ?? [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏆 Optimal Squad</div>
        <div className="page-subtitle">Integer Linear Programming · 2-phase selection (15-man squad → best 11)</div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="input-group" style={{ minWidth: 200 }}>
            <label className="input-label">Budget</label>
            <div className="filter-range" style={{ gap: 12 }}>
              <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 18 }}>£{budget}m</span>
              <input type="range" min={80} max={100} step={0.5} value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value))}
                style={{ flex: 1 }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={run} disabled={loading} style={{ minWidth: 160 }}>
            {loading ? <><span className="spinner" style={{ display: "inline-block", width: 14, height: 14, marginRight: 8 }} />Optimizing…</> : "🚀 Generate Squad"}
          </button>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 20 }}>
          {["2 GK, 5 DEF, 5 MID, 3 FWD", "Max 3 per club", "Backup GK ≤ £4m", "Starting 11: 1GK, 3-5 DEF, 3-5 MID, 1-3 FWD"].map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 12 }}>
              <span style={{ color: "var(--accent)" }}>✓</span> {c}
            </div>
          ))}
        </div>
      </div>

      {error   && <div className="error-box">{error}</div>}
      {loading && <div className="loading"><div className="spinner" /><span>Running ILP optimizer…</span></div>}

      {result && !loading && (
        <>
          {/* Summary */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Cost</div>
              <div className="stat-value yellow">£{result.total_cost}m</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Budget Left</div>
              <div className="stat-value green">£{result.budget_remaining}m</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Starting 11 Pred Pts</div>
              <div className="stat-value green">{result.predicted_points}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Squad Size</div>
              <div className="stat-value blue">15</div>
            </div>
          </div>

          {/* Starting 11 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>
              ⚡ Starting 11
            </div>
            {POS_ORDER.map((pos) => {
              const group = starters.filter((p) => p.position === pos);
              if (!group.length) return null;
              return (
                <div key={pos} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{pos}</div>
                  <div className="squad-grid">
                    {group.map((p) => (
                      <div key={p.web_name} className="player-row starter">
                        <span className={`pos pos-${p.position}`}>{p.position}</span>
                        <span className="player-name">{p.web_name}</span>
                        <span className="player-team">{p.team_name}</span>
                        <span className="player-price">£{p.price.toFixed(1)}m</span>
                        <span className="player-pts">{p.predicted_pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bench */}
          <div className="card">
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--muted)" }}>
              🪑 Bench
            </div>
            <div className="squad-grid">
              {bench.map((p) => (
                <div key={p.web_name} className="player-row bench">
                  <span className={`pos pos-${p.position}`}>{p.position}</span>
                  <span className="player-name">{p.web_name}</span>
                  <span className="player-team">{p.team_name}</span>
                  <span className="player-price">£{p.price.toFixed(1)}m</span>
                  <span className="player-pts">{p.predicted_pts}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
