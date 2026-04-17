import type { RequestHandler } from "express";
import { createGoal, deleteGoal, listGoalsWithProgress } from "./service.js";
import { getValidated } from "../../middleware/validate.js";
import type { CreateGoalInput } from "./schema.js";

export const getGoals: RequestHandler = async (req, res) => {
  const data = await listGoalsWithProgress(req.user!.id);
  res.json(data);
};

export const postGoal: RequestHandler = async (req, res) => {
  const input = getValidated<CreateGoalInput>(req);
  const goal = await createGoal(req.user!.id, input);
  res.status(201).json(goal.toJSON());
};

export const removeGoal: RequestHandler = async (req, res) => {
  await deleteGoal(req.user!.id, req.params.id as string);
  res.status(204).end();
};
