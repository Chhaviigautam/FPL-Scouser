const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "/api";

async function req(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(
      "Cannot reach the backend. " +
      "Start it with: cd fpl-app/backend && uvicorn main:app --reload --port 8000"
    );
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || body.message || JSON.stringify(body);
    } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  getPlayers: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return req(`/players${qs ? "?" + qs : ""}`);
  },
  getModelInsights:  ()       => req("/model/insights"),
  optimizeSquad:     (budget) => req("/squad/optimize",    { method: "POST", body: JSON.stringify({ budget }) }),
  fetchSquad:        (teamId) => req(`/transfers/squad/${teamId}`),
  optimizeTransfers: (body)   => req("/transfers/optimize", { method: "POST", body: JSON.stringify(body) }),
  getFplNews:        ()       => req("/fpl/news"),
  getFplFixtures:    (event)  => req(`/fpl/fixtures${event ? "?event=" + event : ""}`),
  getPlTable:        ()       => req("/pl/table"),
};