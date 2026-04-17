"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { QuickAddBar } from "./QuickAddBar";
import { useMeQuery } from "@/features/auth/api";
import { setUser } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/features/auth/hooks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data, isError, error } = useMeQuery();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    const status = (error as { status?: number } | undefined)?.status;
    if (isError && status === 401) router.replace("/login");
  }, [isError, error, router]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen relative">
      {/* Background mesh orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)" }}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Mobile top bar */}
        <div
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-12"
          style={{
            background: "rgba(7,9,26,0.9)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
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
        </div>

        <QuickAddBar />
        <main className="flex-1 p-4 md:p-6 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
