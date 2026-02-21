import { useState } from 'react'

const POS_EMOJI = { GK: '🧤', DEF: '🛡️', MID: '⚙️', FWD: '⚡' }
const POS_ORDER = ['GK', 'DEF', 'MID', 'FWD']

function groupByPos(players) {
  return POS_ORDER.reduce((acc, pos) => {
    acc[pos] = players.filter(p => p.position === pos)
    return acc
  }, {})
}

function PitchView({ starters }) {
  const byPos = groupByPos(starters)
  return (
    <div className="pitch-grid">
      {POS_ORDER.map(pos => (
        <div key={pos} className="pitch-row">
          {(byPos[pos] || []).map(p => (
            <div key={p.player_id} className="pitch-player">
              <div className={`pitch-player-shirt ${pos}`}>{POS_EMOJI[pos]}</div>
              <div className="pitch-player-name">{p.web_name}</div>
              <div className="pitch-player-pts">{p.predicted_pts.toFixed(1)}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function OptimalSquad() {
  const [budget, setBudget]   = useState(100)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [view, setView]       = useState('pitch') // pitch | list

  const run = () => {
    setLoading(true); setError(null); setResult(null)
    fetch('/api/optimize-squad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget }),
    })
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false) })
      .catch(() => { setError('Optimisation failed — is the backend running?'); setLoading(false) })
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">OPTIMAL SQUAD</div>
        <div className="page-subtitle">ILP optimizer · 15-man squad · best starting 11</div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Budget</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={80} max={100} step={0.5} value={budget}
              onChange={e => setBudget(+e.target.value)}
              style={{ accentColor: 'var(--accent)', width: 160 }} />
            <span className="mono accent" style={{ fontSize: '1.1rem', fontWeight: 600 }}>£{budget}m</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={run} disabled={loading} style={{ marginLeft: 'auto' }}>
          {loading ? <><div className="spinner" /> Optimising…</> : '🚀 Generate Squad'}
        </button>
      </div>

      {error && <div className="state-box state-err">{error}</div>}

      {result && (
        <div className="fade-up">
          {/* Stats */}
          <div className="stat-grid fade-up fade-up-1">
            <div className="stat-card">
              <div className="stat-label">Squad Cost</div>
              <div className="stat-value accent">£{result.total_cost}m</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Budget Left</div>
              <div className="stat-value">{(budget - result.total_cost).toFixed(1)}m</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">XI Predicted Pts</div>
              <div className="stat-value gold">{result.total_predicted_pts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Players</div>
              <div className="stat-value">15</div>
            </div>
          </div>

          {/* View toggle */}
          <div className="filter-row fade-up fade-up-2" style={{ marginBottom: 16 }}>
            <button className={`filter-btn ${view === 'pitch' ? 'active' : ''}`} onClick={() => setView('pitch')}>⚽ Pitch View</button>
            <button className={`filter-btn ${view === 'list'  ? 'active' : ''}`} onClick={() => setView('list')}>📋 List View</button>
          </div>

          {view === 'pitch' ? (
            <div className="fade-up fade-up-3">
              <div style={{ marginBottom: 8, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Starting XI</div>
              <PitchView starters={result.starters} />
              <div style={{ marginTop: 16, marginBottom: 8, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bench</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {result.bench.map(p => (
                  <div key={p.player_id} className="card card-sm" style={{ flex: 1, opacity: 0.7 }}>
                    <span className={`pos-badge pos-${p.position}`} style={{ marginBottom: 6, display: 'inline-block' }}>{p.position}</span>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.web_name}</div>
                    <div className="mono accent" style={{ fontSize: '0.78rem', marginTop: 3 }}>{p.predicted_pts.toFixed(2)} pts</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="fade-up fade-up-3">
              {['Starting XI', 'Bench'].map((label, si) => {
                const rows = si === 0 ? result.starters : result.bench
                return (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <div style={{ marginBottom: 8, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Player</th><th>Team</th><th>Pos</th><th>Price</th><th>Predicted Pts</th></tr>
                        </thead>
                        <tbody>
                          {rows.map(p => (
                            <tr key={p.player_id}>
                              <td style={{ fontWeight: 500 }}>{p.web_name}</td>
                              <td className="muted">{p.team_name}</td>
                              <td><span className={`pos-badge pos-${p.position}`}>{p.position}</span></td>
                              <td className="mono">£{p.price.toFixed(1)}m</td>
                              <td><span className="mono accent">{p.predicted_pts.toFixed(2)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!loading && !result && !error && (
        <div className="state-box">
          <div className="state-icon">🏆</div>
          <div className="state-msg">Set your budget and click Generate Squad</div>
        </div>
      )}
    </div>
  )
}
