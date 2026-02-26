import { useState, useEffect } from "react";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const STATS = [
  { val: "1.4B", label: "People. One Football Nation." },
  { val: "28",   label: "States. One Dream."           },
  { val: "0",    label: "Excuses Left."                },
];

const PILLARS = [
  {
    icon: "grassroots",
    title: "Grassroots First",
    desc: "Indian football doesn't need a saviour at the top. It needs a thousand coaches at the bottom. We start from the ground.",
  },
  {
    icon: "data",
    title: "Data Meets Passion",
    desc: "We believe emotion builds the game, but data sustains it. Analytics for scouts, coaches, and fans who care enough to understand.",
  },
  {
    icon: "location",
    title: "Every City. Every Lane.",
    desc: "From Kolkata's maidan to Mumbai's slums to Shillong's hills — Indian football lives in places no broadcast camera has reached.",
  },
  {
    icon: "community",
    title: "Community Over Celebrity",
    desc: "We are not building a fanbase. We are building a movement. Owned by the people who show up — not just by those who watch.",
  },
];

const VOICES = [
  { initials: "AK", name: "Arjun K.",  city: "Bengaluru", quote: "For the first time someone is talking about Indian football like it actually matters. Because it does." },
  { initials: "RS", name: "Rahul S.",  city: "Kolkata",   quote: "We grew up playing in the mud. This platform finally sees us." },
  { initials: "PM", name: "Priya M.",  city: "Chennai",   quote: "Indian women's football deserves this kind of attention. Glad someone is building for all of us." },
  { initials: "DL", name: "Dinesh L.", city: "Shillong",  quote: "The northeast has always been football country. Now the rest of India is catching up to what we always knew." },
];

const CITIES = [
  "Mumbai","Delhi","Kolkata","Bengaluru","Chennai",
  "Hyderabad","Pune","Guwahati","Shillong","Kochi",
  "Jamshedpur","Bhubaneswar","Goa","Chandigarh","Lucknow",
];

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function Icon({ name, size = 22 }) {
  const c = "#05f0ff";
  const icons = {
    grassroots: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7z"/><path d="M12 12C12 12 16 9.5 18 6"/><path d="M12 12C12 12 7 10 5 7"/><path d="M5 22h14"/></svg>,
    data:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><path d="M2 20h20"/></svg>,
    location:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
    community:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/><path d="M3 21v-2a5 5 0 0 1 5-5h1"/><path d="M16 14h1a5 5 0 0 1 5 5v2"/><path d="M12 14a4 4 0 0 1 4 4v3H8v-3a4 4 0 0 1 4-4z"/></svg>,
    arrow:      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  };
  return icons[name] || null;
}

// ─── COUNTER ──────────────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const isNumber = !isNaN(parseFloat(target));
  useEffect(() => {
    if (!isNumber) return;
    const num = parseFloat(target);
    const suffix = target.replace(/[0-9.]/g, "");
    const steps = 60; const inc = num / steps; let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= num) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur) + suffix);
    }, duration / steps);
    return () => clearInterval(t);
  }, [target]);
  return <span>{isNumber ? count || "0" : target}</span>;
}

