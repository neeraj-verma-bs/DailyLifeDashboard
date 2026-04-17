import type { RequestHandler } from "express";
import { getTodayDashboard, getRangeDashboard } from "./service.js";
import { ValidationError } from "../../lib/errors.js";

export const getToday: RequestHandler = async (req, res) => {
  const data = await getTodayDashboard(req.user!.id);
  res.json({
    summary: data.summary,
    recentEntries: data.recentEntries.map((e) => e.toJSON()),
  });
};

export const getRange: RequestHandler = async (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : null;
  const to = req.query.to ? new Date(req.query.to as string) : null;
  if (!from || isNaN(from.getTime())) throw new ValidationError({ from: ["Required, must be a valid date"] });
  if (!to || isNaN(to.getTime())) throw new ValidationError({ to: ["Required, must be a valid date"] });
  const data = await getRangeDashboard(req.user!.id, from, to);
  res.json(data);
};
