import { useState } from "react";
import { api } from "../api/client";

const LockIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UnlockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
const CloseIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function TransferPlanner() {
  const [teamId,       setTeamId]       = useState("");
  const [squadData,    setSquadData]    = useState(null);
  const [freeTf,       setFreeTf]       = useState(1);
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
      setSquadData(data); setFreeTf(data.free_transfers);
    } catch (e) { setError(e.message); }
    finally { setLoadingSquad(false); }
  }

  async function optimize() {
    setLoadingOpt(true); setError(null); setResult(null);
    try {
      setResult(await api.optimizeTransfers({ team_id: parseInt(teamId), free_transfers: freeTf, hit_cost: 4, locked_players: locked }));
    } catch (e) { setError(e.message); }
    finally { setLoadingOpt(false); }
  }

  const toggleLock = (name) => setLocked((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Transfer Planner</div>
          <div className="page-subtitle">FPL API squad fetch · hit-aware ILP · captain recommendation</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Step 1 */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="step-num">1</span>
            <span className="step-title">Load Your Squad</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, lineHeight: 1.6 }}>
            Find your Team ID in the FPL URL:{" "}
            <span style={{ fontFamily: "'Geist Mono', monospace", color: "var(--blue)", fontSize: 11.5 }}>
              fantasy.premierleague.com/entry/<strong style={{color:"var(--text)"}}>123456</strong>/event/…
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="Team ID" value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchSquad()}
              style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={fetchSquad} disabled={!teamId || loadingSquad} style={{ minWidth: 110 }}>
              {loadingSquad ? <><div className="spinner" style={{width:13,height:13}} />Loading</> : "Load Squad"}
            </button>
          </div>

          {squadData && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11.5, color: "var(--text3)" }}>GW <span style={{color:"var(--text)", fontWeight:600}}>{squadData.gameweek}</span></span>
                <span style={{ fontSize: 11.5, color: "var(--text3)" }}>ITB <span style={{color:"var(--amber)", fontFamily:"'Geist Mono',monospace"}}>£{squadData.itb}m</span></span>
                <span style={{ fontSize: 11.5, color: "var(--text3)" }}>Free transfers <span style={{color:"var(--accent)", fontWeight:600}}>{squadData.free_transfers}</span></span>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 8, fontFamily: "'Geist Mono', monospace" }}>
                Click to lock / unlock a player
              </div>
              <div className="squad-list">
                {["GK","DEF","MID","FWD"].flatMap((pos) =>
                  squadData.players.filter((p) => p.position === pos).map((p) => {
                    const isLocked = locked.includes(p.web_name);
                    return (
                      <div key={p.player_id} className={`player-row clickable ${isLocked ? "locked" : ""}`}
                        onClick={() => toggleLock(p.web_name)}>
                        <span className={`pos pos-${p.position}`}>{p.position}</span>
                        <span className="player-name">{p.web_name}</span>
                        <span className="player-team">{p.team_name}</span>
                        <span className="price">£{p.price?.toFixed(1)}m</span>
                        <span className="player-pts">{p.predicted_pts}</span>
                        {isLocked && (
                          <span style={{ color: "var(--blue)", display: "flex" }}>
                            <LockIcon />
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="step-num">2</span>
            <span className="step-title">Settings</span>
          </div>

          <div className="input-group">
            <label className="input-label">Free Transfers</label>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} className={`filter-pill ${freeTf === n ? "active" : ""}`}
                  onClick={() => setFreeTf(n)} style={{ flex: 1, borderRadius: "var(--radius-sm)" }}>{n}</button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Hit Penalty</label>
            <div style={{ marginTop: 4, fontSize: 13, color: "var(--text2)" }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", color: "var(--red)" }}>−4 pts</span> per extra transfer
              <span style={{ fontSize: 11, color: "var(--text3)", display: "block", marginTop: 3 }}>Standard FPL rules</span>
            </div>
          </div>

          {locked.length > 0 && (
            <div className="input-group">
              <label className="input-label">Locked Players ({locked.length})</label>
              <div className="locked-list">
                {locked.map((name) => (
                  <div key={name} className="locked-chip" onClick={() => toggleLock(name)} title="Click to unlock">
                    <LockIcon />{name}<CloseIcon />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {["Budget = sell value + ITB", "Transfers in = transfers out", "Hits deducted from score", "Position limits enforced"].map((c) => (
                <div key={c} style={{ display: "flex", gap: 6, fontSize: 11.5, color: "var(--text3)", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--accent)", marginTop: 1, fontSize: 10 }}>✓</span>{c}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}
              onClick={optimize} disabled={!squadData || loadingOpt}>
              {loadingOpt ? <><div className="spinner" style={{width:13,height:13}} />Optimising…</> : "Find Best Transfers"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && !loadingOpt && (
        <div className="fade-in">
          <div className="stats-row">
            <div className="stat-card"><div className="stat-label">Transfers</div><div className="stat-value blue">{result.transfers_made}</div></div>
            <div className="stat-card"><div className="stat-label">Hits</div><div className={`stat-value ${result.hits_taken > 0 ? "red" : "green"}`}>{result.hits_taken}</div></div>
            <div className="stat-card"><div className="stat-label">Pts Penalty</div><div className={`stat-value ${result.points_hit > 0 ? "red" : "green"}`}>{result.points_hit > 0 ? `−${result.points_hit}` : "0"}</div></div>
            <div className="stat-card"><div className="stat-label">Net Pts Gain</div><div className={`stat-value ${result.net_pts_gain >= 0 ? "green" : "red"}`}>{result.net_pts_gain > 0 ? "+" : ""}{result.net_pts_gain}</div></div>
            <div className="stat-card">
              <div className="stat-label">Captain</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                <span className="cap-c">C</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{result.captain}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Vice Captain</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                <span className="cap-v">V</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{result.vice_captain}</span>
              </div>
            </div>
          </div>

          {result.transfers_made === 0 ? (
            <div className="success-box">No transfers recommended — hold your squad this gameweek.</div>
          ) : (
            <>
              <div className="transfer-cols">
                <div>
                  <div className="transfer-col-label out">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Transfer Out
                  </div>
                  <div className="squad-list">
                    {result.transfers_out.map((p) => (
                      <div key={p.player_id} className="player-row is-out">
                        <span className={`pos pos-${p.position}`}>{p.position}</span>
                        <span className="player-name">{p.web_name}</span>
                        <span className="player-team">{p.team_name}</span>
                        <span className="price">£{p.price?.toFixed(1)}m</span>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--red)" }}>{p.predicted_pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="transfer-col-label in">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Transfer In
                  </div>
                  <div className="squad-list">
                    {result.transfers_in.map((p) => (
                      <div key={p.player_id} className="player-row is-new">
                        <span className={`pos pos-${p.position}`}>{p.position}</span>
                        <span className="player-name">{p.web_name}</span>
                        <span className="player-team">{p.team_name}</span>
                        <span className="price">£{p.price?.toFixed(1)}m</span>
                        <span className="player-pts">{p.predicted_pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Full New Squad</div>
                <div className="squad-list">
                  {["GK","DEF","MID","FWD"].flatMap((pos) =>
                    result.new_squad
                      .filter((p) => p.position === pos)
                      .sort((a, b) => b.predicted_pts - a.predicted_pts)
                      .map((p) => (
                        <div key={p.player_id} className={`player-row ${!p.in_current ? "is-new" : ""}`}>
                          <span className={`pos pos-${p.position}`}>{p.position}</span>
                          <span className="player-name">{p.web_name}</span>
                          <span className="player-team">{p.team_name}</span>
                          <span className="price">£{p.price?.toFixed(1)}m</span>
                          <span className="player-pts">{p.predicted_pts}</span>
                          <span className={`tag ${p.in_current ? "tag-kept" : "tag-new"}`}>{p.in_current ? "kept" : "new"}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
