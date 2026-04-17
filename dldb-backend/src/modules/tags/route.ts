import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { createTagSchema, updateTagSchema } from "./schema.js";
import { getTags, patchTag, postTag, removeTag } from "./controller.js";

export const tagsRouter = Router();

tagsRouter.use(requireAuth);
tagsRouter.get("/", getTags);
tagsRouter.post("/", validate(createTagSchema), postTag);
tagsRouter.patch("/:id", validate(updateTagSchema), patchTag);
tagsRouter.delete("/:id", removeTag);
