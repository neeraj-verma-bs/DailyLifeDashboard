export type Notification = {
  id: string;
  userId: string;
  type: "goal_met" | "budget_warning" | "budget_exceeded";
  message: string;
  read: boolean;
  refId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  items: Notification[];
  unreadCount: number;
};
