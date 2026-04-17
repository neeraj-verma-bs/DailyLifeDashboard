"use client";

import Link from "next/link";
import { ArrowRight, Check, Plus, Circle, Bell, Target, Zap, ChevronRight } from "lucide-react";

/* ─── tiny reusable pieces ─────────────────────────────────── */

function Tag({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.07)" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ─── Hero floating cards ──────────────────────────────────── */

function HeroMockup() {
  return (
    <div className="relative w-full h-[420px] sm:h-[480px] select-none pointer-events-none">
      {/* Card A — Summary stats — back, tilted */}
      <div
        className="float-a absolute top-0 right-0 w-64 rounded-2xl p-4 space-y-3"
        style={{
          background: "rgba(11,14,31,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(136,146,176,0.6)" }}>Today</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Done", val: "8", color: "#818CF8" },
            { label: "Spent", val: "₹640", color: "#F59E0B" },
            { label: "Logged", val: "14", color: "#34D399" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-xs font-bold" style={{ color }}>{val}</p>
              <p className="text-[9px] mt-0.5" style={{ color: "rgba(136,146,176,0.7)" }}>{label}</p>
            </div>
          ))}
        </div>
        {/* Mini entries */}
        <div className="space-y-1.5">
          {[
            { text: "Review Q2 report", done: true, color: "#818CF8" },
            { text: "Paid ₹320 groceries", done: false, color: "#F59E0B" },
            { text: "Morning run 5 km", done: true, color: "#34D399" },
          ].map(({ text, done, color }) => (
            <div key={text} className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={done ? { background: color, borderColor: color } : { borderColor: "rgba(255,255,255,0.2)" }}
              >
                {done && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
              </div>
              <span
                className="text-[11px] truncate"
                style={done ? { color: "rgba(136,146,176,0.5)", textDecoration: "line-through" } : { color: "#EEF2FF" }}
              >{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card B — Goal progress — middle */}
      <div
        className="float-b absolute bottom-12 left-0 w-56 rounded-2xl p-4 space-y-2.5"
        style={{
          background: "rgba(11,14,31,0.88)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(52,211,153,0.2)",
          boxShadow: "0 20px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5" style={{ color: "#34D399" }} />
          <p className="text-[11px] font-semibold" style={{ color: "#34D399" }}>Goals this week</p>
        </div>
        {[
          { label: "Fitness", pct: 80, color: "#34D399" },
          { label: "Savings", pct: 52, color: "#818CF8" },
          { label: "Reading", pct: 33, color: "#F59E0B" },
        ].map(({ label, pct, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px]" style={{ color: "rgba(238,242,255,0.7)" }}>{label}</span>
              <span className="text-[10px] font-medium" style={{ color }}>{pct}%</span>
            </div>
            <MiniBar pct={pct} color={color} />
          </div>
        ))}
      </div>

      {/* Card C — Quick add — foreground */}
      <div
        className="float-c absolute bottom-0 right-8 w-52 rounded-2xl p-3"
        style={{
          background: "rgba(11,14,31,0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(129,140,248,0.2)",
          boxShadow: "0 16px 48px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Plus className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
          <span className="text-[10px] font-medium" style={{ color: "#818CF8" }}>Quick add</span>
        </div>
        <div
          className="rounded-lg px-2.5 py-1.5 text-[11px] flex items-center gap-1"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(129,140,248,0.35)" }}
        >
          <span style={{ color: "#EEF2FF" }}>Gym session</span>
          <span
            className="ml-auto w-1.5 h-4 rounded-sm"
            style={{ background: "#818CF8", animation: "shimmer 1s ease-in-out infinite" }}
          />
        </div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          <Tag color="#34D399" label="Fitness" />
          <Tag color="#818CF8" label="Task" />
        </div>
      </div>
    </div>
  );
}

/* ─── Scrolling marquee ────────────────────────────────────── */

const MARQUEE_ITEMS = [
  { text: "Tasks", color: "#818CF8" },
  { text: "Expenses", color: "#F59E0B" },
  { text: "Habits", color: "#34D399" },
  { text: "Goals", color: "#34D399" },
  { text: "Reports", color: "#F59E0B" },
  { text: "Budget tracking", color: "#EF4444" },
  { text: "Recurring entries", color: "#06B6D4" },
  { text: "Custom tags", color: "#A78BFA" },
  { text: "Progress bars", color: "#34D399" },
  { text: "Smart alerts", color: "#818CF8" },
  { text: "Daily snapshots", color: "#F59E0B" },
  { text: "Export CSV", color: "#8892B0" },
];

function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]; // duplicate for seamless loop
  return (
    <div
      className="overflow-hidden py-4"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="marquee flex gap-6 w-max">
        {items.map(({ text, color }, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap"
            style={{ color: "rgba(136,146,176,0.6)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.8 }} />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Bento grid ───────────────────────────────────────────── */

function BentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[180px]">

      {/* 1 — Entries (large, 2×2) */}
      <div
        className="lg:col-span-2 lg:row-span-2 rounded-2xl p-5 flex flex-col overflow-hidden relative"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(129,140,248,0.15)",
        }}
      >
        {/* accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)" }} />
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(129,140,248,0.06)" }} />

        <div className="flex items-center gap-2 mb-4 relative">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(129,140,248,0.15)" }}>
            <Zap className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
          </div>
          <span className="text-sm font-semibold">Everything in one feed</span>
        </div>

        <div className="space-y-1.5 flex-1 overflow-hidden relative">
          {[
            { text: "Weekly standup prep", tag: "Work", tagColor: "#818CF8", amount: null, done: true },
            { text: "Paid electricity bill", tag: "Bills", tagColor: "#EF4444", amount: "₹1,240", done: false },
            { text: "Read 30 pages", tag: "Learning", tagColor: "#A78BFA", amount: null, done: true },
            { text: "Grocery run", tag: "Groceries", tagColor: "#34D399", amount: "₹480", done: false },
            { text: "Evening walk", tag: "Fitness", tagColor: "#F59E0B", amount: null, done: true },
          ].map(({ text, tag, tagColor, amount, done }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center"
                style={done ? { background: tagColor, borderColor: tagColor } : { borderColor: "rgba(255,255,255,0.2)" }}
              >
                {done && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs flex-1 truncate" style={done ? { color: "rgba(136,146,176,0.5)", textDecoration: "line-through" } : { color: "#EEF2FF" }}>
                {text}
              </span>
              {amount && <span className="text-[10px] font-medium" style={{ color: tagColor }}>{amount}</span>}
              <span className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0" style={{ background: `${tagColor}18`, color: tagColor }}>
                {tag}
              </span>
            </div>
          ))}
          {/* fade out bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none" style={{ background: "linear-gradient(transparent, rgba(7,9,26,0.8))" }} />
        </div>
      </div>

      {/* 2 — Goals (1×2) */}
      <div
        className="lg:col-span-1 lg:row-span-2 rounded-2xl p-5 flex flex-col relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(52,211,153,0.15)",
        }}
      >
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(52,211,153,0.08)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)" }} />

        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}>
            <Target className="w-3.5 h-3.5" style={{ color: "#34D399" }} />
          </div>
          <span className="text-sm font-semibold">Goals</span>
        </div>

        <div className="space-y-4 flex-1">
          {[
            { label: "Workouts / week", current: 4, target: 5, pct: 80, color: "#34D399" },
            { label: "Dining budget", current: "₹2.4k", target: "₹3k", pct: 80, color: "#F59E0B" },
            { label: "Books / month", current: 1, target: 2, pct: 50, color: "#818CF8" },
          ].map(({ label, current, target, pct, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span style={{ color: "rgba(238,242,255,0.8)" }}>{label}</span>
                <span className="font-medium" style={{ color }}>{current}<span style={{ color: "rgba(136,146,176,0.5)" }}>/{target}</span></span>
              </div>
              <MiniBar pct={pct} color={color} />
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-xl p-2 text-center text-[11px] font-medium"
          style={{ background: "rgba(52,211,153,0.1)", color: "#34D399", border: "1px solid rgba(52,211,153,0.2)" }}
        >
          2 of 3 on track ✓
        </div>
      </div>

      {/* 3 — Smart tags (1×1) */}
      <div
        className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)" }} />
        <p className="text-sm font-semibold">Smart tags</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: "Work", color: "#818CF8" },
            { label: "Groceries", color: "#34D399" },
            { label: "Fitness", color: "#F59E0B" },
            { label: "Bills", color: "#EF4444" },
            { label: "Learning", color: "#A78BFA" },
            { label: "Travel", color: "#06B6D4" },
          ].map(({ label, color }) => (
            <Tag key={label} color={color} label={label} />
          ))}
        </div>
      </div>

      {/* 4 — Notifications (1×1) */}
      <div
        className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(239,68,68,0.12)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.3), transparent)" }} />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Alerts</p>
          <div className="relative">
            <Bell className="w-4 h-4" style={{ color: "#F59E0B" }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="text-[11px] px-2 py-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
            ⚠️ Dining at 80% budget
          </div>
          <div className="text-[11px] px-2 py-1.5 rounded-lg" style={{ background: "rgba(52,211,153,0.1)", color: "#34D399", border: "1px solid rgba(52,211,153,0.2)" }}>
            🎯 Fitness goal met!
          </div>
        </div>
      </div>

      {/* 5 — Reports chart (2×1) */}
      <div
        className="lg:col-span-2 rounded-2xl p-4 flex flex-col relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(245,158,11,0.12)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.35), transparent)" }} />
        <p className="text-xs font-semibold mb-3">Spend this month by tag</p>
        <div className="flex items-end gap-1.5 flex-1">
          {[
            { label: "Food", h: 65, color: "#34D399" },
            { label: "Bills", h: 90, color: "#EF4444" },
            { label: "Travel", h: 40, color: "#06B6D4" },
            { label: "Fun", h: 55, color: "#A78BFA" },
            { label: "Health", h: 30, color: "#818CF8" },
            { label: "Other", h: 20, color: "#8892B0" },
          ].map(({ label, h, color }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all"
                style={{ height: `${h}%`, minHeight: 4, background: color, opacity: 0.8 }}
              />
              <span className="text-[9px]" style={{ color: "rgba(136,146,176,0.7)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ─── Stats row ────────────────────────────────────────────── */

function StatsRow() {
  const items = [
    { value: "< 5s", label: "to log anything", color: "#818CF8" },
    { value: "6", label: "powerful modules", color: "#34D399" },
    { value: "100%", label: "private — your data", color: "#F59E0B" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      {items.map(({ value, label, color }, i) => (
        <div
          key={label}
          className="px-6 py-8 text-center"
          style={{
            background: "rgba(255,255,255,0.025)",
            borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
          }}
        >
          <p
            className="text-4xl font-black"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}80)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {value}
          </p>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(136,146,176,0.7)" }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main export ──────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>

      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)" }} />
        <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)" }} />
      </div>

      {/* ── Nav ── */}
      <header
        className="relative z-10 sticky top-0"
        style={{
          background: "rgba(7,9,26,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <span
            className="text-sm font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #818CF8, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Daily Life Dashboard
          </span>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden sm:inline-flex btn-ghost rounded-xl px-3 text-sm font-medium items-center gap-1.5">
              Dashboard <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/login" className="btn-ghost rounded-xl px-4 text-sm font-medium inline-flex items-center">
              Log in
            </Link>
            <Link href="/register" className="clay-btn rounded-xl text-white px-4 text-sm font-medium inline-flex items-center">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium fade-up"
              style={{
                background: "rgba(129,140,248,0.1)",
                border: "1px solid rgba(129,140,248,0.22)",
                color: "#818CF8",
                animationDelay: "0ms",
              }}
            >
              <Zap className="w-3 h-3" />
              Your personal command centre
            </div>

            <h1
              className="text-[2.8rem] sm:text-5xl lg:text-[3.2rem] font-black leading-[1.1] tracking-tight fade-up"
              style={{ animationDelay: "80ms" }}
            >
              Log it.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #818CF8 0%, #A78BFA 40%, #34D399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Track it.
              </span>
              <br />
              <span style={{ color: "var(--color-text-secondary)" }}>Own it.</span>
            </h1>

            <p
              className="text-base sm:text-lg leading-relaxed max-w-md fade-up"
              style={{ color: "var(--color-text-secondary)", animationDelay: "160ms" }}
            >
              One place for tasks, expenses, and habits.
              Tag everything, set goals, get notified. No spreadsheets, no friction.
            </p>

            <div className="flex flex-wrap gap-3 fade-up" style={{ animationDelay: "240ms" }}>
              <Link
                href="/register"
                className="clay-btn rounded-xl text-white px-6 text-sm font-semibold inline-flex items-center gap-2"
                style={{ height: 42 }}
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-ghost rounded-xl px-5 text-sm font-medium inline-flex items-center"
                style={{ height: 42 }}
              >
                Log in
              </Link>
            </div>

            {/* trust signals */}
            <div
              className="flex flex-wrap gap-4 pt-1 text-xs fade-up"
              style={{ color: "rgba(136,146,176,0.55)", animationDelay: "320ms" }}
            >
              {["No credit card", "Works on all devices", "Your data, always private"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" style={{ color: "#34D399" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="lg:flex hidden">
            <HeroMockup />
          </div>
          {/* Mobile: show a simpler static preview */}
          <div className="lg:hidden">
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: "rgba(11,14,31,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(136,146,176,0.6)" }}>Today</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: "Done", val: "8", color: "#818CF8" }, { label: "Spent", val: "₹640", color: "#F59E0B" }, { label: "Logged", val: "14", color: "#34D399" }]
                  .map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <p className="text-sm font-bold" style={{ color }}>{val}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: "rgba(136,146,176,0.7)" }}>{label}</p>
                    </div>
                  ))}
              </div>
              {[
                { text: "Review Q2 report", done: true, color: "#818CF8" },
                { text: "Paid ₹320 groceries", done: false, color: "#F59E0B" },
                { text: "Morning run 5 km", done: true, color: "#34D399" },
              ].map(({ text, done, color }) => (
                <div key={text} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center"
                    style={done ? { background: color, borderColor: color } : { borderColor: "rgba(255,255,255,0.2)" }}>
                    {done && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs" style={done ? { color: "rgba(136,146,176,0.5)", textDecoration: "line-through" } : { color: "#EEF2FF" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="relative z-10">
        <MarqueeStrip />
      </div>

      {/* ── Bento grid ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#818CF8" }}>Features</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Your entire life, one tab.</h2>
          <p className="mt-2 text-sm sm:text-base max-w-md" style={{ color: "var(--color-text-secondary)" }}>
            Everything connects. Add an entry → tags categorise it → goals track it → reports explain it.
          </p>
        </div>
        <BentoGrid />
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <StatsRow />
      </section>

      {/* ── How it works — stepped ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#34D399" }}>How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Two seconds to log anything.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* connecting line (desktop only) — left-7 = center of 56px box; right calc = col3_center from right */}
          <div
            className="hidden sm:block absolute top-7 h-px"
            style={{
              left: "1.75rem",
              right: "calc(100% / 3 - 2.75rem)",
              background: "linear-gradient(90deg, rgba(129,140,248,0.4), rgba(52,211,153,0.4))",
            }}
          />
          {[
            { n: "01", color: "#818CF8", title: "Type it", body: 'Hit the quick-add bar at the top. Write anything — "Paid ₹420 for dinner" or "Submit the report by Friday".' },
            { n: "02", color: "#A78BFA", title: "Tag it", body: "Pick a tag. That single action categorises the entry, updates your budget, and feeds your reports automatically." },
            { n: "03", color: "#34D399", title: "Review it", body: "Open your dashboard each morning. Goals, spending, and completed tasks are all there — no hunting required." },
          ].map(({ n, color, title, body }) => (
            <div key={n} className="flex flex-col gap-3 relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  color,
                }}
              >
                {n}
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-24 px-4 sm:px-6">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          style={{
            background: "rgba(129,140,248,0.06)",
            border: "1px solid rgba(129,140,248,0.18)",
            boxShadow: "0 32px 80px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #818CF8, transparent 70%)" }} />
          </div>

          <div className="relative space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black">
              Take back your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #818CF8, #34D399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                day.
              </span>
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Free, private, and built for people who want one dashboard — not twelve apps.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="clay-btn rounded-xl text-white px-8 text-base font-semibold inline-flex items-center gap-2"
                style={{ height: 46 }}
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-ghost rounded-xl px-6 text-base font-medium inline-flex items-center"
                style={{ height: 46 }}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">

          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <span
                className="text-sm font-bold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #818CF8, #A78BFA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Daily Life Dashboard
              </span>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(136,146,176,0.55)" }}>
                One dashboard for tasks, expenses, habits, and goals. Private, fast, and built around your day.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                {["Free forever", "Private by design", "No ads ever"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(136,146,176,0.45)" }}>
                    <Check className="w-3 h-3 shrink-0" style={{ color: "#34D399" }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "rgba(136,146,176,0.35)" }}>
                Product
              </p>
              <ul className="space-y-2.5">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/entries", label: "Entries" },
                  { href: "/goals", label: "Goals" },
                  { href: "/reports", label: "Reports" },
                  { href: "/wellbeing", label: "Wellbeing" },
                  { href: "/recurring", label: "Recurring" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-150 hover:text-[var(--color-text-primary)]"
                      style={{ color: "rgba(136,146,176,0.55)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "rgba(136,146,176,0.35)" }}>
                Account
              </p>
              <ul className="space-y-2.5">
                {[
                  { href: "/login", label: "Log in" },
                  { href: "/register", label: "Create account" },
                  { href: "/me", label: "Profile" },
                  { href: "/tags", label: "Tags" },
                  { href: "/notifications", label: "Notifications" },
                  { href: "/help", label: "Help & FAQ" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-150 hover:text-[var(--color-text-primary)]"
                      style={{ color: "rgba(136,146,176,0.55)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

          {/* Bottom bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <p className="text-xs" style={{ color: "rgba(136,146,176,0.35)" }}>
              © {new Date().getFullYear()} Daily Life Dashboard. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(136,146,176,0.35)" }}>
              <span
                className="cursor-default transition-colors duration-150 hover:text-[var(--color-text-secondary)]"
              >
                Privacy Policy
              </span>
              <span
                className="cursor-default transition-colors duration-150 hover:text-[var(--color-text-secondary)]"
              >
                Terms of Service
              </span>
              <span
                className="cursor-default transition-colors duration-150 hover:text-[var(--color-text-secondary)]"
              >
                Contact
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
