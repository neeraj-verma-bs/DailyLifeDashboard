import type { RequestHandler } from "express";
import { listNotifications, markAllRead, markRead, countUnread } from "./service.js";

export const getNotifications: RequestHandler = async (req, res) => {
  const [items, unreadCount] = await Promise.all([
    listNotifications(req.user!.id),
    countUnread(req.user!.id),
  ]);
  res.json({ items: items.map((n) => n.toJSON()), unreadCount });
};

export const patchMarkAllRead: RequestHandler = async (req, res) => {
  await markAllRead(req.user!.id);
  res.status(204).end();
};

export const patchMarkRead: RequestHandler = async (req, res) => {
  await markRead(req.user!.id, req.params.id as string);
  res.status(204).end();
};
