"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Wind, Timer } from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────── */

type PhaseAction = "inhale" | "hold" | "exhale";

interface Phase { action: PhaseAction; duration: number; label: string }
interface Pattern {
  id: string; name: string; ratio: string;
  benefit: string; description: string; color: string; phases: Phase[];
}

const PATTERNS: Pattern[] = [
  {
    id: "box", name: "Box", ratio: "4 · 4 · 4 · 4", benefit: "Focus & calm",
    description: "Equal sides. Used by Navy SEALs to stay sharp under pressure.", color: "#818CF8",
    phases: [
      { action: "inhale", duration: 4, label: "Inhale" }, { action: "hold", duration: 4, label: "Hold" },
      { action: "exhale", duration: 4, label: "Exhale" }, { action: "hold", duration: 4, label: "Hold" },
    ],
  },
  {
    id: "478", name: "4-7-8", ratio: "4 · 7 · 8", benefit: "Sleep & anxiety",
    description: "Dr Andrew Weil's technique. Long exhale activates the parasympathetic system.", color: "#34D399",
    phases: [
      { action: "inhale", duration: 4, label: "Inhale" },
      { action: "hold", duration: 7, label: "Hold" },
      { action: "exhale", duration: 8, label: "Exhale" },
    ],
  },
  {
    id: "calm", name: "Calm", ratio: "4 · 0 · 6", benefit: "Stress relief",
    description: "Longer exhale slows the heart rate. Good for everyday anxiety.", color: "#06B6D4",
    phases: [
      { action: "inhale", duration: 4, label: "Inhale" }, { action: "exhale", duration: 6, label: "Exhale" },
    ],
  },
  {
    id: "energise", name: "Energise", ratio: "2 · 0 · 2", benefit: "Wake up & focus",
    description: "Quick equal breaths. A natural substitute for a morning coffee.", color: "#F59E0B",
    phases: [
      { action: "inhale", duration: 2, label: "Inhale" }, { action: "exhale", duration: 2, label: "Exhale" },
    ],
  },
  {
    id: "sigh", name: "Physio Sigh", ratio: "2 · 1 · 6", benefit: "Instant relief",
    description: "Double inhale + long exhale. Fastest way to drop stress in real time.", color: "#EC4899",
    phases: [
      { action: "inhale", duration: 2, label: "Inhale" },
      { action: "hold", duration: 1, label: "Again" },
      { action: "exhale", duration: 6, label: "Exhale long" },
    ],
  },
  {
    id: "resonance", name: "Resonance", ratio: "5 · 0 · 5", benefit: "Heart coherence",
    description: "Syncs heart rate variability for deep, sustained calm.", color: "#A78BFA",
    phases: [
      { action: "inhale", duration: 5, label: "Inhale" }, { action: "exhale", duration: 5, label: "Exhale" },
    ],
  },
];

const MEDITATION_DURATIONS = [3, 5, 10, 15, 20, 30];

const TIPS: Record<"breathing" | "meditation", string[]> = {
  breathing: [
    "Breathe through your nose when possible — it filters and warms the air.",
    "Let your belly rise on the inhale, not just your chest.",
    "Start with 3–5 cycles and build up as it feels natural.",
    "4-7-8 before bed; Box breathing before a high-stakes moment.",
  ],
  meditation: [
    "Find a comfortable position — seated or lying down, whatever keeps you alert.",
    "When your mind wanders, gently return to the breath. That is the practice.",
    "Even 3 minutes counts. Consistency matters more than duration.",
    "Same time each day builds the habit faster than long occasional sessions.",
  ],
};

/* ─── Completion chime (Web Audio API, no file needed) ──────── */

