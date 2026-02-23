import { useState } from "react";
import TopPicks from "./pages/TopPicks";
import OptimalSquad from "./pages/OptimalSquad";
import TransferPlanner from "./pages/TransferPlanner";
import ModelInsights from "./pages/ModelInsights";
import "./index.css";

const TrendIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const SquadIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SwapIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const BrainIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2Z"/></svg>;

const NAV = [
  { id: "picks",     label: "Top Picks",   Icon: TrendIcon },
  { id: "squad",     label: "Opt. Squad",  Icon: SquadIcon },
  { id: "transfers", label: "Transfers",   Icon: SwapIcon  },
  { id: "model",     label: "Model",       Icon: BrainIcon },
];

export default function App() {
  const [active, setActive] = useState("picks");
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#04100c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div className="logo-wordmark">
              <div className="logo-title">FPL Engine</div>
              <div className="logo-sub">LightGBM · ILP · 2025/26</div>
            </div>
          </div>
          <nav className="nav">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} className={`nav-btn ${active === id ? "active" : ""}`} onClick={() => setActive(id)}>
                <Icon /><span className="nav-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="main fade-in">
        {active === "picks"     && <TopPicks />}
        {active === "squad"     && <OptimalSquad />}
        {active === "transfers" && <TransferPlanner />}
        {active === "model"     && <ModelInsights />}
      </main>
    </div>
  );
}
