import { useState, useEffect } from "react";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const STATS = [
  { val: "1.4B",  label: "People. One Football Nation." },
  { val: "28",    label: "States. One Dream."           },
  { val: "0",     label: "Excuses Left."                },
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
  {
    initials: "AK",
    color: "#00FF87",
    name: "Arjun K.",
    city: "Bengaluru",
    quote: "For the first time someone is talking about Indian football like it actually matters. Because it does.",
  },
  {
    initials: "RS",
    color: "#05f0ff",
    name: "Rahul S.",
    city: "Kolkata",
    quote: "We grew up playing in the mud. This platform finally sees us.",
  },
  {
    initials: "PM",
    color: "#ebff00",
    name: "Priya M.",
    city: "Chennai",
    quote: "Indian women's football deserves this kind of attention. Glad someone is building for all of us.",
  },
  {
    initials: "DL",
    color: "#ff6b35",
    name: "Dinesh L.",
    city: "Shillong",
    quote: "The northeast has always been football country. Now the rest of India is catching up to what we always knew.",
  },
];

const CITIES = [
  "Mumbai", "Delhi", "Kolkata", "Bengaluru", "Chennai",
  "Hyderabad", "Pune", "Guwahati", "Shillong", "Kochi",
  "Jamshedpur", "Bhubaneswar", "Goa", "Chandigarh", "Lucknow",
];

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function Icon({ name, size = 28, color = "#00FF87" }) {
  const icons = {
    grassroots: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12"/>
        <path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7z"/>
        <path d="M12 12C12 12 16 9.5 18 6"/>
        <path d="M12 12C12 12 7 10 5 7"/>
        <path d="M5 22h14"/>
      </svg>
    ),
    data: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <path d="M2 20h20"/>
      </svg>
    ),
    location: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
    community: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9"  cy="7"  r="3"/>
        <circle cx="15" cy="7"  r="3"/>
        <path d="M3 21v-2a5 5 0 0 1 5-5h1"/>
        <path d="M16 14h1a5 5 0 0 1 5 5v2"/>
        <path d="M12 14a4 4 0 0 1 4 4v3H8v-3a4 4 0 0 1 4-4z"/>
      </svg>
    ),
    football: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a10 10 0 0 1 6.32 2.27L12 8 5.68 4.27A10 10 0 0 1 12 2z" fill={`${color}20`}/>
        <path d="M12 8l4 3-1.5 5h-5L8 11z" fill={`${color}15`}/>
        <path d="M12 8l4 3m-4-3L8 11m4-3V2m4 9l2.32 7.73M8 11l-2.32 7.73"/>
      </svg>
    ),
    scroll: (
      <svg width={14} height={24} viewBox="0 0 14 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <rect x="1" y="1" width="12" height="22" rx="6"/>
        <line x1="7" y1="5" x2="7" y2="9"/>
      </svg>
    ),
    quote: (
      <svg width={32} height={24} viewBox="0 0 32 24" fill={`${color}15`}>
        <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 3.2C10.4 4.8 7.2 7.2 6.4 11.2H12V24H0zm20 0V14.4C20 6.4 24.8 1.6 34.4 0L36 3.2C30.4 4.8 27.2 7.2 26.4 11.2H32V24H20z"/>
      </svg>
    ),
    arrow: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

