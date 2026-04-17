"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ListTodo, Tags, LogOut, RefreshCw, BarChart2, Target, Bell, ChevronRight, HelpCircle, X, Wind,
} from "lucide-react";
import { useLogoutMutation, useMeQuery } from "@/features/auth/api";
import { useGetNotificationsQuery } from "@/features/notifications/api";
import { toast } from "sonner";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/entries", label: "Entries", Icon: ListTodo },
  { href: "/tags", label: "Tags", Icon: Tags },
  { href: "/recurring", label: "Recurring", Icon: RefreshCw },
  { href: "/reports", label: "Reports", Icon: BarChart2 },
  { href: "/goals", label: "Goals", Icon: Target },
  { href: "/wellbeing", label: "Wellbeing", Icon: Wind },
  { href: "/help", label: "Help", Icon: HelpCircle },
] as const;

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const { data: notifData } = useGetNotificationsQuery();
  const unreadCount = notifData?.unreadCount ?? 0;

  const onLogout = async () => {
    try {
      await logout().unwrap();
      router.replace("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const notifActive = pathname === "/notifications" || pathname.startsWith("/notifications/");

  const handleNavClick = () => onClose?.();

  return (
    <aside
      className={[
        "glass-sidebar w-60 shrink-0 h-screen flex flex-col z-40",
        // Desktop: sticky in normal flow
        "md:sticky md:top-0 md:translate-x-0",
        // Mobile: fixed drawer, slides in/out
        "fixed top-0 left-0 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      {/* Brand + mobile close */}
      <div className="px-5 py-6 flex items-center justify-between">
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
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={
                active
                  ? {
                      background: "rgba(129, 140, 248, 0.15)",
                      color: "#818CF8",
                      boxShadow: "inset 0 0 0 1px rgba(129,140,248,0.2)",
                    }
                  : { color: "var(--color-text-secondary)" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                }
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Notifications — separate to show badge */}
        <Link
          href="/notifications"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
          style={
            notifActive
              ? {
                  background: "rgba(129, 140, 248, 0.15)",
                  color: "#818CF8",
                  boxShadow: "inset 0 0 0 1px rgba(129,140,248,0.2)",
                }
              : { color: "var(--color-text-secondary)" }
          }
          onMouseEnter={(e) => {
            if (!notifActive) {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!notifActive) {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
            }
          }}
        >
          <Bell className="w-4 h-4 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span
              className="ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight"
              style={{
                background: "linear-gradient(135deg, #818CF8, #6366F1)",
                color: "white",
                boxShadow: "0 2px 8px rgba(99,102,241,0.5)",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </nav>

      {/* User / Logout */}
      <div className="mx-3 mb-3 space-y-1.5">
        <Link
          href="/me"
          onClick={handleNavClick}
          className="w-full flex items-center gap-2.5 px-3 rounded-xl transition-all duration-150 group"
          style={{
            height: 44,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(129,140,248,0.12)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,140,248,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <span
            className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{ background: "linear-gradient(135deg, #818CF8, #6366F1)", color: "white" }}
          >
            {(user?.name ?? "?")[0]?.toUpperCase()}
          </span>
          <span
            className="flex-1 text-xs font-medium truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {user?.name ?? "…"}
          </span>
          <ChevronRight
            className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          />
        </Link>
        <button
          onClick={onLogout}
          disabled={isLoading}
          className="w-full flex items-center gap-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-150 disabled:opacity-50"
          style={{
            height: 44,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--color-text-secondary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
            (e.currentTarget as HTMLElement).style.color = "#F87171";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
          }}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
