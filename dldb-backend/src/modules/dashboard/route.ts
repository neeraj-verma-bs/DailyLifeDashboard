import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getToday, getRange } from "./controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get("/today", getToday);
dashboardRouter.get("/range", getRange);
