import { useState } from "react";
import { api } from "../api/client";

export default function TransferPlanner() {
  const [teamId,       setTeamId]       = useState("");
  const [squadData,    setSquadData]    = useState(null);
  const [freeTf,       setFreeTf]       = useState(1);
  const [hitCost,      setHitCost]      = useState(4);
  const [locked,       setLocked]       = useState([]);
  const [result,       setResult]       = useState(null);
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [loadingOpt,   setLoadingOpt]   = useState(false);
  const [error,        setError]        = useState(null);

  async function fetchSquad() {
    if (!teamId) return;
    setLoadingSquad(true); setError(null); setSquadData(null); setResult(null); setLocked([]);
    try {
      const data = await api.fetchSquad(teamId);
      setSquadData(data);
      setFreeTf(data.free_transfers);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingSquad(false);
    }
  }

  async function optimize() {
    setLoadingOpt(true); setError(null); setResult(null);
    try {
      setResult(await api.optimizeTransfers({
        team_id: parseInt(teamId),
        free_transfers: freeTf,
        hit_cost: hitCost,
        locked_players: locked,
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingOpt(false);
    }
  }

  function toggleLock(name) {
    setLocked((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔄 Transfer Planner</div>
        <div className="page-subtitle">Fetches your squad via FPL API and finds optimal transfers, accounting for hits</div>
      </div>

      {/* Step 1 */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontFamily: "Rajdhani", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Step 1 — Load Your Squad</div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 16 }}>
            Find your Team ID in the FPL URL: <span style={{ color: "var(--accent2)" }}>fantasy.premierleague.com/entry/<strong>123456</strong>/event/26</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="input" placeholder="Team ID e.g. 12946616" value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchSquad()}
              style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={fetchSquad} disabled={!teamId || loadingSquad} style={{ minWidth: 120 }}>
              {loadingSquad ? <><span className="spinner" style={{ display: "inline-block", width: 14, height: 14, marginRight: 8 }} />Loading…</> : "📥 Load Squad"}
            </button>
          </div>

          {squadData && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>GW {squadData.gameweek}</span>
                <span style={{ fontSize: 12, color: "var(--yellow)" }}>£{squadData.itb}m ITB</span>
                <span style={{ fontSize: 12, color: "var(--accent)" }}>{squadData.free_transfers} free transfer{squadData.free_transfers !== 1 ? "s" : ""}</span>
              </div>
              <div className="squad-grid">
                {["GK","DEF","MID","FWD"].flatMap((pos) =>
                  squadData.players.filter((p) => p.position === pos).map((p) => (
                    <div key={p.player_id} className="player-row"
                      style={{ cursor: "pointer", borderColor: locked.includes(p.web_name) ? "var(--accent2)" : undefined }}
                      onClick={() => toggleLock(p.web_name)}>
                      <span className={`pos pos-${p.position}`}>{p.position}</span>
                      <span className="player-name">{p.web_name}</span>
                      <span className="player-team">{p.team_name}</span>
                      <span className="player-price">£{p.price?.toFixed(1)}m</span>
                      <span className="player-pts">{p.predicted_pts}</span>
                      {locked.includes(p.web_name) && (
                        <span style={{ fontSize: 14, color: "var(--accent2)" }} title="Locked">🔒</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              {locked.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                  🔒 Click a player to lock/unlock them (locked players will never be transferred out)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: "Rajdhani", fontSize: 16, fontWeight: 700 }}>Step 2 — Settings</div>

          <div className="input-group">
            <label className="input-label">Free Transfers</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} className={`filter-btn ${freeTf === n ? "active" : ""}`} onClick={() => setFreeTf(n)} style={{ flex: 1 }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Hit Cost (pts per extra transfer)</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[4].map((n) => (
                <button key={n} className={`filter-btn active`}>{n} pts</button>
              ))}
              <span style={{ color: "var(--muted)", fontSize: 12, display: "flex", alignItems: "center" }}>Standard FPL rules</span>
            </div>
          </div>

          {locked.length > 0 && (
            <div className="input-group">
              <label className="input-label">Locked Players</label>
              <div className="locked-list">
                {locked.map((name) => (
                  <div key={name} className="locked-chip" onClick={() => toggleLock(name)} title="Click to unlock">
                    🔒 {name} ✕
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.8 }}>
              ✓ Budget = squad value + ITB<br />
              ✓ Transfers in = transfers out<br />
              ✓ Hit deducted from objective<br />
              ✓ Position limits enforced
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}
              onClick={optimize}
              disabled={!squadData || loadingOpt}>
              {loadingOpt ? <><span className="spinner" style={{ display: "inline-block", width: 14, height: 14, marginRight: 8 }} />Optimizing…</> : "🔄 Find Best Transfers"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Results */}
      {result && !loadingOpt && (
        <>
          <div className="stats-row">
            <div className="stat-card"><div className="stat-label">Transfers Made</div><div className="stat-value blue">{result.transfers_made}</div></div>
            <div className="stat-card"><div className="stat-label">Hits Taken</div><div className={`stat-value ${result.hits_taken > 0 ? "red" : "green"}`}>{result.hits_taken}</div></div>
            <div className="stat-card"><div className="stat-label">Points Hit</div><div className={`stat-value ${result.points_hit > 0 ? "red" : "green"}`}>{result.points_hit > 0 ? `-${result.points_hit}` : "0"}</div></div>
            <div className="stat-card"><div className="stat-label">Net Pts Gain</div><div className={`stat-value ${result.net_pts_gain >= 0 ? "green" : "red"}`}>{result.net_pts_gain > 0 ? "+" : ""}{result.net_pts_gain}</div></div>
          </div>

          {result.transfers_made === 0 ? (
            <div className="success-box">✅ No transfers recommended — keep your current squad this week.</div>
          ) : (
            <>
              <div className="transfer-grid">
                <div className="transfer-section transfer-out">
                  <h3>❌ Transfer Out</h3>
                  <div className="squad-grid">
                    {result.transfers_out.map((p) => (
                      <div key={p.player_id} className="player-row" style={{ borderLeft: "3px solid var(--red)" }}>
                        <span className={`pos pos-${p.position}`}>{p.position}</span>
                        <span className="player-name">{p.web_name}</span>
                        <span className="player-team">{p.team_name}</span>
                        <span className="player-price">£{p.price?.toFixed(1)}m</span>
                        <span style={{ color: "var(--red)", fontWeight: 700 }}>{p.predicted_pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="transfer-section transfer-in">
                  <h3>✅ Transfer In</h3>
                  <div className="squad-grid">
                    {result.transfers_in.map((p) => (
                      <div key={p.player_id} className="player-row" style={{ borderLeft: "3px solid var(--accent)" }}>
                        <span className={`pos pos-${p.position}`}>{p.position}</span>
                        <span className="player-name">{p.web_name}</span>
                        <span className="player-team">{p.team_name}</span>
                        <span className="player-price">£{p.price?.toFixed(1)}m</span>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>{p.predicted_pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="divider" />
              <div className="card">
                <div style={{ fontFamily: "Rajdhani", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>📋 Full New Squad</div>
                <div className="squad-grid">
                  {["GK","DEF","MID","FWD"].flatMap((pos) =>
                    result.new_squad
                      .filter((p) => {
                        const posMap = { 1:"GK", 2:"DEF", 3:"MID", 4:"FWD" };
                        return (p.position || posMap[p.element_type]) === pos;
                      })
                      .sort((a,b) => b.predicted_pts - a.predicted_pts)
                      .map((p) => (
                        <div key={p.player_id} className="player-row"
                          style={{ borderLeft: `3px solid ${p.in_current ? "var(--border)" : "var(--accent)"}` }}>
                          <span className={`pos pos-${p.position}`}>{p.position}</span>
                          <span className="player-name">{p.web_name}</span>
                          <span className="player-team">{p.team_name}</span>
                          <span className="player-price">£{p.price?.toFixed(1)}m</span>
                          <span className="player-pts">{p.predicted_pts}</span>
                          <span style={{ fontSize: 11, color: p.in_current ? "var(--muted)" : "var(--accent)", minWidth: 40, textAlign: "right" }}>
                            {p.in_current ? "kept" : "🆕 new"}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
