import { AppShell } from "@/components/AppShell";
import { CommandPalette } from "@/components/CommandPalette";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <CommandPalette />
    </AppShell>
  );
}