function playCompletionChime() {
  if (typeof window === "undefined") return;
  try {
    type AudioCtxCtor = typeof AudioContext;
    const Ctor: AudioCtxCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: AudioCtxCtor }).webkitAudioContext;
    const ctx = new Ctor();
    // C5 → E5 → G5 ascending arpeggio — soft and warm
    const notes: [freq: number, delay: number, peak: number][] = [
      [523.25, 0,    0.22],
      [659.25, 0.32, 0.18],
      [783.99, 0.58, 0.15],
    ];
    notes.forEach(([freq, delay, peak]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
      osc.start(t);
      osc.stop(t + 3.1);
    });
  } catch {
    // AudioContext blocked or unsupported
  }
}

/* ─── Shared sub-components ──────────────────────────────────── */

function TipsCard({ mode }: { mode: "breathing" | "meditation" }) {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
        Tips
      </p>
      <ul className="space-y-2">
        {TIPS[mode].map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: "#818CF8", opacity: 0.7 }} />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Circular play/pause button — no .clay-btn conflicts */
function PlayButton({
  active, onClick, color,
}: { active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center text-white transition-all duration-150 active:scale-95"
      style={{
        width: 64, height: 64, borderRadius: "50%",
        background: `linear-gradient(145deg, ${color}, ${color}bb)`,
        boxShadow: `0 6px 28px ${color}55, 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)`,
        border: `1px solid ${color}60`,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.06)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
    >
      {active
        ? <Pause className="w-5 h-5" />
        : <Play className="w-5 h-5" style={{ transform: "translateX(2px)" }} />}
    </button>
  );
}

function ResetButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center transition-all duration-150 disabled:opacity-25 hover:scale-105 active:scale-95"
      style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "var(--color-text-secondary)",
      }}
    >
      <RotateCcw className="w-4 h-4" />
    </button>
  );
}

/* ─── Breathing ──────────────────────────────────────────────── */

