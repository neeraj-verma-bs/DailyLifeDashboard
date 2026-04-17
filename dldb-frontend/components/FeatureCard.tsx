"use client";

import type { ReactNode } from "react";

export function FeatureCard({
  icon,
  color,
  title,
  desc,
}: {
  icon: ReactNode;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-5 space-y-3 transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${color}35`;
        el.style.background = "rgba(255,255,255,0.045)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,0.07)";
        el.style.background = "rgba(255,255,255,0.03)";
        el.style.transform = "";
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}
