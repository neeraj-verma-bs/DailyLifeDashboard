"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMeQuery, useUpdateMeMutation, useChangePasswordMutation } from "@/features/auth/api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function MePage() {
  const { data: user, isLoading } = useMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileInit, setProfileInit] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  if (isLoading) return <LoadingSkeleton className="h-64" />;

  if (user && !profileInit) {
    setName(user.name);
    setEmail(user.email);
    setProfileInit(true);
  }

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    try {
      await updateMe({ name: name.trim(), email: email.trim() }).unwrap();
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
          "Could not update profile",
      );
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw }).unwrap();
      toast.success("Password changed");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
          "Could not change password",
      );
    }
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.035)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  } as React.CSSProperties;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* Profile info */}
      <form onSubmit={onSaveProfile} className="rounded-[var(--radius-card)] p-6 space-y-4" style={cardStyle}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
          Account info
        </h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-glass w-full rounded-xl px-3 text-sm"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass w-full rounded-xl px-3 text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Member since {user ? new Date(user.createdAt).toLocaleDateString() : "–"}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="clay-btn text-white text-sm font-medium px-4 rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={onChangePassword} className="rounded-[var(--radius-card)] p-6 space-y-4" style={cardStyle}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
          Change password
        </h2>
        <div className="space-y-3">
          {(
            [
              { label: "Current password", value: currentPw, set: setCurrentPw },
              { label: "New password", value: newPw, set: setNewPw },
              { label: "Confirm new password", value: confirmPw, set: setConfirmPw },
            ] as const
          ).map(({ label, value, set }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="input-glass w-full rounded-xl px-3 text-sm"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={changingPw}
            className="clay-btn text-white text-sm font-medium px-4 rounded-xl disabled:opacity-50"
          >
            {changingPw ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