// ─── JOIN FORM ────────────────────────────────────────────────────────────────
function JoinForm() {
  const [step, setStep]   = useState(0);
  const [city, setCity]   = useState("");
  const [role, setRole]   = useState("");
  const [email, setEmail] = useState("");
  const roles = ["Player", "Coach", "Scout", "Fan", "Journalist", "Club Official"];

  if (step === 2) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>You're In.</div>
      <div style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "var(--mono)" }}>Welcome to the movement. We'll reach out soon.</div>
      {(city || role) && <div style={{ marginTop: 8, fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)" }}>{city && `📍 ${city}`}{role && ` · ${role}`}</div>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="input-group">
        <label className="input-label">Your Email</label>
        <input className="input" type="email" placeholder="name@example.com" value={email}
          onChange={e => setEmail(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div className="input-group">
        <label className="input-label">Your City</label>
        <input className="input" type="text" placeholder="e.g. Kolkata, Goa, Shillong..." value={city}
          onChange={e => setCity(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div className="input-group">
        <label className="input-label">I am a...</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {roles.map(r => (
            <button key={r} className={`filter-pill ${role === r ? "active" : ""}`}
              onClick={() => setRole(r === role ? "" : r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary"
        onClick={() => { if (!email || !city) return; setStep(1); setTimeout(() => setStep(2), 1600); }}
        disabled={step === 1 || !email || !city}
        style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {step === 1 ? <><div className="spinner" style={{ width: 13, height: 13 }} />Joining…</> : <>Join the Movement <Icon name="arrow" size={13} /></>}
      </button>
      <div style={{ textAlign: "center", fontSize: 10, color: "var(--text4)", fontFamily: "var(--mono)" }}>No spam. No noise. Just football.</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function IndianFootballCommunity() {
  return (
    <div>
      <style>{`
        @keyframes indiaMarquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes indiaDotPulse   { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.5)} }
        @keyframes indiaGlowPulse  { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #04090f 0%, #081828 100%)",
        border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        padding: "48px 40px", marginBottom: 20, textAlign: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(5,240,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(5,240,255,1) 1px,transparent 1px)", backgroundSize: "50px 50px", opacity: 0.015, pointerEvents: "none" }}/>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(5,240,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {CITIES.map((city, i) => (
            <div key={city} style={{ position: "absolute", left: `${8 + (i * 6.2) % 85}%`, top: `${10 + (i * 13.7) % 80}%`, animation: `indiaDotPulse ${2.5 + (i % 4) * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(5,240,255,0.35)", boxShadow: "0 0 6px rgba(5,240,255,0.25)" }}/>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 14px", borderRadius: 20, marginBottom: 20, background: "rgba(5,240,255,0.06)", border: "1px solid rgba(5,240,255,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 6px var(--cyan)", display: "inline-block", animation: "indiaGlowPulse 1.8s ease-in-out infinite" }}/>
            <span style={{ fontSize: 9, fontWeight: 900, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Indian Football · Ground Up Movement</span>
          </div>

          <h1 style={{ fontSize: "clamp(32px,5vw,58px)", fontWeight: 900, lineHeight: 0.95, marginBottom: 14, fontFamily: "var(--font)", letterSpacing: "-0.01em" }}>
            <span style={{ color: "#fff" }}>भारत का </span>
            <span style={{ color: "var(--cyan)" }}>खेल</span>
            <br/>
            <span style={{ fontSize: "50%", color: "rgba(255,255,255,0.28)", fontStyle: "italic" }}>India's Game.</span>
          </h1>

          <p style={{ fontSize: 13, color: "var(--text2)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.7, fontFamily: "var(--font)" }}>
            We are not waiting for Indian football to be discovered.<br/>
            <strong style={{ color: "#fff" }}>We are building it. From every lane, every maidan, every city.</strong>
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#india-join" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Join the Movement <Icon name="arrow" size={13} />
            </a>
            <a href="#india-vision" className="btn" style={{ textDecoration: "none", background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)" }}>
              Our Vision
            </a>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: "center" }}>
            <div className="stat-value cyan"><AnimatedCounter target={s.val} /></div>
            <div className="stat-label" style={{ marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── PILLARS ── */}
      <div id="india-vision" className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">What We Stand For</div>
        <div className="two-col">
          {PILLARS.map((p, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: "var(--radius)",
              background: "var(--bg3)", border: "1px solid var(--border)",
              transition: "border-color 0.14s, transform 0.14s", cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ marginBottom: 10 }}><Icon name={p.icon} size={22} /></div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--text2)", lineHeight: 1.7, fontFamily: "var(--font)" }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VOICES ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Voices From The Ground</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {VOICES.map((v, i) => (
            <div key={i} style={{ padding: "14px", borderRadius: "var(--radius)", background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 24, color: "rgba(5,240,255,0.12)", fontFamily: "Georgia, serif", lineHeight: 0.8 }}>"</div>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7, fontFamily: "var(--font)", flex: 1 }}>{v.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "rgba(5,240,255,0.08)", border: "1.5px solid rgba(5,240,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "var(--cyan)", fontFamily: "var(--mono)" }}>{v.initials}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--font)" }}>{v.name}</div>
                  <div style={{ fontSize: 9.5, color: "var(--text3)", fontFamily: "var(--mono)" }}>{v.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── JOIN ── */}
      <div id="india-join" className="card" style={{ marginBottom: 20, maxWidth: 560 }}>
        <div className="card-title">Be Part Of Something Real</div>
        <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 18, lineHeight: 1.7, fontFamily: "var(--font)" }}>
          Indian football doesn't need spectators.<br/>
          <strong style={{ color: "#fff" }}>It needs people who show up.</strong>
        </p>
        <JoinForm />
      </div>

      {/* ── CITY MARQUEE ── */}
      <div style={{ overflow: "hidden", marginBottom: 20, maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
        <div style={{ display: "flex", gap: 20, animation: "indiaMarquee 22s linear infinite", whiteSpace: "nowrap" }}>
          {[...CITIES, ...CITIES].map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text3)", fontFamily: "var(--mono)" }}>
              <span style={{ color: "rgba(5,240,255,0.3)", fontSize: 5 }}>●</span>{c}
            </span>
          ))}
        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div style={{ padding: "16px 20px", borderRadius: "var(--radius)", background: "var(--bg2)", border: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 900, color: "var(--text2)", fontFamily: "var(--font)", letterSpacing: "0.04em", fontStyle: "italic" }}>
          "No shortcuts. No hype. Just football — built from the ground up."
        </p>
        <p style={{ fontSize: 9, color: "var(--cyan)", fontFamily: "var(--mono)", marginTop: 6, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>
          India Football Community · Est. Now
        </p>
      </div>
    </div>
  );
}