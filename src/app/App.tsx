import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Coffee, Sparkles } from "lucide-react";

// ─── Seeded pseudo-random – stable across re-renders ──────────────────────
const sr = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// ─── Fluffy CSS cloud shape ────────────────────────────────────────────────
const FluffyCloud = ({
  color = "bg-white",
  scale = 1,
  opacity = 1,
  className = "",
}: {
  color?: string;
  scale?: number;
  opacity?: number;
  className?: string;
}) => (
  <div
    style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center bottom" }}
    className={`relative w-40 h-14 rounded-full ${color} ${className}`}
  >
    <div className={`absolute -top-6 left-6 w-16 h-16 rounded-full ${color}`} />
    <div className={`absolute -top-12 right-8 w-24 h-24 rounded-full ${color}`} />
    <div className={`absolute -top-4 right-2 w-14 h-14 rounded-full ${color}`} />
  </div>
);

// ─── Drifting background cloud ─────────────────────────────────────────────
// BUG FIX: `position: absolute` + `top` via `style` prop (not Motion initial)
const DriftingCloud = ({
  delay,
  duration,
  top,
  scale,
  opacity,
  color,
}: {
  delay: number;
  duration: number;
  top: string;
  scale: number;
  opacity: number;
  color: string;
}) => (
  <motion.div
    style={{ position: "absolute", top, willChange: "transform" }}
    initial={{ x: "-28vw" }}
    animate={{ x: "125vw" }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    className="pointer-events-none"
  >
    <FluffyCloud color={color} scale={scale} opacity={opacity} />
  </motion.div>
);

// ─── Floating hearts ───────────────────────────────────────────────────────
// BUG FIX: stable positions via seeded random (no Math.random() in render)
const FloatingHearts = ({ isMobile = false }: { isMobile?: boolean }) => {
  const hearts = useMemo(
    () =>
      Array.from({ length: isMobile ? 10 : 14 }, (_, i) => ({
        id: i,
        left: `${sr(i * 2) * 88 + 5}vw`,
        delay: sr(i * 3 + 1) * (isMobile ? 11 : 14),
        duration: sr(i * 5 + 2) * (isMobile ? 7 : 8) + (isMobile ? 12 : 14),
        size: Math.floor(sr(i * 7 + 3) * (isMobile ? 16 : 18) + 11),
        drift: sr(i * 11 + 4) * (isMobile ? 70 : 80) - (isMobile ? 32 : 40),
      })),
    [isMobile]
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute text-rose-300/35"
          style={{ left: h.left, bottom: "-10vh" }}
          animate={{
            y: [0, "-115vh"],
            x: [0, h.drift],
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.4, 1, 0.7],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Heart size={h.size} fill="currentColor" strokeWidth={0} />
        </motion.div>
      ))}
    </div>
  );
};

// ─── Confetti burst ────────────────────────────────────────────────────────
const ConfettiBurst = ({
  items,
}: {
  items: Array<{
    id: number;
    x: number;
    y: number;
    rotate: number;
    color: string;
    delay: number;
  }>;
}) => (
  <>
    {items.map((p) => (
      <motion.div
        key={p.id}
        className={`absolute w-3 h-2.5 rounded-sm ${p.color} pointer-events-none`}
        style={{ top: "50%", left: "50%" }}
        initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
        animate={{
          x: p.x,
          y: p.y,
          scale: [0, 1.3, 0.6],
          opacity: [1, 1, 0],
          rotate: p.rotate,
        }}
        transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
      />
    ))}
  </>
);

// ─── Main App ──────────────────────────────────────────────────────────────
// ─── Analytics helper ───────────────────────────────────────────────────────
const track = (name: string, params?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (!w.gtag) return;
  w.gtag("event", name, params || {});
};

