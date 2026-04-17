export function getPeriodBounds(cadence: "weekly" | "monthly"): { from: Date; to: Date } {
  const now = new Date();
  if (cadence === "weekly") {
    const dow = now.getUTCDay(); // 0 = Sunday
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow));
    return { from, to: new Date(from.getTime() + 7 * 86_400_000) };
  }
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { from, to };
}
