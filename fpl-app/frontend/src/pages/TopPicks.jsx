import { useState, useEffect } from "react";
import { api } from "../api/client";

const POSITIONS = ["ALL", "GK", "DEF", "MID", "FWD"];

export default function TopPicks() {
  const [players,   setPlayers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [pos,       setPos]       = useState("ALL");
  const [maxPrice,  setMaxPrice]  = useState(15);
  const [onlyAvail, setOnlyAvail] = useState(true);

  const maxPts = players.length ? Math.max(...players.map((p) => p.predicted_pts)) : 10;

  async function load() {
    setLoading(true); setError(null);
    try {
      const params = { max_price: maxPrice, only_available: onlyAvail, limit: 50 };
      if (pos !== "ALL") params.position = pos;
      setPlayers(await api.getPlayers(params));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [pos, maxPrice, onlyAvail]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⚡ Top Picks</div>
        <div className="page-subtitle">LightGBM predicted points for the upcoming gameweek · MAE 1.021</div>
      </div>

      {/* Filters */}
      <div className="filters">
        {POSITIONS.map((p) => (
          <button key={p} className={`filter-btn ${pos === p ? "active" : ""}`} onClick={() => setPos(p)}>
            {p}
          </button>
        ))}
        <div className="filter-range">
          <span>Max £{maxPrice}m</span>
          <input type="range" min={4} max={15} step={0.5} value={maxPrice}
            onChange={(e) => setMaxPrice(parseFloat(e.target.value))} />
        </div>
        <button className={`filter-btn ${onlyAvail ? "active" : ""}`} onClick={() => setOnlyAvail(!onlyAvail)}>
          {onlyAvail ? "✓ Available only" : "All players"}
        </button>
      </div>

      {error   && <div className="error-box">{error}</div>}
      {loading && <div className="loading"><div className="spinner" /><span>Loading predictions…</span></div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Team</th>
                <th>Pos</th>
                <th>Price</th>
                <th>Predicted Pts</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.player_id}>
                  <td style={{ color: "var(--muted)", width: 32 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.web_name}</td>
                  <td style={{ color: "var(--muted)" }}>{p.team_name}</td>
                  <td><span className={`pos pos-${p.position}`}>{p.position}</span></td>
                  <td style={{ color: "var(--yellow)" }}>£{p.price.toFixed(1)}m</td>
                  <td>
                    <div className="pts-cell">
                      <div className="pts-bar-bg">
                        <div className="pts-bar" style={{ width: `${(p.predicted_pts / maxPts) * 100}%` }} />
                      </div>
                      <span className="pts-num">{p.predicted_pts}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
