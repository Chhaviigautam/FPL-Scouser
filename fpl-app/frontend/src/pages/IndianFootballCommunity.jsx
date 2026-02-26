import { useState, useEffect } from "react";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const STATS = [
  { val: "1.4B",  label: "People.One Football Nation." },
  { val: "28",    label: "States. One Dream."           },
  { val: "0",     label: "Excuses Left."                },
];

const PILLARS = [
  {
    icon: "⚽",
    title: "Grassroots First",
    desc: "Indian football doesn't need a saviour at the top. It needs a thousand coaches at the bottom. We start from the ground.",
  },
  {
    icon: "📊",
    title: "Data Meets Passion",
    desc: "We believe emotion builds the game, but data sustains it. Analytics for scouts, coaches, and fans who care enough to understand.",
  },
  {
    icon: "🌍",
    title: "Every City. Every Lane.",
    desc: "From Kolkata's maidan to Mumbai's slums to Shillong's hills — Indian football lives in places no broadcast camera has reached.",
  },
  {
    icon: "🔗",
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

// ─── FLOATING CITY DOTS (decorative) ─────────────────────────────────────────
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
        <div
          key={d.city}
          className="absolute"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            animation: `cityPulse ${2.5 + (i % 4) * 0.5}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`,
          }}
        >
          <div
            style={{
              width: d.size * 4,
              height: d.size * 4,
              borderRadius: "50%",
              background: "rgba(0,255,135,0.5)",
              boxShadow: "0 0 8px rgba(0,255,135,0.4)",
            }}
          />
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{
              fontSize: 7,
              color: "rgba(0,255,135,0.4)",
              fontFamily: "'Barlow Condensed', monospace",
              letterSpacing: "0.08em",
            }}
          >
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
      if (current >= num) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current) + suffix);
      }
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
      style={{
        background: "#1A1A1A",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `1px solid ${v.color}33`;
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Quote mark */}
      <div style={{
        fontSize: 40, lineHeight: 0.8,
        color: `${v.color}20`,
        fontFamily: "Georgia, serif",
        userSelect: "none",
      }}>
        "
      </div>
      <p className="text-sm leading-relaxed flex-1"
        style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>
        {v.quote}
      </p>
      <div className="flex items-center gap-3 pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: `${v.color}18`, border: `1.5px solid ${v.color}44`, color: v.color }}
        >
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

// ─── JOIN FORM (UI ONLY) ──────────────────────────────────────────────────────
function JoinForm() {
  const [step, setStep]       = useState(0); // 0=idle, 1=submitting, 2=done
  const [city, setCity]       = useState("");
  const [role, setRole]       = useState("");
  const [email, setEmail]     = useState("");

  const roles = ["Player", "Coach", "Scout", "Fan", "Journalist", "Club Official"];

  function handleSubmit() {
    if (!email || !city) return;
    setStep(1);
    setTimeout(() => setStep(2), 1800);
  }

  if (step === 2) {
    return (
      <div className="text-center py-10 px-6">
        <div className="text-5xl mb-4">⚽</div>
        <div className="text-2xl font-black text-white mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          You're In.
        </div>
        <div className="text-sm" style={{ color: "rgba(0,255,135,0.8)" }}>
          Welcome to the movement. We'll reach out soon.
        </div>
        <div className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
          {city && `📍 ${city}`} {role && `· ${role}`}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Email */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block"
          style={{ color: "rgba(0,255,135,0.6)" }}>
          Your Email
        </label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-150"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
          onFocus={e => e.target.style.border = "1px solid rgba(0,255,135,0.35)"}
          onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
        />
      </div>

      {/* City */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block"
          style={{ color: "rgba(0,255,135,0.6)" }}>
          Your City
        </label>
        <input
          type="text"
          placeholder="e.g. Kolkata, Goa, Shillong..."
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-150"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
          onFocus={e => e.target.style.border = "1px solid rgba(0,255,135,0.35)"}
          onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
        />
      </div>

      {/* Role pills */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block"
          style={{ color: "rgba(0,255,135,0.6)" }}>
          I am a...
        </label>
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

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={step === 1}
        className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 mt-1"
        style={{
          background: step === 1
            ? "rgba(0,255,135,0.3)"
            : "linear-gradient(135deg, #00FF87, #00cc6a)",
          color: "#0a0a0a",
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.12em",
          boxShadow: step === 1 ? "none" : "0 0 24px rgba(0,255,135,0.3)",
          cursor: step === 1 ? "not-allowed" : "pointer",
        }}
      >
        {step === 1 ? "Joining..." : "Join the Movement →"}
      </button>

      <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
        No spam. No noise. Just football.
      </p>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function IndianFootballCommunity() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0F0F0F", fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&display=swap');
        * { box-sizing: border-box; }

        @keyframes cityPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }

        .hero-word { display: inline-block; animation: heroFadeUp 0.7s ease both; }
        .hero-word:nth-child(1) { animation-delay: 0.1s; }
        .hero-word:nth-child(2) { animation-delay: 0.22s; }
        .hero-word:nth-child(3) { animation-delay: 0.34s; }
        .hero-word:nth-child(4) { animation-delay: 0.46s; }
        .hero-word:nth-child(5) { animation-delay: 0.58s; }
      `}</style>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">

        {/* City dots background map */}
        <CityDots />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,135,0.05) 0%, transparent 70%)",
        }}/>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(0,255,135,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.018,
        }}/>

        {/* Thin scanline effect */}
        <div className="absolute inset-x-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,255,135,0.15), transparent)",
            animation: "scanline 8s linear infinite",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">

          {/* Top label */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{
              background: "rgba(0,255,135,0.06)",
              border: "1px solid rgba(0,255,135,0.18)",
              animation: "heroFadeUp 0.5s ease both",
            }}>
            <span className="w-2 h-2 rounded-full inline-block"
              style={{ background: "#00FF87", animation: "glowPulse 1.8s ease-in-out infinite", boxShadow: "0 0 6px #00FF87" }}/>
            <span className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: "#00FF87" }}>
              Indian Football · Ground Up Movement
            </span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="font-black leading-[0.92] mb-6 tracking-tight"
            style={{ fontSize: "clamp(52px, 9vw, 96px)" }}>
            <div className="overflow-hidden mb-1">
              <span className="hero-word text-white">भारत</span>
              {" "}
              <span className="hero-word text-white">का</span>
              {" "}
              <span className="hero-word" style={{ color: "#00FF87" }}>खेल</span>
            </div>
            <div className="overflow-hidden" style={{ fontSize: "clamp(28px, 5vw, 54px)", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
              <span className="hero-word">India's</span>
              {" "}
              <span className="hero-word">Game.</span>
            </div>
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl mb-3 font-bold"
            style={{
              color: "rgba(255,255,255,0.55)",
              maxWidth: 560,
              margin: "0 auto 12px",
              animation: "heroFadeUp 0.7s 0.5s ease both",
              opacity: 0,
              lineHeight: 1.5,
            }}
          >
            We are not waiting for Indian football to be discovered.<br/>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 900 }}>
              We are building it. From every lane, every maidan, every city.
            </span>
          </p>

          <p className="text-sm mb-12"
            style={{
              color: "rgba(255,255,255,0.28)",
              maxWidth: 440,
              margin: "12px auto 48px",
              animation: "heroFadeUp 0.7s 0.65s ease both",
              opacity: 0,
              lineHeight: 1.7,
              fontStyle: "italic",
            }}>
            Join a community of players, coaches, scouts, and fans<br/>
            who believe the next chapter of Indian football starts now.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap"
            style={{ animation: "heroFadeUp 0.7s 0.75s ease both", opacity: 0 }}>
            <a href="#join"
              className="px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #00FF87, #00cc6a)",
                color: "#0a0a0a",
                boxShadow: "0 0 30px rgba(0,255,135,0.35)",
                textDecoration: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 50px rgba(0,255,135,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,135,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Join the Movement
            </a>
            <a href="#vision"
              className="px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200"
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
                textDecoration: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,135,0.3)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              Our Vision →
            </a>
          </div>

          {/* Scroll hint */}
          <div className="mt-20 flex flex-col items-center gap-2"
            style={{ animation: "heroFadeUp 0.7s 1s ease both", opacity: 0 }}>
            <div className="w-px h-10" style={{
              background: "linear-gradient(180deg, rgba(0,255,135,0.6), transparent)",
              animation: "glowPulse 2s ease-in-out infinite",
            }}/>
            <span className="text-[9px] font-black uppercase tracking-[0.25em]"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              Scroll
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#141414" }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-black mb-1"
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  color: "#00FF87",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "-0.01em",
                  textShadow: "0 0 30px rgba(0,255,135,0.3)",
                }}>
                <AnimatedCounter target={s.val} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VISION — 4 PILLARS
      ══════════════════════════════════════════════ */}
      <section id="vision" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.15)" }}>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]"
              style={{ color: "#00FF87" }}>
              ✦ What We Stand For
            </span>
          </div>
          <h2 className="font-black text-white mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.01em" }}>
            Built Different.<br/>
            <span style={{ color: "#00FF87" }}>Built For India.</span>
          </h2>
          <p className="text-sm max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
            This isn't a fan club. It's a structural belief that Indian football
            grows from the bottom — and we are the bottom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 transition-all duration-200 cursor-default relative overflow-hidden"
              style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={e => {
                e.currentTarget.style.border = "1px solid rgba(0,255,135,0.2)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,255,135,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Number watermark */}
              <div className="absolute -right-3 -bottom-4 font-black select-none pointer-events-none"
                style={{ fontSize: 80, color: "rgba(0,255,135,0.04)", lineHeight: 1 }}>
                {i + 1}
              </div>

              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="text-lg font-black text-white mb-2 tracking-tight">{p.title}</h3>
              <p className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VOICES FROM THE GROUND
      ══════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#111" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.15)" }}>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                style={{ color: "#00FF87" }}>
                ✦ Voices From The Ground
              </span>
            </div>
            <h2 className="font-black text-white"
              style={{ fontSize: "clamp(24px, 3.5vw, 38px)", letterSpacing: "-0.01em" }}>
              Real People. Real Football.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VOICES.map((v, i) => <VoiceCard key={i} v={v} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          JOIN SECTION
      ══════════════════════════════════════════════ */}
      <section id="join" className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Big background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,135,0.07) 0%, transparent 65%)",
        }}/>

        <div className="relative max-w-2xl mx-auto px-6 py-28 text-center">
          {/* Statement */}
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.25em]"
            style={{ color: "rgba(0,255,135,0.6)" }}>
            ✦ The Time Is Now
          </div>
          <h2 className="font-black text-white mb-3 leading-tight"
            style={{ fontSize: "clamp(32px, 5vw, 58px)", letterSpacing: "-0.02em" }}>
            Be Part Of<br/>
            <span style={{ color: "#00FF87" }}>Something Real.</span>
          </h2>
          <p className="text-sm mb-12 max-w-sm mx-auto"
            style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
            Indian football doesn't need spectators.<br/>
            It needs people who show up.
          </p>

          {/* Form card */}
          <div
            className="rounded-2xl p-8 text-left"
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(0,255,135,0.12)",
              boxShadow: "0 0 60px rgba(0,255,135,0.05)",
            }}
          >
            <JoinForm />
          </div>

          {/* Cities marquee */}
          <div className="mt-10 overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest"
              style={{
                color: "rgba(255,255,255,0.15)",
                animation: "marquee 20s linear infinite",
                whiteSpace: "nowrap",
              }}>
              {[...CITIES, ...CITIES].map((c, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span style={{ color: "rgba(0,255,135,0.3)" }}>●</span> {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MANIFESTO FOOTER STRIP
      ══════════════════════════════════════════════ */}
      <div style={{
        borderTop: "1px solid rgba(0,255,135,0.1)",
        background: "#0a0a0a",
        padding: "24px 24px",
        textAlign: "center",
      }}>
        <p className="font-black text-white"
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            letterSpacing: "0.04em",
            opacity: 0.6,
          }}>
          "No shortcuts. No hype. Just football — built from the ground up."
        </p>
        <p className="text-xs mt-2 font-bold uppercase tracking-widest"
          style={{ color: "rgba(0,255,135,0.4)" }}>
          India Football Community · Est. Now
        </p>
      </div>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}