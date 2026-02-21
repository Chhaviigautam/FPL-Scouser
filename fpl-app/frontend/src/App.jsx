import { useState } from "react";
import TopPicks from "./pages/TopPicks";
import OptimalSquad from "./pages/OptimalSquad";
import TransferPlanner from "./pages/TransferPlanner";
import ModelInsights from "./pages/ModelInsights";
import "./index.css";

const NAV = [
  { id: "picks",     label: "Top Picks",      icon: "⚡" },
  { id: "squad",     label: "Optimal Squad",  icon: "🏆" },
  { id: "transfers", label: "Transfers",      icon: "🔄" },
  { id: "model",     label: "Model Insights", icon: "📊" },
];

export default function App() {
  const [active, setActive] = useState("picks");

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚽</span>
            <div>
              <div className="logo-title">FPL AI Engine</div>
              <div className="logo-sub">LightGBM · ILP Optimizer</div>
            </div>
          </div>
          <nav className="nav">
            {NAV.map((n) => (
              <button
                key={n.id}
                className={`nav-btn ${active === n.id ? "active" : ""}`}
                onClick={() => setActive(n.id)}
              >
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {active === "picks"     && <TopPicks />}
        {active === "squad"     && <OptimalSquad />}
        {active === "transfers" && <TransferPlanner />}
        {active === "model"     && <ModelInsights />}
      </main>
    </div>
  );
}
