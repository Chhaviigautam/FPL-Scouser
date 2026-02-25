/**
 * useGameweek — fetches the real current GW from the FPL API via our backend.
 * Returns { gw: number, loading: boolean }
 * Falls back to the last value or 1 if the backend is unreachable.
 */
import { useState, useEffect } from "react";

let _cachedGW = null;  // module-level cache so we only fetch once per session

export function useGameweek() {
  const [gw,      setGw]      = useState(_cachedGW || null);
  const [loading, setLoading] = useState(!_cachedGW);

  useEffect(() => {
    if (_cachedGW) { setGw(_cachedGW); setLoading(false); return; }

    let cancelled = false;
    async function fetchGW() {
      try {
        // Use our backend health endpoint which already resolves the current GW
        // via the FPL API's bootstrap-static events list.
        const res  = await fetch("http://localhost:8000/api/current-gw", { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (!cancelled && data.gameweek) {
          _cachedGW = data.gameweek;
          setGw(data.gameweek);
        }
      } catch (_) {
        // Backend unreachable — leave null so callers show "—"
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchGW();
    return () => { cancelled = true; };
  }, []);

  return { gw, loading };
}