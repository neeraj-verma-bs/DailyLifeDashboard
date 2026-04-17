"use client";

import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from "@/features/notifications/api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const TYPE_EMOJI: Record<string, string> = {
  goal_met: "🎯",
  budget_warning: "⚠️",
  budget_exceeded: "🚨",
};

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markAllRead] = useMarkAllReadMutation();
  const [markRead] = useMarkReadMutation();

  const onMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const onMarkRead = async (id: string) => {
    await markRead(id).unwrap().catch(() => {});
  };

  if (isLoading) return <LoadingSkeleton className="h-64" />;

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {(data?.unreadCount ?? 0) > 0 && (
          <button
            onClick={onMarkAllRead}
            className="btn-ghost flex items-center gap-1.5 text-xs px-3 rounded-xl"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-secondary)]">
          <Bell className="w-10 h-10 opacity-30" />
          <p className="text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && onMarkRead(n.id)}
              className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-card)] cursor-pointer transition-all select-none"
              style={
                n.read
                  ? { opacity: 0.5 }
                  : {
                      background: "rgba(255,255,255,0.035)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              <span className="text-xl shrink-0 leading-6">{TYPE_EMOJI[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "" : "font-medium"}`}>{n.message}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
