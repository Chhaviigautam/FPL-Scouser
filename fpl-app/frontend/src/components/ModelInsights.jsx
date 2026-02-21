import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const FEATURE_LABELS = {
  avg_pts_last3:         'Avg Pts (3GW)',
  avg_pts_last5:         'Avg Pts (5GW)',
  form_trend:            'Form Trend',
  avg_minutes_last3:     'Avg Minutes (3GW)',
  avg_xgi_last3:         'xGI (3GW)',
  avg_ict_last3:         'ICT Index (3GW)',
  avg_bps_last3:         'BPS (3GW)',
  is_home:               'Home Fixture',
  value:                 'Player Price',
  avg_fixture_difficulty:'Fixture Difficulty',
}

const POS_COLORS = { GK: '#ffd700', DEF: '#00ff87', MID: '#38ef7d', FWD: '#ff4757' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div className="mono accent">{payload[0].value.toLocaleString()}</div>
    </div>
  )
}

export default function ModelInsights() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    fetch('/api/model-insights')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Could not load model insights.'); setLoading(false) })
  }, [])

  if (loading) return <div className="state-box"><div className="spinner" style={{ margin: '0 auto' }} /></div>
  if (error)   return <div className="state-box state-err">{error}</div>

  const { feature_importances, position_stats, model_info } = data

  const importanceData = Object.entries(feature_importances)
    .map(([k, v]) => ({ name: FEATURE_LABELS[k] || k, value: v }))
    .sort((a, b) => b.value - a.value)

  const maxImp = importanceData[0]?.value || 1

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-title">MODEL INSIGHTS</div>
        <div className="page-subtitle">LightGBM internals · feature importance · position breakdown</div>
      </div>

      {/* Model stats */}
      <div className="stat-grid fade-up fade-up-1">
        <div className="stat-card">
          <div className="stat-label">Model Type</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--accent)', marginTop: 6 }}>LightGBM</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>Tuned via Optuna (50 trials)</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Model MAE</div>
          <div className="stat-value accent">{model_info.mae}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>pts per player per GW</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Baseline MAE</div>
          <div className="stat-value">{model_info.baseline_mae}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>always-predict-mean</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Improvement</div>
          <div className="stat-value gold">{model_info.improvement_pct}%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>vs baseline</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Training Rows</div>
          <div className="stat-value">{model_info.training_rows.toLocaleString()}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>GW records</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Features</div>
          <div className="stat-value">{model_info.features.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>engineered features</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }} className="fade-up fade-up-2">
        {/* Feature importance chart */}
        <div className="card">
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 16 }}>
            Feature Importance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {importanceData.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 140, fontSize: '0.78rem', color: i === 0 ? 'var(--accent)' : 'var(--text)', flexShrink: 0, textAlign: 'right' }}>
                  {item.name}
                </div>
                <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(item.value / maxImp) * 100}%`,
                    background: i === 0 ? 'var(--accent)' : i < 3 ? 'var(--accent2)' : 'rgba(0,255,135,0.35)',
                    borderRadius: 4,
                    transition: 'width 0.6s ease',
                    animationDelay: `${i * 0.05}s`,
                  }} />
                </div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', width: 50, textAlign: 'right' }}>
                  {item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(0,255,135,0.05)', borderRadius: 8, border: '1px solid rgba(0,255,135,0.1)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text)' }}>
              💡 <strong>Key insight:</strong> Minutes played is the strongest predictor — availability
              matters more than raw talent. Recent form (3GW rolling avg) comes second.
              Fixture difficulty provides forward-looking context.
            </div>
          </div>
        </div>

        {/* Position stats */}
        <div className="card">
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 16 }}>
            Predicted Pts by Position
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {position_stats.map(pos => (
              <div key={pos.position}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className={`pos-badge pos-${pos.position}`}>{pos.position}</span>
                  <span className="muted mono" style={{ fontSize: '0.72rem' }}>{pos.player_count} players</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 2 }}>AVG</div>
                    <div className="mono" style={{ color: POS_COLORS[pos.position], fontSize: '1.1rem' }}>
                      {pos.avg_pts}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 2 }}>MAX</div>
                    <div className="mono" style={{ color: POS_COLORS[pos.position], fontSize: '1.1rem' }}>
                      {pos.max_pts}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ marginTop: 16, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={position_stats} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="position" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg_pts" radius={[4,4,0,0]}>
                  {position_stats.map(pos => (
                    <Cell key={pos.position} fill={POS_COLORS[pos.position]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model pipeline */}
      <div className="card fade-up fade-up-3" style={{ marginTop: 16 }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 14 }}>
          Pipeline
        </div>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {[
            { step: '01', title: 'Data Collection', desc: 'FPL API · 817 players · GW history' },
            { step: '02', title: 'Feature Engineering', desc: 'Rolling avgs · form blend · fixture diff' },
            { step: '03', title: 'Optuna Tuning', desc: '50 trials · minimise MAE' },
            { step: '04', title: 'LightGBM', desc: 'Gradient boosting · 10 features' },
            { step: '05', title: 'ILP Optimizer', desc: 'PuLP · budget · position · club limits' },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 140 }}>
              <div style={{ flex: 1, padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent)', marginBottom: 4 }}>
                  {s.step}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ padding: '0 6px', color: 'var(--muted)', flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
