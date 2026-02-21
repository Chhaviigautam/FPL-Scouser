import { useState } from 'react'

export default function TransferPlanner() {
  const [teamId, setTeamId]         = useState('')
  const [squadData, setSquadData]   = useState(null)
  const [loadingSquad, setLoadingSquad] = useState(false)
  const [squadError, setSquadError] = useState(null)

  const [freeTf, setFreeTf]         = useState(1)
  const [hitCost, setHitCost]       = useState(4)
  const [locked, setLocked]         = useState([])

  const [result, setResult]         = useState(null)
  const [running, setRunning]       = useState(false)
  const [runError, setRunError]     = useState(null)

  const loadSquad = () => {
    if (!teamId) return
    setLoadingSquad(true); setSquadError(null); setSquadData(null); setResult(null); setLocked([])
    fetch(`/api/squad/${teamId}`)
      .then(r => { if (!r.ok) return r.json().then(e => Promise.reject(e.detail)); return r.json() })
      .then(data => {
        setSquadData(data)
        setFreeTf(data.free_transfers || 1)
        setLoadingSquad(false)
      })
      .catch(err => { setSquadError(String(err)); setLoadingSquad(false) })
  }

  const toggleLock = (pid) => {
    setLocked(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid])
  }

  const runTransfers = () => {
    setRunning(true); setRunError(null); setResult(null)
    fetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: +teamId,
        free_transfers: freeTf,
        hit_cost: hitCost,
        locked_player_ids: locked,
      }),
    })
      .then(r => { if (!r.ok) return r.json().then(e => Promise.reject(e.detail)); return r.json() })
      .then(data => { setResult(data); setRunning(false) })
      .catch(err => { setRunError(String(err)); setRunning(false) })
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">TRANSFER PLANNER</div>
        <div className="page-subtitle">Auto-fetch your squad · ILP transfer optimisation · hit-aware</div>
      </div>

      {/* Step 1 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>
          Step 1 — Your FPL Team ID
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12 }}>
          Find it in the URL: <span className="mono accent">fantasy.premierleague.com/entry/<span className="gold">123456</span>/event/26</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" type="number" placeholder="e.g. 12946616" value={teamId}
            onChange={e => setTeamId(e.target.value)}
            style={{ maxWidth: 220 }}
            onKeyDown={e => e.key === 'Enter' && loadSquad()} />
          <button className="btn btn-primary" onClick={loadSquad} disabled={!teamId || loadingSquad}>
            {loadingSquad ? <><div className="spinner" />Loading…</> : '📥 Load Squad'}
          </button>
        </div>
        {squadError && <div style={{ color: 'var(--red)', fontSize: '0.83rem', marginTop: 10 }}>⚠ {squadError}</div>}
      </div>

      {/* Squad + settings */}
      {squadData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }} className="fade-up">
          {/* Squad list + lock */}
          <div className="card">
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>
              GW{squadData.gameweek} Squad
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 14 }}>
              Click players to 🔒 lock them (optimizer won't sell them)
            </div>
            <div className="chip-list">
              {squadData.players.map(p => (
                <div key={p.player_id}
                  className={`chip ${locked.includes(p.player_id) ? 'locked' : ''}`}
                  onClick={() => toggleLock(p.player_id)}>
                  {locked.includes(p.player_id) && <span>🔒</span>}
                  <span className={`pos-badge pos-${p.position}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{p.position}</span>
                  <span>{p.web_name}</span>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {p.predicted_pts?.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>
              Step 2 — Settings
            </div>

            {[
              { label: 'Free transfers', val: freeTf, set: setFreeTf, min: 1, max: 5 },
              { label: 'Hit cost (pts)', val: hitCost, set: setHitCost, min: 1, max: 8 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label}>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
                    <button key={n}
                      className={`filter-btn ${val === n ? 'active' : ''}`}
                      style={{ padding: '4px 10px' }}
                      onClick={() => set(n)}>{n}</button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>
                ITB: <span className="mono accent">£{squadData.itb}m</span> ·
                Bank: <span className="mono accent">
                  £{(squadData.players.reduce((s, p) => s + (p.price || 0), 0)).toFixed(1)}m
                </span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={runTransfers} disabled={running}>
                {running ? <><div className="spinner" />Optimising…</> : '🔄 Find Best Transfers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {runError && <div className="state-box state-err">{runError}</div>}

      {/* Results */}
      {result && (
        <div className="fade-up">
          <div className="stat-grid fade-up fade-up-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-label">Transfers</div>
              <div className="stat-value">{result.n_transfers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Hits Taken</div>
              <div className={`stat-value ${result.hits_taken > 0 ? 'red' : ''}`}>{result.hits_taken}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Points Hit</div>
              <div className={`stat-value ${result.net_hit_pts > 0 ? 'red' : ''}`}>
                {result.net_hit_pts > 0 ? `-${result.net_hit_pts}` : '0'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Net Pts Gain</div>
              <div className={`stat-value ${result.pts_gain_after_hit >= 0 ? 'accent' : 'red'}`}>
                {result.pts_gain_after_hit > 0 ? '+' : ''}{result.pts_gain_after_hit}
              </div>
            </div>
          </div>

          {result.n_transfers === 0 ? (
            <div className="card fade-up fade-up-2" style={{ textAlign: 'center', color: 'var(--accent)', padding: 32 }}>
              ✅ No transfers recommended — hold your current squad this week.
            </div>
          ) : (
            <>
              <div className="transfer-grid fade-up fade-up-2">
                <div className="transfer-card">
                  <div className="transfer-card-header out">❌ Transfer Out</div>
                  <table style={{ width: '100%' }}>
                    <thead><tr><th>Player</th><th>Team</th><th>Pos</th><th>Price</th><th>Pred Pts</th></tr></thead>
                    <tbody>
                      {result.transfers_out.map(p => (
                        <tr key={p.player_id}>
                          <td style={{ fontWeight: 500 }}>{p.web_name}</td>
                          <td className="muted" style={{ fontSize: '0.8rem' }}>{p.team_name}</td>
                          <td><span className={`pos-badge pos-${p.position}`}>{p.position}</span></td>
                          <td className="mono">£{p.price.toFixed(1)}m</td>
                          <td className="mono" style={{ color: 'var(--red)' }}>{p.predicted_pts.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="transfer-card">
                  <div className="transfer-card-header in">✅ Transfer In</div>
                  <table style={{ width: '100%' }}>
                    <thead><tr><th>Player</th><th>Team</th><th>Pos</th><th>Price</th><th>Pred Pts</th></tr></thead>
                    <tbody>
                      {result.transfers_in.map(p => (
                        <tr key={p.player_id}>
                          <td style={{ fontWeight: 500 }}>{p.web_name}</td>
                          <td className="muted" style={{ fontSize: '0.8rem' }}>{p.team_name}</td>
                          <td><span className={`pos-badge pos-${p.position}`}>{p.position}</span></td>
                          <td className="mono">£{p.price.toFixed(1)}m</td>
                          <td className="mono accent">{p.predicted_pts.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full new squad */}
              <div className="fade-up fade-up-3">
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>
                  Full New Squad
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Player</th><th>Team</th><th>Pos</th><th>Price</th><th>Pred Pts</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {[...result.new_squad].sort((a,b) => {
                        const o = ['GK','DEF','MID','FWD']
                        return o.indexOf(a.position) - o.indexOf(b.position) || b.predicted_pts - a.predicted_pts
                      }).map(p => (
                        <tr key={p.player_id}>
                          <td style={{ fontWeight: 500 }}>{p.web_name}</td>
                          <td className="muted">{p.team_name}</td>
                          <td><span className={`pos-badge pos-${p.position}`}>{p.position}</span></td>
                          <td className="mono">£{p.price.toFixed(1)}m</td>
                          <td className="mono accent">{p.predicted_pts.toFixed(2)}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4,
                              background: p.status_label === 'new' ? 'rgba(0,255,135,0.1)' : 'transparent',
                              color: p.status_label === 'new' ? 'var(--accent)' : 'var(--muted)',
                              border: p.status_label === 'new' ? '1px solid rgba(0,255,135,0.2)' : 'none',
                            }}>
                              {p.status_label === 'new' ? '🆕 New' : '✅ Kept'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!squadData && !loadingSquad && (
        <div className="state-box">
          <div className="state-icon">🔄</div>
          <div className="state-msg">Enter your FPL Team ID to get started</div>
        </div>
      )}
    </div>
  )
}
