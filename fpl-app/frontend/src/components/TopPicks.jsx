import { useState, useEffect } from 'react'

const POS_ALL = ['ALL', 'GK', 'DEF', 'MID', 'FWD']
const SORT_OPTIONS = ['predicted_pts', 'price', 'avg_pts_last3', 'avg_xgi_last3']
const SORT_LABELS  = { predicted_pts: 'Predicted Pts', price: 'Price', avg_pts_last3: 'Form (3GW)', avg_xgi_last3: 'xGI' }

export default function TopPicks() {
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [pos, setPos]           = useState('ALL')
  const [maxPrice, setMaxPrice] = useState(15)
  const [sortBy, setSortBy]     = useState('predicted_pts')
  const [onlyAvail, setOnlyAvail] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 100, only_available: onlyAvail })
    if (pos !== 'ALL') params.set('position', pos)
    if (maxPrice < 15) params.set('max_price', maxPrice)

    fetch(`/api/predictions?${params}`)
      .then(r => r.json())
      .then(data => { setPlayers(data); setLoading(false) })
      .catch(() => { setError('Could not load predictions.'); setLoading(false) })
  }, [pos, maxPrice, onlyAvail])

  const sorted = [...players].sort((a, b) => b[sortBy] - a[sortBy])
  const maxPts = sorted[0]?.predicted_pts || 1

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">TOP PICKS</div>
        <div className="page-subtitle">LightGBM predictions for the upcoming gameweek · MAE 1.021 pts</div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <span className="filter-label">Position</span>
        {POS_ALL.map(p => (
          <button key={p} className={`filter-btn ${pos === p ? 'active' : ''}`} onClick={() => setPos(p)}>{p}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            Max £{maxPrice}m
            <input type="range" min={4} max={15} step={0.5} value={maxPrice}
              onChange={e => setMaxPrice(+e.target.value)}
              style={{ marginLeft: 8, accentColor: 'var(--accent)' }} />
          </label>
          <button className={`filter-btn ${onlyAvail ? 'active' : ''}`} onClick={() => setOnlyAvail(v => !v)}>
            Available only
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        <span className="filter-label">Sort by</span>
        {SORT_OPTIONS.map(s => (
          <button key={s} className={`filter-btn ${sortBy === s ? 'active' : ''}`} onClick={() => setSortBy(s)}>
            {SORT_LABELS[s]}
          </button>
        ))}
        <span className="muted mono" style={{ marginLeft: 'auto', fontSize: '0.78rem' }}>
          {sorted.length} players
        </span>
      </div>

      {loading && (
        <div className="state-box"><div className="spinner" style={{ margin: '0 auto' }} /></div>
      )}
      {error && <div className="state-box state-err">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap fade-up fade-up-1">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Team</th>
                <th>Pos</th>
                <th>Price</th>
                <th>Predicted Pts</th>
                <th>Form (3GW)</th>
                <th>xGI (3GW)</th>
                <th>Minutes (3GW)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 50).map((p, i) => (
                <tr key={p.player_id} style={{ animationDelay: `${i * 0.015}s` }}>
                  <td className="muted mono" style={{ fontSize: '0.75rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{p.web_name}</td>
                  <td className="muted" style={{ fontSize: '0.82rem' }}>{p.team_name}</td>
                  <td><span className={`pos-badge pos-${p.position}`}>{p.position}</span></td>
                  <td className="mono" style={{ color: 'var(--text)' }}>£{p.price.toFixed(1)}m</td>
                  <td>
                    <div className="pts-bar-wrap">
                      <div className="pts-bar" style={{ width: `${(p.predicted_pts / maxPts) * 80}px` }} />
                      <span className="pts-value">{p.predicted_pts.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: '0.82rem' }}>{p.avg_pts_last3?.toFixed(2) ?? '—'}</td>
                  <td className="mono" style={{ fontSize: '0.82rem' }}>{p.avg_xgi_last3?.toFixed(2) ?? '—'}</td>
                  <td className="mono" style={{ fontSize: '0.82rem' }}>{p.avg_minutes_last3?.toFixed(0) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
