import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { createGoalSchema } from "./schema.js";
import { getGoals, postGoal, removeGoal } from "./controller.js";

export const goalsRouter = Router();

goalsRouter.use(requireAuth);
goalsRouter.get("/", getGoals);
goalsRouter.post("/", validate(createGoalSchema), postGoal);
goalsRouter.delete("/:id", removeGoal);