export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  // noPos is a CSS-transform offset applied to the No button wrapper
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [hintVisible, setHintVisible] = useState(false);
  const lastHoverTime = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  // Basic page view
  useEffect(() => {
    track("page_view_coffee_date", { page: "invite" });
  }, []);

  useEffect(() => {
    if (noCount >= 5) setHintVisible(true);
  }, [noCount]);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // ── Confetti items (stable) ──────────────────────────────────────────
  const confettiColors = [
    "bg-rose-300",
    "bg-pink-300",
    "bg-emerald-300",
    "bg-teal-200",
    "bg-yellow-200",
    "bg-violet-200",
    "bg-orange-200",
  ];
  const confettiItems = useMemo(
    () =>
      Array.from({ length: isMobile ? 12 : 26 }, (_, i) => ({
        id: i,
        x: (sr(i * 2) * 2 - 1) * (isMobile ? 190 : 230),
        y: sr(i * 3 + 1) * (isMobile ? -160 : -200) - 20,
        rotate: (sr(i * 7) * 2 - 1) * 560,
        color: confettiColors[i % confettiColors.length],
        delay: sr(i * 5) * (isMobile ? 0.22 : 0.28),
      })),
    [isMobile]
  );

  // ── No button phrases ────────────────────────────────────────────────
  const noText = [
    "No",
    "Are you sure?",
    "Really, Hiva? 🥹",
    "Think again!",
    "Last chance!",
    "Surely not?",
    "You'll regret this!",
    "Give it another thought!",
    "Absolutely certain?",
    "This is a mistake!",
    "Have a heart!",
    "Don't be so cold!",
    "Change of heart?",
    "Reconsider?",
    "Final answer?",
    "You're breaking my heart",
    "Please Hiva 🥺",
    "I'll buy you a matcha!",
    "Just say yes!",
    "…ok fine 😭",
  ][Math.min(noCount, 19)];

  // ── No button evades on hover (desktop) ──────────────────────────────
  const evadeNoButton = useCallback(() => {
    const now = Date.now();
    if (now - lastHoverTime.current < 500) return;
    lastHoverTime.current = now;
    track("no_hover", { count: noCount + 1 });
    setNoCount((prev) => {
      const next = prev + 1;
      const sx = Math.min(55 + next * 10, 155);
      const sy = Math.min(22 + next * 4, 75);
      setNoPos({
        x: (Math.random() * 2 - 1) * sx,
        y: (Math.random() * 2 - 1) * sy,
      });
      return next;
    });
  }, [noCount]);

  // ── No button click fallback (mobile) ────────────────────────────────
  const handleNoClick = useCallback(() => {
    const sx = Math.min(45 + noCount * 8, 120);
    const sy = Math.min(18 + noCount * 3, 55);
    setNoPos({
      x: (Math.random() * 2 - 1) * sx,
      y: (Math.random() * 2 - 1) * sy,
    });
    setNoCount((prev) => {
      const next = prev + 1;
      track("no_click", { count: next });
      return next;
    });
  }, [noCount]);

  // ── Yes button grows ─────────────────────────────────────────────────
  const yesFontSize = Math.min(noCount * 4 + 20, 60);
  const yesPadX = Math.min(noCount * 5 + 38, 88);
  const yesPadY = Math.min(noCount * 3 + 16, 52);

  // ── No button shrinks ────────────────────────────────────────────────
  const noFontSize = Math.max(16 - noCount * 0.75, 8);
  const noPadX = Math.max(26 - noCount * 1.4, 8);
  const noPadY = Math.max(13 - noCount * 0.75, 4);
  const noOpacity = Math.max(1 - noCount * 0.042, 0.2);
  const noVisualScale = Math.max(1 - noCount * 0.055, 0.2);

  const hintMsg =
    noCount > 13
      ? "☕ The coffee is getting cold…"
      : "Psst — the Yes button is getting cuter! 💕";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background:
          "linear-gradient(158deg, #fce7f3 0%, #f0fdf4 38%, #fdf2f8 65%, #ecfdf5 100%)",
      }}
    >
      {/* ── Animated ambient blobs ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-pink-200/22 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 24, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-emerald-200/22 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-rose-100/28 blur-3xl"
        />
      </div>

      {/* ── Drifting clouds (FIXED: absolute via style.position + style.top) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <DriftingCloud delay={0}  duration={52} top="10%"  scale={0.5}  opacity={0.26} color="bg-white/65" />
        <DriftingCloud delay={16} duration={56} top="62%"  scale={0.46} opacity={0.2}  color="bg-white/50" />
        <DriftingCloud delay={27} duration={48} top="33%"  scale={0.6}  opacity={0.3}  color="bg-rose-50/55" />
        <DriftingCloud delay={6}  duration={40} top="20%"  scale={0.9}  opacity={0.5}  color="bg-white/80" />
        <DriftingCloud delay={21} duration={43} top="74%"  scale={0.82} opacity={0.4}  color="bg-emerald-50/70" />
        <DriftingCloud delay={36} duration={34} top="7%"   scale={1.0}  opacity={0.6}  color="bg-white/90" />
        <DriftingCloud delay={11} duration={30} top="46%"  scale={1.25} opacity={0.7}  color="bg-white" />
        <DriftingCloud delay={29} duration={27} top="83%"  scale={1.45} opacity={0.8}  color="bg-white" />
      </div>

      {/* ── Floating hearts (mobile-optimized count) ──────────────────── */}
      <FloatingHearts isMobile={isMobile} />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 flex flex-col items-center justify-center text-center py-10">
        <AnimatePresence mode="wait">

          {/* ══ SUCCESS SCREEN ════════════════════════════════════════ */}
          {yesPressed ? (
            <motion.div
              key="success"
              initial={{ scale: 0.75, opacity: 0, y: 44 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.55, duration: 1 }}
              className="relative w-full"
            >
              <ConfettiBurst items={confettiItems} />

              <div className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] border-4 border-white shadow-[0_30px_80px_-10px_rgba(244,114,182,0.22),0_0_0_1px_rgba(255,255,255,0.55)] p-8 md:p-14 overflow-hidden">
                {/* Inner gradient sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/35 via-transparent to-emerald-50/35 pointer-events-none rounded-[3rem]" />

                {/* Subtle dot pattern */}
                <div className="absolute inset-0 rounded-[3rem] pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(251 113 133 / 0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                {/* Corner & edge decorations – hearts & sparkles */}
                <div className="absolute top-6 left-6 pointer-events-none z-0">
                  <motion.div animate={{ opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <Heart size={20} className="text-rose-300 fill-rose-200" />
                  </motion.div>
                </div>
                <div className="absolute top-8 right-8 pointer-events-none z-0">
                  <motion.div animate={{ rotate: [0, 8, -8, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Sparkles size={18} className="text-pink-300" />
                  </motion.div>
                </div>
                <div className="absolute bottom-8 left-8 pointer-events-none z-0">
                  <motion.div animate={{ opacity: [0.2, 0.45, 0.2] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                    <Sparkles size={16} className="text-rose-200" />
                  </motion.div>
                </div>
                <div className="absolute bottom-6 right-6 pointer-events-none z-0">
                  <motion.div animate={{ opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                    <Heart size={18} className="text-pink-300 fill-pink-200" />
                  </motion.div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none z-0">
                  <Heart size={12} className="text-rose-200/70 fill-rose-100/50" />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none z-0">
                  <Heart size={12} className="text-pink-200/70 fill-pink-100/50" />
                </div>

                {/* Coffee + heart icon – staggered */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="flex justify-center mb-8 relative z-10"
                >
                  <motion.div
                    animate={{ y: [0, -14, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-50 p-7 rounded-full shadow-[0_15px_40px_-8px_rgba(16,185,129,0.28)] border-4 border-white">
                      <Coffee size={62} strokeWidth={1.8} className="text-emerald-500" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], rotate: [0, 12, -12, 0] }}
                      transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                      className="absolute -bottom-2 -right-2 bg-rose-100 rounded-full p-3 border-4 border-white shadow"
                    >
                      <Heart size={26} className="text-rose-400 fill-rose-400" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="text-5xl md:text-6xl text-slate-700 mb-3 relative z-10"
                  style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}
                >
                  It's a Date! 🎉
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-xl md:text-2xl text-slate-500 font-bold mb-4 relative z-10"
                >
                  I can't wait for our coffee together, Hiva.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-rose-400/80 text-sm mb-6 relative z-10"
                >
                  My favourite yes yet
                </motion.p>

                {/* Decorative line with heart */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.62 }}
                  className="flex items-center justify-center gap-3 mb-6 relative z-10"
                >
                  <span className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-rose-200/80 rounded-full" />
                  <Heart size={14} className="text-rose-300/80 fill-rose-200/60 shrink-0" />
                  <span className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-rose-200/80 rounded-full" />
                </motion.div>

                {/* Save the date – with tiny hearts */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.65 }}
                  className="flex items-center justify-center gap-2 mb-5 relative z-10"
                >
                  <Heart size={12} className="text-rose-300 fill-rose-300" />
                  <span className="text-xs font-medium text-rose-400/90 uppercase tracking-[0.25em]">
                    Save the date
                  </span>
                  <Heart size={12} className="text-rose-300 fill-rose-300" />
                </motion.div>

                {/* Info cards – warm glass, soft glow, pastel icons */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 relative z-10 w-full max-w-md mx-auto">
                  {[
                    { Icon: Heart, label: "This Saturday", delay: 0.7, gradient: "from-rose-300 to-pink-400", glow: "shadow-[0_0_24px_-4px_rgba(251,113,133,0.4)]" },
                    { Icon: Coffee, label: "Your favourite café", delay: 0.85, gradient: "from-emerald-300 to-teal-400", glow: "shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)]" },
                    { Icon: Sparkles, label: "I'll pick you up", delay: 1.0, gradient: "from-pink-300 to-rose-400", glow: "shadow-[0_0_24px_-4px_rgba(244,114,182,0.4)]" },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", bounce: 0.35, delay: card.delay }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="flex flex-col items-center gap-4 bg-gradient-to-b from-white/70 to-rose-50/50 backdrop-blur-2xl rounded-3xl px-4 py-6 border border-rose-100/60 shadow-[0_12px_40px_-12px_rgba(244,114,182,0.25),inset_0_1px_0_rgba(255,255,255,0.8)]"
                    >
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${card.gradient} ${card.glow} ring-4 ring-white/50`}
                      >
                        <card.Icon size={26} className="text-white" strokeWidth={2} />
                      </motion.div>
                      <span className="text-rose-800/90 font-semibold text-center text-xs sm:text-sm leading-snug">
                        {card.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Closing lines – warmer, romantic */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="relative z-10 flex flex-col items-center gap-4"
                >
                  <motion.p
                    className="text-rose-700/90 font-semibold text-center max-w-md"
                  >
                    Can't wait to see your beautiful smile
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="text-rose-400/90 text-sm"
                  >
                    You said yes — best answer ever
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="flex items-center gap-2 text-rose-400/80 text-xs tracking-[0.3em] uppercase"
                  >
                    <Heart size={14} className="text-rose-300 fill-rose-300 shrink-0" />
                    With love · Ali
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>

          ) : (
            /* ══ QUESTION SCREEN ══════════════════════════════════════ */
            <motion.div
              key="question"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0, filter: "blur(12px)" }}
              className="flex flex-col items-center w-full"
            >
              {/* Floating heart icon */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                className="relative mb-8 z-10"
              >
                <div className="bg-white/92 p-5 rounded-full shadow-[0_18px_48px_-10px_rgba(244,114,182,0.32)] border-4 border-white">
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-full p-4">
                    <Heart className="text-rose-400 fill-rose-200" size={54} strokeWidth={1.8} />
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-3 -right-3"
                >
                  <Sparkles size={20} className="text-rose-300" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-2 -left-4"
                >
                  <Sparkles size={14} className="text-pink-300" />
                </motion.div>
              </motion.div>

              {/* Heading */}
              <div className="relative mb-10">
                <h1
                  className="text-6xl md:text-7xl text-slate-700 relative z-10"
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontWeight: 700,
                    lineHeight: 1.15,
                  }}
                >
                  Hi Hiva,
                </h1>
                <p
                  className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-emerald-400 mt-2 relative z-10"
                  style={{ lineHeight: 1.38 }}
                >
                  Will you go on a
                  <br />
                  coffee date with me?
                </p>
                {/* Glow halo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[150%] bg-white/50 blur-3xl rounded-full -z-10 pointer-events-none" />
              </div>

              {/* ── Buttons ─────────────────────────────────────────── */}
              {/* Layout: flex row on sm+. No button uses transform-jump,
                  so its layout slot stays put while it visually "runs away". */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 w-full z-20"
                style={{
                  minHeight: `${Math.max(130, yesPadY * 2 + yesFontSize + 50)}px`,
                }}
              >
                {/* YES – grows */}
                <motion.button
                  layout
                  whileHover={{
                    scale: 1.06,
                    boxShadow: "0 18px 48px -8px rgba(52,211,153,0.55)",
                  }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setYesPressed(true);
                    track("yes_click");
                  }}
                  className="bg-gradient-to-b from-emerald-300 to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 text-white font-black rounded-full shadow-[0_12px_38px_-8px_rgba(52,211,153,0.5)] border-4 border-white flex items-center justify-center gap-2 cursor-pointer transition-shadow z-30"
                  style={{
                    fontSize: `${yesFontSize}px`,
                    paddingTop: `${yesPadY}px`,
                    paddingBottom: `${yesPadY}px`,
                    paddingLeft: `${yesPadX}px`,
                    paddingRight: `${yesPadX}px`,
                  }}
                >
                  <Heart size={Math.min(noCount * 3 + 22, 54)} fill="white" strokeWidth={0} />
                  <span>Yes!</span>
                </motion.button>

                {/* NO – shrinks and jumps away via CSS transform
                    (flex slot is preserved, layout of Yes button is untouched) */}
                <motion.div
                  animate={{ x: noPos.x, y: noPos.y }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="flex-shrink-0 z-20"
                >
                  <button
                    onMouseEnter={evadeNoButton}
                    onClick={handleNoClick}
                    className="bg-white hover:bg-rose-50 text-rose-400 font-bold rounded-full shadow-[0_8px_26px_-8px_rgba(244,114,182,0.3)] border-4 border-white/80 cursor-pointer whitespace-nowrap transition-colors"
                    style={{
                      fontSize: `${noFontSize}px`,
                      paddingTop: `${noPadY}px`,
                      paddingBottom: `${noPadY}px`,
                      paddingLeft: `${noPadX}px`,
                      paddingRight: `${noPadX}px`,
                      opacity: noOpacity,
                      transform: `scale(${noVisualScale})`,
                      transformOrigin: "center center",
                    }}
                  >
                    {noText}
                  </button>
                </motion.div>
              </div>

              {/* Hint text (shown after 5 interactions) */}
              <AnimatePresence>
                {hintVisible && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-rose-300 mt-5 font-semibold tracking-wide"
                  >
                    {hintMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
