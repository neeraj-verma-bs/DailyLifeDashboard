import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getNotifications, patchMarkAllRead, patchMarkRead } from "./controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", getNotifications);
notificationsRouter.patch("/read-all", patchMarkAllRead);
notificationsRouter.patch("/:id/read", patchMarkRead);