function BreathingExercise() {
  const [patternId, setPatternId] = useState("box");
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [circleScale, setCircleScale] = useState(0.45);
  const [transitionDur, setTransitionDur] = useState(0);

  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const phase = pattern.phases[phaseIdx]!;
  const phaseRemaining = phase.duration - phaseElapsed;

  const reset = useCallback(() => {
    setActive(false); setPhaseIdx(0); setPhaseElapsed(0);
    setCycles(0); setCircleScale(0.45); setTransitionDur(0);
  }, []);

  useEffect(() => {
    if (!active) return;
    const p = pattern.phases[phaseIdx]!;
    if (p.action === "inhale")  { setTransitionDur(p.duration); setCircleScale(1.0); }
    else if (p.action === "exhale") { setTransitionDur(p.duration); setCircleScale(0.45); }
    else { setTransitionDur(0.3); }
  }, [phaseIdx, active, pattern]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPhaseElapsed((prev) => {
        const next = prev + 1;
        if (next >= phase.duration) {
          const nextIdx = (phaseIdx + 1) % pattern.phases.length;
          setPhaseIdx(nextIdx);
          if (nextIdx === 0) setCycles((c) => c + 1);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, phase.duration, phaseIdx, pattern.phases.length]);

  useEffect(() => { reset(); }, [patternId, reset]);

  const toggle = () => {
    if (!active) {
      setPhaseIdx(0); setPhaseElapsed(0);
      const first = pattern.phases[0]!;
      setTransitionDur(first.duration);
      setCircleScale(first.action === "inhale" ? 1.0 : 0.45);
    }
    setActive((a) => !a);
  };

  const phaseColor = { inhale: pattern.color, hold: "rgba(238,242,255,0.7)", exhale: `${pattern.color}90` }[phase.action];
  const phaseProgress = phaseElapsed / phase.duration;
  const CIRCLE_SIZE = 300;
  const ARC_R = 136;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

      {/* ── Left panel ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-secondary)" }}>
          Technique
        </p>
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPatternId(p.id)}
            disabled={active}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 disabled:opacity-50"
            style={
              patternId === p.id
                ? { background: `${p.color}12`, border: `1px solid ${p.color}35` }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
            }
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color, opacity: patternId === p.id ? 1 : 0.4 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: patternId === p.id ? p.color : "var(--color-text-primary)" }}>
                  {p.name}
                </span>
                <span className="text-[10px] tabular-nums" style={{ color: "rgba(136,146,176,0.6)" }}>{p.ratio}</span>
              </div>
              <span className="text-xs" style={{ color: "rgba(136,146,176,0.7)" }}>{p.benefit}</span>
            </div>
          </button>
        ))}

        <div className="pt-1">
          <TipsCard mode="breathing" />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col items-center gap-6">
        {/* Description */}
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold" style={{ color: pattern.color }}>{pattern.benefit}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(136,146,176,0.75)" }}>{pattern.description}</p>
        </div>

        {/* Circle */}
        <div className="relative flex items-center justify-center" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
          {/* Pulse rings on inhale */}
          {active && phase.action === "inhale" && (
            <>
              <div className="absolute rounded-full" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, border: `1px solid ${pattern.color}20`, animation: "pulse-ring 3s ease-out infinite" }} />
              <div className="absolute rounded-full" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, border: `1px solid ${pattern.color}12`, animation: "pulse-ring 3s ease-out infinite 1.2s" }} />
            </>
          )}

          {/* Main breathing orb */}
          <div
            className="absolute rounded-full"
            style={{
              width: 220, height: 220,
              background: `radial-gradient(circle at 38% 35%, ${pattern.color}40, ${pattern.color}18 55%, ${pattern.color}08)`,
              border: `1.5px solid ${pattern.color}35`,
              boxShadow: `0 0 60px ${pattern.color}20, inset 0 0 40px ${pattern.color}10`,
              transform: `scale(${circleScale})`,
              transition: `transform ${transitionDur}s ease-in-out`,
            }}
          />

          {/* Inner label */}
          <div className="absolute z-10 flex flex-col items-center justify-center" style={{ width: 120, height: 120 }}>
            {active ? (
              <div className="text-center">
                <p className="text-sm font-semibold tracking-wide" style={{ color: phaseColor }}>{phase.label}</p>
                <p className="text-5xl font-black tabular-nums leading-none mt-1" style={{ color: "var(--color-text-primary)" }}>
                  {phaseRemaining}
                </p>
              </div>
            ) : (
              <Wind className="w-8 h-8" style={{ color: `${pattern.color}70` }} />
            )}
          </div>

          {/* Phase progress arc */}
          {active && (
            <svg className="absolute -rotate-90" width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ left: 0, top: 0 }}>
              <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={ARC_R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
              <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={ARC_R} fill="none"
                stroke={pattern.color} strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * ARC_R}
                strokeDashoffset={2 * Math.PI * ARC_R * (1 - phaseProgress)}
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <PlayButton active={active} onClick={toggle} color={pattern.color} />
          <ResetButton onClick={reset} disabled={!active && cycles === 0 && phaseIdx === 0} />
        </div>

        {/* Phase timeline */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {pattern.phases.map((p, i) => {
            const isCurrent = active && i === phaseIdx;
            const isPast = active && i < phaseIdx;
            return (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all duration-300"
                  style={
                    isCurrent
                      ? { background: `${pattern.color}20`, color: pattern.color, border: `1px solid ${pattern.color}40` }
                      : { background: "rgba(255,255,255,0.04)", color: isPast ? "rgba(238,242,255,0.4)" : "rgba(136,146,176,0.5)", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {p.label} {p.duration}s
                </span>
                {i < pattern.phases.length - 1 && (
                  <div className="w-2.5 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Cycles */}
        {cycles > 0 && (
          <p className="text-xs" style={{ color: "rgba(136,146,176,0.55)" }}>
            {cycles} {cycles === 1 ? "cycle" : "cycles"} completed
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Meditation ─────────────────────────────────────────────── */

const RING_R = 100;
const RING_C = 2 * Math.PI * RING_R;
const RING_SIZE = 260;

function MeditationTimer() {
  const [duration, setDuration] = useState(10);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSecs = duration * 60;
  const progress = elapsed / totalSecs;
  const remaining = totalSecs - elapsed;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const ringColor = finished ? "#34D399" : "#818CF8";

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0); setRunning(false); setFinished(false);
  }, []);

  const toggle = useCallback(() => {
    if (finished) { reset(); return; }
    setRunning((r) => !r);
  }, [finished, reset]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= totalSecs) {
            clearInterval(intervalRef.current!);
            setRunning(false); setFinished(true);
            return totalSecs;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, totalSecs]);

  useEffect(() => { reset(); }, [duration, reset]);

  useEffect(() => { if (finished) playCompletionChime(); }, [finished]);

  const offset = RING_C * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

      {/* ── Left panel ── */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-secondary)" }}>
            Duration
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MEDITATION_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                disabled={running}
                className="py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={
                  duration === d
                    ? { background: "rgba(129,140,248,0.18)", border: "1px solid rgba(129,140,248,0.4)", color: "#818CF8" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-text-secondary)" }
                }
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Session info */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.14)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#818CF8" }}>Session</p>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(136,146,176,0.7)" }}>Duration</span>
            <span style={{ color: "var(--color-text-primary)" }}>{duration} min</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(136,146,176,0.7)" }}>Elapsed</span>
            <span style={{ color: "var(--color-text-primary)" }}>
              {Math.floor(elapsed / 60)}m {elapsed % 60}s
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "rgba(136,146,176,0.7)" }}>Remaining</span>
            <span style={{ color: "var(--color-text-primary)" }}>{mm}:{ss}</span>
          </div>
        </div>

        <TipsCard mode="meditation" />
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col items-center gap-8">
        {/* Ring */}
        <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg width={RING_SIZE} height={RING_SIZE} className="absolute -rotate-90" style={{ left: 0, top: 0 }}>
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} fill="none"
              stroke={ringColor} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={RING_C} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.6s ease" }}
            />
          </svg>

          {/* Glow */}
          <div
            className="absolute rounded-full blur-3xl transition-all duration-1000"
            style={{ width: 160, height: 160, background: ringColor, opacity: running ? 0.13 : 0.04 }}
          />

          {/* Content */}
          <div className="relative z-10 text-center">
            {finished ? (
              <div className="space-y-2">
                <p className="text-4xl">🎉</p>
                <p className="text-sm font-semibold" style={{ color: "#34D399" }}>Session complete</p>
              </div>
            ) : (
              <>
                <p
                  className="text-6xl font-black tabular-nums tracking-tight leading-none"
                  style={{ color: running ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
                >
                  {mm}:{ss}
                </p>
                <p className="text-xs mt-2" style={{ color: "rgba(136,146,176,0.55)" }}>
                  {running ? "breathe easy" : elapsed > 0 ? "paused" : `${duration} min session`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <PlayButton active={running} onClick={toggle} color={ringColor} />
          <ResetButton onClick={reset} disabled={elapsed === 0 && !running} />
        </div>

        {/* Progress bar */}
        {elapsed > 0 && (
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: "rgba(136,146,176,0.5)" }}>
              <span>0</span><span>{duration} min</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress * 100}%`, background: ringColor }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

type Tab = "breathing" | "meditation";

export default function WellbeingPage() {
  const [tab, setTab] = useState<Tab>("breathing");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Wellbeing</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Take a moment. Your mind will thank you.
          </p>
        </div>
        {/* Tab switcher */}
        <div
          className="inline-flex rounded-xl p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["breathing", "meditation"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 capitalize"
              style={
                tab === t
                  ? { background: "rgba(129,140,248,0.18)", border: "1px solid rgba(129,140,248,0.3)", color: "#818CF8", height: 34 }
                  : { color: "var(--color-text-secondary)", height: 34, border: "1px solid transparent" }
              }
            >
              {t === "breathing" ? <Wind className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
              {t === "breathing" ? "Breathing" : "Meditation"}
            </button>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div
        className="rounded-[var(--radius-card)] p-5 sm:p-8"
        style={{
          background: "rgba(255,255,255,0.035)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {tab === "breathing" ? <BreathingExercise /> : <MeditationTimer />}
      </div>
    </div>
  );
}
