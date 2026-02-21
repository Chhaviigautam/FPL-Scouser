const BASE = "http://localhost:8000/api";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
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
  getModelInsights: () => req("/model/insights"),
  optimizeSquad:    (budget) => req("/squad/optimize", { method: "POST", body: JSON.stringify({ budget }) }),
  fetchSquad:       (teamId) => req(`/transfers/squad/${teamId}`),
  optimizeTransfers:(body)   => req("/transfers/optimize", { method: "POST", body: JSON.stringify(body) }),
};
