"use client";

import {
  Zap,
  LayoutDashboard,
  ListTodo,
  Tags,
  RefreshCw,
  BarChart2,
  Target,
  Bell,
  UserCircle,
} from "lucide-react";

const cardStyle = {
  background: "rgba(255,255,255,0.035)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
} as React.CSSProperties;

const SECTIONS = [
  {
    icon: Zap,
    color: "#F59E0B",
    title: "Quick Add Bar",
    summary: "The fastest way to log anything.",
    tips: [
      "Type what happened — e.g. 'Paid ₹500 for groceries' or 'Finished the report'.",
      "Pick a tag to tell the app what kind of entry it is (task, expense, or note).",
      "For expenses, an amount field appears automatically — just fill it in.",
      "For tasks, you can optionally set a due date.",
      "Hit Add or press Enter and you're done.",
    ],
  },
  {
    icon: LayoutDashboard,
    color: "#818CF8",
    title: "Dashboard",
    summary: "Your daily snapshot — open this first every morning.",
    tips: [
      "See how many tasks you've completed, how much you've spent, and how many entries you've logged today.",
      "Your active goals appear here as progress bars so you can check in at a glance.",
      "Only the top 4 goals show — click 'View all' to see the rest.",
      "The recent entries list shows the last few things you logged.",
    ],
  },
  {
    icon: ListTodo,
    color: "#34D399",
    title: "Entries",
    summary: "Your full activity log — everything you've ever added.",
    tips: [
      "Filter by tag, type (task / expense / note), date range, or keyword.",
      "Click the circle icon on a task to mark it done or undo it.",
      "Pin important entries so they stand out.",
      "Select multiple entries with the checkboxes, then bulk-delete or change their status.",
      "Use Export CSV or Export JSON to download your data.",
    ],
  },
  {
    icon: Tags,
    color: "#A78BFA",
    title: "Tags",
    summary: "Tags are how you organise everything — think of them as categories.",
    tips: [
      "Create tags like 'Groceries', 'Work', 'Fitness', or 'Bills'.",
      "Assign a colour so each tag is easy to spot.",
      "Group related tags together — e.g. put 'Groceries' and 'Dining' under a 'Food' group.",
      "Set a monthly budget on any tag to get alerts when you're close to the limit.",
      "You can edit or delete a tag from its card — changes apply to all existing entries.",
    ],
  },
  {
    icon: RefreshCw,
    color: "#06B6D4",
    title: "Recurring",
    summary: "Set entries that log themselves automatically.",
    tips: [
      "Create a recurring entry for things that happen on a schedule — like a monthly subscription or a daily habit.",
      "Pick daily, weekly, or monthly frequency.",
      "The entry is added for you automatically when it's due — no action needed.",
      "You can pause or delete a recurring entry at any time.",
    ],
  },
  {
    icon: BarChart2,
    color: "#F59E0B",
    title: "Reports",
    summary: "Understand your habits and spending over time.",
    tips: [
      "See charts of your expenses broken down by tag.",
      "Track how your task completion rate changes week over week.",
      "Switch between weekly and monthly views.",
      "Hover over any bar or data point to see exact numbers.",
    ],
  },
  {
    icon: Target,
    color: "#34D399",
    title: "Goals",
    summary: "Set a target for any tag and track your progress.",
    tips: [
      "A goal links a tag to a number — e.g. 'Log at least 5 workouts per week' or 'Spend at most ₹3000 on dining per month'.",
      "Progress updates live every time you add a related entry.",
      "The progress bar turns green when you hit the target.",
      "For 'at most' goals (like budgets), the bar turns amber near the limit and red if exceeded.",
      "Your top 4 goals also show on the Dashboard.",
    ],
  },
  {
    icon: Bell,
    color: "#818CF8",
    title: "Notifications",
    summary: "Automatic alerts so nothing slips past you.",
    tips: [
      "You get a notification when you hit a goal — no manual checking needed.",
      "Budget warnings appear when a tag reaches 80% of its monthly budget.",
      "A second alert fires if you go over budget entirely.",
      "Click any notification to mark it as read, or use 'Mark all read' at the top.",
      "The bell icon in the sidebar shows a badge with your unread count.",
    ],
  },
  {
    icon: UserCircle,
    color: "#EC4899",
    title: "Profile",
    summary: "Update your account details.",
    tips: [
      "Change your display name or email address at any time.",
      "Use the password section to set a new password — you'll need to enter your current one first.",
      "Access your profile by clicking your name at the bottom of the sidebar.",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Help & Guide</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Everything you need to know to get the most out of Daily Life Dashboard.
        </p>
      </div>

      {/* Feature cards */}
      <div className="space-y-4">
        {SECTIONS.map(({ icon: Icon, color, title, summary, tips }) => (
          <div key={title} className="rounded-[var(--radius-card)] p-5 space-y-3" style={cardStyle}>
            {/* Card header */}
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </span>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {title}
                </h2>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {summary}
                </p>
              </div>
            </div>

            {/* Tips */}
            <ul className="space-y-1.5 pl-1">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color, opacity: 0.7 }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
