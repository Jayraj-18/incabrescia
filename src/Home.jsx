import { useEffect, useRef, useCallback } from "react";

// ─── REQUIREMENTS ────────────────────────────────────────────────────────────
// npm install gsap
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0d0d0d;
    --muted: #6b7280;
    --accent: #0057FF;
    --surface: #f4f3ef;
    --white: #ffffff;
    --border: rgba(0,0,0,0.08);
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--white); color: var(--ink); overflow-x: hidden; }

  /* ── BACKGROUND CANVAS ── */
  .gg-bg-canvas {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    background: #fafafa;
  }

  /* Dot-grid pattern */
  .gg-bg-canvas::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(0,87,255,0.18) 1px, transparent 1px);
    background-size: 36px 36px;
    animation: gg-grid-drift 20s linear infinite;
    opacity: 0.6;
  }

  @keyframes gg-grid-drift {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(36px, 36px); }
  }

  /* Floating orbs */
  .gg-orb {
    position: absolute; border-radius: 50%; filter: blur(80px);
    animation: gg-orb-float linear infinite;
    will-change: transform, opacity;
  }
  .gg-orb-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle at 40% 40%, rgba(0,87,255,0.22), rgba(0,87,255,0.04));
    top: -120px; left: -100px;
    animation-duration: 18s; animation-delay: 0s;
  }
  .gg-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle at 60% 60%, rgba(0,201,167,0.18), rgba(0,201,167,0.03));
    top: 30vh; right: -80px;
    animation-duration: 22s; animation-delay: -6s;
  }
  .gg-orb-3 {
    width: 350px; height: 350px;
    background: radial-gradient(circle at 50% 50%, rgba(99,62,255,0.14), rgba(99,62,255,0.02));
    bottom: 20vh; left: 20%;
    animation-duration: 26s; animation-delay: -12s;
  }
  .gg-orb-4 {
    width: 280px; height: 280px;
    background: radial-gradient(circle at 40% 40%, rgba(0,87,255,0.12), transparent);
    top: 60vh; left: 60%;
    animation-duration: 20s; animation-delay: -4s;
  }

  @keyframes gg-orb-float {
    0%   { transform: translate(0px, 0px) scale(1); }
    25%  { transform: translate(30px, -40px) scale(1.06); }
    50%  { transform: translate(-20px, 30px) scale(0.95); }
    75%  { transform: translate(40px, 20px) scale(1.03); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  /* Floating particles */
  .gg-particle {
    position: absolute; border-radius: 50%;
    background: rgba(0,87,255,0.35);
    animation: gg-particle-rise linear infinite;
    will-change: transform, opacity;
  }
  @keyframes gg-particle-rise {
    0%   { transform: translateY(0) scale(1); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
  }

  /* Mouse glow */
  .gg-mouse-glow {
    position: fixed; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,87,255,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 1; transform: translate(-50%, -50%);
    transition: left 0.12s ease-out, top 0.12s ease-out;
    will-change: left, top;
  }

  /* Animated lines / beams */
  .gg-beam {
    position: absolute; width: 1px; background: linear-gradient(to bottom, transparent, rgba(0,87,255,0.25), transparent);
    animation: gg-beam-travel linear infinite;
    will-change: transform, opacity;
  }
  @keyframes gg-beam-travel {
    0%   { transform: translateY(-100%); opacity: 0; }
    20%  { opacity: 1; }
    80%  { opacity: 0.6; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  /* ── ALL OTHER STYLES ── */
  .gg-wrap { position: relative; z-index: 2; }

  .gg-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 4rem; position: fixed; top: 0; width: 100%; z-index: 100;
    background: rgba(255,255,255,0.80); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .gg-logo { font-family: var(--font-head); font-weight: 800; font-size: 1.25rem; letter-spacing: -0.5px; color: var(--ink); }
  .gg-logo span { color: var(--accent); }
  .gg-nav-links { display: flex; gap: 2.5rem; list-style: none; }
  .gg-nav-links a { font-size: 0.875rem; font-weight: 500; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .gg-nav-links a:hover { color: var(--ink); }
  .gg-nav-cta { background: var(--ink); color: var(--white); padding: 0.6rem 1.4rem; border-radius: 100px; font-size: 0.875rem; font-weight: 500; text-decoration: none; transition: background 0.2s; }
  .gg-nav-cta:hover { background: var(--accent); }

  .gg-hero {
    min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
    padding: 8rem 4rem 7rem; position: relative;
  }
  .gg-hero-eyebrow {
    font-size: 0.8rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 1.5rem;
    display: flex; align-items: center; gap: 0.75rem;
  }
  .gg-hero-eyebrow::before { content: ''; display: block; width: 2rem; height: 1px; background: var(--accent); }
  .gg-hero-title {
    font-family: var(--font-head); font-size: clamp(3.2rem, 7vw, 6.5rem); font-weight: 800;
    line-height: 1.0; letter-spacing: -0.03em; color: var(--ink);
    max-width: 900px; margin-bottom: 2rem;
  }
  .gg-line { display: block; overflow: hidden; }
  .gg-line-inner { display: block; }
  .gg-accent { color: var(--accent); font-style: italic; }
  .gg-hero-body { font-size: 1.1rem; font-weight: 300; color: var(--muted); line-height: 1.7; max-width: 480px; margin-bottom: 2.5rem; }
  .gg-hero-actions { display: flex; align-items: center; gap: 1.5rem; }

  .gg-btn-primary {
    background: var(--ink); color: var(--white); padding: 0.9rem 2rem; border-radius: 100px;
    font-size: 0.9rem; font-weight: 500; text-decoration: none; transition: all 0.25s;
    display: inline-flex; align-items: center; gap: 0.5rem; border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,87,255,0.18);
  }
  .gg-btn-primary:hover { background: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,87,255,0.35); }
  .gg-btn-secondary {
    font-size: 0.9rem; color: var(--ink); text-decoration: none; font-weight: 500;
    display: inline-flex; align-items: center; gap: 0.5rem;
    border-bottom: 1px solid var(--ink); padding-bottom: 2px; transition: all 0.2s;
    background: none; border-top: none; border-left: none; border-right: none; cursor: pointer;
  }
  .gg-btn-secondary:hover { color: var(--accent); border-color: var(--accent); }

  .gg-stats-strip {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;
    border-top: 1px solid var(--border); padding-top: 2rem; margin-top: 4rem;
  }
  .gg-stat-number { font-family: var(--font-head); font-size: 2.2rem; font-weight: 800; color: var(--ink); letter-spacing: -0.04em; line-height: 1; }
  .gg-stat-number span { color: var(--accent); }
  .gg-stat-label { font-size: 0.8rem; font-weight: 400; color: var(--muted); margin-top: 0.3rem; }

  /* Animated spinning ring */
  .gg-hero-ring {
    position: absolute; right: -5rem; top: 50%; transform: translateY(-50%);
    width: 620px; height: 620px; border-radius: 50%;
    border: 1px solid rgba(0,87,255,0.12);
    pointer-events: none;
  }
  .gg-hero-ring::before {
    content: ''; position: absolute; inset: 60px; border-radius: 50%;
    border: 1px solid rgba(0,87,255,0.07);
  }
  .gg-hero-ring::after {
    content: ''; position: absolute; inset: 140px; border-radius: 50%;
    border: 1px solid rgba(0,87,255,0.05);
  }
  /* Orbiting dot on the ring */
  .gg-ring-dot {
    position: absolute; right: -5rem; top: 50%; pointer-events: none;
    width: 620px; height: 620px; transform: translateY(-50%);
  }
  .gg-ring-dot::before {
    content: ''; position: absolute;
    top: -5px; left: 50%;
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 12px rgba(0,87,255,0.6);
    transform: translateX(-50%);
  }

  /* SERVICES */
  .gg-services { padding: 6rem 4rem; background: rgba(244,243,239,0.8); backdrop-filter: blur(4px); }
  .gg-section-tag { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.75rem; }
  .gg-section-title { font-family: var(--font-head); font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.03em; color: var(--ink); line-height: 1.1; margin-bottom: 3.5rem; }
  .gg-services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .gg-service-card {
    background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
    border-radius: 1.25rem; padding: 2rem;
    border: 1px solid var(--border); transition: all 0.35s; cursor: pointer;
  }
  .gg-service-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(0,87,255,0.1); border-color: rgba(0,87,255,0.25); background: rgba(255,255,255,0.98); }
  .gg-service-icon {
    width: 3rem; height: 3rem; background: linear-gradient(135deg, rgba(0,87,255,0.1), rgba(0,201,167,0.1));
    border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem; font-size: 1.4rem;
    transition: transform 0.3s;
  }
  .gg-service-card:hover .gg-service-icon { transform: scale(1.1) rotate(-4deg); }
  .gg-service-name { font-family: var(--font-head); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--ink); }
  .gg-service-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.6; }
  .gg-service-arrow { margin-top: 1.25rem; font-size: 0.8rem; color: var(--accent); font-weight: 500; display: flex; align-items: center; gap: 0.3rem; opacity: 0; transform: translateX(-8px); transition: all 0.3s; }
  .gg-service-card:hover .gg-service-arrow { opacity: 1; transform: translateX(0); }

  /* WHY */
  .gg-why { padding: 6rem 4rem; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  .gg-why-visual {
    background: var(--ink); border-radius: 1.5rem; padding: 3rem;
    display: flex; flex-direction: column; gap: 1.5rem; position: relative; overflow: hidden;
  }
  .gg-why-visual::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 240px; height: 240px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,87,255,0.35), transparent);
    pointer-events: none; animation: gg-orb-float 10s ease-in-out infinite;
  }
  .gg-why-visual::after {
    content: ''; position: absolute; bottom: -40px; left: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,201,167,0.2), transparent);
    pointer-events: none; animation: gg-orb-float 14s ease-in-out infinite reverse;
  }
  .gg-exp-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    padding: 0.6rem 1rem; border-radius: 100px;
    font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.7);
  }
  .gg-exp-year { font-family: var(--font-head); font-size: 4.5rem; font-weight: 800; color: var(--white); line-height: 1; letter-spacing: -0.05em; }
  .gg-exp-label { font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: -0.5rem; }
  .gg-exp-divider { height: 1px; background: rgba(255,255,255,0.08); }
  .gg-mini-stat { display: flex; justify-content: space-between; align-items: center; }
  .gg-mini-stat-num { font-family: var(--font-head); font-size: 1.5rem; font-weight: 800; color: var(--white); }
  .gg-mini-stat-text { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-align: right; }
  .gg-why-points { list-style: none; margin-top: 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .gg-why-point { display: flex; gap: 1rem; align-items: flex-start; }
  .gg-why-check {
    width: 1.5rem; height: 1.5rem; border-radius: 50%;
    background: rgba(0,87,255,0.1); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; flex-shrink: 0; margin-top: 2px;
  }
  .gg-why-point-text { font-size: 0.925rem; color: var(--muted); line-height: 1.6; }
  .gg-why-point-text strong { color: var(--ink); font-weight: 500; }
  .gg-pill-row { margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .gg-pill {
    display: inline-block; background: rgba(0,87,255,0.08); color: var(--accent);
    font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.85rem; border-radius: 100px;
    transition: all 0.2s;
  }
  .gg-pill:hover { background: rgba(0,87,255,0.18); }

  /* CTA */
  .gg-cta-section {
    margin: 0 4rem 6rem; background: var(--ink); border-radius: 2rem;
    padding: 5rem 4rem; display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .gg-cta-section::before {
    content: ''; position: absolute; right: -80px; top: -80px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,87,255,0.45), transparent);
    pointer-events: none; animation: gg-orb-float 12s ease-in-out infinite;
  }
  .gg-cta-section::after {
    content: ''; position: absolute; left: 30%; bottom: -60px;
    width: 250px; height: 250px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,201,167,0.15), transparent);
    pointer-events: none; animation: gg-orb-float 16s ease-in-out infinite reverse;
  }
  .gg-cta-title { font-family: var(--font-head); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; color: var(--white); letter-spacing: -0.03em; line-height: 1.2; max-width: 500px; z-index: 1; }
  .gg-cta-accent { color: #6B9FFF; }
  .gg-cta-right { display: flex; flex-direction: column; gap: 1rem; align-items: flex-end; z-index: 1; }
  .gg-cta-right p { font-size: 0.875rem; color: rgba(255,255,255,0.5); text-align: right; max-width: 280px; }
  .gg-btn-white {
    background: var(--white); color: var(--ink); padding: 0.9rem 2rem; border-radius: 100px;
    font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 0.5rem; border: none; cursor: pointer;
  }
  .gg-btn-white:hover { background: var(--accent); color: var(--white); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,87,255,0.4); }

  /* FOOTER */
  .gg-footer {
    background: rgba(244,243,239,0.9); padding: 3rem 4rem;
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid var(--border);
  }
  .gg-footer-copy { font-size: 0.8rem; color: var(--muted); }
  .gg-footer-links { display: flex; gap: 2rem; }
  .gg-footer-links a { font-size: 0.8rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .gg-footer-links a:hover { color: var(--ink); }

  @media (max-width: 900px) {
    .gg-nav { padding: 1rem 1.5rem; }
    .gg-nav-links { display: none; }
    .gg-hero { padding: 7rem 1.5rem 5rem; }
    .gg-hero-ring, .gg-ring-dot { display: none; }
    .gg-stats-strip { grid-template-columns: repeat(2, 1fr); }
    .gg-services { padding: 4rem 1.5rem; }
    .gg-services-grid { grid-template-columns: 1fr; }
    .gg-why { grid-template-columns: 1fr; padding: 4rem 1.5rem; gap: 2.5rem; }
    .gg-cta-section { margin: 0 1.5rem 4rem; padding: 3rem 2rem; flex-direction: column; gap: 2rem; }
    .gg-cta-right { align-items: flex-start; }
    .gg-footer { padding: 2rem 1.5rem; flex-direction: column; gap: 1.5rem; text-align: center; }
  }
`;

const SERVICES = [
  { icon: "🌐", name: "Responsive Web Design",    desc: "Beautiful, fast, mobile-first websites that make a lasting impression and convert visitors into customers." },
  { icon: "🔍", name: "SEO & Organic Growth",      desc: "Top-page Google rankings through proven on-page, off-page, and technical SEO strategies. Packages from ₹7,200/mo." },
  { icon: "📢", name: "PPC & Paid Ads",             desc: "High-ROI Google Ads and social media campaigns that put your business in front of buyers the moment they search." },
  { icon: "📧", name: "Business Email Hosting",     desc: "Professional @yourdomain email accounts with 5GB–5TB storage. Google Workspace reseller, Titan, and more." },
  { icon: "🎥", name: "Live Streaming",             desc: "Corporate events, launches, and webinars streamed live to any platform with HD quality and branded overlays." },
  { icon: "📱", name: "Social Media & SMO",         desc: "Build a loyal audience and drive engagement with strategic social media optimization and content calendars." },
];

const WHY_POINTS = [
  { title: "Proven SEO track record",            body: "Ranked #1 on Google for \"SEO specialist in Mumbai\" organically. We do for clients exactly what we've done for ourselves." },
  { title: "Local expertise, global reach",      body: "Based in Thane/Mumbai with clients in the US, Dubai, London, and Australia. Local accountability with international quality." },
  { title: "One expert, full ownership",         body: "Gaurang Goradiya personally handles your project. No outsourcing, no junior staff. Direct communication at every step." },
  { title: "Tata Teleservices Authorised Partner", body: "For businesses needing leased internet lines, MPLS VPN, or SIP trunking, we handle that too." },
];

// Deterministic particle config (avoids hydration mismatch)
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left:     `${((i * 37 + 11) % 97)}%`,
  width:    `${3 + (i % 4)}px`,
  height:   `${3 + (i % 4)}px`,
  duration: `${10 + (i % 14)}s`,
  delay:    `-${(i * 3) % 13}s`,
  opacity:  0.25 + (i % 3) * 0.1,
}));

const BEAMS = Array.from({ length: 6 }, (_, i) => ({
  left:     `${10 + i * 16}%`,
  height:   `${180 + (i % 3) * 80}px`,
  duration: `${7 + (i % 5)}s`,
  delay:    `-${(i * 2) % 7}s`,
  top:      `${(i % 4) * 20}%`,
}));

export default function Home() {
  const navRef        = useRef(null);
  const eyebrowRef    = useRef(null);
  const line1Ref      = useRef(null);
  const line2Ref      = useRef(null);
  const line3Ref      = useRef(null);
  const line4Ref      = useRef(null);
  const bioRef        = useRef(null);
  const actionsRef    = useRef(null);
  const statsRef      = useRef(null);
  const ringRef       = useRef(null);
  const ringDotRef    = useRef(null);
  const serviceRefs   = useRef([]);
  const whyVisualRef  = useRef(null);
  const whyContentRef = useRef(null);
  const ctaRef        = useRef(null);
  const mouseGlowRef  = useRef(null);

  // Mouse tracking for glow
  const onMouseMove = useCallback((e) => {
    if (mouseGlowRef.current) {
      mouseGlowRef.current.style.left = `${e.clientX}px`;
      mouseGlowRef.current.style.top  = `${e.clientY}px`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  useEffect(() => {
    // Inject styles
    const tag = document.createElement("style");
    tag.textContent = CSS;
    document.head.appendChild(tag);

    const gsap = window.gsap;
    const ST   = window.ScrollTrigger;
    if (ST) gsap?.registerPlugin(ST);

    if (!gsap) {
      // CSS fallback — just make everything visible
      [navRef, eyebrowRef, line1Ref, line2Ref, line3Ref, line4Ref,
       bioRef, actionsRef, statsRef, ringRef].forEach(r => {
        if (r.current) { r.current.style.opacity = "1"; r.current.style.transform = "none"; }
      });
      return () => document.head.removeChild(tag);
    }

    // ── Initial hidden states ──
    gsap.set(navRef.current,     { opacity: 0, y: -20 });
    gsap.set([eyebrowRef.current, bioRef.current, actionsRef.current, statsRef.current], { opacity: 0, y: 24 });
    gsap.set([line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current],   { opacity: 0, y: "100%" });
    gsap.set(ringRef.current,    { opacity: 0, scale: 0.75 });
    gsap.set(ringDotRef.current, { opacity: 0 });

    // ── Hero entrance timeline ──
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(navRef.current,      { opacity: 1, y: 0, duration: 0.6 })
      .to(eyebrowRef.current,  { opacity: 1, y: 0, duration: 0.55 }, "-=0.2")
      .to(line1Ref.current,    { opacity: 1, y: 0, duration: 0.6 },  "-=0.25")
      .to(line2Ref.current,    { opacity: 1, y: 0, duration: 0.6 },  "-=0.45")
      .to(line3Ref.current,    { opacity: 1, y: 0, duration: 0.6 },  "-=0.45")
      .to(line4Ref.current,    { opacity: 1, y: 0, duration: 0.6 },  "-=0.45")
      .to(bioRef.current,      { opacity: 1, y: 0, duration: 0.6 },  "-=0.3")
      .to(actionsRef.current,  { opacity: 1, y: 0, duration: 0.5 },  "-=0.3")
      .to(statsRef.current,    { opacity: 1, duration: 0.6 },         "-=0.2")
      .to(ringRef.current,     { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }, "-=1.2")
      .to(ringDotRef.current,  { opacity: 1, duration: 0.5 }, "-=0.5");

    // ── Perpetual ring spin ──
    gsap.to(ringDotRef.current, {
      rotation: 360, duration: 12, repeat: -1, ease: "none", transformOrigin: "center center",
    });
    gsap.to(ringRef.current, {
      rotation: -360, duration: 40, repeat: -1, ease: "none", transformOrigin: "center center",
    });

    // ── Scroll-triggered service cards ──
    if (ST) {
      serviceRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 40 });
        ST.create({
          trigger: card, start: "top 87%",
          onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.55, delay: i * 0.07, ease: "power3.out" }),
        });
      });

      if (whyVisualRef.current) {
        gsap.set(whyVisualRef.current, { opacity: 0, x: -50 });
        ST.create({
          trigger: whyVisualRef.current, start: "top 80%",
          onEnter: () => gsap.to(whyVisualRef.current, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }),
        });
      }

      if (whyContentRef.current) {
        gsap.set(whyContentRef.current, { opacity: 0, x: 50 });
        ST.create({
          trigger: whyContentRef.current, start: "top 80%",
          onEnter: () => gsap.to(whyContentRef.current, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.15 }),
        });
      }

      if (ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 0, y: 50 });
        ST.create({
          trigger: ctaRef.current, start: "top 85%",
          onEnter: () => gsap.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }),
        });
      }
    }

    return () => {
      document.head.removeChild(tag);
      if (ST) ST.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      {/* ── ANIMATED BACKGROUND ── */}
      <div className="gg-bg-canvas" aria-hidden="true">
        <div className="gg-orb gg-orb-1" />
        <div className="gg-orb gg-orb-2" />
        <div className="gg-orb gg-orb-3" />
        <div className="gg-orb gg-orb-4" />
        {PARTICLES.map((p, i) => (
          <div key={i} className="gg-particle" style={{
            left: p.left, bottom: "-10px",
            width: p.width, height: p.height,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }} />
        ))}
        {BEAMS.map((b, i) => (
          <div key={i} className="gg-beam" style={{
            left: b.left, top: b.top, height: b.height,
            animationDuration: b.duration,
            animationDelay: b.delay,
          }} />
        ))}
      </div>

      {/* ── MOUSE GLOW ── */}
      <div className="gg-mouse-glow" ref={mouseGlowRef} aria-hidden="true" />

      {/* ── PAGE CONTENT ── */}
      <div className="gg-wrap">

        {/* NAVBAR */}
        <nav className="gg-nav" ref={navRef}>
          <div className="gg-logo">Gaurang<span>.</span>dev</div>
          <ul className="gg-nav-links">
            <li><a href="#">Services</a></li>
            <li><a href="#">Portfolio</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">SEO</a></li>
          </ul>
          <a href="#" className="gg-nav-cta">Get a Free Quote</a>
        </nav>

        {/* HERO */}
        <section className="gg-hero">
          <div className="gg-hero-ring"    ref={ringRef}    aria-hidden="true" />
          <div className="gg-ring-dot"     ref={ringDotRef} aria-hidden="true" />

          <p className="gg-hero-eyebrow" ref={eyebrowRef}>
            Mumbai's Most Trusted — Since 1998
          </p>

          <h1 className="gg-hero-title">
            <span className="gg-line"><span className="gg-line-inner" ref={line1Ref}>Websites that</span></span>
            <span className="gg-line"><span className="gg-line-inner" ref={line2Ref}><em className="gg-accent">rank</em>, convert</span></span>
            <span className="gg-line"><span className="gg-line-inner" ref={line3Ref}>&amp; grow your</span></span>
            <span className="gg-line"><span className="gg-line-inner" ref={line4Ref}>business.</span></span>
          </h1>

          <p className="gg-hero-body" ref={bioRef}>
            Web design, SEO, and digital marketing services crafted for Mumbai businesses.
            600+ websites delivered. Results-driven since 1998.
          </p>

          <div className="gg-hero-actions" ref={actionsRef}>
            <a href="#" className="gg-btn-primary">Start Your Project →</a>
            <a href="#" className="gg-btn-secondary">View Portfolio →</a>
          </div>

          <div className="gg-stats-strip" ref={statsRef}>
            {[
              { num: <>600<span>+</span></>,  label: "Websites Delivered" },
              { num: <>26<span>yrs</span></>, label: "Industry Experience" },
              { num: <>#1</>,                  label: "Google Ranking — SEO Mumbai" },
              { num: <>98<span>%</span></>,   label: "Client Retention Rate" },
            ].map(({ num, label }, i) => (
              <div key={i}>
                <div className="gg-stat-number">{num}</div>
                <div className="gg-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section className="gg-services">
          <p className="gg-section-tag">What We Do</p>
          <h2 className="gg-section-title">Full-stack digital<br />growth services</h2>
          <div className="gg-services-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="gg-service-card" ref={el => serviceRefs.current[i] = el}>
                <div className="gg-service-icon">{s.icon}</div>
                <div className="gg-service-name">{s.name}</div>
                <div className="gg-service-desc">{s.desc}</div>
                <div className="gg-service-arrow">Explore service →</div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY US */}
        <section className="gg-why">
          <div className="gg-why-visual" ref={whyVisualRef}>
            <span className="gg-exp-badge">✦ Active since 1998</span>
            <div>
              <div className="gg-exp-year">26</div>
              <div className="gg-exp-label">Years in the industry</div>
            </div>
            <div className="gg-exp-divider" />
            {[
              { num: "600+",  text: <>Websites<br />designed &amp; launched</> },
              { num: "15+",   text: <>Countries<br />served globally</> },
              { num: "₹7.2K", text: <>SEO packages<br />starting price</> },
            ].map(({ num, text }, i) => (
              <div key={i} className="gg-mini-stat">
                <span className="gg-mini-stat-num">{num}</span>
                <span className="gg-mini-stat-text">{text}</span>
              </div>
            ))}
          </div>

          <div ref={whyContentRef}>
            <p className="gg-section-tag">Why Choose Us</p>
            <h2 className="gg-section-title">Experience you can<br />trust, results you<br />can measure.</h2>
            <ul className="gg-why-points">
              {WHY_POINTS.map((p, i) => (
                <li key={i} className="gg-why-point">
                  <div className="gg-why-check">✓</div>
                  <p className="gg-why-point-text">
                    <strong>{p.title}</strong> — {p.body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="gg-pill-row">
              {["Mumbai", "Thane", "Vasai-Virar", "Navi Mumbai", "Pan India"].map(tag => (
                <span key={tag} className="gg-pill">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="gg-cta-section" ref={ctaRef}>
          <h2 className="gg-cta-title">
            Ready to get your business on{" "}
            <span className="gg-cta-accent">page one</span> of Google?
          </h2>
          <div className="gg-cta-right">
            <p>Free consultation. No commitments. Just an honest conversation about your digital goals.</p>
            <a href="#" className="gg-btn-white">Talk to Gaurang →</a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="gg-footer">
          <div className="gg-footer-copy">© 2025 Gaurang Goradiya — Pushti Web &amp; Software Solutions</div>
          <div className="gg-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Portfolio</a>
            <a href="#">Contact</a>
          </div>
        </footer>

      </div>
    </>
  );
}