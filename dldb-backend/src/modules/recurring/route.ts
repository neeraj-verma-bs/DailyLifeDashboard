import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { createRecurringSchema, updateRecurringSchema } from "./schema.js";
import { getRecurring, patchRecurring, postRecurring, removeRecurring } from "./controller.js";

export const recurringRouter = Router();

recurringRouter.use(requireAuth);
recurringRouter.get("/", getRecurring);
recurringRouter.post("/", validate(createRecurringSchema), postRecurring);
recurringRouter.patch("/:id", validate(updateRecurringSchema), patchRecurring);
recurringRouter.delete("/:id", removeRecurring);