// ─── FLOATING CITY DOTS ───────────────────────────────────────────────────────
function CityDots() {
  const dots = CITIES.map((city, i) => ({
    city,
    x: 8 + (i * 6.2) % 85,
    y: 10 + (i * 13.7) % 80,
    size: 1.5 + (i % 3) * 0.8,
    delay: i * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <div key={d.city} className="absolute"
          style={{ left: `${d.x}%`, top: `${d.y}%`, animation: `cityPulse ${2.5 + (i % 4) * 0.5}s ease-in-out infinite`, animationDelay: `${d.delay}s` }}>
          <div style={{ width: d.size * 4, height: d.size * 4, borderRadius: "50%", background: "rgba(0,255,135,0.5)", boxShadow: "0 0 8px rgba(0,255,135,0.4)" }} />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{ fontSize: 7, color: "rgba(0,255,135,0.4)", fontFamily: "'Barlow Condensed', monospace", letterSpacing: "0.08em" }}>
            {d.city}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── COUNTER ANIMATION ────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const isNumber = !isNaN(parseFloat(target));

  useEffect(() => {
    if (!isNumber) return;
    const num = parseFloat(target);
    const suffix = target.replace(/[0-9.]/g, "");
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current) + suffix); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{isNumber ? count || "0" : target}</span>;
}

// ─── VOICE CARD ───────────────────────────────────────────────────────────────
function VoiceCard({ v }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)" }}
      onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${v.color}33`; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ opacity: 0.6 }}><Icon name="quote" size={32} color={v.color} /></div>
      <p className="text-sm leading-relaxed flex-1"
        style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>
        {v.quote}
      </p>
      <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: `${v.color}18`, border: `1.5px solid ${v.color}44`, color: v.color }}>
          {v.initials}
        </div>
        <div>
          <div className="text-xs font-bold text-white">{v.name}</div>
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{v.city}</div>
        </div>
      </div>
    </div>
  );
}

// ─── JOIN FORM ────────────────────────────────────────────────────────────────
function JoinForm() {
  const [step, setStep]   = useState(0);
  const [city, setCity]   = useState("");
  const [role, setRole]   = useState("");
  const [email, setEmail] = useState("");

  const roles = ["Player", "Coach", "Scout", "Fan", "Journalist", "Club Official"];

  function handleSubmit() {
    if (!email || !city) return;
    setStep(1);
    setTimeout(() => setStep(2), 1800);
  }

  if (step === 2) {
    return (
      <div className="text-center py-10 px-6">
        <div className="flex justify-center mb-4"><Icon name="football" size={48} color="#00FF87" /></div>
        <div className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>You're In.</div>
        <div className="text-sm" style={{ color: "rgba(0,255,135,0.8)" }}>Welcome to the movement. We'll reach out soon.</div>
        <div className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
          {city && `📍 ${city}`} {role && `· ${role}`}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(0,255,135,0.6)" }}>Your Email</label>
        <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-150"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Barlow Condensed', sans-serif" }}
          onFocus={e => e.target.style.border = "1px solid rgba(0,255,135,0.35)"}
          onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.1)"} />
      </div>
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(0,255,135,0.6)" }}>Your City</label>
        <input type="text" placeholder="e.g. Kolkata, Goa, Shillong..." value={city} onChange={e => setCity(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-150"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Barlow Condensed', sans-serif" }}
          onFocus={e => e.target.style.border = "1px solid rgba(0,255,135,0.35)"}
          onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.1)"} />
      </div>
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: "rgba(0,255,135,0.6)" }}>I am a...</label>
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button key={r} onClick={() => setRole(r === role ? "" : r)}
              className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-150"
              style={{
                background: role === r ? "rgba(0,255,135,0.12)" : "rgba(255,255,255,0.04)",
                border: role === r ? "1px solid rgba(0,255,135,0.3)" : "1px solid rgba(255,255,255,0.07)",
                color: role === r ? "#00FF87" : "rgba(255,255,255,0.4)",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit} disabled={step === 1}
        className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 mt-1 flex items-center justify-center gap-2"
        style={{
          background: step === 1 ? "rgba(0,255,135,0.3)" : "linear-gradient(135deg, #00FF87, #00cc6a)",
          color: "#0a0a0a",
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.12em",
          boxShadow: step === 1 ? "none" : "0 0 24px rgba(0,255,135,0.3)",
          cursor: step === 1 ? "not-allowed" : "pointer",
        }}>
        {step === 1 ? "Joining..." : <><span>Join the Movement</span><Icon name="arrow" size={16} color="#0a0a0a" /></>}
      </button>
      <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>No spam. No noise. Just football.</p>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function IndianFootballCommunity() {
  return (
    <div className="min-h-screen" style={{ background: "#0F0F0F", fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&display=swap');
        * { box-sizing: border-box; }
        @keyframes cityPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes heroFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse  { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes scanline   { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
        @keyframes marquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .hero-word { display:inline-block; animation:heroFadeUp 0.7s ease both; }
        .hero-word:nth-child(1){animation-delay:0.1s}
        .hero-word:nth-child(2){animation-delay:0.22s}
        .hero-word:nth-child(3){animation-delay:0.34s}
        .hero-word:nth-child(4){animation-delay:0.46s}
        .hero-word:nth-child(5){animation-delay:0.58s}
      `}</style>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">
        <CityDots />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,135,0.05) 0%, transparent 70%)" }}/>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,255,135,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,1) 1px, transparent 1px)", backgroundSize: "60px 60px", opacity: 0.018 }}/>
        <div className="absolute inset-x-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.15), transparent)", animation: "scanline 8s linear infinite" }}/>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.18)", animation: "heroFadeUp 0.5s ease both" }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#00FF87", animation: "glowPulse 1.8s ease-in-out infinite", boxShadow: "0 0 6px #00FF87" }}/>
            <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#00FF87" }}>
              Indian Football · Ground Up Movement
            </span>
          </div>

          <h1 className="font-black leading-[0.92] mb-6 tracking-tight" style={{ fontSize: "clamp(52px, 9vw, 96px)" }}>
            <div className="overflow-hidden mb-1">
              <span className="hero-word text-white">भारत</span>{" "}
              <span className="hero-word text-white">का</span>{" "}
              <span className="hero-word" style={{ color: "#00FF87" }}>खेल</span>
            </div>
            <div className="overflow-hidden" style={{ fontSize: "clamp(28px, 5vw, 54px)", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
              <span className="hero-word">India's</span>{" "}<span className="hero-word">Game.</span>
            </div>
          </h1>

          <p className="text-xl mb-3 font-bold"
            style={{ color: "rgba(255,255,255,0.55)", maxWidth: 560, margin: "0 auto 12px", animation: "heroFadeUp 0.7s 0.5s ease both", opacity: 0, lineHeight: 1.5 }}>
            We are not waiting for Indian football to be discovered.<br/>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 900 }}>We are building it. From every lane, every maidan, every city.</span>
          </p>

          <p className="text-sm mb-12"
            style={{ color: "rgba(255,255,255,0.28)", maxWidth: 440, margin: "12px auto 48px", animation: "heroFadeUp 0.7s 0.65s ease both", opacity: 0, lineHeight: 1.7, fontStyle: "italic" }}>
            Join a community of players, coaches, scouts, and fans<br/>who believe the next chapter of Indian football starts now.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap" style={{ animation: "heroFadeUp 0.7s 0.75s ease both", opacity: 0 }}>
            <a href="#join"
              className="px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #00FF87, #00cc6a)", color: "#0a0a0a", boxShadow: "0 0 30px rgba(0,255,135,0.35)", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(0,255,135,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,135,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Join the Movement
            </a>
            <a href="#vision"
              className="px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 flex items-center gap-2"
              style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,135,0.3)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
              Our Vision <Icon name="arrow" size={14} color="currentColor" />
            </a>
          </div>

          <div className="mt-20 flex flex-col items-center gap-3" style={{ animation: "heroFadeUp 0.7s 1s ease both", opacity: 0 }}>
            <Icon name="scroll" size={24} color="rgba(0,255,135,0.4)" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.2)" }}>Scroll</span>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#141414" }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-black mb-1"
                style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "#00FF87", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-0.01em", textShadow: "0 0 30px rgba(0,255,135,0.3)" }}>
                <AnimatedCounter target={s.val} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VISION — 4 PILLARS */}
      <section id="vision" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.15)" }}>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#00FF87" }}>✦ What We Stand For</span>
          </div>
          <h2 className="font-black text-white mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.01em" }}>
            Built Different.<br/><span style={{ color: "#00FF87" }}>Built For India.</span>
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
            This isn't a fan club. It's a structural belief that Indian football grows from the bottom — and we are the bottom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PILLARS.map((p, i) => (
            <div key={i}
              className="rounded-2xl p-6 transition-all duration-200 cursor-default relative overflow-hidden"
              style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(0,255,135,0.2)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,255,135,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div className="absolute -right-3 -bottom-4 font-black select-none pointer-events-none"
                style={{ fontSize: 80, color: "rgba(0,255,135,0.04)", lineHeight: 1 }}>{i + 1}</div>
              <div className="mb-4"><Icon name={p.icon} size={28} color="#00FF87" /></div>
              <h3 className="text-lg font-black text-white mb-2 tracking-tight">{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VOICES */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#111" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.15)" }}>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#00FF87" }}>✦ Voices From The Ground</span>
            </div>
            <h2 className="font-black text-white" style={{ fontSize: "clamp(24px, 3.5vw, 38px)", letterSpacing: "-0.01em" }}>
              Real People. Real Football.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VOICES.map((v, i) => <VoiceCard key={i} v={v} />)}
          </div>
        </div>
      </section>

      {/* JOIN */}
      <section id="join" className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,135,0.07) 0%, transparent 65%)" }}/>
        <div className="relative max-w-2xl mx-auto px-6 py-28 text-center">
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(0,255,135,0.6)" }}>✦ The Time Is Now</div>
          <h2 className="font-black text-white mb-3 leading-tight" style={{ fontSize: "clamp(32px, 5vw, 58px)", letterSpacing: "-0.02em" }}>
            Be Part Of<br/><span style={{ color: "#00FF87" }}>Something Real.</span>
          </h2>
          <p className="text-sm mb-12 max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
            Indian football doesn't need spectators.<br/>It needs people who show up.
          </p>
          <div className="rounded-2xl p-8 text-left" style={{ background: "#1A1A1A", border: "1px solid rgba(0,255,135,0.12)", boxShadow: "0 0 60px rgba(0,255,135,0.05)" }}>
            <JoinForm />
          </div>
          <div className="mt-10 overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.15)", animation: "marquee 20s linear infinite", whiteSpace: "nowrap" }}>
              {[...CITIES, ...CITIES].map((c, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span style={{ color: "rgba(0,255,135,0.3)", fontSize: 6 }}>●</span> {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(0,255,135,0.1)", background: "#0a0a0a", padding: "24px", textAlign: "center" }}>
        <div className="flex justify-center mb-3"><Icon name="football" size={20} color="rgba(0,255,135,0.3)" /></div>
        <p className="font-black text-white" style={{ fontSize: "clamp(14px, 2vw, 18px)", letterSpacing: "0.04em", opacity: 0.6 }}>
          "No shortcuts. No hype. Just football — built from the ground up."
        </p>
        <p className="text-xs mt-2 font-bold uppercase tracking-widest" style={{ color: "rgba(0,255,135,0.4)" }}>
          India Football Community · Est. Now
        </p>
      </div>
    </div>
  );
}